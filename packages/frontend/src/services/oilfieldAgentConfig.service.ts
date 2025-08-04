import { AgentNode } from '../types/usecase.types';

export interface OilfieldAgentConfig {
  agents: AgentNode[];
  workflow: {
    name: string;
    description: string;
    steps: WorkflowStep[];
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  agentId: string;
  action: string;
  inputs: any;
  outputs: any;
  dependencies: string[];
  estimatedDuration: number; // in seconds
}

export class OilfieldAgentConfigService {
  static getOilfieldAgentConfiguration(): OilfieldAgentConfig {
    const agents: AgentNode[] = [
      {
        id: 'data-ingestion-agent',
        name: 'Data Ingestion Agent',
        type: 'data',
        status: 'operational',
        config: {
          purpose: 'Process and validate oilfield lease CSV files',
          capabilities: ['csv-parsing', 'data-validation', 'schema-detection'],
          maxRecords: 10000
        },
        connections: ['data-transformation-agent', 'orchestrator']
      },
      {
        id: 'data-transformation-agent',
        name: 'Data Transformation Agent',
        type: 'data',
        status: 'operational',
        config: {
          purpose: 'Normalize lease data and geocode locations',
          capabilities: ['data-normalization', 'geocoding', 'field-mapping'],
          transformations: ['date-formatting', 'currency-conversion', 'location-enrichment']
        },
        connections: ['analytics-agent', 'compliance-validator', 'orchestrator']
      },
      {
        id: 'analytics-agent',
        name: 'Analytics Agent',
        type: 'analytics',
        status: 'operational',
        config: {
          purpose: 'Analyze lease trends, revenue patterns, and risk factors',
          capabilities: ['trend-analysis', 'revenue-calculation', 'risk-assessment'],
          metrics: ['monthly-revenue', 'expiration-timeline', 'geographic-distribution']
        },
        connections: ['report-generator', 'orchestrator']
      },
      {
        id: 'compliance-validator',
        name: 'Compliance Validator',
        type: 'compliance',
        status: 'operational',
        config: {
          purpose: 'Check regulatory compliance and identify issues',
          capabilities: ['regulation-check', 'compliance-scoring', 'issue-detection'],
          regulations: ['federal-lease-terms', 'state-requirements', 'environmental-standards']
        },
        connections: ['report-generator', 'orchestrator']
      },
      {
        id: 'report-generator',
        name: 'Report Generator',
        type: 'report',
        status: 'operational',
        config: {
          purpose: 'Generate comprehensive insights and recommendations',
          capabilities: ['insight-generation', 'recommendation-engine', 'report-formatting'],
          outputs: ['executive-summary', 'detailed-analysis', 'action-items']
        },
        connections: ['orchestrator']
      },
      {
        id: 'orchestrator',
        name: 'Oilfield Lease Orchestrator',
        type: 'coordinator',
        status: 'operational',
        config: {
          purpose: 'Coordinate all agents and manage workflow execution',
          capabilities: ['workflow-management', 'agent-coordination', 'error-handling']
        },
        connections: ['data-ingestion-agent', 'data-transformation-agent', 'analytics-agent', 'compliance-validator', 'report-generator']
      }
    ];

    const workflowSteps: WorkflowStep[] = [
      {
        id: 'step-1',
        name: 'Data Ingestion',
        agentId: 'data-ingestion-agent',
        action: 'ingest-csv',
        inputs: { fileType: 'csv', validation: true },
        outputs: { parsedData: true, validationReport: true },
        dependencies: [],
        estimatedDuration: 10
      },
      {
        id: 'step-2',
        name: 'Data Transformation',
        agentId: 'data-transformation-agent',
        action: 'transform-lease-data',
        inputs: { parsedData: 'step-1.parsedData' },
        outputs: { normalizedData: true, geolocations: true },
        dependencies: ['step-1'],
        estimatedDuration: 15
      },
      {
        id: 'step-3',
        name: 'Analytics Processing',
        agentId: 'analytics-agent',
        action: 'analyze-leases',
        inputs: { normalizedData: 'step-2.normalizedData' },
        outputs: { metrics: true, trends: true, risks: true },
        dependencies: ['step-2'],
        estimatedDuration: 20
      },
      {
        id: 'step-4',
        name: 'Compliance Check',
        agentId: 'compliance-validator',
        action: 'validate-compliance',
        inputs: { 
          normalizedData: 'step-2.normalizedData',
          analytics: 'step-3.metrics'
        },
        outputs: { complianceReport: true, issues: true },
        dependencies: ['step-2', 'step-3'],
        estimatedDuration: 15
      },
      {
        id: 'step-5',
        name: 'Report Generation',
        agentId: 'report-generator',
        action: 'generate-report',
        inputs: {
          analytics: 'step-3',
          compliance: 'step-4',
          originalData: 'step-1.parsedData'
        },
        outputs: { report: true, recommendations: true, certificate: true },
        dependencies: ['step-3', 'step-4'],
        estimatedDuration: 10
      }
    ];

    return {
      agents,
      workflow: {
        name: 'Oilfield Land Lease Analysis Workflow',
        description: 'Comprehensive analysis of oilfield lease data including validation, analytics, compliance, and reporting',
        steps: workflowSteps
      }
    };
  }

  static getEstimatedTotalDuration(): number {
    const config = this.getOilfieldAgentConfiguration();
    return config.workflow.steps.reduce((total, step) => total + step.estimatedDuration, 0);
  }

  static getAgentsByType(type: string): AgentNode[] {
    const config = this.getOilfieldAgentConfiguration();
    return config.agents.filter(agent => agent.type === type);
  }

  static getWorkflowProgress(completedSteps: string[]): number {
    const config = this.getOilfieldAgentConfiguration();
    const totalSteps = config.workflow.steps.length;
    const completed = completedSteps.length;
    return Math.round((completed / totalSteps) * 100);
  }

  static getNextStep(completedSteps: string[]): WorkflowStep | null {
    const config = this.getOilfieldAgentConfiguration();
    
    for (const step of config.workflow.steps) {
      if (!completedSteps.includes(step.id)) {
        // Check if all dependencies are completed
        const dependenciesMet = step.dependencies.every(dep => 
          completedSteps.includes(dep)
        );
        
        if (dependenciesMet) {
          return step;
        }
      }
    }
    
    return null;
  }

  static getSampleDataUrl(): string {
    return '/sample-data/oilfield_leases_2025.csv';
  }

  static getOilfieldMetrics(data: any[]): {
    totalLeases: number;
    activeLeases: number;
    totalRevenue: number;
    expiringIn30Days: number;
    highRiskLeases: number;
    topLocations: { location: string; count: number }[];
  } {
    if (!data || data.length === 0) {
      return {
        totalLeases: 0,
        activeLeases: 0,
        totalRevenue: 0,
        expiringIn30Days: 0,
        highRiskLeases: 0,
        topLocations: []
      };
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const metrics = {
      totalLeases: data.length,
      activeLeases: data.filter(lease => lease.status === 'Active').length,
      totalRevenue: data.reduce((sum, lease) => sum + (lease.monthlyRevenue || 0), 0),
      expiringIn30Days: data.filter(lease => {
        const expDate = new Date(lease.expirationDate);
        return expDate >= now && expDate <= thirtyDaysFromNow;
      }).length,
      highRiskLeases: data.filter(lease => lease.riskLevel === 'High').length,
      topLocations: [] as { location: string; count: number }[]
    };

    // Calculate top locations
    const locationCounts = data.reduce((acc, lease) => {
      const location = lease.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    metrics.topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return metrics;
  }
}

export default OilfieldAgentConfigService;