/**
 * Agent Orchestration Panel
 * 
 * UI component for managing agents and workflows in the dashboard
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
  ChartBarIcon
} from '@heroicons/react/24/outline';

export const AgentOrchestrationPanel: React.FC = () => {
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

  // Get agent icon based on type
  const getAgentIcon = (type: Agent['type']) => {
    switch (type) {
      case 'data-processor':
        return DocumentTextIcon;
      case 'analyzer':
        return ChartBarIcon;
      case 'transformer':
        return SparklesIcon;
      case 'validator':
        return CheckCircleIcon;
      case 'reporter':
        return DocumentTextIcon;
      default:
        return CpuChipIcon;
    }
  };

  // Get status color
  const getStatusColor = (status: Agent['status']) => {
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
      {/* Agent Grid */}
      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Available Agents</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const Icon = getAgentIcon(agent.type);
            const isSelected = selectedAgents.includes(agent.id);
            
            return (
              <div
                key={agent.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-500/20 border-blue-500'
                    : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => isSelected ? deselectAgent(agent.id) : selectAgent(agent.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <h4 className="font-medium text-white">{agent.name}</h4>
                  </div>
                  <Badge
                    variant={getStatusColor(agent.status) as any}
                    size="small"
                  >
                    {agent.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((cap, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400"
                      >
                        {cap}
                      </span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{agent.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Tasks:</span>
                      <span className="ml-1 text-gray-300">{agent.performance.tasksCompleted}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg:</span>
                      <span className="ml-1 text-gray-300">{agent.performance.averageTime}s</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Success:</span>
                      <span className="ml-1 text-gray-300">{agent.performance.successRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="secondary"
            onClick={() => handlePredefinedWorkflow('dataIngestion')}
            disabled={isExecuting}
            className="justify-start"
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            Run Data Ingestion Workflow
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => handlePredefinedWorkflow('monthlyReport')}
            disabled={isExecuting}
            className="justify-start"
          >
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Generate Monthly Report
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => setShowWorkflowBuilder(!showWorkflowBuilder)}
            disabled={isExecuting}
            className="justify-start"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            Create Custom Workflow
          </Button>
          
          <Button
            variant="danger"
            onClick={cancelWorkflow}
            disabled={!isExecuting}
            className="justify-start"
          >
            <StopIcon className="w-4 h-4 mr-2" />
            Cancel Current Workflow
          </Button>
        </div>
      </Card>

      {/* Execution Status */}
      {(isExecuting || executionLogs.length > 0) && (
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Workflow Execution</h3>
            {executionLogs.length > 0 && !isExecuting && (
              <Button
                variant="secondary"
                size="small"
                onClick={clearLogs}
              >
                Clear Logs
              </Button>
            )}
          </div>
          
          {isExecuting && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm text-white">{Math.round(executionProgress)}%</span>
              </div>
              <Progress value={executionProgress} className="h-2" />
            </div>
          )}
          
          <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="space-y-1">
              {executionLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <ClockIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="text-gray-300">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Recent Workflows */}
      {workflows.length > 0 && (
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Workflows</h3>
          
          <div className="space-y-3">
            {workflows.slice(-5).reverse().map((workflow) => (
              <div
                key={workflow.id}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-white">{workflow.name}</h4>
                  <p className="text-sm text-gray-400">{workflow.description}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      workflow.status === 'completed' ? 'success' :
                      workflow.status === 'failed' ? 'error' :
                      workflow.status === 'running' ? 'warning' : 'secondary'
                    }
                    size="small"
                  >
                    {workflow.status}
                  </Badge>
                  
                  {workflow.status === 'draft' && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => executeWorkflow(workflow.id)}
                      disabled={isExecuting}
                    >
                      <PlayIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AgentOrchestrationPanel;