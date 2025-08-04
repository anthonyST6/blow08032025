import { UseCaseAuditConfig } from './use-case-audit-config';

/**
 * Additional audit configurations for missing workflows (Part 2)
 */
export const missingWorkflowAuditConfigsPart2: Record<string, UseCaseAuditConfig> = {
  'aml-monitoring': {
    useCaseId: 'aml-monitoring',
    customParticulars: {
      fields: [
        { name: 'accountsMonitored', type: 'number', required: true, description: 'Accounts monitored' },
        { name: 'alertsGenerated', type: 'number', required: false, description: 'Alerts generated' },
        { name: 'investigationsOpened', type: 'number', required: false, description: 'Investigations opened' },
        { name: 'riskRating', type: 'string', required: false, description: 'Overall risk rating' },
        { name: 'patternDetection', type: 'array', required: false, description: 'Suspicious patterns detected' },
        { name: 'reportingTimeliness', type: 'number', required: false, description: 'Reporting timeliness score' }
      ],
      extractors: {
        accountsMonitored: (context) => context.results?.monitoring?.accountCount || 0,
        alertsGenerated: (context) => context.results?.alerts?.count || 0,
        investigationsOpened: (context) => context.results?.investigations?.opened || 0,
        riskRating: (context) => context.results?.risk?.rating || 'low',
        patternDetection: (context) => context.results?.patterns?.detected || [],
        reportingTimeliness: (context) => context.results?.reporting?.timelinessScore
      }
    }
  },

  // Manufacturing - Missing Configurations
  'quality-inspection': {
    useCaseId: 'quality-inspection',
    customParticulars: {
      fields: [
        { name: 'itemsInspected', type: 'number', required: true, description: 'Items inspected' },
        { name: 'defectsDetected', type: 'number', required: false, description: 'Defects detected' },
        { name: 'accuracyRate', type: 'number', required: false, description: 'Inspection accuracy rate' },
        { name: 'defectTypes', type: 'array', required: false, description: 'Types of defects found' },
        { name: 'qualityScore', type: 'number', required: false, description: 'Overall quality score' },
        { name: 'processImprovement', type: 'object', required: false, description: 'Process improvement suggestions' }
      ],
      extractors: {
        itemsInspected: (context) => context.results?.inspection?.itemCount || 0,
        defectsDetected: (context) => context.results?.defects?.count || 0,
        accuracyRate: (context) => context.results?.accuracy?.rate,
        defectTypes: (context) => context.results?.defects?.types || [],
        qualityScore: (context) => context.results?.quality?.overallScore,
        processImprovement: (context) => context.results?.improvement?.suggestions || {}
      }
    }
  },

  // Retail - Missing Configurations
  'customer-personalization': {
    useCaseId: 'customer-personalization',
    customParticulars: {
      fields: [
        { name: 'customersTargeted', type: 'number', required: true, description: 'Customers targeted' },
        { name: 'conversionRate', type: 'number', required: false, description: 'Conversion rate improvement' },
        { name: 'avgOrderValue', type: 'number', required: false, description: 'Average order value increase' },
        { name: 'engagementScore', type: 'number', required: false, description: 'Customer engagement score' },
        { name: 'recommendationAccuracy', type: 'number', required: false, description: 'Recommendation accuracy' },
        { name: 'customerSatisfaction', type: 'number', required: false, description: 'Customer satisfaction score' }
      ],
      extractors: {
        customersTargeted: (context) => context.results?.targeting?.customerCount || 0,
        conversionRate: (context) => context.results?.conversion?.rateImprovement,
        avgOrderValue: (context) => context.results?.revenue?.avgOrderIncrease,
        engagementScore: (context) => context.results?.engagement?.score,
        recommendationAccuracy: (context) => context.results?.recommendations?.accuracy,
        customerSatisfaction: (context) => context.results?.satisfaction?.score
      }
    }
  },

  // Education - Missing Configurations
  'adaptive-learning': {
    useCaseId: 'adaptive-learning',
    customParticulars: {
      fields: [
        { name: 'studentsEnrolled', type: 'number', required: true, description: 'Students enrolled' },
        { name: 'learningPathsCreated', type: 'number', required: false, description: 'Learning paths created' },
        { name: 'performanceImprovement', type: 'number', required: false, description: 'Performance improvement rate' },
        { name: 'engagementLevel', type: 'number', required: false, description: 'Student engagement level' },
        { name: 'completionRate', type: 'number', required: false, description: 'Course completion rate' },
        { name: 'adaptationEffectiveness', type: 'number', required: false, description: 'Adaptation effectiveness score' }
      ],
      extractors: {
        studentsEnrolled: (context) => context.results?.enrollment?.studentCount || 0,
        learningPathsCreated: (context) => context.results?.paths?.created || 0,
        performanceImprovement: (context) => context.results?.performance?.improvement,
        engagementLevel: (context) => context.results?.engagement?.level,
        completionRate: (context) => context.results?.completion?.rate,
        adaptationEffectiveness: (context) => context.results?.adaptation?.effectiveness
      }
    }
  },

  'content-recommendation': {
    useCaseId: 'content-recommendation',
    customParticulars: {
      fields: [
        { name: 'contentItems', type: 'number', required: true, description: 'Content items analyzed' },
        { name: 'recommendationsMade', type: 'number', required: false, description: 'Recommendations made' },
        { name: 'clickThroughRate', type: 'number', required: false, description: 'Click-through rate' },
        { name: 'relevanceScore', type: 'number', required: false, description: 'Content relevance score' },
        { name: 'learningOutcomes', type: 'object', required: false, description: 'Learning outcome improvements' },
        { name: 'userSatisfaction', type: 'number', required: false, description: 'User satisfaction rating' }
      ],
      extractors: {
        contentItems: (context) => context.results?.content?.itemCount || 0,
        recommendationsMade: (context) => context.results?.recommendations?.count || 0,
        clickThroughRate: (context) => context.results?.engagement?.clickRate,
        relevanceScore: (context) => context.results?.relevance?.score,
        learningOutcomes: (context) => context.results?.outcomes?.improvements || {},
        userSatisfaction: (context) => context.results?.satisfaction?.rating
      }
    }
  },

  // Pharmaceutical - Missing Configurations
  'adverse-event': {
    useCaseId: 'adverse-event',
    customParticulars: {
      fields: [
        { name: 'eventsMonitored', type: 'number', required: true, description: 'Adverse events monitored' },
        { name: 'signalsDetected', type: 'number', required: false, description: 'Safety signals detected' },
        { name: 'severityDistribution', type: 'object', required: false, description: 'Event severity distribution' },
        { name: 'reportingTimeline', type: 'number', required: false, description: 'Average reporting time' },
        { name: 'regulatoryCompliance', type: 'boolean', required: false, description: 'Regulatory compliance status' },
        { name: 'patientSafety', type: 'object', required: false, description: 'Patient safety metrics' }
      ],
      extractors: {
        eventsMonitored: (context) => context.results?.monitoring?.eventCount || 0,
        signalsDetected: (context) => context.results?.detection?.signalCount || 0,
        severityDistribution: (context) => context.results?.severity?.distribution || {},
        reportingTimeline: (context) => context.results?.reporting?.avgTime,
        regulatoryCompliance: (context) => context.results?.compliance?.status || true,
        patientSafety: (context) => context.results?.safety?.metrics || {}
      }
    }
  }
};

// Export all missing workflow configurations combined
export const allMissingWorkflowAuditConfigs: Record<string, UseCaseAuditConfig> = {
  ...missingWorkflowAuditConfigsPart2
};