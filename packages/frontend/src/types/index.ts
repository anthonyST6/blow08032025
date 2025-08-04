// User roles enum matching backend
export enum UserRole {
  ADMIN = 'admin',
  AI_RISK_OFFICER = 'ai_risk_officer',
  COMPLIANCE_REVIEWER = 'compliance_reviewer',
  USER = 'user',
}

// User interface
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

// LLM Provider types
export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  AZURE_OPENAI = 'azure_openai',
}

// LLM Configuration
export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// Prompt interface
export interface Prompt {
  id: string;
  userId: string;
  text: string;
  llmConfig: LLMConfig;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// LLM Response interface
export interface LLMResponse {
  id: string;
  promptId: string;
  text: string;
  provider: LLMProvider;
  model: string;
  tokensUsed: number;
  latency: number;
  createdAt: Date;
  error?: string;
}

// Agent Analysis interface
export interface AgentAnalysis {
  id: string;
  responseId: string;
  agentId: string;
  agentName: string;
  score: number;
  flags: AgentFlag[];
  metadata: Record<string, any>;
  confidence: number;
  processingTime: number;
  createdAt: Date;
}

// Agent Flag interface
export interface AgentFlag {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  details?: Record<string, any>;
}

// Workflow interface
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  agents: string[];
  trigger: WorkflowTrigger;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  runCount: number;
}

// Workflow Trigger types
export interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event';
  schedule?: string; // Cron expression for scheduled triggers
  event?: string; // Event name for event triggers
}

// Workflow Execution interface
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  results?: AgentAnalysis[];
  error?: string;
}

// Audit Log interface
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Dashboard Stats interface
export interface DashboardStats {
  totalPrompts: number;
  totalAnalyses: number;
  averageScore: number;
  flaggedResponses: number;
  activeWorkflows: number;
  recentActivity: ActivityItem[];
}

// Activity Item interface
export interface ActivityItem {
  id: string;
  type: 'prompt' | 'analysis' | 'workflow' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Paginated Response interface
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter interface for various resources
export interface FilterParams {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  agentId?: string;
  severity?: string[];
  status?: string[];
  search?: string;
}

// Export formats
export enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
  JSON = 'json',
}

// Chart data interfaces
export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface AgentPerformanceData {
  agentId: string;
  agentName: string;
  averageScore: number;
  totalAnalyses: number;
  flagCounts: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  trends?: TimeSeriesData[];
}

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Settings interface
export interface UserSettings {
  userId: string;
  notifications: {
    email: boolean;
    inApp: boolean;
    criticalAlerts: boolean;
    dailyDigest: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    density: 'comfortable' | 'compact';
    language: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
  };
}

// Agent Registry interface
export interface AgentInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  isActive: boolean;
  config?: Record<string, any>;
}

// System Health interface
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    llmProviders: Record<string, ServiceStatus>;
    agents: ServiceStatus;
  };
  lastChecked: Date;
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  error?: string;
}

// Form validation schemas (for use with react-hook-form)
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  acceptTerms: boolean;
}

