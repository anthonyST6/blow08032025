import { api } from './api';
import { apiWithCache } from './apiWithCache.service';
import { UseCase, AgentGraph, UseCaseWorkflow, AgentNode } from '../types/usecase.types';
import { integrationLogger } from './integrationLogger.service';
import { auditLogger } from './auditLogger.service';
import { agentConfigurationService } from './agentConfiguration.service';

class UseCaseService {
  // Get all use cases
  async getUseCases(): Promise<UseCase[]> {
    const startTime = Date.now();
    try {
      const data = await apiWithCache.get<UseCase[]>('/usecases', {
        cacheKey: 'use-cases-all',
        cacheDuration: 5 * 60 * 1000, // 5 minutes
        timeout: 1000, // 1 second timeout
        fallbackData: this.getMockUseCases(),
      });
      integrationLogger.logApiCall('GET', '/api/usecases', 200, Date.now() - startTime);
      return data;
    } catch (error) {
      console.error('Failed to fetch use cases:', error);
      integrationLogger.logApiCall('GET', '/api/usecases', 500, Date.now() - startTime);
      // Return mock data for development
      return this.getMockUseCases();
    }
  }

  // Get specific use case
  async getUseCase(id: string): Promise<UseCase | null> {
    const startTime = Date.now();
    try {
      const response = await api.get(`/usecases/${id}`);
      integrationLogger.logApiCall('GET', `/api/usecases/${id}`, 200, Date.now() - startTime);
      integrationLogger.logUseCaseEvent(id, `Use case accessed`, 'info');
      auditLogger.logUseCaseAction('read', id, response.data.name, 'success');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch use case:', error);
      integrationLogger.logApiCall('GET', `/api/usecases/${id}`, 404, Date.now() - startTime);
      const useCase = this.getMockUseCases().find(uc => uc.id === id) || null;
      if (useCase) {
        integrationLogger.logUseCaseEvent(id, `Use case "${useCase.name}" accessed (mock)`, 'info');
        auditLogger.logUseCaseAction('read', id, useCase.name, 'success');
      } else {
        auditLogger.logUseCaseAction('read', id, 'Unknown', 'failure', {
          metadata: { error: 'Use case not found' }
        });
      }
      return useCase;
    }
  }

  // Get agent graph for a use case
  async getAgentGraph(useCaseId: string): Promise<AgentGraph | null> {
    const startTime = Date.now();
    
    // Check if we have a pre-configured agent graph
    const configuredGraph = agentConfigurationService.getAgentGraph(useCaseId);
    if (configuredGraph) {
      const graph: AgentGraph = {
        useCaseId,
        agents: configuredGraph.agents,
        connections: configuredGraph.connections.map((conn, idx) => ({
          id: `conn-${idx}`,
          ...conn
        })),
        metadata: {
          lastModified: new Date(),
          modifiedBy: 'system',
          version: 1,
        }
      };
      integrationLogger.logUseCaseEvent(useCaseId, `Agent graph loaded with ${graph.agents.length} agents (pre-configured)`, 'info');
      return graph;
    }
    
    // Fallback to API or mock data
    const fallbackData = useCaseId === 'oilfield-land-lease' ? this.getMockOilfieldAgentGraph() : undefined;
    
    try {
      const graph = await apiWithCache.get<AgentGraph>(`/usecase/agents/${useCaseId}`, {
        cacheKey: `agent-graph-${useCaseId}`,
        cacheDuration: 5 * 60 * 1000, // 5 minutes
        timeout: 1000, // 1 second timeout
        fallbackData,
      });
      integrationLogger.logApiCall('GET', `/api/usecase/agents/${useCaseId}`, 200, Date.now() - startTime);
      integrationLogger.logUseCaseEvent(useCaseId, `Agent graph loaded with ${graph.agents.length} agents`, 'info');
      return graph;
    } catch (error) {
      console.error('Failed to fetch agent graph:', error);
      integrationLogger.logApiCall('GET', `/api/usecase/agents/${useCaseId}`, 404, Date.now() - startTime);
      if (fallbackData) {
        integrationLogger.logUseCaseEvent(useCaseId, `Agent graph loaded with ${fallbackData.agents.length} agents (mock)`, 'info');
        return fallbackData;
      }
      return null;
    }
  }

