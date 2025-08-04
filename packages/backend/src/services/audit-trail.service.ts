import { firestore, getServerTimestamp } from '../config/firebase';
import { logger } from '../utils/logger';
import { VanguardAction } from './vanguard-actions.service';

export interface AuditEntry {
  id?: string;
  timestamp: Date | any;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  result: 'success' | 'failure';
  errorMessage?: string;
  metadata?: Record<string, any>;
  // Use case specific fields
  useCaseId?: string;
  useCaseName?: string;
  executionId?: string;
  verticalId?: string;
  customParticulars?: Record<string, any>;
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  result?: 'success' | 'failure';
  limit?: number;
  // Use case specific filters
  useCaseId?: string;
  verticalId?: string;
  executionId?: string;
}

export interface UseCaseAuditParticulars {
  useCaseId: string;
  useCaseName: string;
  executionId?: string;
  verticalId?: string;
  agentActions?: VanguardAction[];
  siaScores?: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  customFields?: Record<string, any>;
}

class AuditTrailService {
  private collection = 'auditTrail';
  private _db: any;

  private get db() {
    if (!this._db) {
      this._db = firestore();
    }
    return this._db;
  }

  async logAction(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditEntry: AuditEntry = {
        ...entry,
        timestamp: getServerTimestamp(),
      };

      await this.db.collection(this.collection).add(auditEntry);
      
      logger.info('Audit entry created', {
        action: entry.action,
        resource: entry.resource,
        userId: entry.userId,
      });
    } catch (error) {
      logger.error('Failed to create audit entry', error);
      // Don't throw - audit failures shouldn't break the main flow
    }
  }

  async getAuditTrail(filter: AuditFilter = {}): Promise<AuditEntry[]> {
    try {
      let query = this.db.collection(this.collection)
        .orderBy('timestamp', 'desc');

      if (filter.userId) {
        query = query.where('userId', '==', filter.userId);
      }

      if (filter.action) {
        query = query.where('action', '==', filter.action);
      }

      if (filter.resource) {
        query = query.where('resource', '==', filter.resource);
      }

      if (filter.result) {
        query = query.where('result', '==', filter.result);
      }

      if (filter.startDate) {
        query = query.where('timestamp', '>=', filter.startDate);
      }

      if (filter.endDate) {
        query = query.where('timestamp', '<=', filter.endDate);
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      } else {
        query = query.limit(100); // Default limit
      }

      const snapshot = await query.get();
      const entries: AuditEntry[] = [];

      snapshot.forEach((doc: any) => {
        entries.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return entries;
    } catch (error) {
      logger.error('Failed to get audit trail', error);
      throw error;
    }
  }

  async getAuditEntryById(id: string): Promise<AuditEntry | null> {
    try {
      const doc = await this.db.collection(this.collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as AuditEntry;
    } catch (error) {
      logger.error('Failed to get audit entry', error);
      throw error;
    }
  }

  // Audit helper methods for common actions
  async logLeaseAction(
    userId: string,
    userEmail: string,
    action: string,
    leaseId: string,
    details?: any,
    result: 'success' | 'failure' = 'success',
    errorMessage?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userEmail,
      action: `lease.${action}`,
      resource: 'lease',
      resourceId: leaseId,
      details,
      result,
      errorMessage,
    });
  }

  async logCertificationAction(
    userId: string,
    userEmail: string,
    action: string,
    certificationId?: string,
    details?: any,
    result: 'success' | 'failure' = 'success',
    errorMessage?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userEmail,
      action: `certification.${action}`,
      resource: 'certification',
      resourceId: certificationId,
      details,
      result,
      errorMessage,
    });
  }

  async logAgentAction(
    userId: string,
    userEmail: string,
    action: string,
    agentId: string,
    details?: any,
    result: 'success' | 'failure' = 'success',
    errorMessage?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userEmail,
      action: `agent.${action}`,
      resource: 'agent',
      resourceId: agentId,
      details,
      result,
      errorMessage,
    });
  }

  async logWorkflowAction(
    userId: string,
    userEmail: string,
    action: string,
    workflowId: string,
    details?: any,
    result: 'success' | 'failure' = 'success',
    errorMessage?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userEmail,
      action: `workflow.${action}`,
      resource: 'workflow',
      resourceId: workflowId,
      details,
      result,
      errorMessage,
    });
  }

  async logNotificationAction(
    userId: string,
    userEmail: string,
    action: string,
    notificationId?: string,
    details?: any,
    result: 'success' | 'failure' = 'success',
    errorMessage?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userEmail,
      action: `notification.${action}`,
      resource: 'notification',
      resourceId: notificationId,
      details,
      result,
      errorMessage,
    });
  }

  // Generate audit report
  async generateAuditReport(
    startDate: Date,
    endDate: Date,
    groupBy: 'user' | 'action' | 'resource' = 'action'
  ): Promise<any> {
    try {
      const entries = await this.getAuditTrail({
        startDate,
        endDate,
        limit: 10000, // Higher limit for reports
      });

      const report: any = {
        period: {
          start: startDate,
          end: endDate,
        },
        totalEntries: entries.length,
        successCount: entries.filter(e => e.result === 'success').length,
        failureCount: entries.filter(e => e.result === 'failure').length,
        breakdown: {},
      };

      // Group by specified field
      entries.forEach(entry => {
        const key = groupBy === 'user' ? entry.userId :
                   groupBy === 'action' ? entry.action :
                   entry.resource;

        if (!report.breakdown[key]) {
          report.breakdown[key] = {
            count: 0,
            success: 0,
            failure: 0,
          };
        }

        report.breakdown[key].count++;
        if (entry.result === 'success') {
          report.breakdown[key].success++;
        } else {
          report.breakdown[key].failure++;
        }
      });

      return report;
    } catch (error) {
      logger.error('Failed to generate audit report', error);
      throw error;
    }
  }

  // Compliance-specific audit methods
  async logComplianceCheck(
    userId: string,
    userEmail: string,
    checkType: string,
    resourceId: string,
    findings: any,
    passed: boolean
  ): Promise<void> {
    await this.logAction({
      userId,
      userEmail,
      action: `compliance.check.${checkType}`,
      resource: 'compliance',
      resourceId,
      details: {
        findings,
        passed,
      },
      result: 'success',
      metadata: {
        complianceType: checkType,
        passed,
      },
    });
  }

  async getComplianceAuditTrail(
    startDate: Date,
    endDate: Date,
    checkType?: string
  ): Promise<AuditEntry[]> {
    const filter: AuditFilter = {
      startDate,
      endDate,
      resource: 'compliance',
    };

    if (checkType) {
      filter.action = `compliance.check.${checkType}`;
    }

    return this.getAuditTrail(filter);
  }

  // Use case specific audit methods
  async logUseCaseAction(
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    particulars: UseCaseAuditParticulars,
    result: 'success' | 'failure' = 'success',
    errorMessage?: string,
    details?: any
  ): Promise<void> {
    try {
      const auditEntry: AuditEntry = {
        userId,
        userEmail,
        action: `usecase.${action}`,
        resource,
        resourceId: particulars.executionId,
        result,
        errorMessage,
        details,
        timestamp: getServerTimestamp(),
        useCaseId: particulars.useCaseId,
        useCaseName: particulars.useCaseName,
        executionId: particulars.executionId,
        verticalId: particulars.verticalId,
        customParticulars: {
          ...particulars.customFields,
          siaScores: particulars.siaScores,
          agentActionCount: particulars.agentActions?.length || 0
        },
        metadata: {
          ...particulars.customFields,
          siaScores: particulars.siaScores
        }
      };

      // Log to main audit trail
      await this.db.collection(this.collection).add(auditEntry);

      // Also log to use case specific collection with full agent actions
      if (particulars.agentActions && particulars.agentActions.length > 0) {
        await this.db.collection('useCaseAuditTrail').add({
          ...auditEntry,
          agentActions: particulars.agentActions
        });
      }

      logger.info('Use case audit entry created', {
        action,
        resource,
        userId,
        useCaseId: particulars.useCaseId,
        executionId: particulars.executionId
      });
    } catch (error) {
      logger.error('Failed to create use case audit entry', error);
      // Don't throw - audit failures shouldn't break the main flow
    }
  }

  async getUseCaseAuditTrail(
    useCaseId: string,
    filter: Partial<AuditFilter> = {}
  ): Promise<AuditEntry[]> {
    try {
      let query = this.db.collection(this.collection)
        .where('useCaseId', '==', useCaseId)
        .orderBy('timestamp', 'desc');

      if (filter.executionId) {
        query = query.where('executionId', '==', filter.executionId);
      }

      if (filter.userId) {
        query = query.where('userId', '==', filter.userId);
      }

      if (filter.startDate) {
        query = query.where('timestamp', '>=', filter.startDate);
      }

      if (filter.endDate) {
        query = query.where('timestamp', '<=', filter.endDate);
      }

      if (filter.result) {
        query = query.where('result', '==', filter.result);
      }

      query = query.limit(filter.limit || 100);

      const snapshot = await query.get();
      const entries: AuditEntry[] = [];

      snapshot.forEach((doc: any) => {
        entries.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return entries;
    } catch (error) {
      logger.error('Failed to get use case audit trail', error);
      throw error;
    }
  }

  async getUseCaseAuditSummary(
    useCaseId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<{
    totalActions: number;
    successRate: number;
    averageSiaScores: {
      security: number;
      integrity: number;
      accuracy: number;
    };
    actionBreakdown: Record<string, number>;
    recentActions: AuditEntry[];
    customParticularsBreakdown: Record<string, any>;
  }> {
    try {
      let query = this.db.collection(this.collection)
        .where('useCaseId', '==', useCaseId);

      if (dateRange) {
        query = query
          .where('timestamp', '>=', dateRange.start)
          .where('timestamp', '<=', dateRange.end);
      }

      const snapshot = await query.get();
      const entries: AuditEntry[] = [];

      snapshot.forEach((doc: any) => {
        entries.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      const totalActions = entries.length;
      const successfulActions = entries.filter(e => e.result === 'success').length;
      const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;

      // Calculate average SIA scores
      const siaScores = entries
        .filter(e => e.customParticulars?.siaScores)
        .map(e => e.customParticulars!.siaScores);

      const averageSiaScores = {
        security: siaScores.length > 0
          ? siaScores.reduce((sum, s) => sum + s.security, 0) / siaScores.length
          : 0,
        integrity: siaScores.length > 0
          ? siaScores.reduce((sum, s) => sum + s.integrity, 0) / siaScores.length
          : 0,
        accuracy: siaScores.length > 0
          ? siaScores.reduce((sum, s) => sum + s.accuracy, 0) / siaScores.length
          : 0
      };

      // Action breakdown
      const actionBreakdown: Record<string, number> = {};
      entries.forEach(entry => {
        actionBreakdown[entry.action] = (actionBreakdown[entry.action] || 0) + 1;
      });

      // Custom particulars breakdown
      const customParticularsBreakdown: Record<string, any> = {};
      entries.forEach(entry => {
        if (entry.customParticulars) {
          Object.keys(entry.customParticulars).forEach(key => {
            if (key !== 'siaScores' && key !== 'agentActionCount') {
              if (!customParticularsBreakdown[key]) {
                customParticularsBreakdown[key] = [];
              }
              customParticularsBreakdown[key].push(entry.customParticulars![key]);
            }
          });
        }
      });

      // Recent actions
      const recentActions = entries
        .sort((a, b) => {
          const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
          const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
          return bTime.getTime() - aTime.getTime();
        })
        .slice(0, 10);

      return {
        totalActions,
        successRate,
        averageSiaScores,
        actionBreakdown,
        recentActions,
        customParticularsBreakdown
      };
    } catch (error) {
      logger.error('Failed to get use case audit summary', error);
      throw error;
    }
  }

  async logUseCaseExecution(
    userId: string,
    userEmail: string,
    useCaseId: string,
    useCaseName: string,
    executionId: string,
    verticalId: string,
    status: 'started' | 'completed' | 'failed',
    particulars?: UseCaseAuditParticulars
  ): Promise<void> {
    const action = `execution.${status}`;
    const resource = 'use_case_execution';
    
    await this.logUseCaseAction(
      userId,
      userEmail,
      action,
      resource,
      particulars || {
        useCaseId,
        useCaseName,
        executionId,
        verticalId
      },
      status === 'failed' ? 'failure' : 'success'
    );
  }

  async getVerticalAuditTrail(
    verticalId: string,
    filter: Partial<AuditFilter> = {}
  ): Promise<AuditEntry[]> {
    try {
      let query = this.db.collection(this.collection)
        .where('verticalId', '==', verticalId)
        .orderBy('timestamp', 'desc');

      if (filter.userId) {
        query = query.where('userId', '==', filter.userId);
      }

      if (filter.startDate) {
        query = query.where('timestamp', '>=', filter.startDate);
      }

      if (filter.endDate) {
        query = query.where('timestamp', '<=', filter.endDate);
      }

      query = query.limit(filter.limit || 100);

      const snapshot = await query.get();
      const entries: AuditEntry[] = [];

      snapshot.forEach((doc: any) => {
        entries.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return entries;
    } catch (error) {
      logger.error('Failed to get vertical audit trail', error);
      throw error;
    }
  }
}

export const auditTrailService = new AuditTrailService();