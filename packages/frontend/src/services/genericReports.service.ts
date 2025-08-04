import { api } from './api';

export interface GenericReport {
  id: string;
  name: string;
  size: string;
  timestamp: string;
  category: string;
  description: string;
  reportType?: string;
  format?: string;
  downloadUrl?: string;
}

export interface ReportMetadata {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'json' | 'xlsx' | 'txt' | 'zip';
  size: number;
  agent: string;
  useCaseId: string;
  workflowId?: string;
  createdAt: Date;
  storagePath: string;
  downloadUrl: string;
}

// Default reports for use cases that don't have specific configurations
const DEFAULT_REPORTS: GenericReport[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary Report.pdf',
    size: '2.5 MB',
    timestamp: new Date().toISOString(),
    category: 'Executive Reports',
    description: 'High-level overview and key metrics'
  },
  {
    id: 'detailed-analysis',
    name: 'Detailed Analysis Report.xlsx',
    size: '4.8 MB',
    timestamp: new Date().toISOString(),
    category: 'Analytics',
    description: 'Comprehensive data analysis and insights'
  },
  {
    id: 'compliance-report',
    name: 'Compliance Status Report.pdf',
    size: '3.2 MB',
    timestamp: new Date().toISOString(),
    category: 'Compliance',
    description: 'Regulatory compliance status and audit trail'
  },
  {
    id: 'performance-metrics',
    name: 'Performance Metrics Dashboard.pdf',
    size: '2.9 MB',
    timestamp: new Date().toISOString(),
    category: 'Performance',
    description: 'Key performance indicators and trends'
  }
];

// Report configurations for all use cases
export const USE_CASE_REPORTS: { [key: string]: GenericReport[] } = {
  'oilfield-lease': [
    // Lease Management Reports
    {
      id: 'lease-expiration-dashboard',
      name: 'Lease Expiration Dashboard - Q4 2024.pdf',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Lease Management',
      description: 'Comprehensive view of all leases expiring in next 365 days with risk scores'
    },
    {
      id: 'renewal-strategy-report',
      name: 'Renewal Strategy & Recommendations.pdf',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Strategic Planning',
      description: 'AI-generated renewal strategies with financial impact analysis'
    },
    {
      id: 'lease-portfolio-summary',
      name: 'Lease Portfolio Executive Summary.pdf',
      size: '2.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'High-level overview of entire lease portfolio with KPIs'
    },
    // Financial Reports
    {
      id: 'financial-model-complete',
      name: 'Lease Portfolio Financial Model - Complete.xlsx',
      size: '5.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Detailed financial projections, NPV analysis, and cost optimization scenarios'
    },
    {
      id: 'cost-savings-analysis',
      name: 'Cost Savings Opportunities Report.pdf',
      size: '2.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Identified $2.3M in annual savings through optimization'
    },
    {
      id: 'bonus-payment-schedule',
      name: 'Bonus Payment Schedule & Forecasts.xlsx',
      size: '1.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Planning',
      description: 'Upcoming bonus payments and cash flow projections'
    },
    // Compliance & Regulatory
    {
      id: 'compliance-audit-trail',
      name: 'Complete Compliance Audit Trail.pdf',
      size: '8.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Full audit trail of all lease actions with regulatory compliance verification'
    },
    {
      id: 'regulatory-filing-package',
      name: 'Regulatory Filing Package - BLM & State.zip',
      size: '12.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Pre-filled regulatory forms and supporting documentation'
    },
    {
      id: 'environmental-compliance',
      name: 'Environmental Compliance Status Report.pdf',
      size: '3.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Environmental assessments and compliance status for all properties'
    },
    // Risk Assessment
    {
      id: 'risk-assessment-matrix',
      name: 'Lease Risk Assessment Matrix.xlsx',
      size: '2.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: 'Comprehensive risk scoring for all leases with mitigation strategies'
    },
    {
      id: 'title-defect-report',
      name: 'Title Defect & Cure Report.pdf',
      size: '4.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: '12 leases requiring title cure with recommended actions'
    },
    {
      id: 'mineral-rights-validation',
      name: 'Mineral Rights Validation Report.pdf',
      size: '3.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Rights Management',
      description: 'Validated mineral rights for 156 properties with chain of title'
    },
    // Operational Reports
    {
      id: 'action-packages-detailed',
      name: 'Action Packages - All Pending Approvals.zip',
      size: '15.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: 'Complete renewal packages for 28 leases requiring action'
    },
    {
      id: 'auto-renewal-summary',
      name: 'Auto-Renewal Execution Summary.pdf',
      size: '1.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: '23 leases auto-renewed with terms and savings achieved'
    },
    {
      id: 'integration-status-report',
      name: 'System Integration Status Report.pdf',
      size: '2.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Technical',
      description: 'ERP, GIS, and CLM integration health and data quality metrics'
    },
    // Strategic Planning
    {
      id: 'portfolio-optimization',
      name: 'Portfolio Optimization Recommendations.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Strategic Planning',
      description: 'AI-driven recommendations for portfolio restructuring'
    },
    {
      id: 'market-analysis',
      name: 'Regional Market Analysis & Trends.pdf',
      size: '4.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Market Intelligence',
      description: 'Competitive landscape and market trends affecting lease values'
    },
    {
      id: 'production-correlation',
      name: 'Lease Production Correlation Analysis.xlsx',
      size: '6.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Analytics',
      description: 'Production data correlated with lease terms and profitability'
    },
    // Geographic/Spatial Reports
    {
      id: 'gis-maps-package',
      name: 'GIS Maps - All Lease Properties.zip',
      size: '28.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Geographic Data',
      description: 'Interactive maps showing all lease boundaries and attributes'
    },
    {
      id: 'acreage-summary',
      name: 'Acreage Summary by Region & Formation.xlsx',
      size: '2.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Geographic Data',
      description: 'Detailed acreage breakdown with geological formations'
    }
  ],
  'grid-anomaly': [
    {
      id: 'grid-health-dashboard',
      name: 'Grid Health Dashboard - Real-Time.pdf',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time grid health metrics and anomaly detection status'
    },
    {
      id: 'anomaly-detection-report',
      name: 'Anomaly Detection Analysis Report.pdf',
      size: '4.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Technical Analysis',
      description: 'Detailed analysis of detected anomalies with risk assessments'
    },
    {
      id: 'predictive-failure-model',
      name: 'Predictive Failure Model Results.xlsx',
      size: '6.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'ML model predictions for potential grid failures'
    },
    {
      id: 'outage-prevention-summary',
      name: 'Outage Prevention Summary.pdf',
      size: '2.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: 'Summary of prevented outages and customer impact analysis'
    },
    {
      id: 'grid-resilience-metrics',
      name: 'Grid Resilience Metrics Report.pdf',
      size: '3.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Performance Metrics',
      description: 'Comprehensive grid resilience and reliability metrics'
    },
    {
      id: 'maintenance-optimization',
      name: 'Maintenance Schedule Optimization.xlsx',
      size: '4.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Maintenance Planning',
      description: 'Optimized maintenance schedules based on anomaly predictions'
    },
    {
      id: 'regulatory-compliance-grid',
      name: 'Grid Regulatory Compliance Report.pdf',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'NERC and FERC compliance status and audit readiness'
    },
    {
      id: 'cost-benefit-analysis',
      name: 'Anomaly Detection ROI Analysis.xlsx',
      size: '2.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Cost savings from prevented outages and optimized maintenance'
    }
  ],
  'patient-risk': [
    {
      id: 'patient-risk-dashboard',
      name: 'Patient Risk Stratification Dashboard.pdf',
      size: '4.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'High-level overview of patient risk profiles and interventions'
    },
    {
      id: 'high-risk-cohort-analysis',
      name: 'High-Risk Patient Cohort Analysis.pdf',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Clinical Analysis',
      description: 'Detailed analysis of 127 high-risk patients with care recommendations'
    },
    {
      id: 'care-plan-templates',
      name: 'Personalized Care Plan Templates.zip',
      size: '8.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Care Management',
      description: 'AI-generated care plans for different risk categories'
    },
    {
      id: 'readmission-prediction',
      name: 'Readmission Risk Predictions.xlsx',
      size: '3.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: '30-day readmission risk scores with confidence intervals'
    },
    {
      id: 'social-determinants-impact',
      name: 'Social Determinants Impact Analysis.pdf',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Population Health',
      description: 'Analysis of social factors affecting patient outcomes'
    },
    {
      id: 'intervention-effectiveness',
      name: 'Intervention Effectiveness Report.pdf',
      size: '3.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Outcomes Analysis',
      description: 'Effectiveness metrics for different intervention strategies'
    },
    {
      id: 'cost-savings-healthcare',
      name: 'Healthcare Cost Savings Analysis.xlsx',
      size: '2.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Projected savings from reduced readmissions and ED visits'
    },
    {
      id: 'hipaa-compliance-report',
      name: 'HIPAA Compliance Audit Report.pdf',
      size: '6.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Complete HIPAA compliance audit trail and certifications'
    }
  ],
  'fraud-detection': [
    {
      id: 'fraud-detection-dashboard',
      name: 'Real-Time Fraud Detection Dashboard.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Executive overview of fraud detection performance and metrics'
    },
    {
      id: 'suspicious-transactions',
      name: 'Suspicious Transaction Analysis.xlsx',
      size: '7.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Transaction Analysis',
      description: 'Detailed analysis of flagged transactions with risk scores'
    },
    {
      id: 'fraud-pattern-report',
      name: 'Fraud Pattern Recognition Report.pdf',
      size: '4.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Pattern Analysis',
      description: 'Identified fraud patterns and emerging threat analysis'
    },
    {
      id: 'false-positive-analysis',
      name: 'False Positive Reduction Analysis.pdf',
      size: '3.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Model Performance',
      description: 'Analysis of false positive rates and improvement strategies'
    },
    {
      id: 'sar-filing-package',
      name: 'SAR Filing Documentation.zip',
      size: '9.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Suspicious Activity Reports ready for regulatory filing'
    },
    {
      id: 'fraud-prevention-roi',
      name: 'Fraud Prevention ROI Analysis.xlsx',
      size: '2.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Cost-benefit analysis of fraud prevention measures'
    },
    {
      id: 'behavioral-analytics',
      name: 'Behavioral Analytics Report.pdf',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Advanced Analytics',
      description: 'Customer behavioral patterns and anomaly detection'
    },
    {
      id: 'regulatory-compliance-fraud',
      name: 'AML/BSA Compliance Report.pdf',
      size: '6.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Anti-Money Laundering and Bank Secrecy Act compliance status'
    }
  ],
  'predictive-maintenance': [
    {
      id: 'maintenance-dashboard',
      name: 'Predictive Maintenance Dashboard.pdf',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Overview of equipment health and maintenance predictions'
    },
    {
      id: 'failure-prediction-report',
      name: 'Equipment Failure Predictions.xlsx',
      size: '5.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'Detailed failure predictions for all monitored equipment'
    },
    {
      id: 'maintenance-schedule',
      name: 'Optimized Maintenance Schedule.pdf',
      size: '3.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: 'AI-optimized maintenance schedule for next 90 days'
    },
    {
      id: 'vibration-analysis',
      name: 'Vibration Analysis Report.pdf',
      size: '6.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Technical Analysis',
      description: 'Detailed vibration analysis for rotating equipment'
    },
    {
      id: 'spare-parts-optimization',
      name: 'Spare Parts Inventory Optimization.xlsx',
      size: '2.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Inventory Management',
      description: 'Optimized spare parts inventory based on failure predictions'
    },
    {
      id: 'downtime-cost-analysis',
      name: 'Downtime Cost Analysis.pdf',
      size: '3.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Cost impact of prevented vs actual downtime events'
    },
    {
      id: 'equipment-health-scores',
      name: 'Equipment Health Score Report.xlsx',
      size: '4.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Asset Management',
      description: 'Health scores and remaining useful life for all assets'
    },
    {
      id: 'maintenance-compliance',
      name: 'Maintenance Compliance Report.pdf',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Regulatory compliance status for maintenance programs'
    }
  ],
  'demand-forecasting': [
    {
      id: 'demand-forecast-dashboard',
      name: 'Demand Forecasting Dashboard.pdf',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Executive overview of demand predictions and accuracy metrics'
    },
    {
      id: 'sku-level-forecasts',
      name: 'SKU-Level Demand Forecasts.xlsx',
      size: '12.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Forecasting',
      description: 'Detailed forecasts for 10,000+ SKUs with confidence intervals'
    },
    {
      id: 'seasonal-trend-analysis',
      name: 'Seasonal Trend Analysis Report.pdf',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Trend Analysis',
      description: 'Analysis of seasonal patterns and trend predictions'
    },
    {
      id: 'inventory-optimization',
      name: 'Inventory Optimization Recommendations.pdf',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Inventory Management',
      description: 'AI-driven inventory level recommendations'
    },
    {
      id: 'stockout-prevention',
      name: 'Stockout Prevention Analysis.xlsx',
      size: '4.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: 'Analysis of prevented stockouts and service level improvements'
    },
    {
      id: 'overstock-reduction',
      name: 'Overstock Reduction Report.pdf',
      size: '3.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Cost Optimization',
      description: 'Strategies for reducing overstock and markdown costs'
    },
    {
      id: 'forecast-accuracy-metrics',
      name: 'Forecast Accuracy Metrics.xlsx',
      size: '2.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Performance Metrics',
      description: 'Detailed accuracy metrics by category and time period'
    },
    {
      id: 'supply-chain-integration',
      name: 'Supply Chain Integration Report.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: 'Integration status with suppliers and distribution centers'
    }
  ],
  'route-optimization': [
    {
      id: 'route-optimization-dashboard',
      name: 'Dynamic Route Optimization Dashboard.pdf',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time overview of route optimization performance'
    },
    {
      id: 'optimized-routes-daily',
      name: 'Daily Optimized Routes.xlsx',
      size: '8.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: 'Optimized routes for all delivery vehicles'
    },
    {
      id: 'delivery-performance',
      name: 'Delivery Performance Metrics.pdf',
      size: '3.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Performance Metrics',
      description: 'On-time delivery rates and performance analysis'
    },
    {
      id: 'fuel-savings-report',
      name: 'Fuel Consumption & Savings Report.pdf',
      size: '2.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Cost Analysis',
      description: 'Fuel savings from optimized routing'
    },
    {
      id: 'driver-performance',
      name: 'Driver Performance Analytics.xlsx',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Human Resources',
      description: 'Driver performance metrics and efficiency scores'
    },
    {
      id: 'traffic-pattern-analysis',
      name: 'Traffic Pattern Analysis.pdf',
      size: '5.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Analytics',
      description: 'Historical traffic patterns and predictive modeling'
    },
    {
      id: 'customer-satisfaction',
      name: 'Customer Satisfaction Report.pdf',
      size: '3.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Customer Service',
      description: 'Impact of optimized routing on customer satisfaction'
    },
    {
      id: 'carbon-footprint',
      name: 'Carbon Footprint Reduction Report.pdf',
      size: '2.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Sustainability',
      description: 'Environmental impact of route optimization'
    }
  ],
  // Energy & Utilities - Additional use cases
  'renewable-optimization': [
    {
      id: 'renewable-dashboard',
      name: 'Renewable Energy Optimization Dashboard.pdf',
      size: '4.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time renewable energy generation and optimization metrics'
    },
    {
      id: 'generation-forecast',
      name: 'Renewable Generation Forecast.xlsx',
      size: '6.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Forecasting',
      description: 'Weather-integrated generation forecasts for wind and solar assets'
    },
    {
      id: 'curtailment-analysis',
      name: 'Curtailment Reduction Analysis.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: 'Analysis of curtailment events and mitigation strategies'
    },
    {
      id: 'storage-optimization',
      name: 'Battery Storage Optimization Report.pdf',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Energy Storage',
      description: 'Optimal charging/discharging strategies for energy storage'
    },
    {
      id: 'grid-integration',
      name: 'Grid Integration Performance.xlsx',
      size: '3.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Technical Analysis',
      description: 'Grid stability and integration metrics for renewable assets'
    },
    {
      id: 'revenue-optimization',
      name: 'Energy Market Revenue Analysis.pdf',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Revenue optimization through market participation'
    },
    {
      id: 'carbon-credits',
      name: 'Carbon Credit Generation Report.pdf',
      size: '2.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Sustainability',
      description: 'Carbon offset calculations and credit generation'
    },
    {
      id: 'maintenance-renewable',
      name: 'Renewable Asset Maintenance Schedule.xlsx',
      size: '3.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Maintenance',
      description: 'Predictive maintenance for wind turbines and solar panels'
    }
  ],
  'drilling-risk': [
    {
      id: 'drilling-risk-dashboard',
      name: 'Drilling Risk Assessment Dashboard.pdf',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time drilling risk monitoring and predictions'
    },
    {
      id: 'wellbore-stability',
      name: 'Wellbore Stability Analysis.pdf',
      size: '6.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Technical Analysis',
      description: 'Geomechanical analysis and stability predictions'
    },
    {
      id: 'stuck-pipe-prevention',
      name: 'Stuck Pipe Risk Assessment.xlsx',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: 'Predictive analysis for stuck pipe prevention'
    },
    {
      id: 'drilling-parameters',
      name: 'Optimized Drilling Parameters.pdf',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: 'AI-optimized drilling parameters for current operations'
    },
    {
      id: 'formation-pressure',
      name: 'Formation Pressure Analysis.xlsx',
      size: '5.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Geological Analysis',
      description: 'Pore pressure and fracture gradient predictions'
    },
    {
      id: 'npt-analysis',
      name: 'Non-Productive Time Analysis.pdf',
      size: '4.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Performance Metrics',
      description: 'NPT reduction strategies and cost impact'
    },
    {
      id: 'hse-compliance',
      name: 'HSE Compliance Report.pdf',
      size: '6.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Health, safety, and environmental compliance status'
    },
    {
      id: 'cost-per-foot',
      name: 'Drilling Cost Analysis.xlsx',
      size: '3.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Cost per foot analysis and optimization opportunities'
    }
  ],
  'environmental-compliance': [
    {
      id: 'environmental-dashboard',
      name: 'Environmental Compliance Dashboard.pdf',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Comprehensive environmental compliance status overview'
    },
    {
      id: 'emissions-monitoring',
      name: 'Emissions Monitoring Report.xlsx',
      size: '7.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Environmental Monitoring',
      description: 'Real-time emissions data and compliance status'
    },
    {
      id: 'methane-leak-report',
      name: 'Methane Leak Detection Analysis.pdf',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Leak Detection',
      description: 'Comprehensive methane leak detection and repair records'
    },
    {
      id: 'water-quality',
      name: 'Water Quality Monitoring Report.pdf',
      size: '4.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Water Management',
      description: 'Water usage, treatment, and discharge compliance'
    },
    {
      id: 'waste-management',
      name: 'Waste Management Compliance.xlsx',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Waste Management',
      description: 'Hazardous and non-hazardous waste tracking'
    },
    {
      id: 'permit-status',
      name: 'Environmental Permits Status.pdf',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Regulatory',
      description: 'Status of all environmental permits and renewals'
    },
    {
      id: 'epa-reporting',
      name: 'EPA Regulatory Filing Package.zip',
      size: '12.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Complete EPA reporting documentation'
    },
    {
      id: 'sustainability-metrics',
      name: 'Sustainability Performance Report.pdf',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Sustainability',
      description: 'ESG metrics and sustainability performance'
    }
  ],
  'load-forecasting': [
    {
      id: 'load-forecast-dashboard',
      name: 'Load Forecasting Dashboard.pdf',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time load forecasting and accuracy metrics'
    },
    {
      id: 'demand-predictions',
      name: 'Hourly Demand Predictions.xlsx',
      size: '8.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Forecasting',
      description: '24-hour ahead load predictions with confidence intervals'
    },
    {
      id: 'weather-impact',
      name: 'Weather Impact Analysis.pdf',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Weather Analytics',
      description: 'Weather-driven demand patterns and correlations'
    },
    {
      id: 'peak-demand',
      name: 'Peak Demand Management Report.pdf',
      size: '3.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Demand Management',
      description: 'Peak shaving strategies and demand response'
    },
    {
      id: 'forecast-accuracy',
      name: 'Load Forecast Accuracy Report.xlsx',
      size: '2.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Performance Metrics',
      description: 'Historical accuracy metrics and model performance'
    },
    {
      id: 'capacity-planning',
      name: 'Capacity Planning Analysis.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Strategic Planning',
      description: 'Long-term capacity requirements and investment planning'
    },
    {
      id: 'grid-stability-load',
      name: 'Grid Stability Impact Report.pdf',
      size: '3.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Grid Operations',
      description: 'Load forecasting impact on grid stability'
    },
    {
      id: 'economic-dispatch',
      name: 'Economic Dispatch Optimization.xlsx',
      size: '5.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Cost Optimization',
      description: 'Optimized generation dispatch based on load forecasts'
    }
  ]
};

