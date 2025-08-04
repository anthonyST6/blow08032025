// Dashboard Components and Utilities Export
// This file serves as the main entry point for all dashboard-related exports

// Export the dashboard router and list components
export { DashboardRouter, DashboardList } from './DashboardRouter';

// Export the dashboard registry utilities
export {
  getDashboardComponent,
  availableDashboards,
  dashboardExists,
  dashboardMetadata,
  dashboardsByVertical
} from './dashboard-registry';

// Export the dashboard template for creating new dashboards
export { default as DashboardTemplate } from './DashboardTemplate';
export type { DashboardConfig, KPICard, ChartConfig, TabConfig } from './DashboardTemplate';

// Export individual dashboard components (only the ones that exist)
// Retail & E-commerce
export { DemandForecastingDashboard } from './DemandForecastingDashboard';
export { CustomerPersonalizationDashboard } from './CustomerPersonalizationDashboard';
export { DynamicPriceOptimizationDashboard } from './DynamicPriceOptimizationDashboard';

// Logistics & Transportation
export { DynamicRouteOptimizationDashboard } from './DynamicRouteOptimizationDashboard';
export { PredictiveFleetMaintenanceDashboard } from './PredictiveFleetMaintenanceDashboard';
export { WarehouseAutomationDashboard } from './WarehouseAutomationDashboard';
export { SupplyChainDisruptionDashboard } from './SupplyChainDisruptionDashboard';

// Education & EdTech
export { AdaptiveLearningPathsDashboard } from './AdaptiveLearningPathsDashboard';
export { StudentPerformancePredictionDashboard } from './StudentPerformancePredictionDashboard';
export { SmartContentRecommendationDashboard } from './SmartContentRecommendationDashboard';

// Pharmaceutical & Biotech
export { AIDrugDiscoveryDashboard } from './AIDrugDiscoveryDashboard';
export { ClinicalTrialOptimizationDashboard } from './ClinicalTrialOptimizationDashboard';
export { AdverseEventDetectionDashboard } from './AdverseEventDetectionDashboard';

// Government & Public Sector
export { SmartCitizenServicesDashboard } from './SmartCitizenServicesDashboard';
export { PublicSafetyAnalyticsDashboard } from './PublicSafetyAnalyticsDashboard';
export { ResourceOptimizationDashboard } from './ResourceOptimizationDashboard';
export { EmergencyResponseOrchestrationDashboard } from './EmergencyResponseOrchestrationDashboard';
export { CriticalInfrastructureCoordinationDashboard } from './CriticalInfrastructureCoordinationDashboard';

// Telecommunications
export { NetworkPerformanceOptimizationDashboard } from './NetworkPerformanceOptimizationDashboard';
export { CustomerChurnPreventionDashboard } from './CustomerChurnPreventionDashboard';
export { NetworkSecurityMonitoringDashboard } from './NetworkSecurityMonitoringDashboard';

// Dashboard count summary
export const DASHBOARD_SUMMARY = {
  total: 22,
  byVertical: {
    'Retail & E-commerce': 3,
    'Logistics & Transportation': 4,
    'Education & EdTech': 3,
    'Pharmaceutical & Biotech': 3,
    'Government & Public Sector': 5,
    'Telecommunications': 3,
    'Energy & Utilities': 1, // Smart Meter Analytics (not created in this session)
  }
};