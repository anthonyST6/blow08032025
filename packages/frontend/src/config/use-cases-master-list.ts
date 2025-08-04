// Master list of all 79 use cases that need detailed dashboards
// This file serves as the source of truth for dashboard creation

export interface UseCaseMasterItem {
  id: string;
  name: string;
  vertical: string;
  verticalName: string;
  hasExecutiveSummary: boolean;
  hasDashboard: boolean;
  dashboardFile?: string;
}

export const USE_CASES_MASTER_LIST: UseCaseMasterItem[] = [
  // Energy & Utilities (12 use cases)
  {
    id: 'oilfield-land-lease',
    name: 'Oilfield Land Lease',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'OilfieldLandLeaseDashboard.tsx'
  },
  {
    id: 'grid-anomaly',
    name: 'Grid Anomaly Detection',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'GridAnomalyDashboard.tsx'
  },
  {
    id: 'renewable-optimization',
    name: 'Renewable Energy Optimization',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'RenewableOptimizationDashboard.tsx'
  },
  {
    id: 'drilling-risk-assessment',
    name: 'Drilling Risk Assessment',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'DrillingRiskDashboard.tsx'
  },
  {
    id: 'environmental-compliance',
    name: 'Environmental Compliance',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'EnvironmentalComplianceDashboard.tsx'
  },
  {
    id: 'load-forecasting',
    name: 'Load Forecasting',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'LoadForecastingDashboard.tsx'
  },
  {
    id: 'phmsa-compliance',
    name: 'PHMSA Compliance Automation',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'PHMSAComplianceDashboard.tsx'
  },
  {
    id: 'methane-leak-detection',
    name: 'Methane Leak Detection',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'MethaneLeakDetectionDashboard.tsx'
  },
  {
    id: 'grid-resilience',
    name: 'Grid Resilience & Outage Response',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'GridResilienceDashboard.tsx'
  },
  {
    id: 'internal-audit-governance',
    name: 'Internal Audit and Governance',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'InternalAuditGovernanceDashboard.tsx'
  },
  {
    id: 'scada-integration',
    name: 'SCADA-Legacy Integration',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'SCADAIntegrationDashboard.tsx'
  },
  {
    id: 'wildfire-prevention',
    name: 'Wildfire Prevention & Infrastructure Risk',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'WildfirePreventionDashboard.tsx'
  },
  {
    id: 'predictive-grid-resilience',
    name: 'Predictive Grid Resilience & Orchestration',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'PredictiveGridResilienceDashboard.tsx'
  },
  {
    id: 'energy-supply-chain-cyber',
    name: 'Energy Supply Chain Cyber Defense',
    vertical: 'energy',
    verticalName: 'Energy & Utilities',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'EnergySupplyChainCyberDashboard.tsx'
  },

  // Healthcare & Life Sciences (5 use cases)
  {
    id: 'patient-risk',
    name: 'Patient Risk Stratification',
    vertical: 'healthcare',
    verticalName: 'Healthcare & Life Sciences',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'PatientRiskDashboard.tsx'
  },
  {
    id: 'diagnosis-assist',
    name: 'Diagnosis Assistant',
    vertical: 'healthcare',
    verticalName: 'Healthcare & Life Sciences',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'DiagnosisAssistantDashboard.tsx'
  },
  {
    id: 'treatment-recommend',
    name: 'Treatment Recommendation',
    vertical: 'healthcare',
    verticalName: 'Healthcare & Life Sciences',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'TreatmentRecommendationDashboard.tsx'
  },
  {
    id: 'clinical-trial-matching',
    name: 'Clinical Trial Matching',
    vertical: 'healthcare',
    verticalName: 'Healthcare & Life Sciences',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'ClinicalTrialMatchingDashboard.tsx'
  },
  {
    id: 'medical-supply-chain-crisis',
    name: 'Medical Supply Chain & Crisis Orchestration',
    vertical: 'healthcare',
    verticalName: 'Healthcare & Life Sciences',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'MedicalSupplyChainDashboard.tsx'
  },

  // Financial Services (4 use cases)
  {
    id: 'fraud-detection',
    name: 'Real-time Fraud Detection',
    vertical: 'finance',
    verticalName: 'Financial Services',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'FraudDetectionDashboard.tsx'
  },
  {
    id: 'credit-scoring',
    name: 'AI Credit Scoring',
    vertical: 'finance',
    verticalName: 'Financial Services',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'CreditScoringDashboard.tsx'
  },
  {
    id: 'aml-monitoring',
    name: 'AML Transaction Monitoring',
    vertical: 'finance',
    verticalName: 'Financial Services',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'AMLMonitoringDashboard.tsx'
  },
  {
    id: 'insurance-risk-assessment',
    name: 'Insurance Risk Assessment',
    vertical: 'finance',
    verticalName: 'Financial Services',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'InsuranceRiskAssessmentDashboard.tsx'
  },
  {
    id: 'portfolio-optimization',
    name: 'Portfolio Optimization',
    vertical: 'finance',
    verticalName: 'Financial Services',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'PortfolioOptimizationDashboard.tsx'
  },

  // Manufacturing & Industry 4.0 (3 use cases)
  {
    id: 'predictive-maintenance',
    name: 'Predictive Maintenance',
    vertical: 'manufacturing',
    verticalName: 'Manufacturing & Industry 4.0',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'PredictiveMaintenanceDashboard.tsx'
  },
  {
    id: 'quality-inspection',
    name: 'Automated Quality Inspection',
    vertical: 'manufacturing',
    verticalName: 'Manufacturing & Industry 4.0',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'QualityInspectionDashboard.tsx'
  },
  {
    id: 'supply-optimization',
    name: 'Supply Chain Optimization',
    vertical: 'manufacturing',
    verticalName: 'Manufacturing & Industry 4.0',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'SupplyOptimizationDashboard.tsx'
  },

  // Retail & E-commerce (3 use cases)
  {
    id: 'demand-forecast',
    name: 'Demand Forecasting',
    vertical: 'retail',
    verticalName: 'Retail & E-commerce',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'DemandForecastingDashboard.tsx'
  },
  {
    id: 'personalization',
    name: 'Customer Personalization',
    vertical: 'retail',
    verticalName: 'Retail & E-commerce',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'CustomerPersonalizationDashboard.tsx'
  },
  {
    id: 'price-optimization',
    name: 'Dynamic Price Optimization',
    vertical: 'retail',
    verticalName: 'Retail & E-commerce',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'DynamicPriceOptimizationDashboard.tsx'
  },

  // Logistics & Transportation (4 use cases)
  {
    id: 'route-optimization',
    name: 'Dynamic Route Optimization',
    vertical: 'logistics',
    verticalName: 'Logistics & Transportation',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'DynamicRouteOptimizationDashboard.tsx'
  },
  {
    id: 'fleet-management',
    name: 'Predictive Fleet Maintenance',
    vertical: 'logistics',
    verticalName: 'Logistics & Transportation',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'PredictiveFleetMaintenanceDashboard.tsx'
  },
  {
    id: 'warehouse-automation',
    name: 'Warehouse Automation',
    vertical: 'logistics',
    verticalName: 'Logistics & Transportation',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'WarehouseAutomationDashboard.tsx'
  },
  {
    id: 'supply-chain-disruption',
    name: 'Supply Chain Disruption Orchestration',
    vertical: 'logistics',
    verticalName: 'Logistics & Transportation',
    hasExecutiveSummary: false,
    hasDashboard: true,
    dashboardFile: 'SupplyChainDisruptionDashboard.tsx'
  },

  // Education & EdTech (3 use cases)
  {
    id: 'personalized-learning',
    name: 'Adaptive Learning Paths',
    vertical: 'education',
    verticalName: 'Education & EdTech',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'AdaptiveLearningPathsDashboard.tsx'
  },
  {
    id: 'performance-prediction',
    name: 'Student Performance Prediction',
    vertical: 'education',
    verticalName: 'Education & EdTech',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'StudentPerformancePredictionDashboard.tsx'
  },
  {
    id: 'content-recommendation',
    name: 'Smart Content Recommendation',
    vertical: 'education',
    verticalName: 'Education & EdTech',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'SmartContentRecommendationDashboard.tsx'
  },

  // Pharmaceutical & Biotech (3 use cases)
  {
    id: 'drug-discovery',
    name: 'AI-Assisted Drug Discovery',
    vertical: 'pharma',
    verticalName: 'Pharmaceutical & Biotech',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'AIDrugDiscoveryDashboard.tsx'
  },
  {
    id: 'clinical-optimization',
    name: 'Clinical Trial Optimization',
    vertical: 'pharma',
    verticalName: 'Pharmaceutical & Biotech',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'ClinicalTrialOptimizationDashboard.tsx'
  },
  {
    id: 'adverse-detection',
    name: 'Adverse Event Detection',
    vertical: 'pharma',
    verticalName: 'Pharmaceutical & Biotech',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'AdverseEventDetectionDashboard.tsx'
  },

  // Government & Public Sector (5 use cases)
  {
    id: 'citizen-services',
    name: 'Smart Citizen Services',
    vertical: 'government',
    verticalName: 'Government & Public Sector',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'SmartCitizenServicesDashboard.tsx'
  },
  {
    id: 'public-safety',
    name: 'Public Safety Analytics',
    vertical: 'government',
    verticalName: 'Government & Public Sector',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'PublicSafetyAnalyticsDashboard.tsx'
  },
  {
    id: 'resource-optimization',
    name: 'Resource Optimization',
    vertical: 'government',
    verticalName: 'Government & Public Sector',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'ResourceOptimizationDashboard.tsx'
  },
  {
    id: 'emergency-response-orchestration',
    name: 'Coordinated Emergency Response Orchestration',
    vertical: 'government',
    verticalName: 'Government & Public Sector',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'EmergencyResponseOrchestrationDashboard.tsx'
  },
  {
    id: 'critical-infrastructure-coordination',
    name: 'National Critical Infrastructure Coordination',
    vertical: 'government',
    verticalName: 'Government & Public Sector',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'CriticalInfrastructureCoordinationDashboard.tsx'
  },

  // Telecommunications (3 use cases)
  {
    id: 'network-optimization',
    name: 'Network Performance Optimization',
    vertical: 'telecom',
    verticalName: 'Telecommunications',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'NetworkPerformanceOptimizationDashboard.tsx'
  },
  {
    id: 'churn-prevention',
    name: 'Customer Churn Prevention',
    vertical: 'telecom',
    verticalName: 'Telecommunications',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'CustomerChurnPreventionDashboard.tsx'
  },
  {
    id: 'network-security',
    name: 'Network Security Monitoring',
    vertical: 'telecom',
    verticalName: 'Telecommunications',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'NetworkSecurityMonitoringDashboard.tsx'
  },

  // Real Estate (1 use case)
  {
    id: 'ai-pricing-governance',
    name: 'AI Pricing Governance',
    vertical: 'real-estate',
    verticalName: 'Real Estate',
    hasExecutiveSummary: true,
    hasDashboard: true,
    dashboardFile: 'AIPricingGovernanceDashboard.tsx'
  }
];

