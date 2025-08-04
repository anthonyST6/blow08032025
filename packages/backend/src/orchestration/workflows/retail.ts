import { UseCaseWorkflow } from '../types/workflow.types';

const retailWorkflows: UseCaseWorkflow[] = [
  {
    id: 'inventory-optimization-workflow',
    useCaseId: 'inventory-optimization',
    name: 'Inventory Optimization Workflow',
    description: 'Optimize inventory levels across retail locations',
    industry: 'retail',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 */6 * * *' // Every 6 hours
      },
      {
        type: 'event',
        event: 'inventory.reorder.point'
      }
    ],
    steps: [
      {
        id: 'analyze-sales-data',
        name: 'Analyze Sales Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'inventory-optimization',
        action: 'analyzeSalesData',
        parameters: {
          period: '30d',
          granularity: 'daily',
          includePromotions: true
        },
        outputs: ['salesAnalysis', 'trends'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'forecast-demand',
        name: 'Forecast Demand',
        type: 'analyze',
        agent: 'prediction',
        service: 'inventory-optimization',
        action: 'forecastDemand',
        parameters: {
          models: ['arima', 'prophet', 'lstm'],
          horizon: '14d'
        },
        outputs: ['demandForecast', 'confidence'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-stock-levels',
        name: 'Optimize Stock Levels',
        type: 'decide',
        agent: 'optimization',
        service: 'inventory-optimization',
        action: 'optimizeStockLevels',
        parameters: {
          safetyStock: 'dynamic',
          serviceLevel: 0.95
        },
        outputs: ['optimalLevels', 'reorderPoints'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'generate-orders',
        name: 'Generate Replenishment Orders',
        type: 'execute',
        agent: 'response',
        service: 'inventory-optimization',
        action: 'generateOrders',
        humanApprovalRequired: true,
        parameters: {
          consolidateOrders: true,
          priorityRules: ['stockout_risk', 'margin', 'velocity']
        },
        outputs: ['orders', 'totalCost'],
        errorHandling: {
          notification: {
            recipients: ['inventory-manager@company.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'update-inventory-metrics',
        name: 'Update Inventory Metrics',
        type: 'report',
        agent: 'monitoring',
        service: 'inventory-optimization',
        action: 'updateMetrics',
        parameters: {
          metrics: ['turnover', 'stockout_rate', 'carrying_cost'],
          dashboard: 'retail-operations'
        },
        outputs: ['metricsUpdated', 'kpis'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['inventory-optimization', 'notification', 'analytics'],
      requiredAgents: ['monitoring', 'prediction', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['PCI-DSS'],
      tags: ['inventory', 'retail', 'optimization', 'forecasting']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'customer-experience-workflow',
    useCaseId: 'customer-experience',
    name: 'Customer Experience Enhancement Workflow',
    description: 'Monitor and enhance customer experience across channels',
    industry: 'retail',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'customer.feedback.received'
      },
      {
        type: 'scheduled',
        schedule: '0 9 * * *' // Daily at 9 AM
      }
    ],
    steps: [
      {
        id: 'collect-feedback',
        name: 'Collect Customer Feedback',
        type: 'detect',
        agent: 'monitoring',
        service: 'customer-experience',
        action: 'collectFeedback',
        parameters: {
          sources: ['reviews', 'surveys', 'social_media', 'support_tickets'],
          period: '24h'
        },
        outputs: ['feedback', 'sentimentScores'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-sentiment',
        name: 'Analyze Customer Sentiment',
        type: 'analyze',
        agent: 'analysis',
        service: 'customer-experience',
        action: 'analyzeSentiment',
        parameters: {
          nlpModels: ['bert', 'sentiment_analysis'],
          categories: ['product', 'service', 'pricing', 'delivery']
        },
        outputs: ['sentimentAnalysis', 'issues'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'identify-improvements',
        name: 'Identify Improvement Areas',
        type: 'decide',
        agent: 'optimization',
        service: 'customer-experience',
        action: 'identifyImprovements',
        parameters: {
          prioritization: 'impact_effort_matrix',
          threshold: 0.7
        },
        outputs: ['improvements', 'priorities'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-actions',
        name: 'Implement Experience Actions',
        type: 'execute',
        agent: 'response',
        service: 'customer-experience',
        action: 'implementActions',
        parameters: {
          actionTypes: ['automated_response', 'process_change', 'training'],
          trackingEnabled: true
        },
        conditions: [
          {
            field: 'context.improvements.count',
            operator: '>',
            value: 0
          }
        ],
        outputs: ['actionsImplemented', 'trackingIds'],
        errorHandling: {
          notification: {
            recipients: ['cx-team@company.com'],
            channels: ['email']
          }
        }
      },
      {
        id: 'generate-cx-report',
        name: 'Generate CX Report',
        type: 'report',
        agent: 'compliance',
        service: 'customer-experience',
        action: 'generateReport',
        parameters: {
          reportType: 'customer_experience',
          includeRecommendations: true
        },
        outputs: ['reportId', 'insights'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['customer-experience', 'notification', 'analytics'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response', 'compliance'],
      estimatedDuration: 240000,
      criticality: 'medium',
      compliance: ['GDPR', 'CCPA'],
      tags: ['customer', 'experience', 'sentiment', 'retail']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'dynamic-pricing-workflow',
    useCaseId: 'dynamic-pricing',
    name: 'Dynamic Pricing Optimization Workflow',
    description: 'Optimize pricing based on demand, competition, and inventory',
    industry: 'retail',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 */2 * * *' // Every 2 hours
      },
      {
        type: 'event',
        event: 'competitor.price.change'
      }
    ],
    steps: [
      {
        id: 'collect-market-data',
        name: 'Collect Market Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'dynamic-pricing',
        action: 'collectMarketData',
        parameters: {
          sources: ['competitors', 'marketplaces', 'internal'],
          products: 'all'
        },
        outputs: ['marketData', 'competitorPrices'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-elasticity',
        name: 'Analyze Price Elasticity',
        type: 'analyze',
        agent: 'analysis',
        service: 'dynamic-pricing',
        action: 'analyzeElasticity',
        parameters: {
          historicalPeriod: '90d',
          segmentation: ['category', 'brand', 'customer_segment']
        },
        outputs: ['elasticityAnalysis', 'demandCurves'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-prices',
        name: 'Optimize Prices',
        type: 'decide',
        agent: 'optimization',
        service: 'dynamic-pricing',
        action: 'optimizePrices',
        parameters: {
          objectives: ['revenue', 'margin', 'market_share'],
          constraints: ['min_margin', 'max_discount', 'price_consistency']
        },
        outputs: ['optimizedPrices', 'expectedImpact'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'update-prices',
        name: 'Update Product Prices',
        type: 'execute',
        agent: 'response',
        service: 'dynamic-pricing',
        action: 'updatePrices',
        humanApprovalRequired: true,
        parameters: {
          channels: ['online', 'stores', 'mobile'],
          rolloutStrategy: 'phased'
        },
        conditions: [
          {
            field: 'context.expectedImpact.revenue',
            operator: '>',
            value: 0
          }
        ],
        outputs: ['pricesUpdated', 'affectedProducts'],
        errorHandling: {
          notification: {
            recipients: ['pricing-team@company.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'monitor-performance',
        name: 'Monitor Pricing Performance',
        type: 'verify',
        agent: 'monitoring',
        service: 'dynamic-pricing',
        action: 'monitorPerformance',
        parameters: {
          metrics: ['revenue', 'conversion', 'margin'],
          alertThresholds: {
            revenueDropPercent: 5,
            conversionDropPercent: 10
          }
        },
        outputs: ['performanceMetrics', 'alerts'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['dynamic-pricing', 'notification', 'analytics'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 180000,
      criticality: 'high',
      compliance: ['FTC'],
      tags: ['pricing', 'optimization', 'retail', 'revenue']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default retailWorkflows;