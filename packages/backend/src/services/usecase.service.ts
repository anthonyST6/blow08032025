import { UseCase, AgentGraph, UseCaseWorkflow, AgentNode } from '../types/usecase.types';

// Pre-defined use cases
const predefinedUseCases: UseCase[] = [
  // Energy & Utilities
  {
    id: 'oilfield-land-lease',
    name: 'Oilfield Land Lease',
    description: 'Automated workflow for processing and analyzing land lease agreements, compliance checks, and renewal notifications',
    category: 'Land Management',
    vertical: 'Energy & Utilities',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: 'energy-load-forecasting',
    name: 'Energy Load Forecasting',
    description: 'AI-powered workflow for predicting energy consumption patterns and optimizing grid load distribution',
    category: 'Operations',
    vertical: 'Energy & Utilities',
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-22'),
  },
  {
    id: 'grid-anomaly-detection',
    name: 'Grid Anomaly Detection',
    description: 'Real-time monitoring and detection of power grid anomalies to prevent outages',
    category: 'Monitoring',
    vertical: 'Energy & Utilities',
    status: 'active',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-25'),
  },
  // Healthcare
  {
    id: 'patient-intake',
    name: 'Patient Intake Automation',
    description: 'Streamline patient registration and medical history collection',
    category: 'Administration',
    vertical: 'Healthcare',
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-18'),
  },
  {
    id: 'clinical-trial-matching',
    name: 'Clinical Trial Matching',
    description: 'Match eligible patients with appropriate clinical trials using AI',
    category: 'Research',
    vertical: 'Healthcare',
    status: 'active',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-20'),
  },
  // Finance & Banking
  {
    id: 'fraud-detection',
    name: 'Transaction Fraud Detection',
    description: 'Real-time analysis of financial transactions to detect and prevent fraud',
    category: 'Security',
    vertical: 'Finance & Banking',
    status: 'active',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-03-22'),
  },
  {
    id: 'loan-processing',
    name: 'Automated Loan Processing',
    description: 'End-to-end automation of loan applications and approvals',
    category: 'Operations',
    vertical: 'Finance & Banking',
    status: 'active',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-03-24'),
  },
];

// Pre-built agent graph for Oilfield Land Lease
const oilfieldLandLeaseAgentGraph: AgentGraph = {
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

// Pre-built workflows
const oilfieldWorkflow: UseCaseWorkflow = {
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
};

// In-memory storage (replace with database in production)
const agentGraphs = new Map<string, AgentGraph>([
  ['oilfield-land-lease', oilfieldLandLeaseAgentGraph],
]);

const workflows = new Map<string, UseCaseWorkflow[]>([
  ['oilfield-land-lease', [oilfieldWorkflow]],
]);

export class UseCaseService {
  // Get all domains
  async getDomains(): Promise<string[]> {
    // Extract unique domains/verticals from predefined use cases
    const domains = new Set<string>();
    predefinedUseCases.forEach(uc => {
      if (uc.vertical) {
        domains.add(uc.vertical);
      }
    });
    
    // Add additional domains that might not have use cases yet
    const additionalDomains = [
      'Energy & Utilities',
      'Healthcare',
      'Finance & Banking',
      'Manufacturing',
      'Retail & E-commerce',
      'Logistics & Supply Chain',
      'Education',
      'Pharmaceuticals',
      'Government',
      'Telecommunications',
      'Real Estate'
    ];
    
    additionalDomains.forEach(domain => domains.add(domain));
    
    return Array.from(domains).sort();
  }

  // Get all use cases (with optional domain filter)
  async getUseCases(domain?: string): Promise<UseCase[]> {
    if (domain) {
      return predefinedUseCases.filter(uc =>
        uc.vertical?.toLowerCase() === domain.toLowerCase() ||
        uc.vertical === domain
      );
    }
    return predefinedUseCases;
  }

  // Get use case by ID
  async getUseCase(id: string): Promise<UseCase | null> {
    return predefinedUseCases.find(uc => uc.id === id) || null;
  }

  // Get agent graph for a use case
  async getAgentGraph(useCaseId: string): Promise<AgentGraph | null> {
    return agentGraphs.get(useCaseId) || null;
  }

  // Save/update agent graph
  async saveAgentGraph(useCaseId: string, graph: Partial<AgentGraph>): Promise<AgentGraph> {
    const existing = agentGraphs.get(useCaseId);
    const updated: AgentGraph = {
      useCaseId,
      agents: graph.agents || existing?.agents || [],
      connections: graph.connections || existing?.connections || [],
      metadata: {
        lastModified: new Date(),
        modifiedBy: 'user', // In production, get from auth context
        version: (existing?.metadata?.version || 0) + 1,
      },
    };
    
    agentGraphs.set(useCaseId, updated);
    return updated;
  }

  // Get workflows for a use case
  async getWorkflows(useCaseId: string): Promise<UseCaseWorkflow[]> {
    return workflows.get(useCaseId) || [];
  }

  // Create workflow
  async createWorkflow(workflow: Omit<UseCaseWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>): Promise<UseCaseWorkflow> {
    const newWorkflow: UseCaseWorkflow = {
      ...workflow,
      id: `workflow-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      runCount: 0,
    };

    const existing = workflows.get(workflow.useCaseId) || [];
    workflows.set(workflow.useCaseId, [...existing, newWorkflow]);
    
    return newWorkflow;
  }

  // Update workflow
  async updateWorkflow(id: string, updates: Partial<UseCaseWorkflow>): Promise<UseCaseWorkflow | null> {
    for (const [useCaseId, useCaseWorkflows] of workflows.entries()) {
      const index = useCaseWorkflows.findIndex(w => w.id === id);
      if (index !== -1) {
        const updated = {
          ...useCaseWorkflows[index],
          ...updates,
          updatedAt: new Date(),
        };
        useCaseWorkflows[index] = updated;
        workflows.set(useCaseId, useCaseWorkflows);
        return updated;
      }
    }
    return null;
  }

  // Run workflow
  async runWorkflow(workflowId: string): Promise<{ success: boolean; runId: string }> {
    // Find the workflow
    for (const useCaseWorkflows of workflows.values()) {
      const workflow = useCaseWorkflows.find(w => w.id === workflowId);
      if (workflow) {
        // Update run count and last run time
        workflow.runCount += 1;
        workflow.lastRunAt = new Date();
        
        // In production, this would trigger actual workflow execution
        // For now, return success with a mock run ID
        return {
          success: true,
          runId: `run-${Date.now()}`,
        };
      }
    }
    
    throw new Error('Workflow not found');
  }

  // Get agents for operations tab
  async getUseCaseAgents(useCaseId: string): Promise<Array<AgentNode & { status: 'operational' | 'disabled' | 'error' }>> {
    const graph = await this.getAgentGraph(useCaseId);
    if (!graph) return [];

    // Add status to each agent (in production, this would come from monitoring)
    return graph.agents.map(agent => ({
      ...agent,
      status: 'operational' as const, // Mock status
    }));
  }

  // Create a new use case
  async createUseCase(data: {
    name: string;
    description: string;
    domain: string;
    template?: string;
    iconPath?: string;
    configPath?: string;
    createdBy: string;
  }): Promise<UseCase> {
    const newUseCase: UseCase = {
      id: `usecase-${Date.now()}`,
      name: data.name,
      description: data.description,
      category: data.domain,
      vertical: data.domain,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to predefined use cases (in production, save to database)
    predefinedUseCases.push(newUseCase);

    // If template is provided, copy the agent graph from template
    if (data.template && data.template !== 'custom') {
      const templateGraph = agentGraphs.get(data.template);
      if (templateGraph) {
        const newGraph: AgentGraph = {
          ...templateGraph,
          useCaseId: newUseCase.id,
          metadata: {
            lastModified: new Date(),
            modifiedBy: data.createdBy,
            version: 1,
          },
        };
        agentGraphs.set(newUseCase.id, newGraph);
      }
    }

    return newUseCase;
  }

  // Save use case data (KPIs, logs, audit events, outputs)
  async saveUseCaseData(useCaseId: string, data: {
    kpis?: any[];
    logs?: any[];
    auditEvents?: any[];
    outputs?: any[];
  }): Promise<{ success: boolean }> {
    // In production, this would save to database
    // For now, just return success
    console.log(`Saving data for use case ${useCaseId}:`, data);
    return { success: true };
  }

  // Save orchestration
  async saveOrchestration(data: {
    useCaseId: string;
    agents: any[];
    connections: any[];
  }): Promise<AgentGraph> {
    const graph: AgentGraph = {
      useCaseId: data.useCaseId,
      agents: data.agents,
      connections: data.connections,
      metadata: {
        lastModified: new Date(),
        modifiedBy: 'system',
        version: 1,
      },
    };

    agentGraphs.set(data.useCaseId, graph);
    return graph;
  }
}

export const useCaseService = new UseCaseService();