// Summary statistics
export const USE_CASES_SUMMARY = {
  total: USE_CASES_MASTER_LIST.length,
  withExecutiveSummary: USE_CASES_MASTER_LIST.filter(uc => uc.hasExecutiveSummary).length,
  withDashboard: USE_CASES_MASTER_LIST.filter(uc => uc.hasDashboard).length,
  needingDashboard: USE_CASES_MASTER_LIST.filter(uc => !uc.hasDashboard).length,
  byVertical: {
    energy: USE_CASES_MASTER_LIST.filter(uc => uc.vertical === 'energy').length,
    healthcare: USE_CASES_MASTER_LIST.filter(uc => uc.vertical === 'healthcare').length,
    finance: USE_CASES_MASTER_LIST.filter(uc => uc.vertical === 'finance').length,
    manufacturing: USE_CASES_MASTER_LIST.filter(uc => uc.vertical === 'manufacturing').length,
    retail: USE_CASES_MASTER_LIST.filter(uc => uc.vertical === 'retail').length,
    logistics: USE_CASES_MASTER_LIST.filter(uc => uc.vertical === 'logistics').length,
    education: USE_CASES_MASTER_LIST.filter(uc => uc.vertical === 'education').length,
    pharma: USE_CASES_MASTER_LIST.filter(uc => uc.vertical === 'pharma').length,
    government: USE_CASES_MASTER_LIST.filter(uc => uc.vertical === 'government').length,
    telecom: USE_CASES_MASTER_LIST.filter(uc => uc.vertical === 'telecom').length,
    'real-estate': USE_CASES_MASTER_LIST.filter(uc => uc.vertical === 'real-estate').length
  }
};

// Helper function to get use cases needing dashboards
export function getUseCasesNeedingDashboards(): UseCaseMasterItem[] {
  return USE_CASES_MASTER_LIST.filter(uc => !uc.hasDashboard);
}

// Helper function to get use cases by vertical
export function getUseCasesByVertical(vertical: string): UseCaseMasterItem[] {
  return USE_CASES_MASTER_LIST.filter(uc => uc.vertical === vertical);
}