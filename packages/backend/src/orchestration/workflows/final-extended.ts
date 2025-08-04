import { UseCaseWorkflow } from '../types/workflow.types';

const finalExtendedWorkflows: UseCaseWorkflow[] = [
  // Energy - Smart Grid Management
  {
    id: 'smart-grid-management-workflow',
    useCaseId: 'smart-grid-management',
    name: 'Smart Grid Management Workflow',
    description: 'Manage and optimize smart grid operations',
    industry: 'energy-utilities',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '*/10 * * * *' // Every 10 minutes
      },
      {
        type: 'event',
        event: 'grid.anomaly.detected'
      }
    ],
    steps: [
      {
        id: 'monitor-grid-health',
        name: 'Monitor Smart Grid Health',
        type: 'detect',
        agent: 'monitoring',
        service: 'smart-grid-management',
        action: 'monitorGridHealth',
        parameters: {
          components: ['transformers', 'smart_meters', 'distribution_lines', 'substations'],
          telemetryData: true
        },
        outputs: ['gridHealth', 'anomalies'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-performance',
        name: 'Analyze Grid Performance',
        type: 'analyze',
        agent: 'analysis',
        service: 'smart-grid-management',
        action: 'analyzePerformance',
        parameters: {
          metrics: ['efficiency', 'reliability', 'power_quality', 'losses'],
          benchmarking: true
        },
        outputs: ['performanceAnalysis', 'inefficiencies'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-operations',
        name: 'Optimize Grid Operations',
        type: 'decide',
        agent: 'optimization',
        service: 'smart-grid-management',
        action: 'optimizeOperations',
        parameters: {
          objectives: ['minimize_losses', 'maximize_reliability', 'balance_load'],
          constraints: ['capacity', 'voltage_limits', 'maintenance_schedule']
        },
        outputs: ['optimizationPlan', 'expectedImprovements'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-changes',
        name: 'Implement Grid Changes',
        type: 'execute',
        agent: 'response',
        service: 'smart-grid-management',
        action: 'implementChanges',
        humanApprovalRequired: false,
        parameters: {
          automationLevel: 'high',
          safetyChecks: true,
          rollbackEnabled: true
        },
        outputs: ['implementationStatus', 'gridConfiguration'],
        errorHandling: {
          notification: {
            recipients: ['grid-control@energy.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'verify-stability',
        name: 'Verify Grid Stability',
        type: 'verify',
        agent: 'monitoring',
        service: 'smart-grid-management',
        action: 'verifyStability',
        parameters: {
          stabilityMetrics: ['frequency', 'voltage', 'phase_balance'],
          alertThresholds: true
        },
        outputs: ['stabilityReport', 'alerts'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['smart-grid-management', 'notification', 'scada-integration'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'critical',
      compliance: ['NERC CIP', 'IEEE Standards'],
      tags: ['energy', 'smart-grid', 'optimization', 'reliability']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Healthcare - Population Health Management
  {
    id: 'population-health-workflow',
    useCaseId: 'population-health-management',
    name: 'Population Health Management Workflow',
    description: 'Manage and improve health outcomes for patient populations',
    industry: 'healthcare',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 0 * * 1' // Weekly on Monday
      },
      {
        type: 'event',
        event: 'health.trend.alert'
      }
    ],
    steps: [
      {
        id: 'aggregate-health-data',
        name: 'Aggregate Population Health Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'population-health-management',
        action: 'aggregateHealthData',
        parameters: {
          dataSources: ['ehr', 'claims', 'registries', 'social_determinants'],
          populationSegments: true
        },
        outputs: ['populationData', 'healthMetrics'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'identify-risks',
        name: 'Identify Population Health Risks',
        type: 'analyze',
        agent: 'analysis',
        service: 'population-health-management',
        action: 'identifyRisks',
        parameters: {
          riskFactors: ['chronic_conditions', 'social_factors', 'environmental', 'behavioral'],
          stratification: true
        },
        outputs: ['riskAnalysis', 'highRiskGroups'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'develop-interventions',
        name: 'Develop Health Interventions',
        type: 'decide',
        agent: 'optimization',
        service: 'population-health-management',
        action: 'developInterventions',
        parameters: {
          interventionTypes: ['preventive_care', 'care_coordination', 'education', 'outreach'],
          evidenceBased: true
        },
        outputs: ['interventionPlan', 'expectedOutcomes'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-programs',
        name: 'Implement Health Programs',
        type: 'execute',
        agent: 'response',
        service: 'population-health-management',
        action: 'implementPrograms',
        humanApprovalRequired: true,
        parameters: {
          programDeployment: true,
          providerEngagement: true,
          patientEnrollment: true
        },
        outputs: ['programStatus', 'enrollment'],
        errorHandling: {
          notification: {
            recipients: ['population-health@healthcare.org'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'measure-outcomes',
        name: 'Measure Health Outcomes',
        type: 'report',
        agent: 'monitoring',
        service: 'population-health-management',
        action: 'measureOutcomes',
        parameters: {
          outcomeMetrics: ['clinical', 'quality', 'cost', 'satisfaction'],
          benchmarking: true
        },
        outputs: ['outcomeReport', 'improvements'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['population-health-management', 'notification', 'analytics'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 600000,
      criticality: 'high',
      compliance: ['HIPAA', 'HEDIS', 'Value-Based Care'],
      tags: ['healthcare', 'population-health', 'prevention', 'outcomes']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Finance - Regulatory Reporting
  {
    id: 'regulatory-reporting-workflow',
    useCaseId: 'regulatory-reporting-automation',
    name: 'Regulatory Reporting Automation Workflow',
    description: 'Automate financial regulatory reporting and compliance',
    industry: 'finance',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 0 1 * *' // Monthly on the 1st
      },
      {
        type: 'event',
        event: 'reporting.deadline.approaching'
      }
    ],
    steps: [
      {
        id: 'collect-financial-data',
        name: 'Collect Financial Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'regulatory-reporting-automation',
        action: 'collectFinancialData',
        parameters: {
          dataSources: ['general_ledger', 'trading_systems', 'risk_systems', 'subsidiaries'],
          reconciliation: true
        },
        outputs: ['financialData', 'dataQuality'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'validate-data',
        name: 'Validate Reporting Data',
        type: 'analyze',
        agent: 'integrity',
        service: 'regulatory-reporting-automation',
        action: 'validateData',
        parameters: {
          validationRules: ['completeness', 'accuracy', 'consistency', 'timeliness'],
          regulatoryRequirements: true
        },
        outputs: ['validationResults', 'discrepancies'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'generate-reports',
        name: 'Generate Regulatory Reports',
        type: 'decide',
        agent: 'compliance',
        service: 'regulatory-reporting-automation',
        action: 'generateReports',
        parameters: {
          reportTypes: ['basel_iii', 'mifid_ii', 'dodd_frank', 'fatca'],
          formats: ['xbrl', 'xml', 'pdf']
        },
        outputs: ['regulatoryReports', 'metadata'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'review-submission',
        name: 'Review and Submit Reports',
        type: 'execute',
        agent: 'response',
        service: 'regulatory-reporting-automation',
        action: 'reviewSubmission',
        humanApprovalRequired: true,
        parameters: {
          internalReview: true,
          signoffRequired: true,
          submissionChannels: ['regulatory_portal', 'secure_ftp']
        },
        outputs: ['submissionStatus', 'confirmations'],
        errorHandling: {
          notification: {
            recipients: ['regulatory-reporting@bank.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'track-compliance',
        name: 'Track Compliance Status',
        type: 'report',
        agent: 'compliance',
        service: 'regulatory-reporting-automation',
        action: 'trackCompliance',
        parameters: {
          complianceMetrics: ['timeliness', 'accuracy', 'completeness'],
          auditTrail: true
        },
        outputs: ['complianceReport', 'auditLog'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['regulatory-reporting-automation', 'notification', 'data-warehouse'],
      requiredAgents: ['monitoring', 'integrity', 'compliance', 'response'],
      estimatedDuration: 720000,
      criticality: 'critical',
      compliance: ['Basel III', 'MiFID II', 'Dodd-Frank', 'FATCA'],
      tags: ['finance', 'regulatory', 'reporting', 'compliance']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Manufacturing - Energy Efficiency
  {
    id: 'manufacturing-energy-efficiency-workflow',
    useCaseId: 'manufacturing-energy-efficiency',
    name: 'Manufacturing Energy Efficiency Workflow',
    description: 'Optimize energy consumption in manufacturing operations',
    industry: 'manufacturing',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 */2 * * *' // Every 2 hours
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'energy.consumption.rate',
          operator: '>',
          value: 1000
        }
      }
    ],
    steps: [
      {
        id: 'monitor-energy-usage',
        name: 'Monitor Energy Consumption',
        type: 'detect',
        agent: 'monitoring',
        service: 'manufacturing-energy-efficiency',
        action: 'monitorEnergyUsage',
        parameters: {
          meters: ['production_lines', 'hvac', 'lighting', 'compressed_air'],
          granularity: 'minute'
        },
        outputs: ['energyData', 'consumptionPatterns'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-efficiency',
        name: 'Analyze Energy Efficiency',
        type: 'analyze',
        agent: 'analysis',
        service: 'manufacturing-energy-efficiency',
        action: 'analyzeEfficiency',
        parameters: {
          benchmarks: ['industry_standards', 'historical_baseline', 'best_practices'],
          factorAnalysis: true
        },
        outputs: ['efficiencyAnalysis', 'wastageAreas'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'identify-savings',
        name: 'Identify Energy Savings Opportunities',
        type: 'decide',
        agent: 'optimization',
        service: 'manufacturing-energy-efficiency',
        action: 'identifySavings',
        parameters: {
          opportunities: ['process_optimization', 'equipment_upgrade', 'scheduling', 'behavioral'],
          roi_analysis: true
        },
        outputs: ['savingsOpportunities', 'implementationPlan'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-measures',
        name: 'Implement Efficiency Measures',
        type: 'execute',
        agent: 'response',
        service: 'manufacturing-energy-efficiency',
        action: 'implementMeasures',
        humanApprovalRequired: false,
        parameters: {
          measureTypes: ['automated_controls', 'process_adjustments', 'load_shifting'],
          monitoringEnabled: true
        },
        outputs: ['implementationStatus', 'energyReduction'],
        errorHandling: {
          notification: {
            recipients: ['energy-manager@manufacturing.com'],
            channels: ['email', 'slack']
          }
        }
      },
      {
        id: 'verify-savings',
        name: 'Verify Energy Savings',
        type: 'verify',
        agent: 'monitoring',
        service: 'manufacturing-energy-efficiency',
        action: 'verifySavings',
        parameters: {
          metrics: ['kwh_saved', 'cost_reduction', 'carbon_footprint'],
          reportingPeriod: 'monthly'
        },
        outputs: ['savingsReport', 'recommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['manufacturing-energy-efficiency', 'notification', 'energy-management'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 360000,
      criticality: 'medium',
      compliance: ['ISO 50001', 'Energy Star'],
      tags: ['manufacturing', 'energy', 'efficiency', 'sustainability']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default finalExtendedWorkflows;