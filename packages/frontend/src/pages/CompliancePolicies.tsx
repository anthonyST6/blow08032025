import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface CompliancePolicy {
  id: string;
  title: string;
  description: string;
  category: 'data_protection' | 'ai_ethics' | 'security' | 'governance' | 'operational';
  framework: string;
  version: string;
  status: 'draft' | 'active' | 'under_review' | 'archived';
  effectiveDate: Date;
  reviewDate: Date;
  owner: {
    uid: string;
    displayName: string;
    email: string;
  };
  approvedBy: {
    uid: string;
    displayName: string;
    approvedAt: Date;
  } | null;
  content: {
    sections: {
      id: string;
      title: string;
      content: string;
      order: number;
    }[];
    controls: {
      id: string;
      name: string;
      description: string;
      type: 'preventive' | 'detective' | 'corrective';
      frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
      responsible: string;
    }[];
  };
  relatedPolicies: string[];
  attachments: {
    id: string;
    name: string;
    url: string;
  }[];
  changeHistory: {
    version: string;
    changedBy: string;
    changedAt: Date;
    summary: string;
  }[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CompliancePolicies: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    category: 'all',
    framework: 'all',
    status: 'all',
    search: ''
  });
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    description: '',
    category: 'data_protection',
    framework: 'GDPR',
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Fetch policies
  const { data: policies, isLoading } = useQuery({
    queryKey: ['compliance-policies', filters],
    queryFn: async () => {
      const response = await api.get('/api/compliance/policies', {
        params: filters
      });
      return response.data as CompliancePolicy[];
    }
  });

  // Create policy
  const createPolicyMutation = useMutation({
    mutationFn: async (data: typeof newPolicy) => {
      const response = await api.post('/api/compliance/policies', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Policy created successfully');
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['compliance-policies'] });
      navigate(`/compliance/policies/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create policy');
    }
  });

  // Update policy status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/api/compliance/policies/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Policy status updated');
      queryClient.invalidateQueries({ queryKey: ['compliance-policies'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  // Delete policy
  const deletePolicyMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/compliance/policies/${id}`);
    },
    onSuccess: () => {
      toast.success('Policy deleted');
      queryClient.invalidateQueries({ queryKey: ['compliance-policies'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete policy');
    }
  });

  // Export policy
  const exportPolicy = async (id: string, format: 'pdf' | 'docx') => {
    try {
      const response = await api.get(`/api/compliance/policies/${id}/export`, {
        params: { format },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `policy-${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Policy exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export policy');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data_protection':
        return '🔒';
      case 'ai_ethics':
        return '🤖';
      case 'security':
        return '🛡️';
      case 'governance':
        return '⚖️';
      case 'operational':
        return '⚙️';
      default:
        return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'data_protection':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ai_ethics':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'governance':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'operational':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'archived':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredPolicies = policies?.filter(policy => {
    if (filters.category !== 'all' && policy.category !== filters.category) return false;
    if (filters.framework !== 'all' && policy.framework !== filters.framework) return false;
    if (filters.status !== 'all' && policy.status !== filters.status) return false;
    if (filters.search && !policy.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !policy.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const groupedPolicies = filteredPolicies?.reduce((acc, policy) => {
    if (!acc[policy.category]) {
      acc[policy.category] = [];
    }
    acc[policy.category].push(policy);
    return acc;
  }, {} as Record<string, CompliancePolicy[]>);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance Policies</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and maintain your organization's compliance policies
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Policy
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search policies..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="data_protection">Data Protection</option>
              <option value="ai_ethics">AI Ethics</option>
              <option value="security">Security</option>
              <option value="governance">Governance</option>
              <option value="operational">Operational</option>
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
              <option value="active">Active</option>
              <option value="under_review">Under Review</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Policies List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : groupedPolicies && Object.keys(groupedPolicies).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedPolicies).map(([category, categoryPolicies]) => (
            <div key={category}>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({categoryPolicies.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPolicies.map((policy) => (
                  <div
                    key={policy.id}
                    className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/compliance/policies/${policy.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {policy.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {policy.description}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(policy.status)}`}>
                          {policy.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          v{policy.version}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Framework</span>
                        <span className="font-medium text-gray-900 dark:text-white">{policy.framework}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Owner</span>
                        <span className="text-gray-900 dark:text-white">{policy.owner.displayName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Effective</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(policy.effectiveDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Review Due</span>
                        <span className={`font-medium ${
                          new Date(policy.reviewDate) < new Date() 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {new Date(policy.reviewDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {policy.content.controls.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Controls</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {policy.content.controls.length}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportPolicy(policy.id, 'pdf');
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Export as PDF"
                      >
                        📄
                      </button>
                      {policy.status === 'draft' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({ id: policy.id, status: 'under_review' });
                          }}
                          className="p-1 text-blue-400 hover:text-blue-600"
                          title="Submit for Review"
                        >
                          ✓
                        </button>
                      )}
                      {policy.status === 'active' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({ id: policy.id, status: 'archived' });
                          }}
                          className="p-1 text-yellow-400 hover:text-yellow-600"
                          title="Archive"
                        >
                          📦
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this policy?')) {
                            deletePolicyMutation.mutate(policy.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No policies found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create First Policy
          </button>
        </div>
      )}

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              Create New Policy
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newPolicy.title}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={newPolicy.category}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="data_protection">Data Protection</option>
                  <option value="ai_ethics">AI Ethics</option>
                  <option value="security">Security</option>
                  <option value="governance">Governance</option>
                  <option value="operational">Operational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Framework *
                </label>
                <select
                  value={newPolicy.framework}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, framework: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="GDPR">GDPR</option>
                  <option value="HIPAA">HIPAA</option>
                  <option value="SOC2">SOC 2</option>
                  <option value="ISO27001">ISO 27001</option>
                  <option value="NIST">NIST</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    value={newPolicy.effectiveDate}
                    onChange={(e) => setNewPolicy(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Review Date *
                  </label>
                  <input
                    type="date"
                    value={newPolicy.reviewDate}
                    onChange={(e) => setNewPolicy(prev => ({ ...prev, reviewDate: e.target.value }))}
                    min={newPolicy.effectiveDate}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newPolicy.title && newPolicy.description) {
                    createPolicyMutation.mutate(newPolicy);
                  }
                }}
                disabled={!newPolicy.title || !newPolicy.description || createPolicyMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompliancePolicies;