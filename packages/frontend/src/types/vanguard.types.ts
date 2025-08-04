export interface AgentFlag {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  details?: any;
}

export interface AgentResult {
  agentId: string;
  agentName: string;
  analysisId: string;
  score: number; // 0-100, where 100 is best
  flags: AgentFlag[];
  metadata: Record<string, any>;
  timestamp: Date;
  confidence: number; // 0-1
  processingTime: number; // milliseconds
}

export interface LLMOutput {
  id: string;
  promptId: string;
  model: string;
  modelVersion: string;
  text: string;
  rawResponse: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface VanguardExecutionResult {
  executionId: string;
  useCaseId: string;
  results: AgentResult[];
  errors: Array<{ agentId: string; error: string }>;
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  status: 'completed' | 'partial' | 'failed';
}

export interface VanguardAction {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  metadata?: Record<string, any>;
}