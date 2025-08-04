import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

// Prompts queries
export const usePrompts = (filters?: any) => {
  return useQuery({
    queryKey: ['prompts', filters],
    queryFn: () => api.get('/prompts', { params: filters }).then(res => res.data),
  });
};

export const usePrompt = (id: string) => {
  return useQuery({
    queryKey: ['prompt', id],
    queryFn: () => api.get(`/prompts/${id}`).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreatePrompt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.post('/prompts', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success('Prompt created successfully');
    },
  });
};

// LLM Response queries
export const useLLMResponses = (promptId?: string) => {
  return useQuery({
    queryKey: ['llmResponses', promptId],
    queryFn: () => api.get('/llm/responses', { params: { promptId } }).then(res => res.data),
    enabled: !!promptId,
  });
};

export const useGenerateLLMResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { promptId: string; provider: string; model: string }) => 
      api.post('/llm/generate', data).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['llmResponses', data.promptId] });
      toast.success('Response generated successfully');
    },
  });
};

// Agent Analysis queries
export const useAgentAnalyses = (filters?: any) => {
  return useQuery({
    queryKey: ['agentAnalyses', filters],
    queryFn: () => api.get('/agents/analyses', { params: filters }).then(res => res.data),
  });
};

export const useRunAgentAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { agentId: string; promptId: string; responseId: string }) => 
      api.post('/agents/analyze', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentAnalyses'] });
      toast.success('Analysis started');
    },
  });
};

// Workflow queries
export const useWorkflows = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.get('/workflows').then(res => res.data),
  });
};

export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => api.get(`/workflows/${id}`).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.post('/workflows', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow created successfully');
    },
  });
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.put(`/workflows/${id}`, data).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', data.id] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow updated successfully');
    },
  });
};

export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => 
      api.post(`/workflows/${id}/execute`, input).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowExecutions'] });
      toast.success('Workflow execution started');
    },
  });
};

// Audit Log queries
export const useAuditLogs = (filters?: any) => {
  return useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () => api.get('/audit/logs', { params: filters }).then(res => res.data),
  });
};

export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: (params: { format: 'csv' | 'pdf'; filters?: any }) => 
      api.get('/audit/export', { 
        params: { ...params.filters, format: params.format },
        responseType: 'blob'
      }).then(res => {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit-logs.${params.format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }),
    onSuccess: () => {
      toast.success('Export completed');
    },
  });
};

// User Management queries (Admin only)
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/admin/users').then(res => res.data),
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      api.put(`/admin/users/${userId}/role`, { role }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated');
    },
  });
};

// Analytics queries
export const useAnalytics = (timeRange: string = '7d') => {
  return useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => api.get('/analytics/overview', { params: { timeRange } }).then(res => res.data),
  });
};

export const useComplianceMetrics = () => {
  return useQuery({
    queryKey: ['complianceMetrics'],
    queryFn: () => api.get('/analytics/compliance').then(res => res.data),
  });
};

export const useRiskMetrics = () => {
  return useQuery({
    queryKey: ['riskMetrics'],
    queryFn: () => api.get('/analytics/risk').then(res => res.data),
  });
};

// Alert Rules queries
export const useAlertRules = () => {
  return useQuery({
    queryKey: ['alertRules'],
    queryFn: () => api.get('/alerts/rules').then(res => res.data),
  });
};

export const useCreateAlertRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.post('/alerts/rules', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertRules'] });
      toast.success('Alert rule created');
    },
  });
};

export const useUpdateAlertRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.put(`/alerts/rules/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertRules'] });
      toast.success('Alert rule updated');
    },
  });
};

export const useDeleteAlertRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/alerts/rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertRules'] });
      toast.success('Alert rule deleted');
    },
  });
};

// Scheduled Jobs queries
export const useScheduledJobs = () => {
  return useQuery({
    queryKey: ['scheduledJobs'],
    queryFn: () => api.get('/scheduler/jobs').then(res => res.data),
  });
};

export const useCreateScheduledJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.post('/scheduler/jobs', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledJobs'] });
      toast.success('Scheduled job created');
    },
  });
};

export const useUpdateScheduledJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.put(`/scheduler/jobs/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledJobs'] });
      toast.success('Scheduled job updated');
    },
  });
};

export const useRunJobNow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.post(`/scheduler/jobs/${id}/run`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobExecutions'] });
      toast.success('Job execution started');
    },
  });
};