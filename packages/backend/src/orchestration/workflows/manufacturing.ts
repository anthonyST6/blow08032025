import { UseCaseWorkflow } from '../types/workflow.types';

const manufacturingWorkflows: UseCaseWorkflow[] = [
  {
    id: 'predictive-maintenance-workflow',
    useCaseId: 'predictive-maintenance',
    name: 'Predictive Maintenance Workflow',
    description: 'Monitor equipment health and predict maintenance needs',
    industry: 'manufacturing',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 */4 * * *' // Every 4 hours
      },
      {
        type: 'event',
        event: 'equipment.anomaly.detected'
      }
    ],
    steps: [
      {
        id: 'collect-sensor-data',
        name: 'Collect Sensor Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'predictive-maintenance',
        action: 'collectSensorData',
        parameters: {
          dataPoints: ['temperature', 'vibration', 'pressure', 'runtime'],
          aggregationPeriod: '1h'
        },
        timeout: 30000,
        outputs: ['sensorData'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000,
            backoffMultiplier: 2
          }
        }
      },
      {
        id: 'analyze-patterns',
        name: 'Analyze Equipment Patterns',
        type: 'analyze',
        agent: 'analysis',
        service: 'predictive-maintenance',
        action: 'analyzePatterns',
        parameters: {
          algorithms: ['anomaly_detection', 'trend_analysis', 'failure_prediction'],
          threshold: 0.85
        },
        conditions: [
          {
            field: 'context.sensorData.quality',
            operator: '>',
            value: 0.8
          }
        ],
        outputs: ['patterns', 'anomalies'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-failures',
        name: 'Predict Potential Failures',
        type: 'decide',
        agent: 'prediction',
        service: 'predictive-maintenance',
        action: 'predictFailures',
        parameters: {
          predictionWindow: '30d',
          confidenceThreshold: 0.75
        },
        outputs: ['predictions', 'failureProbability'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'schedule-maintenance',
        name: 'Schedule Maintenance',
        type: 'execute',
        agent: 'optimization',
        service: 'predictive-maintenance',
        action: 'scheduleMaintenance',
        humanApprovalRequired: true,
        parameters: {
          optimizationCriteria: ['downtime', 'cost', 'resource_availability']
        },
        conditions: [
          {
            field: 'context.predictions.failureProbability',
            operator: '>',
            value: 0.7
          }
        ],
        outputs: ['maintenanceSchedule'],
        errorHandling: {
          notification: {
            recipients: ['maintenance-team@company.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'update-maintenance-log',
        name: 'Update Maintenance Log',
        type: 'report',
        agent: 'monitoring',
        service: 'predictive-maintenance',
        action: 'updateMaintenanceLog',
        parameters: {
          includeRecommendations: true,
          notifyTechnicians: true
        },
        outputs: ['reportId', 'recommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['predictive-maintenance', 'notification', 'scheduling'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['ISO 9001', 'ISO 55000'],
      tags: ['maintenance', 'predictive', 'equipment', 'manufacturing']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'quality-control-workflow',
    useCaseId: 'quality-control',
    name: 'Quality Control Workflow',
    description: 'Automated quality inspection and defect detection',
    industry: 'manufacturing',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'production.batch.completed'
      }
    ],
    steps: [
      {
        id: 'capture-inspection-data',
        name: 'Capture Inspection Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'quality-control',
        action: 'captureInspectionData',
        parameters: {
          inspectionTypes: ['visual', 'dimensional', 'functional'],
          sampleSize: 'adaptive'
        },
        outputs: ['inspectionData'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'detect-defects',
        name: 'Detect Defects',
        type: 'analyze',
        agent: 'accuracy',
        service: 'quality-control',
        action: 'detectDefects',
        parameters: {
          defectCategories: ['critical', 'major', 'minor'],
          aiModels: ['computer_vision', 'pattern_recognition']
        },
        outputs: ['defects', 'defectCount'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'classify-quality',
        name: 'Classify Quality Level',
        type: 'decide',
        agent: 'integrity',
        service: 'quality-control',
        action: 'classifyQuality',
        parameters: {
          standards: ['ISO 9001', 'Six Sigma'],
          acceptanceCriteria: 'dynamic'
        },
        outputs: ['qualityClassification', 'qualityScore'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'handle-defects',
        name: 'Handle Defective Products',
        type: 'execute',
        agent: 'response',
        service: 'quality-control',
        action: 'handleDefects',
        parameters: {
          actions: ['quarantine', 'rework', 'scrap'],
          traceability: true
        },
        conditions: [
          {
            field: 'context.qualityClassification',
            operator: '!=',
            value: 'pass'
          }
        ],
        outputs: ['defectHandlingResult'],
        errorHandling: {
          notification: {
            recipients: ['quality-team@company.com'],
            channels: ['email']
          }
        }
      },
      {
        id: 'generate-quality-report',
        name: 'Generate Quality Report',
        type: 'report',
        agent: 'compliance',
        service: 'quality-control',
        action: 'generateQualityReport',
        parameters: {
          metrics: ['defect_rate', 'first_pass_yield', 'cost_of_quality'],
          distribution: ['production', 'quality', 'management']
        },
        outputs: ['reportId', 'qualityMetrics'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['quality-control', 'notification', 'reporting'],
      requiredAgents: ['monitoring', 'accuracy', 'integrity', 'response', 'compliance'],
      estimatedDuration: 180000,
      criticality: 'high',
      compliance: ['ISO 9001', 'FDA 21 CFR Part 820'],
      tags: ['quality', 'inspection', 'defects', 'manufacturing']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'supply-chain-optimization-workflow',
    useCaseId: 'supply-chain-optimization',
    name: 'Supply Chain Optimization Workflow',
    description: 'Optimize supply chain operations and inventory management',
    industry: 'manufacturing',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 6 * * *' // Daily at 6 AM
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'inventory.stockout.risk',
          operator: '>',
          value: 0.3
        }
      }
    ],
    steps: [
      {
        id: 'analyze-inventory',
        name: 'Analyze Inventory Levels',
        type: 'detect',
        agent: 'monitoring',
        service: 'supply-chain',
        action: 'analyzeInventory',
        parameters: {
          locations: 'all',
          includeInTransit: true,
          forecastHorizon: '30d'
        },
        outputs: ['inventoryLevels', 'stockoutRisk'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'predict-demand',
        name: 'Predict Demand',
        type: 'analyze',
        agent: 'prediction',
        service: 'supply-chain',
        action: 'predictDemand',
        parameters: {
          models: ['time_series', 'ml_ensemble'],
          factors: ['seasonality', 'trends', 'events']
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
        id: 'optimize-orders',
        name: 'Optimize Purchase Orders',
        type: 'decide',
        agent: 'optimization',
        service: 'supply-chain',
        action: 'optimizeOrders',
        parameters: {
          objectives: ['cost', 'lead_time', 'reliability'],
          constraints: ['budget', 'storage', 'supplier_capacity']
        },
        outputs: ['optimizedOrders', 'costSavings'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'execute-orders',
        name: 'Execute Purchase Orders',
        type: 'execute',
        agent: 'negotiation',
        service: 'supply-chain',
        action: 'executePurchaseOrders',
        humanApprovalRequired: true,
        parameters: {
          approvalThreshold: 100000,
          autoApproveBelow: 10000
        },
        outputs: ['executedOrders', 'orderIds'],
        errorHandling: {
          notification: {
            recipients: ['procurement@company.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'update-supply-chain-metrics',
        name: 'Update Supply Chain Metrics',
        type: 'report',
        agent: 'monitoring',
        service: 'supply-chain',
        action: 'updateMetrics',
        parameters: {
          kpis: ['inventory_turnover', 'stockout_rate', 'order_fulfillment'],
          dashboardUpdate: true
        },
        outputs: ['metricsUpdated', 'kpiValues'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['supply-chain', 'notification', 'procurement'],
      requiredAgents: ['monitoring', 'prediction', 'optimization', 'negotiation'],
      estimatedDuration: 600000,
      criticality: 'high',
      compliance: ['ISO 28000'],
      tags: ['supply-chain', 'inventory', 'optimization', 'manufacturing']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default manufacturingWorkflows;