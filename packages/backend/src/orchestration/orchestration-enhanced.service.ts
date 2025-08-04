import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import {
  UseCaseWorkflow,
  WorkflowExecution,
  WorkflowContext,
  StepResult,
  WorkflowStep,
  StepExecution,
  WorkflowError
} from './types/workflow.types';
import { workflowRegistry } from './workflow-registry';
import { serviceRegistry } from './service-registry';
import { vanguardActionsService } from '../services/vanguard-actions.service';
import { notificationService } from '../services/notification.service';
import { firestore, getServerTimestamp } from '../config/firebase';
import { AgentFlag } from '../agents/base.agent';
import { workflowMonitor, workflowLogger } from './monitoring';

export class EnhancedOrchestrationService {
  private static instance: EnhancedOrchestrationService;
  private _db: any;
  
  private get db() {
    if (!this._db) {
      this._db = firestore();
    }
    return this._db;
  }
  
  private readonly COLLECTIONS = {
    EXECUTIONS: 'workflowExecutions',
    EXECUTION_LOGS: 'workflowExecutionLogs',
    EXECUTION_METRICS: 'workflowMetrics'
  };

  private activeExecutions: Map<string, WorkflowExecution> = new Map();

  private constructor() {}

  static getInstance(): EnhancedOrchestrationService {
    if (!EnhancedOrchestrationService.instance) {
      EnhancedOrchestrationService.instance = new EnhancedOrchestrationService();
    }
    return EnhancedOrchestrationService.instance;
  }

