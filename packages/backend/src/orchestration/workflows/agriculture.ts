import { UseCaseWorkflow } from '../types/workflow.types';

const agricultureWorkflows: UseCaseWorkflow[] = [
  {
    id: 'crop-yield-workflow',
    useCaseId: 'crop-yield-prediction',
    name: 'Crop Yield Prediction Workflow',
    description: 'Predict crop yields using AI and environmental data',
    industry: 'agriculture',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 6 * * *' // Daily at 6 AM
      },
      {
        type: 'event',
        event: 'weather.significant.change'
      }
    ],
    steps: [
      {
        id: 'collect-field-data',
        name: 'Collect Field Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'crop-yield-prediction',
        action: 'collectFieldData',
        parameters: {
          dataSources: ['satellite_imagery', 'iot_sensors', 'weather_stations', 'soil_samples'],
          metrics: ['ndvi', 'soil_moisture', 'temperature', 'nutrients']
        },
        outputs: ['fieldData', 'growthStage'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-conditions',
        name: 'Analyze Growing Conditions',
        type: 'analyze',
        agent: 'analysis',
        service: 'crop-yield-prediction',
        action: 'analyzeConditions',
        parameters: {
          factors: ['weather_patterns', 'pest_pressure', 'disease_risk', 'water_stress'],
          historicalComparison: true
        },
        outputs: ['conditionAnalysis', 'riskFactors'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-yield',
        name: 'Predict Crop Yield',
        type: 'analyze',
        agent: 'prediction',
        service: 'crop-yield-prediction',
        action: 'predictYield',
        parameters: {
          models: ['machine_learning', 'crop_simulation', 'ensemble'],
          timeHorizon: 'harvest'
        },
        outputs: ['yieldPrediction', 'confidenceInterval'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'recommend-actions',
        name: 'Recommend Farming Actions',
        type: 'decide',
        agent: 'optimization',
        service: 'crop-yield-prediction',
        action: 'recommendActions',
        parameters: {
          actionTypes: ['irrigation', 'fertilization', 'pest_control', 'harvest_timing'],
          costBenefitAnalysis: true
        },
        outputs: ['recommendations', 'expectedImpact'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'notify-farmer',
        name: 'Notify Farmer of Recommendations',
        type: 'execute',
        agent: 'response',
        service: 'crop-yield-prediction',
        action: 'notifyFarmer',
        humanApprovalRequired: false,
        parameters: {
          channels: ['mobile_app', 'sms', 'email'],
          language: 'localized',
          includeVisualizations: true
        },
        outputs: ['notificationSent', 'farmerResponse'],
        errorHandling: {
          notification: {
            recipients: ['farm-manager@agriculture.com'],
            channels: ['email']
          }
        }
      },
      {
        id: 'track-outcomes',
        name: 'Track Yield Outcomes',
        type: 'verify',
        agent: 'monitoring',
        service: 'crop-yield-prediction',
        action: 'trackOutcomes',
        parameters: {
          compareToPrediction: true,
          updateModels: true
        },
        outputs: ['actualYield', 'modelAccuracy'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['crop-yield-prediction', 'notification', 'weather-data'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 360000,
      criticality: 'high',
      compliance: ['USDA Standards', 'Environmental Regulations'],
      tags: ['agriculture', 'crop-yield', 'prediction', 'precision-farming']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'irrigation-optimization-workflow',
    useCaseId: 'irrigation-optimization',
    name: 'Smart Irrigation Optimization Workflow',
    description: 'Optimize irrigation schedules and water usage',
    industry: 'agriculture',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 */4 * * *' // Every 4 hours
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'soil.moisture',
          operator: '<',
          value: 0.3
        }
      }
    ],
    steps: [
      {
        id: 'monitor-moisture',
        name: 'Monitor Soil Moisture',
        type: 'detect',
        agent: 'monitoring',
        service: 'irrigation-optimization',
        action: 'monitorMoisture',
        parameters: {
          sensorNetwork: 'field_grid',
          depth: ['surface', '10cm', '30cm'],
          frequency: '15m'
        },
        outputs: ['moistureData', 'fieldZones'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-water-needs',
        name: 'Analyze Water Requirements',
        type: 'analyze',
        agent: 'analysis',
        service: 'irrigation-optimization',
        action: 'analyzeWaterNeeds',
        parameters: {
          factors: ['crop_type', 'growth_stage', 'weather_forecast', 'evapotranspiration'],
          zoneSpecific: true
        },
        outputs: ['waterRequirements', 'deficitZones'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-demand',
        name: 'Predict Water Demand',
        type: 'analyze',
        agent: 'prediction',
        service: 'irrigation-optimization',
        action: 'predictDemand',
        parameters: {
          forecastPeriod: '7d',
          includeWeather: true,
          cropModels: true
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
        id: 'optimize-schedule',
        name: 'Optimize Irrigation Schedule',
        type: 'decide',
        agent: 'optimization',
        service: 'irrigation-optimization',
        action: 'optimizeSchedule',
        parameters: {
          objectives: ['minimize_water_use', 'maximize_yield', 'reduce_energy_cost'],
          constraints: ['water_availability', 'pump_capacity', 'time_restrictions']
        },
        outputs: ['irrigationSchedule', 'waterSavings'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'execute-irrigation',
        name: 'Execute Irrigation Plan',
        type: 'execute',
        agent: 'response',
        service: 'irrigation-optimization',
        action: 'executeIrrigation',
        humanApprovalRequired: false,
        parameters: {
          automationLevel: 'full',
          valveControl: true,
          flowMonitoring: true
        },
        conditions: [
          {
            field: 'context.moistureData.average',
            operator: '<',
            value: 0.4
          }
        ],
        outputs: ['irrigationStatus', 'waterUsed'],
        errorHandling: {
          notification: {
            recipients: ['irrigation-manager@farm.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'verify-effectiveness',
        name: 'Verify Irrigation Effectiveness',
        type: 'report',
        agent: 'monitoring',
        service: 'irrigation-optimization',
        action: 'verifyEffectiveness',
        parameters: {
          metrics: ['moisture_improvement', 'water_efficiency', 'crop_health'],
          generateReport: true
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
      requiredServices: ['irrigation-optimization', 'notification', 'weather-service'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['Water Conservation Laws', 'Environmental Standards'],
      tags: ['agriculture', 'irrigation', 'water-management', 'optimization']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pest-disease-workflow',
    useCaseId: 'pest-disease-detection',
    name: 'Pest and Disease Detection Workflow',
    description: 'Early detection and management of crop pests and diseases',
    industry: 'agriculture',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 7 * * *' // Daily at 7 AM
      },
      {
        type: 'event',
        event: 'field.inspection.request'
      }
    ],
    steps: [
      {
        id: 'capture-imagery',
        name: 'Capture Field Imagery',
        type: 'detect',
        agent: 'monitoring',
        service: 'pest-disease-detection',
        action: 'captureImagery',
        parameters: {
          imageryTypes: ['drone', 'satellite', 'ground_cameras'],
          resolution: 'high',
          spectralBands: ['rgb', 'nir', 'thermal']
        },
        outputs: ['fieldImagery', 'anomalyAreas'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'detect-issues',
        name: 'Detect Pest and Disease Issues',
        type: 'analyze',
        agent: 'security',
        service: 'pest-disease-detection',
        action: 'detectIssues',
        parameters: {
          detectionModels: ['computer_vision', 'pattern_recognition', 'spectral_analysis'],
          knowledgeBase: 'regional_pests_diseases'
        },
        outputs: ['detectedIssues', 'affectedAreas'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'assess-severity',
        name: 'Assess Infestation Severity',
        type: 'analyze',
        agent: 'analysis',
        service: 'pest-disease-detection',
        action: 'assessSeverity',
        parameters: {
          severityMetrics: ['spread_rate', 'crop_damage', 'yield_impact'],
          historicalData: true
        },
        outputs: ['severityAssessment', 'spreadPrediction'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'recommend-treatment',
        name: 'Recommend Treatment Plan',
        type: 'decide',
        agent: 'optimization',
        service: 'pest-disease-detection',
        action: 'recommendTreatment',
        parameters: {
          treatmentOptions: ['biological', 'chemical', 'cultural', 'integrated'],
          considerFactors: ['effectiveness', 'cost', 'environmental_impact', 'resistance']
        },
        outputs: ['treatmentPlan', 'applicationSchedule'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-treatment',
        name: 'Implement Treatment Actions',
        type: 'execute',
        agent: 'response',
        service: 'pest-disease-detection',
        action: 'implementTreatment',
        humanApprovalRequired: true,
        parameters: {
          precisionApplication: true,
          droneDeployment: true,
          safetyProtocols: true
        },
        conditions: [
          {
            field: 'context.severityAssessment.level',
            operator: '>',
            value: 'moderate'
          }
        ],
        outputs: ['treatmentExecuted', 'coverageMap'],
        errorHandling: {
          notification: {
            recipients: ['crop-protection@farm.com'],
            channels: ['email', 'slack']
          }
        }
      },
      {
        id: 'monitor-results',
        name: 'Monitor Treatment Results',
        type: 'verify',
        agent: 'monitoring',
        service: 'pest-disease-detection',
        action: 'monitorResults',
        parameters: {
          followUpPeriod: '14d',
          effectivenessMetrics: ['pest_reduction', 'disease_control', 'crop_recovery']
        },
        outputs: ['treatmentResults', 'furtherActions'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['pest-disease-detection', 'notification', 'imagery-analysis'],
      requiredAgents: ['monitoring', 'security', 'analysis', 'optimization', 'response'],
      estimatedDuration: 480000,
      criticality: 'high',
      compliance: ['EPA Regulations', 'Organic Standards'],
      tags: ['agriculture', 'pest-control', 'disease-management', 'precision-agriculture']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default agricultureWorkflows;