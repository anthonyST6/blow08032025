import React, { useState, useEffect } from 'react';
import { ClipboardDocumentListIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { api } from '../../../services/api';

interface Action {
  id: string;
  type: string;
  agent: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

const ActionQueue: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      const response = await api.get('/v2/actions/queue');
      setActions(response.data.data || []);
    } catch (error) {
      // Use mock data for now
      setActions([
        {
          id: '1',
          type: 'lease_optimization',
          agent: 'Optimization Agent',
          description: 'Optimize lease terms for Block A-123',
          status: 'pending',
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'security_fix',
          agent: 'Security Agent',
          description: 'Fix access control issue in Document #456',
          status: 'executing',
          priority: 'critical',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XMarkIcon className="h-4 w-4 text-red-500" />;
      case 'executing':
        return <ClockIcon className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Action Queue</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {actions.filter(a => a.status === 'pending').length} Pending
        </span>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {actions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No actions in queue</p>
          ) : (
            actions.slice(0, 5).map((action) => (
              <div key={action.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(action.status)}
                      <span className="text-sm font-medium text-gray-900">{action.description}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span>{action.agent}</span>
                      <span>•</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(action.priority)}`}>
                        {action.priority}
                      </span>
                    </div>
                  </div>
                  {action.status === 'pending' && (
                    <div className="flex gap-1 ml-2">
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium">
          View All Actions →
        </button>
      </div>
    </div>
  );
};

export default ActionQueue;