  // Save/update agent graph
  async saveAgentGraph(useCaseId: string, graph: Partial<AgentGraph>): Promise<AgentGraph> {
    const startTime = Date.now();
    try {
      const response = await api.post(`/usecase/agents/${useCaseId}`, graph);
      integrationLogger.logApiCall('POST', `/api/usecase/agents/${useCaseId}`, 200, Date.now() - startTime);
      integrationLogger.logUseCaseEvent(
        useCaseId,
        `Agent graph updated with ${graph.agents?.length || 0} agents and ${graph.connections?.length || 0} connections`,
        'success'
      );
      auditLogger.logUseCaseAction('update', useCaseId, 'Agent Graph', 'success', {
        metadata: {
          agentCount: graph.agents?.length || 0,
          connectionCount: graph.connections?.length || 0
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to save agent graph:', error);
      integrationLogger.logApiCall('POST', `/api/usecase/agents/${useCaseId}`, 500, Date.now() - startTime);
      integrationLogger.logError(error as Error, 'UseCase', { useCaseId });
      // Return mock response for development
      const mockGraph = {
        useCaseId,
        agents: graph.agents || [],
        connections: graph.connections || [],
        metadata: {
          lastModified: new Date(),
          modifiedBy: 'user',
          version: 1,
        },
      };
      integrationLogger.logUseCaseEvent(
        useCaseId,
        `Agent graph saved with ${mockGraph.agents.length} agents (mock)`,
        'warning'
      );
      auditLogger.logUseCaseAction('update', useCaseId, 'Agent Graph', 'failure', {
        metadata: {
          error: 'Failed to save to backend, using mock',
          agentCount: mockGraph.agents.length
        }
      });
      return mockGraph;
    }
  }

  // Get workflows for a use case
  async getWorkflows(useCaseId: string): Promise<UseCaseWorkflow[]> {
    // Check if we have pre-configured workflow steps
    const workflowSteps = agentConfigurationService.getWorkflowSteps(useCaseId);
    if (workflowSteps.length > 0) {
      // Get use case name
      const useCase = await this.getUseCase(useCaseId);
      const useCaseName = useCase?.name || useCaseId;
      
      const workflow: UseCaseWorkflow = {
        id: `workflow-${useCaseId}-auto`,
        useCaseId,
        name: `${useCaseName} Automated Workflow`,
        description: 'Automatically generated workflow based on agent configuration',
        steps: workflowSteps.map((step, index) => ({
          id: step.id,
          name: step.name,
          agentId: step.agentId,
          order: index + 1,
          config: {},
          parameters: {},
        })),
        status: 'active',
        schedule: {
          type: 'manual',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        runCount: 0,
      };
      return [workflow];
    }
    
    // Fallback to API or mock data
    const fallbackData = this.getMockWorkflows(useCaseId);
    
    try {
      const data = await apiWithCache.get<UseCaseWorkflow[]>(`/usecase/${useCaseId}/workflows`, {
        cacheKey: `workflows-${useCaseId}`,
        cacheDuration: 3 * 60 * 1000, // 3 minutes
        timeout: 1000, // 1 second timeout
        fallbackData,
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      return fallbackData;
    }
  }

  // Create workflow
  async createWorkflow(workflow: Omit<UseCaseWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>): Promise<UseCaseWorkflow> {
    const startTime = Date.now();
    try {
      const response = await api.post(`/usecase/${workflow.useCaseId}/workflows`, workflow);
      integrationLogger.logApiCall('POST', `/api/usecase/${workflow.useCaseId}/workflows`, 201, Date.now() - startTime);
      const newWorkflow = response.data;
      integrationLogger.logWorkflowEvent(
        newWorkflow.id,
        `Workflow "${newWorkflow.name}" created with ${newWorkflow.steps.length} steps`,
        'success',
        { useCaseId: workflow.useCaseId }
      );
      auditLogger.logWorkflowAction('create', newWorkflow.id, newWorkflow.name, 'success', {
        metadata: {
          useCaseId: workflow.useCaseId,
          stepCount: newWorkflow.steps.length
        }
      });
      return newWorkflow;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      integrationLogger.logApiCall('POST', `/api/usecase/${workflow.useCaseId}/workflows`, 500, Date.now() - startTime);
      // Return mock response
      const mockWorkflow = {
        ...workflow,
        id: `workflow-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        runCount: 0,
      };
      integrationLogger.logWorkflowEvent(
        mockWorkflow.id,
        `Workflow "${mockWorkflow.name}" created (mock)`,
        'warning',
        { useCaseId: workflow.useCaseId }
      );
      auditLogger.logWorkflowAction('create', mockWorkflow.id, mockWorkflow.name, 'success', {
        metadata: {
          useCaseId: workflow.useCaseId,
          stepCount: mockWorkflow.steps.length,
          mock: true
        }
      });
      return mockWorkflow;
    }
  }

  // Update workflow
  async updateWorkflow(id: string, updates: Partial<UseCaseWorkflow>): Promise<UseCaseWorkflow | null> {
    try {
      const response = await api.put(`/workflows/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      return null;
    }
  }

  // Run workflow
  async runWorkflow(workflowId: string): Promise<{ success: boolean; runId: string }> {
    const startTime = Date.now();
    try {
      const response = await api.post(`/workflows/${workflowId}/run`);
      integrationLogger.logApiCall('POST', `/api/workflows/${workflowId}/run`, 200, Date.now() - startTime);
      integrationLogger.logWorkflowEvent(
        workflowId,
        `Workflow execution started`,
        'success',
        { runId: response.data.runId }
      );
      auditLogger.logWorkflowAction('execute', workflowId, 'Workflow', 'success', {
        metadata: { runId: response.data.runId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to run workflow:', error);
      integrationLogger.logApiCall('POST', `/api/workflows/${workflowId}/run`, 500, Date.now() - startTime);
      integrationLogger.logError(error as Error, 'Workflow', { workflowId });
      // Return mock response
      const mockRunId = `run-${Date.now()}`;
      integrationLogger.logWorkflowEvent(
        workflowId,
        `Workflow execution started (mock)`,
        'warning',
        { runId: mockRunId }
      );
      auditLogger.logWorkflowAction('execute', workflowId, 'Workflow', 'failure', {
        metadata: {
          runId: mockRunId,
          error: 'Failed to execute on backend, using mock',
          mock: true
        }
      });
      return {
        success: true,
        runId: mockRunId,
      };
    }
  }

  // Get agents for operations tab
  async getUseCaseAgents(useCaseId: string): Promise<Array<AgentNode & { status: 'operational' | 'disabled' | 'error' }>> {
    try {
      const response = await api.get(`/usecase/${useCaseId}/operations/agents`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch use case agents:', error);
      // Return mock data
      const graph = await this.getAgentGraph(useCaseId);
      if (!graph) return [];
      return graph.agents.map(agent => ({
        ...agent,
        status: 'operational' as const,
      }));
    }
  }

  // Check if a use case has auto-configuration
  hasAutoConfiguration(useCaseId: string): boolean {
    return agentConfigurationService.hasConfiguration(useCaseId);
  }

  // Mock data methods for development
  private getMockUseCases(): UseCase[] {
    return [
      {
        id: 'oilfield-land-lease',
        name: 'Oilfield Land Lease',
        description: 'Automated workflow for processing and analyzing land lease agreements, compliance checks, and renewal notifications',
        category: 'Real Estate',
        vertical: 'Energy',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-20'),
      },
      {
        id: 'energy-load-forecasting',
        name: 'Energy Load Forecasting',
        description: 'AI-powered workflow for predicting energy consumption patterns and optimizing grid load distribution',
        category: 'Operations',
        vertical: 'Energy',
        status: 'active',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-03-22'),
      },
      {
        id: 'insurance-claims',
        name: 'Insurance Claims Processing',
        description: 'Automated workflow for processing insurance claims with fraud detection and approval routing',
        category: 'Claims',
        vertical: 'Insurance',
        status: 'active',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-03-18'),
      },
    ];
  }

  private getMockOilfieldAgentGraph(): AgentGraph {
    return {
      useCaseId: 'oilfield-land-lease',
      agents: [
        {
          id: 'orchestrator',
          name: 'Oilfield Lease Orchestrator Agent',
          type: 'coordinator',
          role: 'Coordinator',
          description: 'Coordinates the entire lease analysis workflow',
          position: { x: 400, y: 50 },
          connections: ['ingest', 'risk', 'forecast', 'compliance'],
        },
        {
          id: 'ingest',
          name: 'Data Ingest Agent',
          type: 'custom',
          role: 'Data Processing',
          description: 'Ingests and validates lease data from various sources',
          position: { x: 100, y: 200 },
          connections: ['risk', 'forecast', 'compliance'],
        },
        {
          id: 'risk',
          name: 'Lease Expiration Risk Agent',
          type: 'custom',
          role: 'Risk Analysis',
          description: 'Analyzes lease expiration dates and identifies risks',
          position: { x: 250, y: 350 },
          connections: ['docgen'],
        },
        {
          id: 'forecast',
          name: 'Revenue Forecast Agent',
          type: 'custom',
          role: 'Financial Analysis',
          description: 'Forecasts revenue based on lease terms and market conditions',
          position: { x: 400, y: 350 },
          connections: ['docgen'],
        },
        {
          id: 'compliance',
          name: 'Compliance Analysis Agent',
          type: 'custom',
          role: 'Compliance',
          description: 'Checks lease agreements for regulatory compliance',
          position: { x: 550, y: 350 },
          connections: ['docgen'],
        },
        {
          id: 'docgen',
          name: 'Document Generation Agent',
          type: 'custom',
          role: 'Documentation',
          description: 'Generates compliance reports and renewal recommendations',
          position: { x: 400, y: 500 },
          connections: ['erp', 'notify'],
        },
        {
          id: 'erp',
          name: 'ERP Integration Agent',
          type: 'custom',
          role: 'Integration',
          description: 'Syncs data with external ERP systems',
          position: { x: 250, y: 650 },
          connections: [],
        },
        {
          id: 'notify',
          name: 'Notification Agent',
          type: 'custom',
          role: 'Communication',
          description: 'Sends alerts and notifications to stakeholders',
          position: { x: 550, y: 650 },
          connections: [],
        },
      ],
      connections: [
        { id: 'conn-1', from: 'orchestrator', to: 'ingest', type: 'control' },
        { id: 'conn-2', from: 'orchestrator', to: 'risk', type: 'control' },
        { id: 'conn-3', from: 'orchestrator', to: 'forecast', type: 'control' },
        { id: 'conn-4', from: 'orchestrator', to: 'compliance', type: 'control' },
        { id: 'conn-5', from: 'ingest', to: 'risk', type: 'data' },
        { id: 'conn-6', from: 'ingest', to: 'forecast', type: 'data' },
        { id: 'conn-7', from: 'ingest', to: 'compliance', type: 'data' },
        { id: 'conn-8', from: 'risk', to: 'docgen', type: 'data' },
        { id: 'conn-9', from: 'forecast', to: 'docgen', type: 'data' },
        { id: 'conn-10', from: 'compliance', to: 'docgen', type: 'data' },
        { id: 'conn-11', from: 'docgen', to: 'erp', type: 'data' },
        { id: 'conn-12', from: 'docgen', to: 'notify', type: 'data' },
      ],
      metadata: {
        lastModified: new Date(),
        modifiedBy: 'system',
        version: 1,
      },
    };
  }

  private getMockWorkflows(useCaseId: string): UseCaseWorkflow[] {
    if (useCaseId === 'oilfield-land-lease') {
      return [{
        id: 'workflow-oilfield-1',
        useCaseId: 'oilfield-land-lease',
        name: 'Oilfield Land Lease Management Workflow',
        description: 'End-to-end workflow for managing oilfield land leases',
        steps: [
          {
            id: 'step-1',
            name: 'Ingest Lease Data',
            agentId: 'ingest',
            order: 1,
            config: {
              sources: ['csv', 'api', 'manual'],
              validation: true,
            },
          },
          {
            id: 'step-2',
            name: 'Analyze Expirations',
            agentId: 'risk',
            order: 2,
            config: {
              thresholdDays: 90,
              riskLevels: ['high', 'medium', 'low'],
            },
          },
          {
            id: 'step-3',
            name: 'Forecast Revenue',
            agentId: 'forecast',
            order: 3,
            config: {
              forecastPeriod: '12_months',
              includeMarketData: true,
            },
          },
          {
            id: 'step-4',
            name: 'Generate Compliance Docs',
            agentId: 'docgen',
            order: 4,
            config: {
              templates: ['compliance_report', 'renewal_recommendation'],
              format: 'pdf',
            },
          },
          {
            id: 'step-5',
            name: 'Push to ERP',
            agentId: 'erp',
            order: 5,
            config: {
              system: 'SAP',
              syncMode: 'incremental',
            },
          },
        ],
        status: 'active',
        schedule: {
          type: 'scheduled',
          config: {
            cron: '0 0 * * *', // Daily at midnight
          },
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-20'),
        lastRunAt: new Date('2024-03-25'),
        runCount: 156,
      }];
    }
    return [];
  }
}

export const useCaseService = new UseCaseService();