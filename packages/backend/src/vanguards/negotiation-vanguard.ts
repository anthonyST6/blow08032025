import { VanguardAgent, AgentResult, LLMOutput, AgentFlag } from '../agents/base.agent';

export interface NegotiationInput extends LLMOutput {
  contractData?: {
    leaseId: string;
    documentText?: string;
    documentUrl?: string;
    currentTerms?: {
      royaltyRate: number;
      bonusPayment: number;
      primaryTerm: number;
      extensionOptions?: string[];
    };
    counterpartyInfo?: {
      name: string;
      type: 'individual' | 'corporation' | 'trust';
      negotiationHistory?: any[];
    };
  };
  marketBenchmarks?: {
    avgRoyaltyRate: number;
    avgBonusPerAcre: number;
    typicalTermLength: number;
  };
  negotiationContext?: {
    urgency: 'high' | 'medium' | 'low';
    leverage: 'strong' | 'neutral' | 'weak';
    objectives: string[];
  };
}

export interface NegotiationOutput extends AgentResult {
  contractAnalysis: {
    extractedClauses: Array<{
      type: string;
      text: string;
      risk: 'high' | 'medium' | 'low';
      recommendation?: string;
    }>;
    missingClauses: string[];
    problematicTerms: Array<{
      term: string;
      issue: string;
      suggestedRevision: string;
    }>;
  };
  negotiationStrategy: {
    approach: 'collaborative' | 'competitive' | 'accommodating';
    prioritizedObjectives: string[];
    concessionPoints: string[];
    walkAwayPoints: string[];
  };
  proposedTerms: {
    royaltyRate: { current: number; proposed: number; justification: string };
    bonusPayment: { current: number; proposed: number; justification: string };
    primaryTerm: { current: number; proposed: number; justification: string };
    additionalClauses: string[];
  };
  negotiationPackage: {
    executiveSummary: string;
    detailedAnalysis: string;
    proposalDocument: string;
    supportingData: any[];
  };
  riskAssessment: {
    overallRisk: 'high' | 'medium' | 'low';
    specificRisks: Array<{
      type: string;
      description: string;
      mitigation: string;
    }>;
  };
}

export class NegotiationVanguard extends VanguardAgent {
  constructor() {
    super(
      'negotiation-vanguard',
      'Negotiation Vanguard',
      '1.0.0',
      'Contract parsing, clause analysis, and negotiation package generation for oilfield leases',
      {
        thresholds: {
          low: 65,
          medium: 75,
          high: 85,
          critical: 95,
        },
      }
    );
  }

