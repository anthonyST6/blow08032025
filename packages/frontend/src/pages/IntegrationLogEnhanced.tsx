import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useUseCaseContext } from '../contexts/UseCaseContext';
import { workflowEventsService, IntegrationLogEntry } from '../services/workflowEvents.service';
import { motion, AnimatePresence } from 'framer-motion';

const IntegrationLogEnhanced: React.FC = () => {
  const [logs, setLogs] = useState<IntegrationLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<IntegrationLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterEventType, setFilterEventType] = useState<string>('all');
  
  // Get use case context
  let selectedUseCase = 'all';
  try {
    const context = useUseCaseContext();
    selectedUseCase = context?.selectedUseCase || 'all';
  } catch (err) {
    console.log('UseCaseContext not available');
  }

  // Generate dummy oilfield lease logs for demo
  const generateOilfieldLogs = (): IntegrationLogEntry[] => {
    const now = new Date();
    const logs: IntegrationLogEntry[] = [];
    
    // Generate realistic oilfield lease integration logs
    const logTemplates: Array<{source: string, target: string, type: 'Data Transfer' | 'Validation' | 'Error' | 'Connection' | 'Processing', message: string}> = [
      { source: 'Data Ingestion Agent', target: 'Orchestrator', type: 'Data Transfer', message: 'Received 47 new lease documents from Texas Railroad Commission API' },
      { source: 'Document Parser', target: 'Data Validation', type: 'Processing', message: 'Extracting lease terms from PDF documents using OCR' },
      { source: 'GIS Integration', target: 'Boundary Validator', type: 'Validation', message: 'Validating lease boundaries against satellite imagery' },
      { source: 'Compliance Engine', target: 'Orchestrator', type: 'Validation', message: 'Checking compliance with EPA regulations for Block 42' },
      { source: 'Risk Analyzer', target: 'Report Generator', type: 'Processing', message: 'Calculating environmental risk scores for active wells' },
      { source: 'Royalty Calculator', target: 'Financial Engine', type: 'Data Transfer', message: 'Processing royalty payments for Q3 2024' },
      { source: 'Environmental Monitor', target: 'Alert System', type: 'Connection', message: 'Connected to real-time methane sensors at Well Site #127' },
      { source: 'Contract Analyzer', target: 'Legal Validator', type: 'Validation', message: 'Reviewing force majeure clauses in Permian Basin leases' },
      { source: 'Production Monitor', target: 'Analytics Engine', type: 'Data Transfer', message: 'Streaming production data: 2,847 barrels/day from Eagle Ford' },
      { source: 'Regulatory Scanner', target: 'Compliance Engine', type: 'Processing', message: 'Scanning for new TCEQ regulations affecting drilling permits' },
      { source: 'Satellite Integration', target: 'GIS Processor', type: 'Connection', message: 'Established connection to Sentinel-2 satellite feed' },
      { source: 'Well Inspector', target: 'Safety Monitor', type: 'Validation', message: 'Validated safety compliance for 23 active drilling sites' },
      { source: 'Revenue Optimizer', target: 'Financial Dashboard', type: 'Processing', message: 'Optimizing production schedules based on WTI futures' },
      { source: 'Land Title Verifier', target: 'Legal Database', type: 'Validation', message: 'Verified clear title for Section 18, Township 2N, Range 3E' },
      { source: 'Seismic Monitor', target: 'Risk Analyzer', type: 'Data Transfer', message: 'Processing seismic data from 12 monitoring stations' },
    ];

    // Generate logs with timestamps going back
    for (let i = 0; i < 50; i++) {
      const template = logTemplates[i % logTemplates.length];
      const timestamp = new Date(now.getTime() - (i * 3000)); // 3 seconds apart
      
      logs.push({
        id: `log-${Date.now()}-${i}`,
        timestamp,
        sourceAgent: template.source,
        targetAgent: template.target,
        eventType: template.type,
        message: template.message,
        useCaseId: 'oilfield-land-lease',
        metadata: {
          region: ['Permian Basin', 'Eagle Ford', 'Bakken', 'Marcellus'][i % 4],
          severity: template.type === 'Error' ? 'high' : 'normal',
          dataSize: `${Math.floor(Math.random() * 500) + 100}KB`
        }
      });
    }
    
    return logs;
  };

  // Load initial logs
  useEffect(() => {
    // For demo purposes, always show oilfield data
    const demoLogs = generateOilfieldLogs();
    setLogs(demoLogs);
  }, [selectedUseCase]);

  // Subscribe to real-time updates
  useEffect(() => {
    const handleNewLog = (log: IntegrationLogEntry) => {
      if (selectedUseCase === 'all' || log.useCaseId === selectedUseCase) {
        setLogs(prev => [log, ...prev].slice(0, 100)); // Keep last 100 logs
      }
    };

    workflowEventsService.on('integrationLog', handleNewLog);
    
    return () => {
      workflowEventsService.off('integrationLog', handleNewLog);
    };
  }, [selectedUseCase]);

  // Filter logs
  useEffect(() => {
    let filtered = logs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.sourceAgent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.targetAgent.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Agent filter
    if (filterAgent !== 'all') {
      filtered = filtered.filter(log => 
        log.sourceAgent === filterAgent || log.targetAgent === filterAgent
      );
    }

    // Event type filter
    if (filterEventType !== 'all') {
      filtered = filtered.filter(log => log.eventType === filterEventType);
    }

    setFilteredLogs(filtered);
  }, [logs, searchQuery, filterAgent, filterEventType]);

  // Get unique agents and event types
  const agents = Array.from(new Set(logs.flatMap(log => [log.sourceAgent, log.targetAgent])));
  const eventTypes = Array.from(new Set(logs.map(log => log.eventType)));

  // Auto-refresh - disabled for demo to preserve dummy data
  useEffect(() => {
    if (!autoRefresh) return;

    // For demo purposes, don't actually refresh - just keep the dummy data
    // In production, this would call workflowEventsService.getIntegrationLogs()
    const interval = setInterval(() => {
      // Just trigger a re-render to simulate activity
      setLogs(prevLogs => [...prevLogs]);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedUseCase]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    // For demo purposes, regenerate dummy data instead of fetching
    const demoLogs = generateOilfieldLogs();
    setLogs(demoLogs);
    setTimeout(() => setLoading(false), 500);
  }, [selectedUseCase]);

  const handleExport = useCallback(() => {
    const csvContent = [
      ['Timestamp', 'Source Agent', 'Target Agent', 'Event Type', 'Message', 'Use Case'],
      ...filteredLogs.map(log => [
        format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        log.sourceAgent,
        log.targetAgent,
        log.eventType,
        log.message,
        log.useCaseId,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredLogs]);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'Data Transfer':
        return <ArrowsRightLeftIcon className="w-4 h-4" />;
      case 'Validation':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'Error':
        return <XCircleIcon className="w-4 h-4" />;
      case 'Connection':
        return <CpuChipIcon className="w-4 h-4" />;
      case 'Processing':
        return <ArrowPathIcon className="w-4 h-4" />;
      default:
        return <DocumentArrowDownIcon className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Data Transfer':
        return 'text-blue-500';
      case 'Validation':
        return 'text-green-500';
      case 'Error':
        return 'text-red-500';
      case 'Connection':
        return 'text-purple-500';
      case 'Processing':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  // Start simulation if no logs
  useEffect(() => {
    if (logs.length === 0 && selectedUseCase === 'oilfield-land-lease') {
      workflowEventsService.startWorkflowSimulation('oilfield-land-lease');
    }
  }, [logs.length, selectedUseCase]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <ArrowsRightLeftIcon className="w-8 h-8 mr-3 text-yellow-500" />
          Integration Log
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Real-time monitoring of agent communications and data flows
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Total Events</p>
          <p className="text-2xl font-bold text-white">{logs.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Data Transfers</p>
          <p className="text-2xl font-bold text-blue-500">
            {logs.filter(l => l.eventType === 'Data Transfer').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Validations</p>
          <p className="text-2xl font-bold text-green-500">
            {logs.filter(l => l.eventType === 'Validation').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Errors</p>
          <p className="text-2xl font-bold text-red-500">
            {logs.filter(l => l.eventType === 'Error').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Active Agents</p>
          <p className="text-2xl font-bold text-purple-500">{agents.length}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </h2>
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm text-gray-400">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto-refresh
            </label>
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={loading}>
              <ArrowPathIcon className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Agent</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none appearance-none pr-10"
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
              >
                <option value="all">All Agents</option>
                {agents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Event Type</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none appearance-none pr-10"
                value={filterEventType}
                onChange={(e) => setFilterEventType(e.target.value)}
              >
                <option value="all">All Types</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* Logs */}
      <Card className="overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                {logs.length === 0 ? (
                  <div>
                    <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p>No integration logs yet.</p>
                    {selectedUseCase === 'oilfield-land-lease' && (
                      <p className="text-sm mt-2">Deploy the workflow to see real-time logs.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p>No logs match your filters.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-900/30 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${getEventTypeColor(log.eventType)}`}>
                        {getEventTypeIcon(log.eventType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-white">
                              {log.sourceAgent}
                            </span>
                            <ArrowsRightLeftIcon className="w-3 h-3 text-gray-500" />
                            <span className="text-sm font-medium text-white">
                              {log.targetAgent}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(log.timestamp, 'HH:mm:ss.SSS')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{log.message}</p>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(log.metadata).map(([key, value]) => (
                              <span key={key} className="text-xs bg-gray-800 px-2 py-1 rounded">
                                {key}: {JSON.stringify(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.eventType === 'Error' ? 'bg-red-500/20 text-red-400' :
                        log.eventType === 'Validation' ? 'bg-green-500/20 text-green-400' :
                        log.eventType === 'Connection' ? 'bg-purple-500/20 text-purple-400' :
                        log.eventType === 'Processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {log.eventType}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};

export default IntegrationLogEnhanced;