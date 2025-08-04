import { logger } from '../utils/logger';
import { BaseService } from './base.service';

export interface MethaneReading {
  sensorId: string;
  location: {
    latitude: number;
    longitude: number;
    facility: string;
    equipment?: string;
  };
  concentration: number; // ppm
  timestamp: Date;
  windSpeed?: number;
  windDirection?: number;
  temperature?: number;
  pressure?: number;
}

export interface MethaneAnomaly {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  readings: MethaneReading[];
  estimatedLeakRate: number; // kg/hr
  plume: {
    center: { lat: number; lng: number };
    radius: number; // meters
    direction: number; // degrees
  };
  detectedAt: Date;
  status: 'detected' | 'confirmed' | 'investigating' | 'resolved';
}

export interface MethaneAnalysis {
  anomalies: MethaneAnomaly[];
  riskScore: number;
  estimatedEmissions: number; // total kg
  complianceStatus: {
    withinLimits: boolean;
    reportingRequired: boolean;
    regulatoryThreshold: number;
  };
  recommendations: string[];
}

export class MethaneDetectionService extends BaseService {
  private static instance: MethaneDetectionService;
  private activeAnomalies: Map<string, MethaneAnomaly> = new Map();
  
  // Thresholds
  private readonly BACKGROUND_PPM = 2.0;
  private readonly WARNING_PPM = 10.0;
  private readonly ALERT_PPM = 50.0;
  private readonly CRITICAL_PPM = 100.0;
  private readonly REGULATORY_THRESHOLD_KG_HR = 6.0; // EPA threshold

  private constructor() {
    super();
    logger.info('MethaneDetectionService initialized');
  }

  static getInstance(): MethaneDetectionService {
    if (!MethaneDetectionService.instance) {
      MethaneDetectionService.instance = new MethaneDetectionService();
    }
    return MethaneDetectionService.instance;
  }

  async analyzeReadings(readings: MethaneReading[]): Promise<MethaneAnalysis> {
    try {
      logger.info(`Analyzing ${readings.length} methane readings`);

      // Group readings by location proximity
      const locationClusters = this.clusterReadingsByLocation(readings);
      
      // Detect anomalies in each cluster
      const anomalies: MethaneAnomaly[] = [];
      for (const cluster of locationClusters) {
        const anomaly = await this.detectAnomaly(cluster);
        if (anomaly) {
          anomalies.push(anomaly);
          this.activeAnomalies.set(anomaly.id, anomaly);
        }
      }

      // Calculate overall risk and emissions
      const analysis = await this.performComprehensiveAnalysis(anomalies, readings);
      
      // Send notifications for critical anomalies
      await this.handleCriticalAnomalies(anomalies);

      return analysis;
    } catch (error) {
      logger.error('Error analyzing methane readings:', error);
      throw error;
    }
  }

  private clusterReadingsByLocation(readings: MethaneReading[]): MethaneReading[][] {
    const clusters: MethaneReading[][] = [];
    const clusterRadius = 50; // meters

    for (const reading of readings) {
      let addedToCluster = false;
      
      for (const cluster of clusters) {
        const centerReading = cluster[0];
        const distance = this.calculateDistance(
          reading.location.latitude,
          reading.location.longitude,
          centerReading.location.latitude,
          centerReading.location.longitude
        );

        if (distance <= clusterRadius) {
          cluster.push(reading);
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        clusters.push([reading]);
      }
    }

    return clusters;
  }

  private async detectAnomaly(readings: MethaneReading[]): Promise<MethaneAnomaly | null> {
    // Filter readings above background
    const elevatedReadings = readings.filter(r => r.concentration > this.BACKGROUND_PPM);
    
    if (elevatedReadings.length === 0) {
      return null;
    }

    // Calculate average concentration and determine severity
    const avgConcentration = elevatedReadings.reduce((sum, r) => sum + r.concentration, 0) / elevatedReadings.length;
    const maxConcentration = Math.max(...elevatedReadings.map(r => r.concentration));
    
    const severity = this.determineSeverity(maxConcentration);
    if (!severity) return null;

    // Estimate leak rate using Gaussian plume model
    const leakRate = await this.estimateLeakRate(elevatedReadings);
    
    // Calculate plume characteristics
    const plume = this.calculatePlume(elevatedReadings);

    return {
      id: `MA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      readings: elevatedReadings,
      estimatedLeakRate: leakRate,
      plume,
      detectedAt: new Date(),
      status: 'detected'
    };
  }

  private determineSeverity(concentration: number): MethaneAnomaly['severity'] | null {
    if (concentration >= this.CRITICAL_PPM) return 'critical';
    if (concentration >= this.ALERT_PPM) return 'high';
    if (concentration >= this.WARNING_PPM) return 'medium';
    if (concentration > this.BACKGROUND_PPM) return 'low';
    return null;
  }

  private async estimateLeakRate(readings: MethaneReading[]): Promise<number> {
    // Simplified Gaussian plume model for leak rate estimation
    const avgConcentration = readings.reduce((sum, r) => sum + r.concentration, 0) / readings.length;
    const avgWindSpeed = readings[0].windSpeed || 3.0; // m/s default
    
    // Q = C * u * A / K
    // Where Q = emission rate, C = concentration, u = wind speed, A = cross-sectional area, K = dispersion coefficient
    const crossSectionalArea = 10; // m² (estimated)
    const dispersionCoeff = 0.1; // simplified
    
    const leakRateGPS = (avgConcentration * avgWindSpeed * crossSectionalArea) / dispersionCoeff;
    const leakRateKgHr = leakRateGPS * 3.6 * 0.656; // Convert g/s to kg/hr for methane
    
    return Math.round(leakRateKgHr * 100) / 100;
  }

  private calculatePlume(readings: MethaneReading[]): MethaneAnomaly['plume'] {
    // Calculate center of plume
    const centerLat = readings.reduce((sum, r) => sum + r.location.latitude, 0) / readings.length;
    const centerLng = readings.reduce((sum, r) => sum + r.location.longitude, 0) / readings.length;
    
    // Calculate radius based on furthest reading
    let maxDistance = 0;
    for (const reading of readings) {
      const distance = this.calculateDistance(
        centerLat, centerLng,
        reading.location.latitude, reading.location.longitude
      );
      maxDistance = Math.max(maxDistance, distance);
    }
    
    // Determine plume direction based on wind
    const avgWindDirection = readings[0].windDirection || 0;
    
    return {
      center: { lat: centerLat, lng: centerLng },
      radius: Math.round(maxDistance),
      direction: avgWindDirection
    };
  }

  private async performComprehensiveAnalysis(
    anomalies: MethaneAnomaly[],
    allReadings: MethaneReading[]
  ): Promise<MethaneAnalysis> {
    // Calculate total emissions
    const totalEmissions = anomalies.reduce((sum, a) => {
      const durationHours = (Date.now() - a.detectedAt.getTime()) / (1000 * 60 * 60);
      return sum + (a.estimatedLeakRate * durationHours);
    }, 0);

    // Calculate risk score (0-100)
    const riskScore = this.calculateRiskScore(anomalies);

    // Check compliance
    const maxLeakRate = Math.max(...anomalies.map(a => a.estimatedLeakRate), 0);
    const complianceStatus = {
      withinLimits: maxLeakRate < this.REGULATORY_THRESHOLD_KG_HR,
      reportingRequired: maxLeakRate >= this.REGULATORY_THRESHOLD_KG_HR || totalEmissions > 100,
      regulatoryThreshold: this.REGULATORY_THRESHOLD_KG_HR
    };

    // Generate recommendations using Vanguard agents
    const recommendations = await this.generateRecommendations(anomalies, complianceStatus);

    return {
      anomalies,
      riskScore,
      estimatedEmissions: Math.round(totalEmissions * 100) / 100,
      complianceStatus,
      recommendations
    };
  }

  private calculateRiskScore(anomalies: MethaneAnomaly[]): number {
    if (anomalies.length === 0) return 0;

    let score = 0;
    
    for (const anomaly of anomalies) {
      // Severity component (0-40)
      const severityScores = { low: 10, medium: 20, high: 30, critical: 40 };
      score += severityScores[anomaly.severity];
      
      // Leak rate component (0-30)
      const leakRateScore = Math.min(30, (anomaly.estimatedLeakRate / this.REGULATORY_THRESHOLD_KG_HR) * 30);
      score += leakRateScore;
      
      // Plume size component (0-30)
      const plumeScore = Math.min(30, (anomaly.plume.radius / 100) * 30);
      score += plumeScore;
    }

    // Average across all anomalies and cap at 100
    return Math.min(100, Math.round(score / anomalies.length));
  }

  private async generateRecommendations(
    anomalies: MethaneAnomaly[],
    complianceStatus: MethaneAnalysis['complianceStatus']
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Critical anomalies
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    if (criticalAnomalies.length > 0) {
      recommendations.push('IMMEDIATE ACTION: Evacuate personnel from affected areas');
      recommendations.push('Deploy emergency response team to critical leak locations');
      recommendations.push('Initiate emergency shutdown procedures for affected equipment');
    }

    // High severity anomalies
    const highAnomalies = anomalies.filter(a => a.severity === 'high');
    if (highAnomalies.length > 0) {
      recommendations.push('Dispatch repair crews to high-priority leak sites within 2 hours');
      recommendations.push('Implement temporary emission controls (vapor recovery units)');
      recommendations.push('Increase monitoring frequency to 15-minute intervals');
    }

    // Compliance recommendations
    if (!complianceStatus.withinLimits) {
      recommendations.push('File regulatory notification within 24 hours (exceeds EPA threshold)');
      recommendations.push('Prepare detailed emission report for regulatory submission');
      recommendations.push('Engage environmental compliance team for remediation planning');
    }

    // General recommendations
    if (anomalies.length > 0) {
      recommendations.push('Conduct root cause analysis for all detected leaks');
      recommendations.push('Review and update preventive maintenance schedules');
      recommendations.push('Consider installing continuous monitoring systems at leak-prone locations');
    }

    // Add AI-powered recommendations based on severity and compliance
    if (anomalies.some(a => a.severity === 'critical')) {
      recommendations.push('Deploy AI-powered leak localization drones for precise mapping');
      recommendations.push('Activate predictive maintenance protocols for similar equipment');
    }
    
    if (anomalies.length > 5) {
      recommendations.push('Implement continuous AI monitoring across all high-risk segments');
      recommendations.push('Schedule comprehensive system-wide integrity assessment');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private async handleCriticalAnomalies(anomalies: MethaneAnomaly[]): Promise<void> {
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical' || a.severity === 'high');
    
    for (const anomaly of criticalAnomalies) {
      // Log critical anomaly for notification system to pick up
      logger.warn('Critical methane anomaly detected', {
        anomalyId: anomaly.id,
        severity: anomaly.severity,
        leakRate: anomaly.estimatedLeakRate,
        location: anomaly.readings[0].location.facility,
        plumeCenter: anomaly.plume.center,
        workflowId: 'methane-detection'
      });
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  async confirmAnomaly(anomalyId: string, confirmed: boolean): Promise<void> {
    const anomaly = this.activeAnomalies.get(anomalyId);
    if (!anomaly) {
      throw new Error(`Anomaly ${anomalyId} not found`);
    }

    anomaly.status = confirmed ? 'confirmed' : 'resolved';
    
    if (confirmed) {
      // Trigger response workflow
      logger.info(`Methane anomaly ${anomalyId} confirmed, triggering response workflow`);
      // This would integrate with the workflow orchestration system
    } else {
      // Mark as false positive
      this.activeAnomalies.delete(anomalyId);
      logger.info(`Methane anomaly ${anomalyId} marked as resolved`);
    }
  }

  async getActiveAnomalies(): Promise<MethaneAnomaly[]> {
    return Array.from(this.activeAnomalies.values())
      .filter(a => a.status !== 'resolved');
  }

  async updateAnomalyStatus(anomalyId: string, status: MethaneAnomaly['status']): Promise<void> {
    const anomaly = this.activeAnomalies.get(anomalyId);
    if (!anomaly) {
      throw new Error(`Anomaly ${anomalyId} not found`);
    }

    anomaly.status = status;
    logger.info(`Updated anomaly ${anomalyId} status to ${status}`);

    if (status === 'resolved') {
      // Calculate final emissions for this anomaly
      const durationHours = (Date.now() - anomaly.detectedAt.getTime()) / (1000 * 60 * 60);
      const totalEmissions = anomaly.estimatedLeakRate * durationHours;
      
      logger.info(`Anomaly ${anomalyId} resolved. Total emissions: ${totalEmissions.toFixed(2)} kg`);
      
      // Archive the anomaly
      setTimeout(() => {
        this.activeAnomalies.delete(anomalyId);
      }, 24 * 60 * 60 * 1000); // Keep for 24 hours for reporting
    }
  }
}