# Mock Data Generator Architecture

## Overview
This document outlines the hierarchical mock data generation system designed to support 37 custom dashboards with realistic, domain-specific data. The architecture follows a three-tier approach: Platform → Vertical → Use Case.

## Architecture Principles

1. **Hierarchical Inheritance**: Use case generators inherit from vertical generators, which inherit from platform generators
2. **Domain Authenticity**: Generate realistic data using industry-specific terminology and patterns
3. **Temporal Consistency**: Maintain time-based relationships and trends
4. **Referential Integrity**: Ensure related data points are logically consistent
5. **Performance**: Generate data efficiently for real-time updates
6. **Deterministic Options**: Support seeded generation for testing

## Three-Tier Architecture

### Tier 1: Platform-Level Generators (Base)

```typescript
// Base generator interface
interface BaseDataGenerator {
  generateId(): string;
  generateTimestamp(options?: TimeOptions): Date;
  generateDateRange(start: Date, end: Date, interval: TimeInterval): Date[];
  generateTrend(points: number, options: TrendOptions): number[];
  generateNormalDistribution(mean: number, stdDev: number, count: number): number[];
  generateCategoricalData<T>(categories: T[], weights?: number[]): T;
  generateGeoCoordinates(bounds?: GeoBounds): Coordinates;
}

// Platform-wide data patterns
class PlatformDataGenerator implements BaseDataGenerator {
  protected seed?: number;
  
  constructor(seed?: number) {
    this.seed = seed;
  }
  
  // Common SIA score generation
  generateSIAScores(): SIAScores {
    return {
      security: this.generateScore(70, 95),
      integrity: this.generateScore(75, 98),
      accuracy: this.generateScore(80, 99),
    };
  }
  
  // Common status generation
  generateStatus(): Status {
    return this.generateCategoricalData(
      ['active', 'warning', 'error', 'inactive'],
      [70, 20, 5, 5]
    );
  }
  
  // Common alert generation
  generateAlert(severity: AlertSeverity): Alert {
    return {
      id: this.generateId(),
      timestamp: this.generateTimestamp(),
      severity,
      title: this.generateAlertTitle(severity),
      description: this.generateAlertDescription(severity),
      status: 'active',
    };
  }
}
```

### Tier 2: Vertical-Level Generators

#### Energy Vertical Generator
```typescript
class EnergyDataGenerator extends PlatformDataGenerator {
  // Energy-specific constants
  private readonly voltageRanges = {
    transmission: { min: 138, max: 765 }, // kV
    distribution: { min: 4.16, max: 34.5 }, // kV
    residential: { min: 110, max: 240 }, // V
  };
  
  private readonly frequencyRange = { min: 59.9, max: 60.1 }; // Hz
  
  // Energy-specific generators
  generateVoltageReading(type: 'transmission' | 'distribution' | 'residential'): VoltageReading {
    const range = this.voltageRanges[type];
    const nominal = (range.min + range.max) / 2;
    const deviation = this.generateNormalDistribution(0, nominal * 0.02, 1)[0];
    
    return {
      value: nominal + deviation,
      unit: type === 'residential' ? 'V' : 'kV',
      timestamp: this.generateTimestamp(),
      quality: this.assessVoltageQuality(nominal + deviation, range),
    };
  }
  
  generateGridComponent(): GridComponent {
    const types = ['substation', 'transformer', 'feeder', 'transmission_line'];
    const type = this.generateCategoricalData(types);
    
    return {
      id: this.generateId(),
      type,
      name: this.generateComponentName(type),
      location: this.generateGeoCoordinates(),
      capacity: this.generateCapacity(type),
      utilization: this.generateUtilization(),
      health: this.generateHealthScore(),
      lastMaintenance: this.generateTimestamp({ daysAgo: 30 }),
    };
  }
  
  generateEnergySource(): EnergySource {
    const sources = ['solar', 'wind', 'natural_gas', 'nuclear', 'hydro', 'coal'];
    const source = this.generateCategoricalData(sources, [25, 20, 30, 10, 10, 5]);
    
    return {
      type: source,
      capacity: this.generateSourceCapacity(source),
      currentOutput: 0, // Will be calculated based on conditions
      efficiency: this.generateEfficiency(source),
      carbonIntensity: this.getCarbonIntensity(source),
    };
  }
}
```

