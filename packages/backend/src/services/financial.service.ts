import { logger } from '../utils/logger';
import { Lease } from './lease.service';
import { v4 as uuidv4 } from 'uuid';

export interface FinancialMetrics {
  npv: number; // Net Present Value
  irr: number; // Internal Rate of Return
  paybackPeriod: number; // Years
  roi: number; // Return on Investment percentage
  breakEvenPoint: number; // Years
}

export interface CashFlow {
  year: number;
  revenue: number;
  costs: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  discountedCashFlow: number;
}

export interface LeaseFinancialAnalysis {
  leaseId: string;
  metrics: FinancialMetrics;
  cashFlows: CashFlow[];
  assumptions: {
    discountRate: number;
    escalationRate: number;
    operatingCostRatio: number;
    taxRate: number;
  };
  sensitivity: {
    oilPriceImpact: Array<{ price: number; npv: number }>;
    productionImpact: Array<{ volume: number; npv: number }>;
    costImpact: Array<{ costChange: number; npv: number }>;
  };
  recommendation: {
    action: 'renew' | 'renegotiate' | 'terminate' | 'hold';
    confidence: number;
    reasoning: string;
  };
}

export interface PortfolioAnalysis {
  totalNPV: number;
  totalRevenue: number;
  totalInvestment: number;
  averageROI: number;
  riskScore: number;
  diversificationScore: number;
  topPerformers: Array<{ leaseId: string; npv: number; roi: number }>;
  underperformers: Array<{ leaseId: string; npv: number; roi: number }>;
  optimizationOpportunities: Array<{
    type: 'divest' | 'invest' | 'renegotiate';
    leaseIds: string[];
    potentialValue: number;
    description: string;
  }>;
}

export interface MarketData {
  oilPrice: number; // $/barrel
  gasPrice: number; // $/mcf
  inflationRate: number; // percentage
  interestRate: number; // percentage
  industryMultiples: {
    ebitdaMultiple: number;
    revenueMultiple: number;
  };
}

export interface ScenarioAnalysis {
  id: string;
  name: string;
  description: string;
  assumptions: {
    oilPriceChange: number; // percentage
    productionChange: number; // percentage
    costChange: number; // percentage
    regulatoryImpact: number; // cost multiplier
  };
  results: {
    portfolioNPV: number;
    npvChange: number; // percentage
    affectedLeases: number;
    recommendation: string;
  };
}

class FinancialService {
  private defaultMarketData: MarketData = {
    oilPrice: 75,
    gasPrice: 3.5,
    inflationRate: 2.5,
    interestRate: 5,
    industryMultiples: {
      ebitdaMultiple: 4.5,
      revenueMultiple: 2.5,
    },
  };

  /**
   * Perform comprehensive financial analysis for a lease
   */
  async analyzeLeaseFinancials(
    lease: Lease,
    marketData?: Partial<MarketData>
  ): Promise<LeaseFinancialAnalysis> {
    const market = { ...this.defaultMarketData, ...marketData };
    
    // Calculate cash flows
    const cashFlows = this.projectCashFlows(lease, market);
    
    // Calculate financial metrics
    const metrics = this.calculateFinancialMetrics(cashFlows, market.interestRate / 100);
    
    // Perform sensitivity analysis
    const sensitivity = this.performSensitivityAnalysis(lease, market);
    
    // Generate recommendation
    const recommendation = this.generateFinancialRecommendation(metrics, lease);
    
    return {
      leaseId: lease.id,
      metrics,
      cashFlows,
      assumptions: {
        discountRate: market.interestRate,
        escalationRate: market.inflationRate,
        operatingCostRatio: 0.65, // 65% of revenue
        taxRate: 0.21, // 21% corporate tax
      },
      sensitivity,
      recommendation,
    };
  }

