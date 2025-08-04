import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCaseService } from '../services/usecase.service';
import { UseCase, AgentGraph, UseCaseWorkflow, WorkflowStep as WorkflowStepType } from '../types/usecase.types';
import { toast } from 'react-hot-toast';
import {
  CubeTransparentIcon,
  ArrowsUpDownIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const WorkflowBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id: workflowId } = useParams();
  const [searchParams] = useSearchParams();
  const useCaseId = searchParams.get('useCase');
  const { user } = useAuthStore();
  
  const [workflow, setWorkflow] = useState<UseCaseWorkflow>({
    id: '',
    useCaseId: useCaseId || '',
    name: '',
    description: '',
    steps: [],
    status: 'draft',
    schedule: {
      type: 'manual',
      config: {}
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    runCount: 0
  });
  
  const [selectedStep, setSelectedStep] = useState<WorkflowStepType | null>(null);
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [agentGraph, setAgentGraph] = useState<AgentGraph | null>(null);

  // Load use case and agent graph
  useEffect(() => {
    if (useCaseId) {
      loadUseCaseData();
    }
  }, [useCaseId]);

  // Load existing workflow if editing
  useEffect(() => {
    if (workflowId && useCaseId) {
      loadWorkflow();
    }
  }, [workflowId, useCaseId]);

  const loadUseCaseData = async () => {
    if (!useCaseId) return;
    
    try {
      const [useCaseData, graph] = await Promise.all([
        useCaseService.getUseCase(useCaseId),
        useCaseService.getAgentGraph(useCaseId)
      ]);
      
      setUseCase(useCaseData);
      setAgentGraph(graph);
    } catch (error) {
      console.error('Failed to load use case data:', error);
      toast.error('Failed to load use case information');
    }
  };

  const loadWorkflow = async () => {
    if (!workflowId || !useCaseId) return;
    
    try {
      const workflows = await useCaseService.getWorkflows(useCaseId);
      const existingWorkflow = workflows.find(w => w.id === workflowId);
      
      if (existingWorkflow) {
        setWorkflow(existingWorkflow);
      } else {
        toast.error('Workflow not found');
        navigate('/workflows');
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      toast.error('Failed to load workflow');
    }
  };

  // Save workflow mutation
  const saveWorkflowMutation = useMutation({
    mutationFn: async (data: UseCaseWorkflow) => {
      if (workflowId) {
        // Update existing workflow
        return await useCaseService.updateWorkflow(workflowId, data);
      } else {
        // Create new workflow
        return await useCaseService.createWorkflow(data);
      }
    },
    onSuccess: () => {
      toast.success(workflowId ? 'Workflow updated successfully' : 'Workflow created successfully');
      navigate('/workflows');
    },
    onError: (error: any) => {
      setErrors({
        submit: error.message || 'Failed to save workflow'
      });
      toast.error('Failed to save workflow');
    }
  });

  const addStep = (agentId: string) => {
    if (!agentGraph) return;
    
    const agent = agentGraph.agents.find(a => a.id === agentId);
    if (!agent) return;

    const newStep: WorkflowStepType = {
      id: `step-${Date.now()}`,
      name: agent.name,
      agentId: agent.id,
      order: workflow.steps.length + 1,
      config: {},
      parameters: {}
    };

    setWorkflow({
      ...workflow,
      steps: [...workflow.steps, newStep]
    });
    setIsAddStepModalOpen(false);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStepType>) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    });
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    const newSteps = [...workflow.steps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    
    // Swap steps
    [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
    
    // Update order numbers
    newSteps.forEach((step, index) => {
      step.order = index + 1;
    });
    
    setWorkflow({ ...workflow, steps: newSteps });
  };

  const removeStep = (stepId: string) => {
    const newSteps = workflow.steps.filter(step => step.id !== stepId);
    // Update order numbers
    newSteps.forEach((step, index) => {
      step.order = index + 1;
    });
    setWorkflow({
      ...workflow,
      steps: newSteps
    });
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!workflow.name.trim()) {
      newErrors.name = 'Workflow name is required';
    }
    if (workflow.steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }
    if (!workflow.useCaseId) {
      newErrors.useCase = 'Use case is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    saveWorkflowMutation.mutate(workflow);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {workflowId ? 'Edit Workflow' : 'Create Workflow'}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {useCase ? `Building workflow for ${useCase.name}` : 'Create automated workflows for your use case'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Workflow Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={workflow.name}
                  onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="My Workflow"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={workflow.description}
                  onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe what this workflow does..."
                />
              </div>

              {useCase && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Use Case
                  </label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{useCase.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{useCase.description}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule Type
                </label>
                <select
                  value={workflow.schedule?.type || 'manual'}
                  onChange={(e) => setWorkflow({
                    ...workflow,
                    schedule: {
                      type: e.target.value as 'manual' | 'scheduled' | 'event',
                      config: {}
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="manual">Manual</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="event">Event-based</option>
                </select>
              </div>

              {workflow.schedule?.type === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Schedule (Cron Expression)
                  </label>
                  <input
                    type="text"
                    value={workflow.schedule?.config?.cron || ''}
                    onChange={(e) => setWorkflow({
                      ...workflow,
                      schedule: {
                        type: 'scheduled',
                        config: { cron: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0 0 * * *"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    e.g., "0 0 * * *" for daily at midnight
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={workflow.status}
                  onChange={(e) => setWorkflow({ ...workflow, status: e.target.value as 'active' | 'inactive' | 'draft' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/workflows')}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saveWorkflowMutation.isPending}
              className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveWorkflowMutation.isPending ? 'Saving...' : 'Save Workflow'}
            </button>
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Workflow Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 min-h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Workflow Steps
              </h2>
              <button
                onClick={() => setIsAddStepModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Step
              </button>
            </div>

            {errors.steps && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">{errors.steps}</p>
              </div>
            )}

            {workflow.steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500 dark:text-gray-400">
                <CubeTransparentIcon className="w-16 h-16 mb-4 text-seraphim-gold opacity-50" />
                <p className="text-lg font-medium mb-2">No steps yet</p>
                <p className="text-sm">Click "Add Step" to select agents from your orchestration</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workflow.steps.map((step, index) => {
                  const agent = agentGraph?.agents.find(a => a.id === step.agentId);
                  
                  return (
                    <div
                      key={step.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Step {index + 1}
                            </span>
                            <CubeTransparentIcon className="w-4 h-4 text-seraphim-gold" />
                            {agent && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {agent.role || agent.type}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) => updateStep(step.id, { name: e.target.value })}
                            className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:outline-none w-full"
                          />
                          {agent && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Agent: {agent.name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => moveStep(step.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ArrowsUpDownIcon className="w-4 h-4 rotate-180" />
                          </button>
                          <button
                            onClick={() => moveStep(step.id, 'down')}
                            disabled={index === workflow.steps.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ArrowsUpDownIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeStep(step.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove step"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Step Configuration */}
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Configuration
                        </label>
                        <textarea
                          value={JSON.stringify(step.config, null, 2)}
                          onChange={(e) => {
                            try {
                              const config = JSON.parse(e.target.value);
                              updateStep(step.id, { config });
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          className="w-full px-2 py-1 text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"
                          rows={3}
                          placeholder="{}"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Step Modal */}
      {isAddStepModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select Agent for Step
              </h3>
              
              {!agentGraph || agentGraph.agents.length === 0 ? (
                <div className="text-center py-8">
                  <CubeTransparentIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No agents found. Please configure agents in the Agent Orchestration module first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {agentGraph.agents.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => addStep(agent.id)}
                      className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {agent.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {agent.role || agent.type}
                            </div>
                        </div>
                        <CubeTransparentIcon className="w-5 h-5 text-seraphim-gold ml-3 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsAddStepModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;