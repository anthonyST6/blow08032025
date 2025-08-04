import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useUseCaseContext } from '../contexts/UseCaseContext';
import {
  CogIcon,
  PlusIcon,
  PlayIcon,
  TrashIcon,
  PencilIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  BoltIcon,
  ShieldCheckIcon,
  FunnelIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CubeTransparentIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { useCaseService } from '../services/usecase.service';
import { UseCase, UseCaseWorkflow, AgentGraph } from '../types/usecase.types';
import { useNavigate } from 'react-router-dom';


const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const { useCases, activeUseCaseId, activeUseCaseData } = useUseCaseContext();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<UseCaseWorkflow | null>(null);
  const [workflows, setWorkflows] = useState<UseCaseWorkflow[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [agentGraphs, setAgentGraphs] = useState<Map<string, AgentGraph>>(new Map());

  // Load workflows when active use case changes
  useEffect(() => {
    if (activeUseCaseId) {
      // First check if workflows are in context data
      if (activeUseCaseData?.operations?.workflows) {
        setWorkflows(activeUseCaseData.operations.workflows);
        setIsLoadingWorkflows(false);
      } else {
        // Fallback to loading from API
        loadWorkflows(activeUseCaseId);
        loadAgentGraph(activeUseCaseId);
      }
    } else {
      // No active use case, clear workflows
      setWorkflows([]);
      setIsLoadingWorkflows(false);
    }
  }, [activeUseCaseId, activeUseCaseData]);

  const loadWorkflows = async (useCaseId: string) => {
    setIsLoadingWorkflows(true);
    try {
      const useCaseWorkflows = await useCaseService.getWorkflows(useCaseId);
      setWorkflows(useCaseWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setIsLoadingWorkflows(false);
    }
  };


  const loadAgentGraph = async (useCaseId: string) => {
    try {
      const graph = await useCaseService.getAgentGraph(useCaseId);
      if (graph) {
        setAgentGraphs(new Map(agentGraphs.set(useCaseId, graph)));
      }
    } catch (error) {
      console.error('Failed to load agent graph:', error);
    }
  };

  const handleRunWorkflow = async (workflowId: string) => {
    try {
      const result = await useCaseService.runWorkflow(workflowId);
      if (result.success) {
        toast.success('Workflow started successfully');
        // Reload workflows to update run count
        if (activeUseCaseId) {
          loadWorkflows(activeUseCaseId);
        }
      }
    } catch (error) {
      toast.error('Failed to run workflow');
    }
  };

  const handleDeleteWorkflow = async (workflow: UseCaseWorkflow) => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

    try {
      // In a real implementation, we would call a delete API
      toast.success('Workflow deleted successfully');
      setWorkflows(workflows.filter(w => w.id !== workflow.id));
    } catch (error) {
      toast.error('Failed to delete workflow');
    }
  };

  const handleCreateWorkflow = () => {
    if (!activeUseCaseId) {
      toast.error('Please select a use case in the launcher to create a workflow');
      return;
    }
    // Navigate to workflow builder with use case context
    navigate(`/workflow-builder?useCase=${activeUseCaseId}`);
  };

  const handleEditWorkflow = (workflow: UseCaseWorkflow) => {
    navigate(`/workflow-builder/${workflow.id}?useCase=${workflow.useCaseId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-vanguard-green/20 text-vanguard-green';
      case 'inactive':
        return 'bg-gray-700 text-gray-300';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const getUseCaseIcon = (vertical?: string) => {
    switch (vertical) {
      case 'Energy':
        return <BoltIcon className="w-5 h-5" />;
      case 'Insurance':
        return <ShieldCheckIcon className="w-5 h-5" />;
      default:
        return <CogIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <CogIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Workflows
        </h1>
        {activeUseCaseId ? (
          <p className="text-sm text-gray-400 mt-1">
            Active Use Case: {useCases.find(uc => uc.id === activeUseCaseId)?.name}
          </p>
        ) : (
          <p className="text-sm text-gray-400 mt-1">
            Select a use case in the Launcher to view workflows
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        {/* Active Use Case Display */}
        <div className="flex items-center space-x-4">
          {activeUseCaseId && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-seraphim-gold/30 rounded-lg">
              <BoltIcon className="w-5 h-5 text-seraphim-gold" />
              <span className="text-sm font-medium text-white">
                {useCases.find(uc => uc.id === activeUseCaseId)?.name || 'Unknown Use Case'}
              </span>
            </div>
          )}
        </div>

        <Button
          variant="primary"
          onClick={handleCreateWorkflow}
          disabled={!activeUseCaseId}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {/* Loading State */}
      {isLoadingWorkflows && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      )}

      {/* Workflows List */}
      {!isLoadingWorkflows && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => {
            const useCase = useCases.find(uc => uc.id === workflow.useCaseId);
            const graph = agentGraphs.get(workflow.useCaseId);
            
            return (
              <Card key={workflow.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="text-gray-400 mt-0.5">
                      {getUseCaseIcon(useCase?.vertical)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                      {useCase && (
                        <p className="text-xs text-gray-500 mt-1">{useCase.name}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                </div>
                
                {workflow.description && (
                  <p className="text-gray-400 text-sm mb-4">
                    {workflow.description}
                  </p>
                )}

                {/* Workflow Steps Preview */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-400 mb-2">Workflow Steps:</p>
                  <div className="space-y-1">
                    {workflow.steps.slice(0, 3).map((step, index) => {
                      const agent = graph?.agents.find(a => a.id === step.agentId);
                      return (
                        <div key={step.id} className="flex items-center text-xs text-gray-300">
                          <span className="text-gray-500 mr-2">{index + 1}.</span>
                          <CubeTransparentIcon className="w-3 h-3 mr-1 text-seraphim-gold" />
                          <span>{step.name}</span>
                          {agent && (
                            <span className="text-gray-500 ml-1">({agent.name})</span>
                          )}
                        </div>
                      );
                    })}
                    {workflow.steps.length > 3 && (
                      <p className="text-xs text-gray-500">+{workflow.steps.length - 3} more steps</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Total Steps:</span>
                    <span className="text-white">{workflow.steps.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="text-white">{workflow.runCount}</span>
                  </div>
                  {workflow.lastRunAt && (
                    <div className="flex justify-between">
                      <span>Last Run:</span>
                      <span className="text-white">{format(new Date(workflow.lastRunAt), 'MMM d, h:mm a')}</span>
                    </div>
                  )}
                  {workflow.schedule && (
                    <div className="flex justify-between">
                      <span>Schedule:</span>
                      <span className="text-white capitalize">{workflow.schedule.type}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleRunWorkflow(workflow.id)}
                    disabled={workflow.status !== 'active'}
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Run
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditWorkflow(workflow)}
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteWorkflow(workflow)}
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!activeUseCaseId && !isLoadingWorkflows && (
        <Card className="p-12 text-center">
          <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-white">
            No Active Use Case
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Select a use case in the Launcher to view and manage workflows
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => navigate('/use-cases')}>
              <RocketLaunchIcon className="w-4 h-4 mr-2" />
              Go to Use Case Launcher
            </Button>
          </div>
        </Card>
      )}

      {/* No Workflows for Active Use Case */}
      {activeUseCaseId && workflows.length === 0 && !isLoadingWorkflows && (
        <Card className="p-12 text-center">
          <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-white">
            No workflows for this use case
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Get started by creating a new workflow for this use case.
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={handleCreateWorkflow}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Workflows;