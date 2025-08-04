import { UseCaseWorkflow } from '../types/workflow.types';

const educationWorkflows: UseCaseWorkflow[] = [
  {
    id: 'student-performance-workflow',
    useCaseId: 'student-performance',
    name: 'Student Performance Prediction Workflow',
    description: 'Predict and improve student academic performance',
    industry: 'education',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 0 * * 1' // Weekly on Monday
      },
      {
        type: 'event',
        event: 'assessment.completed'
      }
    ],
    steps: [
      {
        id: 'collect-student-data',
        name: 'Collect Student Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'student-performance',
        action: 'collectStudentData',
        parameters: {
          dataTypes: ['attendance', 'grades', 'assignments', 'engagement'],
          timeframe: '30d'
        },
        outputs: ['studentData', 'dataQuality'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-performance',
        name: 'Analyze Academic Performance',
        type: 'analyze',
        agent: 'analysis',
        service: 'student-performance',
        action: 'analyzePerformance',
        parameters: {
          metrics: ['gpa_trend', 'engagement_score', 'risk_indicators'],
          peerComparison: true
        },
        outputs: ['performanceAnalysis', 'riskStudents'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'predict-outcomes',
        name: 'Predict Academic Outcomes',
        type: 'analyze',
        agent: 'prediction',
        service: 'student-performance',
        action: 'predictOutcomes',
        parameters: {
          models: ['gradient_boosting', 'neural_network'],
          predictionWindow: '90d'
        },
        outputs: ['predictions', 'confidenceScores'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'recommend-interventions',
        name: 'Recommend Interventions',
        type: 'decide',
        agent: 'optimization',
        service: 'student-performance',
        action: 'recommendInterventions',
        parameters: {
          interventionTypes: ['tutoring', 'counseling', 'study_groups', 'resource_allocation'],
          personalizedApproach: true
        },
        outputs: ['interventionPlan', 'resourceRequirements'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'notify-stakeholders',
        name: 'Notify Stakeholders',
        type: 'execute',
        agent: 'response',
        service: 'student-performance',
        action: 'notifyStakeholders',
        humanApprovalRequired: true,
        parameters: {
          stakeholders: ['teachers', 'counselors', 'parents'],
          communicationChannels: ['email', 'portal', 'app']
        },
        conditions: [
          {
            field: 'context.riskStudents.length',
            operator: '>',
            value: 0
          }
        ],
        outputs: ['notificationsSent', 'acknowledgments'],
        errorHandling: {
          notification: {
            recipients: ['academic-affairs@school.edu'],
            channels: ['email']
          }
        }
      },
      {
        id: 'track-intervention-effectiveness',
        name: 'Track Intervention Effectiveness',
        type: 'verify',
        agent: 'monitoring',
        service: 'student-performance',
        action: 'trackEffectiveness',
        parameters: {
          metrics: ['grade_improvement', 'engagement_increase', 'retention_rate'],
          comparisonBaseline: true
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
      requiredServices: ['student-performance', 'notification', 'analytics'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 420000,
      criticality: 'high',
      compliance: ['FERPA', 'COPPA'],
      tags: ['education', 'student', 'performance', 'prediction']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'curriculum-optimization-workflow',
    useCaseId: 'curriculum-optimization',
    name: 'Curriculum Optimization Workflow',
    description: 'Optimize curriculum based on learning outcomes and engagement',
    industry: 'education',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 0 1 * *' // Monthly
      },
      {
        type: 'event',
        event: 'semester.end'
      }
    ],
    steps: [
      {
        id: 'collect-learning-data',
        name: 'Collect Learning Outcomes Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'curriculum-optimization',
        action: 'collectLearningData',
        parameters: {
          dataTypes: ['assessment_scores', 'course_completion', 'feedback', 'engagement_metrics'],
          aggregationLevel: 'course'
        },
        outputs: ['learningData', 'courseMetrics'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-curriculum-effectiveness',
        name: 'Analyze Curriculum Effectiveness',
        type: 'analyze',
        agent: 'analysis',
        service: 'curriculum-optimization',
        action: 'analyzeEffectiveness',
        parameters: {
          dimensions: ['learning_outcomes', 'student_satisfaction', 'skill_development'],
          benchmarkComparison: true
        },
        outputs: ['effectivenessAnalysis', 'improvementAreas'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'identify-gaps',
        name: 'Identify Curriculum Gaps',
        type: 'analyze',
        agent: 'analysis',
        service: 'curriculum-optimization',
        action: 'identifyGaps',
        parameters: {
          gapTypes: ['content', 'skills', 'prerequisites', 'industry_alignment'],
          industryStandards: true
        },
        outputs: ['curriculumGaps', 'recommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-curriculum',
        name: 'Optimize Curriculum Structure',
        type: 'decide',
        agent: 'optimization',
        service: 'curriculum-optimization',
        action: 'optimizeCurriculum',
        parameters: {
          optimizationGoals: ['maximize_outcomes', 'improve_engagement', 'reduce_dropout'],
          constraints: ['resources', 'accreditation', 'faculty']
        },
        outputs: ['optimizedCurriculum', 'changesPlan'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-changes',
        name: 'Implement Curriculum Changes',
        type: 'execute',
        agent: 'response',
        service: 'curriculum-optimization',
        action: 'implementChanges',
        humanApprovalRequired: true,
        parameters: {
          implementationPhases: ['pilot', 'rollout', 'full'],
          changeManagement: true
        },
        outputs: ['implementationStatus', 'affectedCourses'],
        errorHandling: {
          notification: {
            recipients: ['curriculum-committee@school.edu'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'monitor-impact',
        name: 'Monitor Curriculum Impact',
        type: 'report',
        agent: 'monitoring',
        service: 'curriculum-optimization',
        action: 'monitorImpact',
        parameters: {
          metrics: ['student_outcomes', 'satisfaction_scores', 'completion_rates'],
          reportingFrequency: 'monthly'
        },
        outputs: ['impactReport', 'adjustmentRecommendations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['curriculum-optimization', 'notification', 'analytics'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 600000,
      criticality: 'medium',
      compliance: ['Accreditation Standards'],
      tags: ['education', 'curriculum', 'optimization', 'learning']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'resource-allocation-workflow',
    useCaseId: 'resource-allocation',
    name: 'Educational Resource Allocation Workflow',
    description: 'Optimize allocation of educational resources and facilities',
    industry: 'education',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 0 * * 0' // Weekly on Sunday
      },
      {
        type: 'event',
        event: 'resource.request'
      }
    ],
    steps: [
      {
        id: 'assess-resource-usage',
        name: 'Assess Current Resource Usage',
        type: 'detect',
        agent: 'monitoring',
        service: 'resource-allocation',
        action: 'assessUsage',
        parameters: {
          resourceTypes: ['classrooms', 'labs', 'equipment', 'digital_resources'],
          usageMetrics: ['utilization', 'availability', 'condition']
        },
        outputs: ['usageData', 'resourceInventory'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-demand',
        name: 'Analyze Resource Demand',
        type: 'analyze',
        agent: 'analysis',
        service: 'resource-allocation',
        action: 'analyzeDemand',
        parameters: {
          demandFactors: ['enrollment', 'course_schedule', 'special_events'],
          forecastPeriod: '30d'
        },
        outputs: ['demandAnalysis', 'peakPeriods'],
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
        service: 'resource-allocation',
        action: 'optimizeAllocation',
        parameters: {
          objectives: ['maximize_utilization', 'minimize_conflicts', 'ensure_availability'],
          constraints: ['capacity', 'compatibility', 'maintenance_schedule']
        },
        outputs: ['allocationPlan', 'scheduleOptimization'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'implement-allocation',
        name: 'Implement Resource Allocation',
        type: 'execute',
        agent: 'response',
        service: 'resource-allocation',
        action: 'implementAllocation',
        parameters: {
          updateSystems: ['scheduling', 'booking', 'inventory'],
          notifyUsers: true
        },
        outputs: ['allocationImplemented', 'notifications'],
        errorHandling: {
          notification: {
            recipients: ['facilities@school.edu'],
            channels: ['email']
          }
        }
      },
      {
        id: 'monitor-efficiency',
        name: 'Monitor Allocation Efficiency',
        type: 'verify',
        agent: 'monitoring',
        service: 'resource-allocation',
        action: 'monitorEfficiency',
        parameters: {
          kpis: ['utilization_rate', 'conflict_resolution', 'user_satisfaction'],
          alertThresholds: {
            utilizationMin: 0.6,
            conflictMax: 5
          }
        },
        outputs: ['efficiencyReport', 'alerts'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['resource-allocation', 'notification', 'scheduling'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'medium',
      compliance: ['Safety Standards'],
      tags: ['education', 'resources', 'allocation', 'optimization']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default educationWorkflows;