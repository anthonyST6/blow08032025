import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export interface PromptAnalysis {
  id: string;
  promptId: string;
  content: string;
  vertical: 'energy' | 'government' | 'insurance';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: {
    domainAnalysis?: any;
    securityAnalysis?: any;
    integrityAnalysis?: any;
    accuracyAnalysis?: any;
  };
  report?: {
    id: string;
    summary: string;
    recommendations: string[];
    riskScore: number;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PromptState {
  prompts: PromptAnalysis[];
  currentPrompt: PromptAnalysis | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPrompts: () => Promise<void>;
  fetchPromptById: (id: string) => Promise<void>;
  createPrompt: (content: string, vertical: string) => Promise<PromptAnalysis>;
  analyzePrompt: (promptId: string) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  setCurrentPrompt: (prompt: PromptAnalysis | null) => void;
  clearError: () => void;
}

export const usePromptStore = create<PromptState>()(
  devtools(
    (set, get) => ({
      prompts: [],
      currentPrompt: null,
      isLoading: false,
      error: null,

      fetchPrompts: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get('/prompts');
          set({ prompts: response.data, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch prompts';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      fetchPromptById: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get(`/prompts/${id}`);
          set({ currentPrompt: response.data, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch prompt';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      createPrompt: async (content: string, vertical: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/prompts', { content, vertical });
          const newPrompt = response.data;
          
          set((state) => ({
            prompts: [newPrompt, ...state.prompts],
            currentPrompt: newPrompt,
            isLoading: false
          }));
          
          toast.success('Prompt created successfully');
          return newPrompt;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to create prompt';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      analyzePrompt: async (promptId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(`/prompts/${promptId}/analyze`);
          const updatedPrompt = response.data;
          
          set((state) => ({
            prompts: state.prompts.map(p => 
              p.id === promptId ? updatedPrompt : p
            ),
            currentPrompt: state.currentPrompt?.id === promptId 
              ? updatedPrompt 
              : state.currentPrompt,
            isLoading: false
          }));
          
          toast.success('Analysis started successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to analyze prompt';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deletePrompt: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await api.delete(`/prompts/${id}`);
          
          set((state) => ({
            prompts: state.prompts.filter(p => p.id !== id),
            currentPrompt: state.currentPrompt?.id === id 
              ? null 
              : state.currentPrompt,
            isLoading: false
          }));
          
          toast.success('Prompt deleted successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to delete prompt';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      setCurrentPrompt: (prompt: PromptAnalysis | null) => {
        set({ currentPrompt: prompt });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'prompt-store',
    }
  )
);

// Helper hooks
export const usePrompts = () => usePromptStore((state) => state.prompts);
export const useCurrentPrompt = () => usePromptStore((state) => state.currentPrompt);
export const usePromptLoading = () => usePromptStore((state) => state.isLoading);
export const usePromptError = () => usePromptStore((state) => state.error);