import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  ChartBarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { api } from '../../../services/api';

interface IssueBreakdownProps {
  filters: any;
  searchQuery: string;
}

interface IssueStats {
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byType: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
  };
  trends: {
    date: string;
    count: number;
  }[];
}

const IssueBreakdown: React.FC<IssueBreakdownProps> = ({ filters, searchQuery }) => {
  const [stats, setStats] = useState<IssueStats>({
    bySeverity: {
      critical: 3,
      high: 8,
      medium: 12,
      low: 5,
    },
    byType: {
      security: 10,
      integrity: 8,
      accuracy: 10,
    },
    byStatus: {
      open: 18,
      in_progress: 5,
      resolved: 5,
    },
    trends: [
      { date: '2024-01-26', count: 15 },
      { date: '2024-01-27', count: 18 },
      { date: '2024-01-28', count: 22 },
      { date: '2024-01-29', count: 20 },
      { date: '2024-01-30', count: 25 },
      { date: '2024-01-31', count: 23 },
      { date: '2024-02-01', count: 28 },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'severity' | 'type' | 'status'>('severity');

  useEffect(() => {
    loadStats();
  }, [filters, searchQuery]);

  const loadStats = async () => {
    try {
      setLoading(true);
      // In production, this would fetch real data
      // const response = await api.get('/v2/certifications/issues/stats', { params: filters });
      // setStats(response.data.data);
      
      // Keep mock data for now
      setTimeout(() => setLoading(false), 500);
    } catch (error) {
      console.error('Failed to load issue stats:', error);
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return ExclamationCircleIcon;
      case 'high':
        return ExclamationTriangleIcon;
      case 'medium':
      case 'low':
        return InformationCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
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
        return ShieldExclamationIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'bg-blue-500';
      case 'integrity':
        return 'bg-green-500';
      case 'accuracy':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const totalIssues = Object.values(stats.bySeverity).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('severity')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedView === 'severity'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            By Severity
          </button>
          <button
            onClick={() => setSelectedView('type')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedView === 'type'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            By Type
          </button>
          <button
            onClick={() => setSelectedView('status')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedView === 'status'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            By Status
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          Total Issues: <span className="font-medium text-gray-900">{totalIssues}</span>
        </div>
      </div>

      {/* Breakdown by Severity */}
      {selectedView === 'severity' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Severity</h3>
          <div className="space-y-4">
            {Object.entries(stats.bySeverity).map(([severity, count]) => {
              const Icon = getSeverityIcon(severity);
              const percentage = totalIssues > 0 ? (count / totalIssues) * 100 : 0;
              
              return (
                <div key={severity}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${
                        severity === 'critical' ? 'text-red-600' :
                        severity === 'high' ? 'text-orange-600' :
                        severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {severity}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getSeverityColor(severity)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Breakdown by Type */}
      {selectedView === 'type' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.byType).map(([type, count]) => {
              const Icon = getTypeIcon(type);
              const percentage = totalIssues > 0 ? (count / totalIssues) * 100 : 0;
              
              return (
                <div key={type} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`h-8 w-8 ${
                      type === 'security' ? 'text-blue-600' :
                      type === 'integrity' ? 'text-green-600' :
                      'text-orange-600'
                    }`} />
                    <span className="text-2xl font-bold text-gray-900">{count}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 capitalize mb-2">{type}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getTypeColor(type)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Breakdown by Status */}
      {selectedView === 'status' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Status</h3>
          <div className="space-y-4">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const percentage = totalIssues > 0 ? (count / totalIssues) * 100 : 0;
              
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStatusColor(status)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Trend (Last 7 Days)</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {stats.trends.map((day, index) => {
            const maxCount = Math.max(...stats.trends.map(d => d.count));
            const height = (day.count / maxCount) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height}%` }} />
                <div className="text-xs text-gray-500 mt-2 -rotate-45 origin-left">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs font-medium text-gray-900 mt-1">{day.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Critical Issues</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats.bySeverity.critical}</p>
            </div>
            <ExclamationCircleIcon className="h-8 w-8 text-red-200" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Open Issues</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">{stats.byStatus.open}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">In Progress</p>
              <p className="mt-1 text-2xl font-bold text-yellow-600">{stats.byStatus.in_progress}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Resolved</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{stats.byStatus.resolved}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueBreakdown;