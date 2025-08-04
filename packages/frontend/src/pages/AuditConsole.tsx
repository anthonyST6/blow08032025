import React, { useState, useEffect, useCallback } from 'react';
import {
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  UserIcon,
  ServerIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/ui/Modal';
import { mockAuditConsoleService } from '../services/mockAuditConsole.service';
import { AuditLogEntry, AuditLogFilters, AuditLogStats } from '../types/integration.types';

const AuditConsole: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState<{
    users: Array<{ id: string; name: string }>;
    actions: string[];
    resources: string[];
  }>({ users: [], actions: [], resources: [] });

  // Filters
  const [filters, setFilters] = useState<AuditLogFilters>({
    dateRange: {
      start: null,
      end: null,
    },
    userId: 'all',
    action: 'all',
    resource: 'all',
    result: 'all',
    searchQuery: '',
  });

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await mockAuditConsoleService.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };
    loadFilterOptions();
  }, []);

  // Load audit logs
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await mockAuditConsoleService.getAuditLogs(currentPage, 25, filters);
      setLogs(response.items);
      setTotalPages(response.totalPages);
      
      const statsData = await mockAuditConsoleService.getAuditStats(filters);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Listen for real-time audit log updates
  useEffect(() => {
    const handleAuditUpdate = (event: CustomEvent) => {
      // Refresh logs when new audit logs are added
      loadLogs();
    };

    window.addEventListener('audit-logs-updated', handleAuditUpdate as EventListener);
    
    return () => {
      window.removeEventListener('audit-logs-updated', handleAuditUpdate as EventListener);
    };
  }, [loadLogs]);

  // Handle filter changes
  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle date range change
  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: value ? new Date(value) : null,
      },
    }));
    setCurrentPage(1);
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      const csv = await mockAuditConsoleService.exportAuditLogs(filters);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  // Refresh logs
  const handleRefresh = async () => {
    await mockAuditConsoleService.refreshAuditLogs();
    loadLogs();
  };

  // View log details
  const viewLogDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <DocumentMagnifyingGlassIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Audit Console
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Track user actions, system events, and security audit trails
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Actions</p>
                <p className="text-2xl font-bold text-white">{stats.totalActions.toLocaleString()}</p>
              </div>
              <ServerIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-vanguard-green">
                  {stats.totalActions > 0 
                    ? ((stats.successCount / stats.totalActions) * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-vanguard-green opacity-50" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Failed Actions</p>
                <p className="text-2xl font-bold text-vanguard-red">{stats.failureCount.toLocaleString()}</p>
              </div>
              <XCircleIcon className="w-8 h-8 text-vanguard-red opacity-50" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Unique Users</p>
                <p className="text-2xl font-bold text-vanguard-blue">{stats.uniqueUsers}</p>
              </div>
              <UserIcon className="w-8 h-8 text-vanguard-blue opacity-50" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
            Filters
          </h3>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" onClick={handleRefresh}>
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={handleExport}>
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Start Date</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">End Date</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">User</label>
            <select
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
            >
              <option value="all">All Users</option>
              {filterOptions.users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
            >
              <option value="all">All Actions</option>
              {filterOptions.actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Result</label>
            <select
              value={filters.result}
              onChange={(e) => handleFilterChange('result', e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
            >
              <option value="all">All Results</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Search</label>
            <Input
              placeholder="Search logs..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Audit Logs</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-seraphim-gold"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Resource</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Result</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">IP Address</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-300">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-2 text-gray-500" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">{log.userName}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{log.action}</td>
                      <td className="py-3 px-4 text-sm text-gray-300 max-w-xs truncate" title={log.resource}>
                        {log.resource}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.result === 'success'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {log.result === 'success' ? (
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircleIcon className="w-3 h-3 mr-1" />
                          )}
                          {log.result}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">{log.ipAddress}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{log.duration}ms</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => viewLogDetails(log)}
                        >
                          View Details
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Showing {logs.length} of {stats?.totalActions || 0} total logs
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Audit Log Details"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">Basic Information</h4>
              <div className="bg-black/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">ID:</span>
                  <span className="text-sm text-white font-mono">{selectedLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Timestamp:</span>
                  <span className="text-sm text-white">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">User:</span>
                  <span className="text-sm text-white">{selectedLog.userName} ({selectedLog.userId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Action:</span>
                  <span className="text-sm text-white">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Resource:</span>
                  <span className="text-sm text-white">{selectedLog.resource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Result:</span>
                  <span className={`text-sm font-medium ${
                    selectedLog.result === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedLog.result}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">Request Details</h4>
              <div className="bg-black/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">IP Address:</span>
                  <span className="text-sm text-white font-mono">{selectedLog.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">User Agent:</span>
                  <span className="text-sm text-white truncate max-w-xs" title={selectedLog.userAgent}>
                    {selectedLog.userAgent}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Duration:</span>
                  <span className="text-sm text-white">{selectedLog.duration}ms</span>
                </div>
              </div>
            </div>

            {selectedLog.errorDetails && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Error Details</h4>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-sm text-red-400">{selectedLog.errorDetails}</p>
                </div>
              </div>
            )}

            {selectedLog.changes && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Changes</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Before</p>
                    <pre className="bg-black/50 rounded-lg p-3 text-xs text-gray-300 overflow-auto">
                      {JSON.stringify(selectedLog.changes.before, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">After</p>
                    <pre className="bg-black/50 rounded-lg p-3 text-xs text-gray-300 overflow-auto">
                      {JSON.stringify(selectedLog.changes.after, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">Metadata</h4>
              <pre className="bg-black/50 rounded-lg p-3 text-xs text-gray-300 overflow-auto">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditConsole;