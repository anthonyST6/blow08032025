import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line, Bar, Radar, Scatter } from 'react-chartjs-2';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { chartOptions } from '../utils/chartConfig';

interface RiskMetrics {
  overview: {
    totalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    averageRiskScore: number;
    riskTrend: 'increasing' | 'decreasing' | 'stable';
  };
  risksByCategory: {
    category: string;
    count: number;
    severity: number;
  }[];
  riskTimeline: {
    date: string;
    high: number;
    medium: number;
    low: number;
    total: number;
  }[];
  risksByAgent: {
    agent: string;
    risks: number;
    avgSeverity: number;
  }[];
  topRisks: {
    id: string;
    description: string;
    category: string;
    severity: 'high' | 'medium' | 'low';
    occurrences: number;
    lastDetected: Date;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  riskDistribution: {
    category: string;
    high: number;
    medium: number;
    low: number;
  }[];
}

const RiskAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch risk analytics data
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['risk-analytics', timeRange, selectedCategory],
    queryFn: async () => {
      const response = await api.get('/api/analytics/risks', {
        params: { timeRange, category: selectedCategory }
      });
      return response.data as RiskMetrics;
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
  const riskTimelineData = {
    labels: metrics.riskTimeline.map(r => r.date),
    datasets: [
      {
        label: 'High Risk',
        data: metrics.riskTimeline.map(r => r.high),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        stack: 'risks'
      },
      {
        label: 'Medium Risk',
        data: metrics.riskTimeline.map(r => r.medium),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        stack: 'risks'
      },
      {
        label: 'Low Risk',
        data: metrics.riskTimeline.map(r => r.low),
        borderColor: 'rgb(250, 204, 21)',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        stack: 'risks'
      }
    ]
  };

  const categoryData = {
    labels: metrics.risksByCategory.map(c => c.category),
    datasets: [{
      label: 'Risk Count',
      data: metrics.risksByCategory.map(c => c.count),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };

  const agentRadarData = {
    labels: metrics.risksByAgent.slice(0, 8).map(a => a.agent),
    datasets: [{
      label: 'Risk Detection',
      data: metrics.risksByAgent.slice(0, 8).map(a => a.risks),
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgb(139, 92, 246)',
      pointBackgroundColor: 'rgb(139, 92, 246)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(139, 92, 246)'
    }]
  };

  const severityScatterData = {
    datasets: metrics.risksByCategory.map((cat, index) => ({
      label: cat.category,
      data: [{
        x: cat.count,
        y: cat.severity
      }],
      backgroundColor: `hsl(${index * 40}, 70%, 50%)`
    }))
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'medium':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900';
      case 'low':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '↑';
      case 'decreasing':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Risk Analytics</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor and analyze AI-related risks across your organization
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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="bias">Bias</option>
            <option value="accuracy">Accuracy</option>
            <option value="security">Security</option>
            <option value="compliance">Compliance</option>
            <option value="ethical">Ethical</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Risks</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {metrics.overview.totalRisks}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span className={metrics.overview.riskTrend === 'increasing' ? 'text-red-600' : 'text-green-600'}>
              {getTrendIcon(metrics.overview.riskTrend)} {metrics.overview.riskTrend}
            </span>
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">High Risks</h3>
          <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
            {metrics.overview.highRisks}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {((metrics.overview.highRisks / metrics.overview.totalRisks) * 100).toFixed(1)}% of total
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Medium Risks</h3>
          <p className="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-400">
            {metrics.overview.mediumRisks}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {((metrics.overview.mediumRisks / metrics.overview.totalRisks) * 100).toFixed(1)}% of total
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Risks</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {metrics.overview.lowRisks}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {((metrics.overview.lowRisks / metrics.overview.totalRisks) * 100).toFixed(1)}% of total
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Risk Score</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {metrics.overview.averageRiskScore.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Out of 10.0
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Risk Timeline
          </h2>
          <Line data={riskTimelineData} options={chartOptions} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Risks by Category
          </h2>
          <Bar data={categoryData} options={chartOptions} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Agent Risk Detection
          </h2>
          <Radar data={agentRadarData} options={chartOptions} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Risk Severity Distribution
          </h2>
          <Scatter 
            data={severityScatterData} 
            options={{
              ...chartOptions,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Number of Risks'
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Average Severity'
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Top Risks Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Top Risks
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Risk Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Occurrences
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Detected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {metrics.topRisks.map((risk) => (
                  <tr key={risk.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="max-w-xs truncate">{risk.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {risk.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(risk.severity)}`}>
                        {risk.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {risk.occurrences}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(risk.lastDetected).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={risk.trend === 'increasing' ? 'text-red-600' : risk.trend === 'decreasing' ? 'text-green-600' : 'text-gray-600'}>
                        {getTrendIcon(risk.trend)} {risk.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Risk Distribution by Category */}
      <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Risk Distribution by Category
        </h2>
        <div className="space-y-4">
          {metrics.riskDistribution.map((dist) => (
            <div key={dist.category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dist.category}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {dist.high + dist.medium + dist.low} total
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 flex overflow-hidden">
                <div
                  className="bg-red-500 h-full flex items-center justify-center text-xs text-white"
                  style={{ width: `${(dist.high / (dist.high + dist.medium + dist.low)) * 100}%` }}
                >
                  {dist.high > 0 && dist.high}
                </div>
                <div
                  className="bg-orange-500 h-full flex items-center justify-center text-xs text-white"
                  style={{ width: `${(dist.medium / (dist.high + dist.medium + dist.low)) * 100}%` }}
                >
                  {dist.medium > 0 && dist.medium}
                </div>
                <div
                  className="bg-yellow-500 h-full flex items-center justify-center text-xs text-white"
                  style={{ width: `${(dist.low / (dist.high + dist.medium + dist.low)) * 100}%` }}
                >
                  {dist.low > 0 && dist.low}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalytics;