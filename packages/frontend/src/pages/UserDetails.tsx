import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface UserDetails {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  department: string;
  status: 'active' | 'suspended' | 'inactive';
  createdAt: Date;
  lastLogin: Date;
  permissions: {
    canCreatePrompts: boolean;
    canViewAnalytics: boolean;
    canManageWorkflows: boolean;
    canExportData: boolean;
    canManageUsers: boolean;
    canViewAuditLogs: boolean;
    canManageAgents: boolean;
    canViewCompliance: boolean;
  };
  metadata: {
    jobTitle: string;
    phoneNumber: string;
    location: string;
    manager: string;
    startDate: string;
  };
  stats: {
    totalPrompts: number;
    totalAnalyses: number;
    lastActivity: Date;
    riskScore: number;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  timestamp: Date;
  details: string;
}

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'details' | 'permissions' | 'activity'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserDetails>>({});

  // Fetch user details
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get(`/api/users/${id}`);
      return response.data as UserDetails;
    }
  });

  // Fetch user activity
  const { data: activities } = useQuery({
    queryKey: ['user-activity', id],
    queryFn: async () => {
      const response = await api.get(`/api/users/${id}/activity`);
      return response.data as ActivityLog[];
    },
    enabled: activeTab === 'activity'
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<UserDetails>) => {
      const response = await api.put(`/api/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  });

  // Suspend/activate user mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (status: 'active' | 'suspended') => {
      const response = await api.post(`/api/users/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/users/${id}/reset-password`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  });

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const handleEdit = () => {
    setEditedUser(user);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateUserMutation.mutate(editedUser);
  };

  const handleCancel = () => {
    setEditedUser({});
    setIsEditing(false);
  };

  const handlePermissionChange = (permission: keyof UserDetails['permissions']) => {
    setEditedUser(prev => ({
      ...prev,
      permissions: {
        ...user.permissions,
        ...prev.permissions,
        [permission]: !prev.permissions?.[permission] ?? !user.permissions[permission]
      }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/users')}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.displayName}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              user.status === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : user.status === 'suspended'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              {user.status}
            </span>
            <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Prompts</h3>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {user.stats.totalPrompts}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Analyses</h3>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {user.stats.totalAnalyses}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Score</h3>
          <p className={`mt-1 text-2xl font-bold ${
            user.stats.riskScore < 30 ? 'text-green-600' :
            user.stats.riskScore < 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {user.stats.riskScore}%
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Activity</h3>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {new Date(user.stats.lastActivity).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              User Details
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'permissions'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Permissions
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'activity'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Activity Log
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  User Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateUserMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateUserMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.displayName || user.displayName}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.displayName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  {isEditing ? (
                    <select
                      value={editedUser.role || user.role}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="User">User</option>
                      <option value="AI Risk Officer">AI Risk Officer</option>
                      <option value="Compliance Reviewer">Compliance Reviewer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.role}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.department || user.department}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.department || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Title
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.metadata.jobTitle || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Manager
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.metadata.manager || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.metadata.location || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.metadata.phoneNumber || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user.metadata.startDate ? new Date(user.metadata.startDate).toLocaleDateString() : '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Created
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Login
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(user.lastLogin).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Account Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => resetPasswordMutation.mutate()}
                    disabled={resetPasswordMutation.isPending}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    {resetPasswordMutation.isPending ? 'Sending...' : 'Reset Password'}
                  </button>
                  {user.status === 'active' ? (
                    <button
                      onClick={() => toggleStatusMutation.mutate('suspended')}
                      disabled={toggleStatusMutation.isPending}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {toggleStatusMutation.isPending ? 'Updating...' : 'Suspend User'}
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleStatusMutation.mutate('active')}
                      disabled={toggleStatusMutation.isPending}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {toggleStatusMutation.isPending ? 'Updating...' : 'Activate User'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  User Permissions
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Permissions
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateUserMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateUserMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(user.permissions).map(([key, value]) => (
                  <label key={key} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <input
                      type="checkbox"
                      checked={isEditing ? (editedUser.permissions?.[key as keyof UserDetails['permissions']] ?? value) : value}
                      onChange={() => isEditing && handlePermissionChange(key as keyof UserDetails['permissions'])}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^can/, 'Can').trim()}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getPermissionDescription(key)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              {activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {activity.action}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            on {activity.resource}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {activity.details}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No activity recorded</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for permission descriptions
function getPermissionDescription(permission: string): string {
  const descriptions: Record<string, string> = {
    canCreatePrompts: 'Create and submit prompts for AI analysis',
    canViewAnalytics: 'View analytics dashboards and reports',
    canManageWorkflows: 'Create and manage validation workflows',
    canExportData: 'Export audit logs and compliance data',
    canManageUsers: 'Create, edit, and manage user accounts',
    canViewAuditLogs: 'View system audit logs and user activity',
    canManageAgents: 'Configure and manage Vanguard agents',
    canViewCompliance: 'View compliance reports and metrics'
  };
  return descriptions[permission] || '';
}

export default UserDetails;