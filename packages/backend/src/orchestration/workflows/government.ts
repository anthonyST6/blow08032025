import { UseCaseWorkflow } from '../types/workflow.types';

const governmentWorkflows: UseCaseWorkflow[] = [
  {
    id: 'citizen-services-workflow',
    useCaseId: 'citizen-services',
    name: 'Digital Citizen Services Workflow',
    description: 'Streamline government services and citizen interactions',
    industry: 'government',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'service.request.submitted'
      },
      {
        type: 'scheduled',
        schedule: '0 */4 * * *' // Every 4 hours
      }
    ],
    steps: [
      {
        id: 'receive-request',
        name: 'Receive Service Request',
        type: 'detect',
        agent: 'monitoring',
        service: 'citizen-services',
        action: 'receiveRequest',
        parameters: {
          channels: ['portal', 'mobile', 'kiosk', 'call_center'],
          requestTypes: ['permits', 'licenses', 'benefits', 'information']
        },
        outputs: ['serviceRequest', 'citizenProfile'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'validate-request',
        name: 'Validate Request and Documents',
        type: 'analyze',
        agent: 'integrity',
        service: 'citizen-services',
        action: 'validateRequest',
        parameters: {
          validationChecks: ['identity', 'eligibility', 'documentation', 'completeness'],
          crossReferenceData: true
        },
        outputs: ['validationStatus', 'missingRequirements'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'assess-complexity',
        name: 'Assess Request Complexity',
        type: 'analyze',
        agent: 'analysis',
        service: 'citizen-services',
        action: 'assessComplexity',
        parameters: {
          factors: ['department_involvement', 'approval_levels', 'processing_time'],
          routingRules: true
        },
        outputs: ['complexityScore', 'routingDecision'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'route-request',
        name: 'Route to Appropriate Department',
        type: 'decide',
        agent: 'optimization',
        service: 'citizen-services',
        action: 'routeRequest',
        parameters: {
          routingCriteria: ['expertise', 'workload', 'priority', 'sla'],
          loadBalancing: true
        },
        outputs: ['assignedDepartment', 'expectedTimeline'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'process-request',
        name: 'Process Service Request',
        type: 'execute',
        agent: 'response',
        service: 'citizen-services',
        action: 'processRequest',
        humanApprovalRequired: false,
        parameters: {
          automatedProcessing: true,
          updateCitizen: true,
          trackProgress: true
        },
        conditions: [
          {
            field: 'context.complexityScore',
            operator: '<',
            value: 0.7
          }
        ],
        outputs: ['processingStatus', 'deliverables'],
        errorHandling: {
          notification: {
            recipients: ['service-manager@gov.org'],
            channels: ['email']
          }
        }
      },
      {
        id: 'deliver-service',
        name: 'Deliver Service to Citizen',
        type: 'report',
        agent: 'response',
        service: 'citizen-services',
        action: 'deliverService',
        parameters: {
          deliveryChannels: ['digital', 'mail', 'in_person'],
          notificationEnabled: true,
          satisfactionSurvey: true
        },
        outputs: ['deliveryConfirmation', 'citizenFeedback'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['citizen-services', 'notification', 'identity-verification'],
      requiredAgents: ['monitoring', 'integrity', 'analysis', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['Privacy Act', 'ADA', 'FOIA'],
      tags: ['government', 'citizen-services', 'digital', 'automation']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'public-safety-workflow',
    useCaseId: 'public-safety-analytics',
    name: 'Public Safety Analytics Workflow',
    description: 'Analyze and predict public safety incidents for proactive response',
    industry: 'government',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'incident.reported'
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'crime.rate.increase',
          operator: '>',
          value: 15
        }
      }
    ],
    steps: [
      {
        id: 'collect-safety-data',
        name: 'Collect Public Safety Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'public-safety-analytics',
        action: 'collectSafetyData',
        parameters: {
          dataSources: ['911_calls', 'crime_reports', 'sensors', 'social_media'],
          realTimeStreaming: true
        },
        outputs: ['incidentData', 'patterns'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-threats',
        name: 'Analyze Threat Patterns',
        type: 'analyze',
        agent: 'analysis',
        service: 'public-safety-analytics',
        action: 'analyzeThreats',
        parameters: {
          analysisTypes: ['spatial', 'temporal', 'behavioral', 'network'],
          historicalComparison: true
        },
        outputs: ['threatAnalysis', 'hotspots'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-incidents',
        name: 'Predict Future Incidents',
        type: 'analyze',
        agent: 'prediction',
        service: 'public-safety-analytics',
        action: 'predictIncidents',
        parameters: {
          predictionModels: ['machine_learning', 'statistical', 'geospatial'],
          timeHorizon: '72h'
        },
        outputs: ['predictions', 'riskScores'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'allocate-resources',
        name: 'Optimize Resource Allocation',
        type: 'decide',
        agent: 'optimization',
        service: 'public-safety-analytics',
        action: 'allocateResources',
        parameters: {
          resourceTypes: ['patrol_units', 'emergency_services', 'surveillance'],
          optimizationGoals: ['coverage', 'response_time', 'prevention']
        },
        outputs: ['allocationPlan', 'deploymentOrders'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'deploy-resources',
        name: 'Deploy Safety Resources',
        type: 'execute',
        agent: 'response',
        service: 'public-safety-analytics',
        action: 'deployResources',
        humanApprovalRequired: true,
        parameters: {
          coordinationEnabled: true,
          realTimeTracking: true,
          communicationChannels: ['dispatch', 'mobile', 'command_center']
        },
        conditions: [
          {
            field: 'context.riskScores.max',
            operator: '>',
            value: 0.75
          }
        ],
        outputs: ['deploymentStatus', 'unitLocations'],
        errorHandling: {
          notification: {
            recipients: ['public-safety-director@gov.org'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'monitor-effectiveness',
        name: 'Monitor Response Effectiveness',
        type: 'verify',
        agent: 'monitoring',
        service: 'public-safety-analytics',
        action: 'monitorEffectiveness',
        parameters: {
          metrics: ['response_time', 'incident_resolution', 'prevention_rate'],
          dashboardUpdate: true
        },
        outputs: ['effectivenessReport', 'recommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['public-safety-analytics', 'notification', 'dispatch'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 420000,
      criticality: 'critical',
      compliance: ['CJIS', 'Privacy Laws'],
      tags: ['government', 'public-safety', 'analytics', 'prediction']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'regulatory-compliance-workflow',
    useCaseId: 'regulatory-compliance-monitoring',
    name: 'Regulatory Compliance Monitoring Workflow',
    description: 'Monitor and ensure compliance with government regulations',
    industry: 'government',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 0 * * *' // Daily
      },
      {
        type: 'event',
        event: 'regulation.update'
      }
    ],
    steps: [
      {
        id: 'scan-regulations',
        name: 'Scan for Regulatory Updates',
        type: 'detect',
        agent: 'monitoring',
        service: 'regulatory-compliance-monitoring',
        action: 'scanRegulations',
        parameters: {
          sources: ['federal_register', 'state_databases', 'local_ordinances'],
          trackChanges: true
        },
        outputs: ['regulatoryUpdates', 'impactedAreas'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'assess-compliance',
        name: 'Assess Current Compliance Status',
        type: 'analyze',
        agent: 'compliance',
        service: 'regulatory-compliance-monitoring',
        action: 'assessCompliance',
        parameters: {
          complianceAreas: ['data_privacy', 'environmental', 'financial', 'operational'],
          gapAnalysis: true
        },
        outputs: ['complianceStatus', 'gaps'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'identify-risks',
        name: 'Identify Compliance Risks',
        type: 'analyze',
        agent: 'analysis',
        service: 'regulatory-compliance-monitoring',
        action: 'identifyRisks',
        parameters: {
          riskFactors: ['penalties', 'operational_impact', 'reputation'],
          prioritization: true
        },
        outputs: ['riskAssessment', 'priorities'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'develop-remediation',
        name: 'Develop Remediation Plan',
        type: 'decide',
        agent: 'optimization',
        service: 'regulatory-compliance-monitoring',
        action: 'developRemediation',
        parameters: {
          remediationTypes: ['policy_update', 'process_change', 'training', 'technology'],
          costBenefitAnalysis: true
        },
        outputs: ['remediationPlan', 'timeline'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-remediation',
        name: 'Implement Compliance Measures',
        type: 'execute',
        agent: 'response',
        service: 'regulatory-compliance-monitoring',
        action: 'implementRemediation',
        humanApprovalRequired: true,
        parameters: {
          implementationPhases: ['immediate', 'short_term', 'long_term'],
          trackingEnabled: true
        },
        outputs: ['implementationStatus', 'milestones'],
        errorHandling: {
          notification: {
            recipients: ['compliance-officer@gov.org'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'audit-compliance',
        name: 'Audit Compliance Implementation',
        type: 'report',
        agent: 'compliance',
        service: 'regulatory-compliance-monitoring',
        action: 'auditCompliance',
        parameters: {
          auditTypes: ['internal', 'documentation', 'process'],
          reportGeneration: true
        },
        outputs: ['auditReport', 'certifications'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['regulatory-compliance-monitoring', 'notification', 'document-management'],
      requiredAgents: ['monitoring', 'compliance', 'analysis', 'optimization', 'response'],
      estimatedDuration: 540000,
      criticality: 'high',
      compliance: ['Multiple Regulatory Frameworks'],
      tags: ['government', 'compliance', 'regulatory', 'monitoring']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default governmentWorkflows;