  /**
   * Execute a use case workflow
   */
  async executeUseCaseWorkflow(
    useCaseId: string,
    input: Record<string, any> = {},
    metadata: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    try {
      // Get workflow definition
      const workflow = workflowRegistry.getWorkflow(useCaseId);
      if (!workflow) {
        throw new Error(`No workflow defined for use case: ${useCaseId}`);
      }

      logger.info(`Starting workflow execution for: ${useCaseId}`, {
        workflowName: workflow.name,
        version: workflow.version
      });

      // Create execution context
      const execution = await this.createExecution(workflow, input, metadata);
      this.activeExecutions.set(execution.id, execution);

      // Track workflow start in monitoring
      workflowMonitor.trackWorkflowStart(execution);
      workflowLogger.logWorkflowStart(execution);

      // Execute workflow steps
      try {
        for (const step of workflow.steps) {
          // Check if execution was cancelled
          if (execution.status === 'cancelled') {
            logger.info(`Workflow execution cancelled: ${execution.id}`);
            break;
          }

          // Update current step
          execution.currentStep = step.id;
          await this.updateExecutionStatus(execution, 'running', step.id);

          // Execute step
          const stepResult = await this.executeWorkflowStep(step, execution);
          
          // Update step execution
          await this.updateStepExecution(execution, step.id, 'completed', stepResult);

          // Track step completion in monitoring
          const stepExecution = execution.steps.find(s => s.stepId === step.id);
          if (stepExecution) {
            workflowMonitor.trackStepExecution(
              execution.id,
              step,
              'completed',
              stepExecution.duration,
              stepExecution.error
            );
            workflowLogger.logStepExecution(execution, step, stepExecution);
          }

          // Store step result in context
          execution.context.stepResults[step.id] = stepResult.data;

          // Check if we should skip remaining steps
          if (stepResult.skipRemainingSteps) {
            logger.info(`Skipping remaining steps for execution: ${execution.id}`);
            break;
          }

          // Check conditions for next step override
          if (stepResult.nextStep) {
            const nextStepIndex = workflow.steps.findIndex((s: WorkflowStep) => s.id === stepResult.nextStep);
            if (nextStepIndex > -1) {
              // Skip to specific step
              const currentIndex = workflow.steps.indexOf(step);
              for (let i = currentIndex + 1; i < nextStepIndex; i++) {
                await this.updateStepExecution(execution, workflow.steps[i].id, 'skipped');
              }
            }
          }
        }

        // Complete execution
        execution.status = 'completed';
        execution.completedAt = new Date();
        execution.metrics.totalDuration = execution.completedAt.getTime() - execution.startedAt.getTime();
        
        await this.updateExecutionStatus(execution, 'completed');
        await this.saveExecutionMetrics(execution);

        // Track workflow completion in monitoring
        workflowMonitor.trackWorkflowCompletion(execution.id, 'completed', execution.context.stepResults);
        workflowLogger.logWorkflowCompletion(execution, execution.metrics.totalDuration, execution.context.stepResults);

        logger.info(`Workflow execution completed: ${execution.id}`, {
          duration: execution.metrics.totalDuration,
          flagsRaised: execution.flags.length
        });

      } catch (error) {
        // Handle execution failure
        execution.status = 'failed';
        execution.completedAt = new Date();
        execution.error = this.createWorkflowError(error);
        execution.metrics.totalDuration = execution.completedAt.getTime() - execution.startedAt.getTime();
        execution.metrics.errorCount++;

        await this.updateExecutionStatus(execution, 'failed');
        await this.handleExecutionError(execution, error);

        // Track workflow failure in monitoring
        workflowMonitor.trackWorkflowCompletion(execution.id, 'failed');
        workflowLogger.logWorkflowCompletion(execution, execution.metrics.totalDuration);

        throw error;
      } finally {
        this.activeExecutions.delete(execution.id);
      }

      return execution;

    } catch (error) {
      logger.error('Workflow execution failed', { error, useCaseId });
      throw error;
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeWorkflowStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<StepResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`Executing step: ${step.name}`, {
        stepId: step.id,
        type: step.type,
        agent: step.agent
      });

      // Update step status
      await this.updateStepExecution(execution, step.id, 'running');

      // Track step start in monitoring
      workflowMonitor.trackStepExecution(execution.id, step, 'started');

      // Check step conditions
      if (step.conditions && !this.evaluateConditions(step.conditions, execution.context)) {
        logger.info(`Step conditions not met, skipping: ${step.id}`);
        await this.updateStepExecution(execution, step.id, 'skipped');
        return { success: true, data: { skipped: true } };
      }

      // Check if human approval is required
      if (step.humanApprovalRequired) {
        const approvalResult = await this.requestHumanApproval(step, execution);
        if (!approvalResult.approved) {
          throw new Error(`Human approval rejected: ${approvalResult.reason}`);
        }
      }

      // Get the service for this step
      const service = step.service ? serviceRegistry.getService(step.service) : null;
      if (!service) {
        throw new Error(`Service not found: ${step.service}`);
      }

      // Execute the step action
      let result: any;
      let retryCount = 0;
      const maxRetries = step.errorHandling?.retry?.attempts || 0;

      while (retryCount <= maxRetries) {
        try {
          // Execute with timeout if specified
          if (step.timeout) {
            result = await this.executeWithTimeout(
              service[step.action](execution.context, step.parameters),
              step.timeout
            );
          } else {
            result = await service[step.action](execution.context, step.parameters);
          }
          break; // Success, exit retry loop
        } catch (error) {
          if (retryCount < maxRetries) {
            retryCount++;
            const delay = this.calculateRetryDelay(step.errorHandling?.retry, retryCount);
            logger.warn(`Step execution failed, retrying in ${delay}ms`, {
              stepId: step.id,
              attempt: retryCount,
              error
            });
            
            // Log retry attempt
            workflowLogger.logWarning(
              execution,
              `Step ${step.name} failed, retrying (attempt ${retryCount}/${maxRetries})`,
              { error: error instanceof Error ? error.message : error },
              step.id
            );
            
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error; // Max retries exceeded
          }
        }
      }

      // Log vanguard action
      await vanguardActionsService.logAction({
        agent: step.agent,
        systemTargeted: step.service || 'orchestration',
        actionType: this.mapStepTypeToActionType(step.type),
        recordAffected: `${execution.useCaseId}-${execution.id}`,
        payloadSummary: result,
        responseConfirmation: `Step ${step.name} completed successfully`,
        status: 'success'
      });

      // Record step duration
      const duration = Date.now() - startTime;
      execution.metrics.stepDurations[step.id] = duration;

      return {
        success: true,
        data: result,
        flags: this.extractFlags(result)
      };

    } catch (error) {
      logger.error(`Step execution failed: ${step.id}`, { error });
      
      // Record step duration even on failure
      const duration = Date.now() - startTime;
      execution.metrics.stepDurations[step.id] = duration;
      execution.metrics.errorCount++;

      // Track step failure in monitoring
      workflowMonitor.trackStepExecution(execution.id, step, 'failed', duration, error);
      workflowLogger.logError(execution, error as Error, { stepId: step.id }, step.id);

      // Handle step error
      await this.handleStepError(step, error, execution);

      // Check if we should fallback to another step
      if (step.errorHandling?.fallback) {
        logger.info(`Falling back to step: ${step.errorHandling.fallback}`);
        return {
          success: false,
          error: error as Error,
          nextStep: step.errorHandling.fallback
        };
      }

      throw error;
    }
  }

  /**
   * Create a new workflow execution
   */
  private async createExecution(
    workflow: UseCaseWorkflow,
    input: Record<string, any>,
    metadata: Record<string, any>
  ): Promise<WorkflowExecution> {
    const executionId = uuidv4();
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      useCaseId: workflow.useCaseId,
      status: 'pending',
      startedAt: new Date(),
      steps: workflow.steps.map(step => ({
        stepId: step.id,
        status: 'pending'
      })),
      context: {
        useCaseId: workflow.useCaseId,
        workflowId: workflow.id,
        executionId,
        input,
        variables: {},
        stepResults: {},
        metadata
      },
      flags: [],
      metrics: {
        stepDurations: {},
        retryCount: 0,
        errorCount: 0,
        flagCount: 0
      }
    };

    // Save to database
    await this.saveExecution(execution);

    return execution;
  }

  /**
   * Update execution status
   */
  private async updateExecutionStatus(
    execution: WorkflowExecution,
    status: WorkflowExecution['status'],
    currentStep?: string
  ): Promise<void> {
    execution.status = status;
    if (currentStep) {
      execution.currentStep = currentStep;
    }

    const updates: any = {
      status,
      updatedAt: getServerTimestamp()
    };

    if (currentStep) {
      updates.currentStep = currentStep;
    }

    if (status === 'completed' || status === 'failed') {
      updates.completedAt = getServerTimestamp();
      updates.metrics = execution.metrics;
    }

    await this.db
      .collection(this.COLLECTIONS.EXECUTIONS)
      .doc(execution.id)
      .update(updates);
  }

  /**
   * Update step execution status
   */
  private async updateStepExecution(
    execution: WorkflowExecution,
    stepId: string,
    status: StepExecution['status'],
    result?: StepResult
  ): Promise<void> {
    const stepIndex = execution.steps.findIndex(s => s.stepId === stepId);
    if (stepIndex === -1) return;

    const step = execution.steps[stepIndex];
    step.status = status;

    if (status === 'running') {
      step.startedAt = new Date();
    } else if (status === 'completed' || status === 'failed') {
      step.completedAt = new Date();
      if (step.startedAt) {
        step.duration = step.completedAt.getTime() - step.startedAt.getTime();
      }
    }

    if (result) {
      if (result.success) {
        step.result = result.data;
      } else {
        step.error = result.error?.message;
      }
    }

    // Update in database
    await this.db
      .collection(this.COLLECTIONS.EXECUTIONS)
      .doc(execution.id)
      .update({
        steps: execution.steps,
        updatedAt: getServerTimestamp()
      });
  }

  /**
   * Evaluate step conditions
   */
  private evaluateConditions(
    conditions: WorkflowStep['conditions'],
    context: WorkflowContext
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    let result = true;
    let combineWith: 'AND' | 'OR' = 'AND';

    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(context, condition.field);
      let conditionMet = false;

      switch (condition.operator) {
        case '=':
          conditionMet = fieldValue === condition.value;
          break;
        case '!=':
          conditionMet = fieldValue !== condition.value;
          break;
        case '>':
          conditionMet = fieldValue > condition.value;
          break;
        case '<':
          conditionMet = fieldValue < condition.value;
          break;
        case 'contains':
          conditionMet = Array.isArray(fieldValue) 
            ? fieldValue.includes(condition.value)
            : String(fieldValue).includes(String(condition.value));
          break;
        case 'exists':
          conditionMet = fieldValue !== undefined && fieldValue !== null;
          break;
        case 'in':
          conditionMet = Array.isArray(condition.value) && condition.value.includes(fieldValue);
          break;
        case 'not_in':
          conditionMet = Array.isArray(condition.value) && !condition.value.includes(fieldValue);
          break;
      }

      if (combineWith === 'AND') {
        result = result && conditionMet;
      } else {
        result = result || conditionMet;
      }

      // Update combineWith for next iteration
      if (condition.combineWith) {
        combineWith = condition.combineWith;
      }
    }

    return result;
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Map step type to vanguard action type
   */
  private mapStepTypeToActionType(
    stepType: WorkflowStep['type']
  ): 'Read' | 'Write' | 'Update' | 'Escalate' | 'Recommend' | 'Reject' | 'Approve' {
    const mapping: Record<WorkflowStep['type'], any> = {
      'detect': 'Read',
      'analyze': 'Read',
      'decide': 'Recommend',
      'execute': 'Write',
      'verify': 'Read',
      'report': 'Write'
    };
    return mapping[stepType] || 'Update';
  }

  /**
   * Extract flags from step result
   */
  private extractFlags(result: any): AgentFlag[] {
    if (!result) return [];
    
    // Check for flags in various formats
    if (Array.isArray(result.flags)) {
      return result.flags;
    }
    
    if (result.flag) {
      return [result.flag];
    }

    // Extract flags from specific result patterns
    const flags: AgentFlag[] = [];
    
    if (result.severity === 'critical' || result.alertLevel === 'critical') {
      flags.push({
        id: uuidv4(),
        type: 'critical_issue',
        severity: 'critical',
        message: result.message || 'Critical issue detected',
        details: result
      });
    }

    return flags;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(
    retryConfig: WorkflowStep['errorHandling']['retry'],
    attempt: number
  ): number {
    if (!retryConfig) return 5000; // Default 5 seconds

    const baseDelay = retryConfig.delay;
    const multiplier = retryConfig.backoffMultiplier || 2;
    const maxDelay = retryConfig.maxDelay || 60000; // Max 1 minute

    const delay = Math.min(baseDelay * Math.pow(multiplier, attempt - 1), maxDelay);
    return delay;
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), timeout)
      )
    ]);
  }

  /**
   * Request human approval
   */
  private async requestHumanApproval(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<{ approved: boolean; reason?: string }> {
    // For now, auto-approve in development
    // In production, this would create an approval request and wait
    logger.warn('Human approval required but auto-approved in development', {
      stepId: step.id,
      executionId: execution.id
    });

    return { approved: true, reason: 'Auto-approved in development' };
  }

  /**
   * Handle step error
   */
  private async handleStepError(
    step: WorkflowStep,
    error: any,
    execution: WorkflowExecution
  ): Promise<void> {
    // Update step status
    await this.updateStepExecution(execution, step.id, 'failed', {
      success: false,
      error: error as Error
    });

    // Send notifications if configured
    if (step.errorHandling?.notification) {
      await this.sendErrorNotification(step, error, execution);
    }

    // Escalate if configured
    if (step.errorHandling?.escalate) {
      await this.escalateError(step, error, execution);
    }

    // Log vanguard action for failure
    await vanguardActionsService.logAction({
      agent: step.agent,
      systemTargeted: step.service || 'orchestration',
      actionType: 'Reject',
      recordAffected: `${execution.useCaseId}-${execution.id}`,
      payloadSummary: { error: error.message },
      responseConfirmation: `Step ${step.name} failed`,
      status: 'failed'
    });
  }

  /**
   * Handle execution error
   */
  private async handleExecutionError(
    execution: WorkflowExecution,
    error: any
  ): Promise<void> {
    logger.error('Workflow execution failed', {
      executionId: execution.id,
      useCaseId: execution.useCaseId,
      error
    });

    // Send notification
    await notificationService.sendDirectNotification({
      recipients: [{ email: process.env.ADMIN_EMAIL || 'admin@company.com' }],
      channels: ['email'],
      priority: 'high',
      subject: `Workflow Execution Failed: ${execution.useCaseId}`,
      body: `Workflow execution ${execution.id} failed with error: ${error.message}`,
      metadata: {
        workflowId: execution.workflowId
      }
    });
  }

  /**
   * Send error notification
   */
  private async sendErrorNotification(
    step: WorkflowStep,
    error: any,
    execution: WorkflowExecution
  ): Promise<void> {
    const notification = step.errorHandling?.notification;
    if (!notification) return;

    await notificationService.sendDirectNotification({
      recipients: notification.recipients?.map(email => ({ email })) || [],
      channels: notification.channels.filter(ch => ['email', 'teams', 'slack', 'sms', 'in_app'].includes(ch)) as any,
      priority: 'high',
      subject: `Workflow Step Failed: ${step.name}`,
      body: `Step ${step.name} in workflow ${execution.useCaseId} failed with error: ${error.message}`,
      metadata: {
        workflowId: execution.workflowId
      }
    });
  }

  /**
   * Escalate error
   */
  private async escalateError(
    step: WorkflowStep,
    error: any,
    execution: WorkflowExecution
  ): Promise<void> {
    logger.error('Escalating workflow error', {
      executionId: execution.id,
      stepId: step.id,
      error
    });

    // Create escalation record
    await this.db.collection('workflowEscalations').add({
      executionId: execution.id,
      stepId: step.id,
      useCaseId: execution.useCaseId,
      error: {
        message: error.message,
        stack: error.stack
      },
      createdAt: getServerTimestamp(),
      status: 'open'
    });
  }

  /**
   * Create workflow error object
   */
  private createWorkflowError(error: any): WorkflowError {
    return {
      code: error.code || 'WORKFLOW_ERROR',
      message: error.message || 'Unknown error',
      details: error.details,
      stack: error.stack
    };
  }

  /**
   * Save execution to database
   */
  private async saveExecution(execution: WorkflowExecution): Promise<void> {
    await this.db
      .collection(this.COLLECTIONS.EXECUTIONS)
      .doc(execution.id)
      .set({
        ...execution,
        startedAt: getServerTimestamp(),
        createdAt: getServerTimestamp()
      });
  }

  /**
   * Save execution metrics
   */
  private async saveExecutionMetrics(execution: WorkflowExecution): Promise<void> {
    await this.db
      .collection(this.COLLECTIONS.EXECUTION_METRICS)
      .add({
        executionId: execution.id,
        useCaseId: execution.useCaseId,
        workflowId: execution.workflowId,
        metrics: execution.metrics,
        timestamp: getServerTimestamp()
      });
  }

  /**
   * Get execution by ID
   */
  async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    const doc = await this.db
      .collection(this.COLLECTIONS.EXECUTIONS)
      .doc(executionId)
      .get();

    if (!doc.exists) return null;
    return doc.data() as WorkflowExecution;
  }

  /**
   * Get executions for a use case
   */
  async getExecutionsByUseCase(
    useCaseId: string,
    limit: number = 100
  ): Promise<WorkflowExecution[]> {
    const snapshot = await this.db
      .collection(this.COLLECTIONS.EXECUTIONS)
      .where('useCaseId', '==', useCaseId)
      .orderBy('startedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc: any) => doc.data() as WorkflowExecution);
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return false;

    execution.status = 'cancelled';
    await this.updateExecutionStatus(execution, 'cancelled');
    
    logger.info(`Workflow execution cancelled: ${executionId}`);
    return true;
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get monitoring metrics
   */
  getMonitoringMetrics(workflowId?: string): any {
    if (workflowId) {
      return workflowMonitor.getWorkflowMetrics(workflowId);
    }
    return workflowMonitor.getSystemMetrics();
  }

  /**
   * Query workflow logs
   */
  async queryWorkflowLogs(filters: {
    workflowId?: string;
    executionId?: string;
    useCaseId?: string;
    level?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): Promise<any[]> {
    return workflowLogger.queryLogs(filters);
  }

  /**
   * Get execution metrics
   */
  async getExecutionMetrics(
    useCaseId?: string,
    _startDate?: Date,
    _endDate?: Date
  ): Promise<any> {
    let query = this.db.collection(this.COLLECTIONS.EXECUTION_METRICS);

    if (useCaseId) {
      query = query.where('useCaseId', '==', useCaseId) as any;
    }

    const snapshot = await query.get();
    const metrics = snapshot.docs.map((doc: any) => doc.data());

    // Aggregate metrics
    const aggregated = {
      totalExecutions: metrics.length,
      avgDuration: 0,
      totalErrors: 0,
      totalRetries: 0,
      successRate: 0,
      stepPerformance: {} as Record<string, any>
    };

    if (metrics.length > 0) {
      const totalDuration = metrics.reduce((sum: number, m: any) => sum + (m.metrics.totalDuration || 0), 0);
      aggregated.avgDuration = totalDuration / metrics.length;
      aggregated.totalErrors = metrics.reduce((sum: number, m: any) => sum + m.metrics.errorCount, 0);
      aggregated.totalRetries = metrics.reduce((sum: number, m: any) => sum + m.metrics.retryCount, 0);
      
      const successfulExecutions = metrics.filter((m: any) => m.metrics.errorCount === 0).length;
      aggregated.successRate = (successfulExecutions / metrics.length) * 100;
    }

    return aggregated;
  }
}

// Export singleton instance
export const enhancedOrchestrationService = EnhancedOrchestrationService.getInstance();