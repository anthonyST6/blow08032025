/**
 * Shared types for dashboard components
 * These interfaces ensure consistency between demo and run dashboards
 */

export interface DashboardComponentProps {
  /** The data to display in the component */
  data: any;
  /** Whether this is live ingested data (true) or demo data (false) */
  isLiveData: boolean;
  /** Whether the component has data to display */
  hasData: boolean;
  /** Optional callback when user requests data */
  onDataRequest?: () => void;
  /** Optional callback to refresh data */
  onRefresh?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

export interface ChartData {
  labels?: string[];
  datasets?: any[];
  data?: any[];
}

export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

export interface StatusIndicatorData {
  label: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  value?: string | number;
  description?: string;
}

export interface EmptyStateConfig {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
}