import { extendedUseCaseAuditConfigs } from './use-case-audit-config-extended';
import { completeUseCaseAuditConfigs, getCompleteAuditConfig } from './use-case-audit-config-complete';
import { getMasterAuditConfig, hasMasterAuditConfig } from './audit-config-master';
import { getCompleteAuditConfig as getIntegratedAuditConfig, hasCompleteAuditConfig } from './audit-config-complete-integration';
import { createGenericAuditConfig } from './audit-config-generic';

export interface UseCaseAuditConfig {
  useCaseId: string;
  customParticulars: {
    fields: Array<{
      name: string;
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required: boolean;
      description: string;
    }>;
    extractors: {
      [fieldName: string]: (context: any) => any;
    };
  };
}

export const baseUseCaseAuditConfigs: Record<string, UseCaseAuditConfig> = {
  // Energy & Utilities - Oilfield Land Lease
  'oilfield-land-lease': {
    useCaseId: 'oilfield-land-lease',
    customParticulars: {
      fields: [
        { name: 'leaseId', type: 'string', required: true, description: 'Lease identifier' },
        { name: 'leaseValue', type: 'number', required: false, description: 'Monetary value of the lease' },
        { name: 'expirationDate', type: 'string', required: false, description: 'Lease expiration date' },
        { name: 'propertyLocation', type: 'object', required: false, description: 'Geographic location details' },
        { name: 'renewalStatus', type: 'string', required: false, description: 'Current renewal status' },
        { name: 'riskScore', type: 'number', required: false, description: 'Calculated risk score' },
        { name: 'complianceStatus', type: 'boolean', required: false, description: 'Regulatory compliance status' }
      ],
      extractors: {
        leaseId: (context) => context.promptData?.leaseId || context.configuration?.leaseId,
        leaseValue: (context) => context.results?.leaseAnalysis?.value,
        expirationDate: (context) => context.results?.leaseAnalysis?.expirationDate,
        propertyLocation: (context) => context.results?.gisData?.location,
        renewalStatus: (context) => context.results?.renewalAnalysis?.status,
        riskScore: (context) => context.results?.riskAssessment?.score,
        complianceStatus: (context) => context.results?.complianceCheck?.passed
      }
    }
  },

  // Energy & Utilities - Energy Load Forecasting
  'energy-load-forecasting': {
    useCaseId: 'energy-load-forecasting',
    customParticulars: {
      fields: [
        { name: 'forecastPeriod', type: 'string', required: true, description: 'Time period for forecast' },
        { name: 'peakLoadMW', type: 'number', required: false, description: 'Predicted peak load in MW' },
        { name: 'accuracy', type: 'number', required: false, description: 'Model accuracy percentage' },
        { name: 'weatherFactors', type: 'object', required: false, description: 'Weather impact factors' },
        { name: 'recommendedReserves', type: 'number', required: false, description: 'Recommended reserve capacity' },
        { name: 'costOptimization', type: 'number', required: false, description: 'Potential cost savings' }
      ],
      extractors: {
        forecastPeriod: (context) => context.configuration?.forecastPeriod || '24-hour',
        peakLoadMW: (context) => context.results?.forecast?.peakLoad,
        accuracy: (context) => context.results?.modelMetrics?.accuracy,
        weatherFactors: (context) => context.results?.weatherAnalysis,
        recommendedReserves: (context) => context.results?.optimization?.reserves,
        costOptimization: (context) => context.results?.optimization?.savings
      }
    }
  },

  // Energy & Utilities - Grid Anomaly Detection
  'grid-anomaly-detection': {
    useCaseId: 'grid-anomaly-detection',
    customParticulars: {
      fields: [
        { name: 'gridSector', type: 'string', required: true, description: 'Grid sector identifier' },
        { name: 'anomaliesDetected', type: 'number', required: false, description: 'Number of anomalies found' },
        { name: 'severity', type: 'string', required: false, description: 'Highest severity level' },
        { name: 'affectedAssets', type: 'array', required: false, description: 'List of affected equipment' },
        { name: 'predictedFailures', type: 'array', required: false, description: 'Predicted failure events' },
        { name: 'mitigationActions', type: 'array', required: false, description: 'Recommended actions' }
      ],
      extractors: {
        gridSector: (context) => context.configuration?.gridSector || context.promptData?.sector,
        anomaliesDetected: (context) => context.results?.anomalyAnalysis?.count,
        severity: (context) => context.results?.anomalyAnalysis?.maxSeverity,
        affectedAssets: (context) => context.results?.affectedEquipment,
        predictedFailures: (context) => context.results?.predictions?.failures,
        mitigationActions: (context) => context.results?.recommendations?.actions
      }
    }
  },

  // Healthcare - Patient Intake Automation
  'patient-intake': {
    useCaseId: 'patient-intake',
    customParticulars: {
      fields: [
        { name: 'patientCount', type: 'number', required: true, description: 'Number of patients processed' },
        { name: 'completionRate', type: 'number', required: false, description: 'Form completion percentage' },
        { name: 'insuranceVerified', type: 'number', required: false, description: 'Insurance verifications completed' },
        { name: 'avgProcessingTime', type: 'number', required: false, description: 'Average processing time in minutes' },
        { name: 'dataQualityScore', type: 'number', required: false, description: 'Data quality assessment score' },
        { name: 'appointmentsScheduled', type: 'number', required: false, description: 'Appointments auto-scheduled' }
      ],
      extractors: {
        patientCount: (context) => context.results?.intake?.totalPatients || 0,
        completionRate: (context) => context.results?.intake?.completionRate,
        insuranceVerified: (context) => context.results?.verification?.successCount,
        avgProcessingTime: (context) => context.results?.metrics?.avgTime,
        dataQualityScore: (context) => context.results?.quality?.score,
        appointmentsScheduled: (context) => context.results?.scheduling?.count
      }
    }
  },

  // Healthcare - Clinical Trial Matching
  'clinical-trial-matching': {
    useCaseId: 'clinical-trial-matching',
    customParticulars: {
      fields: [
        { name: 'patientsScreened', type: 'number', required: true, description: 'Total patients screened' },
        { name: 'trialsMatched', type: 'number', required: false, description: 'Number of trial matches' },
        { name: 'eligibilityRate', type: 'number', required: false, description: 'Eligibility success rate' },
        { name: 'therapeuticAreas', type: 'array', required: false, description: 'Therapeutic areas covered' },
        { name: 'confidenceScores', type: 'object', required: false, description: 'Match confidence metrics' },
        { name: 'enrollmentPotential', type: 'number', required: false, description: 'Potential enrollment count' }
      ],
      extractors: {
        patientsScreened: (context) => context.results?.screening?.totalPatients || 0,
        trialsMatched: (context) => context.results?.matching?.matchCount,
        eligibilityRate: (context) => context.results?.eligibility?.successRate,
        therapeuticAreas: (context) => context.results?.analysis?.therapeuticAreas,
        confidenceScores: (context) => context.results?.matching?.confidenceMetrics,
        enrollmentPotential: (context) => context.results?.projections?.enrollment
      }
    }
  },

  // Healthcare - Patient Risk (legacy)
  'patient-risk': {
    useCaseId: 'patient-risk',
    customParticulars: {
      fields: [
        { name: 'patientsAnalyzed', type: 'number', required: true, description: 'Number of patients analyzed' },
        { name: 'highRiskCount', type: 'number', required: false, description: 'High-risk patients identified' },
        { name: 'readmissionRisk', type: 'number', required: false, description: 'Average readmission risk' },
        { name: 'interventionsRecommended', type: 'number', required: false, description: 'Care interventions suggested' },
        { name: 'costImpact', type: 'number', required: false, description: 'Projected cost savings' },
        { name: 'clinicalFlags', type: 'array', required: false, description: 'Clinical warning flags' }
      ],
      extractors: {
        patientsAnalyzed: (context) => context.results?.analysis?.patientCount || 0,
        highRiskCount: (context) => context.results?.riskStratification?.highRisk,
        readmissionRisk: (context) => context.results?.predictions?.avgReadmissionRisk,
        interventionsRecommended: (context) => context.results?.recommendations?.count,
        costImpact: (context) => context.results?.financialAnalysis?.savings,
        clinicalFlags: (context) => context.results?.alerts?.clinicalFlags
      }
    }
  },

  // Finance & Banking - Transaction Fraud Detection
  'fraud-detection': {
    useCaseId: 'fraud-detection',
    customParticulars: {
      fields: [
        { name: 'transactionsAnalyzed', type: 'number', required: true, description: 'Total transactions analyzed' },
        { name: 'fraudsDetected', type: 'number', required: false, description: 'Fraudulent transactions found' },
        { name: 'falsePositiveRate', type: 'number', required: false, description: 'False positive percentage' },
        { name: 'amountProtected', type: 'number', required: false, description: 'Total amount protected' },
        { name: 'fraudPatterns', type: 'array', required: false, description: 'Detected fraud patterns' },
        { name: 'riskScoreDistribution', type: 'object', required: false, description: 'Risk score distribution' }
      ],
      extractors: {
        transactionsAnalyzed: (context) => context.results?.analysis?.totalTransactions || 0,
        fraudsDetected: (context) => context.results?.detection?.fraudCount,
        falsePositiveRate: (context) => context.results?.metrics?.falsePositiveRate,
        amountProtected: (context) => context.results?.financial?.amountProtected,
        fraudPatterns: (context) => context.results?.patterns?.detected,
        riskScoreDistribution: (context) => context.results?.analysis?.riskDistribution
      }
    }
  },

  // Finance & Banking - Automated Loan Processing
  'loan-processing': {
    useCaseId: 'loan-processing',
    customParticulars: {
      fields: [
        { name: 'applicationsProcessed', type: 'number', required: true, description: 'Loan applications processed' },
        { name: 'autoApproved', type: 'number', required: false, description: 'Auto-approved applications' },
        { name: 'avgProcessingTime', type: 'number', required: false, description: 'Average processing time' },
        { name: 'totalLoanAmount', type: 'number', required: false, description: 'Total loan amount processed' },
        { name: 'riskDistribution', type: 'object', required: false, description: 'Risk category distribution' },
        { name: 'documentationScore', type: 'number', required: false, description: 'Documentation completeness' }
      ],
      extractors: {
        applicationsProcessed: (context) => context.results?.processing?.totalApplications || 0,
        autoApproved: (context) => context.results?.decisions?.autoApproved,
        avgProcessingTime: (context) => context.results?.metrics?.avgProcessingTime,
        totalLoanAmount: (context) => context.results?.financial?.totalAmount,
        riskDistribution: (context) => context.results?.risk?.distribution,
        documentationScore: (context) => context.results?.quality?.documentationScore
      }
    }
  },

  // Manufacturing - Predictive Maintenance
  'predictive-maintenance': {
    useCaseId: 'predictive-maintenance',
    customParticulars: {
      fields: [
        { name: 'assetsMonitored', type: 'number', required: true, description: 'Number of assets monitored' },
        { name: 'failuresPredicted', type: 'number', required: false, description: 'Predicted failures' },
        { name: 'maintenanceScheduled', type: 'number', required: false, description: 'Maintenance tasks scheduled' },
        { name: 'downtimeAvoided', type: 'number', required: false, description: 'Downtime hours avoided' },
        { name: 'costSavings', type: 'number', required: false, description: 'Maintenance cost savings' },
        { name: 'healthScores', type: 'object', required: false, description: 'Asset health score summary' }
      ],
      extractors: {
        assetsMonitored: (context) => context.results?.monitoring?.assetCount || 0,
        failuresPredicted: (context) => context.results?.predictions?.failureCount,
        maintenanceScheduled: (context) => context.results?.scheduling?.taskCount,
        downtimeAvoided: (context) => context.results?.impact?.downtimeHours,
        costSavings: (context) => context.results?.financial?.savings,
        healthScores: (context) => context.results?.health?.summary
      }
    }
  }
};

// Merge base, extended, and complete configurations
export const useCaseAuditConfigs: Record<string, UseCaseAuditConfig> = {
  ...baseUseCaseAuditConfigs,
  ...extendedUseCaseAuditConfigs,
  ...completeUseCaseAuditConfigs
};

export function getUseCaseAuditConfig(useCaseId: string): UseCaseAuditConfig | undefined {
  // First check the integrated complete config (includes all configurations)
  const integratedConfig = getIntegratedAuditConfig(useCaseId);
  if (integratedConfig) {
    return integratedConfig;
  }
  
  // Fallback to original checks
  if (useCaseAuditConfigs[useCaseId]) {
    return useCaseAuditConfigs[useCaseId];
  }
  
  // Check with -workflow suffix
  const workflowId = useCaseId.endsWith('-workflow') ? useCaseId : `${useCaseId}-workflow`;
  if (useCaseAuditConfigs[workflowId]) {
    return {
      ...useCaseAuditConfigs[workflowId],
      useCaseId // Keep the original ID
    };
  }
  
  // Then check the complete audit config (handles UUID mappings)
  const completeConfig = getCompleteAuditConfig(useCaseId);
  if (completeConfig) {
    return completeConfig;
  }
  
  // Check the master audit config (handles all workflows)
  const masterConfig = getMasterAuditConfig(useCaseId);
  if (masterConfig) {
    return masterConfig;
  }
  
  // If no specific config found, return a generic audit config
  // This ensures ALL use cases have audit trail functionality
  return createGenericAuditConfig(useCaseId);
}

