import { mockIntegrationLogService } from './mockIntegrationLog.service';
import type { IntegrationLogEntry } from '../types/integration.types';

export type LogLevel = 'info' | 'warning' | 'error' | 'success';
export type LogSource = 'UseCase' | 'Agent' | 'Workflow' | 'Deployment' | 'System';

interface LogContext {
  useCaseId?: string;
  agentId?: string;
  workflowId?: string;
  deploymentId?: string;
  correlationId?: string;
  [key: string]: any;
}

class IntegrationLoggerService {
  private static instance: IntegrationLoggerService;
  private logQueue: Partial<IntegrationLogEntry>[] = [];
  private isProcessing = false;
  private processInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start processing queue every 2 seconds
    this.processInterval = setInterval(() => {
      this.processQueue();
    }, 2000);
  }

  static getInstance(): IntegrationLoggerService {
    if (!IntegrationLoggerService.instance) {
      IntegrationLoggerService.instance = new IntegrationLoggerService();
    }
    return IntegrationLoggerService.instance;
  }

  /**
   * Log a use case event
   */
  logUseCaseEvent(
    useCaseId: string,
    event: string,
    level: LogLevel = 'info',
    context?: LogContext
  ) {
    this.log({
      source: 'UseCase',
      destination: 'System',
      messageType: 'use_case_event',
      message: event,
      level,
      context: {
        ...context,
        useCaseId,
      },
    });
  }

  /**
   * Log an agent event
   */
  logAgentEvent(
    agentId: string,
    event: string,
    level: LogLevel = 'info',
    context?: LogContext
  ) {
    this.log({
      source: 'Agent',
      destination: 'System',
      messageType: 'agent_event',
      message: event,
      level,
      context: {
        ...context,
        agentId,
      },
    });
  }

  /**
   * Log a workflow event
   */
  logWorkflowEvent(
    workflowId: string,
    event: string,
    level: LogLevel = 'info',
    context?: LogContext
  ) {
    this.log({
      source: 'Workflow',
      destination: 'System',
      messageType: 'workflow_event',
      message: event,
      level,
      context: {
        ...context,
        workflowId,
      },
    });
  }

  /**
   * Log a deployment event
   */
  logDeploymentEvent(
    deploymentId: string,
    event: string,
    level: LogLevel = 'info',
    context?: LogContext
  ) {
    this.log({
      source: 'Deployment',
      destination: 'System',
      messageType: 'deployment_event',
      message: event,
      level,
      context: {
        ...context,
        deploymentId,
      },
    });
  }

  /**
   * Log an API call
   */
  logApiCall(
    method: string,
    endpoint: string,
    status: number,
    duration: number,
    context?: LogContext
  ) {
    const level: LogLevel = status >= 200 && status < 300 ? 'success' : 
                           status >= 400 ? 'error' : 'warning';
    
    this.log({
      source: 'API',
      destination: endpoint,
      messageType: 'api_call',
      message: `${method} ${endpoint} - ${status}`,
      level,
      processingTime: duration,
      context: {
        ...context,
        method,
        endpoint,
        status,
      },
    });
  }

  /**
   * Log a system event
   */
  logSystemEvent(
    event: string,
    level: LogLevel = 'info',
    context?: LogContext
  ) {
    this.log({
      source: 'System',
      destination: 'System',
      messageType: 'system_event',
      message: event,
      level,
      context,
    });
  }

  /**
   * Log an error
   */
  logError(
    error: Error | string,
    source: LogSource,
    context?: LogContext
  ) {
    const errorMessage = error instanceof Error ? error.message : error;
    const stackTrace = error instanceof Error ? error.stack : undefined;

    this.log({
      source,
      destination: 'System',
      messageType: 'error',
      message: errorMessage,
      level: 'error',
      errorMessage,
      context: {
        ...context,
        stackTrace,
      },
    });
  }

  /**
   * Core logging method
   */
  private log(entry: {
    source: string;
    destination: string;
    messageType: string;
    message: string;
    level: LogLevel;
    processingTime?: number;
    errorMessage?: string;
    context?: LogContext;
  }) {
    const logEntry: Partial<IntegrationLogEntry> = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      source: entry.source,
      destination: entry.destination,
      messageType: entry.messageType,
      status: this.mapLevelToStatus(entry.level),
      messageSize: JSON.stringify(entry).length,
      processingTime: entry.processingTime || 0,
      payload: {
        message: entry.message,
        level: entry.level,
        ...entry.context,
      },
      metadata: {
        correlationId: entry.context?.correlationId || this.generateCorrelationId(),
        userId: entry.context?.userId,
        sessionId: entry.context?.sessionId || `sess-${Date.now()}`,
        ipAddress: entry.context?.ipAddress,
        userAgent: entry.context?.userAgent,
      },
      errorMessage: entry.errorMessage,
    };

    // Add to queue
    this.logQueue.push(logEntry);

    // If critical error, process immediately
    if (entry.level === 'error') {
      this.processQueue();
    }
  }

  /**
   * Process the log queue
   */
  private async processQueue() {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const logsToProcess = [...this.logQueue];
    this.logQueue = [];

    try {
      // In a real implementation, this would send logs to the backend
      // For now, we'll add them to the mock service's internal array
      // Since the mock service doesn't have an addLog method, we'll emit an event
      // that the IntegrationLog component can listen to

      // Emit event for real-time updates
      window.dispatchEvent(new CustomEvent('integration-logs-updated', {
        detail: { logs: logsToProcess }
      }));
    } catch (error) {
      console.error('Failed to process integration logs:', error);
      // Re-add failed logs to queue
      this.logQueue.unshift(...logsToProcess);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Map log level to status
   */
  private mapLevelToStatus(level: LogLevel): 'success' | 'failure' | 'pending' {
    switch (level) {
      case 'success':
        return 'success';
      case 'error':
        return 'failure';
      default:
        return 'pending';
    }
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.processInterval) {
      clearInterval(this.processInterval);
    }
    this.processQueue(); // Process any remaining logs
  }
}

// Export singleton instance
export const integrationLogger = IntegrationLoggerService.getInstance();

// Export types
export type { LogContext };