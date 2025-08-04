import { VanguardAgent, LLMOutput, AgentResult, AgentFlag } from './base.agent';
import { 
  LandLease, 
  LeaseStatus, 
  ComplianceCategory,
  ExpirationAlert 
} from '../domains/energy/types';

export class EnergyLeaseAgent extends VanguardAgent {
  constructor() {
    super(
      'energy-lease-analyzer',
      'Energy Lease Risk Analyzer',
      '1.0.0',
      'Analyzes energy sector lease agreements for risks, compliance issues, and optimization opportunities',
      {
        customSettings: {
          royaltyThreshold: 0.125, // 12.5% minimum expected royalty
          bonusPerAcreMin: 100,
          rentalPerAcreMin: 10,
          expirationWarningDays: 90,
          complianceScoreThreshold: 80
        }
      }
    );
  }

  async analyze(input: LLMOutput): Promise<AgentResult> {
    const startTime = Date.now();
    this.validateInput(input);

    try {
      const flags: AgentFlag[] = [];
      let score = 100;
      let confidence = 1.0;

      // Extract lease-related information from the text
      const leaseData = this.extractLeaseData(input.text);

      // Check royalty terms
      const royaltyAnalysis = this.analyzeRoyaltyTerms(input.text, leaseData);
      if (royaltyAnalysis.hasIssues) {
        flags.push(...royaltyAnalysis.flags);
        score -= royaltyAnalysis.penalty;
      }

      // Check bonus and rental terms
      const financialAnalysis = this.analyzeFinancialTerms(input.text, leaseData);
      if (financialAnalysis.hasIssues) {
        flags.push(...financialAnalysis.flags);
        score -= financialAnalysis.penalty;
      }

      // Check for unfavorable clauses
      const clauseAnalysis = this.analyzeUnfavorableClauses(input.text);
      if (clauseAnalysis.hasIssues) {
        flags.push(...clauseAnalysis.flags);
        score -= clauseAnalysis.penalty;
        confidence *= 0.9;
      }

      // Check compliance requirements
      const complianceAnalysis = this.analyzeComplianceRequirements(input.text);
      if (complianceAnalysis.hasIssues) {
        flags.push(...complianceAnalysis.flags);
        score -= complianceAnalysis.penalty;
      }

      // Check expiration and deadline risks
      const expirationAnalysis = this.analyzeExpirationRisks(input.text, leaseData);
      if (expirationAnalysis.hasIssues) {
        flags.push(...expirationAnalysis.flags);
        score -= expirationAnalysis.penalty;
      }

      // Check for missing critical provisions
      const provisionAnalysis = this.analyzeMissingProvisions(input.text);
      if (provisionAnalysis.hasIssues) {
        flags.push(...provisionAnalysis.flags);
        score -= provisionAnalysis.penalty;
        confidence *= 0.95;
      }

      return this.createResult(
        Math.max(0, Math.min(100, score)),
        flags,
        {
          leaseData,
          analysisCategories: {
            royaltyTerms: royaltyAnalysis.summary,
            financialTerms: financialAnalysis.summary,
            unfavorableClauses: clauseAnalysis.summary,
            compliance: complianceAnalysis.summary,
            expirationRisks: expirationAnalysis.summary,
            missingProvisions: provisionAnalysis.summary
          }
        },
        confidence,
        startTime
      );
    } catch (error) {
      this.log('error', 'Error during energy lease analysis', { error });
      throw error;
    }
  }

  private extractLeaseData(text: string): Partial<LandLease> {
    const data: any = {};

    // Extract royalty percentage
    const royaltyMatch = text.match(/royalty.*?(\d+(?:\.\d+)?)\s*%/i);
    if (royaltyMatch) {
      data.royaltyPercentage = parseFloat(royaltyMatch[1]) / 100;
    }

    // Extract bonus amount
    const bonusMatch = text.match(/bonus.*?\$\s*([\d,]+(?:\.\d+)?)/i);
    if (bonusMatch) {
      data.bonusAmount = parseFloat(bonusMatch[1].replace(/,/g, ''));
    }

    // Extract rental amount
    const rentalMatch = text.match(/rental.*?\$\s*([\d,]+(?:\.\d+)?)/i);
    if (rentalMatch) {
      data.rentalAmount = parseFloat(rentalMatch[1].replace(/,/g, ''));
    }

    // Extract term length
    const termMatch = text.match(/primary\s+term.*?(\d+)\s*years?/i);
    if (termMatch) {
      data.primaryTermYears = parseInt(termMatch[1]);
    }

    // Extract acreage
    const acreageMatch = text.match(/(\d+(?:\.\d+)?)\s*acres?/i);
    if (acreageMatch) {
      data.acres = parseFloat(acreageMatch[1]);
    }

    return data;
  }

