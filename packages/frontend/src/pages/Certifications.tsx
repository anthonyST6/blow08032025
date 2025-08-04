import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { Progress } from '../components/Progress';
import { format } from 'date-fns';

// Custom Security Icon - Shield with Plus
const SecurityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 3v6c0 5.5-3.5 10.5-8 11.8-4.5-1.3-8-6.3-8-11.8V5l8-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
  </svg>
);

// Custom Integrity Icon - Sword pointing down
const IntegrityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {/* Pommel */}
    <circle cx="12" cy="3" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Handle */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5h3v3h-3z" />
    {/* Cross guard */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10" />
    {/* Blade */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v10" />
    {/* Blade edges */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 8v9.5L12 20l1.5-2.5V8" />
  </svg>
);

interface AuditEntry {
  timestamp: Date;
  action: string;
  agent: string;
  status: 'success' | 'warning' | 'error';
  details: string;
  metadata?: any;
}

interface AgentDecision {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  agentType: string;
  taskId: string;
  taskDescription: string;
  decision: string;
  rationale: string;
  inputData: {
    source: string;
    dataPoints: string[];
    context: string;
  };
  analysisSteps: {
    step: string;
    result: string;
    confidence: number;
  }[];
  outputData: {
    recommendation: string;
    risks: string[];
    opportunities: string[];
  };
  performanceMetrics: {
    processingTime: number;
    cpuUsage: number;
    memoryUsage: number;
    dataProcessed: string;
  };
  complianceChecks: {
    regulation: string;
    status: 'passed' | 'failed' | 'warning';
    details: string;
  }[];
  dependencies: {
    requiredAgents: string[];
    dataSourcesUsed: string[];
    externalAPIs: string[];
  };
  auditTrail: {
    action: string;
    timestamp: Date;
    details: string;
  }[];
}

interface CertificationOutput {
  id: string;
  model: string;
  generated: Date;
  certified: boolean;
  security: number;
  integrity: number;
  accuracy: number;
  size: string;
  type: string;
  description: string;
  auditTrail: AuditEntry[];
  agentDecisions?: AgentDecision[];
  fullAnalysis: {
    securityDetails: string[];
    integrityDetails: string[];
    accuracyDetails: string[];
    dataLineage: string;
    validationSteps: string[];
    certificationNotes: string;
  };
  certificationId: string;
  certifiedBy: string;
  certificationDate: Date;
}

const Certifications: React.FC = () => {
  const [outputs, setOutputs] = useState<CertificationOutput[]>([]);
  const [filteredOutputs, setFilteredOutputs] = useState<CertificationOutput[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCertified, setFilterCertified] = useState<'all' | 'certified' | 'failed'>('all');
  const [selectedOutput, setSelectedOutput] = useState<CertificationOutput | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Generate mock certification data with full details
  useEffect(() => {
    const generateAgentDecisions = (): AgentDecision[] => [
      {
        id: 'decision-001',
        timestamp: new Date(Date.now() - 295000),
        agentId: 'agent-ingest-001',
        agentName: 'Data Ingest Agent',
        agentType: 'data-processing',
        taskId: 'task-001',
        taskDescription: 'Process and validate incoming lease data from CSV files',
        decision: 'PROCEED_WITH_INGESTION',
        rationale: 'CSV file structure validated successfully. All required fields present: lease_id, property_location, expiration_date, leaseholder_name, annual_payment. File integrity check passed with SHA-256 hash verification.',
        inputData: {
          source: 'oilfield_leases_2025.csv',
          dataPoints: ['1,247 lease records', '52 unique properties', '18 active operators'],
          context: 'Monthly lease portfolio update for regulatory compliance'
        },
        analysisSteps: [
          { step: 'File format validation', result: 'CSV structure confirmed', confidence: 100 },
          { step: 'Schema validation', result: 'All 15 required fields present', confidence: 100 },
          { step: 'Data quality check', result: '99.2% completeness, 0.8% missing optional fields', confidence: 98 },
          { step: 'Duplicate detection', result: 'No duplicate lease IDs found', confidence: 100 }
        ],
        outputData: {
          recommendation: 'Data suitable for processing',
          risks: ['8 records missing optional environmental assessment dates'],
          opportunities: ['Identified 47 leases for renewal negotiations']
        },
        performanceMetrics: {
          processingTime: 3200,
          cpuUsage: 45,
          memoryUsage: 62,
          dataProcessed: '2.4MB'
        },
        complianceChecks: [
          { regulation: 'GDPR', status: 'passed', details: 'No personal data beyond business contacts' },
          { regulation: 'SOX', status: 'passed', details: 'Financial data integrity maintained' }
        ],
        dependencies: {
          requiredAgents: [],
          dataSourcesUsed: ['CSV Import Module', 'Schema Validator'],
          externalAPIs: []
        },
        auditTrail: [
          { action: 'File received', timestamp: new Date(Date.now() - 296000), details: 'CSV file uploaded via secure FTP' },
          { action: 'Validation started', timestamp: new Date(Date.now() - 295500), details: 'Initiated comprehensive data validation' },
          { action: 'Validation completed', timestamp: new Date(Date.now() - 295000), details: 'All checks passed, data ready for processing' }
        ]
      },
      {
        id: 'decision-002',
        timestamp: new Date(Date.now() - 235000),
        agentId: 'agent-risk-001',
        agentName: 'Lease Expiration Risk Agent',
        agentType: 'risk-analysis',
        taskId: 'task-002',
        taskDescription: 'Analyze lease portfolio for expiration risks and renewal opportunities',
        decision: 'FLAG_HIGH_RISK_LEASES',
        rationale: 'Identified 47 leases expiring within 90-day threshold. These represent $4.2M in annual revenue (18% of portfolio). Historical data shows 65% renewal success rate for leases flagged at 90 days vs 35% at 30 days. Early intervention recommended.',
        inputData: {
          source: 'Processed lease database',
          dataPoints: ['1,247 active leases', '$23.4M total annual revenue', 'Average lease duration: 5 years'],
          context: 'Q3 2025 risk assessment for executive review'
        },
        analysisSteps: [
          { step: 'Expiration date analysis', result: '47 leases within 90 days, 112 within 180 days', confidence: 100 },
          { step: 'Revenue impact calculation', result: '$4.2M at risk in next quarter', confidence: 95 },
          { step: 'Historical renewal pattern analysis', result: '65% success rate with 90-day notice', confidence: 92 },
          { step: 'Operator relationship scoring', result: '38 of 47 with strong relationships', confidence: 88 }
        ],
        outputData: {
          recommendation: 'Initiate renewal negotiations for 47 high-priority leases',
          risks: ['9 leases with operators showing financial distress', '3 properties with environmental concerns'],
          opportunities: ['Bundle negotiations for 12 adjacent properties', 'Potential 15% rate increase based on market analysis']
        },
        performanceMetrics: {
          processingTime: 5400,
          cpuUsage: 78,
          memoryUsage: 84,
          dataProcessed: '124MB'
        },
        complianceChecks: [
          { regulation: 'State Oil & Gas Commission', status: 'passed', details: 'All notifications within required timeframes' },
          { regulation: 'Environmental Protection', status: 'warning', details: '3 properties pending environmental review' }
        ],
        dependencies: {
          requiredAgents: ['Data Ingest Agent'],
          dataSourcesUsed: ['Lease Database', 'Historical Renewal Data', 'Market Rate Database'],
          externalAPIs: ['Bloomberg Energy Prices API', 'County Records API']
        },
        auditTrail: [
          { action: 'Analysis initiated', timestamp: new Date(Date.now() - 240000), details: 'Risk analysis triggered by data update' },
          { action: 'External data fetched', timestamp: new Date(Date.now() - 238000), details: 'Market rates and operator financials retrieved' },
          { action: 'Risk scoring completed', timestamp: new Date(Date.now() - 235000), details: '47 high-risk leases identified and prioritized' }
        ]
      },
      {
        id: 'decision-003',
        timestamp: new Date(Date.now() - 175000),
        agentId: 'agent-compliance-001',
        agentName: 'Compliance Analysis Agent',
        agentType: 'regulatory-compliance',
        taskId: 'task-003',
        taskDescription: 'Verify all leases meet current regulatory requirements',
        decision: 'APPROVE_COMPLIANCE_STATUS',
        rationale: 'All 1,247 leases passed regulatory compliance checks. EPA environmental assessments current for 1,239 leases (99.4%). OSHA safety certifications valid. State Oil & Gas Commission filings up to date. The 8 leases missing recent environmental assessments have extensions filed and approved.',
        inputData: {
          source: 'Regulatory compliance database',
          dataPoints: ['EPA requirements', 'OSHA standards', 'State regulations', 'Local ordinances'],
          context: 'Quarterly compliance audit for legal department'
        },
        analysisSteps: [
          { step: 'EPA compliance verification', result: '1,239 fully compliant, 8 with approved extensions', confidence: 100 },
          { step: 'OSHA safety audit', result: 'All properties meet safety standards', confidence: 100 },
          { step: 'State filing verification', result: 'All annual reports filed on time', confidence: 100 },
          { step: 'Local permit validation', result: 'All operating permits current', confidence: 98 }
        ],
        outputData: {
          recommendation: 'Portfolio is compliance-ready for regulatory review',
          risks: ['8 properties need environmental assessments by Q4 2025'],
          opportunities: ['Early renewal of 5 expiring permits could lock in current favorable terms']
        },
        performanceMetrics: {
          processingTime: 8200,
          cpuUsage: 92,
          memoryUsage: 88,
          dataProcessed: '342MB'
        },
        complianceChecks: [
          { regulation: 'EPA Clean Air Act', status: 'passed', details: 'All emissions within limits' },
          { regulation: 'Water Quality Standards', status: 'passed', details: 'No violations reported' },
          { regulation: 'Endangered Species Act', status: 'passed', details: 'All properties cleared' }
        ],
        dependencies: {
          requiredAgents: ['Data Ingest Agent', 'Lease Expiration Risk Agent'],
          dataSourcesUsed: ['EPA Database', 'OSHA Records', 'State Regulatory Portal'],
          externalAPIs: ['EPA Compliance API', 'State Oil & Gas API']
        },
        auditTrail: [
          { action: 'Compliance check started', timestamp: new Date(Date.now() - 180000), details: 'Initiated comprehensive regulatory review' },
          { action: 'External databases queried', timestamp: new Date(Date.now() - 178000), details: 'Retrieved latest regulatory requirements' },
          { action: 'Compliance verified', timestamp: new Date(Date.now() - 175000), details: 'All checks completed successfully' }
        ]
      },
      {
        id: 'decision-004',
        timestamp: new Date(Date.now() - 115000),
        agentId: 'agent-docgen-001',
        agentName: 'Document Generation Agent',
        agentType: 'report-generation',
        taskId: 'task-004',
        taskDescription: 'Generate comprehensive risk assessment report for executive review',
        decision: 'GENERATE_EXECUTIVE_REPORT',
        rationale: 'Compiled comprehensive 24-page executive report incorporating all risk analyses, compliance status, and renewal recommendations. Report structured for C-suite consumption with executive summary, detailed findings, and actionable recommendations. Visual dashboards included for at-a-glance insights.',
        inputData: {
          source: 'Aggregated analysis results',
          dataPoints: ['Risk analysis data', 'Compliance verification', 'Financial projections', 'Market analysis'],
          context: 'Monthly executive briefing for board meeting'
        },
        analysisSteps: [
          { step: 'Data aggregation', result: 'All source data compiled and verified', confidence: 100 },
          { step: 'Executive summary generation', result: '2-page summary with key metrics', confidence: 95 },
          { step: 'Visualization creation', result: '8 charts and 3 heat maps generated', confidence: 98 },
          { step: 'Recommendation formulation', result: '12 actionable recommendations prioritized', confidence: 92 }
        ],
        outputData: {
          recommendation: 'Immediate action on 47 expiring leases, maintain current compliance trajectory',
          risks: ['$4.2M revenue at risk', '3 properties with environmental concerns'],
          opportunities: ['$6.3M potential revenue increase through strategic renewals', 'Portfolio optimization through consolidation']
        },
        performanceMetrics: {
          processingTime: 12000,
          cpuUsage: 65,
          memoryUsage: 72,
          dataProcessed: '458MB'
        },
        complianceChecks: [
          { regulation: 'SEC Reporting Standards', status: 'passed', details: 'Report meets all disclosure requirements' },
          { regulation: 'Internal Audit Standards', status: 'passed', details: 'Full audit trail maintained' }
        ],
        dependencies: {
          requiredAgents: ['Data Ingest Agent', 'Lease Expiration Risk Agent', 'Compliance Analysis Agent'],
          dataSourcesUsed: ['Analysis Results Database', 'Report Template Library', 'Executive Dashboard Framework'],
          externalAPIs: ['PDF Generation Service', 'Chart Rendering Service']
        },
        auditTrail: [
          { action: 'Report generation initiated', timestamp: new Date(Date.now() - 120000), details: 'Executive report request received' },
          { action: 'Data compilation completed', timestamp: new Date(Date.now() - 118000), details: 'All source data aggregated' },
          { action: 'Report finalized', timestamp: new Date(Date.now() - 115000), details: 'PDF generated and digitally signed' }
        ]
      }
    ];

    const generateAuditTrail = (): AuditEntry[] => [
      {
        timestamp: new Date(Date.now() - 300000),
        action: 'Data Ingestion',
        agent: 'Data Ingest Agent',
        status: 'success',
        details: 'Successfully ingested 1,247 lease records from CSV',
      },
      {
        timestamp: new Date(Date.now() - 240000),
        action: 'Risk Analysis',
        agent: 'Lease Expiration Risk Agent',
        status: 'warning',
        details: 'Identified 47 leases expiring within 90 days',
      },
      {
        timestamp: new Date(Date.now() - 180000),
        action: 'Compliance Check',
        agent: 'Compliance Analysis Agent',
        status: 'success',
        details: 'All leases meet regulatory requirements',
      },
      {
        timestamp: new Date(Date.now() - 120000),
        action: 'Report Generation',
        agent: 'Document Generation Agent',
        status: 'success',
        details: 'Generated comprehensive risk assessment report',
      },
    ];

    const generateFullAnalysis = () => ({
      securityDetails: [
        'Data encrypted with AES-256 during processing',
        'Access controls verified for all agents',
        'Audit logging enabled throughout workflow',
        'No unauthorized data access detected',
      ],
      integrityDetails: [
        'Data validation checksums verified',
        'No data corruption detected during processing',
        'All transformations logged and reversible',
        'Output matches expected schema validation',
      ],
      accuracyDetails: [
        'Cross-referenced with 3 independent data sources',
        'Statistical confidence level: 95.2%',
        'Manual spot-check validation passed',
        'No anomalies detected in output data',
      ],
      dataLineage: 'CSV Import → Data Validation → Risk Analysis → Compliance Check → Report Generation',
      validationSteps: [
        'Input data format validation',
        'Business rule validation',
        'Regulatory compliance validation',
        'Output quality assurance',
      ],
      certificationNotes: 'This output has been certified for use in legal and regulatory proceedings.',
    });

    const mockOutputs: CertificationOutput[] = [
      {
        id: 'output-001',
        model: 'gpt-4',
        generated: new Date('2025-07-28'),
        certified: true,
        security: 91,
        integrity: 96,
        accuracy: 93,
        size: '2.4MB',
        type: 'document',
        description: 'Oilfield lease risk assessment report with compliance validation',
        auditTrail: generateAuditTrail(),
        fullAnalysis: generateFullAnalysis(),
        certificationId: 'CERT-2025-07-28-001',
        certifiedBy: 'Seraphim Vanguards Platform',
        certificationDate: new Date('2025-07-28T10:20:00'),
      },
      {
        id: 'output-002',
        model: 'claude-2',
        generated: new Date('2025-07-27'),
        certified: true,
        security: 87,
        integrity: 97,
        accuracy: 94,
        size: '1.8MB',
        type: 'analysis',
        description: 'Environmental impact analysis for drilling operations',
        auditTrail: generateAuditTrail(),
        fullAnalysis: generateFullAnalysis(),
        certificationId: 'CERT-2025-07-27-002',
        certifiedBy: 'Seraphim Vanguards Platform',
        certificationDate: new Date('2025-07-27T14:30:00'),
      },
      {
        id: 'output-003',
        model: 'gpt-4',
        generated: new Date('2025-07-26'),
        certified: true,
        security: 90,
        integrity: 93,
        accuracy: 97,
        size: '3.2MB',
        type: 'report',
        description: 'Revenue forecast model with financial projections',
        auditTrail: generateAuditTrail(),
        fullAnalysis: generateFullAnalysis(),
        certificationId: 'CERT-2025-07-26-003',
        certifiedBy: 'Seraphim Vanguards Platform',
        certificationDate: new Date('2025-07-26T09:15:00'),
      },
      {
        id: 'output-004',
        model: 'claude-3',
        generated: new Date('2025-07-25'),
        certified: false,
        security: 72,
        integrity: 85,
        accuracy: 78,
        size: '1.1MB',
        type: 'document',
        description: 'Preliminary compliance assessment - failed validation',
        auditTrail: [
          {
            timestamp: new Date('2025-07-25T08:00:00'),
            action: 'Data Ingestion',
            agent: 'Data Ingest Agent',
            status: 'error',
            details: 'Missing required fields in input data',
          },
          {
            timestamp: new Date('2025-07-25T08:05:00'),
            action: 'Validation',
            agent: 'Validation Agent',
            status: 'error',
            details: 'Failed schema validation - incomplete data',
          },
        ],
        fullAnalysis: {
          securityDetails: ['Partial encryption applied', 'Some access controls missing'],
          integrityDetails: ['Data validation failed', 'Missing required fields'],
          accuracyDetails: ['Insufficient data for accurate analysis'],
          dataLineage: 'CSV Import → Validation Failed',
          validationSteps: ['Input validation failed'],
          certificationNotes: 'This output failed certification due to incomplete data.',
        },
        certificationId: 'FAILED-2025-07-25-004',
        certifiedBy: 'Seraphim Vanguards Platform',
        certificationDate: new Date('2025-07-25T08:10:00'),
      },
    ];

    // Add remaining outputs
    for (let i = 5; i <= 10; i++) {
      mockOutputs.push({
        id: `output-00${i}`,
        model: i % 2 === 0 ? 'claude-2' : 'gpt-4',
        generated: new Date(Date.now() - i * 86400000),
        certified: i !== 7 && i !== 10,
        security: i !== 7 && i !== 10 ? 85 + Math.floor(Math.random() * 10) : 65 + Math.floor(Math.random() * 15),
        integrity: i !== 7 && i !== 10 ? 88 + Math.floor(Math.random() * 10) : 70 + Math.floor(Math.random() * 15),
        accuracy: i !== 7 && i !== 10 ? 90 + Math.floor(Math.random() * 8) : 68 + Math.floor(Math.random() * 12),
        size: `${(Math.random() * 3 + 0.5).toFixed(1)}MB`,
        type: ['document', 'analysis', 'report', 'contract'][Math.floor(Math.random() * 4)],
        description: `AI-generated ${['compliance', 'risk', 'financial', 'operational'][Math.floor(Math.random() * 4)]} analysis`,
        auditTrail: i !== 7 && i !== 10 ? generateAuditTrail() : [{
          timestamp: new Date(Date.now() - i * 86400000),
          action: 'Validation Failed',
          agent: 'Validation Agent',
          status: 'error',
          details: 'Output did not meet certification requirements',
        }],
        fullAnalysis: i !== 7 && i !== 10 ? generateFullAnalysis() : {
          securityDetails: ['Security requirements not met'],
          integrityDetails: ['Data integrity compromised'],
          accuracyDetails: ['Accuracy below threshold'],
          dataLineage: 'Process failed',
          validationSteps: ['Validation failed'],
          certificationNotes: 'This output failed certification.',
        },
        certificationId: i !== 7 && i !== 10 ? `CERT-2025-07-${30-i}-00${i}` : `FAILED-2025-07-${30-i}-00${i}`,
        certifiedBy: 'Seraphim Vanguards Platform',
        certificationDate: new Date(Date.now() - i * 86400000 + 3600000),
      });
    }

    setOutputs(mockOutputs);
  }, []);

  // Filter outputs based on search and certification status
  useEffect(() => {
    let filtered = outputs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(output =>
        output.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        output.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        output.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Certification filter
    if (filterCertified === 'certified') {
      filtered = filtered.filter(output => output.certified);
    } else if (filterCertified === 'failed') {
      filtered = filtered.filter(output => !output.certified);
    }

    setFilteredOutputs(filtered);
  }, [outputs, searchQuery, filterCertified]);

  // Calculate statistics
  const stats = {
    total: outputs.length,
    certified: outputs.filter(o => o.certified).length,
    failed: outputs.filter(o => !o.certified).length,
    successRate: outputs.length > 0 ? (outputs.filter(o => o.certified).length / outputs.length) * 100 : 0,
  };

  const getSIAColor = (value: number) => {
    if (value >= 90) return 'text-green-500';
    if (value >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSIABgColor = (value: number) => {
    if (value >= 90) return 'bg-green-500/20';
    if (value >= 80) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const renderSIAMetric = (label: string, value: number, icon: React.ReactNode, metric: 'security' | 'integrity' | 'accuracy') => {
    // Fixed colors for each metric
    const metricColors = {
      security: 'text-vanguard-blue',
      integrity: 'text-vanguard-red',
      accuracy: 'text-vanguard-green'
    };
    
    return (
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          {icon}
        </div>
        <div className={`text-2xl font-bold ${metricColors[metric]}`}>{value}%</div>
        <div className="text-xs text-gray-400 mt-1">{label}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center mb-2">
          <DocumentCheckIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Output Certification Repository
        </h1>
        <p className="text-gray-400">
          View and manage AI-generated outputs with compliance certification
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Outputs</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Certified</p>
              <p className="text-2xl font-bold text-green-500">{stats.certified}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">{stats.successRate.toFixed(0)}%</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
            <Input
              placeholder="Search by ID, model, or prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Certification Status</label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
              value={filterCertified}
              onChange={(e) => setFilterCertified(e.target.value as any)}
            >
              <option value="all">All Certifications</option>
              <option value="certified">Certified Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Outputs List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOutputs.map((output, index) => (
            <motion.div
              key={output.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:border-seraphim-gold/50 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedOutput(output);
                      setShowDetailModal(true);
                    }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircleIcon className={`w-5 h-5 ${output.certified ? 'text-green-500' : 'text-red-500'}`} />
                      <h3 className="text-lg font-semibold text-white">{output.id}</h3>
                      <Badge variant={output.certified ? 'success' : 'error'} size="small">
                        {output.certified ? 'Certified' : 'Failed'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span>Model: {output.model}</span>
                      <span>•</span>
                      <span>Generated: {format(output.generated, 'MM/dd/yyyy')}</span>
                      <span>•</span>
                      <span>{output.size}</span>
                    </div>

                    <p className="text-sm text-gray-300 mb-4">{output.description}</p>

                    {/* SIA Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`rounded-lg p-3 ${getSIABgColor(output.security)}`}>
                        {renderSIAMetric('Security', output.security,
                          <SecurityIcon className="w-6 h-6 text-vanguard-blue" />,
                          'security'
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${getSIABgColor(output.integrity)}`}>
                        {renderSIAMetric('Integrity', output.integrity,
                          <IntegrityIcon className="w-6 h-6 text-vanguard-red" />,
                          'integrity'
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${getSIABgColor(output.accuracy)}`}>
                        {renderSIAMetric('Accuracy', output.accuracy,
                          <ScaleIcon className="w-6 h-6 text-vanguard-green" />,
                          'accuracy'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end ml-4">
                    {output.certified && (
                      <img 
                        src="/seraphim-seal.png" 
                        alt="Certified" 
                        className="w-12 h-12 mb-2 opacity-80"
                      />
                    )}
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredOutputs.length === 0 && (
        <Card className="p-12 text-center">
          <DocumentCheckIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg text-gray-400">No certification outputs found</p>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your filters or search criteria
          </p>
        </Card>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOutput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-lg max-w-6xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Certification Details: {selectedOutput.id}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Certification ID: {selectedOutput.certificationId}</span>
                      <span>•</span>
                      <span>Certified by: {selectedOutput.certifiedBy}</span>
                      <span>•</span>
                      <span>Date: {format(selectedOutput.certificationDate, 'MMM d, yyyy HH:mm:ss')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {selectedOutput.certified && (
                      <img 
                        src="/seraphim-seal.png" 
                        alt="Certified" 
                        className="w-20 h-20"
                      />
                    )}
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <XCircleIcon className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* SIA Metrics Summary */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">SIA Compliance Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4">
                      {renderSIAMetric('Security', selectedOutput.security,
                        <SecurityIcon className="w-8 h-8 text-vanguard-blue" />,
                        'security'
                      )}
                    </Card>
                    <Card className="p-4">
                      {renderSIAMetric('Integrity', selectedOutput.integrity,
                        <IntegrityIcon className="w-8 h-8 text-vanguard-red" />,
                        'integrity'
                      )}
                    </Card>
                    <Card className="p-4">
                      {renderSIAMetric('Accuracy', selectedOutput.accuracy,
                        <ScaleIcon className="w-8 h-8 text-vanguard-green" />,
                        'accuracy'
                      )}
                    </Card>
                  </div>
                </div>

                {/* Full Analysis */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Full Analysis Report</h3>
                  
                  <div className="space-y-6">
                    {/* Security Details */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Security Analysis</h4>
                      <Card className="p-4">
                        <ul className="space-y-2">
                          {selectedOutput.fullAnalysis.securityDetails.map((detail, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-300">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>

                    {/* Integrity Details */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Integrity Analysis</h4>
                      <Card className="p-4">
                        <ul className="space-y-2">
                          {selectedOutput.fullAnalysis.integrityDetails.map((detail, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-300">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>

                    {/* Accuracy Details */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Accuracy Analysis</h4>
                      <Card className="p-4">
                        <ul className="space-y-2">
                          {selectedOutput.fullAnalysis.accuracyDetails.map((detail, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-300">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>

                    {/* Data Lineage */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Data Lineage</h4>
                      <Card className="p-4">
                        <p className="text-sm text-gray-300">{selectedOutput.fullAnalysis.dataLineage}</p>
                      </Card>
                    </div>

                    {/* Validation Steps */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Validation Steps</h4>
                      <Card className="p-4">
                        <ol className="space-y-2">
                          {selectedOutput.fullAnalysis.validationSteps.map((step, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-sm text-gray-500 mr-3">{idx + 1}.</span>
                              <span className="text-sm text-gray-300">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Audit Trail */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Complete Audit Trail</h3>
                  <Card className="overflow-hidden">
                    <div className="divide-y divide-gray-800">
                      {selectedOutput.auditTrail.map((entry, idx) => (
                        <div key={idx} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className={`mt-1 ${
                                entry.status === 'success' ? 'text-green-500' :
                                entry.status === 'warning' ? 'text-yellow-500' :
                                'text-red-500'
                              }`}>
                                {entry.status === 'success' ? <CheckCircleIcon className="w-5 h-5" /> :
                                 entry.status === 'warning' ? <ExclamationTriangleIcon className="w-5 h-5" /> :
                                 <XCircleIcon className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-white">{entry.action}</span>
                                  <span className="text-xs text-gray-500">by {entry.agent}</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{entry.details}</p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {format(entry.timestamp, 'MMM d, HH:mm:ss')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Agent Decision Log */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Complete Agent Decision Log</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Comprehensive record of every agent decision, rationale, and action taken during the certification process.
                  </p>
                  
                  <div className="space-y-6">
                    {selectedOutput.agentDecisions && selectedOutput.agentDecisions.map((decision, idx) => (
                      <Card key={decision.id} className="p-6 border-l-4 border-seraphim-gold">
                        {/* Decision Header */}
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                {decision.agentName}
                                <Badge variant="primary" size="small">{decision.agentType}</Badge>
                              </h4>
                              <p className="text-sm text-gray-400 mt-1">
                                Agent ID: {decision.agentId} | Task ID: {decision.taskId}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {format(decision.timestamp, 'MMM d, yyyy HH:mm:ss.SSS')}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Processing Time: {decision.performanceMetrics.processingTime}ms
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-black/30 rounded-lg p-3 mt-3">
                            <p className="text-sm font-medium text-seraphim-gold mb-1">Task Description:</p>
                            <p className="text-sm text-gray-300">{decision.taskDescription}</p>
                          </div>
                        </div>

                        {/* Decision and Rationale */}
                        <div className="mb-4">
                          <div className="bg-seraphim-gold/10 border border-seraphim-gold/30 rounded-lg p-4">
                            <p className="text-sm font-medium text-seraphim-gold mb-2">Decision: {decision.decision}</p>
                            <p className="text-sm text-gray-300">{decision.rationale}</p>
                          </div>
                        </div>

                        {/* Input Data */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Input Data</h5>
                          <div className="bg-white/5 rounded-lg p-3 space-y-2">
                            <p className="text-xs text-gray-400">Source: <span className="text-white">{decision.inputData.source}</span></p>
                            <p className="text-xs text-gray-400">Context: <span className="text-white">{decision.inputData.context}</span></p>
                            <div className="text-xs text-gray-400">
                              Data Points:
                              <ul className="list-disc list-inside mt-1 text-white">
                                {decision.inputData.dataPoints.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Analysis Steps */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Analysis Steps</h5>
                          <div className="space-y-2">
                            {decision.analysisSteps.map((step, i) => (
                              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                                <div className="flex-1">
                                  <p className="text-sm text-white">{step.step}</p>
                                  <p className="text-xs text-gray-400 mt-1">{step.result}</p>
                                </div>
                                <div className="ml-4">
                                  <Progress value={step.confidence} className="w-20 h-2" />
                                  <p className="text-xs text-gray-400 text-right mt-1">{step.confidence}% confidence</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Output and Recommendations */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Output & Recommendations</h5>
                          <div className="bg-white/5 rounded-lg p-3 space-y-3">
                            <div>
                              <p className="text-xs font-medium text-vanguard-green mb-1">Recommendation:</p>
                              <p className="text-sm text-white">{decision.outputData.recommendation}</p>
                            </div>
                            {decision.outputData.risks.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-vanguard-red mb-1">Identified Risks:</p>
                                <ul className="list-disc list-inside text-sm text-gray-300">
                                  {decision.outputData.risks.map((risk, i) => (
                                    <li key={i}>{risk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {decision.outputData.opportunities.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-vanguard-blue mb-1">Opportunities:</p>
                                <ul className="list-disc list-inside text-sm text-gray-300">
                                  {decision.outputData.opportunities.map((opp, i) => (
                                    <li key={i}>{opp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Performance Metrics</h5>
                          <div className="grid grid-cols-4 gap-3">
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-400">CPU Usage</p>
                              <p className="text-sm font-medium text-white">{decision.performanceMetrics.cpuUsage}%</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-400">Memory</p>
                              <p className="text-sm font-medium text-white">{decision.performanceMetrics.memoryUsage}%</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-400">Data Processed</p>
                              <p className="text-sm font-medium text-white">{decision.performanceMetrics.dataProcessed}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-400">Time</p>
                              <p className="text-sm font-medium text-white">{decision.performanceMetrics.processingTime}ms</p>
                            </div>
                          </div>
                        </div>

                        {/* Compliance Checks */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Compliance Verification</h5>
                          <div className="space-y-2">
                            {decision.complianceChecks.map((check, i) => (
                              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                                <div>
                                  <p className="text-sm text-white">{check.regulation}</p>
                                  <p className="text-xs text-gray-400">{check.details}</p>
                                </div>
                                <Badge
                                  variant={
                                    check.status === 'passed' ? 'success' :
                                    check.status === 'warning' ? 'warning' : 'error'
                                  }
                                  size="small"
                                >
                                  {check.status.toUpperCase()}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Dependencies */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Dependencies & Resources</h5>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="font-medium text-gray-400 mb-1">Required Agents:</p>
                              {decision.dependencies.requiredAgents.length > 0 ? (
                                <ul className="text-gray-300">
                                  {decision.dependencies.requiredAgents.map((agent, i) => (
                                    <li key={i}>• {agent}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-500">None</p>
                              )}
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="font-medium text-gray-400 mb-1">Data Sources:</p>
                              <ul className="text-gray-300">
                                {decision.dependencies.dataSourcesUsed.map((source, i) => (
                                  <li key={i}>• {source}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="font-medium text-gray-400 mb-1">External APIs:</p>
                              {decision.dependencies.externalAPIs.length > 0 ? (
                                <ul className="text-gray-300">
                                  {decision.dependencies.externalAPIs.map((api, i) => (
                                    <li key={i}>• {api}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-500">None</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Detailed Audit Trail */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Agent Audit Trail</h5>
                          <div className="space-y-1">
                            {decision.auditTrail.map((entry, i) => (
                              <div key={i} className="flex items-start gap-3 text-xs">
                                <span className="text-gray-500 min-w-[140px]">
                                  {format(entry.timestamp, 'HH:mm:ss.SSS')}
                                </span>
                                <span className="text-gray-400">{entry.action}:</span>
                                <span className="text-gray-300">{entry.details}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Certification Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Certification Notes</h3>
                  <Card className="p-4 bg-seraphim-gold/10 border-seraphim-gold/30">
                    <p className="text-sm text-gray-300">{selectedOutput.fullAnalysis.certificationNotes}</p>
                  </Card>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    This certification is legally binding and suitable for court proceedings.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => {
                      // Export functionality
                      const data = JSON.stringify(selectedOutput, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `certification-${selectedOutput.id}.json`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}>
                      <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                      Export Full Report
                    </Button>
                    <Button variant="primary" onClick={() => setShowDetailModal(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to generate agent justifications
const getAgentJustification = (actor: string, action: string, metadata: any): string => {
  const justifications: Record<string, Record<string, string>> = {
    'security-sentinel': {
      'SECURITY_ANALYSIS_STARTED': 'Initiating comprehensive security analysis to identify potential vulnerabilities, data exposure risks, and unauthorized access patterns in the AI output.',
      'SECURITY_CHECK_COMPLETED': metadata.vulnerabilitiesFound > 0
        ? `Security vulnerabilities detected. Found ${metadata.vulnerabilitiesFound} critical issues that could lead to data exposure or system compromise. Immediate remediation required.`
        : 'Security analysis completed successfully. No vulnerabilities detected. The output meets all security requirements for production deployment.',
    },
    'integrity-auditor': {
      'INTEGRITY_ANALYSIS_STARTED': 'Beginning integrity verification process to ensure all data sources are validated, information is accurate, and the chain of custody is maintained.',
      'INTEGRITY_CHECK_COMPLETED': metadata.sourcesVerified === metadata.sourcesChecked
        ? `All ${metadata.sourcesChecked} sources have been verified and validated. The output maintains complete integrity with a score of ${(metadata.integrityScore * 100).toFixed(0)}%.`
        : `Integrity issues detected. Only ${metadata.sourcesVerified} out of ${metadata.sourcesChecked} sources could be verified. This indicates potential data manipulation or unverified information.`,
    },
    'accuracy-engine': {
      'ACCURACY_ANALYSIS_STARTED': 'Initiating fact-checking and accuracy verification using advanced models to ensure all statements and data points are correct and up-to-date.',
      'ACCURACY_CHECK_COMPLETED': metadata.factsVerified === metadata.factsChecked
        ? `Successfully verified all ${metadata.factsChecked} facts and data points. Accuracy score: ${(metadata.accuracyScore * 100).toFixed(0)}%. The output is factually correct.`
        : `Accuracy issues found. ${metadata.factsChecked - metadata.factsVerified} facts could not be verified. Errors include: ${metadata.errors?.join(', ') || 'Various inaccuracies'}.`,
    },
    'compliance-engine': {
      'COMPLIANCE_CHECK_STARTED': `Initiating compliance verification against ${metadata.regulations?.join(', ') || 'all applicable regulations'} to ensure legal and regulatory adherence.`,
      'COMPLIANCE_CHECK_COMPLETED': metadata.failed && metadata.failed.length > 0
        ? `Compliance violations detected for ${metadata.failed.join(', ')}. Specific violations: ${metadata.violations?.join('; ') || 'Multiple compliance issues'}.`
        : `All compliance requirements satisfied. The output meets ${metadata.passed?.join(', ') || 'all regulatory'} standards.`,
    },
    'system': {
      'OUTPUT_SUBMITTED': 'AI output received and queued for comprehensive certification analysis across all SIA dimensions.',
      'CERTIFICATION_DECISION': metadata.finalStatus === 'certified'
        ? `Certification granted. All SIA requirements met. Certificate ID: ${metadata.certificateId}. Valid until ${metadata.expiryDate ? format(new Date(metadata.expiryDate), 'MMM d, yyyy') : 'N/A'}.`
        : 'Certification denied due to failures in one or more SIA dimensions. Remediation required before re-submission.',
    },
    'compliance-officer-001': {
      'MANUAL_REVIEW_COMPLETED': metadata.remediationRequired
        ? `Manual review identified critical issues requiring remediation. ${metadata.reviewNotes || 'Multiple compliance and accuracy issues must be addressed.'}`
        : `Manual review confirms all automated checks. ${metadata.reviewNotes || 'Output meets all certification requirements.'}`,
    },
  };
  
  const actorJustifications = justifications[actor] || {};
  return actorJustifications[action] || `${actor} performed ${action} as part of the certification process.`;
};

export default Certifications;