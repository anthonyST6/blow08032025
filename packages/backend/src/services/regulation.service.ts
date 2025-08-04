import { VerticalModel } from '../models';
import { logger } from '../utils/logger';

export interface RegulationCheck {
  regulation: string;
  status: 'compliant' | 'non-compliant' | 'warning' | 'not-applicable';
  details: string;
  recommendations?: string[];
  evidence?: string[];
}

export interface ComplianceReport {
  verticalId: string;
  useCaseId: string;
  executionId: string;
  overallCompliance: 'compliant' | 'non-compliant' | 'partial';
  checks: RegulationCheck[];
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class RegulationService {
  private regulationRules: Map<string, RegulationRule[]> = new Map();

  constructor() {
    this.initializeRegulationRules();
  }

  /**
   * Check compliance for a use case execution
   */
  async checkCompliance(
    verticalId: string,
    useCaseId: string,
    executionId: string,
    executionResults: Record<string, any>
  ): Promise<ComplianceReport> {
    const vertical = await VerticalModel.findById(verticalId);
    if (!vertical) {
      throw new Error('Vertical not found');
    }

    const checks: RegulationCheck[] = [];
    
    // Check each regulation for the vertical
    for (const regulation of vertical.regulations) {
      const check = await this.checkRegulation(
        regulation,
        verticalId,
        executionResults
      );
      checks.push(check);
    }

    // Determine overall compliance
    const nonCompliantCount = checks.filter(c => c.status === 'non-compliant').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;
    
    let overallCompliance: 'compliant' | 'non-compliant' | 'partial';
    if (nonCompliantCount > 0) {
      overallCompliance = 'non-compliant';
    } else if (warningCount > 0) {
      overallCompliance = 'partial';
    } else {
      overallCompliance = 'compliant';
    }

    const report: ComplianceReport = {
      verticalId,
      useCaseId,
      executionId,
      overallCompliance,
      checks,
      timestamp: new Date(),
      metadata: {
        totalChecks: checks.length,
        compliantChecks: checks.filter(c => c.status === 'compliant').length,
        nonCompliantChecks: nonCompliantCount,
        warningChecks: warningCount
      }
    };

    logger.info('Compliance check completed', {
      verticalId,
      useCaseId,
      executionId,
      overallCompliance
    });

    return report;
  }

  /**
   * Check a specific regulation
   */
  private async checkRegulation(
    regulation: string,
    verticalId: string,
    executionResults: Record<string, any>
  ): Promise<RegulationCheck> {
    const rules = this.regulationRules.get(regulation) || [];
    
    let status: RegulationCheck['status'] = 'compliant';
    const details: string[] = [];
    const recommendations: string[] = [];
    const evidence: string[] = [];

    for (const rule of rules) {
      if (rule.appliesTo.includes(verticalId)) {
        const ruleResult = rule.check(executionResults);
        
        if (ruleResult.status === 'non-compliant') {
          status = 'non-compliant';
        } else if (ruleResult.status === 'warning' && status === 'compliant') {
          status = 'warning';
        }

        details.push(ruleResult.detail);
        if (ruleResult.recommendation) {
          recommendations.push(ruleResult.recommendation);
        }
        if (ruleResult.evidence) {
          evidence.push(...ruleResult.evidence);
        }
      }
    }

    return {
      regulation,
      status,
      details: details.join('; '),
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      evidence: evidence.length > 0 ? evidence : undefined
    };
  }

  /**
   * Initialize regulation rules
   */
  private initializeRegulationRules() {
    // HIPAA Rules
    this.regulationRules.set('HIPAA', [
      {
        id: 'hipaa-encryption',
        name: 'Data Encryption',
        appliesTo: ['healthcare'],
        check: (results: any) => {
          const encryptionScore = results['security-sentinel']?.encryptionScore || 0;
          if (encryptionScore < 90) {
            return {
              status: 'non-compliant',
              detail: 'Insufficient encryption for PHI data',
              recommendation: 'Implement AES-256 encryption for all PHI data at rest and in transit',
              evidence: [`Encryption score: ${encryptionScore}%`]
            };
          }
          return {
            status: 'compliant',
            detail: 'PHI data encryption meets HIPAA requirements'
          };
        }
      },
      {
        id: 'hipaa-access-control',
        name: 'Access Control',
        appliesTo: ['healthcare'],
        check: (results: any) => {
          const accessControlScore = results['security-sentinel']?.accessControlScore || 0;
          if (accessControlScore < 85) {
            return {
              status: 'warning',
              detail: 'Access control measures need improvement',
              recommendation: 'Implement role-based access control with audit logging'
            };
          }
          return {
            status: 'compliant',
            detail: 'Access control meets HIPAA requirements'
          };
        }
      }
    ]);

    // GDPR Rules
    this.regulationRules.set('GDPR', [
      {
        id: 'gdpr-consent',
        name: 'Data Consent',
        appliesTo: ['healthcare', 'finance', 'retail', 'education'],
        check: (results: any) => {
          const consentTracking = results['integrity-auditor']?.consentTracking || false;
          if (!consentTracking) {
            return {
              status: 'non-compliant',
              detail: 'No consent tracking mechanism detected',
              recommendation: 'Implement explicit consent tracking for all personal data processing'
            };
          }
          return {
            status: 'compliant',
            detail: 'Consent tracking is properly implemented'
          };
        }
      },
      {
        id: 'gdpr-data-minimization',
        name: 'Data Minimization',
        appliesTo: ['healthcare', 'finance', 'retail', 'education'],
        check: (results: any) => {
          const dataMinimization = results['integrity-auditor']?.dataMinimizationScore || 0;
          if (dataMinimization < 80) {
            return {
              status: 'warning',
              detail: 'Excessive data collection detected',
              recommendation: 'Review and minimize data collection to necessary fields only'
            };
          }
          return {
            status: 'compliant',
            detail: 'Data collection follows minimization principles'
          };
        }
      }
    ]);

    // SOX Rules
    this.regulationRules.set('SOX', [
      {
        id: 'sox-audit-trail',
        name: 'Audit Trail',
        appliesTo: ['finance'],
        check: (results: any) => {
          const auditTrailComplete = results['integrity-auditor']?.auditTrailComplete || false;
          if (!auditTrailComplete) {
            return {
              status: 'non-compliant',
              detail: 'Incomplete audit trail for financial transactions',
              recommendation: 'Implement comprehensive audit logging for all financial operations'
            };
          }
          return {
            status: 'compliant',
            detail: 'Complete audit trail maintained'
          };
        }
      }
    ]);

    // NERC CIP Rules
    this.regulationRules.set('NERC CIP', [
      {
        id: 'nerc-cip-cyber-security',
        name: 'Cyber Security Management',
        appliesTo: ['energy'],
        check: (results: any) => {
          const cyberSecurityScore = results['security-sentinel']?.overallScore || 0;
          if (cyberSecurityScore < 90) {
            return {
              status: 'non-compliant',
              detail: 'Cyber security controls do not meet NERC CIP requirements',
              recommendation: 'Enhance security controls for critical infrastructure',
              evidence: [`Security score: ${cyberSecurityScore}%`]
            };
          }
          return {
            status: 'compliant',
            detail: 'Cyber security meets NERC CIP standards'
          };
        }
      },
      {
        id: 'nerc-cip-incident-response',
        name: 'Incident Response',
        appliesTo: ['energy'],
        check: (results: any) => {
          const incidentResponsePlan = results['security-sentinel']?.incidentResponsePlan || false;
          if (!incidentResponsePlan) {
            return {
              status: 'warning',
              detail: 'Incident response plan not fully implemented',
              recommendation: 'Develop and test comprehensive incident response procedures'
            };
          }
          return {
            status: 'compliant',
            detail: 'Incident response capabilities are in place'
          };
        }
      }
    ]);

    // PCI DSS Rules
    this.regulationRules.set('PCI DSS', [
      {
        id: 'pci-dss-card-data',
        name: 'Cardholder Data Protection',
        appliesTo: ['finance', 'retail'],
        check: (results: any) => {
          const cardDataProtection = results['security-sentinel']?.cardDataProtection || 0;
          if (cardDataProtection < 95) {
            return {
              status: 'non-compliant',
              detail: 'Insufficient protection for cardholder data',
              recommendation: 'Implement tokenization and encryption for all card data'
            };
          }
          return {
            status: 'compliant',
            detail: 'Cardholder data protection meets PCI DSS requirements'
          };
        }
      }
    ]);

    // Add more regulation rules as needed
  }

  /**
   * Generate compliance documentation
   */
  async generateComplianceDocumentation(
    report: ComplianceReport
  ): Promise<string> {
    const vertical = await VerticalModel.findById(report.verticalId);
    
    let documentation = `# Compliance Report\n\n`;
    documentation += `**Vertical:** ${vertical?.name || report.verticalId}\n`;
    documentation += `**Use Case ID:** ${report.useCaseId}\n`;
    documentation += `**Execution ID:** ${report.executionId}\n`;
    documentation += `**Date:** ${report.timestamp.toISOString()}\n`;
    documentation += `**Overall Compliance:** ${report.overallCompliance.toUpperCase()}\n\n`;
    
    documentation += `## Summary\n`;
    documentation += `- Total Checks: ${report.metadata?.totalChecks || 0}\n`;
    documentation += `- Compliant: ${report.metadata?.compliantChecks || 0}\n`;
    documentation += `- Non-Compliant: ${report.metadata?.nonCompliantChecks || 0}\n`;
    documentation += `- Warnings: ${report.metadata?.warningChecks || 0}\n\n`;
    
    documentation += `## Detailed Findings\n\n`;
    
    for (const check of report.checks) {
      documentation += `### ${check.regulation}\n`;
      documentation += `**Status:** ${check.status.toUpperCase()}\n`;
      documentation += `**Details:** ${check.details}\n`;
      
      if (check.recommendations && check.recommendations.length > 0) {
        documentation += `**Recommendations:**\n`;
        check.recommendations.forEach(rec => {
          documentation += `- ${rec}\n`;
        });
      }
      
      if (check.evidence && check.evidence.length > 0) {
        documentation += `**Evidence:**\n`;
        check.evidence.forEach(ev => {
          documentation += `- ${ev}\n`;
        });
      }
      
      documentation += `\n`;
    }
    
    return documentation;
  }
}

interface RegulationRule {
  id: string;
  name: string;
  appliesTo: string[];
  check: (results: any) => {
    status: 'compliant' | 'non-compliant' | 'warning';
    detail: string;
    recommendation?: string;
    evidence?: string[];
  };
}

// Export singleton instance
export const regulationService = new RegulationService();