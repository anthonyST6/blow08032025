import { BaseDomainAgent } from './base.domain-agent';
import { logger } from '../utils/logger';

export interface InsuranceDomainInput {
  documentType: 'policy' | 'claim' | 'underwriting' | 'endorsement' | 'certificate' | 'application';
  content: string;
  metadata?: {
    policyNumber?: string;
    claimNumber?: string;
    insuredName?: string;
    effectiveDate?: Date;
    expirationDate?: Date;
    premium?: number;
    deductible?: number;
    coverageLimit?: number;
    policyType?: string;
  };
  context?: {
    lineOfBusiness?: 'property' | 'casualty' | 'life' | 'health' | 'auto' | 'professional' | 'cyber';
    state?: string;
    riskCategory?: string;
    priorClaims?: number;
    industryCode?: string;
  };
}

export interface InsuranceDomainOutput {
  analysis: {
    documentValidity: boolean;
    coverageAnalysis: {
      primaryCoverages: string[];
      exclusions: string[];
      endorsements: string[];
      sublimits: Array<{
        coverage: string;
        limit: number;
      }>;
      deductibles: Array<{
        type: string;
        amount: number;
      }>;
    };
    regulatoryCompliance: {
      stateCompliant: boolean;
      formApproved: boolean;
      filingRequired: boolean;
      issues: string[];
    };
    riskAssessment: {
      riskScore: number;
      riskFactors: string[];
      mitigationMeasures: string[];
      pricingAdequacy: 'underpriced' | 'adequate' | 'overpriced';
    };
    claimsAnalysis?: {
      covered: boolean;
      exclusionsApplicable: string[];
      estimatedPayout?: number;
      subrogationPotential: boolean;
    };
    risks: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      mitigation?: string;
    }>;
  };
  recommendations: string[];
  benchmarkAnalysis?: {
    premiumBenchmark?: number;
    coverageBenchmark?: string[];
    marketPosition?: string;
  };
}

export class InsuranceDomainAgent extends BaseDomainAgent<InsuranceDomainInput, InsuranceDomainOutput> {
  constructor() {
    super({
      id: 'insurance-domain-agent',
      name: 'Insurance Domain Agent',
      description: 'Specialized agent for insurance document analysis and risk assessment',
      version: '1.0.0',
      capabilities: [
        'policy-analysis',
        'claims-evaluation',
        'coverage-mapping',
        'risk-assessment',
        'regulatory-compliance',
        'pricing-analysis',
      ],
    });
  }

  async process(input: InsuranceDomainInput): Promise<InsuranceDomainOutput> {
    const startTime = Date.now();
    logger.info('Insurance domain analysis started', {
      documentType: input.documentType,
      policyType: input.metadata?.policyType,
      lineOfBusiness: input.context?.lineOfBusiness,
    });

    try {
      // Analyze coverage
      const coverageAnalysis = await this.analyzeCoverage(input);
      
      // Check regulatory compliance
      const regulatoryCompliance = await this.checkRegulatoryCompliance(input);
      
      // Perform risk assessment
      const riskAssessment = await this.assessRisk(input, coverageAnalysis);
      
      // Analyze claims if applicable
      const claimsAnalysis = input.documentType === 'claim' 
        ? await this.analyzeClaim(input, coverageAnalysis)
        : undefined;
      
      // Identify risks
      const risks = await this.identifyRisks(input, coverageAnalysis, riskAssessment);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        input,
        coverageAnalysis,
        riskAssessment,
        risks
      );
      
      // Perform benchmark analysis
      const benchmarkAnalysis = await this.performBenchmarkAnalysis(input, coverageAnalysis);

      const output: InsuranceDomainOutput = {
        analysis: {
          documentValidity: this.validateDocument(input),
          coverageAnalysis,
          regulatoryCompliance,
          riskAssessment,
          claimsAnalysis,
          risks,
        },
        recommendations,
        benchmarkAnalysis,
      };

      logger.info('Insurance domain analysis completed', {
        processingTime: Date.now() - startTime,
        risksIdentified: risks.length,
        recommendationsCount: recommendations.length,
      });

      return output;
    } catch (error) {
      logger.error('Insurance domain analysis failed', { error });
      throw error;
    }
  }

  /**
   * Analyze coverage details
   */
  private async analyzeCoverage(
    input: InsuranceDomainInput
  ): Promise<{
    primaryCoverages: string[];
    exclusions: string[];
    endorsements: string[];
    sublimits: Array<{
      coverage: string;
      limit: number;
    }>;
    deductibles: Array<{
      type: string;
      amount: number;
    }>;
  }> {
    const content = input.content.toLowerCase();
    const analysis = {
      primaryCoverages: [] as string[],
      exclusions: [] as string[],
      endorsements: [] as string[],
      sublimits: [] as Array<{ coverage: string; limit: number }>,
      deductibles: [] as Array<{ type: string; amount: number }>,
    };

    // Extract primary coverages based on line of business
    if (input.context?.lineOfBusiness === 'property') {
      const propertyCoverages = [
        'building coverage',
        'personal property',
        'business income',
        'extra expense',
        'ordinance or law',
      ];
      
      for (const coverage of propertyCoverages) {
        if (content.includes(coverage)) {
          analysis.primaryCoverages.push(coverage);
        }
      }
    } else if (input.context?.lineOfBusiness === 'cyber') {
      const cyberCoverages = [
        'data breach response',
        'network security liability',
        'privacy liability',
        'business interruption',
        'cyber extortion',
      ];
      
      for (const coverage of cyberCoverages) {
        if (content.includes(coverage)) {
          analysis.primaryCoverages.push(coverage);
        }
      }
    }

    // Extract exclusions
    const exclusionMatch = content.match(/exclusions?[:\s]+([^\.]+)/gi);
    if (exclusionMatch) {
      exclusionMatch.forEach(match => {
        const exclusion = match.replace(/exclusions?[:\s]+/i, '').trim();
        if (exclusion) analysis.exclusions.push(exclusion);
      });
    }

    // Common exclusions to check
    const commonExclusions = [
      'flood',
      'earthquake',
      'war',
      'nuclear',
      'pollution',
      'wear and tear',
      'intentional acts',
    ];

    for (const exclusion of commonExclusions) {
      if (content.includes(`exclude ${exclusion}`) || content.includes(`${exclusion} excluded`)) {
        if (!analysis.exclusions.includes(exclusion)) {
          analysis.exclusions.push(exclusion);
        }
      }
    }

    // Extract sublimits
    const sublimitPattern = /(\w+[\s\w]*)\s+sublimit[:\s]+\$?([\d,]+)/gi;
    let sublimitMatch;
    while ((sublimitMatch = sublimitPattern.exec(input.content)) !== null) {
      analysis.sublimits.push({
        coverage: sublimitMatch[1].trim(),
        limit: parseInt(sublimitMatch[2].replace(/,/g, '')),
      });
    }

    // Extract deductibles
    const deductiblePattern = /(\w+[\s\w]*)\s+deductible[:\s]+\$?([\d,]+)/gi;
    let deductibleMatch;
    while ((deductibleMatch = deductiblePattern.exec(input.content)) !== null) {
      analysis.deductibles.push({
        type: deductibleMatch[1].trim(),
        amount: parseInt(deductibleMatch[2].replace(/,/g, '')),
      });
    }

    // Add metadata deductible if not found
    if (input.metadata?.deductible && analysis.deductibles.length === 0) {
      analysis.deductibles.push({
        type: 'standard',
        amount: input.metadata.deductible,
      });
    }

    return analysis;
  }

  /**
   * Check regulatory compliance
   */
  private async checkRegulatoryCompliance(
    input: InsuranceDomainInput
  ): Promise<{
    stateCompliant: boolean;
    formApproved: boolean;
    filingRequired: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    let stateCompliant = true;
    let formApproved = true;
    let filingRequired = false;

    const content = input.content.toLowerCase();

    // Check for state-specific requirements
    if (input.context?.state) {
      // Check for state amendatory endorsements
      if (!content.includes(`${input.context.state.toLowerCase()} amendatory`)) {
        issues.push(`Missing ${input.context.state} amendatory endorsement`);
        stateCompliant = false;
      }

      // Check for required state notices
      const stateNotices: Record<string, string> = {
        'california': 'california proposition 65',
        'new york': 'new york regulation 64',
        'texas': 'texas department of insurance',
        'florida': 'florida hurricane deductible',
      };

      const requiredNotice = stateNotices[input.context.state.toLowerCase()];
      if (requiredNotice && !content.includes(requiredNotice)) {
        issues.push(`Missing required ${input.context.state} notice: ${requiredNotice}`);
        stateCompliant = false;
      }
    }

    // Check for form approval
    if (!content.match(/form\s+[a-z0-9\-]+\s+\(\d{2}\/\d{2}\)/i)) {
      issues.push('No approved form number found');
      formApproved = false;
    }

    // Check if filing is required
    if (input.documentType === 'policy' && 
        (input.metadata?.premium && input.metadata.premium > 100000)) {
      filingRequired = true;
    }

    // Check for required disclosures
    const requiredDisclosures = [
      'cancellation provisions',
      'notice requirements',
      'premium calculation',
    ];

    for (const disclosure of requiredDisclosures) {
      if (!content.includes(disclosure)) {
        issues.push(`Missing required disclosure: ${disclosure}`);
        stateCompliant = false;
      }
    }

    return {
      stateCompliant,
      formApproved,
      filingRequired,
      issues,
    };
  }

  /**
   * Assess risk
   */
  private async assessRisk(
    input: InsuranceDomainInput,
    coverageAnalysis: any
  ): Promise<{
    riskScore: number;
    riskFactors: string[];
    mitigationMeasures: string[];
    pricingAdequacy: 'underpriced' | 'adequate' | 'overpriced';
  }> {
    const riskFactors: string[] = [];
    const mitigationMeasures: string[] = [];
    let riskScore = 50; // Base score

    // Assess based on line of business
    if (input.context?.lineOfBusiness === 'cyber') {
      riskScore += 20; // Cyber is high risk
      riskFactors.push('Cyber liability - emerging risk category');
    }

    // Prior claims impact
    if (input.context?.priorClaims && input.context.priorClaims > 0) {
      riskScore += input.context.priorClaims * 10;
      riskFactors.push(`${input.context.priorClaims} prior claims reported`);
    }

    // Coverage gaps
    if (coverageAnalysis.exclusions.length > 5) {
      riskScore += 10;
      riskFactors.push('Numerous exclusions may leave coverage gaps');
      mitigationMeasures.push('Consider additional endorsements to fill coverage gaps');
    }

    // Deductible analysis
    if (coverageAnalysis.deductibles.length > 0) {
      const avgDeductible = coverageAnalysis.deductibles.reduce((sum: number, d: any) => sum + d.amount, 0) /
                           coverageAnalysis.deductibles.length;
      if (avgDeductible > 10000) {
        riskScore -= 10; // High deductibles reduce insurer risk
        mitigationMeasures.push('High deductibles help control premium costs');
      }
    }

    // Industry-specific risks
    if (input.context?.industryCode) {
      const highRiskIndustries = ['construction', 'manufacturing', 'transportation'];
      if (highRiskIndustries.some(ind => input.context?.industryCode?.toLowerCase().includes(ind))) {
        riskScore += 15;
        riskFactors.push('High-risk industry classification');
      }
    }

    // Pricing adequacy
    let pricingAdequacy: 'underpriced' | 'adequate' | 'overpriced' = 'adequate';
    if (input.metadata?.premium && input.metadata?.coverageLimit) {
      const rate = (input.metadata.premium / input.metadata.coverageLimit) * 100;
      if (rate < 0.5) {
        pricingAdequacy = 'underpriced';
        riskFactors.push('Premium may be inadequate for coverage provided');
      } else if (rate > 2) {
        pricingAdequacy = 'overpriced';
      }
    }

    // Cap risk score at 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    return {
      riskScore,
      riskFactors,
      mitigationMeasures,
      pricingAdequacy,
    };
  }

  /**
   * Analyze claim
   */
  private async analyzeClaim(
    input: InsuranceDomainInput,
    coverageAnalysis: any
  ): Promise<{
    covered: boolean;
    exclusionsApplicable: string[];
    estimatedPayout?: number;
    subrogationPotential: boolean;
  }> {
    const content = input.content.toLowerCase();
    const exclusionsApplicable: string[] = [];
    let covered = true;
    let subrogationPotential = false;

    // Check if claim falls under exclusions
    for (const exclusion of coverageAnalysis.exclusions) {
      if (content.includes(exclusion.toLowerCase())) {
        exclusionsApplicable.push(exclusion);
        covered = false;
      }
    }

    // Check for subrogation potential
    if (content.match(/third[\s-]party|negligence|fault|liable|responsible[\s-]party/i)) {
      subrogationPotential = true;
    }

    // Estimate payout (simplified)
    let estimatedPayout: number | undefined;
    const amountMatch = content.match(/claim[\s-]amount[:\s]+\$?([\d,]+)/i);
    if (amountMatch) {
      estimatedPayout = parseInt(amountMatch[1].replace(/,/g, ''));
      
      // Apply deductible
      if (coverageAnalysis.deductibles.length > 0) {
        estimatedPayout -= coverageAnalysis.deductibles[0].amount;
      }
      
      // Apply coverage limit
      if (input.metadata?.coverageLimit && estimatedPayout > input.metadata.coverageLimit) {
        estimatedPayout = input.metadata.coverageLimit;
      }
    }

    return {
      covered,
      exclusionsApplicable,
      estimatedPayout,
      subrogationPotential,
    };
  }

  /**
   * Identify risks
   */
  private async identifyRisks(
    input: InsuranceDomainInput,
    coverageAnalysis: any,
    riskAssessment: any
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

    // Coverage gap risks
    if (coverageAnalysis.exclusions.length > 10) {
      risks.push({
        type: 'coverage',
        severity: 'high',
        description: 'Extensive exclusions may leave significant coverage gaps',
        mitigation: 'Review exclusions and consider additional coverage endorsements',
      });
    }

    // Pricing risks
    if (riskAssessment.pricingAdequacy === 'underpriced') {
      risks.push({
        type: 'financial',
        severity: 'high',
        description: 'Premium appears inadequate for risk exposure',
        mitigation: 'Re-evaluate pricing model and consider rate adjustment',
      });
    }

    // Regulatory risks
    if (!input.content.match(/surplus\s+lines/i) && 
        input.context?.lineOfBusiness === 'professional') {
      risks.push({
        type: 'regulatory',
        severity: 'medium',
        description: 'Professional liability may require surplus lines filing',
        mitigation: 'Verify admitted vs. non-admitted requirements',
      });
    }

    // Accumulation risks
    if (input.context?.lineOfBusiness === 'property' && 
        !input.content.match(/catastrophe|cat\s+modeling/i)) {
      risks.push({
        type: 'catastrophe',
        severity: 'high',
        description: 'No catastrophe modeling mentioned for property coverage',
        mitigation: 'Implement catastrophe modeling for accumulation control',
      });
    }

    // Claims handling risks
    if (input.documentType === 'claim' && riskAssessment.riskScore > 70) {
      risks.push({
        type: 'claims',
        severity: 'medium',
        description: 'High risk score indicates potential for claims disputes',
        mitigation: 'Ensure thorough documentation and investigation',
      });
    }

    // Cyber-specific risks
    if (input.context?.lineOfBusiness === 'cyber') {
      if (!input.content.match(/incident\s+response|breach\s+coach/i)) {
        risks.push({
          type: 'service',
          severity: 'medium',
          description: 'No incident response services mentioned',
          mitigation: 'Add breach coach and incident response coverage',
        });
      }
    }

    return risks;
  }

  /**
   * Generate recommendations
   */
  private async generateRecommendations(
    input: InsuranceDomainInput,
    coverageAnalysis: any,
    riskAssessment: any,
    risks: any[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Coverage recommendations
    if (coverageAnalysis.exclusions.length > 5) {
      recommendations.push(
        'Review exclusions list and identify critical coverage gaps'
      );
      recommendations.push(
        'Consider purchasing endorsements to broaden coverage'
      );
    }

    // Risk-based recommendations
    if (riskAssessment.riskScore > 70) {
      recommendations.push(
        'Implement additional risk control measures to reduce exposure'
      );
      recommendations.push(
        'Consider higher deductibles to manage premium costs'
      );
    }

    // Line of business specific recommendations
    if (input.context?.lineOfBusiness === 'cyber') {
      recommendations.push(
        'Ensure policy includes both first-party and third-party coverage'
      );
      recommendations.push(
        'Verify coverage for regulatory fines and penalties'
      );
      recommendations.push(
        'Implement cybersecurity best practices to qualify for better rates'
      );
    } else if (input.context?.lineOfBusiness === 'property') {
      recommendations.push(
        'Conduct regular property valuations to avoid underinsurance'
      );
      recommendations.push(
        'Review business interruption limits and waiting periods'
      );
    }

    // Claims recommendations
    if (input.documentType === 'claim') {
      recommendations.push(
        'Document all claim-related expenses and communications'
      );
      recommendations.push(
        'Engage coverage counsel if coverage disputes arise'
      );
      
      if (riskAssessment.subrogationPotential) {
        recommendations.push(
          'Preserve evidence for potential subrogation recovery'
        );
      }
    }

    // General recommendations
    recommendations.push(
      'Review policy annually and update for business changes'
    );
    recommendations.push(
      'Maintain detailed records of all insurance-related documents'
    );

    return recommendations;
  }

  /**
   * Perform benchmark analysis
   */
  private async performBenchmarkAnalysis(
    input: InsuranceDomainInput,
    coverageAnalysis: any
  ): Promise<{
    premiumBenchmark?: number;
    coverageBenchmark?: string[];
    marketPosition?: string;
  }> {
    const benchmark: any = {};

    // Premium benchmarking (simplified - would use actual market data)
    if (input.metadata?.premium && input.metadata?.coverageLimit) {
      const rate = (input.metadata.premium / input.metadata.coverageLimit) * 100;
      
      // Industry average rates by line of business
      const avgRates: Record<string, number> = {
        'property': 0.8,
        'casualty': 1.2,
        'professional': 1.5,
        'cyber': 2.0,
        'auto': 3.0,
      };

      const avgRate = avgRates[input.context?.lineOfBusiness || 'casualty'] || 1.0;
      benchmark.premiumBenchmark = input.metadata.coverageLimit * (avgRate / 100);

      // Market position
      if (rate < avgRate * 0.8) {
        benchmark.marketPosition = 'Below market - competitive advantage';
      } else if (rate > avgRate * 1.2) {
        benchmark.marketPosition = 'Above market - may impact retention';
      } else {
        benchmark.marketPosition = 'Market aligned';
      }
    }

    // Coverage benchmarking
    const standardCoverages: Record<string, string[]> = {
      'property': ['building', 'contents', 'business income', 'extra expense'],
      'cyber': ['data breach', 'network security', 'privacy liability', 'business interruption'],
      'professional': ['professional liability', 'defense costs', 'disciplinary proceedings'],
    };

    const expectedCoverages = standardCoverages[input.context?.lineOfBusiness || ''] || [];
    const missingCoverages = expectedCoverages.filter(
      cov => !coverageAnalysis.primaryCoverages.some((pc: string) => 
        pc.toLowerCase().includes(cov.toLowerCase())
      )
    );

    if (missingCoverages.length > 0) {
      benchmark.coverageBenchmark = missingCoverages;
    }

    return benchmark;
  }

  /**
   * Validate document
   */
  private validateDocument(input: InsuranceDomainInput): boolean {
    // Basic validation
    const hasRequiredElements = 
      input.content.length > 500 && // Minimum length
      (input.metadata?.policyNumber || input.metadata?.claimNumber) && // Must have identifier
      (input.content.match(/insured|policyholder|named\s+insured/i) || 
       input.metadata?.insuredName); // Must identify insured

    // Document-specific validation
    if (input.documentType === 'policy') {
      return !!(hasRequiredElements && 
               input.content.match(/coverage|insuring\s+agreement/i) &&
               input.content.match(/premium|consideration/i));
    } else if (input.documentType === 'claim') {
      return !!(hasRequiredElements && 
               input.content.match(/loss|damage|claim/i));
    }

    return !!hasRequiredElements;
  }
}

// Export singleton instance
export const insuranceDomainAgent = new InsuranceDomainAgent();