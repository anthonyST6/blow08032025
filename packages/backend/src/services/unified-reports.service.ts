import { oilfieldReportsService } from './oilfield-reports.service';
import { energyReportsService } from './energy-reports.service';
import { gridAnomalyReportsService } from './grid-anomaly-reports.service';
import { healthcareReportsService } from './healthcare-reports.service';
import { financeReportsService } from './finance-reports.service';
import { manufacturingReportsService } from './manufacturing-reports.service';
import { retailReportsService } from './retail-reports.service';
import { logisticsReportsService } from './logistics-reports.service';
import { educationReportsService } from './education-reports.service';
import { pharmaReportsService } from './pharma-reports.service';
import { governmentReportsService } from './government-reports.service';
import { telecomReportsService } from './telecom-reports.service';
import { realEstateReportsService } from './real-estate-reports.service';
import { reportConfigService } from './report-config.service';
import { logger } from '../utils/logger';
import { MISSING_USE_CASE_REPORTS } from './reports/missing-use-case-reports.service';

export interface ReportRequest {
  useCaseId: string;
  reportType: string;
  parameters?: Record<string, any>;
}

export interface ReportResponse {
  success: boolean;
  reportId?: string;
  reportUrl?: string;
  error?: string;
  metadata?: any;
}

// Map of use cases to their report types
const USE_CASE_REPORTS: Record<string, {
  service: any;
  reports: Record<string, {
    name: string;
    description: string;
    method: string;
  }>;
}> = {
  'oilfield-land-lease': {
    service: oilfieldReportsService,
    reports: {
      'lease-expiration-dashboard': {
        name: 'Lease Expiration Dashboard',
        description: 'Comprehensive view of all leases expiring in next 365 days',
        method: 'generateLeaseExpirationDashboard'
      },
      'revenue-analysis': {
        name: 'Revenue Analysis Report',
        description: 'Detailed breakdown of revenue streams',
        method: 'generateRevenueAnalysisReport'
      },
      'compliance-status': {
        name: 'Compliance Status Report',
        description: 'Regulatory compliance tracking across all active leases',
        method: 'generateComplianceStatusReport'
      },
      'risk-assessment-matrix': {
        name: 'Risk Assessment Matrix',
        description: 'Comprehensive risk analysis with mitigation strategies',
        method: 'generateRiskAssessmentMatrix'
      },
      'production-performance': {
        name: 'Production Performance Report',
        description: 'Analysis of oil, gas, and water production',
        method: 'generateProductionPerformanceReport'
      },
      'executive-summary': {
        name: 'Executive Summary',
        description: 'Strategic overview and key performance indicators',
        method: 'generateExecutiveSummaryReport'
      },
      'lease-renewal-recommendations': {
        name: 'Lease Renewal Recommendations',
        description: 'AI-powered recommendations for upcoming renewals',
        method: 'generateLeaseRenewalRecommendations'
      },
      'financial-projections': {
        name: 'Financial Projections Model',
        description: '5-year financial projections with sensitivity analysis',
        method: 'generateFinancialProjectionsModel'
      },
      'regulatory-filing-checklist': {
        name: 'Regulatory Filing Checklist',
        description: 'Comprehensive tracking of regulatory requirements',
        method: 'generateRegulatoryFilingChecklist'
      },
      'operator-performance-scorecard': {
        name: 'Operator Performance Scorecard',
        description: 'Operator performance metrics and rankings',
        method: 'generateOperatorPerformanceScorecard'
      }
    }
  },
  'energy-load-forecasting': {
    service: energyReportsService,
    reports: {
      'daily-load-forecast': {
        name: 'Daily Load Forecast',
        description: 'AI-powered energy demand predictions for next day',
        method: 'generateDailyLoadForecastReport'
      },
      'weekly-load-analysis': {
        name: 'Weekly Load Analysis',
        description: 'Comprehensive weekly energy consumption patterns',
        method: 'generateWeeklyLoadAnalysisReport'
      },
      'grid-capacity-planning': {
        name: 'Grid Capacity Planning Report',
        description: 'Strategic assessment of grid infrastructure',
        method: 'generateGridCapacityPlanningReport'
      },
      'demand-response-performance': {
        name: 'Demand Response Performance',
        description: 'DR program effectiveness analysis',
        method: 'generateDemandResponseReport'
      },
      'forecast-accuracy': {
        name: 'Forecast Accuracy Report',
        description: 'Load forecasting model performance analysis',
        method: 'generateForecastAccuracyReport'
      },
      'operations-dashboard': {
        name: 'Real-time Operations Dashboard',
        description: 'Live system status and operational metrics',
        method: 'generateOperationsDashboardData'
      }
    }
  },
  'grid-anomaly-detection': {
    service: gridAnomalyReportsService,
    reports: {
      'realtime-anomaly': {
        name: 'Real-time Anomaly Report',
        description: 'AI-detected grid disturbances in last 24 hours',
        method: 'generateRealTimeAnomalyReport'
      },
      'weekly-anomaly-analysis': {
        name: 'Weekly Anomaly Analysis',
        description: 'Comprehensive weekly analysis of grid anomalies',
        method: 'generateWeeklyAnomalyAnalysis'
      },
      'outage-prediction': {
        name: 'Outage Prediction Report',
        description: 'ML-based predictions of potential grid failures',
        method: 'generateOutagePredictionReport'
      },
      'equipment-health': {
        name: 'Equipment Health Assessment',
        description: 'Equipment health analysis and maintenance recommendations',
        method: 'generateEquipmentHealthReport'
      },
      'power-quality': {
        name: 'Power Quality Analysis',
        description: 'Grid power quality metrics and compliance',
        method: 'generatePowerQualityReport'
      },
      'pattern-recognition': {
        name: 'Anomaly Pattern Recognition',
        description: 'ML-identified patterns in grid anomalies',
        method: 'generatePatternRecognitionReport'
      }
    }
  },
  'patient-intake': {
    service: healthcareReportsService,
    reports: {
      'patient-intake-dashboard': {
        name: 'Patient Intake Dashboard',
        description: 'Weekly patient registration and intake metrics',
        method: 'generatePatientIntakeDashboard'
      },
      'intake-analytics': {
        name: 'Intake Process Analytics',
        description: 'Detailed analysis of intake workflow efficiency',
        method: 'generateIntakeAnalyticsReport'
      },
      'patient-safety': {
        name: 'Patient Safety Monitoring',
        description: 'Safety event tracking and risk assessment',
        method: 'generatePatientSafetyReport'
      },
      'healthcare-compliance': {
        name: 'Healthcare Compliance Report',
        description: 'Comprehensive compliance tracking',
        method: 'generateComplianceReport'
      }
    }
  },
  'clinical-trial-matching': {
    service: healthcareReportsService,
    reports: {
      'clinical-trial-matching': {
        name: 'Clinical Trial Matching Report',
        description: 'AI-powered patient-trial matching analysis',
        method: 'generateClinicalTrialMatchingReport'
      },
      'trial-enrollment-pipeline': {
        name: 'Trial Enrollment Pipeline',
        description: 'Comprehensive enrollment funnel analysis',
        method: 'generateTrialEnrollmentPipeline'
      }
    }
  },
  'fraud-detection': {
    service: financeReportsService,
    reports: {
      'fraud-detection-dashboard': {
        name: 'Fraud Detection Dashboard',
        description: 'Real-time fraud monitoring and alerts',
        method: 'generateFraudDetectionDashboard'
      },
      'fraud-pattern-analysis': {
        name: 'Fraud Pattern Analysis',
        description: 'Comprehensive fraud pattern identification',
        method: 'generateFraudPatternAnalysis'
      },
      'fraud-model-performance': {
        name: 'Fraud Model Performance',
        description: 'ML model effectiveness analysis',
        method: 'generateFraudModelPerformance'
      },
      'regulatory-compliance': {
        name: 'Regulatory Compliance Report',
        description: 'Financial regulatory compliance tracking',
        method: 'generateRegulatoryComplianceReport'
      }
    }
  },
  'loan-processing': {
    service: financeReportsService,
    reports: {
      'loan-processing-dashboard': {
        name: 'Loan Processing Dashboard',
        description: 'Automated loan processing metrics',
        method: 'generateLoanProcessingDashboard'
      },
      'credit-risk-assessment': {
        name: 'Credit Risk Assessment',
        description: 'Comprehensive credit risk analysis',
        method: 'generateCreditRiskAssessment'
      }
    }
  },
  'predictive-maintenance': {
    service: manufacturingReportsService,
    reports: {
      'predictive-maintenance-dashboard': {
        name: 'Predictive Maintenance Dashboard',
        description: 'Real-time equipment health monitoring',
        method: 'generatePredictiveMaintenanceDashboard'
      },
      'equipment-failure-prediction': {
        name: 'Equipment Failure Prediction',
        description: 'ML-based failure predictions and risk assessment',
        method: 'generateEquipmentFailurePrediction'
      },
      'maintenance-cost-analysis': {
        name: 'Maintenance Cost Analysis',
        description: 'Comprehensive maintenance cost breakdown',
        method: 'generateMaintenanceCostAnalysis'
      },
      'maintenance-performance': {
        name: 'Maintenance Performance Report',
        description: 'KPI tracking and performance metrics',
        method: 'generateMaintenancePerformanceReport'
      }
    }
  },
  'quality-inspection': {
    service: manufacturingReportsService,
    reports: {
      'quality-inspection-dashboard': {
        name: 'Quality Inspection Dashboard',
        description: 'Real-time quality metrics and defect tracking',
        method: 'generateQualityInspectionDashboard'
      },
      'defect-analysis': {
        name: 'Defect Analysis Report',
        description: 'Comprehensive defect pattern analysis',
        method: 'generateDefectAnalysisReport'
      }
    }
  },
  'supply-chain-optimization': {
    service: manufacturingReportsService,
    reports: {
      'supply-chain-dashboard': {
        name: 'Supply Chain Dashboard',
        description: 'End-to-end supply chain visibility',
        method: 'generateSupplyChainDashboard'
      },
      'supplier-performance': {
        name: 'Supplier Performance Report',
        description: 'Supplier metrics and risk assessment',
        method: 'generateSupplierPerformanceReport'
      },
      'inventory-optimization': {
        name: 'Inventory Optimization Report',
        description: 'Stock level optimization and demand planning',
        method: 'generateInventoryOptimizationReport'
      }
    }
  },
  'demand-forecasting': {
    service: retailReportsService,
    reports: {
      'demand-forecast-dashboard': {
        name: 'Demand Forecast Dashboard',
        description: 'AI-powered demand predictions by product category',
        method: 'generateDemandForecastingDashboard'
      },
      'inventory-optimization': {
        name: 'Inventory Optimization Report',
        description: 'Stock level recommendations and turnover analysis',
        method: 'generateInventoryOptimizationReport'
      },
      'seasonal-trend-analysis': {
        name: 'Seasonal Trend Analysis',
        description: 'Historical patterns and seasonal insights',
        method: 'generateSeasonalTrendAnalysis'
      },
      'forecast-accuracy': {
        name: 'Forecast Accuracy Report',
        description: 'Model performance and accuracy metrics',
        method: 'generateForecastAccuracyReport'
      }
    }
  },
  'customer-personalization': {
    service: retailReportsService,
    reports: {
      'personalization-dashboard': {
        name: 'Personalization Dashboard',
        description: 'Customer engagement and recommendation metrics',
        method: 'generatePersonalizationDashboard'
      },
      'customer-segment-analysis': {
        name: 'Customer Segment Analysis',
        description: 'Detailed customer segmentation insights',
        method: 'generateCustomerSegmentAnalysis'
      },
      'recommendation-performance': {
        name: 'Recommendation Performance Report',
        description: 'AI recommendation effectiveness and ROI',
        method: 'generateRecommendationPerformanceReport'
      }
    }
  },
  'price-optimization': {
    service: retailReportsService,
    reports: {
      'price-optimization-dashboard': {
        name: 'Price Optimization Dashboard',
        description: 'Dynamic pricing recommendations and impact',
        method: 'generatePriceOptimizationDashboard'
      },
      'competitive-pricing-analysis': {
        name: 'Competitive Pricing Analysis',
        description: 'Market positioning and competitor insights',
        method: 'generateCompetitivePricingAnalysis'
      }
    }
  },
  'route-optimization': {
    service: logisticsReportsService,
    reports: {
      'route-optimization-dashboard': {
        name: 'Route Optimization Dashboard',
        description: 'Real-time route efficiency and performance metrics',
        method: 'generateRouteOptimizationDashboard'
      },
      'logistics-performance': {
        name: 'Logistics Performance Dashboard',
        description: 'Comprehensive logistics KPIs and metrics',
        method: 'generateLogisticsPerformanceDashboard'
      },
      'delivery-analytics': {
        name: 'Delivery Analytics Report',
        description: 'Delivery performance and customer satisfaction',
        method: 'generateDeliveryAnalyticsReport'
      }
    }
  },
  'fleet-maintenance': {
    service: logisticsReportsService,
    reports: {
      'fleet-maintenance': {
        name: 'Fleet Maintenance Report',
        description: 'Vehicle health monitoring and maintenance scheduling',
        method: 'generateFleetMaintenanceReport'
      }
    }
  },
  'warehouse-automation': {
    service: logisticsReportsService,
    reports: {
      'warehouse-automation': {
        name: 'Warehouse Automation Report',
        description: 'Automation performance and ROI analysis',
        method: 'generateWarehouseAutomationReport'
      },
      'supply-chain-disruption': {
        name: 'Supply Chain Disruption Report',
        description: 'Real-time disruption tracking and mitigation',
        method: 'generateSupplyChainDisruptionReport'
      },
      'warehouse-efficiency': {
        name: 'Warehouse Efficiency Report',
        description: 'Space utilization and operational efficiency',
        method: 'generateWarehouseEfficiencyReport'
      }
    }
  },
  'student-performance': {
    service: educationReportsService,
    reports: {
      'student-performance-dashboard': {
        name: 'Student Performance Dashboard',
        description: 'Comprehensive student academic performance analysis',
        method: 'generateStudentPerformanceDashboard'
      },
      'institutional-performance': {
        name: 'Institutional Performance Report',
        description: 'Institution-wide KPIs and metrics',
        method: 'generateInstitutionalPerformanceReport'
      },
      'learning-outcomes': {
        name: 'Learning Outcomes Report',
        description: 'Student achievement and progress tracking',
        method: 'generateLearningOutcomesReport'
      }
    }
  },
  'course-recommendation': {
    service: educationReportsService,
    reports: {
      'course-recommendation': {
        name: 'AI Course Recommendation Report',
        description: 'Personalized course recommendations based on student profiles',
        method: 'generateCourseRecommendationReport'
      },
      'learning-pathway-analysis': {
        name: 'Learning Pathway Analysis',
        description: 'Educational pathways and career outcomes',
        method: 'generateLearningPathwayAnalysis'
      }
    }
  },
  'student-engagement': {
    service: educationReportsService,
    reports: {
      'student-engagement-dashboard': {
        name: 'Student Engagement Dashboard',
        description: 'Digital platform engagement analytics',
        method: 'generateStudentEngagementDashboard'
      }
    }
  },
  'drug-discovery': {
    service: pharmaReportsService,
    reports: {
      'drug-discovery-dashboard': {
        name: 'Drug Discovery Dashboard',
        description: 'AI-powered drug discovery pipeline analytics',
        method: 'generateDrugDiscoveryReport'
      },
      'clinical-trial-analytics': {
        name: 'Clinical Trial Analytics',
        description: 'Comprehensive clinical trial performance metrics',
        method: 'generateClinicalTrialAnalytics'
      },
      'molecule-screening': {
        name: 'Molecule Screening Report',
        description: 'AI-based molecular screening results',
        method: 'generateMoleculeScreeningReport'
      }
    }
  },
  'regulatory-compliance': {
    service: pharmaReportsService,
    reports: {
      'regulatory-compliance': {
        name: 'Regulatory Compliance Report',
        description: 'FDA and global regulatory compliance tracking',
        method: 'generateRegulatoryComplianceReport'
      },
      'quality-assurance': {
        name: 'Quality Assurance Report',
        description: 'Manufacturing quality control and GMP compliance',
        method: 'generateQualityAssuranceReport'
      }
    }
  },
  'supply-chain-pharma': {
    service: pharmaReportsService,
    reports: {
      'pharma-supply-chain': {
        name: 'Pharmaceutical Supply Chain Report',
        description: 'End-to-end supply chain visibility and tracking',
        method: 'generatePharmaSupplyChainReport'
      }
    }
  },
  'citizen-services': {
    service: governmentReportsService,
    reports: {
      'citizen-services-dashboard': {
        name: 'Citizen Services Dashboard',
        description: 'Digital service delivery metrics and satisfaction',
        method: 'generateCitizenServicesDashboard'
      },
      'policy-compliance': {
        name: 'Policy Compliance Report',
        description: 'Government policy implementation tracking',
        method: 'generatePolicyComplianceReport'
      },
      'service-utilization': {
        name: 'Service Utilization Report',
        description: 'Digital service adoption and usage analytics',
        method: 'generateServiceUtilizationReport'
      }
    }
  },
  'public-safety': {
    service: governmentReportsService,
    reports: {
      'public-safety-analytics': {
        name: 'Public Safety Analytics',
        description: 'Crime prediction and resource allocation',
        method: 'generatePublicSafetyAnalytics'
      }
    }
  },
  'smart-city': {
    service: governmentReportsService,
    reports: {
      'smart-city-dashboard': {
        name: 'Smart City Dashboard',
        description: 'IoT-based city infrastructure monitoring',
        method: 'generateSmartCityDashboard'
      }
    }
  },
  'tax-revenue': {
    service: governmentReportsService,
    reports: {
      'tax-revenue-optimization': {
        name: 'Tax Revenue Optimization Report',
        description: 'AI-powered tax collection and compliance',
        method: 'generateTaxRevenueReport'
      }
    }
  },
  'network-optimization': {
    service: telecomReportsService,
    reports: {
      'network-performance': {
        name: 'Network Performance Dashboard',
        description: 'Real-time network monitoring and analytics',
        method: 'generateNetworkPerformanceDashboard'
      },
      'network-optimization': {
        name: 'Network Optimization Report',
        description: 'AI-driven network planning and optimization',
        method: 'generateNetworkOptimizationReport'
      },
      'capacity-planning': {
        name: 'Network Capacity Planning',
        description: 'Future capacity requirements and expansion planning',
        method: 'generateCapacityPlanningReport'
      }
    }
  },
  'customer-churn': {
    service: telecomReportsService,
    reports: {
      'customer-churn': {
        name: 'Customer Churn Analysis',
        description: 'AI-powered customer retention and churn prediction',
        method: 'generateCustomerChurnAnalysis'
      }
    }
  },
  'billing-optimization': {
    service: telecomReportsService,
    reports: {
      'billing-analytics': {
        name: 'Billing Analytics Report',
        description: 'Comprehensive billing and revenue analytics',
        method: 'generateBillingAnalyticsReport'
      }
    }
  },
  'service-quality': {
    service: telecomReportsService,
    reports: {
      'service-quality': {
        name: 'Service Quality Report',
        description: 'Real-time service monitoring and quality assurance',
        method: 'generateServiceQualityReport'
      }
    }
  },
  'property-management': {
    service: realEstateReportsService,
    reports: {
      'property-portfolio': {
        name: 'Property Portfolio Dashboard',
        description: 'Comprehensive real estate portfolio analytics',
        method: 'generatePropertyPortfolioDashboard'
      },
      'tenant-management': {
        name: 'Tenant Management Report',
        description: 'Tenant analytics and risk assessment',
        method: 'generateTenantManagementReport'
      }
    }
  },
  'market-analysis': {
    service: realEstateReportsService,
    reports: {
      'market-analysis': {
        name: 'Market Analysis Report',
        description: 'Real estate market trends and forecasts',
        method: 'generateMarketAnalysisReport'
      }
    }
  },
  'investment-analysis': {
    service: realEstateReportsService,
    reports: {
      'investment-analysis': {
        name: 'Investment Analysis Report',
        description: 'ROI projections and investment opportunities',
        method: 'generateInvestmentAnalysisReport'
      }
    }
  },
  'maintenance-tracking': {
    service: realEstateReportsService,
    reports: {
      'maintenance-tracking': {
        name: 'Maintenance Tracking Report',
        description: 'Property maintenance analytics and vendor performance',
        method: 'generateMaintenanceTrackingReport'
      }
    }
  },
  // Energy & Utilities - Renewable Energy Optimization
  'renewable-optimization': {
    service: energyReportsService,
    reports: {
      'renewable-optimization-dashboard': {
        name: 'Renewable Energy Dashboard',
        description: 'Solar and wind energy production optimization',
        method: 'generateRenewableOptimizationDashboard'
      },
      'energy-storage-analysis': {
        name: 'Energy Storage Analysis',
        description: 'Battery storage efficiency and ROI analysis',
        method: 'generateEnergyStorageAnalysis'
      },
      'carbon-footprint': {
        name: 'Carbon Footprint Report',
        description: 'Environmental impact and carbon reduction metrics',
        method: 'generateCarbonFootprintReport'
      }
    }
  },
  // Energy & Utilities - Drilling Risk Assessment
  'drilling-risk': {
    service: oilfieldReportsService,
    reports: {
      'drilling-risk-assessment': {
        name: 'Drilling Risk Assessment',
        description: 'Comprehensive drilling hazard and risk analysis',
        method: 'generateDrillingRiskAssessment'
      },
      'well-integrity': {
        name: 'Well Integrity Report',
        description: 'Well condition monitoring and failure prediction',
        method: 'generateWellIntegrityReport'
      },
      'hse-compliance': {
        name: 'HSE Compliance Report',
        description: 'Health, safety, and environmental compliance tracking',
        method: 'generateHSEComplianceReport'
      }
    }
  },
  // Energy & Utilities - Environmental Compliance
  'environmental-compliance': {
    service: energyReportsService,
    reports: {
      'environmental-compliance-dashboard': {
        name: 'Environmental Compliance Dashboard',
        description: 'Real-time environmental monitoring and compliance',
        method: 'generateEnvironmentalComplianceDashboard'
      },
      'emissions-tracking': {
        name: 'Emissions Tracking Report',
        description: 'GHG emissions monitoring and reduction strategies',
        method: 'generateEmissionsTrackingReport'
      },
      'regulatory-reporting': {
        name: 'Environmental Regulatory Report',
        description: 'EPA and state regulatory compliance documentation',
        method: 'generateEnvironmentalRegulatoryReport'
      }
    }
  },
  // Energy & Utilities - Load Forecasting
  'load-forecasting': {
    service: energyReportsService,
    reports: {
      'load-forecast-accuracy': {
        name: 'Load Forecast Accuracy Report',
        description: 'ML model performance and prediction accuracy',
        method: 'generateLoadForecastAccuracyReport'
      },
      'peak-demand-analysis': {
        name: 'Peak Demand Analysis',
        description: 'Peak load patterns and capacity planning',
        method: 'generatePeakDemandAnalysis'
      },
      'seasonal-load-patterns': {
        name: 'Seasonal Load Patterns',
        description: 'Historical seasonal trends and projections',
        method: 'generateSeasonalLoadPatterns'
      }
    }
  },
  // Energy & Utilities - PHMSA Compliance
  'phmsa-compliance': {
    service: oilfieldReportsService,
    reports: {
      'phmsa-compliance-dashboard': {
        name: 'PHMSA Compliance Dashboard',
        description: 'Pipeline safety and regulatory compliance tracking',
        method: 'generatePHMSAComplianceDashboard'
      },
      'pipeline-integrity': {
        name: 'Pipeline Integrity Report',
        description: 'Pipeline condition assessment and risk analysis',
        method: 'generatePipelineIntegrityReport'
      },
      'incident-tracking': {
        name: 'Incident Tracking Report',
        description: 'Safety incident analysis and prevention measures',
        method: 'generateIncidentTrackingReport'
      }
    }
  },
  // Healthcare - Patient Risk Stratification
  'patient-risk': {
    service: healthcareReportsService,
    reports: {
      'patient-risk-dashboard': {
        name: 'Patient Risk Dashboard',
        description: 'AI-powered patient risk stratification and alerts',
        method: 'generatePatientRiskDashboard'
      },
      'readmission-risk': {
        name: 'Readmission Risk Analysis',
        description: '30-day readmission prediction and prevention',
        method: 'generateReadmissionRiskAnalysis'
      },
      'chronic-disease-management': {
        name: 'Chronic Disease Management',
        description: 'Population health and chronic condition tracking',
        method: 'generateChronicDiseaseReport'
      }
    }
  },
  // Healthcare - Medication Adherence
  'medication-adherence': {
    service: healthcareReportsService,
    reports: {
      'medication-adherence-dashboard': {
        name: 'Medication Adherence Dashboard',
        description: 'Patient medication compliance tracking and interventions',
        method: 'generateMedicationAdherenceDashboard'
      },
      'adherence-interventions': {
        name: 'Adherence Intervention Report',
        description: 'Targeted intervention strategies and outcomes',
        method: 'generateAdherenceInterventionReport'
      },
      'pharmacy-analytics': {
        name: 'Pharmacy Analytics Report',
        description: 'Prescription patterns and pharmacy utilization',
        method: 'generatePharmacyAnalyticsReport'
      }
    }
  },
  // Finance - Credit Scoring
  'credit-scoring': {
    service: financeReportsService,
    reports: {
      'credit-scoring-dashboard': {
        name: 'Credit Scoring Dashboard',
        description: 'AI-powered credit risk assessment and scoring',
        method: 'generateCreditScoringDashboard'
      },
      'portfolio-risk-analysis': {
        name: 'Portfolio Risk Analysis',
        description: 'Credit portfolio risk distribution and trends',
        method: 'generatePortfolioRiskAnalysis'
      },
      'default-prediction': {
        name: 'Default Prediction Report',
        description: 'ML-based default probability and early warnings',
        method: 'generateDefaultPredictionReport'
      }
    }
  },
  // Manufacturing - Inventory Management
  'inventory-management': {
    service: manufacturingReportsService,
    reports: {
      'inventory-optimization': {
        name: 'Inventory Optimization Report',
        description: 'Stock level optimization and turnover analysis',
        method: 'generateInventoryOptimizationReport'
      },
      'stockout-analysis': {
        name: 'Stockout Analysis Report',
        description: 'Stockout prediction and prevention strategies',
        method: 'generateStockoutAnalysisReport'
      },
      'warehouse-efficiency': {
        name: 'Warehouse Efficiency Report',
        description: 'Warehouse operations and space utilization',
        method: 'generateWarehouseEfficiencyReport'
      }
    }
  },
  // Manufacturing - Production Planning
  'production-planning': {
    service: manufacturingReportsService,
    reports: {
      'production-schedule': {
        name: 'Production Schedule Report',
        description: 'Optimized production planning and scheduling',
        method: 'generateProductionScheduleReport'
      },
      'capacity-utilization': {
        name: 'Capacity Utilization Report',
        description: 'Manufacturing capacity analysis and optimization',
        method: 'generateCapacityUtilizationReport'
      },
      'production-efficiency': {
        name: 'Production Efficiency Report',
        description: 'OEE metrics and production line performance',
        method: 'generateProductionEfficiencyReport'
      }
    }
  },
  // Logistics - Delivery Optimization
  'delivery-optimization': {
    service: logisticsReportsService,
    reports: {
      'delivery-performance': {
        name: 'Delivery Performance Dashboard',
        description: 'On-time delivery metrics and route efficiency',
        method: 'generateDeliveryPerformanceDashboard'
      },
      'route-efficiency': {
        name: 'Route Efficiency Analysis',
        description: 'Route optimization and fuel consumption analysis',
        method: 'generateRouteEfficiencyAnalysis'
      },
      'driver-performance': {
        name: 'Driver Performance Report',
        description: 'Driver metrics and safety compliance',
        method: 'generateDriverPerformanceReport'
      }
    }
  },
  // Logistics - Last Mile Delivery
  'last-mile-delivery': {
    service: logisticsReportsService,
    reports: {
      'last-mile-analytics': {
        name: 'Last Mile Analytics Dashboard',
        description: 'Last mile delivery performance and customer satisfaction',
        method: 'generateLastMileAnalytics'
      },
      'delivery-cost-analysis': {
        name: 'Delivery Cost Analysis',
        description: 'Cost per delivery and optimization opportunities',
        method: 'generateDeliveryCostAnalysis'
      },
      'customer-experience': {
        name: 'Customer Experience Report',
        description: 'Delivery satisfaction and feedback analysis',
        method: 'generateCustomerExperienceReport'
      }
    }
  },
  // Education - Curriculum Optimization
  'curriculum-optimization': {
    service: educationReportsService,
    reports: {
      'curriculum-effectiveness': {
        name: 'Curriculum Effectiveness Report',
        description: 'Learning outcome analysis and curriculum impact',
        method: 'generateCurriculumEffectivenessReport'
      },
      'skill-gap-analysis': {
        name: 'Skill Gap Analysis',
        description: 'Student skill assessment and gap identification',
        method: 'generateSkillGapAnalysis'
      },
      'curriculum-recommendations': {
        name: 'Curriculum Recommendations',
        description: 'AI-powered curriculum improvement suggestions',
        method: 'generateCurriculumRecommendations'
      }
    }
  },
  // Education - Enrollment Prediction
  'enrollment-prediction': {
    service: educationReportsService,
    reports: {
      'enrollment-forecast': {
        name: 'Enrollment Forecast Report',
        description: 'ML-based enrollment predictions by program',
        method: 'generateEnrollmentForecastReport'
      },
      'retention-analysis': {
        name: 'Student Retention Analysis',
        description: 'Retention rates and at-risk student identification',
        method: 'generateRetentionAnalysisReport'
      },
      'recruitment-effectiveness': {
        name: 'Recruitment Effectiveness',
        description: 'Marketing and recruitment ROI analysis',
        method: 'generateRecruitmentEffectivenessReport'
      }
    }
  },
  // Pharmaceuticals - Clinical Trial Optimization
  'clinical-trial-optimization': {
    service: pharmaReportsService,
    reports: {
      'trial-optimization-dashboard': {
        name: 'Clinical Trial Dashboard',
        description: 'Trial progress, enrollment, and site performance',
        method: 'generateTrialOptimizationDashboard'
      },
      'patient-recruitment': {
        name: 'Patient Recruitment Analysis',
        description: 'Recruitment funnel and site effectiveness',
        method: 'generatePatientRecruitmentAnalysis'
      },
      'protocol-deviation': {
        name: 'Protocol Deviation Report',
        description: 'Protocol compliance and deviation tracking',
        method: 'generateProtocolDeviationReport'
      }
    }
  },
  // Pharmaceuticals - Patient Outcome Prediction
  'patient-outcome-prediction': {
    service: pharmaReportsService,
    reports: {
      'patient-outcome-dashboard': {
        name: 'Patient Outcome Dashboard',
        description: 'Treatment effectiveness and outcome predictions',
        method: 'generatePatientOutcomeDashboard'
      },
      'treatment-response': {
        name: 'Treatment Response Analysis',
        description: 'Patient response patterns and biomarker analysis',
        method: 'generateTreatmentResponseAnalysis'
      },
      'real-world-evidence': {
        name: 'Real World Evidence Report',
        description: 'RWE analysis and post-market surveillance',
        method: 'generateRealWorldEvidenceReport'
      }
    }
  },
  // Pharmaceuticals - Adverse Event Detection
  'adverse-event-detection': {
    service: pharmaReportsService,
    reports: {
      'adverse-event-dashboard': {
        name: 'Adverse Event Dashboard',
        description: 'Real-time adverse event monitoring and alerts',
        method: 'generateAdverseEventDashboard'
      },
      'safety-signal-detection': {
        name: 'Safety Signal Detection',
        description: 'AI-powered safety signal identification',
        method: 'generateSafetySignalReport'
      },
      'pharmacovigilance': {
        name: 'Pharmacovigilance Report',
        description: 'Comprehensive drug safety monitoring',
        method: 'generatePharmacovigilanceReport'
      }
    }
  },
  // Pharmaceuticals - Market Access Optimization
  'market-access-optimization': {
    service: pharmaReportsService,
    reports: {
      'market-access-dashboard': {
        name: 'Market Access Dashboard',
        description: 'Payer coverage and formulary positioning',
        method: 'generateMarketAccessDashboard'
      },
      'pricing-strategy': {
        name: 'Pricing Strategy Analysis',
        description: 'Competitive pricing and value proposition',
        method: 'generatePricingStrategyAnalysis'
      },
      'payer-analytics': {
        name: 'Payer Analytics Report',
        description: 'Payer mix and reimbursement trends',
        method: 'generatePayerAnalyticsReport'
      }
    }
  },
  // Merge in all missing use case reports to ensure every use case has at least 3 reports
  ...MISSING_USE_CASE_REPORTS
};

