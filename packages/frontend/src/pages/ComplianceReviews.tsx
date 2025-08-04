import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface ComplianceReview {
  id: string;
  title: string;
  description: string;
  type: 'periodic' | 'incident' | 'audit' | 'policy';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: {
    uid: string;
    displayName: string;
    email: string;
  };
  createdBy: {
    uid: string;
    displayName: string;
  };
  framework: string;
  scope: string[];
  findings: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  progress: number;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const ComplianceReviews: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    assignedTo: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['compliance-reviews', filters, sortBy, sortOrder],
    queryFn: async () => {
      const response = await api.get('/api/compliance/reviews', {
        params: { ...filters, sortBy, sortOrder }
      });
      return response.data as ComplianceReview[];
    }
  });

  // Fetch team members for assignment
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await api.get('/api/users', {
        params: { role: 'Compliance Reviewer' }
      });
      return response.data;
    }
  });

  // Update review status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/api/compliance/reviews/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Review status updated');
      queryClient.invalidateQueries({ queryKey: ['compliance-reviews'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  // Delete review
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/compliance/reviews/${id}`);
    },
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['compliance-reviews'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'periodic':
        return '📅';
      case 'incident':
        return '🚨';
      case 'audit':
        return '📋';
      case 'policy':
        return '📜';
      default:
        return '📄';
    }
  };

  const filteredReviews = reviews?.filter(review => {
    if (filters.status !== 'all' && review.status !== filters.status) return false;
    if (filters.type !== 'all' && review.type !== filters.type) return false;
    if (filters.priority !== 'all' && review.priority !== filters.priority) return false;
    if (filters.assignedTo !== 'all' && review.assignedTo.uid !== filters.assignedTo) return false;
    if (filters.search && !review.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !review.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance Reviews</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and track compliance review activities
            </p>
          </div>
          <button
            onClick={() => navigate('/compliance/reviews/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Review
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search reviews..."
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
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
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
              <option value="periodic">Periodic</option>
              <option value="incident">Incident</option>
              <option value="audit">Audit</option>
              <option value="policy">Policy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assigned To
            </label>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Members</option>
              {teamMembers?.map((member: any) => (
                <option key={member.uid} value={member.uid}>
                  {member.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created Date</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : filteredReviews && filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const daysUntilDue = getDaysUntilDue(review.dueDate);
            const isOverdue = daysUntilDue < 0 && review.status !== 'completed';
            
            return (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/compliance/reviews/${review.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(review.type)}</span>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {review.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(review.status)}`}>
                        {review.status.replace('_', ' ')}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(review.priority)}`}>
                        {review.priority} priority
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {review.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Framework:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{review.framework}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Assigned to:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {review.assignedTo.displayName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Due:</span>
                        <span className={`ml-2 font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                          {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : 
                           daysUntilDue === 0 ? 'Due today' :
                           `${daysUntilDue} days`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{review.progress}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${review.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Findings Summary */}
                    {review.findings.total > 0 && (
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Findings:</span>
                        {review.findings.critical > 0 && (
                          <span className="text-red-600 dark:text-red-400">
                            {review.findings.critical} critical
                          </span>
                        )}
                        {review.findings.high > 0 && (
                          <span className="text-orange-600 dark:text-orange-400">
                            {review.findings.high} high
                          </span>
                        )}
                        {review.findings.medium > 0 && (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            {review.findings.medium} medium
                          </span>
                        )}
                        {review.findings.low > 0 && (
                          <span className="text-green-600 dark:text-green-400">
                            {review.findings.low} low
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex items-center gap-2">
                    {review.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({ id: review.id, status: 'in_progress' });
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Start
                      </button>
                    )}
                    {review.status === 'in_progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({ id: review.id, status: 'completed' });
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this review?')) {
                          deleteReviewMutation.mutate(review.id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No compliance reviews found</p>
          <button
            onClick={() => navigate('/compliance/reviews/new')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create First Review
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplianceReviews;