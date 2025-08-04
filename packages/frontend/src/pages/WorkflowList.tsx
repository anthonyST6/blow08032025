import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

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
  steps: any[];
  tags: string[];
}

const WorkflowList: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'lastRunAt' | 'runCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch workflows
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows', searchTerm, statusFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const response = await api.get(`/api/workflows?${params.toString()}`);
      return response.data as Workflow[];
    }
  });

  // Delete workflow mutation
  const deleteWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      await api.delete(`/api/workflows/${workflowId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    }
  });

  // Toggle workflow status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ workflowId, status }: { workflowId: string; status: 'active' | 'inactive' }) => {
      await api.patch(`/api/workflows/${workflowId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    }
  });

  // Duplicate workflow mutation
  const duplicateWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      await api.post(`/api/workflows/${workflowId}/duplicate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    }
  });

  const handleDelete = async (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteWorkflowMutation.mutateAsync(workflowId);
    }
  };

  const handleToggleStatus = async (workflow: Workflow) => {
    const newStatus = workflow.status === 'active' ? 'inactive' : 'active';
    await toggleStatusMutation.mutateAsync({ workflowId: workflow.id, status: newStatus });
  };

  const handleDuplicate = async (workflowId: string) => {
    await duplicateWorkflowMutation.mutateAsync(workflowId);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSuccessRate = (workflow: Workflow) => {
    if (workflow.runCount === 0) return 0;
    return Math.round((workflow.successCount / workflow.runCount) * 100);
  };

  const canEdit = user?.role === UserRole.ADMIN || user?.role === UserRole.AI_RISK_OFFICER;

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workflows</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and monitor automated validation workflows
            </p>
          </div>
          {canEdit && (
            <Link
              to="/workflows/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Create Workflow
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field as any);
            setSortOrder(order as any);
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="lastRunAt-desc">Recently Run</option>
          <option value="runCount-desc">Most Runs</option>
        </select>
      </div>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows?.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {workflow.name}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(workflow.status)}`}>
                  {workflow.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {workflow.description}
              </p>

              {/* Workflow Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {workflow.runCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Runs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {getSuccessRate(workflow)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Success</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {workflow.steps.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Steps</div>
                </div>
              </div>

              {/* Triggers */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Triggers
                </div>
                <div className="flex flex-wrap gap-1">
                  {workflow.triggers.map((trigger, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {trigger.type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {workflow.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {workflow.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Run */}
              {workflow.lastRunAt && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Last run: {format(new Date(workflow.lastRunAt), 'MMM d, yyyy h:mm a')}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Link
                    to={`/workflows/${workflow.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View
                  </Link>
                  {canEdit && (
                    <>
                      <Link
                        to={`/workflows/${workflow.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDuplicate(workflow.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Duplicate
                      </button>
                    </>
                  )}
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    {workflow.status !== 'draft' && (
                      <button
                        onClick={() => handleToggleStatus(workflow)}
                        className={`text-sm ${
                          workflow.status === 'active'
                            ? 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300'
                            : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                        }`}
                      >
                        {workflow.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(workflow.id)}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {workflows?.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No workflows</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new workflow.
          </p>
          {canEdit && (
            <div className="mt-6">
              <Link
                to="/workflows/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Workflow
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowList;