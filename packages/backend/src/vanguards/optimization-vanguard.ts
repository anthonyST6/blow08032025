import { VanguardAgent, AgentResult, LLMOutput, AgentFlag } from '../agents/base.agent';

export interface OptimizationInput extends LLMOutput {
  leaseData?: {
    id: string;
    expirationDate: Date;
    annualRevenue: number;
    royaltyRate: number;
    acreage: number;
    productionData?: any[];
    marketData?: any;
  }[];
  portfolioData?: {
    totalLeases: number;
    totalRevenue: number;
    averageROI: number;
  };
  marketConditions?: {
    oilPrice: number;
    gasPrice: number;
    demandForecast: string;
  };
}

export interface OptimizationOutput extends AgentResult {
  financialMetrics: {
    totalPortfolioValue: number;
    projectedRevenue: number;
    riskScore: number;
    optimizationPotential: number;
  };
  recommendations: Array<{
    leaseId: string;
    action: 'renew' | 'renegotiate' | 'terminate' | 'hold';
    confidence: number;
    financialImpact: number;
    reasoning: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  scenarioAnalysis?: Array<{
    scenario: string;
    impact: number;
    probability: number;
  }>;
  portfolioOptimization: {
    suggestedActions: number;
    potentialSavings: number;
    riskReduction: number;
  };
}

export class OptimizationVanguard extends VanguardAgent {
  constructor() {
    super(
      'optimization-vanguard',
      'Optimization Vanguard',
      '1.0.0',
      'Financial modeling, ROI calculations, and portfolio optimization for oilfield leases',
      {
        thresholds: {
          low: 60,
          medium: 75,
          high: 85,
          critical: 95,
        },
      }
    );
  }

