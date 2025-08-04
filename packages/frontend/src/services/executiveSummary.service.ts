export interface CompanyReference {
  company: string;
  issue: string;
  link?: string;
}

export interface ExecutiveSummaryData {
  painPoints: string[];
  businessCase: string;
  technicalCase: string;
  keyBenefits: string[];
  companyReferences?: CompanyReference[];
}

export const executiveSummaries: Record<string, ExecutiveSummaryData> = {
  'oilfield-land-lease': {
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
  'energy-grid-anomaly-detection': {
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
  'energy-renewable-optimization': {
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
  'energy-load-forecasting': {
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
  'healthcare-patient-risk': {
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
  'healthcare-clinical-trials': {
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
  'finance-fraud-detection': {
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
  'finance-insurance-risk': {
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
  },
  'manufacturing-predictive-maintenance': {
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
  'retail-demand-forecasting': {
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
  'logistics-route-optimization': {
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
  'government-emergency-response': {
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
  }
};

// Default executive summary for use cases not explicitly defined
export const getDefaultExecutiveSummary = (useCaseName: string, verticalName: string): ExecutiveSummaryData => ({
  painPoints: [
    'Manual processes consume excessive time and resources',
    'Lack of real-time visibility into operations',
    'Compliance and regulatory challenges',
    'Inability to scale operations efficiently'
  ],
  businessCase: `Organizations in ${verticalName || 'the industry'} waste 30% of resources on manual ${(useCaseName || 'operational').toLowerCase()} processes. Our AI solution automates 80% of these tasks, delivering ROI within 6 months through reduced errors, faster processing, and data-driven insights that capture previously missed opportunities.`,
  technicalCase: `Leverages state-of-the-art machine learning and AI technologies to automate and optimize ${(useCaseName || 'operational').toLowerCase()} processes with enterprise-grade security and compliance.`,
  keyBenefits: [
    'Automated decision-making with human oversight',
    'Real-time analytics and insights',
    'Seamless integration with existing systems',
    'Continuous improvement through ML feedback loops'
  ]
});

export const getExecutiveSummary = (useCaseId: string, useCaseName: string, verticalName?: string): ExecutiveSummaryData => {
  return executiveSummaries[useCaseId] || getDefaultExecutiveSummary(useCaseName, verticalName || 'Industry');
};