import { UseCaseAuditConfig } from './use-case-audit-config';

// Final set of workflow audit configurations
export const finalWorkflowAuditConfigs: Record<string, UseCaseAuditConfig> = {
  // Energy - Additional workflows
  'renewable-integration-workflow': {
    useCaseId: 'renewable-integration-workflow',
    customParticulars: {
      fields: [
        { name: 'renewableCapacity', type: 'number', required: true, description: 'Renewable capacity integrated (MW)' },
        { name: 'gridStability', type: 'number', required: false, description: 'Grid stability score' },
        { name: 'energyMix', type: 'object', required: false, description: 'Energy source mix' },
        { name: 'carbonReduction', type: 'number', required: false, description: 'Carbon emissions reduced' },
        { name: 'costEfficiency', type: 'number', required: false, description: 'Cost efficiency improvement' },
        { name: 'reliabilityScore', type: 'number', required: false, description: 'System reliability score' }
      ],
      extractors: {
        renewableCapacity: (context) => context.results?.integration?.renewableCapacity || 0,
        gridStability: (context) => context.results?.stability?.score,
        energyMix: (context) => context.results?.mix?.breakdown,
        carbonReduction: (context) => context.results?.environmental?.carbonSaved,
        costEfficiency: (context) => context.results?.financial?.efficiencyGain,
        reliabilityScore: (context) => context.results?.reliability?.score
      }
    }
  },

  'energy-trading-workflow': {
    useCaseId: 'energy-trading-workflow',
    customParticulars: {
      fields: [
        { name: 'tradesExecuted', type: 'number', required: true, description: 'Energy trades executed' },
        { name: 'profitMargin', type: 'number', required: false, description: 'Average profit margin' },
        { name: 'marketVolatility', type: 'number', required: false, description: 'Market volatility index' },
        { name: 'priceAccuracy', type: 'number', required: false, description: 'Price prediction accuracy' },
        { name: 'riskExposure', type: 'number', required: false, description: 'Risk exposure level' },
        { name: 'tradingRevenue', type: 'number', required: false, description: 'Total trading revenue' }
      ],
      extractors: {
        tradesExecuted: (context) => context.results?.trading?.tradeCount || 0,
        profitMargin: (context) => context.results?.financial?.avgMargin,
        marketVolatility: (context) => context.results?.market?.volatilityIndex,
        priceAccuracy: (context) => context.results?.predictions?.priceAccuracy,
        riskExposure: (context) => context.results?.risk?.exposureLevel,
        tradingRevenue: (context) => context.results?.financial?.totalRevenue
      }
    }
  },

  'smart-grid-management-workflow': {
    useCaseId: 'smart-grid-management-workflow',
    customParticulars: {
      fields: [
        { name: 'gridNodes', type: 'number', required: true, description: 'Smart grid nodes managed' },
        { name: 'loadBalance', type: 'number', required: false, description: 'Load balance efficiency' },
        { name: 'outageReduction', type: 'number', required: false, description: 'Outage time reduction' },
        { name: 'energyLoss', type: 'number', required: false, description: 'Energy loss reduction' },
        { name: 'demandResponse', type: 'number', required: false, description: 'Demand response effectiveness' },
        { name: 'gridReliability', type: 'number', required: false, description: 'Grid reliability index' }
      ],
      extractors: {
        gridNodes: (context) => context.results?.grid?.nodeCount || 0,
        loadBalance: (context) => context.results?.balance?.efficiency,
        outageReduction: (context) => context.results?.reliability?.outageReduction,
        energyLoss: (context) => context.results?.efficiency?.lossReduction,
        demandResponse: (context) => context.results?.response?.effectiveness,
        gridReliability: (context) => context.results?.reliability?.index
      }
    }
  },

  // Healthcare - Additional workflows
  'telemedicine-workflow': {
    useCaseId: 'telemedicine-workflow',
    customParticulars: {
      fields: [
        { name: 'consultationsCompleted', type: 'number', required: true, description: 'Telemedicine consultations' },
        { name: 'patientSatisfaction', type: 'number', required: false, description: 'Patient satisfaction score' },
        { name: 'waitTimeReduction', type: 'number', required: false, description: 'Wait time reduction' },
        { name: 'costSavings', type: 'number', required: false, description: 'Healthcare cost savings' },
        { name: 'diagnosisAccuracy', type: 'number', required: false, description: 'Remote diagnosis accuracy' },
        { name: 'followUpRate', type: 'number', required: false, description: 'Follow-up compliance rate' }
      ],
      extractors: {
        consultationsCompleted: (context) => context.results?.consultations?.count || 0,
        patientSatisfaction: (context) => context.results?.satisfaction?.score,
        waitTimeReduction: (context) => context.results?.efficiency?.waitReduction,
        costSavings: (context) => context.results?.financial?.savings,
        diagnosisAccuracy: (context) => context.results?.diagnosis?.accuracy,
        followUpRate: (context) => context.results?.compliance?.followUpRate
      }
    }
  },

  'medical-imaging-workflow': {
    useCaseId: 'medical-imaging-workflow',
    customParticulars: {
      fields: [
        { name: 'imagesAnalyzed', type: 'number', required: true, description: 'Medical images analyzed' },
        { name: 'abnormalitiesDetected', type: 'number', required: false, description: 'Abnormalities detected' },
        { name: 'diagnosticAccuracy', type: 'number', required: false, description: 'Diagnostic accuracy rate' },
        { name: 'processingTime', type: 'number', required: false, description: 'Average processing time' },
        { name: 'falsePositiveRate', type: 'number', required: false, description: 'False positive rate' },
        { name: 'criticalFindings', type: 'number', required: false, description: 'Critical findings identified' }
      ],
      extractors: {
        imagesAnalyzed: (context) => context.results?.analysis?.imageCount || 0,
        abnormalitiesDetected: (context) => context.results?.detection?.abnormalityCount,
        diagnosticAccuracy: (context) => context.results?.accuracy?.diagnosticRate,
        processingTime: (context) => context.results?.performance?.avgProcessingTime,
        falsePositiveRate: (context) => context.results?.accuracy?.falsePositiveRate,
        criticalFindings: (context) => context.results?.findings?.criticalCount
      }
    }
  },

  'hospital-operations-workflow': {
    useCaseId: 'hospital-operations-workflow',
    customParticulars: {
      fields: [
        { name: 'departmentsOptimized', type: 'number', required: true, description: 'Hospital departments optimized' },
        { name: 'bedUtilization', type: 'number', required: false, description: 'Bed utilization rate' },
        { name: 'staffEfficiency', type: 'number', required: false, description: 'Staff efficiency improvement' },
        { name: 'patientFlowTime', type: 'number', required: false, description: 'Patient flow time reduction' },
        { name: 'operationalCost', type: 'number', required: false, description: 'Operational cost reduction' },
        { name: 'qualityScore', type: 'number', required: false, description: 'Care quality score' }
      ],
      extractors: {
        departmentsOptimized: (context) => context.results?.optimization?.deptCount || 0,
        bedUtilization: (context) => context.results?.utilization?.bedRate,
        staffEfficiency: (context) => context.results?.efficiency?.staffImprovement,
        patientFlowTime: (context) => context.results?.flow?.timeReduction,
        operationalCost: (context) => context.results?.financial?.costReduction,
        qualityScore: (context) => context.results?.quality?.careScore
      }
    }
  },

  'medication-management-workflow': {
    useCaseId: 'medication-management-workflow',
    customParticulars: {
      fields: [
        { name: 'prescriptionsManaged', type: 'number', required: true, description: 'Prescriptions managed' },
        { name: 'adherenceRate', type: 'number', required: false, description: 'Medication adherence rate' },
        { name: 'interactionsDetected', type: 'number', required: false, description: 'Drug interactions detected' },
        { name: 'adverseEventsPrevented', type: 'number', required: false, description: 'Adverse events prevented' },
        { name: 'costOptimization', type: 'number', required: false, description: 'Medication cost optimization' },
        { name: 'therapyEffectiveness', type: 'number', required: false, description: 'Therapy effectiveness score' }
      ],
      extractors: {
        prescriptionsManaged: (context) => context.results?.management?.prescriptionCount || 0,
        adherenceRate: (context) => context.results?.compliance?.adherenceRate,
        interactionsDetected: (context) => context.results?.safety?.interactionCount,
        adverseEventsPrevented: (context) => context.results?.prevention?.adverseEventCount,
        costOptimization: (context) => context.results?.financial?.costSavings,
        therapyEffectiveness: (context) => context.results?.outcomes?.effectivenessScore
      }
    }
  },

  'population-health-workflow': {
    useCaseId: 'population-health-workflow',
    customParticulars: {
      fields: [
        { name: 'populationSize', type: 'number', required: true, description: 'Population size analyzed' },
        { name: 'healthRiskGroups', type: 'number', required: false, description: 'Risk groups identified' },
        { name: 'preventiveInterventions', type: 'number', required: false, description: 'Preventive interventions' },
        { name: 'healthOutcomes', type: 'object', required: false, description: 'Health outcome metrics' },
        { name: 'costPerCapita', type: 'number', required: false, description: 'Healthcare cost per capita' },
        { name: 'wellnessScore', type: 'number', required: false, description: 'Population wellness score' }
      ],
      extractors: {
        populationSize: (context) => context.results?.population?.size || 0,
        healthRiskGroups: (context) => context.results?.risk?.groupCount,
        preventiveInterventions: (context) => context.results?.interventions?.count,
        healthOutcomes: (context) => context.results?.outcomes?.metrics,
        costPerCapita: (context) => context.results?.financial?.costPerCapita,
        wellnessScore: (context) => context.results?.wellness?.score
      }
    }
  },

  // Finance - Additional workflows
  'credit-risk-workflow': {
    useCaseId: 'credit-risk-workflow',
    customParticulars: {
      fields: [
        { name: 'applicationsAssessed', type: 'number', required: true, description: 'Credit applications assessed' },
        { name: 'riskScore', type: 'number', required: false, description: 'Average risk score' },
        { name: 'defaultRate', type: 'number', required: false, description: 'Predicted default rate' },
        { name: 'approvalRate', type: 'number', required: false, description: 'Application approval rate' },
        { name: 'portfolioRisk', type: 'number', required: false, description: 'Portfolio risk level' },
        { name: 'expectedLoss', type: 'number', required: false, description: 'Expected loss amount' }
      ],
      extractors: {
        applicationsAssessed: (context) => context.results?.assessment?.applicationCount || 0,
        riskScore: (context) => context.results?.risk?.avgScore,
        defaultRate: (context) => context.results?.predictions?.defaultRate,
        approvalRate: (context) => context.results?.decisions?.approvalRate,
        portfolioRisk: (context) => context.results?.portfolio?.riskLevel,
        expectedLoss: (context) => context.results?.financial?.expectedLoss
      }
    }
  },

  'portfolio-optimization-workflow': {
    useCaseId: 'portfolio-optimization-workflow',
    customParticulars: {
      fields: [
        { name: 'portfoliosOptimized', type: 'number', required: true, description: 'Portfolios optimized' },
        { name: 'returnImprovement', type: 'number', required: false, description: 'Return improvement' },
        { name: 'riskReduction', type: 'number', required: false, description: 'Risk reduction achieved' },
        { name: 'sharpeRatio', type: 'number', required: false, description: 'Sharpe ratio' },
        { name: 'diversificationScore', type: 'number', required: false, description: 'Diversification score' },
        { name: 'rebalancingFrequency', type: 'number', required: false, description: 'Rebalancing frequency' }
      ],
      extractors: {
        portfoliosOptimized: (context) => context.results?.optimization?.portfolioCount || 0,
        returnImprovement: (context) => context.results?.performance?.returnGain,
        riskReduction: (context) => context.results?.risk?.reduction,
        sharpeRatio: (context) => context.results?.metrics?.sharpeRatio,
        diversificationScore: (context) => context.results?.diversification?.score,
        rebalancingFrequency: (context) => context.results?.rebalancing?.frequency
      }
    }
  },

  'aml-compliance-workflow': {
    useCaseId: 'aml-compliance-workflow',
    customParticulars: {
      fields: [
        { name: 'transactionsScreened', type: 'number', required: true, description: 'Transactions screened' },
        { name: 'suspiciousActivities', type: 'number', required: false, description: 'Suspicious activities detected' },
        { name: 'falsePositiveRate', type: 'number', required: false, description: 'False positive rate' },
        { name: 'complianceScore', type: 'number', required: false, description: 'AML compliance score' },
        { name: 'investigationTime', type: 'number', required: false, description: 'Average investigation time' },
        { name: 'regulatoryFines', type: 'number', required: false, description: 'Regulatory fines avoided' }
      ],
      extractors: {
        transactionsScreened: (context) => context.results?.screening?.transactionCount || 0,
        suspiciousActivities: (context) => context.results?.detection?.suspiciousCount,
        falsePositiveRate: (context) => context.results?.accuracy?.falsePositiveRate,
        complianceScore: (context) => context.results?.compliance?.amlScore,
        investigationTime: (context) => context.results?.efficiency?.avgInvestigationTime,
        regulatoryFines: (context) => context.results?.financial?.finesAvoided
      }
    }
  },

  'algorithmic-trading-workflow': {
    useCaseId: 'algorithmic-trading-workflow',
    customParticulars: {
      fields: [
        { name: 'tradesExecuted', type: 'number', required: true, description: 'Algorithmic trades executed' },
        { name: 'winRate', type: 'number', required: false, description: 'Trade win rate' },
        { name: 'avgReturn', type: 'number', required: false, description: 'Average return per trade' },
        { name: 'maxDrawdown', type: 'number', required: false, description: 'Maximum drawdown' },
        { name: 'executionSpeed', type: 'number', required: false, description: 'Average execution speed' },
        { name: 'profitFactor', type: 'number', required: false, description: 'Profit factor' }
      ],
      extractors: {
        tradesExecuted: (context) => context.results?.trading?.tradeCount || 0,
        winRate: (context) => context.results?.performance?.winRate,
        avgReturn: (context) => context.results?.returns?.avgPerTrade,
        maxDrawdown: (context) => context.results?.risk?.maxDrawdown,
        executionSpeed: (context) => context.results?.execution?.avgSpeed,
        profitFactor: (context) => context.results?.metrics?.profitFactor
      }
    }
  },

  'insurance-underwriting-workflow': {
    useCaseId: 'insurance-underwriting-workflow',
    customParticulars: {
      fields: [
        { name: 'policiesUnderwritten', type: 'number', required: true, description: 'Policies underwritten' },
        { name: 'riskAccuracy', type: 'number', required: false, description: 'Risk assessment accuracy' },
        { name: 'processingTime', type: 'number', required: false, description: 'Average processing time' },
        { name: 'lossRatio', type: 'number', required: false, description: 'Predicted loss ratio' },
        { name: 'premiumOptimization', type: 'number', required: false, description: 'Premium optimization rate' },
        { name: 'fraudDetection', type: 'number', required: false, description: 'Fraud cases detected' }
      ],
      extractors: {
        policiesUnderwritten: (context) => context.results?.underwriting?.policyCount || 0,
        riskAccuracy: (context) => context.results?.accuracy?.riskAssessment,
        processingTime: (context) => context.results?.efficiency?.avgProcessingTime,
        lossRatio: (context) => context.results?.predictions?.lossRatio,
        premiumOptimization: (context) => context.results?.optimization?.premiumRate,
        fraudDetection: (context) => context.results?.fraud?.detectedCount
      }
    }
  },

  'regulatory-reporting-workflow': {
    useCaseId: 'regulatory-reporting-workflow',
    customParticulars: {
      fields: [
        { name: 'reportsGenerated', type: 'number', required: true, description: 'Regulatory reports generated' },
        { name: 'complianceRate', type: 'number', required: false, description: 'Compliance rate' },
        { name: 'submissionTime', type: 'number', required: false, description: 'Average submission time' },
        { name: 'dataAccuracy', type: 'number', required: false, description: 'Data accuracy rate' },
        { name: 'auditFindings', type: 'number', required: false, description: 'Audit findings reduced' },
        { name: 'penaltiesAvoided', type: 'number', required: false, description: 'Penalties avoided' }
      ],
      extractors: {
        reportsGenerated: (context) => context.results?.reporting?.reportCount || 0,
        complianceRate: (context) => context.results?.compliance?.rate,
        submissionTime: (context) => context.results?.efficiency?.avgSubmissionTime,
        dataAccuracy: (context) => context.results?.quality?.dataAccuracy,
        auditFindings: (context) => context.results?.audit?.findingsReduction,
        penaltiesAvoided: (context) => context.results?.financial?.penaltiesAvoided
      }
    }
  },

  // Manufacturing - Additional workflows
  'manufacturing-energy-efficiency-workflow': {
    useCaseId: 'manufacturing-energy-efficiency-workflow',
    customParticulars: {
      fields: [
        { name: 'facilitiesOptimized', type: 'number', required: true, description: 'Manufacturing facilities optimized' },
        { name: 'energyReduction', type: 'number', required: false, description: 'Energy consumption reduction' },
        { name: 'carbonFootprint', type: 'number', required: false, description: 'Carbon footprint reduction' },
        { name: 'costSavings', type: 'number', required: false, description: 'Energy cost savings' },
        { name: 'equipmentEfficiency', type: 'number', required: false, description: 'Equipment efficiency gain' },
        { name: 'sustainabilityScore', type: 'number', required: false, description: 'Sustainability score' }
      ],
      extractors: {
        facilitiesOptimized: (context) => context.results?.optimization?.facilityCount || 0,
        energyReduction: (context) => context.results?.energy?.consumptionReduction,
        carbonFootprint: (context) => context.results?.environmental?.carbonReduction,
        costSavings: (context) => context.results?.financial?.energySavings,
        equipmentEfficiency: (context) => context.results?.efficiency?.equipmentGain,
        sustainabilityScore: (context) => context.results?.sustainability?.score
      }
    }
  },

  // All Verticals - Cross-industry workflows
  'cross-industry-analytics-workflow': {
    useCaseId: 'cross-industry-analytics-workflow',
    customParticulars: {
      fields: [
        { name: 'datasetsAnalyzed', type: 'number', required: true, description: 'Cross-industry datasets analyzed' },
        { name: 'insightsGenerated', type: 'number', required: false, description: 'Insights generated' },
        { name: 'patternAccuracy', type: 'number', required: false, description: 'Pattern recognition accuracy' },
        { name: 'industryCorrelations', type: 'object', required: false, description: 'Industry correlations found' },
        { name: 'predictiveAccuracy', type: 'number', required: false, description: 'Predictive model accuracy' },
        { name: 'businessValue', type: 'number', required: false, description: 'Business value generated' }
      ],
      extractors: {
        datasetsAnalyzed: (context) => context.results?.analysis?.datasetCount || 0,
        insightsGenerated: (context) => context.results?.insights?.count,
        patternAccuracy: (context) => context.results?.patterns?.accuracy,
        industryCorrelations: (context) => context.results?.correlations?.crossIndustry,
        predictiveAccuracy: (context) => context.results?.predictions?.accuracy,
        businessValue: (context) => context.results?.value?.businessImpact
      }
    }
  },

  'universal-compliance-workflow': {
    useCaseId: 'universal-compliance-workflow',
    customParticulars: {
      fields: [
        { name: 'regulationsTracked', type: 'number', required: true, description: 'Regulations tracked' },
        { name: 'complianceScore', type: 'number', required: false, description: 'Universal compliance score' },
        { name: 'violationsDetected', type: 'number', required: false, description: 'Violations detected' },
        { name: 'remediationTime', type: 'number', required: false, description: 'Average remediation time' },
        { name: 'crossIndustryGaps', type: 'array', required: false, description: 'Cross-industry compliance gaps' },
        { name: 'riskExposure', type: 'number', required: false, description: 'Compliance risk exposure' }
      ],
      extractors: {
        regulationsTracked: (context) => context.results?.tracking?.regulationCount || 0,
        complianceScore: (context) => context.results?.compliance?.universalScore,
        violationsDetected: (context) => context.results?.violations?.totalCount,
        remediationTime: (context) => context.results?.remediation?.avgTime,
        crossIndustryGaps: (context) => context.results?.gaps?.crossIndustry,
        riskExposure: (context) => context.results?.risk?.exposureLevel
      }
    }
  },

  'multi-vertical-optimization-workflow': {
    useCaseId: 'multi-vertical-optimization-workflow',
    customParticulars: {
      fields: [
        { name: 'verticalsOptimized', type: 'number', required: true, description: 'Industry verticals optimized' },
        { name: 'efficiencyGain', type: 'number', required: false, description: 'Overall efficiency gain' },
        { name: 'synergyScore', type: 'number', required: false, description: 'Cross-vertical synergy score' },
        { name: 'resourceSharing', type: 'number', required: false, description: 'Resource sharing efficiency' },
        { name: 'costReduction', type: 'number', required: false, description: 'Multi-vertical cost reduction' },
        { name: 'innovationIndex', type: 'number', required: false, description: 'Innovation index' }
      ],
      extractors: {
        verticalsOptimized: (context) => context.results?.optimization?.verticalCount || 0,
        efficiencyGain: (context) => context.results?.efficiency?.overallGain,
        synergyScore: (context) => context.results?.synergy?.score,
        resourceSharing: (context) => context.results?.resources?.sharingEfficiency,
        costReduction: (context) => context.results?.financial?.multiVerticalSavings,
        innovationIndex: (context) => context.results?.innovation?.index
      }
    }
  },

  'industry-benchmarking-workflow': {
    useCaseId: 'industry-benchmarking-workflow',
    customParticulars: {
      fields: [
        { name: 'industriesBenchmarked', type: 'number', required: true, description: 'Industries benchmarked' },
        { name: 'performanceMetrics', type: 'object', required: false, description: 'Performance metrics compared' },
        { name: 'bestPractices', type: 'array', required: false, description: 'Best practices identified' },
        { name: 'competitivePosition', type: 'number', required: false, description: 'Competitive position score' },
        { name: 'improvementAreas', type: 'array', required: false, description: 'Improvement areas identified' },
        { name: 'benchmarkAccuracy', type: 'number', required: false, description: 'Benchmarking accuracy' }
      ],
      extractors: {
        industriesBenchmarked: (context) => context.results?.benchmarking?.industryCount || 0,
        performanceMetrics: (context) => context.results?.metrics?.comparison,
        bestPractices: (context) => context.results?.practices?.identified,
        competitivePosition: (context) => context.results?.position?.score,
        improvementAreas: (context) => context.results?.improvements?.areas,
        benchmarkAccuracy: (context) => context.results?.accuracy?.benchmarkScore
      }
    }
  }
};