// Add remaining use cases to USE_CASE_REPORTS
Object.assign(USE_CASE_REPORTS, {
  // Healthcare
  'clinical-trial': [
    {
      id: 'trial-dashboard',
      name: 'Clinical Trial Optimization Dashboard.pdf',
      size: '4.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Overview of clinical trial performance and patient matching'
    },
    {
      id: 'patient-matching',
      name: 'Patient-Trial Matching Analysis.xlsx',
      size: '7.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Patient Recruitment',
      description: 'AI-matched patients for active clinical trials'
    },
    {
      id: 'enrollment-predictions',
      name: 'Enrollment Prediction Report.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'Predicted enrollment rates and timeline optimization'
    },
    {
      id: 'protocol-optimization',
      name: 'Protocol Optimization Recommendations.pdf',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Trial Design',
      description: 'AI-driven protocol improvements for better outcomes'
    },
    {
      id: 'site-performance',
      name: 'Clinical Site Performance Metrics.xlsx',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Site Management',
      description: 'Performance metrics for all trial sites'
    },
    {
      id: 'adverse-event-analysis',
      name: 'Adverse Event Analysis Report.pdf',
      size: '6.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Safety Monitoring',
      description: 'Comprehensive adverse event tracking and analysis'
    },
    {
      id: 'regulatory-submission',
      name: 'FDA Regulatory Submission Package.zip',
      size: '15.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Complete regulatory documentation for FDA submission'
    },
    {
      id: 'cost-per-patient',
      name: 'Trial Cost Analysis.xlsx',
      size: '3.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Cost per patient and budget optimization'
    }
  ],
  'medication-adherence': [
    {
      id: 'adherence-dashboard',
      name: 'Medication Adherence Dashboard.pdf',
      size: '4.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Population-level medication adherence metrics'
    },
    {
      id: 'patient-risk-profiles',
      name: 'Non-Adherence Risk Profiles.xlsx',
      size: '6.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Assessment',
      description: 'Patients at high risk for medication non-adherence'
    },
    {
      id: 'intervention-strategies',
      name: 'Personalized Intervention Plans.pdf',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Care Management',
      description: 'AI-generated intervention strategies by patient segment'
    },
    {
      id: 'adherence-predictors',
      name: 'Adherence Predictor Analysis.pdf',
      size: '3.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'Key factors predicting medication adherence'
    },
    {
      id: 'pharmacy-integration',
      name: 'Pharmacy Integration Report.xlsx',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: 'Integration status with pharmacy systems'
    },
    {
      id: 'clinical-outcomes',
      name: 'Clinical Outcome Improvements.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Outcomes Analysis',
      description: 'Health outcomes correlated with adherence improvements'
    },
    {
      id: 'cost-savings-adherence',
      name: 'Adherence Program ROI Analysis.xlsx',
      size: '2.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Cost savings from improved medication adherence'
    },
    {
      id: 'patient-engagement',
      name: 'Patient Engagement Metrics.pdf',
      size: '3.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Patient Experience',
      description: 'Engagement rates across different intervention channels'
    }
  ],
  'disease-outbreak': [
    {
      id: 'outbreak-dashboard',
      name: 'Disease Outbreak Prediction Dashboard.pdf',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time disease outbreak monitoring and predictions'
    },
    {
      id: 'hotspot-analysis',
      name: 'Geographic Hotspot Analysis.xlsx',
      size: '8.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Epidemiology',
      description: 'Identified disease hotspots with risk scores'
    },
    {
      id: 'transmission-modeling',
      name: 'Disease Transmission Models.pdf',
      size: '6.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Modeling',
      description: 'Mathematical models of disease spread patterns'
    },
    {
      id: 'resource-allocation',
      name: 'Healthcare Resource Allocation Plan.pdf',
      size: '4.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Resource Planning',
      description: 'Optimal allocation of healthcare resources'
    },
    {
      id: 'surveillance-report',
      name: 'Syndromic Surveillance Report.xlsx',
      size: '7.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Surveillance',
      description: 'Early warning signals from syndromic surveillance'
    },
    {
      id: 'intervention-effectiveness',
      name: 'Public Health Intervention Analysis.pdf',
      size: '5.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Intervention Analysis',
      description: 'Effectiveness of various intervention strategies'
    },
    {
      id: 'cdc-reporting',
      name: 'CDC Reporting Package.zip',
      size: '11.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Automated CDC reporting documentation'
    },
    {
      id: 'economic-impact',
      name: 'Outbreak Economic Impact Analysis.xlsx',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Economic Analysis',
      description: 'Economic impact assessment and mitigation strategies'
    }
  ],
  'hospital-operations': [
    {
      id: 'operations-dashboard',
      name: 'Hospital Operations Dashboard.pdf',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time hospital operations and efficiency metrics'
    },
    {
      id: 'bed-utilization',
      name: 'Bed Utilization Optimization Report.xlsx',
      size: '5.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Resource Management',
      description: 'Optimized bed allocation and turnover analysis'
    },
    {
      id: 'staff-scheduling',
      name: 'AI-Optimized Staff Schedules.pdf',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Workforce Management',
      description: 'Optimized nursing and physician schedules'
    },
    {
      id: 'patient-flow',
      name: 'Patient Flow Analysis.pdf',
      size: '5.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations Analysis',
      description: 'Emergency department and inpatient flow optimization'
    },
    {
      id: 'surgical-scheduling',
      name: 'OR Scheduling Optimization.xlsx',
      size: '6.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Surgical Services',
      description: 'Optimized operating room schedules and utilization'
    },
    {
      id: 'supply-chain-health',
      name: 'Medical Supply Chain Report.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Supply Chain',
      description: 'Medical supply inventory and procurement optimization'
    },
    {
      id: 'quality-metrics',
      name: 'Hospital Quality Metrics Report.pdf',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Quality Assurance',
      description: 'Clinical quality indicators and improvement areas'
    },
    {
      id: 'financial-performance',
      name: 'Hospital Financial Performance.xlsx',
      size: '4.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Revenue cycle optimization and cost analysis'
    }
  ],
  // Financial Services
  'credit-risk': [
    {
      id: 'credit-risk-dashboard',
      name: 'Credit Risk Assessment Dashboard.pdf',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Portfolio-wide credit risk metrics and trends'
    },
    {
      id: 'default-predictions',
      name: 'Default Probability Predictions.xlsx',
      size: '9.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Analytics',
      description: 'ML-based default predictions for all borrowers'
    },
    {
      id: 'portfolio-stress-test',
      name: 'Portfolio Stress Test Results.pdf',
      size: '6.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Stress Testing',
      description: 'Comprehensive stress test scenarios and outcomes'
    },
    {
      id: 'risk-concentration',
      name: 'Risk Concentration Analysis.pdf',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Portfolio Analysis',
      description: 'Geographic and sector concentration risks'
    },
    {
      id: 'early-warning-signals',
      name: 'Early Warning Indicators Report.xlsx',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Monitoring',
      description: 'Behavioral indicators of increasing credit risk'
    },
    {
      id: 'basel-compliance',
      name: 'Basel III Compliance Report.pdf',
      size: '7.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Regulatory Compliance',
      description: 'Capital adequacy and regulatory compliance metrics'
    },
    {
      id: 'provision-calculation',
      name: 'Loan Loss Provision Calculations.xlsx',
      size: '4.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Reporting',
      description: 'IFRS 9 compliant provision calculations'
    },
    {
      id: 'risk-mitigation',
      name: 'Risk Mitigation Strategies.pdf',
      size: '3.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: 'Recommended actions for high-risk accounts'
    }
  ],
  'algorithmic-trading': [
    {
      id: 'trading-dashboard',
      name: 'Algorithmic Trading Performance Dashboard.pdf',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time trading performance and strategy metrics'
    },
    {
      id: 'strategy-performance',
      name: 'Trading Strategy Analysis.xlsx',
      size: '8.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Performance Analytics',
      description: 'Detailed performance metrics for all active strategies'
    },
    {
      id: 'market-microstructure',
      name: 'Market Microstructure Analysis.pdf',
      size: '6.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Market Analysis',
      description: 'Order flow, liquidity, and market impact analysis'
    },
    {
      id: 'risk-metrics',
      name: 'Trading Risk Metrics Report.pdf',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: 'VaR, drawdown analysis, and risk-adjusted returns'
    },
    {
      id: 'execution-quality',
      name: 'Execution Quality Analysis.xlsx',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Execution Analytics',
      description: 'Slippage, market impact, and execution benchmarks'
    },
    {
      id: 'regulatory-reporting',
      name: 'MiFID II Compliance Report.pdf',
      size: '7.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Best execution and transaction reporting compliance'
    },
    {
      id: 'backtesting-results',
      name: 'Strategy Backtesting Results.xlsx',
      size: '9.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Strategy Development',
      description: 'Historical backtesting with walk-forward analysis'
    },
    {
      id: 'pnl-attribution',
      name: 'P&L Attribution Analysis.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Detailed P&L breakdown by strategy and factor'
    }
  ],
  'insurance-claims': [
    {
      id: 'claims-dashboard',
      name: 'Claims Processing Dashboard.pdf',
      size: '4.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time claims processing metrics and automation rates'
    },
    {
      id: 'fraud-detection-claims',
      name: 'Claims Fraud Detection Report.xlsx',
      size: '7.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Fraud Analytics',
      description: 'Suspicious claims identified with confidence scores'
    },
    {
      id: 'processing-efficiency',
      name: 'Claims Processing Efficiency Analysis.pdf',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: 'Automation rates and processing time improvements'
    },
    {
      id: 'severity-predictions',
      name: 'Claims Severity Predictions.xlsx',
      size: '5.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'Predicted claim amounts and reserve recommendations'
    },
    {
      id: 'customer-satisfaction-claims',
      name: 'Claims Customer Satisfaction Report.pdf',
      size: '3.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Customer Experience',
      description: 'NPS scores and satisfaction metrics by claim type'
    },
    {
      id: 'subrogation-opportunities',
      name: 'Subrogation Opportunity Analysis.xlsx',
      size: '4.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Recovery',
      description: 'Identified subrogation opportunities with recovery estimates'
    },
    {
      id: 'regulatory-claims',
      name: 'Claims Regulatory Compliance Report.pdf',
      size: '6.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'State regulatory compliance and reporting'
    },
    {
      id: 'loss-ratio-analysis',
      name: 'Loss Ratio Analysis.xlsx',
      size: '3.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Loss ratios by product line and geography'
    }
  ],
  'portfolio-optimization': [
    {
      id: 'portfolio-dashboard',
      name: 'Portfolio Optimization Dashboard.pdf',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Portfolio performance and optimization recommendations'
    },
    {
      id: 'efficient-frontier',
      name: 'Efficient Frontier Analysis.xlsx',
      size: '7.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Portfolio Analytics',
      description: 'Risk-return optimization across multiple scenarios'
    },
    {
      id: 'factor-analysis',
      name: 'Multi-Factor Risk Analysis.pdf',
      size: '6.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Analytics',
      description: 'Factor exposures and risk decomposition'
    },
    {
      id: 'rebalancing-recommendations',
      name: 'Portfolio Rebalancing Plan.pdf',
      size: '4.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Investment Strategy',
      description: 'AI-driven rebalancing recommendations with tax optimization'
    },
    {
      id: 'scenario-analysis',
      name: 'Scenario & Stress Test Results.xlsx',
      size: '8.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: 'Portfolio performance under various market scenarios'
    },
    {
      id: 'esg-integration',
      name: 'ESG Integration Report.pdf',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'ESG Analytics',
      description: 'ESG scores and sustainable investment analysis'
    },
    {
      id: 'performance-attribution',
      name: 'Performance Attribution Analysis.xlsx',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Performance Analytics',
      description: 'Return attribution by asset class and strategy'
    },
    {
      id: 'compliance-portfolio',
      name: 'Investment Compliance Report.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Investment guideline compliance and breaches'
    }
  ],
  // Manufacturing
  'quality-control': [
    {
      id: 'quality-dashboard',
      name: 'Quality Control Dashboard.pdf',
      size: '4.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time quality metrics and defect predictions'
    },
    {
      id: 'defect-analysis',
      name: 'Defect Root Cause Analysis.xlsx',
      size: '6.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Quality Analytics',
      description: 'AI-identified defect patterns and root causes'
    },
    {
      id: 'spc-charts',
      name: 'Statistical Process Control Charts.pdf',
      size: '5.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Process Control',
      description: 'SPC charts with anomaly detection alerts'
    },
    {
      id: 'supplier-quality',
      name: 'Supplier Quality Performance.xlsx',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Supplier Management',
      description: 'Quality metrics by supplier with trend analysis'
    },
    {
      id: 'predictive-quality',
      name: 'Predictive Quality Analysis.pdf',
      size: '5.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'ML predictions for quality issues before they occur'
    },
    {
      id: 'cost-of-quality',
      name: 'Cost of Quality Report.xlsx',
      size: '3.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Financial impact of quality issues and improvements'
    },
    {
      id: 'iso-compliance',
      name: 'ISO 9001 Compliance Report.pdf',
      size: '7.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'ISO certification readiness and audit findings'
    },
    {
      id: 'customer-complaints',
      name: 'Customer Complaint Analysis.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Customer Feedback',
      description: 'Complaint trends and resolution effectiveness'
    }
  ],
  'supply-chain': [
    {
      id: 'supply-chain-dashboard',
      name: 'Supply Chain Visibility Dashboard.pdf',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'End-to-end supply chain visibility and KPIs'
    },
    {
      id: 'disruption-predictions',
      name: 'Supply Chain Disruption Forecast.xlsx',
      size: '7.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: 'AI predictions for potential supply chain disruptions'
    },
    {
      id: 'inventory-optimization-sc',
      name: 'Multi-Echelon Inventory Optimization.pdf',
      size: '6.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Inventory Management',
      description: 'Optimized inventory levels across the supply chain'
    },
    {
      id: 'supplier-risk-assessment',
      name: 'Supplier Risk Assessment Report.pdf',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Supplier Management',
      description: 'Comprehensive supplier risk scores and mitigation'
    },
    {
      id: 'logistics-optimization',
      name: 'Logistics Network Optimization.xlsx',
      size: '8.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Logistics',
      description: 'Optimized distribution network and routing'
    },
    {
      id: 'demand-supply-matching',
      name: 'Demand-Supply Matching Analysis.pdf',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Planning',
      description: 'AI-driven demand-supply balancing recommendations'
    },
    {
      id: 'sustainability-supply',
      name: 'Supply Chain Sustainability Report.pdf',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Sustainability',
      description: 'Carbon footprint and sustainability metrics'
    },
    {
      id: 'total-cost-ownership',
      name: 'Total Cost of Ownership Analysis.xlsx',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Cost Analysis',
      description: 'TCO analysis for key supply chain decisions'
    }
  ],
  'production-planning': [
    {
      id: 'production-dashboard',
      name: 'Production Planning Dashboard.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time production metrics and optimization status'
    },
    {
      id: 'capacity-planning',
      name: 'Capacity Planning Analysis.xlsx',
      size: '7.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Capacity Management',
      description: 'Current and projected capacity utilization'
    },
    {
      id: 'production-schedule',
      name: 'Optimized Production Schedule.pdf',
      size: '5.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Scheduling',
      description: 'AI-optimized production schedules for all lines'
    },
    {
      id: 'changeover-optimization',
      name: 'Changeover Time Optimization.xlsx',
      size: '4.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Efficiency',
      description: 'Minimized changeover times and sequencing'
    },
    {
      id: 'material-requirements',
      name: 'Material Requirements Planning.pdf',
      size: '6.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Materials Planning',
      description: 'Optimized MRP with lead time considerations'
    },
    {
      id: 'oee-analysis',
      name: 'Overall Equipment Effectiveness Report.xlsx',
      size: '3.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Performance Metrics',
      description: 'OEE metrics with improvement recommendations'
    },
    {
      id: 'workforce-planning',
      name: 'Production Workforce Planning.pdf',
      size: '4.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Human Resources',
      description: 'Optimized staffing levels and skill requirements'
    },
    {
      id: 'cost-variance',
      name: 'Production Cost Variance Analysis.xlsx',
      size: '3.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Cost Management',
      description: 'Actual vs planned cost analysis with root causes'
    }
  ],
  'asset-performance': [
    {
      id: 'asset-dashboard',
      name: 'Asset Performance Dashboard.pdf',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Fleet-wide asset performance and health metrics'
    },
    {
      id: 'reliability-analysis',
      name: 'Asset Reliability Analysis.xlsx',
      size: '7.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Reliability Engineering',
      description: 'MTBF, MTTR, and reliability trends by asset class'
    },
    {
      id: 'lifecycle-optimization',
      name: 'Asset Lifecycle Optimization Report.pdf',
      size: '6.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Asset Management',
      description: 'Optimal replacement and refurbishment strategies'
    },
    {
      id: 'performance-benchmarking',
      name: 'Asset Performance Benchmarking.pdf',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Benchmarking',
      description: 'Performance comparison against industry standards'
    },
    {
      id: 'energy-efficiency',
      name: 'Energy Efficiency Analysis.xlsx',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Energy Management',
      description: 'Energy consumption patterns and savings opportunities'
    },
    {
      id: 'criticality-assessment',
      name: 'Asset Criticality Assessment.pdf',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: 'Risk-based asset criticality rankings'
    },
    {
      id: 'capex-planning',
      name: 'Capital Investment Planning.xlsx',
      size: '6.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Planning',
      description: 'Prioritized CAPEX recommendations based on asset condition'
    },
    {
      id: 'iso-55000',
      name: 'ISO 55000 Compliance Report.pdf',
      size: '5.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Asset management system compliance status'
    }
  ],
  // Retail & E-commerce
  'customer-segmentation': [
    {
      id: 'segmentation-dashboard',
      name: 'Customer Segmentation Dashboard.pdf',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Dynamic customer segments with behavioral insights'
    },
    {
      id: 'segment-profiles',
      name: 'Detailed Segment Profiles.xlsx',
      size: '8.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Customer Analytics',
      description: 'Comprehensive profiles for each customer segment'
    },
    {
      id: 'lifetime-value',
      name: 'Customer Lifetime Value Analysis.pdf',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'CLV predictions by segment with confidence intervals'
    },
    {
      id: 'churn-prediction',
      name: 'Churn Risk Prediction Report.xlsx',
      size: '6.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'Customers at risk of churning with retention strategies'
    },
    {
      id: 'personalization-engine',
      name: 'Personalization Strategy Report.pdf',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Marketing Strategy',
      description: 'AI-driven personalization recommendations by segment'
    },
    {
      id: 'cross-sell-opportunities',
      name: 'Cross-Sell & Upsell Analysis.xlsx',
      size: '5.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Revenue Optimization',
      description: 'Product affinity and recommendation opportunities'
    },
    {
      id: 'campaign-effectiveness',
      name: 'Marketing Campaign ROI Report.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Marketing Analytics',
      description: 'Campaign performance by customer segment'
    },
    {
      id: 'segment-migration',
      name: 'Customer Segment Migration Analysis.xlsx',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Customer Journey',
      description: 'Tracking customer movement between segments'
    }
  ],
  'price-optimization': [
    {
      id: 'pricing-dashboard',
      name: 'Dynamic Pricing Dashboard.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time pricing optimization metrics and performance'
    },
    {
      id: 'elasticity-analysis',
      name: 'Price Elasticity Analysis.xlsx',
      size: '7.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Pricing Analytics',
      description: 'Demand elasticity by product category and segment'
    },
    {
      id: 'competitive-pricing',
      name: 'Competitive Pricing Intelligence.pdf',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Market Intelligence',
      description: 'Competitor pricing analysis and positioning'
    },
    {
      id: 'margin-optimization',
      name: 'Margin Optimization Report.xlsx',
      size: '4.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Optimal pricing for margin maximization'
    },
    {
      id: 'promotional-effectiveness',
      name: 'Promotion Impact Analysis.pdf',
      size: '6.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Promotional Analytics',
      description: 'ROI analysis of promotional pricing strategies'
    },
    {
      id: 'dynamic-pricing-rules',
      name: 'Dynamic Pricing Rules Engine.xlsx',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Pricing Strategy',
      description: 'Automated pricing rules and triggers'
    },
    {
      id: 'cannibalization-analysis',
      name: 'Product Cannibalization Report.pdf',
      size: '4.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Product Strategy',
      description: 'Cross-product pricing impact analysis'
    },
    {
      id: 'revenue-forecast',
      name: 'Revenue Impact Forecast.xlsx',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Revenue Management',
      description: 'Projected revenue impact of pricing changes'
    }
  ],
  'recommendation-engine': [
    {
      id: 'recommendation-dashboard',
      name: 'Recommendation Engine Dashboard.pdf',
      size: '4.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Performance metrics for recommendation algorithms'
    },
    {
      id: 'algorithm-performance',
      name: 'Algorithm Performance Comparison.xlsx',
      size: '6.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Technical Analytics',
      description: 'A/B test results for different recommendation models'
    },
    {
      id: 'user-engagement',
      name: 'User Engagement Metrics.pdf',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'User Analytics',
      description: 'Click-through and conversion rates by recommendation type'
    },
    {
      id: 'product-affinity',
      name: 'Product Affinity Matrix.xlsx',
      size: '8.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Product Analytics',
      description: 'Cross-product purchase patterns and associations'
    },
    {
      id: 'personalization-impact',
      name: 'Personalization Revenue Impact.pdf',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Revenue Analysis',
      description: 'Revenue uplift from personalized recommendations'
    },
    {
      id: 'cold-start-analysis',
      name: 'New User Recommendation Strategy.pdf',
      size: '3.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Strategy',
      description: 'Strategies for recommending to new users'
    },
    {
      id: 'diversity-metrics',
      name: 'Recommendation Diversity Report.xlsx',
      size: '4.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Quality Metrics',
      description: 'Balancing relevance with catalog diversity'
    },
    {
      id: 'real-time-performance',
      name: 'Real-Time System Performance.pdf',
      size: '5.5 MB',
      timestamp: new Date().toISOString(),
      category: 'System Performance',
      description: 'Latency and throughput metrics for recommendations'
    }
  ],
  'inventory-management': [
    {
      id: 'inventory-dashboard',
      name: 'Inventory Management Dashboard.pdf',
      size: '5.0 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time inventory levels and optimization metrics'
    },
    {
      id: 'stock-level-optimization',
      name: 'Optimal Stock Level Analysis.xlsx',
      size: '9.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Inventory Optimization',
      description: 'AI-calculated optimal stock levels by SKU'
    },
    {
      id: 'dead-stock-analysis',
      name: 'Dead Stock Identification Report.pdf',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Inventory Health',
      description: 'Slow-moving and obsolete inventory analysis'
    },
    {
      id: 'reorder-point-calc',
      name: 'Dynamic Reorder Points.xlsx',
      size: '6.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Replenishment',
      description: 'Automated reorder point calculations'
    },
    {
      id: 'warehouse-optimization',
      name: 'Warehouse Layout Optimization.pdf',
      size: '5.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Warehouse Management',
      description: 'Optimal product placement for picking efficiency'
    },
    {
      id: 'inventory-turnover',
      name: 'Inventory Turnover Analysis.xlsx',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Performance Metrics',
      description: 'Turnover rates by category and location'
    },
    {
      id: 'carrying-cost-analysis',
      name: 'Inventory Carrying Cost Report.pdf',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Cost Analysis',
      description: 'Total cost of holding inventory'
    },
    {
      id: 'abc-classification',
      name: 'ABC Inventory Classification.xlsx',
      size: '5.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Inventory Strategy',
      description: 'Product classification for inventory prioritization'
    }
  ],
  // Transportation & Logistics
  'fleet-management': [
    {
      id: 'fleet-dashboard',
      name: 'Fleet Management Dashboard.pdf',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Comprehensive fleet performance and utilization metrics'
    },
    {
      id: 'vehicle-utilization',
      name: 'Vehicle Utilization Analysis.xlsx',
      size: '7.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Asset Utilization',
      description: 'Detailed utilization rates by vehicle and route'
    },
    {
      id: 'maintenance-forecast',
      name: 'Predictive Maintenance Schedule.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Maintenance Planning',
      description: 'AI-predicted maintenance needs for fleet vehicles'
    },
    {
      id: 'fuel-efficiency',
      name: 'Fuel Efficiency Report.xlsx',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Cost Management',
      description: 'Fuel consumption analysis and optimization'
    },
    {
      id: 'driver-safety-scores',
      name: 'Driver Safety Performance.pdf',
      size: '4.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Safety Management',
      description: 'Driver behavior and safety scoring'
    },
    {
      id: 'route-efficiency',
      name: 'Route Efficiency Analysis.xlsx',
      size: '6.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Route Optimization',
      description: 'Actual vs optimal route performance'
    },
    {
      id: 'compliance-tracking',
      name: 'Fleet Compliance Report.pdf',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Regulatory Compliance',
      description: 'DOT compliance and inspection readiness'
    },
    {
      id: 'tco-analysis',
      name: 'Total Cost of Ownership.xlsx',
      size: '4.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'TCO analysis for fleet replacement decisions'
    }
  ],
  'warehouse-optimization': [
    {
      id: 'warehouse-dashboard',
      name: 'Warehouse Operations Dashboard.pdf',
      size: '5.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time warehouse performance metrics'
    },
    {
      id: 'picking-optimization',
      name: 'Order Picking Optimization.xlsx',
      size: '8.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations Efficiency',
      description: 'Optimized picking routes and batch strategies'
    },
    {
      id: 'space-utilization',
      name: 'Warehouse Space Analysis.pdf',
      size: '6.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Space Management',
      description: 'Current vs optimal space utilization'
    },
    {
      id: 'labor-productivity',
      name: 'Labor Productivity Report.xlsx',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Workforce Analytics',
      description: 'Productivity metrics by shift and function'
    },
    {
      id: 'slotting-optimization',
      name: 'Product Slotting Strategy.pdf',
      size: '5.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Layout Optimization',
      description: 'AI-optimized product placement strategies'
    },
    {
      id: 'dock-scheduling',
      name: 'Dock Door Utilization.xlsx',
      size: '3.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Dock Management',
      description: 'Inbound/outbound dock scheduling efficiency'
    },
    {
      id: 'inventory-accuracy',
      name: 'Inventory Accuracy Report.pdf',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Inventory Control',
      description: 'Cycle count results and accuracy trends'
    },
    {
      id: 'automation-roi',
      name: 'Automation Investment Analysis.xlsx',
      size: '5.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Strategic Planning',
      description: 'ROI analysis for warehouse automation'
    }
  ],
  'last-mile-delivery': [
    {
      id: 'delivery-dashboard',
      name: 'Last Mile Delivery Dashboard.pdf',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time delivery performance and customer satisfaction'
    },
    {
      id: 'delivery-time-windows',
      name: 'Delivery Window Optimization.xlsx',
      size: '7.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Customer Experience',
      description: 'Optimized delivery time slots and capacity'
    },
    {
      id: 'failed-delivery-analysis',
      name: 'Failed Delivery Root Cause.pdf',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Quality Analysis',
      description: 'Analysis of delivery failures and prevention strategies'
    },
    {
      id: 'customer-communication',
      name: 'Customer Communication Metrics.xlsx',
      size: '3.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Customer Service',
      description: 'Proactive communication effectiveness'
    },
    {
      id: 'delivery-density',
      name: 'Delivery Density Analysis.pdf',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Route Planning',
      description: 'Stop density optimization for efficiency'
    },
    {
      id: 'alternative-delivery',
      name: 'Alternative Delivery Options.xlsx',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Innovation',
      description: 'Locker, PUDO, and drone delivery analysis'
    },
    {
      id: 'cost-per-delivery',
      name: 'Unit Economics Report.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Cost breakdown and profitability by delivery type'
    },
    {
      id: 'sustainability-metrics',
      name: 'Green Delivery Initiatives.xlsx',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Sustainability',
      description: 'Carbon footprint and eco-friendly delivery options'
    }
  ],
  'freight-optimization': [
    {
      id: 'freight-dashboard',
      name: 'Freight Optimization Dashboard.pdf',
      size: '5.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Multi-modal freight optimization metrics'
    },
    {
      id: 'carrier-performance',
      name: 'Carrier Performance Scorecard.xlsx',
      size: '8.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Carrier Management',
      description: 'Performance metrics by carrier and lane'
    },
    {
      id: 'load-consolidation',
      name: 'Load Consolidation Opportunities.pdf',
      size: '6.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Cost Optimization',
      description: 'LTL to FTL conversion opportunities'
    },
    {
      id: 'mode-optimization',
      name: 'Transportation Mode Analysis.xlsx',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Mode Selection',
      description: 'Optimal mode selection by shipment characteristics'
    },
    {
      id: 'freight-spend-analysis',
      name: 'Freight Spend Analytics.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Detailed freight spend breakdown and trends'
    },
    {
      id: 'capacity-forecast',
      name: 'Capacity Availability Forecast.xlsx',
      size: '6.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Capacity Planning',
      description: 'Predicted capacity constraints by lane'
    },
    {
      id: 'accessorial-analysis',
      name: 'Accessorial Charges Report.pdf',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Cost Management',
      description: 'Analysis of additional charges and reduction strategies'
    },
    {
      id: 'network-design',
      name: 'Freight Network Optimization.xlsx',
      size: '7.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Network Strategy',
      description: 'Optimal DC locations and freight flows'
    }
  ],
  // Government & Public Sector
  'citizen-services': [
    {
      id: 'services-dashboard',
      name: 'Citizen Services Dashboard.pdf',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Service delivery metrics and citizen satisfaction'
    },
    {
      id: 'service-demand-forecast',
      name: 'Service Demand Predictions.xlsx',
      size: '6.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Demand Planning',
      description: 'Predicted demand for government services'
    },
    {
      id: 'wait-time-analysis',
      name: 'Service Wait Time Analysis.pdf',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Service Quality',
      description: 'Wait times by service type and location'
    },
    {
      id: 'digital-adoption',
      name: 'Digital Service Adoption Report.xlsx',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Digital Transformation',
      description: 'Online vs in-person service utilization'
    },
    {
      id: 'citizen-feedback',
      name: 'Citizen Satisfaction Survey Results.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Citizen Experience',
      description: 'Comprehensive satisfaction metrics and feedback'
    },
    {
      id: 'resource-allocation',
      name: 'Service Center Staffing Analysis.xlsx',
      size: '4.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Resource Management',
      description: 'Optimal staffing levels by service center'
    },
    {
      id: 'accessibility-report',
      name: 'Service Accessibility Audit.pdf',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'ADA compliance and accessibility metrics'
    },
    {
      id: 'cost-per-transaction',
      name: 'Service Delivery Cost Analysis.xlsx',
      size: '3.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Cost analysis by service channel'
    }
  ],
  'tax-compliance': [
    {
      id: 'compliance-dashboard',
      name: 'Tax Compliance Dashboard.pdf',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Overall tax compliance rates and trends'
    },
    {
      id: 'audit-selection',
      name: 'AI Audit Selection Results.xlsx',
      size: '8.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Audit Management',
      description: 'Risk-based audit candidate identification'
    },
    {
      id: 'revenue-forecast',
      name: 'Tax Revenue Forecast.pdf',
      size: '6.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Revenue Planning',
      description: 'Predicted tax revenue by category'
    },
    {
      id: 'compliance-gaps',
      name: 'Compliance Gap Analysis.xlsx',
      size: '5.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Assessment',
      description: 'Identified compliance gaps and risk areas'
    },
    {
      id: 'taxpayer-behavior',
      name: 'Taxpayer Behavior Patterns.pdf',
      size: '4.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Behavioral Analytics',
      description: 'Filing patterns and compliance predictors'
    },
    {
      id: 'collection-effectiveness',
      name: 'Collection Strategy Performance.xlsx',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Collections',
      description: 'Effectiveness of different collection methods'
    },
    {
      id: 'fraud-detection-tax',
      name: 'Tax Fraud Detection Report.pdf',
      size: '6.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Fraud Prevention',
      description: 'Identified fraudulent returns and patterns'
    },
    {
      id: 'voluntary-compliance',
      name: 'Voluntary Compliance Initiatives.xlsx',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance Strategy',
      description: 'Impact of education and outreach programs'
    }
  ],
  'public-safety': [
    {
      id: 'safety-dashboard',
      name: 'Public Safety Analytics Dashboard.pdf',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Crime statistics and public safety metrics'
    },
    {
      id: 'crime-prediction',
      name: 'Predictive Crime Analysis.xlsx',
      size: '9.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Policing',
      description: 'Crime hotspot predictions and patrol optimization'
    },
    {
      id: 'resource-deployment',
      name: 'Resource Deployment Strategy.pdf',
      size: '6.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Resource Management',
      description: 'Optimal deployment of public safety resources'
    },
    {
      id: 'response-time-analysis',
      name: 'Emergency Response Times.xlsx',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Performance Metrics',
      description: 'Response time analysis by area and incident type'
    },
    {
      id: 'community-policing',
      name: 'Community Engagement Report.pdf',
      size: '4.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Community Relations',
      description: 'Community policing program effectiveness'
    },
    {
      id: 'incident-patterns',
      name: 'Incident Pattern Analysis.xlsx',
      size: '7.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Crime Analysis',
      description: 'Temporal and spatial crime patterns'
    },
    {
      id: 'officer-safety',
      name: 'Officer Safety Metrics.pdf',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Officer Wellness',
      description: 'Officer safety incidents and prevention'
    },
    {
      id: 'budget-allocation',
      name: 'Public Safety Budget Analysis.xlsx',
      size: '5.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Planning',
      description: 'Budget allocation and ROI by program'
    }
  ],
  'infrastructure-monitoring': [
    {
      id: 'infrastructure-dashboard',
      name: 'Infrastructure Health Dashboard.pdf',
      size: '5.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Overall infrastructure condition and maintenance needs'
    },
    {
      id: 'bridge-inspection',
      name: 'Bridge Condition Assessment.xlsx',
      size: '8.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Asset Condition',
      description: 'Detailed bridge inspection results and ratings'
    },
    {
      id: 'pavement-analysis',
      name: 'Pavement Condition Index.pdf',
      size: '7.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Road Maintenance',
      description: 'Road surface conditions and maintenance priorities'
    },
    {
      id: 'predictive-maintenance-infra',
      name: 'Infrastructure Failure Predictions.xlsx',
      size: '6.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'AI-predicted infrastructure failures'
    },
    {
      id: 'utility-monitoring',
      name: 'Utility Infrastructure Report.pdf',
      size: '5.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Utilities',
      description: 'Water, sewer, and utility line conditions'
    },
    {
      id: 'capital-planning',
      name: 'Capital Investment Priorities.xlsx',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Planning',
      description: 'Prioritized infrastructure investment plan'
    },
    {
      id: 'sensor-network',
      name: 'IoT Sensor Network Status.pdf',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Monitoring Systems',
      description: 'Real-time sensor data and system health'
    },
    {
      id: 'climate-resilience',
      name: 'Climate Impact Assessment.xlsx',
      size: '5.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Assessment',
      description: 'Infrastructure vulnerability to climate change'
    }
  ],
  // Additional Energy & Utilities use cases
  'phmsa-compliance': [
    {
      id: 'phmsa-dashboard',
      name: 'PHMSA Compliance Dashboard.pdf',
      size: '5.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Pipeline safety compliance overview and metrics'
    },
    {
      id: 'pipeline-integrity',
      name: 'Pipeline Integrity Management.xlsx',
      size: '8.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Asset Integrity',
      description: 'Comprehensive pipeline integrity assessments'
    },
    {
      id: 'incident-reporting',
      name: 'Incident Reporting Package.zip',
      size: '11.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'PHMSA incident reporting documentation'
    },
    {
      id: 'risk-assessment-pipeline',
      name: 'Pipeline Risk Assessment.pdf',
      size: '6.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: 'High consequence area risk assessments'
    },
    {
      id: 'inspection-records',
      name: 'Inspection Records Summary.xlsx',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Inspections',
      description: 'Pipeline inspection history and findings'
    },
    {
      id: 'operator-qualification',
      name: 'Operator Qualification Report.pdf',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Training',
      description: 'Operator qualification and training compliance'
    },
    {
      id: 'emergency-response-plan',
      name: 'Emergency Response Plan.pdf',
      size: '7.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Emergency Planning',
      description: 'Comprehensive emergency response procedures'
    },
    {
      id: 'compliance-audit-phmsa',
      name: 'PHMSA Audit Readiness Report.xlsx',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Audit',
      description: 'Audit readiness assessment and gap analysis'
    }
  ],
  'methane-detection': [
    {
      id: 'methane-dashboard',
      name: 'Methane Detection Dashboard.pdf',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Real-time methane leak detection overview'
    },
    {
      id: 'leak-detection-map',
      name: 'Leak Detection Geographic Map.pdf',
      size: '9.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Geographic Analysis',
      description: 'Spatial distribution of detected methane leaks'
    },
    {
      id: 'emission-quantification',
      name: 'Emission Quantification Report.xlsx',
      size: '6.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Emissions Analysis',
      description: 'Quantified methane emissions by source'
    },
    {
      id: 'repair-prioritization',
      name: 'Leak Repair Prioritization.pdf',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: 'AI-prioritized repair schedule based on severity'
    },
    {
      id: 'satellite-monitoring',
      name: 'Satellite Monitoring Analysis.xlsx',
      size: '7.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Remote Sensing',
      description: 'Satellite-based methane detection results'
    },
    {
      id: 'regulatory-reporting-methane',
      name: 'EPA Methane Reporting.zip',
      size: '10.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'EPA Subpart W reporting documentation'
    },
    {
      id: 'cost-benefit-methane',
      name: 'Methane Reduction ROI Analysis.pdf',
      size: '3.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Cost-benefit analysis of methane reduction'
    },
    {
      id: 'continuous-monitoring',
      name: 'Continuous Monitoring Report.xlsx',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Monitoring',
      description: 'Real-time sensor network performance'
    }
  ],
  'grid-resilience': [
    {
      id: 'resilience-dashboard',
      name: 'Grid Resilience Dashboard.pdf',
      size: '5.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Grid resilience metrics and outage response'
    },
    {
      id: 'outage-prediction',
      name: 'Outage Prediction Analysis.xlsx',
      size: '8.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'AI-predicted outage risks and locations'
    },
    {
      id: 'restoration-planning',
      name: 'Restoration Priority Plan.pdf',
      size: '6.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Emergency Response',
      description: 'Optimized power restoration strategies'
    },
    {
      id: 'critical-infrastructure',
      name: 'Critical Infrastructure Protection.xlsx',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Infrastructure',
      description: 'Critical facility prioritization and protection'
    },
    {
      id: 'weather-impact-grid',
      name: 'Weather Impact Assessment.pdf',
      size: '7.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Weather Analytics',
      description: 'Weather-related grid vulnerability analysis'
    },
    {
      id: 'microgrid-integration',
      name: 'Microgrid Integration Report.xlsx',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Grid Modernization',
      description: 'Microgrid deployment and integration status'
    },
    {
      id: 'customer-impact',
      name: 'Customer Impact Analysis.pdf',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Customer Service',
      description: 'Outage impact on customers by segment'
    },
    {
      id: 'resilience-investments',
      name: 'Resilience Investment Plan.xlsx',
      size: '5.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Planning',
      description: 'Grid hardening investment priorities'
    }
  ],
  'internal-audit': [
    {
      id: 'audit-dashboard',
      name: 'Internal Audit Dashboard.pdf',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Comprehensive audit findings and governance metrics'
    },
    {
      id: 'risk-assessment-audit',
      name: 'Enterprise Risk Assessment.xlsx',
      size: '7.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: 'Enterprise-wide risk assessment matrix'
    },
    {
      id: 'control-testing',
      name: 'Control Testing Results.pdf',
      size: '5.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Controls',
      description: 'Internal control testing and effectiveness'
    },
    {
      id: 'sox-compliance',
      name: 'SOX Compliance Report.xlsx',
      size: '6.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Sarbanes-Oxley compliance status'
    },
    {
      id: 'audit-recommendations',
      name: 'Audit Recommendations Tracker.pdf',
      size: '4.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Remediation',
      description: 'Audit finding remediation tracking'
    },
    {
      id: 'process-improvement',
      name: 'Process Improvement Analysis.xlsx',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Process Optimization',
      description: 'Identified process improvement opportunities'
    },
    {
      id: 'fraud-risk-assessment',
      name: 'Fraud Risk Assessment.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Fraud Prevention',
      description: 'Enterprise fraud risk evaluation'
    },
    {
      id: 'governance-metrics',
      name: 'Governance Metrics Report.xlsx',
      size: '3.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Governance',
      description: 'Corporate governance effectiveness metrics'
    }
  ],
  'scada-integration': [
    {
      id: 'scada-dashboard',
      name: 'SCADA Integration Dashboard.pdf',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'SCADA system integration and performance'
    },
    {
      id: 'data-quality-scada',
      name: 'SCADA Data Quality Report.xlsx',
      size: '6.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Data Management',
      description: 'Data quality metrics and validation'
    },
    {
      id: 'legacy-system-map',
      name: 'Legacy System Integration Map.pdf',
      size: '7.8 MB',
      timestamp: new Date().toISOString(),
      category: 'System Architecture',
      description: 'Legacy system dependencies and interfaces'
    },
    {
      id: 'real-time-monitoring',
      name: 'Real-Time Monitoring Analytics.xlsx',
      size: '5.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Operations',
      description: 'Real-time operational metrics from SCADA'
    },
    {
      id: 'cybersecurity-scada',
      name: 'SCADA Cybersecurity Assessment.pdf',
      size: '6.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Security',
      description: 'SCADA system security vulnerabilities'
    },
    {
      id: 'performance-optimization',
      name: 'System Performance Optimization.xlsx',
      size: '4.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Performance',
      description: 'SCADA system performance improvements'
    },
    {
      id: 'integration-roadmap',
      name: 'Integration Roadmap.pdf',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Strategic Planning',
      description: 'Future integration plans and timeline'
    },
    {
      id: 'alarm-management',
      name: 'Alarm Management Report.xlsx',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Alarm Systems',
      description: 'Alarm rationalization and optimization'
    }
  ],
  'predictive-resilience': [
    {
      id: 'predictive-resilience-dashboard',
      name: 'Predictive Grid Resilience Dashboard.pdf',
      size: '5.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Predictive grid resilience and orchestration metrics'
    },
    {
      id: 'failure-cascade-analysis',
      name: 'Failure Cascade Prediction.xlsx',
      size: '8.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Analysis',
      description: 'Cascading failure prediction and prevention'
    },
    {
      id: 'grid-orchestration',
      name: 'Grid Orchestration Strategy.pdf',
      size: '6.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Grid Management',
      description: 'Automated grid orchestration strategies'
    },
    {
      id: 'resilience-scoring',
      name: 'Resilience Score Analysis.xlsx',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Resilience Metrics',
      description: 'Grid component resilience scoring'
    },
    {
      id: 'predictive-maintenance-grid',
      name: 'Grid Maintenance Predictions.pdf',
      size: '6.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Maintenance',
      description: 'Predictive maintenance for grid infrastructure'
    },
    {
      id: 'load-balancing',
      name: 'Dynamic Load Balancing Report.xlsx',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Load Management',
      description: 'AI-driven load balancing strategies'
    },
    {
      id: 'contingency-planning',
      name: 'Contingency Planning Analysis.pdf',
      size: '5.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Emergency Planning',
      description: 'Automated contingency response plans'
    },
    {
      id: 'investment-prioritization',
      name: 'Resilience Investment Priorities.xlsx',
      size: '4.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Planning',
      description: 'Prioritized resilience investments'
    }
  ],
  'cyber-defense': [
    {
      id: 'cyber-defense-dashboard',
      name: 'Energy Cyber Defense Dashboard.pdf',
      size: '5.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Supply chain cyber defense overview'
    },
    {
      id: 'threat-intelligence',
      name: 'Threat Intelligence Report.xlsx',
      size: '7.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Threat Analysis',
      description: 'Current cyber threats to energy infrastructure'
    },
    {
      id: 'vulnerability-assessment',
      name: 'Vulnerability Assessment.pdf',
      size: '6.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Security Assessment',
      description: 'Supply chain vulnerability analysis'
    },
    {
      id: 'incident-response-cyber',
      name: 'Cyber Incident Response Plan.xlsx',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Incident Response',
      description: 'Automated incident response procedures'
    },
    {
      id: 'supply-chain-mapping',
      name: 'Supply Chain Security Map.pdf',
      size: '8.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Supply Chain',
      description: 'Critical supply chain dependencies'
    },
    {
      id: 'security-metrics',
      name: 'Cybersecurity Metrics Report.xlsx',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Security Metrics',
      description: 'Key cybersecurity performance indicators'
    },
    {
      id: 'compliance-cyber',
      name: 'NERC CIP Compliance Report.pdf',
      size: '6.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Critical infrastructure protection compliance'
    },
    {
      id: 'security-investment',
      name: 'Cybersecurity Investment Plan.xlsx',
      size: '4.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Planning',
      description: 'Prioritized security investments'
    }
  ],
  'wildfire-prevention': [
    {
      id: 'wildfire-dashboard',
      name: 'Wildfire Prevention Dashboard.pdf',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Wildfire risk and prevention metrics'
    },
    {
      id: 'fire-risk-mapping',
      name: 'Fire Risk Geographic Analysis.xlsx',
      size: '9.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Mapping',
      description: 'High-resolution fire risk mapping'
    },
    {
      id: 'vegetation-management',
      name: 'Vegetation Management Report.pdf',
      size: '6.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Prevention',
      description: 'Vegetation management priorities and schedule'
    },
    {
      id: 'weather-monitoring-fire',
      name: 'Fire Weather Monitoring.xlsx',
      size: '5.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Weather Analysis',
      description: 'Real-time fire weather conditions'
    },
    {
      id: 'infrastructure-hardening',
      name: 'Infrastructure Hardening Plan.pdf',
      size: '7.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Infrastructure',
      description: 'Fire-resistant infrastructure upgrades'
    },
    {
      id: 'psps-analysis',
      name: 'PSPS Event Analysis.xlsx',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Power Shutoffs',
      description: 'Public Safety Power Shutoff analysis'
    },
    {
      id: 'community-impact-fire',
      name: 'Community Impact Assessment.pdf',
      size: '5.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Community Relations',
      description: 'Wildfire prevention impact on communities'
    },
    {
      id: 'mitigation-effectiveness',
      name: 'Mitigation Effectiveness Report.xlsx',
      size: '4.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Effectiveness',
      description: 'Fire prevention measure effectiveness'
    }
  ],
  // Healthcare additional use cases
  'clinical-trial-matching': [
    {
      id: 'trial-matching-dashboard',
      name: 'Clinical Trial Matching Dashboard.pdf',
      size: '4.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Overview of clinical trial matching performance'
    },
    {
      id: 'patient-trial-matches',
      name: 'Patient-Trial Match Analysis.xlsx',
      size: '7.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Patient Recruitment',
      description: 'AI-matched patients for active clinical trials'
    },
    {
      id: 'eligibility-criteria',
      name: 'Eligibility Criteria Analysis.pdf',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Trial Design',
      description: 'Complex eligibility criteria matching'
    },
    {
      id: 'recruitment-predictions',
      name: 'Recruitment Timeline Predictions.xlsx',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'Predicted recruitment timelines by trial'
    },
    {
      id: 'diversity-metrics',
      name: 'Trial Diversity Report.pdf',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Diversity & Inclusion',
      description: 'Patient diversity in clinical trials'
    },
    {
      id: 'site-recommendations',
      name: 'Trial Site Recommendations.xlsx',
      size: '5.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Site Selection',
      description: 'Optimal trial site selection analysis'
    },
    {
      id: 'patient-retention',
      name: 'Patient Retention Analysis.pdf',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Patient Engagement',
      description: 'Strategies for improving trial retention'
    },
    {
      id: 'matching-accuracy',
      name: 'Matching Algorithm Performance.xlsx',
      size: '3.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Algorithm Performance',
      description: 'Trial matching algorithm accuracy metrics'
    }
  ],
  'treatment-recommendation': [
    {
      id: 'treatment-dashboard',
      name: 'Treatment Recommendation Dashboard.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'AI-powered treatment recommendation overview'
    },
    {
      id: 'evidence-based-treatments',
      name: 'Evidence-Based Treatment Analysis.xlsx',
      size: '7.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Clinical Evidence',
      description: 'Treatment effectiveness based on clinical evidence'
    },
    {
      id: 'personalized-medicine',
      name: 'Personalized Medicine Report.pdf',
      size: '5.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Precision Medicine',
      description: 'Genomic-based treatment recommendations'
    },
    {
      id: 'drug-interactions',
      name: 'Drug Interaction Analysis.xlsx',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Medication Safety',
      description: 'Potential drug interactions and contraindications'
    },
    {
      id: 'treatment-outcomes',
      name: 'Treatment Outcome Predictions.pdf',
      size: '6.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Outcomes Analysis',
      description: 'Predicted treatment outcomes by patient profile'
    },
    {
      id: 'clinical-guidelines',
      name: 'Clinical Guideline Compliance.xlsx',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Quality Assurance',
      description: 'Adherence to clinical practice guidelines'
    },
    {
      id: 'cost-effectiveness',
      name: 'Treatment Cost-Effectiveness.pdf',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Cost-benefit analysis of treatment options'
    },
    {
      id: 'patient-preferences',
      name: 'Patient Preference Integration.xlsx',
      size: '3.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Patient-Centered Care',
      description: 'Treatment recommendations with patient preferences'
    }
  ],
  'diagnosis-assistant': [
    {
      id: 'diagnosis-dashboard',
      name: 'Diagnosis Assistant Dashboard.pdf',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'AI-assisted diagnosis performance metrics'
    },
    {
      id: 'differential-diagnosis',
      name: 'Differential Diagnosis Analysis.xlsx',
      size: '8.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Clinical Analysis',
      description: 'Ranked differential diagnoses with probabilities'
    },
    {
      id: 'diagnostic-accuracy',
      name: 'Diagnostic Accuracy Report.pdf',
      size: '4.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Quality Metrics',
      description: 'AI diagnostic accuracy compared to clinicians'
    },
    {
      id: 'rare-disease-detection',
      name: 'Rare Disease Detection.xlsx',
      size: '6.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Specialized Diagnostics',
      description: 'Identification of rare and complex conditions'
    },
    {
      id: 'imaging-analysis',
      name: 'Medical Imaging Analysis.pdf',
      size: '9.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Radiology',
      description: 'AI-powered medical imaging interpretations'
    },
    {
      id: 'lab-result-integration',
      name: 'Lab Result Integration Report.xlsx',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Laboratory Medicine',
      description: 'Integrated lab results with diagnostic insights'
    },
    {
      id: 'clinical-decision-support',
      name: 'Clinical Decision Support.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Decision Support',
      description: 'Evidence-based diagnostic recommendations'
    },
    {
      id: 'diagnostic-pathways',
      name: 'Diagnostic Pathway Optimization.xlsx',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Process Improvement',
      description: 'Optimized diagnostic testing sequences'
    }
  ],
  'medical-supply-chain': [
    {
      id: 'supply-chain-dashboard',
      name: 'Medical Supply Chain Dashboard.pdf',
      size: '5.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Medical supply chain and crisis orchestration'
    },
    {
      id: 'inventory-levels',
      name: 'Critical Supply Inventory.xlsx',
      size: '7.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Inventory Management',
      description: 'Real-time critical medical supply levels'
    },
    {
      id: 'demand-surge-prediction',
      name: 'Demand Surge Predictions.pdf',
      size: '6.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'Predicted supply demand during crisis events'
    },
    {
      id: 'supplier-network',
      name: 'Supplier Network Analysis.xlsx',
      size: '5.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Supplier Management',
      description: 'Medical supplier network resilience'
    },
    {
      id: 'distribution-optimization',
      name: 'Distribution Network Optimization.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Logistics',
      description: 'Optimized medical supply distribution'
    },
    {
      id: 'shortage-mitigation',
      name: 'Shortage Mitigation Strategies.xlsx',
      size: '4.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Management',
      description: 'Strategies for managing supply shortages'
    },
    {
      id: 'quality-assurance-supply',
      name: 'Supply Quality Assurance.pdf',
      size: '5.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Quality Control',
      description: 'Medical supply quality tracking'
    },
    {
      id: 'crisis-response-plan',
      name: 'Crisis Response Playbook.xlsx',
      size: '6.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Emergency Planning',
      description: 'Automated crisis response procedures'
    }
  ],
  // Financial Services additional use cases
  'ai-credit-scoring': [
    {
      id: 'credit-scoring-dashboard',
      name: 'AI Credit Scoring Dashboard.pdf',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'AI-powered credit scoring overview'
    },
    {
      id: 'credit-score-distribution',
      name: 'Credit Score Distribution Analysis.xlsx',
      size: '7.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Analytics',
      description: 'Portfolio credit score distribution'
    },
    {
      id: 'alternative-data',
      name: 'Alternative Data Impact Report.pdf',
      size: '5.6 MB',
      timestamp: new Date().toISOString(),
      category: 'Data Analytics',
      description: 'Impact of alternative data on credit scoring'
    },
    {
      id: 'model-performance',
      name: 'Scoring Model Performance.xlsx',
      size: '6.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Model Validation',
      description: 'Credit scoring model accuracy metrics'
    },
    {
      id: 'bias-analysis',
      name: 'Fairness & Bias Analysis.pdf',
      size: '4.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'Model fairness and bias assessment'
    },
    {
      id: 'score-migration',
      name: 'Score Migration Analysis.xlsx',
      size: '5.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Portfolio Analysis',
      description: 'Credit score migration patterns'
    },
    {
      id: 'regulatory-compliance-scoring',
      name: 'FCRA Compliance Report.pdf',
      size: '6.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Regulatory',
      description: 'Fair Credit Reporting Act compliance'
    },
    {
      id: 'profitability-analysis',
      name: 'Score-Based Profitability.xlsx',
      size: '4.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Financial Analysis',
      description: 'Profitability by credit score segment'
    }
  ],
  'aml-monitoring': [
    {
      id: 'aml-dashboard',
      name: 'AML Monitoring Dashboard.pdf',
      size: '5.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Anti-money laundering monitoring overview'
    },
    {
      id: 'transaction-monitoring',
      name: 'Suspicious Transaction Monitoring.xlsx',
      size: '9.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Transaction Analysis',
      description: 'Real-time transaction monitoring alerts'
    },
    {
      id: 'customer-risk-profiling',
      name: 'Customer Risk Profiles.pdf',
      size: '6.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Risk Assessment',
      description: 'KYC and customer risk categorization'
    },
    {
      id: 'sar-generation',
      name: 'SAR Generation Package.zip',
      size: '11.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Regulatory Reporting',
      description: 'Automated suspicious activity reports'
    },
    {
      id: 'sanctions-screening',
      name: 'Sanctions Screening Report.xlsx',
      size: '5.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Compliance',
      description: 'OFAC and international sanctions screening'
    },
    {
      id: 'network-analysis',
      name: 'Transaction Network Analysis.pdf',
      size: '7.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Advanced Analytics',
      description: 'Complex transaction network patterns'
    },
    {
      id: 'regulatory-updates',
      name: 'Regulatory Compliance Updates.xlsx',
      size: '3.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Regulatory',
      description: 'Latest AML regulatory requirements'
    },
    {
      id: 'investigation-support',
      name: 'Investigation Support Package.pdf',
      size: '6.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Investigations',
      description: 'Enhanced due diligence and investigation tools'
    }
  ],
  'insurance-risk': [
    {
      id: 'insurance-risk-dashboard',
      name: 'Insurance Risk Assessment Dashboard.pdf',
      size: '5.1 MB',
      timestamp: new Date().toISOString(),
      category: 'Executive Reports',
      description: 'Comprehensive insurance risk overview'
    },
    {
      id: 'underwriting-analysis',
      name: 'AI Underwriting Analysis.xlsx',
      size: '8.4 MB',
      timestamp: new Date().toISOString(),
      category: 'Underwriting',
      description: 'Automated underwriting decisions and risk scores'
    },
    {
      id: 'catastrophe-modeling',
      name: 'Catastrophe Risk Modeling.pdf',
      size: '7.3 MB',
      timestamp: new Date().toISOString(),
      category: 'Cat Modeling',
      description: 'Natural disaster risk assessment'
    },
    {
      id: 'pricing-optimization-insurance',
      name: 'Risk-Based Pricing Analysis.xlsx',
      size: '5.9 MB',
      timestamp: new Date().toISOString(),
      category: 'Pricing',
      description: 'Optimized insurance pricing by risk'
    },
    {
      id: 'claims-prediction',
      name: 'Claims Frequency Prediction.pdf',
      size: '4.7 MB',
      timestamp: new Date().toISOString(),
      category: 'Predictive Analytics',
      description: 'Predicted claims frequency and severity'
    },
    {
      id: 'portfolio-risk',
      name: 'Portfolio Risk Assessment.xlsx',
      size: '6.5 MB',
      timestamp: new Date().toISOString(),
      category: 'Portfolio Management',
      description: 'Overall portfolio risk metrics'
    },
    {
      id: 'reinsurance-optimization',
      name: 'Reinsurance Strategy Report.pdf',
      size: '5.2 MB',
      timestamp: new Date().toISOString(),
      category: 'Reinsurance',
      description: 'Optimal reinsurance structure analysis'
    },
    {
      id: 'regulatory-capital',
      name: 'Solvency Capital Requirements.xlsx',
      size: '4.8 MB',
      timestamp: new Date().toISOString(),
      category: 'Regulatory',
      description: 'Regulatory capital adequacy analysis'
    }
  ]
});

