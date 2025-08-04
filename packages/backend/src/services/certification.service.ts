import { firestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export interface CertificationScore {
  security: number;      // 0-100
  integrity: number;     // 0-100
  accuracy: number;      // 0-100
  overall: number;       // 0-100 (weighted average)
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

export interface CertificationIssue {
  id: string;
  category: 'security' | 'integrity' | 'accuracy';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  detectedAt: Date;
  detectedBy: string; // Vanguard agent ID
  status: 'open' | 'in_progress' | 'resolved' | 'verified';
  autoFixAvailable: boolean;
  autoFixApplied?: boolean;
  fixDetails?: {
    action: string;
    appliedAt?: Date;
    appliedBy?: string;
    result?: string;
    verifiedAt?: Date;
    verifiedBy?: string;
  };
  manualReviewRequired: boolean;
  affectedResources: string[];
  evidence?: {
    type: string;
    data: any;
  }[];
  recommendations: string[];
}

export interface CertificationAutoFix {
  id: string;
  issueId: string;
  category: 'security' | 'integrity' | 'accuracy';
  fixType: 'configuration' | 'permission' | 'data_correction' | 'process_update' | 'integration_fix';
  description: string;
  actions: Array<{
    type: string;
    target: string;
    parameters: Record<string, any>;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    result?: any;
    error?: string;
  }>;
  riskLevel: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  executionStarted?: Date;
  executionCompleted?: Date;
  rollbackAvailable: boolean;
  rollbackActions?: Array<{
    type: string;
    target: string;
    parameters: Record<string, any>;
  }>;
}

export interface CertificationReport {
  id: string;
  leaseId?: string;
  reportDate: Date;
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'ad_hoc';
  scores: CertificationScore;
  issuesSummary: {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    resolved: number;
    autoFixed: number;
  };
  complianceStatus: {
    compliant: boolean;
    violations: Array<{
      regulation: string;
      description: string;
      severity: string;
    }>;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    impact: string;
  }>;
  trends: {
    scoreHistory: Array<{
      date: Date;
      scores: CertificationScore;
    }>;
    issueHistory: Array<{
      date: Date;
      count: number;
      resolved: number;
    }>;
  };
}

export interface CertificationThreshold {
  category: 'security' | 'integrity' | 'accuracy' | 'overall';
  minScore: number;
  action: 'alert' | 'auto_fix' | 'escalate' | 'block';
  notificationChannels: ('email' | 'teams' | 'slack' | 'sms')[];
  recipients: string[];
}

class CertificationService {
  private _adminDb: any;
  
  private get adminDb() {
    if (!this._adminDb) {
      this._adminDb = firestore();
    }
    return this._adminDb;
  }

  private readonly COLLECTIONS = {
    CERTIFICATIONS: 'certifications',
    ISSUES: 'certificationIssues',
    AUTOFIXES: 'certificationAutoFixes',
    REPORTS: 'certificationReports',
    THRESHOLDS: 'certificationThresholds',
  };

  private readonly WEIGHTS = {
    security: 0.4,
    integrity: 0.35,
    accuracy: 0.25,
  };

  /**
   * Calculate certification scores for a lease
   */
  async calculateScores(
    leaseId: string,
    metrics: {
      security: Array<{ metric: string; value: number; weight: number }>;
      integrity: Array<{ metric: string; value: number; weight: number }>;
      accuracy: Array<{ metric: string; value: number; weight: number }>;
    }
  ): Promise<CertificationScore> {
    try {
      logger.info('Calculating certification scores', { leaseId });

      // Calculate category scores
      const securityScore = this.calculateCategoryScore(metrics.security);
      const integrityScore = this.calculateCategoryScore(metrics.integrity);
      const accuracyScore = this.calculateCategoryScore(metrics.accuracy);

      // Calculate overall score
      const overall = Math.round(
        securityScore * this.WEIGHTS.security +
        integrityScore * this.WEIGHTS.integrity +
        accuracyScore * this.WEIGHTS.accuracy
      );

      // Get previous score to determine trend
      const previousScore = await this.getPreviousScore(leaseId);
      const trend = this.determineTrend(overall, previousScore?.overall);

      const scores: CertificationScore = {
        security: securityScore,
        integrity: integrityScore,
        accuracy: accuracyScore,
        overall,
        trend,
        lastUpdated: new Date(),
      };

      // Save scores
      await this.saveScores(leaseId, scores);

      // Check thresholds and trigger actions
      await this.checkThresholds(leaseId, scores);

      logger.info('Certification scores calculated', { leaseId, scores });

      return scores;
    } catch (error) {
      logger.error('Failed to calculate certification scores', { error, leaseId });
      throw error;
    }
  }

  /**
   * Calculate score for a category
   */
  private calculateCategoryScore(
    metrics: Array<{ metric: string; value: number; weight: number }>
  ): number {
    if (metrics.length === 0) return 0;

    const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = metrics.reduce((sum, m) => sum + (m.value * m.weight), 0);

    return Math.round(weightedSum / totalWeight);
  }

  /**
   * Determine score trend
   */
  private determineTrend(
    currentScore: number,
    previousScore?: number
  ): 'improving' | 'stable' | 'declining' {
    if (!previousScore) return 'stable';

    const difference = currentScore - previousScore;
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  /**
   * Get previous certification score
   */
  private async getPreviousScore(leaseId: string): Promise<CertificationScore | null> {
    try {
      const certDoc = await this.adminDb
        .collection(this.COLLECTIONS.CERTIFICATIONS)
        .doc(leaseId)
        .get();

      if (certDoc.exists) {
        const data = certDoc.data()!;
        return {
          security: data.security,
          integrity: data.integrity,
          accuracy: data.accuracy,
          overall: data.overall,
          trend: data.trend,
          lastUpdated: data.lastUpdated.toDate(),
        };
      }

      return null;
    } catch (error) {
      logger.error('Failed to get previous score', { error, leaseId });
      return null;
    }
  }

  /**
   * Save certification scores
   */
  private async saveScores(leaseId: string, scores: CertificationScore): Promise<void> {
    try {
      await this.adminDb
        .collection(this.COLLECTIONS.CERTIFICATIONS)
        .doc(leaseId)
        .set(
          {
            ...scores,
            lastUpdated: Timestamp.fromDate(scores.lastUpdated),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
    } catch (error) {
      logger.error('Failed to save certification scores', { error, leaseId });
      throw error;
    }
  }

  /**
   * Check thresholds and trigger actions
   */
  private async checkThresholds(
    leaseId: string,
    scores: CertificationScore
  ): Promise<void> {
    try {
      const thresholdDocs = await this.adminDb
        .collection(this.COLLECTIONS.THRESHOLDS)
        .get();

      for (const doc of thresholdDocs.docs) {
        const threshold = doc.data() as CertificationThreshold;
        const score = scores[threshold.category as keyof CertificationScore];

        if (typeof score === 'number' && score < threshold.minScore) {
          await this.triggerThresholdAction(leaseId, scores, threshold);
        }
      }
    } catch (error) {
      logger.error('Failed to check thresholds', { error, leaseId });
    }
  }

  /**
   * Trigger threshold action
   */
  private async triggerThresholdAction(
    leaseId: string,
    scores: CertificationScore,
    threshold: CertificationThreshold
  ): Promise<void> {
    logger.warn('Certification threshold breached', {
      leaseId,
      category: threshold.category,
      score: scores[threshold.category as keyof CertificationScore],
      minScore: threshold.minScore,
      action: threshold.action,
    });

    switch (threshold.action) {
      case 'alert':
        // Send notifications through configured channels
        // This would integrate with the notification service
        break;

      case 'auto_fix':
        // Trigger auto-fix for issues in this category
        await this.triggerCategoryAutoFix(leaseId, threshold.category as 'security' | 'integrity' | 'accuracy');
        break;

      case 'escalate':
        // Create high-priority issue for manual review
        await this.createEscalationIssue(leaseId, threshold.category as 'security' | 'integrity' | 'accuracy', scores);
        break;

      case 'block':
        // Block certain operations until score improves
        // This would integrate with the lease service
        break;
    }
  }

  /**
   * Trigger auto-fix for all issues in a category
   */
  private async triggerCategoryAutoFix(
    leaseId: string,
    category: 'security' | 'integrity' | 'accuracy'
  ): Promise<void> {
    try {
      const issuesQuery = await this.adminDb
        .collection(this.COLLECTIONS.ISSUES)
        .where('affectedResources', 'array-contains', leaseId)
        .where('category', '==', category)
        .where('status', '==', 'open')
        .where('autoFixAvailable', '==', true)
        .get();

      for (const doc of issuesQuery.docs) {
        const issue = doc.data() as CertificationIssue;
        await this.createAutoFix(issue);
      }

      logger.info('Category auto-fix triggered', { leaseId, category, count: issuesQuery.size });
    } catch (error) {
      logger.error('Failed to trigger category auto-fix', { error, leaseId, category });
    }
  }

  /**
   * Create escalation issue
   */
  private async createEscalationIssue(
    leaseId: string,
    category: 'security' | 'integrity' | 'accuracy',
    scores: CertificationScore
  ): Promise<void> {
    const issue: Omit<CertificationIssue, 'id'> = {
      category,
      severity: 'critical',
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Score Below Threshold`,
      description: `${category} score (${scores[category]}) has fallen below the minimum threshold. Immediate action required.`,
      detectedAt: new Date(),
      detectedBy: 'certification_monitor',
      status: 'open',
      autoFixAvailable: false,
      manualReviewRequired: true,
      affectedResources: [leaseId],
      recommendations: [
        'Conduct immediate review of all ' + category + ' controls',
        'Identify and remediate root causes',
        'Implement additional monitoring',
      ],
    };

    await this.createIssue(issue);
  }

  /**
   * Create certification issue
   */
  async createIssue(issue: Omit<CertificationIssue, 'id'>): Promise<CertificationIssue> {
    try {
      const issueId = uuidv4();
      const issueWithId: CertificationIssue = {
        id: issueId,
        ...issue,
      };

      await this.adminDb
        .collection(this.COLLECTIONS.ISSUES)
        .doc(issueId)
        .set({
          ...issueWithId,
          detectedAt: Timestamp.fromDate(issue.detectedAt),
          createdAt: FieldValue.serverTimestamp(),
        });

      logger.info('Certification issue created', {
        issueId,
        category: issue.category,
        severity: issue.severity,
      });

      // Check if auto-fix is available
      if (issue.autoFixAvailable && issue.severity !== 'critical') {
        await this.createAutoFix(issueWithId);
      }

      return issueWithId;
    } catch (error) {
      logger.error('Failed to create certification issue', { error });
      throw error;
    }
  }

  /**
   * Create auto-fix for an issue
   */
  async createAutoFix(issue: CertificationIssue): Promise<CertificationAutoFix> {
    try {
      const autoFix = this.generateAutoFix(issue);
      
      await this.adminDb
        .collection(this.COLLECTIONS.AUTOFIXES)
        .doc(autoFix.id)
        .set({
          ...autoFix,
          createdAt: FieldValue.serverTimestamp(),
        });

      logger.info('Auto-fix created', {
        autoFixId: autoFix.id,
        issueId: issue.id,
        requiresApproval: autoFix.requiresApproval,
      });

      // Execute immediately if low risk and no approval required
      if (!autoFix.requiresApproval && autoFix.riskLevel === 'low') {
        await this.executeAutoFix(autoFix.id);
      }

      return autoFix;
    } catch (error) {
      logger.error('Failed to create auto-fix', { error, issueId: issue.id });
      throw error;
    }
  }

  /**
   * Generate auto-fix based on issue type
   */
  private generateAutoFix(issue: CertificationIssue): CertificationAutoFix {
    const autoFixId = uuidv4();
    const baseAutoFix = {
      id: autoFixId,
      issueId: issue.id,
      category: issue.category,
      description: `Auto-fix for: ${issue.title}`,
      riskLevel: 'medium' as const,
      requiresApproval: true,
      rollbackAvailable: true,
    };

    // Generate fix actions based on issue type
    switch (issue.category) {
      case 'security':
        return this.generateSecurityFix(issue, baseAutoFix);
      case 'integrity':
        return this.generateIntegrityFix(issue, baseAutoFix);
      case 'accuracy':
        return this.generateAccuracyFix(issue, baseAutoFix);
      default:
        throw new Error(`Unknown issue category: ${issue.category}`);
    }
  }

  /**
   * Generate security fix
   */
  private generateSecurityFix(
    issue: CertificationIssue,
    baseAutoFix: Partial<CertificationAutoFix>
  ): CertificationAutoFix {
    const actions = [];
    const rollbackActions: CertificationAutoFix['rollbackActions'] = [];

    // Example security fixes
    if (issue.title.includes('permission')) {
      actions.push({
        type: 'update_permission',
        target: issue.affectedResources[0],
        parameters: {
          permission: 'read',
          principals: ['authenticated_users'],
        },
        status: 'pending' as const,
      });

      rollbackActions.push({
        type: 'restore_permission',
        target: issue.affectedResources[0],
        parameters: {
          permission: 'write',
          principals: ['all_users'],
        },
      });
    }

    if (issue.title.includes('encryption')) {
      actions.push({
        type: 'enable_encryption',
        target: issue.affectedResources[0],
        parameters: {
          algorithm: 'AES-256',
          keyRotation: true,
        },
        status: 'pending' as const,
      });
    }

    return {
      ...baseAutoFix,
      fixType: 'permission',
      actions,
      rollbackActions,
      riskLevel: issue.severity === 'critical' ? 'high' : 'medium',
      requiresApproval: issue.severity !== 'low',
    } as CertificationAutoFix;
  }

  /**
   * Generate integrity fix
   */
  private generateIntegrityFix(
    issue: CertificationIssue,
    baseAutoFix: Partial<CertificationAutoFix>
  ): CertificationAutoFix {
    const actions = [];
    const rollbackActions: CertificationAutoFix['rollbackActions'] = [];

    // Example integrity fixes
    if (issue.title.includes('data consistency')) {
      actions.push({
        type: 'sync_data',
        target: issue.affectedResources[0],
        parameters: {
          source: 'primary_database',
          destination: 'replica_database',
          validateChecksum: true,
        },
        status: 'pending' as const,
      });
    }

    if (issue.title.includes('validation')) {
      actions.push({
        type: 'add_validation',
        target: issue.affectedResources[0],
        parameters: {
          rules: ['required', 'format', 'range'],
          enforceOnUpdate: true,
        },
        status: 'pending' as const,
      });
    }

    return {
      ...baseAutoFix,
      fixType: 'data_correction',
      actions,
      rollbackActions,
      riskLevel: 'medium',
      requiresApproval: true,
    } as CertificationAutoFix;
  }

  /**
   * Generate accuracy fix
   */
  private generateAccuracyFix(
    issue: CertificationIssue,
    baseAutoFix: Partial<CertificationAutoFix>
  ): CertificationAutoFix {
    const actions = [];
    const rollbackActions: CertificationAutoFix['rollbackActions'] = [];

    // Example accuracy fixes
    if (issue.title.includes('calculation')) {
      actions.push({
        type: 'recalculate',
        target: issue.affectedResources[0],
        parameters: {
          formula: 'updated_formula',
          applyToHistorical: false,
        },
        status: 'pending' as const,
      });
    }

    if (issue.title.includes('mapping')) {
      actions.push({
        type: 'update_mapping',
        target: issue.affectedResources[0],
        parameters: {
          fieldMappings: {},
          validateOutput: true,
        },
        status: 'pending' as const,
      });
    }

    return {
      ...baseAutoFix,
      fixType: 'process_update',
      actions,
      rollbackActions,
      riskLevel: 'low',
      requiresApproval: false,
    } as CertificationAutoFix;
  }

  /**
   * Execute auto-fix
   */
  async executeAutoFix(autoFixId: string): Promise<void> {
    try {
      const autoFixDoc = await this.adminDb
        .collection(this.COLLECTIONS.AUTOFIXES)
        .doc(autoFixId)
        .get();

      if (!autoFixDoc.exists) {
        throw new Error('Auto-fix not found');
      }

      const autoFix = autoFixDoc.data() as CertificationAutoFix;

      // Check approval status
      if (autoFix.requiresApproval && autoFix.approvalStatus !== 'approved') {
        logger.warn('Auto-fix requires approval', { autoFixId });
        return;
      }

      logger.info('Executing auto-fix', { autoFixId, actions: autoFix.actions.length });

      // Update status
      await this.adminDb
        .collection(this.COLLECTIONS.AUTOFIXES)
        .doc(autoFixId)
        .update({
          executionStarted: FieldValue.serverTimestamp(),
        });

      // Execute each action
      const results = [];
      for (const [index, action] of autoFix.actions.entries()) {
        try {
          const result = await this.executeAction(action);
          results.push(result);

          // Update action status
          await this.adminDb
            .collection(this.COLLECTIONS.AUTOFIXES)
            .doc(autoFixId)
            .update({
              [`actions.${index}.status`]: 'completed',
              [`actions.${index}.result`]: result,
            });
        } catch (error) {
          logger.error('Auto-fix action failed', { error, action });
          
          // Update action status
          await this.adminDb
            .collection(this.COLLECTIONS.AUTOFIXES)
            .doc(autoFixId)
            .update({
              [`actions.${index}.status`]: 'failed',
              [`actions.${index}.error`]: error instanceof Error ? error.message : String(error),
            });

          // Rollback if needed
          if (autoFix.rollbackAvailable && index > 0) {
            await this.rollbackAutoFix(autoFixId, index);
          }

          throw error;
        }
      }

      // Update completion status
      await this.adminDb
        .collection(this.COLLECTIONS.AUTOFIXES)
        .doc(autoFixId)
        .update({
          executionCompleted: FieldValue.serverTimestamp(),
        });

      // Update issue status
      await this.adminDb
        .collection(this.COLLECTIONS.ISSUES)
        .doc(autoFix.issueId)
        .update({
          status: 'resolved',
          autoFixApplied: true,
          'fixDetails.action': autoFix.description,
          'fixDetails.appliedAt': FieldValue.serverTimestamp(),
          'fixDetails.appliedBy': 'auto_fix_system',
        });

      logger.info('Auto-fix executed successfully', { autoFixId });
    } catch (error) {
      logger.error('Failed to execute auto-fix', { error, autoFixId });
      throw error;
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: CertificationAutoFix['actions'][0]): Promise<any> {
    // This would integrate with various services based on action type
    logger.info('Executing action', { type: action.type, target: action.target });

    switch (action.type) {
      case 'update_permission':
        // Call permission service
        return { success: true, permissionUpdated: action.target };

      case 'enable_encryption':
        // Call encryption service
        return { success: true, encryptionEnabled: action.target };

      case 'sync_data':
        // Call data sync service
        return { success: true, recordsSynced: 100 };

      case 'add_validation':
        // Call validation service
        return { success: true, validationAdded: action.target };

      case 'recalculate':
        // Call calculation service
        return { success: true, recordsRecalculated: 50 };

      case 'update_mapping':
        // Call mapping service
        return { success: true, mappingUpdated: action.target };

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Rollback auto-fix
   */
  private async rollbackAutoFix(autoFixId: string, upToIndex: number): Promise<void> {
    try {
      logger.info('Rolling back auto-fix', { autoFixId, upToIndex });

      const autoFixDoc = await this.adminDb
        .collection(this.COLLECTIONS.AUTOFIXES)
        .doc(autoFixId)
        .get();

      if (!autoFixDoc.exists) {
        throw new Error('Auto-fix not found');
      }

      const autoFix = autoFixDoc.data() as CertificationAutoFix;

      if (!autoFix.rollbackAvailable || !autoFix.rollbackActions) {
        throw new Error('Rollback not available for this auto-fix');
      }

      // Execute rollback actions in reverse order
      for (let i = upToIndex - 1; i >= 0; i--) {
        const rollbackAction = autoFix.rollbackActions[i];
        if (rollbackAction) {
          await this.executeAction({
            ...rollbackAction,
            status: 'pending',
          });
        }
      }

      logger.info('Auto-fix rolled back successfully', { autoFixId });
    } catch (error) {
      logger.error('Failed to rollback auto-fix', { error, autoFixId });
      throw error;
    }
  }

  /**
   * Approve auto-fix
   */
  async approveAutoFix(
    autoFixId: string,
    approvedBy: string
  ): Promise<void> {
    try {
      await this.adminDb
        .collection(this.COLLECTIONS.AUTOFIXES)
        .doc(autoFixId)
        .update({
          approvalStatus: 'approved',
          approvedBy,
          approvedAt: FieldValue.serverTimestamp(),
        });

      logger.info('Auto-fix approved', { autoFixId, approvedBy });

      // Execute the auto-fix
      await this.executeAutoFix(autoFixId);
    } catch (error) {
      logger.error('Failed to approve auto-fix', { error, autoFixId });
      throw error;
    }
  }

  /**
   * Reject auto-fix
   */
  async rejectAutoFix(
    autoFixId: string,
    rejectedBy: string,
    reason: string
  ): Promise<void> {
    try {
      await this.adminDb
        .collection(this.COLLECTIONS.AUTOFIXES)
        .doc(autoFixId)
        .update({
          approvalStatus: 'rejected',
          rejectedBy,
          rejectedAt: FieldValue.serverTimestamp(),
          rejectionReason: reason,
        });

      logger.info('Auto-fix rejected', { autoFixId, rejectedBy, reason });
    } catch (error) {
      logger.error('Failed to reject auto-fix', { error, autoFixId });
      throw error;
    }
  }

  /**
   * Generate certification report
   */
  async generateReport(
    leaseId: string,
    reportType: CertificationReport['reportType']
  ): Promise<CertificationReport> {
    try {
      logger.info('Generating certification report', { leaseId, reportType });

      // Get current scores
      const scores = await this.getCurrentScores(leaseId);

      // Get issues summary
      const issuesSummary = await this.getIssuesSummary(leaseId);

      // Get compliance status
      const complianceStatus = await this.getComplianceStatus(leaseId, scores);

      // Generate recommendations
      const recommendations = this.generateRecommendations(scores, issuesSummary);

      // Get historical data
      const trends = await this.getTrends(leaseId);

      const report: CertificationReport = {
        id: uuidv4(),
        leaseId,
        reportDate: new Date(),
        reportType,
        scores,
        issuesSummary,
        complianceStatus,
        recommendations,
        trends,
      };

      // Save report
      await this.adminDb
        .collection(this.COLLECTIONS.REPORTS)
        .doc(report.id)
        .set({
          ...report,
          reportDate: Timestamp.fromDate(report.reportDate),
          createdAt: FieldValue.serverTimestamp(),
        });

      logger.info('Certification report generated', { reportId: report.id });

      return report;
    } catch (error) {
      logger.error('Failed to generate certification report', { error, leaseId });
      throw error;
    }
  }

  /**
   * Get current certification scores
   */
  private async getCurrentScores(leaseId: string): Promise<CertificationScore> {
    const score = await this.getPreviousScore(leaseId);
    if (!score) {
      throw new Error('No certification scores found');
    }
    return score;
  }

  /**
   * Get issues summary
   */
  private async getIssuesSummary(leaseId: string): Promise<CertificationReport['issuesSummary']> {
    const issuesQuery = await this.adminDb
      .collection(this.COLLECTIONS.ISSUES)
      .where('affectedResources', 'array-contains', leaseId)
      .get();

    const issues = issuesQuery.docs.map((doc: any) => doc.data() as CertificationIssue);

    const summary = {
      total: issues.length,
      bySeverity: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      resolved: 0,
      autoFixed: 0,
    };

    for (const issue of issues) {
      // Count by severity
      summary.bySeverity[issue.severity] = (summary.bySeverity[issue.severity] || 0) + 1;

      // Count by category
      summary.byCategory[issue.category] = (summary.byCategory[issue.category] || 0) + 1;

      // Count resolved
      if (issue.status === 'resolved' || issue.status === 'verified') {
        summary.resolved++;
      }

      // Count auto-fixed
      if (issue.autoFixApplied) {
        summary.autoFixed++;
      }
    }

    return summary;
  }

  /**
   * Get compliance status
   */
  private async getComplianceStatus(
    _leaseId: string,
    scores: CertificationScore
  ): Promise<CertificationReport['complianceStatus']> {
    const violations = [];

    // Check SOX compliance
    if (scores.accuracy < 95) {
      violations.push({
        regulation: 'SOX',
        description: 'Financial reporting accuracy below required threshold',
        severity: 'high',
      });
    }

    // Check data privacy compliance
    if (scores.security < 90) {
      violations.push({
        regulation: 'Data Privacy',
        description: 'Security controls do not meet minimum requirements',
        severity: 'critical',
      });
    }

    // Check operational compliance
    if (scores.integrity < 85) {
      violations.push({
        regulation: 'Operational Standards',
        description: 'Data integrity issues detected',
        severity: 'medium',
      });
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    scores: CertificationScore,
    issuesSummary: CertificationReport['issuesSummary']
  ): CertificationReport['recommendations'] {
    const recommendations = [];

    // Score-based recommendations
    if (scores.security < 80) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Security',
        recommendation: 'Implement additional security controls and monitoring',
        impact: 'Improve security score by 15-20 points',
      });
    }

    if (scores.integrity < 85) {
      recommendations.push({
        priority: 'medium' as const,
        category: 'Integrity',
        recommendation: 'Enable data validation and consistency checks',
        impact: 'Reduce data integrity issues by 50%',
      });
    }

    // Issue-based recommendations
    if (issuesSummary.bySeverity.critical > 0) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Issue Resolution',
        recommendation: 'Address critical issues immediately',
        impact: 'Prevent potential compliance violations',
      });
    }

    if (issuesSummary.autoFixed < issuesSummary.total * 0.5) {
      recommendations.push({
        priority: 'medium' as const,
        category: 'Automation',
        recommendation: 'Expand auto-fix capabilities for common issues',
        impact: 'Reduce manual intervention by 40%',
      });
    }

    // Clause-specific recommendations
    const highRiskCount = issuesSummary.bySeverity.high || 0;
    if (highRiskCount > 3) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Risk Management',
        recommendation: 'Conduct comprehensive risk assessment and mitigation planning',
        impact: 'Reduce high-risk issues by 60%',
      });
    }

    // Trend-based recommendations
    if (scores.trend === 'declining') {
      recommendations.push({
        priority: 'high' as const,
        category: 'Trend Reversal',
        recommendation: 'Implement immediate corrective actions to reverse declining trend',
        impact: 'Stabilize and improve certification scores',
      });
    }

    return recommendations;
  }

  /**
   * Get historical trends
   */
  private async getTrends(leaseId: string): Promise<CertificationReport['trends']> {
    // Get score history
    const reportsQuery = await this.adminDb
      .collection(this.COLLECTIONS.REPORTS)
      .where('leaseId', '==', leaseId)
      .orderBy('reportDate', 'desc')
      .limit(30)
      .get();

    const reports = reportsQuery.docs.map((doc: any) => doc.data() as CertificationReport);

    const scoreHistory = reports.map((report: CertificationReport) => ({
      date: report.reportDate,
      scores: report.scores,
    }));

    const issueHistory = reports.map((report: CertificationReport) => ({
      date: report.reportDate,
      count: report.issuesSummary.total,
      resolved: report.issuesSummary.resolved,
    }));

    return {
      scoreHistory,
      issueHistory,
    };
  }
}

export const certificationService = new CertificationService();