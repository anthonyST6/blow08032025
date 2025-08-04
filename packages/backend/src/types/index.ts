export enum UserRole {
  ADMIN = 'admin',
  AI_RISK_OFFICER = 'ai_risk_officer',
  COMPLIANCE_REVIEWER = 'compliance_reviewer',
  USER = 'user',
}

export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  AZURE_OPENAI = 'azure_openai',
}

export enum AgentType {
  SECURITY_SENTINEL = 'security-sentinel',
  INTEGRITY_AUDITOR = 'integrity-auditor',
  ACCURACY_ENGINE = 'accuracy-engine',
  BIAS_DETECTOR = 'bias-detector',
  VOLATILITY_MONITOR = 'volatility-monitor',
  RED_FLAG_DETECTOR = 'red-flag-detector',
  EXPLAINABILITY_ANALYZER = 'explainability-analyzer',
  SOURCE_VERIFIER = 'source-verifier',
  DECISION_TREE_ANALYZER = 'decision-tree-analyzer',
  ETHICAL_ALIGNMENT = 'ethical-alignment',
}

export enum AnalysisStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AnalysisResult {
  score: number;
  passed: boolean;
  details: string;
  flags?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }>;
  metadata?: Record<string, any>;
}

export interface AgentAnalysis {
  id?: string;
  agentId: string;
  agentType: AgentType;
  promptId: string;
  responseId: string;
  status: AnalysisStatus;
  result?: AnalysisResult;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface LLMResponse {
  id?: string;
  promptId: string;
  response: string;
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  createdAt: Date;
}

export interface Prompt {
  id?: string;
  content: string;
  userId: string;
  context?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}