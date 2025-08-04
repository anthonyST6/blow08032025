// Mock Data Service for Backend
// This service generates mock data for the unified data service

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
    revenue: months.slice(0, currentMonth + 1).map((month) => ({
      month,
      leaseRevenue: Math.floor(Math.random() * 2000000) + 3000000,
      royalties: Math.floor(Math.random() * 500000) + 200000,
      fees: Math.floor(Math.random() * 100000) + 50000,
    })),
    expenses: months.slice(0, currentMonth + 1).map((month) => ({
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

// Generate dashboard statistics
export const generateDashboardStats = () => {
  return {
    totalPrompts: 12847,
    totalAnalyses: 8923,
    activeWorkflows: 42,
    flaggedResponses: 156,
    averageScore: 94.3,
    recentActivity: generateRecentActivity(),
  };
};