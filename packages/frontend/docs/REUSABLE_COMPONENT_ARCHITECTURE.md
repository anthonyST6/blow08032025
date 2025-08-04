# Reusable Component Architecture for Dashboard Implementation

## Overview
This document outlines the reusable component architecture designed to support the implementation of 37 custom dashboards across 11 verticals. The architecture emphasizes consistency, reusability, and domain-specific customization.

## Core Design Principles

1. **Composability**: Components should be easily combined to create complex dashboards
2. **Customizability**: Support domain-specific styling and behavior
3. **Performance**: Optimize for real-time data updates and large datasets
4. **Accessibility**: WCAG 2.1 AA compliance built-in
5. **Responsive**: Mobile-first design approach
6. **Type Safety**: Full TypeScript support with proper generics

## Component Hierarchy

### 1. Layout Components

#### DashboardLayout
```typescript
interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  headerActions?: React.ReactNode;
  sidebarContent?: React.ReactNode;
}
```

#### TabPanel
```typescript
interface TabPanelProps {
  value: string;
  activeValue: string;
  children: React.ReactNode;
  keepMounted?: boolean;
}
```

#### MetricGrid
```typescript
interface MetricGridProps {
  columns?: 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

### 2. Data Display Components

#### MetricCard
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    period: string;
  };
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  sparkline?: number[];
}
```

#### DataTable
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  rowSelection?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}
```

#### StatusIndicator
```typescript
interface StatusIndicatorProps {
  status: 'active' | 'warning' | 'error' | 'inactive';
  label: string;
  description?: string;
  pulse?: boolean;
}
```

### 3. Visualization Components

#### ChartContainer
```typescript
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  height?: number;
  loading?: boolean;
  error?: Error;
  actions?: React.ReactNode;
  children: React.ReactNode;
}
```

#### TimeSeriesChart
```typescript
interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  lines: LineConfig[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  tooltip?: TooltipConfig;
  brush?: boolean;
  zoom?: boolean;
  annotations?: Annotation[];
}
```

#### BarChart
```typescript
interface BarChartProps {
  data: any[];
  bars: BarConfig[];
  orientation?: 'horizontal' | 'vertical';
  stacked?: boolean;
  grouped?: boolean;
  showValues?: boolean;
}
```

#### PieChart
```typescript
interface PieChartProps {
  data: PieData[];
  innerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  customColors?: string[];
}
```

#### HeatMap
```typescript
interface HeatMapProps {
  data: HeatMapData[][];
  xLabels: string[];
  yLabels: string[];
  colorScale?: ColorScale;
  showValues?: boolean;
  onClick?: (x: number, y: number, value: number) => void;
}
```

#### GeoMap
```typescript
interface GeoMapProps {
  data: GeoData[];
  mapType: 'world' | 'usa' | 'custom';
  customGeoJson?: any;
  colorScale?: ColorScale;
  markers?: MapMarker[];
  onRegionClick?: (region: string) => void;
}
```

### 4. Interactive Components

#### FilterPanel
```typescript
interface FilterPanelProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset?: () => void;
  collapsible?: boolean;
}
```

#### DateRangePicker
```typescript
interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRangePreset[];
  maxDate?: Date;
  minDate?: Date;
}
```

#### SearchBar
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onSearch?: (value: string) => void;
  debounceMs?: number;
}
```

#### ActionMenu
```typescript
interface ActionMenuProps {
  actions: ActionConfig[];
  trigger?: 'click' | 'hover';
  placement?: 'bottom' | 'top' | 'left' | 'right';
  disabled?: boolean;
}
```

### 5. Real-time Components

#### LiveDataFeed
```typescript
interface LiveDataFeedProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  maxItems?: number;
  showTimestamp?: boolean;
  autoScroll?: boolean;
}
```

#### ProgressTracker
```typescript
interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  showDetails?: boolean;
}
```

#### AlertBanner
```typescript
interface AlertBannerProps {
  alerts: Alert[];
  dismissible?: boolean;
  autoHide?: number;
  position?: 'top' | 'bottom';
}
```

### 6. Domain-Specific Components

#### SIAScoreDisplay
```typescript
interface SIAScoreDisplayProps {
  security: number;
  integrity: number;
  accuracy: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  animated?: boolean;
}
```

#### RiskMatrix
```typescript
interface RiskMatrixProps {
  risks: Risk[];
  dimensions: {
    x: 'likelihood' | 'impact' | 'custom';
    y: 'likelihood' | 'impact' | 'custom';
  };
  colorScale?: ColorScale;
  onRiskClick?: (risk: Risk) => void;
}
```

#### ComplianceTracker
```typescript
interface ComplianceTrackerProps {
  requirements: ComplianceRequirement[];
  status: ComplianceStatus[];
  groupBy?: 'category' | 'status' | 'deadline';
  showProgress?: boolean;
}
```

## Utility Hooks

### useRealTimeData
```typescript
function useRealTimeData<T>(
  endpoint: string,
  options?: {
    pollingInterval?: number;
    websocket?: boolean;
    transform?: (data: any) => T;
  }
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

### useFilteredData
```typescript
function useFilteredData<T>(
  data: T[],
  filters: FilterConfig[],
  filterValues: FilterValues
): T[]
```

### useDashboardState
```typescript
function useDashboardState(
  initialTab?: string
): {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: FilterValues;
  setFilters: (filters: FilterValues) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}
```

### useChartResize
```typescript
function useChartResize(
  ref: React.RefObject<HTMLDivElement>
): {
  width: number;
  height: number;
}
```

## Theme System

### Color Tokens
```typescript
const colors = {
  // Brand colors
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    // ... through 900
  },
  
  // Semantic colors
  success: { /* ... */ },
  warning: { /* ... */ },
  danger: { /* ... */ },
  
  // Domain-specific colors
  energy: {
    renewable: '#4caf50',
    fossil: '#ff5722',
    nuclear: '#9c27b0',
  },
  healthcare: {
    critical: '#f44336',
    stable: '#4caf50',
    monitoring: '#ff9800',
  },
  // ... other verticals
};
```

### Typography
```typescript
const typography = {
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  // ... other variants
};
```

### Spacing
```typescript
const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
};
```

## Animation Patterns

### Entry Animations
```typescript
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
};

const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut' },
};
```

### Loading States
```typescript
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;
```

## Performance Optimizations

### 1. Virtualization
- Use `react-window` for large lists and tables
- Implement viewport-based rendering for charts

### 2. Memoization
- Wrap expensive components with `React.memo`
- Use `useMemo` for complex calculations
- Implement `useCallback` for event handlers

### 3. Code Splitting
- Lazy load dashboard-specific components
- Split chart libraries by type
- Defer non-critical features

### 4. Data Management
- Implement request deduplication
- Use optimistic updates
- Cache API responses with SWR

## Testing Strategy

### Component Testing
```typescript
describe('MetricCard', () => {
  it('renders with basic props', () => {
    render(<MetricCard title="Revenue" value={1000000} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
  });
  
  it('shows trend indicator', () => {
    render(
      <MetricCard 
        title="Revenue" 
        value={1000000}
        change={{ value: 10, period: 'month' }}
        trend="up"
      />
    );
    expect(screen.getByTestId('trend-up')).toBeInTheDocument();
  });
});
```

### Integration Testing
- Test data flow between components
- Verify filter interactions
- Validate real-time updates

### Visual Regression Testing
- Use Storybook for component documentation
- Implement Chromatic for visual testing
- Create stories for all component states

## Implementation Roadmap

### Phase 1: Core Components (Week 1)
1. Layout components (DashboardLayout, TabPanel, MetricGrid)
2. Basic data display (MetricCard, DataTable, StatusIndicator)
3. Essential hooks (useDashboardState, useRealTimeData)

### Phase 2: Visualizations (Week 2)
1. Chart container and base setup
2. Time series and bar charts
3. Pie charts and heat maps
4. Geographic visualizations

### Phase 3: Interactivity (Week 3)
1. Filter panel and search
2. Date range picker
3. Action menus and tooltips
4. Real-time components

### Phase 4: Domain-Specific (Week 4)
1. SIA score displays
2. Risk matrices
3. Compliance trackers
4. Vertical-specific components

### Phase 5: Polish & Optimization (Week 5)
1. Performance optimizations
2. Accessibility audit
3. Mobile responsiveness
4. Documentation and examples

## Usage Examples

### Basic Dashboard Setup
```typescript
import { DashboardLayout, MetricGrid, MetricCard, TimeSeriesChart } from '@/components/dashboard';

export function EnergyDashboard() {
  const { activeTab, setActiveTab, dateRange } = useDashboardState('overview');
  const { data, loading } = useRealTimeData('/api/energy/metrics');
  
  return (
    <DashboardLayout
      title="Grid Anomaly Detection"
      subtitle="Real-time monitoring and predictive analytics"
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'anomalies', label: 'Active Anomalies' },
        { id: 'components', label: 'Grid Components' },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <TabPanel value="overview" activeValue={activeTab}>
        <MetricGrid columns={4}>
          <MetricCard
            title="Active Anomalies"
            value={data?.anomalyCount || 0}
            trend={data?.anomalyTrend}
            color="warning"
          />
          {/* More metrics... */}
        </MetricGrid>
        
        <ChartContainer title="Anomaly Trend" loading={loading}>
          <TimeSeriesChart
            data={data?.timeSeries || []}
            lines={[
              { dataKey: 'anomalies', color: '#ff5722', name: 'Anomalies' },
              { dataKey: 'predicted', color: '#2196f3', name: 'Predicted', dashed: true },
            ]}
          />
        </ChartContainer>
      </TabPanel>
    </DashboardLayout>
  );
}
```

## Best Practices

1. **Consistent Naming**: Use clear, descriptive names following the pattern: `[Domain][Component]`
2. **Prop Validation**: Always define TypeScript interfaces for props
3. **Error Boundaries**: Wrap complex components in error boundaries
4. **Loading States**: Provide skeleton screens for better UX
5. **Accessibility**: Include ARIA labels and keyboard navigation
6. **Documentation**: Write JSDoc comments for all public APIs
7. **Performance**: Monitor bundle size and rendering performance

## Conclusion

This reusable component architecture provides a solid foundation for building 37 custom dashboards efficiently while maintaining consistency and quality. The modular design allows for rapid development while supporting domain-specific requirements across all verticals.