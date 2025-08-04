import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  triggeredBy: string;
  triggerType: string;
  results: {
    stepId: string;
    status: 'success' | 'failure' | 'skipped';
    output?: any;
    error?: string;
    duration: number;
  }[];
  metadata?: any;
}

interface WorkflowStep {
  id: string;
  type: 'prompt' | 'agent_analysis' | 'condition' | 'notification';
  name: string;
  config: any;
  position: { x: number; y: number };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  runCount: number;
  successCount: number;
  failureCount: number;
  triggers: {
    type: string;
    config: any;
  }[];
  steps: WorkflowStep[];
  connections: {
    source: string;
    target: string;
    condition?: any;
  }[];
  tags: string[];
  settings: {
    maxRetries: number;
    timeout: number;
    notifications: {
      onSuccess: boolean;
      onFailure: boolean;
      channels: string[];
    };
  };
}

const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'runs' | 'configuration'>('overview');
  const [selectedRun, setSelectedRun] = useState<string | null>(null);

  // Fetch workflow details
  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => {
      const response = await api.get(`/api/workflows/${id}`);
      return response.data as Workflow;
    }
  });

  // Fetch workflow runs
  const { data: runs, isLoading: runsLoading } = useQuery({
    queryKey: ['workflow-runs', id],
    queryFn: async () => {
      const response = await api.get(`/api/workflows/${id}/runs`);
      return response.data as WorkflowRun[];
    }
  });

  // Run workflow mutation
  const runWorkflowMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/workflows/${id}/run`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-runs', id] });
      queryClient.invalidateQueries({ queryKey: ['workflow', id] });
    }
  });

  // Cancel run mutation
  const cancelRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      await api.post(`/api/workflows/${id}/runs/${runId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-runs', id] });
    }
  });

  // Delete workflow mutation
  const deleteWorkflowMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/workflows/${id}`);
    },
    onSuccess: () => {
      navigate('/workflows');
    }
  });

  const handleRunWorkflow = async () => {
    await runWorkflowMutation.mutateAsync();
  };

  const handleCancelRun = async (runId: string) => {
    await cancelRunMutation.mutateAsync(runId);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteWorkflowMutation.mutateAsync();
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSuccessRate = () => {
    if (!workflow || workflow.runCount === 0) return 0;
    return Math.round((workflow.successCount / workflow.runCount) * 100);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const canEdit = user?.role === UserRole.ADMIN || user?.role === UserRole.AI_RISK_OFFICER;

  if (workflowLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workflow not found</h3>
        <Link to="/workflows" className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          Back to workflows
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/workflows" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{workflow.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(workflow.status)}`}>
                {workflow.status}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{workflow.description}</p>
          </div>
          <div className="flex gap-2">
            {workflow.status === 'active' && (
              <button
                onClick={handleRunWorkflow}
                disabled={runWorkflowMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {runWorkflowMutation.isPending ? 'Running...' : 'Run Now'}
              </button>
            )}
            {canEdit && (
              <>
                <Link
                  to={`/workflows/${id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Runs</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{workflow.runCount}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</div>
          <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{getSuccessRate()}%</div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Steps</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{workflow.steps.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Run</div>
          <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {workflow.lastRunAt ? format(new Date(workflow.lastRunAt), 'MMM d, h:mm a') : 'Never'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'runs', 'configuration'] as const).map((tab) => (
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
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Workflow Diagram */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Workflow Diagram</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-96 flex items-center justify-center">
                  <div className="text-gray-500 dark:text-gray-400 text-center">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    <p>Workflow visualization</p>
                    <p className="text-sm mt-2">{workflow.steps.length} steps, {workflow.connections.length} connections</p>
                  </div>
                </div>
              </div>

              {/* Workflow Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Details</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created by</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{workflow.createdBy}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created at</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {format(new Date(workflow.createdAt), 'MMM d, yyyy h:mm a')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last updated</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {format(new Date(workflow.updatedAt), 'MMM d, yyyy h:mm a')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Triggers</dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {workflow.triggers.map((trigger, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {trigger.type}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {workflow.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {/* Runs Tab */}
        {activeTab === 'runs' && (
          <div className="p-6">
            {runsLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : runs && runs.length > 0 ? (
              <div className="space-y-4">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedRun(selectedRun === run.id ? null : run.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(run.status)}`}>
                            {run.status}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(run.startedAt), 'MMM d, yyyy h:mm:ss a')}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Triggered by {run.triggeredBy} ({run.triggerType})
                        </div>
                      </div>
                      <div className="text-right">
                        {run.duration && (
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDuration(run.duration)}
                          </div>
                        )}
                        {run.status === 'running' && canEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelRun(run.id);
                            }}
                            className="mt-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Run Details */}
                    {selectedRun === run.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Step Results</h4>
                        <div className="space-y-2">
                          {run.results.map((result, index) => {
                            const step = workflow.steps.find(s => s.id === result.stepId);
                            return (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    result.status === 'success' ? 'bg-green-500' :
                                    result.status === 'failure' ? 'bg-red-500' :
                                    'bg-gray-400'
                                  }`} />
                                  <span className="text-gray-900 dark:text-white">
                                    {step?.name || `Step ${result.stepId}`}
                                  </span>
                                </div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {formatDuration(result.duration)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No runs yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This workflow hasn't been run yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'configuration' && (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Settings</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Retries</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{workflow.settings.maxRetries}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeout</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{workflow.settings.timeout} seconds</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Notifications</dt>
                    <dd className="mt-1 space-y-1">
                      {workflow.settings.notifications.onSuccess && (
                        <div className="text-sm text-gray-900 dark:text-white">✓ Notify on success</div>
                      )}
                      {workflow.settings.notifications.onFailure && (
                        <div className="text-sm text-gray-900 dark:text-white">✓ Notify on failure</div>
                      )}
                      {workflow.settings.notifications.channels.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Channels: {workflow.settings.notifications.channels.join(', ')}
                        </div>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Steps</h3>
                <div className="space-y-2">
                  {workflow.steps.map((step) => (
                    <div key={step.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{step.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{step.type.replace('_', ' ')}</div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {step.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDetail;