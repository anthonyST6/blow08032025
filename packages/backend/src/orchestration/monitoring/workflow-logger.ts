import { logger } from '../../utils/logger';
import { WorkflowExecution, WorkflowStep, StepExecution } from '../types/workflow.types';
import { firestore } from '../../config/firebase';

export interface WorkflowLog {
  id: string;
  workflowId: string;
  executionId: string;
  useCaseId: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  stepId?: string;
  stepName?: string;
}

export class WorkflowLogger {
  private static instance: WorkflowLogger;
  private logBuffer: WorkflowLog[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds

  private constructor() {
    this.startAutoFlush();
  }

  static getInstance(): WorkflowLogger {
    if (!WorkflowLogger.instance) {
      WorkflowLogger.instance = new WorkflowLogger();
    }
    return WorkflowLogger.instance;
  }

  // Log workflow start
  logWorkflowStart(execution: WorkflowExecution): void {
    this.log({
      workflowId: execution.workflowId,
      executionId: execution.id,
      useCaseId: execution.useCaseId,
      level: 'info',
      message: `Workflow started: ${execution.workflowId}`,
      data: {
        status: execution.status,
        context: execution.context.input
      }
    });
  }

  // Log workflow completion
  logWorkflowCompletion(
    execution: WorkflowExecution,
    duration: number,
    outputs?: any
  ): void {
    this.log({
      workflowId: execution.workflowId,
      executionId: execution.id,
      useCaseId: execution.useCaseId,
      level: execution.status === 'completed' ? 'info' : 'error',
      message: `Workflow ${execution.status}: ${execution.workflowId}`,
      data: {
        status: execution.status,
        duration,
        outputs,
        error: execution.error,
        metrics: execution.metrics
      }
    });
  }

  // Log step execution
  logStepExecution(
    execution: WorkflowExecution,
    step: WorkflowStep,
    stepExecution: StepExecution
  ): void {
    const level = stepExecution.status === 'failed' ? 'error' : 'info';
    
    this.log({
      workflowId: execution.workflowId,
      executionId: execution.id,
      useCaseId: execution.useCaseId,
      stepId: step.id,
      stepName: step.name,
      level,
      message: `Step ${stepExecution.status}: ${step.name}`,
      data: {
        type: step.type,
        agent: step.agent,
        service: step.service,
        action: step.action,
        duration: stepExecution.duration,
        result: stepExecution.result,
        error: stepExecution.error,
        retryCount: stepExecution.retryCount
      }
    });
  }

  // Log warning
  logWarning(
    execution: WorkflowExecution,
    message: string,
    data?: any,
    stepId?: string
  ): void {
    this.log({
      workflowId: execution.workflowId,
      executionId: execution.id,
      useCaseId: execution.useCaseId,
      stepId,
      level: 'warn',
      message,
      data
    });
  }

  // Log error
  logError(
    execution: WorkflowExecution,
    error: Error | string,
    data?: any,
    stepId?: string
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.log({
      workflowId: execution.workflowId,
      executionId: execution.id,
      useCaseId: execution.useCaseId,
      stepId,
      level: 'error',
      message: errorMessage,
      data: {
        ...data,
        stack: errorStack
      }
    });
  }

  // Log debug information
  logDebug(
    execution: WorkflowExecution,
    message: string,
    data?: any,
    stepId?: string
  ): void {
    if (process.env.NODE_ENV === 'development') {
      this.log({
        workflowId: execution.workflowId,
        executionId: execution.id,
        useCaseId: execution.useCaseId,
        stepId,
        level: 'debug',
        message,
        data
      });
    }
  }

  // Query logs
  async queryLogs(filters: {
    workflowId?: string;
    executionId?: string;
    useCaseId?: string;
    level?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): Promise<WorkflowLog[]> {
    try {
      const db = firestore();
      let query = db.collection('workflow-logs')
        .orderBy('timestamp', 'desc');

      if (filters.workflowId) {
        query = query.where('workflowId', '==', filters.workflowId);
      }
      if (filters.executionId) {
        query = query.where('executionId', '==', filters.executionId);
      }
      if (filters.useCaseId) {
        query = query.where('useCaseId', '==', filters.useCaseId);
      }
      if (filters.level) {
        query = query.where('level', '==', filters.level);
      }
      if (filters.startTime) {
        query = query.where('timestamp', '>=', filters.startTime);
      }
      if (filters.endTime) {
        query = query.where('timestamp', '<=', filters.endTime);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WorkflowLog));
    } catch (error) {
      logger.error('Failed to query workflow logs:', error);
      return [];
    }
  }

  // Get execution summary
  async getExecutionSummary(executionId: string): Promise<{
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    stepSummaries: Map<string, { count: number; errors: number }>;
  }> {
    const logs = await this.queryLogs({ executionId });
    
    const summary = {
      totalLogs: logs.length,
      errorCount: logs.filter(log => log.level === 'error').length,
      warningCount: logs.filter(log => log.level === 'warn').length,
      stepSummaries: new Map<string, { count: number; errors: number }>()
    };

    logs.forEach(log => {
      if (log.stepId) {
        const stepSummary = summary.stepSummaries.get(log.stepId) || { count: 0, errors: 0 };
        stepSummary.count++;
        if (log.level === 'error') {
          stepSummary.errors++;
        }
        summary.stepSummaries.set(log.stepId, stepSummary);
      }
    });

    return summary;
  }

  // Private methods
  private log(logEntry: Omit<WorkflowLog, 'id' | 'timestamp'>): void {
    const fullLog: WorkflowLog = {
      ...logEntry,
      id: `${logEntry.executionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Add to buffer
    this.logBuffer.push(fullLog);

    // Also log to console
    const logMethod = logEntry.level === 'error' ? 'error' : 
                     logEntry.level === 'warn' ? 'warn' : 'info';
    
    logger[logMethod](`[Workflow ${logEntry.workflowId}] ${logEntry.message}`, {
      executionId: logEntry.executionId,
      stepId: logEntry.stepId,
      data: logEntry.data
    });

    // Flush if buffer is full
    if (this.logBuffer.length >= this.BUFFER_SIZE) {
      this.flush();
    }
  }

  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.flush();
      }
    }, this.FLUSH_INTERVAL);
  }

  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const db = firestore();
      const batch = db.batch();
      
      logsToFlush.forEach(log => {
        const docRef = db.collection('workflow-logs').doc(log.id);
        batch.set(docRef, log);
      });

      await batch.commit();
      logger.debug(`Flushed ${logsToFlush.length} workflow logs to database`);
    } catch (error) {
      logger.error('Failed to flush workflow logs:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...logsToFlush);
    }
  }

  // Cleanup
  async destroy(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Final flush
    await this.flush();
  }
}

// Export singleton instance
export const workflowLogger = WorkflowLogger.getInstance();