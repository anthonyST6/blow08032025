import { WorkflowDefinition } from '../types/workflow.types';
import { v4 as uuidv4 } from 'uuid';

export const workflows: WorkflowDefinition[] = [
  // Grid Resilience & Outage Response
  {
    useCaseId: 'grid-resilience',
    workflow: {
      id: uuidv4(),
      useCaseId: 'grid-resilience',
      name: 'Grid Resilience & Outage Response',
      description: 'Detect outages, assess impact, coordinate restoration, and verify grid stability',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'detect-outages',
          name: 'Detect Grid Outages',
          type: 'detect',
          agent: 'Outage Detection Vanguard',
          service: 'grid-resilience',
          action: 'detectOutages',
          parameters: {
            monitoringInterval: 30000, // 30 seconds
            thresholds: {
              voltageDropPercent: 10,
              customerAffectedMin: 100
            }
          },
          outputs: ['outageData', 'affectedAreas', 'severity'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 },
            escalate: true
          }
        },
        {
          id: 'assess-impact',
          name: 'Assess Outage Impact',
          type: 'analyze',
          agent: 'Grid Analysis Vanguard',
          service: 'grid-resilience',
          action: 'assessImpact',
          parameters: {
            includesCriticalFacilities: true,
            economicImpactCalculation: true
          },
          conditions: [
            {
              field: 'detect-outages.outageData.confirmed',
              operator: '=',
              value: true
            }
          ],
          outputs: ['impactAssessment', 'priorityMatrix'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'plan-restoration',
          name: 'Plan Restoration Strategy',
          type: 'decide',
          agent: 'Optimization Vanguard',
          service: 'grid-resilience',
          action: 'planRestoration',
          parameters: {
            optimizationGoals: ['minimizeDowntime', 'prioritizeCritical', 'balanceLoad']
          },
          outputs: ['restorationPlan', 'crewAssignments', 'estimatedTime'],
          errorHandling: {
            fallback: 'manual-planning'
          }
        },
        {
          id: 'dispatch-crews',
          name: 'Dispatch Restoration Crews',
          type: 'execute',
          agent: 'Crew Dispatch Vanguard',
          service: 'grid-resilience',
          action: 'dispatchCrews',
          parameters: {
            realTimeTracking: true,
            safetyProtocols: 'enhanced'
          },
          outputs: ['dispatchStatus', 'crewLocations', 'eta'],
          humanApprovalRequired: false,
          errorHandling: {
            notification: {
              channels: ['email', 'teams'],
              recipients: ['grid-operations@company.com']
            }
          }
        },
        {
          id: 'grid-reconfiguration',
          name: 'Execute Grid Reconfiguration',
          type: 'execute',
          agent: 'Grid Automation Vanguard',
          service: 'grid-resilience',
          action: 'reconfigureGrid',
          parameters: {
            selfHealingEnabled: true,
            loadBalancing: true
          },
          conditions: [
            {
              field: 'plan-restoration.restorationPlan.requiresReconfiguration',
              operator: '=',
              value: true
            }
          ],
          outputs: ['reconfigurationStatus', 'restoredCustomers'],
          errorHandling: {
            retry: { attempts: 2, delay: 10000 },
            escalate: true
          }
        },
        {
          id: 'verify-restoration',
          name: 'Verify Restoration Success',
          type: 'verify',
          agent: 'Monitoring Vanguard',
          service: 'grid-resilience',
          action: 'verifyRestoration',
          parameters: {
            verificationChecks: ['voltage', 'frequency', 'load', 'stability']
          },
          outputs: ['verificationStatus', 'remainingIssues'],
          errorHandling: {
            retry: { attempts: 3, delay: 15000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate Outage Report',
          type: 'report',
          agent: 'Compliance Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'outage-response',
            includeMetrics: true,
            regulatoryCompliance: true
          },
          outputs: ['reportId', 'reportUrl'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'grid.outage.detected'
        },
        {
          type: 'threshold',
          threshold: {
            metric: 'grid.customers.affected',
            operator: '>',
            value: 1000
          }
        }
      ],
      metadata: {
        requiredServices: ['grid-resilience', 'unified-reports', 'notification'],
        requiredAgents: [
          'Outage Detection Vanguard',
          'Grid Analysis Vanguard',
          'Optimization Vanguard',
          'Crew Dispatch Vanguard',
          'Grid Automation Vanguard',
          'Monitoring Vanguard',
          'Compliance Vanguard'
        ],
        estimatedDuration: 3600000, // 1 hour
        criticality: 'critical',
        tags: ['grid', 'outage', 'emergency', 'restoration'],
        compliance: ['NERC', 'FERC', 'State PUC']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Methane Leak Detection
  {
    useCaseId: 'methane-detection',
    workflow: {
      id: uuidv4(),
      useCaseId: 'methane-detection',
      name: 'Methane Leak Detection & Response',
      description: 'Monitor methane sensors, detect leaks, coordinate emergency response, and track environmental impact',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-sensors',
          name: 'Monitor Methane Sensors',
          type: 'detect',
          agent: 'Sensor Network Vanguard',
          service: 'methane-detection',
          action: 'monitorSensors',
          parameters: {
            sensorNetwork: 'methane-grid',
            samplingRate: 1000, // 1 second
            alertThresholdPPM: 50
          },
          outputs: ['sensorReadings', 'anomalies', 'alertLevel'],
          errorHandling: {
            retry: { attempts: 5, delay: 2000 },
            notification: {
              channels: ['email'],
              recipients: ['safety-team@company.com']
            }
          }
        },
        {
          id: 'analyze-leak',
          name: 'Analyze Leak Characteristics',
          type: 'analyze',
          agent: 'Leak Detection Vanguard',
          service: 'methane-detection',
          action: 'analyzeLeak',
          parameters: {
            includeWindData: true,
            calculateDispersion: true,
            estimateSource: true
          },
          conditions: [
            {
              field: 'monitor-sensors.alertLevel',
              operator: '>',
              value: 0
            }
          ],
          outputs: ['leakAnalysis', 'sourceLocation', 'dispersionModel'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 },
            escalate: true
          }
        },
        {
          id: 'determine-response',
          name: 'Determine Response Action',
          type: 'decide',
          agent: 'Response Coordination Vanguard',
          service: 'methane-detection',
          action: 'determineResponse',
          parameters: {
            responseProtocols: ['emergency', 'standard', 'monitoring'],
            safetyFirst: true
          },
          outputs: ['responseLevel', 'actionPlan', 'evacuationRequired'],
          humanApprovalRequired: false,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'initiate-response',
          name: 'Initiate Emergency Response',
          type: 'execute',
          agent: 'Emergency Response Vanguard',
          service: 'methane-detection',
          action: 'initiateResponse',
          parameters: {
            autoShutoffEnabled: true,
            notifyAuthorities: true
          },
          conditions: [
            {
              field: 'determine-response.responseLevel',
              operator: 'in',
              value: ['emergency', 'critical']
            }
          ],
          outputs: ['responseStatus', 'teamsDispatched', 'shutoffStatus'],
          errorHandling: {
            retry: { attempts: 1, delay: 0 },
            notification: {
              channels: ['email', 'teams', 'slack'],
              recipients: ['emergency-response@company.com']
            }
          }
        },
        {
          id: 'environmental-assessment',
          name: 'Assess Environmental Impact',
          type: 'analyze',
          agent: 'Environmental Monitoring Vanguard',
          service: 'methane-detection',
          action: 'assessEnvironmentalImpact',
          parameters: {
            calculateEmissions: true,
            co2Equivalent: true,
            regulatoryReporting: true
          },
          outputs: ['emissionsData', 'environmentalImpact', 'reportingRequired'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'verify-containment',
          name: 'Verify Leak Containment',
          type: 'verify',
          agent: 'Sensor Network Vanguard',
          service: 'methane-detection',
          action: 'verifyContainment',
          parameters: {
            continuousMonitoring: true,
            thresholdPPM: 5
          },
          outputs: ['containmentStatus', 'residualLevels'],
          errorHandling: {
            retry: { attempts: 5, delay: 30000 } // Check every 30 seconds
          }
        },
        {
          id: 'regulatory-report',
          name: 'File Regulatory Report',
          type: 'report',
          agent: 'Compliance Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'methane-leak-incident',
            regulatoryBodies: ['EPA', 'State DEQ'],
            includeTimeline: true
          },
          conditions: [
            {
              field: 'environmental-assessment.reportingRequired',
              operator: '=',
              value: true
            }
          ],
          outputs: ['reportId', 'filingConfirmation'],
          errorHandling: {
            retry: { attempts: 3, delay: 10000 }
          }
        }
      ],
      triggers: [
        {
          type: 'threshold',
          threshold: {
            metric: 'methane.concentration.ppm',
            operator: '>',
            value: 50
          }
        },
        {
          type: 'event',
          event: 'methane.leak.detected'
        }
      ],
      metadata: {
        requiredServices: ['methane-detection', 'unified-reports', 'notification'],
        requiredAgents: [
          'Sensor Network Vanguard',
          'Leak Detection Vanguard',
          'Response Coordination Vanguard',
          'Emergency Response Vanguard',
          'Environmental Monitoring Vanguard',
          'Compliance Vanguard'
        ],
        estimatedDuration: 7200000, // 2 hours
        criticality: 'critical',
        tags: ['methane', 'safety', 'environmental', 'emergency'],
        compliance: ['EPA', 'PHMSA', 'State Environmental']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // PHMSA Compliance
  {
    useCaseId: 'phmsa-compliance',
    workflow: {
      id: uuidv4(),
      useCaseId: 'phmsa-compliance',
      name: 'PHMSA Compliance Monitoring & Reporting',
      description: 'Monitor pipeline integrity, ensure PHMSA compliance, and automate regulatory reporting',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'integrity-assessment',
          name: 'Pipeline Integrity Assessment',
          type: 'detect',
          agent: 'Pipeline Integrity Vanguard',
          service: 'phmsa-compliance',
          action: 'assessIntegrity',
          parameters: {
            assessmentType: 'comprehensive',
            includeILI: true,
            includePressureTest: true
          },
          outputs: ['integrityData', 'anomalies', 'riskScore'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'compliance-check',
          name: 'Check PHMSA Compliance',
          type: 'analyze',
          agent: 'Compliance Monitoring Vanguard',
          service: 'phmsa-compliance',
          action: 'checkCompliance',
          parameters: {
            regulations: ['49 CFR 192', '49 CFR 195'],
            includeStateRegs: true
          },
          outputs: ['complianceStatus', 'violations', 'recommendations'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'remediation-planning',
          name: 'Plan Remediation Actions',
          type: 'decide',
          agent: 'Remediation Planning Vanguard',
          service: 'phmsa-compliance',
          action: 'planRemediation',
          parameters: {
            priorityBased: true,
            costOptimization: true
          },
          conditions: [
            {
              field: 'compliance-check.violations',
              operator: '>',
              value: 0
            }
          ],
          outputs: ['remediationPlan', 'timeline', 'costEstimate'],
          humanApprovalRequired: true,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'execute-remediation',
          name: 'Execute Remediation',
          type: 'execute',
          agent: 'Remediation Execution Vanguard',
          service: 'phmsa-compliance',
          action: 'executeRemediation',
          parameters: {
            trackProgress: true,
            qualityAssurance: true
          },
          conditions: [
            {
              field: 'remediation-planning.approved',
              operator: '=',
              value: true
            }
          ],
          outputs: ['executionStatus', 'completedActions'],
          errorHandling: {
            notification: {
              channels: ['email'],
              recipients: ['compliance-team@company.com']
            }
          }
        },
        {
          id: 'verify-compliance',
          name: 'Verify Compliance Achievement',
          type: 'verify',
          agent: 'Compliance Verification Vanguard',
          service: 'phmsa-compliance',
          action: 'verifyCompliance',
          parameters: {
            thoroughVerification: true
          },
          outputs: ['verificationStatus', 'remainingIssues'],
          errorHandling: {
            retry: { attempts: 2, delay: 10000 }
          }
        },
        {
          id: 'file-reports',
          name: 'File PHMSA Reports',
          type: 'report',
          agent: 'Regulatory Filing Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'phmsa-compliance',
            forms: ['7100.1', '7100.2-1', '7100.2-2'],
            electronicFiling: true
          },
          outputs: ['filingConfirmation', 'reportIds'],
          errorHandling: {
            retry: { attempts: 3, delay: 15000 }
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '0 0 1 * *' // Monthly on the 1st
        },
        {
          type: 'event',
          event: 'phmsa.inspection.required'
        }
      ],
      metadata: {
        requiredServices: ['phmsa-compliance', 'unified-reports', 'notification'],
        requiredAgents: [
          'Pipeline Integrity Vanguard',
          'Compliance Monitoring Vanguard',
          'Remediation Planning Vanguard',
          'Remediation Execution Vanguard',
          'Compliance Verification Vanguard',
          'Regulatory Filing Vanguard'
        ],
        estimatedDuration: 86400000, // 24 hours
        criticality: 'high',
        tags: ['compliance', 'phmsa', 'regulatory', 'pipeline'],
        compliance: ['PHMSA', '49 CFR 192', '49 CFR 195']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Oilfield Land Lease Management
  {
    useCaseId: 'oilfield-land-lease',
    workflow: {
      id: uuidv4(),
      useCaseId: 'oilfield-land-lease',
      name: 'Oilfield Land Lease Management',
      description: 'Monitor lease expirations, optimize portfolio, negotiate renewals, and ensure compliance',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'scan-portfolio',
          name: 'Scan Lease Portfolio',
          type: 'detect',
          agent: 'Security Vanguard',
          service: 'oilfield',
          action: 'scanLeasePortfolio',
          parameters: {
            scanType: 'comprehensive',
            includeExpiring: true,
            daysAhead: 180
          },
          outputs: ['portfolioData', 'expiringLeases', 'riskAssessment'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'verify-data',
          name: 'Verify Lease Data Integrity',
          type: 'analyze',
          agent: 'Integrity Vanguard',
          service: 'oilfield',
          action: 'verifyLeaseData',
          parameters: {
            crossReference: ['GIS', 'County Records', 'Internal DB'],
            validateOwnership: true
          },
          outputs: ['dataIntegrity', 'discrepancies', 'validationReport'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'calculate-value',
          name: 'Calculate Lease Values',
          type: 'analyze',
          agent: 'Accuracy Vanguard',
          service: 'oilfield',
          action: 'calculateLeaseValue',
          parameters: {
            includeProduction: true,
            marketAnalysis: true,
            futureProjections: true
          },
          outputs: ['leaseValues', 'roi', 'recommendations'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'optimize-portfolio',
          name: 'Optimize Lease Portfolio',
          type: 'decide',
          agent: 'Optimization Vanguard',
          service: 'oilfield',
          action: 'optimizePortfolio',
          parameters: {
            optimizationGoals: ['maximizeROI', 'minimizeRisk', 'consolidateHoldings'],
            scenarioAnalysis: true
          },
          outputs: ['optimizationPlan', 'recommendations', 'projectedSavings'],
          humanApprovalRequired: true,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'prepare-negotiations',
          name: 'Prepare Negotiation Packages',
          type: 'execute',
          agent: 'Negotiation Vanguard',
          service: 'oilfield',
          action: 'prepareNegotiations',
          parameters: {
            strategyType: 'win-win',
            includeMarketComps: true
          },
          conditions: [
            {
              field: 'optimize-portfolio.recommendations',
              operator: 'contains',
              value: 'negotiate'
            }
          ],
          outputs: ['negotiationPackages', 'strategies', 'targetTerms'],
          errorHandling: {
            retry: { attempts: 1, delay: 10000 }
          }
        },
        {
          id: 'compliance-review',
          name: 'Review Compliance Status',
          type: 'verify',
          agent: 'Compliance Vanguard',
          service: 'oilfield',
          action: 'reviewCompliance',
          parameters: {
            regulations: ['Federal', 'State', 'Local'],
            includeEnvironmental: true
          },
          outputs: ['complianceStatus', 'issues', 'certifications'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'generate-reports',
          name: 'Generate Management Reports',
          type: 'report',
          agent: 'Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'lease-management',
            includeFinancials: true,
            executiveSummary: true
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
          schedule: '0 9 * * 1' // Weekly on Mondays at 9 AM
        },
        {
          type: 'event',
          event: 'lease.expiration.approaching'
        }
      ],
      metadata: {
        requiredServices: ['oilfield', 'unified-reports', 'notification'],
        requiredAgents: [
          'Security Vanguard',
          'Integrity Vanguard',
          'Accuracy Vanguard',
          'Optimization Vanguard',
          'Negotiation Vanguard',
          'Compliance Vanguard',
          'Reporting Vanguard'
        ],
        estimatedDuration: 14400000, // 4 hours
        criticality: 'high',
        tags: ['oilfield', 'lease', 'portfolio', 'optimization'],
        compliance: ['BLM', 'State Land Office', 'Environmental']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];