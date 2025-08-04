# Dashboard Implementation Guide

## Based on Oilfield Land Lease Gold Standard

This guide provides step-by-step instructions for implementing dashboards that match the quality and depth of the Oilfield Land Lease dashboard.

## 1. Analyzing the Gold Standard

The Oilfield Land Lease dashboard demonstrates excellence through:

### Data Richness
- **50 land leases** with comprehensive attributes
- **12+ calculated metrics** derived from actual data
- **6 specialized tabs** with unique content
- **10+ interactive visualizations**

### Key Implementation Patterns

```typescript
// Rich entity structure example from Oilfield Land Lease
interface LandLease {
  id: string;
  propertyId: string;
  leaseholder: string;
  location: {
    state: string;
    county: string;
    acres: number;
    coordinates: { lat: number; lng: number };
  };
  startDate: string;
  endDate: string;
  status: 'Active' | 'Pending' | 'Under Review' | 'Expiring Soon';
  annualPayment: number;
  royaltyRate: string;
  leaseType: string;
  compliance: {
    environmental: boolean;
    regulatory: boolean;
    safety: boolean;
  };
  stakeholders: Array<{
    name: string;
    role: string;
    contact: string;
  }>;
  productionData?: {
    wellCount: number;
    dailyProduction: number;
    efficiency: number;
  };
}
```

## 2. Mock Data Generator Pattern

### Step 1: Create Realistic Base Data

```typescript
// Example: Grid Anomaly Detection Data Generator
const generateGridAnomalies = (): GridAnomaly[] => {
  const anomalyTypes = [
    'Voltage Fluctuation',
    'Frequency Deviation',
    'Overload Warning',
    'Phase Imbalance',
    'Harmonic Distortion',
    'Power Factor Issue',
    'Transformer Overheating',
    'Line Fault',
  ];
  
  const locations = [
    'Substation Alpha-1',
    'Transformer Bank T-42',
    'Distribution Line D-7',
    'Grid Section B-3',
    'Feeder Circuit F-15',
    'Switching Station S-9',
  ];
  
  return Array.from({ length: 30 }, (_, i) => ({
    id: `GA-${String(i + 1).padStart(3, '0')}`,
    type: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    severity: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)] as any,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    description: generateAnomalyDescription(),
    impact: generateImpactAssessment(),
    status: ['investigating', 'monitoring', 'mitigating', 'resolved'][Math.floor(Math.random() * 4)] as any,
    metrics: {
      voltageDeviation: Math.random() * 10,
      frequencyDeviation: Math.random() * 0.5,
      powerFactor: 0.85 + Math.random() * 0.15,
      temperature: 60 + Math.random() * 40,
    },
    affectedCustomers: Math.floor(Math.random() * 5000),
    estimatedResolution: Math.floor(Math.random() * 240), // minutes
  }));
};
```

### Step 2: Generate Time Series Data

```typescript
const generateTimeSeriesData = (months: number = 6) => {
  const baseValue = 1000;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  return monthNames.slice(0, months).map((month, index) => ({
    month,
    // Multiple data series with realistic variations
    actual: baseValue + Math.random() * 200 - 100 + index * 50,
    forecast: baseValue + index * 45 + Math.random() * 100,
    baseline: baseValue + index * 40,
    // Additional context
    temperature: 65 + index * 5 + Math.random() * 10,
    efficiency: 85 + Math.random() * 10,
  }));
};
```

### Step 3: Calculate Aggregate Metrics

```typescript
const calculateMetrics = (data: any[]): Metric[] => {
  // Derive meaningful metrics from the data
  const totalAnomalies = data.length;
  const criticalAnomalies = data.filter(d => d.severity === 'critical').length;
  const avgResolutionTime = data.reduce((sum, d) => sum + d.estimatedResolution, 0) / data.length;
  const totalAffectedCustomers = data.reduce((sum, d) => sum + d.affectedCustomers, 0);
  
  return [
    {
      name: 'Total Anomalies',
      value: totalAnomalies,
      unit: '',
      trend: 'up',
      change: 15, // Calculate from historical data
    },
    {
      name: 'Critical Issues',
      value: criticalAnomalies,
      unit: '',
      trend: 'down',
      change: -22,
    },
    {
      name: 'Avg Resolution',
      value: (avgResolutionTime / 60).toFixed(1),
      unit: 'hrs',
      trend: 'down',
      change: -18,
    },
    {
      name: 'Customers Affected',
      value: (totalAffectedCustomers / 1000).toFixed(1),
      unit: 'K',
      trend: 'down',
      change: -35,
    },
  ];
};
```

