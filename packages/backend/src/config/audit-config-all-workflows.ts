import { UseCaseAuditConfig } from './use-case-audit-config';

// Comprehensive audit configurations for all workflows
export const allWorkflowAuditConfigs: Record<string, UseCaseAuditConfig> = {
  // Energy & Utilities - Grid Resilience (UUID)
  '658eba0c-9dc5-4ac8-b9e9-fd5cd898bf18': {
    useCaseId: '658eba0c-9dc5-4ac8-b9e9-fd5cd898bf18',
    customParticulars: {
      fields: [
        { name: 'gridSegments', type: 'number', required: true, description: 'Grid segments analyzed' },
        { name: 'resilienceScore', type: 'number', required: false, description: 'Overall resilience score' },
        { name: 'vulnerabilities', type: 'array', required: false, description: 'Identified vulnerabilities' },
        { name: 'criticalAssets', type: 'number', required: false, description: 'Critical assets at risk' },
        { name: 'mitigationStrategies', type: 'array', required: false, description: 'Recommended strategies' },
        { name: 'investmentRequired', type: 'number', required: false, description: 'Required investment' }
      ],
      extractors: {
        gridSegments: (context) => context.configuration?.segments || context.results?.analysis?.segmentCount || 0,
        resilienceScore: (context) => context.results?.assessment?.resilienceScore,
        vulnerabilities: (context) => context.results?.vulnerabilities?.list,
        criticalAssets: (context) => context.results?.assets?.criticalCount,
        mitigationStrategies: (context) => context.results?.recommendations?.strategies,
        investmentRequired: (context) => context.results?.financial?.requiredInvestment
      }
    }
  },

  // Energy & Utilities - Methane Detection (UUID)
  '52bacef6-5042-4a9c-ad85-2d1f9ea24bdb': {
    useCaseId: '52bacef6-5042-4a9c-ad85-2d1f9ea24bdb',
    customParticulars: {
      fields: [
        { name: 'sitesMonitored', type: 'number', required: true, description: 'Number of sites monitored' },
        { name: 'leaksDetected', type: 'number', required: false, description: 'Methane leaks detected' },
        { name: 'emissionRate', type: 'number', required: false, description: 'Total emission rate (kg/hr)' },
        { name: 'severityDistribution', type: 'object', required: false, description: 'Leak severity breakdown' },
        { name: 'complianceStatus', type: 'boolean', required: false, description: 'EPA compliance status' },
        { name: 'repairPriority', type: 'array', required: false, description: 'Prioritized repair list' }
      ],
      extractors: {
        sitesMonitored: (context) => context.results?.monitoring?.siteCount || 0,
        leaksDetected: (context) => context.results?.detection?.leakCount,
        emissionRate: (context) => context.results?.emissions?.totalRate,
        severityDistribution: (context) => context.results?.analysis?.severityBreakdown,
        complianceStatus: (context) => context.results?.compliance?.epaCompliant,
        repairPriority: (context) => context.results?.recommendations?.repairQueue
      }
    }
  },

  // Energy & Utilities - PHMSA Compliance (UUID)
  'e9fac56a-0eef-4674-943d-681b0c45fc31': {
    useCaseId: 'e9fac56a-0eef-4674-943d-681b0c45fc31',
    customParticulars: {
      fields: [
        { name: 'pipelinesMonitored', type: 'number', required: true, description: 'Pipelines monitored' },
        { name: 'complianceScore', type: 'number', required: false, description: 'PHMSA compliance score' },
        { name: 'violations', type: 'array', required: false, description: 'Compliance violations' },
        { name: 'reportsFiled', type: 'number', required: false, description: 'Reports filed' },
        { name: 'incidentRisk', type: 'number', required: false, description: 'Incident risk level' },
        { name: 'remediationCost', type: 'number', required: false, description: 'Estimated remediation cost' }
      ],
      extractors: {
        pipelinesMonitored: (context) => context.results?.monitoring?.pipelineCount || 0,
        complianceScore: (context) => context.results?.compliance?.phmsaScore,
        violations: (context) => context.results?.violations?.list,
        reportsFiled: (context) => context.results?.reporting?.filedCount,
        incidentRisk: (context) => context.results?.risk?.incidentLevel,
        remediationCost: (context) => context.results?.financial?.remediationEstimate
      }
    }
  },

  // Energy & Utilities - Oilfield Land Lease (UUID)
  '27f70450-c6bc-4c26-b575-31d8f244ae20': {
    useCaseId: '27f70450-c6bc-4c26-b575-31d8f244ae20',
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
        leaseId: (context) => context.promptData?.leaseId || context.configuration?.leaseId || 'LEASE-001',
        leaseValue: (context) => context.results?.leaseAnalysis?.value,
        expirationDate: (context) => context.results?.leaseAnalysis?.expirationDate,
        propertyLocation: (context) => context.results?.gisData?.location,
        renewalStatus: (context) => context.results?.renewalAnalysis?.status,
        riskScore: (context) => context.results?.riskAssessment?.score,
        complianceStatus: (context) => context.results?.complianceCheck?.passed
      }
    }
  },

  // Energy & Utilities - Internal Audit (UUID)
  'fe1458ac-18ae-4f33-9ca5-7736f4864868': {
    useCaseId: 'fe1458ac-18ae-4f33-9ca5-7736f4864868',
    customParticulars: {
      fields: [
        { name: 'auditScope', type: 'string', required: true, description: 'Audit scope identifier' },
        { name: 'findingsCount', type: 'number', required: false, description: 'Total findings identified' },
        { name: 'criticalFindings', type: 'number', required: false, description: 'Critical findings count' },
        { name: 'complianceGaps', type: 'array', required: false, description: 'Compliance gaps identified' },
        { name: 'remediationItems', type: 'number', required: false, description: 'Remediation items' },
        { name: 'auditScore', type: 'number', required: false, description: 'Overall audit score' }
      ],
      extractors: {
        auditScope: (context) => context.configuration?.scope || 'AUDIT-' + Date.now(),
        findingsCount: (context) => context.results?.findings?.total,
        criticalFindings: (context) => context.results?.findings?.critical,
        complianceGaps: (context) => context.results?.compliance?.gaps,
        remediationItems: (context) => context.results?.remediation?.count,
        auditScore: (context) => context.results?.assessment?.score
      }
    }
  },

  // Energy & Utilities - SCADA Integration (UUID)
  'dd016e73-a67c-4c3f-85fe-1b1f11355145': {
    useCaseId: 'dd016e73-a67c-4c3f-85fe-1b1f11355145',
    customParticulars: {
      fields: [
        { name: 'systemsIntegrated', type: 'number', required: true, description: 'SCADA systems integrated' },
        { name: 'dataPointsMonitored', type: 'number', required: false, description: 'Data points monitored' },
        { name: 'alertsGenerated', type: 'number', required: false, description: 'Alerts generated' },
        { name: 'responseTime', type: 'number', required: false, description: 'Average response time (ms)' },
        { name: 'securityScore', type: 'number', required: false, description: 'Security assessment score' },
        { name: 'operationalEfficiency', type: 'number', required: false, description: 'Operational efficiency' }
      ],
      extractors: {
        systemsIntegrated: (context) => context.configuration?.systems || context.results?.integration?.systemCount || 0,
        dataPointsMonitored: (context) => context.results?.monitoring?.dataPoints,
        alertsGenerated: (context) => context.results?.alerts?.count,
        responseTime: (context) => context.results?.performance?.avgResponseTime,
        securityScore: (context) => context.results?.security?.score,
        operationalEfficiency: (context) => context.results?.efficiency?.percentage
      }
    }
  },

  // Energy & Utilities - Predictive Grid Resilience (UUID)
  '949dbc21-6d5c-41b8-84be-79848b923d31': {
    useCaseId: '949dbc21-6d5c-41b8-84be-79848b923d31',
    customParticulars: {
      fields: [
        { name: 'gridComponents', type: 'number', required: true, description: 'Grid components analyzed' },
        { name: 'failurePredictions', type: 'number', required: false, description: 'Predicted failures' },
        { name: 'resilienceImprovement', type: 'number', required: false, description: 'Resilience improvement percentage' },
        { name: 'maintenancePriority', type: 'array', required: false, description: 'Maintenance priority list' },
        { name: 'weatherImpact', type: 'object', required: false, description: 'Weather impact analysis' },
        { name: 'investmentROI', type: 'number', required: false, description: 'Investment ROI projection' }
      ],
      extractors: {
        gridComponents: (context) => context.results?.analysis?.componentCount || 0,
        failurePredictions: (context) => context.results?.predictions?.failureCount,
        resilienceImprovement: (context) => context.results?.resilience?.improvement,
        maintenancePriority: (context) => context.results?.maintenance?.priorityList,
        weatherImpact: (context) => context.results?.weather?.impactAnalysis,
        investmentROI: (context) => context.results?.financial?.roiProjection
      }
    }
  },

  // Energy & Utilities - Cyber Defense (UUID)
  'e1e5b35d-af60-4d0e-af1b-8df1bbe0c907': {
    useCaseId: 'e1e5b35d-af60-4d0e-af1b-8df1bbe0c907',
    customParticulars: {
      fields: [
        { name: 'systemsProtected', type: 'number', required: true, description: 'Systems under protection' },
        { name: 'threatsDetected', type: 'number', required: false, description: 'Cyber threats detected' },
        { name: 'incidentsBlocked', type: 'number', required: false, description: 'Incidents blocked' },
        { name: 'vulnerabilityScore', type: 'number', required: false, description: 'Overall vulnerability score' },
        { name: 'patchCompliance', type: 'number', required: false, description: 'Patch compliance rate' },
        { name: 'securityPosture', type: 'object', required: false, description: 'Security posture assessment' }
      ],
      extractors: {
        systemsProtected: (context) => context.results?.protection?.systemCount || 0,
        threatsDetected: (context) => context.results?.detection?.threatCount,
        incidentsBlocked: (context) => context.results?.prevention?.blockedCount,
        vulnerabilityScore: (context) => context.results?.assessment?.vulnerabilityScore,
        patchCompliance: (context) => context.results?.compliance?.patchRate,
        securityPosture: (context) => context.results?.posture?.assessment
      }
    }
  },

  // Energy & Utilities - Wildfire Prevention (UUID)
  'ec3b677c-0a8e-4550-beff-9ecd664acfea': {
    useCaseId: 'ec3b677c-0a8e-4550-beff-9ecd664acfea',
    customParticulars: {
      fields: [
        { name: 'areasMonitored', type: 'number', required: true, description: 'Areas monitored (sq km)' },
        { name: 'riskLevel', type: 'string', required: false, description: 'Current risk level' },
        { name: 'hotspotDetected', type: 'number', required: false, description: 'Hotspots detected' },
        { name: 'vegetationIndex', type: 'number', required: false, description: 'Vegetation dryness index' },
        { name: 'preventiveActions', type: 'array', required: false, description: 'Preventive actions taken' },
        { name: 'evacuationZones', type: 'array', required: false, description: 'Potential evacuation zones' }
      ],
      extractors: {
        areasMonitored: (context) => context.results?.monitoring?.areaSize || 0,
        riskLevel: (context) => context.results?.risk?.currentLevel,
        hotspotDetected: (context) => context.results?.detection?.hotspotCount,
        vegetationIndex: (context) => context.results?.vegetation?.drynessIndex,
        preventiveActions: (context) => context.results?.prevention?.actionsTaken,
        evacuationZones: (context) => context.results?.planning?.evacuationZones
      }
    }
  },

  // Energy & Utilities - Energy Storage Management (UUID)
  '96198193-9467-4353-9e52-f3c9cb6cc167': {
    useCaseId: '96198193-9467-4353-9e52-f3c9cb6cc167',
    customParticulars: {
      fields: [
        { name: 'storageCapacity', type: 'number', required: true, description: 'Total storage capacity (MWh)' },
        { name: 'currentCharge', type: 'number', required: false, description: 'Current charge level' },
        { name: 'cycleEfficiency', type: 'number', required: false, description: 'Charge/discharge efficiency' },
        { name: 'peakShaving', type: 'number', required: false, description: 'Peak shaving achieved (MW)' },
        { name: 'revenueOptimization', type: 'number', required: false, description: 'Revenue optimization' },
        { name: 'batteryHealth', type: 'object', required: false, description: 'Battery health metrics' }
      ],
      extractors: {
        storageCapacity: (context) => context.results?.storage?.totalCapacity || 0,
        currentCharge: (context) => context.results?.storage?.currentLevel,
        cycleEfficiency: (context) => context.results?.efficiency?.cycleRate,
        peakShaving: (context) => context.results?.optimization?.peakReduction,
        revenueOptimization: (context) => context.results?.financial?.revenueGain,
        batteryHealth: (context) => context.results?.health?.batteryMetrics
      }
    }
  },

  // Energy & Utilities - Demand Response (UUID)
  '95d7ed76-22a8-487d-aa03-83171aa59a37': {
    useCaseId: '95d7ed76-22a8-487d-aa03-83171aa59a37',
    customParticulars: {
      fields: [
        { name: 'participantsEnrolled', type: 'number', required: true, description: 'DR participants enrolled' },
        { name: 'loadReduction', type: 'number', required: false, description: 'Load reduction achieved (MW)' },
        { name: 'responseRate', type: 'number', required: false, description: 'Customer response rate' },
        { name: 'incentivesPaid', type: 'number', required: false, description: 'Total incentives paid' },
        { name: 'gridStability', type: 'number', required: false, description: 'Grid stability improvement' },
        { name: 'customerSatisfaction', type: 'number', required: false, description: 'Customer satisfaction score' }
      ],
      extractors: {
        participantsEnrolled: (context) => context.results?.enrollment?.participantCount || 0,
        loadReduction: (context) => context.results?.reduction?.totalLoad,
        responseRate: (context) => context.results?.response?.customerRate,
        incentivesPaid: (context) => context.results?.financial?.incentiveTotal,
        gridStability: (context) => context.results?.grid?.stabilityScore,
        customerSatisfaction: (context) => context.results?.satisfaction?.score
      }
    }
  },

  // Healthcare - Patient Risk (UUID)
  '7b87820a-8e80-4c2a-837f-ec1fcb2187a2': {
    useCaseId: '7b87820a-8e80-4c2a-837f-ec1fcb2187a2',
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

  // Finance - Transaction Fraud (UUID)
  'a206312f-120e-42f9-a8f1-e5c11f649cd6': {
    useCaseId: 'a206312f-120e-42f9-a8f1-e5c11f649cd6',
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
  }
};

// UUID to workflow ID mapping
export const uuidToWorkflowIdMap: Record<string, string> = {
  // Energy & Utilities
  '658eba0c-9dc5-4ac8-b9e9-fd5cd898bf18': 'grid-resilience-workflow',
  '52bacef6-5042-4a9c-ad85-2d1f9ea24bdb': 'methane-detection-workflow',
  'e9fac56a-0eef-4674-943d-681b0c45fc31': 'phmsa-compliance-workflow',
  '27f70450-c6bc-4c26-b575-31d8f244ae20': 'oilfield-land-lease-workflow',
  'fe1458ac-18ae-4f33-9ca5-7736f4864868': 'internal-audit-workflow',
  'dd016e73-a67c-4c3f-85fe-1b1f11355145': 'scada-integration-workflow',
  '949dbc21-6d5c-41b8-84be-79848b923d31': 'predictive-resilience-workflow',
  'e1e5b35d-af60-4d0e-af1b-8df1bbe0c907': 'cyber-defense-workflow',
  'ec3b677c-0a8e-4550-beff-9ecd664acfea': 'wildfire-prevention-workflow',
  '96198193-9467-4353-9e52-f3c9cb6cc167': 'energy-storage-management-workflow',
  '95d7ed76-22a8-487d-aa03-83171aa59a37': 'demand-response-workflow',
  
  // Healthcare
  '7b87820a-8e80-4c2a-837f-ec1fcb2187a2': 'patient-risk-workflow',
  '10d8e85e-d1ec-4b69-840e-6a6c2d7c1572': 'clinical-trial-matching-workflow',
  '1a7172f5-1719-49a9-b950-7d06ee74ce2a': 'treatment-recommendation-workflow',
  'e645c639-067d-4799-a46c-b925b9625e87': 'diagnosis-assistant-workflow',
  '9f7c81d9-d378-4ea9-854d-79d3ec6a9e7d': 'medical-supply-chain-workflow',
  
  // Finance
  'a206312f-120e-42f9-a8f1-e5c11f649cd6': 'fraud-detection-workflow',
  '5142d67a-cbc3-4f48-9753-e3e6141f0dcb': 'ai-credit-scoring-workflow',
  'c9fc84ee-1a45-4671-8a03-bc2384d6545a': 'aml-monitoring-workflow',
  'a3d6ab51-b8c8-40bc-abe8-e6bd9afa4b7c': 'insurance-risk-workflow',
  
  // Manufacturing
  '3dc1c809-3d7b-4055-91a2-968288680bb0': 'quality-inspection-workflow',
  '3c76f23f-2046-433a-b47e-05287ac82c98': 'supply-chain-workflow',
  
  // Retail
  'fe964808-d5f3-470b-b99e-8865374663f1': 'demand-forecasting-workflow',
  'ea57c229-c84e-4ebd-ab2a-75b25480c8c6': 'customer-personalization-workflow',
  '32db010a-34c5-4d01-ada4-3294710db001': 'price-optimization-workflow',
  
  // Transportation
  '7b13eb39-1b4c-4485-86d5-ba9b84107748': 'fleet-maintenance-workflow',
  
  // Education
  '815d4af0-2c74-43aa-82da-6e2c773a959f': 'adaptive-learning-workflow',
  'e5c37716-79e8-4ca9-9b00-2fd3dc015118': 'content-recommendation-workflow',
  
  // Pharmaceuticals
  '562b5b92-4d6f-48a5-b8a1-cfd4d6774521': 'adverse-event-workflow',
  
  // Government
  '1100a134-d9d7-4205-98fd-83d6b1aa32fe': 'emergency-response-workflow',
  '88449077-7bb9-4a5f-8a56-e13784e726aa': 'infrastructure-coordination-workflow',
  'dad0c01e-f452-4847-b147-6a17ab82da92': 'public-safety-workflow',
  '1b912893-4432-4a68-a61a-fe9141e7d403': 'resource-optimization-workflow',
  
  // Telecommunications
  '88e1f9a2-f4d1-4c4d-ab29-9255162ad539': 'network-performance-workflow',
  'caa20b38-f8b3-4024-8b4c-d32cfb4cde30': 'churn-prevention-workflow',
  '2b052d81-2a3f-4329-85bb-279e1c68e9ac': 'network-security-workflow',
  
  // Real Estate
  'b7cf8086-92a5-4277-b0b2-ec9fc91740d8': 'ai-pricing-governance-workflow',
  
  // All Verticals
  '4d174533-4b4f-4120-b6ef-cdc3e0035dee': 'cross-industry-analytics-workflow',
  'd8c69bd1-b06f-4b80-9fc4-cdfd8e8b13b6': 'universal-compliance-workflow',
  '1e88d43e-7019-4be1-88c2-460656a4f71b': 'multi-vertical-optimization-workflow',
  '957347a3-c72e-4a36-97d6-e6be74095351': 'industry-benchmarking-workflow',
  
  // Additional Energy workflows
  '7d37c554-e4cf-4c6c-be0d-d2974b8d3cf5': 'oilfield-lease-workflow',
  'fab1db2d-38c6-4be0-9802-245ac2085998': 'grid-anomaly-workflow',
  'd4cd35f9-fb71-45d4-8dce-d9226a9115d4': 'renewable-optimization-workflow',
  'ebb899e3-96bb-48dc-b0be-5dc0f04f99ef': 'drilling-risk-workflow',
  '4e922ac2-2353-43ea-9834-a2d80728c7b8': 'environmental-compliance-workflow',
  '6af7bb06-efda-4a2c-8ca0-d78504125012': 'load-forecasting-workflow'
};

// Function to get audit config by any ID format
export function getAuditConfigByAnyId(id: string): UseCaseAuditConfig | undefined {
  // Direct UUID match
  if (allWorkflowAuditConfigs[id]) {
    return allWorkflowAuditConfigs[id];
  }
  
  // Check if it's a workflow ID that maps to a UUID
  const uuid = Object.entries(uuidToWorkflowIdMap).find(([uuid, workflowId]) => workflowId === id)?.[0];
  if (uuid && allWorkflowAuditConfigs[uuid]) {
    return {
      ...allWorkflowAuditConfigs[uuid],
      useCaseId: id // Keep the original ID
    };
  }
  
  return undefined;
}