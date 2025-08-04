import { reportService, ReportContent } from './report.service';
import { logger } from '../utils/logger';
import { promises as fs } from 'fs';
import path from 'path';

// Data models for grid anomaly detection
interface GridAnomaly {
  anomalyId: string;
  detectedAt: Date;
  location: {
    substation: string;
    feeder: string;
    segment: string;
    coordinates: { lat: number; lng: number };
  };
  type: 'voltage_sag' | 'voltage_spike' | 'frequency_deviation' | 'harmonic_distortion' | 'phase_imbalance' | 'equipment_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: number; // seconds
  affectedCustomers: number;
  rootCause: string;
  status: 'detected' | 'investigating' | 'resolved' | 'escalated';
  resolution: string;
}

interface GridMetrics {
  timestamp: Date;
  substationId: string;
  voltage: {
    phaseA: number;
    phaseB: number;
    phaseC: number;
    average: number;
  };
  current: {
    phaseA: number;
    phaseB: number;
    phaseC: number;
    neutral: number;
  };
  frequency: number;
  powerFactor: number;
  thd: number; // Total Harmonic Distortion
  temperature: number;
}

interface OutagePrediction {
  predictionId: string;
  timestamp: Date;
  location: string;
  probability: number; // 0-100%
  estimatedImpact: {
    customers: number;
    duration: number; // hours
    area: string;
  };
  riskFactors: string[];
  preventiveActions: string[];
}

interface MaintenanceRecommendation {
  equipmentId: string;
  equipmentType: string;
  location: string;
  healthScore: number; // 0-100
  lastMaintenance: Date;
  recommendedAction: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  potentialFailureDate: Date;
}

class GridAnomalyReportsService {
  private readonly reportsDir = path.join(process.cwd(), 'reports');
  private readonly publicReportsDir = path.join(process.cwd(), 'public', 'reports');

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
      await fs.mkdir(this.publicReportsDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create report directories:', error);
    }
  }

  // Generate sample anomalies
  private generateSampleAnomalies(count: number = 50): GridAnomaly[] {
    const types: GridAnomaly['type'][] = ['voltage_sag', 'voltage_spike', 'frequency_deviation', 'harmonic_distortion', 'phase_imbalance', 'equipment_failure'];
    const severities: GridAnomaly['severity'][] = ['low', 'medium', 'high', 'critical'];
    const statuses: GridAnomaly['status'][] = ['detected', 'investigating', 'resolved', 'escalated'];
    const substations = ['SUB-001', 'SUB-002', 'SUB-003', 'SUB-004', 'SUB-005'];
    
    return Array.from({ length: count }, (_, i) => {
      const detectedAt = new Date();
      detectedAt.setHours(detectedAt.getHours() - Math.floor(Math.random() * 168)); // Last week
      
      const type = types[Math.floor(Math.random() * types.length)];
      const severity = type === 'equipment_failure' ? 'critical' : severities[Math.floor(Math.random() * severities.length)];
      
      return {
        anomalyId: `ANM-${String(i + 1).padStart(6, '0')}`,
        detectedAt,
        location: {
          substation: substations[Math.floor(Math.random() * substations.length)],
          feeder: `FDR-${Math.floor(Math.random() * 10) + 1}`,
          segment: `SEG-${Math.floor(Math.random() * 20) + 1}`,
          coordinates: {
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1
          }
        },
        type,
        severity,
        duration: severity === 'critical' ? Math.floor(Math.random() * 3600) + 600 : Math.floor(Math.random() * 600) + 30,
        affectedCustomers: severity === 'critical' ? Math.floor(Math.random() * 5000) + 1000 : Math.floor(Math.random() * 500),
        rootCause: this.getRootCause(type),
        status: detectedAt.getTime() < Date.now() - 24 * 60 * 60 * 1000 ? 'resolved' : statuses[Math.floor(Math.random() * statuses.length)],
        resolution: 'Automated grid reconfiguration'
      };
    });
  }

  private getRootCause(type: GridAnomaly['type']): string {
    const causes = {
      voltage_sag: ['Heavy industrial load startup', 'Fault on adjacent feeder', 'Capacitor bank switching'],
      voltage_spike: ['Lightning strike', 'Switching transient', 'Load rejection'],
      frequency_deviation: ['Generation-load imbalance', 'Large generator trip', 'Interconnection issue'],
      harmonic_distortion: ['Non-linear loads', 'VFD operation', 'Arc furnace operation'],
      phase_imbalance: ['Single-phase load concentration', 'Broken conductor', 'Transformer issue'],
      equipment_failure: ['Insulation breakdown', 'Overheating', 'Mechanical failure', 'Age-related degradation']
    };
    
    const causesForType = causes[type];
    return causesForType[Math.floor(Math.random() * causesForType.length)];
  }

  // 1. Real-time Anomaly Detection Report
  async generateRealTimeAnomalyReport() {
    const recentAnomalies = this.generateSampleAnomalies(20).filter(a => 
      a.detectedAt.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    
    const criticalAnomalies = recentAnomalies.filter(a => a.severity === 'critical' || a.severity === 'high');
    
    const content: ReportContent = {
      title: 'Real-time Grid Anomaly Report',
      subtitle: 'AI-detected grid disturbances and anomalies in the last 24 hours',
      sections: [
        {
          heading: 'Anomaly Summary',
          content: `Total Anomalies Detected: ${recentAnomalies.length}\nCritical/High Severity: ${criticalAnomalies.length}\nCustomers Affected: ${recentAnomalies.reduce((sum, a) => sum + a.affectedCustomers, 0).toLocaleString()}\nAverage Resolution Time: ${Math.round(recentAnomalies.filter(a => a.status === 'resolved').reduce((sum, a) => sum + a.duration, 0) / recentAnomalies.filter(a => a.status === 'resolved').length / 60)} minutes\nSystem Health Score: ${(100 - criticalAnomalies.length * 5).toFixed(1)}/100`,
          type: 'text'
        },
        {
          heading: 'Critical Anomalies',
          content: criticalAnomalies.map(a => ({
            'Anomaly ID': a.anomalyId,
            'Time': a.detectedAt.toLocaleString(),
            'Location': `${a.location.substation}/${a.location.feeder}`,
            'Type': a.type.replace(/_/g, ' ').toUpperCase(),
            'Severity': a.severity.toUpperCase(),
            'Customers': a.affectedCustomers.toLocaleString(),
            'Status': a.status.toUpperCase()
          })),
          type: 'table'
        },
        {
          heading: 'Immediate Actions Required',
          content: [
            'Dispatch crew to SUB-003 for equipment failure investigation',
            'Implement voltage regulation at FDR-7 to prevent cascading',
            'Notify industrial customers about power quality issues',
            'Activate backup systems for critical infrastructure',
            'Monitor harmonic levels at SUB-002'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Real-time Grid Anomaly Report',
      description: 'AI-detected grid disturbances in last 24 hours',
      type: 'pdf',
      agent: 'Vanguard Anomaly Detection Agent',
      useCaseId: 'grid-anomaly-detection',
      workflowId: 'realtime-anomaly'
    });
  }

  // 2. Weekly Anomaly Analysis Report
  async generateWeeklyAnomalyAnalysis() {
    const weeklyAnomalies = this.generateSampleAnomalies(100);
    const anomalyByType = weeklyAnomalies.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const excelData = {
      'Weekly Summary': Object.entries(anomalyByType).map(([type, count]) => ({
        'Anomaly Type': type.replace(/_/g, ' ').toUpperCase(),
        'Occurrences': count,
        'Percentage': `${((count / weeklyAnomalies.length) * 100).toFixed(1)}%`,
        'Avg Duration (min)': Math.round(weeklyAnomalies.filter(a => a.type === type).reduce((sum, a) => sum + a.duration, 0) / count / 60),
        'Customers Affected': weeklyAnomalies.filter(a => a.type === type).reduce((sum, a) => sum + a.affectedCustomers, 0)
      })),
      'Daily Breakdown': Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        const dayAnomalies = weeklyAnomalies.filter(a => 
          a.detectedAt.toDateString() === date.toDateString()
        );
        return {
          Date: date.toLocaleDateString(),
          'Total Anomalies': dayAnomalies.length,
          'Critical': dayAnomalies.filter(a => a.severity === 'critical').length,
          'High': dayAnomalies.filter(a => a.severity === 'high').length,
          'Medium': dayAnomalies.filter(a => a.severity === 'medium').length,
          'Low': dayAnomalies.filter(a => a.severity === 'low').length
        };
      }),
      'Location Analysis': this.getLocationAnalysis(weeklyAnomalies),
      'Root Cause Analysis': this.getRootCauseAnalysis(weeklyAnomalies)
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Weekly Grid Anomaly Analysis',
      description: 'Comprehensive weekly analysis of grid anomalies and patterns',
      type: 'xlsx',
      agent: 'Vanguard Analytics Agent',
      useCaseId: 'grid-anomaly-detection',
      workflowId: 'weekly-analysis'
    });
  }

  // 3. Outage Prediction Report
  async generateOutagePredictionReport() {
    const predictions = this.generateOutagePredictions(15);
    const highRiskPredictions = predictions.filter(p => p.probability > 70);
    
    const content: ReportContent = {
      title: 'Grid Outage Prediction Report - Next 7 Days',
      subtitle: 'ML-based predictions of potential grid failures and outages',
      sections: [
        {
          heading: 'Prediction Overview',
          content: `Total Risk Areas Identified: ${predictions.length}\nHigh Risk Predictions (>70%): ${highRiskPredictions.length}\nPotential Customers at Risk: ${predictions.reduce((sum, p) => sum + p.estimatedImpact.customers, 0).toLocaleString()}\nEstimated Economic Impact: $${(predictions.reduce((sum, p) => sum + p.estimatedImpact.customers * p.estimatedImpact.duration * 10, 0) / 1000).toFixed(0)}K\nModel Confidence: 92.3%`,
          type: 'text'
        },
        {
          heading: 'High Risk Predictions',
          content: highRiskPredictions.map(p => ({
            'Location': p.location,
            'Probability': `${p.probability}%`,
            'Est. Impact': `${p.estimatedImpact.customers} customers`,
            'Duration': `${p.estimatedImpact.duration} hours`,
            'Primary Risk': p.riskFactors[0],
            'Action': p.preventiveActions[0]
          })),
          type: 'table'
        },
        {
          heading: 'Preventive Maintenance Recommendations',
          content: [
            'Schedule emergency inspection of SUB-002 transformer',
            'Replace aging circuit breakers at FDR-5 and FDR-7',
            'Trim vegetation near transmission lines in North sector',
            'Upgrade protection relays in high-risk substations',
            'Increase monitoring frequency for identified risk areas',
            'Pre-position repair crews in high-probability zones'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Grid Outage Prediction Report',
      description: 'ML-based outage predictions for next 7 days',
      type: 'pdf',
      agent: 'Vanguard Predictive Analytics Agent',
      useCaseId: 'grid-anomaly-detection',
      workflowId: 'outage-prediction'
    });
  }

  // 4. Equipment Health Report
  async generateEquipmentHealthReport() {
    const equipment = this.generateEquipmentHealth(50);
    const criticalEquipment = equipment.filter(e => e.healthScore < 60);
    
    const excelData = {
      'Health Summary': [
        { Category: 'Critical (0-60)', Count: equipment.filter(e => e.healthScore < 60).length },
        { Category: 'Warning (60-80)', Count: equipment.filter(e => e.healthScore >= 60 && e.healthScore < 80).length },
        { Category: 'Good (80-90)', Count: equipment.filter(e => e.healthScore >= 80 && e.healthScore < 90).length },
        { Category: 'Excellent (90-100)', Count: equipment.filter(e => e.healthScore >= 90).length }
      ],
      'Critical Equipment': criticalEquipment.map(e => ({
        'Equipment ID': e.equipmentId,
        'Type': e.equipmentType,
        'Location': e.location,
        'Health Score': e.healthScore,
        'Last Maintenance': e.lastMaintenance.toLocaleDateString(),
        'Action': e.recommendedAction,
        'Priority': e.priority.toUpperCase(),
        'Est. Cost': `$${e.estimatedCost.toLocaleString()}`
      })),
      'Maintenance Schedule': equipment
        .filter(e => e.priority === 'urgent' || e.priority === 'high')
        .sort((a, b) => a.potentialFailureDate.getTime() - b.potentialFailureDate.getTime())
        .map(e => ({
          'Equipment ID': e.equipmentId,
          'Type': e.equipmentType,
          'Location': e.location,
          'Potential Failure': e.potentialFailureDate.toLocaleDateString(),
          'Recommended Action': e.recommendedAction,
          'Priority': e.priority.toUpperCase()
        }))
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Equipment Health Assessment Report',
      description: 'Comprehensive equipment health analysis and maintenance recommendations',
      type: 'xlsx',
      agent: 'Vanguard Asset Management Agent',
      useCaseId: 'grid-anomaly-detection',
      workflowId: 'equipment-health'
    });
  }

  // 5. Power Quality Analysis Report
  async generatePowerQualityReport() {
    const metrics = this.generateGridMetrics(168); // Last week hourly
    const qualityIssues = this.analyzePowerQuality(metrics);
    
    const content: ReportContent = {
      title: 'Power Quality Analysis Report - November 2024',
      subtitle: 'Comprehensive analysis of grid power quality metrics and compliance',
      sections: [
        {
          heading: 'Power Quality Summary',
          content: `Average Voltage Deviation: ${qualityIssues.avgVoltageDeviation.toFixed(2)}%\nFrequency Compliance: ${qualityIssues.frequencyCompliance.toFixed(1)}%\nTHD Violations: ${qualityIssues.thdViolations}\nPhase Imbalance Events: ${qualityIssues.phaseImbalanceEvents}\nIEEE 519 Compliance: ${qualityIssues.ieee519Compliance ? 'PASS' : 'FAIL'}`,
          type: 'text'
        },
        {
          heading: 'Substation Performance',
          content: qualityIssues.substationMetrics.map(s => ({
            'Substation': s.substationId,
            'Voltage Compliance': `${s.voltageCompliance.toFixed(1)}%`,
            'Avg THD': `${s.avgThd.toFixed(2)}%`,
            'Power Factor': s.avgPowerFactor.toFixed(3),
            'Quality Score': `${s.qualityScore}/100`,
            'Status': s.qualityScore > 90 ? 'GOOD' : s.qualityScore > 75 ? 'FAIR' : 'POOR'
          })),
          type: 'table'
        },
        {
          heading: 'Improvement Recommendations',
          content: [
            'Install harmonic filters at industrial feeders',
            'Upgrade capacitor banks for power factor correction',
            'Implement dynamic voltage regulation at SUB-003',
            'Balance single-phase loads across all phases',
            'Monitor and limit non-linear loads during peak hours'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Power Quality Analysis Report',
      description: 'Grid power quality metrics and compliance analysis',
      type: 'pdf',
      agent: 'Vanguard Power Quality Agent',
      useCaseId: 'grid-anomaly-detection',
      workflowId: 'power-quality'
    });
  }

  // 6. Anomaly Pattern Recognition Report
  async generatePatternRecognitionReport() {
    const anomalies = this.generateSampleAnomalies(500); // Large dataset for pattern analysis
    const patterns = this.identifyAnomalyPatterns(anomalies);
    
    const jsonData = {
      analysisDate: new Date().toISOString(),
      totalAnomaliesAnalyzed: anomalies.length,
      patternsIdentified: patterns.length,
      patterns: patterns.map(p => ({
        patternId: p.id,
        type: p.type,
        description: p.description,
        frequency: p.frequency,
        locations: p.affectedLocations,
        timePattern: p.timePattern,
        confidence: p.confidence,
        predictiveValue: p.predictiveValue,
        recommendations: p.recommendations
      })),
      mlModelMetrics: {
        accuracy: 94.7,
        precision: 92.3,
        recall: 96.1,
        f1Score: 94.2,
        lastTrainingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      nextSteps: [
        'Retrain model with latest anomaly data',
        'Implement automated response for identified patterns',
        'Share patterns with neighboring utilities',
        'Update protection settings based on patterns'
      ]
    };

    return await reportService.generateJSONReport(jsonData, {
      name: 'Anomaly Pattern Recognition Analysis',
      description: 'ML-identified patterns in grid anomalies',
      type: 'json',
      agent: 'Vanguard Pattern Recognition Agent',
      useCaseId: 'grid-anomaly-detection',
      workflowId: 'pattern-analysis'
    });
  }

  // Helper methods
  private getLocationAnalysis(anomalies: GridAnomaly[]) {
    const locationStats = anomalies.reduce((acc, a) => {
      const key = a.location.substation;
      if (!acc[key]) {
        acc[key] = { count: 0, critical: 0, customers: 0 };
      }
      acc[key].count++;
      if (a.severity === 'critical') acc[key].critical++;
      acc[key].customers += a.affectedCustomers;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(locationStats).map(([location, stats]: [string, any]) => ({
      Location: location,
      'Total Anomalies': stats.count,
      'Critical Events': stats.critical,
      'Customers Affected': stats.customers,
      'Risk Level': stats.critical > 5 ? 'HIGH' : stats.critical > 2 ? 'MEDIUM' : 'LOW'
    }));
  }

  private getRootCauseAnalysis(anomalies: GridAnomaly[]) {
    const causes = anomalies.reduce((acc, a) => {
      acc[a.rootCause] = (acc[a.rootCause] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(causes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([cause, count]) => ({
        'Root Cause': cause,
        'Occurrences': count,
        'Percentage': `${((count / anomalies.length) * 100).toFixed(1)}%`
      }));
  }

  private generateOutagePredictions(count: number): OutagePrediction[] {
    const locations = ['SUB-001/FDR-3', 'SUB-002/FDR-7', 'SUB-003/FDR-1', 'SUB-004/FDR-9', 'SUB-005/FDR-2'];
    const riskFactors = [
      ['Equipment age', 'High load forecast', 'Weather conditions'],
      ['Vegetation encroachment', 'Historical failure pattern', 'Maintenance overdue'],
      ['Harmonic distortion', 'Thermal stress', 'Protection relay issues'],
      ['Lightning risk', 'Switching transients', 'Cable degradation']
    ];
    
    return Array.from({ length: count }, (_, i) => ({
      predictionId: `PRED-${String(i + 1).padStart(5, '0')}`,
      timestamp: new Date(),
      location: locations[Math.floor(Math.random() * locations.length)],
      probability: 30 + Math.random() * 60,
      estimatedImpact: {
        customers: Math.floor(Math.random() * 5000) + 500,
        duration: Math.floor(Math.random() * 8) + 1,
        area: `Zone ${Math.floor(Math.random() * 10) + 1}`
      },
      riskFactors: riskFactors[Math.floor(Math.random() * riskFactors.length)],
      preventiveActions: [
        'Preventive maintenance',
        'Load transfer preparation',
        'Crew pre-positioning'
      ]
    }));
  }

  private generateEquipmentHealth(count: number): MaintenanceRecommendation[] {
    const equipmentTypes = ['Transformer', 'Circuit Breaker', 'Relay', 'Capacitor Bank', 'Voltage Regulator'];
    const actions = ['Replace', 'Major Overhaul', 'Minor Repair', 'Inspection', 'Calibration'];
    
    return Array.from({ length: count }, (_, i) => {
      const healthScore = Math.random() * 100;
      const lastMaintenance = new Date();
      lastMaintenance.setDate(lastMaintenance.getDate() - Math.floor(Math.random() * 730));
      
      const potentialFailure = new Date();
      potentialFailure.setDate(potentialFailure.getDate() + Math.floor((healthScore / 100) * 365));
      
      return {
        equipmentId: `EQP-${String(i + 1).padStart(5, '0')}`,
        equipmentType: equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)],
        location: `SUB-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
        healthScore: Math.round(healthScore),
        lastMaintenance,
        recommendedAction: actions[Math.floor((100 - healthScore) / 20)],
        priority: healthScore < 40 ? 'urgent' : healthScore < 60 ? 'high' : healthScore < 80 ? 'medium' : 'low',
        estimatedCost: Math.floor((100 - healthScore) * 100 + Math.random() * 5000),
        potentialFailureDate: potentialFailure
      };
    });
  }

  private generateGridMetrics(hours: number): GridMetrics[] {
    const substations = ['SUB-001', 'SUB-002', 'SUB-003', 'SUB-004', 'SUB-005'];
    const metrics: GridMetrics[] = [];
    
    for (let h = 0; h < hours; h++) {
      for (const substation of substations) {
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - hours + h);
        
        const baseVoltage = 230;
        const baseCurrent = 100;
        
        metrics.push({
          timestamp,
          substationId: substation,
          voltage: {
            phaseA: baseVoltage + (Math.random() - 0.5) * 10,
            phaseB: baseVoltage + (Math.random() - 0.5) * 10,
            phaseC: baseVoltage + (Math.random() - 0.5) * 10,
            average: baseVoltage
          },
          current: {
            phaseA: baseCurrent + (Math.random() - 0.5) * 20,
            phaseB: baseCurrent + (Math.random() - 0.5) * 20,
            phaseC: baseCurrent + (Math.random() - 0.5) * 20,
            neutral: Math.random() * 10
          },
          frequency: 50 + (Math.random() - 0.5) * 0.2,
          powerFactor: 0.85 + Math.random() * 0.1,
          thd: 2 + Math.random() * 3,
          temperature: 25 + Math.random() * 15
        });
      }
    }
    
    return metrics;
  }

  private analyzePowerQuality(metrics: GridMetrics[]) {
    const substations = [...new Set(metrics.map(m => m.substationId))];
    
    return {
      avgVoltageDeviation: metrics.reduce((sum, m) => {
        const deviation = Math.abs(m.voltage.average - 230) / 230 * 100;
        return sum + deviation;
      }, 0) / metrics.length,
      frequencyCompliance: (metrics.filter(m => Math.abs(m.frequency - 50) < 0.1).length / metrics.length) * 100,
      thdViolations: metrics.filter(m => m.thd > 5).length,
      phaseImbalanceEvents: metrics.filter(m => {
        const voltages = [m.voltage.phaseA, m.voltage.phaseB, m.voltage.phaseC];
        const avg = voltages.reduce((a, b) => a + b) / 3;
        return voltages.some(v => Math.abs(v - avg) / avg > 0.02);
      }).length,
      ieee519Compliance: metrics.filter(m => m.thd > 5).length / metrics.length < 0.05,
      substationMetrics: substations.map(sub => {
        const subMetrics = metrics.filter(m => m.substationId === sub);
        return {
          substationId: sub,
          voltageCompliance: (subMetrics.filter(m => Math.abs(m.voltage.average - 230) / 230 < 0.05).length / subMetrics.length) * 100,
          avgThd: subMetrics.reduce((sum, m) => sum + m.thd, 0) / subMetrics.length,
          avgPowerFactor: subMetrics.reduce((sum, m) => sum + m.powerFactor, 0) / subMetrics.length,
          qualityScore: Math.round(85 + Math.random() * 15)
        };
      })
    };
  }

  private identifyAnomalyPatterns(_anomalies: GridAnomaly[]) {
    return [
      {
        id: 'PAT-001',
        type: 'Temporal',
        description: 'Peak hour voltage sags',
        frequency: 'Daily 2-4 PM',
        affectedLocations: ['SUB-001', 'SUB-003'],
        timePattern: 'Weekdays during industrial operation',
        confidence: 0.92,
        predictiveValue: 0.87,
        recommendations: ['Increase reactive power support', 'Schedule industrial loads']
      },
      {
        id: 'PAT-002',
        type: 'Cascading',
        description: 'Sequential equipment failures',
        frequency: 'Monthly',
        affectedLocations: ['SUB-002/FDR-5', 'SUB-002/FDR-7'],
        timePattern: 'Following maintenance activities',
        confidence: 0.85,
        predictiveValue: 0.79,
        recommendations: ['Review maintenance procedures', 'Implement isolation protocols']
      },
      {
        id: 'PAT-003',
        type: 'Weather-correlated',
        description: 'Lightning-induced transients',
        frequency: 'Storm events',
        affectedLocations: ['All outdoor equipment'],
        timePattern: 'During thunderstorms',
        confidence: 0.95,
        predictiveValue: 0.88,
        recommendations: ['Install surge arresters', 'Weather-based switching']
      }
    ];
  }

  // Generate all reports
  async generateAllReports() {
    try {
      logger.info('Generating all grid anomaly detection reports...');
      
      const reports = await Promise.all([
        this.generateRealTimeAnomalyReport(),
        this.generateWeeklyAnomalyAnalysis(),
        this.generateOutagePredictionReport(),
        this.generateEquipmentHealthReport(),
        this.generatePowerQualityReport(),
        this.generatePatternRecognitionReport()
      ]);

      logger.info(`Successfully generated ${reports.length} reports`);
      return reports;
    } catch (error) {
      logger.error('Failed to generate all reports:', error);
      throw error;
    }
  }

  // Generate specific report by type
  async generateReportByType(reportType: string) {
    switch (reportType) {
      case 'realtime-anomaly':
        return await this.generateRealTimeAnomalyReport();
      case 'weekly-anomaly-analysis':
        return await this.generateWeeklyAnomalyAnalysis();
      case 'outage-prediction':
        return await this.generateOutagePredictionReport();
      case 'equipment-health':
        return await this.generateEquipmentHealthReport();
      case 'power-quality':
        return await this.generatePowerQualityReport();
      case 'pattern-recognition':
        return await this.generatePatternRecognitionReport();
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}

export const gridAnomalyReportsService = new GridAnomalyReportsService();