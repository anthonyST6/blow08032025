import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ServerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  SignalIcon,
  CpuChipIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import { Card } from './ui/Card';
import { AgentNode } from '../types/usecase.types';

interface DeploymentStatusProps {
  agents: AgentNode[];
  workflowId: string;
  isDeploying: boolean;
}

interface AgentDeploymentStatus {
  agentId: string;
  status: 'pending' | 'deploying' | 'deployed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  metrics?: {
    cpu: number;
    memory: number;
    latency: number;
  };
  logs: string[];
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({
  agents,
  workflowId,
  isDeploying,
}) => {
  const [deploymentStatuses, setDeploymentStatuses] = useState<Record<string, AgentDeploymentStatus>>({});
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (isDeploying) {
      // Initialize deployment statuses
      const initialStatuses: Record<string, AgentDeploymentStatus> = {};
      agents.forEach(agent => {
        initialStatuses[agent.id] = {
          agentId: agent.id,
          status: 'pending',
          progress: 0,
          logs: [`Preparing to deploy ${agent.name}...`],
        };
      });
      setDeploymentStatuses(initialStatuses);
      
      // Simulate deployment progress
      simulateDeployment();
    }
  }, [isDeploying, agents]);

  const simulateDeployment = () => {
    let currentAgentIndex = 0;
    
    const deployNextAgent = () => {
      if (currentAgentIndex >= agents.length) {
        return;
      }
      
      const agent = agents[currentAgentIndex];
      const startTime = new Date();
      
      // Update status to deploying
      setDeploymentStatuses(prev => ({
        ...prev,
        [agent.id]: {
          ...prev[agent.id],
          status: 'deploying',
          startTime,
          logs: [...prev[agent.id].logs, `Starting deployment at ${startTime.toLocaleTimeString()}`],
        },
      }));
      
      // Simulate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20 + 10;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Mark as deployed
          const endTime = new Date();
          setDeploymentStatuses(prev => ({
            ...prev,
            [agent.id]: {
              ...prev[agent.id],
              status: 'deployed',
              progress: 100,
              endTime,
              metrics: {
                cpu: Math.random() * 30 + 20,
                memory: Math.random() * 40 + 30,
                latency: Math.random() * 50 + 10,
              },
              logs: [
                ...prev[agent.id].logs,
                `Deployment completed at ${endTime.toLocaleTimeString()}`,
                `Agent ${agent.name} is now operational`,
              ],
            },
          }));
          
          // Update overall progress
          setOverallProgress(((currentAgentIndex + 1) / agents.length) * 100);
          
          // Deploy next agent
          currentAgentIndex++;
          setTimeout(deployNextAgent, 1000);
        } else {
          setDeploymentStatuses(prev => ({
            ...prev,
            [agent.id]: {
              ...prev[agent.id],
              progress,
              logs: progress > 50 && prev[agent.id].logs.length === 2
                ? [...prev[agent.id].logs, `Configuring agent parameters...`]
                : prev[agent.id].logs,
            },
          }));
        }
      }, 500);
    };
    
    // Start deployment
    deployNextAgent();
  };

  const getStatusIcon = (status: AgentDeploymentStatus['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
      case 'deploying':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'deployed':
        return <CheckCircleIcon className="h-5 w-5 text-vanguard-green" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: AgentDeploymentStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'border-gray-600';
      case 'deploying':
        return 'border-yellow-500';
      case 'deployed':
        return 'border-vanguard-green';
      case 'failed':
        return 'border-red-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card variant="glass" padding="sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Overall Deployment Progress</h3>
          <span className="text-sm text-gray-400">{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full bg-black/50 rounded-full h-2">
          <motion.div
            className="bg-seraphim-gold h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </Card>

      {/* Agent Deployment Status */}
      <div className="space-y-3">
        {agents.map((agent) => {
          const status = deploymentStatuses[agent.id];
          if (!status) return null;

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-black/30 border rounded-lg p-4 ${getStatusColor(status.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(status.status)}
                  <div>
                    <h4 className="text-sm font-medium text-white">{agent.name}</h4>
                    <p className="text-xs text-gray-400 capitalize">{status.status}</p>
                  </div>
                </div>
                
                {status.metrics && (
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center">
                      <CpuChipIcon className="h-4 w-4 mr-1" />
                      {Math.round(status.metrics.cpu)}%
                    </div>
                    <div className="flex items-center">
                      <CircleStackIcon className="h-4 w-4 mr-1" />
                      {Math.round(status.metrics.memory)}%
                    </div>
                    <div className="flex items-center">
                      <SignalIcon className="h-4 w-4 mr-1" />
                      {Math.round(status.metrics.latency)}ms
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {status.status === 'deploying' && (
                <div className="mb-3">
                  <div className="w-full bg-black/50 rounded-full h-1.5">
                    <motion.div
                      className="bg-yellow-500 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${status.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Deployment Logs */}
              <div className="bg-black/50 rounded p-2 max-h-20 overflow-y-auto">
                {status.logs.map((log, index) => (
                  <p key={index} className="text-xs text-gray-400 font-mono">
                    {log}
                  </p>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Deployment Summary */}
      {overallProgress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="gradient" effect="shimmer">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-vanguard-green" />
              <div>
                <h3 className="text-sm font-semibold text-white">Deployment Complete</h3>
                <p className="text-xs text-gray-400">
                  All {agents.length} agents have been successfully deployed and are operational
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DeploymentStatus;