  async analyze(input: NegotiationInput): Promise<NegotiationOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting negotiation analysis', { 
      leaseId: input.contractData?.leaseId 
    });

    try {
      this.validateInput(input);

      const flags: AgentFlag[] = [];
      
      // Parse and analyze contract
      const contractAnalysis = await this.analyzeContract(
        input.contractData,
        input.marketBenchmarks
      );
      flags.push(...contractAnalysis.flags);

      // Develop negotiation strategy
      const negotiationStrategy = this.developStrategy(
        contractAnalysis.analysis,
        input.negotiationContext,
        input.marketBenchmarks
      );

      // Generate proposed terms
      const proposedTerms = this.generateProposedTerms(
        input.contractData?.currentTerms,
        input.marketBenchmarks,
        negotiationStrategy
      );

      // Create negotiation package
      const negotiationPackage = this.createNegotiationPackage(
        contractAnalysis.analysis,
        proposedTerms,
        negotiationStrategy
      );

      // Assess risks
      const riskAssessment = this.assessRisks(
        contractAnalysis.analysis,
        proposedTerms
      );

      // Calculate negotiation score
      const negotiationScore = this.calculateNegotiationScore(
        contractAnalysis.analysis,
        proposedTerms,
        riskAssessment
      );

      const result: NegotiationOutput = {
        ...this.createResult(
          negotiationScore,
          flags,
          {
            clausesAnalyzed: contractAnalysis.analysis.extractedClauses.length,
            risksIdentified: riskAssessment.specificRisks.length,
            processingTime: Date.now() - startTime,
          },
          0.88,
          startTime
        ),
        contractAnalysis: contractAnalysis.analysis,
        negotiationStrategy,
        proposedTerms,
        negotiationPackage,
        riskAssessment,
      };

      this.log('info', 'Negotiation analysis completed', {
        score: negotiationScore,
        risksFound: riskAssessment.specificRisks.length,
        strategy: negotiationStrategy.approach,
      });

      return result;
    } catch (error) {
      this.log('error', 'Negotiation analysis failed', { error });
      throw error;
    }
  }

  private async analyzeContract(
    contractData?: NegotiationInput['contractData'],
    marketBenchmarks?: NegotiationInput['marketBenchmarks']
  ): Promise<{ 
    analysis: NegotiationOutput['contractAnalysis']; 
    flags: AgentFlag[] 
  }> {
    const flags: AgentFlag[] = [];
    const extractedClauses: NegotiationOutput['contractAnalysis']['extractedClauses'] = [];
    const missingClauses: string[] = [];
    const problematicTerms: NegotiationOutput['contractAnalysis']['problematicTerms'] = [];

    if (!contractData?.documentText) {
      // Simulate contract parsing
      extractedClauses.push(
        {
          type: 'royalty',
          text: `Royalty rate of ${contractData?.currentTerms?.royaltyRate || 12.5}%`,
          risk: this.assessClauseRisk('royalty', contractData?.currentTerms?.royaltyRate || 12.5, marketBenchmarks),
          recommendation: 'Consider market rate adjustment',
        },
        {
          type: 'primary_term',
          text: `Primary term of ${contractData?.currentTerms?.primaryTerm || 3} years`,
          risk: 'low',
        },
        {
          type: 'bonus_payment',
          text: `Bonus payment of $${contractData?.currentTerms?.bonusPayment || 500} per acre`,
          risk: this.assessClauseRisk('bonus', contractData?.currentTerms?.bonusPayment || 500, marketBenchmarks),
        }
      );

      // Check for missing important clauses
      const requiredClauses = [
        'force_majeure',
        'assignment_rights',
        'audit_rights',
        'environmental_compliance',
        'indemnification',
        'termination_conditions',
      ];

      // Check which required clauses are missing (simplified simulation)
      const foundClauses = ['assignment_rights', 'environmental_compliance', 'indemnification', 'termination_conditions'];
      requiredClauses.forEach(clause => {
        if (!foundClauses.includes(clause)) {
          missingClauses.push(clause);
        }
      });
      
      flags.push(this.createFlag(
        'medium',
        'missing_clauses',
        'Important protective clauses are missing from the contract',
        { missing: missingClauses }
      ));

      // Identify problematic terms
      if (contractData?.currentTerms?.royaltyRate && 
          marketBenchmarks?.avgRoyaltyRate &&
          contractData.currentTerms.royaltyRate < marketBenchmarks.avgRoyaltyRate * 0.8) {
        problematicTerms.push({
          term: 'Royalty Rate',
          issue: `Below market rate (${contractData.currentTerms.royaltyRate}% vs ${marketBenchmarks.avgRoyaltyRate}% market avg)`,
          suggestedRevision: `Increase to ${marketBenchmarks.avgRoyaltyRate}% to match market standards`,
        });

        flags.push(this.createFlag(
          'high',
          'below_market_terms',
          'Royalty rate significantly below market average',
          { 
            current: contractData.currentTerms.royaltyRate,
            market: marketBenchmarks.avgRoyaltyRate,
          }
        ));
      }
    }

    return {
      analysis: {
        extractedClauses,
        missingClauses,
        problematicTerms,
      },
      flags,
    };
  }

  private assessClauseRisk(
    clauseType: string,
    value: number,
    marketBenchmarks?: NegotiationInput['marketBenchmarks']
  ): 'high' | 'medium' | 'low' {
    if (!marketBenchmarks) return 'medium';

    switch (clauseType) {
      case 'royalty':
        const royaltyDiff = Math.abs(value - marketBenchmarks.avgRoyaltyRate) / marketBenchmarks.avgRoyaltyRate;
        if (royaltyDiff > 0.3) return 'high';
        if (royaltyDiff > 0.15) return 'medium';
        return 'low';

      case 'bonus':
        const bonusDiff = Math.abs(value - marketBenchmarks.avgBonusPerAcre) / marketBenchmarks.avgBonusPerAcre;
        if (bonusDiff > 0.4) return 'high';
        if (bonusDiff > 0.2) return 'medium';
        return 'low';

      default:
        return 'medium';
    }
  }

  private developStrategy(
    contractAnalysis: NegotiationOutput['contractAnalysis'],
    negotiationContext?: NegotiationInput['negotiationContext'],
    marketBenchmarks?: NegotiationInput['marketBenchmarks']
  ): NegotiationOutput['negotiationStrategy'] {
    // Determine approach based on context and analysis
    let approach: 'collaborative' | 'competitive' | 'accommodating' = 'collaborative';
    
    if (negotiationContext?.leverage === 'strong' && contractAnalysis.problematicTerms.length > 2) {
      approach = 'competitive';
    } else if (negotiationContext?.leverage === 'weak' || negotiationContext?.urgency === 'high') {
      approach = 'accommodating';
    }

    // Prioritize objectives
    const prioritizedObjectives = [
      'Achieve market-rate royalties',
      'Secure favorable extension terms',
      'Include protective clauses',
      'Minimize upfront costs',
    ];

    if (negotiationContext?.objectives) {
      prioritizedObjectives.unshift(...negotiationContext.objectives);
    }

    // Define concession points
    const concessionPoints = [];
    if (approach === 'accommodating') {
      concessionPoints.push(
        'Accept slightly below market bonus payment',
        'Flexible on payment terms',
        'Willing to extend primary term',
      );
    } else if (approach === 'collaborative') {
      concessionPoints.push(
        'Phased royalty increases',
        'Performance-based bonuses',
        'Shared infrastructure costs',
      );
    }

    // Define walk-away points
    const walkAwayPoints = [
      `Royalty rate below ${(marketBenchmarks?.avgRoyaltyRate || 12.5) * 0.7}%`,
      'No audit rights clause',
      'Unlimited liability exposure',
      'No force majeure protection',
    ];

    return {
      approach,
      prioritizedObjectives: prioritizedObjectives.slice(0, 5),
      concessionPoints,
      walkAwayPoints,
    };
  }

  private generateProposedTerms(
    currentTerms?: {
      royaltyRate: number;
      bonusPayment: number;
      primaryTerm: number;
      extensionOptions?: string[];
    },
    marketBenchmarks?: NegotiationInput['marketBenchmarks'],
    strategy?: NegotiationOutput['negotiationStrategy']
  ): NegotiationOutput['proposedTerms'] {
    const current = currentTerms || {
      royaltyRate: 12.5,
      bonusPayment: 500,
      primaryTerm: 3,
    };

    const market = marketBenchmarks || {
      avgRoyaltyRate: 15,
      avgBonusPerAcre: 750,
      typicalTermLength: 3,
    };

    // Calculate proposed terms based on strategy
    let royaltyMultiplier = 1;
    let bonusMultiplier = 1;

    switch (strategy?.approach) {
      case 'competitive':
        royaltyMultiplier = 1.1;
        bonusMultiplier = 1.15;
        break;
      case 'collaborative':
        royaltyMultiplier = 1.05;
        bonusMultiplier = 1.05;
        break;
      case 'accommodating':
        royaltyMultiplier = 0.95;
        bonusMultiplier = 0.9;
        break;
    }

    const proposedRoyalty = Math.min(
      market.avgRoyaltyRate * royaltyMultiplier,
      current.royaltyRate * 1.25 // Max 25% increase
    );

    const proposedBonus = Math.min(
      market.avgBonusPerAcre * bonusMultiplier,
      current.bonusPayment * 1.5 // Max 50% increase
    );

    return {
      royaltyRate: {
        current: current.royaltyRate,
        proposed: Number(proposedRoyalty.toFixed(2)),
        justification: `Market analysis shows average of ${market.avgRoyaltyRate}%. Proposed rate balances market conditions with ${strategy?.approach} negotiation approach.`,
      },
      bonusPayment: {
        current: current.bonusPayment,
        proposed: Math.round(proposedBonus),
        justification: `Current market pays average of $${market.avgBonusPerAcre}/acre. Proposal reflects competitive positioning.`,
      },
      primaryTerm: {
        current: current.primaryTerm,
        proposed: current.primaryTerm, // Keep same for now
        justification: 'Industry standard term length maintained for stability.',
      },
      additionalClauses: [
        'Force majeure protection clause',
        'Annual audit rights with 30-day notice',
        'Environmental compliance with shared remediation costs',
        'Assignment rights with lessor approval',
        'Automatic extension option with production',
      ],
    };
  }

  private createNegotiationPackage(
    contractAnalysis: NegotiationOutput['contractAnalysis'],
    proposedTerms: NegotiationOutput['proposedTerms'],
    strategy: NegotiationOutput['negotiationStrategy']
  ): NegotiationOutput['negotiationPackage'] {
    const executiveSummary = `
LEASE NEGOTIATION EXECUTIVE SUMMARY

Negotiation Approach: ${strategy.approach.toUpperCase()}

KEY PROPOSALS:
• Royalty Rate: ${proposedTerms.royaltyRate.current}% → ${proposedTerms.royaltyRate.proposed}%
• Bonus Payment: $${proposedTerms.bonusPayment.current} → $${proposedTerms.bonusPayment.proposed} per acre
• Primary Term: ${proposedTerms.primaryTerm.proposed} years

CRITICAL ADDITIONS:
${proposedTerms.additionalClauses.map(clause => `• ${clause}`).join('\n')}

RISK MITIGATION:
• ${contractAnalysis.missingClauses.length} missing clauses identified and addressed
• ${contractAnalysis.problematicTerms.length} problematic terms revised

Expected Outcome: Win-win agreement with improved terms and comprehensive protection.
    `.trim();

    const detailedAnalysis = `
DETAILED CONTRACT ANALYSIS

1. CURRENT STATE ASSESSMENT
   - Extracted ${contractAnalysis.extractedClauses.length} key clauses
   - Identified ${contractAnalysis.missingClauses.length} missing protective clauses
   - Found ${contractAnalysis.problematicTerms.length} below-market terms

2. MARKET COMPARISON
   ${proposedTerms.royaltyRate.justification}
   ${proposedTerms.bonusPayment.justification}

3. NEGOTIATION STRATEGY
   Approach: ${strategy.approach}
   Primary Objectives:
   ${strategy.prioritizedObjectives.map((obj, i) => `   ${i + 1}. ${obj}`).join('\n')}

4. PROPOSED IMPROVEMENTS
   ${contractAnalysis.problematicTerms.map(term => 
     `   • ${term.term}: ${term.suggestedRevision}`
   ).join('\n')}

5. RISK ANALYSIS
   Missing Clauses to Add:
   ${contractAnalysis.missingClauses.map(clause => `   • ${clause}`).join('\n')}
    `.trim();

    const proposalDocument = `
FORMAL LEASE AMENDMENT PROPOSAL

This proposal outlines recommended modifications to optimize lease terms while maintaining a productive landlord-tenant relationship.

SECTION 1: FINANCIAL TERMS
- Royalty Rate: Increase from ${proposedTerms.royaltyRate.current}% to ${proposedTerms.royaltyRate.proposed}%
- Bonus Payment: Adjust from $${proposedTerms.bonusPayment.current} to $${proposedTerms.bonusPayment.proposed} per acre
- Payment Terms: Net 30 days with 2% early payment discount

SECTION 2: OPERATIONAL TERMS
- Primary Term: ${proposedTerms.primaryTerm.proposed} years
- Extension Options: Automatic with commercial production
- Development Requirements: Industry standard continuous operations

SECTION 3: PROTECTIVE CLAUSES
${proposedTerms.additionalClauses.map((clause, i) => `${i + 1}. ${clause}`).join('\n')}

SECTION 4: MUTUAL BENEFITS
- Lessor: Improved financial returns, comprehensive protection
- Lessee: Operational flexibility, clear terms, partnership approach

This proposal represents a balanced approach to modernizing lease terms while respecting both parties' interests.
    `.trim();

    return {
      executiveSummary,
      detailedAnalysis,
      proposalDocument,
      supportingData: [
        { type: 'market_analysis', data: 'Market comparison data' },
        { type: 'risk_matrix', data: 'Risk assessment matrix' },
        { type: 'financial_model', data: 'ROI projections' },
      ],
    };
  }

  private assessRisks(
    contractAnalysis: NegotiationOutput['contractAnalysis'],
    proposedTerms: NegotiationOutput['proposedTerms']
  ): NegotiationOutput['riskAssessment'] {
    const specificRisks: NegotiationOutput['riskAssessment']['specificRisks'] = [];

    // Assess risks from missing clauses
    if (contractAnalysis.missingClauses.includes('force_majeure')) {
      specificRisks.push({
        type: 'operational',
        description: 'No protection against unforeseeable events',
        mitigation: 'Include comprehensive force majeure clause',
      });
    }

    if (contractAnalysis.missingClauses.includes('audit_rights')) {
      specificRisks.push({
        type: 'financial',
        description: 'Cannot verify royalty calculations',
        mitigation: 'Add annual audit rights with reasonable notice',
      });
    }

    // Assess risks from terms
    const royaltyIncrease = 
      (proposedTerms.royaltyRate.proposed - proposedTerms.royaltyRate.current) / 
      proposedTerms.royaltyRate.current;

    if (royaltyIncrease > 0.2) {
      specificRisks.push({
        type: 'negotiation',
        description: 'Large royalty increase may face resistance',
        mitigation: 'Propose phased increases or performance triggers',
      });
    }

    // Assess counterparty risks
    specificRisks.push({
      type: 'counterparty',
      description: 'Lessor may have different priorities',
      mitigation: 'Emphasize mutual benefits and long-term partnership',
    });

    // Determine overall risk
    let overallRisk: 'high' | 'medium' | 'low' = 'low';
    if (specificRisks.length > 4) overallRisk = 'high';
    else if (specificRisks.length > 2) overallRisk = 'medium';

    return {
      overallRisk,
      specificRisks,
    };
  }

  private calculateNegotiationScore(
    contractAnalysis: NegotiationOutput['contractAnalysis'],
    proposedTerms: NegotiationOutput['proposedTerms'],
    riskAssessment: NegotiationOutput['riskAssessment']
  ): number {
    let score = 100;

    // Deduct for missing clauses
    score -= contractAnalysis.missingClauses.length * 5;

    // Deduct for problematic terms
    score -= contractAnalysis.problematicTerms.length * 3;

    // Deduct for risks
    score -= riskAssessment.specificRisks.length * 2;

    // Add for improvements
    const improvements = 
      (proposedTerms.royaltyRate.proposed > proposedTerms.royaltyRate.current ? 5 : 0) +
      (proposedTerms.bonusPayment.proposed > proposedTerms.bonusPayment.current ? 5 : 0) +
      (proposedTerms.additionalClauses.length * 2);

    score += Math.min(improvements, 20);

    return Math.max(0, Math.min(100, score));
  }
}

// Export singleton instance
export const negotiationVanguard = new NegotiationVanguard();