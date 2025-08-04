# Hierarchical Data Architecture for Dashboard Generation

## Overview

This document defines a three-tier architecture for generating dashboard data that maintains platform consistency while providing deep use-case specificity.

```
Platform Framework (Seraphim Vanguards)
    ↓
Vertical/Industry Framework (Energy, Healthcare, Finance, etc.)
    ↓
Use Case Specific Implementation (Grid Anomaly Detection, Patient Risk, etc.)
```

## 1. Platform-Level Framework

### Core Data Structures (Shared Across All Verticals)

```typescript
// Platform-wide interfaces
interface BaseEntity {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'inactive' | 'critical';
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

interface BaseMetric {
  name: string;
  value: number | string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  target?: number;
  benchmark?: number;
}

interface BaseAlert {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  description: string;
  affectedEntities: string[];
  status: 'active' | 'acknowledged' | 'resolved';
}

interface BaseWorkflow {
  id: string;
  name: string;
  progress: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  estimatedCompletion: string;
}

// Platform-wide visualization patterns
interface VisualizationConfig {
  type: 'metric-card' | 'time-series' | 'distribution' | 'comparison' | 'heatmap' | 'relationship';
  updateFrequency: 'real-time' | 'minute' | 'hourly' | 'daily';
  interactivity: 'static' | 'hover' | 'clickable' | 'draggable';
}
```

### Platform Constants

```typescript
// Seraphim Vanguards Platform Colors
const PLATFORM_COLORS = {
  primary: '#D4AF37', // Seraphim Gold
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  accent: '#8B5CF6',
};

// Platform Animation Patterns
const PLATFORM_ANIMATIONS = {
  stagger: { staggerChildren: 0.1 },
  fadeIn: { opacity: [0, 1], transition: { duration: 0.3 } },
  slideIn: { x: [-20, 0], opacity: [0, 1] },
  expand: { height: [0, 'auto'], opacity: [0, 1] },
};
```

## 2. Vertical-Level Framework

### Energy Vertical

```typescript
// Energy-specific base structures
interface EnergyAsset extends BaseEntity {
  type: 'well' | 'pipeline' | 'substation' | 'transformer' | 'generator' | 'storage';
  capacity: number;
  capacityUnit: 'MW' | 'MWh' | 'bbl/d' | 'MCF/d';
  efficiency: number;
  location: {
    lat: number;
    lng: number;
    region: string;
    field?: string;
  };
  operationalStatus: 'online' | 'offline' | 'maintenance' | 'emergency';
}

interface EnergyMetric extends BaseMetric {
  category: 'production' | 'efficiency' | 'environmental' | 'safety' | 'financial';
  complianceThreshold?: number;
  regulatoryStandard?: string;
}

// Energy vertical constants
const ENERGY_CONSTANTS = {
  voltageRange: { min: 110, max: 130, nominal: 120 },
  frequencyRange: { min: 59.9, max: 60.1, nominal: 60 },
  pressureRange: { min: 800, max: 1200, nominal: 1000 },
  temperatureRange: { min: 60, max: 180, nominal: 120 },
};

// Energy-specific terminology
const ENERGY_TERMINOLOGY = {
  'NPT': 'Non-Productive Time',
  'WOB': 'Weight on Bit',
  'ROP': 'Rate of Penetration',
  'SCADA': 'Supervisory Control and Data Acquisition',
  'DCS': 'Distributed Control System',
  'RTU': 'Remote Terminal Unit',
  'PLC': 'Programmable Logic Controller',
  'HMI': 'Human Machine Interface',
};
```

### Healthcare Vertical

