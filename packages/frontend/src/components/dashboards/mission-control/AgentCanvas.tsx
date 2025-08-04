import React from 'react';
import { ShieldCheckIcon, CpuChipIcon, ChartBarIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const AgentCanvas: React.FC = () => {
  const agents = [
    {
      id: 'security',
      name: 'Security Agent',
      icon: ShieldCheckIcon,
      status: 'active',
      tasksCompleted: 156,
      activeIssues: 2,
      color: 'blue'
    },
    {
      id: 'integrity',
      name: 'Integrity Agent',
      icon: CpuChipIcon,
      status: 'active',
      tasksCompleted: 89,
      activeIssues: 0,
      color: 'green'
    },
    {
      id: 'accuracy',
      name: 'Accuracy Agent',
      icon: ChartBarIcon,
      status: 'active',
      tasksCompleted: 234,
      activeIssues: 5,
      color: 'purple'
    },
    {
      id: 'optimization',
      name: 'Optimization Agent',
      icon: CurrencyDollarIcon,
      status: 'active',
      tasksCompleted: 67,
      activeIssues: 1,
      color: 'yellow'
    },
    {
      id: 'negotiation',
      name: 'Negotiation Agent',
      icon: DocumentTextIcon,
      status: 'active',
      tasksCompleted: 45,
      activeIssues: 3,
      color: 'red'
    }
  ];

  const getAgentColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 border-blue-300 text-blue-900',
      green: 'bg-green-100 border-green-300 text-green-900',
      purple: 'bg-purple-100 border-purple-300 text-purple-900',
      yellow: 'bg-yellow-100 border-yellow-300 text-yellow-900',
      red: 'bg-red-100 border-red-300 text-red-900'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 border-gray-300 text-gray-900';
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      yellow: 'text-yellow-600',
      red: 'text-red-600'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Vanguard Agent Canvas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className={`relative border-2 rounded-lg p-4 ${getAgentColor(agent.color)} hover:shadow-lg transition-shadow cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white ${getIconColor(agent.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{agent.name}</h4>
                    <span className="text-xs opacity-75">ID: {agent.id}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  agent.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {agent.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tasks Completed</span>
                  <span className="font-semibold">{agent.tasksCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Issues</span>
                  <span className={`font-semibold ${agent.activeIssues > 0 ? 'text-red-600' : ''}`}>
                    {agent.activeIssues}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-current border-opacity-20">
                <div className="flex justify-between items-center text-sm">
                  <span>Performance</span>
                  <span className="font-medium">98.5%</span>
                </div>
                <div className="mt-1 bg-white bg-opacity-50 rounded-full h-2">
                  <div
                    className="bg-current h-2 rounded-full opacity-75"
                    style={{ width: '98.5%' }}
                  />
                </div>
              </div>

              {/* Connection lines visualization would go here in a real implementation */}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Agent Interactions</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>• Security → Integrity: 45 handoffs</div>
          <div>• Integrity → Accuracy: 32 handoffs</div>
          <div>• Accuracy → Optimization: 28 handoffs</div>
          <div>• Optimization → Negotiation: 15 handoffs</div>
        </div>
      </div>
    </div>
  );
};

export default AgentCanvas;