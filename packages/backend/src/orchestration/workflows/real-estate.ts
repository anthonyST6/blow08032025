import { UseCaseWorkflow } from '../types/workflow.types';

const realEstateWorkflows: UseCaseWorkflow[] = [
  {
    id: 'property-valuation-workflow',
    useCaseId: 'property-valuation',
    name: 'AI Property Valuation Workflow',
    description: 'Automated property valuation using AI and market analysis',
    industry: 'real-estate',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'valuation.request'
      },
      {
        type: 'scheduled',
        schedule: '0 0 * * 0' // Weekly market updates
      }
    ],
    steps: [
      {
        id: 'collect-property-data',
        name: 'Collect Property Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'property-valuation',
        action: 'collectPropertyData',
        parameters: {
          dataSources: ['mls', 'public_records', 'satellite_imagery', 'street_view'],
          propertyFeatures: ['size', 'bedrooms', 'bathrooms', 'amenities', 'condition']
        },
        outputs: ['propertyData', 'comparables'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-market',
        name: 'Analyze Market Conditions',
        type: 'analyze',
        agent: 'analysis',
        service: 'property-valuation',
        action: 'analyzeMarket',
        parameters: {
          marketFactors: ['recent_sales', 'inventory_levels', 'economic_indicators', 'neighborhood_trends'],
          radius: '1mi'
        },
        outputs: ['marketAnalysis', 'pricePerSqFt'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-value',
        name: 'Predict Property Value',
        type: 'analyze',
        agent: 'prediction',
        service: 'property-valuation',
        action: 'predictValue',
        parameters: {
          models: ['hedonic_regression', 'neural_network', 'ensemble'],
          adjustments: ['location', 'condition', 'market_timing']
        },
        outputs: ['valuationEstimate', 'confidenceInterval'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'generate-report',
        name: 'Generate Valuation Report',
        type: 'decide',
        agent: 'optimization',
        service: 'property-valuation',
        action: 'generateReport',
        parameters: {
          reportSections: ['executive_summary', 'methodology', 'comparables', 'market_analysis'],
          visualizations: true
        },
        outputs: ['valuationReport', 'supportingData'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'deliver-valuation',
        name: 'Deliver Valuation Results',
        type: 'execute',
        agent: 'response',
        service: 'property-valuation',
        action: 'deliverValuation',
        humanApprovalRequired: false,
        parameters: {
          deliveryChannels: ['email', 'portal', 'api'],
          includeDisclaimer: true
        },
        outputs: ['deliveryStatus', 'clientAccess'],
        errorHandling: {
          notification: {
            recipients: ['valuation-team@realestate.com'],
            channels: ['email']
          }
        }
      },
      {
        id: 'monitor-accuracy',
        name: 'Monitor Valuation Accuracy',
        type: 'verify',
        agent: 'monitoring',
        service: 'property-valuation',
        action: 'monitorAccuracy',
        parameters: {
          trackActualSales: true,
          updateModels: true
        },
        outputs: ['accuracyMetrics', 'modelUpdates'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['property-valuation', 'notification', 'market-data'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['USPAP', 'Fair Housing Act'],
      tags: ['real-estate', 'valuation', 'ai', 'market-analysis']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tenant-screening-workflow',
    useCaseId: 'tenant-screening',
    name: 'Automated Tenant Screening Workflow',
    description: 'Comprehensive tenant screening and risk assessment',
    industry: 'real-estate',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'application.submitted'
      }
    ],
    steps: [
      {
        id: 'collect-application',
        name: 'Collect Tenant Application',
        type: 'detect',
        agent: 'monitoring',
        service: 'tenant-screening',
        action: 'collectApplication',
        parameters: {
          requiredDocuments: ['id', 'income_proof', 'references', 'employment'],
          consentVerification: true
        },
        outputs: ['applicationData', 'consentStatus'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'verify-identity',
        name: 'Verify Applicant Identity',
        type: 'analyze',
        agent: 'security',
        service: 'tenant-screening',
        action: 'verifyIdentity',
        parameters: {
          verificationMethods: ['document_analysis', 'biometric', 'database_check'],
          fraudDetection: true
        },
        outputs: ['identityVerified', 'fraudIndicators'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'check-background',
        name: 'Perform Background Checks',
        type: 'analyze',
        agent: 'integrity',
        service: 'tenant-screening',
        action: 'checkBackground',
        parameters: {
          checkTypes: ['criminal', 'eviction', 'credit', 'employment'],
          complianceMode: true
        },
        outputs: ['backgroundReport', 'riskFlags'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'assess-risk',
        name: 'Assess Tenant Risk',
        type: 'decide',
        agent: 'analysis',
        service: 'tenant-screening',
        action: 'assessRisk',
        parameters: {
          riskFactors: ['payment_history', 'income_ratio', 'references', 'stability'],
          scoringModel: 'proprietary'
        },
        outputs: ['riskScore', 'recommendation'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'generate-decision',
        name: 'Generate Screening Decision',
        type: 'execute',
        agent: 'compliance',
        service: 'tenant-screening',
        action: 'generateDecision',
        humanApprovalRequired: true,
        parameters: {
          decisionCriteria: ['risk_threshold', 'property_requirements', 'fair_housing'],
          documentReasons: true
        },
        conditions: [
          {
            field: 'context.riskScore',
            operator: '<',
            value: 0.7
          }
        ],
        outputs: ['screeningDecision', 'decisionLetter'],
        errorHandling: {
          notification: {
            recipients: ['property-manager@realestate.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'notify-applicant',
        name: 'Notify Applicant of Decision',
        type: 'report',
        agent: 'response',
        service: 'tenant-screening',
        action: 'notifyApplicant',
        parameters: {
          includeAdverseAction: true,
          provideAppealProcess: true
        },
        outputs: ['notificationSent', 'applicantResponse'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['tenant-screening', 'notification', 'background-check'],
      requiredAgents: ['monitoring', 'security', 'integrity', 'analysis', 'compliance', 'response'],
      estimatedDuration: 420000,
      criticality: 'high',
      compliance: ['FCRA', 'Fair Housing Act', 'State Laws'],
      tags: ['real-estate', 'tenant', 'screening', 'risk-assessment']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'property-management-workflow',
    useCaseId: 'property-management-optimization',
    name: 'Smart Property Management Workflow',
    description: 'Optimize property management operations and maintenance',
    industry: 'real-estate',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 8 * * *' // Daily at 8 AM
      },
      {
        type: 'event',
        event: 'maintenance.request'
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'occupancy.rate',
          operator: '<',
          value: 0.85
        }
      }
    ],
    steps: [
      {
        id: 'monitor-properties',
        name: 'Monitor Property Portfolio',
        type: 'detect',
        agent: 'monitoring',
        service: 'property-management-optimization',
        action: 'monitorProperties',
        parameters: {
          metrics: ['occupancy', 'maintenance_requests', 'rent_collection', 'utilities'],
          iotIntegration: true
        },
        outputs: ['portfolioStatus', 'alerts'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-operations',
        name: 'Analyze Operational Efficiency',
        type: 'analyze',
        agent: 'analysis',
        service: 'property-management-optimization',
        action: 'analyzeOperations',
        parameters: {
          dimensions: ['financial_performance', 'tenant_satisfaction', 'maintenance_efficiency'],
          benchmarking: true
        },
        outputs: ['operationalAnalysis', 'improvementAreas'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-maintenance',
        name: 'Predict Maintenance Needs',
        type: 'analyze',
        agent: 'prediction',
        service: 'property-management-optimization',
        action: 'predictMaintenance',
        parameters: {
          assetTypes: ['hvac', 'plumbing', 'electrical', 'structural'],
          predictiveModels: true
        },
        outputs: ['maintenancePredictions', 'priorityList'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-resources',
        name: 'Optimize Resource Allocation',
        type: 'decide',
        agent: 'optimization',
        service: 'property-management-optimization',
        action: 'optimizeResources',
        parameters: {
          resources: ['staff', 'contractors', 'budget', 'supplies'],
          objectives: ['minimize_cost', 'maximize_satisfaction', 'prevent_issues']
        },
        outputs: ['resourcePlan', 'schedules'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'execute-management',
        name: 'Execute Management Actions',
        type: 'execute',
        agent: 'response',
        service: 'property-management-optimization',
        action: 'executeManagement',
        humanApprovalRequired: false,
        parameters: {
          automatedActions: ['work_orders', 'vendor_dispatch', 'tenant_communications'],
          trackingEnabled: true
        },
        outputs: ['executionStatus', 'workOrders'],
        errorHandling: {
          notification: {
            recipients: ['property-operations@realestate.com'],
            channels: ['email']
          }
        }
      },
      {
        id: 'report-performance',
        name: 'Report Management Performance',
        type: 'report',
        agent: 'monitoring',
        service: 'property-management-optimization',
        action: 'reportPerformance',
        parameters: {
          reportTypes: ['owner', 'operational', 'financial'],
          frequency: 'monthly'
        },
        outputs: ['performanceReports', 'kpis'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['property-management-optimization', 'notification', 'maintenance'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 360000,
      criticality: 'medium',
      compliance: ['Local Housing Codes', 'Safety Regulations'],
      tags: ['real-estate', 'property-management', 'optimization', 'maintenance']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default realEstateWorkflows;