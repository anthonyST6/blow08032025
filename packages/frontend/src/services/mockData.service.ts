// Mock Data Service for Demo Environment
import {
  DashboardStats,
  Mission,
  MissionCategory,
  MissionStatus,
  AgentPerformancePoint,
  TaskSummary,
  Alert,
  AlertType,
  AlertSeverity,
  AgentOrchestration,
  AgentStatus,
  AgentCapability,
  PromptTemplate,
  PromptStatus,
  PromptCategory,
  Integration,
  IntegrationStatus,
  IntegrationType,
  AuditEvent,
  AuditEventType,
  AuditSeverity,
  UserManagement,
  UserRole,
  UserStatus,
  UserActivity
} from '../types';

// Generate realistic dashboard statistics
export const generateDashboardStats = (): DashboardStats => {
  const now = new Date();
  
  return {
    totalPrompts: 12847,
    totalAnalyses: 8923,
    activeWorkflows: 42,
    flaggedResponses: 156,
    averageScore: 94.3,
    recentActivity: generateRecentActivity(),
  };
};

// Generate recent activity feed
export const generateRecentActivity = () => {
  const activities = [
    {
      id: '1',
      type: 'analysis' as const,
      title: 'Land Lease Risk Assessment Completed',
      description: 'AI analysis completed for Texas property lease agreement with 97% confidence',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      severity: 'info' as const,
      siaScore: 97,
      vertical: 'energy',
    },
    {
      id: '2',
      type: 'alert' as const,
      title: 'Compliance Issue Detected',
      description: 'Environmental compliance risk identified in New Mexico drilling permit',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      severity: 'warning' as const,
      siaScore: 82,
      vertical: 'energy',
    },
    {
      id: '3',
      type: 'workflow' as const,
      title: 'Multi-Party Agreement Workflow Started',
      description: 'Automated workflow initiated for 5-party joint venture agreement',
      timestamp: new Date(Date.now() - 18 * 60 * 1000),
      severity: 'info' as const,
      siaScore: 95,
      vertical: 'energy',
    },
    {
      id: '4',
      type: 'prompt' as const,
      title: 'Prompt Engineering Update',
      description: 'Legal document analysis prompt optimized with 15% accuracy improvement',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      severity: 'info' as const,
      siaScore: 98,
      vertical: 'legal',
    },
    {
      id: '5',
      type: 'alert' as const,
      title: 'Critical Security Alert',
      description: 'Potential data exposure risk detected in API endpoint',
      timestamp: new Date(Date.now() - 32 * 60 * 1000),
      severity: 'critical' as const,
      siaScore: 65,
      vertical: 'security',
    },
    {
      id: '6',
      type: 'analysis' as const,
      title: 'Healthcare Compliance Check',
      description: 'HIPAA compliance verification completed for patient data processing',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      severity: 'info' as const,
      siaScore: 99,
      vertical: 'healthcare',
    },
    {
      id: '7',
      type: 'workflow' as const,
      title: 'Insurance Claim Processing',
      description: 'Automated claim validation workflow completed successfully',
      timestamp: new Date(Date.now() - 52 * 60 * 1000),
      severity: 'info' as const,
      siaScore: 94,
      vertical: 'insurance',
    },
    {
      id: '8',
      type: 'analysis' as const,
      title: 'Financial Risk Assessment',
      description: 'Portfolio risk analysis completed with anomaly detection',
      timestamp: new Date(Date.now() - 67 * 60 * 1000),
      severity: 'warning' as const,
      siaScore: 88,
      vertical: 'finance',
    },
  ];

  return activities;
};

