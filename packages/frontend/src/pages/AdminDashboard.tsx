import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import { User, SystemHealth, AgentInfo } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  UsersIcon,
  ServerIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationIcon,
  RefreshIcon,
} from '@heroicons/react/outline';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch system health
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery<SystemHealth>(
    'systemHealth',
    async () => {
      const response = await apiService.admin.getSystemHealth();
      return response.data.data!;
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch users count
  const { data: usersData, isLoading: usersLoading } = useQuery(
    'adminUsersCount',
    async () => {
      const response = await apiService.admin.getUsers({ page: 1, limit: 1 });
      return response.data.data!;
    }
  );

  // Fetch agents
  const { data: agents, isLoading: agentsLoading } = useQuery<AgentInfo[]>(
    'adminAgents',
    async () => {
      const response = await apiService.agents.list();
      return response.data.data!;
    }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchHealth();
    setRefreshing(false);
  };

  if (healthLoading || usersLoading || agentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" message="Loading admin dashboard..." />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'degraded':
        return <ExclamationIcon className="h-5 w-5" />;
      case 'down':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ExclamationIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              System overview and management tools
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* System Health */}
      {health && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Overall Status</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
                {getStatusIcon(health.status)}
                <span className="ml-2">{health.status.toUpperCase()}</span>
              </span>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Services</h3>
              <div className="space-y-2">
                {Object.entries(health.services).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{service.replace(/_/g, ' ')}</span>
                    {typeof status === 'object' && 'status' in status ? (
                      <div className="flex items-center space-x-2">
                        {status.latency && (
                          <span className="text-xs text-gray-500">{status.latency}ms</span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.status)}`}>
                          {status.status.toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-right">
              Last checked: {new Date(health.lastChecked).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {usersData?.total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/admin/users" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Manage users →
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CogIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Agents
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {agents?.filter(a => a.isActive).length || 0} / {agents?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/admin/agents" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Configure agents →
            </Link>
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
                    System Analytics
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    View Reports
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/analytics" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* Agent Status */}
      {agents && agents.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Vanguard Agents</h2>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {agent.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      v{agent.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        agent.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {agent.description}
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
            to="/admin/users/new"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <UsersIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Add New User</p>
              <p className="text-sm text-gray-500">Create a new user account</p>
            </div>
          </Link>

          <Link
            to="/admin/system/logs"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <ServerIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">System Logs</p>
              <p className="text-sm text-gray-500">View system logs and errors</p>
            </div>
          </Link>

          <Link
            to="/admin/settings"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <CogIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">System Settings</p>
              <p className="text-sm text-gray-500">Configure system parameters</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;