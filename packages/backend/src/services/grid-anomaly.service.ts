import { logger } from '../utils/logger';
import { BaseService } from './base.service';

export interface GridAnomalyData {
  sensorId: string;
  location: string;
  timestamp: Date;
  metrics: {
    voltage: number;
    current: number;
    frequency: number;
    powerFactor: number;
    temperature: number;
  };
  thresholds: {
    voltageMin: number;
    voltageMax: number;
    currentMax: number;
    frequencyMin: number;
    frequencyMax: number;
    temperatureMax: number;
  };
}

export interface AnomalyDetectionResult {
  anomalyDetected: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  anomalies: Array<{
    metric: string;
    value: number;
    threshold: number;
    deviation: number;
    message: string;
  }>;
  recommendations: string[];
  riskScore: number;
}

export interface GridHealthReport {
  timestamp: Date;
  overallHealth: 'healthy' | 'degraded' | 'critical';
  sectorsAnalyzed: number;
  anomaliesDetected: number;
  criticalIssues: number;
  recommendations: string[];
  predictedFailures: Array<{
    component: string;
    timeToFailure: string;
    confidence: number;
    preventiveAction: string;
  }>;
}

export class GridAnomalyService extends BaseService {
  private static instance: GridAnomalyService;
  private anomalyHistory: Map<string, AnomalyDetectionResult[]> = new Map();
  private gridHealthMetrics: Map<string, number> = new Map();

  private constructor() {
    super();
    this.initializeService();
  }

  static getInstance(): GridAnomalyService {
    if (!GridAnomalyService.instance) {
      GridAnomalyService.instance = new GridAnomalyService();
      logger.info('GridAnomalyService initialized');
    }
    return GridAnomalyService.instance;
  }

  private initializeService(): void {
    // Initialize baseline metrics
    this.gridHealthMetrics.set('systemReliability', 99.5);
    this.gridHealthMetrics.set('anomalyRate', 0.02);
    this.gridHealthMetrics.set('responseTime', 150); // ms
    
    logger.info('Grid Anomaly Detection Service initialized');
  }

  /**
   * Analyze grid telemetry data for anomalies
   */
  async analyzeGridTelemetry(data: GridAnomalyData): Promise<AnomalyDetectionResult> {
    try {
      const anomalies: AnomalyDetectionResult['anomalies'] = [];
      
      // Track severity levels for each anomaly type
      const severityLevels: AnomalyDetectionResult['severity'][] = [];
      
      // Check voltage anomalies
      if (data.metrics.voltage < data.thresholds.voltageMin) {
        anomalies.push({
          metric: 'voltage',
          value: data.metrics.voltage,
          threshold: data.thresholds.voltageMin,
          deviation: ((data.thresholds.voltageMin - data.metrics.voltage) / data.thresholds.voltageMin) * 100,
          message: `Undervoltage detected: ${data.metrics.voltage}V (min: ${data.thresholds.voltageMin}V)`
        });
        severityLevels.push('high');
      } else if (data.metrics.voltage > data.thresholds.voltageMax) {
        anomalies.push({
          metric: 'voltage',
          value: data.metrics.voltage,
          threshold: data.thresholds.voltageMax,
          deviation: ((data.metrics.voltage - data.thresholds.voltageMax) / data.thresholds.voltageMax) * 100,
          message: `Overvoltage detected: ${data.metrics.voltage}V (max: ${data.thresholds.voltageMax}V)`
        });
        severityLevels.push('high');
      }

      // Check current anomalies
      if (data.metrics.current > data.thresholds.currentMax) {
        anomalies.push({
          metric: 'current',
          value: data.metrics.current,
          threshold: data.thresholds.currentMax,
          deviation: ((data.metrics.current - data.thresholds.currentMax) / data.thresholds.currentMax) * 100,
          message: `Overcurrent detected: ${data.metrics.current}A (max: ${data.thresholds.currentMax}A)`
        });
        if (data.metrics.current > data.thresholds.currentMax * 1.5) {
          severityLevels.push('critical');
        } else {
          severityLevels.push('high');
        }
      }

      // Check frequency anomalies
      if (data.metrics.frequency < data.thresholds.frequencyMin ||
          data.metrics.frequency > data.thresholds.frequencyMax) {
        const isUnder = data.metrics.frequency < data.thresholds.frequencyMin;
        anomalies.push({
          metric: 'frequency',
          value: data.metrics.frequency,
          threshold: isUnder ? data.thresholds.frequencyMin : data.thresholds.frequencyMax,
          deviation: isUnder
            ? ((data.thresholds.frequencyMin - data.metrics.frequency) / data.thresholds.frequencyMin) * 100
            : ((data.metrics.frequency - data.thresholds.frequencyMax) / data.thresholds.frequencyMax) * 100,
          message: `Frequency deviation: ${data.metrics.frequency}Hz (range: ${data.thresholds.frequencyMin}-${data.thresholds.frequencyMax}Hz)`
        });
        severityLevels.push('medium');
      }

      // Check temperature anomalies
      if (data.metrics.temperature > data.thresholds.temperatureMax) {
        anomalies.push({
          metric: 'temperature',
          value: data.metrics.temperature,
          threshold: data.thresholds.temperatureMax,
          deviation: ((data.metrics.temperature - data.thresholds.temperatureMax) / data.thresholds.temperatureMax) * 100,
          message: `High temperature: ${data.metrics.temperature}°C (max: ${data.thresholds.temperatureMax}°C)`
        });
        if (data.metrics.temperature > data.thresholds.temperatureMax * 1.2) {
          severityLevels.push('critical');
        } else {
          severityLevels.push('medium');
        }
      }

      // Determine overall severity (highest severity wins)
      let maxSeverity: AnomalyDetectionResult['severity'] = 'low';
      if (severityLevels.includes('critical')) {
        maxSeverity = 'critical';
      } else if (severityLevels.includes('high')) {
        maxSeverity = 'high';
      } else if (severityLevels.includes('medium')) {
        maxSeverity = 'medium';
      }

      // Calculate risk score
      const riskScore = this.calculateRiskScore(anomalies, data.metrics);

      // Generate recommendations
      const recommendations = this.generateRecommendations(anomalies, maxSeverity);

      const result: AnomalyDetectionResult = {
        anomalyDetected: anomalies.length > 0,
        severity: maxSeverity,
        anomalies,
        recommendations,
        riskScore
      };

      // Store in history
      const history = this.anomalyHistory.get(data.sensorId) || [];
      history.push(result);
      if (history.length > 100) history.shift(); // Keep last 100 readings
      this.anomalyHistory.set(data.sensorId, history);

      // Update metrics
      if (anomalies.length > 0) {
        const currentRate = this.gridHealthMetrics.get('anomalyRate') || 0.02;
        this.gridHealthMetrics.set('anomalyRate', currentRate * 1.01); // Slight increase
      }

      logger.info('Grid telemetry analyzed', {
        sensorId: data.sensorId,
        anomaliesFound: anomalies.length,
        severity: maxSeverity
      });

      return result;

    } catch (error) {
      logger.error('Failed to analyze grid telemetry', { error });
      throw error;
    }
  }

  /**
   * Predict potential grid failures
   */
  async predictGridFailures(sectorId: string): Promise<GridHealthReport['predictedFailures']> {
    try {
      const predictions: GridHealthReport['predictedFailures'] = [];
      
      // Analyze historical anomalies for patterns
      const sensorIds = Array.from(this.anomalyHistory.keys()).filter(id => id.startsWith(sectorId));
      
      for (const sensorId of sensorIds) {
        const history = this.anomalyHistory.get(sensorId) || [];
        const recentAnomalies = history.slice(-20); // Last 20 readings
        
        // Check for recurring patterns
        const anomalyCounts = new Map<string, number>();
        recentAnomalies.forEach(result => {
          result.anomalies.forEach(anomaly => {
            anomalyCounts.set(anomaly.metric, (anomalyCounts.get(anomaly.metric) || 0) + 1);
          });
        });

        // Predict failures based on patterns
        anomalyCounts.forEach((count, metric) => {
          if (count > 10) { // More than 50% of recent readings
            const confidence = Math.min(95, count * 5);
            const timeToFailure = this.estimateTimeToFailure(metric, count);
            
            predictions.push({
              component: `${sensorId}-${metric}`,
              timeToFailure,
              confidence,
              preventiveAction: this.getPreventiveAction(metric)
            });
          }
        });
      }

      return predictions;

    } catch (error) {
      logger.error('Failed to predict grid failures', { error });
      throw error;
    }
  }

  /**
   * Generate comprehensive grid health report
   */
  async generateGridHealthReport(sectorIds: string[]): Promise<GridHealthReport> {
    try {
      let totalAnomalies = 0;
      let criticalIssues = 0;
      const allRecommendations = new Set<string>();

      // Analyze each sector
      for (const sectorId of sectorIds) {
        const sensorIds = Array.from(this.anomalyHistory.keys()).filter(id => id.startsWith(sectorId));
        
        for (const sensorId of sensorIds) {
          const history = this.anomalyHistory.get(sensorId) || [];
          const recent = history[history.length - 1];
          
          if (recent && recent.anomalyDetected) {
            totalAnomalies++;
            if (recent.severity === 'critical') criticalIssues++;
            recent.recommendations.forEach(rec => allRecommendations.add(rec));
          }
        }
      }

      // Predict failures
      const allPredictions: GridHealthReport['predictedFailures'] = [];
      for (const sectorId of sectorIds) {
        const predictions = await this.predictGridFailures(sectorId);
        allPredictions.push(...predictions);
      }

      // Determine overall health
      let overallHealth: GridHealthReport['overallHealth'] = 'healthy';
      if (criticalIssues > 0) {
        overallHealth = 'critical';
      } else if (totalAnomalies > sectorIds.length * 2) {
        overallHealth = 'degraded';
      }

      const report: GridHealthReport = {
        timestamp: new Date(),
        overallHealth,
        sectorsAnalyzed: sectorIds.length,
        anomaliesDetected: totalAnomalies,
        criticalIssues,
        recommendations: Array.from(allRecommendations),
        predictedFailures: allPredictions
      };

      logger.info('Grid health report generated', {
        sectors: sectorIds.length,
        health: overallHealth,
        anomalies: totalAnomalies
      });

      return report;

    } catch (error) {
      logger.error('Failed to generate grid health report', { error });
      throw error;
    }
  }

  /**
   * Initiate automated response to critical anomalies
   */
  async initiateAutomatedResponse(anomaly: AnomalyDetectionResult, sensorId: string): Promise<{
    success: boolean;
    actionsToken: string[];
    message: string;
  }> {
    try {
      const actions: string[] = [];

      if (anomaly.severity === 'critical') {
        // Critical response actions
        if (anomaly.anomalies.some(a => a.metric === 'current' && a.deviation > 50)) {
          actions.push('CIRCUIT_BREAKER_TRIP');
          actions.push('LOAD_SHED_INITIATE');
        }
        
        if (anomaly.anomalies.some(a => a.metric === 'temperature' && a.deviation > 20)) {
          actions.push('COOLING_SYSTEM_ACTIVATE');
          actions.push('LOAD_REDUCTION_25_PERCENT');
        }

        // Notify emergency response
        actions.push('EMERGENCY_RESPONSE_NOTIFY');
        actions.push('BACKUP_SYSTEMS_ACTIVATE');
        
      } else if (anomaly.severity === 'high') {
        // High severity response
        actions.push('LOAD_BALANCING_INITIATE');
        actions.push('STANDBY_SYSTEMS_PREPARE');
        actions.push('MAINTENANCE_CREW_ALERT');
      }

      // Log all actions
      logger.warn('Automated response initiated', {
        sensorId,
        severity: anomaly.severity,
        actions
      });

      return {
        success: true,
        actionsToken: actions,
        message: `Automated response initiated for ${anomaly.severity} severity anomaly`
      };

    } catch (error) {
      logger.error('Failed to initiate automated response', { error });
      return {
        success: false,
        actionsToken: [],
        message: 'Failed to initiate automated response'
      };
    }
  }

  /**
   * Calculate risk score based on anomalies
   */
  private calculateRiskScore(anomalies: AnomalyDetectionResult['anomalies'], metrics: GridAnomalyData['metrics']): number {
    let score = 0;

    // Base score on number and severity of anomalies
    anomalies.forEach(anomaly => {
      score += anomaly.deviation * 0.5;
      
      // Additional weight for critical metrics
      if (anomaly.metric === 'current' || anomaly.metric === 'voltage') {
        score += anomaly.deviation * 0.3;
      }
    });

    // Factor in power factor
    if (metrics.powerFactor < 0.9) {
      score += (0.9 - metrics.powerFactor) * 100;
    }

    // Cap at 100
    return Math.min(100, Math.round(score));
  }

  /**
   * Generate recommendations based on anomalies
   */
  private generateRecommendations(anomalies: AnomalyDetectionResult['anomalies'], severity: AnomalyDetectionResult['severity']): string[] {
    const recommendations: string[] = [];

    // Severity-based recommendations
    if (severity === 'critical') {
      recommendations.push('Immediate intervention required - dispatch emergency response team');
      recommendations.push('Initiate load shedding protocols to prevent cascading failures');
    } else if (severity === 'high') {
      recommendations.push('Schedule priority maintenance within 24 hours');
      recommendations.push('Monitor affected components continuously');
    }

    // Metric-specific recommendations
    anomalies.forEach(anomaly => {
      switch (anomaly.metric) {
        case 'voltage':
          if (anomaly.value < anomaly.threshold) {
            recommendations.push('Check for excessive load or faulty voltage regulators');
            recommendations.push('Verify transformer tap settings');
          } else {
            recommendations.push('Inspect surge protection devices');
            recommendations.push('Check for switching transients or capacitor bank issues');
          }
          break;
          
        case 'current':
          recommendations.push('Investigate potential overload conditions');
          recommendations.push('Check for ground faults or phase imbalances');
          recommendations.push('Review load distribution and consider load balancing');
          break;
          
        case 'frequency':
          recommendations.push('Check generation-load balance');
          recommendations.push('Verify governor settings on generators');
          recommendations.push('Investigate potential islanding conditions');
          break;
          
        case 'temperature':
          recommendations.push('Inspect cooling systems and ventilation');
          recommendations.push('Check for blocked air filters or failed fans');
          recommendations.push('Consider derating equipment if temperature persists');
          break;
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Estimate time to failure based on anomaly patterns
   */
  private estimateTimeToFailure(metric: string, anomalyCount: number): string {
    const baseHours = {
      voltage: 168, // 1 week
      current: 72,  // 3 days
      temperature: 48, // 2 days
      frequency: 120 // 5 days
    };

    const hours = (baseHours[metric as keyof typeof baseHours] || 96) / (anomalyCount / 10);
    
    if (hours < 24) {
      return `${Math.round(hours)} hours`;
    } else if (hours < 168) {
      return `${Math.round(hours / 24)} days`;
    } else {
      return `${Math.round(hours / 168)} weeks`;
    }
  }

  /**
   * Get preventive action for a specific metric
   */
  private getPreventiveAction(metric: string): string {
    const actions: Record<string, string> = {
      voltage: 'Adjust transformer taps and verify voltage regulator settings',
      current: 'Redistribute load and inspect for potential short circuits',
      temperature: 'Service cooling systems and reduce load if necessary',
      frequency: 'Balance generation with load and check governor response'
    };

    return actions[metric] || 'Schedule comprehensive inspection';
  }

  /**
   * Get current grid health metrics
   */
  getHealthMetrics(): Record<string, number> {
    return Object.fromEntries(this.gridHealthMetrics);
  }
}