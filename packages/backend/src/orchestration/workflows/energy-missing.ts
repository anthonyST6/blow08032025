import { WorkflowDefinition } from '../types/workflow.types';
import { v4 as uuidv4 } from 'uuid';

export const workflows: WorkflowDefinition[] = [
  // Energy Storage Management
  {
    useCaseId: 'energy-storage-management',
    workflow: {
      id: uuidv4(),
      useCaseId: 'energy-storage-management',
      name: 'Energy Storage Management & Optimization',
      description: 'Manage battery storage systems, optimize charge/discharge cycles, and maximize storage efficiency',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-storage',
          name: 'Monitor Storage Systems',
          type: 'detect',
          agent: 'Storage Monitoring Vanguard',
          service: 'energy-storage',
          action: 'monitorStorageSystems',
          parameters: {
            systems: ['battery_banks', 'pumped_hydro', 'compressed_air', 'thermal'],
            metrics: ['soc', 'health', 'temperature', 'efficiency'],
            realTimeMonitoring: true
          },
          outputs: ['storageStatus', 'anomalies', 'capacity'],
          errorHandling: {
            retry: { attempts: 5, delay: 2000 }
          }
        },
        {
          id: 'analyze-demand',
          name: 'Analyze Energy Demand & Supply',
          type: 'analyze',
          agent: 'Demand Analysis Vanguard',
          service: 'energy-storage',
          action: 'analyzeDemandSupply',
          parameters: {
            forecastHorizon: '48h',
            gridConditions: true,
            marketPrices: true,
            renewableGeneration: true
          },
          outputs: ['demandForecast', 'supplyForecast', 'priceForecasts'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'optimize-strategy',
          name: 'Optimize Storage Strategy',
          type: 'decide',
          agent: 'Storage Optimization Vanguard',
          service: 'energy-storage',
          action: 'optimizeStorageStrategy',
          parameters: {
            objectives: ['maximize_revenue', 'grid_stability', 'renewable_integration'],
            constraints: ['battery_health', 'grid_requirements', 'regulatory_limits']
          },
          outputs: ['storageStrategy', 'chargeDischargeSchedule', 'expectedRevenue'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'execute-operations',
          name: 'Execute Storage Operations',
          type: 'execute',
          agent: 'Storage Control Vanguard',
          service: 'energy-storage',
          action: 'executeStorageOperations',
          parameters: {
            automatedControl: true,
            safetyLimits: true,
            gridCoordination: true
          },
          outputs: ['operationStatus', 'actualPerformance'],
          humanApprovalRequired: false,
          errorHandling: {
            notification: {
              channels: ['email', 'teams'],
              recipients: ['storage-ops@company.com']
            }
          }
        },
        {
          id: 'monitor-health',
          name: 'Monitor Storage Health',
          type: 'analyze',
          agent: 'Health Monitoring Vanguard',
          service: 'energy-storage',
          action: 'monitorStorageHealth',
          parameters: {
            degradationAnalysis: true,
            predictiveMaintenance: true,
            warrantyTracking: true
          },
          outputs: ['healthReport', 'maintenanceNeeds', 'lifeExpectancy'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'verify-performance',
          name: 'Verify Storage Performance',
          type: 'verify',
          agent: 'Performance Verification Vanguard',
          service: 'energy-storage',
          action: 'verifyPerformance',
          parameters: {
            kpis: ['efficiency', 'availability', 'revenue', 'grid_services'],
            benchmarking: true
          },
          outputs: ['performanceReport', 'improvements'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate Storage Report',
          type: 'report',
          agent: 'Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'energy-storage',
            includeFinancials: true,
            operationalMetrics: true
          },
          outputs: ['reportId', 'dashboardUrl'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '*/15 * * * *' // Every 15 minutes
        },
        {
          type: 'event',
          event: 'storage.anomaly.detected'
        },
        {
          type: 'threshold',
          threshold: {
            metric: 'grid.price.volatility',
            operator: '>',
            value: 0.3
          }
        }
      ],
      metadata: {
        requiredServices: ['energy-storage', 'unified-reports', 'notification'],
        requiredAgents: [
          'Storage Monitoring Vanguard',
          'Demand Analysis Vanguard',
          'Storage Optimization Vanguard',
          'Storage Control Vanguard',
          'Health Monitoring Vanguard',
          'Performance Verification Vanguard',
          'Reporting Vanguard'
        ],
        estimatedDuration: 1800000, // 30 minutes
        criticality: 'high',
        tags: ['energy', 'storage', 'battery', 'optimization'],
        compliance: ['FERC Order 841', 'State Storage Mandates']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Demand Response Management
  {
    useCaseId: 'demand-response',
    workflow: {
      id: uuidv4(),
      useCaseId: 'demand-response',
      name: 'Demand Response Program Management',
      description: 'Manage demand response programs, coordinate with customers, and optimize grid load',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-grid-conditions',
          name: 'Monitor Grid Conditions',
          type: 'detect',
          agent: 'Grid Monitoring Vanguard',
          service: 'demand-response',
          action: 'monitorGridConditions',
          parameters: {
            metrics: ['load', 'generation', 'frequency', 'reserves'],
            forecastIntegration: true,
            realTimeAlerts: true
          },
          outputs: ['gridStatus', 'stressIndicators', 'forecast'],
          errorHandling: {
            retry: { attempts: 5, delay: 2000 }
          }
        },
        {
          id: 'analyze-dr-potential',
          name: 'Analyze DR Potential',
          type: 'analyze',
          agent: 'DR Analysis Vanguard',
          service: 'demand-response',
          action: 'analyzeDRPotential',
          parameters: {
            customerSegments: ['residential', 'commercial', 'industrial'],
            programTypes: ['time_of_use', 'critical_peak', 'direct_load_control'],
            availableCapacity: true
          },
          outputs: ['drPotential', 'customerAvailability', 'expectedResponse'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'determine-dr-strategy',
          name: 'Determine DR Strategy',
          type: 'decide',
          agent: 'DR Strategy Vanguard',
          service: 'demand-response',
          action: 'determineDRStrategy',
          parameters: {
            objectives: ['peak_reduction', 'cost_minimization', 'reliability'],
            customerImpact: true,
            incentiveOptimization: true
          },
          outputs: ['drStrategy', 'targetCustomers', 'incentiveStructure'],
          humanApprovalRequired: false,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'notify-customers',
          name: 'Notify DR Participants',
          type: 'execute',
          agent: 'Customer Communication Vanguard',
          service: 'demand-response',
          action: 'notifyCustomers',
          parameters: {
            channels: ['sms', 'email', 'app_notification', 'smart_thermostat'],
            messagePersonalization: true,
            confirmationRequired: true
          },
          outputs: ['notificationStatus', 'customerResponses', 'optOuts'],
          errorHandling: {
            notification: {
              channels: ['email'],
              recipients: ['dr-team@company.com']
            }
          }
        },
        {
          id: 'execute-dr-event',
          name: 'Execute DR Event',
          type: 'execute',
          agent: 'DR Execution Vanguard',
          service: 'demand-response',
          action: 'executeDREvent',
          parameters: {
            loadControl: true,
            realTimeMonitoring: true,
            customerOverride: true
          },
          outputs: ['eventStatus', 'loadReduction', 'participation'],
          errorHandling: {
            retry: { attempts: 1, delay: 0 },
            notification: {
              channels: ['email', 'teams'],
              recipients: ['grid-operations@company.com']
            }
          }
        },
        {
          id: 'verify-results',
          name: 'Verify DR Results',
          type: 'verify',
          agent: 'DR Verification Vanguard',
          service: 'demand-response',
          action: 'verifyDRResults',
          parameters: {
            performanceMetrics: ['load_reduction', 'participation_rate', 'customer_satisfaction'],
            baselineComparison: true
          },
          outputs: ['performanceReport', 'actualSavings', 'issues'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'calculate-settlements',
          name: 'Calculate Customer Settlements',
          type: 'analyze',
          agent: 'Settlement Vanguard',
          service: 'demand-response',
          action: 'calculateSettlements',
          parameters: {
            incentivePrograms: true,
            performanceBasedPayments: true,
            penaltyCalculations: true
          },
          outputs: ['settlements', 'payments', 'adjustments'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate DR Event Report',
          type: 'report',
          agent: 'Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'demand-response-event',
            includeCustomerMetrics: true,
            financialSummary: true,
            gridImpact: true
          },
          outputs: ['reportId', 'customerReports', 'regulatoryReport'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'grid.stress.detected'
        },
        {
          type: 'threshold',
          threshold: {
            metric: 'grid.load.forecast',
            operator: '>',
            value: 0.95 // 95% of capacity
          }
        },
        {
          type: 'scheduled',
          schedule: '0 14 * * *' // Daily at 2 PM for peak planning
        }
      ],
      metadata: {
        requiredServices: ['demand-response', 'unified-reports', 'notification'],
        requiredAgents: [
          'Grid Monitoring Vanguard',
          'DR Analysis Vanguard',
          'DR Strategy Vanguard',
          'Customer Communication Vanguard',
          'DR Execution Vanguard',
          'DR Verification Vanguard',
          'Settlement Vanguard',
          'Reporting Vanguard'
        ],
        estimatedDuration: 14400000, // 4 hours
        criticality: 'high',
        tags: ['demand-response', 'grid', 'customers', 'load-management'],
        compliance: ['FERC Order 2222', 'State DR Programs']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];