## 3. Tab Implementation Pattern

### Overview Tab Structure

```typescript
const OverviewTab: React.FC<{ data: DashboardData }> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>
      
      {/* Critical Alerts/Items */}
      <CriticalAlertsPanel alerts={data.criticalAlerts} />
      
      {/* Main Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={data.trendData} />
        <DistributionChart data={data.distributionData} />
      </div>
      
      {/* Secondary Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatusSummary data={data.statusData} />
        <ActiveWorkflows workflows={data.workflows} />
        <PerformanceMetrics data={data.performance} />
      </div>
    </div>
  );
};
```

### Detail Tab with Interactive Elements

```typescript
const DetailTab: React.FC<{ data: DashboardData }> = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main List/Table */}
      <div className="lg:col-span-2">
        <Card variant="glass" effect="glow">
          <CardHeader>
            <CardTitle>Active Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.groupedItems.map((group) => (
                <div key={group.id}>
                  <motion.div
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <StatusIcon status={group.status} />
                      <span className="text-sm text-gray-300">{group.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-white">{group.count}</span>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedGroups[group.id] ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </motion.div>
                  
                  <AnimatePresence>
                    {expandedGroups[group.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 ml-8 space-y-2">
                          {group.items.map((item) => (
                            <ItemCard
                              key={item.id}
                              item={item}
                              isSelected={selectedItem?.id === item.id}
                              onClick={() => setSelectedItem(item)}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detail Panel */}
      <div>
        {selectedItem ? (
          <DetailPanel item={selectedItem} />
        ) : (
          <EmptyDetailPanel />
        )}
      </div>
    </div>
  );
};
```

## 4. Visualization Components

### Rich Area Chart with Multiple Series

```typescript
const RevenueChart: React.FC<{ data: RevenueData[] }> = ({ data }) => {
  return (
    <Card variant="glass" effect="glow">
      <CardHeader>
        <CardTitle>Revenue Streams Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              {/* Gradients for each data series */}
              <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              formatter={(value: number) => `$${value.toFixed(1)}M`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="primary"
              stackId="1"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorPrimary)"
            />
            <Area
              type="monotone"
              dataKey="secondary"
              stackId="1"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#colorSecondary)"
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#D4AF37"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

### Interactive Status Distribution

```typescript
const StatusDistribution: React.FC<{ data: StatusData[] }> = ({ data }) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  return (
    <Card variant="glass-dark" effect="float">
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((status, index) => (
            <motion.div
              key={status.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
                selectedStatus === status.name ? 'ring-2 ring-seraphim-gold' : ''
              }`}
              onClick={() => setSelectedStatus(status.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <span className="text-sm text-gray-300">{status.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-white">{status.count}</span>
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${status.color.replace('text-', 'bg-')}`}
                      style={{ width: `${(status.count / status.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              {selectedStatus === status.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 text-xs text-gray-400"
                >
                  <p>Percentage: {((status.count / status.total) * 100).toFixed(1)}%</p>
                  <p>Last Updated: {status.lastUpdated}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

## 5. Domain-Specific Examples

### Healthcare: Patient Risk Dashboard

```typescript
const PatientRiskDashboard: React.FC<{ useCase: UseCase }> = ({ useCase }) => {
  const dashboardData = useMemo(() => ({
    metrics: [
      { name: 'Patients Monitored', value: 12450, unit: '', trend: 'up', change: 18 },
      { name: 'High Risk Identified', value: 623, unit: '', trend: 'up', change: 12 },
      { name: 'Readmissions Prevented', value: 187, unit: '', trend: 'up', change: 28 },
      { name: 'Cost Savings', value: 4.2, unit: 'M', trend: 'up', change: 35 },
    ],
    
    patientCohorts: generatePatientCohorts(),
    riskFactors: generateRiskFactors(),
    interventions: generateInterventions(),
    outcomeMetrics: generateOutcomeMetrics(),
    
    // Rich visualizations
    riskDistribution: generateRiskDistribution(),
    interventionSuccess: generateInterventionSuccess(),
    careGaps: generateCareGaps(),
    highRiskPatients: generateHighRiskPatients(),
  }), [useCase]);
  
  // Implementation following the template...
};
```

### Finance: Fraud Detection Dashboard

```typescript
const FraudDetectionDashboard: React.FC<{ useCase: UseCase }> = ({ useCase }) => {
  const dashboardData = useMemo(() => ({
    metrics: [
      { name: 'Transactions Monitored', value: 2.8, unit: 'B', trend: 'up', change: 18 },
      { name: 'Fraud Detected', value: 12450, unit: '', trend: 'down', change: -22 },
      { name: 'False Positives', value: 8.2, unit: '%', trend: 'down', change: -35 },
      { name: 'Losses Prevented', value: 45.8, unit: 'M', trend: 'up', change: 28 },
    ],
    
    // Real-time fraud alerts
    activeAlerts: generateFraudAlerts(),
    
    // Transaction patterns
    transactionPatterns: generateTransactionPatterns(),
    
    // Risk scoring distribution
    riskScoreDistribution: generateRiskScores(),
    
    // Geographic heat map data
    geoFraudData: generateGeoFraudData(),
  }), [useCase]);
  
  // Implementation...
};
```

## 6. Common Patterns to Follow

### 1. Always Calculate Metrics from Data
```typescript
// DON'T hardcode metrics
const metrics = [
  { name: 'Total', value: 100, ... }
];

// DO calculate from actual data
const metrics = useMemo(() => {
  const total = data.items.length;
  const active = data.items.filter(i => i.status === 'active').length;
  return [
    { name: 'Total Items', value: total, ... },
    { name: 'Active Items', value: active, ... }
  ];
}, [data]);
```

### 2. Use Realistic Data Ranges
```typescript
// Energy sector
const voltage = 110 + Math.random() * 20; // 110-130V
const frequency = 59.9 + Math.random() * 0.2; // 59.9-60.1 Hz

// Healthcare
const bloodPressure = {
  systolic: 110 + Math.random() * 40, // 110-150
  diastolic: 70 + Math.random() * 20, // 70-90
};

// Finance
const transactionAmount = Math.random() < 0.8 
  ? Math.random() * 500 // 80% small transactions
  : Math.random() * 50000; // 20% large transactions
```

### 3. Include Domain-Specific Terminology
```typescript
// Energy
const terminology = {
  'NPT': 'Non-Productive Time',
  'WOB': 'Weight on Bit',
  'ROP': 'Rate of Penetration',
  'SCADA': 'Supervisory Control and Data Acquisition',
};

// Healthcare
const terminology = {
  'HbA1c': 'Hemoglobin A1c',
  'COPD': 'Chronic Obstructive Pulmonary Disease',
  'CHF': 'Congestive Heart Failure',
  'ACR': 'Albumin-to-Creatinine Ratio',
};
```

## 7. Testing Your Dashboard

### Quality Checklist
- [ ] Minimum 7 unique visualizations
- [ ] 20-50 realistic data points
- [ ] Interactive elements work smoothly
- [ ] No placeholder text
- [ ] Domain-specific terminology used correctly
- [ ] Responsive on different screen sizes
- [ ] Loading states implemented
- [ ] Error boundaries in place

### Performance Considerations
```typescript
// Memoize expensive calculations
const processedData = useMemo(() => 
  processRawData(rawData), [rawData]
);

// Virtualize long lists
import { FixedSizeList } from 'react-window';

// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));
```

## 8. Final Implementation Checklist

Before submitting a dashboard:

1. **Data Quality**
   - Real-looking names, IDs, locations
   - Appropriate value ranges for the domain
   - Consistent relationships between data points

2. **Visual Hierarchy**
   - Most important information prominently displayed
   - Progressive disclosure for details
   - Clear navigation between sections

3. **Interactivity**
   - Hover states on all interactive elements
   - Smooth transitions and animations
   - Clear feedback for user actions

4. **Domain Authenticity**
   - Industry-specific metrics and KPIs
   - Appropriate time scales and units
   - Realistic workflow states and processes

Remember: The goal is to create dashboards that a real user in that industry would find valuable and authentic.