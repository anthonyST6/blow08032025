import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import { AgentAnalysis, AgentFlag, TimeSeriesData, AgentPerformanceData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ExclamationIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
  FilterIcon,
  DownloadIcon,
} from '@heroicons/react/outline';
import { Link } from 'react-router-dom';

const RiskOfficerDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({ start: 7, end: 0 }); // Last 7 days
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string[]>(['high', 'critical']);

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

  // Fetch risk trends
  const { data: riskTrends, isLoading: trendsLoading } = useQuery(
    ['riskTrends', startDate, endDate],
    async () => {
      const response = await apiService.analytics.getRiskTrends({
        startDate,
        endDate,
      });
      return response.data.data as TimeSeriesData[];
    }
  );

  // Fetch agent performance
  const { data: agentPerformance, isLoading: performanceLoading } = useQuery(
    ['agentPerformance', startDate, endDate],
    async () => {
      const response = await apiService.analytics.getAgentPerformance({
        startDate,
        endDate,
      });
      return response.data.data as AgentPerformanceData[];
    }
  );

  // Fetch recent high-risk analyses
  const { data: highRiskAnalyses, isLoading: analysesLoading } = useQuery(
    ['highRiskAnalyses', severityFilter],
    async () => {
      const response = await apiService.agents.list();
      // This would normally fetch actual analyses, but for now we'll simulate
      return [] as AgentAnalysis[];
    }
  );

  const handleExportReport = async () => {
    try {
      const response = await apiService.audit.export('pdf', {
        startDate,
        endDate,
        severity: severityFilter,
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `risk-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (trendsLoading || performanceLoading || analysesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" message="Loading risk analysis..." />
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateRiskScore = () => {
    if (!agentPerformance || agentPerformance.length === 0) return 0;
    
    const totalScore = agentPerformance.reduce((sum, agent) => sum + agent.averageScore, 0);
    return (totalScore / agentPerformance.length).toFixed(1);
  };

  const getTotalFlags = () => {
    if (!agentPerformance || agentPerformance.length === 0) return { total: 0, critical: 0, high: 0 };
    
    return agentPerformance.reduce((acc, agent) => ({
      total: acc.total + Object.values(agent.flagCounts).reduce((sum, count) => sum + count, 0),
      critical: acc.critical + agent.flagCounts.critical,
      high: acc.high + agent.flagCounts.high,
    }), { total: 0, critical: 0, high: 0 });
  };

  const flags = getTotalFlags();

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Risk Analysis Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor and analyze AI system risks and compliance
            </p>
          </div>
          <button
            onClick={handleExportReport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Report
          </button>
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
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Agent Filter</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Agents</option>
              {agentPerformance?.map(agent => (
                <option key={agent.agentId} value={agent.agentId}>
                  {agent.agentName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Severity Filter</label>
            <div className="mt-1 space-y-2">
              {['critical', 'high', 'medium', 'low'].map(severity => (
                <label key={severity} className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    checked={severityFilter.includes(severity)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSeverityFilter([...severityFilter, severity]);
                      } else {
                        setSeverityFilter(severityFilter.filter(s => s !== severity));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{severity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Overall Risk Score
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {calculateRiskScore()}%
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="sr-only">Increased by</span>
                      2.1%
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
                <ExclamationIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Critical Flags
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {flags.critical}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                      <TrendingDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" />
                      <span className="sr-only">Decreased by</span>
                      12%
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
                <ExclamationIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    High Risk Flags
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {flags.high}
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
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Flags
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {flags.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Performance Table */}
      {agentPerformance && agentPerformance.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Agent Performance</h2>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Analyses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Critical
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    High
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medium
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Low
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agentPerformance
                  .filter(agent => selectedAgent === 'all' || agent.agentId === selectedAgent)
                  .map((agent) => (
                    <tr key={agent.agentId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {agent.agentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agent.averageScore.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agent.totalAnalyses.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          agent.flagCounts.critical > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.flagCounts.critical}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          agent.flagCounts.high > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.flagCounts.high}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {agent.flagCounts.medium}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {agent.flagCounts.low}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/workflows/new"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Create Workflow</p>
              <p className="text-sm text-gray-500">Set up automated risk checks</p>
            </div>
          </Link>

          <Link
            to="/analytics/risks"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Detailed Analytics</p>
              <p className="text-sm text-gray-500">View comprehensive risk reports</p>
            </div>
          </Link>

          <Link
            to="/agents"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <FilterIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Configure Agents</p>
              <p className="text-sm text-gray-500">Adjust risk detection parameters</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RiskOfficerDashboard;