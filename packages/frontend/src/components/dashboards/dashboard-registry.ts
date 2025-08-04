// Dashboard Registry - Central registry for all dashboard components
// This file maps dashboard IDs to their respective components for dynamic routing

import { lazy } from 'react';

// Lazy load all dashboard components for better performance
// Note: Only including dashboards that were actually created in this session
const dashboardComponents = {
  // Retail & E-commerce
  'demand-forecast': lazy(() => import('./DemandForecastingDashboard').then(m => ({ default: m.DemandForecastingDashboard }))),
  'personalization': lazy(() => import('./CustomerPersonalizationDashboard').then(m => ({ default: m.CustomerPersonalizationDashboard }))),
  'price-optimization': lazy(() => import('./DynamicPriceOptimizationDashboard').then(m => ({ default: m.DynamicPriceOptimizationDashboard }))),

  // Logistics & Transportation
  'route-optimization': lazy(() => import('./DynamicRouteOptimizationDashboard').then(m => ({ default: m.DynamicRouteOptimizationDashboard }))),
  'fleet-management': lazy(() => import('./PredictiveFleetMaintenanceDashboard').then(m => ({ default: m.PredictiveFleetMaintenanceDashboard }))),
  'warehouse-automation': lazy(() => import('./WarehouseAutomationDashboard').then(m => ({ default: m.WarehouseAutomationDashboard }))),
  'supply-chain-disruption': lazy(() => import('./SupplyChainDisruptionDashboard').then(m => ({ default: m.SupplyChainDisruptionDashboard }))),

  // Education & EdTech
  'personalized-learning': lazy(() => import('./AdaptiveLearningPathsDashboard').then(m => ({ default: m.AdaptiveLearningPathsDashboard }))),
  'performance-prediction': lazy(() => import('./StudentPerformancePredictionDashboard').then(m => ({ default: m.StudentPerformancePredictionDashboard }))),
  'content-recommendation': lazy(() => import('./SmartContentRecommendationDashboard').then(m => ({ default: m.SmartContentRecommendationDashboard }))),

  // Pharmaceutical & Biotech
  'drug-discovery': lazy(() => import('./AIDrugDiscoveryDashboard').then(m => ({ default: m.AIDrugDiscoveryDashboard }))),
  'clinical-optimization': lazy(() => import('./ClinicalTrialOptimizationDashboard').then(m => ({ default: m.ClinicalTrialOptimizationDashboard }))),
  'adverse-detection': lazy(() => import('./AdverseEventDetectionDashboard').then(m => ({ default: m.AdverseEventDetectionDashboard }))),

  // Government & Public Sector
  'citizen-services': lazy(() => import('./SmartCitizenServicesDashboard').then(m => ({ default: m.SmartCitizenServicesDashboard }))),
  'public-safety': lazy(() => import('./PublicSafetyAnalyticsDashboard').then(m => ({ default: m.PublicSafetyAnalyticsDashboard }))),
  'resource-optimization': lazy(() => import('./ResourceOptimizationDashboard').then(m => ({ default: m.ResourceOptimizationDashboard }))),
  'emergency-response-orchestration': lazy(() => import('./EmergencyResponseOrchestrationDashboard').then(m => ({ default: m.EmergencyResponseOrchestrationDashboard }))),
  'critical-infrastructure-coordination': lazy(() => import('./CriticalInfrastructureCoordinationDashboard').then(m => ({ default: m.CriticalInfrastructureCoordinationDashboard }))),

  // Telecommunications
  'network-optimization': lazy(() => import('./NetworkPerformanceOptimizationDashboard').then(m => ({ default: m.NetworkPerformanceOptimizationDashboard }))),
  'churn-prevention': lazy(() => import('./CustomerChurnPreventionDashboard').then(m => ({ default: m.CustomerChurnPreventionDashboard }))),
  'network-security': lazy(() => import('./NetworkSecurityMonitoringDashboard').then(m => ({ default: m.NetworkSecurityMonitoringDashboard }))),

  // Note: The following dashboards exist in the folder but were not created in this session:
  // - Healthcare & Life Sciences dashboards
  // - Financial Services dashboards
  // - Manufacturing & Industry 4.0 dashboards
  // - Energy & Utilities dashboards (except Smart Meter Analytics)
};

// Export function to get dashboard component by ID
export const getDashboardComponent = (dashboardId: string) => {
  return dashboardComponents[dashboardId as keyof typeof dashboardComponents];
};

// Export list of all available dashboard IDs
export const availableDashboards = Object.keys(dashboardComponents);

// Export function to check if a dashboard exists
export const dashboardExists = (dashboardId: string): boolean => {
  return dashboardId in dashboardComponents;
};

// Dashboard metadata for navigation and display
export const dashboardMetadata = {
  // Retail & E-commerce
  'demand-forecast': { name: 'Demand Forecasting', vertical: 'Retail' },
  'personalization': { name: 'Customer Personalization', vertical: 'Retail' },
  'price-optimization': { name: 'Dynamic Price Optimization', vertical: 'Retail' },
  
  // Logistics & Transportation
  'route-optimization': { name: 'Dynamic Route Optimization', vertical: 'Logistics' },
  'fleet-management': { name: 'Predictive Fleet Maintenance', vertical: 'Logistics' },
  'warehouse-automation': { name: 'Warehouse Automation', vertical: 'Logistics' },
  'supply-chain-disruption': { name: 'Supply Chain Disruption', vertical: 'Logistics' },
  
  // Education & EdTech
  'personalized-learning': { name: 'Adaptive Learning Paths', vertical: 'Education' },
  'performance-prediction': { name: 'Student Performance Prediction', vertical: 'Education' },
  'content-recommendation': { name: 'Smart Content Recommendation', vertical: 'Education' },
  
  // Pharmaceutical & Biotech
  'drug-discovery': { name: 'AI-Assisted Drug Discovery', vertical: 'Pharmaceutical' },
  'clinical-optimization': { name: 'Clinical Trial Optimization', vertical: 'Pharmaceutical' },
  'adverse-detection': { name: 'Adverse Event Detection', vertical: 'Pharmaceutical' },
  
  // Government & Public Sector
  'citizen-services': { name: 'Smart Citizen Services', vertical: 'Government' },
  'public-safety': { name: 'Public Safety Analytics', vertical: 'Government' },
  'resource-optimization': { name: 'Resource Optimization', vertical: 'Government' },
  'emergency-response-orchestration': { name: 'Emergency Response Orchestration', vertical: 'Government' },
  'critical-infrastructure-coordination': { name: 'Critical Infrastructure Coordination', vertical: 'Government' },
  
  // Telecommunications
  'network-optimization': { name: 'Network Performance Optimization', vertical: 'Telecommunications' },
  'churn-prevention': { name: 'Customer Churn Prevention', vertical: 'Telecommunications' },
  'network-security': { name: 'Network Security Monitoring', vertical: 'Telecommunications' },
};

// Group dashboards by vertical for navigation
export const dashboardsByVertical = {
  'Retail': ['demand-forecast', 'personalization', 'price-optimization'],
  'Logistics': ['route-optimization', 'fleet-management', 'warehouse-automation', 'supply-chain-disruption'],
  'Education': ['personalized-learning', 'performance-prediction', 'content-recommendation'],
  'Pharmaceutical': ['drug-discovery', 'clinical-optimization', 'adverse-detection'],
  'Government': ['citizen-services', 'public-safety', 'resource-optimization', 'emergency-response-orchestration', 'critical-infrastructure-coordination'],
  'Telecommunications': ['network-optimization', 'churn-prevention', 'network-security'],
};