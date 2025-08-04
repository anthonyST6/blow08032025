import { collections } from '../config/firebase';
import { agentRegistry } from '../agents/base.agent';
import { llmService } from './llm.service';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'llm_prompt' | 'agent_analysis' | 'condition' | 'action';
  config: Record<string, any>;
  nextSteps?: string[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  steps: WorkflowStepExecution[];
  context: Record<string, any>;
  error?: string;
}

export interface WorkflowStepExecution {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export class WorkflowService {
  async executeWorkflow(
    workflowId: string,
    initialContext: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const execution: WorkflowExecution = {
      id: uuidv4(),
      workflowId,
      status: 'running',
      startedAt: new Date(),
      steps: [],
      context: { ...initialContext },
    };

    try {
      // Execute workflow steps
      for (const step of workflow.steps) {
        const stepExecution = await this.executeStep(step, execution);
        execution.steps.push(stepExecution);

        if (stepExecution.status === 'failed') {
          throw new Error(`Step ${step.id} failed: ${stepExecution.error}`);
        }
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
      logger.info(`Workflow ${workflowId} completed successfully`);
      
      // Send completion email if enabled
      if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
        await this.sendCompletionNotification(workflow, execution);
      }
    } catch (error: any) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.error = error.message;
      logger.error('Workflow execution failed', { workflowId, error });
    }

    // Save execution record
    await collections.workflows.doc(workflowId)
      .collection('executions')
      .doc(execution.id)
      .set(execution);

    return execution;
  }

  private async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<WorkflowStepExecution> {
    const stepExecution: WorkflowStepExecution = {
      stepId: step.id,
      status: 'running',
      startedAt: new Date(),
    };

    try {
      switch (step.type) {
        case 'llm_prompt':
          stepExecution.result = await this.executeLLMPrompt(step, execution.context);
          break;

        case 'agent_analysis':
          stepExecution.result = await this.executeAgentAnalysis(step, execution.context);
          break;

        case 'condition':
          stepExecution.result = await this.evaluateCondition(step, execution.context);
          break;

        case 'action':
          stepExecution.result = await this.executeAction(step, execution.context);
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      stepExecution.status = 'completed';
      stepExecution.completedAt = new Date();

      // Update context with step result
      execution.context[`step_${step.id}_result`] = stepExecution.result;
    } catch (error: any) {
      stepExecution.status = 'failed';
      stepExecution.completedAt = new Date();
      stepExecution.error = error.message;
    }

    return stepExecution;
  }

  private async executeLLMPrompt(
    step: WorkflowStep,
    context: Record<string, any>
  ): Promise<any> {
    const { modelId, prompt, metadata } = step.config;
    
    // Replace context variables in prompt
    const processedPrompt = this.processTemplate(prompt, context);

    const response = await llmService.sendPrompt({
      prompt: processedPrompt,
      modelId,
      userId: context.userId || 'system',
      workflowId: context.workflowId,
      metadata: { ...metadata, stepId: step.id },
    });

    return response;
  }

  private async executeAgentAnalysis(
    step: WorkflowStep,
    context: Record<string, any>
  ): Promise<any> {
    const { agentId, input } = step.config;
    
    const agent = agentRegistry.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const processedInput = this.processTemplate(input || context.lastLLMResponse, context);

    const result = await agent.analyze({
      id: uuidv4(),
      promptId: context.promptId || uuidv4(),
      model: 'workflow',
      modelVersion: '1.0',
      text: processedInput,
      rawResponse: { input: processedInput },
      timestamp: new Date(),
      metadata: { stepId: step.id },
    });

    return result;
  }

  private async evaluateCondition(
    step: WorkflowStep,
    context: Record<string, any>
  ): Promise<boolean> {
    const { expression } = step.config;
    
    // Simple expression evaluation (in production, use a proper expression evaluator)
    try {
      const func = new Function('context', `return ${expression}`);
      return func(context);
    } catch (error) {
      logger.error('Failed to evaluate condition', { expression, error });
      return false;
    }
  }

  private async executeAction(
    step: WorkflowStep,
    _context: Record<string, any>
  ): Promise<any> {
    const { type, params } = step.config;

    switch (type) {
      case 'send_notification':
        // Implement notification sending
        logger.info('Sending notification', params);
        break;

      case 'update_database':
        // Implement database update
        logger.info('Updating database', params);
        break;

      case 'webhook':
        // Implement webhook call
        logger.info('Calling webhook', params);
        break;

      default:
        throw new Error(`Unknown action type: ${type}`);
    }

    return { success: true, type, params };
  }

  private processTemplate(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] || match;
    });
  }

  private async getWorkflow(workflowId: string): Promise<any> {
    const doc = await collections.workflows.doc(workflowId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  }

  async getWorkflowExecutions(
    workflowId: string,
    limit: number = 50
  ): Promise<WorkflowExecution[]> {
    const snapshot = await collections.workflows
      .doc(workflowId)
      .collection('executions')
      .orderBy('startedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as WorkflowExecution));
  }

  async getWorkflowExecution(
    workflowId: string,
    executionId: string
  ): Promise<WorkflowExecution | null> {
    const doc = await collections.workflows
      .doc(workflowId)
      .collection('executions')
      .doc(executionId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as WorkflowExecution;
  }

  private async sendCompletionNotification(
    workflow: any,
    execution: WorkflowExecution
  ): Promise<void> {
    try {
      // Get workflow creator's email
      const userDoc = await collections.users.doc(workflow.createdBy).get();
      if (!userDoc.exists) return;
      
      const user = userDoc.data();
      if (!user?.email || user.notificationsEnabled === false) return;
      
      // Calculate duration
      const duration = execution.completedAt
        ? Math.round((execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000)
        : 0;
      const durationStr = duration < 60
        ? `${duration} seconds`
        : `${Math.round(duration / 60)} minutes`;
      
      // Get successful steps
      const successfulSteps = execution.steps.filter(s => s.status === 'completed');
      
      // Extract key results
      const results: string[] = [];
      successfulSteps.forEach(step => {
        if (step.result?.summary) {
          results.push(step.result.summary);
        }
      });
      
      await emailService.sendWorkflowCompletionEmail(
        user.email,
        {
          name: workflow.name,
          duration: durationStr,
          stepsCompleted: successfulSteps.length,
          summary: `Workflow completed with ${successfulSteps.length} of ${execution.steps.length} steps successful`,
          results: results.slice(0, 5), // Top 5 results
          executionId: execution.id,
        }
      );
      
      logger.info(`Workflow completion email sent to ${user.email}`);
    } catch (error) {
      logger.error('Failed to send workflow completion email:', error);
      // Don't throw - email failure shouldn't fail the workflow
    }
  }
}

export const workflowService = new WorkflowService();