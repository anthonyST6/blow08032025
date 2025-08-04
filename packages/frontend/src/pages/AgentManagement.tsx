import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface VanguardAgent {
  id: string;
  name: string;
  type: string;
  description: string;
  enabled: boolean;
  config: {
    thresholds: {
      low: number;
      medium: number;
      high: number;
    };
    weights?: Record<string, number>;
    parameters?: Record<string, any>;
  };
  performance: {
    totalAnalyses: number;
    averageScore: number;
    averageExecutionTime: number;
    errorRate: number;
  };
  lastUpdated: string;
}

const AgentManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedAgent, setSelectedAgent] = useState<VanguardAgent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<VanguardAgent>>({});

  // Fetch agents
  const { data: agents, isLoading, refetch } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await api.get('/api/agents');
      return response.data as VanguardAgent[];
    }
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<VanguardAgent> }) => {
      const response = await api.put(`/api/agents/${data.id}`, data.updates);
      return response.data;
    },
    onSuccess: () => {
      refetch();
      setIsEditModalOpen(false);
      setSelectedAgent(null);
    }
  });

  // Toggle agent enabled status
  const toggleAgentMutation = useMutation({
    mutationFn: async (agent: VanguardAgent) => {
      const response = await api.put(`/api/agents/${agent.id}`, {
        enabled: !agent.enabled
      });
      return response.data;
    },
    onSuccess: () => {
      refetch();
    }
  });

  const handleEdit = (agent: VanguardAgent) => {
    setSelectedAgent(agent);
    setEditForm({
      enabled: agent.enabled,
      config: { ...agent.config }
    });
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    if (selectedAgent) {
      updateAgentMutation.mutate({
        id: selectedAgent.id,
        updates: editForm
      });
    }
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure and monitor Vanguard agent performance
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents?.map((agent) => (
          <div
            key={agent.id}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {agent.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {agent.type.replace(/_/g, ' ').toLowerCase()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    agent.enabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {agent.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {agent.description}
            </p>

            {/* Performance Metrics */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total Analyses</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {agent.performance.totalAnalyses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Avg Score</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPerformanceBadge(agent.performance.averageScore)}`}>
                  {agent.performance.averageScore.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Avg Execution</span>
                <span className="text-gray-900 dark:text-white">
                  {agent.performance.averageExecutionTime.toFixed(0)}ms
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Error Rate</span>
                <span className={`text-sm ${
                  agent.performance.errorRate > 5 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {agent.performance.errorRate.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Thresholds */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Risk Thresholds
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded px-2 py-1">
                    Low &lt; {agent.config.thresholds.low}
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded px-2 py-1">
                    Med &lt; {agent.config.thresholds.medium}
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded px-2 py-1">
                    High ≥ {agent.config.thresholds.high}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {user?.role === UserRole.ADMIN && (
                <>
                  <button
                    onClick={() => handleEdit(agent)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => toggleAgentMutation.mutate(agent)}
                    disabled={toggleAgentMutation.isPending}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {agent.enabled ? 'Disable' : 'Enable'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Configure {selectedAgent.name}
              </h2>

              <div className="space-y-6">
                {/* Enable/Disable Toggle */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.enabled}
                      onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Agent Enabled
                    </span>
                  </label>
                </div>

                {/* Thresholds */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Risk Thresholds
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Low Threshold
                      </label>
                      <input
                        type="number"
                        value={editForm.config?.thresholds?.low || 0}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          config: {
                            ...editForm.config!,
                            thresholds: {
                              ...editForm.config!.thresholds!,
                              low: parseFloat(e.target.value)
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Medium Threshold
                      </label>
                      <input
                        type="number"
                        value={editForm.config?.thresholds?.medium || 0}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          config: {
                            ...editForm.config!,
                            thresholds: {
                              ...editForm.config!.thresholds!,
                              medium: parseFloat(e.target.value)
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        High Threshold
                      </label>
                      <input
                        type="number"
                        value={editForm.config?.thresholds?.high || 0}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          config: {
                            ...editForm.config!,
                            thresholds: {
                              ...editForm.config!.thresholds!,
                              high: parseFloat(e.target.value)
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Parameters */}
                {editForm.config?.parameters && Object.keys(editForm.config.parameters).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Additional Parameters
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(editForm.config.parameters).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                          <input
                            type="text"
                            value={value as string}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              config: {
                                ...editForm.config!,
                                parameters: {
                                  ...editForm.config!.parameters,
                                  [key]: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedAgent(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateAgentMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateAgentMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;