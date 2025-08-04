import { ReactNode } from 'react';

// Layout Types
export interface TabConfig {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  headerActions?: ReactNode;
  sidebarContent?: ReactNode;
  children: ReactNode;
}

export interface TabPanelProps {
  value: string;
  activeValue: string;
  children: ReactNode;
  keepMounted?: boolean;
}

export interface MetricGridProps {
  columns?: 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

// Data Display Types
export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    period: string;
  };
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  sparkline?: number[];
  loading?: boolean;
}

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  cell?: (value: any, row: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  rowSelection?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export interface StatusIndicatorProps {
  status: 'active' | 'warning' | 'error' | 'inactive';
  label: string;
  description?: string;
  pulse?: boolean;
}

// Visualization Types
export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  height?: number;
  loading?: boolean;
  error?: Error;
  actions?: ReactNode;
  children: ReactNode;
}

export interface TimeSeriesData {
  timestamp: Date | string;
  [key: string]: any;
}

export interface LineConfig {
  dataKey: string;
  color: string;
  name: string;
  dashed?: boolean;
  strokeWidth?: number;
}

export interface AxisConfig {
  label?: string;
  domain?: [number | 'auto', number | 'auto'];
  tickFormat?: (value: any) => string;
  hide?: boolean;
}

export interface TooltipConfig {
  formatter?: (value: any, name: string) => string;
  labelFormatter?: (label: any) => string;
}

export interface Annotation {
  type: 'line' | 'area' | 'text';
  value?: number;
  start?: number;
  end?: number;
  label?: string;
  color?: string;
}

export interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  lines: LineConfig[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  tooltip?: TooltipConfig;
  brush?: boolean;
  zoom?: boolean;
  annotations?: Annotation[];
  height?: number;
}

export interface BarConfig {
  dataKey: string;
  color: string;
  name: string;
}

export interface BarChartProps {
  data: any[];
  bars: BarConfig[];
  orientation?: 'horizontal' | 'vertical';
  stacked?: boolean;
  grouped?: boolean;
  showValues?: boolean;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  height?: number;
}

export interface PieData {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieData[];
  innerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  customColors?: string[];
  height?: number;
}

export interface HeatMapData {
  x: string | number;
  y: string | number;
  value: number;
}

export interface ColorScale {
  min: string;
  max: string;
  steps?: string[];
}

export interface HeatMapProps {
  data: HeatMapData[];
  xLabels: string[];
  yLabels: string[];
  colorScale?: ColorScale;
  showValues?: boolean;
  onClick?: (x: number, y: number, value: number) => void;
  height?: number;
}

export interface GeoData {
  id: string;
  value: number;
  name?: string;
}

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  value?: number;
  color?: string;
}

export interface GeoMapProps {
  data: GeoData[];
  mapType: 'world' | 'usa' | 'custom';
  customGeoJson?: any;
  colorScale?: ColorScale;
  markers?: MapMarker[];
  onRegionClick?: (region: string) => void;
  height?: number;
}

// Interactive Types
export type FilterType = 'select' | 'multiselect' | 'range' | 'date' | 'search';

export interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: any;
}

export interface FilterPanelProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset?: () => void;
  collapsible?: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateRangePreset {
  label: string;
  getValue: () => DateRange;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRangePreset[];
  maxDate?: Date;
  minDate?: Date;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onSearch?: (value: string) => void;
  debounceMs?: number;
}

export interface ActionConfig {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface ActionMenuProps {
  actions: ActionConfig[];
  trigger?: 'click' | 'hover';
  placement?: 'bottom' | 'top' | 'left' | 'right';
  disabled?: boolean;
}

// Real-time Types
export interface LiveDataFeedProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  maxItems?: number;
  showTimestamp?: boolean;
  autoScroll?: boolean;
}

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  showDetails?: boolean;
}

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description?: string;
  timestamp?: Date;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

export interface AlertBannerProps {
  alerts: Alert[];
  dismissible?: boolean;
  autoHide?: number;
  position?: 'top' | 'bottom';
  onDismiss?: (id: string) => void;
}

// Domain-Specific Types
export interface SIAScores {
  security: number;
  integrity: number;
  accuracy: number;
}

export interface SIAScoreDisplayProps {
  scores: SIAScores;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  animated?: boolean;
  showTrend?: boolean;
  previousScores?: SIAScores;
}

export interface Risk {
  id: string;
  name: string;
  likelihood: number;
  impact: number;
  category?: string;
  description?: string;
  mitigations?: string[];
}

export interface RiskMatrixProps {
  risks: Risk[];
  dimensions: {
    x: 'likelihood' | 'impact' | 'custom';
    y: 'likelihood' | 'impact' | 'custom';
  };
  colorScale?: ColorScale;
  onRiskClick?: (risk: Risk) => void;
  showLabels?: boolean;
  gridSize?: 3 | 4 | 5;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  category: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'pending';
  dueDate?: Date;
  description?: string;
  evidence?: string[];
}

export interface ComplianceStatus {
  requirementId: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'pending';
  lastUpdated: Date;
  notes?: string;
}

export interface ComplianceTrackerProps {
  requirements: ComplianceRequirement[];
  status: ComplianceStatus[];
  groupBy?: 'category' | 'status' | 'deadline';
  showProgress?: boolean;
  onRequirementClick?: (requirement: ComplianceRequirement) => void;
}

// Utility Types
export interface TimeOptions {
  daysAgo?: number;
  daysAhead?: number;
  hoursAgo?: number;
  minutesAgo?: number;
}

export interface TrendOptions {
  direction: 'up' | 'down' | 'stable';
  volatility: number;
  seasonality?: boolean;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}