import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface ComplianceReport {
  id: string;
  title: string;
  description: string;
  type: 'regulatory' | 'internal' | 'external' | 'incident';
  status: 'draft' | 'review' | 'approved' | 'published';
  framework: string;
  period: {
    start: Date;
    end: Date;
  };
  sections: {
    id: string;
    title: string;
    content: string;
    status: 'complete' | 'incomplete';
  }[];
  metrics: {
    complianceScore: number;
    totalFindings: number;
    criticalFindings: number;
    resolvedFindings: number;
  };
  attachments: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  reviewers: {
    uid: string;
    displayName: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    reviewedAt?: Date;
  }[];
  createdBy: {
    uid: string;
    displayName: string;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const ComplianceReports: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    framework: 'all',
    search: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ['compliance-reports', filters],
    queryFn: async () => {
      const response = await api.get('/api/compliance/reports', {
        params: filters
      });
      return response.data as ComplianceReport[];
    }
  });

  // Delete report
  const deleteReportMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/compliance/reports/${id}`);
    },
    onSuccess: () => {
      toast.success('Report deleted');
      queryClient.invalidateQueries({ queryKey: ['compliance-reports'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    }
  });

  // Duplicate report
  const duplicateReportMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/compliance/reports/${id}/duplicate`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Report duplicated');
      queryClient.invalidateQueries({ queryKey: ['compliance-reports'] });
      navigate(`/compliance/reports/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate report');
    }
  });

  // Export report
  const exportReport = async (id: string, format: 'pdf' | 'docx') => {
    try {
      const response = await api.get(`/api/compliance/reports/${id}/export`, {
        params: { format },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compliance-report-${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'regulatory':
        return '⚖️';
      case 'internal':
        return '🏢';
      case 'external':
        return '🌐';
      case 'incident':
        return '🚨';
      default:
        return '📄';
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredReports = reports?.filter(report => {
    if (filters.status !== 'all' && report.status !== filters.status) return false;
    if (filters.type !== 'all' && report.type !== filters.type) return false;
    if (filters.framework !== 'all' && report.framework !== filters.framework) return false;
    if (filters.search && !report.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !report.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const formatPeriod = (start: Date, end: Date) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  const getCompletionPercentage = (sections: any[]) => {
    if (!sections || sections.length === 0) return 0;
    const completed = sections.filter(s => s.status === 'complete').length;
    return Math.round((completed / sections.length) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance Reports</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage compliance reports for various frameworks
            </p>
          </div>
          <button
            onClick={() => navigate('/compliance/reports/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Report
          </button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search reports..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="review">In Review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="regulatory">Regulatory</option>
              <option value="internal">Internal</option>
              <option value="external">External</option>
              <option value="incident">Incident</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Framework
            </label>
            <select
              value={filters.framework}
              onChange={(e) => setFilters(prev => ({ ...prev, framework: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Frameworks</option>
              <option value="GDPR">GDPR</option>
              <option value="HIPAA">HIPAA</option>
              <option value="SOC2">SOC 2</option>
              <option value="ISO27001">ISO 27001</option>
              <option value="NIST">NIST</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Reports Display */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : filteredReports && filteredReports.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/compliance/reports/${report.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(report.type)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="relative group">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      ⋮
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportReport(report.id, 'pdf');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportReport(report.id, 'docx');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Export as DOCX
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateReportMutation.mutate(report.id);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this report?')) {
                            deleteReportMutation.mutate(report.id);
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {report.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Framework</span>
                    <span className="font-medium text-gray-900 dark:text-white">{report.framework}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Period</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatPeriod(report.period.start, report.period.end)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Compliance Score</span>
                    <span className={`font-bold ${getComplianceScoreColor(report.metrics.complianceScore)}`}>
                      {report.metrics.complianceScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Completion</span>
                    <span className="text-gray-900 dark:text-white">
                      {getCompletionPercentage(report.sections)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getCompletionPercentage(report.sections)}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Summary */}
                <div className="mt-4 flex items-center gap-4 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {report.metrics.totalFindings} findings
                  </span>
                  {report.metrics.criticalFindings > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      {report.metrics.criticalFindings} critical
                    </span>
                  )}
                  <span className="text-green-600 dark:text-green-400">
                    {report.metrics.resolvedFindings} resolved
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/compliance/reports/${report.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getTypeIcon(report.type)}</span>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {report.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {report.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getComplianceScoreColor(report.metrics.complianceScore)}`}>
                        {report.metrics.complianceScore}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Compliance Score</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportReport(report.id, 'pdf');
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Export as PDF"
                      >
                        📄
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateReportMutation.mutate(report.id);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this report?')) {
                            deleteReportMutation.mutate(report.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No compliance reports found</p>
          <button
            onClick={() => navigate('/compliance/reports/new')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create First Report
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplianceReports;