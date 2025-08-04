import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { LLMOutput } from '../agents/base.agent';
import { SecuritySentinelInput, SecuritySentinelOutput, securitySentinel } from './security-sentinel';
import { IntegrityAuditorInput, IntegrityAuditorOutput, integrityAuditor } from './integrity-auditor';
import { AccuracyEngineInput, AccuracyEngineOutput, accuracyEngine } from './accuracy-engine';

export interface VanguardContext {
  vertical: string;
  useCase: string;
  regulations?: string[];
  thresholds?: Record<string, { min?: number; max?: number }>;
}

export interface VanguardSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'processing' | 'completed' | 'failed';
  context: VanguardContext;
  results: {
    security?: SecuritySentinelOutput;
    integrity?: IntegrityAuditorOutput;
    accuracy?: AccuracyEngineOutput;
  };
  aggregatedScore?: number;
  aggregatedReport?: VanguardReport;
}

export interface VanguardReport {
  sessionId: string;
  timestamp: Date;
  vertical: string;
  useCase: string;
  overallScore: number;
  status: 'pass' | 'fail' | 'warning';
  scores: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  criticalIssues: Array<{
    source: 'security' | 'integrity' | 'accuracy';
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation?: string;
  }>;
  summary: {
    totalFlags: number;
    criticalFlags: number;
    highFlags: number;
    mediumFlags: number;
    lowFlags: number;
  };
  recommendations: string[];
  exportData: {
    json: any;
    pdf?: Buffer;
  };
}

export interface OrchestratorConfig {
  passingScore: number;
  warningScore: number;
  weights: {
    security: number;
    integrity: number;
    accuracy: number;
  };
}

export class VanguardOrchestrator {
  private sessions: Map<string, VanguardSession> = new Map();
  private config: OrchestratorConfig;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      passingScore: 80,
      warningScore: 60,
      weights: {
        security: 0.4,
        integrity: 0.3,
        accuracy: 0.3,
      },
      ...config,
    };
  }

  /**
   * Execute the full Vanguard pipeline
   * Flow: Security Sentinel → Integrity Auditor → Accuracy Engine → Report
   */
  async executeWorkflow(
    input: LLMOutput,
    context: VanguardContext,
    documentMetadata?: any,
    externalDataSources?: any[],
    referenceData?: any
  ): Promise<VanguardReport> {
    const sessionId = uuidv4();
    const session: VanguardSession = {
      id: sessionId,
      startTime: new Date(),
      status: 'processing',
      context,
      results: {},
    };

    this.sessions.set(sessionId, session);

    try {
      logger.info('Starting Vanguard orchestration', {
        sessionId,
        vertical: context.vertical,
        useCase: context.useCase,
      });

      // Step 1: Security Sentinel
      logger.info('Executing Security Sentinel', { sessionId });
      const securityInput: SecuritySentinelInput = {
        ...input,
        documentMetadata,
        verticalContext: context,
      };
      const securityResult = await securitySentinel.analyze(securityInput);
      session.results.security = securityResult;
      
      // Check if security failed critically
      if (securityResult.securityScore < 20) {
        logger.warn('Critical security failure, halting workflow', {
          sessionId,
          securityScore: securityResult.securityScore,
        });
        return this.buildReport(session, 'Security check failed critically');
      }

      // Step 2: Integrity Auditor
      logger.info('Executing Integrity Auditor', { sessionId });
      const integrityInput: IntegrityAuditorInput = {
        ...input,
        securityCheckResults: securityResult,
        verticalContext: context,
        externalDataSources,
      };
      const integrityResult = await integrityAuditor.analyze(integrityInput);
      session.results.integrity = integrityResult;

      // Check if integrity failed critically
      if (integrityResult.integrityScore < 20) {
        logger.warn('Critical integrity failure, halting workflow', {
          sessionId,
          integrityScore: integrityResult.integrityScore,
        });
        return this.buildReport(session, 'Integrity check failed critically');
      }

      // Step 3: Accuracy Engine
      logger.info('Executing Accuracy Engine', { sessionId });
      const accuracyInput: AccuracyEngineInput = {
        ...input,
        integrityCheckResults: integrityResult,
        securityCheckResults: securityResult,
        verticalContext: context,
        referenceData,
      };
      const accuracyResult = await accuracyEngine.analyze(accuracyInput);
      session.results.accuracy = accuracyResult;

      // Update session status
      session.status = 'completed';
      session.endTime = new Date();

      // Build final report
      const report = this.buildReport(session);
      session.aggregatedReport = report;
      session.aggregatedScore = report.overallScore;

      logger.info('Vanguard orchestration completed', {
        sessionId,
        overallScore: report.overallScore,
        status: report.status,
        processingTime: session.endTime.getTime() - session.startTime.getTime(),
      });

      return report;
    } catch (error) {
      logger.error('Vanguard orchestration failed', { sessionId, error });
      session.status = 'failed';
      session.endTime = new Date();
      throw error;
    }
  }

  /**
   * Build the final aggregated report
   */
  private buildReport(session: VanguardSession, earlyTerminationReason?: string): VanguardReport {
    const { security, integrity, accuracy } = session.results;
    
    // Calculate scores with defaults for missing results
    const scores = {
      security: security?.securityScore || 0,
      integrity: integrity?.integrityScore || 0,
      accuracy: accuracy?.accuracyScore || 0,
    };

    // Calculate weighted overall score
    const overallScore = Math.round(
      scores.security * this.config.weights.security +
      scores.integrity * this.config.weights.integrity +
      scores.accuracy * this.config.weights.accuracy
    );

    // Determine status
    const status = overallScore >= this.config.passingScore ? 'pass' :
                  overallScore >= this.config.warningScore ? 'warning' : 'fail';

    // Aggregate critical issues
    const criticalIssues = this.aggregateCriticalIssues(session);

    // Calculate flag summary
    const summary = this.calculateFlagSummary(session);

    // Generate recommendations
    const recommendations = this.generateRecommendations(session, overallScore, earlyTerminationReason);

    // Prepare export data
    const exportData = this.prepareExportData(session, overallScore, status);

    return {
      sessionId: session.id,
      timestamp: new Date(),
      vertical: session.context.vertical,
      useCase: session.context.useCase,
      overallScore,
      status,
      scores,
      criticalIssues,
      summary,
      recommendations,
      exportData,
    };
  }

  /**
   * Aggregate critical issues from all Vanguard results
   */
  private aggregateCriticalIssues(session: VanguardSession): VanguardReport['criticalIssues'] {
    const issues: VanguardReport['criticalIssues'] = [];

    // Security issues
    if (session.results.security) {
      for (const flag of session.results.security.flags) {
        if (flag.severity === 'critical' || flag.severity === 'high') {
          issues.push({
            source: 'security',
            type: flag.type,
            severity: flag.severity,
            description: flag.message,
            recommendation: session.results.security.securityRecommendations.find(
              r => r.toLowerCase().includes(flag.type.replace('_', ' '))
            ),
          });
        }
      }
    }

    // Integrity issues
    if (session.results.integrity) {
      for (const flag of session.results.integrity.flags) {
        if (flag.severity === 'critical' || flag.severity === 'high') {
          issues.push({
            source: 'integrity',
            type: flag.type,
            severity: flag.severity,
            description: flag.message,
            recommendation: this.getIntegrityRecommendation(flag.type),
          });
        }
      }
    }

    // Accuracy issues
    if (session.results.accuracy) {
      for (const flag of session.results.accuracy.flags) {
        if (flag.severity === 'critical' || flag.severity === 'high') {
          issues.push({
            source: 'accuracy',
            type: flag.type,
            severity: flag.severity,
            description: flag.message,
            recommendation: this.getAccuracyRecommendation(flag.type),
          });
        }
      }
    }

    // Sort by severity
    return issues.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Calculate flag summary across all Vanguards
   */
  private calculateFlagSummary(session: VanguardSession): VanguardReport['summary'] {
    let totalFlags = 0;
    let criticalFlags = 0;
    let highFlags = 0;
    let mediumFlags = 0;
    let lowFlags = 0;

    const allFlags = [
      ...(session.results.security?.flags || []),
      ...(session.results.integrity?.flags || []),
      ...(session.results.accuracy?.flags || []),
    ];

    for (const flag of allFlags) {
      totalFlags++;
      switch (flag.severity) {
        case 'critical':
          criticalFlags++;
          break;
        case 'high':
          highFlags++;
          break;
        case 'medium':
          mediumFlags++;
          break;
        case 'low':
          lowFlags++;
          break;
      }
    }

    return {
      totalFlags,
      criticalFlags,
      highFlags,
      mediumFlags,
      lowFlags,
    };
  }

  /**
   * Generate overall recommendations
   */
  private generateRecommendations(
    session: VanguardSession,
    overallScore: number,
    earlyTerminationReason?: string
  ): string[] {
    const recommendations: string[] = [];

    if (earlyTerminationReason) {
      recommendations.push(`CRITICAL: ${earlyTerminationReason}. Address this before proceeding.`);
    }

    // Overall score recommendations
    if (overallScore < 50) {
      recommendations.push('Comprehensive review required across all security, integrity, and accuracy dimensions');
    } else if (overallScore < 70) {
      recommendations.push('Multiple issues detected that require attention before deployment');
    } else if (overallScore < 85) {
      recommendations.push('Minor improvements needed to meet best practices');
    }

    // Add specific Vanguard recommendations
    if (session.results.security) {
      recommendations.push(...session.results.security.securityRecommendations.slice(0, 2));
    }

    if (session.results.integrity) {
      const integrityRecs = this.generateIntegrityRecommendations(session.results.integrity);
      recommendations.push(...integrityRecs.slice(0, 2));
    }

    if (session.results.accuracy) {
      const accuracyRecs = this.generateAccuracyRecommendations(session.results.accuracy);
      recommendations.push(...accuracyRecs.slice(0, 2));
    }

    // Vertical-specific recommendations
    const verticalRecs = this.getVerticalSpecificRecommendations(session.context.vertical, overallScore);
    recommendations.push(...verticalRecs);

    // Remove duplicates and limit to top 10
    return [...new Set(recommendations)].slice(0, 10);
  }

  /**
   * Prepare data for export (JSON and PDF placeholder)
   */
  private prepareExportData(
    session: VanguardSession,
    overallScore: number,
    status: 'pass' | 'fail' | 'warning'
  ): VanguardReport['exportData'] {
    const json = {
      sessionId: session.id,
      timestamp: new Date().toISOString(),
      vertical: session.context.vertical,
      useCase: session.context.useCase,
      overallScore,
      status,
      scores: {
        security: session.results.security?.securityScore || 0,
        integrity: session.results.integrity?.integrityScore || 0,
        accuracy: session.results.accuracy?.accuracyScore || 0,
      },
      processingTime: session.endTime ? 
        session.endTime.getTime() - session.startTime.getTime() : 0,
      detailedResults: {
        security: session.results.security ? {
          score: session.results.security.securityScore,
          flags: session.results.security.flags,
          flaggedDocuments: session.results.security.flaggedDocuments,
          recommendations: session.results.security.securityRecommendations,
          checkResults: session.results.security.checkResults,
        } : null,
        integrity: session.results.integrity ? {
          score: session.results.integrity.integrityScore,
          flags: session.results.integrity.flags,
          discrepancies: session.results.integrity.discrepanciesFound,
          complianceIssues: session.results.integrity.complianceIssues,
          checkResults: session.results.integrity.checkResults,
        } : null,
        accuracy: session.results.accuracy ? {
          score: session.results.accuracy.accuracyScore,
          flags: session.results.accuracy.flags,
          errorsCorrected: session.results.accuracy.errorsCorrected,
          criticalDeadlines: session.results.accuracy.criticalDeadlines,
          checkResults: session.results.accuracy.checkResults,
        } : null,
      },
    };

    // PDF generation would be implemented here
    // For now, we'll just return the JSON data
    return {
      json,
      pdf: undefined, // Placeholder for PDF generation
    };
  }

  /**
   * Get recommendation for integrity flag type
   */
  private getIntegrityRecommendation(flagType: string): string {
    const recommendations: Record<string, string> = {
      'data_consistency': 'Review and correct data inconsistencies before processing',
      'cross_validation': 'Verify data against additional external sources',
      'regulatory_compliance': 'Ensure all regulatory requirements are met and documented',
      'anomaly_detection': 'Investigate detected anomalies and validate data accuracy',
    };
    return recommendations[flagType] || 'Review and address integrity issues';
  }

  /**
   * Get recommendation for accuracy flag type
   */
  private getAccuracyRecommendation(flagType: string): string {
    const recommendations: Record<string, string> = {
      'mathematical_accuracy': 'Verify and correct all calculations',
      'date_accuracy': 'Validate all dates and update invalid entries',
      'deadline_accuracy': 'Address overdue deadlines immediately',
      'threshold_accuracy': 'Review values exceeding defined thresholds',
      'precision_accuracy': 'Ensure appropriate precision for all numeric values',
    };
    return recommendations[flagType] || 'Review and correct accuracy issues';
  }

  /**
   * Generate integrity-specific recommendations
   */
  private generateIntegrityRecommendations(result: IntegrityAuditorOutput): string[] {
    const recommendations: string[] = [];

    if (result.discrepanciesFound.length > 0) {
      recommendations.push(`Resolve ${result.discrepanciesFound.length} data discrepancies identified`);
    }

    if (result.complianceIssues.length > 0) {
      recommendations.push(`Address ${result.complianceIssues.length} compliance issues before proceeding`);
    }

    if (!result.checkResults.regulatoryCompliance.compliant) {
      recommendations.push('Achieve full regulatory compliance before deployment');
    }

    return recommendations;
  }

  /**
   * Generate accuracy-specific recommendations
   */
  private generateAccuracyRecommendations(result: AccuracyEngineOutput): string[] {
    const recommendations: string[] = [];

    if (result.errorsCorrected.length > 0) {
      recommendations.push(`Review and validate ${result.errorsCorrected.length} corrected errors`);
    }

    const overdueDeadlines = result.criticalDeadlines.filter(d => d.status === 'overdue');
    if (overdueDeadlines.length > 0) {
      recommendations.push(`Address ${overdueDeadlines.length} overdue deadline(s) immediately`);
    }

    const urgentDeadlines = result.criticalDeadlines.filter(d => d.status === 'urgent');
    if (urgentDeadlines.length > 0) {
      recommendations.push(`Prioritize ${urgentDeadlines.length} urgent deadline(s) within 7 days`);
    }

    return recommendations;
  }

  /**
   * Get vertical-specific recommendations
   */
  private getVerticalSpecificRecommendations(vertical: string, score: number): string[] {
    const recommendations: string[] = [];

    switch (vertical.toLowerCase()) {
      case 'energy':
        if (score < 80) {
          recommendations.push('Ensure all lease terms and mineral rights are accurately documented');
          recommendations.push('Verify environmental compliance requirements are met');
        }
        break;
      
      case 'government':
        if (score < 85) {
          recommendations.push('Confirm all procurement regulations are followed');
          recommendations.push('Validate contractor eligibility and certifications');
        }
        break;
      
      case 'insurance':
        if (score < 80) {
          recommendations.push('Verify all policy terms and coverage limits');
          recommendations.push('Ensure actuarial calculations are accurate');
        }
        break;
      
      case 'healthcare':
        if (score < 90) {
          recommendations.push('Ensure HIPAA compliance for all patient data');
          recommendations.push('Validate medical coding accuracy');
        }
        break;
      
      case 'finance':
        if (score < 85) {
          recommendations.push('Confirm SOX compliance for financial reporting');
          recommendations.push('Verify all transaction calculations');
        }
        break;
    }

    return recommendations;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): VanguardSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): VanguardSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Clear completed sessions older than specified hours
   */
  cleanupSessions(hoursOld: number = 24): number {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursOld);
    
    let cleaned = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (session.endTime && session.endTime < cutoffTime) {
        this.sessions.delete(id);
        cleaned++;
      }
    }
    
    logger.info(`Cleaned up ${cleaned} old sessions`);
    return cleaned;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Orchestrator configuration updated', { config: this.config });
  }

  /**
   * Get current configuration
   */
  getConfig(): OrchestratorConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const vanguardOrchestrator = new VanguardOrchestrator();