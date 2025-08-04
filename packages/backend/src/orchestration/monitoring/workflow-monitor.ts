import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import { WorkflowExecution, WorkflowStep } from '../types/workflow.types';
import { firestore } from '../../config/firebase';

type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

export interface WorkflowMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  stepMetrics: Map<string, StepMetrics>;
  errorFrequency: Map<string, number>;
}

export interface StepMetrics {
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  lastExecutionTime: Date;
}

export interface MonitoringEvent {
  type: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 
        'step_started' | 'step_completed' | 'step_failed' | 'metric_update';
  workflowId: string;
  executionId: string;
  timestamp: Date;
  data: any;
}

export class WorkflowMonitor extends EventEmitter {
  private static instance: WorkflowMonitor;
  private metrics: Map<string, WorkflowMetrics> = new Map();
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private metricsUpdateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.startMetricsCollection();
  }

  static getInstance(): WorkflowMonitor {
    if (!WorkflowMonitor.instance) {
      WorkflowMonitor.instance = new WorkflowMonitor();
    }
    return WorkflowMonitor.instance;
  }

  // Track workflow execution start
  trackWorkflowStart(execution: WorkflowExecution): void {
    this.activeExecutions.set(execution.id, execution);
    
    const event: MonitoringEvent = {
      type: 'workflow_started',
      workflowId: execution.workflowId,
      executionId: execution.id,
      timestamp: new Date(),
      data: {
        useCaseId: execution.useCaseId,
        context: execution.context
      }
    };

    this.emit('monitoring_event', event);
    this.logEvent(event);
  }

  // Track workflow execution completion
  trackWorkflowCompletion(executionId: string, status: WorkflowStatus, outputs?: any): void {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    const duration = Date.now() - execution.startedAt.getTime();
    
    const event: MonitoringEvent = {
      type: status === 'completed' ? 'workflow_completed' : 'workflow_failed',
      workflowId: execution.workflowId,
      executionId: executionId,
      timestamp: new Date(),
      data: {
        status,
        duration,
        outputs,
        error: status === 'failed' ? execution.error : undefined
      }
    };

    this.emit('monitoring_event', event);
    this.logEvent(event);
    this.updateMetrics(execution, status, duration);
    
    this.activeExecutions.delete(executionId);
  }

  // Track step execution
  trackStepExecution(
    executionId: string, 
    step: WorkflowStep, 
    status: 'started' | 'completed' | 'failed',
    duration?: number,
    error?: any
  ): void {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    const event: MonitoringEvent = {
      type: `step_${status}` as MonitoringEvent['type'],
      workflowId: execution.workflowId,
      executionId: executionId,
      timestamp: new Date(),
      data: {
        stepId: step.id,
        stepName: step.name,
        duration,
        error
      }
    };

    this.emit('monitoring_event', event);
    this.logEvent(event);
    
    if (status !== 'started') {
      this.updateStepMetrics(execution.workflowId, step.id, status === 'completed', duration || 0);
    }
  }

  // Get metrics for a specific workflow
  getWorkflowMetrics(workflowId: string): WorkflowMetrics | undefined {
    return this.metrics.get(workflowId);
  }

  // Get all active executions
  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  // Get system-wide metrics
  getSystemMetrics(): {
    totalActiveExecutions: number;
    workflowMetrics: Map<string, WorkflowMetrics>;
    topErrors: Array<{ error: string; count: number }>;
  } {
    const topErrors: Map<string, number> = new Map();
    
    this.metrics.forEach(metric => {
      metric.errorFrequency.forEach((count, error) => {
        topErrors.set(error, (topErrors.get(error) || 0) + count);
      });
    });

    const sortedErrors = Array.from(topErrors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));

    return {
      totalActiveExecutions: this.activeExecutions.size,
      workflowMetrics: this.metrics,
      topErrors: sortedErrors
    };
  }

  // Private methods
  private updateMetrics(execution: WorkflowExecution, status: WorkflowStatus, duration: number): void {
    const metrics = this.metrics.get(execution.workflowId) || {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      stepMetrics: new Map(),
      errorFrequency: new Map()
    };

    metrics.totalExecutions++;
    
    if (status === 'completed') {
      metrics.successfulExecutions++;
    } else if (status === 'failed') {
      metrics.failedExecutions++;
      if (execution.error) {
        const errorKey = execution.error.message || 'Unknown error';
        metrics.errorFrequency.set(errorKey, (metrics.errorFrequency.get(errorKey) || 0) + 1);
      }
    }

    // Update average execution time
    metrics.averageExecutionTime = 
      (metrics.averageExecutionTime * (metrics.totalExecutions - 1) + duration) / metrics.totalExecutions;

    this.metrics.set(execution.workflowId, metrics);
  }

  private updateStepMetrics(workflowId: string, stepId: string, success: boolean, duration: number): void {
    const workflowMetrics = this.metrics.get(workflowId);
    if (!workflowMetrics) return;

    const stepMetrics = workflowMetrics.stepMetrics.get(stepId) || {
      totalExecutions: 0,
      successCount: 0,
      failureCount: 0,
      averageDuration: 0,
      lastExecutionTime: new Date()
    };

    stepMetrics.totalExecutions++;
    if (success) {
      stepMetrics.successCount++;
    } else {
      stepMetrics.failureCount++;
    }

    stepMetrics.averageDuration = 
      (stepMetrics.averageDuration * (stepMetrics.totalExecutions - 1) + duration) / stepMetrics.totalExecutions;
    
    stepMetrics.lastExecutionTime = new Date();

    workflowMetrics.stepMetrics.set(stepId, stepMetrics);
  }

  private logEvent(event: MonitoringEvent): void {
    logger.info(`Workflow Monitor: ${event.type}`, {
      workflowId: event.workflowId,
      executionId: event.executionId,
      data: event.data
    });
  }

  private startMetricsCollection(): void {
    // Periodically save metrics to database
    this.metricsUpdateInterval = setInterval(async () => {
      try {
        const metricsData = Array.from(this.metrics.entries()).map(([workflowId, metrics]) => ({
          workflowId,
          ...metrics,
          stepMetrics: Array.from(metrics.stepMetrics.entries()),
          errorFrequency: Array.from(metrics.errorFrequency.entries()),
          timestamp: new Date()
        }));

        // Save to Firestore
        const db = firestore();
        const batch = db.batch();
        metricsData.forEach(metric => {
          const docRef = db.collection('workflow-metrics').doc(metric.workflowId);
          batch.set(docRef, metric, { merge: true });
        });
        
        await batch.commit();
        
        this.emit('metric_update', {
          type: 'metric_update',
          workflowId: 'system',
          executionId: 'system',
          timestamp: new Date(),
          data: { metricsCount: metricsData.length }
        });
      } catch (error) {
        logger.error('Failed to save workflow metrics:', error);
      }
    }, 60000); // Every minute
  }

  // Cleanup
  destroy(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
export const workflowMonitor = WorkflowMonitor.getInstance();