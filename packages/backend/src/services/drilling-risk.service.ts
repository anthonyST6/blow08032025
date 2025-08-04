import { logger } from '../utils/logger';
import { BaseService } from './base.service';
import { serviceRegistry } from '../orchestration/service-registry';

export interface DrillingOperationData {
  wellId: string;
  location: {
    latitude: number;
    longitude: number;
    depth: number; // meters
    formation: string;
  };
  timestamp: Date;
  parameters: {
    rop: number; // Rate of Penetration (m/hr)
    wob: number; // Weight on Bit (tons)
    rpm: number; // Rotations per minute
    torque: number; // N⋅m
    mudFlow: number; // L/min
    mudPressure: number; // bar
    mudWeight: number; // kg/m³
    temperature: number; // °C
  };
  sensors: {
    vibration: number; // g
    gasDetection: number; // ppm
    h2sLevel: number; // ppm
    pressureDifferential: number; // bar
  };
  historicalData?: {
    previousIncidents: number;
    formationComplexity: 'low' | 'medium' | 'high';
    offsetWellData: boolean;
  };
}

export interface RiskAssessmentResult {
  timestamp: Date;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: Array<{
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: number; // 0-100%
    impact: string;
    mitigation: string;
  }>;
  recommendations: string[];
  alerts: Array<{
    type: 'warning' | 'danger' | 'critical';
    message: string;
    action: string;
  }>;
  predictedIssues: Array<{
    issue: string;
    timeframe: string;
    confidence: number; // 0-100%
    preventiveAction: string;
  }>;
  safetyScore: number; // 0-100
}

export interface DrillingOptimizationPlan {
  wellId: string;
  timestamp: Date;
  currentPhase: string;
  optimizations: Array<{
    parameter: string;
    currentValue: number;
    recommendedValue: number;
    expectedImprovement: string;
    riskReduction: number; // percentage
  }>;
  costBenefit: {
    estimatedTimeSaving: number; // hours
    estimatedCostSaving: number; // USD
    riskMitigationValue: number; // USD
  };
  implementationSteps: string[];
}

class DrillingRiskService extends BaseService {
  private riskHistory: Map<string, RiskAssessmentResult[]> = new Map();
  private incidentDatabase: Map<string, any[]> = new Map();
  private formationProfiles: Map<string, any> = new Map();

  constructor() {
    super('DrillingRiskService');
    this.initializeService();
  }

  private initializeService(): void {
    // Initialize formation risk profiles
    this.formationProfiles.set('shale', {
      stickSlipRisk: 0.7,
      lostCirculationRisk: 0.3,
      gasKickRisk: 0.4,
      optimalROP: 15,
      optimalWOB: 20
    });

    this.formationProfiles.set('sandstone', {
      stickSlipRisk: 0.3,
      lostCirculationRisk: 0.5,
      gasKickRisk: 0.6,
      optimalROP: 25,
      optimalWOB: 15
    });

    this.formationProfiles.set('limestone', {
      stickSlipRisk: 0.4,
      lostCirculationRisk: 0.6,
      gasKickRisk: 0.5,
      optimalROP: 20,
      optimalWOB: 18
    });

    logger.info('Drilling Risk Assessment Service initialized');
  }

  /**
   * Assess drilling operation risks
   */
  async assessDrillingRisk(data: DrillingOperationData): Promise<RiskAssessmentResult> {
    try {
      const riskFactors: RiskAssessmentResult['riskFactors'] = [];
      const alerts: RiskAssessmentResult['alerts'] = [];
      
      // Get formation profile
      const formationProfile = this.formationProfiles.get(data.location.formation.toLowerCase()) || 
        this.formationProfiles.get('sandstone');

      // Assess mechanical risks
      const mechanicalRisks = this.assessMechanicalRisks(data, formationProfile);
      riskFactors.push(...mechanicalRisks.factors);
      alerts.push(...mechanicalRisks.alerts);

      // Assess formation risks
      const formationRisks = this.assessFormationRisks(data, formationProfile);
      riskFactors.push(...formationRisks.factors);
      alerts.push(...formationRisks.alerts);

      // Assess safety risks
      const safetyRisks = this.assessSafetyRisks(data);
      riskFactors.push(...safetyRisks.factors);
      alerts.push(...safetyRisks.alerts);

      // Assess operational risks
      const operationalRisks = this.assessOperationalRisks(data);
      riskFactors.push(...operationalRisks.factors);
      alerts.push(...operationalRisks.alerts);

      // Calculate overall risk level
      const overallRisk = this.calculateOverallRisk(riskFactors);

      // Generate recommendations
      const recommendations = this.generateRiskRecommendations(riskFactors, data);

      // Predict potential issues
      const predictedIssues = this.predictDrillingIssues(data, riskFactors, formationProfile);

      // Calculate safety score
      const safetyScore = this.calculateSafetyScore(riskFactors, data);

      const result: RiskAssessmentResult = {
        timestamp: new Date(),
        overallRisk,
        riskFactors,
        recommendations,
        alerts,
        predictedIssues,
        safetyScore
      };

      // Store in history
      const history = this.riskHistory.get(data.wellId) || [];
      history.push(result);
      if (history.length > 100) history.shift();
      this.riskHistory.set(data.wellId, history);

      logger.info('Drilling risk assessed', {
        wellId: data.wellId,
        overallRisk,
        riskFactorCount: riskFactors.length,
        alertCount: alerts.length
      });

      return result;

    } catch (error) {
      this.handleError(error, 'assessDrillingRisk');
      throw error;
    }
  }

  /**
   * Generate drilling optimization plan
   */
  async generateOptimizationPlan(wellId: string): Promise<DrillingOptimizationPlan> {
    try {
      const history = this.riskHistory.get(wellId) || [];
      if (history.length === 0) {
        throw new Error('No risk assessment history available for optimization');
      }

      const latestAssessment = history[history.length - 1];
      const optimizations: DrillingOptimizationPlan['optimizations'] = [];

      // Analyze risk factors for optimization opportunities
      latestAssessment.riskFactors.forEach(factor => {
        if (factor.severity === 'high' || factor.severity === 'critical') {
          const optimization = this.generateOptimizationForRisk(factor);
          if (optimization) {
            optimizations.push(optimization);
          }
        }
      });

      // Calculate cost-benefit analysis
      const costBenefit = this.calculateCostBenefit(optimizations);

      // Generate implementation steps
      const implementationSteps = this.generateImplementationSteps(optimizations);

      const plan: DrillingOptimizationPlan = {
        wellId,
        timestamp: new Date(),
        currentPhase: 'drilling', // This would be determined from actual data
        optimizations,
        costBenefit,
        implementationSteps
      };

      logger.info('Drilling optimization plan generated', {
        wellId,
        optimizationCount: optimizations.length,
        estimatedSaving: costBenefit.estimatedCostSaving
      });

      return plan;

    } catch (error) {
      this.handleError(error, 'generateOptimizationPlan');
      throw error;
    }
  }

  /**
   * Monitor drilling trends and anomalies
   */
  async monitorDrillingTrends(wellId: string): Promise<{
    trends: Array<{
      parameter: string;
      trend: 'increasing' | 'decreasing' | 'stable' | 'erratic';
      significance: 'low' | 'medium' | 'high';
      interpretation: string;
    }>;
    anomalies: Array<{
      parameter: string;
      timestamp: Date;
      deviation: number; // percentage
      possibleCause: string;
    }>;
    performance: {
      efficiency: number; // 0-100%
      safetyTrend: 'improving' | 'declining' | 'stable';
      costPerformance: 'under' | 'on' | 'over' | 'budget';
    };
  }> {
    try {
      const history = this.riskHistory.get(wellId) || [];
      
      if (history.length < 5) {
        return {
          trends: [],
          anomalies: [],
          performance: {
            efficiency: 0,
            safetyTrend: 'stable',
            costPerformance: 'on'
          }
        };
      }

      // Analyze trends
      const trends = this.analyzeDrillingTrends(history);

      // Detect anomalies
      const anomalies = this.detectDrillingAnomalies(history);

      // Calculate performance metrics
      const performance = this.calculateDrillingPerformance(history);

      const result = {
        trends,
        anomalies,
        performance
      };

      logger.info('Drilling trends monitored', {
        wellId,
        trendCount: trends.length,
        anomalyCount: anomalies.length
      });

      return result;

    } catch (error) {
      this.handleError(error, 'monitorDrillingTrends');
      throw error;
    }
  }

  /**
   * Assess mechanical risks
   */
  private assessMechanicalRisks(
    data: DrillingOperationData,
    formationProfile: any
  ): { factors: RiskAssessmentResult['riskFactors']; alerts: RiskAssessmentResult['alerts'] } {
    const factors: RiskAssessmentResult['riskFactors'] = [];
    const alerts: RiskAssessmentResult['alerts'] = [];

    // Stick-slip risk assessment
    const torqueVariation = data.parameters.torque / (data.parameters.wob * 10); // Simplified calculation
    if (torqueVariation > 2 && formationProfile.stickSlipRisk > 0.5) {
      factors.push({
        category: 'Mechanical - Stick-Slip',
        severity: torqueVariation > 3 ? 'high' : 'medium',
        probability: formationProfile.stickSlipRisk * 100,
        impact: 'Premature bit wear, drill string fatigue, reduced ROP',
        mitigation: 'Adjust WOB and RPM, consider drill string dampeners'
      });

      if (torqueVariation > 3) {
        alerts.push({
          type: 'danger',
          message: 'High stick-slip risk detected',
          action: 'Reduce WOB by 20% and monitor torque fluctuations'
        });
      }
    }

    // Vibration risk assessment
    if (data.sensors.vibration > 5) {
      const severity = data.sensors.vibration > 10 ? 'critical' : 
                      data.sensors.vibration > 7 ? 'high' : 'medium';
      
      factors.push({
        category: 'Mechanical - Vibration',
        severity,
        probability: 80,
        impact: 'Equipment damage, connection failures, MWD/LWD tool damage',
        mitigation: 'Optimize drilling parameters, check BHA design'
      });

      if (severity === 'critical') {
        alerts.push({
          type: 'critical',
          message: 'Critical vibration levels detected',
          action: 'Immediately reduce RPM and pull off bottom to assess'
        });
      }
    }

    // Bit wear risk
    const bitEfficiency = data.parameters.rop / formationProfile.optimalROP;
    if (bitEfficiency < 0.6) {
      factors.push({
        category: 'Mechanical - Bit Wear',
        severity: bitEfficiency < 0.4 ? 'high' : 'medium',
        probability: 70,
        impact: 'Reduced drilling efficiency, potential bit failure',
        mitigation: 'Plan for bit trip, optimize parameters for current bit condition'
      });
    }

    return { factors, alerts };
  }

  /**
   * Assess formation risks
   */
  private assessFormationRisks(
    data: DrillingOperationData,
    formationProfile: any
  ): { factors: RiskAssessmentResult['riskFactors']; alerts: RiskAssessmentResult['alerts'] } {
    const factors: RiskAssessmentResult['riskFactors'] = [];
    const alerts: RiskAssessmentResult['alerts'] = [];

    // Lost circulation risk
    if (data.parameters.mudFlow < 1000 && data.sensors.pressureDifferential < -2) {
      factors.push({
        category: 'Formation - Lost Circulation',
        severity: data.sensors.pressureDifferential < -5 ? 'high' : 'medium',
        probability: formationProfile.lostCirculationRisk * 100,
        impact: 'Mud losses, potential well control issues, increased costs',
        mitigation: 'Prepare LCM, reduce mud weight if possible, monitor returns closely'
      });

      if (data.sensors.pressureDifferential < -5) {
        alerts.push({
          type: 'danger',
          message: 'Significant lost circulation detected',
          action: 'Pump LCM pill and consider reducing mud weight'
        });
      }
    }

    // Gas kick risk
    if (data.sensors.gasDetection > 100 || data.sensors.pressureDifferential > 3) {
      const severity = data.sensors.gasDetection > 500 ? 'critical' :
                      data.sensors.gasDetection > 200 ? 'high' : 'medium';

      factors.push({
        category: 'Formation - Gas Influx',
        severity,
        probability: formationProfile.gasKickRisk * 100,
        impact: 'Well control situation, potential blowout risk',
        mitigation: 'Increase mud weight, monitor pit levels, prepare to shut in well'
      });

      if (severity === 'critical') {
        alerts.push({
          type: 'critical',
          message: 'Critical gas influx detected',
          action: 'Shut in well immediately and circulate out influx'
        });
      }
    }

    // Formation instability
    if (data.location.depth > 3000 && data.parameters.mudWeight < 1200) {
      factors.push({
        category: 'Formation - Wellbore Instability',
        severity: 'medium',
        probability: 60,
        impact: 'Hole problems, stuck pipe risk, wellbore collapse',
        mitigation: 'Monitor hole conditions, consider increasing mud weight'
      });
    }

    return { factors, alerts };
  }

  /**
   * Assess safety risks
   */
  private assessSafetyRisks(data: DrillingOperationData): {
    factors: RiskAssessmentResult['riskFactors'];
    alerts: RiskAssessmentResult['alerts'];
  } {
    const factors: RiskAssessmentResult['riskFactors'] = [];
    const alerts: RiskAssessmentResult['alerts'] = [];

    // H2S risk
    if (data.sensors.h2sLevel > 10) {
      const severity = data.sensors.h2sLevel > 100 ? 'critical' :
                      data.sensors.h2sLevel > 50 ? 'high' : 'medium';

      factors.push({
        category: 'Safety - H2S Exposure',
        severity,
        probability: 90,
        impact: 'Personnel safety risk, potential fatalities',
        mitigation: 'Ensure all personnel have H2S monitors and SCBA ready'
      });

      if (severity === 'critical') {
        alerts.push({
          type: 'critical',
          message: 'Dangerous H2S levels detected',
          action: 'Evacuate non-essential personnel, all remaining must use SCBA'
        });
      }
    }

    // High pressure risk
    if (data.parameters.mudPressure > 350) {
      factors.push({
        category: 'Safety - High Pressure Operations',
        severity: data.parameters.mudPressure > 400 ? 'high' : 'medium',
        probability: 70,
        impact: 'Equipment failure risk, personnel injury',
        mitigation: 'Verify pressure ratings, implement additional safety barriers'
      });
    }

    // Temperature risk
    if (data.parameters.temperature > 150) {
      factors.push({
        category: 'Safety - High Temperature',
        severity: data.parameters.temperature > 180 ? 'high' : 'medium',
        probability: 80,
        impact: 'Equipment degradation, mud property changes, personnel heat stress',
        mitigation: 'Use high-temp rated equipment, adjust mud properties, rotate crews'
      });
    }

    return { factors, alerts };
  }

  /**
   * Assess operational risks
   */
  private assessOperationalRisks(data: DrillingOperationData): {
    factors: RiskAssessmentResult['riskFactors'];
    alerts: RiskAssessmentResult['alerts'];
  } {
    const factors: RiskAssessmentResult['riskFactors'] = [];
    const alerts: RiskAssessmentResult['alerts'] = [];

    // ROP performance
    const ropEfficiency = data.parameters.rop / 30; // Assume 30 m/hr as good ROP
    if (ropEfficiency < 0.5) {
      factors.push({
        category: 'Operational - Poor ROP',
        severity: ropEfficiency < 0.3 ? 'high' : 'medium',
        probability: 100,
        impact: 'Increased drilling time and costs, delayed project',
        mitigation: 'Optimize drilling parameters, consider bit change'
      });
    }

    // Mud system issues
    if (data.parameters.mudWeight < 1000 || data.parameters.mudWeight > 2000) {
      factors.push({
        category: 'Operational - Mud Properties',
        severity: 'medium',
        probability: 60,
        impact: 'Hole cleaning issues, formation damage, well control',
        mitigation: 'Adjust mud properties, monitor rheology closely'
      });
    }

    // Historical incident consideration
    if (data.historicalData?.previousIncidents && data.historicalData.previousIncidents > 2) {
      factors.push({
        category: 'Operational - Historical Issues',
        severity: 'medium',
        probability: 50,
        impact: 'Repeated problems likely, increased NPT risk',
        mitigation: 'Review offset well data, implement lessons learned'
      });
    }

    return { factors, alerts };
  }

  /**
   * Calculate overall risk level
   */
  private calculateOverallRisk(riskFactors: RiskAssessmentResult['riskFactors']): RiskAssessmentResult['overallRisk'] {
    const criticalCount = riskFactors.filter(f => f.severity === 'critical').length;
    const highCount = riskFactors.filter(f => f.severity === 'high').length;
    const mediumCount = riskFactors.filter(f => f.severity === 'medium').length;

    if (criticalCount > 0) return 'critical';
    if (highCount >= 3) return 'critical';
    if (highCount >= 1) return 'high';
    if (mediumCount >= 3) return 'medium';
    return 'low';
  }

  /**
   * Generate risk recommendations
   */
  private generateRiskRecommendations(
    riskFactors: RiskAssessmentResult['riskFactors'],
    data: DrillingOperationData
  ): string[] {
    const recommendations: string[] = [];

    // Priority recommendations based on critical risks
    const criticalRisks = riskFactors.filter(f => f.severity === 'critical');
    criticalRisks.forEach(risk => {
      recommendations.push(`CRITICAL: ${risk.mitigation}`);
    });

    // Parameter optimization recommendations
    if (data.parameters.rop < 10) {
      recommendations.push('Consider parameter optimization sweep to improve ROP');
    }

    if (data.parameters.wob > 25) {
      recommendations.push('High WOB detected - verify bit and BHA ratings');
    }

    // Formation-specific recommendations
    if (data.location.formation.toLowerCase() === 'shale') {
      recommendations.push('In shale: Monitor for differential sticking, maintain proper mud properties');
    }

    // General safety recommendations
    if (riskFactors.some(f => f.category.includes('Safety'))) {
      recommendations.push('Conduct safety stand-down to review current risks with crew');
    }

    // Preventive maintenance
    if (data.sensors.vibration > 3) {
      recommendations.push('Schedule BHA inspection at next connection');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Predict drilling issues
   */
  private predictDrillingIssues(
    data: DrillingOperationData,
    riskFactors: RiskAssessmentResult['riskFactors'],
    formationProfile: any
  ): RiskAssessmentResult['predictedIssues'] {
    const predictions: RiskAssessmentResult['predictedIssues'] = [];

    // Bit failure prediction
    const bitWearRate = (30 - data.parameters.rop) / 30;
    if (bitWearRate > 0.5) {
      predictions.push({
        issue: 'Bit failure',
        timeframe: bitWearRate > 0.7 ? '2-4 hours' : '6-12 hours',
        confidence: bitWearRate * 100,
        preventiveAction: 'Plan for bit trip, prepare new bit on surface'
      });
    }

    // Stuck pipe prediction
    const stuckPipeRisk = (data.sensors.vibration / 10) * formationProfile.stickSlipRisk;
    if (stuckPipeRisk > 0.5) {
      predictions.push({
        issue: 'Stuck pipe',
        timeframe: '4-8 hours',
        confidence: stuckPipeRisk * 100,
        preventiveAction: 'Maintain pipe movement, pump high-vis sweeps, monitor torque/drag'
      });
    }

    // Lost circulation prediction
    if (formationProfile.lostCirculationRisk > 0.5 && data.sensors.pressureDifferential < -1) {
      predictions.push({
        issue: 'Severe lost circulation',
        timeframe: '1-3 hours',
        confidence: formationProfile.lostCirculationRisk * 80,
        preventiveAction: 'Pre-mix LCM, stage LCM materials at rig, review lost circulation procedures'
      });
    }

    // Equipment failure prediction based on vibration
    if (data.sensors.vibration > 7) {
      predictions.push({
        issue: 'MWD/LWD tool failure',
        timeframe: '6-12 hours',
        confidence: 70,
        preventiveAction: 'Reduce vibration levels, prepare backup tools'
      });
    }

    return predictions;
  }

  /**
   * Calculate safety score
   */
  private calculateSafetyScore(
    riskFactors: RiskAssessmentResult['riskFactors'],
    data: DrillingOperationData
  ): number {
    let score = 100;

    // Deduct points for risk factors
    riskFactors.forEach(factor => {
      if (factor.category.includes('Safety')) {
        switch (factor.severity) {
          case 'critical': score -= 30; break;
          case 'high': score -= 20; break;
          case 'medium': score -= 10; break;
          case 'low': score -= 5; break;
        }
      } else {
        // Non-safety risks also impact safety score
        switch (factor.severity) {
          case 'critical': score -= 15; break;
          case 'high': score -= 10; break;
          case 'medium': score -= 5; break;
          case 'low': score -= 2; break;
        }
      }
    });

    // Additional deductions for specific conditions
    if (data.sensors.h2sLevel > 50) score -= 20;
    if (data.sensors.vibration > 10) score -= 15;
    if (data.parameters.mudPressure > 400) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate optimization for specific risk
   */
  private generateOptimizationForRisk(
    riskFactor: RiskAssessmentResult['riskFactors'][0]
  ): DrillingOptimizationPlan['optimizations'][0] | null {
    const optimizationMap: Record<string, any> = {
      'Mechanical - Stick-Slip': {
        parameter: 'WOB',
        currentValue: 25,
        recommendedValue: 20,
        expectedImprovement: 'Reduce stick-slip by 40%',
        riskReduction: 40
      },
      'Mechanical - Vibration': {
        parameter: 'RPM',
        currentValue: 120,
        recommendedValue: 90,
        expectedImprovement: 'Reduce vibration by 50%',
        riskReduction: 50
      },
      'Operational - Poor ROP': {
        parameter: 'WOB',
        currentValue: 15,
        recommendedValue: 22,
        expectedImprovement: 'Increase ROP by 30%',
        riskReduction: 20
      }
    };

    return optimizationMap[riskFactor.category] || null;
  }

  /**
   * Calculate cost-benefit analysis
   */
  private calculateCostBenefit(
    optimizations: DrillingOptimizationPlan['optimizations']
  ): DrillingOptimizationPlan['costBenefit'] {
    let totalTimeSaving = 0;
    let totalRiskReduction = 0;

    optimizations.forEach(opt => {
      // Estimate time savings based on improvements
      if (opt.expectedImprovement.includes('ROP')) {
        totalTimeSaving += 12; // hours
      }
      totalRiskReduction += opt.riskReduction;
    });

    // Calculate cost savings (simplified)
    const rigRate = 50000; // $/day
    const estimatedCostSaving = (totalTimeSaving / 24) * rigRate;

    // Risk mitigation value (avoiding NPT)
    const avgRiskReduction = totalRiskReduction / optimizations.length;
    const riskMitigationValue = (avgRiskReduction / 100) * rigRate * 2; // 2 days NPT avoided

    return {
      estimatedTimeSaving: totalTimeSaving,
      estimatedCostSaving: Math.round(estimatedCostSaving),
      riskMitigationValue: Math.round(riskMitigationValue)
    };
  }

  /**
   * Generate implementation steps
   */
  private generateImplementationSteps(
    optimizations: DrillingOptimizationPlan['optimizations']
  ): string[] {
    const steps: string[] = [];

    steps.push('1. Conduct pre-implementation safety meeting with all crew');
    steps.push('2. Review current drilling parameters and establish baseline');

    optimizations.forEach((opt, index) => {
      steps.push(`${index + 3}. Adjust ${opt.parameter} from ${opt.currentValue} to ${opt.recommendedValue}`);
      steps.push(`${index + 4}. Monitor response for 30 minutes and document changes`);
    });

    steps.push(`${steps.length + 1}. Evaluate results and fine-tune parameters as needed`);
    steps.push(`${steps.length + 2}. Document lessons learned and update drilling program`);

    return steps;
  }

  /**
   * Analyze drilling trends
   */
  private analyzeDrillingTrends(history: RiskAssessmentResult[]): any[] {
    const trends: any[] = [];

    if (history.length < 5) return trends;

    // Analyze safety score trend
    const safetyScores = history.slice(-10).map(h => h.safetyScore);
    const safetyTrend = this.calculateTrend(safetyScores);
    
    trends.push({
      parameter: 'Safety Score',
      trend: safetyTrend.direction,
      significance: Math.abs(safetyTrend.slope) > 5 ? 'high' : 
                   Math.abs(safetyTrend.slope) > 2 ? 'medium' : 'low',
      interpretation: safetyTrend.direction === 'decreasing' ? 
        'Safety performance declining - immediate attention required' :
        'Safety performance stable or improving'
    });

    // Analyze risk factor count trend
    const riskCounts = history.slice(-10).map(h => h.riskFactors.length);
    const riskTrend = this.calculateTrend(riskCounts);

    trends.push({
      parameter: 'Risk Factor Count',
      trend: riskTrend.direction,
      significance: Math.abs(riskTrend.slope) > 0.5 ? 'high' : 'medium',
      interpretation: riskTrend.direction === 'increasing' ? 
        'Risk factors accumulating - review drilling practices' :
        'Risk factors under control'
    });

    return trends;
  }

  /**
   * Detect drilling anomalies
   */
  private detectDrillingAnomalies(history: RiskAssessmentResult[]): any[] {
    const anomalies: any[] = [];

    if (history.length < 10) return anomalies;

    // Look for sudden changes in risk levels
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];

      // Check for risk level jumps
      const prevLevel = this.riskLevelToNumber(prev.overallRisk);
      const currLevel = this.riskLevelToNumber(curr.overallRisk);

      if (currLevel - prevLevel >= 2) {
        anomalies.push({
          parameter: 'Overall Risk Level',
          timestamp: curr.timestamp,
          deviation: (currLevel - prevLevel) * 25, // Convert to percentage
          possibleCause: 'Sudden deterioration in drilling conditions'
        });
      }

      // Check for safety score drops
      if (prev.safetyScore - curr.safetyScore > 20) {
        anomalies.push({
          parameter: 'Safety Score',
          timestamp: curr.timestamp,
          deviation: prev.safetyScore - curr.safetyScore,
          possibleCause: 'Significant safety degradation - immediate review required'
        });
      }
    }

    return anomalies;
  }

  /**
   * Calculate drilling performance
   */
  private calculateDrillingPerformance(history: RiskAssessmentResult[]): {
    efficiency: number;
    safetyTrend: 'improving' | 'declining' | 'stable';
    costPerformance: 'under' | 'on' | 'over';
  } {
    if (history.length === 0) {
      return {
        efficiency: 0,
        safetyTrend: 'stable',
        costPerformance: 'on'
      };
    }

    // Calculate efficiency based on risk levels
    const riskLevels = history.map(h => this.riskLevelToNumber(h.overallRisk));
    const avgRiskLevel = riskLevels.reduce((a, b) => a + b, 0) / riskLevels.length;
    const efficiency = Math.max(0, 100 - (avgRiskLevel * 25));

    // Determine safety trend
    const recentSafetyScores = history.slice(-5).map(h => h.safetyScore);
    const safetyTrend = this.calculateTrend(recentSafetyScores);

    // Determine cost performance (simplified)
    const highRiskCount = history.filter(h => h.overallRisk === 'high' || h.overallRisk === 'critical').length;
    const costPerformance = highRiskCount > history.length * 0.3 ? 'over' :
                           highRiskCount < history.length * 0.1 ? 'under' : 'on';

    return {
      efficiency,
      safetyTrend: safetyTrend.direction === 'increasing' ? 'improving' :
                   safetyTrend.direction === 'decreasing' ? 'declining' : 'stable',
      costPerformance
    };
  }

  /**
   * Calculate trend from data points
   */
  private calculateTrend(data: number[]): {
    direction: 'increasing' | 'decreasing' | 'stable' | 'erratic';
    slope: number;
  } {
    if (data.length < 2) {
      return { direction: 'stable', slope: 0 };
    }

    // Simple linear regression
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, i) => sum + (i * val), 0);
    const sumX2 = data.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Calculate variance to detect erratic behavior
    const mean = sumY / n;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const coefficientOfVariation = Math.sqrt(variance) / mean;

    let direction: 'increasing' | 'decreasing' | 'stable' | 'erratic';
    if (coefficientOfVariation > 0.5) {
      direction = 'erratic';
    } else if (Math.abs(slope) < 0.5) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return { direction, slope };
  }

  /**
   * Convert risk level to number for calculations
   */
  private riskLevelToNumber(level: RiskAssessmentResult['overallRisk']): number {
    switch (level) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      case 'critical': return 4;
      default: return 0;
    }
  }
}

// Create and export service instance
export const drillingRiskService = new DrillingRiskService();

// Register with service registry
serviceRegistry.registerService('drilling-risk', drillingRiskService);