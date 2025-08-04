/**
 * Agent Orchestration Panel - Branded Version
 * 
 * UI component for managing agents and workflows in the dashboard
 * Styled according to Seraphim Vanguards brand guidelines
 */

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../Badge';
import { Progress } from '../Progress';
import {
  useAgentOrchestrationStore,
  Agent,
  Workflow,
  predefinedWorkflows
} from './AgentOrchestrationService';
import {
  CpuChipIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CircleStackIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export const AgentOrchestrationPanelBranded: React.FC = () => {
  const {
    agents,
    selectedAgents,
    workflows,
    activeWorkflow,
    isExecuting,
    executionProgress,
    executionLogs,
    selectAgent,
    deselectAgent,
    createWorkflow,
    addWorkflowStep,
    executeWorkflow,
    cancelWorkflow,
    clearLogs
  } = useAgentOrchestrationStore();

  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [selectedPredefinedWorkflow, setSelectedPredefinedWorkflow] = useState<string | null>(null);

  // Agent type configuration with brand colors
  const agentTypeConfig = {
    'data-processor': {
      icon: CircleStackIcon,
      color: 'text-vanguard-security',
      borderColor: '#3A7BD5',
      bgColor: 'rgba(58, 123, 213, 0.08)',
      label: 'Data Agent',
    },
    'analyzer': {
      icon: ChartBarIcon,
      color: 'text-vanguard-accuracy',
      borderColor: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.08)',
      label: 'Analytics Agent',
    },
    'transformer': {
      icon: SparklesIcon,
      color: 'text-seraphim-gold',
      borderColor: '#FFD700',
      bgColor: 'rgba(255, 215, 0, 0.08)',
      label: 'Transformation Agent',
    },
    'validator': {
      icon: ShieldCheckIcon,
      color: 'text-vanguard-integrity',
      borderColor: '#D94A4A',
      bgColor: 'rgba(217, 74, 74, 0.08)',
      label: 'Compliance Validator',
    },
    'reporter': {
      icon: DocumentTextIcon,
      color: 'text-seraphim-gold',
      borderColor: '#FFD700',
      bgColor: 'rgba(255, 215, 0, 0.08)',
      label: 'Report Generator',
    },
  };

  // Get agent configuration
  const getAgentConfig = (type: Agent['type']) => {
    return agentTypeConfig[type] || agentTypeConfig['data-processor'];
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: Agent['status']) => {
    switch (status) {
      case 'idle':
        return 'success';
      case 'busy':
        return 'warning';
      case 'error':
        return 'error';
      case 'offline':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Handle predefined workflow execution
  const handlePredefinedWorkflow = (workflowKey: string) => {
    const predefined = predefinedWorkflows[workflowKey as keyof typeof predefinedWorkflows];
    if (!predefined) return;

    // Create workflow
    const workflow = createWorkflow(predefined.name, predefined.description);

    // Add steps
    predefined.steps.forEach(step => {
      addWorkflowStep(workflow.id, step);
    });

    // Execute
    executeWorkflow(workflow.id);
  };

  return (
    <div className="space-y-6">
      {/* Agent Grid with Branded Styling */}
      <div 
        className="p-6 rounded-lg border border-seraphim-gold/20"
        style={{
          background: `linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%)`,
        }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Available Agents</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, index) => {
            const config = getAgentConfig(agent.type);
            const Icon = config.icon;
            const isSelected = selectedAgents.includes(agent.id);
            
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                }}
                className={`
                  relative p-4 rounded-lg border-2 transition-all cursor-pointer overflow-hidden
                  ${isSelected
                    ? 'ring-2 ring-seraphim-gold ring-opacity-50'
                    : ''
                  }
                `}
                style={{
                  backgroundColor: config.bgColor,
                  borderColor: isSelected ? config.borderColor : `${config.borderColor}66`,
                }}
                onClick={() => isSelected ? deselectAgent(agent.id) : selectAgent(agent.id)}
              >
                {/* Colored top border stripe */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: config.borderColor }}
                />

                <div className="flex items-start justify-between mb-3 mt-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`p-2 rounded-lg border`}
                      style={{ 
                        backgroundColor: config.bgColor,
                        borderColor: config.borderColor,
                      }}
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{agent.name}</h4>
                      <p className="text-xs text-gray-400">{config.label}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 2).map((cap, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-black/30 rounded text-xs text-gray-300"
                      >
                        {cap}
                      </span>
                    ))}
                    {agent.capabilities.length > 2 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{agent.capabilities.length - 2}
                      </span>
                    )}
                  </div>
                  
                  {/* Stats with pill badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Tasks badge */}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300 border border-gray-600">
                      Tasks: {agent.performance.tasksCompleted}
                    </span>
                    
                    {/* Avg time badge */}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-transparent text-seraphim-gold border border-seraphim-gold/50">
                      Avg: {agent.performance.averageTime}s
                    </span>
                    
                    {/* Success rate badge */}
                    <span 
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        agent.performance.successRate >= 95 
                          ? 'bg-vanguard-accuracy/20 text-vanguard-accuracy border border-vanguard-accuracy/50' 
                          : 'bg-vanguard-integrity/20 text-vanguard-integrity border border-vanguard-integrity/50'
                      }`}
                    >
                      {agent.performance.successRate}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions with Brand Buttons */}
      <div 
        className="p-6 rounded-lg border border-seraphim-gold/20"
        style={{
          background: `linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%)`,
        }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePredefinedWorkflow('dataIngestion')}
            disabled={isExecuting}
            className={`
              px-4 py-2 rounded-full font-medium transition-all flex items-center justify-center
              ${isExecuting
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-seraphim-black text-seraphim-gold border border-seraphim-gold hover:bg-seraphim-gold hover:text-seraphim-black'
              }
            `}
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            Run Data Ingestion Workflow
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePredefinedWorkflow('monthlyReport')}
            disabled={isExecuting}
            className={`
              px-4 py-2 rounded-full font-medium transition-all flex items-center justify-center
              ${isExecuting
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-seraphim-black text-seraphim-gold border border-seraphim-gold hover:bg-seraphim-gold hover:text-seraphim-black'
              }
            `}
          >
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Generate Monthly Report
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowWorkflowBuilder(!showWorkflowBuilder)}
            disabled={isExecuting}
            className={`
              px-4 py-2 rounded-full font-medium transition-all flex items-center justify-center
              ${isExecuting
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-seraphim-black text-seraphim-gold border border-seraphim-gold hover:bg-seraphim-gold hover:text-seraphim-black'
              }
            `}
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            Create Custom Workflow
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={cancelWorkflow}
            disabled={!isExecuting}
            className={`
              px-4 py-2 rounded-full font-medium transition-all flex items-center justify-center
              ${!isExecuting
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-vanguard-integrity text-white hover:bg-vanguard-integrity-dark'
              }
            `}
          >
            <StopIcon className="w-4 h-4 mr-2" />
            Cancel Current Workflow
          </motion.button>
        </div>
      </div>

      {/* Execution Status */}
      {(isExecuting || executionLogs.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg border border-seraphim-gold/20"
          style={{
            background: `linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%)`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Workflow Execution</h3>
            {executionLogs.length > 0 && !isExecuting && (
              <button
                onClick={clearLogs}
                className="px-3 py-1 text-sm rounded-full bg-seraphim-black text-seraphim-gold border border-seraphim-gold hover:bg-seraphim-gold hover:text-seraphim-black transition-all"
              >
                Clear Logs
              </button>
            )}
          </div>
          
          {isExecuting && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm font-bold text-white">{Math.round(executionProgress)}%</span>
              </div>
              <div className="relative h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-seraphim-gold to-yellow-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${executionProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
          
          <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="space-y-1">
              {executionLogs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <ClockIcon className="w-4 h-4 text-seraphim-gold mt-0.5" />
                  <span className="text-gray-300">{log}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Workflows */}
      {workflows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg border border-seraphim-gold/20"
          style={{
            background: `linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%)`,
          }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Recent Workflows</h3>
          
          <div className="space-y-3">
            {workflows.slice(-5).reverse().map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/40 transition-all"
              >
                <div>
                  <h4 className="font-semibold text-white">{workflow.name}</h4>
                  <p className="text-sm text-gray-400">{workflow.description}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span
                    className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                      ${workflow.status === 'completed' 
                        ? 'bg-vanguard-accuracy/20 text-vanguard-accuracy border border-vanguard-accuracy/50'
                        : workflow.status === 'failed' 
                        ? 'bg-vanguard-integrity/20 text-vanguard-integrity border border-vanguard-integrity/50'
                        : workflow.status === 'running' 
                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600'
                      }
                    `}
                  >
                    {workflow.status}
                  </span>
                  
                  {workflow.status === 'draft' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => executeWorkflow(workflow.id)}
                      disabled={isExecuting}
                      className={`
                        p-2 rounded-full transition-all
                        ${isExecuting
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-seraphim-black text-seraphim-gold border border-seraphim-gold hover:bg-seraphim-gold hover:text-seraphim-black'
                        }
                      `}
                    >
                      <PlayIcon className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AgentOrchestrationPanelBranded;