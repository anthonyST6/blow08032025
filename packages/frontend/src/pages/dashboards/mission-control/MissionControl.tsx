import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../../services/api';
import { MissionControlPersistenceWrapper, emitUseCaseSelection } from '@/components/mission-control/MissionControlPersistenceWrapper';
import { getAgentsForUseCase, getAgentDecisionProcess, getAgentPerformanceObjectives } from './vanguardAgents';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { genericReportsService } from '../../../services/genericReports.service';
import VanguardActionsDropdown from '../../../components/mission-control-old/VanguardActionsDropdown';
import {
  Squares2X2Icon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  StopIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  BeakerIcon,
  ChartBarIcon,
  BoltIcon,
  CurrencyDollarIcon,
  HeartIcon,
  BuildingOfficeIcon,
  TruckIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  BeakerIcon as BeakerIconOutline,
  BuildingLibraryIcon,
  WifiIcon,
  HomeIcon,
  AcademicCapIcon,
  ChartPieIcon,
  PlusIcon,
  LockClosedIcon,
  DocumentCheckIcon,
  KeyIcon,
  CloudIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Squares2X2Icon as Squares2X2IconSolid } from '@heroicons/react/24/solid';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { Fragment } from 'react';
import { preloadedDatasets, DatasetCard } from './preloadedDatasets';

// Agent types - extended to support all vanguard types
interface Agent {
  id: string;
  name: string;
  type: 'security' | 'integrity' | 'accuracy' | 'optimization' | 'negotiation' | 'prediction' | 'monitoring' | 'compliance' | 'analysis' | 'response';
  status: 'inactive' | 'active' | 'processing' | 'completed' | 'idle' | 'maintenance' | 'offline';
  position: { x: number; y: number };
  tasks: string[];
  connections: string[];
}

// Comprehensive use case data
// First define all industry verticals (except All Verticals)
const industryVerticals = [
  {
    id: 'energy',
    name: 'Energy & Utilities',
    icon: <BoltIcon className="h-6 w-6" />,
    color: 'from-yellow-500 to-amber-600',
    useCases: [
      { id: 'oilfield-lease', name: 'Oilfield Land Lease Management', active: true },
      { id: 'grid-anomaly', name: 'Grid Anomaly Detection', active: true },
      { id: 'renewable-optimization', name: 'Renewable Energy Optimization', active: true },
      { id: 'drilling-risk', name: 'Drilling Risk Assessment', active: true },
      { id: 'environmental-compliance', name: 'Environmental Compliance', active: true },
      { id: 'load-forecasting', name: 'Load Forecasting', active: true },
      { id: 'phmsa-compliance', name: 'PHMSA Compliance Automation', active: true },
      { id: 'methane-detection', name: 'Methane Leak Detection', active: true },
      { id: 'grid-resilience', name: 'Grid Resilience & Outage Response', active: true },
      { id: 'internal-audit', name: 'Internal Audit and Governance', active: true },
      { id: 'scada-integration', name: 'SCADA-Legacy Integration', active: true },
      { id: 'predictive-resilience', name: 'Predictive Grid Resilience & Orchestration', active: true },
      { id: 'cyber-defense', name: 'Energy Supply Chain Cyber Defense', active: true },
      { id: 'wildfire-prevention', name: 'Wildfire Prevention & Infrastructure Risk', active: true },
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    icon: <HeartIcon className="h-6 w-6" />,
    color: 'from-red-500 to-pink-600',
    useCases: [
      { id: 'patient-risk', name: 'Patient Risk Stratification', active: true },
      { id: 'clinical-trial-matching', name: 'Clinical Trial Matching', active: true },
      { id: 'treatment-recommendation', name: 'Treatment Recommendation', active: true },
      { id: 'diagnosis-assistant', name: 'Diagnosis Assistant', active: true },
      { id: 'medical-supply-chain', name: 'Medical Supply Chain & Crisis Orchestration', active: true },
    ]
  },
  {
    id: 'financial',
    name: 'Financial Services',
    icon: <CurrencyDollarIcon className="h-6 w-6" />,
    color: 'from-green-500 to-emerald-600',
    useCases: [
      { id: 'fraud-detection', name: 'Real-time Fraud Detection', active: true },
      { id: 'ai-credit-scoring', name: 'AI Credit Scoring', active: true },
      { id: 'portfolio-optimization', name: 'Portfolio Optimization', active: true },
      { id: 'aml-monitoring', name: 'AML Transaction Monitoring', active: true },
      { id: 'insurance-risk', name: 'Insurance Risk Assessment', active: true },
    ]
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Industry 4.0',
    icon: <BuildingOfficeIcon className="h-6 w-6" />,
    color: 'from-blue-500 to-indigo-600',
    useCases: [
      { id: 'predictive-maintenance', name: 'Predictive Maintenance', active: true },
      { id: 'quality-inspection', name: 'Automated Quality Inspection', active: true },
      { id: 'supply-chain', name: 'Supply Chain Optimization', active: true },
    ]
  },
  {
    id: 'retail',
    name: 'Retail & E-commerce',
    icon: <ShoppingCartIcon className="h-6 w-6" />,
    color: 'from-purple-500 to-violet-600',
    useCases: [
      { id: 'demand-forecasting', name: 'Demand Forecasting', active: true },
      { id: 'customer-personalization', name: 'Customer Personalization', active: true },
      { id: 'price-optimization', name: 'Dynamic Price Optimization', active: true },
    ]
  },
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    icon: <TruckIcon className="h-6 w-6" />,
    color: 'from-orange-500 to-red-600',
    useCases: [
      { id: 'route-optimization', name: 'Dynamic Route Optimization', active: true },
      { id: 'fleet-maintenance', name: 'Predictive Fleet Maintenance', active: true },
      { id: 'warehouse-automation', name: 'Warehouse Automation', active: true },
    ]
  },
  {
    id: 'education',
    name: 'Education & EdTech',
    icon: <AcademicCapIcon className="h-6 w-6" />,
    color: 'from-cyan-500 to-blue-600',
    useCases: [
      { id: 'adaptive-learning', name: 'Adaptive Learning Paths', active: true },
      { id: 'student-performance', name: 'Student Performance Prediction', active: true },
      { id: 'content-recommendation', name: 'Smart Content Recommendation', active: true },
    ]
  },
  {
    id: 'pharmaceutical',
    name: 'Pharmaceutical & Biotech',
    icon: <BeakerIconOutline className="h-6 w-6" />,
    color: 'from-teal-500 to-green-600',
    useCases: [
      { id: 'drug-discovery', name: 'AI-Assisted Drug Discovery', active: true },
      { id: 'clinical-trial-optimization', name: 'Clinical Trial Optimization', active: true },
      { id: 'adverse-event', name: 'Adverse Event Detection', active: true },
    ]
  },
  {
    id: 'government',
    name: 'Government & Public Sector',
    icon: <BuildingLibraryIcon className="h-6 w-6" />,
    color: 'from-slate-500 to-gray-600',
    useCases: [
      { id: 'emergency-response', name: 'Coordinated Emergency Response Orchestration', active: true },
      { id: 'infrastructure-coordination', name: 'National Critical Infrastructure Coordination', active: true },
      { id: 'citizen-services', name: 'Smart Citizen Services', active: true },
      { id: 'public-safety', name: 'Public Safety Analytics', active: true },
      { id: 'resource-optimization', name: 'Resource Optimization', active: true },
    ]
  },
  {
    id: 'telecommunications',
    name: 'Telecom',
    icon: <WifiIcon className="h-6 w-6" />,
    color: 'from-indigo-500 to-purple-600',
    useCases: [
      { id: 'network-performance', name: 'Network Performance Optimization', active: true },
      { id: 'churn-prevention', name: 'Customer Churn Prevention', active: true },
      { id: 'network-security', name: 'Network Security Monitoring', active: true },
    ]
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: <HomeIcon className="h-6 w-6" />,
    color: 'from-amber-500 to-orange-600',
    useCases: [
      { id: 'ai-pricing-governance', name: 'AI Pricing Governance', active: true },
    ]
  },
];

// Aggregate all use cases from all industry verticals
const allUseCases = industryVerticals.flatMap(industry => industry.useCases);

// Create the complete industries array with All Verticals at the beginning
const industries = [
  {
    id: 'all-verticals',
    name: 'All Verticals',
    icon: <GlobeAltIcon className="h-6 w-6" />,
    color: 'from-gray-500 to-gray-600',
    useCases: [
      // First add the All Verticals specific use cases
      { id: 'cross-industry-analytics', name: 'Cross-Industry Analytics', active: true },
      { id: 'universal-compliance', name: 'Universal Compliance Engine', active: true },
      { id: 'multi-vertical-optimization', name: 'Multi-Vertical Optimization', active: false },
      { id: 'industry-benchmarking', name: 'Industry Benchmarking', active: false },
      // Then add all use cases from all other industries
      ...allUseCases
    ]
  },
  // Add all the industry verticals
  ...industryVerticals
];

// SIA metrics data
const siaMetrics = {
  security: { value: 98, status: 'passing' },
  integrity: { value: 85, status: 'warning' },
  accuracy: { value: 92, status: 'passing' },
};

// Executive Summary Data for all use cases
const executiveSummaryData: { [key: string]: any } = {
  'oilfield-lease': {
    painPoints: [
      'Manual lease tracking leads to $50M+ annual losses from missed renewals',
      'Fragmented data across 15+ systems creates blind spots',
      'Regulatory violations risk $10M+ fines per incident',
      'Processing delays of 30-45 days impact operations'
    ],
    businessCase: {
      title: 'Transform Oilfield Lease Management',
      points: [
        'Prevent $50M+ annual losses from missed renewals',
        'Automate 80% of lease administration tasks',
        'Reduce regulatory violations by 95%',
        'Cut processing time from weeks to hours'
      ]
    },
    technicalApproach: {
      title: 'AI-Powered Autonomous Orchestration',
      points: [
        'Multi-agent system with specialized Vanguards',
        'Real-time integration with ERP, GIS, and CLM systems',
        'NLP-powered contract analysis and extraction',
        'Predictive analytics for renewal optimization'
      ]
    },
    benefits: [
      'Zero missed lease deadlines with proactive monitoring',
      'Full audit trail and regulatory compliance',
      '10x faster lease processing and approvals',
      'Proactive risk mitigation and opportunity identification'
    ],
    examples: [
      'Devon Energy: Lost $22M in Permian production from expired surface agreements',
      'Continental Resources: Bakken field shutdown cost $1.2M/day from mineral rights dispute',
      'Pioneer Natural Resources: Paid $85M in penalties for operating on expired leases'
    ],
    vanguardImpact: [
      'Devon Energy: Would have prevented $22M loss with 365-day advance renewal alerts',
      'Continental Resources: Could have avoided $1.2M/day shutdown through proactive rights management',
      'Pioneer Natural Resources: Would have saved $85M in penalties with automated compliance tracking'
    ],
    roi: {
      implementation: '$2.5M',
      annualSavings: '$50M+',
      paybackPeriod: '2 months',
      fiveYearROI: '1,900%'
    }
  },
  'grid-anomaly': {
    painPoints: [
      'Reactive maintenance costs utilities $80B annually in outages',
      'Grid failures affect millions and risk regulatory penalties',
      'Aging infrastructure with 40% of assets beyond design life',
      'Lack of real-time visibility across distributed grid'
    ],
    businessCase: {
      title: 'Predictive Grid Intelligence',
      points: [
        'Reduce unplanned outages by 75%',
        'Save $30M+ annually in maintenance costs',
        'Improve grid reliability to 99.99%',
        'Extend asset life by 20-30%'
      ]
    },
    technicalApproach: {
      title: 'Real-Time Grid Analytics',
      points: [
        'ML-based anomaly detection across all grid assets',
        'Integration with SCADA, AMI, and weather systems',
        'Predictive failure modeling with 95% accuracy',
        'Automated dispatch and crew optimization'
      ]
    },
    benefits: [
      'Prevent outages before they occur',
      'Optimize maintenance scheduling and costs',
      'Improve customer satisfaction scores',
      'Meet regulatory reliability standards'
    ],
    examples: [
      'PJM Interconnection: Missed transformer anomaly led to cascading failure affecting 4.5M customers',
      'Texas ERCOT: Grid anomalies during 2021 freeze went undetected causing $195B in damages',
      'California ISO: Transmission line anomaly caused 2020 rolling blackouts affecting 800K customers'
    ],
    vanguardImpact: [
      'PJM: Would have detected transformer issues 6 hours early, preventing 4.5M customer outages',
      'ERCOT: Could have prevented $195B in damages with 4-hour advance anomaly detection',
      'California ISO: Would have avoided 800K customer blackouts through predictive line monitoring'
    ],
    roi: {
      implementation: '$3.5M',
      annualSavings: '$30M+',
      paybackPeriod: '4 months',
      fiveYearROI: '1,300%'
    }
  },
  'patient-risk': {
    painPoints: [
      '30% of high-risk patients go unidentified until crisis',
      'Fragmented data prevents holistic patient view',
      'Manual risk scoring takes hours per patient',
      'Reactive care model drives up costs by 40%'
    ],
    businessCase: {
      title: 'Proactive Patient Care Management',
      points: [
        'Identify high-risk patients 6 months earlier',
        'Reduce hospital readmissions by 45%',
        'Lower care costs by 30% per patient',
        'Improve patient outcomes by 60%'
      ]
    },
    technicalApproach: {
      title: 'AI-Driven Risk Stratification',
      points: [
        'Real-time analysis of clinical, social, and behavioral data',
        'Integration with EHR, claims, and IoT devices',
        'Predictive models with 92% accuracy',
        'Automated care plan recommendations'
      ]
    },
    benefits: [
      'Early intervention prevents complications',
      'Personalized care plans improve outcomes',
      'Reduced burden on emergency departments',
      'Better resource allocation and staffing'
    ],
    examples: [
      'Geisinger Health: Reduced readmissions by 40% but required 18-month manual implementation',
      'Kaiser Permanente: Readmission program saved $40M but missed 60% of high-risk patients',
      'Partners HealthCare: Paid $10M in readmission penalties despite risk stratification efforts'
    ],
    vanguardImpact: [
      'Geisinger: Would have achieved same results in 3 months with AI automation',
      'Kaiser: Could have saved additional $60M by catching all high-risk patients',
      'Partners: Would have avoided $10M penalties with 91% risk detection accuracy'
    ],
    roi: {
      implementation: '$2M',
      annualSavings: '$15M+',
      paybackPeriod: '5 months',
      fiveYearROI: '1,100%'
    }
  },
  'fraud-detection': {
    painPoints: [
      'Financial fraud costs $5.8 trillion globally each year',
      'Traditional rules catch only 20% of sophisticated fraud',
      'False positives frustrate 40% of legitimate customers',
      'Investigation backlogs delay resolution by weeks'
    ],
    businessCase: {
      title: 'Real-Time Fraud Prevention',
      points: [
        'Detect 95% of fraud attempts in real-time',
        'Reduce false positives by 70%',
        'Save $100M+ annually in fraud losses',
        'Process transactions 10x faster'
      ]
    },
    technicalApproach: {
      title: 'Advanced ML Fraud Detection',
      points: [
        'Deep learning models analyzing 500+ features',
        'Real-time scoring of every transaction',
        'Behavioral biometrics and device fingerprinting',
        'Automated case management and investigation'
      ]
    },
    benefits: [
      'Stop fraud before losses occur',
      'Improve customer experience with fewer blocks',
      'Reduce manual review workload by 80%',
      'Meet regulatory compliance requirements'
    ],
    examples: [
      'JPMorgan Chase: Lost $1.1B to fraud in 2022 despite $600M annual fraud prevention spend',
      'Zelle Network: Fraud disputes jumped 90% with $440M in losses across member banks',
      'Capital One: Synthetic identity fraud caused $200M write-off in credit card portfolio'
    ],
    vanguardImpact: [
      'JPMorgan: Would have prevented $750M in fraud with 96% real-time detection',
      'Zelle: Could have reduced losses by $380M with cross-channel fraud detection',
      'Capital One: Would have saved $170M by detecting synthetic identities 5 months earlier'
    ],
    roi: {
      implementation: '$5M',
      annualSavings: '$100M+',
      paybackPeriod: '3 weeks',
      fiveYearROI: '3,900%'
    }
  },
  'predictive-maintenance': {
    painPoints: [
      'Unplanned downtime costs manufacturers $50B annually',
      'Reactive maintenance is 10x more expensive than preventive',
      '70% of equipment failures happen without warning',
      'Lack of visibility into asset health across plants'
    ],
    businessCase: {
      title: 'Zero Unplanned Downtime',
      points: [
        'Predict failures 30-60 days in advance',
        'Reduce maintenance costs by 40%',
        'Increase equipment uptime to 99%',
        'Extend asset life by 20-30%'
      ]
    },
    technicalApproach: {
      title: 'IoT-Enabled Predictive Analytics',
      points: [
        'Real-time monitoring of all critical assets',
        'ML models trained on failure patterns',
        'Integration with ERP and maintenance systems',
        'Automated work order generation'
      ]
    },
    benefits: [
      'Eliminate surprise breakdowns',
      'Optimize maintenance schedules',
      'Reduce spare parts inventory by 30%',
      'Improve worker safety'
    ],
    examples: [
      'General Motors: Unplanned downtime at stamping plant cost $1.2M per hour affecting 50K vehicles',
      'Boeing 737 MAX: Quality control failures led to $20B in losses and 346 deaths from system malfunctions',
      'Tesla Fremont: Production line failures caused 20% below target output costing $2B in delayed revenue'
    ],
    vanguardImpact: [
      'GM: Would have prevented $28M in losses with 30-day advance failure warnings',
      'Boeing: Could have prevented tragedy and $20B loss with predictive quality systems',
      'Tesla: Would have saved $2B by maintaining target output with predictive maintenance'
    ],
    roi: {
      implementation: '$3M',
      annualSavings: '$25M+',
      paybackPeriod: '6 weeks',
      fiveYearROI: '1,600%'
    }
  },
  'demand-forecasting': {
    painPoints: [
      'Inventory costs eat up 25% of retail revenue',
      'Stockouts result in $1.1 trillion in lost sales',
      'Overstock leads to 30% markdowns on average',
      'Manual forecasting accuracy below 60%'
    ],
    businessCase: {
      title: 'AI-Powered Demand Intelligence',
      points: [
        'Achieve 95% forecast accuracy',
        'Reduce inventory costs by 30%',
        'Eliminate 80% of stockouts',
        'Increase revenue by 15%'
      ]
    },
    technicalApproach: {
      title: 'Advanced Demand Prediction',
      points: [
        'ML models incorporating 100+ demand signals',
        'Real-time integration with POS and supply chain',
        'Weather, social, and event data fusion',
        'Automated replenishment optimization'
      ]
    },
    benefits: [
      'Right product, right place, right time',
      'Reduced waste and markdowns',
      'Improved customer satisfaction',
      'Better supplier negotiations'
    ],
    examples: [
      'Target Canada: Supply chain failures and forecast errors led to empty shelves, $2B loss, and market exit',
      'H&M: Accumulated $4.3B in unsold inventory due to trend forecasting failures requiring massive markdowns',
      'Walmart: Overstocked inventory in 2022 led to $500M in excess markdowns hurting margins'
    ],
    vanguardImpact: [
      'Target Canada: Would have prevented $2B loss with 95% forecast accuracy',
      'H&M: Could have avoided $3B in excess inventory with AI demand sensing',
      'Walmart: Would have saved $400M in markdowns with dynamic forecasting'
    ],
    roi: {
      implementation: '$2.5M',
      annualSavings: '$40M+',
      paybackPeriod: '1 month',
      fiveYearROI: '2,900%'
    }
  },
  'route-optimization': {
    painPoints: [
      'Last-mile delivery costs consume 53% of shipping costs',
      'Manual routing wastes 20% of driver hours',
      'Failed deliveries cost $17.2 billion annually',
      'Customer expectations for same-day delivery growing'
    ],
    businessCase: {
      title: 'Dynamic Routing Intelligence',
      points: [
        'Reduce delivery costs by 25%',
        'Increase deliveries per route by 30%',
        'Achieve 95% on-time delivery',
        'Cut fuel consumption by 20%'
      ]
    },
    technicalApproach: {
      title: 'Real-Time Route Optimization',
      points: [
        'AI optimization considering traffic, weather, priorities',
        'Dynamic re-routing based on conditions',
        'Integration with fleet management systems',
        'Automated customer communication'
      ]
    },
    benefits: [
      'Lower operational costs',
      'Improved driver satisfaction',
      'Better customer experience',
      'Reduced carbon footprint'
    ],
    examples: [
      'FedEx Peak 2021: Route inefficiencies during holiday surge caused 15M delayed packages and $450M overtime',
      'Amazon DSP Program: Unrealistic routes caused 40% driver turnover costing $2.8B in recruitment and training',
      'UPS ORION: Initial routing algorithm saved miles but increased driver stress leading to union disputes'
    ],
    vanguardImpact: [
      'FedEx: Would have prevented 15M delays and saved $300M with dynamic routing',
      'Amazon: Could have reduced turnover to 10% saving $2.1B in labor costs',
      'UPS: Would have balanced efficiency with driver satisfaction avoiding disputes'
    ],
    roi: {
      implementation: '$1.5M',
      annualSavings: '$20M+',
      paybackPeriod: '1 month',
      fiveYearROI: '2,500%'
    }
  },
  // Add remaining use cases
  'renewable-optimization': {
    painPoints: [
      'Renewable energy curtailment wastes 5-10% of clean generation',
      'Grid instability from intermittent renewable sources',
      'Complex forecasting with weather-dependent generation',
      'Storage optimization challenges across distributed assets'
    ],
    businessCase: {
      title: 'Maximize Renewable Energy Value',
      points: [
        'Reduce curtailment by 85% through smart dispatch',
        'Increase renewable capacity factor by 25%',
        'Optimize storage utilization to 95%',
        'Improve grid stability with predictive balancing'
      ]
    },
    technicalApproach: {
      title: 'AI-Driven Energy Orchestration',
      points: [
        'Weather-integrated generation forecasting',
        'Real-time grid balancing algorithms',
        'Battery storage optimization AI',
        'Demand response coordination'
      ]
    },
    benefits: [
      'Maximize clean energy utilization',
      'Reduce carbon footprint significantly',
      'Lower energy costs for consumers',
      'Improve grid reliability and resilience'
    ],
    examples: [
      'NextEra Energy: Curtailed 1.2TWh of wind generation in Texas losing $48M in revenue',
      'California Solar: Duck curve curtailment reached 2.4GWh daily during spring 2023',
      'Hornsdale Power Reserve: Manual battery operation captured only 55% of potential arbitrage value'
    ],
    vanguardImpact: [
      'NextEra: Would have saved $48M by reducing curtailment 85% with smart dispatch',
      'California Solar: Could have captured $67M additional value with AI optimization',
      'Hornsdale: Would have increased arbitrage revenue by $23M with automated trading'
    ],
    roi: {
      implementation: '$4M',
      annualSavings: '$35M+',
      paybackPeriod: '6 weeks',
      fiveYearROI: '1,700%'
    }
  },
  'clinical-trial-matching': {
    painPoints: [
      '80% of clinical trials fail to meet enrollment timelines',
      'Average patient screening takes 6-8 weeks',
      'Only 5% of eligible patients participate in trials',
      'Manual matching process prone to errors and bias'
    ],
    businessCase: {
      title: 'Accelerate Clinical Trial Success',
      points: [
        'Reduce enrollment time by 70%',
        'Increase patient matching accuracy to 95%',
        'Triple eligible patient identification',
        'Cut screening costs by 60%'
      ]
    },
    technicalApproach: {
      title: 'Precision Patient Matching AI',
      points: [
        'NLP analysis of medical records',
        'Multi-criteria eligibility matching',
        'Real-time trial database integration',
        'Predictive enrollment modeling'
      ]
    },
    benefits: [
      'Faster drug development timelines',
      'Improved patient access to treatments',
      'Higher trial success rates',
      'Reduced development costs'
    ],
    examples: [
      'Novartis CAR-T Trial: Enrollment delays cost $400M in lost revenue opportunity',
      'Eli Lilly Alzheimer\'s: Poor site selection led to 50% screen failure rate and 2-year delay',
      'Merck Keytruda: Each month of trial delay cost $190M in lost sales'
    ],
    vanguardImpact: [
      'Novartis: Would have saved $400M with 3x faster patient matching',
      'Eli Lilly: Could have saved 2 years and $2.3B with AI site selection',
      'Merck: Would have gained $2.3B in revenue with 12-month faster enrollment'
    ],
    roi: {
      implementation: '$3M',
      annualSavings: '$75M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '4,900%'
    }
  },
  'ai-credit-scoring': {
    painPoints: [
      'Traditional scoring excludes 45M+ creditworthy Americans',
      'Bias in conventional models limits fair lending',
      'Static models miss 60% of risk indicators',
      'Manual underwriting takes days to weeks'
    ],
    businessCase: {
      title: 'Inclusive AI-Powered Credit Decisions',
      points: [
        'Expand addressable market by 40%',
        'Reduce default rates by 35%',
        'Process applications in seconds',
        'Ensure fair lending compliance'
      ]
    },
    technicalApproach: {
      title: 'Explainable AI Credit Models',
      points: [
        'Alternative data source integration',
        'Bias detection and mitigation',
        'Real-time risk assessment',
        'Regulatory-compliant explanations'
      ]
    },
    benefits: [
      'Financial inclusion for underserved',
      'Lower risk with better predictions',
      'Instant credit decisions',
      'Full regulatory compliance'
    ],
    examples: [
      'Wells Fargo: Paid $3.7B settlement for discriminatory lending practices in mortgage underwriting',
      'Upstart: AI lending model approved 27% more borrowers with 16% lower defaults',
      'Bank of America: Manual underwriting backlog reached 45 days during COVID, losing $890M in applications'
    ],
    vanguardImpact: [
      'Wells Fargo: Would have avoided $3.7B settlement with bias-free AI scoring',
      'Upstart: Demonstrates AI can expand access while reducing risk',
      'Bank of America: Could have saved $890M with instant AI underwriting'
    ],
    roi: {
      implementation: '$2.5M',
      annualSavings: '$60M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '4,700%'
    }
  },
  'quality-inspection': {
    painPoints: [
      'Manual inspection catches only 80% of defects',
      'Quality control bottlenecks slow production',
      'Inconsistent inspection standards across shifts',
      'Late defect detection costs 100x more to fix'
    ],
    businessCase: {
      title: 'Zero-Defect Manufacturing',
      points: [
        'Achieve 99.9% defect detection rate',
        'Reduce inspection time by 90%',
        'Cut quality costs by 50%',
        'Enable 100% product inspection'
      ]
    },
    technicalApproach: {
      title: 'Computer Vision Quality AI',
      points: [
        'High-speed vision inspection systems',
        'Deep learning defect classification',
        'Real-time production line integration',
        'Predictive quality analytics'
      ]
    },
    benefits: [
      'Near-zero defect rates',
      'Faster production throughput',
      'Consistent quality standards',
      'Reduced warranty claims'
    ],
    examples: [
      'Samsung Electronics: Galaxy Note 7 battery defects caused $5.3B loss and permanent model discontinuation',
      'Takata Airbags: Defective inflators killed 27 people triggering largest auto recall affecting 100M vehicles',
      'Johnson & Johnson: Talc contamination went undetected for decades resulting in $8.9B in lawsuit settlements'
    ],
    vanguardImpact: [
      'Samsung: Would have detected battery defects pre-launch, saving $5.3B and brand damage',
      'Takata: Could have prevented 27 deaths and 100M vehicle recalls with AI inspection',
      'J&J: Would have caught contamination decades earlier, avoiding $8.9B in settlements'
    ],
    roi: {
      implementation: '$2M',
      annualSavings: '$30M+',
      paybackPeriod: '1 month',
      fiveYearROI: '2,900%'
    }
  },
  'customer-personalization': {
    painPoints: [
      'Generic experiences drive 70% of customers away',
      'Manual segmentation misses individual preferences',
      'Cross-channel inconsistency frustrates customers',
      'Limited ability to predict customer needs'
    ],
    businessCase: {
      title: 'Hyper-Personalized Customer Experience',
      points: [
        'Increase conversion rates by 45%',
        'Boost customer lifetime value by 60%',
        'Reduce churn by 35%',
        'Drive 25% higher engagement'
      ]
    },
    technicalApproach: {
      title: '360° Customer Intelligence',
      points: [
        'Real-time behavioral analytics',
        'Omnichannel preference learning',
        'Next-best-action AI',
        'Dynamic content optimization'
      ]
    },
    benefits: [
      'Deeper customer relationships',
      'Higher revenue per customer',
      'Improved brand loyalty',
      'Competitive differentiation'
    ],
    examples: [
      'Bed Bath & Beyond: Failed digital transformation and poor personalization led to bankruptcy after 52 years',
      'Stitch Fix: Algorithm-only personalization without human stylists caused 75% stock price decline',
      'Nordstrom: Lack of unified customer view across channels resulted in $500M in duplicate inventory'
    ],
    vanguardImpact: [
      'Bed Bath & Beyond: Would have prevented bankruptcy with true 1:1 personalization',
      'Stitch Fix: Could have maintained growth with AI-human hybrid approach',
      'Nordstrom: Would have saved $500M with unified customer intelligence'
    ],
    roi: {
      implementation: '$3M',
      annualSavings: '$50M+',
      paybackPeriod: '3 weeks',
      fiveYearROI: '3,200%'
    }
  },
  'fleet-maintenance': {
    painPoints: [
      'Unexpected breakdowns cost $1000+ per hour',
      'Over-maintenance wastes 30% of budget',
      'Parts inventory ties up millions in capital',
      'Driver safety risks from vehicle failures'
    ],
    businessCase: {
      title: 'Predictive Fleet Intelligence',
      points: [
        'Eliminate 90% of breakdowns',
        'Reduce maintenance costs by 35%',
        'Optimize parts inventory by 40%',
        'Improve fleet uptime to 98%'
      ]
    },
    technicalApproach: {
      title: 'IoT-Powered Fleet Analytics',
      points: [
        'Real-time vehicle telemetry analysis',
        'Failure prediction algorithms',
        'Automated maintenance scheduling',
        'Parts demand forecasting'
      ]
    },
    benefits: [
      'Maximum fleet availability',
      'Lower operational costs',
      'Enhanced driver safety',
      'Extended vehicle lifespan'
    ],
    examples: [
      'Knight-Swift Transportation: Brake failure caused fatal accident resulting in $90M settlement and CSA score impact',
      'Celadon Trucking: Deferred maintenance to save costs led to bankruptcy with 4,000 drivers stranded',
      'Werner Enterprises: ELD-related violations cost $1.2M in fines and damaged shipper relationships'
    ],
    vanguardImpact: [
      'Knight-Swift: Would have prevented fatal accident and $90M settlement with predictive brake monitoring',
      'Celadon: Could have avoided bankruptcy by optimizing maintenance spend vs risk',
      'Werner: Would have prevented violations with automated compliance monitoring'
    ],
    roi: {
      implementation: '$2M',
      annualSavings: '$25M+',
      paybackPeriod: '1 month',
      fiveYearROI: '2,400%'
    }
  },
  'adaptive-learning': {
    painPoints: [
      'One-size-fits-all education fails 40% of students',
      'Teachers lack time for individual attention',
      'Learning gaps compound over time',
      'Student engagement declining year over year'
    ],
    businessCase: {
      title: 'Personalized Learning at Scale',
      points: [
        'Improve learning outcomes by 50%',
        'Increase student engagement by 70%',
        'Reduce dropout rates by 40%',
        'Save teachers 10 hours per week'
      ]
    },
    technicalApproach: {
      title: 'AI-Powered Education Platform',
      points: [
        'Individual learning style detection',
        'Dynamic content adaptation',
        'Real-time progress tracking',
        'Predictive intervention alerts'
      ]
    },
    benefits: [
      'Better student outcomes',
      'More efficient teaching',
      'Early intervention capability',
      'Scalable personalization'
    ],
    examples: [
      'NYC Public Schools: 40% of students failed standardized tests despite $25B budget',
      'Chicago Schools: Teacher burnout at 52% with 30:1 student ratios preventing individual attention',
      'LA Unified: $100M spent on one-size-fits-all curriculum with 35% dropout rate',
      'Detroit Schools: Learning gaps widened 2.5 grade levels during remote learning'
    ],
    vanguardImpact: [
      'NYC: Would have improved pass rates to 85% with personalized learning paths',
      'Chicago: Could have reduced burnout to 15% by saving teachers 10 hours/week',
      'LA Unified: Would have cut dropout rate to 10% with adaptive interventions',
      'Detroit: Could have prevented learning loss with real-time gap detection'
    ],
    roi: {
      implementation: '$1.5M',
      annualSavings: '$20M+',
      paybackPeriod: '1 month',
      fiveYearROI: '2,500%'
    }
  },
  'drug-discovery': {
    painPoints: [
      'Average drug development takes 10-15 years',
      'Development costs exceed $2.6 billion per drug',
      '90% of drug candidates fail in trials',
      'Limited exploration of chemical space'
    ],
    businessCase: {
      title: 'Accelerate Drug Discovery 10x',
      points: [
        'Reduce discovery time by 70%',
        'Cut development costs by 50%',
        'Triple success rate predictions',
        'Explore 100x more compounds'
      ]
    },
    technicalApproach: {
      title: 'AI-Driven Molecular Design',
      points: [
        'Generative molecular modeling',
        'Target-drug interaction prediction',
        'Virtual clinical trial simulation',
        'Automated hypothesis generation'
      ]
    },
    benefits: [
      'Faster time to market',
      'Lower development costs',
      'Higher success rates',
      'More innovative treatments'
    ],
    examples: [
      'Pfizer Alzheimer\'s: Ended neuroscience research after spending $3B+ with multiple Phase 3 failures',
      'Biogen Aduhelm: Controversial approval after $3B development with minimal efficacy shown',
      'Industry-wide: Only 12% of drugs entering clinical trials receive FDA approval'
    ],
    vanguardImpact: [
      'Pfizer: Would have saved $2.5B by identifying failure modes early with AI',
      'Biogen: Could have pivoted to effective targets saving $3B and patient hope',
      'Industry: Would increase approval rates to 35% with AI-driven discovery'
    ],
    roi: {
      implementation: '$10M',
      annualSavings: '$500M+',
      paybackPeriod: '1 week',
      fiveYearROI: '9,900%'
    }
  },
  'emergency-response': {
    painPoints: [
      'Response coordination delays cost lives',
      'Siloed agency communication hampers efficiency',
      'Resource allocation based on outdated information',
      'Post-incident analysis takes weeks'
    ],
    businessCase: {
      title: 'Unified Emergency Command AI',
      points: [
        'Reduce response time by 40%',
        'Improve resource utilization by 60%',
        'Save 30% more lives',
        'Cut coordination overhead by 70%'
      ]
    },
    technicalApproach: {
      title: 'Real-Time Crisis Orchestration',
      points: [
        'Multi-agency data fusion',
        'AI resource optimization',
        'Predictive incident modeling',
        'Automated dispatch coordination'
      ]
    },
    benefits: [
      'Faster emergency response',
      'Better resource deployment',
      'Improved survival rates',
      'Enhanced inter-agency coordination'
    ],
    examples: [
      'Maui Wildfires: 2023 fires killed 115 people due to communication failures and delayed evacuation orders',
      'Hurricane Ian: 2022 storm caused 150+ deaths and $112B damage with coordination challenges'
    ],
    vanguardImpact: [
      'Maui: Would have saved 100+ lives with AI-coordinated evacuation 2 hours earlier',
      'Hurricane Ian: Could have reduced deaths by 70% and damage by $40B with predictive response'
    ],
    roi: {
      implementation: '$5M',
      annualSavings: '$100M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '3,900%'
    }
  },
  'network-performance': {
    painPoints: [
      'Network outages cost $5,600 per minute',
      'Manual optimization misses 70% of issues',
      'Customer churn from poor connectivity',
      'Capacity planning based on guesswork'
    ],
    businessCase: {
      title: 'Self-Optimizing Network Intelligence',
      points: [
        'Reduce outages by 80%',
        'Improve network efficiency by 40%',
        'Cut operational costs by 35%',
        'Increase customer satisfaction 50%'
      ]
    },
    technicalApproach: {
      title: 'AI Network Orchestration',
      points: [
        'Real-time performance monitoring',
        'Predictive failure detection',
        'Automated healing and optimization',
        'Dynamic capacity management'
      ]
    },
    benefits: [
      'Near-zero network downtime',
      'Optimal resource utilization',
      'Proactive issue resolution',
      'Superior customer experience'
    ],
    examples: [
      'AT&T February 2020: Network outage affected 20M customers for 5 hours causing $180M in credits',
      'Verizon 5G Launch: Coverage gaps and performance issues led to 34% satisfaction despite $45B investment',
      'T-Mobile Sprint Merger: Network integration challenges caused 3M customer defections worth $2.1B'
    ],
    vanguardImpact: [
      'AT&T: Would have prevented outage saving $180M with predictive network management',
      'Verizon: Could have achieved 85% satisfaction with AI-optimized 5G rollout',
      'T-Mobile: Would have retained 2.5M customers saving $1.7B with smooth integration'
    ],
    roi: {
      implementation: '$4M',
      annualSavings: '$80M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '3,900%'
    }
  },
  'ai-pricing-governance': {
    painPoints: [
      'Algorithmic pricing risks regulatory violations',
      'Lack of transparency in AI pricing decisions',
      'Potential for discriminatory pricing practices',
      'Manual oversight cannot scale with volume'
    ],
    businessCase: {
      title: 'Ethical AI Pricing Compliance',
      points: [
        'Ensure 100% pricing compliance',
        'Prevent discriminatory practices',
        'Increase revenue by 15% safely',
        'Reduce regulatory risk to zero'
      ]
    },
    technicalApproach: {
      title: 'Governed Pricing Intelligence',
      points: [
        'Real-time fairness monitoring',
        'Explainable pricing decisions',
        'Automated compliance checks',
        'Bias detection and prevention'
      ]
    },
    benefits: [
      'Full regulatory compliance',
      'Fair and transparent pricing',
      'Optimized revenue safely',
      'Protected brand reputation'
    ],
    examples: [
      'Zillow: Zillow Offers shut down after algorithm errors led to $881M loss buying homes above market value',
      'Redfin: Algorithmic pricing lawsuits alleged systematic undervaluation in minority neighborhoods',
      'Opendoor: Lost $1.4B in 2022 due to pricing model failures during market volatility'
    ],
    vanguardImpact: [
      'Zillow: Would have prevented $881M loss with governed AI ensuring fair market pricing',
      'Redfin: Could have avoided lawsuits with bias-free pricing algorithms',
      'Opendoor: Would have reduced losses by 80% with volatility-aware pricing models'
    ],
    roi: {
      implementation: '$2M',
      annualSavings: '$30M+',
      paybackPeriod: '1 month',
      fiveYearROI: '2,900%'
    }
  },
  // Add remaining missing use cases
  'clinical-trial-optimization': {
    painPoints: [
      'Trial delays cost $600K per day',
      'Site selection suboptimal 40% of time',
      'Protocol amendments average 2.3 per trial',
      'Patient retention below 70%'
    ],
    businessCase: {
      title: 'Optimized Trial Operations',
      points: [
        'Reduce trial duration by 30%',
        'Improve site selection accuracy 90%',
        'Minimize protocol amendments',
        'Achieve 90% patient retention'
      ]
    },
    technicalApproach: {
      title: 'Trial Intelligence Platform',
      points: [
        'Site performance prediction',
        'Protocol optimization AI',
        'Patient journey mapping',
        'Real-time trial monitoring'
      ]
    },
    benefits: [
      'Faster drug development',
      'Lower trial costs',
      'Better data quality',
      'Improved patient experience'
    ],
    examples: [
      'AstraZeneca COVID vaccine: 6-month delay cost $3.6B in lost revenue opportunity',
      'Biogen Alzheimer trial: Poor site selection led to 40% screen failures and 18-month delay',
      'Sanofi oncology: 3 protocol amendments added $45M cost and 9-month delay',
      'GSK respiratory: 55% dropout rate required complete trial restart costing $120M'
    ],
    vanguardImpact: [
      'AstraZeneca: Would have accelerated timeline by 4 months, capturing $2.4B more revenue',
      'Biogen: Could have achieved 90% enrollment success saving 18 months and $200M',
      'Sanofi: Would have optimized protocol upfront, avoiding amendments and $45M cost',
      'GSK: Could have maintained 90% retention, avoiding $120M restart'
    ],
    roi: {
      implementation: '$5M',
      annualSavings: '$100M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '3,900%'
    }
  },
  'adverse-event': {
    painPoints: [
      'Adverse events detected months after occurrence',
      'Manual reporting misses 90% of events',
      'Signal detection relies on limited data',
      'Regulatory reporting delays risk penalties'
    ],
    businessCase: {
      title: 'Real-Time Safety Surveillance',
      points: [
        'Detect events 95% faster',
        'Capture 10x more safety signals',
        'Automate regulatory reporting',
        'Prevent market withdrawals'
      ]
    },
    technicalApproach: {
      title: 'Pharmacovigilance AI',
      points: [
        'Multi-source data mining',
        'NLP adverse event extraction',
        'Signal detection algorithms',
        'Automated case processing'
      ]
    },
    benefits: [
      'Earlier safety detection',
      'Comprehensive monitoring',
      'Regulatory compliance',
      'Protected patients'
    ],
    examples: [
      'Vioxx: Merck withdrew after 5 years, 38,000 deaths, $4.85B settlement',
      'Avandia: GSK paid $3B for heart risks detected years late affecting 100K patients',
      'Pradaxa: Boehringer paid $650M for bleeding events missed in post-market surveillance',
      'Xarelto: J&J/Bayer $775M settlement for unreported bleeding risks'
    ],
    vanguardImpact: [
      'Vioxx: Would have detected cardiovascular signals in year 1, preventing 35,000 deaths',
      'Avandia: Could have identified heart risks 4 years earlier, protecting 100K patients',
      'Pradaxa: Would have caught bleeding patterns in first 6 months via real-time monitoring',
      'Xarelto: Could have provided early warnings and dosing guidance, avoiding settlements'
    ],
    roi: {
      implementation: '$3M',
      annualSavings: '$75M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '4,900%'
    }
  },
  'infrastructure-coordination': {
    painPoints: [
      'Critical infrastructure attacks increasing 300%',
      'Cross-sector dependencies poorly understood',
      'Coordination delays amplify impacts',
      'Recovery efforts duplicated across agencies'
    ],
    businessCase: {
      title: 'National Infrastructure Defense',
      points: [
        'Prevent 95% of cascading failures',
        'Coordinate response in real-time',
        'Map all critical dependencies',
        'Reduce recovery time 80%'
      ]
    },
    technicalApproach: {
      title: 'Infrastructure Intelligence Grid',
      points: [
        'Cross-sector dependency mapping',
        'Threat propagation modeling',
        'Automated response coordination',
        'Resource optimization AI'
      ]
    },
    benefits: [
      'Protected critical services',
      'Coordinated defense',
      'Minimized cascade effects',
      'Rapid recovery'
    ],
    examples: [
      'Texas 2021 Grid Failure: Cascading failures affected 4.5M homes, 246 deaths, $195B damage',
      'Colonial Pipeline 2021: Ransomware shut down 45% of East Coast fuel for 6 days',
      'SolarWinds 2020: Supply chain attack compromised 18,000 organizations including critical infrastructure',
      'Ukraine Power Grid 2015: First cyber attack on power grid left 230,000 without power'
    ],
    vanguardImpact: [
      'Texas: Would have prevented cascade through predictive load balancing, saving 200+ lives',
      'Colonial: Could have isolated attack in minutes, maintaining fuel flow',
      'SolarWinds: Would have detected anomalous behavior across organizations within hours',
      'Ukraine: Could have prevented outage through automated threat response'
    ],
    roi: {
      implementation: '$10M',
      annualSavings: '$1B+',
      paybackPeriod: '4 days',
      fiveYearROI: '19,900%'
    }
  },
  'citizen-services': {
    painPoints: [
      'Citizens navigate 50+ agencies for services',
      'Average wait times exceed 2 hours',
      'Paper processes delay benefits by weeks',
      '40% of applications have errors'
    ],
    businessCase: {
      title: 'Unified Citizen Experience',
      points: [
        'Single portal for all services',
        'Reduce wait times by 90%',
        'Process applications instantly',
        'Eliminate application errors'
      ]
    },
    technicalApproach: {
      title: 'Smart Government Platform',
      points: [
        'Unified service orchestration',
        'Intelligent form completion',
        'Automated eligibility checking',
        'Proactive service delivery'
      ]
    },
    benefits: [
      'Seamless citizen experience',
      'Efficient service delivery',
      'Reduced administrative costs',
      'Higher citizen satisfaction'
    ],
    examples: [
      'Healthcare.gov: Launch failures affected 8M users, cost $2.1B to fix over 3 years',
      'California EDD: $31B in fraudulent unemployment claims due to outdated systems',
      'IRS: 24M paper returns backlogged, citizens waiting 10+ months for refunds',
      'VA Benefits: Veterans wait average 125 days, with 400K+ pending claims'
    ],
    vanguardImpact: [
      'Healthcare.gov: Would have handled 8M users seamlessly with cloud-native architecture',
      'California EDD: Could have prevented $30B fraud with AI verification and biometrics',
      'IRS: Would process returns in 24 hours with intelligent document processing',
      'VA: Could reduce wait to 5 days with automated eligibility and smart routing'
    ],
    roi: {
      implementation: '$5M',
      annualSavings: '$200M+',
      paybackPeriod: '1 week',
      fiveYearROI: '7,900%'
    }
  },
  'public-safety': {
    painPoints: [
      'Crime prediction accuracy below 60%',
      'Resource deployment reactive not proactive',
      'Cross-agency data silos hinder response',
      'Community trust declining'
    ],
    businessCase: {
      title: 'Predictive Public Safety',
      points: [
        'Predict incidents with 85% accuracy',
        'Optimize patrol deployment',
        'Enable real-time coordination',
        'Build community trust'
      ]
    },
    technicalApproach: {
      title: 'Public Safety Intelligence',
      points: [
        'Crime pattern analysis',
        'Resource optimization models',
        'Multi-agency data fusion',
        'Community engagement tools'
      ]
    },
    benefits: [
      'Prevented incidents',
      'Efficient resource use',
      'Coordinated response',
      'Stronger communities'
    ],
    examples: [
      'Chicago 2021: 797 homicides despite $1.7B police budget, highest in 25 years',
      'San Francisco: Property crime up 20% with slow 13-minute response times',
      'Portland: 90 officers resigned, 800+ shootings increase, community trust at all-time low',
      'Minneapolis: Post-2020 crime surge with 30% officer shortage costing $500M'
    ],
    vanguardImpact: [
      'Chicago: Would reduce homicides by 40% through predictive deployment and intervention',
      'San Francisco: Could cut property crime 50% with AI-optimized patrol routes',
      'Portland: Would prevent 60% of shootings via early warning system and community engagement',
      'Minneapolis: Could maintain full staffing effectiveness despite shortage using AI coordination'
    ],
    roi: {
      implementation: '$3M',
      annualSavings: '$50M+',
      paybackPeriod: '3 weeks',
      fiveYearROI: '3,200%'
    }
  },
  'resource-optimization': {
    painPoints: [
      'Government waste exceeds $200B annually',
      'Budget allocation based on politics not data',
      'Duplicate programs across agencies',
      'Limited visibility into spending effectiveness'
    ],
    businessCase: {
      title: 'AI-Driven Government Efficiency',
      points: [
        'Reduce waste by 40%',
        'Data-driven budget allocation',
        'Eliminate program duplication',
        'Real-time spending analytics'
      ]
    },
    technicalApproach: {
      title: 'Government Resource AI',
      points: [
        'Spending pattern analysis',
        'Program effectiveness scoring',
        'Duplication detection',
        'Predictive budget modeling'
      ]
    },
    benefits: [
      'Eliminated waste',
      'Optimized budgets',
      'Streamlined programs',
      'Transparent spending'
    ],
    examples: [
      'Pentagon: Failed first-ever audit, cannot account for $2.8T in assets and spending',
      'Medicare/Medicaid: $100B+ annual improper payments due to fraud and errors',
      'Federal IT: $90B spent annually with 70% project failure rate',
      'Grant programs: 150+ job training programs across 14 agencies with no coordination'
    ],
    vanguardImpact: [
      'Pentagon: Would achieve clean audit with AI tracking every dollar and asset in real-time',
      'Medicare: Could reduce improper payments by 90% through pattern detection and verification',
      'Federal IT: Would cut failures to 10% with predictive project analytics and resource optimization',
      'Grants: Could consolidate to 20 effective programs, saving $5B while improving outcomes'
    ],
    roi: {
      implementation: '$10M',
      annualSavings: '$80B+',
      paybackPeriod: '2 days',
      fiveYearROI: '159,900%'
    }
  },
  'churn-prevention': {
    painPoints: [
      'Customer acquisition costs 5x retention',
      'Churn predictions only 70% accurate',
      'Retention offers poorly targeted',
      'Win-back rates below 10%'
    ],
    businessCase: {
      title: 'Predictive Retention AI',
      points: [
        'Predict churn 95% accurately',
        'Reduce churn by 40%',
        'Personalize retention offers',
        'Triple win-back rates'
      ]
    },
    technicalApproach: {
      title: 'Customer Retention Intelligence',
      points: [
        'Behavioral churn modeling',
        'Lifetime value optimization',
        'Personalized offer engine',
        'Win-back campaign AI'
      ]
    },
    benefits: [
      'Higher customer retention',
      'Increased lifetime value',
      'Efficient retention spend',
      'Recovered lost customers'
    ],
    examples: [
      'Sprint: Lost 5M subscribers before T-Mobile merger, couldn\'t predict churn',
      'AT&T: 1.3M TV subscribers lost in Q4 2020 despite retention efforts',
      'Verizon: Lost 289K phone subscribers to competitors in 2023',
      'Comcast: 2M+ cable subscribers lost to streaming, failed to retain'
    ],
    vanguardImpact: [
      'Sprint: Would have retained 3M subscribers with 95% churn prediction',
      'AT&T: Could have saved 900K subscribers with personalized offers',
      'Verizon: Would have prevented 200K losses through proactive retention',
      'Comcast: Could have transitioned 1.5M to profitable streaming bundles'
    ],
    roi: {
      implementation: '$3M',
      annualSavings: '$150M+',
      paybackPeriod: '1 week',
      fiveYearROI: '9,900%'
    }
  },
  'network-security': {
    painPoints: [
      'Telecom networks face 100K attacks daily',
      'DDoS attacks cost $2.3M per incident',
      '5G expansion increases attack surface',
      'Zero-day exploits undetected for months'
    ],
    businessCase: {
      title: 'AI Network Defense Platform',
      points: [
        'Block 99.9% of attacks',
        'Detect zero-days instantly',
        'Automate threat response',
        'Secure 5G infrastructure'
      ]
    },
    technicalApproach: {
      title: 'Adaptive Security Intelligence',
      points: [
        'ML-based threat detection',
        'Behavioral anomaly analysis',
        'Automated mitigation',
        '5G security orchestration'
      ]
    },
    benefits: [
      'Impenetrable network defense',
      'Instant threat neutralization',
      'Protected customer data',
      'Secure next-gen services'
    ],
    examples: [
      'T-Mobile 2021: Breach exposed 54M customers\' data including SSNs',
      'AT&T 2024: 73M customer records leaked on dark web',
      'Optus 2022: 10M Australian customers\' data stolen in cyberattack',
      'British Telecom: DDoS attacks disrupted services for millions'
    ],
    vanguardImpact: [
      'T-Mobile: Would have blocked breach instantly, protecting 54M customers',
      'AT&T: Could have prevented data exfiltration, securing all records',
      'Optus: Would have detected attack in seconds, stopping data theft',
      'BT: Could have mitigated DDoS automatically, maintaining service'
    ],
    roi: {
      implementation: '$5M',
      annualSavings: '$200M+',
      paybackPeriod: '1 week',
      fiveYearROI: '7,900%'
    }
  },
  'cross-industry-analytics': {
    painPoints: [
      'Industry insights limited to single verticals',
      'Best practices not transferred across sectors',
      'Benchmarking data fragmented',
      'Innovation opportunities missed'
    ],
    businessCase: {
      title: 'Cross-Industry Intelligence Platform',
      points: [
        'Unlock cross-sector insights',
        'Transfer best practices automatically',
        'Enable universal benchmarking',
        'Accelerate innovation 3x'
      ]
    },
    technicalApproach: {
      title: 'Multi-Industry AI Analytics',
      points: [
        'Cross-sector pattern recognition',
        'Best practice extraction',
        'Universal KPI modeling',
        'Innovation opportunity mapping'
      ]
    },
    benefits: [
      'Breakthrough insights',
      'Accelerated improvement',
      'Competitive advantages',
      'Faster innovation'
    ],
    examples: [
      'Blockbuster: Failed to learn from Netflix\'s model in different industry',
      'Kodak: Ignored digital transformation lessons from other sectors',
      'Sears: Didn\'t adapt e-commerce insights from Amazon\'s success',
      'GE: Missed software-driven insights that transformed other industries'
    ],
    vanguardImpact: [
      'Blockbuster: Would have adopted streaming model 5 years earlier',
      'Kodak: Could have pivoted to digital imaging services successfully',
      'Sears: Would have built competitive e-commerce platform in time',
      'GE: Could have become industrial software leader as intended'
    ],
    roi: {
      implementation: '$5M',
      annualSavings: '$500M+',
      paybackPeriod: '4 days',
      fiveYearROI: '19,900%'
    }
  },
  'universal-compliance': {
    painPoints: [
      'Compliance costs exceed $200B globally',
      'Regulations change daily across jurisdictions',
      'Manual tracking impossible at scale',
      'Violations average $5M per incident'
    ],
    businessCase: {
      title: 'Universal Compliance Intelligence',
      points: [
        'Achieve 100% compliance globally',
        'Track all regulations real-time',
        'Automate 90% of compliance tasks',
        'Eliminate violation risk'
      ]
    },
    technicalApproach: {
      title: 'Global Compliance AI Engine',
      points: [
        'Regulatory change monitoring',
        'Automated impact analysis',
        'Compliance task orchestration',
        'Predictive risk assessment'
      ]
    },
    benefits: [
      'Perfect compliance record',
      'Reduced compliance costs',
      'Proactive risk management',
      'Operational efficiency'
    ],
    examples: [
      'Wells Fargo: $3.7B in fines since 2016 for various compliance failures across business lines',
      'HSBC: $1.9B money laundering fine for compliance system failures',
      'Deutsche Bank: $2.5B in fines for LIBOR manipulation and compliance breakdowns',
      'Credit Suisse: $5.3B in penalties for helping US clients evade taxes'
    ],
    vanguardImpact: [
      'Wells Fargo: Would have prevented all violations with real-time compliance monitoring',
      'HSBC: Could have detected and stopped money laundering with AI transaction analysis',
      'Deutsche Bank: Would have identified manipulation patterns preventing LIBOR scandal',
      'Credit Suisse: Could have flagged tax evasion schemes automatically, avoiding penalties'
    ],
    roi: {
      implementation: '$10M',
      annualSavings: '$1B+',
      paybackPeriod: '4 days',
      fiveYearROI: '19,900%'
    }
  },
  // Add remaining missing use cases
  'drilling-risk': {
    painPoints: [
      'Offshore drilling NPT averages 27% of total rig time at $850K/day',
      'Stuck pipe incidents occur every 3.2 wells drilled, requiring $15.8M average remediation',
      'Formation pressure miscalculations cause 1 in 7 wells to experience kicks',
      'Real-time data from 2,000+ sensors generates 15TB daily but 89% goes unanalyzed'
    ],
    businessCase: {
      title: 'Predictive Drilling Risk Management',
      points: [
        'Reduce NPT by 42% through physics-based predictions',
        'Identify drilling dysfunctions 72 hours before occurrence',
        'Save $67M annually for 25 wells/year operation',
        'Prevent 3 major incidents and reduce insurance premiums 18%'
      ]
    },
    technicalApproach: {
      title: 'Hybrid Physics-ML Risk Detection',
      points: [
        'Real-time sensor data integration with geological models',
        'Micro-trend detection in torque/drag relationships',
        'Computer vision analysis of mud returns',
        'Machine learning on 50,000+ historical wells'
      ]
    },
    benefits: [
      '72-hour advance warning for stuck pipe with 94% precision',
      'Real-time ECD optimization preventing 85% of wellbore instability',
      'Automated drilling parameter recommendations saving 4.2 days/well',
      'Integration with 15+ rig systems for unified hazard dashboard'
    ],
    examples: [
      'BP Deepwater Horizon: Well control incident cost $65B in cleanup, fines, and settlements',
      'Chevron Big Foot: $5B cost overrun from drilling complications and 3-year delay',
      'Shell Kulluk Arctic: $90M+ loss from inadequate risk assessment leading to rig grounding',
      'Transocean: Multiple incidents costing $1.4B in fines and operational losses'
    ],
    vanguardImpact: [
      'BP: Would have detected kick 72 hours early, preventing blowout and saving $65B',
      'Chevron: Could have optimized drilling parameters, avoiding $4B overrun and 2-year delay',
      'Shell: Would have predicted weather risks, preventing grounding and $90M loss',
      'Transocean: Could prevent 95% of incidents with real-time risk monitoring'
    ],
    roi: {
      implementation: '$4M',
      annualSavings: '$67M+',
      paybackPeriod: '3 weeks',
      fiveYearROI: '3,300%'
    }
  },
  'environmental-compliance': {
    painPoints: [
      'Fugitive methane emissions average 2.3% of production worth $1.8B annually',
      'EPA Method 21 compliance requires 52,000 manual inspections/year costing $3.2M',
      'Carbon intensity reporting errors trigger SEC investigations and ESG downgrades',
      'Flaring efficiency below 98% threshold occurs 23% of time risking $5M fines'
    ],
    businessCase: {
      title: 'Automated Environmental Compliance',
      points: [
        'Achieve 99.2% regulatory compliance through continuous monitoring',
        'Detect violations within 15 minutes vs quarterly audits',
        'Prevent $18M in annual penalties for typical refinery',
        'Improve ESG scores by 2 grades unlocking green financing'
      ]
    },
    technicalApproach: {
      title: 'Multi-Modal Environmental Monitoring',
      points: [
        'Sensor fusion: OGI cameras, laser spectroscopy, acoustic sensors',
        'Satellite hyperspectral imaging integration',
        'Automated regulatory mapping across 3,400+ rules',
        'Blockchain-immutable audit trail'
      ]
    },
    benefits: [
      'Continuous methane monitoring 50x better than Method 21',
      'Automated EPA reporting reducing time 95%',
      'Predictive alerts 8 hours before permit exceedances',
      'Real-time carbon intensity calculation for Scope 1/2/3'
    ],
    examples: [
      'ExxonMobil: $20M fine for inadequate monitoring at Baytown refinery',
      'Marathon: $334M settlement for emissions violations across 6 refineries',
      'Occidental: $1.5M methane leak penalties in New Mexico Permian operations',
      'Phillips 66: $2.2M EPA fine for benzene emissions exceeding limits'
    ],
    vanguardImpact: [
      'ExxonMobil: Would have detected violations 8 hours early, preventing $20M fine',
      'Marathon: Could have prevented all violations with continuous monitoring, saving $334M',
      'Occidental: Would have detected leaks within 1 hour, avoiding penalties',
      'Phillips 66: Could have predicted and prevented exceedances, saving $2.2M'
    ],
    roi: {
      implementation: '$3M',
      annualSavings: '$18M+',
      paybackPeriod: '2 months',
      fiveYearROI: '2,900%'
    }
  },
  'load-forecasting': {
    painPoints: [
      'Peak demand forecasting errors cost utilities $4.2B annually',
      'Weather-driven spikes catch utilities unprepared 23% of time',
      'EV adoption creates 47% more demand volatility',
      'Manual forecasting takes 6 hours daily yet misses 68% of anomalies'
    ],
    businessCase: {
      title: 'AI-Powered Load Prediction',
      points: [
        'Achieve <2% MAPE forecasting error at 24-hour horizon',
        'Reduce reserve requirements by 35%',
        'Cut spot purchases by 78%',
        'Save $142M annually for 5M customer utility'
      ]
    },
    technicalApproach: {
      title: 'Ensemble Deep Learning Forecasting',
      points: [
        'LSTM networks with gradient boosting for weather impacts',
        'Hierarchical forecasting from system to feeder level',
        'Real-time smart meter and IoT sensor integration',
        'Transfer learning for EV and DER adaptation'
      ]
    },
    benefits: [
      'Hyper-local forecasting with <2% error at feeder level',
      'Real-time demand response optimization saving $8.50/MWh',
      'EV charging prediction with 94% accuracy',
      'Automated day-ahead and real-time market bidding'
    ],
    examples: [
      'ERCOT 2021: Forecast errors led to $16B in overcharges during winter storm',
      'California ISO: Underestimated evening ramp causing August 2020 rolling blackouts',
      'PJM 2014: Polar vortex 15% error cost $1B in emergency generation procurement',
      'NYISO: Heat wave forecasting miss led to $500M in emergency purchases'
    ],
    vanguardImpact: [
      'ERCOT: Would have predicted demand accurately, preventing $16B in overcharges',
      'California ISO: Could have forecasted ramp correctly, avoiding all blackouts',
      'PJM: Would have reduced error to <2%, saving $900M in emergency costs',
      'NYISO: Could have anticipated heat wave demand, saving $450M'
    ],
    roi: {
      implementation: '$2.5M',
      annualSavings: '$142M+',
      paybackPeriod: '1 week',
      fiveYearROI: '11,200%'
    }
  },
  'phmsa-compliance': {
    painPoints: [
      'PHMSA violations average $218K per incident with criminal liability',
      'Manual compliance tracking across 195 regulations takes 2,000 hours/year',
      'Inspection readiness requires 3-week scrambles costing $450K',
      'Data scattered across 12+ systems with 35% missing critical fields'
    ],
    businessCase: {
      title: 'Automated PHMSA Compliance Platform',
      points: [
        'Achieve 99.8% compliance rate vs industry 87%',
        'Reduce violations by 95% saving $4.2M annually',
        'Cut compliance overhead by 78%',
        'Real-time audit readiness eliminating scrambles'
      ]
    },
    technicalApproach: {
      title: 'Intelligent Compliance Orchestration',
      points: [
        'NLP parsing of 195 PHMSA regulations with daily updates',
        'Automated data collection from SCADA, GIS, maintenance systems',
        'Predictive compliance scoring with 30-day forecasts',
        'One-click audit package generation'
      ]
    },
    benefits: [
      'Continuous compliance monitoring vs quarterly reviews',
      'Automated violation prevention with predictive alerts',
      'Instant inspection readiness with pre-built packages',
      'Full traceability with blockchain audit trail'
    ],
    examples: [
      'Colonial Pipeline: $4.4M in PHMSA fines over 5 years for record-keeping failures',
      'Enterprise Products: 89 violations costing $2.8M for inadequate procedures',
      'Kinder Morgan: $1.2M penalty for corrosion control program deficiencies',
      'TC Energy: $1M fine for failing to follow welding procedures'
    ],
    vanguardImpact: [
      'Colonial: Would have automated record-keeping, preventing all $4.4M in fines',
      'Enterprise: Could have ensured 100% procedural compliance, saving $2.8M',
      'Kinder Morgan: Would have detected program gaps early, avoiding $1.2M penalty',
      'TC Energy: Could have enforced procedures automatically, preventing violations'
    ],
    roi: {
      implementation: '$2M',
      annualSavings: '$4.2M+',
      paybackPeriod: '6 months',
      fiveYearROI: '1,050%'
    }
  },
  'methane-detection': {
    painPoints: [
      'Methane leaks cost $2B annually in lost product and fines',
      'Current detection methods miss 60% of emissions',
      'Manual inspections cover only 5% of infrastructure',
      'Response time averages 14 days from leak to repair'
    ],
    businessCase: {
      title: 'AI-Powered Methane Detection Network',
      points: [
        'Detect 95% of methane leaks within 1 hour',
        'Reduce emissions by 80% meeting EPA targets',
        'Save $30M annually in lost gas and penalties',
        'Achieve carbon neutral certification'
      ]
    },
    technicalApproach: {
      title: 'Multi-Sensor Fusion Detection',
      points: [
        'Satellite hyperspectral imaging with 1m resolution',
        'Fixed sensor network with ppb-level detection',
        'Drone swarm deployment for rapid response',
        'ML-based leak source identification'
      ]
    },
    benefits: [
      'Real-time leak detection and localization',
      'Automated repair dispatch and tracking',
      'Regulatory compliance reporting',
      'ESG score improvement'
    ],
    examples: [
      'Aliso Canyon 2015: Largest methane leak in US history, 97,100 tonnes released, $1.8B cost',
      'XTO Energy: $20.1M EPA fine for failing to detect and repair leaks in West Virginia',
      'Noble Energy: $73.5M settlement for Colorado methane emissions violations',
      'Hilcorp Alaska: Underwater pipeline leaked for 3 months before detection'
    ],
    vanguardImpact: [
      'Aliso Canyon: Would have detected leak within 1 hour, preventing 99% of release',
      'XTO: Could have found all leaks immediately, avoiding $20.1M fine',
      'Noble: Would have prevented violations with continuous monitoring, saving $73.5M',
      'Hilcorp: Could have detected underwater leak same day, preventing 3-month release'
    ],
    roi: {
      implementation: '$5M',
      annualSavings: '$30M+',
      paybackPeriod: '2 months',
      fiveYearROI: '1,100%'
    }
  },
  'grid-resilience': {
    painPoints: [
      'Weather-related outages increased 67% costing $150B annually',
      'Cascading failures affect 10M+ customers per event',
      'Manual restoration takes 72+ hours on average',
      'Climate change creating unprecedented stress patterns'
    ],
    businessCase: {
      title: 'Autonomous Grid Resilience Platform',
      points: [
        'Prevent 85% of weather-related outages',
        'Reduce restoration time by 80%',
        'Save $200M annually in outage costs',
        'Improve SAIDI scores by 60%'
      ]
    },
    technicalApproach: {
      title: 'Predictive Resilience Orchestration',
      points: [
        'Weather pattern ML with 96-hour forecasting',
        'Digital twin simulation of grid vulnerabilities',
        'Autonomous grid reconfiguration',
        'Distributed resource orchestration'
      ]
    },
    benefits: [
      'Proactive grid hardening before events',
      'Real-time adaptive response during storms',
      'Optimized restoration sequencing',
      'Community resilience hubs coordination'
    ],
    examples: [
      'PG&E: $30B in wildfire liabilities from equipment failures causing devastating fires',
      'ConEd: 72-hour Manhattan blackout affecting 73,000 customers cost $1B in damages',
      'ERCOT: Winter storm Uri grid failure caused $195B in damages and 246 deaths',
      'Hurricane Sandy: $65B in grid damage across Northeast utilities with weeks of outages'
    ],
    vanguardImpact: [
      'PG&E: Would have predicted equipment failures 7 days early, preventing fires and saving $30B',
      'ConEd: Could have rerouted power automatically, avoiding 71 hours of outage and $1B loss',
      'ERCOT: Would have forecasted demand accurately and managed load, preventing all blackouts',
      'Sandy: Could have pre-positioned crews optimally, restoring power 5x faster'
    ],
    roi: {
      implementation: '$8M',
      annualSavings: '$200M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '4,900%'
    }
  },
  'internal-audit': {
    painPoints: [
      'Manual audits miss 73% of control failures',
      'Audit cycles take 6-9 months with stale findings',
      'Compliance costs exceed $45M annually',
      'Fragmented systems prevent holistic risk view'
    ],
    businessCase: {
      title: 'Continuous AI Audit Platform',
      points: [
        'Achieve 100% control coverage continuously',
        'Reduce audit costs by 65%',
        'Identify risks 90 days earlier',
        'Automate 80% of testing procedures'
      ]
    },
    technicalApproach: {
      title: 'Intelligent Audit Automation',
      points: [
        'Continuous control monitoring across all systems',
        'Anomaly detection using unsupervised learning',
        'Natural language processing of policies',
        'Automated evidence collection and testing'
      ]
    },
    benefits: [
      'Real-time risk identification',
      'Predictive control failure alerts',
      'Automated remediation workflows',
      'Executive dashboard visibility'
    ],
    examples: [
      'Wells Fargo: $3B fine for control failures in account fraud scandal affecting 3.5M customers',
      'JPMorgan London Whale: $920M trading loss from weak risk controls and oversight',
      'Wirecard: $2B fraud undetected by EY auditors for years, company collapsed',
      'Enron: $74B shareholder loss from audit failures by Arthur Andersen'
    ],
    vanguardImpact: [
      'Wells Fargo: Would have detected unauthorized accounts immediately, preventing scandal and $3B fine',
      'JPMorgan: Could have flagged risky trades in real-time, avoiding $920M loss',
      'Wirecard: Would have identified missing billions within days, not years',
      'Enron: Could have exposed accounting fraud early, saving shareholders billions'
    ],
    roi: {
      implementation: '$3M',
      annualSavings: '$45M+',
      paybackPeriod: '1 month',
      fiveYearROI: '2,900%'
    }
  },
  'scada-integration': {
    painPoints: [
      'Legacy SCADA systems average 15 years old with no APIs',
      'Data silos prevent unified operational view',
      'Manual data extraction takes 40 hours/week',
      'Cybersecurity vulnerabilities in 89% of systems'
    ],
    businessCase: {
      title: 'Secure SCADA Modernization Platform',
      points: [
        'Unify data from 50+ legacy systems',
        'Reduce integration time by 90%',
        'Achieve 99.9% cybersecurity posture',
        'Enable real-time operational intelligence'
      ]
    },
    technicalApproach: {
      title: 'Zero-Trust Integration Architecture',
      points: [
        'Protocol translation for 200+ SCADA variants',
        'Air-gapped security with data diodes',
        'Edge computing for real-time processing',
        'Blockchain-secured data integrity'
      ]
    },
    benefits: [
      'Unified operational dashboard',
      'Predictive maintenance insights',
      'Automated anomaly response',
      'Regulatory compliance reporting'
    ],
    examples: [
      'Colonial Pipeline: Ransomware forced 6-day shutdown of 5,500 miles of pipeline',
      'Saudi Aramco: Shamoon virus destroyed 30,000 computers, disrupted operations for weeks',
      'Ukraine Power Grid: BlackEnergy malware left 230,000 without power in winter',
      'Stuxnet: Destroyed 1,000 Iranian nuclear centrifuges via SCADA attack'
    ],
    vanguardImpact: [
      'Colonial: Would have detected and blocked ransomware, preventing shutdown',
      'Aramco: Could have isolated infected systems instantly, saving 29,000 computers',
      'Ukraine: Would have prevented malware execution, keeping power online',
      'Stuxnet: Could have detected anomalous control commands, protecting equipment'
    ],
    roi: {
      implementation: '$4M',
      annualSavings: '$60M+',
      paybackPeriod: '1 month',
      fiveYearROI: '2,900%'
    }
  },
  'predictive-resilience': {
    painPoints: [
      'Grid failures cascade affecting millions within minutes',
      'Reactive response costs 10x more than prevention',
      'Distributed resources underutilized by 70%',
      'Climate events overwhelming traditional planning'
    ],
    businessCase: {
      title: 'Autonomous Grid Orchestration AI',
      points: [
        'Prevent 95% of cascading failures',
        'Orchestrate 100K+ distributed resources',
        'Reduce recovery time by 85%',
        'Save $500M in annual outage costs'
      ]
    },
    technicalApproach: {
      title: 'Multi-Agent Grid Intelligence',
      points: [
        'Federated learning across utility boundaries',
        'Real-time topology optimization',
        'Quantum-inspired optimization algorithms',
        'Self-healing grid protocols'
      ]
    },
    benefits: [
      'Autonomous threat response in milliseconds',
      'Optimal resource dispatch across regions',
      'Predictive islanding and restoration',
      'Cross-utility coordination platform'
    ],
    examples: [
      'Texas 2021: $195B damages from unprepared infrastructure during winter freeze',
      'Northeast 2003: Cascading blackout affected 55M people across 8 states',
      'California 2020: Rolling blackouts during heat wave affected 800K customers',
      'Puerto Rico 2017: Hurricane Maria left entire island without power for months'
    ],
    vanguardImpact: [
      'Texas: Would have winterized equipment proactively, preventing all outages and saving lives',
      'Northeast: Could have stopped cascade at first fault, protecting 55M people',
      'California: Would have optimized resources to prevent all rolling blackouts',
      'Puerto Rico: Could have restored power 85% faster with optimized dispatch'
    ],
    roi: {
      implementation: '$10M',
      annualSavings: '$500M+',
      paybackPeriod: '1 week',
      fiveYearROI: '9,900%'
    }
  },
  'cyber-defense': {
    painPoints: [
      'Energy sector faces 1M+ cyber attacks daily',
      'Supply chain vulnerabilities in 94% of vendors',
      'Average breach costs $13.2M with 49-day recovery',
      'Nation-state attacks increasing 400% annually'
    ],
    businessCase: {
      title: 'AI-Powered Supply Chain Cyber Defense',
      points: [
        'Block 99.99% of supply chain attacks',
        'Reduce incident response time to <1 minute',
        'Save $100M+ in prevented breaches',
        'Achieve DoE cybersecurity certification'
      ]
    },
    technicalApproach: {
      title: 'Zero-Trust AI Defense Platform',
      points: [
        'Behavioral AI monitoring all vendors',
        'Quantum-resistant encryption protocols',
        'Automated threat hunting and response',
        'Deception technology honeypots'
      ]
    },
    benefits: [
      'Real-time vendor risk scoring',
      'Automated incident containment',
      'Supply chain attack prevention',
      'Regulatory compliance assurance'
    ],
    examples: [
      'Colonial Pipeline 2021: $4.4M ransom + weeks of fuel shortages across East Coast',
      'SolarWinds 2020: Supply chain attack compromised 18,000 organizations including critical infrastructure',
      'Oldsmar Water 2021: Hacker attempted to poison water supply for 15,000 residents',
      'NotPetya 2017: $10B global damage including Maersk shipping operations'
    ],
    vanguardImpact: [
      'Colonial: Would have blocked ransomware at entry, preventing all disruption',
      'SolarWinds: Could have detected malicious code in updates within hours',
      'Oldsmar: Would have detected unauthorized access instantly, stopping attack',
      'NotPetya: Could have isolated infection immediately, saving billions globally'
    ],
    roi: {
      implementation: '$5M',
      annualSavings: '$100M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '3,900%'
    }
  },
  'wildfire-prevention': {
    painPoints: [
      'Utility-caused wildfires resulted in $100B+ liabilities',
      'Manual inspections cover <10% of infrastructure annually',
      'Vegetation management costs $2B with 60% inefficiency',
      'Climate change increasing fire risk 50% per decade'
    ],
    businessCase: {
      title: 'AI Wildfire Prevention System',
      points: [
        'Reduce wildfire risk by 95%',
        'Cut vegetation management costs 40%',
        'Prevent $10B+ in potential liabilities',
        'Achieve regulatory compliance certification'
      ]
    },
    technicalApproach: {
      title: 'Predictive Fire Risk Intelligence',
      points: [
        'Satellite imagery with daily updates',
        'LiDAR vegetation encroachment detection',
        'Weather pattern fire risk modeling',
        'Automated crew dispatch optimization'
      ]
    },
    benefits: [
      'Real-time fire risk monitoring',
      'Optimized vegetation management',
      'Proactive power shutoff decisions',
      'Community safety coordination'
    ],
    examples: [
      'PG&E Camp Fire 2018: $16.5B liabilities, 85 deaths, Paradise destroyed',
      'SCE Thomas Fire 2017: $1.8B damages, largest CA fire at the time',
      'SDG&E 2007 Fires: $2.4B costs, pushed utility near bankruptcy',
      'Australia 2019-20: $100B damage, 3 billion animals killed or displaced'
    ],
    vanguardImpact: [
      'Camp Fire: Would have detected faulty hook 48 hours early, preventing tragedy',
      'Thomas Fire: Could have identified conductor slap risk, avoiding ignition',
      'SDG&E: Would have cleared vegetation proactively, preventing all fires',
      'Australia: Could have predicted extreme conditions, enabling evacuations'
    ],
    roi: {
      implementation: '$8M',
      annualSavings: '$2B+',
      paybackPeriod: '2 days',
      fiveYearROI: '49,900%'
    }
  },
  'treatment-recommendation': {
    painPoints: [
      'Treatment decisions based on limited data miss 40% of options',
      'Clinical guidelines outdated by 3-5 years on average',
      'Medication errors affect 1.5M patients annually',
      'Personalized medicine adoption below 20%'
    ],
    businessCase: {
      title: 'AI-Powered Treatment Intelligence',
      points: [
        'Improve treatment outcomes by 45%',
        'Reduce adverse events by 60%',
        'Cut treatment costs by 30%',
        'Enable precision medicine at scale'
      ]
    },
    technicalApproach: {
      title: 'Evidence-Based Treatment AI',
      points: [
        'Real-time analysis of 10M+ studies',
        'Genomic and phenotypic matching',
        'Drug interaction prediction',
        'Outcome simulation modeling'
      ]
    },
    benefits: [
      'Personalized treatment plans',
      'Real-time clinical decision support',
      'Reduced trial-and-error prescribing',
      'Improved patient satisfaction'
    ],
    examples: [
      'MD Anderson IBM Watson: $62M spent on failed AI cancer treatment system',
      'Google Health: Mammography AI missed cancers in real-world deployment',
      'Epic Systems: Treatment recommendations ignored 68% of time by physicians',
      'Theranos: False treatment recommendations based on fraudulent testing'
    ],
    vanguardImpact: [
      'MD Anderson: Would have delivered working system with 45% better outcomes',
      'Google Health: Could have achieved 94% accuracy with proper clinical integration',
      'Epic: Would have gained physician trust with explainable AI recommendations',
      'Theranos: Could have prevented patient harm with validated AI diagnostics'
    ],
    roi: {
      implementation: '$4M',
      annualSavings: '$80M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '3,900%'
    }
  },
  'diagnosis-assistant': {
    painPoints: [
      'Diagnostic errors affect 12M Americans annually',
      'Average diagnosis takes 3.7 visits over 2 months',
      'Rare disease diagnosis averages 7.6 years',
      'Physician burnout reducing diagnostic accuracy'
    ],
    businessCase: {
      title: 'AI Diagnostic Intelligence Platform',
      points: [
        'Achieve 95% diagnostic accuracy',
        'Reduce time to diagnosis by 70%',
        'Identify rare diseases 5 years earlier',
        'Save $50M in misdiagnosis costs'
      ]
    },
    technicalApproach: {
      title: 'Multi-Modal Diagnostic AI',
      points: [
        'Integration of imaging, labs, and clinical data',
        'Differential diagnosis generation',
        'Rare disease pattern recognition',
        'Continuous learning from outcomes'
      ]
    },
    benefits: [
      'Earlier disease detection',
      'Reduced diagnostic errors',
      'Physician decision support',
      'Patient outcome improvement'
    ],
    examples: [
      'Missed diagnoses: 12M Americans affected annually, 40,000-80,000 deaths',
      'Rare diseases: Average 7.6 years to diagnosis, visiting 8+ doctors',
      'Emergency departments: 1 in 18 patients misdiagnosed, 250,000 deaths/year',
      'Cancer misdiagnosis: 28% of cases, delaying critical treatment'
    ],
    vanguardImpact: [
      'Would prevent 70,000 deaths annually through accurate early diagnosis',
      'Could diagnose rare diseases in months not years, saving lives',
      'Would reduce ED misdiagnosis to <1%, preventing 200,000 deaths',
      'Could catch 95% of cancers early when most treatable'
    ],
    roi: {
      implementation: '$5M',
      annualSavings: '$100M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '3,900%'
    }
  },
  'medical-supply-chain': {
    painPoints: [
      'COVID exposed critical supply chain vulnerabilities',
      'Stockouts affect 25% of critical supplies monthly',
      'Manual ordering wastes $18B annually',
      'Crisis response time averages 3-4 weeks'
    ],
    businessCase: {
      title: 'Autonomous Medical Supply Chain AI',
      points: [
        'Prevent 99% of critical stockouts',
        'Reduce inventory costs by 35%',
        'Enable 24-hour crisis response',
        'Save $30M annually per hospital'
      ]
    },
    technicalApproach: {
      title: 'Predictive Supply Chain Orchestration',
      points: [
        'Demand forecasting with epidemic modeling',
        'Multi-tier supplier visibility',
        'Autonomous ordering and routing',
        'Crisis scenario simulation'
      ]
    },
    benefits: [
      'Zero stockouts of critical supplies',
      'Optimized inventory levels',
      'Rapid crisis response capability',
      'Cost reduction through efficiency'
    ],
    examples: [
      'COVID-19 PPE Crisis: US hospitals faced 90% PPE shortage, risking healthcare collapse',
      'Hurricane Maria: Puerto Rico medical supplies depleted, 3,000+ excess deaths',
      'Saline shortage 2018: 49% of hospitals rationed critical IV fluids',
      'EpiPen shortage: Life-threatening for 3.6M Americans with severe allergies'
    ],
    vanguardImpact: [
      'COVID: Would have predicted PPE needs 60 days early, preventing all shortages',
      'Maria: Could have pre-positioned supplies, preventing 2,500+ deaths',
      'Saline: Would have identified production issues early, avoiding rationing',
      'EpiPen: Could have ensured continuous supply through predictive ordering'
    ],
    roi: {
      implementation: '$3M',
      annualSavings: '$30M+',
      paybackPeriod: '1 month',
      fiveYearROI: '1,900%'
    }
  },
  'portfolio-optimization': {
    painPoints: [
      'Human portfolio managers underperform indices by 2.5%',
      'Risk assessment misses 60% of black swan events',
      'Rebalancing delays cost 1.8% annually',
      'ESG integration remains largely manual'
    ],
    businessCase: {
      title: 'AI-Driven Portfolio Intelligence',
      points: [
        'Outperform benchmarks by 4-6%',
        'Reduce risk-adjusted volatility 40%',
        'Achieve true ESG integration',
        'Save $20M in management costs'
      ]
    },
    technicalApproach: {
      title: 'Quantum-Inspired Portfolio AI',
      points: [
        'Multi-factor optimization across 10K+ signals',
        'Real-time risk decomposition',
        'Alternative data integration',
        'Reinforcement learning strategies'
      ]
    },
    benefits: [
      'Superior risk-adjusted returns',
      'Automated rebalancing',
      'ESG compliance tracking',
      'Tax optimization'
    ],
    examples: [
      'Archegos Capital: $20B loss from concentrated positions and poor risk management',
      'Melvin Capital: $6.8B loss on GameStop, fund shut down after 22 years',
      'LTCM: Nobel laureates\' fund collapsed, requiring $3.6B bailout',
      'Madoff: $65B Ponzi scheme undetected by traditional oversight'
    ],
    vanguardImpact: [
      'Archegos: Would have flagged concentration risk weeks early, preventing collapse',
      'Melvin: Could have detected short squeeze risk, avoiding catastrophic loss',
      'LTCM: Would have identified leverage danger, preventing systemic risk',
      'Madoff: Could have exposed fraud through return pattern analysis'
    ],
    roi: {
      implementation: '$5M',
      annualSavings: '$200M+',
      paybackPeriod: '1 week',
      fiveYearROI: '7,900%'
    }
  },
  'aml-monitoring': {
    painPoints: [
      'Money laundering costs 2-5% of global GDP ($2T)',
      'Current systems flag 98% false positives',
      'Investigation costs average $50K per alert',
      'Regulatory fines exceeded $10B in 2023'
    ],
    businessCase: {
      title: 'Next-Gen AML Intelligence Platform',
      points: [
        'Reduce false positives by 85%',
        'Detect complex schemes 90% faster',
        'Cut investigation costs by 70%',
        'Ensure 100% regulatory compliance'
      ]
    },
    technicalApproach: {
      title: 'Behavioral AML Analytics',
      points: [
        'Graph neural networks for relationship mapping',
        'Behavioral biometrics integration',
        'Cross-institution pattern detection',
        'Explainable AI for regulators'
      ]
    },
    benefits: [
      'Higher detection accuracy',
      'Reduced compliance costs',
      'Faster investigation closure',
      'Regulatory confidence'
    ],
    examples: [
      'HSBC: $1.9B fine for laundering Mexican cartel money',
      'Danske Bank: €200B money laundering scandal through Estonian branch',
      'Wells Fargo: $3B fine for fake accounts and AML failures',
      'Deutsche Bank: $630M fine for $10B Russian money laundering'
    ],
    vanguardImpact: [
      'HSBC: Would have detected cartel patterns immediately, preventing all laundering',
      'Danske: Could have identified suspicious flows day one, not after 8 years',
      'Wells Fargo: Would have caught fake accounts and AML violations instantly',
      'Deutsche: Could have blocked mirror trades automatically, saving $630M'
    ],
    roi: {
      implementation: '$8M',
      annualSavings: '$150M+',
      paybackPeriod: '3 weeks',
      fiveYearROI: '3,600%'
    }
  },
  'insurance-risk': {
    painPoints: [
      'Traditional underwriting misses 45% of risk factors',
      'Claims processing takes 30+ days on average',
      'Fraud accounts for 10% of claims ($80B)',
      'Customer acquisition costs rising 20% annually'
    ],
    businessCase: {
      title: 'AI-Powered Insurance Platform',
      points: [
        'Improve risk prediction by 60%',
        'Process claims in <24 hours',
        'Detect 95% of fraudulent claims',
        'Reduce acquisition costs by 40%'
      ]
    },
    technicalApproach: {
      title: 'Comprehensive Risk Intelligence',
      points: [
        'Alternative data for risk assessment',
        'Computer vision for claims processing',
        'Fraud detection neural networks',
        'Personalized pricing models'
      ]
    },
    benefits: [
      'More accurate underwriting',
      'Instant claims settlement',
      'Reduced fraud losses',
      'Improved customer experience'
    ],
    examples: [
      'State Farm: $7B in catastrophe losses from inadequate risk models',
      'AIG: $182B bailout after mispricing mortgage insurance risk',
      'Florida insurers: 6 companies failed after Hurricane Ian due to poor modeling',
      'Health insurers: $100B in COVID claims not predicted by any model'
    ],
    vanguardImpact: [
      'State Farm: Would have accurately priced catastrophe risk, avoiding $5B loss',
      'AIG: Could have detected mortgage risk accumulation, preventing collapse',
      'Florida: Would have ensured adequate reserves, preventing all failures',
      'Health: Could have modeled pandemic risk, saving $70B through preparation'
    ],
    roi: {
      implementation: '$6M',
      annualSavings: '$120M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '3,900%'
    }
  },
  'supply-chain': {
    painPoints: [
      'Supply chain disruptions cost $4T globally in 2023',
      'Visibility limited to tier-1 suppliers (12% of chain)',
      'Demand forecast accuracy below 60%',
      'Manual planning takes weeks with suboptimal results'
    ],
    businessCase: {
      title: 'Autonomous Supply Chain AI',
      points: [
        'Achieve 95% forecast accuracy',
        'Enable full n-tier visibility',
        'Reduce disruption impact by 80%',
        'Cut inventory costs by 30%'
      ]
    },
    technicalApproach: {
      title: 'End-to-End Supply Intelligence',
      points: [
        'Digital twin of entire supply network',
        'Predictive disruption modeling',
        'Autonomous planning and execution',
        'Multi-objective optimization'
      ]
    },
    benefits: [
      'Resilient supply networks',
      'Optimized inventory levels',
      'Proactive risk mitigation',
      'Sustainable operations'
    ],
    examples: [
      'Ever Given Suez blockage: $400M ship blocked $10B daily global trade for 6 days',
      'Toyota 2011: Japan tsunami shut production globally, $210M daily losses',
      'KFC UK 2018: Chicken shortage closed 900 stores due to logistics failure',
      'PPE shortage 2020: 90% of hospitals without critical supplies'
    ],
    vanguardImpact: [
      'Suez: Would have rerouted supply chains in hours, saving $50B globally',
      'Toyota: Could have activated alternate suppliers immediately, saving $1.5B',
      'KFC: Would have prevented shortage through predictive logistics',
      'PPE: Could have secured supplies 60 days early through demand sensing'
    ],
    roi: {
      implementation: '$5M',
      annualSavings: '$100M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '3,900%'
    }
  },
  'price-optimization': {
    painPoints: [
      'Static pricing leaves 15-25% margin on table',
      'Competitor price changes missed 70% of time',
      'Markdown timing costs 8% of revenue',
      'Price elasticity poorly understood'
    ],
    businessCase: {
      title: 'Dynamic Pricing Intelligence',
      points: [
        'Increase margins by 20%',
        'Reduce inventory waste by 50%',
        'Respond to competition in real-time',
        'Optimize across 1M+ SKUs'
      ]
    },
    technicalApproach: {
      title: 'Real-Time Price Optimization',
      points: [
        'Demand sensing and prediction',
        'Competitive intelligence integration',
        'Customer willingness-to-pay modeling',
        'Reinforcement learning optimization'
      ]
    },
    benefits: [
      'Maximized revenue and margin',
      'Reduced obsolete inventory',
      'Competitive advantage',
      'Customer satisfaction'
    ],
    examples: [
      'JCPenney: "Everyday pricing" strategy failed, lost $4B and filed bankruptcy',
      'Uber: Surge pricing backlash during emergencies damaged brand trust',
      'Amazon: Dynamic pricing glitches caused items to price at $1M+',
      'Airlines: Price discrimination lawsuits for charging different fares'
    ],
    vanguardImpact: [
      'JCPenney: Would have optimized pricing dynamically, preventing bankruptcy',
      'Uber: Could have implemented ethical surge limits, maintaining trust',
      'Amazon: Would have caught pricing errors instantly, avoiding PR disasters',
      'Airlines: Could have ensured fair pricing while maximizing revenue legally'
    ],
    roi: {
      implementation: '$3M',
      annualSavings: '$60M+',
      paybackPeriod: '2 weeks',
      fiveYearROI: '3,900%'
    }
  },
  'warehouse-automation': {
    painPoints: [
      'Manual picking errors affect 10% of orders',
      'Labor costs rising 15% annually with shortages',
      'Space utilization below 60% in most facilities',
      'Peak season requires 3x temporary staff'
    ],
    businessCase: {
      title: 'AI-Orchestrated Warehouse Platform',
      points: [
        'Achieve 99.9% order accuracy',
        'Reduce labor costs by 70%',
        'Increase throughput by 300%',
        'Optimize space utilization to 95%'
      ]
    },
    technicalApproach: {
      title: 'Intelligent Automation Orchestration',
      points: [
        'Multi-robot coordination AI',
        'Computer vision quality control',
        'Predictive maintenance systems',
        'Dynamic slotting optimization'
      ]
    },
    benefits: [
      'Near-perfect order accuracy',
      'Reduced operational costs',
      'Scalable peak handling',
      'Improved worker safety'
    ],
    examples: [
      'Target Canada: Supply chain failures led to empty shelves, $2B loss, market exit',
      'Walmart: Holiday 2021 inventory pileup cost $500M in markdowns',
      'Nike: Vietnam factory closures created 10-week delays, $600M lost sales',
      'Amazon: 2021 warehouse injuries 2x industry average, facing regulations'
    ],
    vanguardImpact: [
      'Target Canada: Would have optimized inventory flow, preventing $2B loss',
      'Walmart: Could have predicted demand accurately, avoiding overstock',
      'Nike: Would have rerouted production instantly, saving $600M',
      'Amazon: Could reduce injuries 80% through ergonomic automation'
    ],
    roi: {
      implementation: '$10M',
      annualSavings: '$50M+',
      paybackPeriod: '2 months',
      fiveYearROI: '900%'
    }
  },
  'student-performance': {
    painPoints: [
      '30% of students at risk of dropping out unidentified',
      'Intervention timing off by average 6 months',
      'One-size-fits-all approach fails 40% of learners',
      'Teacher workload prevents personalized attention'
    ],
    businessCase: {
      title: 'Predictive Student Success AI',
      points: [
        'Identify at-risk students 85% earlier',
        'Improve graduation rates by 25%',
        'Reduce dropout rates by 40%',
        'Save $15K per retained student'
      ]
    },
    technicalApproach: {
      title: 'Holistic Performance Analytics',
      points: [
        'Multi-factor risk modeling',
        'Learning pattern analysis',
        'Social-emotional indicators',
        'Personalized intervention matching'
      ]
    },
    benefits: [
      'Early intervention capability',
      'Improved student outcomes',
      'Reduced teacher workload',
      'Higher institutional rankings'
    ],
    examples: [
      'US colleges: 40% of students drop out, costing them $100K+ in debt with no degree',
      'Achievement gap: Low-income students graduate 14% vs 60% high-income',
      'COVID learning loss: Students lost 5 months of learning, widening gaps',
      'Mental health crisis: 60% of students report overwhelming anxiety'
    ],
    vanguardImpact: [
      'Would identify at-risk students week 1, preventing 30% of dropouts',
      'Could provide targeted support to close achievement gap by 70%',
      'Would have prevented learning loss through personalized interventions',
      'Could detect mental health needs early, connecting students to help'
    ],
    roi: {
      implementation: '$2M',
      annualSavings: '$30M+',
      paybackPeriod: '1 month',
      fiveYearROI: '2,900%'
    }
  },
  'content-recommendation': {
    painPoints: [
      'Students spend 2.5 hours searching with 68% using poor resources',
      'Content market fragmented with 43% containing errors',
      'Learning style mismatches reduce retention 60%',
      'Supplemental spending $1,200/student with 67% unused'
    ],
    businessCase: {
      title: 'Smart Learning Content AI',
      points: [
        'Improve comprehension 52%',
        'Reduce study time 28%',
        'Save students $18M in materials',
        'Increase GPA from 2.9 to 3.3'
      ]
    },
    technicalApproach: {
      title: 'Personalized Content Matching',
      points: [
        'BERT analysis of 10M+ resources',
        'Collaborative filtering with pedagogy',
        'Multi-modal format conversion',
        'A/B testing optimization'
      ]
    },
    benefits: [
      'Personalized recommendations from 10M+ resources',
      'Quality scoring filtering 43% poor content',
      'Automatic multi-modal delivery',
      'Study time optimization reducing by 35%'
    ],
    examples: [
      'Pearson MyLab: 34% satisfaction rate, students report minimal learning improvement',
      'McGraw Hill Connect: 67% of students found platform demotivating and unhelpful',
      'Chegg: Students resort to piracy due to $1,200 annual textbook costs',
      'Cengage: Unlimited model still costs $120/term with limited relevant content'
    ],
    vanguardImpact: [
      'Pearson: Would achieve 85% satisfaction with truly personalized content',
      'McGraw Hill: Could motivate students with AI-matched learning styles',
      'Chegg: Would provide free, high-quality alternatives to expensive texts',
      'Cengage: Could deliver exactly what each student needs for $20/term'
    ],
    roi: {
      implementation: '$1.5M',
      annualSavings: '$58M+',
      paybackPeriod: '1 week',
      fiveYearROI: '7,600%'
    }
  },
  'multi-vertical-optimization': {
    painPoints: [
      'Siloed optimization misses cross-industry synergies',
      'Best practices trapped within vertical boundaries',
      'Duplicate solutions developed across industries',
      'Innovation limited by narrow perspective'
    ],
    businessCase: {
      title: 'Cross-Industry Optimization Platform',
      points: [
        'Unlock 30% efficiency gains through cross-pollination',
        'Reduce solution development time by 60%',
        'Enable breakthrough innovations from pattern transfer',
        'Create $500M+ in new value opportunities'
      ]
    },
    technicalApproach: {
      title: 'Multi-Vertical AI Orchestration',
      points: [
        'Pattern recognition across 12+ industries',
        'Transfer learning for solution adaptation',
        'Cross-functional optimization algorithms',
        'Universal performance benchmarking'
      ]
    },
    benefits: [
      'Apply successful patterns across industries',
      'Accelerate innovation through knowledge transfer',
      'Optimize resources across vertical boundaries',
      'Create new hybrid solutions'
    ],
    examples: [
      'Manufacturing techniques improving healthcare efficiency',
      'Financial algorithms optimizing energy trading',
      'Retail personalization enhancing government services',
      'Logistics optimization transforming supply chains'
    ],
    roi: {
      implementation: '$8M',
      annualSavings: '$500M+',
      paybackPeriod: '6 days',
      fiveYearROI: '12,400%'
    }
  },
  'industry-benchmarking': {
    painPoints: [
      'Performance comparisons limited to same industry',
      'Benchmarking data outdated by 6-12 months',
      'Manual analysis misses 80% of insights',
      'Best practices remain hidden in data silos'
    ],
    businessCase: {
      title: 'Real-Time Universal Benchmarking',
      points: [
        'Enable cross-industry performance insights',
        'Provide real-time benchmarking data',
        'Identify best practices automatically',
        'Create competitive advantages'
      ]
    },
    technicalApproach: {
      title: 'Universal Benchmarking AI',
      points: [
        'Cross-industry data normalization',
        'Real-time KPI tracking',
        'Best practice extraction',
        'Competitive intelligence'
      ]
    },
    benefits: [
      'Discover cross-industry innovations',
      'Real-time competitive positioning',
      'Automated best practice adoption',
      'Data-driven strategic decisions'
    ],
    examples: [
      'Gartner: Universal benchmarking platform',
      'McKinsey: Cross-industry insights',
      'Forrester: Real-time analytics',
      'IDC: Best practice automation'
    ],
    roi: {
      implementation: '$6M',
      annualSavings: '$300M+',
      paybackPeriod: '1 week',
      fiveYearROI: '9,900%'
    }
  }
};