class UnifiedReportsService {
  /**
   * Get available reports for a specific use case
   */
  async getAvailableReports(useCaseId: string): Promise<{
    useCaseId: string;
    reports: Array<{
      id: string;
      name: string;
      description: string;
      format: string;
      configurable?: boolean;
      parameters?: any[];
    }>;
  }> {
    const useCaseConfig = USE_CASE_REPORTS[useCaseId];
    
    if (!useCaseConfig) {
      throw new Error(`No reports configured for use case: ${useCaseId}`);
    }

    // Check if reports have been generated and exist in the file system
    const { reportService } = await import('./report.service');
    const existingReports = await reportService.listReports();
    
    const reports = Object.entries(useCaseConfig.reports).map(([id, config]) => {
      const reportConfig = reportConfigService.getReportConfig(useCaseId, id);
      
      // Check if this report exists in the file system
      const existingReport = existingReports.find(r =>
        r.useCaseId === useCaseId && r.name.toLowerCase().includes(config.name.toLowerCase())
      );
      
      return {
        id,
        name: config.name,
        description: config.description,
        format: this.getReportFormat(config.method),
        configurable: !!reportConfig,
        parameters: reportConfig?.parameters,
        generated: !!existingReport,
        downloadUrl: existingReport?.downloadUrl
      };
    });

    // If no reports exist, log but don't auto-generate to prevent infinite loops
    if (reports.every(r => !r.generated)) {
      logger.info(`No reports found for use case ${useCaseId}`);
      // Don't auto-generate reports to prevent infinite loops
      // Reports should be generated on-demand through explicit API calls
    }

    return {
      useCaseId,
      reports
    };
  }

