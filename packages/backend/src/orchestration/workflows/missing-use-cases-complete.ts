import { WorkflowDefinition } from '../types/workflow.types';
import { v4 as uuidv4 } from 'uuid';

export const workflows: WorkflowDefinition[] = [
  // Energy & Utilities - Missing Use Cases
  {
    useCaseId: 'oilfield-lease',
    workflow: {
      id: uuidv4(),
      useCaseId: 'oilfield-lease',
      name: 'Oilfield Land Lease Management',
      description: 'Automated lease tracking, renewal management, and compliance monitoring for oil & gas operations',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'detect-expiring-leases',
          name: 'Detect Expiring Leases',
          type: 'detect',
          agent: 'Lease Monitoring Vanguard',
          service: 'lease-monitoring',
          action: 'scanExpiringLeases',
          parameters: {
            advanceNoticeDays: 365,
            includeOptions: true
          },
          outputs: ['expiringLeases', 'criticalLeases'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'analyze-lease-value',
          name: 'Analyze Lease Strategic Value',
          type: 'analyze',
          agent: 'Lease Analytics Vanguard',
          service: 'lease-analytics',
          action: 'assessStrategicValue',
          parameters: {
            productionData: true,
            marketConditions: true
          },
          conditions: [
            {
              field: 'detect-expiring-leases.expiringLeases',
              operator: 'exists',
              value: true
            }
          ],
          outputs: ['leaseAssessments'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'decide-renewal-strategy',
          name: 'Determine Renewal Strategy',
          type: 'decide',
          agent: 'Lease Strategy Vanguard',
          service: 'lease-strategy',
          action: 'determineRenewalApproach',
          parameters: {
            optimizationGoals: ['maximizeROI', 'minimizeRisk']
          },
          outputs: ['renewalDecisions'],
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'execute-renewals',
          name: 'Execute Lease Renewals',
          type: 'execute',
          agent: 'Lease Execution Vanguard',
          service: 'lease-execution',
          action: 'processRenewals',
          parameters: {
            generateDocuments: true,
            notifyStakeholders: true
          },
          outputs: ['executionResults'],
          humanApprovalRequired: true,
          errorHandling: {
            notification: {
              channels: ['email'],
              recipients: ['lease-management@company.com']
            }
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '0 6 * * *'
        },
        {
          type: 'event',
          event: 'lease.expiration.approaching'
        }
      ],
      metadata: {
        requiredServices: ['lease-monitoring', 'lease-analytics', 'lease-strategy', 'lease-execution'],
        requiredAgents: ['Lease Monitoring Vanguard', 'Lease Analytics Vanguard', 'Lease Strategy Vanguard', 'Lease Execution Vanguard'],
        estimatedDuration: 300000,
        criticality: 'high',
        compliance: ['SOX', 'SEC'],
        tags: ['lease-management', 'compliance', 'automation']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    useCaseId: 'grid-anomaly',
    workflow: {
      id: uuidv4(),
      useCaseId: 'grid-anomaly',
      name: 'Grid Anomaly Detection',
      description: 'Real-time detection and response to electrical grid anomalies',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-grid',
          name: 'Monitor Grid Telemetry',
          type: 'detect',
          agent: 'Grid Monitoring Vanguard',
          service: 'grid-anomaly',
          action: 'monitorGridHealth',
          parameters: {
            sensors: ['voltage', 'frequency', 'load'],
            threshold: 0.95
          },
          outputs: ['anomalies', 'gridStatus'],
          errorHandling: {
            retry: { attempts: 5, delay: 1000 }
          }
        },
        {
          id: 'analyze-anomalies',
          name: 'Analyze Anomaly Patterns',
          type: 'analyze',
          agent: 'Grid Analysis Vanguard',
          service: 'grid-anomaly',
          action: 'analyzeAnomalies',
          parameters: {
            includeWeather: true,
            historicalContext: true
          },
          conditions: [
            {
              field: 'monitor-grid.anomalies',
              operator: 'exists',
              value: true
            }
          ],
          outputs: ['anomalyAnalysis', 'riskAssessment'],
          errorHandling: {
            retry: { attempts: 2, delay: 2000 }
          }
        },
        {
          id: 'predict-failures',
          name: 'Predict Cascade Failures',
          type: 'analyze',
          agent: 'Grid Prediction Vanguard',
          service: 'grid-anomaly',
          action: 'predictCascadeRisk',
          parameters: {
            timeHorizon: 240,
            confidenceThreshold: 0.85
          },
          outputs: ['failurePredictions'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'decide-response',
          name: 'Determine Response Actions',
          type: 'decide',
          agent: 'Grid Response Vanguard',
          service: 'grid-anomaly',
          action: 'determineResponse',
          parameters: {
            responseProtocols: ['immediate', 'preventive', 'monitoring']
          },
          outputs: ['responseActions'],
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'execute-response',
          name: 'Execute Grid Response',
          type: 'execute',
          agent: 'Grid Automation Vanguard',
          service: 'grid-anomaly',
          action: 'executeResponse',
          parameters: {
            autoReroute: true,
            notifyOperators: true
          },
          outputs: ['responseResults'],
          errorHandling: {
            notification: {
              channels: ['email', 'teams'],
              recipients: ['grid-operations@company.com']
            }
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'grid.anomaly.detected'
        },
        {
          type: 'threshold',
          threshold: {
            metric: 'grid.stability.index',
            operator: '<',
            value: 0.95
          }
        }
      ],
      metadata: {
        requiredServices: ['grid-anomaly'],
        requiredAgents: ['Grid Monitoring Vanguard', 'Grid Analysis Vanguard', 'Grid Prediction Vanguard', 'Grid Response Vanguard', 'Grid Automation Vanguard'],
        estimatedDuration: 2000,
        criticality: 'critical',
        compliance: ['NERC-CIP', 'FERC'],
        tags: ['grid-stability', 'anomaly-detection', 'real-time']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    useCaseId: 'renewable-optimization',
    workflow: {
      id: uuidv4(),
      useCaseId: 'renewable-optimization',
      name: 'Renewable Energy Optimization',
      description: 'Optimize renewable energy generation and storage',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'forecast-generation',
          name: 'Forecast Renewable Generation',
          type: 'analyze',
          agent: 'Renewable Forecasting Vanguard',
          service: 'renewable-optimization',
          action: 'forecastGeneration',
          parameters: {
            sources: ['solar', 'wind'],
            horizon: 168
          },
          outputs: ['generationForecast'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'optimize-dispatch',
          name: 'Optimize Energy Dispatch',
          type: 'decide',
          agent: 'Dispatch Optimization Vanguard',
          service: 'renewable-optimization',
          action: 'optimizeDispatch',
          parameters: {
            includeBattery: true,
            marketPrices: true
          },
          outputs: ['dispatchPlan'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'execute-dispatch',
          name: 'Execute Dispatch Plan',
          type: 'execute',
          agent: 'Dispatch Execution Vanguard',
          service: 'renewable-optimization',
          action: 'executeDispatch',
          parameters: {
            realTimeAdjustment: true
          },
          outputs: ['dispatchResults'],
          errorHandling: {
            notification: {
              channels: ['email'],
              recipients: ['renewable-ops@company.com']
            }
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '*/15 * * * *'
        }
      ],
      metadata: {
        requiredServices: ['renewable-optimization'],
        requiredAgents: ['Renewable Forecasting Vanguard', 'Dispatch Optimization Vanguard', 'Dispatch Execution Vanguard'],
        estimatedDuration: 60000,
        criticality: 'high',
        compliance: ['ISO-14001'],
        tags: ['renewable', 'optimization', 'dispatch']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    useCaseId: 'drilling-risk',
    workflow: {
      id: uuidv4(),
      useCaseId: 'drilling-risk',
      name: 'Drilling Risk Assessment',
      description: 'Real-time drilling risk assessment and mitigation',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-drilling',
          name: 'Monitor Drilling Parameters',
          type: 'detect',
          agent: 'Drilling Monitor Vanguard',
          service: 'drilling-risk',
          action: 'monitorDrillingData',
          parameters: {
            sensors: ['pressure', 'torque', 'vibration', 'temperature'],
            frequency: 1000
          },
          outputs: ['drillingData', 'anomalies'],
          errorHandling: {
            retry: { attempts: 5, delay: 500 }
          }
        },
        {
          id: 'assess-risk',
          name: 'Assess Drilling Risk',
          type: 'analyze',
          agent: 'Risk Assessment Vanguard',
          service: 'drilling-risk',
          action: 'assessRisk',
          parameters: {
            models: ['stuckPipe', 'blowout', 'lostCirculation']
          },
          conditions: [
            {
              field: 'monitor-drilling.anomalies',
              operator: 'exists',
              value: true
            }
          ],
          outputs: ['riskAssessment'],
          errorHandling: {
            retry: { attempts: 2, delay: 1000 }
          }
        },
        {
          id: 'execute-mitigation',
          name: 'Execute Risk Mitigation',
          type: 'execute',
          agent: 'Mitigation Execution Vanguard',
          service: 'drilling-risk',
          action: 'executeMitigation',
          parameters: {
            autoShutoff: true,
            notifyRig: true
          },
          conditions: [
            {
              field: 'assess-risk.riskAssessment.level',
              operator: '>',
              value: 'medium'
            }
          ],
          outputs: ['mitigationResults'],
          errorHandling: {
            escalate: true,
            notification: {
              channels: ['email', 'teams'],
              recipients: ['drilling-safety@company.com']
            }
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'drilling.anomaly.detected'
        }
      ],
      metadata: {
        requiredServices: ['drilling-risk'],
        requiredAgents: ['Drilling Monitor Vanguard', 'Risk Assessment Vanguard', 'Mitigation Execution Vanguard'],
        estimatedDuration: 5000,
        criticality: 'critical',
        compliance: ['API', 'IADC'],
        tags: ['drilling', 'risk', 'safety']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    useCaseId: 'environmental-compliance',
    workflow: {
      id: uuidv4(),
      useCaseId: 'environmental-compliance',
      name: 'Environmental Compliance Monitoring',
      description: 'Automated environmental compliance monitoring and reporting',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-emissions',
          name: 'Monitor Environmental Parameters',
          type: 'detect',
          agent: 'Environmental Monitor Vanguard',
          service: 'environmental-monitoring',
          action: 'monitorEmissions',
          parameters: {
            pollutants: ['methane', 'CO2', 'NOx', 'SOx'],
            continuous: true
          },
          outputs: ['emissionsData', 'violations'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'assess-compliance',
          name: 'Assess Compliance Status',
          type: 'analyze',
          agent: 'Compliance Assessment Vanguard',
          service: 'environmental-monitoring',
          action: 'assessCompliance',
          parameters: {
            regulations: ['EPA', 'state', 'local']
          },
          outputs: ['complianceStatus'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'generate-reports',
          name: 'Generate Compliance Reports',
          type: 'report',
          agent: 'Environmental Reporting Vanguard',
          service: 'environmental-monitoring',
          action: 'generateReports',
          parameters: {
            reportTypes: ['EPA', 'state', 'internal']
          },
          outputs: ['complianceReports'],
          errorHandling: {
            retry: { attempts: 3, delay: 10000 }
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '0 */6 * * *'
        },
        {
          type: 'event',
          event: 'emission.limit.exceeded'
        }
      ],
      metadata: {
        requiredServices: ['environmental-monitoring'],
        requiredAgents: ['Environmental Monitor Vanguard', 'Compliance Assessment Vanguard', 'Environmental Reporting Vanguard'],
        estimatedDuration: 180000,
        criticality: 'high',
        compliance: ['EPA', 'ISO-14001'],
        tags: ['environmental', 'compliance', 'emissions']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    useCaseId: 'load-forecasting',
    workflow: {
      id: uuidv4(),
      useCaseId: 'load-forecasting',
      name: 'Load Forecasting',
      description: 'AI-powered electrical load forecasting',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'collect-data',
          name: 'Collect Load Data',
          type: 'detect',
          agent: 'Load Data Collector Vanguard',
          service: 'load-forecasting',
          action: 'collectData',
          parameters: {
            sources: ['smartMeters', 'weather', 'calendar']
          },
          outputs: ['loadData'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'forecast-load',
          name: 'Forecast Load Demand',
          type: 'analyze',
          agent: 'Load Forecasting Vanguard',
          service: 'load-forecasting',
          action: 'forecastDemand',
          parameters: {
            horizons: [1, 24, 168],
            models: ['lstm', 'xgboost', 'ensemble']
          },
          outputs: ['loadForecast'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'optimize-generation',
          name: 'Optimize Generation Schedule',
          type: 'decide',
          agent: 'Generation Optimization Vanguard',
          service: 'load-forecasting',
          action: 'optimizeGeneration',
          parameters: {
            constraints: ['emissions', 'cost', 'reliability']
          },
          outputs: ['generationSchedule'],
          errorHandling: {
            escalate: true
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '*/15 * * * *'
        }
      ],
      metadata: {
        requiredServices: ['load-forecasting'],
        requiredAgents: ['Load Data Collector Vanguard', 'Load Forecasting Vanguard', 'Generation Optimization Vanguard'],
        estimatedDuration: 120000,
        criticality: 'high',
        compliance: ['NERC'],
        tags: ['forecasting', 'load', 'demand']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Healthcare - Missing Use Cases
  {
    useCaseId: 'clinical-trial-matching',
    workflow: {
      id: uuidv4(),
      useCaseId: 'clinical-trial-matching',
      name: 'Clinical Trial Matching',
      description: 'AI-powered patient matching for clinical trials',
      industry: 'healthcare',
      version: '1.0.0',
      steps: [
        {
          id: 'extract-criteria',
          name: 'Extract Trial Criteria',
          type: 'detect',
          agent: 'Trial Criteria Extractor Vanguard',
          service: 'trial-matching',
          action: 'extractCriteria',
          parameters: {
            sources: ['clinicaltrials.gov', 'sponsors']
          },
          outputs: ['trialCriteria'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'match-patients',
          name: 'Match Eligible Patients',
          type: 'analyze',
          agent: 'Patient Matching Vanguard',
          service: 'trial-matching',
          action: 'matchPatients',
          parameters: {
            includeEHR: true,
            includeGenomics: true
          },
          outputs: ['matchedPatients'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'notify-providers',
          name: 'Notify Healthcare Providers',
          type: 'execute',
          agent: 'Provider Notification Vanguard',
          service: 'trial-matching',
          action: 'notifyProviders',
          parameters: {
            notificationMethod: 'secure-message'
          },
          outputs: ['notifications'],
          errorHandling: {
            retry: { attempts: 2, delay: 10000 }
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'trial.criteria.updated'
        }
      ],
      metadata: {
        requiredServices: ['trial-matching'],
        requiredAgents: ['Trial Criteria Extractor Vanguard', 'Patient Matching Vanguard', 'Provider Notification Vanguard'],
        estimatedDuration: 300000,
        criticality: 'medium',
        compliance: ['HIPAA', 'GCP'],
        tags: ['clinical-trials', 'patient-matching']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    useCaseId: 'treatment-recommendation',
    workflow: {
      id: uuidv4(),
      useCaseId: 'treatment-recommendation',
      name: 'Treatment Recommendation Engine',
      description: 'AI-powered personalized treatment recommendations',
      industry: 'healthcare',
      version: '1.0.0',
      steps: [
        {
          id: 'analyze-patient',
          name: 'Analyze Patient Data',
          type: 'analyze',
          agent: 'Patient Analysis Vanguard',
          service: 'treatment-recommendation',
          action: 'analyzePatient',
          parameters: {
            includeHistory: true,
            includeGenetics: true
          },
          outputs: ['patientProfile'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'recommend-treatment',
          name: 'Generate Treatment Options',
          type: 'decide',
          agent: 'Treatment Recommendation Vanguard',
          service: 'treatment-recommendation',
          action: 'recommendTreatment',
          parameters: {
            evidenceBased: true,
            personalizedMedicine: true
          },
          outputs: ['treatmentOptions'],
          humanApprovalRequired: true,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'validate-recommendations',
          name: 'Validate Recommendations',
          type: 'verify',
          agent: 'Clinical Validation Vanguard',
          service: 'treatment-recommendation',
          action: 'validateRecommendations',
          parameters: {
            checkInteractions: true,
            checkContraindications: true
          },
          outputs: ['validatedTreatments'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'patient.diagnosis.new'
        }
      ],
      metadata: {
        requiredServices: ['treatment-recommendation'],
        requiredAgents: ['Patient Analysis Vanguard', 'Treatment Recommendation Vanguard', 'Clinical Validation Vanguard'],
        estimatedDuration: 180000,
        criticality: 'high',
        compliance: ['HIPAA', 'FDA'],
        tags: ['treatment', 'personalized-medicine']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    useCaseId: 'diagnosis-assistant',
    workflow: {
      id: uuidv4(),
      useCaseId: 'diagnosis-assistant',
      name: 'AI Diagnosis Assistant',
      description: 'AI-powered diagnostic support system',
      industry: 'healthcare',
      version: '1.0.0',
      steps: [
        {
          id: 'collect-symptoms',
          name: 'Collect Patient Symptoms',
          type: 'detect',
          agent: 'Symptom Collection Vanguard',
          service: 'diagnosis-assistant',
          action: 'collectSymptoms',
          parameters: {
            includeVitals: true
          },
          outputs: ['symptoms', 'vitals'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'analyze-data',
          name: 'Analyze Clinical Data',
          type: 'analyze',
          agent: 'Clinical Analysis Vanguard',
          service: 'diagnosis-assistant',
          action: 'analyzeData',
          parameters: {
            includeLabs: true,
            includeImaging: true
          },
          outputs: ['clinicalAnalysis'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'generate-diagnosis',
          name: 'Generate Differential Diagnosis',
          type: 'decide',
          agent: 'Diagnosis Generation Vanguard',
          service: 'diagnosis-assistant',
          action: 'generateDiagnosis',
          parameters: {
            confidenceThreshold: 0.85
          },
          outputs: ['differentialDiagnosis'],
          humanApprovalRequired: true,
          errorHandling: {
            escalate: true
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'patient.encounter.new'
        }
      ],
      metadata: {
        requiredServices: ['diagnosis-assistant'],
        requiredAgents: ['Symptom Collection Vanguard', 'Clinical Analysis Vanguard', 'Diagnosis Generation Vanguard'],
        estimatedDuration: 240000,
        criticality: 'high',
        compliance: ['HIPAA', 'FDA'],
        tags: ['diagnosis', 'clinical-support']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    useCaseId: 'medical-supply-chain',
    workflow: {
      id: uuidv4(),
      useCaseId: 'medical-supply-chain',
      name: 'Medical Supply Chain Optimization',
      description: 'Optimize medical supply chain and inventory',
      industry: 'healthcare',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-inventory',
          name: 'Monitor Supply Levels',
          type: 'detect',
          agent: 'Inventory Monitor Vanguard',
          service: 'medical-supply',
          action: 'monitorInventory',
          parameters: {
            criticalItems: true,
            expirationTracking: true
          },
          outputs: ['inventoryLevels'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'predict-demand',
          name: 'Predict Supply Demand',
          type: 'analyze',
          agent: 'Demand Prediction Vanguard',
          service: 'medical-supply',
          action: 'predictDemand',
          parameters: {
            includeSeasonality: true,
            includeEmergencies: true
          },
          outputs: ['demandForecast'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'optimize-orders',
          name: 'Optimize Supply Orders',
          type: 'decide',
          agent: 'Order Optimization Vanguard',
          service: 'medical-supply',
          action: 'optimizeOrders',
          parameters: {
            costOptimization: true,
            leadTimeConsideration: true
          },
          outputs: ['orderPlan'],
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'execute-orders',
          name: 'Execute Supply Orders',
          type: 'execute',
          agent: 'Order Execution Vanguard',
          service: 'medical-supply',
          action: 'executeOrders',
          parameters: {
            autoApproval: false
          },
          outputs: ['orderResults'],
          humanApprovalRequired: true,
          errorHandling: {
            notification: {
              channels: ['email'],
              recipients: ['supply-chain@hospital.com']
            }
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '0 */4 * * *'
        }
      ],
      metadata: {
        requiredServices: ['medical-supply'],
        requiredAgents: ['Inventory Monitor Vanguard', 'Demand Prediction Vanguard', 'Order Optimization Vanguard', 'Order Execution Vanguard'],
        estimatedDuration: 150000,
        criticality: 'high',
        compliance: ['FDA', 'ISO-13485'],
        tags: ['supply-chain', 'inventory']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Financial Services - Missing Use Cases
  {
    useCaseId: 'ai-credit-scoring',
    workflow: {
      id: uuidv4(),
      useCaseId: 'ai-credit-scoring',
      name: 'AI Credit Scoring',
      description: 'Fair and explainable AI-powered credit scoring',
      industry: 'finance',
      version: '1.0.0',
      steps: [
        {
          id: 'collect-data',
          name: 'Collect Applicant Data',
          type: 'detect',
          agent: 'Data Collection Vanguard',
          service: 'credit-scoring',
          action: 'collectData',
          parameters: {
            sources: ['traditional', 'alternative']
          },
          outputs: ['applicantData'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'score-credit',
          name: 'Calculate Credit Score',
          type: 'analyze',
          agent: 'Credit Scoring Vanguard',
          service: 'credit-scoring',
          action: 'calculateScore',
          parameters: {
            models: ['traditional', 'ml', 'ensemble'],
            explainable: true
          },
          outputs: ['creditScore', 'explanation'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'check-fairness',
          name: 'Validate Fairness',
          type: 'verify',
          agent: 'Fairness Validation Vanguard',
          service: 'credit-scoring',
          action: 'checkFairness',
          parameters: {
            biasChecks: true
          },
          outputs: ['fairnessReport'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'decide-credit',
          name: 'Make Credit Decision',
          type: 'decide',
          agent: 'Credit Decision Vanguard',
          service: 'credit-scoring',
          action: 'makeDecision',
          parameters: {
            fairnessChecks: true,
            biasDetection: true
          },
          outputs: ['creditDecision'],
          humanApprovalRequired: true,
          errorHandling: {
            escalate: true
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'credit.application.submitted'
        }
      ],
      metadata: {
        requiredServices: ['credit-scoring'],
        requiredAgents: ['Data Collection Vanguard', 'Credit Scoring Vanguard', 'Fairness Validation Vanguard', 'Credit Decision Vanguard'],
        estimatedDuration: 120000,
        criticality: 'high',
        compliance: ['FCRA', 'ECOA'],
        tags: ['credit', 'ai-scoring', 'fairness']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];