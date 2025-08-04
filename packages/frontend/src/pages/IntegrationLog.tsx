import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentMagnifyingGlassIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { JsonModal } from '../components/ui/JsonModal';
import { mockIntegrationLogService } from '../services/mockIntegrationLog.service';
import type { IntegrationLogEntry, IntegrationLogFilters, IntegrationLogStats } from '../types/integration.types';

const IntegrationLog: React.FC = () => {
  const [logs, setLogs] = useState<IntegrationLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<IntegrationLogStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<IntegrationLogEntry | null>(null);
  const [showPayloadModal, setShowPayloadModal] = useState(false);
  
  const [filters, setFilters] = useState<IntegrationLogFilters>({
    dateRange: {
      start: null,
      end: null,
    },
    status: 'all',
    source: 'all',
    destination: 'all',
    messageType: 'all',
    searchQuery: '',
  });

  const pageSize = 25;

  // Fetch logs
  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  // Listen for real-time log updates
  useEffect(() => {
    const handleLogUpdate = (event: CustomEvent) => {
      // Refresh logs when new logs are added
      fetchLogs();
    };

    window.addEventListener('integration-logs-updated', handleLogUpdate as EventListener);
    
    return () => {
      window.removeEventListener('integration-logs-updated', handleLogUpdate as EventListener);
    };
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await mockIntegrationLogService.getIntegrationLogs({
        page: currentPage,
        pageSize,
        filters,
      });
      setLogs(response.data);
      setTotalPages(response.pagination.totalPages);
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching integration logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const { sources, destinations, messageTypes } = useMemo(() => {
    const allLogs = mockIntegrationLogService.getAllLogs();
    return {
      sources: [...new Set(allLogs.map((log: IntegrationLogEntry) => log.source))] as string[],
      destinations: [...new Set(allLogs.map((log: IntegrationLogEntry) => log.destination))] as string[],
      messageTypes: [...new Set(allLogs.map((log: IntegrationLogEntry) => log.messageType))] as string[],
    };
  }, []);

  const handleFilterChange = (key: keyof IntegrationLogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleExport = () => {
    const csvContent = mockIntegrationLogService.exportToCSV(logs);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewPayload = (log: IntegrationLogEntry) => {
    setSelectedLog(log);
    setShowPayloadModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failure':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <ArrowsRightLeftIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Integration Log
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Monitor and analyze system integrations and data flows
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-400 mb-1">Total Messages</p>
            <p className="text-2xl font-bold text-white">{stats.totalMessages.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-400 mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-green-500">
              {((stats.successCount / stats.totalMessages) * 100).toFixed(1)}%
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-400 mb-1">Failures</p>
            <p className="text-2xl font-bold text-red-500">{stats.failureCount.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-400 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.pendingCount.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-400 mb-1">Avg Processing</p>
            <p className="text-2xl font-bold text-white">{stats.averageProcessingTime.toFixed(0)}ms</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-400 mb-1">Data Transferred</p>
            <p className="text-2xl font-bold text-white">{formatBytes(stats.totalDataTransferred)}</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </h2>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" onClick={handleRefresh}>
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
            <Input
              placeholder="Search logs..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Source</label>
            <select
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
            >
              <option value="all">All Sources</option>
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Destination</label>
            <select
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
              value={filters.destination}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
            >
              <option value="all">All Destinations</option>
              {destinations.map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Message Type</label>
            <select
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
              value={filters.messageType}
              onChange={(e) => handleFilterChange('messageType', e.target.value)}
            >
              <option value="all">All Types</option>
              {messageTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Date Range</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
              onChange={(e) => handleFilterChange('dateRange', {
                ...filters.dateRange,
                start: e.target.value ? new Date(e.target.value) : null
              })}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Processing
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className={`ml-2 text-sm capitalize ${
                          log.status === 'success' ? 'text-green-500' :
                          log.status === 'failure' ? 'text-red-500' :
                          'text-yellow-500'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{log.source}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{log.destination}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{log.messageType}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{formatBytes(log.messageSize)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{log.processingTime}ms</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewPayload(log)}
                      >
                        <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-gray-900/30 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, stats?.totalMessages || 0)} of {stats?.totalMessages || 0} entries
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
      </Card>

      {/* Payload Modal */}
      {selectedLog && (
        <JsonModal
          isOpen={showPayloadModal}
          onClose={() => setShowPayloadModal(false)}
          title="Message Payload"
          data={{
            messageDetails: {
              id: selectedLog.id,
              timestamp: format(new Date(selectedLog.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS'),
              source: selectedLog.source,
              destination: selectedLog.destination,
              type: selectedLog.messageType,
              size: formatBytes(selectedLog.messageSize),
              status: selectedLog.status,
              processingTime: `${selectedLog.processingTime}ms`,
              correlationId: selectedLog.metadata.correlationId,
            },
            ...(selectedLog.errorMessage && { error: selectedLog.errorMessage }),
            payload: selectedLog.payload,
            metadata: selectedLog.metadata,
          }}
        />
      )}
    </div>
  );
};

export default IntegrationLog;