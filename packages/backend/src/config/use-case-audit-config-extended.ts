import { UseCaseAuditConfig } from './use-case-audit-config';

export const extendedUseCaseAuditConfigs: Record<string, UseCaseAuditConfig> = {
  // Energy & Utilities - Remaining Use Cases
  'renewable-optimization': {
    useCaseId: 'renewable-optimization',
    customParticulars: {
      fields: [
        { name: 'renewableCapacityMW', type: 'number', required: true, description: 'Total renewable capacity' },
        { name: 'optimizationTarget', type: 'string', required: false, description: 'Optimization objective' },
        { name: 'efficiencyGain', type: 'number', required: false, description: 'Efficiency improvement percentage' },
        { name: 'carbonReduction', type: 'number', required: false, description: 'CO2 reduction in tons' },
        { name: 'costSavings', type: 'number', required: false, description: 'Annual cost savings' },
        { name: 'gridStability', type: 'number', required: false, description: 'Grid stability score' }
      ],
      extractors: {
        renewableCapacityMW: (context) => context.configuration?.capacity || context.results?.analysis?.totalCapacity || 0,
        optimizationTarget: (context) => context.configuration?.target || 'efficiency',
        efficiencyGain: (context) => context.results?.optimization?.efficiencyGain,
        carbonReduction: (context) => context.results?.environmental?.co2Reduction,
        costSavings: (context) => context.results?.financial?.annualSavings,
        gridStability: (context) => context.results?.grid?.stabilityScore
      }
    }
  },

  'drilling-risk': {
    useCaseId: 'drilling-risk',
    customParticulars: {
      fields: [
        { name: 'wellId', type: 'string', required: true, description: 'Well identifier' },
        { name: 'riskLevel', type: 'string', required: false, description: 'Overall risk assessment' },
        { name: 'geologicalRisk', type: 'number', required: false, description: 'Geological risk score' },
        { name: 'operationalRisk', type: 'number', required: false, description: 'Operational risk score' },
        { name: 'safetyIncidents', type: 'number', required: false, description: 'Predicted safety incidents' },
        { name: 'mitigationCost', type: 'number', required: false, description: 'Risk mitigation cost' }
      ],
      extractors: {
        wellId: (context) => context.configuration?.wellId || context.promptData?.wellId || 'WELL-001',
        riskLevel: (context) => context.results?.assessment?.overallRisk,
        geologicalRisk: (context) => context.results?.risks?.geological,
        operationalRisk: (context) => context.results?.risks?.operational,
        safetyIncidents: (context) => context.results?.predictions?.incidents,
        mitigationCost: (context) => context.results?.financial?.mitigationCost
      }
    }
  },

  'methane-detection': {
    useCaseId: 'methane-detection',
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

  'grid-resilience': {
    useCaseId: 'grid-resilience',
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

  'carbon-tracking': {
    useCaseId: 'carbon-tracking',
    customParticulars: {
      fields: [
        { name: 'emissionSources', type: 'number', required: true, description: 'Emission sources tracked' },
        { name: 'totalEmissions', type: 'number', required: false, description: 'Total CO2 emissions (tons)' },
        { name: 'reductionTarget', type: 'number', required: false, description: 'Reduction target percentage' },
        { name: 'offsetCredits', type: 'number', required: false, description: 'Carbon offset credits' },
        { name: 'complianceScore', type: 'number', required: false, description: 'Regulatory compliance score' },
        { name: 'reportingPeriod', type: 'string', required: false, description: 'Reporting period' }
      ],
      extractors: {
        emissionSources: (context) => context.results?.tracking?.sourceCount || 0,
        totalEmissions: (context) => context.results?.emissions?.totalCO2,
        reductionTarget: (context) => context.configuration?.reductionTarget || 30,
        offsetCredits: (context) => context.results?.offsets?.credits,
        complianceScore: (context) => context.results?.compliance?.score,
        reportingPeriod: (context) => context.configuration?.period || 'quarterly'
      }
    }
  },

  'pipeline-integrity': {
    useCaseId: 'pipeline-integrity',
    customParticulars: {
      fields: [
        { name: 'pipelineLength', type: 'number', required: true, description: 'Pipeline length (km)' },
        { name: 'integrityScore', type: 'number', required: false, description: 'Overall integrity score' },
        { name: 'anomaliesDetected', type: 'number', required: false, description: 'Anomalies detected' },
        { name: 'corrosionRisk', type: 'number', required: false, description: 'Corrosion risk level' },
        { name: 'maintenanceScheduled', type: 'array', required: false, description: 'Scheduled maintenance' },
        { name: 'complianceStatus', type: 'string', required: false, description: 'PHMSA compliance status' }
      ],
      extractors: {
        pipelineLength: (context) => context.configuration?.length || context.results?.pipeline?.totalLength || 0,
        integrityScore: (context) => context.results?.assessment?.integrityScore,
        anomaliesDetected: (context) => context.results?.inspection?.anomalyCount,
        corrosionRisk: (context) => context.results?.risks?.corrosion,
        maintenanceScheduled: (context) => context.results?.maintenance?.scheduled,
        complianceStatus: (context) => context.results?.compliance?.phmsaStatus
      }
    }
  },

  'internal-audit': {
    useCaseId: 'internal-audit',
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

  'scada-integration': {
    useCaseId: 'scada-integration',
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

  // Insurance Use Cases
  'insurance-risk': {
    useCaseId: 'insurance-risk',
    customParticulars: {
      fields: [
        { name: 'policiesAssessed', type: 'number', required: true, description: 'Policies assessed' },
        { name: 'riskScore', type: 'number', required: false, description: 'Average risk score' },
        { name: 'highRiskPolicies', type: 'number', required: false, description: 'High risk policies' },
        { name: 'premiumAdjustments', type: 'number', required: false, description: 'Premium adjustments' },
        { name: 'fraudIndicators', type: 'number', required: false, description: 'Fraud indicators detected' },
        { name: 'profitabilityImpact', type: 'number', required: false, description: 'Profitability impact' }
      ],
      extractors: {
        policiesAssessed: (context) => context.results?.assessment?.policyCount || 0,
        riskScore: (context) => context.results?.risk?.averageScore,
        highRiskPolicies: (context) => context.results?.risk?.highRiskCount,
        premiumAdjustments: (context) => context.results?.pricing?.adjustmentCount,
        fraudIndicators: (context) => context.results?.fraud?.indicatorCount,
        profitabilityImpact: (context) => context.results?.financial?.profitabilityDelta
      }
    }
  },

  'claims-processing': {
    useCaseId: 'claims-processing',
    customParticulars: {
      fields: [
        { name: 'claimsProcessed', type: 'number', required: true, description: 'Claims processed' },
        { name: 'autoApproved', type: 'number', required: false, description: 'Auto-approved claims' },
        { name: 'avgProcessingTime', type: 'number', required: false, description: 'Average processing time' },
        { name: 'fraudDetected', type: 'number', required: false, description: 'Fraudulent claims detected' },
        { name: 'customerSatisfaction', type: 'number', required: false, description: 'Customer satisfaction score' },
        { name: 'costSavings', type: 'number', required: false, description: 'Processing cost savings' }
      ],
      extractors: {
        claimsProcessed: (context) => context.results?.processing?.totalClaims || 0,
        autoApproved: (context) => context.results?.automation?.approvedCount,
        avgProcessingTime: (context) => context.results?.metrics?.avgTime,
        fraudDetected: (context) => context.results?.fraud?.detectedCount,
        customerSatisfaction: (context) => context.results?.satisfaction?.score,
        costSavings: (context) => context.results?.financial?.savings
      }
    }
  },

  'underwriting-automation': {
    useCaseId: 'underwriting-automation',
    customParticulars: {
      fields: [
        { name: 'applicationsProcessed', type: 'number', required: true, description: 'Applications processed' },
        { name: 'autoUnderwritten', type: 'number', required: false, description: 'Auto-underwritten policies' },
        { name: 'riskAccuracy', type: 'number', required: false, description: 'Risk assessment accuracy' },
        { name: 'timeReduction', type: 'number', required: false, description: 'Time reduction percentage' },
        { name: 'premiumOptimization', type: 'number', required: false, description: 'Premium optimization rate' },
        { name: 'complianceScore', type: 'number', required: false, description: 'Compliance score' }
      ],
      extractors: {
        applicationsProcessed: (context) => context.results?.processing?.applicationCount || 0,
        autoUnderwritten: (context) => context.results?.automation?.underwrittenCount,
        riskAccuracy: (context) => context.results?.accuracy?.riskAssessment,
        timeReduction: (context) => context.results?.efficiency?.timeReduction,
        premiumOptimization: (context) => context.results?.pricing?.optimizationRate,
        complianceScore: (context) => context.results?.compliance?.score
      }
    }
  },

  'customer-retention': {
    useCaseId: 'customer-retention',
    customParticulars: {
      fields: [
        { name: 'customersAnalyzed', type: 'number', required: true, description: 'Customers analyzed' },
        { name: 'churnRisk', type: 'number', required: false, description: 'Average churn risk' },
        { name: 'retentionCampaigns', type: 'number', required: false, description: 'Retention campaigns created' },
        { name: 'predictedSaves', type: 'number', required: false, description: 'Predicted customer saves' },
        { name: 'lifetimeValue', type: 'number', required: false, description: 'Average lifetime value' },
        { name: 'satisfactionImprovement', type: 'number', required: false, description: 'Satisfaction improvement' }
      ],
      extractors: {
        customersAnalyzed: (context) => context.results?.analysis?.customerCount || 0,
        churnRisk: (context) => context.results?.risk?.averageChurn,
        retentionCampaigns: (context) => context.results?.campaigns?.count,
        predictedSaves: (context) => context.results?.predictions?.savedCustomers,
        lifetimeValue: (context) => context.results?.metrics?.avgLTV,
        satisfactionImprovement: (context) => context.results?.satisfaction?.improvement
      }
    }
  },

  'policy-renewal': {
    useCaseId: 'policy-renewal',
    customParticulars: {
      fields: [
        { name: 'policiesUpForRenewal', type: 'number', required: true, description: 'Policies up for renewal' },
        { name: 'autoRenewed', type: 'number', required: false, description: 'Auto-renewed policies' },
        { name: 'renewalRate', type: 'number', required: false, description: 'Overall renewal rate' },
        { name: 'premiumRetention', type: 'number', required: false, description: 'Premium retention rate' },
        { name: 'customerContacts', type: 'number', required: false, description: 'Customer contacts made' },
        { name: 'revenueImpact', type: 'number', required: false, description: 'Revenue impact' }
      ],
      extractors: {
        policiesUpForRenewal: (context) => context.results?.renewal?.totalPolicies || 0,
        autoRenewed: (context) => context.results?.automation?.renewedCount,
        renewalRate: (context) => context.results?.metrics?.renewalRate,
        premiumRetention: (context) => context.results?.financial?.premiumRetention,
        customerContacts: (context) => context.results?.outreach?.contactCount,
        revenueImpact: (context) => context.results?.financial?.revenueImpact
      }
    }
  },

  // Transportation Use Cases
  'route-optimization': {
    useCaseId: 'route-optimization',
    customParticulars: {
      fields: [
        { name: 'routesOptimized', type: 'number', required: true, description: 'Routes optimized' },
        { name: 'distanceReduction', type: 'number', required: false, description: 'Distance reduction (km)' },
        { name: 'fuelSavings', type: 'number', required: false, description: 'Fuel savings (liters)' },
        { name: 'timeReduction', type: 'number', required: false, description: 'Time reduction (hours)' },
        { name: 'co2Reduction', type: 'number', required: false, description: 'CO2 reduction (tons)' },
        { name: 'deliverySuccess', type: 'number', required: false, description: 'Delivery success rate' }
      ],
      extractors: {
        routesOptimized: (context) => context.results?.optimization?.routeCount || 0,
        distanceReduction: (context) => context.results?.savings?.distance,
        fuelSavings: (context) => context.results?.savings?.fuel,
        timeReduction: (context) => context.results?.savings?.time,
        co2Reduction: (context) => context.results?.environmental?.co2Saved,
        deliverySuccess: (context) => context.results?.performance?.successRate
      }
    }
  },

  'fleet-management': {
    useCaseId: 'fleet-management',
    customParticulars: {
      fields: [
        { name: 'vehiclesManaged', type: 'number', required: true, description: 'Vehicles managed' },
        { name: 'utilizationRate', type: 'number', required: false, description: 'Fleet utilization rate' },
        { name: 'maintenanceAlerts', type: 'number', required: false, description: 'Maintenance alerts' },
        { name: 'fuelEfficiency', type: 'number', required: false, description: 'Fuel efficiency improvement' },
        { name: 'driverScore', type: 'number', required: false, description: 'Average driver score' },
        { name: 'operationalCost', type: 'number', required: false, description: 'Operational cost reduction' }
      ],
      extractors: {
        vehiclesManaged: (context) => context.results?.fleet?.vehicleCount || 0,
        utilizationRate: (context) => context.results?.metrics?.utilization,
        maintenanceAlerts: (context) => context.results?.maintenance?.alertCount,
        fuelEfficiency: (context) => context.results?.efficiency?.fuelImprovement,
        driverScore: (context) => context.results?.safety?.avgDriverScore,
        operationalCost: (context) => context.results?.financial?.costReduction
      }
    }
  },

  'traffic-prediction': {
    useCaseId: 'traffic-prediction',
    customParticulars: {
      fields: [
        { name: 'routesAnalyzed', type: 'number', required: true, description: 'Routes analyzed' },
        { name: 'predictionAccuracy', type: 'number', required: false, description: 'Prediction accuracy' },
        { name: 'congestionEvents', type: 'number', required: false, description: 'Congestion events predicted' },
        { name: 'alternativeRoutes', type: 'number', required: false, description: 'Alternative routes suggested' },
        { name: 'timeSaved', type: 'number', required: false, description: 'Average time saved (minutes)' },
        { name: 'userAdoption', type: 'number', required: false, description: 'User adoption rate' }
      ],
      extractors: {
        routesAnalyzed: (context) => context.results?.analysis?.routeCount || 0,
        predictionAccuracy: (context) => context.results?.accuracy?.prediction,
        congestionEvents: (context) => context.results?.predictions?.congestionCount,
        alternativeRoutes: (context) => context.results?.suggestions?.alternativeCount,
        timeSaved: (context) => context.results?.benefits?.avgTimeSaved,
        userAdoption: (context) => context.results?.metrics?.adoptionRate
      }
    }
  },

  'cargo-tracking': {
    useCaseId: 'cargo-tracking',
    customParticulars: {
      fields: [
        { name: 'shipmentsTracked', type: 'number', required: true, description: 'Shipments tracked' },
        { name: 'realTimeUpdates', type: 'number', required: false, description: 'Real-time updates sent' },
        { name: 'delaysPredicted', type: 'number', required: false, description: 'Delays predicted' },
        { name: 'damageDetected', type: 'number', required: false, description: 'Damage incidents detected' },
        { name: 'customerQueries', type: 'number', required: false, description: 'Customer queries resolved' },
        { name: 'visibilityScore', type: 'number', required: false, description: 'Supply chain visibility score' }
      ],
      extractors: {
        shipmentsTracked: (context) => context.results?.tracking?.shipmentCount || 0,
        realTimeUpdates: (context) => context.results?.updates?.count,
        delaysPredicted: (context) => context.results?.predictions?.delayCount,
        damageDetected: (context) => context.results?.monitoring?.damageCount,
        customerQueries: (context) => context.results?.support?.resolvedQueries,
        visibilityScore: (context) => context.results?.metrics?.visibilityScore
      }
    }
  },

  'driver-safety': {
    useCaseId: 'driver-safety',
    customParticulars: {
      fields: [
        { name: 'driversMonitored', type: 'number', required: true, description: 'Drivers monitored' },
        { name: 'safetyScore', type: 'number', required: false, description: 'Average safety score' },
        { name: 'incidentsPrevented', type: 'number', required: false, description: 'Incidents prevented' },
        { name: 'riskyBehaviors', type: 'number', required: false, description: 'Risky behaviors detected' },
        { name: 'trainingRecommended', type: 'number', required: false, description: 'Training sessions recommended' },
        { name: 'insuranceImpact', type: 'number', required: false, description: 'Insurance cost impact' }
      ],
      extractors: {
        driversMonitored: (context) => context.results?.monitoring?.driverCount || 0,
        safetyScore: (context) => context.results?.safety?.avgScore,
        incidentsPrevented: (context) => context.results?.prevention?.incidentCount,
        riskyBehaviors: (context) => context.results?.detection?.behaviorCount,
        trainingRecommended: (context) => context.results?.recommendations?.trainingCount,
        insuranceImpact: (context) => context.results?.financial?.insuranceSavings
      }
    }
  },

  // Healthcare Use Cases (additional)
  'medical-diagnosis': {
    useCaseId: 'medical-diagnosis',
    customParticulars: {
      fields: [
        { name: 'casesAnalyzed', type: 'number', required: true, description: 'Cases analyzed' },
        { name: 'diagnosticAccuracy', type: 'number', required: false, description: 'Diagnostic accuracy' },
        { name: 'conditionsIdentified', type: 'array', required: false, description: 'Conditions identified' },
        { name: 'confidenceScore', type: 'number', required: false, description: 'Average confidence score' },
        { name: 'secondOpinions', type: 'number', required: false, description: 'Second opinions suggested' },
        { name: 'timeTodiagnosis', type: 'number', required: false, description: 'Time to diagnosis (hours)' }
      ],
      extractors: {
        casesAnalyzed: (context) => context.results?.analysis?.caseCount || 0,
        diagnosticAccuracy: (context) => context.results?.accuracy?.diagnostic,
        conditionsIdentified: (context) => context.results?.diagnosis?.conditions,
        confidenceScore: (context) => context.results?.confidence?.avgScore,
        secondOpinions: (context) => context.results?.recommendations?.secondOpinionCount,
        timeTodiagnosis: (context) => context.results?.efficiency?.avgDiagnosisTime
      }
    }
  },

  'treatment-recommendation': {
    useCaseId: 'treatment-recommendation',
    customParticulars: {
      fields: [
        { name: 'patientsEvaluated', type: 'number', required: true, description: 'Patients evaluated' },
        { name: 'treatmentPlans', type: 'number', required: false, description: 'Treatment plans generated' },
        { name: 'evidenceScore', type: 'number', required: false, description: 'Evidence-based score' },
        { name: 'personalizationLevel', type: 'number', required: false, description: 'Personalization level' },
        { name: 'outcomeImprovement', type: 'number', required: false, description: 'Predicted outcome improvement' },
        { name: 'costEffectiveness', type: 'number', required: false, description: 'Cost effectiveness score' }
      ],
      extractors: {
        patientsEvaluated: (context) => context.results?.evaluation?.patientCount || 0,
        treatmentPlans: (context) => context.results?.planning?.planCount,
        evidenceScore: (context) => context.results?.quality?.evidenceScore,
        personalizationLevel: (context) => context.results?.personalization?.level,
        outcomeImprovement: (context) => context.results?.predictions?.outcomeImprovement,
        costEffectiveness: (context) => context.results?.financial?.costEffectiveness
      }
    }
  },

  // Finance Use Cases (additional)
  'portfolio-optimization': {
    useCaseId: 'portfolio-optimization',
    customParticulars: {
      fields: [
        { name: 'portfoliosOptimized', type: 'number', required: true, description: 'Portfolios optimized' },
        { name: 'returnImprovement', type: 'number', required: false, description: 'Return improvement percentage' },
        { name: 'riskReduction', type: 'number', required: false, description: 'Risk reduction percentage' },
        { name: 'sharpeRatio', type: 'number', required: false, description: 'Average Sharpe ratio' },
        { name: 'rebalancingActions', type: 'number', required: false, description: 'Rebalancing actions' },
        { name: 'taxEfficiency', type: 'number', required: false, description: 'Tax efficiency score' }
      ],
      extractors: {
        portfoliosOptimized: (context) => context.results?.optimization?.portfolioCount || 0,
        returnImprovement: (context) => context.results?.performance?.returnDelta,
        riskReduction: (context) => context.results?.risk?.reductionPercentage,
        sharpeRatio: (context) => context.results?.metrics?.avgSharpeRatio,
        rebalancingActions: (context) => context.results?.actions?.rebalanceCount,
        taxEfficiency: (context) => context.results?.tax?.efficiencyScore
      }
    }
  },

  'credit-scoring': {
    useCaseId: 'credit-scoring',
    customParticulars: {
      fields: [
        { name: 'applicationsScored', type: 'number', required: true, description: 'Applications scored' },
        { name: 'avgCreditScore', type: 'number', required: false, description: 'Average credit score' },
        { name: 'defaultPrediction', type: 'number', required: false, description: 'Default prediction accuracy' },
        { name: 'riskCategories', type: 'object', required: false, description: 'Risk category distribution' },
        { name: 'approvalRate', type: 'number', required: false, description: 'Credit approval rate' },
        { name: 'modelConfidence', type: 'number', required: false, description: 'Model confidence score' }
      ],
      extractors: {
        applicationsScored: (context) => context.results?.scoring?.applicationCount || 0,
        avgCreditScore: (context) => context.results?.scores?.average,
        defaultPrediction: (context) => context.results?.predictions?.defaultAccuracy,
        riskCategories: (context) => context.results?.risk?.categoryDistribution,
        approvalRate: (context) => context.results?.decisions?.approvalRate,
        modelConfidence: (context) => context.results?.model?.confidenceScore
      }
    }
  },

  'regulatory-compliance': {
    useCaseId: 'regulatory-compliance',
    customParticulars: {
      fields: [
        { name: 'regulationsChecked', type: 'number', required: true, description: 'Regulations checked' },
        { name: 'complianceScore', type: 'number', required: false, description: 'Overall compliance score' },
        { name: 'violations', type: 'array', required: false, description: 'Violations detected' },
        { name: 'remediationItems', type: 'number', required: false, description: 'Remediation items' },
        { name: 'reportingDeadlines', type: 'array', required: false, description: 'Upcoming deadlines' },
        { name: 'penaltyRisk', type: 'number', required: false, description: 'Potential penalty amount' }
      ],
      extractors: {
        regulationsChecked: (context) => context.results?.compliance?.regulationCount || 0,
        complianceScore: (context) => context.results?.assessment?.complianceScore,
        violations: (context) => context.results?.violations?.list,
        remediationItems: (context) => context.results?.remediation?.itemCount,
        reportingDeadlines: (context) => context.results?.deadlines?.upcoming,
        penaltyRisk: (context) => context.results?.risk?.potentialPenalty
      }
    }
  },

  // Manufacturing Use Cases (additional)
  'quality-control': {
    useCaseId: 'quality-control',
    customParticulars: {
      fields: [
        { name: 'productsInspected', type: 'number', required: true, description: 'Products inspected' },
        { name: 'defectsDetected', type: 'number', required: false, description: 'Defects detected' },
        { name: 'qualityScore', type: 'number', required: false, description: 'Overall quality score' },
        { name: 'defectCategories', type: 'object', required: false, description: 'Defect categorization' },
        { name: 'processAdjustments', type: 'number', required: false, description: 'Process adjustments made' },
        { name: 'costImpact', type: 'number', required: false, description: 'Quality cost impact' }
      ],
      extractors: {
        productsInspected: (context) => context.results?.inspection?.productCount || 0,
        defectsDetected: (context) => context.results?.defects?.totalCount,
        qualityScore: (context) => context.results?.quality?.overallScore,
        defectCategories: (context) => context.results?.defects?.categorization,
        processAdjustments: (context) => context.results?.adjustments?.count,
        costImpact: (context) => context.results?.financial?.qualityCost
      }
    }
  },

  'supply-chain': {
    useCaseId: 'supply-chain',
    customParticulars: {
      fields: [
        { name: 'suppliersMonitored', type: 'number', required: true, description: 'Suppliers monitored' },
        { name: 'disruptionRisk', type: 'number', required: false, description: 'Disruption risk score' },
        { name: 'leadTimeOptimization', type: 'number', required: false, description: 'Lead time reduction' },
        { name: 'inventoryTurns', type: 'number', required: false, description: 'Inventory turnover rate' },
        { name: 'costReduction', type: 'number', required: false, description: 'Supply chain cost reduction' },
        { name: 'sustainabilityScore', type: 'number', required: false, description: 'Sustainability score' }
      ],
      extractors: {
        suppliersMonitored: (context) => context.results?.monitoring?.supplierCount || 0,
        disruptionRisk: (context) => context.results?.risk?.disruptionScore,
        leadTimeOptimization: (context) => context.results?.optimization?.leadTimeReduction,
        inventoryTurns: (context) => context.results?.inventory?.turnoverRate,
        costReduction: (context) => context.results?.financial?.costSavings,
        sustainabilityScore: (context) => context.results?.sustainability?.score
      }
    }
  },

  'production-planning': {
    useCaseId: 'production-planning',
    customParticulars: {
      fields: [
        { name: 'productionLines', type: 'number', required: true, description: 'Production lines optimized' },
        { name: 'throughputIncrease', type: 'number', required: false, description: 'Throughput increase' },
        { name: 'downtimeReduction', type: 'number', required: false, description: 'Downtime reduction' },
        { name: 'resourceUtilization', type: 'number', required: false, description: 'Resource utilization rate' },
        { name: 'scheduleAdherence', type: 'number', required: false, description: 'Schedule adherence rate' },
        { name: 'wasteReduction', type: 'number', required: false, description: 'Waste reduction percentage' }
      ],
      extractors: {
        productionLines: (context) => context.results?.planning?.lineCount || 0,
        throughputIncrease: (context) => context.results?.performance?.throughputDelta,
        downtimeReduction: (context) => context.results?.efficiency?.downtimeReduction,
        resourceUtilization: (context) => context.results?.resources?.utilizationRate,
        scheduleAdherence: (context) => context.results?.scheduling?.adherenceRate,
        wasteReduction: (context) => context.results?.sustainability?.wasteReduction
      }
    }
  },

  'inventory-optimization': {
    useCaseId: 'inventory-optimization',
    customParticulars: {
      fields: [
        { name: 'skusOptimized', type: 'number', required: true, description: 'SKUs optimized' },
        { name: 'stockoutReduction', type: 'number', required: false, description: 'Stockout reduction' },
        { name: 'excessInventory', type: 'number', required: false, description: 'Excess inventory reduction' },
        { name: 'carryingCost', type: 'number', required: false, description: 'Carrying cost reduction' },
        { name: 'turnoverImprovement', type: 'number', required: false, description: 'Turnover improvement' },
        { name: 'serviceLevel', type: 'number', required: false, description: 'Service level achievement' }
      ],
      extractors: {
        skusOptimized: (context) => context.results?.optimization?.skuCount || 0,
        stockoutReduction: (context) => context.results?.availability?.stockoutReduction,
        excessInventory: (context) => context.results?.inventory?.excessReduction,
        carryingCost: (context) => context.results?.financial?.carryingCostReduction,
        turnoverImprovement: (context) => context.results?.efficiency?.turnoverDelta,
        serviceLevel: (context) => context.results?.performance?.serviceLevel
      }
    }
  },

  // Retail Use Cases
  'demand-forecasting': {
    useCaseId: 'demand-forecasting',
    customParticulars: {
      fields: [
        { name: 'productsForecasted', type: 'number', required: true, description: 'Products forecasted' },
        { name: 'forecastAccuracy', type: 'number', required: false, description: 'Forecast accuracy' },
        { name: 'seasonalPatterns', type: 'array', required: false, description: 'Seasonal patterns detected' },
        { name: 'stockOptimization', type: 'number', required: false, description: 'Stock optimization rate' },
        { name: 'revenueImpact', type: 'number', required: false, description: 'Revenue impact' },
        { name: 'wasteReduction', type: 'number', required: false, description: 'Waste reduction' }
      ],
      extractors: {
        productsForecasted: (context) => context.results?.forecasting?.productCount || 0,
        forecastAccuracy: (context) => context.results?.accuracy?.forecast,
        seasonalPatterns: (context) => context.results?.patterns?.seasonal,
        stockOptimization: (context) => context.results?.optimization?.stockRate,
        revenueImpact: (context) => context.results?.financial?.revenueImpact,
        wasteReduction: (context) => context.results?.sustainability?.wasteReduction
      }
    }
  },

  'customer-analytics': {
    useCaseId: 'customer-analytics',
    customParticulars: {
      fields: [
        { name: 'customersAnalyzed', type: 'number', required: true, description: 'Customers analyzed' },
        { name: 'segmentsIdentified', type: 'number', required: false, description: 'Customer segments identified' },
        { name: 'lifetimeValue', type: 'number', required: false, description: 'Average lifetime value' },
        { name: 'churnPrediction', type: 'number', required: false, description: 'Churn prediction accuracy' },
        { name: 'crossSellOpportunities', type: 'number', required: false, description: 'Cross-sell opportunities' },
        { name: 'personalizationScore', type: 'number', required: false, description: 'Personalization score' }
      ],
      extractors: {
        customersAnalyzed: (context) => context.results?.analytics?.customerCount || 0,
        segmentsIdentified: (context) => context.results?.segmentation?.segmentCount,
        lifetimeValue: (context) => context.results?.metrics?.avgLTV,
        churnPrediction: (context) => context.results?.predictions?.churnAccuracy,
        crossSellOpportunities: (context) => context.results?.opportunities?.crossSellCount,
        personalizationScore: (context) => context.results?.personalization?.score
      }
    }
  },

  'price-optimization': {
    useCaseId: 'price-optimization',
    customParticulars: {
      fields: [
        { name: 'productsOptimized', type: 'number', required: true, description: 'Products price-optimized' },
        { name: 'revenueIncrease', type: 'number', required: false, description: 'Revenue increase percentage' },
        { name: 'marginImprovement', type: 'number', required: false, description: 'Margin improvement' },
        { name: 'elasticityScore', type: 'number', required: false, description: 'Price elasticity score' },
        { name: 'competitivePosition', type: 'string', required: false, description: 'Competitive position' },
        { name: 'promotionEffectiveness', type: 'number', required: false, description: 'Promotion effectiveness' }
      ],
      extractors: {
        productsOptimized: (context) => context.results?.optimization?.productCount || 0,
        revenueIncrease: (context) => context.results?.financial?.revenueDelta,
        marginImprovement: (context) => context.results?.financial?.marginDelta,
        elasticityScore: (context) => context.results?.analysis?.elasticity,
        competitivePosition: (context) => context.results?.market?.position,
        promotionEffectiveness: (context) => context.results?.promotions?.effectiveness
      }
    }
  },

  'store-layout': {
    useCaseId: 'store-layout',
    customParticulars: {
      fields: [
        { name: 'storesOptimized', type: 'number', required: true, description: 'Stores optimized' },
        { name: 'salesIncrease', type: 'number', required: false, description: 'Sales increase percentage' },
        { name: 'customerFlow', type: 'number', required: false, description: 'Customer flow improvement' },
        { name: 'conversionRate', type: 'number', required: false, description: 'Conversion rate improvement' },
        { name: 'dwellTime', type: 'number', required: false, description: 'Average dwell time' },
        { name: 'basketSize', type: 'number', required: false, description: 'Average basket size increase' }
      ],
      extractors: {
        storesOptimized: (context) => context.results?.optimization?.storeCount || 0,
        salesIncrease: (context) => context.results?.performance?.salesDelta,
        customerFlow: (context) => context.results?.analytics?.flowImprovement,
        conversionRate: (context) => context.results?.metrics?.conversionDelta,
        dwellTime: (context) => context.results?.analytics?.avgDwellTime,
        basketSize: (context) => context.results?.metrics?.basketSizeDelta
      }
    }
  },

  'recommendation-engine': {
    useCaseId: 'recommendation-engine',
    customParticulars: {
      fields: [
        { name: 'recommendationsGenerated', type: 'number', required: true, description: 'Recommendations generated' },
        { name: 'clickThroughRate', type: 'number', required: false, description: 'Click-through rate' },
        { name: 'conversionRate', type: 'number', required: false, description: 'Conversion rate' },
        { name: 'relevanceScore', type: 'number', required: false, description: 'Relevance score' },
        { name: 'revenuePerUser', type: 'number', required: false, description: 'Revenue per user increase' },
        { name: 'userEngagement', type: 'number', required: false, description: 'User engagement score' }
      ],
      extractors: {
        recommendationsGenerated: (context) => context.results?.recommendations?.totalCount || 0,
        clickThroughRate: (context) => context.results?.metrics?.ctr,
        conversionRate: (context) => context.results?.metrics?.conversionRate,
        relevanceScore: (context) => context.results?.quality?.relevanceScore,
        revenuePerUser: (context) => context.results?.financial?.rpuIncrease,
        userEngagement: (context) => context.results?.engagement?.score
      }
    }
  },

  // Agriculture Use Cases
  'crop-yield': {
    useCaseId: 'crop-yield',
    customParticulars: {
      fields: [
        { name: 'fieldsAnalyzed', type: 'number', required: true, description: 'Fields analyzed' },
        { name: 'yieldPrediction', type: 'number', required: false, description: 'Yield prediction (tons)' },
        { name: 'accuracyScore', type: 'number', required: false, description: 'Prediction accuracy' },
        { name: 'optimalHarvestDate', type: 'string', required: false, description: 'Optimal harvest date' },
        { name: 'riskFactors', type: 'array', required: false, description: 'Identified risk factors' },
        { name: 'revenueProjection', type: 'number', required: false, description: 'Revenue projection' }
      ],
      extractors: {
        fieldsAnalyzed: (context) => context.results?.analysis?.fieldCount || 0,
        yieldPrediction: (context) => context.results?.predictions?.totalYield,
        accuracyScore: (context) => context.results?.accuracy?.score,
        optimalHarvestDate: (context) => context.results?.optimization?.harvestDate,
        riskFactors: (context) => context.results?.risks?.factors,
        revenueProjection: (context) => context.results?.financial?.projectedRevenue
      }
    }
  },

  'irrigation-management': {
    useCaseId: 'irrigation-management',
    customParticulars: {
      fields: [
        { name: 'irrigationZones', type: 'number', required: true, description: 'Irrigation zones managed' },
        { name: 'waterSaved', type: 'number', required: false, description: 'Water saved (liters)' },
        { name: 'yieldImprovement', type: 'number', required: false, description: 'Yield improvement percentage' },
        { name: 'energySavings', type: 'number', required: false, description: 'Energy savings (kWh)' },
        { name: 'soilMoisture', type: 'number', required: false, description: 'Optimal soil moisture rate' },
        { name: 'scheduleOptimization', type: 'number', required: false, description: 'Schedule optimization rate' }
      ],
      extractors: {
        irrigationZones: (context) => context.results?.management?.zoneCount || 0,
        waterSaved: (context) => context.results?.conservation?.waterSaved,
        yieldImprovement: (context) => context.results?.productivity?.yieldDelta,
        energySavings: (context) => context.results?.efficiency?.energySaved,
        soilMoisture: (context) => context.results?.monitoring?.moistureOptimization,
        scheduleOptimization: (context) => context.results?.scheduling?.optimizationRate
      }
    }
  },

  'pest-detection': {
    useCaseId: 'pest-detection',
    customParticulars: {
      fields: [
        { name: 'areasScanned', type: 'number', required: true, description: 'Areas scanned (hectares)' },
        { name: 'pestsDetected', type: 'number', required: false, description: 'Pest infestations detected' },
        { name: 'earlyDetectionRate', type: 'number', required: false, description: 'Early detection rate' },
        { name: 'treatmentRecommendations', type: 'number', required: false, description: 'Treatment recommendations' },
        { name: 'cropSaved', type: 'number', required: false, description: 'Crop area saved (hectares)' },
        { name: 'pesticideReduction', type: 'number', required: false, description: 'Pesticide reduction percentage' }
      ],
      extractors: {
        areasScanned: (context) => context.results?.scanning?.areaTotal || 0,
        pestsDetected: (context) => context.results?.detection?.pestCount,
        earlyDetectionRate: (context) => context.results?.efficiency?.earlyDetection,
        treatmentRecommendations: (context) => context.results?.recommendations?.treatmentCount,
        cropSaved: (context) => context.results?.impact?.areaSaved,
        pesticideReduction: (context) => context.results?.sustainability?.pesticideReduction
      }
    }
  },

  'livestock-monitoring': {
    useCaseId: 'livestock-monitoring',
    customParticulars: {
      fields: [
        { name: 'animalsMonitored', type: 'number', required: true, description: 'Animals monitored' },
        { name: 'healthAlerts', type: 'number', required: false, description: 'Health alerts generated' },
        { name: 'behaviorAnomalies', type: 'number', required: false, description: 'Behavior anomalies detected' },
        { name: 'feedOptimization', type: 'number', required: false, description: 'Feed optimization rate' },
        { name: 'mortalityReduction', type: 'number', required: false, description: 'Mortality reduction percentage' },
        { name: 'productivityIncrease', type: 'number', required: false, description: 'Productivity increase' }
      ],
      extractors: {
        animalsMonitored: (context) => context.results?.monitoring?.animalCount || 0,
        healthAlerts: (context) => context.results?.health?.alertCount,
        behaviorAnomalies: (context) => context.results?.behavior?.anomalyCount,
        feedOptimization: (context) => context.results?.optimization?.feedEfficiency,
        mortalityReduction: (context) => context.results?.health?.mortalityReduction,
        productivityIncrease: (context) => context.results?.productivity?.increase
      }
    }
  },

  // Utilities Use Cases
  'smart-metering': {
    useCaseId: 'smart-metering',
    customParticulars: {
      fields: [
        { name: 'metersMonitored', type: 'number', required: true, description: 'Smart meters monitored' },
        { name: 'anomaliesDetected', type: 'number', required: false, description: 'Usage anomalies detected' },
        { name: 'leakageDetected', type: 'number', required: false, description: 'Leakages detected' },
        { name: 'billingAccuracy', type: 'number', required: false, description: 'Billing accuracy improvement' },
        { name: 'consumptionReduction', type: 'number', required: false, description: 'Consumption reduction' },
        { name: 'customerSatisfaction', type: 'number', required: false, description: 'Customer satisfaction score' }
      ],
      extractors: {
        metersMonitored: (context) => context.results?.monitoring?.meterCount || 0,
        anomaliesDetected: (context) => context.results?.detection?.anomalyCount,
        leakageDetected: (context) => context.results?.detection?.leakCount,
        billingAccuracy: (context) => context.results?.billing?.accuracyImprovement,
        consumptionReduction: (context) => context.results?.conservation?.consumptionReduction,
        customerSatisfaction: (context) => context.results?.satisfaction?.score
      }
    }
  },

  'outage-prediction': {
    useCaseId: 'outage-prediction',
    customParticulars: {
      fields: [
        { name: 'gridSegments', type: 'number', required: true, description: 'Grid segments analyzed' },
        { name: 'outagesPredicted', type: 'number', required: false, description: 'Outages predicted' },
        { name: 'predictionAccuracy', type: 'number', required: false, description: 'Prediction accuracy' },
        { name: 'preventedOutages', type: 'number', required: false, description: 'Outages prevented' },
        { name: 'customersProtected', type: 'number', required: false, description: 'Customers protected' },
        { name: 'economicImpact', type: 'number', required: false, description: 'Economic impact avoided' }
      ],
      extractors: {
        gridSegments: (context) => context.results?.analysis?.segmentCount || 0,
        outagesPredicted: (context) => context.results?.predictions?.outageCount,
        predictionAccuracy: (context) => context.results?.accuracy?.prediction,
        preventedOutages: (context) => context.results?.prevention?.outagesPrevented,
        customersProtected: (context) => context.results?.impact?.customersProtected,
        economicImpact: (context) => context.results?.financial?.impactAvoided
      }
    }
  },

  // Government Use Cases
  'citizen-services': {
    useCaseId: 'citizen-services',
    customParticulars: {
      fields: [
        { name: 'servicesDigitized', type: 'number', required: true, description: 'Services digitized' },
        { name: 'citizensServed', type: 'number', required: false, description: 'Citizens served' },
        { name: 'processingTime', type: 'number', required: false, description: 'Average processing time' },
        { name: 'satisfactionScore', type: 'number', required: false, description: 'Citizen satisfaction score' },
        { name: 'costReduction', type: 'number', required: false, description: 'Operational cost reduction' },
        { name: 'accessibilityScore', type: 'number', required: false, description: 'Accessibility score' }
      ],
      extractors: {
        servicesDigitized: (context) => context.results?.digitization?.serviceCount || 0,
        citizensServed: (context) => context.results?.usage?.citizenCount,
        processingTime: (context) => context.results?.efficiency?.avgProcessingTime,
        satisfactionScore: (context) => context.results?.satisfaction?.citizenScore,
        costReduction: (context) => context.results?.financial?.costSavings,
        accessibilityScore: (context) => context.results?.accessibility?.score
      }
    }
  },

  'tax-compliance': {
    useCaseId: 'tax-compliance',
    customParticulars: {
      fields: [
        { name: 'returnsProcessed', type: 'number', required: true, description: 'Tax returns processed' },
        { name: 'complianceRate', type: 'number', required: false, description: 'Compliance rate improvement' },
        { name: 'fraudDetected', type: 'number', required: false, description: 'Tax fraud cases detected' },
        { name: 'revenueRecovered', type: 'number', required: false, description: 'Revenue recovered' },
        { name: 'processingEfficiency', type: 'number', required: false, description: 'Processing efficiency' },
        { name: 'auditEffectiveness', type: 'number', required: false, description: 'Audit effectiveness score' }
      ],
      extractors: {
        returnsProcessed: (context) => context.results?.processing?.returnCount || 0,
        complianceRate: (context) => context.results?.compliance?.rateImprovement,
        fraudDetected: (context) => context.results?.fraud?.casesDetected,
        revenueRecovered: (context) => context.results?.financial?.revenueRecovered,
        processingEfficiency: (context) => context.results?.efficiency?.processingRate,
        auditEffectiveness: (context) => context.results?.audit?.effectivenessScore
      }
    }
  }
};