import { WorkflowDefinition } from '../types/workflow.types';
import { v4 as uuidv4 } from 'uuid';

export const workflows: WorkflowDefinition[] = [
  // Internal Audit
  {
    useCaseId: 'internal-audit',
    workflow: {
      id: uuidv4(),
      useCaseId: 'internal-audit',
      name: 'Energy Operations Internal Audit',
      description: 'Conduct comprehensive internal audits of energy operations and compliance',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'define-scope',
          name: 'Define Audit Scope',
          type: 'detect',
          agent: 'Audit Planning Vanguard',
          service: 'internal-audit',
          action: 'defineAuditScope',
          parameters: {
            areas: ['operations', 'compliance', 'safety', 'financial', 'environmental'],
            riskBased: true,
            regulatoryRequirements: true
          },
          outputs: ['auditScope', 'schedule', 'resources'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'collect-evidence',
          name: 'Collect Audit Evidence',
          type: 'analyze',
          agent: 'Evidence Collection Vanguard',
          service: 'internal-audit',
          action: 'collectEvidence',
          parameters: {
            documentReview: true,
            systemLogs: true,
            interviews: true,
            observations: true
          },
          outputs: ['evidence', 'dataQuality', 'gaps'],
          errorHandling: {
            retry: { attempts: 3, delay: 3000 }
          }
        },
        {
          id: 'analyze-compliance',
          name: 'Analyze Compliance Status',
          type: 'analyze',
          agent: 'Compliance Analysis Vanguard',
          service: 'internal-audit',
          action: 'analyzeCompliance',
          parameters: {
            standards: ['ISO', 'NERC', 'OSHA', 'EPA'],
            internalPolicies: true,
            bestPractices: true
          },
          outputs: ['complianceStatus', 'violations', 'risks'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'assess-controls',
          name: 'Assess Internal Controls',
          type: 'analyze',
          agent: 'Control Assessment Vanguard',
          service: 'internal-audit',
          action: 'assessControls',
          parameters: {
            controlTypes: ['preventive', 'detective', 'corrective'],
            effectiveness: true,
            efficiency: true
          },
          outputs: ['controlAssessment', 'weaknesses', 'recommendations'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'identify-findings',
          name: 'Identify Audit Findings',
          type: 'decide',
          agent: 'Finding Analysis Vanguard',
          service: 'internal-audit',
          action: 'identifyFindings',
          parameters: {
            severity: ['critical', 'high', 'medium', 'low'],
            rootCauseAnalysis: true,
            impactAssessment: true
          },
          outputs: ['findings', 'priorities', 'actionItems'],
          humanApprovalRequired: false,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'develop-recommendations',
          name: 'Develop Recommendations',
          type: 'decide',
          agent: 'Recommendation Vanguard',
          service: 'internal-audit',
          action: 'developRecommendations',
          parameters: {
            practicalSolutions: true,
            costBenefit: true,
            implementationPlan: true
          },
          outputs: ['recommendations', 'timeline', 'responsibilities'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'management-review',
          name: 'Management Review & Response',
          type: 'execute',
          agent: 'Management Review Vanguard',
          service: 'internal-audit',
          action: 'conductManagementReview',
          parameters: {
            presentFindings: true,
            discussRecommendations: true,
            obtainCommitments: true
          },
          outputs: ['managementResponse', 'commitments', 'disagreements'],
          humanApprovalRequired: true,
          errorHandling: {
            notification: {
              channels: ['email', 'teams'],
              recipients: ['audit-committee@company.com']
            }
          }
        },
        {
          id: 'track-remediation',
          name: 'Track Remediation Progress',
          type: 'verify',
          agent: 'Remediation Tracking Vanguard',
          service: 'internal-audit',
          action: 'trackRemediation',
          parameters: {
            followUpSchedule: true,
            progressMetrics: true,
            escalationTriggers: true
          },
          outputs: ['remediationStatus', 'completedActions', 'pendingItems'],
          errorHandling: {
            retry: { attempts: 2, delay: 10000 }
          }
        },
        {
          id: 'generate-audit-report',
          name: 'Generate Audit Report',
          type: 'report',
          agent: 'Audit Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'internal-audit',
            executiveSummary: true,
            detailedFindings: true,
            actionPlan: true
          },
          outputs: ['reportId', 'distribution'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '0 0 1 */3 *' // Quarterly
        },
        {
          type: 'event',
          event: 'audit.special.request'
        }
      ],
      metadata: {
        requiredServices: ['internal-audit', 'unified-reports', 'notification'],
        requiredAgents: [
          'Audit Planning Vanguard',
          'Evidence Collection Vanguard',
          'Compliance Analysis Vanguard',
          'Control Assessment Vanguard',
          'Finding Analysis Vanguard',
          'Recommendation Vanguard',
          'Management Review Vanguard',
          'Remediation Tracking Vanguard',
          'Audit Reporting Vanguard'
        ],
        estimatedDuration: 604800000, // 7 days
        criticality: 'high',
        tags: ['audit', 'compliance', 'internal-controls', 'governance'],
        compliance: ['SOX', 'COSO', 'Internal Audit Standards']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // SCADA Integration
  {
    useCaseId: 'scada-integration',
    workflow: {
      id: uuidv4(),
      useCaseId: 'scada-integration',
      name: 'SCADA System Integration & Monitoring',
      description: 'Integrate SCADA systems, monitor operations, and ensure cybersecurity',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-scada',
          name: 'Monitor SCADA Systems',
          type: 'detect',
          agent: 'SCADA Monitoring Vanguard',
          service: 'scada-integration',
          action: 'monitorSCADASystems',
          parameters: {
            systems: ['generation', 'transmission', 'distribution'],
            protocols: ['DNP3', 'IEC61850', 'Modbus'],
            realTimeData: true
          },
          outputs: ['scadaStatus', 'dataStreams', 'anomalies'],
          errorHandling: {
            retry: { attempts: 5, delay: 2000 }
          }
        },
        {
          id: 'analyze-operations',
          name: 'Analyze Operational Data',
          type: 'analyze',
          agent: 'Operations Analysis Vanguard',
          service: 'scada-integration',
          action: 'analyzeOperationalData',
          parameters: {
            performanceMetrics: true,
            efficiencyAnalysis: true,
            trendIdentification: true
          },
          outputs: ['operationalAnalysis', 'kpis', 'trends'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'detect-cyber-threats',
          name: 'Detect Cybersecurity Threats',
          type: 'analyze',
          agent: 'Cyber Defense Vanguard',
          service: 'scada-integration',
          action: 'detectCyberThreats',
          parameters: {
            intrusionDetection: true,
            anomalyDetection: true,
            behaviorAnalysis: true
          },
          outputs: ['threatAssessment', 'incidents', 'vulnerabilities'],
          errorHandling: {
            retry: { attempts: 3, delay: 1000 },
            escalate: true
          }
        },
        {
          id: 'optimize-control',
          name: 'Optimize Control Strategies',
          type: 'decide',
          agent: 'Control Optimization Vanguard',
          service: 'scada-integration',
          action: 'optimizeControlStrategies',
          parameters: {
            objectives: ['efficiency', 'reliability', 'safety'],
            constraints: ['operational_limits', 'regulatory_requirements']
          },
          outputs: ['controlStrategy', 'setpoints', 'automation'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'implement-controls',
          name: 'Implement Control Changes',
          type: 'execute',
          agent: 'Control Implementation Vanguard',
          service: 'scada-integration',
          action: 'implementControlChanges',
          parameters: {
            validationRequired: true,
            rollbackEnabled: true,
            changeManagement: true
          },
          outputs: ['implementationStatus', 'systemResponse'],
          humanApprovalRequired: true,
          errorHandling: {
            notification: {
              channels: ['email', 'teams'],
              recipients: ['scada-operations@company.com']
            }
          }
        },
        {
          id: 'verify-integration',
          name: 'Verify System Integration',
          type: 'verify',
          agent: 'Integration Verification Vanguard',
          service: 'scada-integration',
          action: 'verifyIntegration',
          parameters: {
            dataIntegrity: true,
            communicationHealth: true,
            performanceMetrics: true
          },
          outputs: ['integrationStatus', 'issues', 'performance'],
          errorHandling: {
            retry: { attempts: 3, delay: 10000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate SCADA Report',
          type: 'report',
          agent: 'SCADA Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'scada-operations',
            includeMetrics: true,
            cybersecurityStatus: true
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
          event: 'scada.anomaly.detected'
        },
        {
          type: 'threshold',
          threshold: {
            metric: 'scada.performance.degradation',
            operator: '>',
            value: 0.1
          }
        }
      ],
      metadata: {
        requiredServices: ['scada-integration', 'unified-reports', 'notification'],
        requiredAgents: [
          'SCADA Monitoring Vanguard',
          'Operations Analysis Vanguard',
          'Cyber Defense Vanguard',
          'Control Optimization Vanguard',
          'Control Implementation Vanguard',
          'Integration Verification Vanguard',
          'SCADA Reporting Vanguard'
        ],
        estimatedDuration: 900000, // 15 minutes
        criticality: 'critical',
        tags: ['scada', 'integration', 'cybersecurity', 'operations'],
        compliance: ['NERC CIP', 'ICS-CERT', 'NIST']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Predictive Resilience
  {
    useCaseId: 'predictive-resilience',
    workflow: {
      id: uuidv4(),
      useCaseId: 'predictive-resilience',
      name: 'Predictive Grid Resilience',
      description: 'Predict grid vulnerabilities and enhance resilience against disruptions',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'collect-data',
          name: 'Collect Resilience Data',
          type: 'detect',
          agent: 'Data Collection Vanguard',
          service: 'predictive-resilience',
          action: 'collectResilienceData',
          parameters: {
            dataSources: ['weather', 'infrastructure', 'historical_outages', 'threat_intelligence'],
            realTimeFeeds: true,
            externalData: true
          },
          outputs: ['resilienceData', 'dataQuality', 'coverage'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'vulnerability-assessment',
          name: 'Assess Grid Vulnerabilities',
          type: 'analyze',
          agent: 'Vulnerability Assessment Vanguard',
          service: 'predictive-resilience',
          action: 'assessVulnerabilities',
          parameters: {
            physicalThreats: true,
            cyberThreats: true,
            naturalDisasters: true,
            cascadingFailures: true
          },
          outputs: ['vulnerabilities', 'riskMap', 'criticalAssets'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'predict-disruptions',
          name: 'Predict Potential Disruptions',
          type: 'analyze',
          agent: 'Disruption Prediction Vanguard',
          service: 'predictive-resilience',
          action: 'predictDisruptions',
          parameters: {
            predictionModels: ['ML', 'statistical', 'simulation'],
            timeHorizons: ['24h', '7d', '30d'],
            probabilityThresholds: true
          },
          outputs: ['predictions', 'probability', 'impact'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'resilience-planning',
          name: 'Plan Resilience Enhancements',
          type: 'decide',
          agent: 'Resilience Planning Vanguard',
          service: 'predictive-resilience',
          action: 'planResilienceEnhancements',
          parameters: {
            strategies: ['hardening', 'redundancy', 'flexibility', 'recovery'],
            costBenefitAnalysis: true,
            prioritization: true
          },
          outputs: ['resiliencePlan', 'investments', 'timeline'],
          humanApprovalRequired: true,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'implement-measures',
          name: 'Implement Resilience Measures',
          type: 'execute',
          agent: 'Implementation Vanguard',
          service: 'predictive-resilience',
          action: 'implementMeasures',
          parameters: {
            physicalUpgrades: true,
            systemReconfiguration: true,
            procedureUpdates: true
          },
          conditions: [
            {
              field: 'resilience-planning.approved',
              operator: '=',
              value: true
            }
          ],
          outputs: ['implementationStatus', 'completedMeasures'],
          errorHandling: {
            notification: {
              channels: ['email', 'teams'],
              recipients: ['grid-resilience@company.com']
            }
          }
        },
        {
          id: 'test-resilience',
          name: 'Test Resilience Improvements',
          type: 'verify',
          agent: 'Resilience Testing Vanguard',
          service: 'predictive-resilience',
          action: 'testResilience',
          parameters: {
            simulationScenarios: true,
            stressTesting: true,
            failoverTesting: true
          },
          outputs: ['testResults', 'performance', 'gaps'],
          errorHandling: {
            retry: { attempts: 2, delay: 10000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate Resilience Report',
          type: 'report',
          agent: 'Resilience Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'grid-resilience',
            includeMetrics: true,
            improvementTracking: true
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
          schedule: '0 0 * * 0' // Weekly on Sundays
        },
        {
          type: 'event',
          event: 'resilience.threat.identified'
        },
        {
          type: 'threshold',
          threshold: {
            metric: 'grid.vulnerability.score',
            operator: '>',
            value: 0.7
          }
        }
      ],
      metadata: {
        requiredServices: ['predictive-resilience', 'unified-reports', 'notification'],
        requiredAgents: [
          'Data Collection Vanguard',
          'Vulnerability Assessment Vanguard',
          'Disruption Prediction Vanguard',
          'Resilience Planning Vanguard',
          'Implementation Vanguard',
          'Resilience Testing Vanguard',
          'Resilience Reporting Vanguard'
        ],
        estimatedDuration: 86400000, // 24 hours
        criticality: 'high',
        tags: ['resilience', 'prediction', 'grid', 'vulnerability'],
        compliance: ['NERC', 'DOE', 'DHS']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Cyber Defense
  {
    useCaseId: 'cyber-defense',
    workflow: {
      id: uuidv4(),
      useCaseId: 'cyber-defense',
      name: 'Energy Infrastructure Cyber Defense',
      description: 'Detect, prevent, and respond to cyber threats targeting energy infrastructure',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'threat-monitoring',
          name: 'Monitor Cyber Threats',
          type: 'detect',
          agent: 'Threat Monitoring Vanguard',
          service: 'cyber-defense',
          action: 'monitorThreats',
          parameters: {
            sources: ['network_traffic', 'system_logs', 'threat_feeds', 'honeypots'],
            realTimeAnalysis: true,
            behaviorBaseline: true
          },
          outputs: ['threatData', 'anomalies', 'indicators'],
          errorHandling: {
            retry: { attempts: 5, delay: 1000 }
          }
        },
        {
          id: 'threat-analysis',
          name: 'Analyze Threat Intelligence',
          type: 'analyze',
          agent: 'Threat Intelligence Vanguard',
          service: 'cyber-defense',
          action: 'analyzeThreatIntelligence',
          parameters: {
            correlationAnalysis: true,
            attributionAnalysis: true,
            impactAssessment: true
          },
          outputs: ['threatAnalysis', 'attackVectors', 'riskLevel'],
          errorHandling: {
            retry: { attempts: 2, delay: 2000 },
            escalate: true
          }
        },
        {
          id: 'vulnerability-scan',
          name: 'Scan for Vulnerabilities',
          type: 'analyze',
          agent: 'Vulnerability Scanning Vanguard',
          service: 'cyber-defense',
          action: 'scanVulnerabilities',
          parameters: {
            scanTypes: ['network', 'application', 'configuration'],
            criticalAssets: true,
            zeroDay: true
          },
          outputs: ['vulnerabilities', 'exploitability', 'patches'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'response-strategy',
          name: 'Determine Response Strategy',
          type: 'decide',
          agent: 'Response Strategy Vanguard',
          service: 'cyber-defense',
          action: 'determineResponseStrategy',
          parameters: {
            responseOptions: ['block', 'isolate', 'monitor', 'counteract'],
            riskTolerance: 'low',
            businessImpact: true
          },
          outputs: ['responseStrategy', 'actions', 'timeline'],
          humanApprovalRequired: false,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'execute-defense',
          name: 'Execute Cyber Defense Actions',
          type: 'execute',
          agent: 'Defense Execution Vanguard',
          service: 'cyber-defense',
          action: 'executeDefenseActions',
          parameters: {
            automatedResponse: true,
            containment: true,
            evidencePreservation: true
          },
          conditions: [
            {
              field: 'response-strategy.riskLevel',
              operator: '>',
              value: 'medium'
            }
          ],
          outputs: ['executionStatus', 'containmentStatus', 'evidence'],
          errorHandling: {
            notification: {
              channels: ['email', 'teams', 'slack'],
              recipients: ['security-team@company.com', 'ciso@company.com']
            }
          }
        },
        {
          id: 'incident-response',
          name: 'Coordinate Incident Response',
          type: 'execute',
          agent: 'Incident Response Vanguard',
          service: 'cyber-defense',
          action: 'coordinateIncidentResponse',
          parameters: {
            irtActivation: true,
            stakeholderNotification: true,
            recoveryPlanning: true
          },
          conditions: [
            {
              field: 'threat-analysis.riskLevel',
              operator: '=',
              value: 'critical'
            }
          ],
          outputs: ['incidentStatus', 'recoveryPlan', 'communications'],
          humanApprovalRequired: true,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'verify-security',
          name: 'Verify Security Posture',
          type: 'verify',
          agent: 'Security Verification Vanguard',
          service: 'cyber-defense',
          action: 'verifySecurityPosture',
          parameters: {
            postIncidentScan: true,
            controlValidation: true,
            penetrationTesting: false
          },
          outputs: ['securityStatus', 'residualRisks', 'improvements'],
          errorHandling: {
            retry: { attempts: 3, delay: 10000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate Security Report',
          type: 'report',
          agent: 'Security Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'cyber-security-incident',
            includeForensics: true,
            regulatoryCompliance: true,
            lessonsLearned: true
          },
          outputs: ['reportId', 'complianceStatus'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'cyber.threat.detected'
        },
        {
          type: 'threshold',
          threshold: {
            metric: 'security.anomaly.score',
            operator: '>',
            value: 0.8
          }
        },
        {
          type: 'scheduled',
          schedule: '0 */6 * * *' // Every 6 hours
        }
      ],
      metadata: {
        requiredServices: ['cyber-defense', 'unified-reports', 'notification'],
        requiredAgents: [
          'Threat Monitoring Vanguard',
          'Threat Intelligence Vanguard',
          'Vulnerability Scanning Vanguard',
          'Response Strategy Vanguard',
          'Defense Execution Vanguard',
          'Incident Response Vanguard',
          'Security Verification Vanguard',
          'Security Reporting Vanguard'
        ],
        estimatedDuration: 3600000, // 1 hour
        criticality: 'critical',
        tags: ['cybersecurity', 'defense', 'incident-response', 'threat'],
        compliance: ['NERC CIP', 'NIST', 'ICS-CERT']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Wildfire Prevention
  {
    useCaseId: 'wildfire-prevention',
    workflow: {
      id: uuidv4(),
      useCaseId: 'wildfire-prevention',
      name: 'Wildfire Prevention & Response',
      description: 'Prevent wildfires from power infrastructure and coordinate emergency response',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-conditions',
          name: 'Monitor Fire Risk Conditions',
          type: 'detect',
          agent: 'Fire Risk Monitoring Vanguard',
          service: 'wildfire-prevention',
          action: 'monitorFireRisk',
          parameters: {
            weatherData: ['temperature', 'humidity', 'wind', 'precipitation'],
            vegetationIndex: true,
            powerLineMonitoring: true
          },
          outputs: ['fireRisk', 'highRiskAreas', 'conditions'],
          errorHandling: {
            retry: { attempts: 5, delay: 2000 }
          }
        },
        {
          id: 'infrastructure-inspection',
          name: 'Inspect Power Infrastructure',
          type: 'detect',
          agent: 'Infrastructure Inspection Vanguard',
          service: 'wildfire-prevention',
          action: 'inspectInfrastructure',
          parameters: {
            inspectionTypes: ['visual', 'thermal', 'lidar'],
            vegetationEncroachment: true,
            equipmentCondition: true
          },
          outputs: ['inspectionResults', 'hazards', 'maintenanceNeeds'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'risk-assessment',
          name: 'Assess Wildfire Risk',
          type: 'analyze',
          agent: 'Risk Assessment Vanguard',
          service: 'wildfire-prevention',
          action: 'assessWildfireRisk',
          parameters: {
            riskModels: ['probabilistic', 'deterministic', 'ML-based'],
            historicalData: true,
            realTimeConditions: true
          },
          outputs: ['riskAssessment', 'criticalZones', 'probability'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'prevention-strategy',
          name: 'Determine Prevention Strategy',
          type: 'decide',
          agent: 'Prevention Strategy Vanguard',
          service: 'wildfire-prevention',
          action: 'determinePrevention',
          parameters: {
            strategies: ['vegetation_management', 'equipment_upgrade', 'power_shutoff'],
            publicSafety: true,
            economicImpact: true
          },
          outputs: ['preventionPlan', 'actions', 'timeline'],
          humanApprovalRequired: false,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'execute-prevention',
          name: 'Execute Prevention Measures',
          type: 'execute',
          agent: 'Prevention Execution Vanguard',
          service: 'wildfire-prevention',
          action: 'executePrevention',
          parameters: {
            vegetationClearing: true,
            equipmentMaintenance: true,
            publicNotification: true
          },
          outputs: ['executionStatus', 'completedActions'],
          errorHandling: {
            notification: {
              channels: ['email', 'teams', 'slack'],
              recipients: ['fire-safety@company.com']
            }
          }
        },
        {
          id: 'power-shutoff',
          name: 'Execute Public Safety Power Shutoff',
          type: 'execute',
          agent: 'PSPS Execution Vanguard',
          service: 'wildfire-prevention',
          action: 'executePSPS',
          parameters: {
            customerNotification: true,
            criticalFacilities: true,
            backupPower: true
          },
          conditions: [
            {
              field: 'risk-assessment.probability',
              operator: '>',
              value: 0.8
            }
          ],
          outputs: ['shutoffStatus', 'affectedCustomers', 'duration'],
          humanApprovalRequired: true,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'monitor-effectiveness',
          name: 'Monitor Prevention Effectiveness',
          type: 'verify',
          agent: 'Effectiveness Monitoring Vanguard',
          service: 'wildfire-prevention',
          action: 'monitorEffectiveness',
          parameters: {
            fireIncidents: true,
            preventionMetrics: true,
            publicSafety: true
          },
          outputs: ['effectivenessReport', 'incidents', 'improvements'],
          errorHandling: {
            retry: { attempts: 2, delay: 10000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate Wildfire Prevention Report',
          type: 'report',
          agent: 'Fire Safety Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'wildfire-prevention',
            includeIncidents: true,
            publicSafetyMetrics: true,
            regulatoryCompliance: true
          },
          outputs: ['reportId', 'publicReport'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '0 */6 * * *' // Every 6 hours during fire season
        },
        {
          type: 'event',
          event: 'fire.risk.elevated'
        },
        {
          type: 'threshold',
          threshold: {
            metric: 'fire.risk.index',
            operator: '>',
            value: 0.7
          }
        }
      ],
      metadata: {
        requiredServices: ['wildfire-prevention', 'unified-reports', 'notification'],
        requiredAgents: [
          'Fire Risk Monitoring Vanguard',
          'Infrastructure Inspection Vanguard',
          'Risk Assessment Vanguard',
          'Prevention Strategy Vanguard',
          'Prevention Execution Vanguard',
          'PSPS Execution Vanguard',
          'Effectiveness Monitoring Vanguard',
          'Fire Safety Reporting Vanguard'
        ],
        estimatedDuration: 7200000, // 2 hours
        criticality: 'critical',
        tags: ['wildfire', 'prevention', 'safety', 'psps'],
        compliance: ['CPUC', 'CAL FIRE', 'State Fire Marshal']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];