// Deployment logs configuration for all use cases
const deploymentLogsConfig: { [key: string]: any } = {
  'oilfield-lease': {
    initial: 'Initializing Vanguard orchestration engine...',
    connections: [
      { message: 'Connecting to ERP systems (SAP, Oracle)...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Establishing GIS database connection...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Linking to Contract Lifecycle Management (CLM)...', type: 'Integration Agent', workflow: 'Data Collection' }
    ],
    dataCollection: [
      { message: 'Loading lease data from CLM...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Retrieved 1,247 active leases', type: 'Integration Agent', workflow: 'Data Collection', logType: 'info' },
      { message: 'Synchronizing with production databases...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Cross-referencing mineral rights records...', type: 'Security Agent', workflow: 'Rights Validation' }
    ],
    analysis: [
      { message: 'Vanguards analyzing lease portfolio...', type: 'System', workflow: 'General' },
      { message: 'Analyzing lease expiration dates', type: 'Accuracy Agent', workflow: 'Lease Analysis', logType: 'info' },
      { message: 'Cross-referencing with production data', type: 'Integrity Agent', workflow: 'Data Validation', logType: 'info' },
      { message: 'Calculating risk scores for each lease', type: 'Optimization Agent', workflow: 'Risk Assessment', logType: 'info' },
      { message: 'Identifying strategic importance factors', type: 'Analysis Agent', workflow: 'Lease Analysis', logType: 'info' }
    ],
    execution: [
      { message: 'Executing autonomous actions...', type: 'System', workflow: 'General' },
      { message: 'Auto-renewed 23 low-risk leases', type: 'Negotiation Agent', workflow: 'Lease Renewal', logType: 'success' },
      { message: 'Escalated 5 high-value leases for review', type: 'Optimization Agent', workflow: 'Risk Assessment', logType: 'warning' },
      { message: 'Detected 3 leases with environmental compliance issues', type: 'Compliance Agent', workflow: 'Compliance Check', logType: 'warning' },
      { message: 'Optimized payment terms saving $2.3M annually', type: 'Optimization Agent', workflow: 'Financial Optimization', logType: 'success' },
      { message: 'Validated mineral rights for 156 properties', type: 'Security Agent', workflow: 'Rights Validation', logType: 'success' },
      { message: 'Generated 8 renewal packages for medium-risk leases', type: 'Negotiation Agent', workflow: 'Lease Renewal', logType: 'info' },
      { message: 'Flagged 12 leases requiring title cure', type: 'Integrity Agent', workflow: 'Data Validation', logType: 'warning' }
    ],
    completion: 'Orchestration complete. Systems updated.'
  },
  'grid-anomaly': {
    initial: 'Initializing Grid Anomaly Detection System...',
    connections: [
      { message: 'Connecting to SCADA systems...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Establishing PMU data streams...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Linking to weather monitoring services...', type: 'Integration Agent', workflow: 'Data Collection' }
    ],
    dataCollection: [
      { message: 'Streaming real-time grid telemetry...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Processing 45,000 sensor readings per second', type: 'Monitoring Agent', workflow: 'Grid Monitoring', logType: 'info' },
      { message: 'Analyzing historical outage patterns...', type: 'Analysis Agent', workflow: 'Pattern Analysis' },
      { message: 'Correlating weather data with grid conditions...', type: 'Prediction Agent', workflow: 'Predictive Analysis' }
    ],
    analysis: [
      { message: 'Vanguards analyzing grid stability...', type: 'System', workflow: 'General' },
      { message: 'Detected voltage irregularity in Sector 7', type: 'Monitoring Agent', workflow: 'Grid Monitoring', logType: 'warning' },
      { message: 'Identified potential transformer overload', type: 'Accuracy Agent', workflow: 'Anomaly Detection', logType: 'warning' },
      { message: 'Predicting cascade failure risk: 15%', type: 'Prediction Agent', workflow: 'Risk Assessment', logType: 'info' },
      { message: 'Analyzing load distribution patterns', type: 'Optimization Agent', workflow: 'Load Balancing', logType: 'info' }
    ],
    execution: [
      { message: 'Executing grid protection protocols...', type: 'System', workflow: 'General' },
      { message: 'Rerouted power flow to prevent overload', type: 'Response Agent', workflow: 'Grid Response', logType: 'success' },
      { message: 'Dispatched maintenance crew to Substation 12', type: 'Response Agent', workflow: 'Maintenance Dispatch', logType: 'info' },
      { message: 'Activated demand response for 2,500 customers', type: 'Optimization Agent', workflow: 'Demand Management', logType: 'success' },
      { message: 'Prevented outage affecting 4.5M customers', type: 'Response Agent', workflow: 'Outage Prevention', logType: 'success' },
      { message: 'Grid stability restored to 99.99%', type: 'Monitoring Agent', workflow: 'Grid Monitoring', logType: 'success' },
      { message: 'Generated incident report for regulatory filing', type: 'Compliance Agent', workflow: 'Compliance Reporting', logType: 'info' }
    ],
    completion: 'Grid anomaly mitigation complete. All systems stable.'
  },
  'patient-risk': {
    initial: 'Initializing Patient Risk Stratification System...',
    connections: [
      { message: 'Connecting to Electronic Health Records (EHR)...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Establishing claims database connection...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Linking to social determinants database...', type: 'Integration Agent', workflow: 'Data Collection' }
    ],
    dataCollection: [
      { message: 'Loading patient cohort data...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Retrieved 5,000 patient records', type: 'Integration Agent', workflow: 'Data Collection', logType: 'info' },
      { message: 'Analyzing clinical history patterns...', type: 'Analysis Agent', workflow: 'Clinical Analysis' },
      { message: 'Processing social determinant factors...', type: 'Analysis Agent', workflow: 'Risk Factor Analysis' }
    ],
    analysis: [
      { message: 'Vanguards analyzing patient risk profiles...', type: 'System', workflow: 'General' },
      { message: 'Identified 127 high-risk patients', type: 'Accuracy Agent', workflow: 'Risk Stratification', logType: 'warning' },
      { message: 'Analyzing readmission probability scores', type: 'Prediction Agent', workflow: 'Predictive Analysis', logType: 'info' },
      { message: 'Evaluating intervention effectiveness', type: 'Optimization Agent', workflow: 'Treatment Optimization', logType: 'info' },
      { message: 'Assessing care gap opportunities', type: 'Analysis Agent', workflow: 'Care Gap Analysis', logType: 'info' }
    ],
    execution: [
      { message: 'Executing care coordination protocols...', type: 'System', workflow: 'General' },
      { message: 'Generated 127 personalized care plans', type: 'Optimization Agent', workflow: 'Care Planning', logType: 'success' },
      { message: 'Scheduled 23 immediate interventions', type: 'Response Agent', workflow: 'Care Coordination', logType: 'warning' },
      { message: 'Notified care teams for 45 high-risk patients', type: 'Response Agent', workflow: 'Team Notification', logType: 'info' },
      { message: 'Initiated remote monitoring for 59 patients', type: 'Monitoring Agent', workflow: 'Patient Monitoring', logType: 'success' },
      { message: 'Projected 45% reduction in readmissions', type: 'Prediction Agent', workflow: 'Outcome Prediction', logType: 'success' },
      { message: 'Estimated $15M in cost savings', type: 'Optimization Agent', workflow: 'Cost Analysis', logType: 'success' }
    ],
    completion: 'Patient risk stratification complete. Care plans deployed.'
  },
  'fraud-detection': {
    initial: 'Initializing Real-Time Fraud Detection System...',
    connections: [
      { message: 'Connecting to payment processing networks...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Establishing card network connections...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Linking to behavioral analytics engine...', type: 'Integration Agent', workflow: 'Data Collection' }
    ],
    dataCollection: [
      { message: 'Streaming transaction data in real-time...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Processing 50,000 transactions per second', type: 'Monitoring Agent', workflow: 'Transaction Monitoring', logType: 'info' },
      { message: 'Loading historical fraud patterns...', type: 'Analysis Agent', workflow: 'Pattern Analysis' },
      { message: 'Analyzing device fingerprints...', type: 'Security Agent', workflow: 'Security Analysis' }
    ],
    analysis: [
      { message: 'Vanguards analyzing transaction patterns...', type: 'System', workflow: 'General' },
      { message: 'Detected 47 suspicious transactions', type: 'Monitoring Agent', workflow: 'Fraud Detection', logType: 'warning' },
      { message: 'Analyzing behavioral biometrics', type: 'Analysis Agent', workflow: 'Behavioral Analysis', logType: 'info' },
      { message: 'Calculating fraud probability scores', type: 'Accuracy Agent', workflow: 'Risk Scoring', logType: 'info' },
      { message: 'Cross-referencing with known fraud patterns', type: 'Security Agent', workflow: 'Pattern Matching', logType: 'info' }
    ],
    execution: [
      { message: 'Executing fraud prevention protocols...', type: 'System', workflow: 'General' },
      { message: 'Blocked 12 confirmed fraudulent transactions', type: 'Response Agent', workflow: 'Transaction Blocking', logType: 'success' },
      { message: 'Held 23 transactions for review', type: 'Response Agent', workflow: 'Transaction Review', logType: 'warning' },
      { message: 'Flagged 12 accounts for monitoring', type: 'Monitoring Agent', workflow: 'Account Monitoring', logType: 'info' },
      { message: 'Prevented $4.2M in potential fraud losses', type: 'Response Agent', workflow: 'Loss Prevention', logType: 'success' },
      { message: 'Maintained 2% false positive rate', type: 'Accuracy Agent', workflow: 'Accuracy Monitoring', logType: 'success' },
      { message: 'Generated SAR filing for compliance', type: 'Compliance Agent', workflow: 'Regulatory Reporting', logType: 'info' }
    ],
    completion: 'Fraud detection cycle complete. All threats neutralized.'
  },
  'predictive-maintenance': {
    initial: 'Initializing Predictive Maintenance System...',
    connections: [
      { message: 'Connecting to IoT sensor network...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Establishing CMMS integration...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Linking to equipment databases...', type: 'Integration Agent', workflow: 'Data Collection' }
    ],
    dataCollection: [
      { message: 'Collecting equipment telemetry data...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Monitoring 2,500 critical assets', type: 'Monitoring Agent', workflow: 'Asset Monitoring', logType: 'info' },
      { message: 'Analyzing vibration patterns...', type: 'Analysis Agent', workflow: 'Vibration Analysis' },
      { message: 'Processing temperature anomalies...', type: 'Analysis Agent', workflow: 'Thermal Analysis' }
    ],
    analysis: [
      { message: 'Vanguards analyzing equipment health...', type: 'System', workflow: 'General' },
      { message: 'Detected early failure indicators in 8 assets', type: 'Prediction Agent', workflow: 'Failure Prediction', logType: 'warning' },
      { message: 'Calculating remaining useful life', type: 'Accuracy Agent', workflow: 'Life Estimation', logType: 'info' },
      { message: 'Optimizing maintenance schedules', type: 'Optimization Agent', workflow: 'Schedule Optimization', logType: 'info' },
      { message: 'Analyzing spare parts requirements', type: 'Analysis Agent', workflow: 'Inventory Analysis', logType: 'info' }
    ],
    execution: [
      { message: 'Executing maintenance optimization...', type: 'System', workflow: 'General' },
      { message: 'Generated 8 preventive work orders', type: 'Response Agent', workflow: 'Work Order Creation', logType: 'success' },
      { message: 'Scheduled maintenance during planned downtime', type: 'Optimization Agent', workflow: 'Schedule Coordination', logType: 'success' },
      { message: 'Ordered critical spare parts proactively', type: 'Response Agent', workflow: 'Parts Ordering', logType: 'info' },
      { message: 'Prevented 3 critical equipment failures', type: 'Prediction Agent', workflow: 'Failure Prevention', logType: 'success' },
      { message: 'Achieved 99% equipment uptime', type: 'Monitoring Agent', workflow: 'Uptime Tracking', logType: 'success' },
      { message: 'Saved $2.5M in downtime costs', type: 'Optimization Agent', workflow: 'Cost Analysis', logType: 'success' }
    ],
    completion: 'Predictive maintenance cycle complete. All assets optimized.'
  },
  'demand-forecasting': {
    initial: 'Initializing Demand Forecasting System...',
    connections: [
      { message: 'Connecting to POS systems...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Establishing supply chain integration...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Linking to external data sources...', type: 'Integration Agent', workflow: 'Data Collection' }
    ],
    dataCollection: [
      { message: 'Loading historical sales data...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Processing data for 10,000+ SKUs', type: 'Analysis Agent', workflow: 'Data Processing', logType: 'info' },
      { message: 'Analyzing seasonal patterns...', type: 'Analysis Agent', workflow: 'Pattern Analysis' },
      { message: 'Incorporating weather forecasts...', type: 'Prediction Agent', workflow: 'External Data Integration' }
    ],
    analysis: [
      { message: 'Vanguards analyzing demand patterns...', type: 'System', workflow: 'General' },
      { message: 'Identified 156 trending products', type: 'Analysis Agent', workflow: 'Trend Analysis', logType: 'info' },
      { message: 'Predicting demand spikes for next 30 days', type: 'Prediction Agent', workflow: 'Demand Prediction', logType: 'info' },
      { message: 'Calculating optimal inventory levels', type: 'Optimization Agent', workflow: 'Inventory Optimization', logType: 'info' },
      { message: 'Analyzing price elasticity impacts', type: 'Analysis Agent', workflow: 'Price Analysis', logType: 'info' }
    ],
    execution: [
      { message: 'Executing inventory optimization...', type: 'System', workflow: 'General' },
      { message: 'Generated replenishment orders for 2,345 SKUs', type: 'Response Agent', workflow: 'Order Generation', logType: 'success' },
      { message: 'Adjusted safety stock levels', type: 'Optimization Agent', workflow: 'Stock Optimization', logType: 'success' },
      { message: 'Prevented 89 potential stockouts', type: 'Prediction Agent', workflow: 'Stockout Prevention', logType: 'success' },
      { message: 'Reduced overstock by 35%', type: 'Optimization Agent', workflow: 'Overstock Reduction', logType: 'success' },
      { message: 'Achieved 95% forecast accuracy', type: 'Accuracy Agent', workflow: 'Accuracy Tracking', logType: 'success' },
      { message: 'Projected $40M in inventory savings', type: 'Optimization Agent', workflow: 'Cost Analysis', logType: 'success' }
    ],
    completion: 'Demand forecasting complete. Inventory optimized.'
  },
  'route-optimization': {
    initial: 'Initializing Dynamic Route Optimization System...',
    connections: [
      { message: 'Connecting to fleet management system...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Establishing GPS tracking integration...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Linking to traffic data providers...', type: 'Integration Agent', workflow: 'Data Collection' }
    ],
    dataCollection: [
      { message: 'Loading delivery schedule data...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Tracking 500 vehicles in real-time', type: 'Monitoring Agent', workflow: 'Fleet Monitoring', logType: 'info' },
      { message: 'Analyzing traffic patterns...', type: 'Analysis Agent', workflow: 'Traffic Analysis' },
      { message: 'Processing customer time windows...', type: 'Analysis Agent', workflow: 'Schedule Analysis' }
    ],
    analysis: [
      { message: 'Vanguards optimizing delivery routes...', type: 'System', workflow: 'General' },
      { message: 'Calculated optimal routes for 300 deliveries', type: 'Optimization Agent', workflow: 'Route Calculation', logType: 'info' },
      { message: 'Identified 45 route consolidation opportunities', type: 'Analysis Agent', workflow: 'Route Analysis', logType: 'info' },
      { message: 'Predicting traffic delays on major routes', type: 'Prediction Agent', workflow: 'Traffic Prediction', logType: 'warning' },
      { message: 'Optimizing driver assignments', type: 'Optimization Agent', workflow: 'Driver Assignment', logType: 'info' }
    ],
    execution: [
      { message: 'Executing route optimization...', type: 'System', workflow: 'General' },
      { message: 'Dispatched optimized routes to 150 drivers', type: 'Response Agent', workflow: 'Route Dispatch', logType: 'success' },
      { message: 'Consolidated 45 routes saving 12 vehicles', type: 'Optimization Agent', workflow: 'Route Consolidation', logType: 'success' },
      { message: 'Rerouted 23 deliveries around traffic', type: 'Response Agent', workflow: 'Dynamic Rerouting', logType: 'info' },
      { message: 'Reduced total miles by 25%', type: 'Optimization Agent', workflow: 'Mileage Reduction', logType: 'success' },
      { message: 'Achieved 95% on-time delivery rate', type: 'Monitoring Agent', workflow: 'Performance Tracking', logType: 'success' },
      { message: 'Saved 20% in fuel costs', type: 'Optimization Agent', workflow: 'Cost Analysis', logType: 'success' }
    ],
    completion: 'Route optimization complete. All deliveries optimized.'
  },
  'default': {
    initial: 'Initializing Vanguard orchestration engine...',
    connections: [
      { message: 'Connecting to primary data sources...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Establishing system integrations...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Linking to external services...', type: 'Integration Agent', workflow: 'Data Collection' }
    ],
    dataCollection: [
      { message: 'Loading operational data...', type: 'Integration Agent', workflow: 'Data Collection' },
      { message: 'Processing incoming data streams...', type: 'Integration Agent', workflow: 'Data Collection', logType: 'info' },
      { message: 'Analyzing historical patterns...', type: 'Analysis Agent', workflow: 'Pattern Analysis' },
      { message: 'Validating data integrity...', type: 'Integrity Agent', workflow: 'Data Validation' }
    ],
    analysis: [
      { message: 'Vanguards analyzing use case data...', type: 'System', workflow: 'General' },
      { message: 'Performing risk assessment...', type: 'Accuracy Agent', workflow: 'Risk Assessment', logType: 'info' },
      { message: 'Optimizing operational parameters...', type: 'Optimization Agent', workflow: 'Optimization', logType: 'info' },
      { message: 'Generating predictive insights...', type: 'Prediction Agent', workflow: 'Predictive Analysis', logType: 'info' },
      { message: 'Evaluating compliance requirements...', type: 'Compliance Agent', workflow: 'Compliance Check', logType: 'info' }
    ],
    execution: [
      { message: 'Executing autonomous actions...', type: 'System', workflow: 'General' },
      { message: 'Implemented optimization strategies', type: 'Optimization Agent', workflow: 'Strategy Implementation', logType: 'success' },
      { message: 'Automated routine operations', type: 'Response Agent', workflow: 'Automation', logType: 'success' },
      { message: 'Generated compliance reports', type: 'Compliance Agent', workflow: 'Reporting', logType: 'info' },
      { message: 'Achieved target performance metrics', type: 'Monitoring Agent', workflow: 'Performance Tracking', logType: 'success' },
      { message: 'Systems updated with latest insights', type: 'System', workflow: 'System Update', logType: 'success' }
    ],
    completion: 'Orchestration complete. All systems optimized.'
  }
};

const MissionControl: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [selectedIndustry, setSelectedIndustry] = useState(industries[0]);
  const [selectedUseCase, setSelectedUseCase] = useState<any>(null);
  const [showExecutiveSummary, setShowExecutiveSummary] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'executive' | 'canvas' | 'workflows' | 'deployment' | 'operations' | 'logs' | 'outputs'>('executive');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isDeployed, setIsDeployed] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<any[]>([]);
  const [integrationLogs, setIntegrationLogs] = useState<any[]>([]);
  const [logFilters, setLogFilters] = useState({
    agent: 'all',
    workflow: 'all',
    eventType: 'all'
  });
  const [downloads, setDownloads] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [draggedAgent, setDraggedAgent] = useState<string | null>(null);
  const [loadingDataset, setLoadingDataset] = useState<string | null>(null);
  const [loadedDatasets, setLoadedDatasets] = useState<string[]>([]);
  const [expandedStages, setExpandedStages] = useState<{ [key: number]: boolean }>({});
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSIAModal, setShowSIAModal] = useState<'security' | 'integrity' | 'accuracy' | null>(null);
  const [operationsData, setOperationsData] = useState<{
    totalTasks: number;
    failedTasks: number;
    avgDuration: number;
    activities: any[];
    activeWorkflows: number;
  }>({
    totalTasks: 12847,
    failedTasks: 156,
    avgDuration: 2.3,
    activities: [] as any[],
    activeWorkflows: 0,
  });
  const [agentStats, setAgentStats] = useState<{ [key: string]: { tasksCompleted: number } }>({});
  const [onlineAgentsCount, setOnlineAgentsCount] = useState(0);
  
  // WebSocket integration for real-time updates
  const { on, off, emit, isConnected } = useWebSocket({
    onConnect: () => {
      console.log('WebSocket connected for Mission Control');
      // Subscribe to operations updates
      emit('subscribe:operations', { useCase: selectedUseCase?.id });
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected from Mission Control');
    }
  });

  // Industry color mapping for selected use cases
  const industrySelectedColors: { [key: string]: string } = {
    'all-verticals': 'bg-gray-600',
    'energy': 'bg-amber-600',
    'healthcare': 'bg-pink-600',
    'financial': 'bg-emerald-600',
    'manufacturing': 'bg-indigo-600',
    'retail': 'bg-violet-600',
    'logistics': 'bg-red-600',
    'education': 'bg-blue-600',
    'pharmaceutical': 'bg-green-600',
    'government': 'bg-gray-600',
    'telecommunications': 'bg-purple-600',
    'real-estate': 'bg-orange-600',
  };

  // Initialize agents when use case is selected
  useEffect(() => {
    if (selectedUseCase?.id) {
      const useCaseAgents = getAgentsForUseCase(selectedUseCase.id);
      if (useCaseAgents.length > 0) {
        setAgents(useCaseAgents);
      } else {
        // Fallback for use cases without configured agents yet
        setAgents([]);
      }
    }
  }, [selectedUseCase]);

  // WebSocket event handlers for real-time updates
  const handleAgentStatusUpdate = useCallback((data: any) => {
    if (data.agentId && data.status) {
      setAgents(prevAgents =>
        prevAgents.map(agent =>
          agent.id === data.agentId
            ? { ...agent, status: data.status }
            : agent
        )
      );
      
      // Update online agents count
      if (data.status === 'active' || data.status === 'processing') {
        setOnlineAgentsCount(prev => Math.min(prev + 1, agents.length));
      } else if (data.status === 'inactive' || data.status === 'offline') {
        setOnlineAgentsCount(prev => Math.max(prev - 1, 0));
      }
    }
  }, [agents.length]);

  const handleWorkflowUpdate = useCallback((data: any) => {
    if (data.workflowId && data.status) {
      // Update active workflows count
      setOperationsData(prev => ({
        ...prev,
        activeWorkflows: data.activeCount || prev.activeWorkflows
      }));
    }
  }, []);

  const handleTaskComplete = useCallback((data: any) => {
    setOperationsData(prev => ({
      ...prev,
      totalTasks: prev.totalTasks + 1,
      failedTasks: data.status === 'failed' ? prev.failedTasks + 1 : prev.failedTasks
    }));
    
    // Update agent-specific stats
    if (data.agentId) {
      setAgentStats(prev => ({
        ...prev,
        [data.agentId]: {
          tasksCompleted: (prev[data.agentId]?.tasksCompleted || 0) + 1
        }
      }));
    }
    
    // Add to activity log
    const newActivity = {
      id: Date.now(),
      time: 'Just now',
      agent: data.agentName || 'Unknown Agent',
      action: data.action || 'Task completed',
      status: data.status === 'failed' ? 'error' : 'success'
    };
    
    setOperationsData(prev => ({
      ...prev,
      activities: [newActivity, ...prev.activities].slice(0, 8)
    }));
  }, []);

  const handleMetricsUpdate = useCallback((data: any) => {
    if (data.metrics) {
      setOperationsData(prev => ({
        ...prev,
        avgDuration: data.metrics.avgDuration || prev.avgDuration,
        totalTasks: data.metrics.totalTasks || prev.totalTasks,
        failedTasks: data.metrics.failedTasks || prev.failedTasks,
        activeWorkflows: data.metrics.activeWorkflows || prev.activeWorkflows
      }));
    }
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!isConnected || !selectedUseCase) return;

    // Subscribe to real-time events
    on('agent:status', handleAgentStatusUpdate);
    on('workflow:update', handleWorkflowUpdate);
    on('task:complete', handleTaskComplete);
    on('metrics:update', handleMetricsUpdate);
    
    // Subscribe to use case specific updates
    emit('subscribe:usecase', { useCaseId: selectedUseCase.id });

    return () => {
      off('agent:status', handleAgentStatusUpdate);
      off('workflow:update', handleWorkflowUpdate);
      off('task:complete', handleTaskComplete);
      off('metrics:update', handleMetricsUpdate);
      emit('unsubscribe:usecase', { useCaseId: selectedUseCase.id });
    };
  }, [isConnected, selectedUseCase, on, off, emit, handleAgentStatusUpdate, handleWorkflowUpdate, handleTaskComplete, handleMetricsUpdate]);

  // Auto-refresh operations data with WebSocket fallback
  useEffect(() => {
    if (!isDeployed || activeTab !== 'operations') return;

    // If WebSocket is not connected, fall back to polling
    if (!isConnected) {
      const updateOperationsData = () => {
      setOperationsData(prev => {
        // Increment completed tasks
        const newTotalTasks = prev.totalTasks + Math.floor(Math.random() * 5) + 1;
        
        // Occasionally add a failed task
        const newFailedTasks = Math.random() > 0.95 ? prev.failedTasks + 1 : prev.failedTasks;
        
        // Vary average duration slightly
        const newAvgDuration = (prev.avgDuration + (Math.random() * 0.4 - 0.2)).toFixed(1);
        
        // Update active workflows dynamically
        const newActiveWorkflows = Math.floor(Math.random() * 4) + 1;
        
        // Generate new activity based on use case
        const agentTypes = ['Security Agent', 'Integrity Agent', 'Accuracy Agent', 'Optimization Agent', 'Negotiation Agent', 'Monitoring Agent', 'Response Agent'];
        
        // Use case specific actions
        const actionsMap: { [key: string]: string[] } = {
          'oilfield-lease': [
            'Validated permissions for batch #',
            'Cross-referenced data sources for lease #',
            'Detected expiring lease: Property ID #',
            'Generated renewal strategy saving $',
            'Executed auto-renewal for lease #',
            'Completed security audit for portfolio #',
            'Verified compliance for workflow #',
            'Optimized terms for contract #',
          ],
          'grid-anomaly': [
            'Monitored grid sector #',
            'Detected voltage anomaly in zone #',
            'Analyzed transformer load at station #',
            'Prevented cascade failure saving $',
            'Rerouted power flow for circuit #',
            'Stabilized frequency to target Hz #',
            'Dispatched crew to substation #',
            'Optimized load distribution #',
          ],
          'patient-risk': [
            'Analyzed patient cohort #',
            'Identified high-risk patient ID #',
            'Generated care plan for patient #',
            'Scheduled intervention saving $',
            'Updated risk score for group #',
            'Notified care team for patient #',
            'Monitored vital signs for ID #',
            'Prevented readmission for case #',
          ],
          'fraud-detection': [
            'Analyzed transaction batch #',
            'Detected suspicious pattern in TX #',
            'Blocked fraudulent transaction $',
            'Flagged account for review #',
            'Verified legitimate transaction #',
            'Updated fraud model accuracy to #',
            'Generated SAR report #',
            'Prevented loss of $',
          ],
          'predictive-maintenance': [
            'Monitored equipment unit #',
            'Detected anomaly in asset #',
            'Predicted failure for machine #',
            'Scheduled maintenance for unit #',
            'Optimized spare parts for asset #',
            'Prevented downtime saving $',
            'Updated maintenance schedule #',
            'Analyzed vibration pattern #',
          ],
          'default': [
            'Processed data batch #',
            'Analyzed pattern set #',
            'Optimized workflow #',
            'Generated report #',
            'Updated system parameters #',
            'Completed task sequence #',
            'Verified compliance check #',
            'Executed action plan #',
          ]
        };
        
        const actions = actionsMap[selectedUseCase?.id || 'default'] || actionsMap['default'];
        
        const newActivity = {
          id: Date.now(),
          time: 'Just now',
          agent: agentTypes[Math.floor(Math.random() * agentTypes.length)],
          action: actions[Math.floor(Math.random() * actions.length)] + Math.floor(Math.random() * 9000 + 1000),
          status: Math.random() > 0.1 ? 'success' : 'warning',
        };
        
        // Update existing activities times
        const updatedActivities = prev.activities.map((activity, index) => {
          if (index === 0) return { ...activity, time: '5s ago' };
          if (index === 1) return { ...activity, time: '10s ago' };
          if (index === 2) return { ...activity, time: '15s ago' };
          if (index === 3) return { ...activity, time: '30s ago' };
          if (index === 4) return { ...activity, time: '45s ago' };
          if (index === 5) return { ...activity, time: '1m ago' };
          if (index === 6) return { ...activity, time: '2m ago' };
          return activity;
        });
        
        // Add new activity and keep only last 8
        const newActivities = [newActivity, ...updatedActivities].slice(0, 8);
        
        return {
          totalTasks: newTotalTasks,
          failedTasks: newFailedTasks,
          avgDuration: parseFloat(newAvgDuration),
          activities: newActivities,
          activeWorkflows: newActiveWorkflows,
        };
      });

      // Update online agents count dynamically
      setOnlineAgentsCount(prev => {
        if (!isDeployed) return 0;
        // Vary between 3-5 agents online
        const min = Math.max(3, agents.length - 2);
        const max = agents.length;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      });

      // Update agent-specific stats
      setAgentStats(prev => {
        const newStats = { ...prev };
        agents.forEach(agent => {
          if (!newStats[agent.id]) {
            newStats[agent.id] = { tasksCompleted: Math.floor(Math.random() * 500 + 100) };
          } else {
            // Increment tasks for active/processing agents
            if (agent.status === 'active' || agent.status === 'processing') {
              newStats[agent.id].tasksCompleted += Math.floor(Math.random() * 3);
            }
          }
        });
        return newStats;
      });

      // Randomly update agent statuses to simulate activity
      if (Math.random() > 0.7) {
        setAgents(prevAgents => {
          const updatedAgents = [...prevAgents];
          const randomIndex = Math.floor(Math.random() * updatedAgents.length);
          const statuses: Agent['status'][] = ['active', 'processing', 'completed'];
          updatedAgents[randomIndex] = {
            ...updatedAgents[randomIndex],
            status: statuses[Math.floor(Math.random() * statuses.length)]
          };
          return updatedAgents;
        });
      }
    };

    // Initial population of activities based on use case
    if (operationsData.activities.length === 0) {
      const initialActivitiesMap: { [key: string]: any[] } = {
        'oilfield-lease': [
          { id: 1, time: '2s ago', agent: 'Security Agent', action: 'Validated lease permissions for batch #1247', status: 'success' },
          { id: 2, time: '15s ago', agent: 'Integrity Agent', action: 'Cross-referenced data sources across ERP, GIS, and CLM systems', status: 'success' },
          { id: 3, time: '45s ago', agent: 'Accuracy Agent', action: 'Detected expiring lease: Property ID #8934 expires in 45 days', status: 'warning' },
          { id: 4, time: '1m ago', agent: 'Optimization Agent', action: 'Generated renewal strategy with projected savings of $2.3M', status: 'success' },
          { id: 5, time: '2m ago', agent: 'Negotiation Agent', action: 'Executed auto-renewal for 15 low-risk leases', status: 'success' },
        ],
        'grid-anomaly': [
          { id: 1, time: '2s ago', agent: 'Monitoring Agent', action: 'Detected voltage irregularity in Sector 7 transformer', status: 'warning' },
          { id: 2, time: '15s ago', agent: 'Response Agent', action: 'Rerouted power flow to prevent overload on Circuit 12', status: 'success' },
          { id: 3, time: '45s ago', agent: 'Prediction Agent', action: 'Forecasted 15% cascade failure risk for next 4 hours', status: 'warning' },
          { id: 4, time: '1m ago', agent: 'Optimization Agent', action: 'Balanced load distribution across 5 substations', status: 'success' },
          { id: 5, time: '2m ago', agent: 'Monitoring Agent', action: 'Grid stability maintained at 99.99% reliability', status: 'success' },
        ],
        'patient-risk': [
          { id: 1, time: '2s ago', agent: 'Accuracy Agent', action: 'Identified 23 patients with critical risk scores', status: 'warning' },
          { id: 2, time: '15s ago', agent: 'Optimization Agent', action: 'Generated personalized care plans for 127 patients', status: 'success' },
          { id: 3, time: '45s ago', agent: 'Response Agent', action: 'Scheduled immediate intervention for Patient ID #4521', status: 'warning' },
          { id: 4, time: '1m ago', agent: 'Prediction Agent', action: 'Projected 45% reduction in readmission rates', status: 'success' },
          { id: 5, time: '2m ago', agent: 'Monitoring Agent', action: 'Initiated remote monitoring for 59 at-risk patients', status: 'success' },
        ],
        'fraud-detection': [
          { id: 1, time: '2s ago', agent: 'Monitoring Agent', action: 'Blocked fraudulent transaction TX#98234 for $4,250', status: 'success' },
          { id: 2, time: '15s ago', agent: 'Analysis Agent', action: 'Detected suspicious pattern in account #7823', status: 'warning' },
          { id: 3, time: '45s ago', agent: 'Response Agent', action: 'Held 23 transactions for manual review', status: 'warning' },
          { id: 4, time: '1m ago', agent: 'Accuracy Agent', action: 'Maintained 2% false positive rate across 50K transactions', status: 'success' },
          { id: 5, time: '2m ago', agent: 'Security Agent', action: 'Updated fraud models with latest attack patterns', status: 'success' },
        ],
        'predictive-maintenance': [
          { id: 1, time: '2s ago', agent: 'Prediction Agent', action: 'Detected early failure indicators in Pump Unit #234', status: 'warning' },
          { id: 2, time: '15s ago', agent: 'Response Agent', action: 'Generated preventive work order for Motor #567', status: 'success' },
          { id: 3, time: '45s ago', agent: 'Monitoring Agent', action: 'Vibration anomaly detected in Compressor #891', status: 'warning' },
          { id: 4, time: '1m ago', agent: 'Optimization Agent', action: 'Scheduled maintenance during planned downtime window', status: 'success' },
          { id: 5, time: '2m ago', agent: 'Analysis Agent', action: 'Calculated 30-day failure probability at 87% for Unit #345', status: 'success' },
        ],
        'default': [
          { id: 1, time: '2s ago', agent: 'Security Agent', action: 'Validated system permissions for operation #1247', status: 'success' },
          { id: 2, time: '15s ago', agent: 'Integrity Agent', action: 'Cross-referenced data sources across integrated systems', status: 'success' },
          { id: 3, time: '45s ago', agent: 'Accuracy Agent', action: 'Detected anomaly requiring attention: Case #8934', status: 'warning' },
          { id: 4, time: '1m ago', agent: 'Optimization Agent', action: 'Generated optimization strategy with projected improvements', status: 'success' },
          { id: 5, time: '2m ago', agent: 'Response Agent', action: 'Executed automated actions for 15 routine tasks', status: 'success' },
        ]
      };
      
      const initialActivities = initialActivitiesMap[selectedUseCase?.id || 'default'] || initialActivitiesMap['default'];
      setOperationsData(prev => ({ ...prev, activities: initialActivities }));
    }

      // Update immediately, then every 5 seconds
      updateOperationsData();
      const interval = setInterval(updateOperationsData, 5000);

      return () => clearInterval(interval);
    }
  }, [isDeployed, activeTab, operationsData.activities.length, agents, isConnected]);

  const handleDeploy = async () => {
    if (!isDeployed) {
      setIsDeployed(true);
      // Activate all agents
      setAgents(prev => prev.map(agent => ({ ...agent, status: 'active' })));
      
      // Get deployment logs configuration for the selected use case
      const logsConfig = deploymentLogsConfig[selectedUseCase?.id || 'default'] || deploymentLogsConfig['default'];
      
      // Simulate deployment process with use-case specific logs
      addDeploymentLog(logsConfig.initial);
      
      // Stage 1: Connections (1 second)
      setTimeout(() => {
        logsConfig.connections.forEach((conn: any) => {
          addDeploymentLog(conn.message);
          if (conn.type && conn.workflow) {
            addIntegrationLog(conn.message.replace('...', ''), 'success', conn.type, conn.workflow);
          }
        });
      }, 1000);
      
      // Stage 2: Data Collection (2 seconds)
      setTimeout(() => {
        logsConfig.dataCollection.forEach((data: any) => {
          addDeploymentLog(data.message);
          if (data.type && data.workflow) {
            addIntegrationLog(data.message, data.logType || 'info', data.type, data.workflow);
          }
        });
      }, 2000);
      
      // Stage 3: Analysis (3 seconds)
      setTimeout(() => {
        addDeploymentLog(logsConfig.analysis[0].message);
        setAgents(prev => prev.map(agent => ({ ...agent, status: 'processing' })));
        
        // Add detailed analysis logs
        logsConfig.analysis.slice(1).forEach((analysis: any) => {
          if (analysis.type && analysis.workflow) {
            addIntegrationLog(analysis.message, analysis.logType || 'info', analysis.type, analysis.workflow);
          }
        });
      }, 3000);
      
      // Stage 4: Execution (4 seconds)
      setTimeout(() => {
        addDeploymentLog(logsConfig.execution[0].message);
        
        // Add detailed execution logs
        logsConfig.execution.slice(1).forEach((exec: any) => {
          if (exec.type && exec.workflow) {
            addIntegrationLog(exec.message, exec.logType || 'success', exec.type, exec.workflow);
          }
        });
      }, 4000);
      
      // Stage 5: Completion (5 seconds)
      setTimeout(() => {
        setAgents(prev => prev.map(agent => ({ ...agent, status: 'completed' })));
        addDeploymentLog(logsConfig.completion);
        // Call async function properly
        generateDownloads().catch(error => {
          console.error('Error generating downloads:', error);
          addDeploymentLog('⚠️ Error loading reports - please try again');
        });
      }, 5000);
    } else {
      // Stop deployment
      setIsDeployed(false);
      setAgents(prev => prev.map(agent => ({ ...agent, status: 'inactive' })));
      addDeploymentLog('Orchestration stopped by user.');
    }
  };

  const addDeploymentLog = (message: string) => {
    setDeploymentLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message,
    }]);
  };

  const addIntegrationLog = (message: string, type: 'info' | 'success' | 'warning' | 'error', agent?: string, workflow?: string) => {
    setIntegrationLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message,
      type,
      agent: agent || 'System',
      workflow: workflow || 'General',
    }]);
  };

  const generateDownloads = async () => {
    try {
      // Use the generic reports service to get reports for the selected use case
      const reports = await genericReportsService.getReports(selectedUseCase?.id || 'default');
      setDownloads(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Optionally, you could show an error notification here
    }
  };

  const handleAgentDragStart = (agentId: string) => {
    setDraggedAgent(agentId);
  };

  const handleAgentDragEnd = (e: React.DragEvent, agentId: string) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, position: { x, y } }
          : agent
      ));
    }
    setDraggedAgent(null);
  };

  const getAgentColor = (type: Agent['type']) => {
    const colors = {
      security: 'from-blue-500 to-blue-600',
      integrity: 'from-red-500 to-red-600',
      accuracy: 'from-green-500 to-green-600',
      optimization: 'from-purple-500 to-purple-600',
      negotiation: 'from-amber-500 to-amber-600',
      prediction: 'from-indigo-500 to-indigo-600',
      monitoring: 'from-cyan-500 to-cyan-600',
      compliance: 'from-yellow-500 to-yellow-600',
      analysis: 'from-pink-500 to-pink-600',
      response: 'from-orange-500 to-orange-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getAgentIcon = (type: Agent['type']) => {
    switch (type) {
      case 'security':
        return <SecurityIcon />;
      case 'integrity':
        return <IntegrityIcon />;
      case 'accuracy':
        return <AccuracyIcon />;
      case 'optimization':
        return <CpuChipIcon className="h-6 w-6" />;
      case 'negotiation':
        return <SparklesIcon className="h-6 w-6" />;
      case 'prediction':
        return <ChartPieIcon className="h-6 w-6" />;
      case 'monitoring':
        return <ChartBarIcon className="h-6 w-6" />;
      case 'compliance':
        return <ShieldCheckIcon className="h-6 w-6" />;
      case 'analysis':
        return <BeakerIcon className="h-6 w-6" />;
      case 'response':
        return <BoltIcon className="h-6 w-6" />;
      default:
        return <CpuChipIcon className="h-6 w-6" />;
    }
  };

  const getAgentStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />;
      case 'processing':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  // Custom Security Icon - Shield with Plus (EXACT match)
  const SecurityIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path
        d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M12 8v8M8 12h8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );

  // Custom Integrity Icon - Sword (EXACT match)
  const IntegrityIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="12" cy="4" r="1.5"/>
      <rect x="10.5" y="5.5" width="3" height="3" rx="0.5"/>
      <rect x="8" y="8.5" width="8" height="1"/>
      <rect x="11.5" y="9.5" width="1" height="10"/>
      <path d="M10 19.5L12 22l2-2.5v-10h-4v10z"/>
    </svg>
  );

  // Custom Accuracy Icon - Scales (EXACT match)
  const AccuracyIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="12" cy="3" r="1"/>
      <rect x="11.5" y="3" width="1" height="14"/>
      <rect x="5" y="6" width="14" height="1"/>
      <rect x="5.5" y="7" width="1" height="3"/>
      <rect x="17.5" y="7" width="1" height="3"/>
      <path d="M2 10h8l-4 5z"/>
      <path d="M14 10h8l-4 5z"/>
      <rect x="8" y="17" width="8" height="1"/>
    </svg>
  );

  return (
    <div className="flex-1 bg-gray-900 overflow-hidden flex flex-col">
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header with Vanguards Logo on Left and Centered Title */}
        <div className="mb-8 relative">
          <div className="flex items-center min-h-[211px]">
            {/* Logo on the left - 4.8x bigger (211px - 20% larger than 176px) */}
            <img
              src="/vanguards-logo.png"
              alt="Vanguards"
              className="absolute left-0"
              style={{ width: '211px', height: '211px' }}
            />
            {/* Centered title */}
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold text-white">Mission Control</h1>
              <p className="text-gray-400">The World's AI Trust Platform</p>
            </div>
          </div>
        </div>

        {/* SIA Metrics Section - LOCKED-IN Brand Style */}
        <div className="mb-8 bg-gray-950 rounded-lg p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Security Metric */}
          <div className="flex flex-col items-center">
            <div
              className="relative w-40 h-40 mb-4 cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => setShowSIAModal('security')}
            >
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl scale-125"></div>
              
              {/* Progress ring background */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(59, 130, 246, 0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#blueGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70 * 0.98} ${2 * Math.PI * 70 * 0.02}`}
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Inner content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 text-blue-400 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                    <SecurityIcon />
                  </div>
                  <div className="text-3xl font-bold text-white">{siaMetrics.security.value}%</div>
                </div>
              </div>
              
            </div>
            <h3 className="text-lg font-medium text-gray-300">Security</h3>
          </div>

          {/* Integrity Metric */}
          <div className="flex flex-col items-center">
            <div
              className="relative w-40 h-40 mb-4 cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => setShowSIAModal('integrity')}
            >
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-red-500/30 rounded-full blur-2xl scale-125"></div>
              
              {/* Progress ring background */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(239, 68, 68, 0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#redGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70 * 0.85} ${2 * Math.PI * 70 * 0.15}`}
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                />
                <defs>
                  <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F87171" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Inner content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 text-red-400 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                    <IntegrityIcon />
                  </div>
                  <div className="text-3xl font-bold text-white">{siaMetrics.integrity.value}%</div>
                </div>
              </div>
              
            </div>
            <h3 className="text-lg font-medium text-gray-300">Integrity</h3>
          </div>

          {/* Accuracy Metric */}
          <div className="flex flex-col items-center">
            <div
              className="relative w-40 h-40 mb-4 cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => setShowSIAModal('accuracy')}
            >
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl scale-125"></div>
              
              {/* Progress ring background */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(16, 185, 129, 0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#greenGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70 * 0.92} ${2 * Math.PI * 70 * 0.08}`}
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                />
                <defs>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Inner content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 text-green-400 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                    <AccuracyIcon />
                  </div>
                  <div className="text-3xl font-bold text-white">{siaMetrics.accuracy.value}%</div>
                </div>
              </div>
              
            </div>
            <h3 className="text-lg font-medium text-gray-300">Accuracy</h3>
          </div>
        </div>
      </div>

      {/* Industry & Use Case Overview */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Industry Use Cases</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {industries.map((industry) => (
            <div
              key={industry.id}
              onClick={() => setSelectedIndustry(industry)}
              className={`bg-gray-800 rounded-lg p-4 border cursor-pointer transition-all ${
                selectedIndustry.id === industry.id 
                  ? 'border-amber-500 shadow-lg shadow-amber-500/20' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${industry.color} p-2 mb-3 text-white`}>
                {industry.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{industry.name}</h3>
              <p className="text-xs text-gray-400">
                {industry.useCases.filter(uc => uc.active).length} active / {industry.useCases.length} total
              </p>
            </div>
          ))}
        </div>

        {/* Selected Industry Use Cases */}
        {selectedIndustry && (
          <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              {selectedIndustry.name} Use Cases
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {selectedIndustry.useCases.map((useCase) => (
                <button
                  key={useCase.id}
                  onClick={() => {
                    setSelectedUseCase(useCase);
                    emitUseCaseSelection(useCase);
                  }}
                  disabled={!useCase.active}
                  className={`p-2 rounded text-xs font-medium transition-all ${
                    useCase.active
                      ? selectedUseCase?.id === useCase.id
                        ? `${industrySelectedColors[selectedIndustry.id] || 'bg-amber-600'} text-white`
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-900 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {useCase.name}
                  {!useCase.active && <span className="ml-1 text-gray-500">(Coming Soon)</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Upload Data
            </button>
            
            {selectedUseCase && (
              <button
                onClick={() => setShowExecutiveSummary(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
              >
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                Preloaded Data
              </button>
            )}
          </div>

          <button
            onClick={handleDeploy}
            disabled={!selectedUseCase}
            className={`inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isDeployed 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
          >
            {isDeployed ? (
              <>
                <StopIcon className="h-5 w-5 mr-2" />
                Stop Orchestration
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5 mr-2" />
                Start Deployment
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('executive')}
              className={`${
                activeTab === 'executive'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={`${
                activeTab === 'canvas'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Agent Canvas
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`${
                activeTab === 'workflows'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Workflows
            </button>
            <button
              onClick={() => setActiveTab('deployment')}
              className={`${
                activeTab === 'deployment'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Deployment
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`${
                activeTab === 'operations'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Operations
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`${
                activeTab === 'logs'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Integration Logs
            </button>
            <button
              onClick={() => setActiveTab('outputs')}
              className={`${
                activeTab === 'outputs'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Outputs
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'executive' && (
            <div className="space-y-6">
              {selectedUseCase && executiveSummaryData[selectedUseCase.id] ? (
                <>
                  {/* Industry Pain Points */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      Industry Pain Points
                    </h3>
                    <ul className="space-y-2">
                      {executiveSummaryData[selectedUseCase.id].painPoints.map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-red-500 mt-1">•</span>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Business Case */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5 text-blue-500" />
                      {executiveSummaryData[selectedUseCase.id].businessCase.title}
                    </h3>
                    <ul className="space-y-2">
                      {executiveSummaryData[selectedUseCase.id].businessCase.points.map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <CheckCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Approach */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CpuChipIcon className="h-5 w-5 text-green-500" />
                      {executiveSummaryData[selectedUseCase.id].technicalApproach.title}
                    </h3>
                    <ul className="space-y-2">
                      {executiveSummaryData[selectedUseCase.id].technicalApproach.points.map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-green-500 mt-1">•</span>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Benefits & Outcomes */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Key Benefits & Outcomes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {executiveSummaryData[selectedUseCase.id].benefits.map((benefit: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Industry Examples & Case Studies */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Industry Examples & Case Studies</h3>
                    
                    {/* Negative Examples - What Happened Without Vanguards */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-red-400 mb-3 flex items-center gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5" />
                        Real-World Failures Without Vanguards
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {executiveSummaryData[selectedUseCase.id].examples.map((example: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">{example}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Positive Impact - What Would Have Happened With Vanguards */}
                    {executiveSummaryData[selectedUseCase.id].vanguardImpact && (
                      <div>
                        <h4 className="text-md font-medium text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircleIcon className="h-5 w-5" />
                          What Would Have Happened With Vanguards
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {executiveSummaryData[selectedUseCase.id].vanguardImpact.map((impact: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-300">{impact}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Return on Investment */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Return on Investment</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-amber-400">
                          {executiveSummaryData[selectedUseCase.id].roi.implementation}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Implementation Cost</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {executiveSummaryData[selectedUseCase.id].roi.annualSavings}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Annual Savings</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {executiveSummaryData[selectedUseCase.id].roi.paybackPeriod}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Payback Period</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {executiveSummaryData[selectedUseCase.id].roi.fiveYearROI}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">5-Year ROI</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : selectedUseCase ? (
                <div className="text-center py-12 text-gray-400">
                  Executive summary data not available for this use case yet.
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Select a use case to view executive summary
                </div>
              )}
            </div>
          )}

          {activeTab === 'canvas' && (
            <div className="space-y-4">
              {selectedUseCase ? (
                <>
                  <div 
                    ref={canvasRef}
                    className="relative h-96 bg-gray-900 rounded-lg border-2 border-dashed border-gray-600"
                  >
                    {/* Agent Cards */}
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        draggable
                        onDragStart={() => handleAgentDragStart(agent.id)}
                        onDragEnd={(e) => handleAgentDragEnd(e, agent.id)}
                        onClick={() => setSelectedAgent(agent)}
                        style={{
                          position: 'absolute',
                          left: `${agent.position.x}px`,
                          top: `${agent.position.y}px`,
                          cursor: 'move',
                        }}
                        className={`bg-gradient-to-br ${getAgentColor(agent.type)} text-white p-4 rounded-lg shadow-lg w-48 transform transition-transform hover:scale-105`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6">
                              {getAgentIcon(agent.type)}
                            </div>
                            <h3 className="font-semibold text-sm">{agent.name}</h3>
                          </div>
                          {getAgentStatusIcon(agent.status)}
                        </div>
                        <p className="text-xs opacity-90">{agent.tasks.length} tasks assigned</p>
                      </div>
                    ))}

                    {/* Connection Lines */}
                    <svg className="absolute inset-0 pointer-events-none">
                      {agents.map((agent) =>
                        agent.connections.map((targetId) => {
                          const target = agents.find(a => a.id === targetId);
                          if (!target) return null;
                          return (
                            <line
                              key={`${agent.id}-${targetId}`}
                              x1={agent.position.x + 96}
                              y1={agent.position.y + 40}
                              x2={target.position.x + 96}
                              y2={target.position.y + 40}
                              stroke="#9CA3AF"
                              strokeWidth="2"
                              strokeDasharray="5,5"
                            />
                          );
                        })
                      )}
                    </svg>
                  </div>

                  {/* Deployment Console */}
                  {deploymentLogs.length > 0 && (
                    <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
                      {deploymentLogs.map((log, index) => (
                        <div key={index} className="mb-1">
                          <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Select a use case to view the agent canvas
                </div>
              )}
            </div>
          )}

          {activeTab === 'workflows' && (
            <div className="space-y-6">
              {selectedUseCase ? (
                <>
                  {/* Workflow Overview Header */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {selectedUseCase.name} - Autonomous Workflow
                    </h3>
                    <p className="text-sm text-gray-400">
                      This workflow shows how Vanguard agents collaborate to execute the {selectedUseCase.name} use case autonomously.
                      Each agent has specific responsibilities and passes information to the next agent in the workflow.
                    </p>
                  </div>

                  {/* Visual Workflow Diagram */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
                    <h4 className="text-md font-semibold text-gray-300 mb-6">Workflow Orchestration</h4>
                    
                    {/* Workflow Steps */}
                    <div className="relative">
                      {/* Connection Lines */}
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        {agents.map((agent, index) => {
                          if (index < agents.length - 1) {
                            return (
                              <div
                                key={`line-${agent.id}`}
                                className="absolute h-0.5 bg-gradient-to-r from-amber-500/50 to-amber-500/20"
                                style={{
                                  top: '50%',
                                  left: `${(index * 100) / (agents.length - 1)}%`,
                                  width: `${100 / (agents.length - 1)}%`,
                                  transform: 'translateY(-50%)',
                                }}
                              />
                            );
                          }
                          return null;
                        })}
                      </div>

                      {/* Agent Nodes */}
                      <div className="relative flex justify-between items-center">
                        {agents.map((agent, index) => (
                          <div key={agent.id} className="relative z-10 flex flex-col items-center">
                            {/* Agent Circle */}
                            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAgentColor(agent.type)} p-0.5 shadow-lg`}>
                              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                <div className="text-white w-8 h-8 flex items-center justify-center">
                                  {getAgentIcon(agent.type)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Agent Name */}
                            <h5 className="mt-3 text-sm font-medium text-white text-center max-w-[120px]">
                              {agent.name}
                            </h5>
                            
                            {/* Step Number */}
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Workflow Description */}
                    <div className="mt-8 bg-gray-800 rounded-lg p-4">
                      <p className="text-xs text-gray-400">
                        <span className="font-semibold text-amber-400">Workflow Process:</span> Data flows from left to right through each Vanguard agent.
                        Each agent performs its specialized tasks and passes enriched information to the next agent in the sequence.
                      </p>
                    </div>
                  </div>

                  {/* Detailed Agent Tasks */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-300">Agent Responsibilities</h4>
                    
                    {agents.map((agent, index) => (
                      <div key={agent.id} className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                        {/* Agent Header */}
                        <div className={`bg-gradient-to-br ${getAgentColor(agent.type)} p-4`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-white">{index + 1}</span>
                              </div>
                              <div>
                                <h5 className="font-semibold text-white">{agent.name}</h5>
                                <p className="text-xs text-white/80 capitalize">{agent.type} Agent</p>
                              </div>
                            </div>
                            <div className="text-white/80 w-6 h-6">
                              {getAgentIcon(agent.type)}
                            </div>
                          </div>
                        </div>

                        {/* Agent Tasks */}
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {agent.tasks.map((task, taskIndex) => (
                              <div key={taskIndex} className="flex items-start gap-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-300">{task}</span>
                              </div>
                            ))}
                          </div>

                          {/* Agent Connections */}
                          {agent.connections.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-800">
                              <p className="text-xs text-gray-400">
                                <span className="font-semibold">Passes data to:</span>{' '}
                                {agent.connections.map(connId => {
                                  const connectedAgent = agents.find(a => a.id === connId);
                                  return connectedAgent?.name;
                                }).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Workflow Metrics - Dynamic for all use cases */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-4">Workflow Performance Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(() => {
                        const metricsData: { [key: string]: { successRate: string; processingTime: string; tasksCompleted: string; fourthMetric: { value: string; label: string } } } = {
                          'oilfield-lease': { successRate: '98.7%', processingTime: '2.3s', tasksCompleted: '12,847', fourthMetric: { value: '365', label: 'Days Advance Notice' } },
                          'grid-anomaly': { successRate: '99.2%', processingTime: '1.8s', tasksCompleted: '45,892', fourthMetric: { value: '4.5M', label: 'Customers Protected' } },
                          'patient-risk': { successRate: '97.5%', processingTime: '3.1s', tasksCompleted: '28,456', fourthMetric: { value: '45%', label: 'Readmission Reduction' } },
                          'fraud-detection': { successRate: '99.8%', processingTime: '0.3s', tasksCompleted: '1.2M', fourthMetric: { value: '$4.2M', label: 'Fraud Prevented' } },
                          'predictive-maintenance': { successRate: '98.9%', processingTime: '2.7s', tasksCompleted: '34,567', fourthMetric: { value: '99%', label: 'Uptime Achieved' } },
                          'demand-forecasting': { successRate: '95.3%', processingTime: '4.2s', tasksCompleted: '89,234', fourthMetric: { value: '95%', label: 'Forecast Accuracy' } },
                          'route-optimization': { successRate: '97.8%', processingTime: '1.5s', tasksCompleted: '156,789', fourthMetric: { value: '25%', label: 'Delivery Time Saved' } },
                          'renewable-optimization': { successRate: '99.1%', processingTime: '2.1s', tasksCompleted: '67,890', fourthMetric: { value: '85%', label: 'Curtailment Reduced' } },
                          'clinical-trial-matching': { successRate: '96.4%', processingTime: '5.3s', tasksCompleted: '15,678', fourthMetric: { value: '70%', label: 'Enrollment Time Cut' } },
                          'ai-credit-scoring': { successRate: '98.2%', processingTime: '0.8s', tasksCompleted: '234,567', fourthMetric: { value: '40%', label: 'More Approvals' } },
                          'quality-inspection': { successRate: '99.9%', processingTime: '0.5s', tasksCompleted: '2.3M', fourthMetric: { value: '99.9%', label: 'Defect Detection' } },
                          'customer-personalization': { successRate: '96.7%', processingTime: '1.2s', tasksCompleted: '5.6M', fourthMetric: { value: '45%', label: 'Conversion Increase' } },
                          'fleet-maintenance': { successRate: '98.5%', processingTime: '3.4s', tasksCompleted: '45,678', fourthMetric: { value: '98%', label: 'Fleet Uptime' } },
                          'adaptive-learning': { successRate: '97.2%', processingTime: '2.8s', tasksCompleted: '123,456', fourthMetric: { value: '50%', label: 'Outcome Improvement' } },
                          'drug-discovery': { successRate: '94.8%', processingTime: '45.6s', tasksCompleted: '8,901', fourthMetric: { value: '70%', label: 'Time Reduction' } },
                          'emergency-response': { successRate: '99.5%', processingTime: '0.9s', tasksCompleted: '78,901', fourthMetric: { value: '40%', label: 'Response Time Cut' } },
                          'network-performance': { successRate: '99.7%', processingTime: '0.4s', tasksCompleted: '8.9M', fourthMetric: { value: '80%', label: 'Outage Reduction' } },
                          'ai-pricing-governance': { successRate: '100%', processingTime: '1.1s', tasksCompleted: '456,789', fourthMetric: { value: '100%', label: 'Compliance Rate' } },
                          'clinical-trial-optimization': { successRate: '97.9%', processingTime: '6.2s', tasksCompleted: '23,456', fourthMetric: { value: '30%', label: 'Duration Reduced' } },
                          'adverse-event': { successRate: '99.3%', processingTime: '2.4s', tasksCompleted: '89,012', fourthMetric: { value: '95%', label: 'Events Detected' } },
                          'infrastructure-coordination': { successRate: '99.8%', processingTime: '1.3s', tasksCompleted: '234,567', fourthMetric: { value: '95%', label: 'Cascades Prevented' } },
                          'citizen-services': { successRate: '98.1%', processingTime: '3.7s', tasksCompleted: '1.8M', fourthMetric: { value: '90%', label: 'Wait Time Reduced' } },
                          'public-safety': { successRate: '97.6%', processingTime: '1.9s', tasksCompleted: '567,890', fourthMetric: { value: '85%', label: 'Prediction Accuracy' } },
                          'resource-optimization': { successRate: '98.8%', processingTime: '4.8s', tasksCompleted: '345,678', fourthMetric: { value: '40%', label: 'Waste Reduced' } },
                          'churn-prevention': { successRate: '96.9%', processingTime: '2.2s', tasksCompleted: '789,012', fourthMetric: { value: '95%', label: 'Churn Predicted' } },
                          'network-security': { successRate: '99.9%', processingTime: '0.2s', tasksCompleted: '12.3M', fourthMetric: { value: '99.9%', label: 'Attacks Blocked' } },
                          'cross-industry-analytics': { successRate: '97.3%', processingTime: '8.9s', tasksCompleted: '456,789', fourthMetric: { value: '3x', label: 'Innovation Speed' } },
                          'universal-compliance': { successRate: '100%', processingTime: '3.2s', tasksCompleted: '2.1M', fourthMetric: { value: '100%', label: 'Global Compliance' } },
                          'drilling-risk': { successRate: '98.4%', processingTime: '5.7s', tasksCompleted: '34,567', fourthMetric: { value: '72hr', label: 'Advance Warning' } },
                          'environmental-compliance': { successRate: '99.2%', processingTime: '2.6s', tasksCompleted: '678,901', fourthMetric: { value: '99.2%', label: 'Compliance Rate' } },
                          'load-forecasting': { successRate: '98.6%', processingTime: '3.3s', tasksCompleted: '890,123', fourthMetric: { value: '<2%', label: 'MAPE Error' } },
                          'phmsa-compliance': { successRate: '99.8%', processingTime: '4.1s', tasksCompleted: '123,456', fourthMetric: { value: '95%', label: 'Violations Reduced' } },
                          'methane-detection': { successRate: '99.4%', processingTime: '1.7s', tasksCompleted: '567,890', fourthMetric: { value: '1hr', label: 'Detection Time' } },
                          'grid-resilience': { successRate: '99.6%', processingTime: '2.9s', tasksCompleted: '234,567', fourthMetric: { value: '85%', label: 'Outages Prevented' } },
                          'internal-audit': { successRate: '98.7%', processingTime: '7.2s', tasksCompleted: '89,012', fourthMetric: { value: '100%', label: 'Control Coverage' } },
                          'scada-integration': { successRate: '99.5%', processingTime: '1.4s', tasksCompleted: '456,789', fourthMetric: { value: '50+', label: 'Systems Unified' } },
                          'predictive-resilience': { successRate: '99.7%', processingTime: '0.7s', tasksCompleted: '3.4M', fourthMetric: { value: '95%', label: 'Failures Prevented' } },
                          'cyber-defense': { successRate: '99.99%', processingTime: '0.1s', tasksCompleted: '45.6M', fourthMetric: { value: '99.99%', label: 'Attacks Blocked' } },
                          'wildfire-prevention': { successRate: '99.3%', processingTime: '3.8s', tasksCompleted: '789,012', fourthMetric: { value: '95%', label: 'Risk Reduced' } },
                          'treatment-recommendation': { successRate: '97.8%', processingTime: '4.5s', tasksCompleted: '345,678', fourthMetric: { value: '45%', label: 'Outcome Improvement' } },
                          'diagnosis-assistant': { successRate: '98.3%', processingTime: '3.9s', tasksCompleted: '567,890', fourthMetric: { value: '95%', label: 'Diagnostic Accuracy' } },
                          'medical-supply-chain': { successRate: '99.1%', processingTime: '2.5s', tasksCompleted: '890,123', fourthMetric: { value: '99%', label: 'Stockout Prevention' } },
                          'portfolio-optimization': { successRate: '97.4%', processingTime: '6.8s', tasksCompleted: '234,567', fourthMetric: { value: '4-6%', label: 'Alpha Generated' } },
                          'aml-monitoring': { successRate: '98.9%', processingTime: '1.6s', tasksCompleted: '7.8M', fourthMetric: { value: '85%', label: 'False Positives Cut' } },
                          'insurance-risk': { successRate: '98.5%', processingTime: '3.1s', tasksCompleted: '456,789', fourthMetric: { value: '95%', label: 'Fraud Detected' } },
                          'supply-chain': { successRate: '97.7%', processingTime: '5.4s', tasksCompleted: '678,901', fourthMetric: { value: '80%', label: 'Disruption Reduced' } },
                          'price-optimization': { successRate: '96.8%', processingTime: '2.3s', tasksCompleted: '2.9M', fourthMetric: { value: '20%', label: 'Margin Increase' } },
                          'warehouse-automation': { successRate: '99.9%', processingTime: '0.6s', tasksCompleted: '12.4M', fourthMetric: { value: '99.9%', label: 'Order Accuracy' } },
                          'student-performance': { successRate: '97.1%', processingTime: '4.7s', tasksCompleted: '345,678', fourthMetric: { value: '85%', label: 'Early Detection' } },
                          'content-recommendation': { successRate: '96.5%', processingTime: '1.8s', tasksCompleted: '8.9M', fourthMetric: { value: '52%', label: 'Comprehension Up' } },
                          'multi-vertical-optimization': { successRate: '98.2%', processingTime: '9.3s', tasksCompleted: '567,890', fourthMetric: { value: '30%', label: 'Efficiency Gain' } },
                          'industry-benchmarking': { successRate: '97.9%', processingTime: '7.6s', tasksCompleted: '234,567', fourthMetric: { value: 'Real-time', label: 'Data Currency' } },
                          'default': { successRate: '98.0%', processingTime: '3.0s', tasksCompleted: '100,000', fourthMetric: { value: agents.length.toString(), label: 'Active Agents' } }
                        };
                        
                        const metrics = metricsData[selectedUseCase.id] || metricsData['default'];
                        
                        return (
                          <>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-400">{metrics.successRate}</div>
                              <p className="text-xs text-gray-400 mt-1">Success Rate</p>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{metrics.processingTime}</div>
                              <p className="text-xs text-gray-400 mt-1">Avg Processing Time</p>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-amber-400">{metrics.tasksCompleted}</div>
                              <p className="text-xs text-gray-400 mt-1">Tasks Completed</p>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{metrics.fourthMetric.value}</div>
                              <p className="text-xs text-gray-400 mt-1">{metrics.fourthMetric.label}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Business Impact */}
                  <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-700/50 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-amber-400 mb-3">Business Impact</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <BoltIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-300">Automated Decision Making</p>
                          <p className="text-xs text-gray-400">Agents make autonomous decisions based on configured business rules and risk thresholds</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChartBarIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-300">Real-Time Processing</p>
                          <p className="text-xs text-gray-400">Continuous monitoring and instant response to changing conditions</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <ShieldCheckIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-300">Compliance Assurance</p>
                          <p className="text-xs text-gray-400">Every action is logged and auditable for regulatory compliance</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Frameworks */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h4 className="text-md font-semibold text-gray-300 mb-4">Compliance Frameworks</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-white">SOX</p>
                        <p className="text-xs text-gray-400">Compliant</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-white">COSO</p>
                        <p className="text-xs text-gray-400">Certified</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <ExclamationTriangleIcon className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-white">COBIT</p>
                        <p className="text-xs text-gray-400">In Progress</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-white">NIST</p>
                        <p className="text-xs text-gray-400">Compliant</p>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Frameworks */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h4 className="text-md font-semibold text-gray-300 mb-4">Compliance Frameworks</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-white">FDA 21 CFR</p>
                        <p className="text-xs text-gray-400">Validated</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-white">ISO 9001</p>
                        <p className="text-xs text-gray-400">Certified</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-white">GxP</p>
                        <p className="text-xs text-gray-400">Compliant</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <ExclamationTriangleIcon className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-white">GAMP 5</p>
                        <p className="text-xs text-gray-400">In Review</p>
                      </div>
                    </div>
                  </div>

                  {/* Example Workflow Execution - Dynamic for all use cases */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-4">
                      Example: {selectedUseCase.name} Workflow
                    </h4>
                    
                    <div className="space-y-4">
                      {agents.map((agent, index) => {
                        // Use exact same color mapping as getAgentColor function
                        const agentColorMap = {
                          security: 'blue',
                          integrity: 'red',
                          accuracy: 'green',
                          optimization: 'purple',
                          negotiation: 'amber',
                          prediction: 'indigo',
                          monitoring: 'cyan',
                          compliance: 'yellow',
                          analysis: 'pink',
                          response: 'orange',
                        };
                        
                        const baseColor = agentColorMap[agent.type] || 'gray';
                        const colors = {
                          bg: `bg-${baseColor}-500/20`,
                          text: `text-${baseColor}-400`
                        };
                        
                        // Generate dynamic workflow descriptions based on use case
                        const getWorkflowDescription = () => {
                          const workflowDescriptions: { [key: string]: { [agentType: string]: string } } = {
                            'oilfield-lease': {
                              security: 'Validates user permissions to access lease data and ensures all actions are logged for audit compliance.',
                              integrity: 'Cross-references lease data across ERP, GIS, and CLM systems to ensure consistency and resolve any conflicts.',
                              accuracy: 'Detects leases expiring within 365 days and calculates risk scores based on production value and strategic importance.',
                              optimization: 'Performs financial modeling to determine optimal renewal terms and identifies cost-saving opportunities across the portfolio.',
                              negotiation: 'Analyzes contract terms, generates renewal packages, and executes auto-renewal for low-risk leases while escalating high-value ones.'
                            },
                            'grid-anomaly': {
                              security: 'Authenticates SCADA system access and encrypts all grid telemetry data transmissions.',
                              integrity: 'Validates sensor readings across multiple sources to eliminate false positives.',
                              accuracy: 'Analyzes grid patterns using ML models to detect anomalies with 95% precision.',
                              monitoring: 'Continuously monitors grid health metrics and weather conditions in real-time.',
                              response: 'Automatically dispatches crews and reconfigures grid topology to prevent outages.'
                            },
                            'patient-risk': {
                              security: 'Ensures HIPAA compliance and protects patient data with end-to-end encryption.',
                              integrity: 'Reconciles patient data from EHR, claims, and IoT devices for complete view.',
                              accuracy: 'Applies predictive models to identify high-risk patients 6 months in advance.',
                              analysis: 'Analyzes social determinants and behavioral patterns affecting health outcomes.',
                              optimization: 'Creates personalized care plans optimizing for outcomes and cost efficiency.'
                            },
                            'fraud-detection': {
                              security: 'Secures transaction data and maintains PCI compliance across all channels.',
                              monitoring: 'Real-time monitoring of every transaction across all payment channels.',
                              analysis: 'Deep learning analysis of 500+ features including behavioral biometrics.',
                              accuracy: 'Scores fraud probability with 95% accuracy while reducing false positives.',
                              response: 'Instantly blocks fraudulent transactions and triggers investigation workflows.'
                            },
                            'predictive-maintenance': {
                              monitoring: 'Continuous monitoring of equipment sensors for vibration, temperature, and pressure.',
                              analysis: 'Pattern recognition to identify early indicators of potential failures.',
                              prediction: 'ML models predict failure probability 30-60 days in advance.',
                              optimization: 'Optimizes maintenance schedules to minimize downtime and costs.',
                              response: 'Automatically generates work orders and schedules maintenance crews.'
                            },
                            'default': {
                              security: `Ensures secure access and maintains audit trail for all ${selectedUseCase.name} operations.`,
                              integrity: `Validates data consistency across all systems for ${selectedUseCase.name} processes.`,
                              accuracy: `Applies advanced analytics to ensure accurate ${selectedUseCase.name} decisions.`,
                              optimization: `Optimizes resources and processes for maximum ${selectedUseCase.name} efficiency.`,
                              monitoring: `Continuously monitors ${selectedUseCase.name} metrics and KPIs in real-time.`,
                              analysis: `Performs deep analysis of ${selectedUseCase.name} data patterns and trends.`,
                              prediction: `Predicts future ${selectedUseCase.name} outcomes using ML models.`,
                              compliance: `Ensures all ${selectedUseCase.name} activities meet regulatory requirements.`,
                              negotiation: `Manages negotiations and agreements for optimal ${selectedUseCase.name} outcomes.`,
                              response: `Executes automated responses based on ${selectedUseCase.name} conditions.`
                            }
                          };
                          
                          const descriptions = workflowDescriptions[selectedUseCase.id] || workflowDescriptions['default'];
                          return descriptions[agent.type] || `Performs ${agent.type} operations for ${selectedUseCase.name}.`;
                        };
                        
                        return (
                          <div key={agent.id} className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center`}>
                                <span className={`text-sm font-bold ${colors.text}`}>{index + 1}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h5 className={`text-sm font-medium ${colors.text}`}>{agent.name}</h5>
                              <p className="text-xs text-gray-400 mt-1">
                                {getWorkflowDescription()}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {/* Dynamic Result based on use case */}
                      <div className="mt-6 bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-400">Workflow Result</p>
                            <p className="text-xs text-gray-300 mt-1">
                              {(() => {
                                const workflowResults: { [key: string]: string } = {
                                  'oilfield-lease': '23 low-risk leases auto-renewed, 5 high-value leases prepared with negotiation packages, $2.3M in cost savings identified, full audit trail generated.',
                                  'grid-anomaly': '15 potential failures prevented, 4.5M customers protected from outages, $30M in damages avoided, grid reliability improved to 99.99%.',
                                  'patient-risk': '127 high-risk patients identified, personalized care plans generated, 45% reduction in readmissions projected, $15M in cost savings estimated.',
                                  'fraud-detection': '1,247 fraudulent transactions blocked, $4.2M in losses prevented, false positive rate reduced to 2%, full compliance maintained.',
                                  'predictive-maintenance': '8 equipment failures predicted, maintenance scheduled proactively, 99% uptime achieved, $2.5M in downtime costs avoided.',
                                  'demand-forecasting': 'Forecast accuracy improved to 95%, inventory optimized across 10K SKUs, $40M in overstock avoided, customer satisfaction increased.',
                                  'route-optimization': '300 routes optimized, delivery time reduced by 25%, fuel consumption cut by 20%, on-time delivery rate at 95%.',
                                  'clinical-trial-matching': '450 eligible patients identified, enrollment time reduced by 70%, trial diversity improved by 40%, $75M in acceleration value.',
                                  'ai-credit-scoring': '2,500 applications processed, 40% more approvals with 35% lower risk, fair lending compliance verified, instant decisions delivered.',
                                  'quality-inspection': '50,000 products inspected, 99.9% defect detection achieved, zero defects shipped, $30M in warranty costs avoided.',
                                  'customer-personalization': 'Personalized experiences for 1M customers, 45% conversion rate increase, 60% higher CLV, 35% churn reduction.',
                                  'fleet-maintenance': '150 vehicles monitored, 12 breakdowns prevented, maintenance costs reduced 35%, fleet uptime at 98%.',
                                  'adaptive-learning': '5,000 students supported, learning outcomes improved 50%, dropout risk reduced 40%, teacher time saved 10 hours/week.',
                                  'drug-discovery': '10,000 compounds analyzed, 3 promising candidates identified, development time reduced 70%, $500M in R&D optimized.',
                                  'emergency-response': 'Response coordinated across 5 agencies, deployment time reduced 40%, resources optimized 60%, 30% more lives saved.',
                                  'network-performance': 'Network optimized across 1,000 nodes, outages reduced 80%, efficiency improved 40%, customer satisfaction up 50%.',
                                  'ai-pricing-governance': 'All pricing decisions validated for fairness, 100% compliance achieved, revenue increased 15%, zero discriminatory practices.',
                                  'default': `Workflow completed successfully for ${selectedUseCase.name}. All agents performed their tasks, compliance maintained, and optimal outcomes achieved.`
                                };
                                
                                return workflowResults[selectedUseCase.id] || workflowResults['default'];
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Execution Timeline - Dynamic for all use cases */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-4">Workflow Execution Timeline</h4>
                    
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-700"></div>
                      
                      {/* Timeline Events */}
                      <div className="space-y-6">
                        {(() => {
                          // Generate dynamic timeline events based on use case
                          const getTimelineEvents = () => {
                            const baseTime = new Date();
                            baseTime.setHours(9, 15, 23, 0);
                            
                            const timelineData: { [key: string]: any } = {
                              'oilfield-lease': {
                                event1: { title: 'Workflow Initiated', desc: 'User triggered lease renewal analysis for Q4 2024 portfolio' },
                                event2: { title: 'Data Collection', desc: 'Retrieving 1,247 lease records from integrated systems', details: ['ERP: 1,247 records', 'GIS: 1,189 mapped', 'CLM: 1,247 contracts'] },
                                event3: { title: 'Analysis Complete', desc: 'Identified 28 leases requiring action within 365 days', stats: { high: '5 leases', medium: '8 leases', low: '15 leases' } },
                                event4: { title: 'Optimization Processing', desc: 'Running financial models and negotiation strategies', progress: 75 },
                                event5: { title: 'Actions Executed', desc: 'Automated actions completed, manual reviews queued', actions: ['15 leases auto-renewed (low risk)', '8 renewal packages generated (medium risk)', '5 escalated for executive review (high risk)'] },
                                event6: { title: 'Workflow Complete', desc: 'All tasks completed, reports generated' },
                                summary: { time: '7s', processed: '28', metric1: '$2.3M', metric1Label: 'Savings Identified', metric2: '100%', metric2Label: 'Compliance' }
                              },
                              'grid-anomaly': {
                                event1: { title: 'Monitoring Initiated', desc: 'Real-time grid monitoring activated across 5 regions' },
                                event2: { title: 'Sensor Data Stream', desc: 'Processing 45,000 sensor readings per second', details: ['SCADA: 15,000/s', 'PMU: 20,000/s', 'Weather: 10,000/s'] },
                                event3: { title: 'Anomaly Detected', desc: 'Identified 3 potential failure points in transmission network', stats: { critical: '1 transformer', warning: '2 lines', monitoring: '5 substations' } },
                                event4: { title: 'Predictive Analysis', desc: 'Running failure propagation models', progress: 85 },
                                event5: { title: 'Response Deployed', desc: 'Automated grid reconfiguration executed', actions: ['Load transferred from at-risk transformer', 'Crew dispatched to 2 locations', 'Customer notifications sent'] },
                                event6: { title: 'Threat Mitigated', desc: 'Potential outage prevented, grid stabilized' },
                                summary: { time: '1.8s', processed: '45K', metric1: '4.5M', metric1Label: 'Customers Protected', metric2: '99.99%', metric2Label: 'Grid Reliability' }
                              },
                              'patient-risk': {
                                event1: { title: 'Patient Cohort Selected', desc: 'Analyzing 5,000 patients with chronic conditions' },
                                event2: { title: 'Data Integration', desc: 'Aggregating clinical, claims, and social data', details: ['EHR: 5,000 records', 'Claims: 125,000 events', 'SDoH: 15,000 factors'] },
                                event3: { title: 'Risk Stratification', desc: 'Identified 127 high-risk patients for intervention', stats: { critical: '23 patients', high: '45 patients', moderate: '59 patients' } },
                                event4: { title: 'Care Plan Generation', desc: 'Creating personalized intervention strategies', progress: 90 },
                                event5: { title: 'Interventions Deployed', desc: 'Care teams notified, outreach initiated', actions: ['23 immediate interventions scheduled', '45 care plans updated', '59 monitoring alerts set'] },
                                event6: { title: 'Workflow Complete', desc: 'All high-risk patients addressed' },
                                summary: { time: '3.1s', processed: '127', metric1: '45%', metric1Label: 'Readmission Reduction', metric2: '$15M', metric2Label: 'Projected Savings' }
                              },
                              'fraud-detection': {
                                event1: { title: 'Transaction Stream Active', desc: 'Monitoring real-time payment transactions' },
                                event2: { title: 'Pattern Analysis', desc: 'Processing 50,000 transactions per second', details: ['Cards: 30,000/s', 'ACH: 15,000/s', 'Wire: 5,000/s'] },
                                event3: { title: 'Fraud Detected', desc: 'Identified 47 suspicious transactions', stats: { confirmed: '12 fraud', probable: '23 fraud', review: '12 suspicious' } },
                                event4: { title: 'Risk Scoring', desc: 'Calculating fraud probability scores', progress: 95 },
                                event5: { title: 'Actions Taken', desc: 'Automated fraud prevention executed', actions: ['12 transactions blocked instantly', '23 held for review', '12 flagged for monitoring'] },
                                event6: { title: 'Protection Complete', desc: 'All threats neutralized, reports filed' },
                                summary: { time: '0.3s', processed: '47', metric1: '$4.2M', metric1Label: 'Fraud Prevented', metric2: '2%', metric2Label: 'False Positive Rate' }
                              },
                              'default': {
                                event1: { title: 'Workflow Initiated', desc: `User triggered ${selectedUseCase.name} analysis` },
                                event2: { title: 'Data Collection', desc: 'Retrieving data from integrated systems', details: ['Primary: Connected', 'Secondary: Connected', 'Tertiary: Connected'] },
                                event3: { title: 'Analysis Complete', desc: 'Identified items requiring action', stats: { high: 'Critical items', medium: 'Warning items', low: 'Info items' } },
                                event4: { title: 'Processing', desc: 'Running optimization algorithms', progress: 80 },
                                event5: { title: 'Actions Executed', desc: 'Automated actions completed', actions: ['Primary actions executed', 'Secondary actions queued', 'Notifications sent'] },
                                event6: { title: 'Workflow Complete', desc: 'All tasks completed successfully' },
                                summary: { time: '3.0s', processed: '100', metric1: '98%', metric1Label: 'Success Rate', metric2: '100%', metric2Label: 'Compliance' }
                              }
                            };
                            
                            const events = timelineData[selectedUseCase.id] || timelineData['default'];
                            
                            return [
                              { time: baseTime, ...events.event1, color: 'blue' },
                              { time: new Date(baseTime.getTime() + 1000), ...events.event2, color: 'amber' },
                              { time: new Date(baseTime.getTime() + 3000), ...events.event3, color: 'green' },
                              { time: new Date(baseTime.getTime() + 4000), ...events.event4, color: 'purple' },
                              { time: new Date(baseTime.getTime() + 6000), ...events.event5, color: 'amber' },
                              { time: new Date(baseTime.getTime() + 7000), ...events.event6, color: 'green', summary: events.summary }
                            ];
                          };
                          
                          const events = getTimelineEvents();
                          
                          return events.map((event, index) => (
                            <div key={index} className="relative flex items-start">
                              <div className={`absolute left-0 w-8 h-8 bg-gray-800 border-2 border-${event.color}-500 rounded-full flex items-center justify-center`}>
                                {index === events.length - 1 ? (
                                  <DocumentArrowDownIcon className={`w-4 h-4 text-${event.color}-500`} />
                                ) : index === 2 ? (
                                  <CheckCircleIcon className={`w-4 h-4 text-${event.color}-500`} />
                                ) : index === 3 ? (
                                  <CpuChipIcon className={`w-4 h-4 text-${event.color}-500`} />
                                ) : index === 4 ? (
                                  <SparklesIcon className={`w-4 h-4 text-${event.color}-500`} />
                                ) : (
                                  <div className={`w-3 h-3 bg-${event.color}-500 rounded-full ${index === 1 ? 'animate-pulse' : ''}`}></div>
                                )}
                              </div>
                              <div className="ml-12">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium text-white">{event.title}</p>
                                  <span className="text-xs text-gray-500">{event.time.toLocaleTimeString()}</span>
                                </div>
                                <p className="text-xs text-gray-400">{event.desc}</p>
                                
                                {event.details && (
                                  <div className="mt-2 flex gap-4 text-xs">
                                    {event.details.map((detail: string, i: number) => (
                                      <span key={i} className={`text-${['blue', 'green', 'purple'][i]}-400`}>{detail}</span>
                                    ))}
                                  </div>
                                )}
                                
                                {event.stats && (
                                  <div className="mt-2 bg-gray-800 rounded p-3">
                                    <div className="grid grid-cols-3 gap-4 text-xs">
                                      <div>
                                        <p className="text-gray-500">High Risk</p>
                                        <p className="text-red-400 font-semibold">{event.stats.high || event.stats.critical}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Medium Risk</p>
                                        <p className="text-amber-400 font-semibold">{event.stats.medium || event.stats.warning || event.stats.high}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Low Risk</p>
                                        <p className="text-green-400 font-semibold">{event.stats.low || event.stats.monitoring || event.stats.moderate}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {event.progress && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{width: `${event.progress}%`}}></div>
                                    </div>
                                    <span className="text-xs text-purple-400">{event.progress}%</span>
                                  </div>
                                )}
                                
                                {event.actions && (
                                  <div className="mt-2 space-y-1">
                                    {event.actions.map((action: string, i: number) => (
                                      <div key={i} className="flex items-center gap-2 text-xs">
                                        {i === 0 ? (
                                          <CheckCircleIcon className="w-3 h-3 text-green-500" />
                                        ) : (
                                          <ExclamationTriangleIcon className={`w-3 h-3 text-${i === 2 ? 'red' : 'amber'}-500`} />
                                        )}
                                        <span className="text-gray-300">{action}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {index === events.length - 1 && (
                                  <div className="mt-2 flex gap-3">
                                    <button
                                      onClick={() => {
                                        // Generate PDF report
                                        // Get metrics data for the report
                                        const metricsData: { [key: string]: any } = {
                                          'oilfield-lease': { successRate: '98.7%', processingTime: '2.3s', tasksCompleted: '12,847', fourthMetric: { value: '365', label: 'Days Advance Notice' } },
                                          'grid-anomaly': { successRate: '99.2%', processingTime: '1.8s', tasksCompleted: '45,892', fourthMetric: { value: '4.5M', label: 'Customers Protected' } },
                                          'patient-risk': { successRate: '97.5%', processingTime: '3.1s', tasksCompleted: '28,456', fourthMetric: { value: '45%', label: 'Readmission Reduction' } },
                                          'fraud-detection': { successRate: '99.8%', processingTime: '0.3s', tasksCompleted: '1.2M', fourthMetric: { value: '$4.2M', label: 'Fraud Prevented' } },
                                          'default': { successRate: '98.0%', processingTime: '3.0s', tasksCompleted: '100,000', fourthMetric: { value: agents.length.toString(), label: 'Active Agents' } }
                                        };
                                        
                                        const reportData = {
                                          useCase: selectedUseCase.name,
                                          timestamp: new Date().toISOString(),
                                          agents: agents.map(a => ({ name: a.name, type: a.type, tasks: a.tasks })),
                                          results: event.summary,
                                          metrics: metricsData[selectedUseCase.id] || metricsData['default']
                                        };
                                        
                                        // Simulate PDF generation
                                        addDeploymentLog('📄 Generating workflow report PDF...');
                                        setTimeout(() => {
                                          addDeploymentLog('✅ Report generated successfully!');
                                          // In a real implementation, this would trigger a download
                                          const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                                          const url = URL.createObjectURL(blob);
                                          const a = document.createElement('a');
                                          a.href = url;
                                          a.download = `${selectedUseCase.id}-workflow-report-${Date.now()}.json`;
                                          document.body.appendChild(a);
                                          a.click();
                                          document.body.removeChild(a);
                                          URL.revokeObjectURL(url);
                                        }, 1500);
                                      }}
                                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                                    >
                                      <DocumentArrowDownIcon className="w-3 h-3" />
                                      Download Report
                                    </button>
                                    <button
                                      onClick={() => setShowAnalyticsModal(true)}
                                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                    >
                                      <ChartBarIcon className="w-3 h-3" />
                                      View Analytics
                                    </button>
                                  </div>
                                )}
                                
                                {/* Store summary data in last event */}
                                {index === events.length - 1 && event.summary && (
                                  <div className="hidden" data-summary={JSON.stringify(event.summary)}></div>
                                )}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Summary Stats - Dynamic based on use case */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        {(() => {
                          // Extract summary from the last timeline event
                          const lastEvent = document.querySelector('[data-summary]');
                          const summaryData = lastEvent ? JSON.parse(lastEvent.getAttribute('data-summary') || '{}') : {};
                          
                          // Default summary if not found
                          const summary = Object.keys(summaryData).length > 0 ? summaryData : {
                            time: '3.0s',
                            processed: '100',
                            metric1: '98%',
                            metric1Label: 'Success Rate',
                            metric2: '100%',
                            metric2Label: 'Compliance'
                          };
                          
                          return (
                            <>
                              <div>
                                <p className="text-2xl font-bold text-white">{summary.time}</p>
                                <p className="text-xs text-gray-400">Total Time</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-green-400">{summary.processed}</p>
                                <p className="text-xs text-gray-400">Items Processed</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-amber-400">{summary.metric1}</p>
                                <p className="text-xs text-gray-400">{summary.metric1Label}</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-blue-400">{summary.metric2}</p>
                                <p className="text-xs text-gray-400">{summary.metric2Label}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Select a use case to view workflows
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              {/* Filter Controls */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Filter Logs</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Agent Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Agent</label>
                    <select
                      value={logFilters.agent}
                      onChange={(e) => setLogFilters(prev => ({ ...prev, agent: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">All Agents</option>
                      <option value="Security Agent">Security Agent</option>
                      <option value="Integrity Agent">Integrity Agent</option>
                      <option value="Accuracy Agent">Accuracy Agent</option>
                      <option value="Optimization Agent">Optimization Agent</option>
                      <option value="Negotiation Agent">Negotiation Agent</option>
                      <option value="Compliance Agent">Compliance Agent</option>
                      <option value="Integration Agent">Integration Agent</option>
                      <option value="System">System</option>
                    </select>
                  </div>
                  
                  {/* Workflow Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Workflow</label>
                    <select
                      value={logFilters.workflow}
                      onChange={(e) => setLogFilters(prev => ({ ...prev, workflow: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">All Workflows</option>
                      <option value="Data Collection">Data Collection</option>
                      <option value="Lease Analysis">Lease Analysis</option>
                      <option value="Data Validation">Data Validation</option>
                      <option value="Risk Assessment">Risk Assessment</option>
                      <option value="Lease Renewal">Lease Renewal</option>
                      <option value="Compliance Check">Compliance Check</option>
                      <option value="Financial Optimization">Financial Optimization</option>
                      <option value="Rights Validation">Rights Validation</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  
                  {/* Event Type Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Event Type</label>
                    <select
                      value={logFilters.eventType}
                      onChange={(e) => setLogFilters(prev => ({ ...prev, eventType: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">All Types</option>
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => setLogFilters({ agent: 'all', workflow: 'all', eventType: 'all' })}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              
              {/* Logs Display */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(() => {
                  // Filter logs based on selected filters
                  const filteredLogs = integrationLogs.filter(log => {
                    const agentMatch = logFilters.agent === 'all' || log.agent === logFilters.agent;
                    const workflowMatch = logFilters.workflow === 'all' || log.workflow === logFilters.workflow;
                    const typeMatch = logFilters.eventType === 'all' || log.type === logFilters.eventType;
                    return agentMatch && workflowMatch && typeMatch;
                  });
                  
                  if (filteredLogs.length > 0) {
                    return filteredLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
                        <div className="flex-shrink-0">
                          {log.type === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                          {log.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />}
                          {log.type === 'error' && <XMarkIcon className="h-5 w-5 text-red-500" />}
                          {log.type === 'info' && <InformationCircleIcon className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-300">{log.message}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-amber-400">{log.agent}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-blue-400">{log.workflow}</span>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              log.type === 'success' ? 'bg-green-900/50 text-green-400' :
                              log.type === 'warning' ? 'bg-amber-900/50 text-amber-400' :
                              log.type === 'error' ? 'bg-red-900/50 text-red-400' :
                              'bg-blue-900/50 text-blue-400'
                            }`}>
                              {log.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ));
                  } else {
                    return (
                      <div className="text-center py-12 text-gray-400">
                        {integrationLogs.length > 0
                          ? 'No logs match the selected filters.'
                          : 'No integration logs yet. Deploy agents to see activity.'}
                      </div>
                    );
                  }
                })()}
              </div>
              
              {/* Log Statistics */}
              {integrationLogs.length > 0 && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Log Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{integrationLogs.length}</div>
                      <p className="text-xs text-gray-400 mt-1">Total Logs</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {integrationLogs.filter(log => log.type === 'success').length}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Success</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-400">
                        {integrationLogs.filter(log => log.type === 'warning').length}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Warnings</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {integrationLogs.filter(log => log.type === 'error').length}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Errors</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'deployment' && (
            <div className="space-y-4">
              {selectedUseCase ? (
                <div className="space-y-4">
                  {/* Deployment Control Center */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                        <CpuChipIcon className="h-5 w-5 text-amber-500" />
                        Deployment Orchestration System
                      </h3>
                      <p className="text-sm text-gray-400">
                        Automated provisioning, intelligent dependency resolution, and real-time performance validation
                      </p>
                    </div>
                    
                    {/* Deployment Status Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">Production</div>
                        <p className="text-xs text-gray-400 mt-1">Environment</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-amber-400">v2.4.1</div>
                        <p className="text-xs text-gray-400 mt-1">Current Version</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">99.9%</div>
                        <p className="text-xs text-gray-400 mt-1">Uptime</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">Ready</div>
                        <p className="text-xs text-gray-400 mt-1">Status</p>
                      </div>
                    </div>
                  </div>

                  {/* Deployment Pipeline */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      <BoltIcon className="h-5 w-5 text-blue-500" />
                      Deployment Pipeline
                    </h4>
                    
                    <div className="space-y-3">
                      {/* Pipeline stages - Dynamic based on deployment status */}
                      {(() => {
                        const getStageStatus = (index: number) => {
                          if (!isDeployed) return { status: 'pending', progress: 0 };
                          
                          // Simulate progress based on deployment time
                          const deploymentTime = deploymentLogs.length > 0 ? deploymentLogs.length * 1000 : 0;
                          
                          if (index === 0) return { status: 'completed', progress: 100 };
                          if (index === 1 && deploymentTime > 1000) return { status: 'completed', progress: 100 };
                          if (index === 2 && deploymentTime > 2000) return { status: 'completed', progress: 100 };
                          if (index === 3 && deploymentTime > 3000) return { status: 'completed', progress: 100 };
                          if (index === 4 && deploymentTime > 4000) return { status: 'completed', progress: 100 };
                          if (index === 5 && deploymentTime > 5000) return { status: 'completed', progress: 100 };
                          
                          // Active stage
                          if (index === Math.floor(deploymentTime / 1000)) {
                            return { status: 'active', progress: (deploymentTime % 1000) / 10 };
                          }
                          
                          return { status: 'pending', progress: 0 };
                        };
                        
                        const stages = [
                          {
                            name: 'Pre-flight Checks',
                            icon: <ShieldCheckIcon className="h-4 w-4" />,
                            subtasks: [
                              'Environment validation',
                              'Resource availability',
                              'Security compliance'
                            ]
                          },
                          {
                            name: 'Dependency Resolution',
                            icon: <ArrowPathIcon className="h-4 w-4" />,
                            subtasks: [
                              'Package scanning',
                              'Version compatibility',
                              'License verification'
                            ]
                          },
                          {
                            name: 'Resource Provisioning',
                            icon: <CpuChipIcon className="h-4 w-4" />,
                            subtasks: [
                              'Infrastructure setup',
                              'Network configuration',
                              'Storage allocation'
                            ]
                          },
                          {
                            name: 'Application Deployment',
                            icon: <CloudArrowUpIcon className="h-4 w-4" />,
                            subtasks: [
                              'Container orchestration',
                              'Service mesh setup',
                              'Load balancer configuration'
                            ]
                          },
                          {
                            name: 'Performance Validation',
                            icon: <ChartBarIcon className="h-4 w-4" />,
                            subtasks: [
                              'Health checks',
                              'Performance benchmarks',
                              'Integration tests'
                            ]
                          },
                          {
                            name: 'Security Protocols',
                            icon: <ShieldCheckIcon className="h-4 w-4" />,
                            subtasks: [
                              'SSL/TLS configuration',
                              'Firewall rules',
                              'Access control setup'
                            ]
                          },
                        ];
                        
                        return stages.map((stage, index) => {
                          const { status, progress } = getStageStatus(index);
                          const isExpanded = expandedStages[index] || false;
                          
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                  status === 'active' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-gray-700 text-gray-500'
                                }`}>
                                  {stage.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <button
                                      onClick={() => setExpandedStages(prev => ({ ...prev, [index]: !prev[index] }))}
                                      className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                    >
                                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                      {stage.name}
                                    </button>
                                    <span className={`text-xs ${
                                      status === 'completed' ? 'text-green-400' :
                                      status === 'active' ? 'text-amber-400' :
                                      'text-gray-500'
                                    }`}>
                                      {status === 'completed' ? 'Completed' :
                                       status === 'active' ? 'In Progress' : 'Pending'}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        status === 'completed' ? 'bg-green-500' :
                                        status === 'active' ? 'bg-amber-500' :
                                        'bg-gray-600'
                                      }`}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Expandable Subtasks */}
                              {isExpanded && (
                                <div className="ml-14 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                  {stage.subtasks.map((subtask, subIndex) => {
                                    const isSubtaskActive = status === 'active' || (status === 'completed' && progress > (subIndex * 33));
                                    const isSubtaskComplete = status === 'completed' || (status === 'active' && progress > ((subIndex + 1) * 33));
                                    
                                    return (
                                      <div key={subIndex} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                          isSubtaskComplete ? 'bg-green-500/20' :
                                          isSubtaskActive ? 'bg-amber-500/20' :
                                          'bg-gray-700'
                                        }`}>
                                          {isSubtaskComplete ? (
                                            <CheckCircleIcon className="h-4 w-4 text-green-400" />
                                          ) : isSubtaskActive ? (
                                            <ArrowPathIcon className="h-4 w-4 text-amber-400 animate-spin" />
                                          ) : (
                                            <div className="w-2 h-2 bg-gray-600 rounded-full" />
                                          )}
                                        </div>
                                        <span className={`text-xs ${
                                          isSubtaskComplete ? 'text-green-400' :
                                          isSubtaskActive ? 'text-amber-400' :
                                          'text-gray-500'
                                        }`}>
                                          {subtask}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Dependency Resolution */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      <ArrowPathIcon className="h-5 w-5 text-purple-500" />
                      Dependency Resolution
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Agent Dependencies */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-3">Agent Dependencies</h5>
                        <div className="space-y-2">
                          {agents.map((agent, index) => {
                            const isResolved = isDeployed && deploymentLogs.length > index;
                            return (
                              <div key={agent.id} className="flex items-center justify-between bg-gray-800 rounded p-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    isResolved ? 'bg-green-400' : 'bg-amber-400 animate-pulse'
                                  }`} />
                                  <span className="text-sm text-gray-300">{agent.name}</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {isResolved ? 'Resolved' : 'Resolving...'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* System Dependencies */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-3">System Dependencies</h5>
                        <div className="space-y-2">
                          {[
                            { name: '@seraphim/core', version: 'v3.2.0', status: 'resolved' },
                            { name: '@seraphim/ai-engine', version: 'v2.8.1', status: 'resolved' },
                            { name: '@vanguard/security', version: 'v1.5.0', status: 'resolved' },
                            { name: '@vanguard/monitoring', version: 'v1.3.2', status: 'resolving' },
                          ].map((dep, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-800 rounded p-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  dep.status === 'resolved' ? 'bg-green-400' : 'bg-amber-400 animate-pulse'
                                }`} />
                                <span className="text-sm text-gray-300">{dep.name}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-400">{dep.version}</p>
                                <p className="text-xs text-gray-500 capitalize">{dep.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Health Checks */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Health Checks */}
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        <HeartIcon className="h-5 w-5 text-green-500" />
                        Health Checks
                      </h4>
                      <div className="space-y-3">
                        {[
                          { name: 'API Gateway', status: 'healthy', latency: '45ms' },
                          { name: 'AI Engine', status: 'healthy', latency: '120ms' },
                          { name: 'Database Cluster', status: 'healthy', latency: '8ms' },
                          { name: 'Cache Layer', status: 'healthy', latency: '2ms' },
                        ].map((check, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                check.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                              }`} />
                              <span className="text-sm text-gray-300">{check.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">{check.latency}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Security */}
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
                        Security
                      </h4>
                      <div className="space-y-3">
                        {[
                          { metric: 'SSL/TLS', value: 'Enabled', status: 'good' },
                          { metric: 'Firewall', value: 'Active', status: 'good' },
                          { metric: 'DDoS Protection', value: 'Active', status: 'good' },
                          { metric: 'Last Scan', value: '2 min ago', status: 'neutral' },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">{item.metric}</span>
                            <span className={`text-sm ${
                              item.status === 'good' ? 'text-green-400' : 'text-gray-300'
                            }`}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance */}
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-amber-500" />
                        Performance
                      </h4>
                      <div className="space-y-3">
                        {[
                          { metric: 'CPU Usage', value: '42%', status: 'good' },
                          { metric: 'Memory', value: '3.2GB / 8GB', status: 'good' },
                          { metric: 'Disk I/O', value: '125 MB/s', status: 'good' },
                          { metric: 'Network', value: '850 Mbps', status: 'good' },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">{item.metric}</span>
                            <span className={`text-sm ${
                              item.status === 'good' ? 'text-green-400' : 'text-amber-400'
                            }`}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Real-time Health Monitoring */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5 text-green-500" />
                      Real-time Health Monitoring
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'API Gateway', value: '45ms', subvalue: '99.99%', trend: 'stable' },
                        { label: 'AI Engine', value: '120ms', subvalue: '99.95%', trend: 'stable' },
                        { label: 'Database Cluster', value: '8.5ms', subvalue: '99.98%', trend: 'improving' },
                        { label: 'Last Check', value: '2s ago', subvalue: 'All Systems', trend: 'healthy' },
                      ].map((metric, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                          <p className="text-xl font-bold text-white">{metric.value}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400">{metric.subvalue}</p>
                            <div className={`text-xs ${
                              metric.trend === 'improving' ? 'text-green-400' :
                              metric.trend === 'healthy' ? 'text-green-400' :
                              'text-gray-400'
                            }`}>
                              {metric.trend === 'improving' && '↑'}
                              {metric.trend === 'stable' && '→'}
                              {metric.trend === 'healthy' && '✓'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Deployments */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-4">Recent Deployments</h4>
                    <div className="space-y-3">
                      {[
                        { version: 'v2.4.1', desc: 'Security patches & performance improvements', time: '2 hours ago', status: 'success' },
                        { version: 'v2.4.0', desc: 'New Vanguard agents for 12 use cases', time: '3 days ago', status: 'success' },
                        { version: 'v2.3.8', desc: 'Bug fixes and stability improvements', time: '1 week ago', status: 'success' },
                        { version: 'v2.3.7', desc: 'Enhanced workflow visualizations', time: '2 weeks ago', status: 'success' },
                      ].map((deployment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              deployment.status === 'success' ? 'bg-green-400' : 'bg-amber-400'
                            }`} />
                            <div>
                              <p className="text-sm font-medium text-gray-300">{deployment.version}</p>
                              <p className="text-xs text-gray-500">{deployment.desc}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">{deployment.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Select a use case to view deployment information
                </div>
              )}
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="space-y-6">
              {selectedUseCase ? (
                <>
                  {/* Operations Header */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <BoltIcon className="h-5 w-5 text-amber-500" />
                          Operations Center - {selectedUseCase.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Real-time monitoring of agent status and workflow execution
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Connection:</span>
                          <div className="flex items-center gap-1">
                            {isConnected ? (
                              <>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-xs text-green-400">Live</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                <span className="text-xs text-gray-400">Offline</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Auto-refresh:</span>
                          <div className="flex items-center gap-1">
                            <ArrowPathIcon className="h-4 w-4 text-green-400 animate-spin" />
                            <span className="text-xs text-green-400">{isConnected ? 'Real-time' : '5s'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 text-center relative overflow-hidden">
                        <div className="text-2xl font-bold text-white">{agents.length}</div>
                        <p className="text-xs text-gray-400 mt-1">Total Agents</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center relative overflow-hidden">
                        <div className="text-2xl font-bold text-green-400 transition-all duration-300">
                          {isDeployed ? onlineAgentsCount : 0}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Online Agents</p>
                        {isDeployed && onlineAgentsCount > 0 && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center relative overflow-hidden">
                        <div className="text-2xl font-bold text-amber-400 transition-all duration-300">
                          {isDeployed ? operationsData.activeWorkflows : 0}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Active Workflows</p>
                        {isDeployed && operationsData.activeWorkflows > 0 && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400 transition-all duration-300">
                          {operationsData.totalTasks > 0 ?
                            ((operationsData.totalTasks - operationsData.failedTasks) / operationsData.totalTasks * 100).toFixed(1) + '%' :
                            '0%'}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Success Rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Agent Status Grid */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-4">Agent Status</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {agents.map((agent, index) => {
                        // Generate dynamic status and metrics
                        const currentStatus = agent.status || 'offline';
                        
                        // Generate use-case specific current tasks
                        const getUseCaseSpecificTask = () => {
                          if (currentStatus === 'maintenance') return 'System maintenance';
                          if (currentStatus === 'offline') return 'No active task';
                          if (currentStatus === 'idle') return 'Waiting for tasks';
                          
                          // Use case specific task templates
                          const taskTemplates: { [key: string]: { [agentType: string]: string[] } } = {
                            'oilfield-lease': {
                              security: ['Validating access for lease batch #', 'Auditing permissions for portfolio #', 'Encrypting sensitive lease data #'],
                              integrity: ['Cross-referencing lease #', 'Validating data consistency for property #', 'Reconciling ERP/GIS data for tract #'],
                              accuracy: ['Analyzing expiration for lease #', 'Calculating risk score for property #', 'Detecting anomalies in lease #'],
                              optimization: ['Optimizing renewal terms for lease #', 'Modeling financial impact for portfolio #', 'Identifying cost savings in region #'],
                              negotiation: ['Generating renewal package for lease #', 'Executing auto-renewal for batch #', 'Analyzing contract terms for property #']
                            },
                            'grid-anomaly': {
                              security: ['Securing SCADA connection for sector #', 'Validating sensor authentication #', 'Encrypting telemetry stream #'],
                              monitoring: ['Monitoring voltage in sector #', 'Tracking frequency deviation at node #', 'Analyzing transformer load #'],
                              prediction: ['Forecasting load for next 4hr in zone #', 'Predicting failure risk for asset #', 'Modeling cascade probability #'],
                              response: ['Rerouting power through circuit #', 'Dispatching crew to substation #', 'Activating demand response for area #'],
                              optimization: ['Balancing load across feeders #', 'Optimizing dispatch for region #', 'Minimizing line losses in sector #']
                            },
                            'patient-risk': {
                              security: ['Securing PHI for patient cohort #', 'Validating HIPAA compliance for access #', 'Encrypting medical records batch #'],
                              integrity: ['Reconciling EHR data for patient #', 'Validating claims consistency #', 'Cross-checking lab results #'],
                              accuracy: ['Calculating risk score for patient #', 'Identifying comorbidities in record #', 'Detecting data anomalies #'],
                              analysis: ['Analyzing social determinants for cohort #', 'Evaluating treatment patterns #', 'Assessing medication adherence #'],
                              optimization: ['Generating care plan for patient #', 'Optimizing intervention timing #', 'Prioritizing outreach list #']
                            },
                            'fraud-detection': {
                              security: ['Securing transaction batch #', 'Validating merchant authentication #', 'Encrypting payment data stream #'],
                              monitoring: ['Monitoring transactions from merchant #', 'Tracking velocity for account #', 'Analyzing spending patterns #'],
                              analysis: ['Analyzing fraud pattern #', 'Evaluating risk signals for TX #', 'Detecting anomalous behavior #'],
                              accuracy: ['Scoring fraud probability for TX #', 'Validating transaction legitimacy #', 'Calibrating detection models #'],
                              response: ['Blocking suspicious transaction #', 'Flagging account for review #', 'Triggering step-up authentication #']
                            },
                            'predictive-maintenance': {
                              monitoring: ['Monitoring vibration on unit #', 'Tracking temperature for asset #', 'Analyzing pressure trends #'],
                              analysis: ['Analyzing failure patterns for equipment #', 'Evaluating wear indicators #', 'Assessing component degradation #'],
                              prediction: ['Predicting failure for unit #', 'Forecasting maintenance window #', 'Estimating remaining life #'],
                              optimization: ['Optimizing maintenance schedule #', 'Planning parts inventory #', 'Scheduling crew deployment #'],
                              response: ['Generating work order for asset #', 'Triggering preventive action #', 'Updating maintenance plan #']
                            },
                            'default': {
                              security: ['Validating access permissions #', 'Securing data transmission #', 'Auditing system access #'],
                              integrity: ['Validating data consistency #', 'Cross-referencing sources #', 'Ensuring data quality #'],
                              accuracy: ['Analyzing data accuracy #', 'Detecting anomalies #', 'Validating results #'],
                              optimization: ['Optimizing process flow #', 'Improving efficiency #', 'Reducing resource usage #'],
                              monitoring: ['Monitoring system health #', 'Tracking performance metrics #', 'Observing trends #'],
                              analysis: ['Analyzing patterns #', 'Evaluating outcomes #', 'Assessing impact #'],
                              prediction: ['Forecasting trends #', 'Predicting outcomes #', 'Modeling scenarios #'],
                              compliance: ['Checking compliance rules #', 'Validating regulations #', 'Ensuring standards #'],
                              negotiation: ['Optimizing terms #', 'Analyzing agreements #', 'Executing decisions #'],
                              response: ['Executing response plan #', 'Taking corrective action #', 'Implementing solution #']
                            }
                          };
                          
                          const templates = taskTemplates[selectedUseCase?.id || 'default'] || taskTemplates['default'];
                          const agentTemplates = templates[agent.type] || templates['default'] || ['Processing task #'];
                          const template = agentTemplates[Math.floor(Math.random() * agentTemplates.length)];
                          const taskId = Math.floor(Math.random() * 9000) + 1000;
                          
                          return currentStatus === 'processing' ?
                            `${template}${taskId}` :
                            `Preparing: ${template}${taskId}`;
                        };
                        
                        const currentTask = getUseCaseSpecificTask();
                        
                        // Define agent metrics for this specific agent
                        // Use operationsData and agentStats to make metrics dynamic
                        const agentTaskCount = agentStats[agent.id]?.tasksCompleted || Math.floor(operationsData.totalTasks / agents.length);
                        const agentMetrics = {
                          cpuUsage: currentStatus === 'processing' ? 50 + Math.floor(Math.sin(Date.now() / 1000 + index) * 20 + 20) :
                                   currentStatus === 'active' ? 20 + Math.floor(Math.sin(Date.now() / 2000 + index) * 15 + 15) :
                                   currentStatus === 'idle' ? 5 + Math.floor(Math.sin(Date.now() / 3000 + index) * 5 + 5) :
                                   0,
                          memoryUsage: currentStatus === 'processing' ? 60 + Math.floor(Math.cos(Date.now() / 1500 + index) * 15 + 15) :
                                      currentStatus === 'active' ? 30 + Math.floor(Math.cos(Date.now() / 2500 + index) * 10 + 10) :
                                      currentStatus === 'idle' ? 10 + Math.floor(Math.cos(Date.now() / 3500 + index) * 5 + 5) :
                                      0,
                          tasksCompleted: agentTaskCount,
                          errorRate: (operationsData.failedTasks / operationsData.totalTasks * 100).toFixed(1)
                        };
                        
                        return (
                          <div key={agent.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 relative overflow-hidden">
                            {/* Status Indicator */}
                            <div className="absolute top-2 right-2">
                              <div className="flex items-center gap-2">
                                {currentStatus === 'processing' && (
                                  <>
                                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                    <span className="text-xs text-amber-400">Processing</span>
                                  </>
                                )}
                                {currentStatus === 'active' && (
                                  <>
                                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                                    <span className="text-xs text-green-400">Active</span>
                                  </>
                                )}
                                {currentStatus === 'idle' && (
                                  <>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                    <span className="text-xs text-blue-400">Idle</span>
                                  </>
                                )}
                                {currentStatus === 'maintenance' && (
                                  <>
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                    <span className="text-xs text-yellow-400">Maintenance</span>
                                  </>
                                )}
                                {currentStatus === 'offline' && (
                                  <>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                    <span className="text-xs text-gray-400">Offline</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Agent Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAgentColor(agent.type)} p-0.5`}>
                                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                                  <div className="text-white w-6 h-6">
                                    {getAgentIcon(agent.type)}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h5 className="text-sm font-semibold text-white">{agent.name}</h5>
                                <p className="text-xs text-gray-400 capitalize">{agent.type} Agent</p>
                              </div>
                            </div>

                            {/* Current Task */}
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 mb-1">Current Task</p>
                              <p className="text-xs text-gray-300 truncate">
                                {currentStatus === 'processing' ? (
                                  <span className="flex items-center gap-1">
                                    <ArrowPathIcon className="h-3 w-3 animate-spin" />
                                    {currentTask}
                                  </span>
                                ) : (
                                  currentTask
                                )}
                              </p>
                            </div>

                            {/* Resource Usage */}
                            <div className="space-y-3">
                              {/* CPU Usage */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-400">CPU</span>
                                  <span className={`text-xs ${
                                    agentMetrics.cpuUsage > 80 ? 'text-red-400' :
                                    agentMetrics.cpuUsage > 60 ? 'text-amber-400' :
                                    'text-green-400'
                                  }`}>{agentMetrics.cpuUsage}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                      agentMetrics.cpuUsage > 80 ? 'bg-red-500' :
                                      agentMetrics.cpuUsage > 60 ? 'bg-amber-500' :
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${agentMetrics.cpuUsage}%`, transition: 'width 0.5s ease-out' }}
                                  />
                                </div>
                              </div>

                              {/* Memory Usage */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-400">Memory</span>
                                  <span className={`text-xs ${
                                    agentMetrics.memoryUsage > 80 ? 'text-red-400' :
                                    agentMetrics.memoryUsage > 60 ? 'text-amber-400' :
                                    'text-green-400'
                                  }`}>{agentMetrics.memoryUsage}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                      agentMetrics.memoryUsage > 80 ? 'bg-red-500' :
                                      agentMetrics.memoryUsage > 60 ? 'bg-amber-500' :
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${agentMetrics.memoryUsage}%`, transition: 'width 0.5s ease-out' }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500">Tasks</p>
                                <p className="text-sm font-semibold text-white transition-all duration-300">{agentMetrics.tasksCompleted}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Error Rate</p>
                                <p className={`text-sm font-semibold ${
                                  parseFloat(agentMetrics.errorRate) > 5 ? 'text-red-400' :
                                  parseFloat(agentMetrics.errorRate) > 2 ? 'text-amber-400' :
                                  'text-green-400'
                                }`}>{agentMetrics.errorRate}%</p>
                              </div>
                            </div>

                            {/* Activity Indicator for Processing Agents */}
                            {currentStatus === 'processing' && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* System Metrics - System Health and Workflow Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* System Health */}
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        <HeartIcon className="h-5 w-5 text-green-500" />
                        System Health
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">API Response</span>
                          <span className="text-sm text-green-400 transition-all duration-300">
                            {isDeployed ? `${Math.floor(Math.random() * 50 + 20)}ms` : '45ms'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Database Load</span>
                          <span className="text-sm text-yellow-400 transition-all duration-300">
                            {isDeployed ? `${Math.floor(Math.random() * 30 + 50)}%` : '67%'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Queue Depth</span>
                          <span className="text-sm text-blue-400 transition-all duration-300">
                            {isDeployed ? `${Math.floor(Math.random() * 50 + 10)} tasks` : '23 tasks'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Uptime</span>
                          <span className="text-sm text-green-400">99.98%</span>
                        </div>
                      </div>
                    </div>

                    {/* Workflow Statistics */}
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-amber-500" />
                        Workflow Statistics
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Running</span>
                          <span className="text-sm text-amber-400 transition-all duration-300">{agents.filter(a => a.status === 'processing').length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Completed</span>
                          <span className="text-sm text-green-400 transition-all duration-300">{operationsData.totalTasks.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Failed</span>
                          <span className="text-sm text-red-400 transition-all duration-300">{operationsData.failedTasks}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Avg Duration</span>
                          <span className="text-sm text-blue-400 transition-all duration-300">{operationsData.avgDuration}s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity - Full Width */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-300 flex items-center gap-2">
                        <BoltIcon className="h-5 w-5 text-blue-500" />
                        Recent Activity
                      </h4>
                      {isConnected && isDeployed && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-xs text-green-400">Live Updates</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {operationsData.activities.length > 0 ? (
                        operationsData.activities.map((activity, index) => (
                          <div
                            key={activity.id}
                            className={`flex items-center gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-all duration-300 ${
                              index === 0 && activity.time === 'Just now' ? 'animate-pulse bg-gray-700' : ''
                            }`}
                          >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            activity.status === 'success' ? 'bg-green-400' :
                            activity.status === 'warning' ? 'bg-amber-400' :
                            'bg-red-400'
                          }`} />
                          <span className={`text-sm text-gray-400 flex-shrink-0 w-20 ${
                            activity.time === 'Just now' ? 'text-green-400' : ''
                          }`}>{activity.time}</span>
                          <span className="text-sm font-medium text-gray-300 flex-shrink-0 w-40">{activity.agent}</span>
                          <span className="text-sm text-gray-300 flex-1">{activity.action}</span>
                          <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                            activity.status === 'success' ? 'bg-green-900/50 text-green-400' :
                            activity.status === 'warning' ? 'bg-amber-900/50 text-amber-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                            {activity.status}
                          </span>
                          </div>
                        ))
                      ) : (
                        // Show placeholder activities if no dynamic ones yet
                        (() => {
                          // Define placeholder activities for each use case
                          const placeholderActivities: { [key: string]: any[] } = {
                            'oilfield-lease': [
                              { id: 1, time: '2s ago', agent: 'Security Agent', action: 'Validated lease permissions for batch #1247', status: 'success' },
                              { id: 2, time: '15s ago', agent: 'Integrity Agent', action: 'Cross-referenced data sources across ERP, GIS, and CLM systems', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Accuracy Agent', action: 'Detected expiring lease: Property ID #8934 expires in 45 days', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Optimization Agent', action: 'Generated renewal strategy with projected savings of $2.3M', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Negotiation Agent', action: 'Executed auto-renewal for 15 low-risk leases', status: 'success' },
                            ],
                            'grid-anomaly': [
                              { id: 1, time: '2s ago', agent: 'Monitoring Agent', action: 'Detected voltage irregularity in Sector 7 transformer', status: 'warning' },
                              { id: 2, time: '15s ago', agent: 'Response Agent', action: 'Rerouted power flow to prevent overload on Circuit 12', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Prediction Agent', action: 'Forecasted 15% cascade failure risk for next 4 hours', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Optimization Agent', action: 'Balanced load distribution across 5 substations', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Monitoring Agent', action: 'Grid stability maintained at 99.99% reliability', status: 'success' },
                            ],
                            'patient-risk': [
                              { id: 1, time: '2s ago', agent: 'Accuracy Agent', action: 'Identified 23 patients with critical risk scores', status: 'warning' },
                              { id: 2, time: '15s ago', agent: 'Optimization Agent', action: 'Generated personalized care plans for 127 patients', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Response Agent', action: 'Scheduled immediate intervention for Patient ID #4521', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Prediction Agent', action: 'Projected 45% reduction in readmission rates', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Monitoring Agent', action: 'Initiated remote monitoring for 59 at-risk patients', status: 'success' },
                            ],
                            'fraud-detection': [
                              { id: 1, time: '2s ago', agent: 'Monitoring Agent', action: 'Blocked fraudulent transaction TX#98234 for $4,250', status: 'success' },
                              { id: 2, time: '15s ago', agent: 'Analysis Agent', action: 'Detected suspicious pattern in account #7823', status: 'warning' },
                              { id: 3, time: '45s ago', agent: 'Response Agent', action: 'Held 23 transactions for manual review', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Accuracy Agent', action: 'Maintained 2% false positive rate across 50K transactions', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Security Agent', action: 'Updated fraud models with latest attack patterns', status: 'success' },
                            ],
                            'predictive-maintenance': [
                              { id: 1, time: '2s ago', agent: 'Prediction Agent', action: 'Detected early failure indicators in Pump Unit #234', status: 'warning' },
                              { id: 2, time: '15s ago', agent: 'Response Agent', action: 'Generated preventive work order for Motor #567', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Monitoring Agent', action: 'Vibration anomaly detected in Compressor #891', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Optimization Agent', action: 'Scheduled maintenance during planned downtime window', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Analysis Agent', action: 'Calculated 30-day failure probability at 87% for Unit #345', status: 'success' },
                            ],
                            'demand-forecasting': [
                              { id: 1, time: '2s ago', agent: 'Prediction Agent', action: 'Identified surge in demand for SKU #7823 next week', status: 'warning' },
                              { id: 2, time: '15s ago', agent: 'Optimization Agent', action: 'Adjusted inventory levels for 2,345 products', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Analysis Agent', action: 'Detected seasonal pattern shift in electronics category', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Response Agent', action: 'Generated replenishment orders preventing 89 stockouts', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Accuracy Agent', action: 'Achieved 95% forecast accuracy across all categories', status: 'success' },
                            ],
                            'route-optimization': [
                              { id: 1, time: '2s ago', agent: 'Optimization Agent', action: 'Rerouted 23 deliveries around traffic incident on I-95', status: 'success' },
                              { id: 2, time: '15s ago', agent: 'Monitoring Agent', action: 'Detected 15-minute delay on Route 7 affecting 8 drivers', status: 'warning' },
                              { id: 3, time: '45s ago', agent: 'Response Agent', action: 'Consolidated 45 routes saving 12 delivery vehicles', status: 'success' },
                              { id: 4, time: '1m ago', agent: 'Analysis Agent', action: 'Calculated optimal loading sequence for 300 packages', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Prediction Agent', action: 'Forecasted 95% on-time delivery rate for today', status: 'success' },
                            ],
                            'renewable-optimization': [
                              { id: 1, time: '2s ago', agent: 'Optimization Agent', action: 'Reduced curtailment by 85% through smart dispatch', status: 'success' },
                              { id: 2, time: '15s ago', agent: 'Prediction Agent', action: 'Forecasted 2.4GW solar generation for next 4 hours', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Response Agent', action: 'Activated battery storage to capture excess wind power', status: 'success' },
                              { id: 4, time: '1m ago', agent: 'Monitoring Agent', action: 'Detected cloud cover approaching solar farm #12', status: 'warning' },
                              { id: 5, time: '2m ago', agent: 'Analysis Agent', action: 'Optimized storage dispatch saving $48K in arbitrage', status: 'success' },
                            ],
                            'clinical-trial-matching': [
                              { id: 1, time: '2s ago', agent: 'Analysis Agent', action: 'Matched 127 patients to active oncology trials', status: 'success' },
                              { id: 2, time: '15s ago', agent: 'Accuracy Agent', action: 'Verified eligibility criteria for 450 candidates', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Response Agent', action: 'Notified 23 sites of qualified patient matches', status: 'success' },
                              { id: 4, time: '1m ago', agent: 'Optimization Agent', action: 'Prioritized enrollment for expiring trials', status: 'warning' },
                              { id: 5, time: '2m ago', agent: 'Monitoring Agent', action: 'Tracked enrollment progress across 15 trials', status: 'success' },
                            ],
                            'ai-credit-scoring': [
                              { id: 1, time: '2s ago', agent: 'Analysis Agent', action: 'Processed 2,500 credit applications with AI scoring', status: 'success' },
                              { id: 2, time: '15s ago', agent: 'Compliance Agent', action: 'Verified fair lending compliance for all decisions', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Accuracy Agent', action: 'Detected 12 applications requiring manual review', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Optimization Agent', action: 'Approved 40% more applicants while reducing risk', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Security Agent', action: 'Protected applicant data with end-to-end encryption', status: 'success' },
                            ],
                            'quality-inspection': [
                              { id: 1, time: '2s ago', agent: 'Monitoring Agent', action: 'Inspected 50,000 units with 99.9% accuracy', status: 'success' },
                              { id: 2, time: '15s ago', agent: 'Accuracy Agent', action: 'Detected micro-defect in batch #7823 preventing recall', status: 'warning' },
                              { id: 3, time: '45s ago', agent: 'Response Agent', action: 'Quarantined 12 units for detailed inspection', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Analysis Agent', action: 'Identified pattern indicating tool wear on Line 3', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Optimization Agent', action: 'Adjusted inspection parameters for new product variant', status: 'success' },
                            ],
                            'customer-personalization': [
                              { id: 1, time: '2s ago', agent: 'Analysis Agent', action: 'Generated personalized offers for 1M customers', status: 'success' },
                              { id: 2, time: '15s ago', agent: 'Prediction Agent', action: 'Identified 15K customers at risk of churn', status: 'warning' },
                              { id: 3, time: '45s ago', agent: 'Optimization Agent', action: 'A/B tested 23 campaign variants with 45% lift', status: 'success' },
                              { id: 4, time: '1m ago', agent: 'Response Agent', action: 'Triggered retention campaigns for high-value segments', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Monitoring Agent', action: 'Tracked real-time engagement across all channels', status: 'success' },
                            ],
                            'fleet-maintenance': [
                              { id: 1, time: '2s ago', agent: 'Prediction Agent', action: 'Predicted brake failure in Vehicle #234 within 7 days', status: 'warning' },
                              { id: 2, time: '15s ago', agent: 'Response Agent', action: 'Scheduled preventive maintenance for 8 vehicles', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Monitoring Agent', action: 'Detected abnormal engine temperature in Truck #567', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Optimization Agent', action: 'Optimized parts inventory saving $25K this month', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Analysis Agent', action: 'Analyzed fleet performance achieving 98% uptime', status: 'success' },
                            ],
                            'adaptive-learning': [
                              { id: 1, time: '2s ago', agent: 'Analysis Agent', action: 'Identified 234 students needing math intervention', status: 'warning' },
                              { id: 2, time: '15s ago', agent: 'Optimization Agent', action: 'Personalized learning paths for 5,000 students', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Prediction Agent', action: 'Predicted 85% chance of dropout for 12 students', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Response Agent', action: 'Triggered early intervention for at-risk students', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Monitoring Agent', action: 'Tracked engagement metrics showing 70% improvement', status: 'success' },
                            ],
                            'drug-discovery': [
                              { id: 1, time: '2s ago', agent: 'Analysis Agent', action: 'Analyzed 10,000 molecular compounds for target binding', status: 'success' },
                              { id: 2, time: '15s ago', agent: 'Prediction Agent', action: 'Identified 3 promising candidates for Phase I trials', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Optimization Agent', action: 'Optimized synthesis pathway reducing cost by 70%', status: 'success' },
                              { id: 4, time: '1m ago', agent: 'Accuracy Agent', action: 'Validated safety profile through in-silico testing', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Monitoring Agent', action: 'Tracked research progress across 8 parallel studies', status: 'success' },
                            ],
                            'emergency-response': [
                              { id: 1, time: '2s ago', agent: 'Response Agent', action: 'Coordinated multi-agency response to Zone 4 incident', status: 'warning' },
                              { id: 2, time: '15s ago', agent: 'Optimization Agent', action: 'Deployed resources optimally reducing response by 40%', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Monitoring Agent', action: 'Detected developing situation requiring 3 units', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Prediction Agent', action: 'Forecasted incident escalation probability at 15%', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Analysis Agent', action: 'Analyzed response patterns improving protocols', status: 'success' },
                            ],
                            'network-performance': [
                              { id: 1, time: '2s ago', agent: 'Monitoring Agent', action: 'Detected latency spike on backbone router #12', status: 'warning' },
                              { id: 2, time: '15s ago', agent: 'Response Agent', action: 'Rerouted traffic preventing 20K customer impacts', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Optimization Agent', action: 'Balanced load across 1,000 network nodes', status: 'success' },
                              { id: 4, time: '1m ago', agent: 'Prediction Agent', action: 'Predicted 99.99% uptime for next 24 hours', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Security Agent', action: 'Blocked 12K malicious requests protecting network', status: 'success' },
                            ],
                            'ai-pricing-governance': [
                              { id: 1, time: '2s ago', agent: 'Compliance Agent', action: 'Verified 100% pricing decisions for fairness', status: 'success' },
                              { id: 2, time: '15s ago', agent: 'Analysis Agent', action: 'Detected potential bias in Zone 3 pricing model', status: 'warning' },
                              { id: 3, time: '45s ago', agent: 'Optimization Agent', action: 'Optimized prices increasing revenue 15% ethically', status: 'success' },
                              { id: 4, time: '1m ago', agent: 'Monitoring Agent', action: 'Tracked pricing decisions across all segments', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Accuracy Agent', action: 'Validated compliance with all regulatory requirements', status: 'success' },
                            ],
                            'default': [
                              { id: 1, time: '2s ago', agent: 'Security Agent', action: 'Validated system permissions for operation #1247', status: 'success' },
                              { id: 2, time: '15s ago', agent: 'Integrity Agent', action: 'Cross-referenced data sources across integrated systems', status: 'success' },
                              { id: 3, time: '45s ago', agent: 'Accuracy Agent', action: 'Detected anomaly requiring attention: Case #8934', status: 'warning' },
                              { id: 4, time: '1m ago', agent: 'Optimization Agent', action: 'Generated optimization strategy with projected improvements', status: 'success' },
                              { id: 5, time: '2m ago', agent: 'Response Agent', action: 'Executed automated actions for 15 routine tasks', status: 'success' },
                            ]
                          };
                          
                          const activities = placeholderActivities[selectedUseCase?.id || 'default'] || placeholderActivities['default'];
                          
                          return activities.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              activity.status === 'success' ? 'bg-green-400' :
                              activity.status === 'warning' ? 'bg-amber-400' :
                              'bg-red-400'
                            }`} />
                            <span className={`text-sm text-gray-400 flex-shrink-0 w-20 ${
                              activity.time === 'Just now' ? 'text-green-400' : ''
                            }`}>{activity.time}</span>
                            <span className="text-sm font-medium text-gray-300 flex-shrink-0 w-40">{activity.agent}</span>
                            <span className="text-sm text-gray-300 flex-1">{activity.action}</span>
                            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                              activity.status === 'success' ? 'bg-green-900/50 text-green-400' :
                              activity.status === 'warning' ? 'bg-amber-900/50 text-amber-400' :
                              'bg-red-900/50 text-red-400'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                        ));
                      })()
                      )}
                    </div>
                  </div>

                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Select a use case to view operational metrics
                </div>
              )}
            </div>
          )}

          {activeTab === 'outputs' && (
            <div className="space-y-6">
              {selectedUseCase ? (
                <>
                  {/* Outputs Header */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Outputs & Reports
                    </h3>
                    <p className="text-sm text-gray-400">
                      View vanguard actions audit trail and comprehensive reports generated for {selectedUseCase.name}
                    </p>
                  </div>

                  {/* Vanguard Actions Section - Placed First */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      <BoltIcon className="h-5 w-5 text-amber-500" />
                      Vanguard Actions
                    </h4>
                    <VanguardActionsDropdown useCaseId={selectedUseCase?.id} />
                  </div>

                  {/* Generated Reports & Outputs Section - Direct Display */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-6 flex items-center gap-2">
                      <DocumentArrowDownIcon className="h-5 w-5 text-amber-500" />
                      Generated Reports & Outputs
                      <span className="text-xs text-gray-500 font-normal">({downloads.length} reports)</span>
                    </h4>
                    
                    <div className="space-y-6">
                      {downloads.length > 0 ? (
                        <>
                          {/* Executive Reports Section */}
                          {(() => {
                            const executiveReports = downloads.filter(d =>
                              d.category === 'Executive Reports' ||
                              d.name.toLowerCase().includes('executive') ||
                              d.name.toLowerCase().includes('summary')
                            );
                            const otherReports = downloads.filter(d =>
                              d.category !== 'Executive Reports' &&
                              !d.name.toLowerCase().includes('executive') &&
                              !d.name.toLowerCase().includes('summary')
                            );
                            
                            return (
                              <>
                                {/* Executive Reports at the Top */}
                                {executiveReports.length > 0 && (
                                  <div className="space-y-3">
                                    <h5 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                                      <DocumentArrowDownIcon className="h-4 w-4 text-amber-500" />
                                      Executive Reports
                                      <span className="text-xs text-gray-500 font-normal">({executiveReports.length} reports)</span>
                                    </h5>
                                    
                                    <div className="grid grid-cols-1 gap-3">
                                      {executiveReports.map((download) => (
                                        <div key={download.id} className="bg-gray-800 rounded-lg p-4 border border-amber-700/30 hover:border-amber-600/50 transition-all">
                                          <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                              <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                  {download.name.endsWith('.pdf') ? (
                                                    <DocumentArrowDownIcon className="h-5 w-5 text-red-400" />
                                                  ) : download.name.endsWith('.xlsx') ? (
                                                    <DocumentArrowDownIcon className="h-5 w-5 text-green-400" />
                                                  ) : download.name.endsWith('.zip') ? (
                                                    <DocumentArrowDownIcon className="h-5 w-5 text-blue-400" />
                                                  ) : (
                                                    <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
                                                  )}
                                                </div>
                                                <div className="flex-1">
                                                  <p className="text-sm font-medium text-gray-300">{download.name}</p>
                                                  {download.description && (
                                                    <p className="text-xs text-gray-500 mt-1">{download.description}</p>
                                                  )}
                                                  <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-xs text-gray-500">{download.size}</span>
                                                    <span className="text-xs text-gray-600">•</span>
                                                    <span className="text-xs text-gray-500">
                                                      Generated {new Date(download.timestamp).toLocaleTimeString()}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={async () => {
                                                  addDeploymentLog(`Downloading ${download.name}...`);
                                                  try {
                                                    await genericReportsService.downloadReport(download.id, download.name, download.downloadUrl);
                                                    addDeploymentLog(`✅ ${download.name} downloaded successfully`);
                                                  } catch (error) {
                                                    addDeploymentLog(`❌ Failed to download ${download.name}`);
                                                    console.error('Download error:', error);
                                                  }
                                                }}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400/50 rounded-md transition-all"
                                              >
                                                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                                                Download
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Use Case Specific Reports */}
                                {otherReports.length > 0 && (
                                  <>
                                    <div className="border-t border-gray-700 pt-6">
                                      <h5 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                                        <DocumentArrowDownIcon className="h-4 w-4 text-gray-500" />
                                        {selectedUseCase?.name} Specific Reports
                                        <span className="text-xs text-gray-500 font-normal">({otherReports.length} reports)</span>
                                      </h5>
                                    </div>
                                    
                                    {/* Group remaining reports by category */}
                                    {(() => {
                                      const categories = [...new Set(otherReports.map(d => d.category || 'General'))];
                                      return categories.map(category => {
                                        const categoryDownloads = otherReports.filter(d => (d.category || 'General') === category);
                                        return (
                                          <div key={category} className="space-y-3">
                                            <h6 className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                                              <DocumentArrowDownIcon className="h-3 w-3 text-gray-600" />
                                              {category}
                                              <span className="text-xs text-gray-600 font-normal">({categoryDownloads.length})</span>
                                            </h6>
                                            
                                            <div className="grid grid-cols-1 gap-3">
                                              {categoryDownloads.map((download) => (
                                                <div key={download.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all">
                                                  <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                      <div className="flex items-start gap-3">
                                                        <div className="flex-shrink-0 mt-0.5">
                                                          {download.name.endsWith('.pdf') ? (
                                                            <DocumentArrowDownIcon className="h-5 w-5 text-red-400" />
                                                          ) : download.name.endsWith('.xlsx') ? (
                                                            <DocumentArrowDownIcon className="h-5 w-5 text-green-400" />
                                                          ) : download.name.endsWith('.zip') ? (
                                                            <DocumentArrowDownIcon className="h-5 w-5 text-blue-400" />
                                                          ) : (
                                                            <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
                                                          )}
                                                        </div>
                                                        <div className="flex-1">
                                                          <p className="text-sm font-medium text-gray-300">{download.name}</p>
                                                          {download.description && (
                                                            <p className="text-xs text-gray-500 mt-1">{download.description}</p>
                                                          )}
                                                          <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-xs text-gray-500">{download.size}</span>
                                                            <span className="text-xs text-gray-600">•</span>
                                                            <span className="text-xs text-gray-500">
                                                              Generated {new Date(download.timestamp).toLocaleTimeString()}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                      <button
                                                        onClick={async () => {
                                                          addDeploymentLog(`Downloading ${download.name}...`);
                                                          try {
                                                            await genericReportsService.downloadReport(download.id, download.name, download.downloadUrl);
                                                            addDeploymentLog(`✅ ${download.name} downloaded successfully`);
                                                          } catch (error) {
                                                            addDeploymentLog(`❌ Failed to download ${download.name}`);
                                                            console.error('Download error:', error);
                                                          }
                                                        }}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400/50 rounded-md transition-all"
                                                      >
                                                        <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                                                        Download
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      });
                                    })()}
                                  </>
                                )}
                              </>
                            );
                          })()}
                          
                          {/* Summary Statistics */}
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-6">
                            <h5 className="text-sm font-semibold text-gray-400 mb-4">Report Generation Summary</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-white">{downloads.length}</div>
                                <p className="text-xs text-gray-400 mt-1">Total Reports</p>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">
                                  {downloads.filter(d => d.name.endsWith('.pdf')).length}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">PDF Documents</p>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">
                                  {downloads.filter(d => d.name.endsWith('.xlsx')).length}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Excel Files</p>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-amber-400">
                                  {downloads.reduce((acc, d) => {
                                    const sizeNum = parseFloat(d.size);
                                    return acc + (isNaN(sizeNum) ? 0 : sizeNum);
                                  }, 0).toFixed(1)} MB
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Total Size</p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-gray-400">
                          <DocumentArrowDownIcon className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                          <p className="text-lg font-medium mb-2">No reports generated yet</p>
                          <p className="text-sm">Deploy agents to analyze data and generate comprehensive reports</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <DocumentArrowDownIcon className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg font-medium mb-2">Select a use case</p>
                  <p className="text-sm">Choose a use case to view available reports and outputs</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Executive Summary Modal - Dark Theme */}
      <Transition appear show={showExecutiveSummary} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowExecutiveSummary(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4 flex items-center justify-between">
                    Preloaded Data: {selectedUseCase?.name}
                    <button
                      onClick={() => setShowExecutiveSummary(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    <p className="text-gray-300 mb-4">
                      Select preloaded datasets specific to the {selectedUseCase?.name} use case:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Render preloaded datasets for the selected use case */}
                      {selectedUseCase && preloadedDatasets[selectedUseCase.id] && (
                        <>
                          {preloadedDatasets[selectedUseCase.id].map((dataset) => (
                            <DatasetCard
                              key={dataset.id}
                              dataset={dataset}
                              isLoaded={loadedDatasets.includes(dataset.id)}
                              isLoading={loadingDataset === dataset.id}
                              onClick={() => {
                                if (!loadedDatasets.includes(dataset.id)) {
                                  setLoadingDataset(dataset.id);
                                  setTimeout(() => {
                                    setLoadedDatasets(prev => [...prev, dataset.id]);
                                    setLoadingDataset(null);
                                    addIntegrationLog(`${dataset.name} loaded successfully`, 'success');
                                  }, Math.random() * 1000 + 1000); // Random delay between 1-2 seconds
                                }
                              }}
                            />
                          ))}
                        </>
                      )}

                      {/* Fallback for use cases without preloaded datasets */}
                      {selectedUseCase && !preloadedDatasets[selectedUseCase.id] && (
                        <div className="text-center py-8 text-gray-400">
                          <p>No preloaded datasets available for {selectedUseCase.name} yet.</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mt-4">
                      <div className="flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-blue-300">
                            Click on any dataset to begin ingestion. The Vanguard agents will automatically process and analyze the data for your use case.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => {
                        setShowExecutiveSummary(false);
                        setLoadedDatasets([]);
                      }}
                    >
                      Close
                    </button>
                    {loadedDatasets.length > 0 && (
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                        onClick={() => {
                          setShowExecutiveSummary(false);
                          addDeploymentLog(`Ingested ${loadedDatasets.length} dataset(s) for ${selectedUseCase?.name}`);
                          addIntegrationLog(`Successfully loaded preloaded data for analysis`, 'success');
                          setLoadedDatasets([]);
                        }}
                      >
                        Start Analysis
                      </button>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Upload Data Modal - Dark Theme */}
      <Transition appear show={showUploadModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowUploadModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4">
                    Upload Use Case Data
                  </Dialog.Title>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Industry
                    </label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                      {industries.map((industry) => (
                        <option key={industry.id} value={industry.id}>
                          {industry.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Files
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                      <CloudArrowUpIcon className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 mb-2">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        Supported formats: CSV, JSON, Excel, PDF
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".csv,.json,.xlsx,.xls,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            addDeploymentLog(`Uploading ${files.length} file(s)...`);
                            setTimeout(() => {
                              addDeploymentLog('Files processed successfully');
                              addIntegrationLog(`Imported ${files.length} use case file(s)`, 'success');
                            }, 2000);
                          }
                        }}
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 cursor-pointer"
                      >
                        Select Files
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      <div className="ml-3">
                        <p className="text-sm text-blue-300">
                          Upload use case data for any vertical:
                        </p>
                        <ul className="mt-2 text-sm text-blue-200 list-disc list-inside">
                          <li>Historical operational data</li>
                          <li>Contract documents & agreements</li>
                          <li>Financial models & projections</li>
                          <li>Compliance requirements</li>
                          <li>Industry-specific datasets</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setShowUploadModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                      onClick={() => {
                        setShowUploadModal(false);
                        addDeploymentLog('Use case data uploaded successfully');
                      }}
                    >
                      Upload & Process
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Analytics Modal */}
      <Transition appear show={showAnalyticsModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowAnalyticsModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4 flex items-center justify-between">
                    Workflow Analytics - {selectedUseCase?.name}
                    <button
                      onClick={() => setShowAnalyticsModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>
                  
                  <div className="space-y-6">
                    {/* Performance Overview */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-gray-300 mb-4">Performance Overview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(() => {
                          const metricsData: { [key: string]: any } = {
                            'oilfield-lease': { successRate: '98.7%', processingTime: '2.3s', tasksCompleted: '12,847', fourthMetric: { value: '365', label: 'Days Advance Notice' } },
                            'grid-anomaly': { successRate: '99.2%', processingTime: '1.8s', tasksCompleted: '45,892', fourthMetric: { value: '4.5M', label: 'Customers Protected' } },
                            'patient-risk': { successRate: '97.5%', processingTime: '3.1s', tasksCompleted: '28,456', fourthMetric: { value: '45%', label: 'Readmission Reduction' } },
                            'fraud-detection': { successRate: '99.8%', processingTime: '0.3s', tasksCompleted: '1.2M', fourthMetric: { value: '$4.2M', label: 'Fraud Prevented' } },
                            'default': { successRate: '98.0%', processingTime: '3.0s', tasksCompleted: '100,000', fourthMetric: { value: agents.length.toString(), label: 'Active Agents' } }
                          };
                          const metrics = metricsData[selectedUseCase?.id || 'default'] || metricsData['default'];
                          
                          return (
                            <>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-green-400">{metrics.successRate}</div>
                                <p className="text-xs text-gray-400 mt-1">Success Rate</p>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-blue-400">{metrics.processingTime}</div>
                                <p className="text-xs text-gray-400 mt-1">Avg Processing Time</p>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-amber-400">{metrics.tasksCompleted}</div>
                                <p className="text-xs text-gray-400 mt-1">Tasks Completed</p>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-purple-400">{metrics.fourthMetric.value}</div>
                                <p className="text-xs text-gray-400 mt-1">{metrics.fourthMetric.label}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Agent Performance */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-gray-300 mb-4">Agent Performance</h4>
                      <div className="space-y-3">
                        {agents.map((agent) => (
                          <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAgentColor(agent.type)} p-2 text-white flex items-center justify-center`}>
                                <div className="w-6 h-6">
                                  {getAgentIcon(agent.type)}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-300">{agent.name}</p>
                                <p className="text-xs text-gray-500">{agent.tasks.length} tasks completed</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-400">99.2%</p>
                              <p className="text-xs text-gray-500">Success Rate</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Workflow Trends */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-gray-300 mb-4">Workflow Trends (Last 7 Days)</h4>
                      <div className="h-48 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                          <p className="text-sm">Interactive charts would display workflow trends here</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
                      onClick={() => setShowAnalyticsModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                      onClick={() => {
                        // Export analytics data
                        const analyticsData = {
                          useCase: selectedUseCase?.name,
                          timestamp: new Date().toISOString(),
                          performance: {
                            successRate: '98.7%',
                            processingTime: '2.3s',
                            tasksCompleted: '12,847'
                          },
                          agents: agents.map(a => ({ name: a.name, type: a.type, successRate: '99.2%' }))
                        };
                        
                        const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedUseCase?.id}-analytics-${Date.now()}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Export Analytics
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Agent Detail Modal - Dark Theme */}
      {selectedAgent && (
        <Transition appear show={!!selectedAgent} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setSelectedAgent(null)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4 flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getAgentColor(selectedAgent.type)}`} />
                      {selectedAgent.name}
                    </Dialog.Title>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-300 mb-2">Assigned Tasks</h4>
                        <ul className="space-y-2">
                          {selectedAgent.tasks.map((task, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-400">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-300 mb-2">Decision Process</h4>
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
                          {(() => {
                            const decisionProcess = getAgentDecisionProcess();
                            return decisionProcess.steps.map((step, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className={`w-8 h-8 ${index === 0 ? 'bg-blue-500/20' : index === 1 ? 'bg-amber-500/20' : 'bg-green-500/20'} rounded-full flex items-center justify-center flex-shrink-0`}>
                                  <span className={`${index === 0 ? 'text-blue-400' : index === 1 ? 'text-amber-400' : 'text-green-400'} font-semibold text-sm`}>{step.number}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-300">{step.title}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {step.description}
                                    {step.lowRisk && (
                                      <>
                                        <br/>
                                        <span className="font-medium text-green-400">Low Risk:</span> {step.lowRisk}<br/>
                                        <span className="font-medium text-amber-400">High Risk:</span> {step.highRisk}
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                            ));
                          })()}
                          
                          <div className="bg-blue-900/20 border border-blue-700 rounded p-3 mt-3">
                            <p className="text-xs text-blue-300">
                              <span className="font-semibold">Example:</span> For {selectedUseCase?.name},
                              the agent analyzes data specific to the use case and makes autonomous decisions based on
                              configured risk thresholds and business rules.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-300 mb-2">Performance Objectives</h4>
                        <div className="space-y-2">
                          {selectedUseCase && getAgentPerformanceObjectives(selectedUseCase.id).map((objective, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircleIcon className={`h-4 w-4 text-${objective.color}-500 flex-shrink-0 mt-0.5`} />
                              <div>
                                <p className="text-sm font-medium text-gray-300">{objective.title}</p>
                                <p className="text-xs text-gray-400">{objective.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                        onClick={() => setSelectedAgent(null)}
                      >
                        Close
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}

      {/* Security Analysis Modal */}
      <Transition appear show={showSIAModal === 'security'} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowSIAModal(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                        <SecurityIcon />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Security Analysis</h3>
                        <p className="text-sm text-gray-400">Real-time security monitoring and threat detection</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSIAModal(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>
                  
                  <div className="space-y-6">
                    {/* Optimal Security Standards (100% Target) */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-blue-400 mb-4">Optimal Security Standards (100% Target)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Authentication Security - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Authentication Security</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Biometric + hardware token MFA</li>
                                <li>• Zero-trust authentication model</li>
                                <li>• Continuous session validation</li>
                                <li>• AI-powered anomaly detection</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Data Encryption - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <LockClosedIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Data Encryption</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• AES-256 + quantum-resistant algorithms</li>
                                <li>• End-to-end encryption everywhere</li>
                                <li>• Hardware security modules (HSM)</li>
                                <li>• Perfect forward secrecy</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Access Control - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <KeyIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Access Control</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Dynamic least privilege access</li>
                                <li>• Just-in-time (JIT) permissions</li>
                                <li>• Attribute-based access control</li>
                                <li>• Real-time risk scoring</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* API Security - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <CloudIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">API Security</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• OAuth 2.0 + mutual TLS</li>
                                <li>• API gateway with rate limiting</li>
                                <li>• Request signing & validation</li>
                                <li>• Automated vulnerability scanning</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Network Security - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <GlobeAltIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Network Security</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Next-gen firewall with AI/ML</li>
                                <li>• Zero-trust network architecture</li>
                                <li>• Microsegmentation everywhere</li>
                                <li>• 24/7 SOC monitoring</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Audit Logging - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Audit Logging</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Immutable blockchain audit trail</li>
                                <li>• Real-time log analysis with AI</li>
                                <li>• Automated compliance reporting</li>
                                <li>• Forensic-grade detail capture</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>
                      </div>
                    </div>

                    {/* Current Use Case Security Metrics */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Current Use Case Security Metrics</h4>
                      <p className="text-sm text-gray-400 mb-4">Real-time metrics based on selected use case configuration</p>
                    </div>

                    {/* Overall Security Score - Main Card */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-white">Overall Security Score</h4>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-white">98%</div>
                          <p className="text-sm text-gray-400">Excellent</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">Based on authentication, encryption, access control, and monitoring metrics</p>
                    </div>

                    {/* Security Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Authentication Security */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Authentication Security</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Implementation:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• SMS-based 2FA enabled (98% coverage)</li>
                              <li>• Password complexity: 12 char minimum</li>
                              <li>• Session timeout: 30 minutes</li>
                              <li>• Failed login lockout after 5 attempts</li>
                              <li className="text-amber-400">⚠ Missing: Biometric authentication</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">98%</div>
                      </div>

                      {/* Data Encryption */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Data Encryption</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Implementation:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• AES-256-GCM for data at rest (100% coverage)</li>
                              <li>• TLS 1.3 for transit (98% endpoints)</li>
                              <li>• Key rotation: 90-day automated cycle</li>
                              <li>• Encrypted backups with separate keys</li>
                              <li>• Certificate pinning on mobile apps</li>
                              <li className="text-amber-400">⚠ Missing: Hardware security modules (HSM)</li>
                              <li className="text-amber-400">⚠ 2% legacy APIs use TLS 1.2</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">100%</div>
                      </div>

                      {/* Access Control */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Access Control</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Implementation:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• RBAC with 12 defined roles (94% coverage)</li>
                              <li>• Quarterly access reviews (last: Oct 2024)</li>
                              <li>• Segregation of duties: 100% enforced</li>
                              <li>• API key rotation: 60-day cycle</li>
                              <li>• Privileged access monitoring active</li>
                              <li className="text-amber-400">⚠ Missing: Just-in-time (JIT) access</li>
                              <li className="text-amber-400">⚠ 6% users have excessive permissions</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">92%</div>
                      </div>

                      {/* API Security */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">API Security</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Implementation:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• OAuth 2.0 + JWT tokens (15min expiry)</li>
                              <li>• Rate limiting: 1000 req/hour per user</li>
                              <li>• API versioning: v1-v3 supported</li>
                              <li>• Input validation: 100% coverage</li>
                              <li>• CORS policies strictly configured</li>
                              <li className="text-amber-400">⚠ 3 legacy v1 endpoints (8% traffic)</li>
                              <li className="text-amber-400">⚠ Missing: Mutual TLS authentication</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-amber-400">88%</div>
                      </div>

                      {/* Network Security */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Network Security</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Implementation:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• WAF with 847 custom rules</li>
                              <li>• IDS/IPS: Snort 3.0 (24/7 monitoring)</li>
                              <li>• VPN: WireGuard for admin (100% usage)</li>
                              <li>• DDoS protection: CloudFlare Enterprise</li>
                              <li>• 12 blocked attacks this month</li>
                              <li className="text-amber-400">⚠ Missing: Network microsegmentation</li>
                              <li className="text-amber-400">⚠ 7% internal traffic unencrypted</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">95%</div>
                      </div>

                      {/* Audit Logging */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Audit Logging</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Implementation:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• 100% user action coverage</li>
                              <li>• 1-year hot storage, 7-year archive</li>
                              <li>• SIEM: Splunk Enterprise integration</li>
                              <li>• Real-time alerts: &lt;30s latency</li>
                              <li>• 2.3TB logs processed daily</li>
                              <li className="text-amber-400">⚠ Missing: Blockchain immutability</li>
                              <li className="text-amber-400">⚠ 3% logs lack correlation IDs</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">96%</div>
                      </div>
                    </div>

                    {/* Security Score Calculation */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-amber-400 mb-4 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5" />
                        Security Score Calculation
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-semibold text-gray-300 mb-2">Calculation Method</h5>
                          <p className="text-sm text-gray-400 mb-3">The security score is calculated using a weighted average of all security metrics:</p>
                          <ul className="space-y-1 text-sm text-gray-400">
                            <li>• Authentication Security: 20% weight</li>
                            <li>• Data Encryption: 25% weight</li>
                            <li>• Access Control: 20% weight</li>
                            <li>• API Security: 15% weight</li>
                            <li>• Network Security: 10% weight</li>
                            <li>• Audit Logging: 10% weight</li>
                          </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                          <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">Recent Security Events</h5>
                            <ul className="space-y-2 text-sm">
                              <li className="text-gray-400">Failed login attempts blocked <span className="float-right text-gray-500">12 (last 24h)</span></li>
                              <li className="text-gray-400">Suspicious API calls detected <span className="float-right text-amber-400">3 (under review)</span></li>
                              <li className="text-gray-400">Security patches applied <span className="float-right text-green-400">All up to date</span></li>
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">Recommendations</h5>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400">Review API endpoints with lower security scores</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400">Continue enforcing MFA for all admin accounts</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400">Maintain current encryption standards</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compliance Status */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-gray-300 mb-4">Compliance Status</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">SOC 2</div>
                              <div className="text-xs text-gray-500">Service Organization Control</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">95%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">ISO 27001</div>
                              <div className="text-xs text-gray-500">Information Security</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">92%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">GDPR</div>
                              <div className="text-xs text-gray-500">Data Protection</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-400">88%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">HIPAA</div>
                              <div className="text-xs text-gray-500">Healthcare Privacy</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-yellow-400">78%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Threat Detection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Active Monitoring */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                          <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
                          Active Monitoring
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                              <span className="text-sm text-gray-300">Network Traffic Analysis</span>
                            </div>
                            <span className="text-xs text-green-400">Normal</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                              <span className="text-sm text-gray-300">Access Control Monitoring</span>
                            </div>
                            <span className="text-xs text-green-400">Secure</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                              <span className="text-sm text-gray-300">Vulnerability Scanning</span>
                            </div>
                            <span className="text-xs text-amber-400">3 Low Risk</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                              <span className="text-sm text-gray-300">Encryption Status</span>
                            </div>
                            <span className="text-xs text-green-400">AES-256</span>
                          </div>
                        </div>
                      </div>

                      {/* Recent Security Events */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                          Recent Security Events
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-900 rounded">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-300">Failed Login Attempt</p>
                                <p className="text-xs text-gray-500 mt-1">IP: 192.168.1.105 - 2 minutes ago</p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-amber-900/50 text-amber-400 rounded">Warning</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-900 rounded">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-300">Firewall Rule Updated</p>
                                <p className="text-xs text-gray-500 mt-1">Port 443 access modified - 1 hour ago</p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-400 rounded">Info</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-900 rounded">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-300">Security Patch Applied</p>
                                <p className="text-xs text-gray-500 mt-1">CVE-2024-1234 patched - 3 hours ago</p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded">Success</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Metrics Chart */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-gray-300 mb-4">Security Metrics Over Time</h4>
                      <div className="space-y-4">
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-400">Threats Blocked</p>
                            <p className="text-lg font-bold text-green-400">1,247</p>
                            <p className="text-xs text-green-400">↑ 12%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">Vulnerabilities</p>
                            <p className="text-lg font-bold text-amber-400">3</p>
                            <p className="text-xs text-amber-400">↓ 40%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">Patch Rate</p>
                            <p className="text-lg font-bold text-blue-400">99.2%</p>
                            <p className="text-xs text-blue-400">↑ 2%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">Incidents</p>
                            <p className="text-lg font-bold text-green-400">0</p>
                            <p className="text-xs text-gray-500">No change</p>
                          </div>
                        </div>

                        {/* Multi-line Chart Visualization */}
                        <div className="h-48 relative bg-gray-900 rounded-lg p-4">
                          {/* Grid lines */}
                          <div className="absolute inset-4 flex flex-col justify-between">
                            {[100, 75, 50, 25, 0].map((value, i) => (
                              <div key={i} className="flex items-center">
                                <span className="text-xs text-gray-600 w-8">{value}%</span>
                                <div className="flex-1 border-t border-gray-700 ml-2"></div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Chart lines */}
                          <svg className="absolute inset-4 left-12" viewBox="0 0 300 160">
                            {/* Authentication Success Rate */}
                            <polyline
                              fill="none"
                              stroke="#3B82F6"
                              strokeWidth="2"
                              points="0,20 50,18 100,15 150,12 200,10 250,8 300,6"
                            />
                            {/* Encryption Coverage */}
                            <polyline
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="2"
                              points="0,30 50,25 100,20 150,15 200,12 250,10 300,8"
                            />
                            {/* Access Control Compliance */}
                            <polyline
                              fill="none"
                              stroke="#F59E0B"
                              strokeWidth="2"
                              points="0,40 50,35 100,30 150,25 200,20 250,15 300,12"
                            />
                          </svg>

                          {/* Legend */}
                          <div className="absolute bottom-2 right-2 flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-0.5 bg-blue-500"></div>
                              <span className="text-gray-400">Auth Rate</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-0.5 bg-green-500"></div>
                              <span className="text-gray-400">Encryption</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-0.5 bg-amber-500"></div>
                              <span className="text-gray-400">Access Control</span>
                            </div>
                          </div>
                        </div>

                        {/* Time range selector */}
                        <div className="flex justify-center gap-2 text-xs">
                          <button className="px-3 py-1 bg-gray-700 text-white rounded">24h</button>
                          <button className="px-3 py-1 text-gray-400 hover:bg-gray-700 rounded">7d</button>
                          <button className="px-3 py-1 text-gray-400 hover:bg-gray-700 rounded">30d</button>
                          <button className="px-3 py-1 text-gray-400 hover:bg-gray-700 rounded">90d</button>
                        </div>
                      </div>
                    </div>


                    {/* Action Center */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-amber-400 mb-4 flex items-center gap-2">
                        <CpuChipIcon className="h-5 w-5" />
                        Action Center - Improve Security to 100%
                      </h4>
                      
                      <div className="space-y-4">
                        <p className="text-sm text-gray-400">Execute recommended actions to improve security score:</p>
                        
                        {/* Action Items */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Enable Multi-Factor Authentication</p>
                                <p className="text-xs text-gray-400">+0.5% security improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <LockClosedIcon className="h-5 w-5 text-green-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Upgrade Encryption Standards</p>
                                <p className="text-xs text-gray-400">+1% security improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <DocumentCheckIcon className="h-5 w-5 text-purple-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Implement Zero-Trust Architecture</p>
                                <p className="text-xs text-gray-400">+0.5% security improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>
                        </div>

                        {/* Batch Actions */}
                        <div className="pt-4 border-t border-gray-700">
                          <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                            Execute All Recommendations (+2% Total)
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
                      onClick={() => setShowSIAModal(null)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      onClick={() => {
                        // Export security report
                        const report = {
                          type: 'security',
                          score: 98,
                          timestamp: new Date().toISOString(),
                          threats: 0,
                          vulnerabilities: 3
                        };
                        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `security-report-${Date.now()}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Export Report
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Integrity Analysis Modal */}
      <Transition appear show={showSIAModal === 'integrity'} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowSIAModal(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center">
                        <IntegrityIcon />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Integrity Analysis</h3>
                        <p className="text-sm text-gray-400">Data integrity monitoring and validation</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSIAModal(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>
                  
                  <div className="space-y-6">
                    {/* Optimal Integrity Standards (100% Target) */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-red-400 mb-4">Optimal Integrity Standards (100% Target)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Data Validation - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <CheckCircleIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Data Validation</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Multi-layer validation with AI</li>
                                <li>• Real-time schema enforcement</li>
                                <li>• Automated data quality scoring</li>
                                <li>• Zero tolerance for invalid data</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Data Consistency - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <Squares2X2Icon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Data Consistency</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• ACID compliance across all systems</li>
                                <li>• Real-time replication & sync</li>
                                <li>• Conflict-free replicated data types</li>
                                <li>• Zero data discrepancies</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Audit Trail - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <DocumentArrowDownIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Audit Trail Integrity</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Blockchain-based immutability</li>
                                <li>• Cryptographic proof of integrity</li>
                                <li>• Complete action traceability</li>
                                <li>• Tamper-proof storage</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Transaction Integrity - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <ArrowPathIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Transaction Integrity</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Distributed transaction management</li>
                                <li>• Two-phase commit protocol</li>
                                <li>• Automatic rollback on failure</li>
                                <li>• 100% ACID compliance</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Access Control - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Access Control Violations</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Zero unauthorized access</li>
                                <li>• AI-powered threat detection</li>
                                <li>• Automatic incident response</li>
                                <li>• Real-time violation blocking</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Data Lineage - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <ArrowPathIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Data Lineage Tracking</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Complete data flow visualization</li>
                                <li>• Automated lineage capture</li>
                                <li>• Impact analysis capabilities</li>
                                <li>• Full transformation history</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>
                      </div>
                    </div>

                    {/* Current Use Case Integrity Metrics */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Current Use Case Integrity Metrics</h4>
                      <p className="text-sm text-gray-400 mb-4">Real-time metrics based on selected use case configuration</p>
                    </div>

                    {/* Overall Integrity Score - Main Card */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-white">Overall Integrity Score</h4>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-amber-400">85%</div>
                          <p className="text-sm text-gray-400">Good</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">Based on data validation, consistency, audit trails, and access control</p>
                    </div>

                    {/* Integrity Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Data Validation */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <CheckCircleIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Data Validation</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Implementation:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• Schema validation on all inputs</li>
                              <li>• Business rule validation active</li>
                              <li>• 42.3K validations/day average</li>
                              <li>• 0.3% rejection rate</li>
                              <li className="text-amber-400">⚠ Missing: AI-powered validation</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">92%</div>
                      </div>

                      {/* Data Consistency */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <Squares2X2Icon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Data Consistency</h5>
                            <p className="text-xs text-gray-400 mt-1">Cross-system data synchronization with minor discrepancies detected</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-amber-400">85%</div>
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                          <div className="bg-amber-500 h-1 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>

                      {/* Audit Trail Integrity */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <DocumentArrowDownIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Audit Trail Integrity</h5>
                            <p className="text-xs text-gray-400 mt-1">Immutable audit logs with cryptographic verification</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">98%</div>
                      </div>

                      {/* Transaction Integrity */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ArrowPathIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Transaction Integrity</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Implementation:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• ACID compliance verified</li>
                              <li>• 8.2K transactions/hour</li>
                              <li>• 0.01% rollback rate</li>
                              <li>• Idempotency keys used</li>
                              <li className="text-amber-400">⚠ 10% lack distributed txn support</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">90%</div>
                      </div>

                      {/* Access Control Violations */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Access Control Violations</h5>
                            <p className="text-xs text-gray-400 mt-1">Some unauthorized access attempts detected and blocked</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-amber-400">78%</div>
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                          <div className="bg-amber-500 h-1 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>

                      {/* Data Lineage Tracking */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ArrowPathIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Data Lineage Tracking</h5>
                            <p className="text-xs text-gray-400 mt-1">Complete traceability of data transformations and movements</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">88%</div>
                      </div>
                    </div>

                    {/* Integrity Score Calculation */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-amber-400 mb-4 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5" />
                        Integrity Score Calculation
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-semibold text-gray-300 mb-2">Calculation Method</h5>
                          <p className="text-sm text-gray-400 mb-3">The integrity score is calculated using a weighted average of all integrity metrics:</p>
                          <ul className="space-y-1 text-sm text-gray-400">
                            <li>• Data Validation: 20% weight</li>
                            <li>• Data Consistency: 25% weight</li>
                            <li>• Audit Trail Integrity: 20% weight</li>
                            <li>• Transaction Integrity: 15% weight</li>
                            <li>• Access Control: 10% weight</li>
                            <li>• Data Lineage: 10% weight</li>
                          </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                          <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">Recent Integrity Events</h5>
                            <ul className="space-y-2 text-sm">
                              <li className="text-gray-400">Data validation errors caught <span className="float-right text-amber-400">23 (last 24h)</span></li>
                              <li className="text-gray-400">Consistency checks passed <span className="float-right text-green-400">1,247 of 1,250</span></li>
                              <li className="text-gray-400">Unauthorized modifications blocked <span className="float-right text-red-400">7 attempts</span></li>
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">Recommendations</h5>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400">Investigate data consistency discrepancies in cross-system sync</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400">Review access control policies for recent violation attempts</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400">Continue maintaining high audit trail standards</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
{/* Compliance Status */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-gray-300 mb-4">Compliance Status</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">SOX Compliance</div>
                              <div className="text-xs text-gray-500">Financial Controls</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">98%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">ISO 31000</div>
                              <div className="text-xs text-gray-500">Risk Management</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">96%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">COSO Framework</div>
                              <div className="text-xs text-gray-500">Internal Controls</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">95%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">NIST CSF</div>
                              <div className="text-xs text-gray-500">Cybersecurity</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-400">94%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">COBIT</div>
                              <div className="text-xs text-gray-500">IT Governance</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">92%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">Basel III</div>
                              <div className="text-xs text-gray-500">Banking Regulations</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-yellow-400">89%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Data Validation Grid */}
                    <div className="space-y-6">
                      {/* Recent Validation Issues - Full Width */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                          Recent Validation Issues
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-300">Schema validation failed on 3 input fields</div>
                              <div className="text-xs text-gray-500 mt-1">2 minutes ago - Input validation layer</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-300">Data type mismatch in financial records</div>
                              <div className="text-xs text-gray-500 mt-1">15 minutes ago - ETL pipeline</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-300">Missing required fields in API response</div>
                              <div className="text-xs text-gray-500 mt-1">1 hour ago - External API integration</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Data Sources Status - Now below */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                          <Squares2X2Icon className="h-5 w-5 text-red-500" />
                          Data Source Status
                        </h4>
                        <div className="space-y-3">
{/* Data Flow and Integrity Checkpoints Visualization */}
<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
  <h4 className="text-md font-semibold text-gray-300 mb-4">Data Flow & Integrity Checkpoints</h4>
  <div className="relative h-64 bg-gray-900 rounded-lg p-4 overflow-hidden">
    {/* Data Flow Pipeline */}
    <svg className="absolute inset-0" viewBox="0 0 800 300">
      {/* Flow Lines */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
        </marker>
      </defs>
      
      {/* Main Data Flow */}
      <path d="M 50 150 L 200 150 L 350 150 L 500 150 L 650 150 L 750 150"
            stroke="#4B5563" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" />
      
      {/* Checkpoint Nodes */}
      <g>
        {/* Input Validation */}
        <circle cx="50" cy="150" r="25" fill="#1F2937" stroke="#10B981" strokeWidth="3" />
        <text x="50" y="155" textAnchor="middle" fill="#10B981" fontSize="12" fontWeight="bold">IN</text>
        <text x="50" y="190" textAnchor="middle" fill="#9CA3AF" fontSize="10">Input</text>
        <text x="50" y="202" textAnchor="middle" fill="#9CA3AF" fontSize="10">Validation</text>
        
        {/* Schema Check */}
        <circle cx="200" cy="150" r="25" fill="#1F2937" stroke="#3B82F6" strokeWidth="3" />
        <text x="200" y="155" textAnchor="middle" fill="#3B82F6" fontSize="12" fontWeight="bold">SC</text>
        <text x="200" y="190" textAnchor="middle" fill="#9CA3AF" fontSize="10">Schema</text>
        <text x="200" y="202" textAnchor="middle" fill="#9CA3AF" fontSize="10">Check</text>
        
        {/* Business Rules */}
        <circle cx="350" cy="150" r="25" fill="#1F2937" stroke="#8B5CF6" strokeWidth="3" />
        <text x="350" y="155" textAnchor="middle" fill="#8B5CF6" fontSize="12" fontWeight="bold">BR</text>
        <text x="350" y="190" textAnchor="middle" fill="#9CA3AF" fontSize="10">Business</text>
        <text x="350" y="202" textAnchor="middle" fill="#9CA3AF" fontSize="10">Rules</text>
        
        {/* Integrity Hash */}
        <circle cx="500" cy="150" r="25" fill="#1F2937" stroke="#F59E0B" strokeWidth="3" />
        <text x="500" y="155" textAnchor="middle" fill="#F59E0B" fontSize="12" fontWeight="bold">IH</text>
        <text x="500" y="190" textAnchor="middle" fill="#9CA3AF" fontSize="10">Integrity</text>
        <text x="500" y="202" textAnchor="middle" fill="#9CA3AF" fontSize="10">Hash</text>
        
        {/* Audit Log */}
        <circle cx="650" cy="150" r="25" fill="#1F2937" stroke="#EF4444" strokeWidth="3" />
        <text x="650" y="155" textAnchor="middle" fill="#EF4444" fontSize="12" fontWeight="bold">AL</text>
        <text x="650" y="190" textAnchor="middle" fill="#9CA3AF" fontSize="10">Audit</text>
        <text x="650" y="202" textAnchor="middle" fill="#9CA3AF" fontSize="10">Log</text>
        
        {/* Output */}
        <circle cx="750" cy="150" r="25" fill="#1F2937" stroke="#10B981" strokeWidth="3" />
        <text x="750" y="155" textAnchor="middle" fill="#10B981" fontSize="12" fontWeight="bold">OUT</text>
      </g>
      
      {/* Checkpoint Status Indicators */}
      <g>
        <circle cx="50" cy="120" r="4" fill="#10B981" />
        <circle cx="200" cy="120" r="4" fill="#10B981" />
        <circle cx="350" cy="120" r="4" fill="#10B981" />
        <circle cx="500" cy="120" r="4" fill="#F59E0B" />
        <circle cx="650" cy="120" r="4" fill="#10B981" />
        <circle cx="750" cy="120" r="4" fill="#10B981" />
      </g>
      
      {/* Data Volume Indicators */}
      <g>
        <text x="125" y="140" textAnchor="middle" fill="#6B7280" fontSize="10">42.3K/day</text>
        <text x="275" y="140" textAnchor="middle" fill="#6B7280" fontSize="10">41.8K/day</text>
        <text x="425" y="140" textAnchor="middle" fill="#6B7280" fontSize="10">41.2K/day</text>
        <text x="575" y="140" textAnchor="middle" fill="#6B7280" fontSize="10">41.2K/day</text>
        <text x="700" y="140" textAnchor="middle" fill="#6B7280" fontSize="10">41.1K/day</text>
      </g>
      
      {/* Rejection/Alert Branches */}
      <g>
        <path d="M 50 175 L 50 230" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
        <rect x="30" y="230" width="40" height="20" fill="#1F2937" stroke="#EF4444" strokeWidth="1" rx="2" />
        <text x="50" y="243" textAnchor="middle" fill="#EF4444" fontSize="9">127/day</text>
        
        <path d="M 500 175 L 500 230" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,5" />
        <rect x="480" y="230" width="40" height="20" fill="#1F2937" stroke="#F59E0B" strokeWidth="1" rx="2" />
        <text x="500" y="243" textAnchor="middle" fill="#F59E0B" fontSize="9">1 alert</text>
      </g>
    </svg>
    
    {/* Legend */}
    <div className="absolute bottom-2 left-2 flex gap-4 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-gray-400">Passed</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
        <span className="text-gray-400">Warning</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-gray-400">Failed</span>
      </div>
    </div>
    
    {/* Real-time Status */}
    <div className="absolute top-2 right-2 text-xs text-gray-400">
      <span className="text-green-400">● </span>Live Data Flow
    </div>
  </div>
  
  {/* Checkpoint Details */}
  <div className="grid grid-cols-6 gap-2 mt-4 text-xs">
    <div className="text-center">
      <p className="text-gray-400">Input</p>
      <p className="text-green-400 font-bold">99.7%</p>
    </div>
    <div className="text-center">
      <p className="text-gray-400">Schema</p>
      <p className="text-green-400 font-bold">98.8%</p>
    </div>
    <div className="text-center">
      <p className="text-gray-400">Rules</p>
      <p className="text-green-400 font-bold">97.4%</p>
    </div>
    <div className="text-center">
      <p className="text-gray-400">Hash</p>
      <p className="text-amber-400 font-bold">99.9%</p>
    </div>
    <div className="text-center">
      <p className="text-gray-400">Audit</p>
      <p className="text-green-400 font-bold">100%</p>
    </div>
    <div className="text-center">
      <p className="text-gray-400">Output</p>
      <p className="text-green-400 font-bold">99.7%</p>
    </div>
  </div>
</div>


                    {/* Action Center */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-amber-400 mb-4 flex items-center gap-2">
                        <CpuChipIcon className="h-5 w-5" />
                        Action Center - Improve Integrity to 100%
                      </h4>
                      
                      <div className="space-y-4">
                        <p className="text-sm text-gray-400">Execute recommended actions to improve integrity score:</p>
                        
                        {/* Action Items */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <DocumentCheckIcon className="h-5 w-5 text-blue-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Enhance Data Validation Rules</p>
                                <p className="text-xs text-gray-400">+6% integrity improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Implement Blockchain Audit Trail</p>
                                <p className="text-xs text-gray-400">+4% integrity improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <CheckCircleIcon className="h-5 w-5 text-purple-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Strengthen Access Control Policies</p>
                                <p className="text-xs text-gray-400">+5% integrity improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>
                        </div>

                        {/* Batch Actions */}
                        <div className="pt-4 border-t border-gray-700">
                          <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                            Execute All Recommendations (+15% Total)
                          </button>
                        </div>
                      </div>
                    </div>
                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full" />
                              <span className="text-sm text-gray-300">Primary Database</span>
                            </div>
                            <span className="text-xs text-green-400">Synchronized</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                              <span className="text-sm text-gray-300">External APIs</span>
                            </div>
                            <span className="text-xs text-amber-400">3 Warnings</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full" />
                              <span className="text-sm text-gray-300">Data Warehouse</span>
                            </div>
                            <span className="text-xs text-green-400">Validated</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-red-400 rounded-full" />
                              <span className="text-sm text-gray-300">Legacy Systems</span>
                            </div>
                            <span className="text-xs text-red-400">9 Conflicts</span>
                          </div>
                        </div>
                      </div>

                      {/* Validation Issues */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                          Recent Validation Issues
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-900 rounded">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-300">Schema Mismatch</p>
                                <p className="text-xs text-gray-500 mt-1">Table: users - Column type conflict</p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded">Critical</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-900 rounded">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-300">Duplicate Records</p>
                                <p className="text-xs text-gray-500 mt-1">Found 234 duplicates in orders table</p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-amber-900/50 text-amber-400 rounded">Warning</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-900 rounded">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-300">Missing References</p>
                                <p className="text-xs text-gray-500 mt-1">12 orphaned records detected</p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-amber-900/50 text-amber-400 rounded">Warning</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Integrity Metrics */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-gray-300 mb-4">Integrity Metrics by Category</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-900 rounded">
                          <div className="text-2xl font-bold text-green-400">98.5%</div>
                          <p className="text-sm font-medium text-gray-300">Completeness</p>
                          <p className="text-xs text-gray-500">All required fields</p>
                        </div>
                        <div className="text-center p-4 bg-gray-900 rounded">
                          <div className="text-2xl font-bold text-amber-400">92.3%</div>
                          <p className="text-sm font-medium text-gray-300">Accuracy</p>
                          <p className="text-xs text-gray-500">Validated values</p>
                        </div>
                        <div className="text-center p-4 bg-gray-900 rounded">
                          <div className="text-2xl font-bold text-blue-400">99.1%</div>
                          <p className="text-sm font-medium text-gray-300">Consistency</p>
                          <p className="text-xs text-gray-500">Cross-system match</p>
                        </div>
                        <div className="text-center p-4 bg-gray-900 rounded">
                          <div className="text-2xl font-bold text-purple-400">87.6%</div>
                          <p className="text-sm font-medium text-gray-300">Timeliness</p>
                          <p className="text-xs text-gray-500">Up-to-date data</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Center */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-amber-400 mb-4 flex items-center gap-2">
                        <CpuChipIcon className="h-5 w-5" />
                        Action Center - Improve Integrity to 100%
                      </h4>
                      
                      <div className="space-y-4">
                        <p className="text-sm text-gray-400">Execute recommended actions to improve integrity score:</p>
                        
                        {/* Action Items */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Enhance Data Validation Rules</p>
                                <p className="text-xs text-gray-400">+6% integrity improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <DocumentCheckIcon className="h-5 w-5 text-green-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Implement Blockchain Audit Trail</p>
                                <p className="text-xs text-gray-400">+4% integrity improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <LockClosedIcon className="h-5 w-5 text-purple-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Strengthen Access Control Policies</p>
                                <p className="text-xs text-gray-400">+5% integrity improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>
                        </div>

                        {/* Batch Actions */}
                        <div className="pt-4 border-t border-gray-700">
                          <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                            Execute All Recommendations (+15% Total)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
                      onClick={() => setShowSIAModal(null)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      onClick={() => {
                        // Export integrity report
                        const report = {
                          type: 'integrity',
                          score: 85,
                          timestamp: new Date().toISOString(),
                          issues: 12,
                          consistency: 99.2
                        };
                        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `integrity-report-${Date.now()}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Export Report
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Accuracy Analysis Modal */}
      <Transition appear show={showSIAModal === 'accuracy'} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowSIAModal(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                        <AccuracyIcon />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Accuracy Analysis</h3>
                        <p className="text-sm text-gray-400">Model performance and prediction accuracy metrics</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSIAModal(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>
                  
                  <div className="space-y-6">
                    {/* Optimal Accuracy Standards (100% Target) */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-green-400 mb-4">Optimal Accuracy Standards (100% Target)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Model Accuracy - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <ChartBarIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Model Accuracy</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• 99.9%+ prediction accuracy</li>
                                <li>• Continuous model retraining</li>
                                <li>• Ensemble learning methods</li>
                                <li>• Zero false negatives</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Data Quality - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <CheckCircleIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Data Quality</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• 100% data completeness</li>
                                <li>• Automated data cleansing</li>
                                <li>• Real-time quality monitoring</li>
                                <li>• Zero missing values</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Output Validation - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <DocumentArrowDownIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Output Validation</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Multi-stage validation pipeline</li>
                                <li>• Human-in-the-loop verification</li>
                                <li>• Automated accuracy testing</li>
                                <li>• Zero unvalidated outputs</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Calculation Precision - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <CpuChipIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Calculation Precision</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Arbitrary precision arithmetic</li>
                                <li>• Quantum computing ready</li>
                                <li>• Error correction algorithms</li>
                                <li>• Zero rounding errors</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Trend Prediction - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <ChartBarIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Trend Prediction</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Advanced time series analysis</li>
                                <li>• Multi-model consensus</li>
                                <li>• Real-time trend adaptation</li>
                                <li>• 95%+ confidence intervals</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>

                        {/* Anomaly Detection - Optimal */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white">Anomaly Detection</h5>
                              <p className="text-xs text-gray-400 mt-1">100% Standard Requirements:</p>
                              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                                <li>• Real-time anomaly detection</li>
                                <li>• Unsupervised learning models</li>
                                <li>• Contextual anomaly analysis</li>
                                <li>• Zero missed anomalies</li>
                              </ul>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">100%</div>
                        </div>
                      </div>
                    </div>

                    {/* Current Use Case Accuracy Metrics */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Current Use Case Accuracy Metrics</h4>
                      <p className="text-sm text-gray-400 mb-4">Real-time metrics based on selected use case configuration</p>
                    </div>

                    {/* Overall Accuracy Score - Main Card */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-white">Overall Accuracy Score</h4>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-white">92%</div>
                          <p className="text-sm text-gray-400">Excellent</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">Based on model performance, data quality, and validation metrics</p>
                    </div>

                    {/* Accuracy Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Model Accuracy */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Model Accuracy</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Performance:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• 94.5% precision rate</li>
                              <li>• 91.2% recall rate</li>
                              <li>• F1 score: 92.8%</li>
                              <li>• 8.7K predictions today</li>
                              <li className="text-amber-400">⚠ 6% require manual review</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">94%</div>
                      </div>

                      {/* Data Quality */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <CheckCircleIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Data Quality</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Status:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• 89% completeness score</li>
                              <li>• 11% missing optional fields</li>
                              <li>• 2.3% duplicate records</li>
                              <li>• Daily quality reports active</li>
                              <li className="text-amber-400">⚠ Legacy data needs cleansing</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">89%</div>
                      </div>

                      {/* Output Validation */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <DocumentArrowDownIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Output Validation</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Implementation:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• 3-stage validation pipeline</li>
                              <li>• Business rule checks: 100%</li>
                              <li>• Format validation: 98%</li>
                              <li>• Confidence threshold: 85%</li>
                              <li className="text-amber-400">⚠ 8% require human review</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">92%</div>
                      </div>

                      {/* Calculation Precision */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <CpuChipIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Calculation Precision</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Performance:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• 64-bit double precision</li>
                              <li>• 0.0001% rounding error</li>
                              <li>• GPU acceleration active</li>
                              <li>• 1M calculations/second</li>
                              <li className="text-amber-400">⚠ 4% use legacy 32-bit</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">96%</div>
                      </div>

                      {/* Trend Prediction */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Trend Prediction</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Analysis:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• ARIMA + LSTM models</li>
                              <li>• 7-day accuracy: 92%</li>
                              <li>• 30-day accuracy: 85%</li>
                              <li className="text-amber-400">• 90-day accuracy: 73%</li>
                              <li className="text-amber-400">⚠ Seasonal patterns missed</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-amber-400">85%</div>
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                          <div className="bg-amber-500 h-1 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>

                      {/* Anomaly Detection */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-white">Anomaly Detection</h5>
                            <p className="text-xs text-gray-400 mt-1">Current Detection:</p>
                            <ul className="text-xs text-gray-400 mt-2 space-y-1">
                              <li>• Isolation Forest algorithm</li>
                              <li>• 247 anomalies detected today</li>
                              <li>• 12 false positives (4.8%)</li>
                              <li>• Real-time alerting active</li>
                              <li className="text-amber-400">⚠ 10% detection latency</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">90%</div>
                      </div>
                    </div>

                    {/* Accuracy Score Calculation */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-amber-400 mb-4 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5" />
                        Accuracy Score Calculation
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-semibold text-gray-300 mb-2">Calculation Method</h5>
                          <p className="text-sm text-gray-400 mb-3">The accuracy score is calculated using a weighted average of all accuracy metrics:</p>
                          <ul className="space-y-1 text-sm text-gray-400">
                            <li>• Model Accuracy: 30% weight</li>
                            <li>• Data Quality: 20% weight</li>
                            <li>• Output Validation: 20% weight</li>
                            <li>• Calculation Precision: 15% weight</li>
                            <li>• Trend Prediction: 10% weight</li>
                            <li>• Anomaly Detection: 5% weight</li>
                          </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                          <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">Recent Performance Metrics</h5>
                            <ul className="space-y-2 text-sm">
                              <li className="text-gray-400">Successful predictions <span className="float-right text-green-400">4,892 of 5,200</span></li>
                              <li className="text-gray-400">False positive rate <span className="float-right text-amber-400">3.2%</span></li>
                              <li className="text-gray-400">Model confidence average <span className="float-right text-blue-400">87.5%</span></li>
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">Recommendations</h5>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400">Improve trend prediction models with additional training data</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400">Maintain high model accuracy through continuous learning</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400">Continue rigorous output validation processes</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
{/* Compliance Status */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-gray-300 mb-4">Compliance Status</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">FDA 21 CFR Part 11</div>
                              <div className="text-xs text-gray-500">Electronic Records</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">100%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">GAMP 5</div>
                              <div className="text-xs text-gray-500">Automated Systems</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">100%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">ISO 9001</div>
                              <div className="text-xs text-gray-500">Quality Management</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">100%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">Six Sigma</div>
                              <div className="text-xs text-gray-500">Quality Control</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-400">95%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">GxP</div>
                              <div className="text-xs text-gray-500">Good Practices</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">98%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-300">ISO 13485</div>
                              <div className="text-xs text-gray-500">Medical Devices</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">97%</div>
                              <div className="text-xs text-gray-500">Compliant</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>

                    {/* Model Performance Grid */}
                    <div className="space-y-6">
                      {/* Model Metrics */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                          <ChartBarIcon className="h-5 w-5 text-green-500" />
                          Model Performance Metrics
                        </h4>
                        <div className="space-y-3">
{/* Accuracy Metrics Over Time */}
<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
  <h4 className="text-md font-semibold text-gray-300 mb-4">Accuracy Metrics Over Time</h4>
  <div className="space-y-4">
    {/* Model Performance Metrics */}
    <div className="grid grid-cols-4 gap-4 mb-4">
      <div className="text-center">
        <p className="text-xs text-gray-400">Predictions</p>
        <p className="text-lg font-bold text-green-400">8.7K</p>
        <p className="text-xs text-green-400">↑ 23%</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-400">Precision</p>
        <p className="text-lg font-bold text-blue-400">94.5%</p>
        <p className="text-xs text-blue-400">↑ 1.2%</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-400">Recall</p>
        <p className="text-lg font-bold text-purple-400">91.2%</p>
        <p className="text-xs text-purple-400">↑ 0.8%</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-400">F1 Score</p>
        <p className="text-lg font-bold text-green-400">92.8%</p>
        <p className="text-xs text-green-400">↑ 1%</p>
      </div>
    </div>

    {/* Confusion Matrix Heatmap */}
    <div className="bg-gray-900 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-2">Prediction Accuracy Heatmap (Last 24h)</p>
      <div className="grid grid-cols-5 gap-1">
        {/* Header row */}
        <div></div>
        <div className="text-xs text-gray-400 text-center">Class A</div>
        <div className="text-xs text-gray-400 text-center">Class B</div>
        <div className="text-xs text-gray-400 text-center">Class C</div>
        <div className="text-xs text-gray-400 text-center">Class D</div>
        
        {/* Row 1 */}
        <div className="text-xs text-gray-400 text-right pr-2">Class A</div>
        <div className="bg-green-600 h-8 rounded flex items-center justify-center text-xs font-bold">98%</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">1%</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">1%</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">0%</div>
        
        {/* Row 2 */}
        <div className="text-xs text-gray-400 text-right pr-2">Class B</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">2%</div>
        <div className="bg-green-600 h-8 rounded flex items-center justify-center text-xs font-bold">95%</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">2%</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">1%</div>
        
        {/* Row 3 */}
        <div className="text-xs text-gray-400 text-right pr-2">Class C</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">1%</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">3%</div>
        <div className="bg-green-500 h-8 rounded flex items-center justify-center text-xs font-bold">93%</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">3%</div>
        
        {/* Row 4 */}
        <div className="text-xs text-gray-400 text-right pr-2">Class D</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">0%</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">2%</div>
        <div className="bg-gray-700 h-8 rounded flex items-center justify-center text-xs">4%</div>
        <div className="bg-green-500 h-8 rounded flex items-center justify-center text-xs font-bold">94%</div>
      </div>
    </div>

    {/* Model Confidence Distribution */}
    <div className="bg-gray-900 rounded-lg p-2">
      <p className="text-xs text-gray-400 mb-1">Confidence Distribution</p>
      <div className="flex items-end justify-between h-10 gap-1">
        <div className="flex-1 bg-red-500 rounded-t" style={{ height: '20%' }}></div>
        <div className="flex-1 bg-amber-500 rounded-t" style={{ height: '15%' }}></div>
        <div className="flex-1 bg-yellow-500 rounded-t" style={{ height: '25%' }}></div>
        <div className="flex-1 bg-green-500 rounded-t" style={{ height: '60%' }}></div>
        <div className="flex-1 bg-green-600 rounded-t" style={{ height: '80%' }}></div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span className="text-[10px]">0-20%</span>
        <span className="text-[10px]">20-40%</span>
        <span className="text-[10px]">40-60%</span>
        <span className="text-[10px]">60-80%</span>
        <span className="text-[10px]">80-100%</span>
      </div>
    </div>
  </div>
</div>

                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <span className="text-sm text-gray-300">Classification Accuracy</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                              </div>
                              <span className="text-xs text-green-400">94%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <span className="text-sm text-gray-300">Regression R²</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                              </div>
                              <span className="text-xs text-blue-400">0.89</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <span className="text-sm text-gray-300">Time Series MAPE</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                              </div>
                              <span className="text-xs text-amber-400">8%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                            <span className="text-sm text-gray-300">Anomaly Detection</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                              </div>
                              <span className="text-xs text-purple-400">96%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Prediction Confidence */}
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h4 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
                          <SparklesIcon className="h-5 w-5 text-amber-500" />
                          Prediction Confidence Distribution
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-900 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">High Confidence (&gt;90%)</span>
                              <span className="text-xs text-green-400">78% of predictions</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-900 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">Medium Confidence (70-90%)</span>
                              <span className="text-xs text-amber-400">18% of predictions</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-900 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">Low Confidence (&lt;70%)</span>
                              <span className="text-xs text-red-400">4% of predictions</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: '4%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* Performance by Category */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-gray-300 mb-4">Performance by Use Case Category</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-900 rounded">
                          <div className="text-2xl font-bold text-green-400">95.2%</div>
                          <p className="text-sm font-medium text-gray-300">Classification</p>
                          <p className="text-xs text-gray-500">12,847 predictions</p>
                        </div>
                        <div className="text-center p-4 bg-gray-900 rounded">
                          <div className="text-2xl font-bold text-blue-400">91.8%</div>
                          <p className="text-sm font-medium text-gray-300">Regression</p>
                          <p className="text-xs text-gray-500">8,234 predictions</p>
                        </div>
                        <div className="text-center p-4 bg-gray-900 rounded">
                          <div className="text-2xl font-bold text-amber-400">89.4%</div>
                          <p className="text-sm font-medium text-gray-300">Time Series</p>
                          <p className="text-xs text-gray-500">5,678 predictions</p>
                        </div>
                        <div className="text-center p-4 bg-gray-900 rounded">
                          <div className="text-2xl font-bold text-purple-400">93.7%</div>
                          <p className="text-sm font-medium text-gray-300">Anomaly Detection</p>
                          <p className="text-xs text-gray-500">3,456 predictions</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Center */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h4 className="text-md font-semibold text-amber-400 mb-4 flex items-center gap-2">
                        <CpuChipIcon className="h-5 w-5" />
                        Action Center - Improve Accuracy to 100%
                      </h4>
                      
                      <div className="space-y-4">
                        <p className="text-sm text-gray-400">Execute recommended actions to improve accuracy score:</p>
                        
                        {/* Action Items */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <ChartBarIcon className="h-5 w-5 text-blue-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Enhance Model Training Data</p>
                                <p className="text-xs text-gray-400">+3% accuracy improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <BeakerIcon className="h-5 w-5 text-green-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Implement Advanced Validation</p>
                                <p className="text-xs text-gray-400">+2% accuracy improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <CpuChipIcon className="h-5 w-5 text-purple-400" />
                              <div>
                                <p className="text-sm font-medium text-white">Optimize Prediction Algorithms</p>
                                <p className="text-xs text-gray-400">+3% accuracy improvement</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Execute
                            </button>
                          </div>
                        </div>

                        {/* Batch Actions */}
                        <div className="pt-4 border-t border-gray-700">
                          <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                            Execute All Recommendations (+8% Total)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
                      onClick={() => setShowSIAModal(null)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      onClick={() => {
                        // Export accuracy report
                        const report = {
                          type: 'accuracy',
                          score: 92,
                          timestamp: new Date().toISOString(),
                          precision: 94.5,
                          recall: 91.2,
                          f1Score: 92.8
                        };
                        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `accuracy-report-${Date.now()}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Export Report
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      </div>
    </div>
  );
};

// Wrap with persistence
const MissionControlWithPersistence = () => (
  <MissionControlPersistenceWrapper>
    <MissionControl />
  </MissionControlPersistenceWrapper>
);

export default MissionControlWithPersistence;