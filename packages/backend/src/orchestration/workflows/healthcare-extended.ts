import { UseCaseWorkflow } from '../types/workflow.types';

const healthcareExtendedWorkflows: UseCaseWorkflow[] = [
  {
    id: 'telemedicine-workflow',
    useCaseId: 'telemedicine-optimization',
    name: 'Telemedicine Service Optimization Workflow',
    description: 'Optimize telemedicine services and patient engagement',
    industry: 'healthcare',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'appointment.scheduled'
      },
      {
        type: 'scheduled',
        schedule: '0 8 * * *' // Daily at 8 AM
      }
    ],
    steps: [
      {
        id: 'assess-patient-needs',
        name: 'Assess Patient Telemedicine Needs',
        type: 'detect',
        agent: 'monitoring',
        service: 'telemedicine-optimization',
        action: 'assessPatientNeeds',
        parameters: {
          factors: ['condition_type', 'technology_access', 'preference', 'urgency'],
          eligibilityCheck: true
        },
        outputs: ['patientAssessment', 'suitabilityScore'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'match-providers',
        name: 'Match Patients with Providers',
        type: 'analyze',
        agent: 'analysis',
        service: 'telemedicine-optimization',
        action: 'matchProviders',
        parameters: {
          matchingCriteria: ['specialty', 'availability', 'language', 'rating'],
          loadBalancing: true
        },
        outputs: ['providerMatches', 'appointmentSlots'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-scheduling',
        name: 'Optimize Appointment Scheduling',
        type: 'decide',
        agent: 'optimization',
        service: 'telemedicine-optimization',
        action: 'optimizeScheduling',
        parameters: {
          objectives: ['minimize_wait_time', 'maximize_utilization', 'patient_convenience'],
          constraints: ['provider_hours', 'technology_requirements']
        },
        outputs: ['optimizedSchedule', 'resourceAllocation'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'setup-session',
        name: 'Setup Telemedicine Session',
        type: 'execute',
        agent: 'response',
        service: 'telemedicine-optimization',
        action: 'setupSession',
        humanApprovalRequired: false,
        parameters: {
          platformSetup: true,
          techCheck: true,
          reminders: true
        },
        outputs: ['sessionDetails', 'accessLinks'],
        errorHandling: {
          notification: {
            recipients: ['telehealth-coordinator@hospital.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'monitor-quality',
        name: 'Monitor Session Quality',
        type: 'verify',
        agent: 'monitoring',
        service: 'telemedicine-optimization',
        action: 'monitorQuality',
        parameters: {
          metrics: ['connection_quality', 'patient_satisfaction', 'clinical_outcomes'],
          followUpRequired: true
        },
        outputs: ['qualityReport', 'improvements'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['telemedicine-optimization', 'notification', 'video-platform'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['HIPAA', 'Telehealth Regulations'],
      tags: ['healthcare', 'telemedicine', 'patient-care', 'optimization']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'medical-imaging-workflow',
    useCaseId: 'medical-imaging-analysis',
    name: 'Medical Imaging Analysis Workflow',
    description: 'AI-powered medical imaging analysis and diagnosis support',
    industry: 'healthcare',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'imaging.study.uploaded'
      }
    ],
    steps: [
      {
        id: 'preprocess-images',
        name: 'Preprocess Medical Images',
        type: 'detect',
        agent: 'monitoring',
        service: 'medical-imaging-analysis',
        action: 'preprocessImages',
        parameters: {
          imageTypes: ['xray', 'ct', 'mri', 'ultrasound'],
          enhancement: true,
          standardization: true
        },
        outputs: ['processedImages', 'metadata'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'detect-anomalies',
        name: 'Detect Anomalies in Images',
        type: 'analyze',
        agent: 'analysis',
        service: 'medical-imaging-analysis',
        action: 'detectAnomalies',
        parameters: {
          aiModels: ['deep_learning', 'computer_vision', 'ensemble'],
          sensitivityLevel: 'high'
        },
        outputs: ['anomalyDetection', 'confidenceScores'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'classify-findings',
        name: 'Classify Medical Findings',
        type: 'analyze',
        agent: 'prediction',
        service: 'medical-imaging-analysis',
        action: 'classifyFindings',
        parameters: {
          classificationScheme: 'icd10',
          severityGrading: true,
          differentialDiagnosis: true
        },
        outputs: ['classifications', 'differentials'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'generate-report',
        name: 'Generate Diagnostic Report',
        type: 'decide',
        agent: 'optimization',
        service: 'medical-imaging-analysis',
        action: 'generateReport',
        parameters: {
          reportFormat: 'structured',
          includeVisualizations: true,
          priorityFindings: true
        },
        outputs: ['diagnosticReport', 'recommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'notify-radiologist',
        name: 'Notify Radiologist for Review',
        type: 'execute',
        agent: 'response',
        service: 'medical-imaging-analysis',
        action: 'notifyRadiologist',
        humanApprovalRequired: true,
        parameters: {
          priorityRouting: true,
          includeAIFindings: true
        },
        conditions: [
          {
            field: 'context.confidenceScores.max',
            operator: '>',
            value: 0.85
          }
        ],
        outputs: ['notificationStatus', 'reviewAssignment'],
        errorHandling: {
          notification: {
            recipients: ['radiology-dept@hospital.com'],
            channels: ['email', 'slack']
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['medical-imaging-analysis', 'notification', 'pacs-integration'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 420000,
      criticality: 'critical',
      compliance: ['HIPAA', 'FDA', 'Medical Device Regulations'],
      tags: ['healthcare', 'medical-imaging', 'ai-diagnosis', 'radiology']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hospital-operations-workflow',
    useCaseId: 'hospital-operations-optimization',
    name: 'Hospital Operations Optimization Workflow',
    description: 'Optimize hospital operations and resource utilization',
    industry: 'healthcare',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 */4 * * *' // Every 4 hours
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'bed.occupancy.rate',
          operator: '>',
          value: 0.85
        }
      }
    ],
    steps: [
      {
        id: 'monitor-resources',
        name: 'Monitor Hospital Resources',
        type: 'detect',
        agent: 'monitoring',
        service: 'hospital-operations-optimization',
        action: 'monitorResources',
        parameters: {
          resources: ['beds', 'staff', 'equipment', 'supplies'],
          realTimeTracking: true
        },
        outputs: ['resourceStatus', 'utilization'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'predict-demand',
        name: 'Predict Resource Demand',
        type: 'analyze',
        agent: 'prediction',
        service: 'hospital-operations-optimization',
        action: 'predictDemand',
        parameters: {
          forecastWindow: '72h',
          factors: ['admissions', 'seasonality', 'local_events', 'epidemiology']
        },
        outputs: ['demandForecast', 'criticalPeriods'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-allocation',
        name: 'Optimize Resource Allocation',
        type: 'decide',
        agent: 'optimization',
        service: 'hospital-operations-optimization',
        action: 'optimizeAllocation',
        parameters: {
          objectives: ['minimize_wait_times', 'maximize_throughput', 'ensure_quality'],
          constraints: ['staff_ratios', 'equipment_availability', 'budget']
        },
        outputs: ['allocationPlan', 'staffSchedule'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-changes',
        name: 'Implement Operational Changes',
        type: 'execute',
        agent: 'response',
        service: 'hospital-operations-optimization',
        action: 'implementChanges',
        humanApprovalRequired: false,
        parameters: {
          changeTypes: ['staff_redeployment', 'bed_management', 'workflow_adjustment'],
          communicationPlan: true
        },
        outputs: ['implementationStatus', 'affectedDepartments'],
        errorHandling: {
          notification: {
            recipients: ['hospital-operations@hospital.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'measure-impact',
        name: 'Measure Operational Impact',
        type: 'report',
        agent: 'monitoring',
        service: 'hospital-operations-optimization',
        action: 'measureImpact',
        parameters: {
          kpis: ['patient_flow', 'length_of_stay', 'staff_satisfaction', 'cost_efficiency'],
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
      requiredServices: ['hospital-operations-optimization', 'notification', 'ehr-integration'],
      requiredAgents: ['monitoring', 'prediction', 'optimization', 'response'],
      estimatedDuration: 480000,
      criticality: 'high',
      compliance: ['Joint Commission', 'CMS', 'State Regulations'],
      tags: ['healthcare', 'hospital-operations', 'resource-management', 'optimization']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'medication-management-workflow',
    useCaseId: 'medication-management',
    name: 'Medication Management Workflow',
    description: 'Optimize medication dispensing and adherence monitoring',
    industry: 'healthcare',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'prescription.created'
      },
      {
        type: 'scheduled',
        schedule: '0 10 * * *' // Daily at 10 AM
      }
    ],
    steps: [
      {
        id: 'verify-prescription',
        name: 'Verify Prescription Details',
        type: 'detect',
        agent: 'integrity',
        service: 'medication-management',
        action: 'verifyPrescription',
        parameters: {
          checks: ['drug_interactions', 'allergies', 'dosage_appropriateness', 'insurance'],
          clinicalRules: true
        },
        outputs: ['verificationStatus', 'alerts'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'optimize-dispensing',
        name: 'Optimize Medication Dispensing',
        type: 'analyze',
        agent: 'optimization',
        service: 'medication-management',
        action: 'optimizeDispensing',
        parameters: {
          factors: ['inventory', 'patient_location', 'urgency', 'cost'],
          automationLevel: 'high'
        },
        outputs: ['dispensingPlan', 'alternatives'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'monitor-adherence',
        name: 'Monitor Medication Adherence',
        type: 'analyze',
        agent: 'monitoring',
        service: 'medication-management',
        action: 'monitorAdherence',
        parameters: {
          trackingMethods: ['smart_packaging', 'refill_data', 'patient_reported'],
          riskStratification: true
        },
        outputs: ['adherenceData', 'riskPatients'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'intervene-nonadherence',
        name: 'Intervene for Non-adherence',
        type: 'decide',
        agent: 'response',
        service: 'medication-management',
        action: 'interveneNonadherence',
        parameters: {
          interventionTypes: ['reminder', 'education', 'counseling', 'simplification'],
          personalizedApproach: true
        },
        outputs: ['interventionPlan', 'patientEngagement'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'report-outcomes',
        name: 'Report Medication Outcomes',
        type: 'report',
        agent: 'compliance',
        service: 'medication-management',
        action: 'reportOutcomes',
        parameters: {
          metrics: ['adherence_rate', 'clinical_outcomes', 'cost_savings'],
          regulatoryReporting: true
        },
        outputs: ['outcomeReport', 'qualityMetrics'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['medication-management', 'notification', 'pharmacy-system'],
      requiredAgents: ['integrity', 'optimization', 'monitoring', 'response', 'compliance'],
      estimatedDuration: 360000,
      criticality: 'high',
      compliance: ['FDA', 'DEA', 'State Pharmacy Laws'],
      tags: ['healthcare', 'medication', 'pharmacy', 'adherence']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default healthcareExtendedWorkflows;