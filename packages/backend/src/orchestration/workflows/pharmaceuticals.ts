import { UseCaseWorkflow } from '../types/workflow.types';

const pharmaceuticalsWorkflows: UseCaseWorkflow[] = [
  {
    id: 'drug-discovery-workflow',
    useCaseId: 'drug-discovery',
    name: 'AI-Powered Drug Discovery Workflow',
    description: 'Accelerate drug discovery through AI-driven molecular analysis',
    industry: 'pharmaceuticals',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'research.project.initiated'
      },
      {
        type: 'scheduled',
        schedule: '0 0 * * 1' // Weekly analysis
      }
    ],
    steps: [
      {
        id: 'collect-molecular-data',
        name: 'Collect Molecular Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'drug-discovery',
        action: 'collectMolecularData',
        parameters: {
          dataSources: ['protein_databases', 'chemical_libraries', 'clinical_trials'],
          targetProfiles: ['binding_affinity', 'toxicity', 'bioavailability']
        },
        outputs: ['molecularData', 'targetProteins'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-compounds',
        name: 'Analyze Chemical Compounds',
        type: 'analyze',
        agent: 'analysis',
        service: 'drug-discovery',
        action: 'analyzeCompounds',
        parameters: {
          analysisTypes: ['structure_activity', 'pharmacokinetics', 'drug_interactions'],
          aiModels: ['deep_learning', 'molecular_dynamics']
        },
        outputs: ['compoundAnalysis', 'candidateCompounds'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-efficacy',
        name: 'Predict Drug Efficacy',
        type: 'analyze',
        agent: 'prediction',
        service: 'drug-discovery',
        action: 'predictEfficacy',
        parameters: {
          predictionModels: ['qsar', 'machine_learning', 'molecular_docking'],
          validationDatasets: true
        },
        outputs: ['efficacyPredictions', 'confidenceScores'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-candidates',
        name: 'Optimize Drug Candidates',
        type: 'decide',
        agent: 'optimization',
        service: 'drug-discovery',
        action: 'optimizeCandidates',
        parameters: {
          optimizationCriteria: ['efficacy', 'safety', 'manufacturability'],
          constraints: ['patent_landscape', 'regulatory_requirements']
        },
        outputs: ['optimizedCandidates', 'recommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'initiate-testing',
        name: 'Initiate Preclinical Testing',
        type: 'execute',
        agent: 'response',
        service: 'drug-discovery',
        action: 'initiateTesting',
        humanApprovalRequired: true,
        parameters: {
          testingProtocols: ['in_vitro', 'in_silico', 'toxicology'],
          complianceChecks: true
        },
        conditions: [
          {
            field: 'context.confidenceScores.average',
            operator: '>',
            value: 0.8
          }
        ],
        outputs: ['testingInitiated', 'protocols'],
        errorHandling: {
          notification: {
            recipients: ['research-director@pharma.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'document-findings',
        name: 'Document Research Findings',
        type: 'report',
        agent: 'compliance',
        service: 'drug-discovery',
        action: 'documentFindings',
        parameters: {
          documentTypes: ['research_report', 'patent_filing', 'regulatory_submission'],
          auditTrail: true
        },
        outputs: ['documentation', 'filingStatus'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['drug-discovery', 'notification', 'compliance'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response', 'compliance'],
      estimatedDuration: 720000,
      criticality: 'high',
      compliance: ['FDA', 'GLP', 'ICH'],
      tags: ['pharmaceuticals', 'drug-discovery', 'ai', 'research']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'clinical-trial-workflow',
    useCaseId: 'clinical-trial-optimization',
    name: 'Clinical Trial Optimization Workflow',
    description: 'Optimize clinical trial design and patient recruitment',
    industry: 'pharmaceuticals',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'trial.phase.initiated'
      },
      {
        type: 'scheduled',
        schedule: '0 0 * * *' // Daily monitoring
      }
    ],
    steps: [
      {
        id: 'analyze-trial-design',
        name: 'Analyze Trial Design',
        type: 'detect',
        agent: 'analysis',
        service: 'clinical-trial-optimization',
        action: 'analyzeDesign',
        parameters: {
          designFactors: ['endpoints', 'sample_size', 'inclusion_criteria'],
          regulatoryRequirements: true
        },
        outputs: ['designAnalysis', 'optimizationOpportunities'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'identify-patient-cohorts',
        name: 'Identify Patient Cohorts',
        type: 'analyze',
        agent: 'analysis',
        service: 'clinical-trial-optimization',
        action: 'identifyCohorts',
        parameters: {
          dataSource: ['ehr', 'claims', 'registries'],
          matchingCriteria: ['demographics', 'medical_history', 'biomarkers']
        },
        outputs: ['eligiblePatients', 'cohortProfiles'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-enrollment',
        name: 'Predict Enrollment Success',
        type: 'analyze',
        agent: 'prediction',
        service: 'clinical-trial-optimization',
        action: 'predictEnrollment',
        parameters: {
          factors: ['site_performance', 'patient_availability', 'competition'],
          timelineProjection: true
        },
        outputs: ['enrollmentPrediction', 'riskFactors'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-recruitment',
        name: 'Optimize Recruitment Strategy',
        type: 'decide',
        agent: 'optimization',
        service: 'clinical-trial-optimization',
        action: 'optimizeRecruitment',
        parameters: {
          strategies: ['site_selection', 'patient_outreach', 'protocol_amendments'],
          budgetConstraints: true
        },
        outputs: ['recruitmentPlan', 'siteAllocations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-recruitment',
        name: 'Implement Recruitment Plan',
        type: 'execute',
        agent: 'response',
        service: 'clinical-trial-optimization',
        action: 'implementRecruitment',
        humanApprovalRequired: true,
        parameters: {
          activateSites: true,
          patientEngagement: true,
          monitoringEnabled: true
        },
        outputs: ['implementationStatus', 'enrollmentMetrics'],
        errorHandling: {
          notification: {
            recipients: ['clinical-operations@pharma.com'],
            channels: ['email', 'slack']
          }
        }
      },
      {
        id: 'monitor-trial-progress',
        name: 'Monitor Trial Progress',
        type: 'verify',
        agent: 'monitoring',
        service: 'clinical-trial-optimization',
        action: 'monitorProgress',
        parameters: {
          metrics: ['enrollment_rate', 'retention', 'protocol_deviations'],
          realTimeAlerts: true
        },
        outputs: ['progressReport', 'alerts'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['clinical-trial-optimization', 'notification', 'patient-data'],
      requiredAgents: ['analysis', 'prediction', 'optimization', 'response', 'monitoring'],
      estimatedDuration: 480000,
      criticality: 'high',
      compliance: ['GCP', 'FDA', 'HIPAA'],
      tags: ['pharmaceuticals', 'clinical-trials', 'optimization', 'recruitment']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'supply-chain-pharma-workflow',
    useCaseId: 'pharma-supply-chain',
    name: 'Pharmaceutical Supply Chain Workflow',
    description: 'Ensure drug supply chain integrity and prevent counterfeiting',
    industry: 'pharmaceuticals',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'shipment.initiated'
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'temperature.deviation',
          operator: '>',
          value: 2
        }
      }
    ],
    steps: [
      {
        id: 'track-shipment',
        name: 'Track Drug Shipment',
        type: 'detect',
        agent: 'monitoring',
        service: 'pharma-supply-chain',
        action: 'trackShipment',
        parameters: {
          trackingMethods: ['blockchain', 'iot_sensors', 'serialization'],
          monitorConditions: ['temperature', 'humidity', 'location']
        },
        outputs: ['shipmentStatus', 'conditionData'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'verify-authenticity',
        name: 'Verify Drug Authenticity',
        type: 'analyze',
        agent: 'security',
        service: 'pharma-supply-chain',
        action: 'verifyAuthenticity',
        parameters: {
          verificationMethods: ['serial_number', 'blockchain_record', 'packaging_analysis'],
          crossReference: true
        },
        outputs: ['authenticityStatus', 'suspiciousIndicators'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'assess-quality',
        name: 'Assess Product Quality',
        type: 'analyze',
        agent: 'integrity',
        service: 'pharma-supply-chain',
        action: 'assessQuality',
        parameters: {
          qualityChecks: ['temperature_excursions', 'handling_compliance', 'expiry_dates'],
          riskAssessment: true
        },
        outputs: ['qualityAssessment', 'riskLevel'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'determine-disposition',
        name: 'Determine Product Disposition',
        type: 'decide',
        agent: 'compliance',
        service: 'pharma-supply-chain',
        action: 'determineDisposition',
        parameters: {
          dispositionOptions: ['release', 'quarantine', 'reject', 'investigate'],
          regulatoryCompliance: true
        },
        outputs: ['disposition', 'complianceStatus'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'execute-disposition',
        name: 'Execute Disposition Decision',
        type: 'execute',
        agent: 'response',
        service: 'pharma-supply-chain',
        action: 'executeDisposition',
        humanApprovalRequired: true,
        parameters: {
          updateSystems: ['inventory', 'quality', 'regulatory'],
          notifyStakeholders: true
        },
        conditions: [
          {
            field: 'context.riskLevel',
            operator: '>',
            value: 'medium'
          }
        ],
        outputs: ['executionStatus', 'notifications'],
        errorHandling: {
          notification: {
            recipients: ['quality-assurance@pharma.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'update-chain-records',
        name: 'Update Supply Chain Records',
        type: 'report',
        agent: 'compliance',
        service: 'pharma-supply-chain',
        action: 'updateRecords',
        parameters: {
          recordTypes: ['blockchain', 'regulatory', 'quality'],
          auditTrail: true
        },
        outputs: ['recordsUpdated', 'complianceReport'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['pharma-supply-chain', 'notification', 'blockchain'],
      requiredAgents: ['monitoring', 'security', 'integrity', 'compliance', 'response'],
      estimatedDuration: 360000,
      criticality: 'critical',
      compliance: ['DSCSA', 'GDP', 'FDA'],
      tags: ['pharmaceuticals', 'supply-chain', 'authentication', 'quality']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default pharmaceuticalsWorkflows;