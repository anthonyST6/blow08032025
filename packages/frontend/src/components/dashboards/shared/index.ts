/**
 * Shared Dashboard Components
 * 
 * This module exports all reusable components that ensure consistency
 * between demo and run dashboards. All components support both live
 * and demo data modes with empty state handling.
 */

// Types
export * from './types';

// Wrapper Components
export { EmptyStateWrapper, withEmptyState } from './EmptyStateWrapper';

// Card Components
export { MetricCard, MetricCardsGrid } from './cards/MetricCard';

// Chart Components
export {
  UniversalChart,
  TimeSeriesChart,
  DistributionChart,
  ComparisonChart,
  TrendChart,
  type ChartType
} from './charts/UniversalChart';

// Table Components
export { DataTable, createLeaseTableColumns } from './tables/DataTable';

// Indicator Components
export {
  StatusIndicator,
  ComplianceStatus,
  ProgressIndicator
} from './indicators/StatusIndicator';

// Utility function to determine if we have data
export const hasValidData = (data: any): boolean => {
  if (!data) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === 'object') return Object.keys(data).length > 0;
  return true;
};

// Utility function to format numbers with commas
export const formatNumber = (num: number | string): string => {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  return isNaN(n) ? '—' : n.toLocaleString();
};

// Utility function to format currency
export const formatCurrency = (amount: number | string, decimals = 2): string => {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(n) ? '—' : `$${n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// Utility function to format percentages
export const formatPercentage = (value: number | string, decimals = 1): string => {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(n) ? '—' : `${n.toFixed(decimals)}%`;
};

// Utility function to format dates
export const formatDate = (date: string | Date): string => {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
};

// Utility function to calculate days until date
export const daysUntil = (date: string | Date): number => {
  if (!date) return 0;
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const diffTime = d.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Utility function to get status color
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'success',
    pending: 'warning',
    expired: 'error',
    completed: 'success',
    failed: 'error',
    running: 'info',
    scheduled: 'info'
  };
  return statusMap[status.toLowerCase()] || 'default';
};