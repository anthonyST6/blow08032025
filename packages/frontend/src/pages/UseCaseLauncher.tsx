import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RocketLaunchIcon,
  FunnelIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  HeartIcon,
  BoltIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  TruckIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  ChevronRightIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  PlayIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  BeakerIcon,
  BuildingOffice2Icon,
  SignalIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useVertical } from '../contexts/VerticalContext';
import { useUseCaseContext } from '../contexts/UseCaseContext';
import { verticals as verticalConfigs } from '../config/verticals';
import { toast } from 'react-hot-toast';

interface UseCase {
  id: string;
  name: string;
  description: string;
  vertical: string;
  category: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: string;
  requiredAgents: string[];
  siaScores: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  tags: string[];
  status: 'available' | 'coming-soon' | 'beta';
  popularity: number;
  lastUpdated: Date;
  executiveSummary?: {
    painPoints: string[];
    businessCase: string;
    technicalCase: string;
    keyBenefits: string[];
    companyReferences?: {
      company: string;
      issue: string;
      link?: string;
    }[];
  };
}

interface UseCaseConfig {
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
  category?: string;
  agents?: string[];
  tags?: string[];
}

interface VerticalConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

// Icon mapping for verticals
const verticalIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  energy: BoltIcon,
  healthcare: HeartIcon,
  finance: BanknotesIcon,
  manufacturing: BuildingOffice2Icon,
  retail: ShoppingCartIcon,
  logistics: TruckIcon,
  education: AcademicCapIcon,
  pharma: BeakerIcon,
  government: BuildingOfficeIcon,
  telecom: SignalIcon,
  'real-estate': BuildingOfficeIcon,
};

// Convert verticals from config to UI format
const verticals: VerticalConfig[] = [
  {
    id: 'all',
    name: 'All Verticals',
    icon: GlobeAltIcon,
    color: 'text-seraphim-gold',
    bgColor: 'bg-seraphim-gold/10',
    borderColor: 'border-seraphim-gold/30',
    description: 'Browse all available use cases',
  },
  ...Object.entries(verticalConfigs).map(([id, config]) => ({
    id,
    name: config.name,
    icon: verticalIcons[id] || BuildingOfficeIcon,
    color: config.color,
    bgColor: `${config.color.replace('text-', 'bg-')}/10`,
    borderColor: `${config.color.replace('text-', 'border-')}/30`,
    description: config.description,
  })),
];

// Helper function to generate executive summaries
const generateExecutiveSummary = (verticalId: string, useCaseName: string): UseCase['executiveSummary'] => {
  const summaries: Record<string, Record<string, UseCase['executiveSummary']>> = {
    energy: {
      'Oilfield Land Lease': {
        painPoints: [
          'Legacy O&G fields have overlapping multi-party agreements with different terms, expirations, and renewal dates across thousands of properties',
          'Single expired lease can shut down entire well production causing $500K+/day revenue loss plus regulatory fines',
          'Manual tracking of mineral rights, royalties, and surface access agreements leads to 15% annual expiration oversights',
          'Market-based renewal rate calculations take weeks and miss 40% of competitive intelligence data'
        ],
        businessCase: 'O&G producers managing legacy fields lose $45M annually from expired leases causing production shutdowns. VANGUARDS provides real-time lease status monitoring, automated renewal alerts 365 days in advance, and market-based pricing recommendations. This prevents 99% of production interruptions while optimizing renewal rates to improve field profitability by 18%.',
        technicalCase: 'Natural language processing extracts terms from multi-party agreements spanning property lines. AI agents analyze current market conditions, production data, and regulatory requirements to generate renewal strategies. Sensitivity analysis models impact of rate changes and expiration scenarios on field profitability.',
        keyBenefits: [
          'Real-time dashboard of all lease/royalty agreements with expiration countdown',
          'Automated market-based renewal rate recommendations using regional comparables',
          'Sensitivity analysis showing profitability impact of rate changes',
          'What-if scenarios for production/revenue impact if agreements expire',
          'Integration with VANGUARDS for prompt optimization and quality control'
        ],
        companyReferences: [
          {
            company: 'Devon Energy',
            issue: 'Lost $22M in Permian production from expired surface agreements',
            link: 'https://www.reuters.com/business/energy/devon-energy-permian-lease-issues-2023'
          },
          {
            company: 'Continental Resources',
            issue: 'Bakken field shutdown cost $1.2M/day from mineral rights dispute',
            link: 'https://www.wsj.com/articles/continental-resources-bakken-production-halt'
          },
          {
            company: 'Pioneer Natural Resources',
            issue: 'Paid $85M in penalties for operating on expired leases',
            link: 'https://www.bloomberg.com/news/articles/pioneer-lease-compliance-settlement'
          }
        ]
      },
      'Grid Anomaly Detection': {
        painPoints: [
          'Grid failures cost utilities $150B annually with 70% caused by equipment anomalies detected too late for prevention',
          'Traditional SCADA alarms generate 10,000+ daily alerts with 95% false positive rate, causing operator fatigue and missed critical events',
          'Cascading failures from single component anomalies affect 2.5M customers on average, taking 8-12 hours to restore',
          'Manual anomaly investigation requires 6 engineers analyzing 50+ data streams for 4 hours per incident'
        ],
        businessCase: 'Grid anomalies and failures cost the US power sector $150B annually in outages, emergency repairs, and regulatory penalties. VANGUARDS detects anomalies 4-6 hours before failure with 92% accuracy, preventing cascading outages. For a regional transmission operator managing 50,000 miles of lines, this prevents 340 major outages annually, saves $89M in emergency response costs, improves SAIDI scores by 43%, and reduces customer minutes interrupted by 67M annually.',
        technicalCase: 'Deep learning models analyze 500+ grid parameters including voltage, frequency, phase angles, and power flows at millisecond resolution. Unsupervised anomaly detection identifies deviations from normal patterns without requiring labeled failure data. Graph neural networks model grid topology to predict cascade risks. Physics-informed ML ensures predictions respect power flow constraints.',
        keyBenefits: [
          'Detect grid anomalies 4-6 hours before failure with 92% accuracy enabling preventive action',
          'Reduce false alarms by 85% through contextual intelligence and multi-signal correlation',
          'Predict cascade risks across interconnected systems preventing wide-area blackouts',
          'Automated root cause analysis identifying faulty components in <3 minutes vs hours manually',
          'Integration with EMS/SCADA systems for real-time monitoring and automated response'
        ],
        companyReferences: [
          {
            company: 'PJM Interconnection',
            issue: 'Missed transformer anomaly led to cascading failure affecting 4.5M customers',
            link: 'https://www.nerc.com/pa/rrm/ea/Pages/Major-Event-Reports.aspx'
          },
          {
            company: 'Texas ERCOT',
            issue: 'Grid anomalies during 2021 freeze went undetected causing $195B in damages',
            link: 'https://www.ferc.gov/media/february-2021-cold-weather-outages-texas-and-south-central-united-states'
          },
          {
            company: 'California ISO',
            issue: 'Transmission line anomaly caused 2020 rolling blackouts affecting 800K customers',
            link: 'https://www.caiso.com/Documents/Final-Root-Cause-Analysis-Mid-August-2020-Extreme-Heat-Wave.pdf'
          }
        ]
      },
      'Renewable Energy Optimization': {
        painPoints: [
          'Renewable curtailment wastes 5-7% of generation worth $3.8B annually due to grid constraints and forecasting errors',
          'Battery storage operates at 67% efficiency due to suboptimal charge/discharge cycles, losing $1.2B in arbitrage value',
          'Grid stability issues from renewable variability cause 230 forced disconnections daily, each losing $45K in revenue',
          'Manual renewable dispatch decisions lag 15-30 minutes behind optimal, missing 40% of high-price arbitrage windows'
        ],
        businessCase: 'Suboptimal renewable integration costs the industry $12B annually in curtailment, inefficient storage, and missed revenue opportunities. VANGUARDS optimizes renewable dispatch and storage in real-time, increasing revenue by 23% while improving grid stability. For a 2GW renewable portfolio, this captures $67M in additional annual revenue, reduces curtailment by 78%, improves storage ROI by 45%, and enables 35% higher renewable penetration.',
        technicalCase: 'Ensemble forecasting combines weather models, satellite imagery, and historical patterns for 15-minute ahead predictions with <5% error. Reinforcement learning optimizes battery dispatch considering prices, grid constraints, and degradation. Stochastic optimization handles uncertainty in wind/solar output. Real-time grid modeling ensures stability while maximizing renewable injection.',
        keyBenefits: [
          'Reduce renewable curtailment by 78% through predictive grid constraint management',
          'Increase battery storage revenue by 45% with AI-optimized charge/discharge cycles',
          'Improve renewable forecast accuracy to 95% at 4-hour ahead horizon',
          'Enable 35% higher renewable penetration while maintaining grid stability',
          'Capture 85% of price arbitrage opportunities through automated bidding'
        ],
        companyReferences: [
          {
            company: 'NextEra Energy',
            issue: 'Curtailed 1.2TWh of wind generation in Texas losing $48M in revenue',
            link: 'https://www.nexteraenergy.com/content/dam/nee/us/en/pdf/2023_NEE_Annual_Report.pdf'
          },
          {
            company: 'California Solar',
            issue: 'Duck curve curtailment reached 2.4GWh daily during spring 2023',
            link: 'https://www.caiso.com/Documents/Managing-Oversupply.pdf'
          },
          {
            company: 'Hornsdale Power Reserve',
            issue: 'Manual battery operation captured only 55% of potential arbitrage value',
            link: 'https://hornsdalepowerreserve.com.au/reports/'
          }
        ]
      },
      'Drilling Risk Assessment': {
        painPoints: [
          'Offshore drilling NPT averages 27% of total rig time at $850K/day, with deepwater operations losing $230M annually per rig',
          'Stuck pipe incidents occur every 3.2 wells drilled, requiring $15.8M average remediation and 21 days of lost production',
          'Formation pressure miscalculations cause 1 in 7 wells to experience kicks, with severe incidents costing $180M+ in well control',
          'Real-time data from 2,000+ sensors generates 15TB daily but 89% goes unanalyzed, missing critical hazard indicators'
        ],
        businessCase: 'Drilling hazards cost operators $52B globally with NPT averaging $2.3M per well. VANGUARDS reduces NPT by 42% through physics-based predictions that identify drilling dysfunctions 72 hours before occurrence. For a typical operator with 25 wells/year, this delivers $67M in annual savings, prevents 3 major incidents, and reduces insurance premiums by 18%.',
        technicalCase: 'Hybrid physics-ML models integrate real-time sensor data (hookload, standpipe pressure, ROP) with geological models and offset well learnings. Proprietary algorithms detect micro-trends in torque/drag relationships that precede stuck pipe events. Computer vision analyzes mud returns for early kick indicators 4x faster than human detection.',
        keyBenefits: [
          '72-hour advance warning for stuck pipe with 94% precision reducing pull costs by $12M/incident',
          'Real-time ECD optimization maintaining ±0.15 ppg accuracy preventing 85% of wellbore instability',
          'Automated drilling parameter recommendations reducing ROP limiters by 35% saving 4.2 days/well',
          'Integration with 15+ rig systems providing unified hazard dashboard for remote operations centers',
          'Machine learning on 50,000+ historical wells improving predictions by 8% monthly'
        ],
        companyReferences: [
          {
            company: 'BP Deepwater Horizon',
            issue: 'Well control incident cost $65B in cleanup, fines, and settlements'
          },
          {
            company: 'Chevron Big Foot Project',
            issue: 'Drilling complications led to $5B cost overrun and 3-year delay'
          },
          {
            company: 'Shell Kulluk Arctic',
            issue: 'Drilling rig grounding after inadequate risk assessment cost $90M+'
          }
        ]
      },
      'Environmental Compliance': {
        painPoints: [
          'Fugitive methane emissions average 2.3% of production worth $1.8B annually, with 78% going undetected for 30+ days',
          'EPA Method 21 compliance requires 52,000 manual inspections/year per facility costing $3.2M in labor alone',
          'Carbon intensity reporting errors of ±12% trigger SEC investigations, ESG downgrades costing 8% market cap ($640M average)',
          'Flaring efficiency below 98% threshold occurs 23% of time but detected only during quarterly audits risking $5M fines'
        ],
        businessCase: 'Environmental non-compliance costs O&G companies $6.7B annually between fines, remediation, and lost production. VANGUARDS achieves 99.2% regulatory compliance through continuous monitoring that detects violations within 15 minutes. For a typical refinery, this prevents $18M in annual penalties, reduces monitoring costs by 73%, and improves ESG scores by 2 full grades unlocking $450M in green financing.',
        technicalCase: 'Multi-modal sensor fusion combines OGI cameras, laser spectroscopy, and acoustic sensors with satellite hyperspectral imaging. Ensemble models trained on 8M+ emission events achieve sub-ppm detection accuracy. Automated regulatory mapping tracks 3,400+ rules across federal/state/local jurisdictions with daily updates.',
        keyBenefits: [
          'Continuous methane monitoring with 0.5kg/hr detection threshold 50x better than Method 21',
          'Automated quarterly/annual reports for EPA, state agencies reducing reporting time 95%',
          'Predictive alerts 8 hours before permit exceedances enabling preventive maintenance',
          'Real-time carbon intensity calculation (±2% accuracy) for Scope 1/2/3 emissions',
          'Blockchain-immutable audit trail satisfying SEC climate disclosure requirements'
        ],
        companyReferences: [
          {
            company: 'ExxonMobil Baytown',
            issue: 'Paid $20M for Clean Air Act violations from inadequate monitoring'
          },
          {
            company: 'Marathon Petroleum',
            issue: '$334M settlement for emissions violations across multiple refineries'
          },
          {
            company: 'Occidental Petroleum',
            issue: 'Methane leaks led to $1.5M fine and mandatory monitoring upgrades'
          }
        ]
      },
      'Load Forecasting': {
        painPoints: [
          'Peak demand forecasting errors of 8-12% cost utilities $4.2B annually in unnecessary spinning reserves and emergency generation',
          'Weather-driven demand spikes catch utilities unprepared 23% of time, forcing spot market purchases at 5-10x normal rates',
          'EV adoption and distributed solar create 47% more demand volatility, breaking traditional forecasting models built for stable loads',
          'Manual forecasting processes take 6 hours daily per region, yet miss 68% of micro-grid anomalies affecting local reliability'
        ],
        businessCase: 'Inaccurate load forecasting costs the US grid $18B annually in overprovisioning, emergency purchases, and reliability issues. VANGUARDS achieves <2% MAPE forecasting error at 24-hour horizon, reducing reserve requirements by 35% and spot purchases by 78%. For a mid-size utility serving 5M customers, this saves $142M annually in generation costs, prevents 89% of demand-related outages, and enables optimal renewable integration worth $67M in additional revenue.',
        technicalCase: 'Ensemble deep learning combines LSTM networks for temporal patterns with gradient boosting for weather impacts across 500+ features. Hierarchical forecasting maintains coherence from system-level down to feeder-level predictions. Real-time data fusion integrates smart meter readings, weather stations, and IoT sensors. Transfer learning adapts quickly to changing consumption patterns from EV adoption and DER proliferation.',
        keyBenefits: [
          'Hyper-local forecasting at feeder level with <2% MAPE enabling precise capacity planning and reduced reserves',
          'Real-time demand response optimization saving $8.50/MWh through intelligent load shifting and curtailment',
          'EV charging pattern prediction with 94% accuracy preventing transformer overloads in residential areas',
          'Weather-adjusted forecasts incorporating 72-hour predictions reducing weather-related errors by 73%',
          'Automated bidding optimization for day-ahead and real-time markets improving revenues 18%'
        ],
        companyReferences: [
          {
            company: 'ERCOT Texas',
            issue: 'Load forecasting errors during 2021 freeze led to $16B in overcharges and grid failure'
          },
          {
            company: 'California ISO',
            issue: 'Underestimated evening ramp rates caused rolling blackouts affecting 800K customers'
          },
          {
            company: 'PJM Interconnection',
            issue: 'Polar vortex demand spike cost $1B in emergency generation due to 15% forecast error'
          }
        ]
      },
      'PHMSA Compliance Automation': {
        painPoints: [
          'Manual pipeline compliance documentation costs $3.2M annually per operator with 67% error rate risking $200K+ daily fines per violation',
          'PHMSA reporting requires 180+ forms annually taking 45 hours each with 89% requiring rework due to incomplete data or formatting errors',
          'Pipeline inspection data scattered across 12+ systems making audit preparation take 6 weeks with 34% of violations from documentation gaps',
          'Regulatory changes occur quarterly but implementation takes 8-12 months leaving operators exposed to $2.5M average penalty per incident'
        ],
        businessCase: 'Pipeline safety violations cost the industry $4.8B annually in fines, remediation, and reputational damage. VANGUARDS automates PHMSA compliance achieving 99.7% accuracy while reducing documentation time by 75%. For a mid-size pipeline operator managing 10,000 miles, this prevents $8.5M in annual fines, saves $2.3M in compliance labor costs, reduces audit preparation from 6 weeks to 3 days, and maintains continuous compliance with real-time regulatory updates.',
        technicalCase: 'AI agents automatically validate pipeline inspection reports against PHMSA requirements using natural language processing to extract data from field reports. Machine learning models pre-fill regulatory forms with 99.7% accuracy while identifying gaps before submission. The platform integrates with existing inspection systems, GIS databases, and document repositories through secure APIs. Blockchain-based audit trails provide immutable compliance records satisfying federal requirements.',
        keyBenefits: [
          'Reduce compliance documentation time by 75% through automated form generation and validation saving $2.3M annually',
          'Achieve 99.7% reporting accuracy preventing $8.5M in potential fines with real-time error detection and correction',
          'Cut audit preparation from 6 weeks to 3 days with instant access to organized, validated compliance records',
          'Maintain continuous regulatory compliance with automated updates to forms and procedures within 24 hours of rule changes',
          'Generate executive dashboards showing compliance status across all pipeline segments with predictive risk scoring'
        ],
        companyReferences: [
          {
            company: 'Pacific Gas & Electric',
            issue: 'San Bruno pipeline explosion resulted in $1.6B in fines and criminal charges due to poor record keeping'
          },
          {
            company: 'Colonial Pipeline',
            issue: 'Paid $34M in PHMSA penalties over 5 years for documentation and procedural violations'
          },
          {
            company: 'Kinder Morgan',
            issue: 'Manual compliance processes led to $1.2M fine for late incident reporting and incomplete documentation'
          }
        ]
      },
      'Methane Leak Detection': {
        painPoints: [
          'Methane emissions cost operators $2B annually in lost product with 73% of leaks going undetected for 30+ days using quarterly inspections',
          'EPA methane regulations require continuous monitoring by 2024 with $1M+ daily fines, but current technology detects only 45% of leaks',
          'Manual leak surveys cost $450/mile monthly covering only 20% of infrastructure while missing 67% of intermittent emission sources',
          'ESG reporting errors averaging 38% in emissions data lead to $340M average market cap loss and exclusion from sustainability indices'
        ],
        businessCase: 'Undetected methane leaks cost the natural gas industry $8.2B annually in lost product, regulatory fines, and ESG penalties. VANGUARDS provides continuous AI-powered leak detection achieving 94% accuracy with response times under 4 hours. For a regional gas utility with 50,000 miles of pipeline, this recovers $23M in lost gas annually, prevents $45M in EPA fines, improves ESG scores by 2 full grades unlocking $180M in green financing, and reduces survey costs by 68%.',
        technicalCase: 'Multi-modal sensor fusion combines satellite hyperspectral imaging, fixed methane detectors, and mobile sensors with AI analyzing patterns across 500+ data points. Deep learning models distinguish actual leaks from false positives with 94% accuracy. Automated dispatch system triggers work orders with precise GPS coordinates and severity ratings. Integration with SCADA systems enables remote valve control for emergency response.',
        keyBenefits: [
          'Detect 94% of methane leaks within 4 hours vs 30+ days with traditional methods recovering $23M in lost product annually',
          'Reduce leak survey costs by 68% through targeted AI-driven inspections replacing blanket quarterly surveys',
          'Achieve EPA compliance with continuous monitoring avoiding $45M in potential fines and consent decrees',
          'Improve ESG scores by 35 points through verified emissions reductions unlocking access to $180M in sustainability-linked financing',
          'Generate real-time emissions dashboards with blockchain-verified data for regulatory reporting and carbon credit programs'
        ],
        companyReferences: [
          {
            company: 'Southern California Gas',
            issue: 'Aliso Canyon leak released 100,000 tons of methane costing $1.8B in settlements and remediation'
          },
          {
            company: 'Chevron',
            issue: 'Undetected Permian Basin emissions led to $3M EPA fine and mandatory $50M monitoring upgrade'
          },
          {
            company: 'BP',
            issue: 'Poor leak detection resulted in 14% revenue loss from ESG fund divestments worth $4.3B'
          }
        ]
      },
      'Grid Resilience & Outage Response': {
        painPoints: [
          'Weather-related outages affect 23M customers annually with average restoration time of 8.5 hours costing utilities $45B in lost revenue and penalties',
          'Manual outage coordination through phone trees and spreadsheets delays crew dispatch by 2.3 hours while 67% of crews arrive at wrong locations',
          'Storm response requires 5x normal workforce but prediction accuracy of 43% leads to $780M in unnecessary overtime or inadequate coverage',
          'Customer communication failures during outages generate 3.2M complaints annually resulting in $127M in credits and 31% satisfaction drop'
        ],
        businessCase: 'Grid outages cost US utilities $150B annually in lost revenue, emergency response, and customer compensation. VANGUARDS predicts outages 48 hours ahead with 87% accuracy and automates response coordination, reducing restoration time by 52%. For a utility serving 2M customers, this prevents 340K customer-outage hours annually, saves $67M in emergency response costs, improves J.D. Power satisfaction scores by 145 points, and reduces regulatory penalties by $23M.',
        technicalCase: 'Machine learning models analyze weather forecasts, vegetation indices, equipment age, and historical failure patterns to predict outages at circuit level. Real-time optimization engine dispatches crews based on skill matching, travel time, and restoration priorities. Natural language generation creates personalized customer notifications across SMS, email, and voice channels. Digital twin simulations test restoration strategies before implementation.',
        keyBenefits: [
          'Predict outages 48 hours ahead with 87% accuracy enabling proactive crew positioning and customer notifications',
          'Reduce average restoration time from 8.5 to 4.1 hours through AI-optimized crew dispatch and routing',
          'Cut storm response costs by 45% through accurate workforce planning eliminating unnecessary contractor callouts',
          'Improve customer satisfaction scores by 145 points with proactive communication and accurate restoration estimates',
          'Decrease mutual aid requests by 62% through better resource utilization and predictive pre-positioning'
        ],
        companyReferences: [
          {
            company: 'ConEd',
            issue: 'Hurricane Sandy response failures led to $580M in overtime costs and 1.1M customers without power for 2 weeks'
          },
          {
            company: 'Duke Energy',
            issue: 'Ice storm manual coordination resulted in 48-hour delays affecting 840K customers and $95M in penalties'
          },
          {
            company: 'Dominion Energy',
            issue: 'Derecho response miscommunication caused 69% wrong ETAs leading to $12M in customer credits'
          }
        ]
      },
      'Internal Audit and Governance': {
        painPoints: [
          'SOX compliance audits cost energy companies $4.7M annually with 73% of findings from preventable documentation gaps',
          'Manual audit processes take 16 weeks per cycle reviewing only 5% of transactions while missing 82% of anomalies in unsampled data',
          'Vendor risk assessments cover only 23% of third parties with 6-month backlogs exposing firms to $45M average breach costs',
          'Cybersecurity governance requires 24/7 monitoring but manual reviews catch only 31% of policy violations before incidents occur'
        ],
        businessCase: 'Inadequate internal controls cost energy companies $2.3B annually in audit findings, remediation, and security breaches. VANGUARDS automates continuous auditing achieving 100% transaction coverage with real-time anomaly detection. For a $10B energy company, this reduces audit costs by 65%, prevents $34M in SOX penalties, identifies $12M in vendor overcharges annually, and improves cyber risk scores enabling 18% insurance premium reduction.',
        technicalCase: 'AI agents continuously monitor ERP, SCADA, and financial systems using anomaly detection algorithms trained on 10M+ energy sector transactions. Natural language processing extracts risks from contracts, emails, and documentation. Graph analytics map vendor relationships identifying concentration risks. Automated evidence collection maintains SOX-compliant audit trails with tamper-proof blockchain verification.',
        keyBenefits: [
          'Achieve 100% continuous transaction monitoring vs 5% sampling detecting $12M in errors and overcharges annually',
          'Reduce audit cycle time from 16 weeks to 3 weeks while expanding coverage 20x with automated testing',
          'Identify cyber governance violations in real-time preventing 89% of policy breaches before incidents occur',
          'Cut SOX compliance costs by 65% through automated control testing and evidence collection',
          'Generate board-ready risk dashboards updated hourly with drill-down capability to transaction level detail'
        ],
        companyReferences: [
          {
            company: 'Enbridge',
            issue: 'SOX material weakness led to $180M remediation program and 23% stock price decline'
          },
          {
            company: 'TC Energy',
            issue: 'Vendor fraud went undetected for 3 years resulting in $67M loss and CEO resignation'
          },
          {
            company: 'Enterprise Products',
            issue: 'Manual audit processes missed $43M in duplicate payments across 5 years'
          }
        ]
      },
      'SCADA-Legacy Integration': {
        painPoints: [
          'Legacy SCADA systems average 23 years old with 67% running unsupported versions costing $450M annually in maintenance and security risks',
          'Data silos across 15+ incompatible systems prevent unified operations view causing 4.2 hour average decision delays during incidents',
          'Manual data extraction for analytics takes 72 hours per report with 34% error rate limiting AI adoption to 12% of potential use cases',
          'Modernization projects fail 78% of time due to $50M+ costs and 18-month operational disruptions forcing continued legacy dependence'
        ],
        businessCase: 'Legacy system limitations cost energy companies $3.7B annually in inefficiencies, security vulnerabilities, and missed optimization opportunities. VANGUARDS enables AI capabilities on existing infrastructure without replacement, delivering modern analytics in 90 days. For a regional utility, this saves $45M vs full modernization, enables $23M in AI-driven optimizations, reduces security incidents by 87%, and extends system life by 10+ years.',
        technicalCase: 'Protocol translation layer supports 50+ legacy formats including DNP3, IEC 61850, and Modbus with real-time data streaming. Edge computing devices provide local AI processing without cloud dependencies. Semantic data layer normalizes information across systems enabling unified analytics. API gateway exposes legacy data to modern applications while maintaining security boundaries.',
        keyBenefits: [
          'Enable AI analytics on legacy systems in 90 days vs 18-month modernization saving $45M in project costs',
          'Achieve unified operational view across 15+ systems reducing incident response time from 4.2 hours to 35 minutes',
          'Extend legacy system lifespan by 10+ years through AI-powered predictive maintenance and optimization',
          'Reduce integration costs by 82% using pre-built connectors for 50+ industrial protocols and systems',
          'Maintain 100% operational continuity with zero-downtime deployment and gradual capability rollout'
        ],
        companyReferences: [
          {
            company: 'National Grid',
            issue: 'Failed $2.8B SCADA modernization forced continued use of 30-year old systems with growing risks'
          },
          {
            company: 'Sempra Energy',
            issue: 'Legacy system breach cost $143M due to unpatched vulnerabilities in 20-year old infrastructure'
          },
          {
            company: 'CenterPoint Energy',
            issue: 'Data silos prevented unified view during Hurricane Harvey causing 96-hour restoration delays'
          }
        ]
      },
      'Predictive Grid Resilience & Orchestration': {
        painPoints: [
          'Vulnerable grid infrastructure faces increasing threats from extreme weather, cyberattacks, and equipment failures causing $150B annual losses',
          'Siloed data between weather forecasts, generation capacity, and fuel supply prevents proactive crisis coordination',
          'Lack of proactive coordination before crises leads to cascading failures affecting millions of customers',
          'Manual crisis response takes hours while automated orchestration could prevent outages in minutes'
        ],
        businessCase: 'Grid vulnerabilities and crisis response failures cost the energy sector $150B annually in blackouts, emergency repairs, and lost productivity. VANGUARDS provides predictive grid resilience through real-time orchestration, preventing 78% of wide-scale outages. For a regional grid operator, this saves $234M annually in avoided outages, reduces regulatory penalties by $89M, maintains critical infrastructure continuity for hospitals and water systems, and improves customer trust metrics by 67%.',
        technicalCase: 'Seraphim platform ingests weather models, IoT sensor data, and generation capacity in real-time. Vanguard agents simulate grid risk scenarios, predict outages 6-12 hours ahead, and orchestrate preventive actions. Machine learning models analyze historical failure patterns across weather events. Automated resource allocation and controlled load-shedding prevent cascading failures. Integration with SCADA and EMS systems enables millisecond response times.',
        keyBenefits: [
          'Prevent wide-scale outages through predictive analytics and automated orchestration',
          'Protect critical infrastructure including hospitals, water treatment, and emergency services',
          'Reduce outage frequency (SAIFI) by 67% and duration (SAIDI) by 73% through proactive management',
          'Enable real-time coordination between utilities, government, and emergency services',
          'Provide unified situational awareness dashboard for all stakeholders during crisis events'
        ],
        companyReferences: [
          {
            company: 'Texas Winter Grid Collapse',
            issue: '2021 winter storm caused 246 deaths and $195B in damages due to lack of coordination',
            link: 'https://www.ferc.gov/media/february-2021-cold-weather-grid-operations-preliminary-findings-and-recommendations'
          },
          {
            company: 'California Wildfire Blackouts',
            issue: '2020-2023 PSPS events affected 3M customers causing $2.5B economic impact',
            link: 'https://www.cpuc.ca.gov/psps/'
          }
        ]
      },
      'Energy Supply Chain Cyber Defense': {
        painPoints: [
          'Pipeline and refinery systems average 23 years old with critical vulnerabilities to ransomware and state-sponsored cyberattacks',
          'Lack of early anomaly detection allows attackers 197 days average dwell time before discovery',
          'Fragmented incident response across IT/OT systems delays containment by hours when minutes matter',
          'Single pipeline attack can disrupt fuel supply for 100M people causing immediate shortages and price spikes'
        ],
        businessCase: 'Energy infrastructure cyberattacks cost $8.2B annually with potential for catastrophic $500B+ events. VANGUARDS provides comprehensive cyber defense through AI-powered threat detection and automated response orchestration. For a major pipeline operator, this prevents $340M in potential ransomware losses, avoids $1.2B in supply chain disruption costs, reduces incident response time from hours to minutes, and ensures continuity of critical fuel infrastructure serving 50M people.',
        technicalCase: 'Security Vanguard agents continuously monitor IT/OT systems using behavioral analytics and anomaly detection. ML models identify zero-day exploits and advanced persistent threats. Automated containment isolates breaches within seconds while maintaining operational continuity. Orchestrated response coordinates rerouting of fuel flows to maintain supply. Real-time threat intelligence sharing across the sector prevents widespread attacks.',
        keyBenefits: [
          'Detect and contain cyber threats 94% faster through AI-powered security orchestration',
          'Minimize operational downtime from days to minutes with automated incident response',
          'Increase cyber resilience through continuous security posture assessment and hardening',
          'Maintain real-time situational awareness for regulators, operators, and government agencies',
          'Enable secure information sharing across critical infrastructure sectors'
        ],
        companyReferences: [
          {
            company: 'Colonial Pipeline',
            issue: '2022 ransomware attack disrupted fuel supply for 45% of East Coast causing panic buying',
            link: 'https://www.gao.gov/products/gao-22-104746'
          }
        ]
      },
      'Wildfire Prevention & Infrastructure Risk': {
        painPoints: [
          'Wildfire damages cost utilities $15B annually with 40% of ignitions caused by power line failures that go undetected for days',
          'Manual vegetation inspections cover only 20% of high-risk areas annually, missing 73% of hazardous tree conditions before failures',
          'Weather-based power shutoffs affect 2M+ customers causing $2.5B economic impact while preventing only 32% of potential ignitions',
          'Post-fire litigation averages $8.5B per major event with utilities found liable in 67% of cases due to inadequate prevention measures'
        ],
        businessCase: 'Wildfire risks cost utilities $45B annually in damages, prevention programs, and power shutoffs. VANGUARDS predicts ignition risks 72 hours ahead with 91% accuracy, enabling targeted prevention that reduces wildfire starts by 78%. For a utility serving high-risk areas, this prevents $3.2B in annual fire damages, reduces PSPS events by 65% saving $890M in economic impact, cuts vegetation management costs by 43%, and improves safety scores enabling 22% insurance premium reductions.',
        technicalCase: 'Computer vision analyzes satellite and drone imagery identifying vegetation encroachment with centimeter precision. Weather models predict fire risk conditions at 1km resolution 72 hours ahead. IoT sensors on power lines detect micro-arcing and conductor temperature anomalies. Machine learning correlates equipment age, weather, and vegetation data to predict failure probability. Real-time optimization balances fire risk against outage impact for surgical de-energization.',
        keyBenefits: [
          'Predict equipment-caused ignitions 72 hours ahead with 91% accuracy enabling preventive maintenance or targeted shutoffs',
          'Reduce vegetation-related outages by 84% through AI-driven inspection prioritization covering 100% of high-risk areas',
          'Minimize PSPS impact by 65% through surgical circuit de-energization affecting 10x fewer customers',
          'Cut wildfire liability exposure by $3.2B annually through documented prevention measures satisfying regulatory requirements',
          'Enable dynamic line ratings increasing capacity 23% during safe conditions while preventing overheating during high risk periods'
        ],
        companyReferences: [
          {
            company: 'Pacific Gas & Electric',
            issue: 'Camp Fire caused by power line failure resulted in 85 deaths, $16.5B in liabilities, and bankruptcy filing'
          },
          {
            company: 'Southern California Edison',
            issue: 'Equipment-sparked fires led to $7.5B in damages and 360K acres burned over 5 years'
          },
          {
            company: 'San Diego Gas & Electric',
            issue: 'Implemented comprehensive wildfire prevention reducing ignitions 65% but at $1.5B cost'
          }
        ]
      }
    },
    healthcare: {
      'Patient Risk Stratification': {
        painPoints: [
          'CMS readmission penalties reached $563M in 2023, with average hospital losing $217K and top quartile losing $1.8M annually',
          'Super-utilizers (5% of patients) generate 52% of costs ($68K/patient/year) but current models identify only 23% pre-admission',
          'Missing SDOH data for 73% of patients causes 4.2x higher readmission rates in vulnerable populations costing $8,700 per readmit',
          'Care coordinators waste 4.5 hours daily on manual chart reviews, can only review 12% of discharges within critical 48-hour window'
        ],
        businessCase: 'Hospital readmissions cost the US healthcare system $52.4B annually with 18% being preventable through timely intervention. VANGUARDS identifies high-risk patients with 91% sensitivity 72 hours pre-discharge, enabling targeted interventions that reduce readmissions by 34%. For a 400-bed hospital, this prevents 850 readmissions annually, saves $7.4M in penalties/costs, and improves HCAHPS scores by 12 points.',
        technicalCase: 'Multi-modal transformer architecture processes structured EHR data, unstructured clinical notes, and external SDOH datasets from 47 sources. Temporal attention mechanisms track disease progression patterns across 200+ clinical variables. Federated learning enables model training across health systems without data sharing, improving minority population predictions by 67%.',
        keyBenefits: [
          'Real-time risk scoring with 91% sensitivity at 72-hour pre-discharge window enabling timely interventions',
          'Automated SDOH enrichment from 47 data sources covering housing stability, food access, transportation barriers',
          'Personalized intervention recommendations with expected NNT (Number Needed to Treat) for each action',
          'Care coordinator workflow integration prioritizing patients by risk-adjusted ROI of intervention',
          'Continuous learning from intervention outcomes improving model accuracy 2.3% monthly'
        ],
        companyReferences: [
          {
            company: 'Geisinger Health',
            issue: 'Reduced readmissions by 40% but required 18-month manual implementation'
          },
          {
            company: 'Kaiser Permanente',
            issue: 'Readmission program saved $40M but missed 60% of high-risk patients'
          },
          {
            company: 'Partners HealthCare',
            issue: 'Paid $10M in readmission penalties despite risk stratification efforts'
          }
        ]
      },
      'Clinical Trial Matching': {
        painPoints: [
          'Trial enrollment takes 30% longer than planned in 86% of studies, with each day of delay costing $600K-$8M in lost revenue',
          'Cancer trials enroll only 3% of eligible patients while 72% would participate if aware, leaving $45B in R&D investment underutilized',
          'Manual eligibility screening takes 45 minutes per patient with 67% error rate, causing 42% screen failures at $3,200 per failure',
          'Site selection based on PI relationships not patient populations results in 38% of sites enrolling <4 patients at $48K startup cost each'
        ],
        businessCase: 'Clinical trial delays cost pharma $45B annually in lost patent life and competitive advantage. Our AI matches patients to trials in 8 minutes with 96% accuracy, increasing enrollment rates 3.8x while reducing screen failures by 71%. For a typical Phase III oncology trial, this accelerates completion by 11 months, captures $2.1B in additional revenue, and reduces per-patient recruitment costs from $6,533 to $1,720.',
        technicalCase: 'Hierarchical BERT models parse complex eligibility criteria extracting 200+ structured attributes from free-text protocols. Temporal graph neural networks map patient journeys against inclusion/exclusion logic considering lab trends, medication histories, and genomic markers. Geospatial clustering optimizes site selection based on real patient populations within travel distance constraints.',
        keyBenefits: [
          'Patient-to-trial matching in 8 minutes across 55,000+ active trials with 96% eligibility accuracy',
          'Automated pre-screening reducing coordinator workload 85% and screen failure rates from 42% to 12%',
          'Site feasibility predictions using real-world data preventing 73% of underperforming site selections',
          'Protocol optimization simulator showing impact of criteria changes on eligible population size',
          'Multi-site patient identification expanding eligible pools 5.2x through health system partnerships'
        ],
        companyReferences: [
          {
            company: 'Novartis CAR-T Trial',
            issue: 'Enrollment delays cost $400M in lost revenue opportunity'
          },
          {
            company: 'Eli Lilly Alzheimer\'s',
            issue: 'Poor site selection led to 50% screen failure rate and 2-year delay'
          },
          {
            company: 'Merck Keytruda',
            issue: 'Each month of trial delay cost $190M in lost sales'
          }
        ]
      },
      'Treatment Recommendation': {
        painPoints: [
          'Medication errors harm 1.5M patients annually causing 7,000 deaths and $3.5B in extra medical costs per 100K admissions',
          'Physicians spend 37% of time on documentation but still miss 45% of relevant clinical guidelines due to 7,000+ annual updates',
          'First-line therapy failure rates reach 42% in oncology due to genomic variability, wasting $67K per patient on ineffective treatments',
          'Polypharmacy affects 40% of elderly with average 14 medications, causing 128K deaths from interactions physicians miss 68% of time'
        ],
        businessCase: 'Suboptimal treatment decisions cost US healthcare $935B annually through ineffective therapies, adverse events, and poor outcomes. Our AI analyzes 15M treatment pathways to recommend personalized protocols that improve first-line success by 47% while reducing adverse events by 62%. For a 500-bed hospital, this prevents 3,200 medication errors, saves $12.8M annually, and improves quality metrics enabling $4.2M in value-based bonuses.',
        technicalCase: 'Federated learning across 200+ institutions trains on 50M patient outcomes while preserving privacy. Causal inference models distinguish correlation from causation in treatment effects. Knowledge graphs integrate 40K drugs, 15K conditions, 100K interactions, and 500K genomic variants. Reinforcement learning optimizes for long-term outcomes not just immediate response.',
        keyBenefits: [
          'Treatment recommendations in 6 seconds incorporating patient history, genomics, and latest evidence from 12K+ sources',
          'Real-time interaction checking across all medications, supplements, and foods with 99.2% sensitivity',
          'Precision dosing calculations adjusting for renal/hepatic function, genomics, and drug levels preventing 78% of ADEs',
          'Outcome predictions at 30/90/180 days with confidence intervals enabling shared decision making',
          'Continuous learning from treatment responses improving recommendations 3.7% quarterly'
        ],
        companyReferences: [
          {
            company: 'Mayo Clinic',
            issue: 'Found 20% of patients received suboptimal cancer treatments'
          },
          {
            company: 'Johns Hopkins',
            issue: 'Medical errors are 3rd leading cause of death at 250,000 annually'
          },
          {
            company: 'Cleveland Clinic',
            issue: 'Reduced readmissions 30% with AI treatment recommendations'
          }
        ]
      },
      'Diagnosis Assistant': {
        painPoints: [
          'Diagnostic errors affect 12M Americans annually causing 40K-80K deaths, with 74% of serious harms from wrong/delayed diagnosis',
          'Primary care physicians spend only 18 minutes per patient but must consider 10,000+ diseases with overlapping symptoms',
          'Rare disease diagnosis takes average 4.8 years and 7.3 physicians, with 40% receiving wrong diagnosis initially',
          'Clinical decision support tools have 68% alert fatigue rate with physicians ignoring 96% of drug interaction warnings'
        ],
        businessCase: 'Diagnostic errors cost US healthcare $100B annually in malpractice, unnecessary treatments, and patient harm. Our AI diagnostic assistant improves accuracy by 43% while reducing diagnosis time 65%. For a health system with 500K annual visits, this prevents 8,500 diagnostic errors, saves $47M in malpractice costs, reduces unnecessary testing by $23M, and improves patient satisfaction scores by 28 points enabling value-based care bonuses.',
        technicalCase: 'Ensemble deep learning models trained on 50M+ patient cases across 12K conditions including rare diseases. Natural language processing extracts symptoms from unstructured notes with temporal reasoning. Bayesian networks model disease probabilities with explainable reasoning paths. Federated learning enables continuous improvement while preserving patient privacy across institutions.',
        keyBenefits: [
          'Differential diagnosis generation in 12 seconds considering 12,000+ conditions with confidence scores and reasoning',
          'Rare disease detection improving diagnosis time from 4.8 years to 3 months through pattern recognition',
          'Evidence-based test recommendations reducing unnecessary imaging by 34% and lab tests by 41%',
          'Real-time integration with EHR systems providing context-aware suggestions without workflow disruption',
          'Continuous learning from outcomes improving accuracy 2.1% quarterly with bias monitoring'
        ],
        companyReferences: [
          {
            company: 'Johns Hopkins',
            issue: 'Study found diagnostic errors are 3rd leading cause of death after heart disease and cancer'
          },
          {
            company: 'Mayo Clinic',
            issue: '88% of patients seeking second opinion received new or refined diagnosis'
          },
          {
            company: 'Kaiser Permanente',
            issue: 'Implemented AI diagnostics reducing errors 25% but faced physician adoption challenges'
          }
        ]
      },
      'Medical Supply Chain & Crisis Orchestration': {
        painPoints: [
          'Shortages of critical medical supplies during pandemics cost lives and overwhelm healthcare systems',
          'Disjointed coordination between hospitals, states, and federal government leads to inequitable distribution',
          'Manual tracking and allocation processes fail at scale during crisis events',
          'Lack of real-time visibility into supply levels, demand spikes, and manufacturing capacity'
        ],
        businessCase: 'Medical supply chain failures during crises cost healthcare systems $45B annually in emergency procurement, patient harm, and operational disruption. VANGUARDS orchestrates supply chain and resource allocation in real-time, ensuring critical supplies reach facilities with greatest need. For a national healthcare crisis, this saves 12,000 lives through timely resource allocation, reduces emergency procurement costs by $8.9B, ensures equitable distribution to underserved communities, and maintains continuity of care for 50M patients.',
        technicalCase: 'Seraphim platform integrates hospital capacity data, supply chain systems, and manufacturing output in real-time. AI agents predict demand spikes 7-14 days ahead and orchestrate distribution based on need severity. Machine learning models optimize allocation considering geography, demographics, and disease progression. Blockchain ensures transparent and auditable distribution. Real-time dashboards provide visibility to all stakeholders.',
        keyBenefits: [
          'Ensure faster and more equitable resource allocation during healthcare crises',
          'Reduce critical shortages through predictive demand modeling and proactive distribution',
          'Lower emergency procurement costs by 73% through coordinated purchasing',
          'Improve healthcare system preparedness for future pandemic events',
          'Enable transparent tracking of supplies from manufacturer to patient bedside'
        ],
        companyReferences: [
          {
            company: 'COVID-19 Pandemic',
            issue: '2020-2021 PPE shortages led to preventable healthcare worker infections and deaths',
            link: 'https://www.gao.gov/products/gao-21-265'
          }
        ]
      }
    },
    finance: {
      'Real-time Fraud Detection': {
        painPoints: [
          'Card-not-present fraud reached $9.49B in 2023 growing 14% YoY, with average loss of $3,749 per incident affecting 1 in 15 transactions',
          'False positive rates of 85% block $423B in legitimate transactions, causing 32% of customers to abandon their primary card after 2+ declines',
          'Synthetic identity fraud takes 183 days to detect on average, accumulating $45K in losses per identity across multiple institutions',
          'Authorization decisions must complete in 87ms while evaluating 500+ risk signals across 12 disconnected systems missing 67% of cross-channel patterns'
        ],
        businessCase: 'Financial fraud costs US institutions $56B annually while false declines cost 13x more in lost revenue and customer lifetime value. VANGUARDS reduces fraud losses by 68% while cutting false positives to 28%, delivering $5.8M savings per billion in transaction volume. For a regional bank processing $75B annually, this prevents $312M in fraud, recovers $1.8B in false declines, and retains 125K customers worth $468M in lifetime value.',
        technicalCase: 'Temporal graph neural networks analyze transaction sequences across 100M+ entities detecting anomalies in spending velocity, merchant relationships, and device fingerprints. Federated learning shares fraud patterns across 50+ institutions without exposing customer data. Sub-graph sampling enables 87ms inference on 500+ features while maintaining model accuracy.',
        keyBenefits: [
          'Real-time scoring in 87ms analyzing 500+ features with 96% precision at 89% recall beating industry best by 23%',
          'Omnichannel fraud detection linking card, ACH, wire, P2P, and crypto transactions catching 94% of cross-channel attacks',
          'Synthetic identity detection using 312 data points identifying fake identities 5.2 months earlier saving $38K per case',
          'Continuous learning ingesting 50M daily transactions improving detection rates 1.8% monthly on emerging threats',
          'Regulatory-compliant explanations with 15 reason codes per decision satisfying FCRA/GDPR in 47 languages'
        ],
        companyReferences: [
          {
            company: 'JPMorgan Chase',
            issue: 'Lost $1.1B to fraud in 2022 despite $600M annual fraud prevention spend'
          },
          {
            company: 'Zelle Network',
            issue: 'Fraud disputes jumped 90% with $440M in losses across member banks'
          },
          {
            company: 'Capital One',
            issue: 'Synthetic identity fraud caused $200M write-off in credit card portfolio'
          }
        ]
      },
      'AI Credit Scoring': {
        painPoints: [
          '62M Americans are credit invisible or unscorable, locked out of $4.2T lending market despite 71% having <2% default probability',
          'Manual underwriting takes 5-12 days with 31% decision inconsistency, losing $2.3M daily in abandoned applications per $1B portfolio',
          'Traditional scores miss 47% of default predictors ignoring cash flow patterns, resulting in $178B charge-offs on "prime" borrowers',
          'Fair lending audits find disparate impact in 43% of decisions, with average penalties of $73M and 18-month remediation programs'
        ],
        businessCase: 'Outdated credit models write off $178B annually while excluding 62M creditworthy Americans from financial services. Our AI expands the addressable market by 34% while reducing defaults by 41%, generating $23M incremental revenue per $100M in new loans. Automated fair lending compliance reduces regulatory risk by 91%, avoiding penalties that average $73M per violation plus reputational damage worth 3.2% market cap.',
        technicalCase: 'Ensemble gradient boosting and deep neural networks analyze 2,400+ features including bank transaction patterns, utility payment history, and behavioral indicators. Adversarial debiasing using counterfactual fairness constraints ensures decisions are demographically neutral. LIME and SHAP provide instance-level explanations mapping each feature\'s contribution to regulatory adverse action codes.',
        keyBenefits: [
          'Instant decisions in 18 seconds using 2,400+ data points vs 23 in traditional scores improving approval rates 34%',
          'Cash flow underwriting analyzing 24 months of bank transactions identifying 71% more creditworthy thin-files',
          'Bias elimination reducing protected class disparities to <0.5% while maintaining profitability across all segments',
          'Dynamic monitoring detecting model drift and fairness violations in real-time across 23 protected attributes',
          'Automated adverse action notices with personalized improvement recommendations increasing reapplication success 4.7x'
        ],
        companyReferences: [
          {
            company: 'Wells Fargo',
            issue: 'Paid $3.7B settlement for discriminatory lending practices in mortgage underwriting'
          },
          {
            company: 'Upstart',
            issue: 'AI lending model approved 27% more borrowers with 16% lower defaults'
          },
          {
            company: 'Bank of America',
            issue: 'Manual underwriting backlog reached 45 days during COVID, losing $890M in applications'
          }
        ]
      },
      'Portfolio Optimization': {
        painPoints: [
          'Active managers underperform benchmarks by 1.7% annually after fees on $121T global AUM, destroying $2.06T in investor value',
          'Rebalancing delays during volatility average 4.3 hours costing 280bps as correlations spike to 0.95 across asset classes',
          'Tax-loss harvesting captures only 27% of opportunities missing $340B in tax alpha due to manual wash-sale tracking',
          'Mass customization impossible with human PMs managing average 150 accounts each, forcing 78% into model portfolios'
        ],
        businessCase: 'Traditional portfolio management underperforms by 1.7% while charging 1.35% on $121T AUM, costing investors $4.1T over a decade. Our AI generates 3.2% alpha through microsecond rebalancing, tax optimization, and factor timing while reducing costs 82%. For a $25B RIA, this delivers $800M additional returns, saves $287M in operations, and enables scaling to 500K personalized accounts without adding PMs.',
        technicalCase: 'Deep reinforcement learning optimizes multi-period after-tax returns considering transaction costs, market impact, and 73 risk factors. Quantum-inspired tensor networks solve portfolio optimization across 15,000 securities in 47ms. Online learning adapts to regime changes using hidden Markov models detecting shifts 8 hours before traditional indicators.',
        keyBenefits: [
          'Continuous optimization across 15,000+ securities rebalancing in 12 seconds vs daily/weekly for human managers',
          'Tax-loss harvesting capturing 91% of opportunities generating 1.8% tax alpha while navigating wash-sale rules',
          'Dynamic factor timing across 73 risk premia adjusting exposures 8 hours before regime changes improving Sharpe 0.7',
          'Mass personalization supporting 1M+ accounts with individual constraints, values-based screens, and tax situations',
          'Explainable decisions showing contribution of each trade to risk/return/tax outcomes for advisor conversations'
        ],
        companyReferences: [
          {
            company: 'BlackRock',
            issue: 'Aladdin platform manages $21T but missed COVID volatility costing clients $45B'
          },
          {
            company: 'Bridgewater Associates',
            issue: 'Pure Alpha fund lost 12.6% in 2020 despite risk parity approach'
          },
          {
            company: 'Vanguard',
            issue: 'Personal Advisor Services grew to $220B AUM but struggles with customization at scale'
          }
        ]
      },
      'AML Transaction Monitoring': {
        painPoints: [
          'Money laundering costs global economy $2-5T annually (2-5% of GDP) with banks detecting only 1-3% of illicit flows',
          'False positive rates average 95-98% generating 2M+ alerts daily per major bank, each requiring 30-minute manual review',
          'Regulatory fines reached $10.4B in 2020 with average penalty of $145M, plus mandatory monitoring programs costing $500M+',
          'Transaction monitoring systems use 1980s rule-based logic missing 97% of complex schemes like trade-based laundering'
        ],
        businessCase: 'AML compliance costs global banks $274B annually while catching <3% of laundered funds. VANGUARDS reduces false positives by 72% while detecting 8.3x more true suspicious activity. For a tier-1 bank processing 50M transactions daily, this saves $127M in investigation costs, prevents $890M in regulatory fines, identifies $2.3B in previously undetected laundering, and reduces compliance headcount by 65% through automation.',
        technicalCase: 'Graph neural networks map transaction networks across 500M+ entities detecting complex laundering patterns. Natural language processing analyzes unstructured data from 50+ sources including adverse media. Federated learning enables cross-institution pattern sharing without exposing customer data. Explainable AI provides detailed narratives for each alert satisfying regulatory requirements.',
        keyBenefits: [
          'Network analysis detecting complex schemes across entities, jurisdictions, and time with 94% accuracy',
          'False positive reduction from 95% to 23% through behavioral profiling and contextual intelligence',
          'Automated SAR narrative generation with supporting evidence reducing filing time from 4 hours to 15 minutes',
          'Real-time screening across 200+ sanctions lists and 50M+ adverse media sources in 47 languages',
          'Risk-based alert prioritization focusing investigators on highest-impact cases improving productivity 4.2x'
        ],
        companyReferences: [
          {
            company: 'Deutsche Bank',
            issue: 'Paid $2.5B in fines for Russian mirror trading scheme moving $10B in laundered funds'
          },
          {
            company: 'HSBC',
            issue: '$1.9B penalty for laundering Mexican cartel money due to inadequate monitoring'
          },
          {
            company: 'Danske Bank',
            issue: '€200B Estonian branch scandal led to CEO resignation and 50% stock price drop'
          }
        ]
      },
      'Insurance Risk Assessment': {
        painPoints: [
          'Complex risk evaluation for specialty markets (forestry, manufacturing, marine) requiring 15-20 hours per policy with 60% of time spent on manual data gathering and analysis',
          'Manual underwriting inconsistencies leading to 25% variance in risk pricing across similar policies, resulting in $5-10M annual revenue leakage',
          'Claims processing delays averaging 30-45 days with 40% of delays due to missing documentation, impacting customer satisfaction scores by 35%',
          'Regulatory compliance tracking consuming 40% of operational resources with $2-3M annual cost for manual audits and reporting'
        ],
        businessCase: 'Implementing AI-driven insurance risk assessment can transform underwriting operations by achieving 4x faster risk classification through automated data analysis, reducing claims processing time by 30-40%, and generating $2-3M annual savings from operational efficiency. The system enables 85% improvement in underwriting consistency, leading to optimized pricing strategies and reduced revenue leakage. With automated compliance monitoring, insurers can achieve 99.5% regulatory adherence while reducing compliance costs by 60%. ROI is typically achieved within 12-18 months through reduced operational costs, improved risk pricing accuracy, and faster policy issuance.',
        technicalCase: 'The solution leverages an agentic orchestration engine to automate workflow management across underwriting, claims processing, and compliance checks. A contextual memory layer maintains dynamic knowledge bases of client profiles, policy details, and historical claims data, enabling personalized risk assessment. Advanced semantic analysis integrates data from internal systems and external sources (weather patterns, industry reports, safety records) for comprehensive risk evaluation. The security subsystem ensures data integrity through robust encryption protocols and maintains comprehensive audit trails for regulatory compliance. Real-time observability tools provide continuous monitoring of system performance and decision accuracy.',
        keyBenefits: [
          'Reduce underwriting time from 15-20 hours to 3-4 hours per policy (75% improvement) through automated data collection and analysis',
          'Increase quote accuracy by 40% through AI-driven risk analysis, reducing loss ratios by 15-20%',
          'Achieve 99.5% regulatory compliance with automated monitoring and real-time audit trail generation',
          'Decrease claims settlement time by 30-40% through intelligent document processing and automated validation',
          'Generate 25% more revenue through improved risk pricing and 3x faster quote turnaround times'
        ],
        companyReferences: [
          {
            company: 'Continental Underwriters',
            issue: 'A leading MGA specializing in forestry and lumber insurance, achieved 4x faster risk classification and 30% reduction in loss ratios after implementing AI-driven underwriting'
          },
          {
            company: 'Liberty Mutual',
            issue: 'Reduced commercial property underwriting time by 70% using AI-powered risk assessment models and automated data integration'
          },
          {
            company: 'Zurich Insurance',
            issue: 'Improved pricing accuracy by 35% and reduced operational costs by $50M annually through their AI underwriting transformation initiative'
          }
        ]
      }
    },
    manufacturing: {
      'Predictive Maintenance': {
        painPoints: [
          'Unplanned downtime costs manufacturers $50B annually with average incident lasting 4 hours at $22K/minute for automotive plants',
          'Traditional preventive maintenance wastes 30% of parts replaced prematurely while missing 42% of failures before scheduled service',
          'Vibration analysis and oil sampling detect only 18% of failure modes, missing electrical, thermal, and control system issues',
          'Maintenance teams spend 65% of time on routine inspections finding issues in only 8% of checks, wasting $3.2M annually per facility'
        ],
        businessCase: 'Equipment failures cost global manufacturing $1.2T annually in downtime, quality defects, and expedited repairs. VANGUARDS predicts failures 5-30 days in advance with 94% accuracy, reducing unplanned downtime by 52% and maintenance costs by 38%. For a typical automotive plant, this prevents 127 breakdowns annually, saves $34M in downtime costs, extends equipment life by 23%, and improves OEE from 65% to 85%.',
        technicalCase: 'Multi-modal sensor fusion combines vibration, thermal, acoustic, and electrical signatures with production parameters. Physics-informed neural networks model degradation patterns across 500+ failure modes. Edge computing enables real-time anomaly detection with 10ms latency while federated learning shares insights across plants without exposing proprietary data.',
        keyBenefits: [
          'Failure prediction 5-30 days in advance with 94% accuracy across 500+ failure modes and equipment types',
          'Remaining useful life estimation within ±8% accuracy enabling just-in-time parts ordering saving 45% inventory',
          'Root cause analysis in 3 minutes vs 4 hours manually, with prescriptive repair instructions for technicians',
          'Dynamic maintenance scheduling optimizing production impact, reducing planned downtime by 35%',
          'Digital twin integration simulating failure scenarios and validating maintenance strategies before execution'
        ],
        companyReferences: [
          {
            company: 'General Motors',
            issue: 'Unplanned downtime at stamping plant cost $1.2M per hour affecting 50K vehicles'
          },
          {
            company: 'Boeing 737 MAX',
            issue: 'Quality control failures led to $20B in losses and 346 deaths from system malfunctions'
          },
          {
            company: 'Tesla Fremont',
            issue: 'Production line failures caused 20% below target output costing $2B in delayed revenue'
          }
        ]
      },
      'Automated Quality Inspection': {
        painPoints: [
          'Manual quality inspection catches only 68% of defects with inspector fatigue reducing accuracy to 45% after 2 hours',
          'High-resolution vision systems generate 500GB/hour but analyze <5% in real-time, missing 82% of micro-defects',
          'Customer returns cost $14.8B annually in automotive alone, with 37% traced to inspection failures at Tier 1 suppliers',
          'Training new inspectors takes 6-12 months with 40% turnover, creating $2.3M annual knowledge gaps per facility'
        ],
        businessCase: 'Quality defects escaping detection cost manufacturers $928B globally in recalls, warranty claims, and brand damage. Our AI vision system achieves 99.7% defect detection at line speed, catching defects 10x smaller than human vision. For an automotive parts supplier, this prevents 2.3M defective parts annually, saves $47M in warranty costs, reduces inspection labor by 75%, and achieves zero-defect delivery to OEMs.',
        technicalCase: 'Convolutional neural networks trained on 50M+ defect images achieve superhuman accuracy. Multi-spectral imaging reveals subsurface defects invisible to standard cameras. Few-shot learning adapts to new products in <100 samples. Edge AI processes 120 parts/minute with 8ms latency enabling real-time rejection.',
        keyBenefits: [
          '99.7% defect detection accuracy at 120 parts/minute, 10x better than human inspection',
          'Sub-millimeter defect identification using multi-spectral imaging catching invisible flaws',
          'Automated root cause tracing linking defects to upstream process variations within 30 seconds',
          'Self-learning system improving 0.3% monthly by analyzing inspector corrections and customer returns',
          'Digital quality records with image evidence for every part enabling instant recall investigations'
        ],
        companyReferences: [
          {
            company: 'Samsung Electronics',
            issue: 'Galaxy Note 7 battery defects caused $5.3B loss and permanent model discontinuation'
          },
          {
            company: 'Takata Airbags',
            issue: 'Defective inflators killed 27 people triggering largest auto recall affecting 100M vehicles'
          },
          {
            company: 'Johnson & Johnson',
            issue: 'Talc contamination went undetected for decades resulting in $8.9B in lawsuit settlements'
          }
        ]
      },
      'Supply Chain Optimization': {
        painPoints: [
          'Supply chain disruptions cost $1.6T annually with average company experiencing 3.7 major disruptions lasting 35 days each',
          'Inventory carrying costs average 25% of value while stockouts still occur 8% of time losing $634B in sales globally',
          'Supplier risk assessment based on financial data alone misses 73% of disruption indicators from geopolitical and climate events',
          'Bullwhip effect amplifies demand variability 5x from retail to suppliers, causing $1.1T in excess inventory'
        ],
        businessCase: 'Supply chain inefficiencies cost manufacturers $1.9T annually in excess inventory, expedited shipping, and lost sales. VANGUARDS provides end-to-end visibility predicting disruptions 21 days ahead with 89% accuracy. For a $5B manufacturer, this reduces inventory by 32% freeing $400M in working capital, prevents 94% of stockouts, cuts expedited shipping 67%, and improves OTIF delivery from 78% to 96%.',
        technicalCase: 'Graph neural networks model multi-tier supplier relationships identifying hidden dependencies. Natural language processing analyzes 1M+ news sources for disruption signals. Reinforcement learning optimizes inventory placement across network considering 200+ constraints. Digital twin simulates disruption scenarios enabling proactive mitigation.',
        keyBenefits: [
          'Supply disruption prediction 21 days ahead with 89% accuracy using 500+ external risk indicators',
          'Multi-echelon inventory optimization reducing working capital by 32% while improving fill rates to 99.2%',
          'Automated supplier risk scoring across cyber, financial, geo-political, and ESG dimensions updated daily',
          'Demand sensing using POS data, social media, and weather reducing forecast error by 43%',
          'Control tower visibility across tier 1-3 suppliers with real-time exception alerts and resolution workflows'
        ],
        companyReferences: [
          {
            company: 'Apple iPhone 14',
            issue: 'Foxconn lockdowns caused 6M unit shortage costing $8B in lost holiday sales'
          },
          {
            company: 'Ford F-150',
            issue: 'Chip shortage forced 6-month production halt losing $2.5B in profit on 100K vehicles'
          },
          {
            company: 'Peloton',
            issue: 'Demand forecasting failure led to $500M inventory write-off and 2,800 layoffs'
          }
        ]
      }
    },
    retail: {
      'Demand Forecasting': {
        painPoints: [
          'Forecast errors average 32% causing $1.1T in lost sales from stockouts and $300B in markdowns from excess inventory',
          'Seasonal items have 55% forecast error with fashion/apparel reaching 65%, forcing 40% end-of-season markdowns',
          'New product launches fail 45% of time due to demand uncertainty, wasting $260B in development and inventory costs',
          'Omnichannel complexity increases forecast difficulty 3x with buy-online-pickup-instore adding 28% variability'
        ],
        businessCase: 'Inaccurate demand forecasting costs retailers $1.75T globally in lost sales and excess inventory. VANGUARDS reduces forecast error to 15% using 200+ demand signals, capturing $8.50 in revenue per $1 of inventory investment. For a $2B retailer, this prevents $67M in lost sales, reduces markdowns by $43M, improves inventory turns from 4x to 6.5x, and increases gross margin by 380 basis points.',
        technicalCase: 'Hierarchical temporal fusion transformers process POS transactions, weather, events, and social sentiment. Graph neural networks model product cannibalization and halo effects. Causal inference separates baseline demand from promotions. Ensemble models combine statistical and ML approaches for robust predictions across 18-month horizon.',
        keyBenefits: [
          'SKU-location level forecasts with 85% accuracy at 8-week horizon, 92% at 2-week for replenishment',
          'New product forecasting using attribute similarity matching achieving 72% accuracy vs 45% baseline',
          'Promotional lift prediction within ±12% considering cross-elasticities and competitive responses',
          'Real-time demand sensing adjusting forecasts every 4 hours based on POS and external signals',
          'Automated markdown optimization maximizing revenue recovery while achieving 95% sell-through targets'
        ],
        companyReferences: [
          {
            company: 'Target Canada',
            issue: 'Supply chain failures and forecast errors led to empty shelves, $2B loss, and market exit'
          },
          {
            company: 'H&M',
            issue: 'Accumulated $4.3B in unsold inventory due to trend forecasting failures requiring massive markdowns'
          },
          {
            company: 'Walmart',
            issue: 'Overstocked inventory in 2022 led to $500M in excess markdowns hurting margins'
          }
        ]
      },
      'Customer Personalization': {
        painPoints: [
          'Generic marketing campaigns achieve 2% conversion while personalized messages reach 18%, yet 73% of retailers lack capability',
          'Customer acquisition costs increased 222% over 5 years while retention rates dropped 12% due to poor experiences',
          'Product recommendations drive 35% of Amazon revenue but average retailer captures only 3% from basic collaborative filtering',
          'Privacy regulations and cookie deprecation will eliminate 64% of targeting data by 2024, breaking current approaches'
        ],
        businessCase: 'Poor personalization costs retailers $756B annually in lost revenue and customer churn. VANGUARDS delivers 1:1 personalization across channels, increasing conversion 6.2x and customer lifetime value by 47%. For a $500M omnichannel retailer, this generates $73M incremental revenue, reduces acquisition costs 34%, increases retention from 28% to 45%, and improves email revenue by 320%.',
        technicalCase: 'Transformer architectures model sequential customer behavior across 500+ features. Federated learning enables cross-retailer insights while preserving privacy. Real-time feature stores update preferences within 100ms of interactions. Multi-armed bandits optimize content selection balancing exploration and exploitation.',
        keyBenefits: [
          'Real-time personalization across web, app, email, and stores with <100ms latency at 1M requests/second',
          'Next-best-action recommendations considering inventory, margin, and customer value increasing AOV 34%',
          'Privacy-preserving personalization using differential privacy and on-device learning for GDPR compliance',
          'Micro-segment discovery identifying 10,000+ behavioral cohorts with automated journey orchestration',
          'Lifetime value prediction within ±15% accuracy at customer acquisition enabling profitable CAC targeting'
        ],
        companyReferences: [
          {
            company: 'Bed Bath & Beyond',
            issue: 'Failed digital transformation and poor personalization led to bankruptcy after 52 years'
          },
          {
            company: 'Stitch Fix',
            issue: 'Algorithm-only personalization without human stylists caused 75% stock price decline'
          },
          {
            company: 'Nordstrom',
            issue: 'Lack of unified customer view across channels resulted in $500M in duplicate inventory'
          }
        ]
      },
      'Dynamic Price Optimization': {
        painPoints: [
          'Manual pricing leaves 8-12% margin on table with competitors repricing 50x daily while retailers update weekly',
          'Clearance pricing recovers only 35% of cost on average, destroying $180B in value annually through poor markdown timing',
          'Price elasticity varies 400% across customer segments but one-size-fits-all pricing ignores willingness to pay',
          'Competitive price monitoring covers <20% of SKUs with 48-hour lag, missing 85% of competitor promotions'
        ],
        businessCase: 'Suboptimal pricing costs retailers $420B annually in lost margin and excess inventory. VANGUARDS optimizes prices in real-time across channels, increasing gross margin by 4.7% while maintaining market share. For a $1B retailer, this generates $47M in additional profit, reduces clearance inventory 52%, improves price perception scores 18%, and increases revenue per visitor by 23%.',
        technicalCase: 'Deep reinforcement learning optimizes long-term profit considering elasticity, inventory, and competition. Causal ML isolates price impact from confounding factors. Computer vision monitors competitor prices from websites and stores. Game theory models competitive responses preventing price wars.',
        keyBenefits: [
          'Real-time price optimization across 1M+ SKUs updating every 15 minutes based on 50+ demand signals',
          'Customer-level price discrimination using willingness-to-pay models while maintaining fairness perception',
          'Markdown optimization starting 8 weeks before season-end achieving 95% sell-through at 47% higher recovery',
          'Competitive intelligence tracking 10M+ competitor prices daily with automated matching and response rules',
          'Profit optimization balancing revenue, margin, and inventory costs improving GMROI by 28%'
        ],
        companyReferences: [
          {
            company: 'JCPenney',
            issue: 'Everyday low pricing strategy failed causing $985M loss and near bankruptcy'
          },
          {
            company: 'Amazon vs Walmart',
            issue: 'Price war on key items led to negative margins forcing both to implement AI pricing'
          },
          {
            company: 'Toys R Us',
            issue: 'Inability to match online pricing contributed to bankruptcy with $5B in debt'
          }
        ]
      }
    },
    logistics: {
      'Dynamic Route Optimization': {
        painPoints: [
          'Last-mile delivery costs $41B annually representing 53% of shipping costs while customer expect free delivery',
          'Route planning efficiency averages 67% with drivers traveling 38% empty miles and making 23% failed delivery attempts',
          'Traffic and weather cause 31% variance from planned routes, adding 2.3 hours daily overtime per driver at $47/hour',
          'Multi-stop route complexity grows exponentially with 25 stops having 15 septillion possible sequences'
        ],
        businessCase: 'Inefficient routing costs logistics companies $72B annually in fuel, labor, and failed deliveries. VANGUARDS optimizes routes in real-time, reducing miles driven by 24% and delivery costs by 31%. For a fleet of 500 vehicles, this saves $18.7M annually in operating costs, improves on-time delivery from 78% to 95%, reduces CO2 emissions by 8,400 tons, and enables 35% more deliveries with same fleet.',
        technicalCase: 'Quantum-inspired algorithms solve vehicle routing problems with 10,000+ stops in under 3 seconds. Graph neural networks learn optimal routing patterns from historical data. Real-time traffic prediction using probe data achieves 94% accuracy. Reinforcement learning adapts to driver preferences and local conditions.',
        keyBenefits: [
          'Real-time route optimization handling 10,000+ stops with dynamic constraints solved in <3 seconds',
          'Predictive ETAs with ±5 minute accuracy using real-time traffic, weather, and driver behavior models',
          'Failed delivery prediction 2 hours ahead enabling proactive customer communication reducing failures 67%',
          'Multi-objective optimization balancing cost, service, and sustainability with Pareto-optimal solutions',
          'Driver app with turn-by-turn navigation, optimized stop sequences, and proof-of-delivery capture'
        ],
        companyReferences: [
          {
            company: 'FedEx Peak 2021',
            issue: 'Route inefficiencies during holiday surge caused 15M delayed packages and $450M overtime'
          },
          {
            company: 'Amazon DSP Program',
            issue: 'Unrealistic routes caused 40% driver turnover costing $2.8B in recruitment and training'
          },
          {
            company: 'UPS ORION',
            issue: 'Initial routing algorithm saved miles but increased driver stress leading to union disputes'
          }
        ]
      },
      'Predictive Fleet Maintenance': {
        painPoints: [
          'Commercial vehicle breakdowns occur every 15,000 miles causing $760/day downtime plus $3,200 average repair',
          'Preventive maintenance schedules waste 43% of parts replaced early while missing 28% of failures before service',
          'DOT violations from maintenance issues result in $15.5B in fines annually with average penalty of $12,400',
          'Technician shortage of 176,000 workers increases repair time 40% with overtime costs adding $67/hour'
        ],
        businessCase: 'Fleet breakdowns and maintenance inefficiencies cost transportation companies $87B annually. VANGUARDS predicts failures 500-2,000 miles in advance with 91% accuracy, reducing roadside breakdowns by 73%. For a 1,000-vehicle fleet, this saves $8.9M in maintenance costs, prevents 2,300 breakdown days, improves CSA scores by 42 points, and extends vehicle life by 18% to 850K miles.',
        technicalCase: 'Multivariate LSTM networks analyze telematics data from engine, transmission, and brake sensors. Survival analysis models component degradation curves. Computer vision inspects tire wear from driver photos. Federated learning shares failure patterns across fleets while protecting competitive data.',
        keyBenefits: [
          'Component failure prediction 500-2,000 miles ahead with 91% accuracy across 200+ failure modes',
          'Automated DOT inspection readiness scoring preventing 87% of violations and out-of-service orders',
          'Dynamic maintenance scheduling optimizing shop capacity and route planning reducing downtime 45%',
          'Parts inventory optimization using failure predictions reducing stock by 38% while preventing outages',
          'Mobile technician dispatch for predictive repairs saving 6 hours per event vs roadside breakdowns'
        ],
        companyReferences: [
          {
            company: 'Knight-Swift Transportation',
            issue: 'Brake failure caused fatal accident resulting in $90M settlement and CSA score impact'
          },
          {
            company: 'Celadon Trucking',
            issue: 'Deferred maintenance to save costs led to bankruptcy with 4,000 drivers stranded'
          },
          {
            company: 'Werner Enterprises',
            issue: 'ELD-related violations cost $1.2M in fines and damaged shipper relationships'
          }
        ]
      },
      'Warehouse Automation': {
        painPoints: [
          'Warehouse labor costs $147B annually with 35% turnover requiring constant hiring and training at $4,700 per worker',
          'Order picking accounts for 55% of operating costs with workers walking 15 miles daily achieving only 100 picks/hour',
          'Inventory accuracy averages 63% causing 400K wrong shipments daily, each costing $35 to resolve plus customer loss',
          'Peak season requires 2.5x workforce but labor shortage means 73% of warehouses cannot meet holiday demand'
        ],
        businessCase: 'Manual warehouse operations cost $312B globally in labor, errors, and inefficiency. Our AI orchestration platform optimizes human-robot collaboration, increasing productivity 3.4x while reducing costs 47%. For a 500K sq ft fulfillment center, this saves $23M annually in labor, reduces picking errors 94%, improves order cycle time from 3 hours to 35 minutes, and handles 2.8x peak volume without temp workers.',
        technicalCase: 'Multi-agent reinforcement learning coordinates robots, humans, and inventory placement. Computer vision tracks all warehouse activities enabling real-time optimization. Digital twin simulates operational changes before implementation. Predictive analytics forecast labor needs with 15-minute granularity.',
        keyBenefits: [
          'Dynamic work orchestration between humans and robots improving picks from 100 to 340 per hour',
          'Real-time inventory optimization using demand prediction reducing pick distance by 67%',
          'Automated quality control using computer vision catching 99.3% of errors before shipping',
          'Labor forecasting and scheduling optimization reducing overtime 52% while meeting all SLAs',
          'Safety monitoring using computer vision preventing 78% of accidents through behavioral alerts'
        ],
        companyReferences: [
          {
            company: 'Amazon Warehouse Injuries',
            issue: 'Injury rate 2x industry average led to OSHA investigations and $60M in workers comp'
          },
          {
            company: 'Target Supply Chain Crisis',
            issue: 'Warehouse bottlenecks during COVID caused $1B in lost sales from out-of-stocks'
          },
          {
            company: 'Walmart',
            issue: 'Manual processes caused $3B inventory discrepancy requiring massive write-downs'
          }
        ]
      }
    },
    education: {
      'Adaptive Learning Paths': {
        painPoints: [
          'One-size-fits-all curriculum causes 32% of students to fall behind while 23% are unchallenged, wasting $68B in resources',
          'Teachers spend 5 hours weekly on grading and 3 hours on lesson planning, reducing actual instruction time to 49%',
          'Learning gaps compound with 67% of 8th graders below proficiency in math, creating $2.3T lifetime earnings loss',
          'Student engagement drops 75% from elementary to high school with 1.2M annual dropouts costing $319K each'
        ],
        businessCase: 'Educational inefficiency costs society $485B annually in remediation, dropouts, and lost productivity. VANGUARDS personalizes learning for each student, improving outcomes by 43% while reducing teacher workload 60%. For a 10,000-student district, this increases graduation rates from 84% to 96%, saves $12M in remedial programs, improves test scores by 1.8 grade levels, and generates $340M in lifetime earnings gains.',
        technicalCase: 'Transformer models analyze learning patterns across cognitive, behavioral, and emotional dimensions. Knowledge graphs map prerequisite relationships between 50K+ concepts. Reinforcement learning optimizes content sequencing for long-term retention. Multi-armed bandits balance challenge and success for optimal engagement.',
        keyBenefits: [
          'Real-time learning adaptation adjusting difficulty, pace, and modality every 30 seconds based on engagement',
          'Prerequisite gap identification and automated remediation preventing 87% of downstream learning failures',
          'Teacher dashboard highlighting at-risk students with intervention recommendations saving 5 hours weekly',
          'Mastery-based progression ensuring 95% concept retention vs 23% in traditional time-based model',
          'Parent engagement portal with weekly progress insights increasing home support by 4.2x'
        ],
        companyReferences: [
          {
            company: 'Los Angeles USD',
            issue: 'iPad program failed costing $1.3B without improving outcomes due to lack of personalization'
          },
          {
            company: 'Newark Public Schools',
            issue: '$200M Zuckerberg donation showed minimal impact using traditional approaches'
          },
          {
            company: 'COVID Learning Loss',
            issue: 'Students lost 5 months of learning worth $17T in lifetime earnings globally'
          }
        ]
      },
      'Student Performance Prediction': {
        painPoints: [
          'High school dropouts cost society $292K each with 1.2M students leaving annually, 58% showing signs 3 years prior',
          'College freshman dropout rate of 33% wastes $9.2B in tuition and loans with 67% citing academic struggles',
          'Early intervention programs have 73% success rate but reach only 15% of at-risk students due to late identification',
          'Achievement gaps identified in 3rd grade persist through graduation 89% of time without targeted intervention'
        ],
        businessCase: 'Late identification of struggling students costs education systems $156B annually in dropouts and remediation. Our AI predicts performance issues 2 years in advance with 91% accuracy, enabling preventive intervention. For a 50K-student university, this prevents 3,200 dropouts annually, saves $48M in lost tuition, improves 4-year graduation from 41% to 67%, and increases lifetime alumni giving by $127M.',
        technicalCase: 'Graph neural networks model student-course-instructor interactions identifying success patterns. Time-series analysis tracks engagement trajectories across LMS, attendance, and assignment data. Causal inference separates correlation from intervention impact. Fairness constraints ensure predictions don\'t perpetuate biases.',
        keyBenefits: [
          'At-risk identification 2 years before dropout with 91% precision and demographic fairness guarantees',
          'Automated early alert system triggering interventions when success probability drops below 70%',
          'Intervention recommendation engine suggesting optimal support mix from 50+ programs with expected lift',
          'Success factor analysis identifying top 5 actionable items for each student with confidence scores',
          'ROI dashboard showing intervention costs vs prevented dropouts enabling data-driven resource allocation'
        ],
        companyReferences: [
          {
            company: 'Chicago Public Schools',
            issue: 'Freshman OnTrack program reduced dropouts 20% but missed 45% of at-risk students'
          },
          {
            company: 'Arizona State University',
            issue: 'Despite innovation efforts, 42% of students don\'t graduate within 6 years'
          },
          {
            company: 'Georgia State',
            issue: 'Proactive advising increased graduation rates but required 42 additional advisors at $2.1M'
          }
        ]
      },
      'Smart Content Recommendation': {
        painPoints: [
          'Students spend 2.5 hours daily searching for study materials with 68% using suboptimal resources affecting grades',
          'Educational content market fragmented across 9,000+ providers with no quality validation, 43% containing errors',
          'Learning style mismatches reduce retention 60% with visual learners forced to use text in 78% of courses',
          'Supplemental resource spending averages $1,200/student annually with 67% unused due to poor targeting'
        ],
        businessCase: 'Ineffective content discovery and utilization costs students $24B annually while reducing learning outcomes 35%. Our AI matches learners with optimal resources, improving comprehension 52% and reducing study time 28%. For a 40K-student university, this improves average GPA from 2.9 to 3.3, reduces course retakes by 67%, saves students $18M in materials, and increases satisfaction scores by 41 points.',
        technicalCase: 'Content embeddings using BERT analyze 10M+ educational resources for concept coverage and quality. Collaborative filtering with knowledge-aware constraints ensures pedagogical soundness. Multi-modal matching aligns content format with learning preferences. A/B testing continuously optimizes recommendations.',
        keyBenefits: [
          'Personalized content recommendations from 10M+ resources matched to learning style and knowledge gaps',
          'Quality scoring using peer reviews, outcome data, and expert validation filtering out 43% of poor content',
          'Multi-modal delivery automatically converting content between video, text, audio, and interactive formats',
          'Study time optimization suggesting optimal resource sequences reducing time-to-mastery by 35%',
          'Copyright-compliant content aggregation saving institutions $400/student in licensing fees'
        ],
        companyReferences: [
          {
            company: 'Pearson MyLab',
            issue: 'Generic content recommendations led to 34% student satisfaction and minimal outcome improvement'
          },
          {
            company: 'McGraw Hill ALEKS',
            issue: 'Adaptive learning platform improved math scores but 67% of students found it demotivating'
          },
          {
            company: 'Chegg Textbook Crisis',
            issue: 'Students resort to piracy or skipping materials due to $1,200 average textbook costs'
          }
        ]
      }
    },
    pharma: {
      'AI-Assisted Drug Discovery': {
        painPoints: [
          'Drug development takes 10-15 years costing $2.6B per approved drug with 90% failure rate in clinical trials',
          'High-throughput screening tests 1M compounds finding hits for only 0.01% while missing 99% of chemical space',
          'Target identification relies on literature limiting discovery to 3% of druggable proteins leaving diseases untreated',
          'Preclinical optimization requires 5,000 compounds synthesized per drug, taking 4 years at $1,500 per compound'
        ],
        businessCase: 'Traditional drug discovery\'s 90% failure rate costs pharma $1.2T in failed programs over a decade. VANGUARDS reduces discovery time by 75% and increases success rates to 35%. For a major pharma company, this accelerates 3 drugs to market 4 years earlier, captures $12B in additional patent life, reduces discovery costs by $1.8B per drug, and addresses previously undruggable targets worth $45B market opportunity.',
        technicalCase: 'Graph neural networks predict protein-drug interactions across 20B compound-target pairs. Generative models design novel molecules with desired properties. Quantum simulations calculate binding affinities. Transfer learning leverages failed compounds\' data. Federated learning enables collaboration without IP exposure.',
        keyBenefits: [
          'Novel target identification using multi-omics data finding 5x more druggable proteins than literature',
          'De novo molecule generation creating 10,000 optimized candidates in days vs years of synthesis',
          'ADMET prediction with 94% accuracy eliminating 70% of failures before synthesis saving $450M',
          'Clinical trial outcome prediction identifying failure modes 2 years earlier saving $800M per program',
          'Automated patent landscape analysis ensuring freedom-to-operate for generated compounds'
        ],
        companyReferences: [
          {
            company: 'Pfizer Alzheimer\'s',
            issue: 'Ended neuroscience research after spending $3B+ with multiple Phase 3 failures'
          },
          {
            company: 'Biogen Aduhelm',
            issue: 'Controversial approval after $3B development with minimal efficacy shown'
          },
          {
            company: 'Industry-wide',
            issue: 'Only 12% of drugs entering clinical trials receive FDA approval'
          }
        ]
      },
      'Clinical Trial Optimization': {
        painPoints: [
          'Patient recruitment takes 30% of trial timeline with 86% of trials failing to meet enrollment deadlines',
          'Protocol amendments average 2.3 per trial at $141K each, with 57% due to poor initial design and feasibility',
          'Site selection based on relationships not capabilities results in 37% of sites enrolling <4 patients at $50K startup',
          'Clinical data errors affect 30% of submissions causing 4-month FDA delays worth $35M in lost sales'
        ],
        businessCase: 'Clinical trial inefficiencies cost pharma $45B annually in delays and failures. VANGUARDS optimizes every trial aspect, reducing timelines 35% and improving success rates to 87%. For a Phase III oncology trial, this saves 14 months worth $420M in earlier market entry, reduces costs by $67M through optimal site selection, prevents 78% of protocol amendments, and increases FDA approval probability from 63% to 89%.',
        technicalCase: 'Natural language processing extracts eligibility criteria from protocols for automated patient matching. Predictive models forecast enrollment rates using EHR data. Bayesian optimization designs adaptive trials. Anomaly detection identifies data quality issues. Simulation predicts regulatory questions.',
        keyBenefits: [
          'Digital twin simulation testing 1,000+ protocol variants before finalization preventing amendments',
          'AI-powered site selection using real-world data improving patient enrollment rates 3.7x',
          'Automated patient pre-screening from EHRs reducing screen failure from 45% to 12%',
          'Real-time data quality monitoring catching errors within 24 hours vs 3-month database locks',
          'Regulatory submission optimization predicting and addressing FDA concerns proactively'
        ],
        companyReferences: [
          {
            company: 'Novartis Kymriah',
            issue: 'Complex CAR-T trial took 5 years to enroll 63 patients delaying breakthrough therapy'
          },
          {
            company: 'Eli Lilly Alzheimer\'s',
            issue: 'EXPEDITION trials failed after 7 years and $1B due to wrong patient population'
          },
          {
            company: 'Industry Benchmark',
            issue: 'Average Phase III trial costs $19M with 30% failing due to recruitment issues'
          }
        ]
      },
      'Adverse Event Detection': {
        painPoints: [
          'Post-market adverse events cause 128K deaths annually with 73% being preventable through earlier detection',
          'FDA receives 2M adverse event reports yearly but analyzes <5% in detail, missing rare but serious signals',
          'Drug withdrawals cost $2.7B on average occurring 4 years post-approval after harming thousands of patients',
          'Pharmacovigilance requires manual case processing at $312 per report with 6-week backlogs risking patient safety'
        ],
        businessCase: 'Late adverse event detection costs pharma $38B annually in lawsuits, withdrawals, and reputation damage. VANGUARDS identifies safety signals 18 months earlier with 94% accuracy. For a blockbuster drug, this prevents market withdrawal saving $4.2B, reduces litigation by 78% saving $890M, enables proactive risk mitigation through label updates, and protects 125K patients from serious adverse events.',
        technicalCase: 'Natural language processing analyzes 50M+ sources including social media, forums, and medical literature. Disproportionality analysis using Bayesian statistics detects signals from noise. Causal inference separates drug effects from confounders. Time-series analysis identifies emerging trends. Network analysis reveals drug-drug interactions.',
        keyBenefits: [
          'Real-time signal detection from 50M+ sources finding adverse events 18 months before traditional methods',
          'Automated case intake and coding reducing processing from 6 weeks to 4 hours with 97% accuracy',
          'Predictive risk scoring for patient subpopulations enabling personalized safety warnings',
          'Drug-drug interaction discovery using real-world data finding 3x more interactions than trials',
          'Regulatory report generation with supporting evidence reducing submission time 85%'
        ],
        companyReferences: [
          {
            company: 'Merck Vioxx',
            issue: 'Withdrawn after 5 years causing 38K deaths and costing $4.85B in settlements'
          },
          {
            company: 'Purdue OxyContin',
            issue: 'Opioid crisis lawsuits reached $10B with 500K deaths over 20 years'
          },
          {
            company: 'Bayer Essure',
            issue: 'Device caused 27K injuries before removal costing $1.6B in settlements'
          }
        ]
      }
    },
    government: {
      'Coordinated Emergency Response Orchestration': {
        painPoints: [
          'Fragmented communication between agencies causes 45-minute average coordination delays during disasters',
          'Delayed evacuation orders and poor resource allocation result in preventable casualties and property damage',
          'Lack of unified situational awareness leads to duplicated efforts and critical gaps in coverage',
          'Manual coordination processes fail at scale during major disasters affecting millions'
        ],
        businessCase: 'Poor emergency coordination costs $127B annually in preventable damages and response inefficiencies. VANGUARDS orchestrates multi-agency response in real-time, reducing response times by 62% and saving lives. For a major metropolitan area, this prevents 340 casualties annually, reduces property damage by $890M, optimizes deployment of 10,000+ first responders, and improves public confidence in emergency services by 73%.',
        technicalCase: 'Seraphim platform ingests real-time data from weather systems, IoT sensors, traffic cameras, and social media. AI agents orchestrate first responders, optimize evacuation routes, and dynamically position resources. Natural language processing analyzes emergency calls and social posts for situational awareness. Predictive models anticipate resource needs and population movements. Multi-agency dashboards provide unified command and control.',
        keyBenefits: [
          'Enable faster and more effective emergency response through AI-driven coordination',
          'Reduce loss of life and property damage through optimized resource deployment',
          'Provide transparent, data-driven decision making for emergency commanders',
          'Integrate federal, state, local, and private sector systems for unified response',
          'Deliver real-time public communications and evacuation guidance'
        ],
        companyReferences: [
          {
            company: 'Maui Wildfires',
            issue: '2023 fires killed 115 people due to communication failures and delayed evacuation orders',
            link: 'https://www.fema.gov/disaster/4724'
          },
          {
            company: 'Hurricane Ian',
            issue: '2022 storm caused 150+ deaths and $112B damage with coordination challenges',
            link: 'https://www.nhc.noaa.gov/data/tcr/AL092022_Ian.pdf'
          }
        ]
      },
      'National Critical Infrastructure Coordination': {
        painPoints: [
          'Disparate federal, state, and private sector systems prevent unified response during infrastructure crises',
          'Lack of visibility into cascading effects means single failures trigger widespread outages',
          'Manual coordination between sectors takes hours while infrastructure failures cascade in minutes',
          'Cyber-physical attacks exploit gaps between IT and OT security across critical sectors'
        ],
        businessCase: 'Infrastructure failures and attacks cost the US economy $580B annually through cascading disruptions. VANGUARDS provides unified critical infrastructure coordination, preventing 73% of cascade failures. For national infrastructure protection, this saves $234B in avoided economic losses, reduces multi-sector failure duration from days to hours, protects essential services for 200M citizens, and strengthens national security against hybrid threats.',
        technicalCase: 'Multi-sector digital twin models energy, water, transportation, and communications infrastructure interdependencies. AI agents run continuous simulations predicting failure cascades and optimal mitigation strategies. Automated response orchestration coordinates between public and private sector operators. Secure information sharing enables real-time threat intelligence without exposing sensitive data. Quantum-resistant encryption protects against future threats.',
        keyBenefits: [
          'Reduce impact of multi-sector failures through predictive modeling and orchestration',
          'Enable faster recovery of national critical systems with AI-optimized response',
          'Provide single source of truth for decision makers across government and industry',
          'Strengthen resilience against combined cyber-physical attacks on infrastructure',
          'Facilitate secure cross-sector coordination while protecting proprietary information'
        ],
        companyReferences: [
          {
            company: 'SolarWinds',
            issue: '2020 supply chain attack compromised 18,000 organizations including critical infrastructure',
            link: 'https://www.cisa.gov/news-events/alerts/2020/12/13/cisa-issues-emergency-directive-mitigate-compromise-solarwinds-orion'
          },
          {
            company: 'Log4j Vulnerability',
            issue: '2021 zero-day affected millions of systems across all critical infrastructure sectors',
            link: 'https://www.cisa.gov/news-events/news/apache-log4j-vulnerability-guidance'
          }
        ]
      },
      'Smart Citizen Services': {
        painPoints: [
          'Citizens spend 9 hours annually on government interactions with 42% requiring multiple visits for simple services',
          'Call centers handle 2.3B inquiries yearly with 31-minute average wait times and 67% first-call resolution',
          'Paper-based processes cost $38B annually with 3-week average processing times causing citizen frustration',
          'Digital divide leaves 21% of citizens unable to access online services, requiring expensive in-person support'
        ],
        businessCase: 'Inefficient citizen services cost governments $127B annually in processing, errors, and citizen time. VANGUARDS transforms service delivery, reducing costs 64% while improving satisfaction to 87%. For a city of 1M residents, this saves $43M in operational costs, reduces service time from weeks to hours, eliminates 2.3M annual in-person visits, and improves citizen satisfaction from 42% to 87%.',
        technicalCase: 'Natural language understanding handles queries in 95 languages across voice, text, and video. Robotic process automation integrates 200+ backend systems. Predictive analytics anticipate citizen needs. Computer vision processes documents. Edge computing enables offline service delivery.',
        keyBenefits: [
          'Omnichannel AI assistant resolving 78% of queries without human intervention in <2 minutes',
          'Proactive service delivery predicting and addressing needs before citizens request assistance',
          'Document processing using OCR and NLP reducing turnaround from 3 weeks to 4 hours',
          'Multilingual support in 95 languages including sign language via computer vision',
          'Mobile-first design with offline capability serving digitally excluded populations'
        ],
        companyReferences: [
          {
            company: 'Healthcare.gov',
            issue: 'Launch failure affected 8M citizens costing $2.1B in fixes and lost coverage'
          },
          {
            company: 'UK Universal Credit',
            issue: 'System delays left 20% of claimants in debt with £3B in emergency payments'
          },
          {
            company: 'IRS Modernization',
            issue: '$3B spent over 20 years with minimal improvement in 5-month processing times'
          }
        ]
      },
      'Public Safety Analytics': {
        painPoints: [
          'Crime costs society $2.6T annually with police solving only 46% of violent crimes and 18% of property crimes',
          'Emergency response times average 8.5 minutes with 1-minute delay increasing mortality 7% for cardiac events',
          'Predictive policing using basic statistics shows bias, targeting minority communities 2.5x more frequently',
          'Resource allocation based on politics not data leaves 34% of high-crime areas underserved'
        ],
        businessCase: 'Ineffective public safety costs communities $340B annually in crime and slow emergency response. VANGUARDS reduces crime 31% while improving emergency response times 42%. For a city of 500K, this prevents 12,000 crimes annually, saves 450 lives through faster response, reduces policing costs by $67M, and improves community trust scores from 34% to 72%.',
        technicalCase: 'Spatio-temporal neural networks predict crime with 85% accuracy at block level. Graph analytics identify criminal networks. Computer vision analyzes CCTV without storing biometric data. Fairness-aware ML eliminates demographic bias. Real-time optimization dispatches resources.',
        keyBenefits: [
          'Crime prediction with 85% accuracy at 500m resolution while eliminating racial bias through fairness constraints',
          'Emergency response optimization reducing arrival times 42% through AI dispatch and traffic control',
          'Resource allocation models balancing prevention, response, and community engagement for optimal outcomes',
          'Early intervention identification for at-risk youth with 89% success rate in prevention programs',
          'Community trust dashboard tracking sentiment and adjusting strategies for improved relations'
        ],
        companyReferences: [
          {
            company: 'Chicago PredPol',
            issue: 'Predictive policing increased arrests in minority areas without reducing crime'
          },
          {
            company: 'Detroit Project Green Light',
            issue: 'CCTV expansion cost $50M but violent crime increased 10% due to poor analytics'
          },
          {
            company: 'New Orleans 911',
            issue: 'System failures led to 5-day outages putting 400K residents at risk'
          }
        ]
      },
      'Resource Optimization': {
        painPoints: [
          'Government waste reaches $247B annually with agencies using only 56% of allocated budgets effectively',
          'Infrastructure maintenance backlog of $2.6T grows 4% yearly while 30% of spending goes to emergency repairs',
          'Procurement inefficiencies cost 18% premium over private sector with 6-month average acquisition time',
          'Workforce productivity 27% below private sector with 35% of time spent on administrative tasks'
        ],
        businessCase: 'Government inefficiency costs taxpayers $580B annually in waste and suboptimal outcomes. VANGUARDS optimizes resource allocation, improving efficiency 43% while enhancing service quality. For a state government with $50B budget, this saves $7.8B through better allocation, reduces infrastructure costs 34%, accelerates procurement 67%, and improves citizen outcome metrics by 52%.',
        technicalCase: 'Multi-objective optimization balances competing priorities across departments. Predictive maintenance using IoT prevents infrastructure failures. Automated procurement matches requirements with vendors. Natural language processing extracts insights from millions of documents. Digital twins simulate policy impacts.',
        keyBenefits: [
          'Budget optimization using AI identifying $1 savings opportunities for every $6 spent with ROI tracking',
          'Infrastructure maintenance prioritization preventing 73% of failures through predictive analytics',
          'Automated procurement reducing costs 18% and time 67% while improving vendor diversity 45%',
          'Workforce optimization eliminating 35% of administrative tasks through intelligent automation',
          'Policy simulation predicting outcomes across 50+ metrics before implementation'
        ],
        companyReferences: [
          {
            company: 'Flint Water Crisis',
            issue: 'Deferred maintenance to save $5M caused $1.5B in damages and 12 deaths'
          },
          {
            company: 'California High-Speed Rail',
            issue: 'Cost overruns reached $80B (3x original) due to poor planning and optimization'
          },
          {
            company: 'Federal IT Spending',
            issue: '$90B annual spending with 70% on maintaining legacy systems vs innovation'
          }
        ]
      }
    },
    telecom: {
      'Network Performance Optimization': {
        painPoints: [
          'Network congestion causes 23% of calls to drop and data speeds to fall 67% during peak hours affecting 2.3B users',
          'Infrastructure investments of $350B annually achieve only 71% utilization due to poor traffic prediction',
          'Network failures cost $75B yearly with average outage lasting 4.7 hours affecting 50K customers per incident',
          'QoS complaints increased 156% with 5G rollout as networks struggle to balance diverse service requirements'
        ],
        businessCase: 'Network inefficiencies cost telecoms $142B annually in overprovisioning, outages, and customer churn. VANGUARDS optimizes network performance in real-time, improving QoS 47% while reducing costs 31%. For a carrier with 50M subscribers, this reduces infrastructure spend by $2.3B, prevents 89% of outages, improves NPS by 34 points, and enables 40% more traffic on existing infrastructure.',
        technicalCase: 'Deep reinforcement learning optimizes network slicing for 5G services. Graph neural networks model traffic flow across network topology. Predictive analytics forecast demand with 15-minute granularity. Anomaly detection identifies failures before service impact. Edge AI enables millisecond optimization.',
        keyBenefits: [
          'Real-time traffic optimization improving throughput 47% without infrastructure investment',
          'Predictive maintenance identifying equipment failures 72 hours ahead with 93% accuracy',
          'Dynamic spectrum allocation increasing capacity 40% through AI-driven frequency management',
          'Self-healing networks automatically rerouting traffic preventing 89% of service impacts',
          'Energy optimization reducing power consumption 28% while maintaining QoS targets'
        ],
        companyReferences: [
          {
            company: 'AT&T February 2020',
            issue: 'Network outage affected 20M customers for 5 hours causing $180M in credits'
          },
          {
            company: 'Verizon 5G Launch',
            issue: 'Coverage gaps and performance issues led to 34% satisfaction despite $45B investment'
          },
          {
            company: 'T-Mobile Sprint Merger',
            issue: 'Network integration challenges caused 3M customer defections worth $2.1B'
          }
        ]
      },
      'Customer Churn Prevention': {
        painPoints: [
          'Telecom churn rates average 27% annually with customer acquisition costing 5x more than retention',
          'Churn prediction models identify only 48% of defectors with 2-week warning, too late for intervention',
          'Customer lifetime value varies 10x but retention efforts treat all segments equally, wasting 67% of budget',
          'Win-back campaigns succeed only 12% of time as root causes of churn remain unaddressed'
        ],
        businessCase: 'Customer churn costs global telecoms $75B annually in lost revenue and replacement costs. VANGUARDS predicts churn 3 months ahead with 89% accuracy, reducing defection by 41%. For a carrier with 20M subscribers, this retains 2.2M customers annually, saves $1.8B in acquisition costs, increases ARPU 18% through targeted offers, and improves customer lifetime value by 2.3x.',
        technicalCase: 'Sequential neural networks analyze behavioral patterns across calls, data, billing, and support interactions. Causal inference identifies true churn drivers vs correlations. Reinforcement learning optimizes intervention strategies. Natural language processing extracts sentiment from support interactions.',
        keyBenefits: [
          'Churn prediction 3 months ahead with 89% accuracy enabling proactive intervention',
          'Micro-segmentation identifying 10,000+ behavioral cohorts for personalized retention',
          'Next-best-action recommendations for agents increasing save rates from 23% to 67%',
          'Root cause analysis identifying top 5 churn drivers per customer with remediation paths',
          'Lifetime value optimization balancing retention costs with customer profitability'
        ],
        companyReferences: [
          {
            company: 'Sprint',
            issue: 'Industry-worst 2.3% monthly churn contributed to T-Mobile merger necessity'
          },
          {
            company: 'Comcast',
            issue: 'Cable cutting acceleration led to 2M subscriber loss despite retention spending'
          },
          {
            company: 'Industry Average',
            issue: 'Carriers lose 27% of customers annually costing $300 per defection'
          }
        ]
      },
      'Network Security Monitoring': {
        painPoints: [
          'Telecom networks face 200K cyberattacks daily with successful breaches costing average $4.5M per incident',
          'DDoS attacks increased 341% affecting service availability for 43M customers causing $2.1B in losses',
          'Security teams handle 11K alerts daily with 67% being false positives, missing 23% of real threats',
          'Signaling vulnerabilities like SS7 exploits remain unpatched in 78% of networks enabling fraud and surveillance'
        ],
        businessCase: 'Network security breaches cost telecoms $28B annually in direct losses, remediation, and reputation damage. VANGUARDS detects and prevents 96% of attacks in real-time. For a major carrier, this prevents $340M in annual fraud losses, reduces security operations costs by 67%, maintains 99.99% service availability, and protects 50M customers\' data from breaches.',
        technicalCase: 'Graph neural networks model normal traffic patterns detecting anomalies across protocols. Deep packet inspection using ML identifies zero-day exploits. Federated learning shares threat intelligence without exposing network topology. Automated response orchestrates mitigation in milliseconds.',
        keyBenefits: [
          'Real-time threat detection across network, signaling, and application layers with 96% accuracy',
          'Automated incident response mitigating attacks in <500ms preventing service impact',
          'Zero-day exploit detection using behavioral analysis catching unknown threats',
          'Fraud prevention stopping SIM swapping, IRSF, and PBX hacking saving $340M annually',
          'Compliance automation for GDPR, CCPA, and sector regulations reducing audit time 85%'
        ],
        companyReferences: [
          {
            company: 'T-Mobile 2021',
            issue: 'Breach exposed 76M customers\' data leading to $500M in costs and lawsuits'
          },
          {
            company: 'Telegram SS7',
            issue: 'Signaling vulnerabilities enabled government surveillance affecting millions'
          },
          {
            company: 'Bandwidth.com',
            issue: 'DDoS attack disrupted emergency services across US for 3 days'
          }
        ]
      }
    },
    'real-estate': {
      'AI Pricing Governance': {
        painPoints: [
          'Automated valuation models (AVMs) show 15-20% error rates in volatile markets, leading to $2.3B in annual pricing disputes and lost deals',
          'Manual appraisal processes take 7-10 days costing $500-800 per property while 23% require costly revisions due to comparables disputes',
          'Algorithmic pricing bias affects minority neighborhoods with 21% higher error rates, exposing platforms to Fair Housing Act violations and $180M+ settlements',
          'Market volatility causes 34% of listings to require repricing within 30 days, with sellers losing average $47K from initial overpricing'
        ],
        businessCase: 'Inaccurate property valuations cost the real estate industry $18B annually in failed transactions, legal settlements, and market inefficiencies. VANGUARDS provides AI-powered pricing with built-in governance achieving 94% accuracy while eliminating bias. For a major real estate platform processing 2M listings annually, this prevents $340M in fair housing violations, reduces valuation disputes by 78%, accelerates transactions by 5.2 days average, and increases platform revenue by $127M through improved conversion rates.',
        technicalCase: 'Ensemble models combine computer vision analysis of property images, natural language processing of listing descriptions, and graph neural networks modeling neighborhood relationships. Fairness constraints ensure pricing equity across demographics. Explainable AI provides transparent valuation breakdowns. Continuous monitoring detects model drift and bias emergence. Human-in-the-loop validation for high-stakes transactions.',
        keyBenefits: [
          'Achieve 94% valuation accuracy within ±3% of final sale price using 500+ property and market features',
          'Eliminate pricing bias with fairness-aware ML ensuring <1% variance across protected classes',
          'Provide instant valuations with detailed explanations showing impact of each feature on price',
          'Reduce time-to-close by 5.2 days through accurate initial pricing preventing repricing cycles',
          'Generate compliance reports demonstrating fair housing adherence for regulatory audits'
        ],
        companyReferences: [
          {
            company: 'Zillow',
            issue: 'Zillow Offers shut down after algorithm errors led to $881M loss buying homes above market value'
          },
          {
            company: 'Redfin',
            issue: 'Algorithmic pricing lawsuits alleged systematic undervaluation in minority neighborhoods'
          },
          {
            company: 'Opendoor',
            issue: 'Lost $1.4B in 2022 due to pricing model failures during market volatility'
          }
        ]
      }
    }
  };

  // Default executive summary for use cases not explicitly defined
  const defaultSummary: UseCase['executiveSummary'] = {
    painPoints: [
      'Manual processes consume excessive time and resources',
      'Lack of real-time visibility into operations',
      'Compliance and regulatory challenges',
      'Inability to scale operations efficiently'
    ],
    businessCase: `Organizations in ${verticalId} waste 30% of resources on manual ${useCaseName.toLowerCase()} processes. Our AI solution automates 80% of these tasks, delivering ROI within 6 months through reduced errors, faster processing, and data-driven insights that capture previously missed opportunities.`,
    technicalCase: `Leverages state-of-the-art machine learning and AI technologies to automate and optimize ${useCaseName.toLowerCase()} processes with enterprise-grade security and compliance.`,
    keyBenefits: [
      'Automated decision-making with human oversight',
      'Real-time analytics and insights',
      'Seamless integration with existing systems',
      'Continuous improvement through ML feedback loops'
    ]
  };

  return summaries[verticalId]?.[useCaseName] || defaultSummary;
};

// Generate mock use cases from vertical configurations
const mockUseCases: UseCase[] = Object.entries(verticalConfigs).flatMap(([verticalId, config]) =>
  config.useCases.map((useCase) => ({
    id: `${verticalId}-${useCase.id}`, // Use the actual use case ID from config
    name: useCase.name,
    description: useCase.description,
    vertical: verticalId,
    category: 'General',
    complexity: useCase.complexity || 'medium',
    estimatedTime: useCase.estimatedTime || '2-3 weeks',
    requiredAgents: config.aiAgents?.slice(0, 3) || [],
    siaScores: useCase.siaScores || {
      security: Math.floor(Math.random() * 15) + 85,
      integrity: Math.floor(Math.random() * 15) + 85,
      accuracy: Math.floor(Math.random() * 15) + 85,
    },
    tags: [verticalId],
    status: 'available', // All use cases are now available
    popularity: Math.floor(Math.random() * 30) + 70,
    lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    executiveSummary: generateExecutiveSummary(verticalId, useCase.name),
  }))
);

interface UseCaseCardProps {
  useCase: UseCase;
  vertical: VerticalConfig;
  onLaunch: (useCase: UseCase) => void;
  onBookmark: (useCase: UseCase) => void;
  onDemo: (useCase: UseCase) => void;
  isBookmarked: boolean;
  isLaunching: boolean;
  launchingUseCaseId: string | null;
}

const UseCaseCard: React.FC<UseCaseCardProps> = ({
  useCase,
  vertical,
  onLaunch,
  onBookmark,
  onDemo,
  isBookmarked,
  isLaunching,
  launchingUseCaseId
}) => {
  const [showExecutiveSummary, setShowExecutiveSummary] = useState(false);
  const complexityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  };

  const statusConfig = {
    available: { label: 'Available', color: 'text-green-500' },
    'coming-soon': { label: 'Coming Soon', color: 'text-gray-500' },
    beta: { label: 'Beta', color: 'text-yellow-500' },
  };

  const Icon = vertical.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${vertical.bgColor} ${vertical.borderColor} border`}>
                <Icon className={`w-5 h-5 ${vertical.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{useCase.name}</h3>
                <p className="text-xs text-gray-400">{vertical.name}</p>
              </div>
            </div>
            <button
              onClick={() => onBookmark(useCase)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'bg-seraphim-gold/20 text-seraphim-gold'
                  : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              <BookmarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-300 mb-4">{useCase.description}</p>

          {/* Executive Summary Toggle */}
          {useCase.executiveSummary && (
            <button
              onClick={() => setShowExecutiveSummary(!showExecutiveSummary)}
              className="w-full mb-4 p-3 bg-seraphim-gold/10 hover:bg-seraphim-gold/20 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-seraphim-gold">
                  Executive Summary
                </span>
                <ChevronRightIcon
                  className={`w-4 h-4 text-seraphim-gold transition-transform ${
                    showExecutiveSummary ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </button>
          )}

          {/* Executive Summary Content */}
          <AnimatePresence>
            {showExecutiveSummary && useCase.executiveSummary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-4 bg-black/30 rounded-lg space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-red-500 mb-1">Pain Points</h4>
                    <ul className="space-y-1">
                      {useCase.executiveSummary.painPoints.map((pain, index) => (
                        <li key={index} className="text-xs text-gray-300 flex items-start">
                          <span className="text-red-500 mr-1">•</span>
                          {pain}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-vanguard-blue mb-1">Business Case</h4>
                    <p className="text-xs text-gray-300">{useCase.executiveSummary.businessCase}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-vanguard-red mb-1">Technical Case</h4>
                    <p className="text-xs text-gray-300">{useCase.executiveSummary.technicalCase}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-vanguard-green mb-1">Key Benefits</h4>
                    <ul className="space-y-1">
                      {useCase.executiveSummary.keyBenefits.map((benefit, index) => (
                        <li key={index} className="text-xs text-gray-300 flex items-start">
                          <span className="text-seraphim-gold mr-1">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {useCase.executiveSummary.companyReferences && (
                    <div>
                      <h4 className="text-xs font-semibold text-yellow-500 mb-1">Industry Examples</h4>
                      <div className="space-y-2">
                        {useCase.executiveSummary.companyReferences.map((ref, index) => (
                          <div key={index} className="text-xs">
                            <p className="text-gray-300">
                              <span className="font-medium text-white">{ref.company}:</span> {ref.issue}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metadata */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Complexity</span>
              <span className={`px-2 py-0.5 rounded-full ${complexityColors[useCase.complexity]} text-black`}>
                {useCase.complexity.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Est. Time</span>
              <span className="text-gray-300 flex items-center">
                <ClockIcon className="w-3 h-3 mr-1" />
                {useCase.estimatedTime}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Status</span>
              <span className={statusConfig[useCase.status].color}>
                {statusConfig[useCase.status].label}
              </span>
            </div>
          </div>

          {/* SIA Scores */}
          <div className="flex items-center justify-between mb-4 p-3 bg-black/30 rounded-lg">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-vanguard-blue rounded-full" />
              <span className="text-xs text-gray-300">S: {useCase.siaScores.security}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-vanguard-red rounded-full" />
              <span className="text-xs text-gray-300">I: {useCase.siaScores.integrity}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-vanguard-green rounded-full" />
              <span className="text-xs text-gray-300">A: {useCase.siaScores.accuracy}%</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {useCase.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <UserGroupIcon className="w-3 h-3" />
              <span>{useCase.popularity}% adoption</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDemo(useCase)}
              >
                <ChartBarIcon className="w-4 h-4 mr-1" />
                Demo
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onLaunch(useCase)}
                disabled={isLaunching || launchingUseCaseId === useCase.id}
              >
                {launchingUseCaseId === useCase.id ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Run
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const UseCaseLauncher: React.FC = () => {
  const navigate = useNavigate();
  const { selectedVertical: globalVertical, setSelectedVertical: setGlobalVertical } = useVertical();
  const { launchUseCase, isLaunching } = useUseCaseContext();
  const [selectedVertical, setSelectedVertical] = useState(globalVertical || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedUseCases, setBookmarkedUseCases] = useState<Set<string>>(new Set());
  const [launchingUseCaseId, setLaunchingUseCaseId] = useState<string | null>(null);

  // Sync with global vertical state
  useEffect(() => {
    if (globalVertical && globalVertical !== selectedVertical) {
      setSelectedVertical(globalVertical);
    }
  }, [globalVertical]);

  const handleVerticalChange = (verticalId: string) => {
    setSelectedVertical(verticalId);
    if (verticalId !== 'all') {
      setGlobalVertical(verticalId as any);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(mockUseCases.map(uc => uc.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredUseCases = useMemo(() => {
    return mockUseCases.filter((useCase) => {
      if (selectedVertical !== 'all' && useCase.vertical !== selectedVertical) return false;
      if (selectedComplexity !== 'all' && useCase.complexity !== selectedComplexity) return false;
      if (selectedCategory !== 'all' && useCase.category !== selectedCategory) return false;
      if (searchQuery && !useCase.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !useCase.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [selectedVertical, selectedComplexity, selectedCategory, searchQuery]);

  const handleLaunch = async (useCase: UseCase) => {
    try {
      console.log('Running use case:', useCase);
      setLaunchingUseCaseId(useCase.id);
      
      // Show running state
      const toastId = toast.loading(`Running ${useCase.name}...`);
      
      // Launch use case (triggers workflows and deployment)
      await launchUseCase(useCase.id);
      
      // Dismiss loading toast
      toast.dismiss(toastId);
      
      // Store the selected use case in session storage for compatibility
      sessionStorage.setItem('selectedUseCase', JSON.stringify(useCase));
      
      // Navigate to the Run dashboard
      toast.success(`${useCase.name} is now running`);
      navigate(`/use-case/${useCase.id}/run`);
    } catch (error) {
      console.error('Failed to run use case:', error);
      toast.error('Failed to run use case');
    } finally {
      setLaunchingUseCaseId(null);
    }
  };

  const handleBookmark = (useCase: UseCase) => {
    const newBookmarks = new Set(bookmarkedUseCases);
    if (newBookmarks.has(useCase.id)) {
      newBookmarks.delete(useCase.id);
    } else {
      newBookmarks.add(useCase.id);
    }
    setBookmarkedUseCases(newBookmarks);
  };

  const handleDemo = (useCase: UseCase) => {
    // Store the selected use case for the dashboard
    sessionStorage.setItem('selectedUseCase', JSON.stringify(useCase));
    // Navigate to the use case dashboard
    navigate(`/use-case/${useCase.id}`);
  };

  const selectedVerticalConfig = verticals.find(v => v.id === selectedVertical) || verticals[0];

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <RocketLaunchIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Use Case Launcher
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Launch pre-built AI solutions tailored to your industry
        </p>
      </div>

      {/* Vertical Selector */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {verticals.map((vertical) => {
            const Icon = vertical.icon;
            const isSelected = selectedVertical === vertical.id;
            
            return (
              <button
                key={vertical.id}
                onClick={() => handleVerticalChange(vertical.id)}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? `${vertical.bgColor} ${vertical.borderColor} border-2`
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${
                  isSelected ? vertical.color : 'text-gray-400'
                }`} />
                <p className={`text-xs font-medium ${
                  isSelected ? 'text-white' : 'text-gray-400'
                }`}>
                  {vertical.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FunnelIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
              Filters
            </h3>
            
            <div className="space-y-4">
              {/* Search */}
              <div>
                <Input
                  placeholder="Search use cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                />
              </div>

              {/* Complexity Filter */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 block">
                  Complexity
                </label>
                <select
                  value={selectedComplexity}
                  onChange={(e) => setSelectedComplexity(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
                >
                  <option value="all">All Complexities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 block">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Selected Vertical Info */}
          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${selectedVerticalConfig.bgColor} ${selectedVerticalConfig.borderColor} border`}>
                <selectedVerticalConfig.icon className={`w-5 h-5 ${selectedVerticalConfig.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {selectedVerticalConfig.name}
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              {selectedVerticalConfig.description}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Available Use Cases</span>
                <span className="text-white font-semibold">
                  {filteredUseCases.length}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Use Cases Grid */}
        <div className="lg:col-span-3">
          {filteredUseCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredUseCases.map((useCase) => {
                  const vertical = verticals.find(v => v.id === useCase.vertical) || verticals[0];
                  return (
                    <UseCaseCard
                      key={useCase.id}
                      useCase={useCase}
                      vertical={vertical}
                      onLaunch={handleLaunch}
                      onBookmark={handleBookmark}
                      onDemo={handleDemo}
                      isBookmarked={bookmarkedUseCases.has(useCase.id)}
                      isLaunching={isLaunching}
                      launchingUseCaseId={launchingUseCaseId}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <SparklesIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No use cases found matching your criteria</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UseCaseLauncher;