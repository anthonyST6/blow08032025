import { firestore, getServerTimestamp } from '../config/firebase';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
// Import vanguards - these will be created or we'll use existing agents
import { leaseService } from './lease.service';
import { certificationService } from './certification.service';
import { notificationService } from './notification.service';
import { AgentFlag } from '../agents/base.agent';

export interface OrchestrationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'scheduled' | 'event' | 'manual' | 'threshold';
    schedule?: string; // cron expression
    event?: string;
    threshold?: {
      metric: string;
      operator: '>' | '<' | '=' | '>=' | '<=';
      value: number;
    };
  };
  steps: OrchestrationStep[];
  status: 'active' | 'paused' | 'completed' | 'failed';
  createdAt: Date;
  lastExecutedAt?: Date;
  nextExecutionAt?: Date;
  metadata?: Record<string, any>;
}

export interface OrchestrationStep {
  id: string;
  name: string;
  type: 'detect' | 'classify' | 'decide' | 'execute' | 'verify' | 'update';
  agent?: 'security' | 'integrity' | 'accuracy' | 'optimization' | 'negotiation';
  action: string;
  parameters?: Record<string, any>;
  conditions?: Array<{
    field: string;
    operator: '=' | '!=' | '>' | '<' | 'contains' | 'exists';
    value: any;
  }>;
  onSuccess?: {
    nextStep?: string;
    notification?: boolean;
  };
  onFailure?: {
    nextStep?: string;
    notification?: boolean;
    retry?: {
      attempts: number;
      delay: number; // milliseconds
    };
  };
  humanApprovalRequired?: boolean;
  timeout?: number; // milliseconds
}

export interface OrchestrationExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  currentStep?: string;
  steps: Array<{
    stepId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startedAt?: Date;
    completedAt?: Date;
    result?: any;
    error?: string;
  }>;
  context: Record<string, any>;
  flags: AgentFlag[];
}

export interface HumanApproval {
  id: string;
  executionId: string;
  stepId: string;
  requestedAt: Date;
  requestedBy: string;
  description: string;
  data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
  respondedAt?: Date;
  respondedBy?: string;
  response?: {
    decision: 'approve' | 'reject';
    reason?: string;
    modifications?: Record<string, any>;
  };
  timeoutAt: Date;
}

class OrchestrationService {
  private _db: any;
  
  private get db() {
    if (!this._db) {
      this._db = firestore();
    }
    return this._db;
  }
  
  private readonly COLLECTIONS = {
    WORKFLOWS: 'orchestrationWorkflows',
    EXECUTIONS: 'orchestrationExecutions',
    APPROVALS: 'humanApprovals',
    EXECUTION_LOGS: 'orchestrationLogs',
  };

  // Agent mapping - will be implemented based on available agents
  private readonly agents: Record<string, any> = {};