#### Healthcare Vertical Generator
```typescript
class HealthcareDataGenerator extends PlatformDataGenerator {
  // Healthcare-specific constants
  private readonly vitalRanges = {
    heartRate: { min: 60, max: 100 },
    bloodPressure: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 } },
    temperature: { min: 97.0, max: 99.0 },
    respiration: { min: 12, max: 20 },
    oxygen: { min: 95, max: 100 },
  };
  
  generatePatient(): Patient {
    const age = this.generateAge();
    const conditions = this.generateConditions(age);
    
    return {
      id: this.generateId(),
      demographics: this.generateDemographics(age),
      conditions,
      riskScore: this.calculateRiskScore(age, conditions),
      lastVisit: this.generateTimestamp({ daysAgo: 30 }),
      nextAppointment: this.generateTimestamp({ daysAhead: 14 }),
    };
  }
  
  generateVitals(): Vitals {
    return {
      heartRate: this.generateNormalDistribution(75, 10, 1)[0],
      bloodPressure: {
        systolic: this.generateNormalDistribution(120, 15, 1)[0],
        diastolic: this.generateNormalDistribution(80, 10, 1)[0],
      },
      temperature: this.generateNormalDistribution(98.6, 0.5, 1)[0],
      respiration: this.generateNormalDistribution(16, 2, 1)[0],
      oxygenSaturation: this.generateNormalDistribution(98, 1.5, 1)[0],
      timestamp: this.generateTimestamp(),
    };
  }
  
  generateDiagnosis(): Diagnosis {
    const conditions = this.loadICD10Codes();
    const condition = this.generateCategoricalData(conditions);
    
    return {
      code: condition.code,
      description: condition.description,
      confidence: this.generateConfidence(),
      supportingEvidence: this.generateEvidence(),
      differentials: this.generateDifferentials(condition),
    };
  }
}
```

#### Finance Vertical Generator
```typescript
class FinanceDataGenerator extends PlatformDataGenerator {
  generateTransaction(): Transaction {
    const amount = this.generateTransactionAmount();
    const type = this.generateTransactionType();
    
    return {
      id: this.generateId(),
      timestamp: this.generateTimestamp(),
      amount,
      currency: 'USD',
      type,
      merchant: this.generateMerchant(type),
      location: this.generateTransactionLocation(),
      method: this.generatePaymentMethod(),
      riskScore: this.calculateTransactionRisk(amount, type),
    };
  }
  
  generateCreditApplication(): CreditApplication {
    const income = this.generateIncome();
    const creditHistory = this.generateCreditHistory();
    
    return {
      id: this.generateId(),
      applicant: this.generateApplicant(),
      income,
      creditHistory,
      requestedAmount: this.generateLoanAmount(income),
      purpose: this.generateLoanPurpose(),
      alternativeData: this.generateAlternativeData(),
      score: this.calculateCreditScore(income, creditHistory),
    };
  }
  
  generateAMLAlert(): AMLAlert {
    const pattern = this.generateSuspiciousPattern();
    
    return {
      id: this.generateId(),
      timestamp: this.generateTimestamp(),
      pattern,
      transactions: this.generateRelatedTransactions(pattern),
      riskLevel: this.assessAMLRisk(pattern),
      customerProfile: this.generateCustomerProfile(),
      requiresSAR: this.determineSARRequirement(pattern),
    };
  }
}
```

### Tier 3: Use Case Specific Generators

