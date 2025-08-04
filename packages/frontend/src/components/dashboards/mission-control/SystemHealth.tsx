import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SystemHealthProps {
  data: any;
}

const SystemHealth: React.FC<SystemHealthProps> = ({ data }) => {
  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'critical':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Status</span>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(data?.health?.status || 'unknown')}`}>
            {getHealthIcon(data?.health?.status || 'unknown')}
            <span className="ml-2">{data?.health?.status?.toUpperCase() || 'UNKNOWN'}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Active Agents</span>
            <span className="font-medium text-gray-900">
              {data?.health?.activeAgents || 0} / {data?.health?.totalAgents || 0}
            </span>
          </div>
          
          <div className="mt-2">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${data?.health?.percentage || 0}%` }}
              />
            </div>
          </div>
        </div>

        {data?.agents && data.agents.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Agent Status</h4>
            <div className="space-y-2">
              {data.agents.slice(0, 5).map((agent: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{agent.name}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealth;