import { WorkflowDefinition } from '../types/workflow.types';
import { v4 as uuidv4 } from 'uuid';

export const workflows: WorkflowDefinition[] = [
  // Grid Anomaly Detection
  {
    useCaseId: 'grid-anomaly',
    workflow: {
      id: uuidv4(),
      useCaseId: 'grid-anomaly',
      name: 'Grid Anomaly Detection & Response',
      description: 'Detect grid anomalies, analyze patterns, and prevent cascading failures',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-grid',
          name: 'Monitor Grid Parameters',
          type: 'detect',
          agent: 'Grid Monitoring Vanguard',
          service: 'grid-anomaly',
          action: 'monitorGridParameters',
          parameters: {
            parameters: ['voltage', 'frequency', 'power_factor', 'harmonics'],
            samplingRate: 1000,
            anomalyDetection: 'ml-based'
          },
          outputs: ['gridMetrics', 'anomalies', 'severity'],
          errorHandling: {
            retry: { attempts: 5, delay: 2000 }
          }
        },
        {
          id: 'analyze-anomaly',
          name: 'Analyze Anomaly Patterns',
          type: 'analyze',
          agent: 'Pattern Analysis Vanguard',
          service: 'grid-anomaly',
          action: 'analyzeAnomalyPatterns',
          parameters: {
            historicalComparison: true,
            predictiveAnalysis: true,
            rootCauseAnalysis: true
          },
          conditions: [
            {
              field: 'monitor-grid.anomalies.detected',
              operator: '=',
              value: true
            }
          ],
          outputs: ['anomalyAnalysis', 'rootCause', 'riskAssessment'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'predict-impact',
          name: 'Predict Cascading Impact',
          type: 'analyze',
          agent: 'Prediction Vanguard',
          service: 'grid-anomaly',
          action: 'predictCascadingImpact',
          parameters: {
            simulationModels: ['power_flow', 'stability', 'contingency'],
            timeHorizon: '4h'
          },
          outputs: ['impactPrediction', 'affectedNodes', 'timeline'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'determine-response',
          name: 'Determine Response Strategy',
          type: 'decide',
          agent: 'Response Strategy Vanguard',
          service: 'grid-anomaly',
          action: 'determineResponseStrategy',
          parameters: {
            strategies: ['isolation', 'rerouting', 'load_shedding', 'generation_dispatch'],
            optimizationGoals: ['minimize_impact', 'maintain_stability']
          },
          outputs: ['responseStrategy', 'actionSequence'],
          humanApprovalRequired: false,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'execute-response',
          name: 'Execute Grid Response',
          type: 'execute',
          agent: 'Grid Control Vanguard',
          service: 'grid-anomaly',
          action: 'executeGridResponse',
          parameters: {
            automatedExecution: true,
            safetyChecks: true,
            rollbackEnabled: true
          },
          outputs: ['executionStatus', 'gridState'],
          errorHandling: {
            notification: {
              channels: ['email', 'teams'],
              recipients: ['grid-control@company.com']
            }
          }
        },
        {
          id: 'verify-stability',
          name: 'Verify Grid Stability',
          type: 'verify',
          agent: 'Stability Monitoring Vanguard',
          service: 'grid-anomaly',
          action: 'verifyGridStability',
          parameters: {
            stabilityMetrics: ['voltage', 'frequency', 'phase_angle'],
            duration: 300000 // 5 minutes
          },
          outputs: ['stabilityStatus', 'residualRisks'],
          errorHandling: {
            retry: { attempts: 3, delay: 10000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate Anomaly Report',
          type: 'report',
          agent: 'Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'grid-anomaly',
            includeRootCause: true,
            lessonsLearned: true
          },
          outputs: ['reportId', 'reportUrl'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        }
      ],
      triggers: [
        {
          type: 'threshold',
          threshold: {
            metric: 'grid.anomaly.score',
            operator: '>',
            value: 0.7
          }
        },
        {
          type: 'event',
          event: 'grid.anomaly.detected'
        }
      ],
      metadata: {
        requiredServices: ['grid-anomaly', 'unified-reports', 'notification'],
        requiredAgents: [
          'Grid Monitoring Vanguard',
          'Pattern Analysis Vanguard',
          'Prediction Vanguard',
          'Response Strategy Vanguard',
          'Grid Control Vanguard',
          'Stability Monitoring Vanguard',
          'Reporting Vanguard'
        ],
        estimatedDuration: 1800000, // 30 minutes
        criticality: 'critical',
        tags: ['grid', 'anomaly', 'stability', 'prevention'],
        compliance: ['NERC CIP', 'FERC']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Renewable Optimization
  {
    useCaseId: 'renewable-optimization',
    workflow: {
      id: uuidv4(),
      useCaseId: 'renewable-optimization',
      name: 'Renewable Energy Optimization',
      description: 'Optimize renewable energy generation, storage, and distribution',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'forecast-generation',
          name: 'Forecast Renewable Generation',
          type: 'detect',
          agent: 'Weather Prediction Vanguard',
          service: 'renewable-optimization',
          action: 'forecastGeneration',
          parameters: {
            sources: ['solar', 'wind', 'hydro'],
            forecastHorizon: '48h',
            weatherData: true
          },
          outputs: ['generationForecast', 'confidence', 'variability'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'analyze-demand',
          name: 'Analyze Energy Demand',
          type: 'analyze',
          agent: 'Demand Analysis Vanguard',
          service: 'renewable-optimization',
          action: 'analyzeDemand',
          parameters: {
            historicalPatterns: true,
            eventCalendar: true,
            weatherImpact: true
          },
          outputs: ['demandForecast', 'peakPeriods', 'flexibility'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
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
            objectives: ['maximize_renewable', 'minimize_cost', 'reduce_emissions'],
            constraints: ['grid_stability', 'storage_capacity', 'transmission_limits']
          },
          outputs: ['dispatchPlan', 'storageStrategy', 'curtailmentPlan'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'manage-storage',
          name: 'Manage Energy Storage',
          type: 'execute',
          agent: 'Storage Management Vanguard',
          service: 'renewable-optimization',
          action: 'manageStorage',
          parameters: {
            batteryManagement: true,
            pumpedHydro: true,
            thermalStorage: true
          },
          outputs: ['storageStatus', 'chargeDischargeSchedule'],
          humanApprovalRequired: false,
          errorHandling: {
            notification: {
              channels: ['email'],
              recipients: ['renewable-ops@company.com']
            }
          }
        },
        {
          id: 'coordinate-grid',
          name: 'Coordinate Grid Integration',
          type: 'execute',
          agent: 'Grid Integration Vanguard',
          service: 'renewable-optimization',
          action: 'coordinateGridIntegration',
          parameters: {
            voltageRegulation: true,
            frequencyControl: true,
            reactiveSupport: true
          },
          outputs: ['integrationStatus', 'gridMetrics'],
          errorHandling: {
            retry: { attempts: 2, delay: 10000 }
          }
        },
        {
          id: 'verify-performance',
          name: 'Verify Optimization Performance',
          type: 'verify',
          agent: 'Performance Monitoring Vanguard',
          service: 'renewable-optimization',
          action: 'verifyPerformance',
          parameters: {
            kpis: ['renewable_percentage', 'cost_savings', 'emission_reduction'],
            benchmarkComparison: true
          },
          outputs: ['performanceMetrics', 'improvements'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate Optimization Report',
          type: 'report',
          agent: 'Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'renewable-optimization',
            includeROI: true,
            sustainabilityMetrics: true
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
          schedule: '0 */4 * * *' // Every 4 hours
        },
        {
          type: 'event',
          event: 'renewable.forecast.update'
        }
      ],
      metadata: {
        requiredServices: ['renewable-optimization', 'unified-reports', 'notification'],
        requiredAgents: [
          'Weather Prediction Vanguard',
          'Demand Analysis Vanguard',
          'Dispatch Optimization Vanguard',
          'Storage Management Vanguard',
          'Grid Integration Vanguard',
          'Performance Monitoring Vanguard',
          'Reporting Vanguard'
        ],
        estimatedDuration: 3600000, // 1 hour
        criticality: 'high',
        tags: ['renewable', 'optimization', 'sustainability', 'dispatch'],
        compliance: ['EPA', 'State RPS']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Drilling Risk Assessment
  {
    useCaseId: 'drilling-risk',
    workflow: {
      id: uuidv4(),
      useCaseId: 'drilling-risk',
      name: 'Drilling Risk Assessment & Mitigation',
      description: 'Assess drilling risks, predict hazards, and implement safety measures',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'collect-data',
          name: 'Collect Drilling Data',
          type: 'detect',
          agent: 'Drilling Data Vanguard',
          service: 'drilling-risk',
          action: 'collectDrillingData',
          parameters: {
            dataTypes: ['geological', 'operational', 'equipment', 'environmental'],
            realTimeMonitoring: true,
            historicalData: true
          },
          outputs: ['drillingData', 'anomalies', 'trends'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'analyze-geology',
          name: 'Analyze Geological Risks',
          type: 'analyze',
          agent: 'Geological Analysis Vanguard',
          service: 'drilling-risk',
          action: 'analyzeGeologicalRisks',
          parameters: {
            seismicData: true,
            formationAnalysis: true,
            pressureModeling: true
          },
          outputs: ['geologicalRisks', 'hazardZones', 'recommendations'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'assess-equipment',
          name: 'Assess Equipment Integrity',
          type: 'analyze',
          agent: 'Equipment Integrity Vanguard',
          service: 'drilling-risk',
          action: 'assessEquipmentIntegrity',
          parameters: {
            predictiveMaintenance: true,
            failureAnalysis: true,
            performanceMetrics: true
          },
          outputs: ['equipmentRisks', 'maintenanceNeeds', 'failureProbability'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'evaluate-safety',
          name: 'Evaluate Safety Protocols',
          type: 'analyze',
          agent: 'Safety Evaluation Vanguard',
          service: 'drilling-risk',
          action: 'evaluateSafetyProtocols',
          parameters: {
            personnelSafety: true,
            environmentalImpact: true,
            emergencyResponse: true
          },
          outputs: ['safetyAssessment', 'gaps', 'improvements'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'risk-mitigation',
          name: 'Plan Risk Mitigation',
          type: 'decide',
          agent: 'Risk Mitigation Vanguard',
          service: 'drilling-risk',
          action: 'planRiskMitigation',
          parameters: {
            strategies: ['prevention', 'control', 'contingency'],
            costBenefitAnalysis: true
          },
          outputs: ['mitigationPlan', 'priorities', 'resources'],
          humanApprovalRequired: true,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'implement-controls',
          name: 'Implement Risk Controls',
          type: 'execute',
          agent: 'Control Implementation Vanguard',
          service: 'drilling-risk',
          action: 'implementControls',
          parameters: {
            automatedControls: true,
            manualProcedures: true,
            trainingPrograms: true
          },
          conditions: [
            {
              field: 'risk-mitigation.approved',
              operator: '=',
              value: true
            }
          ],
          outputs: ['implementationStatus', 'effectiveness'],
          errorHandling: {
            notification: {
              channels: ['email', 'teams'],
              recipients: ['drilling-safety@company.com']
            }
          }
        },
        {
          id: 'monitor-effectiveness',
          name: 'Monitor Control Effectiveness',
          type: 'verify',
          agent: 'Effectiveness Monitoring Vanguard',
          service: 'drilling-risk',
          action: 'monitorEffectiveness',
          parameters: {
            kpis: ['incident_rate', 'near_misses', 'compliance_score'],
            continuousImprovement: true
          },
          outputs: ['effectivenessReport', 'adjustments'],
          errorHandling: {
            retry: { attempts: 2, delay: 10000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate Risk Assessment Report',
          type: 'report',
          agent: 'Compliance Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'drilling-risk-assessment',
            regulatoryCompliance: true,
            executiveSummary: true
          },
          outputs: ['reportId', 'complianceStatus'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '0 0 * * *' // Daily
        },
        {
          type: 'event',
          event: 'drilling.new.operation'
        },
        {
          type: 'threshold',
          threshold: {
            metric: 'drilling.risk.score',
            operator: '>',
            value: 0.6
          }
        }
      ],
      metadata: {
        requiredServices: ['drilling-risk', 'unified-reports', 'notification'],
        requiredAgents: [
          'Drilling Data Vanguard',
          'Geological Analysis Vanguard',
          'Equipment Integrity Vanguard',
          'Safety Evaluation Vanguard',
          'Risk Mitigation Vanguard',
          'Control Implementation Vanguard',
          'Effectiveness Monitoring Vanguard',
          'Compliance Reporting Vanguard'
        ],
        estimatedDuration: 7200000, // 2 hours
        criticality: 'critical',
        tags: ['drilling', 'risk', 'safety', 'assessment'],
        compliance: ['OSHA', 'API', 'State Oil & Gas']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Environmental Compliance
  {
    useCaseId: 'environmental-compliance',
    workflow: {
      id: uuidv4(),
      useCaseId: 'environmental-compliance',
      name: 'Environmental Compliance Monitoring',
      description: 'Monitor environmental parameters, ensure compliance, and manage reporting',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-emissions',
          name: 'Monitor Environmental Emissions',
          type: 'detect',
          agent: 'Emissions Monitoring Vanguard',
          service: 'environmental-compliance',
          action: 'monitorEmissions',
          parameters: {
            pollutants: ['CO2', 'NOx', 'SOx', 'PM', 'VOCs'],
            continuousMonitoring: true,
            alertThresholds: true
          },
          outputs: ['emissionsData', 'exceedances', 'trends'],
          errorHandling: {
            retry: { attempts: 5, delay: 2000 }
          }
        },
        {
          id: 'water-quality',
          name: 'Monitor Water Quality',
          type: 'detect',
          agent: 'Water Quality Vanguard',
          service: 'environmental-compliance',
          action: 'monitorWaterQuality',
          parameters: {
            parameters: ['pH', 'temperature', 'dissolved_oxygen', 'contaminants'],
            dischargPoints: true,
            groundwater: true
          },
          outputs: ['waterQualityData', 'violations', 'impacts'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'compliance-check',
          name: 'Check Regulatory Compliance',
          type: 'analyze',
          agent: 'Compliance Analysis Vanguard',
          service: 'environmental-compliance',
          action: 'checkCompliance',
          parameters: {
            regulations: ['Clean Air Act', 'Clean Water Act', 'RCRA', 'State Regs'],
            permitLimits: true,
            reportingRequirements: true
          },
          outputs: ['complianceStatus', 'violations', 'deadlines'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'impact-assessment',
          name: 'Assess Environmental Impact',
          type: 'analyze',
          agent: 'Impact Assessment Vanguard',
          service: 'environmental-compliance',
          action: 'assessEnvironmentalImpact',
          parameters: {
            ecosystemHealth: true,
            communityImpact: true,
            carbonFootprint: true
          },
          outputs: ['impactAssessment', 'mitigation', 'improvements'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'corrective-actions',
          name: 'Plan Corrective Actions',
          type: 'decide',
          agent: 'Corrective Action Vanguard',
          service: 'environmental-compliance',
          action: 'planCorrectiveActions',
          parameters: {
            immediateActions: true,
            longTermSolutions: true,
            costAnalysis: true
          },
          conditions: [
            {
              field: 'compliance-check.violations',
              operator: '>',
              value: 0
            }
          ],
          outputs: ['actionPlan', 'timeline', 'resources'],
          humanApprovalRequired: true,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'implement-actions',
          name: 'Implement Corrective Actions',
          type: 'execute',
          agent: 'Implementation Vanguard',
          service: 'environmental-compliance',
          action: 'implementActions',
          parameters: {
            trackProgress: true,
            verifyEffectiveness: true,
            documentChanges: true
          },
          conditions: [
            {
              field: 'corrective-actions.approved',
              operator: '=',
              value: true
            }
          ],
          outputs: ['implementationStatus', 'results'],
          errorHandling: {
            notification: {
              channels: ['email', 'teams'],
              recipients: ['environmental-team@company.com']
            }
          }
        },
        {
          id: 'verify-compliance',
          name: 'Verify Compliance Achievement',
          type: 'verify',
          agent: 'Verification Vanguard',
          service: 'environmental-compliance',
          action: 'verifyCompliance',
          parameters: {
            retestParameters: true,
            documentEvidence: true,
            thirdPartyVerification: false
          },
          outputs: ['verificationStatus', 'evidence'],
          errorHandling: {
            retry: { attempts: 3, delay: 10000 }
          }
        },
        {
          id: 'regulatory-reporting',
          name: 'Submit Regulatory Reports',
          type: 'report',
          agent: 'Regulatory Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'environmental-compliance',
            agencies: ['EPA', 'State DEQ', 'Local Authorities'],
            electronicSubmission: true
          },
          outputs: ['submissionConfirmation', 'reportIds'],
          errorHandling: {
            retry: { attempts: 3, delay: 15000 }
          }
        }
      ],
      triggers: [
        {
          type: 'scheduled',
          schedule: '0 0 * * 1' // Weekly on Mondays
        },
        {
          type: 'event',
          event: 'environmental.violation.detected'
        },
        {
          type: 'threshold',
          threshold: {
            metric: 'emissions.exceedance',
            operator: '>',
            value: 0
          }
        }
      ],
      metadata: {
        requiredServices: ['environmental-compliance', 'unified-reports', 'notification'],
        requiredAgents: [
          'Emissions Monitoring Vanguard',
          'Water Quality Vanguard',
          'Compliance Analysis Vanguard',
          'Impact Assessment Vanguard',
          'Corrective Action Vanguard',
          'Implementation Vanguard',
          'Verification Vanguard',
          'Regulatory Reporting Vanguard'
        ],
        estimatedDuration: 10800000, // 3 hours
        criticality: 'high',
        tags: ['environmental', 'compliance', 'emissions', 'sustainability'],
        compliance: ['EPA', 'Clean Air Act', 'Clean Water Act', 'State Environmental']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // Load Forecasting
  {
    useCaseId: 'load-forecasting',
    workflow: {
      id: uuidv4(),
      useCaseId: 'load-forecasting',
      name: 'Energy Load Forecasting & Planning',
      description: 'Forecast energy demand, optimize generation planning, and ensure grid reliability',
      industry: 'energy-utilities',
      version: '1.0.0',
      steps: [
        {
          id: 'collect-data',
          name: 'Collect Historical & Real-time Data',
          type: 'detect',
          agent: 'Data Collection Vanguard',
          service: 'load-forecasting',
          action: 'collectData',
          parameters: {
            dataSources: ['smart_meters', 'weather', 'calendar', 'economic'],
            historicalPeriod: '2y',
            realTimeFeeds: true
          },
          outputs: ['historicalData', 'currentConditions', 'dataQuality'],
          errorHandling: {
            retry: { attempts: 3, delay: 5000 }
          }
        },
        {
          id: 'analyze-patterns',
          name: 'Analyze Load Patterns',
          type: 'analyze',
          agent: 'Pattern Analysis Vanguard',
          service: 'load-forecasting',
          action: 'analyzeLoadPatterns',
          parameters: {
            seasonality: true,
            weekdayWeekend: true,
            specialEvents: true,
            weatherCorrelation: true
          },
          outputs: ['loadPatterns', 'correlations', 'anomalies'],
          errorHandling: {
            retry: { attempts: 2, delay: 3000 }
          }
        },
        {
          id: 'forecast-demand',
          name: 'Generate Load Forecast',
          type: 'analyze',
          agent: 'Forecasting Vanguard',
          service: 'load-forecasting',
          action: 'generateForecast',
          parameters: {
            models: ['ARIMA', 'neural_network', 'ensemble'],
            horizons: ['1h', '24h', '7d', '30d'],
            confidenceIntervals: true
          },
          outputs: ['loadForecast', 'confidence', 'uncertainty'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'plan-generation',
          name: 'Plan Generation Schedule',
          type: 'decide',
          agent: 'Generation Planning Vanguard',
          service: 'load-forecasting',
          action: 'planGeneration',
          parameters: {
            generationMix: true,
            economicDispatch: true,
            reserveRequirements: true
          },
          outputs: ['generationPlan', 'unitCommitment', 'costs'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'optimize-resources',
          name: 'Optimize Resource Allocation',
          type: 'decide',
          agent: 'Resource Optimization Vanguard',
          service: 'load-forecasting',
          action: 'optimizeResources',
          parameters: {
            demandResponse: true,
            storageUtilization: true,
            transmissionConstraints: true
          },
          outputs: ['resourcePlan', 'demandResponseSignals', 'storageSchedule'],
          humanApprovalRequired: false,
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'communicate-plan',
          name: 'Communicate Load Plan',
          type: 'execute',
          agent: 'Communication Vanguard',
          service: 'load-forecasting',
          action: 'communicatePlan',
          parameters: {
            stakeholders: ['generators', 'transmission', 'distribution', 'customers'],
            channels: ['api', 'email', 'portal']
          },
          outputs: ['communicationStatus', 'acknowledgments'],
          errorHandling: {
            notification: {
              channels: ['email'],
              recipients: ['grid-planning@company.com']
            }
          }
        },
        {
          id: 'monitor-accuracy',
          name: 'Monitor Forecast Accuracy',
          type: 'verify',
          agent: 'Accuracy Monitoring Vanguard',
          service: 'load-forecasting',
          action: 'monitorAccuracy',
          parameters: {
            metrics: ['MAPE', 'RMSE', 'bias'],
            continuousLearning: true
          },
          outputs: ['accuracyReport', 'modelUpdates'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'generate-report',
          name: 'Generate Load Forecast Report',
          type: 'report',
          agent: 'Reporting Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'load-forecast',
            includeAccuracy: true,
            distributionList: ['operations', 'planning', 'trading']
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
          schedule: '0 * * * *' // Hourly
        },
        {
          type: 'event',
          event: 'load.forecast.requested'
        }
      ],
      metadata: {
        requiredServices: ['load-forecasting', 'unified-reports', 'notification'],
        requiredAgents: [
          'Data Collection Vanguard',
          