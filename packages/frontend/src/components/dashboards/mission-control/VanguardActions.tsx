import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentMagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { api } from '../../../services/api';

interface VanguardActionsProps {
  leaseId: string;
}

interface VanguardAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'processing' | 'error';
  lastAction?: string;
  lastActionTime?: string;
  pendingActions: number;
  icon: any;
  color: string;
}

const VanguardActions: React.FC<VanguardActionsProps> = ({ leaseId }) => {
  const [agents, setAgents] = useState<VanguardAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<VanguardAgent | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionHistory, setActionHistory] = useState<any[]>([]);

  // Mock Vanguard agents
  const mockAgents: VanguardAgent[] = [
    {
      id: 'security',
      name: 'Security Agent',
      type: 'security',
      status: 'active',
      lastAction: 'Verified access controls',
      lastActionTime: '2 hours ago',
      pendingActions: 0,
      icon: ShieldCheckIcon,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      id: 'integrity',
      name: 'Integrity Agent',
      type: 'integrity',
      status: 'processing',
      lastAction: 'Validating lease boundaries',
      lastActionTime: '5 minutes ago',
      pendingActions: 2,
      icon: ShieldExclamationIcon,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      id: 'accuracy',
      name: 'Accuracy Agent',
      type: 'accuracy',
      status: 'idle',
      lastAction: 'Reconciled production data',
      lastActionTime: '1 day ago',
      pendingActions: 0,
      icon: ChartBarIcon,
      color: 'text-green-600 bg-green-100',
    },
    {
      id: 'optimization',
      name: 'Optimization Agent',
      type: 'optimization',
      status: 'active',
      lastAction: 'Optimized royalty calculations',
      lastActionTime: '3 hours ago',
      pendingActions: 1,
      icon: CurrencyDollarIcon,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      id: 'negotiation',
      name: 'Negotiation Agent',
      type: 'negotiation',
      status: 'idle',
      lastAction: 'Analyzed market comparables',
      lastActionTime: '2 days ago',
      pendingActions: 0,
      icon: DocumentMagnifyingGlassIcon,
      color: 'text-red-600 bg-red-100',
    },
  ];

  useEffect(() => {
    loadAgentData();
  }, [leaseId]);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      // In production, this would fetch real agent data
      // const response = await api.get(`/v2/agents/vanguards/lease/${leaseId}`);
      // setAgents(response.data);
      
      // Use mock data for now
      setAgents(mockAgents);
      
      // Mock action history
      setActionHistory([
        {
          id: '1',
          agentId: 'security',
          action: 'Access Control Verification',
          status: 'completed',
          timestamp: '2024-02-01T10:00:00Z',
          details: 'Verified all user permissions are up to date',
        },
        {
          id: '2',
          agentId: 'integrity',
          action: 'Boundary Validation',
          status: 'in_progress',
          timestamp: '2024-02-01T14:30:00Z',
          details: 'Checking lease boundaries against GIS data',
        },
        {
          id: '3',
          agentId: 'optimization',
          action: 'Royalty Optimization',
          status: 'pending_approval',
          timestamp: '2024-02-01T15:00:00Z',
          details: 'Found opportunity to reduce costs by 12%',
        },
      ]);
    } catch (error) {
      console.error('Failed to load agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'processing':
        return <ArrowPathIcon className="h-4 w-4 animate-spin" />;
      case 'idle':
        return <PauseIcon className="h-4 w-4" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'idle':
        return 'text-gray-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleAgentAction = async (agent: VanguardAgent, action: string) => {
    try {
      // In production, this would trigger the agent action
      // await api.post(`/v2/agents/vanguards/${agent.id}/execute`, {
      //   leaseId,
      //   action,
      // });
      
      console.log(`Executing ${action} for ${agent.name} on lease ${leaseId}`);
      setShowActionDialog(false);
      loadAgentData(); // Refresh data
    } catch (error) {
      console.error('Failed to execute agent action:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Vanguard AI Agents</h3>
        <p className="mt-1 text-sm text-gray-500">Autonomous monitoring and optimization</p>
      </div>

      <div className="p-6 space-y-3">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent);
                setShowActionDialog(true);
              }}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${agent.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                  <p className="text-xs text-gray-500">{agent.lastAction}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {agent.pendingActions > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {agent.pendingActions} pending
                  </span>
                )}
                <div className={`flex items-center gap-1 ${getStatusColor(agent.status)}`}>
                  {getStatusIcon(agent.status)}
                  <span className="text-xs capitalize">{agent.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Actions */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Actions</h4>
        <div className="space-y-2">
          {actionHistory.slice(0, 3).map((action) => {
            const agent = agents.find(a => a.id === action.agentId);
            if (!agent) return null;
            
            return (
              <div key={action.id} className="flex items-start gap-3 text-sm">
                <div className={`p-1 rounded ${agent.color} mt-0.5`}>
                  <agent.icon className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{action.action}</p>
                  <p className="text-xs text-gray-500">{action.details}</p>
                </div>
                <span className={`text-xs ${
                  action.status === 'completed' ? 'text-green-600' :
                  action.status === 'in_progress' ? 'text-blue-600' :
                  action.status === 'pending_approval' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {action.status.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Dialog */}
      <Transition appear show={showActionDialog} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowActionDialog(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {selectedAgent && (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
                      >
                        <div className={`p-2 rounded-lg ${selectedAgent.color}`}>
                          <selectedAgent.icon className="h-5 w-5" />
                        </div>
                        {selectedAgent.name}
                      </Dialog.Title>
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">
                          Select an action for this agent to perform:
                        </p>
                        
                        <div className="mt-4 space-y-2">
                          <button
                            onClick={() => handleAgentAction(selectedAgent, 'analyze')}
                            className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50"
                          >
                            <p className="font-medium text-gray-900">Analyze Lease</p>
                            <p className="text-sm text-gray-500">
                              Perform comprehensive analysis of lease terms and conditions
                            </p>
                          </button>
                          
                          <button
                            onClick={() => handleAgentAction(selectedAgent, 'optimize')}
                            className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50"
                          >
                            <p className="font-medium text-gray-900">Optimize Performance</p>
                            <p className="text-sm text-gray-500">
                              Find opportunities for improvement and cost reduction
                            </p>
                          </button>
                          
                          <button
                            onClick={() => handleAgentAction(selectedAgent, 'report')}
                            className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50"
                          >
                            <p className="font-medium text-gray-900">Generate Report</p>
                            <p className="text-sm text-gray-500">
                              Create detailed report of findings and recommendations
                            </p>
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => setShowActionDialog(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default VanguardActions;