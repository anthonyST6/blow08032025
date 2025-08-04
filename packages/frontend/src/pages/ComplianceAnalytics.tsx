import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { chartOptions } from '../utils/chartConfig';

interface ComplianceMetrics {
  overview: {
    complianceScore: number;
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    pendingChecks: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  complianceByCategory: {
    category: string;
    score: number;
    checks: number;
    passed: number;
    failed: number;
  }[];
  complianceTimeline: {
    date: string;
    score: number;
    checks: number;
    violations: number;
  }[];
  regulatoryFrameworks: {
    framework: string;
    compliance: number;
    requirements: number;
    met: number;
    gaps: number;
  }[];
  recentViolations: {
    id: string;
    description: string;
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    framework: string;
    detectedAt: Date;
    status: 'open' | 'resolved' | 'mitigated';
  }[];
  complianceByDepartment: {
    department: string;
    score: number;
    violations: number;
  }[];
}

const ComplianceAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');

  // Fetch compliance analytics data
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['compliance-analytics', timeRange, selectedFramework],
    queryFn: async () => {
      const response = await api.get('/api/analytics/compliance', {
        params: { timeRange, framework: selectedFramework }
      });
      return response.data as ComplianceMetrics;
    }
  });

  if (isLoading || !metrics) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Chart data
  const complianceTimelineData = {
    labels: metrics.complianceTimeline.map(c => c.date),
    datasets: [
      {
        label: 'Compliance Score',
        data: metrics.complianceTimeline.map(c => c.score),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Violations',
        data: metrics.complianceTimeline.map(c => c.violations),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        yAxisID: 'y1',
      }
    ]
  };

  const categoryScoreData = {
    labels: metrics.complianceByCategory.map(c => c.category),
    datasets: [{
      label: 'Compliance Score',
      data: metrics.complianceByCategory.map(c => c.score),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(250, 204, 21, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const frameworkData = {
    labels: metrics.regulatoryFrameworks.map(f => f.framework),
    datasets: [{
      label: 'Compliance %',
      data: metrics.regulatoryFrameworks.map(f => f.compliance),
      backgroundColor: 'rgba(99, 102, 241, 0.5)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 1
    }]
  };

  const departmentData = {
    labels: metrics.complianceByDepartment.map(d => d.department),
    datasets: [{
      data: metrics.complianceByDepartment.map(d => d.score),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ]
    }]
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'low':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'mitigated':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'open':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance Analytics</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor regulatory compliance and track adherence to policies
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Framework:</label>
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Frameworks</option>
            <option value="gdpr">GDPR</option>
            <option value="hipaa">HIPAA</option>
            <option value="sox">SOX</option>
            <option value="pci-dss">PCI-DSS</option>
            <option value="iso27001">ISO 27001</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Compliance Score</h3>
          <p className={`mt-2 text-3xl font-bold ${getScoreColor(metrics.overview.complianceScore)}`}>
            {metrics.overview.complianceScore}%
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span className={metrics.overview.trend === 'improving' ? 'text-green-600' : metrics.overview.trend === 'declining' ? 'text-red-600' : 'text-gray-600'}>
              {metrics.overview.trend === 'improving' ? '↑' : metrics.overview.trend === 'declining' ? '↓' : '→'} {metrics.overview.trend}
            </span>
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Checks</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {metrics.overview.totalChecks}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Compliance checks
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Passed</h3>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {metrics.overview.passedChecks}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {((metrics.overview.passedChecks / metrics.overview.totalChecks) * 100).toFixed(1)}% pass rate
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</h3>
          <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
            {metrics.overview.failedChecks}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Violations found
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {metrics.overview.pendingChecks}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Awaiting review
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Compliance Trend
          </h2>
          <Line data={complianceTimelineData} options={{
            ...chartOptions,
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Compliance Score %'
                },
                min: 0,
                max: 100
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Violations'
                },
                grid: {
                  drawOnChartArea: false
                }
              }
            }
          }} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Compliance by Category
          </h2>
          <Doughnut data={categoryScoreData} options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                position: 'right'
              }
            }
          }} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Regulatory Framework Compliance
          </h2>
          <Bar data={frameworkData} options={{
            ...chartOptions,
            scales: {
              y: {
                min: 0,
                max: 100,
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                }
              }
            }
          }} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Department Compliance
          </h2>
          <PolarArea data={departmentData} options={chartOptions} />
        </div>
      </div>

      {/* Framework Details */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Regulatory Framework Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.regulatoryFrameworks.map((framework) => (
              <div key={framework.framework} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{framework.framework}</h3>
                  <span className={`text-2xl font-bold ${getScoreColor(framework.compliance)}`}>
                    {framework.compliance}%
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Requirements:</span>
                    <span className="text-gray-900 dark:text-white">{framework.requirements}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Met:</span>
                    <span className="text-green-600 dark:text-green-400">{framework.met}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Gaps:</span>
                    <span className="text-red-600 dark:text-red-400">{framework.gaps}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${framework.compliance}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Violations */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Violations
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Framework
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Detected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {metrics.recentViolations.map((violation) => (
                  <tr key={violation.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="max-w-xs truncate">{violation.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {violation.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {violation.framework}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(violation.severity)}`}>
                        {violation.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(violation.detectedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(violation.status)}`}>
                        {violation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Compliance by Category Details */}
      <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Category Breakdown
        </h2>
        <div className="space-y-4">
          {metrics.complianceByCategory.map((category) => (
            <div key={category.category}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {category.category}
                </span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {category.checks} checks
                  </span>
                  <span className={`font-medium ${getScoreColor(category.score)}`}>
                    {category.score}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 flex overflow-hidden">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${(category.passed / category.checks) * 100}%` }}
                />
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${(category.failed / category.checks) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{category.passed} passed</span>
                <span>{category.failed} failed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceAnalytics;