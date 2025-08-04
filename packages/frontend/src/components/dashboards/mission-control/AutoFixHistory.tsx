import React, { useState, useEffect } from 'react';
import {
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserIcon,
  CalendarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { api } from '../../../services/api';

interface AutoFixHistoryItem {
  id: string;
  type: 'security' | 'integrity' | 'accuracy';
  action: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  executedBy: string;
  issuesFixed: number;
  details: string;
  duration: number; // in seconds
}

const AutoFixHistory: React.FC = () => {
  const [history, setHistory] = useState<AutoFixHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data
  const mockHistory: AutoFixHistoryItem[] = [
    {
      id: '1',
      type: 'security',
      action: 'Updated SSL certificates',
      status: 'success',
      timestamp: '2024-02-01T14:30:00Z',
      executedBy: 'System',
      issuesFixed: 3,
      details: 'Renewed SSL certificates for 3 internal APIs',
      duration: 45,
    },
    {
      id: '2',
      type: 'integrity',
      action: 'Synchronized database records',
      status: 'success',
      timestamp: '2024-02-01T12:15:00Z',
      executedBy: 'System',
      issuesFixed: 8,
      details: 'Fixed data consistency issues between primary and backup databases',
      duration: 120,
    },
    {
      id: '3',
      type: 'accuracy',
      action: 'Recalculated production metrics',
      status: 'success',
      timestamp: '2024-02-01T10:00:00Z',
      executedBy: 'john.doe@company.com',
      issuesFixed: 5,
      details: 'Corrected aggregation formulas for daily production volumes',
      duration: 90,
    },
    {
      id: '4',
      type: 'security',
      action: 'Reset compromised credentials',
      status: 'failed',
      timestamp: '2024-01-31T16:45:00Z',
      executedBy: 'System',
      issuesFixed: 0,
      details: 'Failed to reset credentials - insufficient permissions',
      duration: 15,
    },
    {
      id: '5',
      type: 'integrity',
      action: 'Rebuild audit trail index',
      status: 'success',
      timestamp: '2024-01-31T14:20:00Z',
      executedBy: 'System',
      issuesFixed: 12,
      details: 'Rebuilt missing audit trail entries for the past 30 days',
      duration: 180,
    },
    {
      id: '6',
      type: 'accuracy',
      action: 'Validate lease boundaries',
      status: 'pending',
      timestamp: '2024-02-01T15:00:00Z',
      executedBy: 'System',
      issuesFixed: 0,
      details: 'Scheduled validation of lease boundary coordinates',
      duration: 0,
    },
  ];

  useEffect(() => {
    loadHistory();
  }, [filter, timeRange]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      // In production, this would fetch real data
      // const response = await api.get('/v2/certifications/auto-fix/history', {
      //   params: { filter, timeRange }
      // });
      // setHistory(response.data.data);
      
      // Filter mock data
      let filtered = mockHistory;
      if (filter !== 'all') {
        filtered = filtered.filter(item => item.status === filter);
      }
      
      setHistory(filtered);
    } catch (error) {
      console.error('Failed to load auto-fix history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return ShieldCheckIcon;
      case 'integrity':
        return ShieldExclamationIcon;
      case 'accuracy':
        return CheckCircleIcon;
      default:
        return WrenchScrewdriverIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'text-blue-600 bg-blue-100';
      case 'integrity':
        return 'text-green-600 bg-green-100';
      case 'accuracy':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return CheckCircleIcon;
      case 'failed':
        return XCircleIcon;
      case 'pending':
        return ClockIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const stats = {
    total: history.length,
    success: history.filter(h => h.status === 'success').length,
    failed: history.filter(h => h.status === 'failed').length,
    pending: history.filter(h => h.status === 'pending').length,
    issuesFixed: history.reduce((sum, h) => sum + h.issuesFixed, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Fixes</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Successful</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{stats.success}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Failed</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Issues Fixed</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats.issuesFixed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'success'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'failed'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Failed
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'pending'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Pending
          </button>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* History List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Auto-Fix History</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {history.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            const StatusIcon = getStatusIcon(item.status);
            
            return (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{item.action}</h4>
                        <p className="mt-1 text-sm text-gray-600">{item.details}</p>
                        
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            {item.executedBy}
                          </div>
                          
                          {item.duration > 0 && (
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {formatDuration(item.duration)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {item.issuesFixed > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.issuesFixed} fixed
                          </span>
                        )}
                        
                        <div className={`flex items-center gap-1 ${getStatusColor(item.status)}`}>
                          <StatusIcon className="h-5 w-5" />
                          <span className="text-sm font-medium capitalize">{item.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {history.length === 0 && (
          <div className="text-center py-12">
            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No auto-fix history</h3>
            <p className="mt-1 text-sm text-gray-500">
              No automated fixes have been applied in the selected time range.
            </p>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={loadHistory}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default AutoFixHistory;