  async analyze(input: OptimizationInput): Promise<OptimizationOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting optimization analysis', { 
      leaseCount: input.leaseData?.length || 0 
    });

    try {
      this.validateInput(input);

      const flags: AgentFlag[] = [];
      const recommendations: OptimizationOutput['recommendations'] = [];
      
      // Analyze each lease
      const leaseAnalysis = await this.analyzeLeases(input.leaseData || [], input.marketConditions);
      recommendations.push(...leaseAnalysis.recommendations);
      flags.push(...leaseAnalysis.flags);

      // Calculate portfolio metrics
      const financialMetrics = this.calculateFinancialMetrics(
        input.leaseData || [], 
        input.portfolioData,
        recommendations
      );

      // Perform scenario analysis
      const scenarioAnalysis = this.performScenarioAnalysis(
        input.leaseData || [],
        input.marketConditions
      );

      // Calculate optimization score
      const optimizationScore = this.calculateOptimizationScore(
        financialMetrics,
        recommendations
      );

      // Portfolio optimization summary
      const portfolioOptimization = {
        suggestedActions: recommendations.filter(r => r.action !== 'hold').length,
        potentialSavings: recommendations.reduce((sum, r) => 
          r.action === 'terminate' ? sum + Math.abs(r.financialImpact) : sum, 0
        ),
        riskReduction: this.calculateRiskReduction(recommendations)
      };

      const result: OptimizationOutput = {
        ...this.createResult(
          optimizationScore,
          flags,
          {
            analyzedLeases: input.leaseData?.length || 0,
            recommendedActions: recommendations.length,
            processingTime: Date.now() - startTime,
          },
          0.92,
          startTime
        ),
        financialMetrics,
        recommendations,
        scenarioAnalysis,
        portfolioOptimization,
      };

      this.log('info', 'Optimization analysis completed', {
        score: optimizationScore,
        recommendations: recommendations.length,
        potentialValue: financialMetrics.optimizationPotential,
      });

      return result;
    } catch (error) {
      this.log('error', 'Optimization analysis failed', { error });
      throw error;
    }
  }

  private async analyzeLeases(
    leases: OptimizationInput['leaseData'] = [],
    marketConditions?: OptimizationInput['marketConditions']
  ): Promise<{ recommendations: OptimizationOutput['recommendations']; flags: AgentFlag[] }> {
    const recommendations: OptimizationOutput['recommendations'] = [];
    const flags: AgentFlag[] = [];

    for (const lease of leases) {
      const daysToExpiration = this.calculateDaysToExpiration(lease.expirationDate);
      const roi = this.calculateLeaseROI(lease, marketConditions);
      const riskScore = this.assessLeaseRisk(lease, daysToExpiration);

      // Decision logic
      let action: 'renew' | 'renegotiate' | 'terminate' | 'hold' = 'hold';
      let confidence = 0;
      let reasoning = '';
      let priority: 'high' | 'medium' | 'low' = 'low';
      let financialImpact = 0;

      if (daysToExpiration <= 90 && roi > 25) {
        action = 'renew';
        confidence = 0.94;
        reasoning = `High ROI (${roi.toFixed(1)}%) with expiration in ${daysToExpiration} days`;
        priority = 'high';
        financialImpact = lease.annualRevenue * 3; // 3-year renewal
        
        flags.push(this.createFlag(
          'high',
          'expiring_high_value_lease',
          `Lease ${lease.id} expiring soon with high ROI`,
          { leaseId: lease.id, roi, daysToExpiration }
        ));
      } else if (daysToExpiration <= 180 && roi > 15 && roi <= 25) {
        action = 'renegotiate';
        confidence = 0.87;
        reasoning = `Moderate ROI (${roi.toFixed(1)}%) - opportunity to improve terms`;
        priority = 'medium';
        financialImpact = lease.annualRevenue * 0.15; // 15% improvement potential
      } else if (roi < 10 || riskScore > 80) {
        action = 'terminate';
        confidence = 0.91;
        reasoning = `Low ROI (${roi.toFixed(1)}%) or high risk (${riskScore})`;
        priority = roi < 5 ? 'high' : 'medium';
        financialImpact = -lease.annualRevenue; // Negative to show cost avoidance
        
        flags.push(this.createFlag(
          'medium',
          'underperforming_lease',
          `Lease ${lease.id} underperforming`,
          { leaseId: lease.id, roi, riskScore }
        ));
      }

      if (action !== 'hold') {
        recommendations.push({
          leaseId: lease.id,
          action,
          confidence,
          financialImpact,
          reasoning,
          priority,
        });
      }
    }

    return { recommendations, flags };
  }

  private calculateLeaseROI(
    lease: NonNullable<OptimizationInput['leaseData']>[0],
    marketConditions?: OptimizationInput['marketConditions']
  ): number {
    // Simplified ROI calculation
    const baseROI = (lease.annualRevenue / (lease.acreage * 500)) * 100; // Assume $500/acre cost
    
    // Adjust for market conditions
    let marketMultiplier = 1;
    if (marketConditions) {
      const oilPriceBaseline = 70; // $70/barrel baseline
      marketMultiplier = marketConditions.oilPrice / oilPriceBaseline;
    }

    return baseROI * marketMultiplier;
  }

  private calculateDaysToExpiration(expirationDate: Date): number {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private assessLeaseRisk(
    lease: NonNullable<OptimizationInput['leaseData']>[0],
    daysToExpiration: number
  ): number {
    let riskScore = 0;

    // Expiration risk
    if (daysToExpiration < 30) riskScore += 40;
    else if (daysToExpiration < 90) riskScore += 20;
    else if (daysToExpiration < 180) riskScore += 10;

    // Revenue risk
    if (lease.annualRevenue < 100000) riskScore += 20;
    else if (lease.annualRevenue < 500000) riskScore += 10;

    // Production risk (if data available)
    if (lease.productionData && lease.productionData.length > 0) {
      // Check for declining production
      const recentProduction = lease.productionData.slice(-6);
      const trend = this.calculateTrend(recentProduction);
      if (trend < -0.1) riskScore += 30; // Declining more than 10%
    }

    return Math.min(riskScore, 100);
  }

  private calculateTrend(data: any[]): number {
    // Simple linear regression for trend
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + (d.value || 0), 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * (d.value || 0), 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;

    return avgY > 0 ? slope / avgY : 0; // Return percentage change
  }

  private calculateFinancialMetrics(
    leases: NonNullable<OptimizationInput['leaseData']>,
    _portfolioData?: OptimizationInput['portfolioData'],
    recommendations?: OptimizationOutput['recommendations']
  ): OptimizationOutput['financialMetrics'] {
    const totalRevenue = leases.reduce((sum, lease) => sum + lease.annualRevenue, 0);
    const totalValue = totalRevenue * 3; // Simple 3x multiple

    const projectedRevenue = totalRevenue + 
      (recommendations?.reduce((sum, r) => sum + (r.financialImpact > 0 ? r.financialImpact : 0), 0) || 0);

    const riskScore = leases.reduce((sum, lease) => {
      const days = this.calculateDaysToExpiration(lease.expirationDate);
      return sum + this.assessLeaseRisk(lease, days);
    }, 0) / leases.length;

    const optimizationPotential = recommendations?.reduce((sum, r) => 
      sum + Math.abs(r.financialImpact), 0
    ) || 0;

    return {
      totalPortfolioValue: totalValue,
      projectedRevenue,
      riskScore,
      optimizationPotential,
    };
  }

  private performScenarioAnalysis(
    leases: NonNullable<OptimizationInput['leaseData']>,
    _marketConditions?: OptimizationInput['marketConditions']
  ): OptimizationOutput['scenarioAnalysis'] {
    const scenarios: OptimizationOutput['scenarioAnalysis'] = [];

    // Oil price scenarios
    const totalRevenue = leases.reduce((sum, lease) => sum + lease.annualRevenue, 0);

    scenarios.push({
      scenario: 'Oil price +20%',
      impact: totalRevenue * 0.15, // 15% revenue increase
      probability: 0.3,
    });

    scenarios.push({
      scenario: 'Oil price -20%',
      impact: -totalRevenue * 0.15, // 15% revenue decrease
      probability: 0.3,
    });

    scenarios.push({
      scenario: 'Regulatory changes',
      impact: -totalRevenue * 0.05, // 5% cost increase
      probability: 0.2,
    });

    scenarios.push({
      scenario: 'Technology improvements',
      impact: totalRevenue * 0.08, // 8% efficiency gain
      probability: 0.4,
    });

    return scenarios;
  }

  private calculateOptimizationScore(
    metrics: OptimizationOutput['financialMetrics'],
    recommendations: OptimizationOutput['recommendations']
  ): number {
    let score = 100;

    // Deduct for risk
    score -= metrics.riskScore * 0.3;

    // Add for optimization actions
    score += Math.min(recommendations.length * 2, 20);

    // Add for positive financial impact
    const positiveImpact = recommendations.filter(r => r.financialImpact > 0).length;
    score += Math.min(positiveImpact * 3, 15);

    return Math.max(0, Math.min(100, score));
  }

  private calculateRiskReduction(
    recommendations: OptimizationOutput['recommendations']
  ): number {
    const terminatedLeases = recommendations.filter(r => r.action === 'terminate').length;
    const renewedLeases = recommendations.filter(r => r.action === 'renew').length;
    
    return (terminatedLeases * 5 + renewedLeases * 3) / recommendations.length;
  }
}

// Export singleton instance
export const optimizationVanguard = new OptimizationVanguard();