  /**
   * Analyze entire lease portfolio
   */
  async analyzePortfolio(
    leases: Lease[],
    marketData?: Partial<MarketData>
  ): Promise<PortfolioAnalysis> {
    const market = { ...this.defaultMarketData, ...marketData };
    
    let totalNPV = 0;
    let totalRevenue = 0;
    let totalInvestment = 0;
    const leaseAnalyses: LeaseFinancialAnalysis[] = [];
    
    // Analyze each lease
    for (const lease of leases) {
      const analysis = await this.analyzeLeaseFinancials(lease, market);
      leaseAnalyses.push(analysis);
      
      totalNPV += analysis.metrics.npv;
      totalRevenue += lease.financial.annualRevenue;
      totalInvestment += lease.financial.totalInvestment;
    }
    
    // Calculate portfolio metrics
    const averageROI = leaseAnalyses.reduce((sum, a) => sum + a.metrics.roi, 0) / leaseAnalyses.length;
    const riskScore = this.calculatePortfolioRisk(leases);
    const diversificationScore = this.calculateDiversification(leases);
    
    // Identify top and underperformers
    const sortedByNPV = leaseAnalyses.sort((a, b) => b.metrics.npv - a.metrics.npv);
    const topPerformers = sortedByNPV.slice(0, 5).map(a => ({
      leaseId: a.leaseId,
      npv: a.metrics.npv,
      roi: a.metrics.roi,
    }));
    
    const underperformers = sortedByNPV.slice(-5).map(a => ({
      leaseId: a.leaseId,
      npv: a.metrics.npv,
      roi: a.metrics.roi,
    }));
    
    // Identify optimization opportunities
    const optimizationOpportunities = this.identifyOptimizationOpportunities(
      leases,
      leaseAnalyses
    );
    
    return {
      totalNPV,
      totalRevenue,
      totalInvestment,
      averageROI,
      riskScore,
      diversificationScore,
      topPerformers,
      underperformers,
      optimizationOpportunities,
    };
  }

  /**
   * Run scenario analysis
   */
  async runScenarioAnalysis(
    leases: Lease[],
    scenarios: Array<Omit<ScenarioAnalysis, 'id' | 'results'>>
  ): Promise<ScenarioAnalysis[]> {
    const results: ScenarioAnalysis[] = [];
    const baselineAnalysis = await this.analyzePortfolio(leases);
    
    for (const scenario of scenarios) {
      // Adjust market data based on scenario
      const adjustedMarket: MarketData = {
        ...this.defaultMarketData,
        oilPrice: this.defaultMarketData.oilPrice * (1 + scenario.assumptions.oilPriceChange / 100),
        gasPrice: this.defaultMarketData.gasPrice * (1 + scenario.assumptions.oilPriceChange / 100),
      };
      
      // Adjust lease data based on scenario
      const adjustedLeases = leases.map(lease => ({
        ...lease,
        financial: {
          ...lease.financial,
          annualRevenue: lease.financial.annualRevenue * 
            (1 + scenario.assumptions.productionChange / 100) *
            (1 + scenario.assumptions.oilPriceChange / 100),
        },
      }));
      
      // Run analysis with adjusted data
      const scenarioPortfolio = await this.analyzePortfolio(adjustedLeases, adjustedMarket);
      
      const npvChange = ((scenarioPortfolio.totalNPV - baselineAnalysis.totalNPV) / 
        baselineAnalysis.totalNPV) * 100;
      
      results.push({
        id: uuidv4(),
        ...scenario,
        results: {
          portfolioNPV: scenarioPortfolio.totalNPV,
          npvChange,
          affectedLeases: leases.length,
          recommendation: this.generateScenarioRecommendation(npvChange, scenario),
        },
      });
    }
    
    return results;
  }

  /**
   * Calculate lease valuation
   */
  async calculateLeaseValuation(
    lease: Lease,
    method: 'dcf' | 'multiples' | 'comparable' = 'dcf',
    marketData?: Partial<MarketData>
  ): Promise<{
    value: number;
    method: string;
    confidence: number;
    breakdown: any;
  }> {
    const market = { ...this.defaultMarketData, ...marketData };
    
    switch (method) {
      case 'dcf': {
        const analysis = await this.analyzeLeaseFinancials(lease, market);
        return {
          value: analysis.metrics.npv,
          method: 'Discounted Cash Flow',
          confidence: 0.85,
          breakdown: {
            npv: analysis.metrics.npv,
            terminalValue: this.calculateTerminalValue(lease, market),
            discountRate: market.interestRate,
          },
        };
      }
      
      case 'multiples': {
        const ebitda = lease.financial.annualRevenue * 0.35; // Assume 35% EBITDA margin
        const revenueMultipleValue = lease.financial.annualRevenue * market.industryMultiples.revenueMultiple;
        const ebitdaMultipleValue = ebitda * market.industryMultiples.ebitdaMultiple;
        const value = (revenueMultipleValue + ebitdaMultipleValue) / 2;
        
        return {
          value,
          method: 'Industry Multiples',
          confidence: 0.75,
          breakdown: {
            revenueMultiple: market.industryMultiples.revenueMultiple,
            ebitdaMultiple: market.industryMultiples.ebitdaMultiple,
            impliedRevenue: revenueMultipleValue,
            impliedEBITDA: ebitdaMultipleValue,
          },
        };
      }
      
      case 'comparable': {
        // Simplified comparable analysis
        const comparableValue = lease.financial.annualRevenue * 3; // 3x revenue
        return {
          value: comparableValue,
          method: 'Comparable Transactions',
          confidence: 0.70,
          breakdown: {
            comparableMultiple: 3,
            adjustments: 'Location, size, and term adjustments applied',
          },
        };
      }
      
      default:
        throw new Error(`Unknown valuation method: ${method}`);
    }
  }

  /**
   * Project cash flows for a lease
   */
  private projectCashFlows(lease: Lease, market: MarketData): CashFlow[] {
    const cashFlows: CashFlow[] = [];
    const yearsRemaining = this.calculateYearsRemaining(lease.terms.expirationDate);
    const operatingCostRatio = 0.65;
    const taxRate = 0.21;
    
    let cumulativeCashFlow = 0;
    
    for (let year = 1; year <= yearsRemaining; year++) {
      // Revenue with escalation
      const revenue = lease.financial.annualRevenue * 
        Math.pow(1 + market.inflationRate / 100, year - 1);
      
      // Operating costs
      const operatingCosts = revenue * operatingCostRatio;
      
      // EBITDA
      const ebitda = revenue - operatingCosts;
      
      // Tax
      const tax = ebitda * taxRate;
      
      // Net cash flow
      const netCashFlow = ebitda - tax;
      
      // Cumulative cash flow
      cumulativeCashFlow += netCashFlow;
      
      // Discounted cash flow
      const discountFactor = Math.pow(1 + market.interestRate / 100, year);
      const discountedCashFlow = netCashFlow / discountFactor;
      
      cashFlows.push({
        year,
        revenue,
        costs: operatingCosts + tax,
        netCashFlow,
        cumulativeCashFlow,
        discountedCashFlow,
      });
    }
    
    return cashFlows;
  }

  /**
   * Calculate financial metrics from cash flows
   */
  private calculateFinancialMetrics(cashFlows: CashFlow[], discountRate: number): FinancialMetrics {
    // NPV
    const npv = cashFlows.reduce((sum, cf) => sum + cf.discountedCashFlow, 0);
    
    // IRR (simplified calculation)
    const irr = this.calculateIRR(cashFlows);
    
    // Payback period
    const paybackPeriod = this.calculatePaybackPeriod(cashFlows);
    
    // ROI
    const totalInvestment = Math.abs(cashFlows[0]?.costs || 0);
    const totalReturn = cashFlows[cashFlows.length - 1]?.cumulativeCashFlow || 0;
    const roi = totalInvestment > 0 ? ((totalReturn - totalInvestment) / totalInvestment) * 100 : 0;
    
    // Break-even point
    const breakEvenPoint = cashFlows.findIndex(cf => cf.cumulativeCashFlow > 0) + 1;
    
    return {
      npv,
      irr,
      paybackPeriod,
      roi,
      breakEvenPoint: breakEvenPoint > 0 ? breakEvenPoint : cashFlows.length,
    };
  }

  /**
   * Calculate IRR using Newton's method (simplified)
   */
  private calculateIRR(cashFlows: CashFlow[]): number {
    let rate = 0.1; // Initial guess 10%
    const maxIterations = 100;
    const tolerance = 0.0001;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;
      
      for (let j = 0; j < cashFlows.length; j++) {
        const cf = cashFlows[j].netCashFlow;
        const t = j + 1;
        npv += cf / Math.pow(1 + rate, t);
        dnpv -= t * cf / Math.pow(1 + rate, t + 1);
      }
      
      const newRate = rate - npv / dnpv;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate * 100; // Return as percentage
      }
      
      rate = newRate;
    }
    
    return rate * 100; // Return as percentage
  }

  /**
   * Calculate payback period
   */
  private calculatePaybackPeriod(cashFlows: CashFlow[]): number {
    for (let i = 0; i < cashFlows.length; i++) {
      if (cashFlows[i].cumulativeCashFlow > 0) {
        // Interpolate for partial year
        if (i > 0) {
          const prevCumulative = i > 0 ? cashFlows[i - 1].cumulativeCashFlow : 0;
          const currentYear = cashFlows[i].year;
          const fraction = Math.abs(prevCumulative) / cashFlows[i].netCashFlow;
          return currentYear - 1 + fraction;
        }
        return cashFlows[i].year;
      }
    }
    return cashFlows.length;
  }

  /**
   * Perform sensitivity analysis
   */
  private performSensitivityAnalysis(
    lease: Lease,
    market: MarketData
  ): LeaseFinancialAnalysis['sensitivity'] {
    const baseNPV = this.calculateFinancialMetrics(
      this.projectCashFlows(lease, market),
      market.interestRate / 100
    ).npv;
    
    // Oil price sensitivity
    const oilPriceImpact = [-20, -10, 0, 10, 20].map(change => {
      const adjustedMarket = { ...market, oilPrice: market.oilPrice * (1 + change / 100) };
      const adjustedLease = {
        ...lease,
        financial: {
          ...lease.financial,
          annualRevenue: lease.financial.annualRevenue * (1 + change / 100),
        },
      };
      const npv = this.calculateFinancialMetrics(
        this.projectCashFlows(adjustedLease, adjustedMarket),
        market.interestRate / 100
      ).npv;
      return { price: market.oilPrice * (1 + change / 100), npv };
    });
    
    // Production sensitivity
    const productionImpact = [-20, -10, 0, 10, 20].map(change => {
      const adjustedLease = {
        ...lease,
        financial: {
          ...lease.financial,
          annualRevenue: lease.financial.annualRevenue * (1 + change / 100),
        },
      };
      const npv = this.calculateFinancialMetrics(
        this.projectCashFlows(adjustedLease, market),
        market.interestRate / 100
      ).npv;
      return { volume: 100 + change, npv };
    });
    
    // Cost sensitivity
    const costImpact = [-20, -10, 0, 10, 20].map(change => {
      const cashFlows = this.projectCashFlows(lease, market).map(cf => ({
        ...cf,
        costs: cf.costs * (1 + change / 100),
        netCashFlow: cf.revenue - cf.costs * (1 + change / 100),
        discountedCashFlow: (cf.revenue - cf.costs * (1 + change / 100)) / 
          Math.pow(1 + market.interestRate / 100, cf.year),
      }));
      const npv = this.calculateFinancialMetrics(cashFlows, market.interestRate / 100).npv;
      return { costChange: change, npv };
    });
    
    return {
      oilPriceImpact,
      productionImpact,
      costImpact,
    };
  }

  /**
   * Generate financial recommendation
   */
  private generateFinancialRecommendation(
    metrics: FinancialMetrics,
    lease: Lease
  ): LeaseFinancialAnalysis['recommendation'] {
    let action: 'renew' | 'renegotiate' | 'terminate' | 'hold' = 'hold';
    let confidence = 0;
    let reasoning = '';
    
    // Decision logic based on financial metrics
    if (metrics.npv < 0) {
      action = 'terminate';
      confidence = 0.9;
      reasoning = `Negative NPV of $${Math.abs(metrics.npv).toLocaleString()} indicates lease is destroying value`;
    } else if (metrics.irr < 10) {
      action = 'renegotiate';
      confidence = 0.85;
      reasoning = `IRR of ${metrics.irr.toFixed(1)}% is below minimum threshold of 10%`;
    } else if (metrics.roi > 30 && lease.status === 'expiring_soon') {
      action = 'renew';
      confidence = 0.95;
      reasoning = `Strong ROI of ${metrics.roi.toFixed(1)}% justifies renewal`;
    } else if (metrics.paybackPeriod > 5) {
      action = 'renegotiate';
      confidence = 0.8;
      reasoning = `Long payback period of ${metrics.paybackPeriod.toFixed(1)} years requires better terms`;
    } else {
      action = 'hold';
      confidence = 0.7;
      reasoning = `Acceptable financial performance with ${metrics.roi.toFixed(1)}% ROI`;
    }
    
    return { action, confidence, reasoning };
  }

  /**
   * Calculate portfolio risk score
   */
  private calculatePortfolioRisk(leases: Lease[]): number {
    let riskScore = 0;
    const weights = {
      expiration: 0.3,
      concentration: 0.25,
      compliance: 0.25,
      financial: 0.2,
    };
    
    // Expiration risk
    const expiringCount = leases.filter(l => {
      const days = this.calculateDaysToExpiration(l.terms.expirationDate);
      return days > 0 && days < 180;
    }).length;
    const expirationRisk = (expiringCount / leases.length) * 100;
    
    // Geographic concentration risk
    const counties = new Set(leases.map(l => l.property.location.county));
    const concentrationRisk = counties.size < 5 ? 80 : counties.size < 10 ? 50 : 20;
    
    // Compliance risk
    const complianceIssues = leases.filter(l => 
      l.compliance.issues && l.compliance.issues.length > 0
    ).length;
    const complianceRisk = (complianceIssues / leases.length) * 100;
    
    // Financial risk
    const underperformingCount = leases.filter(l => 
      l.financial.annualRevenue < 100000
    ).length;
    const financialRisk = (underperformingCount / leases.length) * 100;
    
    riskScore = 
      expirationRisk * weights.expiration +
      concentrationRisk * weights.concentration +
      complianceRisk * weights.compliance +
      financialRisk * weights.financial;
    
    return Math.min(100, Math.round(riskScore));
  }

  /**
   * Calculate portfolio diversification score
   */
  private calculateDiversification(leases: Lease[]): number {
    // Geographic diversification
    const counties = new Set(leases.map(l => l.property.location.county));
    const geoDiversity = Math.min(100, counties.size * 10);
    
    // Lessor diversification
    const lessors = new Set(leases.map(l => l.lessor.name));
    const lessorDiversity = Math.min(100, lessors.size * 5);
    
    // Term diversification
    const expirationYears = new Set(leases.map(l => 
      new Date(l.terms.expirationDate).getFullYear()
    ));
    const termDiversity = Math.min(100, expirationYears.size * 15);
    
    // Size diversification (by acreage)
    const acreages = leases.map(l => l.property.acreage);
    const avgAcreage = acreages.reduce((sum, a) => sum + a, 0) / acreages.length;
    const acreageStdDev = Math.sqrt(
      acreages.reduce((sum, a) => sum + Math.pow(a - avgAcreage, 2), 0) / acreages.length
    );
    const sizeDiversity = Math.min(100, (acreageStdDev / avgAcreage) * 100);
    
    // Weighted average
    return Math.round(
      geoDiversity * 0.3 +
      lessorDiversity * 0.3 +
      termDiversity * 0.2 +
      sizeDiversity * 0.2
    );
  }

  /**
   * Identify portfolio optimization opportunities
   */
  private identifyOptimizationOpportunities(
    leases: Lease[],
    analyses: LeaseFinancialAnalysis[]
  ): PortfolioAnalysis['optimizationOpportunities'] {
    const opportunities: PortfolioAnalysis['optimizationOpportunities'] = [];
    
    // Find divestment candidates
    const divestCandidates = analyses
      .filter(a => a.metrics.npv < 0 || a.metrics.irr < 5)
      .map(a => a.leaseId);
    
    if (divestCandidates.length > 0) {
      const potentialSavings = analyses
        .filter(a => divestCandidates.includes(a.leaseId))
        .reduce((sum, a) => sum + Math.abs(a.metrics.npv), 0);
      
      opportunities.push({
        type: 'divest',
        leaseIds: divestCandidates,
        potentialValue: potentialSavings,
        description: `Divest ${divestCandidates.length} underperforming leases to avoid $${potentialSavings.toLocaleString()} in losses`,
      });
    }
    
    // Find investment opportunities
    const investCandidates = analyses
      .filter(a => a.metrics.roi > 50 && a.recommendation.action === 'renew')
      .map(a => a.leaseId);
    
    if (investCandidates.length > 0) {
      const potentialValue = analyses
        .filter(a => investCandidates.includes(a.leaseId))
        .reduce((sum, a) => sum + a.metrics.npv * 0.2, 0); // 20% improvement potential
      
      opportunities.push({
        type: 'invest',
        leaseIds: investCandidates,
        potentialValue,
        description: `Invest in ${investCandidates.length} high-performing leases for additional $${potentialValue.toLocaleString()} NPV`,
      });
    }
    
    // Find renegotiation opportunities
    const renegotiateCandidates = analyses
      .filter(a => a.recommendation.action === 'renegotiate')
      .map(a => a.leaseId);
    
    if (renegotiateCandidates.length > 0) {
      const potentialValue = analyses
        .filter(a => renegotiateCandidates.includes(a.leaseId))
        .reduce((sum, a) => sum + a.metrics.npv * 0.15, 0); // 15% improvement potential
      
      opportunities.push({
        type: 'renegotiate',
        leaseIds: renegotiateCandidates,
        potentialValue,
        description: `Renegotiate ${renegotiateCandidates.length} leases to capture $${potentialValue.toLocaleString()} in additional value`,
      });
    }
    
    return opportunities;
  }

  /**
   * Generate scenario recommendation
   */
  private generateScenarioRecommendation(
    npvChange: number,
    scenario: Omit<ScenarioAnalysis, 'id' | 'results'>
  ): string {
    if (npvChange < -20) {
      return `High risk scenario. Implement hedging strategies and accelerate high-value lease renewals`;
    } else if (npvChange < -10) {
      return `Moderate downside risk. Consider diversification and cost reduction initiatives`;
    } else if (npvChange > 20) {
      return `Strong upside potential. Prioritize growth investments and strategic acquisitions`;
    } else if (npvChange > 10) {
      return `Favorable scenario. Maintain current strategy with selective optimization`;
    } else {
      return `Neutral impact. Focus on operational efficiency and risk management`;
    }
  }

  /**
   * Calculate terminal value for DCF
   */
  private calculateTerminalValue(lease: Lease, market: MarketData): number {
    const terminalGrowthRate = 2; // 2% perpetual growth
    const terminalYear = this.calculateYearsRemaining(lease.terms.expirationDate);
    const terminalCashFlow = lease.financial.annualRevenue * 0.35; // EBITDA proxy
    
    const terminalValue = terminalCashFlow * (1 + terminalGrowthRate / 100) / 
      (market.interestRate / 100 - terminalGrowthRate / 100);
    
    // Discount to present value
    const discountFactor = Math.pow(1 + market.interestRate / 100, terminalYear);
    return terminalValue / discountFactor;
  }

  /**
   * Calculate years remaining on lease
   */
  private calculateYearsRemaining(expirationDate: Date): number {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const yearsRemaining = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.max(0, Math.ceil(yearsRemaining));
  }

  /**
   * Calculate days to expiration
   */
  private calculateDaysToExpiration(expirationDate: Date): number {
    const now = new Date();
    const expDate = new Date(expirationDate);
    return Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export const financialService = new FinancialService();