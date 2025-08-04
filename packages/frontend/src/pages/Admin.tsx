import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user' | 'viewer';
  organizationId: string;
  organization: {
    id: string;
    name: string;
  };
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

interface Organization {
  id: string;
  name: string;
  domain: string;
  settings: Record<string, any>;
  createdAt: string;
  userCount: number;
}

interface SystemStats {
  totalUsers: number;
  totalOrganizations: number;
  totalPrompts: number;
  totalAnalyses: number;
  activeWorkflows: number;
  systemHealth: {
    database: 'healthy' | 'degraded' | 'down';
    redis: 'healthy' | 'degraded' | 'down';
    websocket: 'healthy' | 'degraded' | 'down';
  };
}

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'organizations' | 'settings'>('overview');
  const queryClient = useQueryClient();

  // Fetch system stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data.users;
    },
    enabled: activeTab === 'users',
  });

  // Fetch organizations
  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: async () => {
      const response = await api.get('/admin/organizations');
      return response.data.organizations;
    },
    enabled: activeTab === 'organizations',
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await api.patch(`/admin/users/${userId}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user role');
    },
  });

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user status');
    },
  });

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage users, organizations, and system settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'users', 'organizations', 'settings'] as const).map((tab) => (
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="mt-2 text-3xl font-bold">{stats?.totalUsers || 0}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Organizations
                  </p>
                  <p className="mt-2 text-3xl font-bold">{stats?.totalOrganizations || 0}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Prompts
                  </p>
                  <p className="mt-2 text-3xl font-bold">{stats?.totalPrompts || 0}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Workflows
                  </p>
                  <p className="mt-2 text-3xl font-bold">{stats?.activeWorkflows || 0}</p>
                </Card>
              </div>

              {/* System Health */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">System Health</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(stats?.systemHealth || {}).map(([service, status]) => (
                    <div key={service} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="font-medium capitalize">{service}</span>
                      <span className={`font-semibold ${getHealthColor(status as string)}`}>
                        {(status as string).toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {usersLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {users?.map((user: User) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {user.organization?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRoleMutation.mutate({
                              userId: user.id,
                              role: e.target.value,
                            })}
                            className={`text-xs rounded-full px-3 py-1 font-medium ${getRoleColor(user.role)}`}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.lastLoginAt
                            ? format(new Date(user.lastLoginAt), 'MMM d, yyyy')
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            size="small"
                            variant={user.isActive ? 'danger' : 'primary'}
                            onClick={() => toggleUserStatusMutation.mutate({
                              userId: user.id,
                              isActive: !user.isActive,
                            })}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
        <div className="space-y-6">
          {orgsLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations?.map((org: Organization) => (
                <Card key={org.id} className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{org.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Domain:</span>
                      <span className="font-medium">{org.domain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Users:</span>
                      <span className="font-medium">{org.userCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">
                        {format(new Date(org.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button size="small" variant="secondary">
                      Edit
                    </Button>
                    <Button size="small" variant="secondary">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">System Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">
            System settings configuration coming soon...
          </p>
        </Card>
      )}
    </div>
  );
};

export default Admin;