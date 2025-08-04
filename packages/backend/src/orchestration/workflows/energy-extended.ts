import { UseCaseWorkflow } from '../types/workflow.types';

const energyExtendedWorkflows: UseCaseWorkflow[] = [
  {
    id: 'renewable-integration-workflow',
    useCaseId: 'renewable-energy-integration',
    name: 'Renewable Energy Integration Workflow',
    description: 'Optimize integration of renewable energy sources into the grid',
    industry: 'energy-utilities',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '*/15 * * * *' // Every 15 minutes
      },
      {
        type: 'event',
        event: 'renewable.output.change'
      }
    ],
    steps: [
      {
        id: 'monitor-renewable-sources',
        name: 'Monitor Renewable Energy Sources',
        type: 'detect',
        agent: 'monitoring',
        service: 'renewable-energy-integration',
        action: 'monitorSources',
        parameters: {
          sources: ['solar', 'wind', 'hydro', 'geothermal'],
          metrics: ['output', 'efficiency', 'availability']
        },
        outputs: ['renewableStatus', 'forecastedOutput'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-grid-demand',
        name: 'Analyze Grid Demand Patterns',
        type: 'analyze',
        agent: 'analysis',
        service: 'renewable-energy-integration',
        action: 'analyzeGridDemand',
        parameters: {
          timeHorizon: '24h',
          includeWeather: true,
          historicalData: true
        },
        outputs: ['demandAnalysis', 'peakPeriods'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-energy-mix',
        name: 'Optimize Energy Source Mix',
        type: 'decide',
        agent: 'optimization',
        service: 'renewable-energy-integration',
        action: 'optimizeEnergyMix',
        parameters: {
          objectives: ['maximize_renewable', 'minimize_cost', 'ensure_stability'],
          constraints: ['grid_capacity', 'storage_limits']
        },
        outputs: ['optimalMix', 'dispatchSchedule'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'execute-dispatch',
        name: 'Execute Energy Dispatch',
        type: 'execute',
        agent: 'response',
        service: 'renewable-energy-integration',
        action: 'executeDispatch',
        humanApprovalRequired: false,
        parameters: {
          coordinateStorage: true,
          updateForecasts: true
        },
        outputs: ['dispatchStatus', 'gridBalance'],
        errorHandling: {
          notification: {
            recipients: ['grid-operator@energy.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'verify-integration',
        name: 'Verify Integration Performance',
        type: 'verify',
        agent: 'monitoring',
        service: 'renewable-energy-integration',
        action: 'verifyIntegration',
        parameters: {
          metrics: ['renewable_percentage', 'grid_stability', 'cost_efficiency'],
          alertThresholds: true
        },
        outputs: ['performanceReport', 'recommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['renewable-energy-integration', 'notification', 'grid-management'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['NERC', 'FERC', 'EPA'],
      tags: ['energy', 'renewable', 'integration', 'grid-optimization']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'energy-trading-workflow',
    useCaseId: 'energy-trading-optimization',
    name: 'Energy Trading Optimization Workflow',
    description: 'Optimize energy trading in wholesale markets',
    industry: 'energy-utilities',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 */1 * * *' // Every hour
      },
      {
        type: 'event',
        event: 'market.price.volatility'
      }
    ],
    steps: [
      {
        id: 'analyze-market',
        name: 'Analyze Energy Markets',
        type: 'detect',
        agent: 'monitoring',
        service: 'energy-trading-optimization',
        action: 'analyzeMarkets',
        parameters: {
          markets: ['day_ahead', 'real_time', 'ancillary'],
          dataPoints: ['prices', 'volumes', 'congestion']
        },
        outputs: ['marketAnalysis', 'priceForecasts'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'assess-portfolio',
        name: 'Assess Energy Portfolio',
        type: 'analyze',
        agent: 'analysis',
        service: 'energy-trading-optimization',
        action: 'assessPortfolio',
        parameters: {
          assets: ['generation', 'contracts', 'transmission_rights'],
          riskMetrics: true
        },
        outputs: ['portfolioStatus', 'riskExposure'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-trading',
        name: 'Optimize Trading Strategy',
        type: 'decide',
        agent: 'optimization',
        service: 'energy-trading-optimization',
        action: 'optimizeTrading',
        parameters: {
          strategies: ['arbitrage', 'hedging', 'speculation'],
          riskLimits: true,
          regulatoryConstraints: true
        },
        outputs: ['tradingStrategy', 'expectedReturns'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'execute-trades',
        name: 'Execute Energy Trades',
        type: 'execute',
        agent: 'response',
        service: 'energy-trading-optimization',
        action: 'executeTrades',
        humanApprovalRequired: true,
        parameters: {
          tradingPlatforms: ['iso', 'bilateral', 'exchange'],
          complianceChecks: true
        },
        conditions: [
          {
            field: 'context.expectedReturns.roi',
            operator: '>',
            value: 0.05
          }
        ],
        outputs: ['executedTrades', 'confirmations'],
        errorHandling: {
          notification: {
            recipients: ['trading-desk@energy.com'],
            channels: ['email', 'slack']
          }
        }
      },
      {
        id: 'report-performance',
        name: 'Report Trading Performance',
        type: 'report',
        agent: 'compliance',
        service: 'energy-trading-optimization',
        action: 'reportPerformance',
        parameters: {
          metrics: ['pnl', 'risk_adjusted_returns', 'market_share'],
          regulatoryReporting: true
        },
        outputs: ['performanceReport', 'complianceStatus'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['energy-trading-optimization', 'notification', 'market-data'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response', 'compliance'],
      estimatedDuration: 420000,
      criticality: 'high',
      compliance: ['FERC', 'CFTC', 'NERC'],
      tags: ['energy', 'trading', 'markets', 'optimization']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default energyExtendedWorkflows;