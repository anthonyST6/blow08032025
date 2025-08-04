export interface UseCase {
  id: string;
  name: string;
  description: string;
  category: string;
  vertical: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentNode {
  id: string;
  name: string;
  type: 'coordinator' | 'security' | 'integrity' | 'accuracy' | 'custom' | 'data' | 'analytics' | 'compliance' | 'report';
  role?: string;
  description?: string;
  capabilities?: string[];
  config?: Record<string, any>;
  position?: { x: number; y: number };
  connections: string[];
  status?: 'operational' | 'disabled' | 'error';
}

export interface AgentConnection {
  id: string;
  from: string;
  to: string;
  type: 'data' | 'control' | 'feedback';
}

export interface AgentGraph {
  useCaseId: string;
  agents: AgentNode[];
  connections: AgentConnection[];
  metadata?: {
    lastModified: Date;
    modifiedBy: string;
    version: number;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  agentId: string;
  order: number;
  config?: Record<string, any>;
  parameters?: Record<string, any>;
}

export interface UseCaseWorkflow {
  id: string;
  useCaseId: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'active' | 'inactive' | 'draft';
  schedule?: {
    type: 'manual' | 'scheduled' | 'event';
    config?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  runCount: number;
}