  /**
   * Generate a specific report for a use case
   */
  async generateReport(request: ReportRequest): Promise<ReportResponse> {
    try {
      const { useCaseId, reportType, parameters = {} } = request;
      
      logger.info(`Generating report: ${reportType} for use case: ${useCaseId}`);

      const useCaseConfig = USE_CASE_REPORTS[useCaseId];
      if (!useCaseConfig) {
        throw new Error(`No reports configured for use case: ${useCaseId}`);
      }

      const reportConfig = useCaseConfig.reports[reportType];
      if (!reportConfig) {
        throw new Error(`Unknown report type: ${reportType} for use case: ${useCaseId}`);
      }

      // Validate and apply default parameters if configuration exists
      const configService = reportConfigService.getReportConfig(useCaseId, reportType);
      let finalParameters = parameters;
      
      if (configService) {
        // Apply defaults
        finalParameters = reportConfigService.applyDefaults(useCaseId, reportType, parameters);
        
        // Validate parameters
        const validation = reportConfigService.validateParameters(useCaseId, reportType, finalParameters);
        if (!validation.valid) {
          throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
        }
      }

      const service = useCaseConfig.service;
      const method = service[reportConfig.method];
      
      if (!method) {
        throw new Error(`Report generation method not found: ${reportConfig.method}`);
      }

      // Call the report generation method with validated parameters
      const result = await method.call(service, finalParameters);

      return {
        success: true,
        reportId: result.id,
        reportUrl: result.downloadUrl,
        metadata: {
          name: result.name,
          description: result.description,
          type: result.type,
          size: result.size,
          createdAt: result.createdAt,
          agent: result.agent,
          parameters: finalParameters
        }
      };
    } catch (error) {
      logger.error('Failed to generate report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate all reports for a specific use case
   */
  async generateAllReportsForUseCase(useCaseId: string): Promise<{
    useCaseId: string;
    totalReports: number;
    successfulReports: number;
    failedReports: number;
    reports: ReportResponse[];
  }> {
    const useCaseConfig = USE_CASE_REPORTS[useCaseId];
    
    if (!useCaseConfig) {
      throw new Error(`No reports configured for use case: ${useCaseId}`);
    }

    const results: ReportResponse[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const [reportType, config] of Object.entries(useCaseConfig.reports)) {
      try {
        const result = await this.generateReport({
          useCaseId,
          reportType
        });
        
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
        
        results.push(result);
      } catch (error) {
        failureCount++;
        results.push({
          success: false,
          error: `Failed to generate ${config.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return {
      useCaseId,
      totalReports: results.length,
      successfulReports: successCount,
      failedReports: failureCount,
      reports: results
    };
  }

  /**
   * Get all configured use cases with their available reports
   */
  async getAllUseCaseReports(): Promise<Array<{
    useCaseId: string;
    useCaseName: string;
    reportCount: number;
    reports: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  }>> {
    const useCaseNames: Record<string, string> = {
      // Energy & Utilities
      'oilfield-land-lease': 'Oilfield Land Lease',
      'energy-load-forecasting': 'Energy Load Forecasting',
      'grid-anomaly-detection': 'Grid Anomaly Detection',
      'renewable-optimization': 'Renewable Energy Optimization',
      'drilling-risk': 'Drilling Risk Assessment',
      'environmental-compliance': 'Environmental Compliance',
      'load-forecasting': 'Load Forecasting',
      'phmsa-compliance': 'PHMSA Compliance',
      // Healthcare
      'patient-intake': 'Patient Intake Automation',
      'clinical-trial-matching': 'Clinical Trial Matching',
      'patient-risk': 'Patient Risk Stratification',
      'medication-adherence': 'Medication Adherence',
      // Finance & Banking
      'fraud-detection': 'Transaction Fraud Detection',
      'loan-processing': 'Automated Loan Processing',
      'credit-scoring': 'Credit Scoring',
      // Manufacturing
      'predictive-maintenance': 'Predictive Maintenance',
      'quality-inspection': 'Quality Inspection',
      'supply-chain-optimization': 'Supply Chain Optimization',
      'inventory-management': 'Inventory Management',
      'production-planning': 'Production Planning',
      // Retail
      'demand-forecasting': 'Demand Forecasting',
      'customer-personalization': 'Customer Personalization',
      'price-optimization': 'Price Optimization',
      // Transportation & Logistics
      'route-optimization': 'Route Optimization',
      'fleet-maintenance': 'Fleet Maintenance',
      'warehouse-automation': 'Warehouse Automation',
      'delivery-optimization': 'Delivery Optimization',
      'last-mile-delivery': 'Last Mile Delivery',
      // Education
      'student-performance': 'Student Performance Analytics',
      'course-recommendation': 'AI Course Recommendation',
      'student-engagement': 'Student Engagement Tracking',
      'curriculum-optimization': 'Curriculum Optimization',
      'enrollment-prediction': 'Enrollment Prediction',
      // Pharmaceuticals
      'drug-discovery': 'AI Drug Discovery',
      'regulatory-compliance': 'Regulatory Compliance',
      'supply-chain-pharma': 'Pharmaceutical Supply Chain',
      'clinical-trial-optimization': 'Clinical Trial Optimization',
      'patient-outcome-prediction': 'Patient Outcome Prediction',
      'adverse-event-detection': 'Adverse Event Detection',
      'market-access-optimization': 'Market Access Optimization',
      // Government
      'citizen-services': 'Digital Citizen Services',
      'public-safety': 'Public Safety Analytics',
      'smart-city': 'Smart City Infrastructure',
      'tax-revenue': 'Tax Revenue Optimization',
      // Telecommunications
      'network-optimization': 'Network Optimization',
      'customer-churn': 'Customer Churn Prevention',
      'billing-optimization': 'Billing Optimization',
      'service-quality': 'Service Quality Monitoring',
      // Real Estate
      'property-management': 'Property Management',
      'market-analysis': 'Real Estate Market Analysis',
      'investment-analysis': 'Investment Analysis',
      'maintenance-tracking': 'Maintenance Tracking'
    };

    return Object.entries(USE_CASE_REPORTS).map(([useCaseId, config]) => ({
      useCaseId,
      useCaseName: useCaseNames[useCaseId] || useCaseId,
      reportCount: Object.keys(config.reports).length,
      reports: Object.entries(config.reports).map(([id, reportConfig]) => ({
        id,
        name: reportConfig.name,
        description: reportConfig.description
      }))
    }));
  }

  /**
   * Schedule report generation
   */
  async scheduleReport(useCaseId: string, reportType: string, schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time?: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  }): Promise<{
    success: boolean;
    scheduleId?: string;
    error?: string;
  }> {
    try {
      // In a real implementation, this would integrate with the scheduler service
      logger.info(`Scheduling report: ${reportType} for use case: ${useCaseId}`, schedule);
      
      // Mock implementation
      const scheduleId = `SCHED-${Date.now()}`;
      
      return {
        success: true,
        scheduleId
      };
    } catch (error) {
      logger.error('Failed to schedule report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get report generation history
   */
  async getReportHistory(_useCaseId?: string, _limit: number = 50): Promise<Array<{
    reportId: string;
    useCaseId: string;
    reportType: string;
    generatedAt: Date;
    status: 'success' | 'failed';
    downloadUrl?: string;
    error?: string;
  }>> {
    // In a real implementation, this would query from database
    // Mock implementation
    return [];
  }

  /**
   * Helper method to determine report format from method name
   */
  private getReportFormat(methodName: string): string {
    if (methodName.includes('PDF')) return 'pdf';
    if (methodName.includes('XLSX') || methodName.includes('Excel')) return 'xlsx';
    if (methodName.includes('JSON') || methodName.includes('Data')) return 'json';
    if (methodName.includes('TXT')) return 'txt';
    return 'pdf'; // default
  }

  /**
   * Get report configuration for a specific report
   */
  async getReportConfiguration(useCaseId: string, reportType: string): Promise<{
    parameters: any[];
    outputFormats: string[];
    scheduling?: {
      enabled: boolean;
      frequencies: string[];
    };
  } | null> {
    const config = reportConfigService.getReportConfig(useCaseId, reportType);
    if (!config) {
      return null;
    }

    return {
      parameters: config.parameters,
      outputFormats: config.outputFormats,
      scheduling: config.scheduling
    };
  }

  /**
   * Validate report parameters before generation
   */
  async validateReportParameters(
    useCaseId: string,
    reportType: string,
    parameters: Record<string, any>
  ): Promise<{ valid: boolean; errors: string[] }> {
    return reportConfigService.validateParameters(useCaseId, reportType, parameters);
  }
}

export const unifiedReportsService = new UnifiedReportsService();