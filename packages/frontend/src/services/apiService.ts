import { api, endpoints } from './api';
import { 
  DashboardStats, 
  LLMModel, 
  Prompt, 
  Report, 
  Workflow, 
  Agent,
  AnalysisResult,
  User,
  Organization,
  AdminSettings,
  Metrics
} from '../types';

// API Service wrapper with typed methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) => 
      api.post(endpoints.auth.login, { email, password }),
    logout: () => 
      api.post(endpoints.auth.logout),
    getProfile: () => 
      api.get(endpoints.auth.profile),
  },
  
  // LLM endpoints
  llm: {
    getModels: () => 
      api.get<{ data: LLMModel[] }>(endpoints.llm.models),
    analyze: (data: { prompt: string; modelId: string; parameters?: any }) => 
      api.post<{ data: AnalysisResult }>(endpoints.llm.analyze, data),
    generate: (data: { prompt: string; modelId: string; parameters?: any }) => 
      api.post<{ data: { response: string } }>(endpoints.llm.generate, data),
  },
  
  // Agent endpoints
  agents: {
    list: () => 
      api.get<{ data: Agent[] }>(endpoints.agents.list),
    analyze: (data: { prompt: string; agents: string[] }) => 
      api.post<{ data: AnalysisResult }>(endpoints.agents.analyze, data),
    vanguard: (data: { prompt: string; context?: any }) => 
      api.post<{ data: AnalysisResult }>(endpoints.agents.vanguard, data),
    domain: (data: { prompt: string; domain: string; context?: any }) => 
      api.post<{ data: AnalysisResult }>(endpoints.agents.domain, data),
  },
  
  // Prompt endpoints
  prompts: {
    list: (params?: { page?: number; limit?: number; search?: string }) => 
      api.get<{ data: Prompt[]; total: number }>(endpoints.prompts.list, { params }),
    create: (data: Partial<Prompt>) => 
      api.post<{ data: Prompt }>(endpoints.prompts.create, data),
    get: (id: string) => 
      api.get<{ data: Prompt }>(endpoints.prompts.get(id)),
    update: (id: string, data: Partial<Prompt>) => 
      api.put<{ data: Prompt }>(endpoints.prompts.update(id), data),
    delete: (id: string) => 
      api.delete(endpoints.prompts.delete(id)),
    analyze: (id: string) => 
      api.post<{ data: AnalysisResult }>(endpoints.prompts.analyze(id)),
  },
  
  // Report endpoints
  reports: {
    list: (params?: { page?: number; limit?: number }) => 
      api.get<{ data: Report[]; total: number }>(endpoints.reports.list, { params }),
    get: (id: string) => 
      api.get<{ data: Report }>(endpoints.reports.get(id)),
    generate: (data: { type: string; filters?: any }) => 
      api.post<{ data: Report }>(endpoints.reports.generate, data),
    export: (id: string, format: 'pdf' | 'csv' | 'json') => 
      api.get(endpoints.reports.export(id), { 
        params: { format },
        responseType: 'blob' 
      }),
  },
  
  // Workflow endpoints
  workflows: {
    list: (params?: { page?: number; limit?: number }) => 
      api.get<{ data: Workflow[]; total: number }>(endpoints.workflows.list, { params }),
    create: (data: Partial<Workflow>) => 
      api.post<{ data: Workflow }>(endpoints.workflows.create, data),
    get: (id: string) => 
      api.get<{ data: Workflow }>(endpoints.workflows.get(id)),
    update: (id: string, data: Partial<Workflow>) => 
      api.put<{ data: Workflow }>(endpoints.workflows.update(id), data),
    delete: (id: string) => 
      api.delete(endpoints.workflows.delete(id)),
    run: (id: string, data?: any) => 
      api.post<{ data: { executionId: string } }>(endpoints.workflows.run(id), data),
    getStatus: (id: string) => 
      api.get<{ data: { status: string; progress: number } }>(endpoints.workflows.status(id)),
  },
  
  // Admin endpoints
  admin: {
    getDashboardStats: () => 
      api.get<{ data: DashboardStats }>(endpoints.admin.stats),
    getUsers: (params?: { page?: number; limit?: number; search?: string }) => 
      api.get<{ data: User[]; total: number }>(endpoints.admin.users, { params }),
    getOrganizations: () => 
      api.get<{ data: Organization[] }>(endpoints.admin.organizations),
    getSettings: () => 
      api.get<{ data: AdminSettings }>(endpoints.admin.settings),
    updateSettings: (data: Partial<AdminSettings>) => 
      api.put<{ data: AdminSettings }>(endpoints.admin.settings, data),
    updateUserRole: (userId: string, role: string) => 
      api.put<{ data: User }>(endpoints.admin.userRole(userId), { role }),
    updateUserStatus: (userId: string, status: 'active' | 'suspended' | 'deleted') => 
      api.put<{ data: User }>(endpoints.admin.userStatus(userId), { status }),
  },
  
  // Metrics endpoints
  metrics: {
    getDashboard: () => 
      api.get<{ data: Metrics }>(endpoints.metrics.dashboard),
    getAgentMetrics: (agentId?: string) => 
      api.get<{ data: any }>(endpoints.metrics.agents, { params: { agentId } }),
    getPromptMetrics: (promptId?: string) => 
      api.get<{ data: any }>(endpoints.metrics.prompts, { params: { promptId } }),
    getPerformanceMetrics: (timeRange?: string) => 
      api.get<{ data: any }>(endpoints.metrics.performance, { params: { timeRange } }),
  },
};

// Export for backward compatibility
export default apiService;