  /**
   * Create a new orchestration workflow
   */
  async createWorkflow(
    workflow: Omit<OrchestrationWorkflow, 'id' | 'createdAt' | 'status'>
  ): Promise<OrchestrationWorkflow> {
    try {
      const workflowId = uuidv4();
      const fullWorkflow: OrchestrationWorkflow = {
        ...workflow,
        id: workflowId,
        status: 'active',
        createdAt: new Date(),
      };

      await this.db
        .collection(this.COLLECTIONS.WORKFLOWS)
        .doc(workflowId)
        .set({
          ...fullWorkflow,
          createdAt: getServerTimestamp(),
        });

      logger.info('Orchestration workflow created', { workflowId, name: workflow.name });

      // Schedule if needed
      if (workflow.trigger.type === 'scheduled' && workflow.trigger.schedule) {
        await this.scheduleWorkflow(fullWorkflow);
      }

      return fullWorkflow;
    } catch (error) {
      logger.error('Failed to create orchestration workflow', { error });
      throw error;
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    context: Record<string, any> = {}
  ): Promise<OrchestrationExecution> {
    try {
      // Get workflow
      const workflowDoc = await this.db
        .collection(this.COLLECTIONS.WORKFLOWS)
        .doc(workflowId)
        .get();

      if (!workflowDoc.exists) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      const workflow = workflowDoc.data() as OrchestrationWorkflow;

      // Create execution
      const executionId = uuidv4();
      const execution: OrchestrationExecution = {
        id: executionId,
        workflowId,
        status: 'running',
        startedAt: new Date(),
        steps: workflow.steps.map(step => ({
          stepId: step.id,
          status: 'pending',
        })),
        context,
        flags: [],
      };

      await this.saveExecution(execution);

      logger.info('Starting workflow execution', { executionId, workflowId });

      // Execute steps
      for (const step of workflow.steps) {
        try {
          // Check conditions
          if (step.conditions && !this.checkConditions(step.conditions, execution.context)) {
            await this.updateStepStatus(executionId, step.id, 'skipped');
            continue;
          }

          // Update current step
          execution.currentStep = step.id;
          await this.updateExecution(executionId, { currentStep: step.id });

          // Execute step
          const result = await this.executeStep(step, execution);

          // Update context with result
          execution.context[`${step.id}_result`] = result;

          // Handle success
          if (step.onSuccess?.notification) {
            await this.sendStepNotification(step, execution, 'success', result);
          }

          // Determine next step
          if (step.onSuccess?.nextStep) {
            // Jump to specific step
            const nextStepIndex = workflow.steps.findIndex(s => s.id === step.onSuccess!.nextStep);
            if (nextStepIndex > -1) {
              // Skip intermediate steps
              for (let i = workflow.steps.indexOf(step) + 1; i < nextStepIndex; i++) {
                await this.updateStepStatus(executionId, workflow.steps[i].id, 'skipped');
              }
            }
          }
        } catch (error) {
          logger.error('Step execution failed', { error, stepId: step.id });

          // Handle failure
          if (step.onFailure?.notification) {
            await this.sendStepNotification(step, execution, 'failure', error);
          }

          // Retry if configured
          if (step.onFailure?.retry) {
            const retryResult = await this.retryStep(step, execution, step.onFailure.retry);
            if (retryResult.success) {
              continue;
            }
          }

          // Update execution status
          execution.status = 'failed';
          await this.updateExecution(executionId, {
            status: 'failed',
            completedAt: new Date(),
          });

          throw error;
        }
      }

      // Complete execution
      execution.status = 'completed';
      execution.completedAt = new Date();
      await this.updateExecution(executionId, {
        status: 'completed',
        completedAt: execution.completedAt,
      });

      logger.info('Workflow execution completed', { executionId, duration: Date.now() - execution.startedAt.getTime() });

      return execution;
    } catch (error) {
      logger.error('Workflow execution failed', { error, workflowId });
      throw error;
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: OrchestrationStep,
    execution: OrchestrationExecution
  ): Promise<any> {
    logger.info('Executing step', { stepId: step.id, type: step.type });

    // Update step status
    await this.updateStepStatus(execution.id, step.id, 'running');

    try {
      let result: any;

      // Check if human approval is required
      if (step.humanApprovalRequired) {
        result = await this.requestHumanApproval(step, execution);
      } else {
        // Execute based on step type
        switch (step.type) {
          case 'detect':
            result = await this.executeDetection(step, execution);
            break;
          case 'classify':
            result = await this.executeClassification(step, execution);
            break;
          case 'decide':
            result = await this.executeDecision(step, execution);
            break;
          case 'execute':
            result = await this.executeAction(step, execution);
            break;
          case 'verify':
            result = await this.executeVerification(step, execution);
            break;
          case 'update':
            result = await this.executeUpdate(step, execution);
            break;
          default:
            throw new Error(`Unknown step type: ${step.type}`);
        }
      }

      // Update step status
      await this.updateStepStatus(execution.id, step.id, 'completed', result);

      return result;
    } catch (error) {
      await this.updateStepStatus(execution.id, step.id, 'failed', undefined, error);
      throw error;
    }
  }

  /**
   * Execute detection step
   */
  private async executeDetection(
    step: OrchestrationStep,
    execution: OrchestrationExecution
  ): Promise<any> {
    if (!step.agent) {
      throw new Error('Agent required for detection step');
    }

    const agent = this.agents[step.agent];
    
    switch (step.action) {
      case 'detectAnomalies':
        return await agent.analyze({
          type: 'anomaly_detection',
          data: execution.context,
          ...step.parameters,
        });

      case 'scanVulnerabilities':
        return await agent.analyze({
          type: 'vulnerability_scan',
          data: execution.context,
          ...step.parameters,
        });

      case 'checkCompliance':
        return await agent.analyze({
          type: 'compliance_check',
          data: execution.context,
          ...step.parameters,
        });

      default:
        throw new Error(`Unknown detection action: ${step.action}`);
    }
  }

  /**
   * Execute classification step
   */
  private async executeClassification(
    step: OrchestrationStep,
    execution: OrchestrationExecution
  ): Promise<any> {
    const detectionResult = execution.context.detectionResult || execution.context[`${step.parameters?.sourceStep}_result`];
    
    if (!detectionResult) {
      throw new Error('No detection result found for classification');
    }

    // Classify based on severity, type, and impact
    const classification = {
      severity: this.classifySeverity(detectionResult),
      category: this.classifyCategory(detectionResult),
      priority: this.calculatePriority(detectionResult),
      requiresApproval: this.requiresHumanApproval(detectionResult),
    };

    // Add flags if any
    if (detectionResult.flags) {
      execution.flags.push(...detectionResult.flags);
    }

    return classification;
  }

  /**
   * Execute decision step
   */
  private async executeDecision(
    step: OrchestrationStep,
    execution: OrchestrationExecution
  ): Promise<any> {
    const classification = execution.context.classification || execution.context[`${step.parameters?.sourceStep}_result`];
    
    if (!classification) {
      throw new Error('No classification found for decision');
    }

    // Make decision based on classification and rules
    const decision = {
      action: this.determineAction(classification, step.parameters?.rules),
      autoExecute: !classification.requiresApproval && classification.severity !== 'critical',
      notificationRequired: classification.severity === 'high' || classification.severity === 'critical',
      escalationRequired: classification.severity === 'critical',
    };

    return decision;
  }

  /**
   * Execute action step
   */
  private async executeAction(
    step: OrchestrationStep,
    execution: OrchestrationExecution
  ): Promise<any> {
    const decision = execution.context.decision || execution.context[`${step.parameters?.sourceStep}_result`];
    
    if (!decision) {
      throw new Error('No decision found for action execution');
    }

    // Execute the determined action
    switch (decision.action) {
      case 'autoFix':
        return await certificationService.createAutoFix({
          id: uuidv4(),
          category: execution.context.classification.category,
          severity: execution.context.classification.severity,
          title: `Auto-fix for ${execution.context.detectionResult.issue}`,
          description: execution.context.detectionResult.description,
          detectedAt: new Date(),
          detectedBy: step.agent || 'orchestration',
          status: 'open',
          autoFixAvailable: true,
          manualReviewRequired: false,
          affectedResources: execution.context.affectedResources || [],
          recommendations: [],
        });

      case 'createTicket':
        // Create support ticket
        return {
          ticketId: uuidv4(),
          priority: decision.priority,
          assignedTo: decision.assignee,
        };

      case 'blockAccess':
        // Implement access blocking
        return {
          blocked: true,
          resources: execution.context.affectedResources,
        };

      case 'notify':
        // Send notifications
        return await notificationService.sendDirectNotification({
          recipients: step.parameters?.recipients || [],
          channels: ['email', 'teams'],
          priority: execution.context.classification.severity,
          subject: `Action Required: ${execution.context.detectionResult.issue}`,
          body: execution.context.detectionResult.description,
          metadata: {
            workflowId: execution.workflowId,
          },
        });

      default:
        throw new Error(`Unknown action: ${decision.action}`);
    }
  }

  /**
   * Execute verification step
   */
  private async executeVerification(
    step: OrchestrationStep,
    execution: OrchestrationExecution
  ): Promise<any> {
    const actionResult = execution.context.actionResult || execution.context[`${step.parameters?.sourceStep}_result`];
    
    if (!actionResult) {
      throw new Error('No action result found for verification');
    }

    // Verify the action was successful
    const verification = {
      verified: false,
      details: {},
      retryRequired: false,
    };

    // Perform verification based on action type
    if (actionResult.autoFixId) {
      // Verify auto-fix
      const issue = await certificationService.createIssue({
        category: 'accuracy',
        severity: 'low',
        title: 'Verification Check',
        description: 'Verifying auto-fix application',
        detectedAt: new Date(),
        detectedBy: 'orchestration',
        status: 'open',
        autoFixAvailable: false,
        manualReviewRequired: false,
        affectedResources: execution.context.affectedResources || [],
        recommendations: [],
      });

      verification.verified = issue.status === 'resolved';
      verification.details = { issueId: issue.id };
    }

    return verification;
  }

  /**
   * Execute update step
   */
  private async executeUpdate(
    _step: OrchestrationStep,
    execution: OrchestrationExecution
  ): Promise<any> {
    // Update relevant systems
    const updates = [];

    // Update lease status if needed
    if (execution.context.leaseId) {
      await leaseService.updateLease(execution.context.leaseId, {
        // Add any lease-specific updates here
      });
      updates.push({ type: 'lease', id: execution.context.leaseId });
    }

    // Update certification scores
    if (execution.context.affectedResources?.length > 0) {
      for (const resourceId of execution.context.affectedResources) {
        await certificationService.calculateScores(resourceId, {
          security: execution.context.securityMetrics || [],
          integrity: execution.context.integrityMetrics || [],
          accuracy: execution.context.accuracyMetrics || [],
        });
        updates.push({ type: 'certification', id: resourceId });
      }
    }

    // Log completion
    await this.logExecutionComplete(execution);

    return { updates, timestamp: new Date() };
  }

  /**
   * Request human approval
   */
  private async requestHumanApproval(
    step: OrchestrationStep,
    execution: OrchestrationExecution
  ): Promise<any> {
    const approvalId = uuidv4();
    const approval: HumanApproval = {
      id: approvalId,
      executionId: execution.id,
      stepId: step.id,
      requestedAt: new Date(),
      requestedBy: 'orchestration_system',
      description: `Approval required for: ${step.name}`,
      data: {
        step: step,
        context: execution.context,
      },
      status: 'pending',
      timeoutAt: new Date(Date.now() + (step.timeout || 3600000)), // 1 hour default
    };

    // Save approval request
    await this.db
      .collection(this.COLLECTIONS.APPROVALS)
      .doc(approvalId)
      .set({
        ...approval,
        requestedAt: getServerTimestamp(),
        timeoutAt: getServerTimestamp(),
      });

    // Send notification
    await notificationService.sendTemplatedNotification(
      'approval-required',
      [{ email: process.env.APPROVAL_EMAIL }],
      {
        stepName: step.name,
        executionId: execution.id,
        approvalUrl: `${process.env.APP_URL}/approvals/${approvalId}`,
      }
    );

    // Wait for approval
    return await this.waitForApproval(approvalId, step.timeout || 3600000);
  }

  /**
   * Wait for human approval
   */
  private async waitForApproval(
    approvalId: string,
    timeout: number
  ): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const approvalDoc = await this.db
        .collection(this.COLLECTIONS.APPROVALS)
        .doc(approvalId)
        .get();

      if (!approvalDoc.exists) {
        throw new Error('Approval request not found');
      }

      const approval = approvalDoc.data() as HumanApproval;

      if (approval.status === 'approved') {
        return {
          approved: true,
          response: approval.response,
          approvedBy: approval.respondedBy,
        };
      } else if (approval.status === 'rejected') {
        throw new Error(`Approval rejected: ${approval.response?.reason}`);
      }

      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Timeout
    await this.db
      .collection(this.COLLECTIONS.APPROVALS)
      .doc(approvalId)
      .update({
        status: 'timeout',
        updatedAt: getServerTimestamp(),
      });

    throw new Error('Approval request timed out');
  }

  /**
   * Retry a failed step
   */
  private async retryStep(
    step: OrchestrationStep,
    execution: OrchestrationExecution,
    retryConfig: { attempts: number; delay: number }
  ): Promise<{ success: boolean; result?: any }> {
    for (let attempt = 1; attempt <= retryConfig.attempts; attempt++) {
      logger.info('Retrying step', { stepId: step.id, attempt });

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryConfig.delay));

      try {
        const result = await this.executeStep(step, execution);
        return { success: true, result };
      } catch (error) {
        logger.error('Retry attempt failed', { error, stepId: step.id, attempt });
        
        if (attempt === retryConfig.attempts) {
          return { success: false };
        }
      }
    }

    return { success: false };
  }

  /**
   * Check step conditions
   */
  private checkConditions(
    conditions: OrchestrationStep['conditions'],
    context: Record<string, any>
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every(condition => {
      const value = this.getNestedValue(context, condition.field);

      switch (condition.operator) {
        case '=':
          return value === condition.value;
        case '!=':
          return value !== condition.value;
        case '>':
          return value > condition.value;
        case '<':
          return value < condition.value;
        case 'contains':
          return String(value).includes(String(condition.value));
        case 'exists':
          return value !== undefined && value !== null;
        default:
          return false;
      }
    });
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Classify severity
   */
  private classifySeverity(detectionResult: any): 'critical' | 'high' | 'medium' | 'low' {
    if (detectionResult.severity) {
      return detectionResult.severity;
    }

    // Default classification based on flags
    const criticalFlags = detectionResult.flags?.filter((f: AgentFlag) => f.severity === 'critical').length || 0;
    const highFlags = detectionResult.flags?.filter((f: AgentFlag) => f.severity === 'high').length || 0;

    if (criticalFlags > 0) return 'critical';
    if (highFlags > 2) return 'critical';
    if (highFlags > 0) return 'high';
    
    return 'medium';
  }

  /**
   * Classify category
   */
  private classifyCategory(detectionResult: any): string {
    if (detectionResult.category) {
      return detectionResult.category;
    }

    // Determine from flags
    const categories = detectionResult.flags?.map((f: AgentFlag) => f.type) || [];
    return categories[0] || 'unknown';
  }

  /**
   * Calculate priority
   */
  private calculatePriority(detectionResult: any): number {
    const severityScores = {
      critical: 100,
      high: 75,
      medium: 50,
      low: 25,
    };

    const severity = this.classifySeverity(detectionResult);
    const baseScore = severityScores[severity];

    // Adjust based on impact
    const impactMultiplier = detectionResult.impact === 'widespread' ? 1.5 : 1;

    return Math.min(100, baseScore * impactMultiplier);
  }

  /**
   * Check if human approval required
   */
  private requiresHumanApproval(detectionResult: any): boolean {
    const severity = this.classifySeverity(detectionResult);
    
    // Always require approval for critical issues
    if (severity === 'critical') return true;

    // Check for specific flags that require approval
    const approvalFlags = ['data_deletion', 'system_modification', 'access_change'];
    const hasApprovalFlag = detectionResult.flags?.some((f: AgentFlag) => 
      approvalFlags.includes(f.type)
    );

    return hasApprovalFlag || false;
  }

  /**
   * Determine action based on classification
   */
  private determineAction(classification: any, rules?: any[]): string {
    // Apply custom rules if provided
    if (rules) {
      for (const rule of rules) {
        if (this.matchesRule(classification, rule)) {
          return rule.action;
        }
      }
    }

    // Default actions based on severity
    switch (classification.severity) {
      case 'critical':
        return classification.category === 'security' ? 'blockAccess' : 'createTicket';
      case 'high':
        return 'autoFix';
      case 'medium':
        return 'notify';
      default:
        return 'log';
    }
  }

  /**
   * Check if classification matches rule
   */
  private matchesRule(classification: any, rule: any): boolean {
    for (const [key, value] of Object.entries(rule.conditions)) {
      if (classification[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Send step notification
   */
  private async sendStepNotification(
    step: OrchestrationStep,
    execution: OrchestrationExecution,
    status: 'success' | 'failure',
    result: any
  ): Promise<void> {
    await notificationService.sendDirectNotification({
      recipients: [{ email: process.env.ADMIN_EMAIL }],
      channels: ['email'],
      priority: status === 'failure' ? 'high' : 'medium',
      subject: `Orchestration Step ${status}: ${step.name}`,
      body: `Step ${step.name} ${status === 'success' ? 'completed successfully' : 'failed'}.\n\nExecution ID: ${execution.id}\nResult: ${JSON.stringify(result, null, 2)}`,
      metadata: {
        workflowId: execution.workflowId,
      },
    });
  }

  /**
   * Update execution
   */
  private async updateExecution(
    executionId: string,
    updates: Partial<OrchestrationExecution>
  ): Promise<void> {
    await this.db
      .collection(this.COLLECTIONS.EXECUTIONS)
      .doc(executionId)
      .update({
        ...updates,
        updatedAt: getServerTimestamp(),
      });
  }

  /**
   * Update step status
   */
  private async updateStepStatus(
    executionId: string,
    stepId: string,
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped',
    result?: any,
    error?: any
  ): Promise<void> {
    const executionDoc = await this.db
      .collection(this.COLLECTIONS.EXECUTIONS)
      .doc(executionId)
      .get();

    if (!executionDoc.exists) {
      throw new Error('Execution not found');
    }

    const execution = executionDoc.data() as OrchestrationExecution;
    const stepIndex = execution.steps.findIndex(s => s.stepId === stepId);

    if (stepIndex === -1) {
      throw new Error('Step not found in execution');
    }

    execution.steps[stepIndex] = {
      ...execution.steps[stepIndex],
      status,
      ...(status === 'running' && { startedAt: new Date() }),
      ...(status === 'completed' && { completedAt: new Date(), result }),
      ...(status === 'failed' && { completedAt: new Date(), error: error?.message || String(error) }),
    };

    await this.db
      .collection(this.COLLECTIONS.EXECUTIONS)
      .doc(executionId)
      .update({
        steps: execution.steps,
        updatedAt: getServerTimestamp(),
      });
  }

  /**
   * Save execution
   */
  private async saveExecution(execution: OrchestrationExecution): Promise<void> {
    await this.db
      .collection(this.COLLECTIONS.EXECUTIONS)
      .doc(execution.id)
      .set({
        ...execution,
        startedAt: getServerTimestamp(),
        createdAt: getServerTimestamp(),
      });
  }

  /**
   * Schedule workflow
   */
  private async scheduleWorkflow(workflow: OrchestrationWorkflow): Promise<void> {
    // This would integrate with a job scheduler like Bull or Agenda
    logger.info('Workflow scheduled', { workflowId: workflow.id, schedule: workflow.trigger.schedule });
  }

  /**
   * Log execution complete
   */
  private async logExecutionComplete(execution: OrchestrationExecution): Promise<void> {
    await this.db
      .collection(this.COLLECTIONS.EXECUTION_LOGS)
      .add({
        executionId: execution.id,
        workflowId: execution.workflowId,
        status: execution.status,
        duration: execution.completedAt ? execution.completedAt.getTime() - execution.startedAt.getTime() : null,
        flagsRaised: execution.flags.length,
        timestamp: getServerTimestamp(),
      });
  }

  /**
   * Create default workflows
   */
  async createDefaultWorkflows(): Promise<void> {
    const workflows: Array<Omit<OrchestrationWorkflow, 'id' | 'createdAt' | 'status'>> = [
      {
        name: 'Security Threat Detection and Response',
        description: 'Detect security threats, classify them, and execute appropriate responses',
        trigger: {
          type: 'scheduled',
          schedule: '*/15 * * * *', // Every 15 minutes
        },
        steps: [
          {
            id: 'detect-threats',
            name: 'Detect Security Threats',
            type: 'detect',
            agent: 'security',
            action: 'detectAnomalies',
            parameters: {
              scope: 'all_leases',
              threshold: 0.8,
            },
          },
          {
            id: 'classify-threats',
            name: 'Classify Detected Threats',
            type: 'classify',
            action: 'classifyThreat',
            parameters: {
              sourceStep: 'detect-threats',
            },
            conditions: [
              {
                field: 'detect-threats_result.threatsFound',
                operator: '>',
                value: 0,
              },
            ],
          },
          {
            id: 'decide-response',
            name: 'Decide Response Action',
            type: 'decide',
            action: 'determineResponse',
            parameters: {
              sourceStep: 'classify-threats',
            },
          },
          {
            id: 'execute-response',
            name: 'Execute Response',
            type: 'execute',
            action: 'executeResponse',
            humanApprovalRequired: true,
            timeout: 1800000, // 30 minutes
            onSuccess: {
              notification: true,
            },
            onFailure: {
              notification: true,
              retry: {
                attempts: 2,
                delay: 60000,
              },
            },
          },
          {
            id: 'verify-response',
            name: 'Verify Response Effectiveness',
            type: 'verify',
            action: 'verifyResponse',
            parameters: {
              sourceStep: 'execute-response',
            },
          },
          {
            id: 'update-systems',
            name: 'Update Systems',
            type: 'update',
            action: 'updateSystems',
          },
        ],
      },
      {
        name: 'Lease Expiration Management',
        description: 'Monitor lease expirations and execute renewal workflows',
        trigger: {
          type: 'scheduled',
          schedule: '0 9 * * *', // Daily at 9 AM
        },
        steps: [
          {
            id: 'check-expirations',
            name: 'Check Upcoming Expirations',
            type: 'detect',
            agent: 'optimization',
            action: 'detectExpirations',
            parameters: {
              daysAhead: 90,
            },
          },
          {
            id: 'analyze-lease-value',
            name: 'Analyze Lease Value',
            type: 'classify',
            agent: 'optimization',
            action: 'analyzeLeaseValue',
            parameters: {
              sourceStep: 'check-expirations',
            },
          },
          {
            id: 'decide-action',
            name: 'Decide Renewal Action',
            type: 'decide',
            action: 'determineRenewalAction',
            parameters: {
              sourceStep: 'analyze-lease-value',
            },
          },
          {
            id: 'prepare-negotiation',
            name: 'Prepare Negotiation Package',
            type: 'execute',
            agent: 'negotiation',
            action: 'prepareNegotiationPackage',
            conditions: [
              {
                field: 'decide-action_result.action',
                operator: '=',
                value: 'negotiate',
              },
            ],
          },
          {
            id: 'notify-stakeholders',
            name: 'Notify Stakeholders',
            type: 'update',
            action: 'notifyStakeholders',
            onSuccess: {
              notification: true,
            },
          },
        ],
      },
      {
        name: 'Certification Monitoring',
        description: 'Monitor and maintain SIA certification scores',
        trigger: {
          type: 'scheduled',
          schedule: '0 */6 * * *', // Every 6 hours
        },
        steps: [
          {
            id: 'calculate-scores',
            name: 'Calculate Certification Scores',
            type: 'detect',
            action: 'calculateCertificationScores',
            parameters: {
              metrics: ['security', 'integrity', 'accuracy'],
            },
          },
          {
            id: 'check-thresholds',
            name: 'Check Score Thresholds',
            type: 'classify',
            action: 'checkThresholds',
            parameters: {
              sourceStep: 'calculate-scores',
              thresholds: {
                security: 85,
                integrity: 85,
                accuracy: 90,
              },
            },
          },
          {
            id: 'create-issues',
            name: 'Create Certification Issues',
            type: 'execute',
            action: 'createCertificationIssues',
            conditions: [
              {
                field: 'check-thresholds_result.belowThreshold',
                operator: '=',
                value: true,
              },
            ],
          },
          {
            id: 'apply-autofix',
            name: 'Apply Auto-fixes',
            type: 'execute',
            action: 'applyAutoFixes',
            conditions: [
              {
                field: 'create-issues_result.autoFixAvailable',
                operator: '=',
                value: true,
              },
            ],
            humanApprovalRequired: false,
          },
          {
            id: 'generate-report',
            name: 'Generate Certification Report',
            type: 'update',
            action: 'generateCertificationReport',
          },
        ],
      },
    ];

    for (const workflow of workflows) {
      await this.createWorkflow(workflow);
    }

    logger.info('Default orchestration workflows created');
  }

  /**
   * Approve human approval request
   */
  async approveHumanApproval(
    approvalId: string,
    decision: 'approve' | 'reject',
    respondedBy: string,
    reason?: string,
    modifications?: Record<string, any>
  ): Promise<void> {
    const approvalDoc = await this.db
      .collection(this.COLLECTIONS.APPROVALS)
      .doc(approvalId)
      .get();

    if (!approvalDoc.exists) {
      throw new Error('Approval request not found');
    }

    const approval = approvalDoc.data() as HumanApproval;

    if (approval.status !== 'pending') {
      throw new Error(`Approval already ${approval.status}`);
    }

    await this.db
      .collection(this.COLLECTIONS.APPROVALS)
      .doc(approvalId)
      .update({
        status: decision === 'approve' ? 'approved' : 'rejected',
        respondedAt: getServerTimestamp(),
        respondedBy,
        response: {
          decision,
          reason,
          modifications,
        },
      });

    logger.info('Human approval processed', { approvalId, decision, respondedBy });
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(_userId?: string): Promise<HumanApproval[]> {
    let query = this.db
      .collection(this.COLLECTIONS.APPROVALS)
      .where('status', '==', 'pending')
      .where('timeoutAt', '>', new Date());

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => doc.data() as HumanApproval);
  }

  /**
   * Get workflow executions
   */
  async getWorkflowExecutions(
    workflowId?: string,
    status?: OrchestrationExecution['status']
  ): Promise<OrchestrationExecution[]> {
    let queryRef = this.db.collection(this.COLLECTIONS.EXECUTIONS);
    let query: any = queryRef;

    if (workflowId) {
      query = query.where('workflowId', '==', workflowId);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('startedAt', 'desc').limit(100).get();
    return snapshot.docs.map((doc: any) => doc.data() as OrchestrationExecution);
  }
}

export const orchestrationService = new OrchestrationService();