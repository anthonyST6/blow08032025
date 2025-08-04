import { UseCaseWorkflow } from '../types/workflow.types';

const logisticsWorkflows: UseCaseWorkflow[] = [
  {
    id: 'route-optimization-workflow',
    useCaseId: 'route-optimization',
    name: 'Logistics Route Optimization Workflow',
    description: 'Optimize delivery routes for maximum efficiency',
    industry: 'logistics',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 4 * * *' // Daily at 4 AM
      },
      {
        type: 'event',
        event: 'order.batch.ready'
      }
    ],
    steps: [
      {
        id: 'collect-orders',
        name: 'Collect Delivery Orders',
        type: 'detect',
        agent: 'monitoring',
        service: 'route-optimization',
        action: 'collectOrders',
        parameters: {
          orderTypes: ['standard', 'express', 'scheduled', 'recurring'],
          timeWindow: '24h',
          includeConstraints: true
        },
        outputs: ['orderData', 'deliveryConstraints'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-network',
        name: 'Analyze Delivery Network',
        type: 'analyze',
        agent: 'analysis',
        service: 'route-optimization',
        action: 'analyzeNetwork',
        parameters: {
          factors: ['traffic_patterns', 'vehicle_capacity', 'driver_availability', 'fuel_costs'],
          realTimeData: true
        },
        outputs: ['networkAnalysis', 'capacityStatus'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-routes',
        name: 'Optimize Delivery Routes',
        type: 'decide',
        agent: 'optimization',
        service: 'route-optimization',
        action: 'optimizeRoutes',
        parameters: {
          algorithms: ['genetic_algorithm', 'simulated_annealing', 'ant_colony'],
          objectives: ['minimize_distance', 'minimize_time', 'maximize_deliveries']
        },
        outputs: ['optimizedRoutes', 'estimatedSavings'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'assign-deliveries',
        name: 'Assign Deliveries to Drivers',
        type: 'execute',
        agent: 'response',
        service: 'route-optimization',
        action: 'assignDeliveries',
        humanApprovalRequired: false,
        parameters: {
          balanceWorkload: true,
          considerPreferences: true,
          updateMobileApps: true
        },
        outputs: ['assignments', 'routeMaps'],
        errorHandling: {
          notification: {
            recipients: ['dispatch@logistics.com'],
            channels: ['email']
          }
        }
      },
      {
        id: 'monitor-execution',
        name: 'Monitor Route Execution',
        type: 'verify',
        agent: 'monitoring',
        service: 'route-optimization',
        action: 'monitorExecution',
        parameters: {
          trackingFrequency: '5m',
          deviationAlerts: true,
          customerNotifications: true
        },
        outputs: ['executionStatus', 'performanceMetrics'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['route-optimization', 'notification', 'tracking'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 360000,
      criticality: 'high',
      compliance: ['DOT Regulations'],
      tags: ['logistics', 'routing', 'optimization', 'delivery']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'warehouse-automation-workflow',
    useCaseId: 'warehouse-automation',
    name: 'Warehouse Automation Workflow',
    description: 'Automate warehouse operations and inventory management',
    industry: 'logistics',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'inventory.movement'
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'picking.queue.size',
          operator: '>',
          value: 100
        }
      }
    ],
    steps: [
      {
        id: 'monitor-inventory',
        name: 'Monitor Inventory Levels',
        type: 'detect',
        agent: 'monitoring',
        service: 'warehouse-automation',
        action: 'monitorInventory',
        parameters: {
          trackingMethods: ['rfid', 'barcode', 'computer_vision'],
          zones: ['receiving', 'storage', 'picking', 'shipping']
        },
        outputs: ['inventoryStatus', 'movementPatterns'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-operations',
        name: 'Analyze Warehouse Operations',
        type: 'analyze',
        agent: 'analysis',
        service: 'warehouse-automation',
        action: 'analyzeOperations',
        parameters: {
          metrics: ['throughput', 'accuracy', 'utilization', 'cycle_time'],
          bottleneckDetection: true
        },
        outputs: ['operationalAnalysis', 'inefficiencies'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-layout',
        name: 'Optimize Warehouse Layout',
        type: 'decide',
        agent: 'optimization',
        service: 'warehouse-automation',
        action: 'optimizeLayout',
        parameters: {
          optimizationGoals: ['minimize_travel', 'maximize_space', 'improve_flow'],
          slottingStrategy: 'abc_analysis'
        },
        outputs: ['layoutOptimization', 'relocationPlan'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'coordinate-robots',
        name: 'Coordinate Robotic Systems',
        type: 'execute',
        agent: 'response',
        service: 'warehouse-automation',
        action: 'coordinateRobots',
        humanApprovalRequired: false,
        parameters: {
          robotTypes: ['agv', 'picking_robots', 'sorting_systems'],
          taskAllocation: 'dynamic',
          collisionAvoidance: true
        },
        outputs: ['robotAssignments', 'taskStatus'],
        errorHandling: {
          notification: {
            recipients: ['warehouse-manager@logistics.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'report-performance',
        name: 'Report Warehouse Performance',
        type: 'report',
        agent: 'monitoring',
        service: 'warehouse-automation',
        action: 'reportPerformance',
        parameters: {
          kpis: ['order_accuracy', 'fulfillment_speed', 'space_utilization'],
          dashboardUpdate: true
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
      requiredServices: ['warehouse-automation', 'notification', 'robotics'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['OSHA', 'Safety Standards'],
      tags: ['logistics', 'warehouse', 'automation', 'robotics']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'last-mile-delivery-workflow',
    useCaseId: 'last-mile-delivery',
    name: 'Last Mile Delivery Optimization Workflow',
    description: 'Optimize last mile delivery for customer satisfaction',
    industry: 'logistics',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'delivery.scheduled'
      },
      {
        type: 'scheduled',
        schedule: '0 */2 * * *' // Every 2 hours
      }
    ],
    steps: [
      {
        id: 'analyze-deliveries',
        name: 'Analyze Pending Deliveries',
        type: 'detect',
        agent: 'monitoring',
        service: 'last-mile-delivery',
        action: 'analyzeDeliveries',
        parameters: {
          deliveryTypes: ['same_day', 'next_day', 'scheduled', 'white_glove'],
          customerPreferences: true
        },
        outputs: ['deliveryQueue', 'customerRequirements'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'predict-demand',
        name: 'Predict Delivery Demand',
        type: 'analyze',
        agent: 'prediction',
        service: 'last-mile-delivery',
        action: 'predictDemand',
        parameters: {
          forecastWindow: '48h',
          factors: ['historical_patterns', 'events', 'weather', 'seasonality']
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
        id: 'optimize-delivery-slots',
        name: 'Optimize Delivery Time Slots',
        type: 'decide',
        agent: 'optimization',
        service: 'last-mile-delivery',
        action: 'optimizeSlots',
        parameters: {
          slotDuration: '2h',
          customerChoice: true,
          capacityManagement: true
        },
        outputs: ['deliverySlots', 'pricing'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'dispatch-drivers',
        name: 'Dispatch Delivery Drivers',
        type: 'execute',
        agent: 'response',
        service: 'last-mile-delivery',
        action: 'dispatchDrivers',
        humanApprovalRequired: false,
        parameters: {
          driverTypes: ['employee', 'contractor', 'crowdsourced'],
          realTimeOptimization: true,
          proofOfDelivery: true
        },
        outputs: ['dispatchStatus', 'estimatedTimes'],
        errorHandling: {
          notification: {
            recipients: ['delivery-ops@logistics.com'],
            channels: ['email', 'slack']
          }
        }
      },
      {
        id: 'track-satisfaction',
        name: 'Track Customer Satisfaction',
        type: 'verify',
        agent: 'monitoring',
        service: 'last-mile-delivery',
        action: 'trackSatisfaction',
        parameters: {
          feedbackChannels: ['app', 'sms', 'email'],
          metrics: ['on_time', 'condition', 'communication']
        },
        outputs: ['satisfactionScores', 'improvements'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['last-mile-delivery', 'notification', 'customer-communication'],
      requiredAgents: ['monitoring', 'prediction', 'optimization', 'response'],
      estimatedDuration: 240000,
      criticality: 'high',
      compliance: ['Local Delivery Regulations'],
      tags: ['logistics', 'last-mile', 'delivery', 'customer-experience']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default logisticsWorkflows;