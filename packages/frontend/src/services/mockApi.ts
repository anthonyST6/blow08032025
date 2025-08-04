// Mock API service for demo purposes
export const mockApi = {
  // Mock use case data
  useCases: {
    'oilfield-land-lease': {
      id: 'oilfield-land-lease',
      name: 'Oilfield Land & Lease Analysis',
      description: 'AI-powered analysis of land parcels and lease agreements for optimal drilling locations',
      category: 'energy',
      status: 'active',
      agents: [
        {
          id: 'geological-analyzer',
          name: 'Geological Data Analyzer',
          type: 'analyzer',
          status: 'ready',
          capabilities: ['seismic analysis', 'geological mapping', 'resource estimation']
        },
        {
          id: 'lease-evaluator',
          name: 'Lease Agreement Evaluator',
          type: 'evaluator',
          status: 'ready',
          capabilities: ['contract analysis', 'risk assessment', 'compliance checking']
        },
        {
          id: 'optimization-engine',
          name: 'Site Optimization Engine',
          type: 'optimizer',
          status: 'ready',
          capabilities: ['location optimization', 'cost analysis', 'ROI projection']
        }
      ],
      workflows: [
        {
          id: 'data-ingestion',
          name: 'Data Ingestion',
          status: 'completed',
          progress: 100
        },
        {
          id: 'geological-analysis',
          name: 'Geological Analysis',
          status: 'in_progress',
          progress: 75
        },
        {
          id: 'lease-evaluation',
          name: 'Lease Evaluation',
          status: 'in_progress',
          progress: 60
        },
        {
          id: 'optimization',
          name: 'Site Optimization',
          status: 'pending',
          progress: 0
        }
      ],
      metrics: {
        parcelsAnalyzed: 1247,
        leasesEvaluated: 892,
        optimalSitesIdentified: 23,
        estimatedROI: '287%',
        riskScore: 'Low',
        complianceRate: '98.5%'
      }
    }
  },

  // Mock lease data
  leaseData: [
    {
      id: 'LEASE-001',
      parcelId: 'TX-2024-001',
      location: 'Permian Basin, TX',
      size: '640 acres',
      status: 'Active',
      leaseHolder: 'Energy Corp LLC',
      expirationDate: '2026-12-31',
      royaltyRate: '18.75%',
      geologicalScore: 92,
      productionPotential: 'High',
      estimatedReserves: '2.5M barrels',
      riskFactors: ['Water table proximity', 'Adjacent drilling activity'],
      complianceStatus: 'Compliant',
      lastInspection: '2024-06-15'
    },
    {
      id: 'LEASE-002',
      parcelId: 'TX-2024-002',
      location: 'Eagle Ford, TX',
      size: '480 acres',
      status: 'Under Review',
      leaseHolder: 'Shale Dynamics Inc',
      expirationDate: '2025-06-30',
      royaltyRate: '20%',
      geologicalScore: 87,
      productionPotential: 'Medium-High',
      estimatedReserves: '1.8M barrels',
      riskFactors: ['Seismic activity zone'],
      complianceStatus: 'Pending Review',
      lastInspection: '2024-05-20'
    },
    {
      id: 'LEASE-003',
      parcelId: 'TX-2024-003',
      location: 'Barnett Shale, TX',
      size: '320 acres',
      status: 'Active',
      leaseHolder: 'Pioneer Resources',
      expirationDate: '2027-03-15',
      royaltyRate: '16.5%',
      geologicalScore: 95,
      productionPotential: 'Very High',
      estimatedReserves: '3.2M barrels',
      riskFactors: ['None identified'],
      complianceStatus: 'Compliant',
      lastInspection: '2024-07-01'
    }
  ],

  // Mock workflow execution results
  workflowResults: {
    dataIngestion: {
      status: 'completed',
      timestamp: new Date().toISOString(),
      results: {
        filesProcessed: 47,
        dataPointsExtracted: 128943,
        errors: 0,
        warnings: 3
      }
    },
    geologicalAnalysis: {
      status: 'in_progress',
      timestamp: new Date().toISOString(),
      results: {
        parcelsAnalyzed: 892,
        highPotentialSites: 23,
        mediumPotentialSites: 145,
        lowPotentialSites: 724
      }
    },
    leaseEvaluation: {
      status: 'in_progress',
      timestamp: new Date().toISOString(),
      results: {
        leasesReviewed: 534,
        compliantLeases: 521,
        riskyLeases: 13,
        expiringLeases: 28
      }
    }
  },

  // API methods
  async getUseCase(id: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return (this.useCases as any)[id] || null;
  },

  async getLeaseData() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.leaseData;
  },

  async runWorkflow(useCaseId: string, workflowId: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      message: `Workflow ${workflowId} started successfully`,
      results: (this.workflowResults as any)[workflowId] || {}
    };
  },

  async deployAgents(useCaseId: string) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      message: 'Agents deployed successfully',
      deployedAgents: (this.useCases as any)[useCaseId]?.agents || []
    };
  },

  async loadSampleData(useCaseId: string) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      success: true,
      message: 'Sample data loaded successfully',
      data: {
        leases: this.leaseData,
        metrics: (this.useCases as any)[useCaseId]?.metrics || {}
      }
    };
  }
};