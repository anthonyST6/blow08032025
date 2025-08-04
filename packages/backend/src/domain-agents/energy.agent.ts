import { BaseDomainAgent } from './base.domain-agent';
import { logger } from '../utils/logger';

export interface EnergyDomainInput {
  documentType: 'lease' | 'contract' | 'permit' | 'environmental' | 'regulatory' | 'technical';
  content: string;
  metadata?: {
    operator?: string;
    location?: string;
    acreage?: number;
    minerals?: string[];
    effectiveDate?: Date;
    expirationDate?: Date;
    royaltyRate?: number;
    bonusPayment?: number;
  };
  context?: {
    state?: string;
    county?: string;
    field?: string;
    formation?: string;
    wellType?: 'oil' | 'gas' | 'both';
  };
}

export interface EnergyDomainOutput {
  analysis: {
    documentValidity: boolean;
    keyTermsExtracted: Record<string, any>;
    regulatoryCompliance: {
      federal: boolean;
      state: boolean;
      local: boolean;
      issues: string[];
    };
    financialTerms: {
      royaltyRate?: number;
      bonusPayment?: number;
      delayRentals?: number;
      shutInPayments?: number;
    };
    operationalTerms: {
      primaryTerm?: number;
      depthRights?: string;
      surfaceRights?: string;
      poolingProvisions?: string;
    };
    environmentalConsiderations: string[];
    risks: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      mitigation?: string;
    }>;
  };
  recommendations: string[];
  industryBenchmarks?: {
    royaltyRateAverage?: number;
    bonusPaymentAverage?: number;
    marketConditions?: string;
  };
}

export class EnergyDomainAgent extends BaseDomainAgent<EnergyDomainInput, EnergyDomainOutput> {
  constructor() {
    super({
      id: 'energy-domain-agent',
      name: 'Energy Domain Agent',
      description: 'Specialized agent for oil & gas document analysis and validation',
      version: '1.0.0',
      capabilities: [
        'lease-analysis',
        'contract-validation',
        'regulatory-compliance',
        'financial-terms-extraction',
        'environmental-assessment',
      ],
    });
  }

  async process(input: EnergyDomainInput): Promise<EnergyDomainOutput> {
    const startTime = Date.now();
    logger.info('Energy domain analysis started', {
      documentType: input.documentType,
      hasMetadata: !!input.metadata,
      hasContext: !!input.context,
    });

    try {
      // Extract key terms based on document type
      const keyTerms = await this.extractKeyTerms(input);
      
      // Check regulatory compliance
      const compliance = await this.checkRegulatoryCompliance(input, keyTerms);
      
      // Extract financial terms
      const financialTerms = await this.extractFinancialTerms(input, keyTerms);
      
      // Extract operational terms
      const operationalTerms = await this.extractOperationalTerms(input, keyTerms);
      
      // Identify environmental considerations
      const environmentalConsiderations = await this.identifyEnvironmentalConsiderations(input);
      
      // Assess risks
      const risks = await this.assessRisks(input, keyTerms, compliance);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        input,
        compliance,
        risks,
        financialTerms
      );
      
      // Get industry benchmarks if applicable
      const industryBenchmarks = await this.getIndustryBenchmarks(input, financialTerms);

      const output: EnergyDomainOutput = {
        analysis: {
          documentValidity: this.validateDocument(input, keyTerms),
          keyTermsExtracted: keyTerms,
          regulatoryCompliance: compliance,
          financialTerms,
          operationalTerms,
          environmentalConsiderations,
          risks,
        },
        recommendations,
        industryBenchmarks,
      };

      logger.info('Energy domain analysis completed', {
        processingTime: Date.now() - startTime,
        risksIdentified: risks.length,
        recommendationsCount: recommendations.length,
      });

      return output;
    } catch (error) {
      logger.error('Energy domain analysis failed', { error });
      throw error;
    }
  }

  /**
   * Extract key terms from the document
   */
  private async extractKeyTerms(input: EnergyDomainInput): Promise<Record<string, any>> {
    const keyTerms: Record<string, any> = {};
    const content = input.content.toLowerCase();

    // Common oil & gas lease terms
    const termPatterns = {
      lessor: /lessor[:\s]+([^\n,]+)/i,
      lessee: /lessee[:\s]+([^\n,]+)/i,
      effectiveDate: /effective\s+date[:\s]+([^\n,]+)/i,
      primaryTerm: /primary\s+term[:\s]+(\d+)\s*(years?|months?)/i,
      royalty: /royalty[:\s]+(\d+\.?\d*)\s*(%|percent|fraction)/i,
      bonus: /bonus[:\s]+\$?(\d+[,\d]*\.?\d*)/i,
      acreage: /(\d+[,\d]*\.?\d*)\s*acres?/i,
      depth: /depth[:\s]+([^\n,]+)/i,
      minerals: /minerals?[:\s]+([^\n,]+)/i,
    };

    for (const [key, pattern] of Object.entries(termPatterns)) {
      const match = content.match(pattern);
      if (match) {
        keyTerms[key] = match[1].trim();
      }
    }

    // Merge with provided metadata
    if (input.metadata) {
      Object.assign(keyTerms, input.metadata);
    }

    return keyTerms;
  }

  /**
   * Check regulatory compliance
   */
  private async checkRegulatoryCompliance(
    input: EnergyDomainInput,
    keyTerms: Record<string, any>
  ): Promise<{
    federal: boolean;
    state: boolean;
    local: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    let federal = true;
    let state = true;
    let local = true;

    // Federal compliance checks
    if (input.documentType === 'lease' || input.documentType === 'permit') {
      // Check for required federal provisions
      if (!input.content.match(/environmental\s+protection/i)) {
        issues.push('Missing environmental protection clause (federal requirement)');
        federal = false;
      }
      
      if (!input.content.match(/endangered\s+species/i)) {
        issues.push('Missing endangered species protection clause');
        federal = false;
      }
    }

    // State-specific compliance (example for Texas)
    if (input.context?.state?.toLowerCase() === 'texas') {
      if (!input.content.match(/railroad\s+commission/i)) {
        issues.push('Missing Texas Railroad Commission compliance reference');
        state = false;
      }
      
      // Check minimum royalty requirements
      const royalty = parseFloat(keyTerms.royalty || '0');
      if (royalty < 12.5) {
        issues.push('Royalty rate below Texas minimum (12.5%)');
        state = false;
      }
    }

    // Local compliance checks
    if (input.context?.county) {
      // Placeholder for county-specific requirements
      if (!input.content.match(/county\s+regulations?/i)) {
        issues.push('No reference to county regulations');
        local = false;
      }
    }

    return { federal, state, local, issues };
  }

  /**
   * Extract financial terms
   */
  private async extractFinancialTerms(
    input: EnergyDomainInput,
    keyTerms: Record<string, any>
  ): Promise<{
    royaltyRate?: number;
    bonusPayment?: number;
    delayRentals?: number;
    shutInPayments?: number;
  }> {
    const financialTerms: any = {};

    // Extract royalty rate
    if (keyTerms.royalty) {
      financialTerms.royaltyRate = parseFloat(keyTerms.royalty);
    } else if (keyTerms.royaltyRate) {
      financialTerms.royaltyRate = keyTerms.royaltyRate;
    }

    // Extract bonus payment
    if (keyTerms.bonus) {
      financialTerms.bonusPayment = parseFloat(keyTerms.bonus.replace(/,/g, ''));
    } else if (keyTerms.bonusPayment) {
      financialTerms.bonusPayment = keyTerms.bonusPayment;
    }

    // Extract delay rentals
    const delayRentalMatch = input.content.match(/delay\s+rental[:\s]+\$?(\d+[,\d]*\.?\d*)/i);
    if (delayRentalMatch) {
      financialTerms.delayRentals = parseFloat(delayRentalMatch[1].replace(/,/g, ''));
    }

    // Extract shut-in payments
    const shutInMatch = input.content.match(/shut-?in[:\s]+\$?(\d+[,\d]*\.?\d*)/i);
    if (shutInMatch) {
      financialTerms.shutInPayments = parseFloat(shutInMatch[1].replace(/,/g, ''));
    }

    return financialTerms;
  }

  /**
   * Extract operational terms
   */
  private async extractOperationalTerms(
    input: EnergyDomainInput,
    keyTerms: Record<string, any>
  ): Promise<{
    primaryTerm?: number;
    depthRights?: string;
    surfaceRights?: string;
    poolingProvisions?: string;
  }> {
    const operationalTerms: any = {};

    // Extract primary term
    if (keyTerms.primaryTerm) {
      const termMatch = keyTerms.primaryTerm.match(/(\d+)/);
      if (termMatch) {
        operationalTerms.primaryTerm = parseInt(termMatch[1]);
      }
    }

    // Extract depth rights
    if (keyTerms.depth) {
      operationalTerms.depthRights = keyTerms.depth;
    } else {
      const depthMatch = input.content.match(/depth[:\s]+([^\n,]+)/i);
      if (depthMatch) {
        operationalTerms.depthRights = depthMatch[1].trim();
      }
    }

    // Extract surface rights
    const surfaceMatch = input.content.match(/surface\s+rights?[:\s]+([^\n,]+)/i);
    if (surfaceMatch) {
      operationalTerms.surfaceRights = surfaceMatch[1].trim();
    }

    // Extract pooling provisions
    const poolingMatch = input.content.match(/pooling[:\s]+([^\n,]+)/i);
    if (poolingMatch) {
      operationalTerms.poolingProvisions = poolingMatch[1].trim();
    }

    return operationalTerms;
  }

  /**
   * Identify environmental considerations
   */
  private async identifyEnvironmentalConsiderations(
    input: EnergyDomainInput
  ): Promise<string[]> {
    const considerations: string[] = [];
    const content = input.content.toLowerCase();

    // Check for environmental keywords
    const environmentalKeywords = [
      'water protection',
      'air quality',
      'soil contamination',
      'wildlife habitat',
      'wetlands',
      'endangered species',
      'remediation',
      'restoration',
      'spill prevention',
      'waste disposal',
    ];

    for (const keyword of environmentalKeywords) {
      if (content.includes(keyword)) {
        considerations.push(`Document addresses ${keyword}`);
      }
    }

    // Check for missing environmental provisions
    if (!content.includes('environmental')) {
      considerations.push('Limited environmental protection provisions');
    }

    if (!content.includes('restoration') && !content.includes('remediation')) {
      considerations.push('No site restoration requirements specified');
    }

    return considerations;
  }

  /**
   * Assess risks
   */
  private async assessRisks(
    input: EnergyDomainInput,
    keyTerms: Record<string, any>,
    compliance: any
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
    if (!compliance.federal || !compliance.state || !compliance.local) {
      risks.push({
        type: 'regulatory',
        severity: 'high',
        description: 'Document has regulatory compliance issues',
        mitigation: 'Review and update document to meet all regulatory requirements',
      });
    }

    // Financial risks
    const royalty = parseFloat(keyTerms.royalty || '0');
    if (royalty < 12.5) {
      risks.push({
        type: 'financial',
        severity: 'medium',
        description: 'Below-market royalty rate',
        mitigation: 'Consider negotiating higher royalty rate to match market standards',
      });
    }

    // Operational risks
    if (!keyTerms.primaryTerm) {
      risks.push({
        type: 'operational',
        severity: 'high',
        description: 'Primary term not clearly defined',
        mitigation: 'Specify clear primary term duration',
      });
    }

    // Environmental risks
    if (!input.content.match(/environmental\s+liability/i)) {
      risks.push({
        type: 'environmental',
        severity: 'high',
        description: 'Unclear environmental liability allocation',
        mitigation: 'Add clear environmental liability and indemnification clauses',
      });
    }

    // Title risks
    if (!input.content.match(/title\s+(warranty|examination)/i)) {
      risks.push({
        type: 'title',
        severity: 'critical',
        description: 'No title warranty or examination requirement',
        mitigation: 'Require title examination and warranty of title',
      });
    }

    return risks;
  }

  /**
   * Generate recommendations
   */
  private async generateRecommendations(
    input: EnergyDomainInput,
    compliance: any,
    risks: any[],
    financialTerms: any
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Compliance recommendations
    if (compliance.issues.length > 0) {
      recommendations.push(
        `Address regulatory compliance issues: ${compliance.issues.join(', ')}`
      );
    }

    // Financial recommendations
    if (financialTerms.royaltyRate && financialTerms.royaltyRate < 12.5) {
      recommendations.push(
        'Consider negotiating royalty rate to at least 12.5% (industry minimum)'
      );
    }

    if (!financialTerms.bonusPayment) {
      recommendations.push('Negotiate upfront bonus payment for lease execution');
    }

    // Risk-based recommendations
    const criticalRisks = risks.filter(r => r.severity === 'critical');
    if (criticalRisks.length > 0) {
      recommendations.push(
        'Address critical risks before executing agreement: ' +
        criticalRisks.map(r => r.description).join(', ')
      );
    }

    // Document-specific recommendations
    if (input.documentType === 'lease') {
      if (!input.content.match(/force\s+majeure/i)) {
        recommendations.push('Add force majeure clause for operational flexibility');
      }
      
      if (!input.content.match(/audit\s+rights?/i)) {
        recommendations.push('Include audit rights for royalty verification');
      }
    }

    // General recommendations
    recommendations.push('Conduct thorough title examination before execution');
    recommendations.push('Review with legal counsel specializing in oil & gas');

    return recommendations;
  }

  /**
   * Get industry benchmarks
   */
  private async getIndustryBenchmarks(
    input: EnergyDomainInput,
    financialTerms: any
  ): Promise<{
    royaltyRateAverage?: number;
    bonusPaymentAverage?: number;
    marketConditions?: string;
  }> {
    // In a real implementation, this would query market data
    const benchmarks: any = {};

    // Regional benchmarks (example data)
    if (input.context?.state?.toLowerCase() === 'texas') {
      benchmarks.royaltyRateAverage = 18.75; // 3/16ths
      benchmarks.bonusPaymentAverage = 500; // per acre
      benchmarks.marketConditions = 'Stable with increasing activity in Permian Basin';
    } else if (input.context?.state?.toLowerCase() === 'north dakota') {
      benchmarks.royaltyRateAverage = 18.75;
      benchmarks.bonusPaymentAverage = 750;
      benchmarks.marketConditions = 'Recovering from recent downturn';
    } else {
      benchmarks.royaltyRateAverage = 12.5; // 1/8th standard
      benchmarks.bonusPaymentAverage = 250;
      benchmarks.marketConditions = 'Varies by region';
    }

    return benchmarks;
  }

  /**
   * Validate document
   */
  private validateDocument(
    input: EnergyDomainInput,
    keyTerms: Record<string, any>
  ): boolean {
    // Basic validation checks
    const requiredTerms = ['lessor', 'lessee', 'effectiveDate', 'royalty'];
    const hasRequiredTerms = requiredTerms.every(term => keyTerms[term]);

    // Document structure validation
    const hasProperStructure =
      input.content.length > 500 && // Minimum length
      !!input.content.match(/whereas/i) && // Legal language
      !!input.content.match(/agreement/i); // Agreement reference

    return hasRequiredTerms && hasProperStructure;
  }
}

// Export singleton instance
export const energyDomainAgent = new EnergyDomainAgent();