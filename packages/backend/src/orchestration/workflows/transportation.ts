import { UseCaseWorkflow } from '../types/workflow.types';

const transportationWorkflows: UseCaseWorkflow[] = [
  {
    id: 'fleet-optimization-workflow',
    useCaseId: 'fleet-optimization',
    name: 'Fleet Optimization Workflow',
    description: 'Optimize fleet operations and route planning',
    industry: 'transportation',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 5 * * *' // Daily at 5 AM
      },
      {
        type: 'event',
        event: 'fleet.route.request'
      }
    ],
    steps: [
      {
        id: 'collect-fleet-data',
        name: 'Collect Fleet Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'fleet-optimization',
        action: 'collectFleetData',
        parameters: {
          dataTypes: ['vehicle_location', 'fuel_levels', 'maintenance_status', 'driver_hours'],
          realTime: true
        },
        outputs: ['fleetStatus', 'vehicleAvailability'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-routes',
        name: 'Analyze Route Efficiency',
        type: 'analyze',
        agent: 'analysis',
        service: 'fleet-optimization',
        action: 'analyzeRoutes',
        parameters: {
          factors: ['traffic', 'weather', 'delivery_windows', 'fuel_efficiency'],
          optimization: 'multi_objective'
        },
        outputs: ['routeAnalysis', 'inefficiencies'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-assignments',
        name: 'Optimize Vehicle Assignments',
        type: 'decide',
        agent: 'optimization',
        service: 'fleet-optimization',
        action: 'optimizeAssignments',
        parameters: {
          objectives: ['minimize_distance', 'maximize_utilization', 'balance_workload'],
          constraints: ['driver_hours', 'vehicle_capacity', 'delivery_deadlines']
        },
        outputs: ['optimizedRoutes', 'assignments'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'dispatch-vehicles',
        name: 'Dispatch Vehicles',
        type: 'execute',
        agent: 'response',
        service: 'fleet-optimization',
        action: 'dispatchVehicles',
        humanApprovalRequired: false,
        parameters: {
          dispatchMode: 'automated',
          notifyDrivers: true,
          trackingEnabled: true
        },
        outputs: ['dispatchedVehicles', 'trackingIds'],
        errorHandling: {
          notification: {
            recipients: ['dispatch@company.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'monitor-performance',
        name: 'Monitor Fleet Performance',
        type: 'verify',
        agent: 'monitoring',
        service: 'fleet-optimization',
        action: 'monitorPerformance',
        parameters: {
          metrics: ['on_time_delivery', 'fuel_efficiency', 'utilization_rate'],
          alertThresholds: {
            delayMinutes: 30,
            fuelVariancePercent: 15
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
      requiredServices: ['fleet-optimization', 'notification', 'tracking'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['DOT', 'FMCSA'],
      tags: ['fleet', 'routing', 'optimization', 'transportation']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'predictive-maintenance-transport-workflow',
    useCaseId: 'predictive-maintenance-transport',
    name: 'Transportation Predictive Maintenance Workflow',
    description: 'Predict and prevent vehicle breakdowns',
    industry: 'transportation',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 */8 * * *' // Every 8 hours
      },
      {
        type: 'event',
        event: 'vehicle.diagnostic.alert'
      }
    ],
    steps: [
      {
        id: 'collect-diagnostic-data',
        name: 'Collect Vehicle Diagnostics',
        type: 'detect',
        agent: 'monitoring',
        service: 'predictive-maintenance-transport',
        action: 'collectDiagnostics',
        parameters: {
          systems: ['engine', 'transmission', 'brakes', 'electrical'],
          includeHistorical: true
        },
        outputs: ['diagnosticData', 'anomalies'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'predict-failures',
        name: 'Predict Component Failures',
        type: 'analyze',
        agent: 'prediction',
        service: 'predictive-maintenance-transport',
        action: 'predictFailures',
        parameters: {
          models: ['random_forest', 'lstm', 'gradient_boosting'],
          predictionWindow: '30d'
        },
        outputs: ['failurePredictions', 'riskScores'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'prioritize-maintenance',
        name: 'Prioritize Maintenance Actions',
        type: 'decide',
        agent: 'optimization',
        service: 'predictive-maintenance-transport',
        action: 'prioritizeMaintenance',
        parameters: {
          criteria: ['safety_impact', 'downtime_cost', 'repair_complexity'],
          resourceConstraints: true
        },
        outputs: ['maintenancePlan', 'priorities'],
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
        agent: 'response',
        service: 'predictive-maintenance-transport',
        action: 'scheduleMaintenance',
        humanApprovalRequired: true,
        parameters: {
          coordinateWithOperations: true,
          minimizeDisruption: true
        },
        conditions: [
          {
            field: 'context.riskScores.max',
            operator: '>',
            value: 0.7
          }
        ],
        outputs: ['maintenanceSchedule', 'workOrders'],
        errorHandling: {
          notification: {
            recipients: ['maintenance-manager@company.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'update-maintenance-records',
        name: 'Update Maintenance Records',
        type: 'report',
        agent: 'compliance',
        service: 'predictive-maintenance-transport',
        action: 'updateRecords',
        parameters: {
          includeCompliance: true,
          generateReports: true
        },
        outputs: ['recordsUpdated', 'complianceStatus'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['predictive-maintenance-transport', 'notification', 'scheduling'],
      requiredAgents: ['monitoring', 'prediction', 'optimization', 'response', 'compliance'],
      estimatedDuration: 360000,
      criticality: 'high',
      compliance: ['DOT', 'OSHA'],
      tags: ['maintenance', 'predictive', 'vehicles', 'transportation']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cargo-tracking-workflow',
    useCaseId: 'cargo-tracking',
    name: 'Real-time Cargo Tracking Workflow',
    description: 'Track and monitor cargo shipments in real-time',
    industry: 'transportation',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'cargo.status.update'
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'delivery.delay.minutes',
          operator: '>',
          value: 60
        }
      }
    ],
    steps: [
      {
        id: 'track-shipments',
        name: 'Track Active Shipments',
        type: 'detect',
        agent: 'monitoring',
        service: 'cargo-tracking',
        action: 'trackShipments',
        parameters: {
          trackingMethods: ['gps', 'rfid', 'barcode'],
          updateFrequency: '5m'
        },
        outputs: ['shipmentLocations', 'statusUpdates'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-delays',
        name: 'Analyze Delivery Delays',
        type: 'analyze',
        agent: 'analysis',
        service: 'cargo-tracking',
        action: 'analyzeDelays',
        parameters: {
          factors: ['traffic', 'weather', 'customs', 'loading_delays'],
          impactAssessment: true
        },
        outputs: ['delayAnalysis', 'impactedShipments'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'determine-actions',
        name: 'Determine Corrective Actions',
        type: 'decide',
        agent: 'optimization',
        service: 'cargo-tracking',
        action: 'determineActions',
        parameters: {
          actionTypes: ['reroute', 'expedite', 'notify', 'compensate'],
          customerPriority: true
        },
        outputs: ['recommendedActions', 'customerNotifications'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'execute-actions',
        name: 'Execute Tracking Actions',
        type: 'execute',
        agent: 'response',
        service: 'cargo-tracking',
        action: 'executeActions',
        parameters: {
          automatedNotifications: true,
          updateSystems: ['erp', 'customer_portal', 'mobile_app']
        },
        outputs: ['actionsExecuted', 'notificationsSent'],
        errorHandling: {
          notification: {
            recipients: ['logistics@company.com'],
            channels: ['email']
          }
        }
      },
      {
        id: 'update-tracking-dashboard',
        name: 'Update Tracking Dashboard',
        type: 'report',
        agent: 'monitoring',
        service: 'cargo-tracking',
        action: 'updateDashboard',
        parameters: {
          dashboards: ['operations', 'customer', 'executive'],
          realTimeUpdates: true
        },
        outputs: ['dashboardsUpdated', 'kpis'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['cargo-tracking', 'notification', 'integration'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 180000,
      criticality: 'medium',
      compliance: ['ISO 28000'],
      tags: ['cargo', 'tracking', 'logistics', 'transportation']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default transportationWorkflows;