// Get all configured use case IDs
export function getAllConfiguredUseCaseIds(): string[] {
  const allIds = new Set<string>();
  
  // Add all direct config IDs
  Object.keys(useCaseAuditConfigs).forEach(id => allIds.add(id));
  
  // Add all complete config IDs
  Object.keys(completeUseCaseAuditConfigs).forEach(id => allIds.add(id));
  
  return Array.from(allIds);
}

// Check if a use case has audit configuration
export function hasAuditConfig(useCaseId: string): boolean {
  // With generic fallback, all use cases now have audit config
  return true;
}

export function extractCustomParticulars(
  useCaseId: string,
  context: {
    promptData?: any;
    configuration?: any;
    results?: any;
  }
): Record<string, any> {
  const config = getUseCaseAuditConfig(useCaseId);
  if (!config) {
    return {};
  }

  const customParticulars: Record<string, any> = {};

  for (const field of config.customParticulars.fields) {
    const extractor = config.customParticulars.extractors[field.name];
    if (extractor) {
      try {
        const value = extractor(context);
        if (value !== undefined && value !== null) {
          customParticulars[field.name] = value;
        } else if (field.required) {
          customParticulars[field.name] = field.type === 'number' ? 0 : 
                                          field.type === 'array' ? [] :
                                          field.type === 'object' ? {} :
                                          field.type === 'boolean' ? false : '';
        }
      } catch (error) {
        // If extraction fails, use default value for required fields
        if (field.required) {
          customParticulars[field.name] = field.type === 'number' ? 0 : 
                                          field.type === 'array' ? [] :
                                          field.type === 'object' ? {} :
                                          field.type === 'boolean' ? false : '';
        }
      }
    }
  }

  return customParticulars;
}