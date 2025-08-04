import { UseCaseWorkflow } from '../types/workflow.types';

const hospitalityWorkflows: UseCaseWorkflow[] = [
  {
    id: 'guest-experience-workflow',
    useCaseId: 'guest-experience-personalization',
    name: 'Guest Experience Personalization Workflow',
    description: 'Personalize guest experiences using AI and data analytics',
    industry: 'hospitality',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'guest.checkin'
      },
      {
        type: 'event',
        event: 'guest.preference.update'
      }
    ],
    steps: [
      {
        id: 'collect-guest-data',
        name: 'Collect Guest Profile Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'guest-experience-personalization',
        action: 'collectGuestData',
        parameters: {
          dataSources: ['booking_history', 'preferences', 'feedback', 'loyalty_program'],
          consentCompliant: true
        },
        outputs: ['guestProfile', 'preferences'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-preferences',
        name: 'Analyze Guest Preferences',
        type: 'analyze',
        agent: 'analysis',
        service: 'guest-experience-personalization',
        action: 'analyzePreferences',
        parameters: {
          analysisTypes: ['behavioral', 'demographic', 'psychographic'],
          segmentation: true
        },
        outputs: ['preferenceAnalysis', 'guestSegment'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-needs',
        name: 'Predict Guest Needs',
        type: 'analyze',
        agent: 'prediction',
        service: 'guest-experience-personalization',
        action: 'predictNeeds',
        parameters: {
          predictionModels: ['collaborative_filtering', 'content_based', 'hybrid'],
          contextFactors: ['time_of_day', 'weather', 'local_events']
        },
        outputs: ['predictedNeeds', 'recommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'personalize-services',
        name: 'Personalize Service Offerings',
        type: 'decide',
        agent: 'optimization',
        service: 'guest-experience-personalization',
        action: 'personalizeServices',
        parameters: {
          serviceTypes: ['room_setup', 'dining', 'activities', 'amenities'],
          personalizationLevel: 'high'
        },
        outputs: ['personalizedServices', 'actionPlan'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-personalization',
        name: 'Implement Personalization Actions',
        type: 'execute',
        agent: 'response',
        service: 'guest-experience-personalization',
        action: 'implementPersonalization',
        humanApprovalRequired: false,
        parameters: {
          notifyStaff: true,
          updateSystems: ['pms', 'pos', 'crm'],
          automatedActions: true
        },
        outputs: ['implementationStatus', 'staffNotifications'],
        errorHandling: {
          notification: {
            recipients: ['guest-services@hotel.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'monitor-satisfaction',
        name: 'Monitor Guest Satisfaction',
        type: 'verify',
        agent: 'monitoring',
        service: 'guest-experience-personalization',
        action: 'monitorSatisfaction',
        parameters: {
          feedbackChannels: ['in_app', 'survey', 'social_media'],
          sentimentAnalysis: true
        },
        outputs: ['satisfactionMetrics', 'improvements'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['guest-experience-personalization', 'notification', 'pms-integration'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['GDPR', 'CCPA', 'PCI-DSS'],
      tags: ['hospitality', 'guest-experience', 'personalization', 'ai']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'revenue-management-workflow',
    useCaseId: 'dynamic-revenue-management',
    name: 'Dynamic Revenue Management Workflow',
    description: 'Optimize pricing and inventory for maximum revenue',
    industry: 'hospitality',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 */6 * * *' // Every 6 hours
      },
      {
        type: 'event',
        event: 'market.condition.change'
      }
    ],
    steps: [
      {
        id: 'analyze-market',
        name: 'Analyze Market Conditions',
        type: 'detect',
        agent: 'monitoring',
        service: 'dynamic-revenue-management',
        action: 'analyzeMarket',
        parameters: {
          dataPoints: ['competitor_rates', 'demand_patterns', 'events', 'seasonality'],
          marketRadius: '10km'
        },
        outputs: ['marketAnalysis', 'demandForecast'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'assess-inventory',
        name: 'Assess Inventory Status',
        type: 'analyze',
        agent: 'analysis',
        service: 'dynamic-revenue-management',
        action: 'assessInventory',
        parameters: {
          inventoryTypes: ['rooms', 'packages', 'amenities'],
          forecastWindow: '90d'
        },
        outputs: ['inventoryStatus', 'availability'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-revenue',
        name: 'Predict Revenue Opportunities',
        type: 'analyze',
        agent: 'prediction',
        service: 'dynamic-revenue-management',
        action: 'predictRevenue',
        parameters: {
          models: ['time_series', 'machine_learning', 'price_elasticity'],
          scenarios: ['conservative', 'moderate', 'aggressive']
        },
        outputs: ['revenuePredictions', 'optimalScenario'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-pricing',
        name: 'Optimize Pricing Strategy',
        type: 'decide',
        agent: 'optimization',
        service: 'dynamic-revenue-management',
        action: 'optimizePricing',
        parameters: {
          strategies: ['dynamic_pricing', 'segmented_pricing', 'package_optimization'],
          constraints: ['brand_standards', 'rate_parity', 'minimum_rates']
        },
        outputs: ['pricingStrategy', 'rateRecommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'update-rates',
        name: 'Update Distribution Channels',
        type: 'execute',
        agent: 'response',
        service: 'dynamic-revenue-management',
        action: 'updateRates',
        humanApprovalRequired: true,
        parameters: {
          channels: ['direct', 'ota', 'gds', 'metasearch'],
          rateSync: true,
          complianceCheck: true
        },
        conditions: [
          {
            field: 'context.pricingStrategy.changePercent',
            operator: '>',
            value: 10
          }
        ],
        outputs: ['updateStatus', 'channelConfirmations'],
        errorHandling: {
          notification: {
            recipients: ['revenue-manager@hotel.com'],
            channels: ['email', 'slack']
          }
        }
      },
      {
        id: 'track-performance',
        name: 'Track Revenue Performance',
        type: 'report',
        agent: 'monitoring',
        service: 'dynamic-revenue-management',
        action: 'trackPerformance',
        parameters: {
          kpis: ['revpar', 'adr', 'occupancy', 'revenue_index'],
          comparisonPeriods: ['yoy', 'mom', 'wow']
        },
        outputs: ['performanceReport', 'insights'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['dynamic-revenue-management', 'notification', 'channel-manager'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 420000,
      criticality: 'high',
      compliance: ['Rate Parity Agreements'],
      tags: ['hospitality', 'revenue-management', 'pricing', 'optimization']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'operations-optimization-workflow',
    useCaseId: 'hotel-operations-optimization',
    name: 'Hotel Operations Optimization Workflow',
    description: 'Optimize hotel operations for efficiency and guest satisfaction',
    industry: 'hospitality',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 6 * * *' // Daily at 6 AM
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'staff.utilization',
          operator: '>',
          value: 0.9
        }
      }
    ],
    steps: [
      {
        id: 'monitor-operations',
        name: 'Monitor Hotel Operations',
        type: 'detect',
        agent: 'monitoring',
        service: 'hotel-operations-optimization',
        action: 'monitorOperations',
        parameters: {
          departments: ['housekeeping', 'front_desk', 'fb', 'maintenance'],
          metrics: ['efficiency', 'quality', 'guest_wait_times']
        },
        outputs: ['operationalData', 'bottlenecks'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-workflows',
        name: 'Analyze Operational Workflows',
        type: 'analyze',
        agent: 'analysis',
        service: 'hotel-operations-optimization',
        action: 'analyzeWorkflows',
        parameters: {
          processMapping: true,
          timeMotionStudy: true,
          guestImpactAnalysis: true
        },
        outputs: ['workflowAnalysis', 'inefficiencies'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-demand',
        name: 'Predict Operational Demand',
        type: 'analyze',
        agent: 'prediction',
        service: 'hotel-operations-optimization',
        action: 'predictDemand',
        parameters: {
          demandTypes: ['housekeeping', 'check_in_out', 'dining', 'concierge'],
          forecastGranularity: 'hourly'
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
        id: 'optimize-staffing',
        name: 'Optimize Staff Scheduling',
        type: 'decide',
        agent: 'optimization',
        service: 'hotel-operations-optimization',
        action: 'optimizeStaffing',
        parameters: {
          objectives: ['minimize_cost', 'maximize_coverage', 'balance_workload'],
          constraints: ['labor_laws', 'union_rules', 'skill_requirements']
        },
        outputs: ['staffingPlan', 'schedules'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-improvements',
        name: 'Implement Operational Improvements',
        type: 'execute',
        agent: 'response',
        service: 'hotel-operations-optimization',
        action: 'implementImprovements',
        humanApprovalRequired: false,
        parameters: {
          improvementTypes: ['process_automation', 'staff_reallocation', 'technology_deployment'],
          changeManagement: true
        },
        outputs: ['implementationStatus', 'staffAssignments'],
        errorHandling: {
          notification: {
            recipients: ['operations-manager@hotel.com'],
            channels: ['email']
          }
        }
      },
      {
        id: 'measure-impact',
        name: 'Measure Operational Impact',
        type: 'verify',
        agent: 'monitoring',
        service: 'hotel-operations-optimization',
        action: 'measureImpact',
        parameters: {
          metrics: ['efficiency_gain', 'cost_reduction', 'guest_satisfaction'],
          benchmarking: true
        },
        outputs: ['impactReport', 'recommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['hotel-operations-optimization', 'notification', 'workforce-management'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 480000,
      criticality: 'medium',
      compliance: ['Labor Laws', 'Health & Safety'],
      tags: ['hospitality', 'operations', 'optimization', 'efficiency']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default hospitalityWorkflows;