/**
 * Agent Orchestration Service
 * 
 * Manages agent selection, configuration, and workflow orchestration
 * for dashboard operations.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Agent types and interfaces
export interface Agent {
  id: string;
  name: string;
  type: 'data-processor' | 'analyzer' | 'validator' | 'transformer' | 'reporter';
  capabilities: string[];
  status: 'idle' | 'busy' | 'error' | 'offline';
  performance: {
    tasksCompleted: number;
    averageTime: number;
    successRate: number;
  };
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  action: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startTime?: string;
  endTime?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

// Agent Orchestration Store
interface AgentOrchestrationState {
  // Agents
  agents: Agent[];
  selectedAgents: string[];
  
  // Workflows
  workflows: Workflow[];
  activeWorkflow: Workflow | null;
  
  // Execution state
  isExecuting: boolean;
  executionProgress: number;
  executionLogs: string[];
  
  // Actions
  registerAgent: (agent: Agent) => void;
  selectAgent: (agentId: string) => void;
  deselectAgent: (agentId: string) => void;
  updateAgentStatus: (agentId: string, status: Agent['status']) => void;
  
  // Workflow actions
  createWorkflow: (name: string, description: string) => Workflow;
  addWorkflowStep: (workflowId: string, step: Omit<WorkflowStep, 'id' | 'status'>) => void;
  executeWorkflow: (workflowId: string) => Promise<void>;
  cancelWorkflow: () => void;
  
  // Utility actions
  clearLogs: () => void;
  reset: () => void;
}

export const useAgentOrchestrationStore = create<AgentOrchestrationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      agents: [
        {
          id: 'agent-1',
          name: 'Data Ingestion Agent',
          type: 'data-processor',
          capabilities: ['csv-parsing', 'json-parsing', 'excel-parsing', 'data-validation'],
          status: 'idle',
          performance: {
            tasksCompleted: 156,
            averageTime: 2.3,
            successRate: 98.5
          }
        },
        {
          id: 'agent-2',
          name: 'Data Transformation Agent',
          type: 'transformer',
          capabilities: ['schema-mapping', 'data-normalization', 'format-conversion'],
          status: 'idle',
          performance: {
            tasksCompleted: 142,
            averageTime: 1.8,
            successRate: 99.2
          }
        },
        {
          id: 'agent-3',
          name: 'Analytics Agent',
          type: 'analyzer',
          capabilities: ['statistical-analysis', 'trend-detection', 'anomaly-detection'],
          status: 'idle',
          performance: {
            tasksCompleted: 89,
            averageTime: 4.5,
            successRate: 96.7
          }
        },
        {
          id: 'agent-4',
          name: 'Compliance Validator',
          type: 'validator',
          capabilities: ['rule-validation', 'compliance-check', 'risk-assessment'],
          status: 'idle',
          performance: {
            tasksCompleted: 234,
            averageTime: 3.1,
            successRate: 99.8
          }
        },
        {
          id: 'agent-5',
          name: 'Report Generator',
          type: 'reporter',
          capabilities: ['pdf-generation', 'excel-export', 'dashboard-snapshot'],
          status: 'idle',
          performance: {
            tasksCompleted: 67,
            averageTime: 5.2,
            successRate: 97.3
          }
        }
      ],
      selectedAgents: [],
      workflows: [],
      activeWorkflow: null,
      isExecuting: false,
      executionProgress: 0,
      executionLogs: [],
      
      // Actions
      registerAgent: (agent) => set((state) => ({
        agents: [...state.agents, agent]
      })),
      
      selectAgent: (agentId) => set((state) => ({
        selectedAgents: [...state.selectedAgents, agentId]
      })),
      
      deselectAgent: (agentId) => set((state) => ({
        selectedAgents: state.selectedAgents.filter(id => id !== agentId)
      })),
      
      updateAgentStatus: (agentId, status) => set((state) => ({
        agents: state.agents.map(agent => 
          agent.id === agentId ? { ...agent, status } : agent
        )
      })),
      
      createWorkflow: (name, description) => {
        const workflow: Workflow = {
          id: `workflow-${Date.now()}`,
          name,
          description,
          steps: [],
          status: 'draft',
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          workflows: [...state.workflows, workflow]
        }));
        
        return workflow;
      },
      
      addWorkflowStep: (workflowId, stepData) => {
        const step: WorkflowStep = {
          ...stepData,
          id: `step-${Date.now()}`,
          status: 'pending'
        };
        
        set((state) => ({
          workflows: state.workflows.map(workflow =>
            workflow.id === workflowId
              ? { ...workflow, steps: [...workflow.steps, step] }
              : workflow
          )
        }));
      },
      
      executeWorkflow: async (workflowId) => {
        const workflow = get().workflows.find(w => w.id === workflowId);
        if (!workflow) return;
        
        set({
          activeWorkflow: workflow,
          isExecuting: true,
          executionProgress: 0,
          executionLogs: [`Starting workflow: ${workflow.name}`]
        });
        
        // Update workflow status
        set((state) => ({
          workflows: state.workflows.map(w =>
            w.id === workflowId
              ? { ...w, status: 'running', startedAt: new Date().toISOString() }
              : w
          )
        }));
        
        // Execute steps sequentially
        for (let i = 0; i < workflow.steps.length; i++) {
          const step = workflow.steps[i];
          const agent = get().agents.find(a => a.id === step.agentId);
          
          if (!agent) {
            set((state) => ({
              executionLogs: [...state.executionLogs, `Error: Agent ${step.agentId} not found`]
            }));
            continue;
          }
          
          // Update agent status
          get().updateAgentStatus(agent.id, 'busy');
          
          // Update step status
          set((state) => ({
            workflows: state.workflows.map(w =>
              w.id === workflowId
                ? {
                    ...w,
                    steps: w.steps.map(s =>
                      s.id === step.id
                        ? { ...s, status: 'running', startTime: new Date().toISOString() }
                        : s
                    )
                  }
                : w
            ),
            executionLogs: [...state.executionLogs, `Executing step: ${step.action} with ${agent.name}`]
          }));
          
          // Simulate step execution
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Update step completion
          set((state) => ({
            workflows: state.workflows.map(w =>
              w.id === workflowId
                ? {
                    ...w,
                    steps: w.steps.map(s =>
                      s.id === step.id
                        ? {
                            ...s,
                            status: 'completed',
                            endTime: new Date().toISOString(),
                            result: { success: true, data: 'Step completed successfully' }
                          }
                        : s
                    )
                  }
                : w
            ),
            executionProgress: ((i + 1) / workflow.steps.length) * 100,
            executionLogs: [...state.executionLogs, `Completed step: ${step.action}`]
          }));
          
          // Update agent status back to idle
          get().updateAgentStatus(agent.id, 'idle');
        }
        
        // Complete workflow
        set((state) => ({
          workflows: state.workflows.map(w =>
            w.id === workflowId
              ? { ...w, status: 'completed', completedAt: new Date().toISOString() }
              : w
          ),
          isExecuting: false,
          executionProgress: 100,
          executionLogs: [...state.executionLogs, `Workflow completed: ${workflow.name}`]
        }));
      },
      
      cancelWorkflow: () => {
        const { activeWorkflow } = get();
        if (!activeWorkflow) return;
        
        set((state) => ({
          workflows: state.workflows.map(w =>
            w.id === activeWorkflow.id
              ? { ...w, status: 'failed' }
              : w
          ),
          isExecuting: false,
          executionLogs: [...state.executionLogs, 'Workflow cancelled by user']
        }));
        
        // Reset all agent statuses
        get().agents.forEach(agent => {
          get().updateAgentStatus(agent.id, 'idle');
        });
      },
      
      clearLogs: () => set({ executionLogs: [] }),
      
      reset: () => set({
        selectedAgents: [],
        workflows: [],
        activeWorkflow: null,
        isExecuting: false,
        executionProgress: 0,
        executionLogs: []
      })
    })
  )
);

// Predefined workflows for common tasks
export const predefinedWorkflows = {
  dataIngestion: {
    name: 'Data Ingestion Workflow',
    description: 'Complete data ingestion pipeline from file upload to dashboard population',
    steps: [
      {
        agentId: 'agent-1',
        action: 'parse-data',
        parameters: { format: 'auto-detect', validation: true }
      },
      {
        agentId: 'agent-2',
        action: 'transform-data',
        parameters: { targetSchema: 'dashboard-schema', normalize: true }
      },
      {
        agentId: 'agent-3',
        action: 'analyze-data',
        parameters: { metrics: ['summary', 'trends', 'anomalies'] }
      },
      {
        agentId: 'agent-4',
        action: 'validate-compliance',
        parameters: { rules: ['data-quality', 'business-rules'] }
      }
    ]
  },
  
  monthlyReport: {
    name: 'Monthly Report Generation',
    description: 'Generate comprehensive monthly report with all metrics and analysis',
    steps: [
      {
        agentId: 'agent-3',
        action: 'generate-metrics',
        parameters: { period: 'monthly', includeComparison: true }
      },
      {
        agentId: 'agent-4',
        action: 'compliance-assessment',
        parameters: { detailed: true, includeRecommendations: true }
      },
      {
        agentId: 'agent-5',
        action: 'generate-report',
        parameters: { format: 'pdf', template: 'monthly-executive' }
      }
    ]
  }
};