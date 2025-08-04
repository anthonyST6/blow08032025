import { UseCaseAuditConfig } from './use-case-audit-config';

// Remaining workflow audit configurations
export const remainingWorkflowAuditConfigs: Record<string, UseCaseAuditConfig> = {
  // Retail - Customer Experience
  'customer-experience-workflow': {
    useCaseId: 'customer-experience-workflow',
    customParticulars: {
      fields: [
        { name: 'customersAnalyzed', type: 'number', required: true, description: 'Customers analyzed' },
        { name: 'satisfactionScore', type: 'number', required: false, description: 'Customer satisfaction score' },
        { name: 'churnRisk', type: 'number', required: false, description: 'Churn risk percentage' },
        { name: 'personalizationRate', type: 'number', required: false, description: 'Personalization success rate' },
        { name: 'revenueImpact', type: 'number', required: false, description: 'Revenue impact' },
        { name: 'recommendationAccuracy', type: 'number', required: false, description: 'Recommendation accuracy' }
      ],
      extractors: {
        customersAnalyzed: (context) => context.results?.analysis?.customerCount || 0,
        satisfactionScore: (context) => context.results?.satisfaction?.score,
        churnRisk: (context) => context.results?.risk?.churnPercentage,
        personalizationRate: (context) => context.results?.personalization?.successRate,
        revenueImpact: (context) => context.results?.financial?.revenueIncrease,
        recommendationAccuracy: (context) => context.results?.recommendations?.accuracy
      }
    }
  },

  // Retail - Dynamic Pricing
  'dynamic-pricing-workflow': {
    useCaseId: 'dynamic-pricing-workflow',
    customParticulars: {
      fields: [
        { name: 'productsOptimized', type: 'number', required: true, description: 'Products with optimized pricing' },
        { name: 'priceElasticity', type: 'number', required: false, description: 'Average price elasticity' },
        { name: 'revenueIncrease', type: 'number', required: false, description: 'Revenue increase percentage' },
        { name: 'marginImprovement', type: 'number', required: false, description: 'Margin improvement' },
        { name: 'competitorPrices', type: 'number', required: false, description: 'Competitor prices analyzed' },
        { name: 'demandForecast', type: 'number', required: false, description: 'Demand forecast accuracy' }
      ],
      extractors: {
        productsOptimized: (context) => context.results?.optimization?.productCount || 0,
        priceElasticity: (context) => context.results?.analysis?.avgElasticity,
        revenueIncrease: (context) => context.results?.financial?.revenueGrowth,
        marginImprovement: (context) => context.results?.financial?.marginDelta,
        competitorPrices: (context) => context.results?.competitive?.priceCount,
        demandForecast: (context) => context.results?.forecast?.accuracy
      }
    }
  },

  // Transportation - Fleet Optimization
  'fleet-optimization-workflow': {
    useCaseId: 'fleet-optimization-workflow',
    customParticulars: {
      fields: [
        { name: 'vehiclesOptimized', type: 'number', required: true, description: 'Vehicles optimized' },
        { name: 'routeEfficiency', type: 'number', required: false, description: 'Route efficiency improvement' },
        { name: 'fuelSavings', type: 'number', required: false, description: 'Fuel cost savings' },
        { name: 'deliveryTime', type: 'number', required: false, description: 'Average delivery time reduction' },
        { name: 'vehicleUtilization', type: 'number', required: false, description: 'Vehicle utilization rate' },
        { name: 'maintenanceCost', type: 'number', required: false, description: 'Maintenance cost reduction' }
      ],
      extractors: {
        vehiclesOptimized: (context) => context.results?.fleet?.vehicleCount || 0,
        routeEfficiency: (context) => context.results?.routing?.efficiencyGain,
        fuelSavings: (context) => context.results?.financial?.fuelSavings,
        deliveryTime: (context) => context.results?.performance?.timeReduction,
        vehicleUtilization: (context) => context.results?.utilization?.rate,
        maintenanceCost: (context) => context.results?.maintenance?.costReduction
      }
    }
  },

  // Transportation - Predictive Maintenance
  'predictive-maintenance-transport-workflow': {
    useCaseId: 'predictive-maintenance-transport-workflow',
    customParticulars: {
      fields: [
        { name: 'vehiclesMonitored', type: 'number', required: true, description: 'Vehicles monitored' },
        { name: 'failuresPredicted', type: 'number', required: false, description: 'Failures predicted' },
        { name: 'downtimePrevented', type: 'number', required: false, description: 'Downtime hours prevented' },
        { name: 'maintenanceCost', type: 'number', required: false, description: 'Maintenance cost savings' },
        { name: 'componentHealth', type: 'object', required: false, description: 'Component health scores' },
        { name: 'safetyIncidents', type: 'number', required: false, description: 'Safety incidents prevented' }
      ],
      extractors: {
        vehiclesMonitored: (context) => context.results?.monitoring?.vehicleCount || 0,
        failuresPredicted: (context) => context.results?.predictions?.failureCount,
        downtimePrevented: (context) => context.results?.impact?.downtimeHours,
        maintenanceCost: (context) => context.results?.financial?.savings,
        componentHealth: (context) => context.results?.health?.components,
        safetyIncidents: (context) => context.results?.safety?.incidentsPrevented
      }
    }
  },

  // Transportation - Cargo Tracking
  'cargo-tracking-workflow': {
    useCaseId: 'cargo-tracking-workflow',
    customParticulars: {
      fields: [
        { name: 'shipmentsTracked', type: 'number', required: true, description: 'Shipments tracked' },
        { name: 'deliveryAccuracy', type: 'number', required: false, description: 'Delivery time accuracy' },
        { name: 'delaysPredicted', type: 'number', required: false, description: 'Delays predicted' },
        { name: 'customerNotifications', type: 'number', required: false, description: 'Customer notifications sent' },
        { name: 'lossReduction', type: 'number', required: false, description: 'Cargo loss reduction' },
        { name: 'visibilityScore', type: 'number', required: false, description: 'Supply chain visibility score' }
      ],
      extractors: {
        shipmentsTracked: (context) => context.results?.tracking?.shipmentCount || 0,
        deliveryAccuracy: (context) => context.results?.performance?.accuracy,
        delaysPredicted: (context) => context.results?.predictions?.delayCount,
        customerNotifications: (context) => context.results?.notifications?.count,
        lossReduction: (context) => context.results?.security?.lossReduction,
        visibilityScore: (context) => context.results?.visibility?.score
      }
    }
  },

  // Education - Student Performance
  'student-performance-workflow': {
    useCaseId: 'student-performance-workflow',
    customParticulars: {
      fields: [
        { name: 'studentsAnalyzed', type: 'number', required: true, description: 'Students analyzed' },
        { name: 'atRiskIdentified', type: 'number', required: false, description: 'At-risk students identified' },
        { name: 'interventionSuccess', type: 'number', required: false, description: 'Intervention success rate' },
        { name: 'gradeImprovement', type: 'number', required: false, description: 'Average grade improvement' },
        { name: 'dropoutPrevention', type: 'number', required: false, description: 'Dropout prevention rate' },
        { name: 'engagementScore', type: 'number', required: false, description: 'Student engagement score' }
      ],
      extractors: {
        studentsAnalyzed: (context) => context.results?.analysis?.studentCount || 0,
        atRiskIdentified: (context) => context.results?.risk?.atRiskCount,
        interventionSuccess: (context) => context.results?.interventions?.successRate,
        gradeImprovement: (context) => context.results?.performance?.gradeIncrease,
        dropoutPrevention: (context) => context.results?.retention?.preventionRate,
        engagementScore: (context) => context.results?.engagement?.avgScore
      }
    }
  },

  // Education - Curriculum Optimization
  'curriculum-optimization-workflow': {
    useCaseId: 'curriculum-optimization-workflow',
    customParticulars: {
      fields: [
        { name: 'coursesOptimized', type: 'number', required: true, description: 'Courses optimized' },
        { name: 'learningOutcomes', type: 'number', required: false, description: 'Learning outcome improvement' },
        { name: 'contentEffectiveness', type: 'number', required: false, description: 'Content effectiveness score' },
        { name: 'skillGapsClosed', type: 'number', required: false, description: 'Skill gaps addressed' },
        { name: 'completionRate', type: 'number', required: false, description: 'Course completion rate' },
        { name: 'satisfactionScore', type: 'number', required: false, description: 'Student satisfaction score' }
      ],
      extractors: {
        coursesOptimized: (context) => context.results?.optimization?.courseCount || 0,
        learningOutcomes: (context) => context.results?.outcomes?.improvement,
        contentEffectiveness: (context) => context.results?.content?.effectiveness,
        skillGapsClosed: (context) => context.results?.skills?.gapsAddressed,
        completionRate: (context) => context.results?.completion?.rate,
        satisfactionScore: (context) => context.results?.satisfaction?.score
      }
    }
  },

  // Education - Resource Allocation
  'resource-allocation-workflow': {
    useCaseId: 'resource-allocation-workflow',
    customParticulars: {
      fields: [
        { name: 'resourcesAllocated', type: 'number', required: true, description: 'Resources allocated' },
        { name: 'utilizationRate', type: 'number', required: false, description: 'Resource utilization rate' },
        { name: 'costEfficiency', type: 'number', required: false, description: 'Cost efficiency improvement' },
        { name: 'accessImprovement', type: 'number', required: false, description: 'Student access improvement' },
        { name: 'waitTimeReduction', type: 'number', required: false, description: 'Wait time reduction' },
        { name: 'equityScore', type: 'number', required: false, description: 'Resource equity score' }
      ],
      extractors: {
        resourcesAllocated: (context) => context.results?.allocation?.resourceCount || 0,
        utilizationRate: (context) => context.results?.utilization?.rate,
        costEfficiency: (context) => context.results?.financial?.efficiencyGain,
        accessImprovement: (context) => context.results?.access?.improvement,
        waitTimeReduction: (context) => context.results?.performance?.waitReduction,
        equityScore: (context) => context.results?.equity?.score
      }
    }
  },

  // Pharmaceuticals - Drug Discovery
  'drug-discovery-workflow': {
    useCaseId: 'drug-discovery-workflow',
    customParticulars: {
      fields: [
        { name: 'compoundsScreened', type: 'number', required: true, description: 'Compounds screened' },
        { name: 'candidatesIdentified', type: 'number', required: false, description: 'Drug candidates identified' },
        { name: 'successProbability', type: 'number', required: false, description: 'Success probability score' },
        { name: 'timeReduction', type: 'number', required: false, description: 'Discovery time reduction' },
        { name: 'costSavings', type: 'number', required: false, description: 'R&D cost savings' },
        { name: 'targetInteractions', type: 'number', required: false, description: 'Target interactions predicted' }
      ],
      extractors: {
        compoundsScreened: (context) => context.results?.screening?.compoundCount || 0,
        candidatesIdentified: (context) => context.results?.candidates?.count,
        successProbability: (context) => context.results?.probability?.score,
        timeReduction: (context) => context.results?.efficiency?.timeReduction,
        costSavings: (context) => context.results?.financial?.rdSavings,
        targetInteractions: (context) => context.results?.interactions?.count
      }
    }
  },

  // Pharmaceuticals - Clinical Trial
  'clinical-trial-workflow': {
    useCaseId: 'clinical-trial-workflow',
    customParticulars: {
      fields: [
        { name: 'trialsOptimized', type: 'number', required: true, description: 'Clinical trials optimized' },
        { name: 'patientMatches', type: 'number', required: false, description: 'Patient matches found' },
        { name: 'enrollmentSpeed', type: 'number', required: false, description: 'Enrollment speed improvement' },
        { name: 'protocolDeviations', type: 'number', required: false, description: 'Protocol deviations reduced' },
        { name: 'dataQuality', type: 'number', required: false, description: 'Data quality score' },
        { name: 'completionRate', type: 'number', required: false, description: 'Trial completion rate' }
      ],
      extractors: {
        trialsOptimized: (context) => context.results?.optimization?.trialCount || 0,
        patientMatches: (context) => context.results?.matching?.patientCount,
        enrollmentSpeed: (context) => context.results?.enrollment?.speedIncrease,
        protocolDeviations: (context) => context.results?.compliance?.deviationReduction,
        dataQuality: (context) => context.results?.quality?.score,
        completionRate: (context) => context.results?.completion?.rate
      }
    }
  },

  // Pharmaceuticals - Supply Chain
  'supply-chain-pharma-workflow': {
    useCaseId: 'supply-chain-pharma-workflow',
    customParticulars: {
      fields: [
        { name: 'productsTracked', type: 'number', required: true, description: 'Pharmaceutical products tracked' },
        { name: 'temperatureCompliance', type: 'number', required: false, description: 'Temperature compliance rate' },
        { name: 'counterfeitDetection', type: 'number', required: false, description: 'Counterfeit products detected' },
        { name: 'expiryPrevention', type: 'number', required: false, description: 'Expiry waste prevented' },
        { name: 'regulatoryCompliance', type: 'number', required: false, description: 'Regulatory compliance score' },
        { name: 'distributionEfficiency', type: 'number', required: false, description: 'Distribution efficiency' }
      ],
      extractors: {
        productsTracked: (context) => context.results?.tracking?.productCount || 0,
        temperatureCompliance: (context) => context.results?.compliance?.temperatureRate,
        counterfeitDetection: (context) => context.results?.security?.counterfeitCount,
        expiryPrevention: (context) => context.results?.waste?.expiryPrevented,
        regulatoryCompliance: (context) => context.results?.compliance?.regulatoryScore,
        distributionEfficiency: (context) => context.results?.distribution?.efficiency
      }
    }
  },

  // Government - Citizen Services
  'citizen-services-workflow': {
    useCaseId: 'citizen-services-workflow',
    customParticulars: {
      fields: [
        { name: 'servicesDigitized', type: 'number', required: true, description: 'Services digitized' },
        { name: 'citizensServed', type: 'number', required: false, description: 'Citizens served' },
        { name: 'processingTime', type: 'number', required: false, description: 'Average processing time reduction' },
        { name: 'satisfactionScore', type: 'number', required: false, description: 'Citizen satisfaction score' },
        { name: 'costReduction', type: 'number', required: false, description: 'Operational cost reduction' },
        { name: 'accessibilityScore', type: 'number', required: false, description: 'Service accessibility score' }
      ],
      extractors: {
        servicesDigitized: (context) => context.results?.digitization?.serviceCount || 0,
        citizensServed: (context) => context.results?.usage?.citizenCount,
        processingTime: (context) => context.results?.efficiency?.timeReduction,
        satisfactionScore: (context) => context.results?.satisfaction?.score,
        costReduction: (context) => context.results?.financial?.costSavings,
        accessibilityScore: (context) => context.results?.accessibility?.score
      }
    }
  },

  // Government - Public Safety
  'public-safety-workflow': {
    useCaseId: 'public-safety-workflow',
    customParticulars: {
      fields: [
        { name: 'incidentsAnalyzed', type: 'number', required: true, description: 'Incidents analyzed' },
        { name: 'crimePredictions', type: 'number', required: false, description: 'Crime predictions made' },
        { name: 'responseTime', type: 'number', required: false, description: 'Emergency response time improvement' },
        { name: 'preventedIncidents', type: 'number', required: false, description: 'Incidents prevented' },
        { name: 'resourceOptimization', type: 'number', required: false, description: 'Resource optimization score' },
        { name: 'communityTrust', type: 'number', required: false, description: 'Community trust score' }
      ],
      extractors: {
        incidentsAnalyzed: (context) => context.results?.analysis?.incidentCount || 0,
        crimePredictions: (context) => context.results?.predictions?.crimeCount,
        responseTime: (context) => context.results?.response?.timeImprovement,
        preventedIncidents: (context) => context.results?.prevention?.incidentCount,
        resourceOptimization: (context) => context.results?.resources?.optimizationScore,
        communityTrust: (context) => context.results?.community?.trustScore
      }
    }
  },

  // Government - Regulatory Compliance
  'regulatory-compliance-workflow': {
    useCaseId: 'regulatory-compliance-workflow',
    customParticulars: {
      fields: [
        { name: 'regulationsMonitored', type: 'number', required: true, description: 'Regulations monitored' },
        { name: 'complianceScore', type: 'number', required: false, description: 'Overall compliance score' },
        { name: 'violationsDetected', type: 'number', required: false, description: 'Violations detected' },
        { name: 'remediationTime', type: 'number', required: false, description: 'Average remediation time' },
        { name: 'penaltiesAvoided', type: 'number', required: false, description: 'Penalties avoided' },
        { name: 'auditReadiness', type: 'number', required: false, description: 'Audit readiness score' }
      ],
      extractors: {
        regulationsMonitored: (context) => context.results?.monitoring?.regulationCount || 0,
        complianceScore: (context) => context.results?.compliance?.overallScore,
        violationsDetected: (context) => context.results?.violations?.count,
        remediationTime: (context) => context.results?.remediation?.avgTime,
        penaltiesAvoided: (context) => context.results?.financial?.penaltiesAvoided,
        auditReadiness: (context) => context.results?.audit?.readinessScore
      }
    }
  },

  // Telecommunications - Network Optimization
  'network-optimization-workflow': {
    useCaseId: 'network-optimization-workflow',
    customParticulars: {
      fields: [
        { name: 'networkNodes', type: 'number', required: true, description: 'Network nodes optimized' },
        { name: 'latencyReduction', type: 'number', required: false, description: 'Latency reduction percentage' },
        { name: 'throughputIncrease', type: 'number', required: false, description: 'Throughput increase' },
        { name: 'packetLoss', type: 'number', required: false, description: 'Packet loss reduction' },
        { name: 'uptimeImprovement', type: 'number', required: false, description: 'Uptime improvement' },
        { name: 'costEfficiency', type: 'number', required: false, description: 'Network cost efficiency' }
      ],
      extractors: {
        networkNodes: (context) => context.results?.optimization?.nodeCount || 0,
        latencyReduction: (context) => context.results?.performance?.latencyReduction,
        throughputIncrease: (context) => context.results?.performance?.throughputGain,
        packetLoss: (context) => context.results?.quality?.packetLossReduction,
        uptimeImprovement: (context) => context.results?.reliability?.uptimeIncrease,
        costEfficiency: (context) => context.results?.financial?.efficiencyGain
      }
    }
  },

  // Telecommunications - Customer Churn
  'customer-churn-workflow': {
    useCaseId: 'customer-churn-workflow',
    customParticulars: {
      fields: [
        { name: 'customersAnalyzed', type: 'number', required: true, description: 'Customers analyzed for churn' },
        { name: 'churnPredicted', type: 'number', required: false, description: 'Customers predicted to churn' },
        { name: 'retentionRate', type: 'number', required: false, description: 'Retention rate improvement' },
        { name: 'lifetimeValue', type: 'number', required: false, description: 'Customer lifetime value increase' },
        { name: 'interventionSuccess', type: 'number', required: false, description: 'Intervention success rate' },
        { name: 'revenueSaved', type: 'number', required: false, description: 'Revenue saved from retention' }
      ],
      extractors: {
        customersAnalyzed: (context) => context.results?.analysis?.customerCount || 0,
        churnPredicted: (context) => context.results?.predictions?.churnCount,
        retentionRate: (context) => context.results?.retention?.rateImprovement,
        lifetimeValue: (context) => context.results?.value?.lifetimeIncrease,
        interventionSuccess: (context) => context.results?.interventions?.successRate,
        revenueSaved: (context) => context.results?.financial?.revenueSaved
      }
    }
  },

  // Telecommunications - Fraud Detection
  'fraud-detection-telecom-workflow': {
    useCaseId: 'fraud-detection-telecom-workflow',
    customParticulars: {
      fields: [
        { name: 'callsAnalyzed', type: 'number', required: true, description: 'Calls analyzed for fraud' },
        { name: 'fraudDetected', type: 'number', required: false, description: 'Fraudulent activities detected' },
        { name: 'falsePositiveRate', type: 'number', required: false, description: 'False positive rate' },
        { name: 'lossesPrevented', type: 'number', required: false, description: 'Financial losses prevented' },
        { name: 'detectionSpeed', type: 'number', required: false, description: 'Average detection time' },
        { name: 'accuracyScore', type: 'number', required: false, description: 'Detection accuracy score' }
      ],
      extractors: {
        callsAnalyzed: (context) => context.results?.analysis?.callCount || 0,
        fraudDetected: (context) => context.results?.detection?.fraudCount,
        falsePositiveRate: (context) => context.results?.accuracy?.falsePositiveRate,
        lossesPrevented: (context) => context.results?.financial?.lossesPrevented,
        detectionSpeed: (context) => context.results?.performance?.avgDetectionTime,
        accuracyScore: (context) => context.results?.accuracy?.overallScore
      }
    }
  },

  // Real Estate - Property Valuation
  'property-valuation-workflow': {
    useCaseId: 'property-valuation-workflow',
    customParticulars: {
      fields: [
        { name: 'propertiesValued', type: 'number', required: true, description: 'Properties valued' },
        { name: 'valuationAccuracy', type: 'number', required: false, description: 'Valuation accuracy rate' },
        { name: 'marketTrends', type: 'object', required: false, description: 'Market trend analysis' },
        { name: 'timeReduction', type: 'number', required: false, description: 'Valuation time reduction' },
        { name: 'priceVariance', type: 'number', required: false, description: 'Price variance from market' },
        { name: 'confidenceScore', type: 'number', required: false, description: 'Valuation confidence score' }
      ],
      extractors: {
        propertiesValued: (context) => context.results?.valuation?.propertyCount || 0,
        valuationAccuracy: (context) => context.results?.accuracy?.rate,
        marketTrends: (context) => context.results?.market?.trends,
        timeReduction: (context) => context.results?.efficiency?.timeReduction,
        priceVariance: (context) => context.results?.analysis?.priceVariance,
        confidenceScore: (context) => context.results?.confidence?.score
      }
    }
  },

  // Real Estate - Tenant Screening
  'tenant-screening-workflow': {
    useCaseId: 'tenant-screening-workflow',
    customParticulars: {
      fields: [
        { name: 'applicantsScreened', type: 'number', required: true, description: 'Tenant applicants screened' },
        { name: 'riskScore', type: 'number', required: false, description: 'Average tenant risk score' },
        { name: 'approvalRate', type: 'number', required: false, description: 'Application approval rate' },
        { name: 'screeningTime', type: 'number', required: false, description: 'Screening time reduction' },
        { name: 'defaultPrevention', type: 'number', required: false, description: 'Default rate reduction' },
        { name: 'complianceScore', type: 'number', required: false, description: 'Fair housing compliance score' }
      ],
      extractors: {
        applicantsScreened: (context) => context.results?.screening?.applicantCount || 0,
        riskScore: (context) => context.results?.risk?.avgScore,
        approvalRate: (context) => context.results?.decisions?.approvalRate,
        screeningTime: (context) => context.results?.efficiency?.timeReduction,
        defaultPrevention: (context) => context.results?.prevention?.defaultReduction,
        complianceScore: (context) => context.results?.compliance?.fairHousingScore
      }
    }
  },

  // Real Estate - Property Management
  'property-management-workflow': {
    useCaseId: 'property-management-workflow',
    customParticulars: {
      fields: [
        { name: 'propertiesManaged', type: 'number', required: true, description: 'Properties under management' },
        { name: 'maintenanceEfficiency', type: 'number', required: false, description: 'Maintenance efficiency score' },
        { name: 'occupancyRate', type: 'number', required: false, description: 'Average occupancy rate' },
        { name: 'tenantSatisfaction', type: 'number', required: false, description: 'Tenant satisfaction score' },
        { name: 'operationalCost', type: 'number', required: false, description: 'Operational cost reduction' },
        { name: 'revenueOptimization', type: 'number', required: false, description: 'Revenue optimization rate' }
      ],
      extractors: {
        propertiesManaged: (context) => context.results?.portfolio?.propertyCount || 0,
        maintenanceEfficiency: (context) => context.results?.maintenance?.efficiencyScore,
        occupancyRate: (context) => context.results?.occupancy?.avgRate,
        tenantSatisfaction: (context) => context.results?.satisfaction?.tenantScore,
        operationalCost: (context) => context.results?.financial?.costReduction,
        revenueOptimization: (context) => context.results?.revenue?.optimizationRate
      }
    }
  },

  // Agriculture - Crop Yield
  'crop-yield-workflow': {
    useCaseId: 'crop-yield-workflow',
    customParticulars: {
      fields: [
        { name: 'fieldsAnalyzed', type: 'number', required: true, description: 'Agricultural fields analyzed' },
        { name: 'yieldPrediction', type: 'number', required: false, description: 'Average yield prediction accuracy' },
        { name: 'cropHealth', type: 'number', required: false, description: 'Crop health score' },
        { name: 'weatherImpact', type: 'object', required: false, description: 'Weather impact analysis' },
        { name: 'resourceOptimization', type: 'number', required: false, description: 'Resource usage optimization' },
        { name: 'profitIncrease', type: 'number', required: false, description: 'Profit increase percentage' }
      ],
      extractors: {
        fieldsAnalyzed: (context) => context.results?.analysis?.fieldCount || 0,
        yieldPrediction: (context) => context.results?.predictions?.accuracy,
        cropHealth: (context) => context.results?.health?.avgScore,
        weatherImpact: (context) => context.results?.weather?.impactAnalysis,
        resourceOptimization: (context) => context.results?.resources?.optimizationRate,
        profitIncrease: (context) => context.results?.financial?.profitGrowth
      }
    }
  },

  // Agriculture - Irrigation Optimization
  'irrigation-optimization-workflow': {
    useCaseId: 'irrigation-optimization-workflow',
    customParticulars: {
      fields: [
        { name: 'irrigationZones', type: 'number', required: true, description: 'Irrigation zones optimized' },
        { name: 'waterSavings', type: 'number', required: false, description: 'Water savings percentage' },
        { name: 'yieldImprovement', type: 'number', required: false, description: 'Crop yield improvement' },
        { name: 'soilMoisture', type: 'object', required: false, description: 'Soil moisture analysis' },
        { name: 'energyEfficiency', type: 'number', required: false, description: 'Energy efficiency gain' },
        { name: 'costReduction', type: 'number', required: false, description: 'Operational cost reduction' }
      ],
      extractors: {
        irrigationZones: (context) => context.results?.optimization?.zoneCount || 0,
        waterSavings: (context) => context.results?.conservation?.waterSaved,
        yieldImprovement: (context) => context.results?.yield?.improvement,
        soilMoisture: (context) => context.results?.soil?.moistureData,
        energyEfficiency: (context) => context.results?.energy?.efficiencyGain,
        costReduction: (context) => context.results?.financial?.costSavings
      }
    }
  },

  // Agriculture - Pest Disease Detection
  'pest-disease-workflow': {
    useCaseId: 'pest-disease-workflow',
    customParticulars: {
      fields: [
        { name: 'areasScanned', type: 'number', required: true, description: 'Areas scanned (hectares)' },
        { name: 'pestsDetected', type: 'number', required: false, description: 'Pest infestations detected' },
        { name: 'diseasesIdentified', type: 'number', required: false, description: 'Diseases identified' },
        { name: 'treatmentRecommendations', type: 'array', required: false, description: 'Treatment recommendations' },
        { name: 'yieldProtection', type: 'number', required: false, description: 'Yield loss prevented' },
        { name: 'pesticideReduction', type: 'number', required: false, description: 'Pesticide use reduction' }
      ],
      extractors: {
        areasScanned: (context) => context.results?.scanning?.areaSize || 0,
        pestsDetected: (context) => context.results?.detection?.pestCount,
        diseasesIdentified: (context) => context.results?.detection?.diseaseCount,
        treatmentRecommendations: (context) => context.results?.recommendations?.treatments,
        yieldProtection: (context) => context.results?.protection?.yieldSaved,
        pesticideReduction: (context) => context.results?.efficiency?.pesticideReduction
      }
    }
  },

  // Logistics - Route Optimization
  'route-optimization-workflow': {
    useCaseId: 'route-optimization-workflow',
    customParticulars: {
      fields: [
        { name: 'routesOptimized', type: 'number', required: true, description: 'Routes optimized' },
        { name: 'distanceReduction', type: 'number', required: false, description: 'Total distance reduction' },
        { name: 'deliveryTimeImprovement', type: 'number', required: false, description: 'Delivery time improvement' },
        { name: 'fuelSavings', type: 'number', required: false, description: 'Fuel cost savings' },
        { name: 'vehicleUtilization', type: 'number', required: false, description: 'Vehicle utilization rate' },
        { name: 'customerSatisfaction', type: 'number', required: false, description: 'Customer satisfaction score' }
      ],
      extractors: {
        routesOptimized: (context) => context.results?.optimization?.routeCount || 0,
        distanceReduction: (context) => context.results?.efficiency?.distanceSaved,
        deliveryTimeImprovement: (context) => context.results?.performance?.timeImprovement,
        fuelSavings: (context) => context.results?.financial?.fuelSavings,
        vehicleUtilization: (context) => context.results?.utilization?.vehicleRate,
        customerSatisfaction: (context) => context.results?.satisfaction?.score
      }
    }
  },

  // Logistics - Warehouse Automation
  'warehouse-automation-workflow': {
    useCaseId: 'warehouse-automation-workflow',
    customParticulars: {
      fields: [
        { name: 'warehousesAutomated', type: 'number', required: true, description: 'Warehouses automated' },
        { name: 'pickingAccuracy', type: 'number', required: false, description: 'Picking accuracy rate' },
        { name: 'throughputIncrease', type: 'number', required: false, description: 'Throughput increase' },
        { name: 'laborEfficiency', type: 'number', required: false, description: 'Labor efficiency gain' },
        { name: 'inventoryAccuracy', type: 'number', required: false, description: 'Inventory accuracy' },
        { name: 'operationalCost', type: 'number', required: false, description: 'Operational cost reduction' }
      ],
      extractors: {
        warehousesAutomated: (context) => context.results?.automation?.warehouseCount || 0,
        pickingAccuracy: (context) => context.results?.accuracy?.pickingRate,
        throughputIncrease: (context) => context.results?.performance?.throughputGain,
        laborEfficiency: (context) => context.results?.efficiency?.laborGain,
        inventoryAccuracy: (context) => context.results?.inventory?.accuracyRate,
        operationalCost: (context) => context.results?.financial?.costReduction
      }
    }
  },

  // Logistics - Last Mile Delivery
  'last-mile-delivery-workflow': {
    useCaseId: 'last-mile-delivery-workflow',
    customParticulars: {
      fields: [
        { name: 'deliveriesOptimized', type: 'number', required: true, description: 'Deliveries optimized' },
        { name: 'onTimeDelivery', type: 'number', required: false, description: 'On-time delivery rate' },
        { name: 'costPerDelivery', type: 'number', required: false, description: 'Cost per delivery reduction' },
        { name: 'customerRating', type: 'number', required: false, description: 'Customer rating average' },
        { name: 'failedDeliveries', type: 'number', required: false, description: 'Failed delivery reduction' },
        { name: 'carbonFootprint', type: 'number', required: false, description: 'Carbon footprint reduction' }
      ],
      extractors: {
        deliveriesOptimized: (context) => context.results?.optimization?.deliveryCount || 0,
        onTimeDelivery: (context) => context.results?.performance?.onTimeRate,
        costPerDelivery: (context) => context.results?.financial?.costPerDelivery,
        customerRating: (context) => context.results?.satisfaction?.avgRating,
        failedDeliveries: (context) => context.results?.quality?.failureReduction,
        carbonFootprint: (context) => context.results?.sustainability?.carbonReduction
      }
    }
  },

  // Hospitality - Guest Experience
  'guest-experience-workflow': {
    useCaseId: 'guest-experience-workflow',
    customParticulars: {
      fields: [
        { name: 'guestsServed', type: 'number', required: true, description: 'Guests served' },
        { name: 'satisfactionScore', type: 'number', required: false, description: 'Guest satisfaction score' },
        { name: 'personalizationRate', type: 'number', required: false, description: 'Service personalization rate' },
        { name: 'upsellRevenue', type: 'number', required: false, description: 'Upsell revenue generated' },
        { name: 'repeatBookings', type: 'number', required: false, description: 'Repeat booking rate' },
        { name: 'reviewScore', type: 'number', required: false, description: 'Average review score' }
      ],
      extractors: {
        guestsServed: (context) => context.results?.service?.guestCount || 0,
        satisfactionScore: (context) => context.results?.satisfaction?.score,
        personalizationRate: (context) => context.results?.personalization?.rate,
        upsellRevenue: (context) => context.results?.revenue?.upsellAmount,
        repeatBookings: (context) => context.results?.loyalty?.repeatRate,
        reviewScore: (context) => context.results?.reviews?.avgScore
      }
    }
  },

  // Hospitality - Revenue Management
  'revenue-management-workflow': {
    useCaseId: 'revenue-management-workflow',
    customParticulars: {
      fields: [
        { name: 'roomsOptimized', type: 'number', required: true, description: 'Rooms price-optimized' },
        { name: 'revenueIncrease', type: 'number', required: false, description: 'Revenue increase percentage' },
        { name: 'occupancyRate', type: 'number', required: false, description: 'Occupancy rate' },
        { name: 'avgDailyRate', type: 'number', required: false, description: 'Average daily rate' },
        { name: 'revPAR', type: 'number', required: false, description: 'Revenue per available room' },
        { name: 'forecastAccuracy', type: 'number', required: false, description: 'Demand forecast accuracy' }
      ],
      extractors: {
        roomsOptimized: (context) => context.results?.optimization?.roomCount || 0,
        revenueIncrease: (context) => context.results?.financial?.revenueGrowth,
        occupancyRate: (context) => context.results?.occupancy?.rate,
        avgDailyRate: (context) => context.results?.pricing?.avgRate,
        revPAR: (context) => context.results?.metrics?.revPAR,
        forecastAccuracy: (context) => context.results?.forecast?.accuracy
      }
    }
  },

  // Hospitality - Operations Optimization
  'operations-optimization-workflow': {
    useCaseId: 'operations-optimization-workflow',
    customParticulars: {
      fields: [
        { name: 'departmentsOptimized', type: 'number', required: true, description: 'Departments optimized' },
        { name: 'staffEfficiency', type: 'number', required: false, description: 'Staff efficiency improvement' },
        { name: 'serviceTime', type: 'number', required: false, description: 'Service time reduction' },
        { name: 'costSavings', type: 'number', required: false, description: 'Operational cost savings' },
        { name: 'qualityScore', type: 'number', required: false, description: 'Service quality score' },
        { name: 'wasteReduction', type: 'number', required: false, description: 'Waste reduction percentage' }
      ],
      extractors: {
        departmentsOptimized: (context) => context.results?.optimization?.deptCount || 0,
        staffEfficiency: (context) => context.results?.efficiency?.staffImprovement,
        serviceTime: (context) => context.results?.performance?.timeReduction,
        costSavings: (context) => context.results?.financial?.costSavings,
        qualityScore: (context) => context.results?.quality?.score,
        wasteReduction: (context) => context.results?.sustainability?.wasteReduction
      }
    }
  }
};