// Helper function to get reports for a use case
export function getUseCaseReports(useCaseId: string): GenericReport[] {
  return USE_CASE_REPORTS[useCaseId] || DEFAULT_REPORTS;
}

// API functions
export const genericReportsService = {
  async getReports(useCaseId: string): Promise<GenericReport[]> {
    try {
      // Map frontend use case IDs to backend expected IDs
      const useCaseMapping: { [key: string]: string } = {
        'oilfield-lease': 'oilfield-land-lease',
        'oilfield': 'oilfield-land-lease'
      };
      
      const mappedUseCaseId = useCaseMapping[useCaseId] || useCaseId;
      
      // Try to fetch from API first
      try {
        const response = await api.get(`/unified-reports/use-cases/${mappedUseCaseId}/reports`);
        
        if (response.data?.success && response.data?.data) {
          // Transform API response to match GenericReport interface
          return response.data.data.reports.map((report: any) => ({
            id: report.id,
            name: report.name,
            size: '0 MB', // Size not provided by API
            timestamp: new Date().toISOString(),
            category: 'Reports',
            description: report.description,
            reportType: report.id,
            format: report.format,
            downloadUrl: report.downloadUrl // Store the download URL from API
          }));
        }
      } catch (apiError) {
        console.warn('API call failed, falling back to mock data:', apiError);
      }
      
      // Fall back to mock data if API fails
      return getUseCaseReports(useCaseId);
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  async downloadReport(reportId: string, reportName?: string, downloadUrl?: string): Promise<void> {
    try {
      // Use the download URL if provided, otherwise construct it
      let url: string;
      if (downloadUrl) {
        url = downloadUrl;
      } else {
        // Fallback: construct the download URL
        const filename = reportName || `${reportId}.pdf`;
        url = `/reports/${filename}`;
      }
      
      const link = document.createElement('a');
      link.href = `${api.defaults.baseURL}${url}`;
      link.setAttribute('download', reportName || `report-${reportId}`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  },

  async generateReport(useCaseId: string, reportType: string): Promise<ReportMetadata> {
    try {
      // Map frontend use case IDs to backend expected IDs
      const useCaseMapping: { [key: string]: string } = {
        'oilfield-lease': 'oilfield-land-lease',
        'oilfield': 'oilfield-land-lease'
      };
      
      const mappedUseCaseId = useCaseMapping[useCaseId] || useCaseId;
      
      const response = await api.post(`/unified-reports/use-cases/${mappedUseCaseId}/reports/${reportType}/generate`, {
        parameters: {}
      });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  async generateAllReports(useCaseId: string): Promise<void> {
    try {
      // Map frontend use case IDs to backend expected IDs
      const useCaseMapping: { [key: string]: string } = {
        'oilfield-lease': 'oilfield-land-lease',
        'oilfield': 'oilfield-land-lease'
      };
      
      const mappedUseCaseId = useCaseMapping[useCaseId] || useCaseId;
      
      await api.post(`/unified-reports/use-cases/${mappedUseCaseId}/generate-all`);
    } catch (error) {
      console.error('Error generating all reports:', error);
      throw error;
    }
  }
};