  private analyzeRoyaltyTerms(text: string, leaseData: any): any {
    const flags: AgentFlag[] = [];
    let penalty = 0;
    const summary: any = {};

    // Check royalty percentage
    if (leaseData.royaltyPercentage) {
      summary.royaltyPercentage = leaseData.royaltyPercentage;
      
      if (leaseData.royaltyPercentage < this.config.customSettings?.royaltyThreshold) {
        flags.push(this.createFlag(
          'high',
          'low_royalty_rate',
          `Royalty rate of ${(leaseData.royaltyPercentage * 100).toFixed(2)}% is below industry standard`,
          { 
            rate: leaseData.royaltyPercentage,
            threshold: this.config.customSettings?.royaltyThreshold 
          }
        ));
        penalty += 20;
      }
    }

    // Check for cost deductions
    const deductionPatterns = [
      /deduct.*?(transportation|processing|marketing)/i,
      /post-production\s+costs/i,
      /net-back/i
    ];

    for (const pattern of deductionPatterns) {
      if (pattern.test(text)) {
        flags.push(this.createFlag(
          'medium',
          'royalty_deductions',
          'Lease allows deductions from royalty payments',
          { pattern: pattern.source }
        ));
        penalty += 10;
        summary.hasDeductions = true;
        break;
      }
    }

    // Check for minimum royalty provisions
    if (!/minimum\s+royalty/i.test(text)) {
      flags.push(this.createFlag(
        'low',
        'no_minimum_royalty',
        'No minimum royalty provision found',
        {}
      ));
      penalty += 5;
      summary.hasMinimumRoyalty = false;
    }

    return {
      hasIssues: flags.length > 0,
      flags,
      penalty,
      summary
    };
  }

  private analyzeFinancialTerms(text: string, leaseData: any): any {
    const flags: AgentFlag[] = [];
    let penalty = 0;
    const summary: any = {};

    // Check bonus amount
    if (leaseData.bonusAmount && leaseData.acres) {
      const bonusPerAcre = leaseData.bonusAmount / leaseData.acres;
      summary.bonusPerAcre = bonusPerAcre;

      if (bonusPerAcre < this.config.customSettings?.bonusPerAcreMin) {
        flags.push(this.createFlag(
          'medium',
          'low_bonus_payment',
          `Bonus payment of $${bonusPerAcre.toFixed(2)}/acre is below market rate`,
          { 
            bonusPerAcre,
            threshold: this.config.customSettings?.bonusPerAcreMin 
          }
        ));
        penalty += 15;
      }
    }

    // Check rental amount
    if (leaseData.rentalAmount && leaseData.acres) {
      const rentalPerAcre = leaseData.rentalAmount / leaseData.acres;
      summary.rentalPerAcre = rentalPerAcre;

      if (rentalPerAcre < this.config.customSettings?.rentalPerAcreMin) {
        flags.push(this.createFlag(
          'low',
          'low_rental_payment',
          `Annual rental of $${rentalPerAcre.toFixed(2)}/acre is below market rate`,
          { 
            rentalPerAcre,
            threshold: this.config.customSettings?.rentalPerAcreMin 
          }
        ));
        penalty += 10;
      }
    }

    // Check payment terms
    if (/deferred\s+payment|installment/i.test(text)) {
      flags.push(this.createFlag(
        'low',
        'deferred_payments',
        'Payments are deferred or in installments',
        {}
      ));
      penalty += 5;
      summary.hasDeferredPayments = true;
    }

    return {
      hasIssues: flags.length > 0,
      flags,
      penalty,
      summary
    };
  }

  private analyzeUnfavorableClauses(text: string): any {
    const flags: AgentFlag[] = [];
    let penalty = 0;
    const summary: any = { unfavorableClauses: [] };

    const unfavorablePatterns = [
      {
        pattern: /force\s+majeure.*?lessee/i,
        type: 'broad_force_majeure',
        message: 'Broad force majeure clause favoring lessee',
        severity: 'medium' as const,
        penalty: 10
      },
      {
        pattern: /warranty\s+of\s+title.*?limited|no\s+warranty/i,
        type: 'limited_title_warranty',
        message: 'Limited or no warranty of title',
        severity: 'high' as const,
        penalty: 20
      },
      {
        pattern: /pooling.*?without\s+consent/i,
        type: 'forced_pooling',
        message: 'Allows pooling without lessor consent',
        severity: 'high' as const,
        penalty: 15
      },
      {
        pattern: /shut-in.*?indefinite|no\s+limit/i,
        type: 'indefinite_shut_in',
        message: 'Indefinite shut-in provisions',
        severity: 'medium' as const,
        penalty: 10
      },
      {
        pattern: /assignment.*?without\s+consent/i,
        type: 'free_assignment',
        message: 'Allows assignment without lessor consent',
        severity: 'medium' as const,
        penalty: 10
      }
    ];

    for (const clause of unfavorablePatterns) {
      if (clause.pattern.test(text)) {
        flags.push(this.createFlag(
          clause.severity,
          clause.type,
          clause.message,
          {}
        ));
        penalty += clause.penalty;
        summary.unfavorableClauses.push(clause.type);
      }
    }

    return {
      hasIssues: flags.length > 0,
      flags,
      penalty,
      summary
    };
  }

