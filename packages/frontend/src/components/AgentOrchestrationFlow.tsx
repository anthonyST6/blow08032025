import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CogIcon,
  DocumentArrowDownIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { AgentNode } from '../types/usecase.types';
import { dataFlowService, DataFlowEvent } from '../services/dataFlow.service';

interface AgentOrchestrationFlowProps {
  agents: AgentNode[];
  workflowId: string;
  isActive: boolean;
}

interface AgentStatus {
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  currentTask?: string;
}

const agentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'data-ingestion': DocumentArrowDownIcon,
  'data-transformation': ArrowsRightLeftIcon,
  'analytics': ChartBarIcon,
  'compliance': ShieldCheckIcon,
  'report-generation': DocumentCheckIcon,
  'default': CogIcon,
};

const AgentOrchestrationFlow: React.FC<AgentOrchestrationFlowProps> = ({
  agents,
  workflowId,
  isActive,
}) => {
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({});
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    // Initialize agent statuses
    const initialStatuses: Record<string, AgentStatus> = {};
    agents.forEach((agent, index) => {
      initialStatuses[agent.id] = {
        agentId: agent.id,
        status: index === 0 ? 'running' : 'pending',
        progress: 0,
      };
    });
    setAgentStatuses(initialStatuses);

    // Subscribe to workflow events
    const unsubscribe = dataFlowService.subscribe(workflowId, (event: DataFlowEvent) => {
      if (event.type === 'agent_activity' && event.data?.agentId) {
        setAgentStatuses(prev => ({
          ...prev,
          [event.data.agentId]: {
            ...prev[event.data.agentId],
            currentTask: event.data?.activity?.message,
          },
        }));
      }
    });

    // Simulate workflow progression for demo
    const simulateProgress = () => {
      let step = 0;
      const interval = setInterval(() => {
        if (step >= agents.length) {
          clearInterval(interval);
          return;
        }

        // Update current agent progress
        const currentAgent = agents[step];
        const progressInterval = setInterval(() => {
          setAgentStatuses(prev => {
            const currentProgress = prev[currentAgent.id]?.progress || 0;
            if (currentProgress >= 100) {
              clearInterval(progressInterval);
              
              // Mark current as completed and start next
              const newStatuses = { ...prev };
              newStatuses[currentAgent.id] = {
                ...newStatuses[currentAgent.id],
                status: 'completed',
                progress: 100,
                endTime: new Date(),
              };
              
              if (step + 1 < agents.length) {
                const nextAgent = agents[step + 1];
                newStatuses[nextAgent.id] = {
                  ...newStatuses[nextAgent.id],
                  status: 'running',
                  startTime: new Date(),
                };
              }
              
              return newStatuses;
            }
            
            return {
              ...prev,
              [currentAgent.id]: {
                ...prev[currentAgent.id],
                progress: Math.min(currentProgress + 20, 100),
              },
            };
          });
        }, 600); // Update progress every 600ms

        step++;
        setCurrentStep(step);
      }, 3000); // Move to next agent every 3 seconds

      return () => clearInterval(interval);
    };

    const cleanup = simulateProgress();
    
    return () => {
      unsubscribe();
      if (cleanup) cleanup();
    };
  }, [agents, workflowId, isActive]);

  const getAgentIcon = (agent: AgentNode) => {
    const iconKey = agent.type.toLowerCase().replace(/\s+/g, '-');
    const Icon = agentIcons[iconKey] || agentIcons.default;
    return Icon;
  };

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'text-vanguard-green border-vanguard-green/30 bg-vanguard-green/10';
      case 'running':
        return 'text-vanguard-blue border-vanguard-blue/30 bg-vanguard-blue/10 animate-pulse';
      case 'failed':
        return 'text-red-500 border-red-500/30 bg-red-500/10';
      default:
        return 'text-gray-500 border-gray-500/30 bg-black/30';
    }
  };

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon;
      case 'running':
        return ClockIcon;
      case 'failed':
        return ExclamationTriangleIcon;
      default:
        return ClockIcon;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Progress Bar */}
      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Workflow Progress</h3>
          <span className="text-xs text-gray-400">
            Step {currentStep} of {agents.length}
          </span>
        </div>
        <div className="w-full bg-black/50 rounded-full h-2 mb-2">
          <motion.div
            className="bg-gradient-to-r from-vanguard-blue to-seraphim-gold h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / agents.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-gray-400">
          {agents[Math.max(0, currentStep - 1)]?.name || 'Initializing...'}
        </p>
      </div>

      {/* Agent Flow Visualization */}
      <div className="relative">
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {agents.map((agent, index) => {
            const status = agentStatuses[agent.id];
            const Icon = getAgentIcon(agent);
            const StatusIcon = status ? getStatusIcon(status.status) : ClockIcon;
            
            return (
              <React.Fragment key={agent.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex-shrink-0"
                >
                  <div
                    className={`relative w-32 p-4 rounded-lg border-2 transition-all duration-300 ${
                      status ? getStatusColor(status.status) : 'border-gray-500/30 bg-black/30'
                    }`}
                  >
                    {/* Agent Icon */}
                    <div className="flex justify-center mb-2">
                      <Icon className="h-8 w-8" />
                    </div>
                    
                    {/* Agent Name */}
                    <h4 className="text-xs font-semibold text-center mb-2 line-clamp-2">
                      {agent.name}
                    </h4>
                    
                    {/* Status */}
                    <div className="flex items-center justify-center gap-1">
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-xs capitalize">
                        {status?.status || 'pending'}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    {status?.status === 'running' && (
                      <div className="mt-2">
                        <div className="w-full bg-black/50 rounded-full h-1">
                          <motion.div
                            className="bg-current h-1 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${status.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Current Task */}
                    {status?.currentTask && status.status === 'running' && (
                      <p className="text-xs text-center mt-2 opacity-70 line-clamp-1">
                        {status.currentTask}
                      </p>
                    )}
                  </div>
                  
                  {/* Connection Arrow */}
                  {index < agents.length - 1 && (
                    <div className="absolute top-1/2 -right-8 transform -translate-y-1/2">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: status?.status === 'completed' ? 1 : 0.3,
                          x: 0 
                        }}
                        transition={{ delay: index * 0.2 + 0.5 }}
                      >
                        <ArrowRightIcon className={`h-6 w-6 ${
                          status?.status === 'completed' 
                            ? 'text-vanguard-green' 
                            : 'text-gray-500'
                        }`} />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
                
                {/* Spacer between agents */}
                {index < agents.length - 1 && (
                  <div className="w-16 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Agent Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const status = agentStatuses[agent.id];
          if (!status || status.status === 'pending') return null;
          
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/30 border border-white/10 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{agent.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  status.status === 'completed' 
                    ? 'bg-vanguard-green/20 text-vanguard-green'
                    : status.status === 'running'
                    ? 'bg-vanguard-blue/20 text-vanguard-blue'
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {status.status}
                </span>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-gray-300">{agent.type}</span>
                </div>
                {status.startTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Started:</span>
                    <span className="text-gray-300">
                      {status.startTime.toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {status.endTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed:</span>
                    <span className="text-gray-300">
                      {status.endTime.toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {agent.config?.purpose && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-gray-400 italic">{agent.config.purpose}</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentOrchestrationFlow;