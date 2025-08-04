import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CubeTransparentIcon,
  CircleStackIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Card } from './ui/Card';
import { AgentNode } from '../types/usecase.types';

interface AgentActivity {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: Date;
  action: string;
  status: 'processing' | 'completed' | 'error';
  data: {
    recordsProcessed?: number;
    currentTask?: string;
    progress?: number;
    errors?: string[];
    output?: string;
  };
}

interface AgentActivityFeedProps {
  agents: AgentNode[];
  workflowId: string;
  isActive: boolean;
}

const AgentActivityFeed: React.FC<AgentActivityFeedProps> = ({
  agents,
  workflowId,
  isActive,
}) => {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, 'idle' | 'processing' | 'completed' | 'error'>>({});

  useEffect(() => {
    if (isActive) {
      // Initialize agent statuses
      const initialStatuses: Record<string, 'idle' | 'processing' | 'completed' | 'error'> = {};
      agents.forEach(agent => {
        initialStatuses[agent.id] = 'idle';
      });
      setAgentStatuses(initialStatuses);
      
      // Start simulating activities
      simulateAgentActivities();
    }
  }, [isActive, agents]);

  const simulateAgentActivities = () => {
    let currentAgentIndex = 0;
    
    const processNextAgent = () => {
      if (currentAgentIndex >= agents.length) {
        // All agents completed
        return;
      }
      
      const agent = agents[currentAgentIndex];
      
      // Mark agent as processing
      setAgentStatuses(prev => ({
        ...prev,
        [agent.id]: 'processing',
      }));
      
      // Generate initial activity
      const startActivity: AgentActivity = {
        id: `activity-${Date.now()}-start`,
        agentId: agent.id,
        agentName: agent.name,
        timestamp: new Date(),
        action: `Started processing`,
        status: 'processing',
        data: {
          currentTask: getAgentTask(agent.type),
          progress: 0,
        },
      };
      
      setActivities(prev => [startActivity, ...prev]);
      
      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Generate completion activity
          const completeActivity: AgentActivity = {
            id: `activity-${Date.now()}-complete`,
            agentId: agent.id,
            agentName: agent.name,
            timestamp: new Date(),
            action: `Completed processing`,
            status: 'completed',
            data: {
              recordsProcessed: Math.floor(Math.random() * 1000) + 100,
              output: getAgentOutput(agent.type),
              progress: 100,
            },
          };
          
          setActivities(prev => [completeActivity, ...prev]);
          setAgentStatuses(prev => ({
            ...prev,
            [agent.id]: 'completed',
          }));
          
          // Process next agent
          currentAgentIndex++;
          setTimeout(processNextAgent, 1500);
        } else {
          // Generate progress activity
          const progressActivity: AgentActivity = {
            id: `activity-${Date.now()}-progress`,
            agentId: agent.id,
            agentName: agent.name,
            timestamp: new Date(),
            action: getProgressAction(agent.type, progress),
            status: 'processing',
            data: {
              currentTask: getAgentTask(agent.type),
              progress,
              recordsProcessed: Math.floor((progress / 100) * (Math.random() * 1000 + 100)),
            },
          };
          
          setActivities(prev => [progressActivity, ...prev]);
        }
      }, 2000);
    };
    
    // Start processing
    setTimeout(processNextAgent, 1000);
  };

  const getAgentTask = (agentType: string): string => {
    const tasks: Record<string, string> = {
      'data': 'Ingesting and validating data',
      'analytics': 'Analyzing patterns and trends',
      'compliance': 'Checking regulatory compliance',
      'report': 'Generating reports',
      'coordinator': 'Orchestrating workflow',
      'custom': 'Processing custom logic',
    };
    return tasks[agentType] || 'Processing data';
  };

  const getProgressAction = (agentType: string, progress: number): string => {
    if (progress < 30) {
      return 'Initializing processing pipeline';
    } else if (progress < 60) {
      return 'Processing data batch';
    } else if (progress < 90) {
      return 'Finalizing analysis';
    } else {
      return 'Preparing output';
    }
  };

  const getAgentOutput = (agentType: string): string => {
    const outputs: Record<string, string> = {
      'data': 'Successfully ingested 847 lease records',
      'analytics': 'Identified 23 high-risk leases requiring attention',
      'compliance': 'All leases passed regulatory compliance checks',
      'report': 'Generated comprehensive analysis report',
      'coordinator': 'Workflow execution completed successfully',
      'custom': 'Custom processing completed',
    };
    return outputs[agentType] || 'Processing completed successfully';
  };

  const getAgentIcon = (agentType: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      'coordinator': CubeTransparentIcon,
      'data': CircleStackIcon,
      'analytics': ChartBarIcon,
      'compliance': ShieldCheckIcon,
      'report': DocumentChartBarIcon,
      'custom': SparklesIcon,
    };
    return icons[agentType] || CubeTransparentIcon;
  };

  const getStatusIcon = (status: AgentActivity['status']) => {
    switch (status) {
      case 'processing':
        return <ArrowPathIcon className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-vanguard-green" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: AgentActivity['status']) => {
    switch (status) {
      case 'processing':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'completed':
        return 'border-vanguard-green/30 bg-vanguard-green/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
    }
  };

  return (
    <div className="space-y-4">
      {/* Agent Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {agents.map((agent) => {
          const Icon = getAgentIcon(agent.type);
          const status = agentStatuses[agent.id] || 'idle';
          
          return (
            <Card
              key={agent.id}
              variant="glass"
              padding="sm"
              className={`transition-all duration-300 ${
                status === 'processing' ? 'ring-2 ring-yellow-500/50' :
                status === 'completed' ? 'ring-2 ring-vanguard-green/50' :
                status === 'error' ? 'ring-2 ring-red-500/50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  status === 'processing' ? 'bg-yellow-500/20' :
                  status === 'completed' ? 'bg-vanguard-green/20' :
                  status === 'error' ? 'bg-red-500/20' :
                  'bg-gray-700/50'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    status === 'processing' ? 'text-yellow-500' :
                    status === 'completed' ? 'text-vanguard-green' :
                    status === 'error' ? 'text-red-500' :
                    'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-white">{agent.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{status}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Activity Feed */}
      <Card variant="glass-dark" effect="glow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center">
            <ClockIcon className="h-4 w-4 text-seraphim-gold mr-2" />
            Real-time Activity Feed
          </h3>
          <span className="text-xs text-gray-400">
            {activities.length} activities
          </span>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {activities.slice(0, 20).map((activity) => {
              const Icon = getAgentIcon(agents.find(a => a.id === activity.agentId)?.type || 'custom');
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-3 rounded-lg border ${getStatusColor(activity.status)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white flex items-center">
                          <Icon className="h-4 w-4 mr-2 text-seraphim-gold" />
                          {activity.agentName}
                        </p>
                        <time className="text-xs text-gray-500">
                          {activity.timestamp.toLocaleTimeString()}
                        </time>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{activity.action}</p>
                      
                      {/* Activity Data */}
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        {activity.data.recordsProcessed !== undefined && (
                          <span>Records: {activity.data.recordsProcessed}</span>
                        )}
                        {activity.data.progress !== undefined && activity.data.progress < 100 && (
                          <span>Progress: {Math.round(activity.data.progress)}%</span>
                        )}
                        {activity.data.output && (
                          <span className="text-vanguard-green">{activity.data.output}</span>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      {activity.status === 'processing' && activity.data.progress !== undefined && (
                        <div className="mt-2 w-full bg-black/50 rounded-full h-1">
                          <motion.div
                            className="bg-yellow-500 h-1 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${activity.data.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activities yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AgentActivityFeed;