#### Grid Anomaly Detection Generator
```typescript
class GridAnomalyGenerator extends EnergyDataGenerator {
  generateAnomalyData(): GridAnomalyData {
    const components = this.generateGridComponents(50);
    const anomalies = this.generateAnomalies(components);
    
    return {
      timestamp: new Date(),
      gridStatus: {
        totalComponents: components.length,
        activeAnomalies: anomalies.length,
        affectedCustomers: this.calculateAffectedCustomers(anomalies),
        stabilityIndex: this.calculateStabilityIndex(anomalies),
      },
      anomalies: anomalies.map(a => ({
        ...a,
        severity: this.classifyAnomalySeverity(a),
        predictedDuration: this.predictDuration(a),
        recommendedAction: this.recommendAction(a),
      })),
      components: components.map(c => ({
        ...c,
        anomalyProbability: this.predictAnomalyProbability(c),
      })),
      predictions: this.generatePredictions(components),
      weatherOverlay: this.generateWeatherData(),
    };
  }
  
  private generateAnomalies(components: GridComponent[]): Anomaly[] {
    const anomalyTypes = [
      'voltage_fluctuation',
      'frequency_deviation',
      'overload',
      'phase_imbalance',
      'harmonic_distortion',
    ];
    
    return components
      .filter(() => Math.random() < 0.1) // 10% anomaly rate
      .map(component => ({
        id: this.generateId(),
        componentId: component.id,
        type: this.generateCategoricalData(anomalyTypes),
        detectedAt: this.generateTimestamp(),
        measurements: this.generateAnomalyMeasurements(),
        impact: this.assessImpact(component),
      }));
  }
}
```

#### Patient Risk Stratification Generator
```typescript
class PatientRiskGenerator extends HealthcareDataGenerator {
  generateRiskStratificationData(): RiskStratificationData {
    const patients = this.generatePatientCohort(1000);
    const interventions = this.generateInterventions();
    
    return {
      timestamp: new Date(),
      summary: {
        totalPatients: patients.length,
        highRisk: patients.filter(p => p.riskScore > 70).length,
        mediumRisk: patients.filter(p => p.riskScore >= 40 && p.riskScore <= 70).length,
        lowRisk: patients.filter(p => p.riskScore < 40).length,
      },
      cohorts: this.groupPatientsByCohort(patients),
      riskFactors: this.analyzeRiskFactors(patients),
      interventions: interventions.map(i => ({
        ...i,
        enrolledPatients: this.matchPatientsToIntervention(patients, i),
        effectiveness: this.measureEffectiveness(i),
      })),
      predictions: this.generateRiskPredictions(patients),
      outcomes: this.generateOutcomeMetrics(patients),
    };
  }
  
  private generatePatientCohort(count: number): Patient[] {
    return Array.from({ length: count }, () => {
      const patient = this.generatePatient();
      const socialDeterminants = this.generateSocialDeterminants();
      const utilization = this.generateUtilizationHistory();
      
      return {
        ...patient,
        socialDeterminants,
        utilization,
        riskScore: this.calculateComprehensiveRisk(patient, socialDeterminants, utilization),
        careGaps: this.identifyCareGaps(patient),
      };
    });
  }
}
```

## Data Generation Patterns

### 1. Time Series Generation
```typescript
interface TimeSeriesOptions {
  startDate: Date;
  endDate: Date;
  interval: 'minute' | 'hour' | 'day' | 'week' | 'month';
  trend?: 'increasing' | 'decreasing' | 'stable' | 'seasonal';
  volatility?: number;
  seasonality?: SeasonalityPattern;
}

function generateTimeSeries(options: TimeSeriesOptions): TimeSeriesPoint[] {
  const points = [];
  const intervals = calculateIntervals(options.startDate, options.endDate, options.interval);
  
  let baseValue = 100;
  const trendFactor = getTrendFactor(options.trend);
  
  for (const timestamp of intervals) {
    const seasonalFactor = options.seasonality 
      ? calculateSeasonalFactor(timestamp, options.seasonality) 
      : 1;
    
    const noise = generateNoise(options.volatility || 0.1);
    const value = baseValue * seasonalFactor * (1 + noise);
    
    points.push({ timestamp, value });
    baseValue *= trendFactor;
  }
  
  return points;
}
```

### 2. Correlated Data Generation
```typescript
function generateCorrelatedData(
  primary: number[],
  correlation: number,
  noise: number = 0.1
): number[] {
  return primary.map(value => {
    const correlated = value * correlation;
    const randomNoise = (Math.random() - 0.5) * noise * value;
    return correlated + randomNoise;
  });
}
```

### 3. Categorical Distribution
```typescript
function generateCategoricalDistribution<T>(
  categories: T[],
  weights: number[]
): T[] {
  const normalizedWeights = normalizeWeights(weights);
  const cumulativeWeights = calculateCumulative(normalizedWeights);
  
  return (count: number) => {
    return Array.from({ length: count }, () => {
      const random = Math.random();
      const index = cumulativeWeights.findIndex(w => random <= w);
      return categories[index];
    });
  };
}
```

## Mock Data Caching Strategy

```typescript
class MockDataCache {
  private cache: Map<string, CachedData> = new Map();
  private readonly ttl: number = 60000; // 1 minute
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

## Real-time Data Simulation

```typescript
class RealTimeDataSimulator {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  
  startSimulation(
    key: string,
    generator: () => any,
    callback: (data: any) => void,
    intervalMs: number = 1000
  ): void {
    this.stopSimulation(key);
    
    const interval = setInterval(() => {
      const data = generator();
      callback(data);
    }, intervalMs);
    
    this.intervals.set(key, interval);
  }
  
  stopSimulation(key: string): void {
    const interval = this.intervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(key);
    }
  }
  
  stopAll(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }
}
```

## Usage Examples

### Basic Usage
```typescript
// Create vertical generator
const energyGen = new EnergyDataGenerator();

// Generate basic energy data
const voltage = energyGen.generateVoltageReading('transmission');
const component = energyGen.generateGridComponent();

// Create use-case specific generator
const anomalyGen = new GridAnomalyGenerator();

// Generate complete dashboard data
const dashboardData = anomalyGen.generateAnomalyData();
```

### Real-time Simulation
```typescript
const simulator = new RealTimeDataSimulator();
const generator = new GridAnomalyGenerator();

// Start real-time anomaly simulation
simulator.startSimulation(
  'grid-anomalies',
  () => generator.generateAnomalyData(),
  (data) => {
    // Update dashboard with new data
    updateDashboard(data);
  },
  5000 // Update every 5 seconds
);
```

### Seeded Generation for Testing
```typescript
// Use seed for deterministic data
const seededGen = new PatientRiskGenerator(12345);

// Will always generate the same data for the same seed
const testData1 = seededGen.generateRiskStratificationData();
const testData2 = seededGen.generateRiskStratificationData();
// testData1 === testData2 (structurally)
```

## Implementation Checklist

### Phase 1: Base Infrastructure
- [ ] Implement PlatformDataGenerator base class
- [ ] Create common data generation utilities
- [ ] Set up TypeScript interfaces for all data types
- [ ] Implement caching mechanism
- [ ] Create real-time simulation framework

### Phase 2: Vertical Generators
- [ ] Energy vertical generator
- [ ] Healthcare vertical generator
- [ ] Finance vertical generator
- [ ] Manufacturing vertical generator
- [ ] Retail vertical generator
- [ ] Logistics vertical generator
- [ ] Education vertical generator
- [ ] Pharma vertical generator
- [ ] Government vertical generator
- [ ] Telecom vertical generator

### Phase 3: Use Case Generators (37 total)
- [ ] 5 Energy use cases
- [ ] 5 Healthcare use cases
- [ ] 3 Finance use cases
- [ ] 3 Manufacturing use cases
- [ ] 3 Retail use cases
- [ ] 4 Logistics use cases
- [ ] 3 Education use cases
- [ ] 3 Pharma use cases
- [ ] 5 Government use cases
- [ ] 3 Telecom use cases

### Phase 4: Integration & Testing
- [ ] Integration with dashboard components
- [ ] Performance optimization
- [ ] Unit tests for all generators
- [ ] Documentation and examples
- [ ] Seed-based testing scenarios

## Best Practices

1. **Domain Authenticity**: Research industry-specific terminology and realistic value ranges
2. **Temporal Consistency**: Ensure time-based data follows logical patterns
3. **Performance**: Cache frequently used data and optimize generation algorithms
4. **Flexibility**: Support both random and deterministic generation
5. **Extensibility**: Design generators to be easily extended for new use cases
6. **Documentation**: Provide clear examples and API documentation

## Conclusion

This hierarchical mock data generation architecture provides a scalable foundation for creating realistic, domain-specific data across all 37 dashboards. The three-tier approach ensures consistency at the platform level while allowing for vertical and use-case specific customizations.