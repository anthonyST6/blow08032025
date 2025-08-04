import React, { useState, useMemo, useEffect } from 'react';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  CpuChipIcon,
  DocumentDuplicateIcon,
  LockClosedIcon,
  FingerPrintIcon,
  BeakerIcon,
  SparklesIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  FunnelIcon,
  XMarkIcon,
  CheckIcon,
  ServerIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SIAMetrics } from '../components/ui/SIAMetric';
import { SIABadge, SIABadgeGroup } from '../components/ui/SIABadge';
import { generateCertificationRecords } from '../services/mockData.service';
import { outputStorage } from '../services/outputStorage.service';

interface OutputData {
  id: string;
  timestamp: Date;
  content: string;
  type: 'text' | 'json' | 'markdown' | 'code';
  metadata: {
    model: string;
    promptId: string;
    userId: string;
    executionTime: number;
    tokenCount: {
      input: number;
      output: number;
      total: number;
    };
  };
  certification: {
    status: 'certified' | 'pending' | 'failed';
    timestamp?: Date;
    certifiedBy?: string | null;
    failureReasons?: string[];
    complianceChecks: ComplianceCheck[];
    siaScores: {
      security: number;
      integrity: number;
      accuracy: number;
    };
    signatures: Signature[];
  };
  auditTrail?: AuditLog[];
}

interface ComplianceCheck {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'warning';
  details: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface Signature {
  id: string;
  type: 'digital' | 'blockchain' | 'cryptographic';
  signer: string;
  timestamp: Date;
  hash: string;
  verified: boolean;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  type: 'system' | 'agent' | 'human';
  action: string;
  actor: string;
  details: string;
  metadata?: any;
}

const OutputViewer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedOutput, setSelectedOutput] = useState<OutputData | null>(null);
  const [selectedTab, setSelectedTab] = useState<'output' | 'certification' | 'metadata' | 'audit'>('output');
  const [showRawOutput, setShowRawOutput] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'certified' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get certification records from output storage
  const [certificationRecords, setCertificationRecords] = useState<OutputData[]>([]);

  useEffect(() => {
    // Load outputs from storage
    const loadOutputs = () => {
      const storedOutputs = outputStorage.getOutputs();
      
      // If no stored outputs, use mock data
      if (storedOutputs.length === 0) {
        setCertificationRecords(generateCertificationRecords() as OutputData[]);
      } else {
        // Convert stored outputs to OutputData format
        const convertedOutputs: OutputData[] = storedOutputs.map(output => ({
          ...output,
          auditTrail: output.auditTrail || [],
        }));
        setCertificationRecords(convertedOutputs);
      }
    };

    loadOutputs();

    // Listen for new outputs
    const handleOutputStored = (event: CustomEvent) => {
      loadOutputs();
    };

    window.addEventListener('output-stored', handleOutputStored as EventListener);

    return () => {
      window.removeEventListener('output-stored', handleOutputStored as EventListener);
    };
  }, []);

  // Filter records based on status and search
  const filteredRecords = useMemo(() => {
    return certificationRecords.filter(record => {
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'certified' && record.certification.status === 'certified') ||
        (filterStatus === 'failed' && record.certification.status === 'failed');
      
      const matchesSearch = searchTerm === '' || 
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.metadata.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.metadata.promptId.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [certificationRecords, filterStatus, searchTerm]);

  const certificationStatusConfig = {
    certified: {
      icon: CheckBadgeIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      label: 'Certified',
    },
    pending: {
      icon: ClockIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      label: 'Pending Certification',
    },
    failed: {
      icon: ExclamationTriangleIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: 'Certification Failed',
    },
  };

  const checkStatusConfig = {
    passed: {
      icon: CheckBadgeIcon,
      color: 'text-green-500',
    },
    failed: {
      icon: ExclamationTriangleIcon,
      color: 'text-red-500',
    },
    warning: {
      icon: InformationCircleIcon,
      color: 'text-yellow-500',
    },
  };

  const handleViewDetails = (output: OutputData) => {
    setSelectedOutput(output);
    setViewMode('detail');
    setSelectedTab('output');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedOutput(null);
  };

  const renderOutput = (output: OutputData) => {
    if (output.type === 'markdown' && !showRawOutput) {
      // Simple markdown rendering (in production, use a proper markdown parser)
      const lines = output.content.split('\n');
      return (
        <div className="prose prose-invert max-w-none">
          {lines.map((line, index) => {
            if (line.startsWith('## ')) {
              return <h2 key={index} className="text-xl font-bold text-white mt-6 mb-3">{line.slice(3)}</h2>;
            } else if (line.startsWith('### ')) {
              return <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">{line.slice(4)}</h3>;
            } else if (line.startsWith('- ')) {
              return <li key={index} className="text-gray-300 ml-4">{line.slice(2)}</li>;
            } else if (line.match(/^\d+\. /)) {
              return <li key={index} className="text-gray-300 ml-4">{line}</li>;
            } else if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={index} className="text-gray-300"><strong className="text-white">{line.slice(2, -2)}</strong></p>;
            } else if (line.trim() === '') {
              return <br key={index} />;
            } else {
              return <p key={index} className="text-gray-300">{line}</p>;
            }
          })}
        </div>
      );
    }
    
    return (
      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
        {output.content}
      </pre>
    );
  };

  const renderAuditLog = (log: AuditLog) => {
    const getLogIcon = () => {
      switch (log.type) {
        case 'system':
          return <ServerIcon className="w-4 h-4" />;
        case 'agent':
          return <CpuChipIcon className="w-4 h-4" />;
        case 'human':
          return <UserIcon className="w-4 h-4" />;
        default:
          return <InformationCircleIcon className="w-4 h-4" />;
      }
    };

    const getLogColor = () => {
      if (log.action.includes('FAILED') || log.action.includes('DENIED')) {
        return 'text-red-500';
      } else if (log.action.includes('WARNING') || log.action.includes('REVIEW')) {
        return 'text-yellow-500';
      } else if (log.action.includes('COMPLETED') || log.action.includes('PASSED') || log.action.includes('CERTIFIED')) {
        return 'text-green-500';
      }
      return 'text-blue-500';
    };

    return (
      <div key={log.id} className="flex items-start space-x-3 p-3 bg-black/30 rounded-lg">
        <div className={`mt-1 ${getLogColor()}`}>
          {getLogIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white">{log.action.replace(/_/g, ' ')}</span>
              <span className="text-xs text-gray-500">by {log.actor}</span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm text-gray-300">{log.details}</p>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="mt-2 text-xs text-gray-400">
              {Object.entries(log.metadata).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-1">
                  <span className="font-medium">{key}:</span>
                  <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-seraphim-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <DocumentTextIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
              Output Certification Repository
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              View and manage AI-generated outputs with compliance certification
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, model, or prompt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-seraphim-gold"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-seraphim-gold"
              >
                <option value="all">All Certifications</option>
                <option value="certified">Certified Only</option>
                <option value="failed">Failed Only</option>
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Outputs</p>
                  <p className="text-2xl font-bold text-white">{certificationRecords.length}</p>
                </div>
                <DocumentTextIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Certified</p>
                  <p className="text-2xl font-bold text-green-500">
                    {certificationRecords.filter(r => r.certification.status === 'certified').length}
                  </p>
                </div>
                <CheckBadgeIcon className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-red-500">
                    {certificationRecords.filter(r => r.certification.status === 'failed').length}
                  </p>
                </div>
                <XMarkIcon className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {((certificationRecords.filter(r => r.certification.status === 'certified').length / certificationRecords.length) * 100).toFixed(0)}%
                  </p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
              </div>
            </Card>
          </div>

          {/* Certification List */}
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const certStatus = certificationStatusConfig[record.certification.status];
              const CertIcon = certStatus.icon;
              
              return (
                <Card 
                  key={record.id}
                  className={`p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${certStatus.borderColor} border`}
                  onClick={() => handleViewDetails(record)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${certStatus.bgColor}`}>
                        <CertIcon className={`w-6 h-6 ${certStatus.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          {record.id}
                          {record.certification.status === 'certified' && (
                            <CheckIcon className="w-4 h-4 ml-2 text-green-500" />
                          )}
                          {record.certification.status === 'failed' && (
                            <XMarkIcon className="w-4 h-4 ml-2 text-red-500" />
                          )}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                          <span>Model: {record.metadata.model}</span>
                          <span>•</span>
                          <span>Generated: {new Date(record.timestamp).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={certStatus.color}>{certStatus.label}</span>
                        </div>
                        {record.certification.status === 'failed' && record.certification.failureReasons && (
                          <div className="mt-2">
                            <p className="text-sm text-red-400">
                              Failed: {record.certification.failureReasons[0]}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <SIAMetrics
                          security={record.certification.siaScores.security}
                          integrity={record.certification.siaScores.integrity}
                          accuracy={record.certification.siaScores.accuracy}
                          variant="inline"
                          size="sm"
                          animate={false}
                        />
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredRecords.length === 0 && (
            <Card className="p-8 text-center">
              <ExclamationCircleIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No certifications found matching your criteria.</p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Detail View
  if (!selectedOutput) return null;

  const certStatus = certificationStatusConfig[selectedOutput.certification.status];
  const CertIcon = certStatus.icon;

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBackToList}
            className="mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Repository
          </Button>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <DocumentTextIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
            Output Certification Details
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Viewing certification details for {selectedOutput.id}
          </p>
        </div>

        {/* Certification Status Banner */}
        <Card className={`mb-6 ${certStatus.bgColor} ${certStatus.borderColor} border-2`}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg bg-black/20`}>
                  <CertIcon className={`w-6 h-6 ${certStatus.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{certStatus.label}</h2>
                  <p className="text-sm text-gray-300">
                    Output ID: {selectedOutput.id} • Generated: {selectedOutput.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* SIA Scores */}
                <SIAMetrics
                  security={selectedOutput.certification.siaScores.security}
                  integrity={selectedOutput.certification.siaScores.integrity}
                  accuracy={selectedOutput.certification.siaScores.accuracy}
                  variant="inline"
                  size="sm"
                  animate={false}
                />
              </div>
            </div>
            {selectedOutput.certification.status === 'failed' && selectedOutput.certification.failureReasons && (
              <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Failure Reasons:</h3>
                <ul className="space-y-1">
                  {selectedOutput.certification.failureReasons.map((reason, index) => (
                    <li key={index} className="text-sm text-red-300 flex items-start">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-4">
              <button
                onClick={() => setSelectedTab('output')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === 'output'
                    ? 'bg-seraphim-gold/20 text-seraphim-gold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                Output
              </button>
              <button
                onClick={() => setSelectedTab('certification')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === 'certification'
                    ? 'bg-seraphim-gold/20 text-seraphim-gold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <ShieldCheckIcon className="w-4 h-4 inline mr-2" />
                Certification
              </button>
              <button
                onClick={() => setSelectedTab('metadata')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === 'metadata'
                    ? 'bg-seraphim-gold/20 text-seraphim-gold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <ChartBarIcon className="w-4 h-4 inline mr-2" />
                Metadata
              </button>
              <button
                onClick={() => setSelectedTab('audit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === 'audit'
                    ? 'bg-seraphim-gold/20 text-seraphim-gold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <ClipboardDocumentCheckIcon className="w-4 h-4 inline mr-2" />
                Audit Trail
              </button>
            </div>

            {/* Tab Content */}
            <Card className="p-6">
              <AnimatePresence mode="wait">
                {selectedTab === 'output' && (
                  <motion.div
                    key="output"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Generated Output</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowRawOutput(!showRawOutput)}
                          className="text-sm text-gray-400 hover:text-white"
                        >
                          {showRawOutput ? 'Formatted' : 'Raw'} View
                        </button>
                        <Button variant="secondary" size="sm">
                          <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                      {renderOutput(selectedOutput)}
                    </div>
                  </motion.div>
                )}

                {selectedTab === 'certification' && (
                  <motion.div
                    key="certification"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Compliance Certification</h3>
                    
                    {/* Compliance Checks */}
                    <div className="space-y-3 mb-6">
                      <h4 className="text-sm font-medium text-gray-400">Compliance Checks</h4>
                      {selectedOutput.certification.complianceChecks.map((check) => {
                        const StatusIcon = checkStatusConfig[check.status].icon;
                        const statusColor = checkStatusConfig[check.status].color;
                        
                        return (
                          <div key={check.id} className="bg-black/30 rounded-lg p-3">
                            <div className="flex items-start space-x-3">
                              <StatusIcon className={`w-5 h-5 mt-0.5 ${statusColor}`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-sm font-medium text-white">{check.name}</h5>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    check.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                    check.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                    check.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                                  }`}>
                                    {check.severity}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{check.details}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Digital Signatures */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-400">Digital Signatures</h4>
                      {selectedOutput.certification.signatures.length > 0 ? (
                        selectedOutput.certification.signatures.map((signature) => (
                          <div key={signature.id} className="bg-black/30 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {signature.type === 'digital' && <FingerPrintIcon className="w-5 h-5 text-blue-500" />}
                                {signature.type === 'blockchain' && <LockClosedIcon className="w-5 h-5 text-purple-500" />}
                                {signature.type === 'cryptographic' && <ShieldCheckIcon className="w-5 h-5 text-green-500" />}
                                <div>
                                  <p className="text-sm font-medium text-white">{signature.signer}</p>
                                  <p className="text-xs text-gray-400">
                                    {signature.type} • {signature.timestamp.toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              {signature.verified && (
                                <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-mono">
                              Hash: {signature.hash}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">No signatures available (certification failed)</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {selectedTab === 'metadata' && (
                  <motion.div
                    key="metadata"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Output Metadata</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CpuChipIcon className="w-4 h-4 text-seraphim-gold" />
                          <span className="text-sm font-medium text-gray-400">Model</span>
                        </div>
                        <p className="text-white">{selectedOutput.metadata.model}</p>
                      </div>
                      
                      <div className="bg-black/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <ClockIcon className="w-4 h-4 text-seraphim-gold" />
                          <span className="text-sm font-medium text-gray-400">Execution Time</span>
                        </div>
                        <p className="text-white">{selectedOutput.metadata.executionTime}s</p>
                      </div>
                      
                      <div className="bg-black/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <UserIcon className="w-4 h-4 text-seraphim-gold" />
                          <span className="text-sm font-medium text-gray-400">User ID</span>
                        </div>
                        <p className="text-white">{selectedOutput.metadata.userId}</p>
                      </div>
                      
                      <div className="bg-black/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <DocumentTextIcon className="w-4 h-4 text-seraphim-gold" />
                          <span className="text-sm font-medium text-gray-400">Prompt ID</span>
                        </div>
                        <p className="text-white">{selectedOutput.metadata.promptId}</p>
                      </div>
                    </div>

                    {/* Token Usage */}
                    <div className="mt-4 bg-black/30 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Token Usage</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Input Tokens</span>
                          <span className="text-sm font-mono text-white">
                            {selectedOutput.metadata.tokenCount.input.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Output Tokens</span>
                          <span className="text-sm font-mono text-white">
                            {selectedOutput.metadata.tokenCount.output.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                          <span className="text-sm font-medium text-gray-300">Total Tokens</span>
                          <span className="text-sm font-mono font-semibold text-seraphim-gold">
                            {selectedOutput.metadata.tokenCount.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedTab === 'audit' && selectedOutput.auditTrail && (
                  <motion.div
                    key="audit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Audit Trail</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedOutput.auditTrail.map((log) => renderAuditLog(log))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Actions */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                <Button variant="primary" className="w-full justify-start">
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Export Output
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </Card>

            {/* Certification Summary */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Certification Summary</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Certified By</p>
                  <p className="text-sm text-white">{selectedOutput.certification.certifiedBy || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Certification Time</p>
                  <p className="text-sm text-white">
                    {selectedOutput.certification.timestamp?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Compliance Score</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-vanguard-blue via-vanguard-red to-vanguard-green h-2 rounded-full"
                        style={{
                          width: `${selectedOutput.certification.status === 'certified' ? '95' : '45'}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {selectedOutput.certification.status === 'certified' ? '95' : '45'}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Related Items */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Related Items</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <SparklesIcon className="w-4 h-4 text-seraphim-gold" />
                      <span className="text-sm text-gray-300">Original Prompt</span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                  </div>
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BeakerIcon className="w-4 h-4 text-seraphim-gold" />
                      <span className="text-sm text-gray-300">Test Results</span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                  </div>
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="w-4 h-4 text-seraphim-gold" />
                      <span className="text-sm text-gray-300">Compliance Docs</span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                  </div>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputViewer;
                          