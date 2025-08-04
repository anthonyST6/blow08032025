# Dashboard Template Specification

## Overview
This specification defines the structure and requirements for creating custom dashboards that match the quality and depth of the Oilfield Land Lease dashboard. Each dashboard must provide rich, domain-specific data visualizations and interactions.

## Gold Standard Reference
The Oilfield Land Lease dashboard (energy-oilfield-land-lease) serves as our quality benchmark with:
- 6 specialized tabs
- 10+ unique visualizations
- 50+ data points with realistic mock data
- Interactive elements with animations
- Domain-specific terminology and metrics
- Multiple data aggregation levels

## Dashboard Structure

### 1. Tab Configuration
Each dashboard should have 4-6 tabs tailored to the use case:

```typescript
interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType;
}

// Example from Oilfield Land Lease:
const tabs = [
  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
  { id: 'leases', label: 'Land Leases', icon: MapIcon },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
  { id: 'financial', label: 'Financial', icon: CurrencyDollarIcon },
  { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
  { id: 'operations', label: 'Operations', icon: CogIcon },
];
```

### 2. Data Structure Requirements

#### Core Metrics (4-6 metrics)
```typescript
interface Metric {
  name: string;
  value: number | string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}
```

#### Domain-Specific Data Sets
Each dashboard must include:
1. **Primary Entity List** (e.g., land leases, patients, transactions)
   - Minimum 20-50 items
   - Rich attributes (8-12 fields per item)
   - Status indicators
   - Compliance/risk flags

2. **Time Series Data** (3-4 datasets)
   - Monthly/weekly/daily granularity
   - Multiple data series for comparison
   - Historical and forecast data where applicable

3. **Categorical Breakdowns** (2-3 datasets)
   - Distribution by type/category
   - Risk/priority segmentation
   - Geographic or organizational groupings

4. **Real-time Alerts/Workflows** (5-10 items)
   - Current status
   - Progress indicators
   - Priority levels
   - Action items

### 3. Visualization Requirements

#### Mandatory Charts (minimum 7-8 per dashboard):

1. **Overview Tab** (3-4 visualizations)
   - Key metrics cards with trends
   - Primary time series chart (Area/Line)
   - Distribution chart (Pie/Donut)
   - Status summary or alert panel

2. **Detail Tab** (2-3 visualizations)
   - Interactive data table/list
   - Drill-down capability
   - Detail cards on selection

3. **Analytics Tab** (2-3 visualizations)
   - Comparative analysis (Bar/Column)
   - Trend analysis (Multi-line)
   - Performance metrics

4. **Operations Tab** (1-2 visualizations)
   - Active workflows/processes
   - System status indicators

### 4. Interactive Elements

#### Required Interactions:
1. **Expandable Sections**
   - Click to expand/collapse details
   - Smooth animations (Framer Motion)
   - Nested data display

2. **Selection States**
   - Click to select items
   - Update related visualizations
   - Show detail panels

3. **Progress Indicators**
   - Progress bars for workflows
   - Status badges with colors
   - Real-time updates

4. **Filtering/Sorting**
   - Status-based filtering
   - Sort by key metrics
   - Search functionality

### 5. Mock Data Generator Structure

```typescript
interface UseCaseDataGenerator {
  // Primary entities (20-50 items)
  generateEntities(): Entity[];
  
  // Time series data
  generateTimeSeriesData(): TimeSeriesData[];
  
  // Categorical breakdowns
  generateCategoricalData(): CategoryData[];
  
  // Real-time alerts/workflows
  generateActiveItems(): ActiveItem[];
  
  // Calculate aggregate metrics
  calculateMetrics(entities: Entity[]): Metric[];
  
  // Generate domain-specific insights
  generateInsights(): Insight[];
}
```

### 6. Component Template Structure

```typescript
const DashboardTemplate: React.FC<{ useCase: UseCase }> = ({ useCase }) => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  
  // Generate mock data
  const dashboardData = useMemo(() => 
    generateUseCaseData(useCase), [useCase]
  );
  
  // Tab configuration
  const tabs = getTabsForUseCase(useCase);
  
  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header with navigation */}
      <DashboardHeader useCase={useCase} />
      
      {/* Tab Navigation */}
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <OverviewTab data={dashboardData} />
        )}
        {/* Additional tabs... */}
      </AnimatePresence>
    </div>
  );
};
```

### 7. Styling Guidelines

#### Color Palette:
- **Success**: `#10B981` (green-500)
- **Warning**: `#F59E0B` (yellow-500)
- **Error**: `#EF4444` (red-500)
- **Info**: `#3B82F6` (blue-500)
- **Accent**: `#8B5CF6` (purple-500)

#### Component Classes:
- Cards: `bg-white/5 rounded-lg p-4 hover:bg-white/10`
- Badges: `px-2 py-1 rounded-full text-xs`
- Progress: `h-2 bg-gray-700 rounded-full`
- Buttons: `px-4 py-2 rounded-lg transition-colors`

### 8. Animation Patterns

```typescript
// Stagger animations for lists
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

// Expand/collapse animations
const expandVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1 }
};
```

### 9. Domain-Specific Requirements

Each vertical has unique requirements:

#### Energy:
- Equipment/asset tracking
- Compliance monitoring
- Environmental metrics
- Production/efficiency data

#### Healthcare:
- Patient cohorts
- Clinical outcomes
- Risk stratification
- Intervention tracking

#### Finance:
- Transaction monitoring
- Risk assessment
- Portfolio performance
- Regulatory compliance

#### Manufacturing:
- Production metrics
- Quality control
- Equipment status
- Supply chain data

#### Retail:
- Sales analytics
- Inventory levels
- Customer segments
- Demand forecasting

### 10. Quality Checklist

Before considering a dashboard complete:

- [ ] Minimum 7 unique visualizations
- [ ] 20-50 realistic data points
- [ ] Domain-specific terminology throughout
- [ ] No placeholder text ("Lorem ipsum", etc.)
- [ ] Interactive elements with smooth animations
- [ ] Responsive design for different screen sizes
- [ ] Consistent color scheme and styling
- [ ] Loading states for data
- [ ] Error handling for edge cases
- [ ] Accessibility considerations (ARIA labels)

### 11. Implementation Priority

1. **High Priority** (Complex domains with regulatory requirements):
   - Energy: Grid Anomaly Detection, Renewable Energy Optimization
   - Healthcare: Patient Risk Stratification, Treatment Recommendation
   - Finance: Real-time Fraud Detection, AI Credit Scoring

2. **Medium Priority** (Operational efficiency focus):
   - Manufacturing: Predictive Maintenance, Quality Inspection
   - Logistics: Route Optimization, Fleet Maintenance
   - Government: Public Safety Analytics, Emergency Response

3. **Lower Priority** (Customer-facing optimizations):
   - Retail: Demand Forecasting, Price Optimization
   - Education: Adaptive Learning, Performance Prediction
   - Telecom: Network Optimization, Churn Prevention

## Example Implementation Pattern

```typescript
// Dashboard for Grid Anomaly Detection
const GridAnomalyDashboard: React.FC<{ useCase: UseCase }> = ({ useCase }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'anomalies' | 'components' | 'patterns' | 'response' | 'heatmap'
  >('overview');
  
  const dashboardData = useMemo(() => ({
    // Metrics
    metrics: [
      { name: 'Anomalies Detected', value: 342, unit: '', trend: 'up', change: 15 },
      { name: 'Outages Prevented', value: 89, unit: '', trend: 'up', change: 22 },
      { name: 'Response Time', value: 2.3, unit: 'min', trend: 'down', change: -45 },
      { name: 'Grid Stability', value: 99.2, unit: '%', trend: 'up', change: 1.8 },
    ],
    
    // Active anomalies with rich details
    activeAnomalies: generateActiveAnomalies(),
    
    // Grid components health status
    gridComponents: generateGridComponents(),
    
    // Pattern recognition data
    anomalyPatterns: generateAnomalyPatterns(),
    
    // Time series data for trends
    anomalyTrendData: generateAnomalyTrends(),
    
    // Heatmap data
    anomalyHeatmap: generateHeatmapData(),
    
    // Response metrics
    responseMetrics: generateResponseMetrics(),
  }), [useCase]);
  
  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Implementation following template structure */}
    </div>
  );
};
```

## Next Steps

1. Create reusable components based on this specification
2. Implement mock data generators for each vertical
3. Build dashboards in priority order
4. Test each dashboard against the quality checklist
5. Ensure consistent user experience across all dashboards