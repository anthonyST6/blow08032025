import { BaseDomainAgent } from './base.domain-agent';
import { logger } from '../utils/logger';

export interface GovernmentDomainInput {
  documentType: 'contract' | 'rfp' | 'grant' | 'compliance' | 'policy' | 'report';
  content: string;
  metadata?: {
    agency?: string;
    contractNumber?: string;
    solicitation?: string;
    naicsCode?: string;
    setAsideType?: string;
    contractValue?: number;
    performancePeriod?: {
      start: Date;
      end: Date;
    };
  };
  context?: {
    contractType?: 'fixed-price' | 'cost-reimbursement' | 'time-materials' | 'idiq';
    securityClearance?: 'none' | 'public-trust' | 'secret' | 'top-secret';
    socioeconomicStatus?: string[];
    pastPerformance?: boolean;
  };
}

export interface GovernmentDomainOutput {
  analysis: {
    documentValidity: boolean;
    complianceStatus: {
      far: boolean; // Federal Acquisition Regulation
      dfars?: boolean; // Defense Federal Acquisition Regulation Supplement
      stateLocal?: boolean;
      issues: string[];
    };
    contractTerms: {
      deliverables?: Array<{
        description: string;
        dueDate?: Date;
        acceptanceCriteria?: string;
      }>;
      paymentTerms?: string;
      keyPersonnel?: string[];
      performanceMetrics?: string[];
    };
    requiredCertifications: string[];
    setAsideEligibility: {
      eligible: boolean;
      types: string[];
      requirements: string[];
    };
    risks: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      mitigation?: string;
    }>;
  };
  recommendations: string[];
  competitiveAnalysis?: {
    incumbentAdvantage?: boolean;
    requiredCapabilities?: string[];
    evaluationCriteria?: Array<{
      factor: string;
      weight?: number;
      subfactors?: string[];
    }>;
  };
}

export class GovernmentDomainAgent extends BaseDomainAgent<GovernmentDomainInput, GovernmentDomainOutput> {
  constructor() {
    super({
      id: 'government-domain-agent',
      name: 'Government Domain Agent',
      description: 'Specialized agent for government contract and compliance analysis',
      version: '1.0.0',
      capabilities: [
        'contract-analysis',
        'rfp-evaluation',
        'compliance-checking',
        'far-dfars-validation',
        'set-aside-eligibility',
        'risk-assessment',
      ],
    });
  }

  async process(input: GovernmentDomainInput): Promise<GovernmentDomainOutput> {
    const startTime = Date.now();
    logger.info('Government domain analysis started', {
      documentType: input.documentType,
      agency: input.metadata?.agency,
      hasContext: !!input.context,
    });

    try {
      // Check compliance status
      const complianceStatus = await this.checkCompliance(input);
      
      // Extract contract terms
      const contractTerms = await this.extractContractTerms(input);
      
      // Identify required certifications
      const requiredCertifications = await this.identifyRequiredCertifications(input);
      
      // Check set-aside eligibility
      const setAsideEligibility = await this.checkSetAsideEligibility(input);
      
      // Assess risks
      const risks = await this.assessRisks(input, complianceStatus);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        input,
        complianceStatus,
        risks,
        setAsideEligibility
      );
      
      // Perform competitive analysis if applicable
      const competitiveAnalysis = input.documentType === 'rfp' 
        ? await this.performCompetitiveAnalysis(input)
        : undefined;

      const output: GovernmentDomainOutput = {
        analysis: {
          documentValidity: this.validateDocument(input),
          complianceStatus,
          contractTerms,
          requiredCertifications,
          setAsideEligibility,
          risks,
        },
        recommendations,
        competitiveAnalysis,
      };

      logger.info('Government domain analysis completed', {
        processingTime: Date.now() - startTime,
        complianceIssues: complianceStatus.issues.length,
        risksIdentified: risks.length,
      });

      return output;
    } catch (error) {
      logger.error('Government domain analysis failed', { error });
      throw error;
    }
  }

  /**
   * Check compliance with regulations
   */
  private async checkCompliance(
    input: GovernmentDomainInput
  ): Promise<{
    far: boolean;
    dfars?: boolean;
    stateLocal?: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    let farCompliant = true;
    let dfarsCompliant = true;
    let stateLocalCompliant = true;

    const content = input.content.toLowerCase();

    // FAR compliance checks
    const farRequirements = [
      { pattern: /termination\s+for\s+convenience/i, message: 'Missing Termination for Convenience clause (FAR 52.249)' },
      { pattern: /changes\s+clause/i, message: 'Missing Changes clause (FAR 52.243)' },
      { pattern: /disputes/i, message: 'Missing Disputes clause (FAR 52.233)' },
      { pattern: /payment/i, message: 'Missing Payment provisions (FAR 52.232)' },
    ];

    for (const req of farRequirements) {
      if (!content.match(req.pattern)) {
        issues.push(req.message);
        farCompliant = false;
      }
    }

    // DFARS compliance checks (if applicable)
    if (input.metadata?.agency?.toLowerCase().includes('defense') || 
        input.metadata?.agency?.toLowerCase().includes('dod')) {
      const dfarsRequirements = [
        { pattern: /cybersecurity/i, message: 'Missing Cybersecurity requirements (DFARS 252.204-7012)' },
        { pattern: /controlled\s+unclassified/i, message: 'Missing CUI handling requirements (DFARS 252.204-7012)' },
      ];

      for (const req of dfarsRequirements) {
        if (!content.match(req.pattern)) {
          issues.push(req.message);
          dfarsCompliant = false;
        }
      }
    }

    // State/Local compliance checks
    if (!content.match(/prevailing\s+wage/i) && input.documentType === 'contract') {
      issues.push('Missing prevailing wage requirements (state/local)');
      stateLocalCompliant = false;
    }

    return {
      far: farCompliant,
      dfars: dfarsCompliant,
      stateLocal: stateLocalCompliant,
      issues,
    };
  }

  /**
   * Extract contract terms
   */
  private async extractContractTerms(
    input: GovernmentDomainInput
  ): Promise<{
    deliverables?: Array<{
      description: string;
      dueDate?: Date;
      acceptanceCriteria?: string;
    }>;
    paymentTerms?: string;
    keyPersonnel?: string[];
    performanceMetrics?: string[];
  }> {
    const terms: any = {};
    const content = input.content;

    // Extract deliverables
    const deliverablesMatch = content.match(/deliverables?[:\s]+([^\.]+)/gi);
    if (deliverablesMatch) {
      terms.deliverables = deliverablesMatch.map(match => ({
        description: match.replace(/deliverables?[:\s]+/i, '').trim(),
      }));
    }

    // Extract payment terms
    const paymentMatch = content.match(/payment\s+terms?[:\s]+([^\.]+)/i);
    if (paymentMatch) {
      terms.paymentTerms = paymentMatch[1].trim();
    }

    // Extract key personnel requirements
    const personnelMatch = content.match(/key\s+personnel[:\s]+([^\.]+)/i);
    if (personnelMatch) {
      terms.keyPersonnel = personnelMatch[1]
        .split(/[,;]/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
    }

    // Extract performance metrics
    const metricsMatch = content.match(/performance\s+metrics?[:\s]+([^\.]+)/i);
    if (metricsMatch) {
      terms.performanceMetrics = metricsMatch[1]
        .split(/[,;]/)
        .map(m => m.trim())
        .filter(m => m.length > 0);
    }

    return terms;
  }

  /**
   * Identify required certifications
   */
  private async identifyRequiredCertifications(
    input: GovernmentDomainInput
  ): Promise<string[]> {
    const certifications: Set<string> = new Set();
    const content = input.content.toLowerCase();

    // Common government certifications
    const certPatterns = {
      'ISO 9001': /iso\s*9001/i,
      'CMMI Level 3+': /cmmi\s*(level\s*)?(3|4|5)/i,
      'Top Secret Clearance': /top\s*secret/i,
      'Secret Clearance': /secret\s*clearance/i,
      'DCAA Compliant Accounting': /dcaa/i,
      'SAM Registration': /sam\s*(registration|registered)/i,
      'Small Business Certification': /small\s*business/i,
      '8(a) Certification': /8\s*\(\s*a\s*\)/i,
      'HUBZone Certification': /hubzone/i,
      'SDVOSB Certification': /sdvosb|service.?disabled/i,
      'WOSB Certification': /wosb|women.?owned/i,
    };

    for (const [cert, pattern] of Object.entries(certPatterns)) {
      if (content.match(pattern)) {
        certifications.add(cert);
      }
    }

    // Add security clearance based on context
    if (input.context?.securityClearance && input.context.securityClearance !== 'none') {
      certifications.add(`${input.context.securityClearance} clearance required`);
    }

    return Array.from(certifications);
  }

  /**
   * Check set-aside eligibility
   */
  private async checkSetAsideEligibility(
    input: GovernmentDomainInput
  ): Promise<{
    eligible: boolean;
    types: string[];
    requirements: string[];
  }> {
    const eligibleTypes: string[] = [];
    const requirements: string[] = [];
    const content = input.content.toLowerCase();

    // Check for set-aside mentions
    const setAsidePatterns = {
      'Small Business': /small\s*business\s*set.?aside/i,
      '8(a)': /8\s*\(\s*a\s*\)\s*set.?aside/i,
      'HUBZone': /hubzone\s*set.?aside/i,
      'SDVOSB': /sdvosb\s*set.?aside/i,
      'WOSB': /wosb\s*set.?aside/i,
      'EDWOSB': /edwosb\s*set.?aside/i,
    };

    for (const [type, pattern] of Object.entries(setAsidePatterns)) {
      if (content.match(pattern)) {
        eligibleTypes.push(type);
        requirements.push(`Must be certified as ${type}`);
      }
    }

    // Check metadata for set-aside type
    if (input.metadata?.setAsideType) {
      if (!eligibleTypes.includes(input.metadata.setAsideType)) {
        eligibleTypes.push(input.metadata.setAsideType);
        requirements.push(`Must be certified as ${input.metadata.setAsideType}`);
      }
    }

    // Add NAICS code requirements
    if (input.metadata?.naicsCode) {
      requirements.push(`Must qualify under NAICS code ${input.metadata.naicsCode}`);
    }

    return {
      eligible: eligibleTypes.length > 0,
      types: eligibleTypes,
      requirements,
    };
  }

  /**
   * Assess risks
   */
  private async assessRisks(
    input: GovernmentDomainInput,
    complianceStatus: any
  ): Promise<Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigation?: string;
  }>> {
    const risks: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      mitigation?: string;
    }> = [];

    // Compliance risks
    if (complianceStatus.issues.length > 0) {
      risks.push({
        type: 'compliance',
        severity: 'high',
        description: `Non-compliance with regulations: ${complianceStatus.issues.length} issues found`,
        mitigation: 'Address all compliance issues before contract execution',
      });
    }

    // Contract type risks
    if (input.context?.contractType === 'cost-reimbursement') {
      risks.push({
        type: 'financial',
        severity: 'medium',
        description: 'Cost-reimbursement contracts carry higher financial risk',
        mitigation: 'Ensure robust cost tracking and DCAA-compliant accounting systems',
      });
    }

    // Performance period risks
    if (input.metadata?.performancePeriod) {
      const duration = input.metadata.performancePeriod.end.getTime() - 
                      input.metadata.performancePeriod.start.getTime();
      const days = duration / (1000 * 60 * 60 * 24);
      
      if (days < 90) {
        risks.push({
          type: 'schedule',
          severity: 'high',
          description: 'Short performance period may impact delivery quality',
          mitigation: 'Develop accelerated delivery plan with clear milestones',
        });
      }
    }

    // Security clearance risks
    if (input.context?.securityClearance && 
        input.context.securityClearance !== 'none' && 
        input.context.securityClearance !== 'public-trust') {
      risks.push({
        type: 'personnel',
        severity: 'medium',
        description: `Requires ${input.context.securityClearance} cleared personnel`,
        mitigation: 'Ensure adequate cleared staff or budget for clearance processing',
      });
    }

    // Past performance risks
    if (input.context?.pastPerformance === false) {
      risks.push({
        type: 'competitive',
        severity: 'high',
        description: 'Lack of past performance may impact evaluation scores',
        mitigation: 'Highlight relevant commercial experience and team qualifications',
      });
    }

    return risks;
  }

  /**
   * Generate recommendations
   */
  private async generateRecommendations(
    input: GovernmentDomainInput,
    complianceStatus: any,
    risks: any[],
    setAsideEligibility: any
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Compliance recommendations
    if (complianceStatus.issues.length > 0) {
      recommendations.push(
        'Review and address all compliance issues before proceeding'
      );
      recommendations.push(
        'Consult with legal counsel specializing in government contracts'
      );
    }

    // Set-aside recommendations
    if (setAsideEligibility.eligible) {
      recommendations.push(
        `Ensure all ${setAsideEligibility.types.join(', ')} certifications are current`
      );
    } else if (input.documentType === 'rfp') {
      recommendations.push(
        'Consider teaming with certified small businesses if eligible for set-aside'
      );
    }

    // Risk-based recommendations
    const highRisks = risks.filter(r => r.severity === 'high' || r.severity === 'critical');
    if (highRisks.length > 0) {
      recommendations.push(
        'Develop risk mitigation plan for identified high-severity risks'
      );
    }

    // Document-specific recommendations
    if (input.documentType === 'rfp') {
      recommendations.push('Submit questions during the Q&A period for any ambiguities');
      recommendations.push('Attend any scheduled pre-bid conferences');
      recommendations.push('Review all amendments and modifications');
    }

    if (input.documentType === 'contract') {
      recommendations.push('Ensure all referenced clauses and provisions are included');
      recommendations.push('Verify insurance and bonding requirements are met');
    }

    // General recommendations
    recommendations.push('Maintain detailed documentation for all contract activities');
    recommendations.push('Establish clear communication protocols with the contracting officer');

    return recommendations;
  }

  /**
   * Perform competitive analysis for RFPs
   */
  private async performCompetitiveAnalysis(
    input: GovernmentDomainInput
  ): Promise<{
    incumbentAdvantage?: boolean;
    requiredCapabilities?: string[];
    evaluationCriteria?: Array<{
      factor: string;
      weight?: number;
      subfactors?: string[];
    }>;
  }> {
    const analysis: any = {};
    const content = input.content;

    // Check for incumbent advantage
    if (content.match(/incumbent|current\s+contractor/i)) {
      analysis.incumbentAdvantage = true;
    }

    // Extract required capabilities
    const capabilitiesMatch = content.match(/capabilities?[:\s]+([^\.]+)/gi);
    if (capabilitiesMatch) {
      analysis.requiredCapabilities = capabilitiesMatch
        .map(match => match.replace(/capabilities?[:\s]+/i, '').trim())
        .filter(cap => cap.length > 0);
    }

    // Extract evaluation criteria
    const evaluationMatch = content.match(/evaluation\s+criteria[:\s]+([^\.]+)/i);
    if (evaluationMatch) {
      // Simple parsing - in reality would need more sophisticated extraction
      analysis.evaluationCriteria = [
        { factor: 'Technical Approach', weight: 40 },
        { factor: 'Past Performance', weight: 30 },
        { factor: 'Price', weight: 30 },
      ];
    }

    return analysis;
  }

  /**
   * Validate document
   */
  private validateDocument(input: GovernmentDomainInput): boolean {
    // Basic validation
    const hasRequiredElements = 
      input.content.length > 1000 && // Minimum length for government docs
      input.metadata?.agency && // Must have agency
      (input.metadata?.contractNumber || input.metadata?.solicitation); // Must have identifier

    return !!hasRequiredElements;
  }
}

// Export singleton instance
export const governmentDomainAgent = new GovernmentDomainAgent();