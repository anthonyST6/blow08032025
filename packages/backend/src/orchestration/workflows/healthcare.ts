import { WorkflowDefinition } from '../types/workflow.types';
import { v4 as uuidv4 } from 'uuid';

export const workflows: WorkflowDefinition[] = [
  // Patient Risk Stratification
  {
    useCaseId: 'patient-risk',
    workflow: {
      id: uuidv4(),
      useCaseId: 'patient-risk',
      name: 'Patient Risk Stratification',
      description: 'Analyze patient data to identify high-risk individuals and coordinate care interventions',
      industry: 'healthcare',
      version: '1.0.0',
      steps: [
        {
          id: 'collect-patient-data',
          name: 'Collect Patient Data',
          type: 'detect',
          agent: 'Security Vanguard',
          service: 'patient-risk',
          action: 'collectPatientData',
          parameters: {
            dataSource: 'EHR',
            includeHistory: true,
            hipaaCompliant: true
          },
          outputs: ['patientData', 'dataQuality'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'analyze-risk-factors',
          name: 'Analyze Risk Factors',
          type: 'analyze',
          agent: 'Integrity Vanguard',
          service: 'patient-risk',
          action: 'analyzeRiskFactors',
          parameters: {
            models: ['chronic-disease', 'readmission', 'mortality'],
            includeSDOH: true
          },
          outputs: ['riskFactors', 'riskScore'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'stratify-risk',
          name: 'Stratify Patient Risk',
          type: 'decide',
          agent: 'Accuracy Vanguard',
          service: 'patient-risk',
          action: 'stratifyRisk',
          parameters: {
            categories: ['low', 'medium', 'high', 'critical']
          },
          outputs: ['riskCategory', 'interventionNeeded'],
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'coordinate-care',
          name: 'Coordinate Care Plan',
          type: 'execute',
          agent: 'Optimization Vanguard',
          service: 'patient-risk',
          action: 'coordinateCare',
          parameters: {
            personalizedPlan: true,
            multidisciplinary: true
          },
          outputs: ['carePlan', 'assignments'],
          humanApprovalRequired: false,
          errorHandling: {
            notification: {
              channels: ['email'],
              recipients: ['care-team@hospital.com']
            }
          }
        },
        {
          id: 'monitor-outcomes',
          name: 'Monitor Patient Outcomes',
          type: 'verify',
          agent: 'Response Vanguard',
          service: 'patient-risk',
          action: 'monitorOutcomes',
          parameters: {
            metricsTracked: ['adherence', 'clinical', 'satisfaction']
          },
          outputs: ['outcomeMetrics', 'adjustmentsNeeded'],
          errorHandling: {
            retry: { attempts: 2, delay: 10000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate Risk Report',
          type: 'report',
          agent: 'Compliance Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'patient-risk-stratification',
            includeMetrics: true
          },
          outputs: ['reportId', 'reportUrl'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '0 6 * * *' // Daily at 6 AM
        },
        {
          type: 'event',
          event: 'patient.admission'
        }
      ],
      metadata: {
        requiredServices: ['patient-risk', 'unified-reports', 'notification'],
        requiredAgents: [
          'Security Vanguard',
          'Integrity Vanguard',
          'Accuracy Vanguard',
          'Optimization Vanguard',
          'Response Vanguard',
          'Compliance Vanguard'
        ],
        estimatedDuration: 1800000, // 30 minutes
        criticality: 'high',
        tags: ['patient-safety', 'risk-management', 'care-coordination'],
        compliance: ['HIPAA', 'CMS', 'Joint Commission']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];