```typescript
// Healthcare-specific base structures
interface HealthcareEntity extends BaseEntity {
  type: 'patient' | 'provider' | 'facility' | 'equipment' | 'medication';
  complianceStatus: {
    hipaa: boolean;
    clinicalGuidelines: boolean;
    qualityMeasures: boolean;
  };
}

interface PatientEntity extends HealthcareEntity {
  demographics: {
    age: number;
    gender: string;
    zipCode: string;
  };
  riskScore: number;
  conditions: string[];
  medications: string[];
  lastVisit: string;
  careTeam: string[];
}

interface ClinicalMetric extends BaseMetric {
  category: 'outcome' | 'process' | 'safety' | 'efficiency' | 'satisfaction';
  clinicalSignificance: 'high' | 'medium' | 'low';
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
}

// Healthcare vertical constants
const HEALTHCARE_CONSTANTS = {
  vitalSigns: {
    bloodPressure: { systolic: [90, 180], diastolic: [60, 120] },
    heartRate: [60, 100],
    temperature: [97, 103],
    respiratoryRate: [12, 20],
    oxygenSaturation: [90, 100],
  },
  labValues: {
    glucose: [70, 140],
    hba1c: [4, 10],
    cholesterol: [100, 300],
    creatinine: [0.5, 2.0],
  },
};

// Healthcare-specific terminology
const HEALTHCARE_TERMINOLOGY = {
  'HbA1c': 'Hemoglobin A1c',
  'COPD': 'Chronic Obstructive Pulmonary Disease',
  'CHF': 'Congestive Heart Failure',
  'CKD': 'Chronic Kidney Disease',
  'BMI': 'Body Mass Index',
  'LOS': 'Length of Stay',
  'ED': 'Emergency Department',
  'ICU': 'Intensive Care Unit',
};
```

### Finance Vertical

```typescript
// Finance-specific base structures
interface FinancialEntity extends BaseEntity {
  type: 'transaction' | 'account' | 'customer' | 'merchant' | 'instrument';
  riskScore: number;
  complianceFlags: {
    aml: boolean;
    kyc: boolean;
    sanctions: boolean;
  };
}

interface TransactionEntity extends FinancialEntity {
  amount: number;
  currency: string;
  timestamp: string;
  merchantCategory: string;
  channel: 'online' | 'atm' | 'pos' | 'wire' | 'mobile';
  location: {
    country: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  anomalyScore: number;
}

// Finance vertical constants
const FINANCE_CONSTANTS = {
  transactionLimits: {
    daily: { personal: 5000, business: 50000 },
    single: { personal: 2000, business: 25000 },
  },
  riskThresholds: {
    low: [0, 30],
    medium: [31, 70],
    high: [71, 100],
  },
  fraudPatterns: {
    velocity: { transactions: 10, timeWindow: 3600 }, // 10 transactions in 1 hour
    geographic: { distance: 500, timeWindow: 3600 }, // 500 miles in 1 hour
  },
};
```

## 3. Use Case Specific Generators

### Energy: Grid Anomaly Detection

```typescript
class GridAnomalyDataGenerator {
  private vertical = ENERGY_CONSTANTS;
  private terminology = ENERGY_TERMINOLOGY;
  
  generateAnomalies(): GridAnomaly[] {
    const anomalyTypes = [
      { 
        type: 'Voltage Fluctuation',
        severity: this.calculateVoltageSeverity,
        impact: 'Power quality degradation, equipment damage risk',
        metrics: ['voltageDeviation', 'harmonicDistortion', 'flickerIndex']
      },
      {
        type: 'Frequency Deviation',
        severity: this.calculateFrequencySeverity,
        impact: 'Grid instability, generator synchronization issues',
        metrics: ['frequencyDeviation', 'rateOfChange', 'oscillationAmplitude']
      },
      {
        type: 'Overload Warning',
        severity: this.calculateOverloadSeverity,
        impact: 'Equipment overheating, potential cascading failure',
        metrics: ['loadPercentage', 'temperature', 'coolingEfficiency']
      },
      {
        type: 'Phase Imbalance',
        severity: this.calculatePhaseImbalanceSeverity,
        impact: 'Motor damage, increased losses, neutral current',
        metrics: ['phaseAVoltage', 'phaseBVoltage', 'phaseCVoltage', 'neutralCurrent']
      },
      {
        type: 'Harmonic Distortion',
        severity: this.calculateHarmonicSeverity,
        impact: 'Equipment malfunction, communication interference',
        metrics: ['thd', 'individualHarmonics', 'kFactor']
      },
      {
        type: 'Power Factor Deviation',
        severity: this.calculatePowerFactorSeverity,
        impact: 'Increased losses, penalty charges, capacity reduction',
        metrics: ['powerFactor', 'reactivepower', 'apparentPower']
      },
    ];
    
    const gridComponents = [
      'Substation Alpha-1 (138kV)',
      'Transformer Bank T-42 (500MVA)',
      'Distribution Feeder F-7 (12.47kV)',
      'Capacitor Bank C-3 (10MVAR)',
      'Transmission Line L-15 (230kV)',
      'Bus Section B-9 (69kV)',
    ];
    
    return Array.from({ length: 30 }, (_, i) => {
      const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
      const component = gridComponents[Math.floor(Math.random() * gridComponents.length)];
      
      return {
        id: `GA-${String(i + 1).padStart(3, '0')}`,
        type: anomalyType.type,
        location: component,
        severity: this.calculateSeverity(anomalyType),
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        description: this.generateDescription(anomalyType, component),
        impact: anomalyType.impact,
        metrics: this.generateAnomalyMetrics(anomalyType),
        affectedCustomers: this.calculateAffectedCustomers(anomalyType.type),
        estimatedResolution: this.calculateResolutionTime(anomalyType.type),
        recommendedAction: this.generateRecommendedAction(anomalyType),
        relatedAnomalies: this.findRelatedAnomalies(i),
        historicalOccurrences: Math.floor(Math.random() * 10),
      };
    });
  }
  
  private calculateVoltageSeverity(deviation: number): 'critical' | 'warning' | 'info' {
    if (Math.abs(deviation) > 10) return 'critical';
    if (Math.abs(deviation) > 5) return 'warning';
    return 'info';
  }
  
  private generateAnomalyMetrics(anomalyType: any): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    anomalyType.metrics.forEach((metric: string) => {
      switch (metric) {
        case 'voltageDeviation':
          metrics[metric] = (Math.random() * 20) - 10; // -10% to +10%
          break;
        case 'frequencyDeviation':
          metrics[metric] = (Math.random() * 0.4) - 0.2; // -0.2Hz to +0.2Hz
          break;
        case 'powerFactor':
          metrics[metric] = 0.7 + Math.random() * 0.3; // 0.7 to 1.0
          break;
        case 'temperature':
          metrics[metric] = 60 + Math.random() * 60; // 60°C to 120°C
          break;
        case 'loadPercentage':
          metrics[metric] = 70 + Math.random() * 40; // 70% to 110%
          break;
        default:
          metrics[metric] = Math.random() * 100;
      }
    });
    
    return metrics;
  }
  
  generateTimeSeriesData(): GridAnomalyTimeSeries[] {
    const hours = 24;
    const baseAnomalyCount = 5;
    
    return Array.from({ length: hours }, (_, i) => {
      const hour = i;
      const isPeakHour = hour >= 7 && hour <= 19;
      const anomalyMultiplier = isPeakHour ? 1.5 : 0.7;
      
      return {
        hour: `${String(hour).padStart(2, '0')}:00`,
        critical: Math.floor(Math.random() * 3 * anomalyMultiplier),
        warning: Math.floor(Math.random() * 8 * anomalyMultiplier),
        info: Math.floor(Math.random() * 15 * anomalyMultiplier),
        resolved: Math.floor(Math.random() * 20),
        gridLoad: this.calculateGridLoad(hour),
        temperature: this.calculateTemperature(hour),
      };
    });
  }
  
  private calculateGridLoad(hour: number): number {
    // Realistic load curve
    const baseLoad = 3000; // MW
    const peakMultiplier = hour >= 7 && hour <= 19 ? 1.5 : 1.0;
    const randomVariation = Math.random() * 200 - 100;
    
    return Math.round(baseLoad * peakMultiplier + randomVariation);
  }
}
```

### Healthcare: Patient Risk Stratification

```typescript
class PatientRiskDataGenerator {
  private vertical = HEALTHCARE_CONSTANTS;
  private terminology = HEALTHCARE_TERMINOLOGY;
  
  generatePatients(): PatientRiskProfile[] {
    const conditions = [
      'Type 2 Diabetes',
      'Hypertension',
      'Congestive Heart Failure',
      'COPD',
      'Chronic Kidney Disease',
      'Coronary Artery Disease',
      'Atrial Fibrillation',
      'Obesity',
    ];
    
    const medications = [
      'Metformin 1000mg',
      'Lisinopril 10mg',
      'Atorvastatin 40mg',
      'Aspirin 81mg',
      'Furosemide 40mg',
      'Carvedilol 25mg',
      'Warfarin 5mg',
      'Insulin Glargine 20u',
    ];
    
    return Array.from({ length: 50 }, (_, i) => {
      const age = 45 + Math.floor(Math.random() * 40);
      const numConditions = 1 + Math.floor(Math.random() * 4);
      const patientConditions = this.selectRandom(conditions, numConditions);
      const numMedications = 2 + Math.floor(Math.random() * 6);
      const patientMedications = this.selectRandom(medications, numMedications);
      
      const riskFactors = this.calculateRiskFactors(age, patientConditions, patientMedications);
      const riskScore = this.calculateRiskScore(riskFactors);
      
      return {
        id: `P-${String(i + 1).padStart(5, '0')}`,
        demographics: {
          age,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          zipCode: this.generateZipCode(),
        },
        conditions: patientConditions,
        medications: patientMedications,
        riskScore,
        riskCategory: this.categorizeRisk(riskScore),
        lastAdmission: this.generateLastAdmission(riskScore),
        readmissionProbability: this.calculateReadmissionProbability(riskScore),
        careGaps: this.identifyCareGaps(patientConditions),
        socialDeterminants: this.generateSocialDeterminants(),
        vitals: this.generateVitals(patientConditions),
        labResults: this.generateLabResults(patientConditions),
        utilizationHistory: this.generateUtilizationHistory(riskScore),
        predictedCost: this.predictCost(riskScore, patientConditions),
        interventions: this.recommendInterventions(riskScore, patientConditions),
      };
    });
  }
  
  private calculateRiskScore(factors: RiskFactors): number {
    let score = 0;
    
    // Age factor
    score += factors.age > 75 ? 20 : factors.age > 65 ? 15 : 10;
    
    // Condition factors
    score += factors.hasChf ? 25 : 0;
    score += factors.hasCkd ? 20 : 0;
    score += factors.hasDiabetes ? 15 : 0;
    score += factors.multipleConditions ? 15 : 0;
    
    // Utilization factors
    score += factors.recentAdmission ? 20 : 0;
    score += factors.frequentEd ? 15 : 0;
    
    // Social factors
    score += factors.socialRisk ? 10 : 0;
    
    return Math.min(100, score);
  }
  
  generateCohortAnalysis(): PatientCohort[] {
    return [
      {
        name: 'Diabetes Type 2',
        size: 3450,
        avgRiskScore: 68,
        trend: 'increasing',
        topRiskFactors: ['Poor glycemic control', 'Medication non-adherence', 'Comorbidities'],
        interventionSuccess: 78,
        costPerPatient: 12500,
        qualityMetrics: {
          hba1cControl: 72,
          eyeExamCompliance: 68,
          footExamCompliance: 75,
          nephropathyScreening: 82,
        },
      },
      // Additional cohorts...
    ];
  }
}
```

### Finance: Real-time Fraud Detection

```typescript
class FraudDetectionDataGenerator {
  private vertical = FINANCE_CONSTANTS;
  
  generateTransactions(): FraudTransaction[] {
    const merchantCategories = [
      'Grocery Stores',
      'Gas Stations',
      'Restaurants',
      'Online Shopping',
      'Hotels',
      'Airlines',
      'ATM Withdrawal',
      'Wire Transfer',
    ];
    
    const channels = ['online', 'pos', 'atm', 'mobile', 'wire'];
    
    return Array.from({ length: 1000 }, (_, i) => {
      const isFraud = Math.random() < 0.02; // 2% fraud rate
      const amount = this.generateTransactionAmount(isFraud);
      const channel = this.selectChannel(isFraud);
      const location = this.generateLocation(isFraud);
      
      const transaction = {
        id: `TXN-${String(i + 1).padStart(8, '0')}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        amount,
        currency: 'USD',
        channel,
        merchantCategory: merchantCategories[Math.floor(Math.random() * merchantCategories.length)],
        location,
        accountId: `ACC-${String(Math.floor(Math.random() * 10000)).padStart(6, '0')}`,
        anomalyScore: this.calculateAnomalyScore(amount, channel, location, isFraud),
        riskFactors: this.identifyRiskFactors(amount, channel, location),
        isFraud,
        fraudType: isFraud ? this.selectFraudType() : null,
        mlModelScores: {
          neuralNetwork: Math.random(),
          randomForest: Math.random(),
          gradientBoosting: Math.random(),
          ensemble: Math.random(),
        },
        velocityMetrics: this.calculateVelocityMetrics(),
        deviceFingerprint: this.generateDeviceFingerprint(),
        behavioralScore: 0.5 + Math.random() * 0.5,
      };
      
      return transaction;
    });
  }
  
  private generateTransactionAmount(isFraud: boolean): number {
    if (isFraud) {
      // Fraudulent transactions tend to be larger
      return Math.random() < 0.3 
        ? 50 + Math.random() * 450 // Small fraud
        : 1000 + Math.random() * 9000; // Large fraud
    } else {
      // Normal transaction distribution
      const rand = Math.random();
      if (rand < 0.6) return 10 + Math.random() * 90; // 60% small
      if (rand < 0.9) return 100 + Math.random() * 400; // 30% medium
      return 500 + Math.random() * 1500; // 10% large
    }
  }
  
  generateFraudPatterns(): FraudPattern[] {
    return [
      {
        id: 'FP-001',
        name: 'Card Testing Pattern',
        description: 'Multiple small transactions followed by large purchase',
        detectionRate: 92,
        falsePositiveRate: 8,
        avgLossPrevented: 2500,
        indicators: [
          'Transaction velocity > 5 per hour',
          'Increasing transaction amounts',
          'Multiple merchant categories',
          'Geographic dispersion',
        ],
      },
      // Additional patterns...
    ];
  }
}
```

## 4. Integration Pattern

```typescript
// Master dashboard data generator that respects the hierarchy
class DashboardDataGenerator {
  private static generators = new Map<string, any>([
    ['energy-grid-anomaly', GridAnomalyDataGenerator],
    ['healthcare-patient-risk', PatientRiskDataGenerator],
    ['finance-fraud-detection', FraudDetectionDataGenerator],
    // ... other generators
  ]);
  
  static generateData(useCase: UseCase): DashboardData {
    const generatorClass = this.generators.get(useCase.id);
    if (!generatorClass) {
      throw new Error(`No generator found for use case: ${useCase.id}`);
    }
    
    const generator = new generatorClass();
    
    // Generate use-case specific data
    const specificData = generator.generateAll();
    
    // Apply vertical-level transformations
    const verticalData = this.applyVerticalTransformations(useCase.vertical, specificData);
    
    // Apply platform-level consistency
    const platformData = this.applyPlatformConsistency(verticalData);
    
    return platformData;
  }
  
  private static applyVerticalTransformations(vertical: string, data: any): any {
    // Apply vertical-specific business rules, compliance requirements, etc.
    switch (vertical) {
      case 'energy':
        return this.applyEnergyTransformations(data);
      case 'healthcare':
        return this.applyHealthcareTransformations(data);
      case 'finance':
        return this.applyFinanceTransformations(data);
      default:
        return data;
    }
  }
  
  private static applyPlatformConsistency(data: any): any {
    // Ensure consistent formatting, add platform metadata, etc.
    return {
      ...data,
      metadata: {
        generatedAt: new Date().toISOString(),
        platform: 'Seraphim Vanguards',
        version: '1.0.0',
      },
      styling: PLATFORM_COLORS,
      animations: PLATFORM_ANIMATIONS,
    };
  }
}
```

## 5. Usage Example

```typescript
// In a dashboard component
const GridAnomalyDashboard: React.FC<{ useCase: UseCase }> = ({ useCase }) => {
  const dashboardData = useMemo(() => {
    return DashboardDataGenerator.generateData(useCase);
  }, [useCase]);
  
  // The data now has:
  // 1. Platform-level consistency (colors, animations, base structures)
  // 2. Vertical-level specificity (energy terminology, compliance rules)
  // 3. Use-case granularity (grid-specific anomalies, metrics, patterns)
  
  return (
    <DashboardLayout>
      {/* Render dashboard using the hierarchical data */}
    </DashboardLayout>
  );
};
```

## Benefits of This Architecture

1. **Consistency**: Platform-level standards ensure uniform UX across all dashboards
2. **Flexibility**: Vertical frameworks provide industry-specific context
3. **Granularity**: Use-case generators create highly specific, realistic data
4. **Maintainability**: Changes at any level cascade appropriately
5. **Scalability**: New use cases inherit from their vertical framework
6. **Authenticity**: Data reflects real-world patterns and relationships