// Generate land lease data for energy vertical
export const generateLandLeaseData = () => {
  const states = ['Texas', 'New Mexico', 'Oklahoma', 'Louisiana', 'Colorado'];
  const leaseTypes = ['Oil & Gas', 'Renewable Energy', 'Mining', 'Agricultural', 'Mixed Use'];
  const statuses = ['Active', 'Pending', 'Under Review', 'Expiring Soon', 'Renewed'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `lease-${i + 1}`,
    propertyId: `PROP-${String(i + 1).padStart(5, '0')}`,
    leaseholder: `${['Energy Corp', 'Global Resources', 'Terra Industries', 'Peak Energy', 'Frontier Oil'][i % 5]} ${['LLC', 'Inc', 'Partners', 'Group'][i % 4]}`,
    location: {
      state: states[i % states.length],
      county: `County ${i + 1}`,
      acres: Math.floor(Math.random() * 5000) + 500,
      coordinates: {
        lat: 31.9686 + (Math.random() - 0.5) * 10,
        lng: -99.9018 + (Math.random() - 0.5) * 10,
      },
    },
    leaseType: leaseTypes[i % leaseTypes.length],
    status: statuses[i % statuses.length],
    startDate: new Date(2020 + Math.floor(i / 10), i % 12, 1).toISOString(),
    endDate: new Date(2025 + Math.floor(i / 10), i % 12, 1).toISOString(),
    annualPayment: Math.floor(Math.random() * 500000) + 50000,
    royaltyRate: (Math.random() * 0.15 + 0.1).toFixed(3),
    compliance: {
      environmental: Math.random() > 0.1,
      regulatory: Math.random() > 0.05,
      safety: Math.random() > 0.08,
      lastAudit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    siaScores: {
      security: Math.floor(Math.random() * 15) + 85,
      integrity: Math.floor(Math.random() * 15) + 85,
      accuracy: Math.floor(Math.random() * 15) + 85,
    },
    documents: [
      { type: 'Lease Agreement', status: 'Verified', lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { type: 'Environmental Assessment', status: 'Current', lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { type: 'Insurance Certificate', status: 'Expiring', lastUpdated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    stakeholders: [
      { name: 'John Smith', role: 'Landowner', contact: 'john.smith@email.com' },
      { name: 'Sarah Johnson', role: 'Legal Representative', contact: 'sarah.j@lawfirm.com' },
      { name: 'Mike Davis', role: 'Operations Manager', contact: 'mdavis@energycorp.com' },
    ],
  }));
};

// Generate workflow data
export const generateWorkflowData = () => {
  const workflowTypes = [
    'Land Lease Approval',
    'Compliance Review',
    'Risk Assessment',
    'Contract Negotiation',
    'Environmental Impact',
    'Stakeholder Communication',
  ];
  
  const stages = ['Initiated', 'In Progress', 'Review', 'Approval', 'Completed'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `workflow-${i + 1}`,
    name: `${workflowTypes[i % workflowTypes.length]} - ${String(i + 1).padStart(3, '0')}`,
    type: workflowTypes[i % workflowTypes.length],
    status: stages[Math.floor(Math.random() * stages.length)],
    progress: Math.floor(Math.random() * 100),
    startedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: ['AI Agent Alpha', 'AI Agent Beta', 'AI Agent Gamma'][i % 3],
    priority: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
    relatedLease: i < 10 ? `lease-${i + 1}` : null,
    tasks: [
      { name: 'Data Collection', status: 'completed', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { name: 'Analysis', status: 'in-progress', startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { name: 'Review', status: 'pending', estimatedStart: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },
      { name: 'Approval', status: 'pending', estimatedStart: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  }));
};

// Generate agent performance data
export const generateAgentData = () => {
  const agentTypes = ['Security Sentinel', 'Accuracy Engine', 'Integrity Auditor'];
  const specializations = ['Legal Analysis', 'Risk Assessment', 'Compliance Check', 'Data Validation'];
  
  return agentTypes.map((type, i) => ({
    id: `agent-${i + 1}`,
    name: type,
    type: type.toLowerCase().replace(' ', '-'),
    status: 'active',
    uptime: 99.5 + Math.random() * 0.5,
    tasksCompleted: Math.floor(Math.random() * 1000) + 500,
    averageResponseTime: Math.floor(Math.random() * 500) + 100,
    accuracy: 95 + Math.random() * 5,
    specializations: specializations.slice(0, Math.floor(Math.random() * 3) + 1),
    currentLoad: Math.floor(Math.random() * 100),
    recentTasks: Array.from({ length: 5 }, (_, j) => ({
      id: `task-${i}-${j}`,
      type: specializations[j % specializations.length],
      completedAt: new Date(Date.now() - j * 60 * 60 * 1000).toISOString(),
      score: 90 + Math.random() * 10,
    })),
  }));
};

// Generate compliance metrics
export const generateComplianceData = () => {
  const categories = [
    'Environmental Regulations',
    'Safety Standards',
    'Financial Reporting',
    'Data Privacy',
    'Industry Standards',
  ];
  
  return categories.map((category, i) => ({
    id: `compliance-${i + 1}`,
    category,
    score: 85 + Math.random() * 15,
    trend: Math.random() > 0.5 ? 'improving' : 'stable',
    lastAudit: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    issues: Math.floor(Math.random() * 5),
    resolved: Math.floor(Math.random() * 10) + 5,
    pending: Math.floor(Math.random() * 3),
    requirements: [
      { name: 'Annual Report', status: 'compliant', dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() },
      { name: 'Quarterly Review', status: 'pending', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
      { name: 'Safety Inspection', status: 'compliant', dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  }));
};

// Generate financial analytics
export const generateFinancialData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return {
    revenue: months.slice(0, currentMonth + 1).map((month, i) => ({
      month,
      leaseRevenue: Math.floor(Math.random() * 2000000) + 3000000,
      royalties: Math.floor(Math.random() * 500000) + 200000,
      fees: Math.floor(Math.random() * 100000) + 50000,
    })),
    expenses: months.slice(0, currentMonth + 1).map((month, i) => ({
      month,
      operations: Math.floor(Math.random() * 1000000) + 500000,
      maintenance: Math.floor(Math.random() * 300000) + 100000,
      compliance: Math.floor(Math.random() * 200000) + 50000,
    })),
    projections: {
      nextQuarter: {
        revenue: Math.floor(Math.random() * 5000000) + 10000000,
        expenses: Math.floor(Math.random() * 3000000) + 5000000,
        netIncome: Math.floor(Math.random() * 2000000) + 3000000,
      },
      yearEnd: {
        revenue: Math.floor(Math.random() * 20000000) + 40000000,
        expenses: Math.floor(Math.random() * 15000000) + 20000000,
        netIncome: Math.floor(Math.random() * 10000000) + 15000000,
      },
    },
  };
};

// Generate LLM models data
export const generateLLMModels = () => {
  return [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Most capable GPT-4 model',
      maxTokens: 8192,
      costPer1kTokens: 0.03,
      capabilities: ['text-generation', 'analysis', 'reasoning'],
      status: 'active',
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      description: 'Fast and efficient model',
      maxTokens: 4096,
      costPer1kTokens: 0.002,
      capabilities: ['text-generation', 'analysis'],
      status: 'active',
    },
    {
      id: 'claude-2',
      name: 'Claude 2',
      provider: 'Anthropic',
      description: 'Advanced reasoning and analysis',
      maxTokens: 100000,
      costPer1kTokens: 0.01,
      capabilities: ['text-generation', 'analysis', 'reasoning', 'long-context'],
      status: 'active',
    },
    {
      id: 'llama-2-70b',
      name: 'Llama 2 70B',
      provider: 'Meta',
      description: 'Open source large language model',
      maxTokens: 4096,
      costPer1kTokens: 0.001,
      capabilities: ['text-generation', 'analysis'],
      status: 'active',
    },
  ];
};

// Agent Orchestration Data Generators

export const generateAgentOrchestrationData = (): AgentOrchestration[] => {
  const agentTypes = ['Security Sentinel', 'Accuracy Engine', 'Integrity Auditor', 'Compliance Monitor', 'Data Validator'];
  const capabilities: AgentCapability[] = ['analysis', 'validation', 'monitoring', 'reporting', 'integration'];
  const statuses: AgentStatus[] = ['online', 'offline', 'busy', 'error'];
  
  return Array.from({ length: 8 }, (_, i) => {
    const status = i === 0 ? 'error' : i < 3 ? 'busy' : i < 6 ? 'online' : 'offline';
    const isOnline = status === 'online' || status === 'busy';
    
    return {
      id: `agent-orch-${i + 1}`,
      name: agentTypes[i % agentTypes.length] + ` v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
      status: status as AgentStatus,
      type: agentTypes[i % agentTypes.length].toLowerCase().replace(' ', '-'),
      capabilities: capabilities.slice(0, Math.floor(Math.random() * 3) + 2),
      currentLoad: isOnline ? Math.floor(Math.random() * 100) : 0,
      tasksCompleted: Math.floor(Math.random() * 1000) + 100,
      averageResponseTime: isOnline ? Math.floor(Math.random() * 500) + 50 : 0,
      lastActive: new Date(Date.now() - (isOnline ? Math.random() * 300000 : Math.random() * 3600000)),
      version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`,
      uptime: isOnline ? Math.floor(Math.random() * 86400) + 3600 : 0
    };
  });
};

// Prompt Engineering Data Generators

export const generatePromptTemplates = (): PromptTemplate[] => {
  const categories: PromptCategory[] = ['analysis', 'generation', 'classification', 'extraction'];
  const statuses: PromptStatus[] = ['draft', 'testing', 'active', 'archived'];
  const templateNames = {
    'analysis': ['Financial Risk Analysis', 'Legal Document Review', 'Market Sentiment Analysis', 'Compliance Check'],
    'generation': ['Report Generation', 'Summary Creation', 'Response Drafting', 'Content Creation'],
    'classification': ['Document Classification', 'Risk Categorization', 'Intent Detection', 'Sentiment Classification'],
    'extraction': ['Data Extraction', 'Entity Recognition', 'Key Information Retrieval', 'Pattern Extraction']
  };
  
  return Array.from({ length: 12 }, (_, i) => {
    const category = categories[i % categories.length];
    const names = templateNames[category];
    const status = i < 2 ? 'draft' : i < 4 ? 'testing' : i < 10 ? 'active' : 'archived';
    
    return {
      id: `prompt-${i + 1}`,
      name: names[Math.floor(Math.random() * names.length)],
      category,
      status: status as PromptStatus,
      version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
      usageCount: status === 'active' ? Math.floor(Math.random() * 500) + 100 : Math.floor(Math.random() * 50),
      successRate: 85 + Math.random() * 15,
      averageTokens: Math.floor(Math.random() * 500) + 200,
      lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      createdBy: `engineer-${Math.floor(Math.random() * 5) + 1}`,
      tags: ['production', 'optimized', 'validated'].slice(0, Math.floor(Math.random() * 3) + 1)
    };
  });
};

// Tools and Integrations Data Generators

export const generateIntegrations = (): Integration[] => {
  const types: IntegrationType[] = ['api', 'database', 'messaging', 'storage', 'analytics'];
  const providers = {
    'api': ['OpenAI', 'Anthropic', 'Azure', 'Google Cloud'],
    'database': ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
    'messaging': ['Slack', 'Microsoft Teams', 'Email', 'Webhook'],
    'storage': ['AWS S3', 'Azure Blob', 'Google Cloud Storage', 'MinIO'],
    'analytics': ['Datadog', 'New Relic', 'Grafana', 'Splunk']
  };
  
  return Array.from({ length: 10 }, (_, i) => {
    const type = types[i % types.length];
    const providerList = providers[type];
    const status: IntegrationStatus = i === 0 ? 'error' : i < 3 ? 'pending' : i < 8 ? 'connected' : 'disconnected';
    const isConnected = status === 'connected';
    
    return {
      id: `integration-${i + 1}`,
      name: providerList[Math.floor(Math.random() * providerList.length)] + ' Integration',
      type,
      status,
      provider: providerList[Math.floor(Math.random() * providerList.length)],
      lastSync: isConnected ? new Date(Date.now() - Math.random() * 3600000) : new Date(Date.now() - Math.random() * 86400000),
      dataTransferred: isConnected ? Math.floor(Math.random() * 1000) + 100 : 0,
      errorRate: status === 'error' ? 15 + Math.random() * 10 : Math.random() * 5,
      configuration: {
        endpoint: type === 'api' ? `https://api.${providerList[0].toLowerCase()}.com/v1` : undefined,
        authenticated: isConnected,
        rateLimit: type === 'api' ? Math.floor(Math.random() * 1000) + 100 : undefined
      }
    };
  });
};

// Audit Events Data Generators

export const generateAuditEvents = (): AuditEvent[] => {
  const eventTypes: AuditEventType[] = ['access', 'modification', 'deletion', 'export', 'configuration'];
  const severities: AuditSeverity[] = ['info', 'warning', 'error', 'critical'];
  const resources = ['prompts', 'agents', 'workflows', 'integrations', 'users', 'reports'];
  const actions = {
    'access': ['viewed', 'downloaded', 'accessed'],
    'modification': ['updated', 'edited', 'modified'],
    'deletion': ['deleted', 'removed', 'purged'],
    'export': ['exported', 'downloaded', 'shared'],
    'configuration': ['configured', 'enabled', 'disabled']
  };
  
  return Array.from({ length: 20 }, (_, i) => {
    const eventType = eventTypes[i % eventTypes.length];
    const actionList = actions[eventType];
    const severity = i < 2 ? 'critical' : i < 5 ? 'error' : i < 10 ? 'warning' : 'info';
    const success = severity === 'info' || severity === 'warning';
    
    return {
      id: `audit-${i + 1}`,
      timestamp: new Date(Date.now() - i * 3600000),
      userId: `user-${Math.floor(Math.random() * 10) + 1}`,
      userName: `User ${Math.floor(Math.random() * 10) + 1}`,
      eventType,
      severity: severity as AuditSeverity,
      resource: resources[Math.floor(Math.random() * resources.length)],
      action: actionList[Math.floor(Math.random() * actionList.length)],
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success,
      details: {
        resourceId: `${resources[0]}-${Math.floor(Math.random() * 100)}`,
        changes: eventType === 'modification' ? { before: 'value1', after: 'value2' } : undefined,
        reason: !success ? 'Insufficient permissions' : undefined
      }
    };
  });
};

// User Management Data Generators

export const generateUserManagementData = (): UserManagement[] => {
  const departments = ['Engineering', 'Compliance', 'Operations', 'Security', 'Analytics'];
  const roles: UserRole[] = [UserRole.ADMIN, UserRole.AI_RISK_OFFICER, UserRole.COMPLIANCE_REVIEWER, UserRole.USER];
  const statuses: UserStatus[] = ['active', 'inactive', 'suspended', 'pending'];
  const activities: UserActivity[] = ['online', 'away', 'offline'];
  
  return Array.from({ length: 15 }, (_, i) => {
    const status = i < 10 ? 'active' : i < 12 ? 'inactive' : i < 14 ? 'suspended' : 'pending';
    const activity = status === 'active' ? (i < 3 ? 'online' : i < 6 ? 'away' : 'offline') : 'offline';
    const isActive = status === 'active';
    
    return {
      id: `user-${i + 1}`,
      email: `user${i + 1}@seraphim.ai`,
      displayName: `User ${i + 1}`,
      role: roles[i % roles.length],
      status: status as UserStatus,
      activity: activity as UserActivity,
      lastLogin: isActive ? new Date(Date.now() - Math.random() * 86400000) : new Date(Date.now() - Math.random() * 604800000),
      createdAt: new Date(Date.now() - Math.random() * 31536000000), // Random date within last year
      department: departments[Math.floor(Math.random() * departments.length)],
      permissions: ['read', 'write', 'delete', 'admin'].slice(0, i % 4 + 1),
      sessionsActive: activity === 'online' ? Math.floor(Math.random() * 3) + 1 : 0,
      storageUsed: Math.floor(Math.random() * 500) + 50,
      apiCallsToday: isActive ? Math.floor(Math.random() * 1000) + 100 : 0
    };
  });
};

// Generate LLM analysis result
export const generateLLMAnalysisResult = (prompt: string, modelId: string) => {
  const model = generateLLMModels().find(m => m.id === modelId) || generateLLMModels()[0];
  
  // Simulate different types of responses based on prompt content
  const hasRiskKeywords = /risk|danger|security|compliance|legal/i.test(prompt);
  const hasDataKeywords = /data|information|privacy|confidential/i.test(prompt);
  const hasFinancialKeywords = /financial|money|payment|cost|revenue/i.test(prompt);
  
  const baseScore = hasRiskKeywords ? 0.75 : 0.9;
  const securityScore = hasDataKeywords ? 0.8 : 0.95;
  const integrityScore = 0.85 + Math.random() * 0.15;
  const accuracyScore = 0.9 + Math.random() * 0.1;
  
  const flags = [];
  
  if (hasRiskKeywords) {
    flags.push({
      type: 'risk-detection',
      severity: 'high',
      message: 'Potential risk factors detected in prompt',
      details: 'The prompt contains keywords that may indicate risk-related content requiring careful analysis.',
    });
  }
  
  if (hasDataKeywords) {
    flags.push({
      type: 'data-sensitivity',
      severity: 'medium',
      message: 'Data sensitivity markers found',
      details: 'The prompt references data or information that may require privacy considerations.',
    });
  }
  
  if (hasFinancialKeywords) {
    flags.push({
      type: 'financial-content',
      severity: 'medium',
      message: 'Financial content detected',
      details: 'Financial terminology found - ensure compliance with financial regulations.',
    });
  }
  
  // Add some random flags for variety
  if (Math.random() > 0.7) {
    flags.push({
      type: 'ambiguity',
      severity: 'low',
      message: 'Potential ambiguity in prompt structure',
      details: 'Consider clarifying certain aspects of the prompt for better results.',
    });
  }
  
  return {
    id: `analysis-${Date.now()}`,
    promptId: `prompt-${Date.now()}`,
    llmResponse: {
      id: `response-${Date.now()}`,
      response: `Based on the analysis of your prompt, here are the key findings:\n\n1. Content Classification: ${hasRiskKeywords ? 'Risk-Related' : hasFinancialKeywords ? 'Financial' : 'General'}\n2. Clarity Score: ${(Math.random() * 20 + 80).toFixed(1)}%\n3. Completeness: ${(Math.random() * 15 + 85).toFixed(1)}%\n\nThe prompt appears to be well-structured for ${model.name} processing. ${flags.length > 0 ? 'However, some considerations have been flagged for review.' : 'No significant issues detected.'}\n\nRecommendations:\n- ${hasRiskKeywords ? 'Ensure risk mitigation strategies are in place' : 'Continue with standard processing'}\n- ${hasDataKeywords ? 'Verify data handling compliance' : 'Maintain current data practices'}\n- Consider adding more context for improved accuracy`,
      model: model.name,
      latency: Math.floor(Math.random() * 1000) + 500,
    },
    agentResults: [
      {
        agentId: 'agent-1',
        agentName: 'Security Sentinel',
        score: securityScore,
        passed: securityScore >= 0.8,
        flags: flags.filter(f => f.type === 'data-sensitivity' || f.type === 'risk-detection'),
      },
      {
        agentId: 'agent-2',
        agentName: 'Integrity Auditor',
        score: integrityScore,
        passed: integrityScore >= 0.8,
        flags: flags.filter(f => f.type === 'financial-content' || f.type === 'ambiguity'),
      },
      {
        agentId: 'agent-3',
        agentName: 'Accuracy Engine',
        score: accuracyScore,
        passed: accuracyScore >= 0.8,
        flags: flags.filter(f => f.type === 'ambiguity'),
      },
    ],
    summary: {
      totalFlags: flags.length,
      criticalFlags: flags.filter(f => f.severity === 'critical').length,
      averageScore: (securityScore + integrityScore + accuracyScore) / 3,
    },
  };
};

// Generate certification audit logs
export const generateAuditLogs = (certificationId: string, status: 'certified' | 'failed') => {
  const baseTime = new Date(Date.now() - 60 * 60 * 1000); // Start 1 hour ago
  const logs = [];
  
  // Initial submission
  logs.push({
    id: `log-${certificationId}-1`,
    timestamp: new Date(baseTime.getTime()),
    type: 'system' as const,
    action: 'OUTPUT_SUBMITTED',
    actor: 'system',
    details: 'AI output submitted for certification',
    metadata: { outputId: certificationId },
  });
  
  // Security Sentinel analysis
  logs.push({
    id: `log-${certificationId}-2`,
    timestamp: new Date(baseTime.getTime() + 5 * 60 * 1000),
    type: 'agent' as const,
    action: 'SECURITY_ANALYSIS_STARTED',
    actor: 'security-sentinel',
    details: 'Security Sentinel began analysis of output',
    metadata: { agentVersion: '2.1.0' },
  });
  
  logs.push({
    id: `log-${certificationId}-3`,
    timestamp: new Date(baseTime.getTime() + 8 * 60 * 1000),
    type: 'agent' as const,
    action: 'SECURITY_CHECK_COMPLETED',
    actor: 'security-sentinel',
    details: status === 'certified'
      ? 'Security checks passed - no vulnerabilities detected'
      : 'Security vulnerabilities detected - potential data exposure risk',
    metadata: {
      checksPerformed: ['data-exposure', 'injection-attacks', 'access-control'],
      vulnerabilitiesFound: status === 'failed' ? 2 : 0,
    },
  });
  
  // Integrity Auditor analysis
  logs.push({
    id: `log-${certificationId}-4`,
    timestamp: new Date(baseTime.getTime() + 10 * 60 * 1000),
    type: 'agent' as const,
    action: 'INTEGRITY_ANALYSIS_STARTED',
    actor: 'integrity-auditor',
    details: 'Integrity Auditor began verification process',
    metadata: { auditLevel: 'comprehensive' },
  });
  
  logs.push({
    id: `log-${certificationId}-5`,
    timestamp: new Date(baseTime.getTime() + 15 * 60 * 1000),
    type: 'agent' as const,
    action: 'INTEGRITY_CHECK_COMPLETED',
    actor: 'integrity-auditor',
    details: status === 'certified'
      ? 'Output integrity verified - all sources validated'
      : 'Integrity issues found - unverified sources detected',
    metadata: {
      sourcesChecked: 12,
      sourcesVerified: status === 'certified' ? 12 : 7,
      integrityScore: status === 'certified' ? 0.95 : 0.65,
    },
  });
  
  // Accuracy Engine analysis
  logs.push({
    id: `log-${certificationId}-6`,
    timestamp: new Date(baseTime.getTime() + 18 * 60 * 1000),
    type: 'agent' as const,
    action: 'ACCURACY_ANALYSIS_STARTED',
    actor: 'accuracy-engine',
    details: 'Accuracy Engine began fact-checking process',
    metadata: { factCheckingModel: 'advanced-v3' },
  });
  
  logs.push({
    id: `log-${certificationId}-7`,
    timestamp: new Date(baseTime.getTime() + 25 * 60 * 1000),
    type: 'agent' as const,
    action: 'ACCURACY_CHECK_COMPLETED',
    actor: 'accuracy-engine',
    details: status === 'certified'
      ? 'Accuracy verified - all facts confirmed'
      : 'Accuracy issues detected - factual errors found',
    metadata: {
      factsChecked: 24,
      factsVerified: status === 'certified' ? 24 : 18,
      accuracyScore: status === 'certified' ? 0.98 : 0.75,
      errors: status === 'failed' ? ['Incorrect date reference', 'Misquoted regulation'] : [],
    },
  });
  
  // Compliance checks
  logs.push({
    id: `log-${certificationId}-8`,
    timestamp: new Date(baseTime.getTime() + 30 * 60 * 1000),
    type: 'system' as const,
    action: 'COMPLIANCE_CHECK_STARTED',
    actor: 'compliance-engine',
    details: 'Automated compliance verification initiated',
    metadata: { regulations: ['GDPR', 'CCPA', 'HIPAA', 'SOC2'] },
  });
  
  logs.push({
    id: `log-${certificationId}-9`,
    timestamp: new Date(baseTime.getTime() + 35 * 60 * 1000),
    type: 'system' as const,
    action: 'COMPLIANCE_CHECK_COMPLETED',
    actor: 'compliance-engine',
    details: status === 'certified'
      ? 'All compliance requirements met'
      : 'Compliance violations detected',
    metadata: {
      passed: status === 'certified' ? ['GDPR', 'CCPA', 'HIPAA', 'SOC2'] : ['GDPR', 'SOC2'],
      failed: status === 'failed' ? ['CCPA', 'HIPAA'] : [],
      violations: status === 'failed' ? ['Missing data retention policy', 'Inadequate PHI protection'] : [],
    },
  });
  
  // Human review (for some cases)
  if (Math.random() > 0.5 || status === 'failed') {
    logs.push({
      id: `log-${certificationId}-10`,
      timestamp: new Date(baseTime.getTime() + 40 * 60 * 1000),
      type: 'human' as const,
      action: 'MANUAL_REVIEW_REQUESTED',
      actor: 'system',
      details: 'Manual review requested due to ' + (status === 'failed' ? 'failed checks' : 'random audit'),
      metadata: { assignedTo: 'compliance-officer-001' },
    });
    
    logs.push({
      id: `log-${certificationId}-11`,
      timestamp: new Date(baseTime.getTime() + 50 * 60 * 1000),
      type: 'human' as const,
      action: 'MANUAL_REVIEW_COMPLETED',
      actor: 'compliance-officer-001',
      details: status === 'certified'
        ? 'Manual review completed - certification approved'
        : 'Manual review completed - certification denied',
      metadata: {
        reviewNotes: status === 'certified'
          ? 'All checks verified. Output meets compliance standards.'
          : 'Multiple compliance issues confirmed. Remediation required before certification.',
        remediationRequired: status === 'failed',
      },
    });
  }
  
  // Final certification decision
  logs.push({
    id: `log-${certificationId}-12`,
    timestamp: new Date(baseTime.getTime() + 55 * 60 * 1000),
    type: 'system' as const,
    action: 'CERTIFICATION_DECISION',
    actor: 'certification-engine',
    details: status === 'certified'
      ? 'Output certified - all requirements met'
      : 'Certification denied - requirements not met',
    metadata: {
      finalStatus: status,
      certificateId: status === 'certified' ? `CERT-${Date.now()}` : null,
      expiryDate: status === 'certified' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
    },
  });
  
  return logs;
};

// Generate comprehensive certification records
export const generateCertificationRecords = () => {
  const records = [];
  const outputTypes = ['financial-analysis', 'legal-review', 'risk-assessment', 'compliance-check', 'data-processing'];
  const models = ['gpt-4', 'claude-2', 'gpt-3.5-turbo', 'llama-2-70b'];
  
  // Generate 10 records: 7 passing, 3 failing
  for (let i = 0; i < 10; i++) {
    const isFailed = i >= 7; // Last 3 are failed
    const outputType = outputTypes[i % outputTypes.length];
    const model = models[i % models.length];
    const timestamp = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)); // Each day back
    
    const record = {
      id: `output-${String(i + 1).padStart(3, '0')}`,
      timestamp,
      content: generateOutputContent(outputType, isFailed),
      type: 'markdown' as const,
      metadata: {
        model,
        promptId: `prompt-${outputType}-${String(i + 1).padStart(3, '0')}`,
        userId: `analyst-${String((i % 3) + 1).padStart(3, '0')}`,
        executionTime: Math.random() * 5 + 1,
        tokenCount: {
          input: Math.floor(Math.random() * 1000) + 500,
          output: Math.floor(Math.random() * 500) + 200,
          total: 0, // Will be calculated
        },
      },
      certification: {
        status: isFailed ? 'failed' as const : 'certified' as const,
        timestamp: new Date(timestamp.getTime() + 60 * 60 * 1000), // 1 hour after generation
        certifiedBy: isFailed ? null : `compliance-officer-${String((i % 2) + 1).padStart(3, '0')}`,
        failureReasons: isFailed ? generateFailureReasons(i - 6) : undefined,
        complianceChecks: generateComplianceChecks(isFailed, outputType),
        siaScores: {
          security: isFailed ? 65 + Math.random() * 15 : 85 + Math.random() * 15,
          integrity: isFailed ? 60 + Math.random() * 20 : 90 + Math.random() * 10,
          accuracy: isFailed ? 70 + Math.random() * 10 : 92 + Math.random() * 8,
        },
        signatures: isFailed ? [] : generateSignatures(timestamp),
      },
      auditTrail: generateAuditLogs(String(i + 1).padStart(3, '0'), isFailed ? 'failed' : 'certified'),
    };
    
    // Calculate total tokens
    record.metadata.tokenCount.total = record.metadata.tokenCount.input + record.metadata.tokenCount.output;
    
    records.push(record);
  }
  
  return records;
};

// Helper function to generate output content
const generateOutputContent = (type: string, isFailed: boolean) => {
  const contents: Record<string, string> = {
    'financial-analysis': `## Financial Analysis Report

### Executive Summary
${isFailed ? 'The analysis reveals significant concerns regarding the portfolio performance.' : 'The portfolio demonstrates strong performance across all key metrics.'}

### Key Findings
1. **ROI Analysis**: ${isFailed ? 'Below market average by 3.2%' : 'Exceeding market average by 4.7%'}
2. **Risk Assessment**: ${isFailed ? 'High volatility detected in tech sector holdings' : 'Well-balanced risk profile maintained'}
3. **Compliance Status**: ${isFailed ? 'Several regulatory gaps identified' : 'Full compliance with all regulations'}

### Recommendations
${isFailed ? '- Immediate portfolio rebalancing required\n- Address compliance gaps urgently\n- Reduce high-risk positions' : '- Continue current investment strategy\n- Consider modest expansion in growth sectors\n- Maintain compliance monitoring'}`,
    
    'legal-review': `## Legal Document Review

### Document Analysis
${isFailed ? 'Critical issues found in contract terms requiring immediate attention.' : 'Contract terms are legally sound and properly structured.'}

### Compliance Check
- **Regulatory Compliance**: ${isFailed ? 'Non-compliant' : 'Compliant'}
- **Industry Standards**: ${isFailed ? 'Below standard' : 'Meets all standards'}
- **Risk Factors**: ${isFailed ? 'High' : 'Low'}

### Legal Opinion
${isFailed ? 'This document contains several problematic clauses that could expose the organization to legal liability.' : 'The document is well-drafted and provides adequate legal protection.'}`,
    
    'risk-assessment': `## Risk Assessment Report

### Overall Risk Level: ${isFailed ? 'HIGH' : 'MODERATE'}

### Risk Categories
1. **Operational Risk**: ${isFailed ? 'Severe - Multiple vulnerabilities detected' : 'Low - Well-controlled processes'}
2. **Financial Risk**: ${isFailed ? 'High - Exposure exceeds tolerance' : 'Moderate - Within acceptable limits'}
3. **Compliance Risk**: ${isFailed ? 'Critical - Immediate action required' : 'Low - Strong compliance framework'}

### Mitigation Strategies
${isFailed ? 'Urgent intervention required to address critical risk exposures.' : 'Current mitigation strategies are effective and should be maintained.'}`,
    
    'compliance-check': `## Compliance Verification Report

### Compliance Status: ${isFailed ? 'FAILED' : 'PASSED'}

### Regulatory Framework Analysis
- **GDPR Compliance**: ${isFailed ? '❌ Failed - Data handling violations' : '✅ Passed'}
- **SOC 2 Compliance**: ${isFailed ? '❌ Failed - Security control gaps' : '✅ Passed'}
- **HIPAA Compliance**: ${isFailed ? '⚠️ Partial - Documentation incomplete' : '✅ Passed'}

### Action Items
${isFailed ? '1. Immediate remediation of data handling procedures\n2. Security control implementation\n3. Complete documentation review' : '1. Continue regular compliance monitoring\n2. Schedule next quarterly review'}`,
    
    'data-processing': `## Data Processing Analysis

### Processing Summary
${isFailed ? 'Data integrity issues detected during processing.' : 'All data processed successfully with high integrity.'}

### Quality Metrics
- **Data Accuracy**: ${isFailed ? '76%' : '99.2%'}
- **Completeness**: ${isFailed ? '82%' : '100%'}
- **Consistency**: ${isFailed ? '71%' : '98.5%'}

### Recommendations
${isFailed ? 'Data quality issues must be resolved before proceeding with analysis.' : 'Data quality meets all requirements for advanced analytics.'}`,
  };
  
  return contents[type] || contents['financial-analysis'];
};

// Helper function to generate failure reasons
const generateFailureReasons = (failureIndex: number) => {
  const reasons = [
    [
      'Security score below minimum threshold (65% < 80%)',
      'Potential data exposure vulnerabilities detected',
      'Unauthorized access patterns identified in output',
    ],
    [
      'Integrity verification failed - unverified sources cited',
      'Output contains manipulated or altered data',
      'Chain of custody broken for critical information',
    ],
    [
      'Multiple factual errors detected by Accuracy Engine',
      'Compliance violations in CCPA and HIPAA requirements',
      'Output contains outdated regulatory references',
    ],
  ];
  
  return reasons[failureIndex] || reasons[0];
};

// Helper function to generate compliance checks
const generateComplianceChecks = (isFailed: boolean, outputType: string) => {
  const checks = [];
  
  // Always include these core checks
  checks.push({
    id: `check-reg-${Date.now()}-1`,
    name: 'Regulatory Compliance',
    category: 'Legal',
    status: isFailed ? 'failed' as const : 'passed' as const,
    details: isFailed
      ? 'Output violates current regulatory requirements'
      : 'All regulatory requirements satisfied',
    severity: 'critical' as const,
  });
  
  checks.push({
    id: `check-risk-${Date.now()}-2`,
    name: 'Risk Disclosure',
    category: 'Risk Management',
    status: isFailed && Math.random() > 0.5 ? 'failed' as const : 'passed' as const,
    details: isFailed && Math.random() > 0.5
      ? 'Insufficient risk warnings provided'
      : 'Appropriate risk disclosures included',
    severity: 'high' as const,
  });
  
  checks.push({
    id: `check-data-${Date.now()}-3`,
    name: 'Data Privacy',
    category: 'Security',
    status: isFailed && outputType === 'data-processing' ? 'failed' as const : 'passed' as const,
    details: isFailed && outputType === 'data-processing'
      ? 'PII exposure detected in output'
      : 'No sensitive data exposed',
    severity: 'high' as const,
  });
  
  checks.push({
    id: `check-bias-${Date.now()}-4`,
    name: 'Bias Detection',
    category: 'Fairness',
    status: Math.random() > 0.7 ? 'warning' as const : 'passed' as const,
    details: Math.random() > 0.7
      ? 'Minor bias indicators detected'
      : 'No significant bias detected',
    severity: 'medium' as const,
  });
  
  // Add output-specific checks
  if (outputType === 'financial-analysis') {
    checks.push({
      id: `check-fin-${Date.now()}-5`,
      name: 'Financial Accuracy',
      category: 'Finance',
      status: isFailed ? 'failed' as const : 'passed' as const,
      details: isFailed
        ? 'Financial calculations contain errors'
        : 'All financial calculations verified',
      severity: 'critical' as const,
    });
  }
  
  return checks;
};

// Mission Control Data Generators

// Generate missions data
export const generateMissions = (): Mission[] => {
  const categories: MissionCategory[] = ['data-analysis', 'threat-detection', 'compliance-check', 'system-optimization'];
  const missionNames = {
    'data-analysis': ['Customer Behavior Analysis', 'Market Trend Prediction', 'Performance Metrics Analysis', 'Revenue Forecasting'],
    'threat-detection': ['Network Anomaly Scan', 'Security Vulnerability Assessment', 'Intrusion Detection', 'Malware Analysis'],
    'compliance-check': ['GDPR Compliance Audit', 'SOC2 Verification', 'Data Privacy Review', 'Regulatory Assessment'],
    'system-optimization': ['Resource Allocation', 'Query Optimization', 'Cache Performance Tuning', 'Load Balancing']
  };
  
  return Array.from({ length: 8 }, (_, i) => {
    const category = categories[i % categories.length];
    const names = missionNames[category];
    const progress = Math.floor(Math.random() * 100);
    const status: MissionStatus = progress === 100 ? 'completed' : progress > 0 ? 'active' : 'pending';
    
    return {
      id: `mission-${i + 1}`,
      name: names[Math.floor(Math.random() * names.length)],
      category,
      progress,
      status,
      startTime: new Date(Date.now() - Math.random() * 3600000),
      estimatedCompletion: new Date(Date.now() + Math.random() * 7200000),
      assignedAgents: [`agent-${i % 3 + 1}`, `agent-${(i + 1) % 3 + 1}`]
    };
  });
};

// Generate agent performance data
export const generateAgentPerformance = (): AgentPerformancePoint[] => {
  const points: AgentPerformancePoint[] = [];
  const now = Date.now();
  const agents = ['agent-1', 'agent-2', 'agent-3'];
  
  // Generate 24 hours of data, one point per hour
  for (let i = 23; i >= 0; i--) {
    agents.forEach(agentId => {
      points.push({
        timestamp: new Date(now - i * 3600000),
        productivity: 70 + Math.random() * 25 + (i < 12 ? 5 : 0), // Higher in recent hours
        efficiency: 75 + Math.random() * 20 + (i < 12 ? 3 : 0),
        agentId
      });
    });
  }
  
  return points;
};

// Generate task summary data
export const generateTaskSummary = (): TaskSummary => {
  const completed = Math.floor(Math.random() * 200) + 300;
  const ongoing = Math.floor(Math.random() * 50) + 20;
  const pending = Math.floor(Math.random() * 100) + 50;
  
  return {
    completed,
    ongoing,
    pending,
    failureRate: Math.random() * 5 + 2, // 2-7%
    averageCompletionTime: Math.floor(Math.random() * 30) + 15 // 15-45 minutes
  };
};

// Generate alerts data
export const generateAlerts = (): Alert[] => {
  const alertTemplates: Array<{
    type: AlertType;
    title: string;
    severity: AlertSeverity;
  }> = [
    { type: 'security', title: 'Unauthorized Access Attempt', severity: 'critical' },
    { type: 'performance', title: 'Agent Response Time Degradation', severity: 'high' },
    { type: 'data-sync', title: 'Database Sync Failure', severity: 'medium' },
    { type: 'agent-health', title: 'Agent Node Unreachable', severity: 'high' },
    { type: 'security', title: 'Anomalous Query Pattern Detected', severity: 'medium' },
    { type: 'performance', title: 'Memory Usage Above Threshold', severity: 'low' },
    { type: 'data-sync', title: 'Replication Lag Detected', severity: 'medium' },
    { type: 'agent-health', title: 'Agent Resource Exhaustion', severity: 'critical' }
  ];
  
  return alertTemplates.slice(0, 6).map((template, i) => ({
    id: `alert-${i + 1}`,
    ...template,
    description: `${template.title} detected in ${['Production', 'Staging', 'Development'][i % 3]} environment`,
    timestamp: new Date(Date.now() - Math.random() * 3600000),
    source: `monitor-${i % 3 + 1}`,
    acknowledged: false
  }));
};

// Generate diagnostic data for alerts
export const generateDiagnosticData = (alert: Alert) => {
  const diagnostics: Record<AlertType, any> = {
    'security': {
      sourceIP: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      targetResource: '/api/v1/sensitive-data',
      attemptCount: Math.floor(Math.random() * 10) + 1,
      blockedBy: 'WAF',
      geoLocation: 'Unknown',
      threatLevel: alert.severity
    },
    'performance': {
      currentLatency: `${Math.floor(Math.random() * 500) + 200}ms`,
      baseline: '50ms',
      affectedEndpoints: ['/api/analyze', '/api/process'],
      cpuUsage: `${Math.floor(Math.random() * 30) + 70}%`,
      memoryUsage: `${Math.floor(Math.random() * 20) + 80}%`,
      recommendations: ['Scale up instances', 'Optimize queries']
    },
    'data-sync': {
      primaryNode: 'db-primary-01',
      replicaNode: 'db-replica-03',
      lagTime: `${Math.floor(Math.random() * 300) + 60}s`,
      lastSuccessfulSync: new Date(Date.now() - 3600000).toISOString(),
      failureReason: 'Network timeout',
      retryCount: 3
    },
    'agent-health': {
      agentId: alert.source,
      lastHeartbeat: new Date(Date.now() - 300000).toISOString(),
      status: 'unreachable',
      resourceUsage: {
        cpu: 'N/A',
        memory: 'N/A',
        disk: 'N/A'
      },
      errorLogs: ['Connection timeout', 'Health check failed']
    }
  };
  
  return diagnostics[alert.type];
};

// Helper function to generate signatures
const generateSignatures = (timestamp: Date) => {
  return [
    {
      id: `sig-${Date.now()}-1`,
      type: 'digital' as const,
      signer: `compliance-officer-${String(Math.floor(Math.random() * 3) + 1).padStart(3, '0')}`,
      timestamp: new Date(timestamp.getTime() + 50 * 60 * 1000),
      hash: `0x${Math.random().toString(16).substr(2, 16)}`,
      verified: true,
    },
    {
      id: `sig-${Date.now()}-2`,
      type: 'blockchain' as const,
      signer: 'vanguard-certification-system',
      timestamp: new Date(timestamp.getTime() + 55 * 60 * 1000),
      hash: `0x${Math.random().toString(16).substr(2, 16)}`,
      verified: true,
    },
    {
      id: `sig-${Date.now()}-3`,
      type: 'cryptographic' as const,
      signer: 'audit-trail-system',
      timestamp: new Date(timestamp.getTime() + 58 * 60 * 1000),
      hash: `SHA256:${Math.random().toString(36).substr(2, 32)}`,
      verified: true,
    },
  ];
};