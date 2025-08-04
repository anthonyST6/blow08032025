import { api } from '../api';
import { LLMOutput, AgentResult } from '../../types/vanguard.types';

export interface VanguardExecutionRequest {
  useCaseId: string;
  agentIds?: string[];
  input: LLMOutput;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface VanguardExecutionStatus {
  id: string;
  status: string;
  progress: number;
  data: VanguardExecutionRequest;
  result?: any;
  failedReason?: string;
}

export interface VanguardAgent {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled?: boolean;
  configuration?: {
    enabled: boolean;
    thresholds: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    customSettings?: Record<string, any>;
  };
}

class VanguardService {
  /**
   * Execute Vanguard agents for a use case
   */
  async executeAgents(request: VanguardExecutionRequest): Promise<{ executionId: string }> {
    const response = await api.post('/vanguard/execute', request);
    return {
      executionId: response.data.executionId
    };
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<VanguardExecutionStatus> {
    const response = await api.get(`/vanguard/execution/${executionId}`);
    return response.data.execution;
  }

  /**
   * Cancel an execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    await api.delete(`/vanguard/execution/${executionId}`);
  }

  /**
   * Get all registered agents
   */
  async getAgents(): Promise<VanguardAgent[]> {
    const response = await api.get('/vanguard/agents');
    return response.data.agents;
  }

  /**
   * Get enabled agents only
   */
  async getEnabledAgents(): Promise<VanguardAgent[]> {
    const response = await api.get('/vanguard/agents/enabled');
    return response.data.agents;
  }

  /**
   * Update agent configuration
   */
  async updateAgent(agentId: string, updates: {
    enabled?: boolean;
    thresholds?: Record<string, number>;
  }): Promise<VanguardAgent> {
    const response = await api.patch(`/vanguard/agents/${agentId}`, updates);
    return response.data.agent;
  }

  /**
   * Test an agent with sample input
   */
  async testAgent(agentId: string, input: LLMOutput): Promise<AgentResult> {
    const response = await api.post(`/vanguard/agents/${agentId}/test`, { input });
    return response.data.result;
  }
}

export const vanguardService = new VanguardService();