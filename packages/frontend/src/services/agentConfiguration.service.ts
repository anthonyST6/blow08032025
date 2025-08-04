import { AgentNode } from '../types/usecase.types';

interface AgentConfiguration {
  useCaseId: string;
  agents: AgentNode[];
  connections: Array<{
    from: string;
    to: string;
    type: 'data' | 'control';
  }>;
}

class AgentConfigurationService {
  private configurations: Map<string, AgentConfiguration> = new Map();

  constructor() {
    this.initializeConfigurations();
  }

  private initializeConfigurations() {
    // Oilfield Land Lease Configuration
    this.configurations.set('oilfield-land-lease', {
      useCaseId: 'oilfield-land-lease',
      agents: [
        {
          id: 'orchestrator',
          name: 'Oilfield Lease Orchestrator',
          type: 'coordinator',
          role: 'Coordinator',
          description: 'Coordinates the entire lease analysis workflow',
          capabilities: ['workflow-management', 'task-distribution', 'monitoring'],
          config: {
            maxConcurrentTasks: 5,
            retryAttempts: 3,
            timeoutMinutes: 30,
          },
        },
        {
          id: 'data-ingestion',
          name: 'Data Ingestion Agent',
          type: 'data',
          role: 'Data Processing',
          description: 'Ingests and validates lease data from various sources',
          capabilities: ['csv-parsing', 'data-validation', 'schema-mapping'],
          config: {
            supportedFormats: ['csv', 'json', 'xml'],
            maxFileSize: '100MB',
            validationRules: ['required-fields', 'data-types', 'range-checks'],
          },
        },
        {
          id: 'data-transformation',
          name: 'Data Transformation Agent',
          type: 'data',
          role: 'Data Processing',
          description: 'Transforms and normalizes lease data',
          capabilities: ['data-normalization', 'geocoding', 'unit-conversion'],
          config: {
            transformations: ['date-formatting', 'currency-conversion', 'coordinate-mapping'],
            outputFormat: 'standardized-json',
          },
        },
        {
          id: 'analytics',
          name: 'Analytics Agent',
          type: 'analytics',
          role: 'Analysis',
          description: 'Performs statistical analysis and trend detection',
          capabilities: ['trend-analysis', 'risk-scoring', 'revenue-forecasting'],
          config: {
            algorithms: ['regression', 'time-series', 'clustering'],
            confidenceThreshold: 0.95,
          },
        },
        {
          id: 'compliance',
          name: 'Compliance Validator',
          type: 'compliance',
          role: 'Compliance',
          description: 'Checks lease agreements for regulatory compliance',
          capabilities: ['regulation-checking', 'document-validation', 'compliance-scoring'],
          config: {
            regulations: ['EPA', 'BLM', 'Texas-Railroad-Commission'],
            complianceLevel: 'strict',
          },
        },
        {
          id: 'report-generator',
          name: 'Report Generator',
          type: 'report',
          role: 'Documentation',
          description: 'Generates compliance reports and renewal recommendations',
          capabilities: ['pdf-generation', 'excel-export', 'dashboard-creation'],
          config: {
            reportFormats: ['pdf', 'xlsx', 'html'],
            includeVisualizations: true,
          },
        },
      ],
      connections: [
        { from: 'data-ingestion', to: 'orchestrator', type: 'data' },
        { from: 'data-transformation', to: 'orchestrator', type: 'data' },
        { from: 'orchestrator', to: 'analytics', type: 'control' },
        { from: 'orchestrator', to: 'compliance', type: 'control' },
        { from: 'analytics', to: 'report-generator', type: 'data' },
        { from: 'compliance', to: 'report-generator', type: 'data' },
      ],
    });

    // Energy Load Forecasting Configuration
    this.configurations.set('energy-load-forecasting', {
      useCaseId: 'energy-load-forecasting',
      agents: [
        {
          id: 'energy-orchestrator',
          name: 'Energy Forecast Orchestrator',
          type: 'coordinator',
          role: 'Coordinator',
          description: 'Manages energy load forecasting workflow',
          capabilities: ['workflow-management', 'real-time-processing'],
          config: {
            forecastHorizon: '7-days',
            updateFrequency: 'hourly',
          },
        },
        {
          id: 'weather-data',
          name: 'Weather Data Agent',
          type: 'data',
          role: 'Data Collection',
          description: 'Collects and processes weather data',
          capabilities: ['api-integration', 'weather-parsing'],
          config: {
            dataSources: ['NOAA', 'Weather.com'],
            parameters: ['temperature', 'humidity', 'wind-speed'],
          },
        },
        {
          id: 'historical-load',
          name: 'Historical Load Agent',
          type: 'data',
          role: 'Data Processing',
          description: 'Processes historical energy consumption data',
          capabilities: ['time-series-processing', 'pattern-recognition'],
          config: {
            lookbackPeriod: '2-years',
            granularity: '15-minutes',
          },
        },
        {
          id: 'ml-forecaster',
          name: 'ML Forecasting Agent',
          type: 'analytics',
          role: 'Prediction',
          description: 'Applies machine learning models for load forecasting',
          capabilities: ['lstm-networks', 'ensemble-methods'],
          config: {
            models: ['LSTM', 'XGBoost', 'Prophet'],
            ensembleMethod: 'weighted-average',
          },
        },
        {
          id: 'grid-optimizer',
          name: 'Grid Optimization Agent',
          type: 'analytics',
          role: 'Optimization',
          description: 'Optimizes grid operations based on forecasts',
          capabilities: ['load-balancing', 'peak-shaving'],
          config: {
            optimizationGoals: ['cost-reduction', 'reliability'],
          },
        },
        {
          id: 'forecast-reporter',
          name: 'Forecast Report Generator',
          type: 'report',
          role: 'Reporting',
          description: 'Generates forecast reports and alerts',
          capabilities: ['visualization', 'alert-generation'],
          config: {
            alertThresholds: { peak: 0.9, anomaly: 2.5 },
          },
        },
      ],
      connections: [
        { from: 'weather-data', to: 'energy-orchestrator', type: 'data' },
        { from: 'historical-load', to: 'energy-orchestrator', type: 'data' },
        { from: 'energy-orchestrator', to: 'ml-forecaster', type: 'control' },
        { from: 'ml-forecaster', to: 'grid-optimizer', type: 'data' },
        { from: 'grid-optimizer', to: 'forecast-reporter', type: 'data' },
      ],
    });
  }

  /**
   * Get agent configuration for a specific use case
   */
  getConfiguration(useCaseId: string): AgentConfiguration | undefined {
    return this.configurations.get(useCaseId);
  }

  /**
   * Get all available configurations
   */
  getAllConfigurations(): AgentConfiguration[] {
    return Array.from(this.configurations.values());
  }

  /**
   * Check if a use case has auto-configuration available
   */
  hasConfiguration(useCaseId: string): boolean {
    return this.configurations.has(useCaseId);
  }

  /**
   * Get agent graph for workflow execution
   */
  getAgentGraph(useCaseId: string): { agents: AgentNode[]; connections: any[] } | null {
    const config = this.configurations.get(useCaseId);
    if (!config) return null;

    return {
      agents: config.agents,
      connections: config.connections,
    };
  }

  /**
   * Get workflow steps based on agent configuration
   */
  getWorkflowSteps(useCaseId: string): Array<{
    id: string;
    name: string;
    description: string;
    agentId: string;
    dependencies: string[];
  }> {
    const config = this.configurations.get(useCaseId);
    if (!config) return [];

    const steps: Array<{
      id: string;
      name: string;
      description: string;
      agentId: string;
      dependencies: string[];
    }> = [];

    // Create workflow steps based on agent connections
    config.agents.forEach((agent) => {
      const dependencies = config.connections
        .filter(conn => conn.to === agent.id)
        .map(conn => conn.from);

      steps.push({
        id: `step-${agent.id}`,
        name: `Execute ${agent.name}`,
        description: agent.description || `Execute ${agent.name} agent`,
        agentId: agent.id,
        dependencies: dependencies.map(dep => `step-${dep}`),
      });
    });

    return steps;
  }

  /**
   * Validate agent configuration
   */
  validateConfiguration(config: AgentConfiguration): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for orchestrator
    const hasOrchestrator = config.agents.some(agent => agent.type === 'coordinator');
    if (!hasOrchestrator) {
      errors.push('Configuration must include at least one coordinator agent');
    }

    // Check for orphaned agents
    config.agents.forEach(agent => {
      if (agent.type !== 'coordinator') {
        const hasConnection = config.connections.some(
          conn => conn.from === agent.id || conn.to === agent.id
        );
        if (!hasConnection) {
          errors.push(`Agent "${agent.name}" has no connections`);
        }
      }
    });

    // Check for circular dependencies
    // (Simplified check - in production, use proper graph cycle detection)
    const visited = new Set<string>();
    const checkCycles = (agentId: string, path: Set<string>): boolean => {
      if (path.has(agentId)) return true;
      if (visited.has(agentId)) return false;

      visited.add(agentId);
      path.add(agentId);

      const connections = config.connections.filter(conn => conn.from === agentId);
      for (const conn of connections) {
        if (checkCycles(conn.to, new Set(path))) {
          errors.push(`Circular dependency detected involving agent "${agentId}"`);
          return true;
        }
      }

      return false;
    };

    config.agents.forEach(agent => {
      checkCycles(agent.id, new Set());
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const agentConfigurationService = new AgentConfigurationService();