export interface PromptFormData {
  text: string;
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface WorkflowFormData {
  name: string;
  description?: string;
  agents: string[];
  triggerType: 'manual' | 'scheduled' | 'event';
  schedule?: string;
  isActive: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Feature flags
export interface FeatureFlags {
  enableBetaFeatures: boolean;
  enableAdvancedAnalytics: boolean;
  enableRealtimeMonitoring: boolean;
  enableWorkflowAutomation: boolean;
  maxConcurrentAnalyses: number;
}

// Compliance Types
export interface ComplianceReport {
  id: string;
  title: string;
  type: 'gdpr' | 'hipaa' | 'sox' | 'pci' | 'ai_ethics' | 'general';
  status: 'draft' | 'pending_review' | 'approved' | 'published';
  complianceScore: number;
  findings: ComplianceFinding[];
  recommendations: string[];
  generatedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  generatedAt: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface ComplianceFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  evidence: string[];
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted';
}

// LLM Model interface
export interface LLMModel {
  id: string;
  provider: LLMProvider;
  name: string;
  displayName: string;
  maxTokens: number;
  costPer1kTokens: number;
  isActive: boolean;
  capabilities?: string[];
}

// Report interface
export interface Report {
  id: string;
  type: string;
  title: string;
  description?: string;
  generatedBy: string;
  generatedAt: Date;
  data: Record<string, any>;
  format?: ExportFormat;
  status: 'pending' | 'completed' | 'failed';
}

// Agent interface
export interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  version: string;
  isActive: boolean;
  capabilities: string[];
  config?: Record<string, any>;
  metrics?: {
    totalAnalyses: number;
    averageScore: number;
    averageProcessingTime: number;
  };
}

// Analysis Result interface
export interface AnalysisResult {
  id: string;
  promptId: string;
  responseId: string;
  agents: AgentAnalysis[];
  overallScore: number;
  flags: AgentFlag[];
  recommendations: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Organization interface
export interface Organization {
  id: string;
  name: string;
  domain?: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: Record<string, any>;
  userCount?: number;
  subscription?: {
    plan: string;
    status: 'active' | 'inactive' | 'trial';
    expiresAt?: Date;
  };
}

// Admin Settings interface
export interface AdminSettings {
  systemConfig: {
    maintenanceMode: boolean;
    debugMode: boolean;
    maxConcurrentRequests: number;
    rateLimits: Record<string, number>;
  };
  features: FeatureFlags;
  integrations: {
    openai: {
      enabled: boolean;
      apiKey?: string;
      organization?: string;
    };
    anthropic: {
      enabled: boolean;
      apiKey?: string;
    };
    azure: {
      enabled: boolean;
      endpoint?: string;
      apiKey?: string;
    };
  };
  notifications: {
    emailEnabled: boolean;
    slackEnabled: boolean;
    webhookUrl?: string;
  };
}

// Metrics interface
export interface Metrics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalPrompts: number;
    totalAnalyses: number;
    averageResponseTime: number;
  };
  performance: {
    apiLatency: TimeSeriesData[];
    throughput: TimeSeriesData[];
    errorRate: TimeSeriesData[];
  };
  usage: {
    promptsByProvider: ChartDataPoint[];
    analysesByAgent: ChartDataPoint[];
    userActivity: TimeSeriesData[];
  };
  costs: {
    totalCost: number;
    costByProvider: ChartDataPoint[];
    costTrend: TimeSeriesData[];
  };
}

// Mission Control Types
export type MissionCategory = 'data-analysis' | 'threat-detection' | 'compliance-check' | 'system-optimization';
export type MissionStatus = 'active' | 'pending' | 'completed';

export interface Mission {
  id: string;
  name: string;
  category: MissionCategory;
  progress: number; // 0-100
  status: MissionStatus;
  startTime: Date;
  estimatedCompletion: Date;
  assignedAgents: string[];
}

export interface AgentPerformancePoint {
  timestamp: Date;
  productivity: number; // 0-100
  efficiency: number; // 0-100
  agentId: string;
}

export interface TaskSummary {
  completed: number;
  ongoing: number;
  pending: number;
  failureRate: number;
  averageCompletionTime: number; // in minutes
}

export type AlertType = 'security' | 'performance' | 'data-sync' | 'agent-health';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  acknowledged: boolean;
}

// Extended ActivityItem to include SIA scores
export interface ActivityItemExtended extends ActivityItem {
  siaScore?: number;
  vertical?: string;
}

// Agent Orchestration Types
export type AgentStatus = 'online' | 'offline' | 'busy' | 'error';
export type AgentCapability = 'analysis' | 'validation' | 'monitoring' | 'reporting' | 'integration';

export interface AgentOrchestration {
  id: string;
  name: string;
  status: AgentStatus;
  type: string;
  capabilities: AgentCapability[];
  currentLoad: number; // 0-100
  tasksCompleted: number;
  averageResponseTime: number; // in ms
  lastActive: Date;
  version: string;
  uptime: number; // in seconds
}

// Prompt Engineering Types
export type PromptStatus = 'draft' | 'testing' | 'active' | 'archived';
export type PromptCategory = 'analysis' | 'generation' | 'classification' | 'extraction';

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  status: PromptStatus;
  version: string;
  usageCount: number;
  successRate: number; // 0-100
  averageTokens: number;
  lastModified: Date;
  createdBy: string;
  tags: string[];
}

// Tools and Integrations Types
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';
export type IntegrationType = 'api' | 'database' | 'messaging' | 'storage' | 'analytics';

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  provider: string;
  lastSync: Date;
  dataTransferred: number; // in MB
  errorRate: number; // percentage
  configuration: {
    endpoint?: string;
    authenticated: boolean;
    rateLimit?: number;
  };
}

// Audit Types
export type AuditEventType = 'access' | 'modification' | 'deletion' | 'export' | 'configuration';
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  resource: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: Record<string, any>;
}

// User Management Types
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type UserActivity = 'online' | 'away' | 'offline';

export interface UserManagement {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  activity: UserActivity;
  lastLogin: Date;
  createdAt: Date;
  department?: string;
  permissions: string[];
  sessionsActive: number;
  storageUsed: number; // in MB
  apiCallsToday: number;
}