  private analyzeComplianceRequirements(text: string): any {
    const flags: AgentFlag[] = [];
    let penalty = 0;
    const summary: any = { complianceAreas: [] };

    // Check for environmental compliance
    if (!/environmental|EPA|pollution|contamination/i.test(text)) {
      flags.push(this.createFlag(
        'medium',
        'missing_environmental_provisions',
        'No environmental compliance provisions found',
        {}
      ));
      penalty += 15;
    } else {
      summary.complianceAreas.push('environmental');
    }

    // Check for regulatory compliance
    if (!/regulatory|commission|permit|license/i.test(text)) {
      flags.push(this.createFlag(
        'low',
        'limited_regulatory_provisions',
        'Limited regulatory compliance provisions',
        {}
      ));
      penalty += 10;
    } else {
      summary.complianceAreas.push('regulatory');
    }

    // Check for reporting requirements
    if (!/report|audit|inspection|records/i.test(text)) {
      flags.push(this.createFlag(
        'low',
        'no_reporting_requirements',
        'No clear reporting or audit requirements',
        {}
      ));
      penalty += 5;
    } else {
      summary.complianceAreas.push('reporting');
    }

    return {
      hasIssues: flags.length > 0,
      flags,
      penalty,
      summary
    };
  }

  private analyzeExpirationRisks(text: string, leaseData: any): any {
    const flags: AgentFlag[] = [];
    let penalty = 0;
    const summary: any = {};

    // Check primary term length
    if (leaseData.primaryTermYears) {
      summary.primaryTermYears = leaseData.primaryTermYears;
      
      if (leaseData.primaryTermYears < 3) {
        flags.push(this.createFlag(
          'medium',
          'short_primary_term',
          `Primary term of ${leaseData.primaryTermYears} years is relatively short`,
          { years: leaseData.primaryTermYears }
        ));
        penalty += 10;
      }
    }

    // Check for automatic termination
    if (/automatic.*?terminat|cease.*?automatically/i.test(text)) {
      flags.push(this.createFlag(
        'high',
        'automatic_termination_risk',
        'Lease contains automatic termination provisions',
        {}
      ));
      penalty += 15;
      summary.hasAutomaticTermination = true;
    }

    // Check for continuous operations clause
    if (!/continuous\s+operations|operations\s+clause/i.test(text)) {
      flags.push(this.createFlag(
        'medium',
        'no_continuous_operations',
        'No continuous operations clause to extend lease',
        {}
      ));
      penalty += 10;
      summary.hasContinuousOperations = false;
    }

    // Check for grace periods
    if (!/grace\s+period/i.test(text)) {
      flags.push(this.createFlag(
        'low',
        'no_grace_period',
        'No grace period provisions for payments',
        {}
      ));
      penalty += 5;
      summary.hasGracePeriod = false;
    }

    return {
      hasIssues: flags.length > 0,
      flags,
      penalty,
      summary
    };
  }

  private analyzeMissingProvisions(text: string): any {
    const flags: AgentFlag[] = [];
    let penalty = 0;
    const summary: any = { missingProvisions: [] };

    const criticalProvisions = [
      {
        pattern: /pugh\s+clause|vertical\s+pugh/i,
        type: 'pugh_clause',
        message: 'No Pugh clause for releasing non-producing acreage'
      },
      {
        pattern: /depth\s+limitation|depth\s+severance/i,
        type: 'depth_limitation',
        message: 'No depth limitation or severance provisions'
      },
      {
        pattern: /favored\s+nations|most\s+favored/i,
        type: 'favored_nations',
        message: 'No most favored nations clause'
      },
      {
        pattern: /surface\s+damage|surface\s+use/i,
        type: 'surface_protection',
        message: 'Limited surface damage or use provisions'
      },
      {
        pattern: /indemnif|hold\s+harmless/i,
        type: 'indemnification',
        message: 'No indemnification provisions'
      }
    ];

    for (const provision of criticalProvisions) {
      if (!provision.pattern.test(text)) {
        flags.push(this.createFlag(
          'medium',
          `missing_${provision.type}`,
          provision.message,
          {}
        ));
        penalty += 8;
        summary.missingProvisions.push(provision.type);
      }
    }

    return {
      hasIssues: flags.length > 0,
      flags,
      penalty,
      summary
    };
  }
}

// Register the agent
import { agentRegistry } from './base.agent';
agentRegistry.register(new EnergyLeaseAgent());