// Additional UUID mappings for remaining workflows
export const additionalUuidMappings: Record<string, string> = {
  // Manufacturing UUIDs
  '3dc1c809-3d7b-4055-91a2-968288680bb0': 'quality-inspection-workflow',
  '3c76f23f-2046-433a-b47e-05287ac82c98': 'supply-chain-workflow',
  
  // Retail UUIDs
  'fe964808-d5f3-470b-b99e-8865374663f1': 'demand-forecasting-workflow',
  'ea57c229-c84e-4ebd-ab2a-75b25480c8c6': 'customer-personalization-workflow',
  '32db010a-34c5-4d01-ada4-3294710db001': 'price-optimization-workflow',
  
  // Transportation UUIDs
  '7b13eb39-1b4c-4485-86d5-ba9b84107748': 'fleet-maintenance-workflow',
  
  // Education UUIDs
  '815d4af0-2c74-43aa-82da-6e2c773a959f': 'adaptive-learning-workflow',
  'e5c37716-79e8-4ca9-9b00-2fd3dc015118': 'content-recommendation-workflow',
  
  // Pharmaceuticals UUIDs
  '562b5b92-4d6f-48a5-b8a1-cfd4d6774521': 'adverse-event-workflow',
  
  // Government UUIDs
  '1100a134-d9d7-4205-98fd-83d6b1aa32fe': 'emergency-response-workflow',
  '88449077-7bb9-4a5f-8a56-e13784e726aa': 'infrastructure-coordination-workflow',
  'dad0c01e-f452-4847-b147-6a17ab82da92': 'public-safety-analytics-workflow',
  '1b912893-4432-4a68-a61a-fe9141e7d403': 'resource-optimization-workflow',
  
  // Telecommunications UUIDs
  '88e1f9a2-f4d1-4c4d-ab29-9255162ad539': 'network-performance-workflow',
  'caa20b38-f8b3-4024-8b4c-d32cfb4cde30': 'churn-prevention-workflow',
  '2b052d81-2a3f-4329-85bb-279e1c68e9ac': 'network-security-workflow',
  
  // Healthcare UUIDs
  '10d8e85e-d1ec-4b69-840e-6a6c2d7c1572': 'clinical-trial-matching-workflow',
  '1a7172f5-1719-49a9-b950-7d06ee74ce2a': 'treatment-recommendation-workflow',
  'e645c639-067d-4799-a46c-b925b9625e87': 'diagnosis-assistant-workflow',
  '9f7c81d9-d378-4ea9-854d-79d3ec6a9e7d': 'medical-supply-chain-workflow',
  
  // Finance UUIDs
  '5142d67a-cbc3-4f48-9753-e3e6141f0dcb': 'ai-credit-scoring-workflow',
  'c9fc84ee-1a45-4671-8a03-bc2384d6545a': 'aml-monitoring-workflow',
  'a3d6ab51-b8c8-40bc-abe8-e6bd9afa4b7c': 'insurance-risk-workflow'
};