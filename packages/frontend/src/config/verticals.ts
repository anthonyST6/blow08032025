// Vertical (Industry) Configuration System
import {
  BoltIcon,
  HeartIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  TruckIcon,
  AcademicCapIcon,
  BeakerIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

export interface VerticalModule {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgGradient: string;
  features: string[];
  useCases: UseCase[];
  regulations: string[];
  aiAgents: string[];
  templates: string[];
  metrics: MetricConfig[];
  dashboardWidgets: string[];
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: string;
  siaScores: {
    security: number;
    integrity: number;
    accuracy: number;
  };
}

export interface MetricConfig {
  id: string;
  name: string;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  visualization: 'gauge' | 'line' | 'bar' | 'pie';
}

export const verticals: Record<string, VerticalModule> = {
  energy: {
    id: 'energy',
    name: 'Energy & Utilities',
    description: 'AI governance for power generation, distribution, and smart grid management',
    icon: BoltIcon,
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-900/20 to-orange-900/20',
    features: [
      'Grid Optimization',
      'Demand Forecasting',
      'Renewable Integration',
      'Outage Prediction',
      'Energy Trading',
    ],
    useCases: [
      {
        id: 'oilfield-land-lease',
        name: 'Oilfield Land Lease',
        description: 'Manage O&G well leases, royalties, and mineral rights with AI-driven insights',
        complexity: 'high',
        estimatedTime: '3-4 weeks',
        siaScores: { security: 92, integrity: 94, accuracy: 91 },
      },
      {
        id: 'grid-anomaly',
        name: 'Grid Anomaly Detection',
        description: 'Detect and prevent grid failures using real-time monitoring',
        complexity: 'high',
        estimatedTime: '4-6 weeks',
        siaScores: { security: 92, integrity: 88, accuracy: 85 },
      },
      {
        id: 'renewable-optimization',
        name: 'Renewable Energy Optimization',
        description: 'Optimize renewable energy sources integration',
        complexity: 'high',
        estimatedTime: '3-4 weeks',
        siaScores: { security: 80, integrity: 85, accuracy: 90 },
      },
      {
        id: 'load-forecasting',
        name: 'Load Forecasting',
        description: 'Predict energy demand using weather and consumption patterns',
        complexity: 'medium',
        estimatedTime: '2-3 weeks',
        siaScores: { security: 82, integrity: 88, accuracy: 92 },
      },
      {
        id: 'phmsa-compliance',
        name: 'PHMSA Compliance Automation',
        description: 'Automated pipeline safety compliance and regulatory reporting',
        complexity: 'high',
        estimatedTime: '4-6 weeks',
        siaScores: { security: 94, integrity: 96, accuracy: 93 },
      },
      {
        id: 'methane-leak-detection',
        name: 'Methane Leak Detection',
        description: 'AI-powered emissions monitoring and environmental compliance',
        complexity: 'high',
        estimatedTime: '5-7 weeks',
        siaScores: { security: 88, integrity: 92, accuracy: 95 },
      },
      {
        id: 'grid-resilience',
        name: 'Grid Resilience & Outage Response',
        description: 'Predictive outage management and emergency response coordination',
        complexity: 'high',
        estimatedTime: '6-8 weeks',
        siaScores: { security: 91, integrity: 94, accuracy: 89 },
      },
      {
        id: 'internal-audit-governance',
        name: 'Internal Audit and Governance',
        description: 'Automated SOX compliance and risk governance for energy operations',
        complexity: 'medium',
        estimatedTime: '3-5 weeks',
        siaScores: { security: 96, integrity: 98, accuracy: 91 },
      },
      {
        id: 'scada-integration',
        name: 'SCADA-Legacy Integration',
        description: 'AI enablement for legacy SCADA and telemetry systems',
        complexity: 'high',
        estimatedTime: '8-10 weeks',
        siaScores: { security: 93, integrity: 90, accuracy: 87 },
      },
      {
        id: 'wildfire-prevention',
        name: 'Wildfire Prevention & Infrastructure Risk',
        description: 'AI-driven infrastructure monitoring and risk assessment to prevent catastrophic wildfires',
        complexity: 'high',
        estimatedTime: '6-8 weeks',
        siaScores: { security: 94, integrity: 96, accuracy: 92 },
      },
      {
        id: 'predictive-grid-resilience',
        name: 'Predictive Grid Resilience & Orchestration',
        description: 'Proactive grid management preventing wide-scale outages through real-time orchestration',
        complexity: 'high',
        estimatedTime: '8-10 weeks',
        siaScores: { security: 95, integrity: 97, accuracy: 93 },
      },
      {
        id: 'energy-supply-chain-cyber',
        name: 'Energy Supply Chain Cyber Defense',
        description: 'Comprehensive cyber defense for critical energy infrastructure and supply chains',
        complexity: 'high',
        estimatedTime: '10-12 weeks',
        siaScores: { security: 98, integrity: 96, accuracy: 91 },
      },
    ],
    regulations: ['NERC CIP', 'FERC', 'ISO Standards', 'EPA Guidelines', 'PHMSA'],
    aiAgents: ['GridOptimizer', 'DemandPredictor', 'AnomalyDetector', 'RenewableBalancer'],
    templates: ['energy-forecast', 'grid-monitor', 'outage-response'],
    metrics: [
      {
        id: 'grid-reliability',
        name: 'Grid Reliability',
        unit: '%',
        threshold: { warning: 95, critical: 90 },
        visualization: 'gauge',
      },
      {
        id: 'renewable-mix',
        name: 'Renewable Mix',
        unit: '%',
        threshold: { warning: 30, critical: 20 },
        visualization: 'pie',
      },
    ],
    dashboardWidgets: ['grid-status', 'demand-forecast', 'renewable-mix', 'outage-map'],
  },
  
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    description: 'AI governance for patient care, diagnostics, and medical research',
    icon: HeartIcon,
    color: 'text-red-500',
    bgGradient: 'from-red-900/20 to-pink-900/20',
    features: [
      'Clinical Decision Support',
      'Patient Risk Assessment',
      'Drug Discovery',
      'Medical Imaging Analysis',
      'Treatment Optimization',
    ],
    useCases: [
      {
        id: 'patient-risk',
        name: 'Patient Risk Stratification',
        description: 'Identify high-risk patients for preventive care',
        complexity: 'high',
        estimatedTime: '6-8 weeks',
        siaScores: { security: 95, integrity: 92, accuracy: 87 },
      },
      {
        id: 'diagnosis-assist',
        name: 'Diagnosis Assistant',
        description: 'AI-powered diagnostic support for clinicians',
        complexity: 'high',
        estimatedTime: '8-10 weeks',
        siaScores: { security: 90, integrity: 95, accuracy: 89 },
      },
      {
        id: 'treatment-recommend',
        name: 'Treatment Recommendation',
        description: 'Personalized treatment plans based on patient data',
        complexity: 'medium',
        estimatedTime: '4-5 weeks',
        siaScores: { security: 88, integrity: 90, accuracy: 85 },
      },
      {
        id: 'clinical-trial-matching',
        name: 'Clinical Trial Matching',
        description: 'AI-powered patient matching for clinical trials to accelerate enrollment',
        complexity: 'high',
        estimatedTime: '6-8 weeks',
        siaScores: { security: 93, integrity: 95, accuracy: 91 },
      },
      {
        id: 'medical-supply-chain-crisis',
        name: 'Medical Supply Chain & Crisis Orchestration',
        description: 'Real-time orchestration of medical supplies during healthcare crises',
        complexity: 'high',
        estimatedTime: '8-10 weeks',
        siaScores: { security: 96, integrity: 98, accuracy: 94 },
      },
    ],
    regulations: ['HIPAA', 'FDA 21 CFR', 'GDPR', 'HL7 FHIR'],
    aiAgents: ['DiagnosticAssistant', 'RiskAnalyzer', 'TreatmentOptimizer', 'ComplianceMonitor'],
    templates: ['clinical-decision', 'patient-risk', 'drug-interaction'],
    metrics: [
      {
        id: 'diagnostic-accuracy',
        name: 'Diagnostic Accuracy',
        unit: '%',
        threshold: { warning: 85, critical: 80 },
        visualization: 'gauge',
      },
      {
        id: 'patient-outcomes',
        name: 'Patient Outcomes',
        unit: 'score',
        threshold: { warning: 7, critical: 5 },
        visualization: 'line',
      },
    ],
    dashboardWidgets: ['patient-monitor', 'diagnostic-queue', 'compliance-status', 'outcome-trends'],
  },
  
  finance: {
    id: 'finance',
    name: 'Financial Services',
    description: 'AI governance for banking, trading, and financial risk management',
    icon: BanknotesIcon,
    color: 'text-green-500',
    bgGradient: 'from-green-900/20 to-emerald-900/20',
    features: [
      'Fraud Detection',
      'Credit Risk Assessment',
      'Algorithmic Trading',
      'AML Compliance',
      'Portfolio Optimization',
    ],
    useCases: [
      {
        id: 'fraud-detection',
        name: 'Real-time Fraud Detection',
        description: 'Detect fraudulent transactions using pattern analysis',
        complexity: 'high',
        estimatedTime: '4-6 weeks',
        siaScores: { security: 93, integrity: 91, accuracy: 88 },
      },
      {
        id: 'credit-scoring',
        name: 'AI Credit Scoring',
        description: 'Advanced credit risk assessment models',
        complexity: 'medium',
        estimatedTime: '3-4 weeks',
        siaScores: { security: 85, integrity: 88, accuracy: 90 },
      },
      {
        id: 'aml-monitoring',
        name: 'AML Transaction Monitoring',
        description: 'Anti-money laundering compliance monitoring',
        complexity: 'high',
        estimatedTime: '5-7 weeks',
        siaScores: { security: 95, integrity: 93, accuracy: 86 },
      },
      {
        id: 'insurance-risk-assessment',
        name: 'Insurance Risk Assessment',
        description: 'AI-powered risk evaluation and underwriting for specialty insurance markets',
        complexity: 'high',
        estimatedTime: '6-8 weeks',
        siaScores: { security: 91, integrity: 93, accuracy: 89 },
      },
    ],
    regulations: ['SOX', 'Basel III', 'MiFID II', 'PCI DSS', 'GDPR'],
    aiAgents: ['FraudDetector', 'RiskAnalyzer', 'ComplianceChecker', 'TradingOptimizer'],
    templates: ['fraud-detection', 'credit-risk', 'aml-screening'],
    metrics: [
      {
        id: 'fraud-rate',
        name: 'Fraud Detection Rate',
        unit: '%',
        threshold: { warning: 95, critical: 90 },
        visualization: 'gauge',
      },
      {
        id: 'false-positives',
        name: 'False Positive Rate',
        unit: '%',
        threshold: { warning: 5, critical: 10 },
        visualization: 'bar',
      },
    ],
    dashboardWidgets: ['fraud-alerts', 'risk-dashboard', 'compliance-monitor', 'transaction-flow'],
  },
  
  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing & Industry 4.0',
    description: 'AI governance for smart factories and supply chain optimization',
    icon: BuildingOfficeIcon,
    color: 'text-blue-500',
    bgGradient: 'from-blue-900/20 to-indigo-900/20',
    features: [
      'Predictive Maintenance',
      'Quality Control',
      'Supply Chain Optimization',
      'Production Planning',
      'Defect Detection',
    ],
    useCases: [
      {
        id: 'predictive-maintenance',
        name: 'Predictive Maintenance',
        description: 'Predict equipment failures before they occur',
        complexity: 'medium',
        estimatedTime: '3-4 weeks',
        siaScores: { security: 82, integrity: 88, accuracy: 91 },
      },
      {
        id: 'quality-inspection',
        name: 'Automated Quality Inspection',
        description: 'Computer vision for defect detection',
        complexity: 'medium',
        estimatedTime: '4-5 weeks',
        siaScores: { security: 78, integrity: 85, accuracy: 93 },
      },
      {
        id: 'supply-optimization',
        name: 'Supply Chain Optimization',
        description: 'Optimize inventory and logistics using AI',
        complexity: 'high',
        estimatedTime: '6-8 weeks',
        siaScores: { security: 85, integrity: 87, accuracy: 89 },
      },
    ],
    regulations: ['ISO 9001', 'ISO 27001', 'OSHA', 'EPA Standards'],
    aiAgents: ['MaintenancePredictor', 'QualityInspector', 'SupplyOptimizer', 'ProductionPlanner'],
    templates: ['maintenance-schedule', 'quality-control', 'supply-chain'],
    metrics: [
      {
        id: 'oee',
        name: 'Overall Equipment Effectiveness',
        unit: '%',
        threshold: { warning: 85, critical: 75 },
        visualization: 'gauge',
      },
      {
        id: 'defect-rate',
        name: 'Defect Rate',
        unit: 'ppm',
        threshold: { warning: 100, critical: 500 },
        visualization: 'line',
      },
    ],
    dashboardWidgets: ['production-monitor', 'quality-metrics', 'maintenance-schedule', 'supply-status'],
  },
  
  retail: {
    id: 'retail',
    name: 'Retail & E-commerce',
    description: 'AI governance for customer experience and retail operations',
    icon: ShoppingCartIcon,
    color: 'text-purple-500',
    bgGradient: 'from-purple-900/20 to-pink-900/20',
    features: [
      'Demand Forecasting',
      'Personalization',
      'Inventory Optimization',
      'Price Optimization',
      'Customer Analytics',
    ],
    useCases: [
      {
        id: 'demand-forecast',
        name: 'Demand Forecasting',
        description: 'Predict product demand using historical data',
        complexity: 'medium',
        estimatedTime: '3-4 weeks',
        siaScores: { security: 75, integrity: 82, accuracy: 88 },
      },
      {
        id: 'personalization',
        name: 'Customer Personalization',
        description: 'Personalized recommendations and experiences',
        complexity: 'medium',
        estimatedTime: '4-5 weeks',
        siaScores: { security: 80, integrity: 85, accuracy: 87 },
      },
      {
        id: 'price-optimization',
        name: 'Dynamic Price Optimization',
        description: 'AI-driven pricing strategies',
        complexity: 'high',
        estimatedTime: '5-6 weeks',
        siaScores: { security: 78, integrity: 83, accuracy: 90 },
      },
    ],
    regulations: ['PCI DSS', 'GDPR', 'CCPA', 'FTC Guidelines'],
    aiAgents: ['DemandForecaster', 'PersonalizationEngine', 'PriceOptimizer', 'CustomerAnalyzer'],
    templates: ['demand-forecast', 'recommendation', 'price-strategy'],
    metrics: [
      {
        id: 'conversion-rate',
        name: 'Conversion Rate',
        unit: '%',
        threshold: { warning: 3, critical: 2 },
        visualization: 'gauge',
      },
      {
        id: 'inventory-turnover',
        name: 'Inventory Turnover',
        unit: 'ratio',
        threshold: { warning: 6, critical: 4 },
        visualization: 'bar',
      },
    ],
    dashboardWidgets: ['sales-monitor', 'inventory-status', 'customer-insights', 'price-analytics'],
  },
  
  logistics: {
    id: 'logistics',
    name: 'Logistics & Transportation',
    description: 'AI governance for supply chain and transportation management',
    icon: TruckIcon,
    color: 'text-orange-500',
    bgGradient: 'from-orange-900/20 to-amber-900/20',
    features: [
      'Route Optimization',
      'Fleet Management',
      'Warehouse Automation',
      'Last-Mile Delivery',
      'Cargo Tracking',
    ],
    useCases: [
      {
        id: 'route-optimization',
        name: 'Dynamic Route Optimization',
        description: 'Optimize delivery routes in real-time',
        complexity: 'medium',
        estimatedTime: '3-4 weeks',
        siaScores: { security: 78, integrity: 85, accuracy: 92 },
      },
      {
        id: 'fleet-management',
        name: 'Predictive Fleet Maintenance',
        description: 'Predict vehicle maintenance needs',
        complexity: 'medium',
        estimatedTime: '4-5 weeks',
        siaScores: { security: 80, integrity: 87, accuracy: 89 },
      },
      {
        id: 'warehouse-automation',
        name: 'Warehouse Automation',
        description: 'AI-powered warehouse operations',
        complexity: 'high',
        estimatedTime: '6-8 weeks',
        siaScores: { security: 82, integrity: 88, accuracy: 91 },
      },
      {
        id: 'supply-chain-disruption',
        name: 'Supply Chain Disruption Orchestration',
        description: 'Real-time orchestration for supply chain crisis management',
        complexity: 'high',
        estimatedTime: '8-10 weeks',
        siaScores: { security: 91, integrity: 94, accuracy: 90 },
      },
    ],
    regulations: ['DOT', 'FMCSA', 'IATA', 'ISO 28000'],
    aiAgents: ['RouteOptimizer', 'FleetManager', 'WarehouseController', 'DeliveryPredictor'],
    templates: ['route-planning', 'fleet-maintenance', 'warehouse-ops'],
    metrics: [
      {
        id: 'on-time-delivery',
        name: 'On-Time Delivery',
        unit: '%',
        threshold: { warning: 95, critical: 90 },
        visualization: 'gauge',
      },
      {
        id: 'fuel-efficiency',
        name: 'Fuel Efficiency',
        unit: 'mpg',
        threshold: { warning: 7, critical: 6 },
        visualization: 'line',
      },
    ],
    dashboardWidgets: ['fleet-tracker', 'route-monitor', 'delivery-status', 'warehouse-metrics'],
  },
  
  education: {
    id: 'education',
    name: 'Education & EdTech',
    description: 'AI governance for personalized learning and educational analytics',
    icon: AcademicCapIcon,
    color: 'text-indigo-500',
    bgGradient: 'from-indigo-900/20 to-blue-900/20',
    features: [
      'Personalized Learning',
      'Student Performance Prediction',
      'Content Recommendation',
      'Automated Grading',
      'Learning Analytics',
    ],
    useCases: [
      {
        id: 'personalized-learning',
        name: 'Adaptive Learning Paths',
        description: 'Create personalized learning experiences',
        complexity: 'medium',
        estimatedTime: '4-5 weeks',
        siaScores: { security: 82, integrity: 88, accuracy: 86 },
      },
      {
        id: 'performance-prediction',
        name: 'Student Performance Prediction',
        description: 'Predict and prevent student dropouts',
        complexity: 'medium',
        estimatedTime: '3-4 weeks',
        siaScores: { security: 85, integrity: 90, accuracy: 84 },
      },
      {
        id: 'content-recommendation',
        name: 'Smart Content Recommendation',
        description: 'AI-powered educational content suggestions',
        complexity: 'low',
        estimatedTime: '2-3 weeks',
        siaScores: { security: 78, integrity: 85, accuracy: 88 },
      },
    ],
    regulations: ['FERPA', 'COPPA', 'GDPR', 'State Education Standards'],
    aiAgents: ['LearningOptimizer', 'PerformanceAnalyzer', 'ContentRecommender', 'GradingAssistant'],
    templates: ['learning-path', 'performance-analysis', 'content-curation'],
    metrics: [
      {
        id: 'engagement-rate',
        name: 'Student Engagement',
        unit: '%',
        threshold: { warning: 80, critical: 70 },
        visualization: 'gauge',
      },
      {
        id: 'completion-rate',
        name: 'Course Completion',
        unit: '%',
        threshold: { warning: 85, critical: 75 },
        visualization: 'bar',
      },
    ],
    dashboardWidgets: ['student-progress', 'engagement-metrics', 'performance-trends', 'content-analytics'],
  },
  
  pharma: {
    id: 'pharma',
    name: 'Pharmaceutical & Biotech',
    description: 'AI governance for drug discovery and clinical trials',
    icon: BeakerIcon,
    color: 'text-teal-500',
    bgGradient: 'from-teal-900/20 to-cyan-900/20',
    features: [
      'Drug Discovery',
      'Clinical Trial Optimization',
      'Adverse Event Detection',
      'Regulatory Compliance',
      'Patient Recruitment',
    ],
    useCases: [
      {
        id: 'drug-discovery',
        name: 'AI-Assisted Drug Discovery',
        description: 'Accelerate drug discovery using AI models',
        complexity: 'high',
        estimatedTime: '12-16 weeks',
        siaScores: { security: 88, integrity: 92, accuracy: 85 },
      },
      {
        id: 'clinical-optimization',
        name: 'Clinical Trial Optimization',
        description: 'Optimize patient recruitment and trial design',
        complexity: 'high',
        estimatedTime: '8-10 weeks',
        siaScores: { security: 90, integrity: 93, accuracy: 87 },
      },
      {
        id: 'adverse-detection',
        name: 'Adverse Event Detection',
        description: 'Early detection of drug side effects',
        complexity: 'medium',
        estimatedTime: '4-6 weeks',
        siaScores: { security: 92, integrity: 95, accuracy: 88 },
      },
    ],
    regulations: ['FDA 21 CFR Part 11', 'GxP', 'ICH Guidelines', 'EMA Regulations'],
    aiAgents: ['MoleculeAnalyzer', 'TrialOptimizer', 'SafetyMonitor', 'RegulatoryChecker'],
    templates: ['drug-discovery', 'clinical-trial', 'safety-monitoring'],
    metrics: [
      {
        id: 'trial-success',
        name: 'Trial Success Rate',
        unit: '%',
        threshold: { warning: 70, critical: 60 },
        visualization: 'gauge',
      },
      {
        id: 'time-to-market',
        name: 'Time to Market',
        unit: 'months',
        threshold: { warning: 120, critical: 144 },
        visualization: 'bar',
      },
    ],
    dashboardWidgets: ['trial-monitor', 'safety-alerts', 'regulatory-status', 'discovery-pipeline'],
  },
  
  government: {
    id: 'government',
    name: 'Government & Public Sector',
    description: 'AI governance for public services and citizen engagement',
    icon: ShieldCheckIcon,
    color: 'text-gray-500',
    bgGradient: 'from-gray-900/20 to-slate-900/20',
    features: [
      'Citizen Services',
      'Public Safety',
      'Resource Allocation',
      'Policy Analysis',
      'Fraud Prevention',
    ],
    useCases: [
      {
        id: 'citizen-services',
        name: 'Smart Citizen Services',
        description: 'AI-powered government service delivery',
        complexity: 'medium',
        estimatedTime: '6-8 weeks',
        siaScores: { security: 92, integrity: 94, accuracy: 86 },
      },
      {
        id: 'public-safety',
        name: 'Public Safety Analytics',
        description: 'Predictive analytics for public safety',
        complexity: 'high',
        estimatedTime: '8-10 weeks',
        siaScores: { security: 95, integrity: 93, accuracy: 84 },
      },
      {
        id: 'resource-optimization',
        name: 'Resource Optimization',
        description: 'Optimize public resource allocation',
        complexity: 'medium',
        estimatedTime: '5-6 weeks',
        siaScores: { security: 88, integrity: 90, accuracy: 87 },
      },
      {
        id: 'emergency-response-orchestration',
        name: 'Coordinated Emergency Response Orchestration',
        description: 'AI-driven multi-agency coordination for disaster response',
        complexity: 'high',
        estimatedTime: '10-12 weeks',
        siaScores: { security: 97, integrity: 95, accuracy: 92 },
      },
      {
        id: 'critical-infrastructure-coordination',
        name: 'National Critical Infrastructure Coordination',
        description: 'Unified coordination for critical infrastructure protection and resilience',
        complexity: 'high',
        estimatedTime: '12-14 weeks',
        siaScores: { security: 98, integrity: 97, accuracy: 90 },
      },
    ],
    regulations: ['FISMA', 'FedRAMP', 'Privacy Act', 'FOIA', 'State Regulations'],
    aiAgents: ['ServiceOptimizer', 'SafetyAnalyzer', 'ResourceAllocator', 'PolicyAnalyzer'],
    templates: ['citizen-service', 'safety-analysis', 'resource-planning'],
    metrics: [
      {
        id: 'service-efficiency',
        name: 'Service Efficiency',
        unit: '%',
        threshold: { warning: 85, critical: 75 },
        visualization: 'gauge',
      },
      {
        id: 'citizen-satisfaction',
        name: 'Citizen Satisfaction',
        unit: 'score',
        threshold: { warning: 8, critical: 7 },
        visualization: 'line',
      },
    ],
    dashboardWidgets: ['service-metrics', 'safety-monitor', 'resource-usage', 'citizen-feedback'],
  },
  
  telecom: {
    id: 'telecom',
    name: 'Telecommunications',
    description: 'AI governance for network optimization and customer experience',
    icon: GlobeAltIcon,
    color: 'text-cyan-500',
    bgGradient: 'from-cyan-900/20 to-blue-900/20',
    features: [
      'Network Optimization',
      'Predictive Maintenance',
      'Customer Churn Prevention',
      'Fraud Detection',
      'Service Quality',
    ],
    useCases: [
      {
        id: 'network-optimization',
        name: 'Network Performance Optimization',
        description: 'Optimize network performance using AI',
        complexity: 'high',
        estimatedTime: '6-8 weeks',
        siaScores: { security: 85, integrity: 88, accuracy: 91 },
      },
      {
        id: 'churn-prevention',
        name: 'Customer Churn Prevention',
        description: 'Predict and prevent customer churn',
        complexity: 'medium',
        estimatedTime: '4-5 weeks',
        siaScores: { security: 78, integrity: 85, accuracy: 89 },
      },
      {
        id: 'network-security',
        name: 'Network Security Monitoring',
        description: 'AI-powered network threat detection',
        complexity: 'high',
        estimatedTime: '5-7 weeks',
        siaScores: { security: 94, integrity: 92, accuracy: 87 },
      },
    ],
    regulations: ['FCC Regulations', 'CPNI', 'GDPR', 'Net Neutrality'],
    aiAgents: ['NetworkOptimizer', 'ChurnPredictor', 'SecurityMonitor', 'QualityAnalyzer'],
    templates: ['network-optimization', 'churn-analysis', 'security-monitoring'],
    metrics: [
      {
        id: 'network-uptime',
        name: 'Network Uptime',
        unit: '%',
        threshold: { warning: 99.9, critical: 99.5 },
        visualization: 'gauge',
      },
      {
        id: 'customer-satisfaction',
        name: 'Customer Satisfaction',
        unit: 'NPS',
        threshold: { warning: 50, critical: 30 },
        visualization: 'bar',
      },
    ],
    dashboardWidgets: ['network-status', 'customer-metrics', 'security-alerts', 'quality-monitor'],
  },
  
  'real-estate': {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'AI governance for property valuation, market analysis, and transaction automation',
    icon: HomeIcon,
    color: 'text-amber-500',
    bgGradient: 'from-amber-900/20 to-orange-900/20',
    features: [
      'Property Valuation',
      'Market Analysis',
      'Transaction Automation',
      'Risk Assessment',
      'Portfolio Management',
    ],
    useCases: [
      {
        id: 'ai-pricing-governance',
        name: 'AI Pricing Governance',
        description: 'Governed AI for real estate valuation and automated buying decisions',
        complexity: 'high',
        estimatedTime: '8-10 weeks',
        siaScores: { security: 90, integrity: 94, accuracy: 88 },
      },
    ],
    regulations: ['RESPA', 'Fair Housing Act', 'TILA', 'State Real Estate Laws'],
    aiAgents: ['ValuationEngine', 'MarketAnalyzer', 'RiskAssessor', 'TransactionManager'],
    templates: ['property-valuation', 'market-analysis', 'risk-assessment'],
    metrics: [
      {
        id: 'valuation-accuracy',
        name: 'Valuation Accuracy',
        unit: '%',
        threshold: { warning: 95, critical: 90 },
        visualization: 'gauge',
      },
      {
        id: 'market-volatility',
        name: 'Market Volatility Index',
        unit: 'score',
        threshold: { warning: 30, critical: 50 },
        visualization: 'line',
      },
    ],
    dashboardWidgets: ['property-monitor', 'market-trends', 'valuation-accuracy', 'risk-alerts'],
  },
};

// Helper function to get vertical by ID
export const getVertical = (id: string): VerticalModule | undefined => {
  return verticals[id];
};

// Helper function to get all verticals as array
export const getAllVerticals = (): VerticalModule[] => {
  return Object.values(verticals);
};

// Helper function to get verticals by feature
export const getVerticalsByFeature = (feature: string): VerticalModule[] => {
  return Object.values(verticals).filter(v => 
    v.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
  );
};

// Helper function to get verticals by regulation
export const getVerticalsByRegulation = (regulation: string): VerticalModule[] => {
  return Object.values(verticals).filter(v => 
    v.regulations.some(r => r.toLowerCase().includes(regulation.toLowerCase()))
  );
};