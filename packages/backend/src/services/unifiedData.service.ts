import { generateLandLeaseData } from './mockData.service';

export interface UnifiedUseCaseData {
  summary: {
    activeItems: number;
    successRate: number;
    costSavings: number;
    efficiencyGain: number;
    metrics?: Array<{
      name: string;
      value: number | string;
      unit: string;
      trend: 'up' | 'down';
      change: number;
    }>;
  };
  leases?: any[];
  compliance?: any;
  financial?: any;
  orchestration?: any;
  workflows?: any[];
  analytics?: any;
  operations?: any;
  // Additional data based on use case type
  [key: string]: any;
}

export class UnifiedDataService {
  static generateUnifiedData(useCaseId: string): UnifiedUseCaseData {
    switch (useCaseId) {
      case 'oilfield-land-lease':
        return this.generateOilfieldLandLeaseData();
      case 'grid-anomaly':
        return this.generateGridAnomalyData();
      case 'patient-risk-stratification':
        return this.generatePatientRiskData();
      case 'fraud-detection':
        return this.generateFraudDetectionData();
      default:
        return this.generateDefaultData(useCaseId);
    }
  }

  private static generateOilfieldLandLeaseData(): UnifiedUseCaseData {
    // Get the full land lease dataset
    const landLeases = generateLandLeaseData();
    
    // Calculate summary metrics from the actual data
    const totalLeases = landLeases.length;
    // const activeLeases = landLeases.filter(l => l.status === 'Active').length;
    const totalAcres = landLeases.reduce((sum: number, lease: any) => sum + lease.location.acres, 0);
    const totalRevenue = landLeases.reduce((sum: number, lease: any) => sum + lease.annualPayment, 0);
    const avgCompliance = landLeases.reduce((sum: number, lease: any) => {
      const complianceScore = (
        (lease.compliance.environmental ? 33.33 : 0) +
        (lease.compliance.regulatory ? 33.33 : 0) +
        (lease.compliance.safety ? 33.33 : 0)
      );
      return sum + complianceScore;
    }, 0) / totalLeases;

    // Calculate lease status distribution
    const statusCounts = landLeases.reduce((acc: Record<string, number>, lease: any) => {
      acc[lease.status] = (acc[lease.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Revenue data by month
    const revenueData = [
      { month: 'Jan', lease: 10.2, royalty: 5.8, production: 3.2, total: 19.2 },
      { month: 'Feb', lease: 10.5, royalty: 6.1, production: 3.4, total: 20.0 },
      { month: 'Mar', lease: 11.2, royalty: 6.3, production: 3.6, total: 21.1 },
      { month: 'Apr', lease: 10.8, royalty: 6.5, production: 3.5, total: 20.8 },
      { month: 'May', lease: 11.5, royalty: 6.8, production: 3.8, total: 22.1 },
      { month: 'Jun', lease: 12.1, royalty: 7.2, production: 4.1, total: 23.4 },
    ];

    // Risk data by field
    const riskData = [
      { field: 'Permian Basin', leases: 847, atRisk: 12, revenue: 45.2 },
      { field: 'Eagle Ford', leases: 623, atRisk: 8, revenue: 32.1 },
      { field: 'Bakken', leases: 512, atRisk: 15, revenue: 28.7 },
      { field: 'Marcellus', leases: 865, atRisk: 10, revenue: 21.5 },
    ];

    // Active workflows
    const activeWorkflows = [
      { 
        id: 'wf-001',
        name: 'Lease Renewal Analysis - Permian Basin', 
        progress: 85, 
        priority: 'Critical', 
        status: 'Market analysis in progress',
        estimatedCompletion: '2 days'
      },
      { 
        id: 'wf-002',
        name: 'Royalty Payment Reconciliation', 
        progress: 60, 
        priority: 'High', 
        status: 'Processing 2,847 transactions',
        estimatedCompletion: '5 days'
      },
      { 
        id: 'wf-003',
        name: 'Title Chain Verification - Eagle Ford', 
        progress: 40, 
        priority: 'Medium', 
        status: 'Validating mineral rights',
        estimatedCompletion: '1 week'
      },
      { 
        id: 'wf-004',
        name: 'Sensitivity Analysis - Q2 Renewals', 
        progress: 30, 
        priority: 'High', 
        status: 'Modeling profitability impact',
        estimatedCompletion: '3 days'
      },
      { 
        id: 'wf-005',
        name: 'Compliance Document Generation', 
        progress: 95, 
        priority: 'Low', 
        status: 'Final VANGUARDS review',
        estimatedCompletion: '1 day'
      },
    ];

    // Compliance data
    const complianceData = {
      categories: [
        {
          id: 1,
          category: 'Environmental Compliance',
          score: 96.5,
          lastAudit: new Date('2024-01-15'),
          issues: 2,
          resolved: 18,
          requirements: [
            { name: 'Air Quality Standards', status: 'compliant' },
            { name: 'Water Management', status: 'compliant' },
            { name: 'Waste Disposal', status: 'pending' },
            { name: 'Spill Prevention', status: 'compliant' },
          ],
        },
        {
          id: 2,
          category: 'Regulatory Compliance',
          score: 94.2,
          lastAudit: new Date('2024-01-20'),
          issues: 3,
          resolved: 25,
          requirements: [
            { name: 'BLM Regulations', status: 'compliant' },
            { name: 'State Oil & Gas Rules', status: 'compliant' },
            { name: 'Federal Reporting', status: 'compliant' },
            { name: 'Local Ordinances', status: 'pending' },
          ],
        },
        {
          id: 3,
          category: 'Safety Compliance',
          score: 98.1,
          lastAudit: new Date('2024-01-10'),
          issues: 1,
          resolved: 32,
          requirements: [
            { name: 'OSHA Standards', status: 'compliant' },
            { name: 'Emergency Response', status: 'compliant' },
            { name: 'Equipment Safety', status: 'compliant' },
            { name: 'Personnel Training', status: 'compliant' },
          ],
        },
        {
          id: 4,
          category: 'Financial Compliance',
          score: 92.8,
          lastAudit: new Date('2024-01-25'),
          issues: 4,
          resolved: 20,
          requirements: [
            { name: 'Royalty Payments', status: 'compliant' },
            { name: 'Tax Obligations', status: 'pending' },
            { name: 'Audit Requirements', status: 'compliant' },
            { name: 'Financial Reporting', status: 'compliant' },
          ],
        },
      ],
      overallScore: 95.4,
      trend: 'improving'
    };

    // Financial data
    const financialData = {
      revenue: {
        monthly: revenueData,
        quarterly: [
          { quarter: 'Q1 2023', revenue: 85.2, expenses: 52.4, profit: 32.8 },
          { quarter: 'Q2 2023', revenue: 92.5, expenses: 54.1, profit: 38.4 },
          { quarter: 'Q3 2023', revenue: 98.7, expenses: 55.8, profit: 42.9 },
          { quarter: 'Q4 2023', revenue: 105.3, expenses: 58.2, profit: 47.1 },
          { quarter: 'Q1 2024', revenue: 112.8, expenses: 60.5, profit: 52.3 },
          { quarter: 'Q2 2024', revenue: 118.5, expenses: 62.1, profit: 56.4 },
        ],
        breakdown: {
          leaseRevenue: revenueData.reduce((sum, m) => sum + m.lease, 0),
          royalties: revenueData.reduce((sum, m) => sum + m.royalty, 0),
          productionFees: revenueData.reduce((sum, m) => sum + m.production, 0),
        }
      },
      expenses: {
        operations: 28.5,
        maintenance: 15.2,
        compliance: 8.7,
        total: 52.4
      },
      projections: {
        nextQuarter: 42.8,
        yearEnd: 185.2
      }
    };

    // Analytics data
    const analyticsData = {
      leaseRenewalTimeline: [
        { days: '0-30', count: 3, revenue: 1.2 },
        { days: '31-60', count: 5, revenue: 2.1 },
        { days: '61-90', count: 8, revenue: 3.5 },
        { days: '91-120', count: 12, revenue: 4.8 },
        { days: '121-180', count: 18, revenue: 7.2 },
        { days: '181-365', count: 24, revenue: 9.6 },
        { days: '365+', count: 45, revenue: 18.0 },
      ],
      productionByWellType: [
        { name: 'Horizontal Wells', value: 65, color: '#3B82F6' },
        { name: 'Vertical Wells', value: 20, color: '#10B981' },
        { name: 'Directional Wells', value: 10, color: '#F59E0B' },
        { name: 'Injection Wells', value: 5, color: '#8B5CF6' },
      ],
      revenueAtRisk: [
        { month: 'Jan', atRisk: 0.5, secured: 8.0 },
        { month: 'Feb', atRisk: 1.2, secured: 7.6 },
        { month: 'Mar', atRisk: 2.1, secured: 7.2 },
        { month: 'Apr', atRisk: 0.8, secured: 8.4 },
        { month: 'May', atRisk: 0.3, secured: 9.4 },
        { month: 'Jun', atRisk: 1.5, secured: 8.7 },
      ],
      profitabilityByField: [
        { name: 'Permian Basin', value: 45, profit: 18.5 },
        { name: 'Eagle Ford', value: 28, profit: 12.3 },
        { name: 'Bakken', value: 15, profit: 8.7 },
        { name: 'Marcellus', value: 8, profit: 5.2 },
        { name: 'Other', value: 4, profit: 2.1 },
      ],
    };

    // Critical expirations
    const criticalExpirations = [
      {
        name: 'Permian Basin - Block 42',
        wells: 'PB-42-001 through PB-42-015',
        daysUntilExpiry: 45,
        currentRate: 125,
        marketRate: 145,
        productionImpact: 1.2,
        renewalStatus: 'Negotiating'
      },
      {
        name: 'Eagle Ford - Section 18',
        wells: 'EF-18-101 through EF-18-108',
        daysUntilExpiry: 120,
        currentRate: 95,
        marketRate: 110,
        productionImpact: 0.85,
        renewalStatus: 'Pending Review'
      },
    ];

    // Orchestration data
    const orchestrationData = {
      agents: [
        { id: 'agent-1', name: 'Lease Analyzer', type: 'analyzer', status: 'active', tasksCompleted: 1247 },
        { id: 'agent-2', name: 'Compliance Monitor', type: 'monitor', status: 'active', tasksCompleted: 892 },
        { id: 'agent-3', name: 'Financial Optimizer', type: 'optimizer', status: 'active', tasksCompleted: 654 },
        { id: 'agent-4', name: 'Risk Assessor', type: 'assessor', status: 'active', tasksCompleted: 1103 },
      ],
      connections: [
        { from: 'agent-1', to: 'agent-2', type: 'data-flow' },
        { from: 'agent-2', to: 'agent-3', type: 'compliance-check' },
        { from: 'agent-3', to: 'agent-4', type: 'financial-analysis' },
        { from: 'agent-4', to: 'agent-1', type: 'risk-feedback' },
      ],
      performance: {
        totalTasks: 3896,
        successRate: 98.5,
        avgProcessingTime: '2.3s',
        uptime: '99.98%'
      }
    };

    return {
      summary: {
        activeItems: totalLeases,
        successRate: 85,
        costSavings: 2500000,
        efficiencyGain: 35,
        metrics: [
          { name: 'Total Leases', value: totalLeases, unit: '', trend: 'up', change: 12 },
          { name: 'Total Acres', value: totalAcres, unit: '', trend: 'up', change: 8 },
          { name: 'Annual Revenue', value: (totalRevenue / 1000000).toFixed(1), unit: 'M', trend: 'up', change: 15 },
          { name: 'Compliance Score', value: avgCompliance.toFixed(0), unit: '%', trend: 'down', change: -2 },
        ]
      },
      // Primary data fields
      leases: landLeases,
      landLeases: landLeases, // Duplicate for backward compatibility
      metrics: [
        { name: 'Total Leases', value: totalLeases, unit: '', trend: 'up', change: 12 },
        { name: 'Total Acres', value: totalAcres, unit: '', trend: 'up', change: 8 },
        { name: 'Annual Revenue', value: (totalRevenue / 1000000).toFixed(1), unit: 'M', trend: 'up', change: 15 },
        { name: 'Compliance Score', value: avgCompliance.toFixed(0), unit: '%', trend: 'down', change: -2 },
      ],
      leaseStatuses: [
        { status: 'Active', count: statusCounts['Active'] || 0, color: 'text-green-500' },
        { status: 'Pending', count: statusCounts['Pending'] || 0, color: 'text-yellow-500' },
        { status: 'Under Review', count: statusCounts['Under Review'] || 0, color: 'text-blue-500' },
        { status: 'Expiring Soon', count: statusCounts['Expiring Soon'] || 0, color: 'text-orange-500' },
      ],
      compliance: complianceData,
      financial: {
        ...financialData,
        revenueData, // Add revenueData to financial section
        revenueAtRisk: analyticsData.revenueAtRisk,
        profitabilityByField: analyticsData.profitabilityByField
      },
      analytics: analyticsData,
      workflows: activeWorkflows,
      activeWorkflows: activeWorkflows, // Duplicate for backward compatibility
      orchestration: {
        ...orchestrationData,
        leaseRenewalTimeline: analyticsData.leaseRenewalTimeline,
        productionByWellType: analyticsData.productionByWellType,
        criticalExpirations,
        leaseStatuses: [
          { status: 'Active', count: statusCounts['Active'] || 0, color: 'text-green-500' },
          { status: 'Pending', count: statusCounts['Pending'] || 0, color: 'text-yellow-500' },
          { status: 'Under Review', count: statusCounts['Under Review'] || 0, color: 'text-blue-500' },
          { status: 'Expiring Soon', count: statusCounts['Expiring Soon'] || 0, color: 'text-orange-500' },
        ],
        activeWorkflows,
        riskData
      },
      revenueData,
      riskData,
      criticalExpirations,
      leaseRenewalTimeline: analyticsData.leaseRenewalTimeline,
      productionByWellType: analyticsData.productionByWellType,
      revenueAtRisk: analyticsData.revenueAtRisk,
      profitabilityByField: analyticsData.profitabilityByField,
      operations: {
        systemStatus: {
          dataProcessing: 'Operational',
          modelInference: 'Operational',
          complianceMonitoring: 'Operational',
          apiHealth: 'Healthy',
          lastUpdate: new Date().toISOString()
        },
        performance: {
          avgResponseTime: '245ms',
          throughput: '1,247 req/min',
          errorRate: '0.02%',
          uptime: '99.98%'
        }
      }
    };
  }

  private static generateGridAnomalyData(): UnifiedUseCaseData {
    return {
      summary: {
        activeItems: 342,
        successRate: 89,
        costSavings: 4500000,
        efficiencyGain: 42,
        metrics: [
          { name: 'Anomalies Detected', value: 342, unit: '', trend: 'up', change: 15 },
          { name: 'Outages Prevented', value: 89, unit: '', trend: 'up', change: 22 },
          { name: 'Response Time', value: 2.3, unit: 'min', trend: 'down', change: -45 },
          { name: 'Grid Stability', value: 99.2, unit: '%', trend: 'up', change: 1.8 },
        ]
      },
      // Add grid-specific data here
      orchestration: {
        agents: [
          { id: 'agent-1', name: 'Anomaly Detector', type: 'detector', status: 'active' },
          { id: 'agent-2', name: 'Grid Analyzer', type: 'analyzer', status: 'active' },
          { id: 'agent-3', name: 'Response Coordinator', type: 'coordinator', status: 'active' },
        ],
        connections: [
          { from: 'agent-1', to: 'agent-2', type: 'anomaly-data' },
          { from: 'agent-2', to: 'agent-3', type: 'analysis-results' },
        ],
      },
      workflows: [
        { id: 'wf-001', name: 'Real-time Grid Monitoring', progress: 100, priority: 'Critical', status: 'Active' },
        { id: 'wf-002', name: 'Predictive Maintenance', progress: 75, priority: 'High', status: 'In Progress' },
      ]
    };
  }

  private static generatePatientRiskData(): UnifiedUseCaseData {
    return {
      summary: {
        activeItems: 12450,
        successRate: 92,
        costSavings: 8200000,
        efficiencyGain: 48,
        metrics: [
          { name: 'Patients Monitored', value: 12450, unit: '', trend: 'up', change: 18 },
          { name: 'High Risk Identified', value: 623, unit: '', trend: 'up', change: 12 },
          { name: 'Readmissions Prevented', value: 187, unit: '', trend: 'up', change: 28 },
          { name: 'Cost Savings', value: 4.2, unit: 'M', trend: 'up', change: 35 },
        ]
      },
      // Add healthcare-specific data here
      orchestration: {
        agents: [
          { id: 'agent-1', name: 'Risk Analyzer', type: 'analyzer', status: 'active' },
          { id: 'agent-2', name: 'Care Coordinator', type: 'coordinator', status: 'active' },
          { id: 'agent-3', name: 'Outcome Predictor', type: 'predictor', status: 'active' },
        ],
        connections: [
          { from: 'agent-1', to: 'agent-2', type: 'risk-assessment' },
          { from: 'agent-2', to: 'agent-3', type: 'care-plan' },
        ],
      },
      workflows: [
        { id: 'wf-001', name: 'Patient Risk Stratification', progress: 100, priority: 'Critical', status: 'Active' },
        { id: 'wf-002', name: 'Care Plan Optimization', progress: 85, priority: 'High', status: 'In Progress' },
      ]
    };
  }

  private static generateFraudDetectionData(): UnifiedUseCaseData {
    return {
      summary: {
        activeItems: 2800000000, // 2.8B transactions
        successRate: 98.5,
        costSavings: 45800000,
        efficiencyGain: 65,
        metrics: [
          { name: 'Transactions Monitored', value: 2.8, unit: 'B', trend: 'up', change: 18 },
          { name: 'Fraud Detected', value: 12450, unit: '', trend: 'down', change: -22 },
          { name: 'False Positives', value: 8.2, unit: '%', trend: 'down', change: -35 },
          { name: 'Losses Prevented', value: 45.8, unit: 'M', trend: 'up', change: 28 },
        ]
      },
      // Add finance-specific data here
      orchestration: {
        agents: [
          { id: 'agent-1', name: 'Transaction Monitor', type: 'monitor', status: 'active' },
          { id: 'agent-2', name: 'Pattern Analyzer', type: 'analyzer', status: 'active' },
          { id: 'agent-3', name: 'Risk Scorer', type: 'scorer', status: 'active' },
        ],
        connections: [
          { from: 'agent-1', to: 'agent-2', type: 'transaction-stream' },
          { from: 'agent-2', to: 'agent-3', type: 'pattern-data' },
        ],
      },
      workflows: [
        { id: 'wf-001', name: 'Real-time Fraud Detection', progress: 100, priority: 'Critical', status: 'Active' },
        { id: 'wf-002', name: 'Pattern Learning', progress: 90, priority: 'High', status: 'In Progress' },
      ]
    };
  }

  private static generateDefaultData(_useCaseId: string): UnifiedUseCaseData {
    return {
      summary: {
        activeItems: 1000,
        successRate: 85,
        costSavings: 2500000,
        efficiencyGain: 35,
        metrics: [
          { name: 'Active Items', value: 1000, unit: '', trend: 'up', change: 10 },
          { name: 'Success Rate', value: 85, unit: '%', trend: 'up', change: 5 },
          { name: 'Cost Savings', value: 2.5, unit: 'M', trend: 'up', change: 20 },
          { name: 'Efficiency Gain', value: 35, unit: '%', trend: 'up', change: 15 },
        ]
      },
      orchestration: {
        agents: [
          { id: 'agent-1', name: 'Data Collector', type: 'collector', status: 'active' },
          { id: 'agent-2', name: 'Analyzer', type: 'analyzer', status: 'active' },
          { id: 'agent-3', name: 'Reporter', type: 'reporter', status: 'active' },
        ],
        connections: [
          { from: 'agent-1', to: 'agent-2', type: 'data-flow' },
          { from: 'agent-2', to: 'agent-3', type: 'analysis-flow' },
        ],
      },
      workflows: [
        { id: 'wf-001', name: 'Default Workflow', progress: 75, priority: 'Medium', status: 'In Progress' },
      ]
    };
  }
}