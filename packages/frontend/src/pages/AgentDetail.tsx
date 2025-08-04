import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { chartOptions } from '../utils/chartConfig';

interface AgentDetails {
  id: string;
  name: string;
  type: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance';
  configuration: {
    threshold?: number;
    sensitivity?: number;
    model?: string;
    parameters?: Record<string, any>;
  };
  metrics: {
    totalAnalyses: number;
    averageProcessingTime: number;
    successRate: number;
    lastUsed: Date;
    flaggedIssues: number;
  };
  performance: {
    date: string;
    analyses: number;
    processingTime: number;
    accuracy: number;
  }[];
  recentAnalyses: {
    id: string;
    promptId: string;
    timestamp: Date;
    result: string;
    confidence: number;
    flagged: boolean;
    processingTime: number;
  }[];
}

const AgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'performance' | 'history'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState<AgentDetails['configuration']>({});

  // Fetch agent details
  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const response = await api.get(`/api/agents/${id}`);
      const data = response.data as AgentDetails;
      setConfig(data.configuration);
      return data;
    }
  });

  // Update agent configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<AgentDetails>) => {
      const response = await api.put(`/api/agents/${id}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      setIsEditing(false);
    }
  });

  // Toggle agent status
  const toggleStatusMutation = useMutation({
    mutationFn: async (status: 'active' | 'inactive') => {
      const response = await api.patch(`/api/agents/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Agent not found</h3>
        <button
          onClick={() => navigate('/agents')}
          className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Back to Agents
        </button>
      </div>
    );
  }

  // Chart data
  const performanceData = {
    labels: agent.performance.slice(-7).map(p => p.date),
    datasets: [
      {
        label: 'Analyses',
        data: agent.performance.slice(-7).map(p => p.analyses),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Processing Time (ms)',
        data: agent.performance.slice(-7).map(p => p.processingTime),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        yAxisID: 'y1',
      }
    ]
  };

  const accuracyData = {
    labels: agent.performance.slice(-7).map(p => p.date),
    datasets: [{
      label: 'Accuracy %',
      data: agent.performance.slice(-7).map(p => p.accuracy),
      backgroundColor: 'rgba(34, 197, 94, 0.5)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 1
    }]
  };

  const statusData = {
    labels: ['Flagged', 'Passed'],
    datasets: [{
      data: [
        agent.metrics.flaggedIssues,
        agent.metrics.totalAnalyses - agent.metrics.flaggedIssues
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <button
                onClick={() => navigate('/agents')}
                className="hover:text-gray-700 dark:hover:text-gray-300"
              >
                Agents
              </button>
              <span>/</span>
              <span>{agent.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{agent.name}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{agent.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agent.status)}`}>
              {agent.status}
            </span>
            <button
              onClick={() => toggleStatusMutation.mutate(agent.status === 'active' ? 'inactive' : 'active')}
              disabled={agent.status === 'maintenance' || toggleStatusMutation.isPending}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                agent.status === 'active'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {toggleStatusMutation.isPending
                ? 'Updating...'
                : agent.status === 'active'
                ? 'Deactivate'
                : 'Activate'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Analyses</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {agent.metrics.totalAnalyses.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Last used {new Date(agent.metrics.lastUsed).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Processing Time</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {agent.metrics.averageProcessingTime}ms
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Per analysis
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {agent.metrics.successRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {agent.metrics.flaggedIssues} issues flagged
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{agent.version}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Type: {agent.type}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'configuration', 'performance', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Performance Trend
            </h2>
            <Line data={performanceData} options={{
              ...chartOptions,
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Analyses Count'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Processing Time (ms)'
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
              Analysis Results
            </h2>
            <div className="h-64">
              <Doughnut data={statusData} options={{
                ...chartOptions,
                maintainAspectRatio: false
              }} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Accuracy Trend
            </h2>
            <Bar data={accuracyData} options={chartOptions} />
          </div>
        </div>
      )}

      {activeTab === 'configuration' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Configuration</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Configuration
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setConfig(agent.configuration);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateConfigMutation.mutate({ configuration: config })}
                  disabled={updateConfigMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateConfigMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {config.threshold !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Threshold
                </label>
                <input
                  type="number"
                  value={config.threshold}
                  onChange={(e) => setConfig({ ...config, threshold: parseFloat(e.target.value) })}
                  disabled={!isEditing}
                  step="0.01"
                  min="0"
                  max="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
              </div>
            )}
            {config.sensitivity !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sensitivity
                </label>
                <input
                  type="number"
                  value={config.sensitivity}
                  onChange={(e) => setConfig({ ...config, sensitivity: parseFloat(e.target.value) })}
                  disabled={!isEditing}
                  step="0.1"
                  min="0"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
              </div>
            )}
            {config.model && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model
                </label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-2">Claude 2</option>
                  <option value="claude-instant">Claude Instant</option>
                </select>
              </div>
            )}
            {config.parameters && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Parameters
                </label>
                <textarea
                  value={JSON.stringify(config.parameters, null, 2)}
                  onChange={(e) => {
                    try {
                      const params = JSON.parse(e.target.value);
                      setConfig({ ...config, parameters: params });
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  disabled={!isEditing}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Response Time
                </h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {agent.metrics.averageProcessingTime}ms
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Across all analyses
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Success Rate
                </h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {agent.metrics.successRate.toFixed(1)}%
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  No errors or timeouts
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Detection Rate
                </h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {((agent.metrics.flaggedIssues / agent.metrics.totalAnalyses) * 100).toFixed(1)}%
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Issues identified
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Daily Performance
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Analyses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Avg Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Accuracy
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {agent.performance.slice(-10).reverse().map((perf, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {perf.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {perf.analyses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {perf.processingTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {perf.accuracy}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recent Analyses
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Prompt ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {agent.recentAnalyses.map((analysis) => (
                    <tr key={analysis.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(analysis.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/prompts/${analysis.promptId}`)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {analysis.promptId.slice(0, 8)}...
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="max-w-xs truncate">{analysis.result}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {(analysis.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {analysis.processingTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          analysis.flagged
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {analysis.flagged ? 'Flagged' : 'Passed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDetail;