import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  ShieldCheckIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  DocumentCheckIcon,
  UserIcon,
  CpuChipIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { useUseCaseContext } from '../contexts/UseCaseContext';
import { workflowEventsService, AuditLogEntry } from '../services/workflowEvents.service';
import { motion, AnimatePresence } from 'framer-motion';

const AuditConsoleEnhanced: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Get use case context
  let selectedUseCase = 'all';
  try {
    const context = useUseCaseContext();
    selectedUseCase = context?.selectedUseCase || 'all';
  } catch (err) {
    console.log('UseCaseContext not available');
  }

  // Generate dummy oilfield lease audit logs for demo
  const generateOilfieldAuditLogs = (): AuditLogEntry[] => {
    const now = new Date();
    const logs: AuditLogEntry[] = [];
    
    // Generate realistic oilfield lease audit logs
    const auditTemplates: Array<{agent: string, action: string, status: 'success' | 'warning' | 'error', message: string}> = [
      { agent: 'Compliance Validator', action: 'Regulatory Verification', status: 'success', message: 'Verified compliance with Texas Railroad Commission regulations for Block 42' },
      { agent: 'Document Analyzer', action: 'Lease Analysis', status: 'success', message: 'Successfully analyzed 47 lease documents for Permian Basin properties' },
      { agent: 'Environmental Monitor', action: 'Impact Assessment', status: 'warning', message: 'Detected potential environmental concern near Well Site #127 - requires review' },
      { agent: 'Title Verifier', action: 'Title Verification', status: 'success', message: 'Clear title confirmed for Section 18, Township 2N, Range 3E' },
      { agent: 'Risk Analyzer', action: 'Risk Analysis', status: 'success', message: 'Completed risk assessment for Eagle Ford drilling operations' },
      { agent: 'Safety Inspector', action: 'Safety Validation', status: 'success', message: 'All 23 active drilling sites passed safety compliance checks' },
      { agent: 'Contract Validator', action: 'Contract Verification', status: 'warning', message: 'Force majeure clause requires update in 3 Bakken leases' },
      { agent: 'Royalty Auditor', action: 'Payment Validation', status: 'success', message: 'Verified Q3 2024 royalty calculations: $2.3M distributed to 147 stakeholders' },
      { agent: 'Boundary Validator', action: 'Boundary Verification', status: 'success', message: 'GIS validation complete: all lease boundaries match county records' },
      { agent: 'Production Monitor', action: 'Production Analysis', status: 'success', message: 'Daily production target met: 2,847 barrels from Eagle Ford operations' },
      { agent: 'Permit Validator', action: 'Permit Verification', status: 'error', message: 'Drilling permit expired for Well #89 - immediate renewal required' },
      { agent: 'Insurance Auditor', action: 'Coverage Validation', status: 'success', message: 'All active wells have current liability insurance coverage' },
      { agent: 'Water Rights Validator', action: 'Water Rights Analysis', status: 'success', message: 'Water usage within permitted limits for all fracking operations' },
      { agent: 'Tax Compliance', action: 'Tax Verification', status: 'success', message: 'Severance tax calculations verified for Q3 2024: $847,293' },
      { agent: 'Seismic Monitor', action: 'Seismic Analysis', status: 'success', message: 'No concerning seismic activity detected in active drilling zones' },
    ];

    // Generate logs with timestamps going back
    for (let i = 0; i < 40; i++) {
      const template = auditTemplates[i % auditTemplates.length];
      const timestamp = new Date(now.getTime() - (i * 5000)); // 5 seconds apart
      
      logs.push({
        id: `audit-${Date.now()}-${i}`,
        timestamp,
        agent: template.agent,
        action: template.action,
        status: template.status,
        message: template.message,
        useCaseId: 'oilfield-land-lease',
        workflowId: `WF-${Math.floor(1000 + Math.random() * 9000)}`,
        metadata: {
          region: ['Permian Basin', 'Eagle Ford', 'Bakken', 'Marcellus'][i % 4],
          operator: ['ChevronTex', 'ExxonMobil', 'ConocoPhillips', 'EOG Resources'][i % 4],
          severity: template.status === 'error' ? 'high' : template.status === 'warning' ? 'medium' : 'low'
        }
      });
    }
    
    return logs;
  };

  // Load initial logs
  useEffect(() => {
    // For demo purposes, always show oilfield data
    const demoLogs = generateOilfieldAuditLogs();
    setLogs(demoLogs);
  }, [selectedUseCase]);

  // Subscribe to real-time updates
  useEffect(() => {
    const handleNewLog = (log: AuditLogEntry) => {
      if (selectedUseCase === 'all' || log.useCaseId === selectedUseCase) {
        setLogs(prev => [log, ...prev].slice(0, 100)); // Keep last 100 logs
      }
    };

    workflowEventsService.on('auditLog', handleNewLog);
    
    return () => {
      workflowEventsService.off('auditLog', handleNewLog);
    };
  }, [selectedUseCase]);

  // Filter logs
  useEffect(() => {
    let filtered = logs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Agent filter
    if (filterAgent !== 'all') {
      filtered = filtered.filter(log => log.agent === filterAgent);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => log.status === filterStatus);
    }

    setFilteredLogs(filtered);
  }, [logs, searchQuery, filterAgent, filterStatus]);

  // Get unique agents
  const agents = Array.from(new Set(logs.map(log => log.agent)));

  // Auto-refresh - disabled for demo to preserve dummy data
  useEffect(() => {
    if (!autoRefresh) return;

    // For demo purposes, don't actually refresh - just keep the dummy data
    const interval = setInterval(() => {
      // Just trigger a re-render to simulate activity
      setLogs(prevLogs => [...prevLogs]);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedUseCase]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    // For demo purposes, regenerate dummy data instead of fetching
    const demoLogs = generateOilfieldAuditLogs();
    setLogs(demoLogs);
    setTimeout(() => setLoading(false), 500);
  }, [selectedUseCase]);

  const handleExport = useCallback(() => {
    const csvContent = [
      ['Timestamp', 'Agent', 'Action', 'Status', 'Message', 'Use Case', 'Workflow ID'],
      ...filteredLogs.map(log => [
        format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        log.agent,
        log.action,
        log.status,
        log.message,
        log.useCaseId,
        log.workflowId || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredLogs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'error':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Validation') || action.includes('Verification')) {
      return <ShieldCheckIcon className="w-4 h-4" />;
    } else if (action.includes('Completion')) {
      return <CheckCircleIcon className="w-4 h-4" />;
    } else if (action.includes('Analysis')) {
      return <DocumentCheckIcon className="w-4 h-4" />;
    } else {
      return <CpuChipIcon className="w-4 h-4" />;
    }
  };

  // Calculate stats
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    warnings: logs.filter(l => l.status === 'warning').length,
    errors: logs.filter(l => l.status === 'error').length,
    activeAgents: agents.length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <ShieldCheckIcon className="w-8 h-8 mr-3 text-yellow-500" />
          Audit Console
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Compliance tracking and validation monitoring for all workflows
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Total Audits</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Successful</p>
          <p className="text-2xl font-bold text-green-500">{stats.success}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Warnings</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.warnings}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Errors</p>
          <p className="text-2xl font-bold text-red-500">{stats.errors}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Active Agents</p>
          <p className="text-2xl font-bold text-purple-500">{stats.activeAgents}</p>
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
              placeholder="Search audit logs..."
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
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none appearance-none pr-10"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                {logs.length === 0 ? (
                  <div>
                    <DocumentCheckIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p>No audit logs yet.</p>
                    {selectedUseCase === 'oilfield-land-lease' && (
                      <p className="text-sm mt-2">Deploy the workflow to see audit entries.</p>
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-900/30 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <UserIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-white">{log.agent}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-500">
                              {getActionIcon(log.action)}
                              <span className="text-sm">{log.action}</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(log.timestamp, 'HH:mm:ss')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{log.message}</p>
                        {log.workflowId && (
                          <div className="mt-2">
                            <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                              Workflow: {log.workflowId}
                            </span>
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={
                          log.status === 'success' ? 'success' :
                          log.status === 'warning' ? 'warning' :
                          'error'
                        }
                        size="small"
                      >
                        {log.status}
                      </Badge>
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

export default AuditConsoleEnhanced;