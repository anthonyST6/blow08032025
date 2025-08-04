import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import { AuditLog, ComplianceReport, Workflow, AgentAnalysis } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ClipboardCheckIcon,
  DocumentReportIcon,
  ExclamationIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  FilterIcon,
  CalendarIcon,
} from '@heroicons/react/outline';
import { Link } from 'react-router-dom';

const ComplianceReviewerDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({ start: 30, end: 0 }); // Last 30 days
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string[]>(['pending', 'in_review']);

  // Calculate date range
  const startDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - dateRange.start);
    return date;
  }, [dateRange.start]);

  const endDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - dateRange.end);
    return date;
  }, [dateRange.end]);

  // Fetch compliance reports
  const { data: complianceReports, isLoading: reportsLoading } = useQuery(
    ['complianceReports', startDate, endDate, complianceFilter],
    async () => {
      // This would normally fetch from the API
      return [] as ComplianceReport[];
    }
  );

  // Fetch recent audit logs
  const { data: auditLogs, isLoading: logsLoading } = useQuery(
    ['auditLogs', startDate, endDate],
    async () => {
      const response = await apiService.audit.list({
        startDate,
        endDate,
        limit: 100,
      });
      return response.data.data as AuditLog[];
    }
  );

  // Fetch pending reviews
  const { data: pendingReviews, isLoading: reviewsLoading } = useQuery(
    ['pendingReviews', statusFilter],
    async () => {
      // This would normally fetch analyses pending review
      return [] as AgentAnalysis[];
    }
  );

  // Fetch active workflows
  const { data: activeWorkflows, isLoading: workflowsLoading } = useQuery(
    'activeWorkflows',
    async () => {
      const response = await apiService.workflows.list();
      return response.data.data.filter((w: Workflow) => w.isActive) as Workflow[];
    }
  );

  const handleExportCompliance = async (format: 'csv' | 'pdf') => {
    try {
      const response = await apiService.audit.export(format as any, {
        startDate,
        endDate,
        type: 'compliance',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compliance-report-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting compliance report:', error);
    }
  };

  if (reportsLoading || logsLoading || reviewsLoading || workflowsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" message="Loading compliance data..." />
      </div>
    );
  }

  const getComplianceScore = () => {
    if (!auditLogs || auditLogs.length === 0) return 100;
    
    const violations = auditLogs.filter(log => 
      log.metadata?.severity === 'high' || log.metadata?.severity === 'critical'
    ).length;
    
    return Math.max(0, 100 - (violations * 5));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_review':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const complianceScore = getComplianceScore();
  const pendingCount = pendingReviews?.length || 0;
  const activeWorkflowCount = activeWorkflows?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and ensure AI system compliance with regulations
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleExportCompliance('csv')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => handleExportCompliance('pdf')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentReportIcon className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <select
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: parseInt(e.target.value) })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Compliance Area</label>
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Areas</option>
              <option value="gdpr">GDPR</option>
              <option value="hipaa">HIPAA</option>
              <option value="sox">SOX</option>
              <option value="pci">PCI-DSS</option>
              <option value="ai_ethics">AI Ethics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status Filter</label>
            <div className="mt-1 space-y-2">
              {['pending', 'in_review', 'approved', 'rejected'].map(status => (
                <label key={status} className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    checked={statusFilter.includes(status)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setStatusFilter([...statusFilter, status]);
                      } else {
                        setStatusFilter(statusFilter.filter(s => s !== status));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardCheckIcon className={`h-6 w-6 ${complianceScore >= 90 ? 'text-green-400' : complianceScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Compliance Score
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {complianceScore}%
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${complianceScore >= 90 ? 'text-green-600' : complianceScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {complianceScore >= 90 ? 'Excellent' : complianceScore >= 70 ? 'Good' : 'Needs Attention'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Reviews
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {pendingCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/compliance/reviews" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentReportIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Workflows
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {activeWorkflowCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/workflows" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Manage
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Last Audit
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {auditLogs && auditLogs.length > 0 
                      ? new Date(auditLogs[0].timestamp).toLocaleDateString()
                      : 'No audits yet'
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audit Activity */}
      {auditLogs && auditLogs.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Audit Activity</h2>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.slice(0, 10).map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.resourceType} - {log.resourceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.metadata?.severity && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.metadata.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          log.metadata.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          log.metadata.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {log.metadata.severity}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Link
              to="/audit/logs"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all audit logs →
            </Link>
          </div>
        </div>
      )}

      {/* Compliance Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Compliance Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/compliance/reviews"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <ClipboardCheckIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Review Pending Items</p>
              <p className="text-sm text-gray-500">
                {pendingCount} items awaiting review
              </p>
            </div>
          </Link>

          <Link
            to="/compliance/reports/new"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <DocumentReportIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Create Report</p>
              <p className="text-sm text-gray-500">Generate compliance documentation</p>
            </div>
          </Link>

          <Link
            to="/compliance/policies"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <FilterIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Manage Policies</p>
              <p className="text-sm text-gray-500">Update compliance rules</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Compliance Checklist</h2>
        <div className="space-y-3">
          {[
            { item: 'Data Privacy Assessment', status: 'completed', date: '2024-01-15' },
            { item: 'AI Ethics Review', status: 'in_progress', date: '2024-01-20' },
            { item: 'Security Audit', status: 'pending', date: '2024-02-01' },
            { item: 'Regulatory Filing', status: 'pending', date: '2024-02-15' },
            { item: 'User Consent Verification', status: 'completed', date: '2024-01-10' },
          ].map((task, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                {task.status === 'completed' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                ) : task.status === 'in_progress' ? (
                  <ClockIcon className="h-5 w-5 text-yellow-500 mr-3" />
                ) : (
                  <ExclamationIcon className="h-5 w-5 text-gray-400 mr-3" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.item}</p>
                  <p className="text-xs text-gray-500">Due: {task.date}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceReviewerDashboard;