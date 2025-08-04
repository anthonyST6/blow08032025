import { UseCaseWorkflow } from '../types/workflow.types';

const telecommunicationsWorkflows: UseCaseWorkflow[] = [
  {
    id: 'network-optimization-workflow',
    useCaseId: 'network-optimization',
    name: 'Network Performance Optimization Workflow',
    description: 'Optimize telecommunications network performance and capacity',
    industry: 'telecommunications',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '*/15 * * * *' // Every 15 minutes
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'network.congestion.level',
          operator: '>',
          value: 0.8
        }
      }
    ],
    steps: [
      {
        id: 'monitor-network',
        name: 'Monitor Network Performance',
        type: 'detect',
        agent: 'monitoring',
        service: 'network-optimization',
        action: 'monitorNetwork',
        parameters: {
          metrics: ['bandwidth', 'latency', 'packet_loss', 'jitter'],
          granularity: 'cell_tower',
          realTime: true
        },
        outputs: ['networkMetrics', 'congestionPoints'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-performance',
        name: 'Analyze Network Performance',
        type: 'analyze',
        agent: 'analysis',
        service: 'network-optimization',
        action: 'analyzePerformance',
        parameters: {
          analysisTypes: ['traffic_patterns', 'capacity_utilization', 'quality_of_service'],
          predictiveAnalysis: true
        },
        outputs: ['performanceAnalysis', 'bottlenecks'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-demand',
        name: 'Predict Network Demand',
        type: 'analyze',
        agent: 'prediction',
        service: 'network-optimization',
        action: 'predictDemand',
        parameters: {
          predictionModels: ['time_series', 'machine_learning'],
          forecastHorizon: '24h'
        },
        outputs: ['demandForecast', 'peakPeriods'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-configuration',
        name: 'Optimize Network Configuration',
        type: 'decide',
        agent: 'optimization',
        service: 'network-optimization',
        action: 'optimizeConfiguration',
        parameters: {
          optimizationGoals: ['maximize_throughput', 'minimize_latency', 'balance_load'],
          constraints: ['power_consumption', 'hardware_limits']
        },
        outputs: ['optimizationPlan', 'configurationChanges'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'apply-optimization',
        name: 'Apply Network Optimization',
        type: 'execute',
        agent: 'response',
        service: 'network-optimization',
        action: 'applyOptimization',
        humanApprovalRequired: false,
        parameters: {
          rolloutStrategy: 'gradual',
          rollbackEnabled: true,
          monitoringEnabled: true
        },
        conditions: [
          {
            field: 'context.performanceAnalysis.impactScore',
            operator: '<',
            value: 0.3
          }
        ],
        outputs: ['implementationStatus', 'performanceImpact'],
        errorHandling: {
          notification: {
            recipients: ['network-ops@telecom.com'],
            channels: ['email', 'slack']
          }
        }
      },
      {
        id: 'verify-improvements',
        name: 'Verify Performance Improvements',
        type: 'verify',
        agent: 'monitoring',
        service: 'network-optimization',
        action: 'verifyImprovements',
        parameters: {
          comparisonBaseline: true,
          kpis: ['throughput_increase', 'latency_reduction', 'customer_satisfaction']
        },
        outputs: ['improvementReport', 'recommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['network-optimization', 'notification', 'network-management'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['FCC', 'ITU'],
      tags: ['telecommunications', 'network', 'optimization', 'performance']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'customer-churn-workflow',
    useCaseId: 'customer-churn-prevention',
    name: 'Customer Churn Prevention Workflow',
    description: 'Predict and prevent customer churn in telecommunications',
    industry: 'telecommunications',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 2 * * *' // Daily at 2 AM
      },
      {
        type: 'event',
        event: 'customer.behavior.anomaly'
      }
    ],
    steps: [
      {
        id: 'collect-customer-data',
        name: 'Collect Customer Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'customer-churn-prevention',
        action: 'collectCustomerData',
        parameters: {
          dataTypes: ['usage_patterns', 'billing', 'support_tickets', 'network_quality'],
          timeframe: '90d'
        },
        outputs: ['customerData', 'behaviorPatterns'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-churn-indicators',
        name: 'Analyze Churn Indicators',
        type: 'analyze',
        agent: 'analysis',
        service: 'customer-churn-prevention',
        action: 'analyzeChurnIndicators',
        parameters: {
          indicators: ['usage_decline', 'complaint_frequency', 'payment_delays', 'competitor_activity'],
          segmentation: true
        },
        outputs: ['churnAnalysis', 'riskSegments'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-churn',
        name: 'Predict Customer Churn',
        type: 'analyze',
        agent: 'prediction',
        service: 'customer-churn-prevention',
        action: 'predictChurn',
        parameters: {
          models: ['logistic_regression', 'random_forest', 'neural_network'],
          predictionWindow: '30d'
        },
        outputs: ['churnPredictions', 'riskScores'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'design-retention',
        name: 'Design Retention Strategy',
        type: 'decide',
        agent: 'optimization',
        service: 'customer-churn-prevention',
        action: 'designRetention',
        parameters: {
          strategies: ['personalized_offers', 'service_improvements', 'loyalty_programs'],
          customerLifetimeValue: true
        },
        outputs: ['retentionPlan', 'offerMatrix'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'execute-retention',
        name: 'Execute Retention Campaign',
        type: 'execute',
        agent: 'response',
        service: 'customer-churn-prevention',
        action: 'executeRetention',
        humanApprovalRequired: true,
        parameters: {
          channels: ['sms', 'email', 'app_notification', 'call_center'],
          personalization: true,
          trackingEnabled: true
        },
        conditions: [
          {
            field: 'context.riskScores.average',
            operator: '>',
            value: 0.6
          }
        ],
        outputs: ['campaignStatus', 'customerResponses'],
        errorHandling: {
          notification: {
            recipients: ['customer-success@telecom.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'measure-effectiveness',
        name: 'Measure Retention Effectiveness',
        type: 'report',
        agent: 'monitoring',
        service: 'customer-churn-prevention',
        action: 'measureEffectiveness',
        parameters: {
          metrics: ['retention_rate', 'revenue_saved', 'customer_satisfaction'],
          comparisonGroups: true
        },
        outputs: ['effectivenessReport', 'insights'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['customer-churn-prevention', 'notification', 'crm'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 480000,
      criticality: 'high',
      compliance: ['TCPA', 'Privacy Regulations'],
      tags: ['telecommunications', 'customer', 'churn', 'retention']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'fraud-detection-telecom-workflow',
    useCaseId: 'telecom-fraud-detection',
    name: 'Telecommunications Fraud Detection Workflow',
    description: 'Detect and prevent telecommunications fraud in real-time',
    industry: 'telecommunications',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'transaction.initiated'
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'fraud.risk.score',
          operator: '>',
          value: 0.7
        }
      }
    ],
    steps: [
      {
        id: 'monitor-transactions',
        name: 'Monitor Telecom Transactions',
        type: 'detect',
        agent: 'monitoring',
        service: 'telecom-fraud-detection',
        action: 'monitorTransactions',
        parameters: {
          transactionTypes: ['calls', 'sms', 'data', 'roaming'],
          realTimeProcessing: true
        },
        outputs: ['transactionData', 'anomalies'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-patterns',
        name: 'Analyze Fraud Patterns',
        type: 'analyze',
        agent: 'security',
        service: 'telecom-fraud-detection',
        action: 'analyzePatterns',
        parameters: {
          patternTypes: ['subscription_fraud', 'cloning', 'premium_rate', 'roaming_fraud'],
          behavioralAnalysis: true
        },
        outputs: ['fraudPatterns', 'suspiciousActivities'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'calculate-risk',
        name: 'Calculate Fraud Risk Score',
        type: 'analyze',
        agent: 'analysis',
        service: 'telecom-fraud-detection',
        action: 'calculateRisk',
        parameters: {
          riskFactors: ['velocity', 'location', 'device', 'historical_behavior'],
          machineLearning: true
        },
        outputs: ['riskScore', 'fraudProbability'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'determine-action',
        name: 'Determine Fraud Response',
        type: 'decide',
        agent: 'security',
        service: 'telecom-fraud-detection',
        action: 'determineAction',
        parameters: {
          actions: ['block', 'flag', 'monitor', 'verify'],
          riskThresholds: {
            block: 0.9,
            flag: 0.7,
            monitor: 0.5
          }
        },
        outputs: ['responseAction', 'justification'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'execute-response',
        name: 'Execute Fraud Response',
        type: 'execute',
        agent: 'response',
        service: 'telecom-fraud-detection',
        action: 'executeResponse',
        humanApprovalRequired: false,
        parameters: {
          immediateAction: true,
          notifyCustomer: true,
          updateSystems: ['billing', 'network', 'crm']
        },
        conditions: [
          {
            field: 'context.riskScore',
            operator: '>',
            value: 0.5
          }
        ],
        outputs: ['actionTaken', 'systemsUpdated'],
        errorHandling: {
          notification: {
            recipients: ['fraud-team@telecom.com'],
            channels: ['email', 'slack']
          }
        }
      },
      {
        id: 'document-incident',
        name: 'Document Fraud Incident',
        type: 'report',
        agent: 'compliance',
        service: 'telecom-fraud-detection',
        action: 'documentIncident',
        parameters: {
          reportTypes: ['incident', 'regulatory', 'internal'],
          evidenceCollection: true
        },
        outputs: ['incidentReport', 'complianceStatus'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['telecom-fraud-detection', 'notification', 'billing'],
      requiredAgents: ['monitoring', 'security', 'analysis', 'response', 'compliance'],
      estimatedDuration: 180000,
      criticality: 'critical',
      compliance: ['PCI-DSS', 'CFAA'],
      tags: ['telecommunications', 'fraud', 'security', 'real-time']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default telecommunicationsWorkflows;