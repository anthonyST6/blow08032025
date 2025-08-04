import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export interface WorkflowStep {
  id: string;
  type: 'prompt' | 'analysis' | 'report' | 'notification';
  config: Record<string, any>;
  order: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  vertical: 'energy' | 'government' | 'insurance';
  steps: WorkflowStep[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  results?: any;
  error?: string;
}

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  workflowRuns: WorkflowRun[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWorkflows: () => Promise<void>;
  fetchWorkflowById: (id: string) => Promise<void>;
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Workflow>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  runWorkflow: (id: string) => Promise<void>;
  fetchWorkflowRuns: (workflowId: string) => Promise<void>;
  toggleWorkflowActive: (id: string) => Promise<void>;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  clearError: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set, get) => ({
      workflows: [],
      currentWorkflow: null,
      workflowRuns: [],
      isLoading: false,
      error: null,

      fetchWorkflows: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get('/workflows');
          set({ workflows: response.data, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch workflows';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      fetchWorkflowById: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get(`/workflows/${id}`);
          set({ currentWorkflow: response.data, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch workflow';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      createWorkflow: async (workflow) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/workflows', workflow);
          const newWorkflow = response.data;
          
          set((state) => ({
            workflows: [newWorkflow, ...state.workflows],
            currentWorkflow: newWorkflow,
            isLoading: false
          }));
          
          toast.success('Workflow created successfully');
          return newWorkflow;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to create workflow';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateWorkflow: async (id: string, updates: Partial<Workflow>) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.put(`/workflows/${id}`, updates);
          const updatedWorkflow = response.data;
          
          set((state) => ({
            workflows: state.workflows.map(w => 
              w.id === id ? updatedWorkflow : w
            ),
            currentWorkflow: state.currentWorkflow?.id === id 
              ? updatedWorkflow 
              : state.currentWorkflow,
            isLoading: false
          }));
          
          toast.success('Workflow updated successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to update workflow';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteWorkflow: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await api.delete(`/workflows/${id}`);
          
          set((state) => ({
            workflows: state.workflows.filter(w => w.id !== id),
            currentWorkflow: state.currentWorkflow?.id === id 
              ? null 
              : state.currentWorkflow,
            isLoading: false
          }));
          
          toast.success('Workflow deleted successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to delete workflow';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      runWorkflow: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(`/workflows/${id}/run`);
          const workflowRun = response.data;
          
          set((state) => ({
            workflowRuns: [workflowRun, ...state.workflowRuns],
            isLoading: false
          }));
          
          toast.success('Workflow started successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to run workflow';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchWorkflowRuns: async (workflowId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get(`/workflows/${workflowId}/runs`);
          set({ workflowRuns: response.data, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch workflow runs';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      toggleWorkflowActive: async (id: string) => {
        const workflow = get().workflows.find(w => w.id === id);
        if (!workflow) return;

        await get().updateWorkflow(id, { isActive: !workflow.isActive });
      },

      setCurrentWorkflow: (workflow: Workflow | null) => {
        set({ currentWorkflow: workflow });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'workflow-store',
    }
  )
);

// Helper hooks
export const useWorkflows = () => useWorkflowStore((state) => state.workflows);
export const useCurrentWorkflow = () => useWorkflowStore((state) => state.currentWorkflow);
export const useWorkflowRuns = () => useWorkflowStore((state) => state.workflowRuns);
export const useWorkflowLoading = () => useWorkflowStore((state) => state.isLoading);
export const useWorkflowError = () => useWorkflowStore((state) => state.error);

// Selector for active workflows
export const useActiveWorkflows = () => 
  useWorkflowStore((state) => state.workflows.filter(w => w.isActive));

// Selector for workflows by vertical
export const useWorkflowsByVertical = (vertical: string) => 
  useWorkflowStore((state) => state.workflows.filter(w => w.vertical === vertical));