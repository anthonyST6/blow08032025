import { AgentFlag } from '../../agents/base.agent';

export interface UseCaseWorkflow {
  id: string;
  useCaseId: string;
  name: string;
  description: string;
  industry: string;
  version: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  metadata: WorkflowMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'detect' | 'analyze' | 'decide' | 'execute' | 'verify' | 'report';
  agent: string;
  service?: string;
  action: string;
  parameters: Record<string, any>;
  conditions?: StepCondition[];
  outputs: string[];
  timeout?: number;
  errorHandling: ErrorHandling;
  humanApprovalRequired?: boolean;
}

export interface WorkflowTrigger {
  type: 'scheduled' | 'event' | 'manual' | 'threshold';
  schedule?: string; // cron expression
  event?: string;
  threshold?: {
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=';
    value: number;
  };
}

export interface WorkflowMetadata {
  requiredServices: string[];
  requiredAgents: string[];
  estimatedDuration: number; // in milliseconds
  criticality: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  compliance: string[];
}

export interface StepCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | 'contains' | 'exists' | 'in' | 'not_in';
  value: any;
  combineWith?: 'AND' | 'OR';
}

export interface ErrorHandling {
  retry?: RetryConfig;
  fallback?: string; // step ID to fallback to
  escalate?: boolean;
  notification?: NotificationConfig;
}

export interface RetryConfig {
  attempts: number;
  delay: number; // milliseconds
  backoffMultiplier?: number;
  maxDelay?: number;
}

export interface NotificationConfig {
  channels: ('email' | 'teams' | 'slack' | 'webhook')[];
  recipients?: string[];
  template?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  useCaseId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  startedAt: Date;
  completedAt?: Date;
  currentStep?: string;
  steps: StepExecution[];
  context: WorkflowContext;
  flags: AgentFlag[];
  error?: WorkflowError;
  metrics: ExecutionMetrics;
}

export interface StepExecution {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  retryCount?: number;
  duration?: number;
}

export interface WorkflowContext {
  useCaseId: string;
  workflowId: string;
  executionId: string;
  input: Record<string, any>;
  variables: Record<string, any>;
  stepResults: Record<string, any>;
  metadata: Record<string, any>;
}

export interface WorkflowError {
  code: string;
  message: string;
  stepId?: string;
  details?: any;
  stack?: string;
}

export interface ExecutionMetrics {
  totalDuration?: number;
  stepDurations: Record<string, number>;
  retryCount: number;
  errorCount: number;
  flagCount: number;
}

export interface StepResult {
  success: boolean;
  data?: any;
  error?: Error;
  flags?: AgentFlag[];
  nextStep?: string;
  skipRemainingSteps?: boolean;
}

export interface WorkflowDefinition {
  useCaseId: string;
  workflow: UseCaseWorkflow;
}