import { mockAuditConsoleService } from './mockAuditConsole.service';
import type { AuditLogEntry } from '../types/integration.types';

export type AuditAction = 
  | 'create' | 'update' | 'delete' | 'read' 
  | 'login' | 'logout' | 'execute' | 'deploy' 
  | 'approve' | 'reject' | 'configure';

export type AuditResource = 
  | 'UseCase' | 'Agent' | 'Workflow' | 'Deployment' 
  | 'User' | 'Settings' | 'Integration' | 'Output';

interface AuditContext {
  userId?: string;
  userName?: string;
  resourceId?: string;
  resourceName?: string;
  changes?: {
    before: any;
    after: any;
  };
  metadata?: Record<string, any>;
}

class AuditLoggerService {
  private static instance: AuditLoggerService;
  private auditQueue: Partial<AuditLogEntry>[] = [];
  private isProcessing = false;
  private processInterval: NodeJS.Timeout | null = null;
  private currentUser: { id: string; name: string; email: string } | null = null;

  private constructor() {
    // Start processing queue every 3 seconds
    this.processInterval = setInterval(() => {
      this.processQueue();
    }, 3000);
  }

  static getInstance(): AuditLoggerService {
    if (!AuditLoggerService.instance) {
      AuditLoggerService.instance = new AuditLoggerService();
    }
    return AuditLoggerService.instance;
  }

  /**
   * Set current user for audit logging
   */
  setCurrentUser(user: { id: string; name: string; email: string } | null) {
    this.currentUser = user;
  }

  /**
   * Log a user action
   */
  logAction(
    action: AuditAction,
    resource: AuditResource,
    resourceId: string,
    result: 'success' | 'failure',
    context?: AuditContext
  ) {
    const startTime = Date.now();
    
    this.log({
      action: `${action}_${resource.toLowerCase()}`,
      resource: resource.toLowerCase(),
      resourceId,
      result,
      duration: Date.now() - startTime,
      context,
    });
  }

  /**
   * Log a use case action
   */
  logUseCaseAction(
    action: AuditAction,
    useCaseId: string,
    useCaseName: string,
    result: 'success' | 'failure',
    context?: AuditContext
  ) {
    this.logAction(action, 'UseCase', useCaseId, result, {
      ...context,
      resourceName: useCaseName,
    });
  }

  /**
   * Log an agent action
   */
  logAgentAction(
    action: AuditAction,
    agentId: string,
    agentName: string,
    result: 'success' | 'failure',
    context?: AuditContext
  ) {
    this.logAction(action, 'Agent', agentId, result, {
      ...context,
      resourceName: agentName,
    });
  }

  /**
   * Log a workflow action
   */
  logWorkflowAction(
    action: AuditAction,
    workflowId: string,
    workflowName: string,
    result: 'success' | 'failure',
    context?: AuditContext
  ) {
    this.logAction(action, 'Workflow', workflowId, result, {
      ...context,
      resourceName: workflowName,
    });
  }

  /**
   * Log a deployment action
   */
  logDeploymentAction(
    action: AuditAction,
    deploymentId: string,
    deploymentName: string,
    result: 'success' | 'failure',
    context?: AuditContext
  ) {
    this.logAction(action, 'Deployment', deploymentId, result, {
      ...context,
      resourceName: deploymentName,
    });
  }

  /**
   * Log a configuration change
   */
  logConfigChange(
    resource: AuditResource,
    resourceId: string,
    before: any,
    after: any,
    context?: AuditContext
  ) {
    this.logAction('configure', resource, resourceId, 'success', {
      ...context,
      changes: { before, after },
    });
  }

  /**
   * Log an authentication event
   */
  logAuthEvent(
    action: 'login' | 'logout',
    userId: string,
    userName: string,
    result: 'success' | 'failure',
    context?: AuditContext
  ) {
    this.log({
      action,
      resource: 'authentication',
      resourceId: userId,
      result,
      duration: 0,
      context: {
        ...context,
        userName,
      },
    });
  }

  /**
   * Core logging method
   */
  private log(entry: {
    action: string;
    resource: string;
    resourceId: string;
    result: 'success' | 'failure';
    duration: number;
    context?: AuditContext;
  }) {
    const user = this.currentUser || { 
      id: 'system', 
      name: 'System', 
      email: 'system@seraphim.ai' 
    };

    const auditEntry: Partial<AuditLogEntry> = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: entry.context?.userId || user.id,
      userName: entry.context?.userName || user.name,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      result: entry.result,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      duration: entry.duration,
      errorDetails: entry.result === 'failure' ? entry.context?.metadata?.error : undefined,
      changes: entry.context?.changes,
      metadata: {
        sessionId: this.getSessionId(),
        requestId: `req-${Date.now()}`,
        apiVersion: '1.0',
        ...entry.context?.metadata,
      },
    };

    // Add to queue
    this.auditQueue.push(auditEntry);

    // If critical action, process immediately
    if (entry.action.includes('delete') || entry.result === 'failure') {
      this.processQueue();
    }
  }

  /**
   * Process the audit queue
   */
  private async processQueue() {
    if (this.isProcessing || this.auditQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const logsToProcess = [...this.auditQueue];
    this.auditQueue = [];

    try {
      // In a real implementation, this would send logs to the backend
      // For now, we'll emit an event that the AuditConsole can listen to
      // The mock service doesn't expose a way to add logs directly

      // Emit event for real-time updates
      window.dispatchEvent(new CustomEvent('audit-logs-updated', {
        detail: { logs: logsToProcess }
      }));
    } catch (error) {
      console.error('Failed to process audit logs:', error);
      // Re-add failed logs to queue
      this.auditQueue.unshift(...logsToProcess);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get client IP (mock for frontend)
   */
  private getClientIP(): string {
    // In a real implementation, this would come from the backend
    return '192.168.1.100';
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('audit-session-id');
    if (!sessionId) {
      sessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('audit-session-id', sessionId);
    }
    return sessionId;
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
export const auditLogger = AuditLoggerService.getInstance();

// Export types
export type { AuditContext };