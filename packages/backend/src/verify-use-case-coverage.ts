import { workflowRegistry } from './orchestration/workflow-registry';
import { logger } from './utils/logger';

// All use cases from MissionControlV2 component
const missionControlUseCases = {
  'energy': [
    'oilfield-lease',
    'grid-anomaly',
    'renewable-optimization',
    'drilling-risk',
    'environmental-compliance',
    'load-forecasting',
    'phmsa-compliance',
    'methane-detection',
    'grid-resilience',
    'internal-audit',
    'scada-integration',
    'predictive-resilience',
    'cyber-defense',
    'wildfire-prevention'
  ],
  'healthcare': [
    'patient-risk',
    'clinical-trial-matching',
    'treatment-recommendation',
    'diagnosis-assistant',
    'medical-supply-chain'
  ],
  'financial': [
    'fraud-detection',
    'ai-credit-scoring',
    'portfolio-optimization',
    'aml-monitoring',
    'insurance-risk'
  ],
  'manufacturing': [
    'predictive-maintenance',
    'quality-inspection',
    'supply-chain'
  ],
  'retail': [
    'demand-forecasting',
    'customer-personalization',
    'price-optimization'
  ],
  'logistics': [
    'route-optimization',
    'fleet-maintenance',
    'warehouse-automation'
  ],
  'education': [
    'adaptive-learning',
    'student-performance',
    'content-recommendation'
  ],
  'pharmaceutical': [
    'drug-discovery',
    'clinical-trial-optimization',
    'adverse-event'
  ],
  'government': [
    'emergency-response',
    'infrastructure-coordination',
    'citizen-services',
    'public-safety',
    'resource-optimization'
  ],
  'telecommunications': [
    'network-performance',
    'churn-prevention',
    'network-security'
  ],
  'real-estate': [
    'ai-pricing-governance'
  ],
  'all-verticals': [
    'cross-industry-analytics',
    'universal-compliance',
    'multi-vertical-optimization',
    'industry-benchmarking'
  ]
};

async function verifyUseCaseCoverage() {
  logger.info('Starting use case coverage verification...');
  
  // Wait a bit for workflow registry to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const registeredWorkflows = workflowRegistry.getAllWorkflows();
  const registeredUseCaseIds = new Set(registeredWorkflows.map(w => w.useCaseId));
  
  logger.info(`Total registered workflows: ${registeredWorkflows.length}`);
  
  let totalUseCases = 0;
  let missingUseCases: string[] = [];
  let coveredUseCases: string[] = [];
  
  // Check each industry
  for (const [industry, useCases] of Object.entries(missionControlUseCases)) {
    logger.info(`\nChecking ${industry} use cases...`);
    
    for (const useCaseId of useCases) {
      totalUseCases++;
      
      if (registeredUseCaseIds.has(useCaseId)) {
        coveredUseCases.push(useCaseId);
        logger.info(`  ✓ ${useCaseId} - FOUND`);
      } else {
        missingUseCases.push(`${industry}/${useCaseId}`);
        logger.warn(`  ✗ ${useCaseId} - MISSING`);
      }
    }
  }
  
  // Summary
  logger.info('\n=== COVERAGE SUMMARY ===');
  logger.info(`Total use cases in MissionControlV2: ${totalUseCases}`);
  logger.info(`Covered use cases: ${coveredUseCases.length} (${((coveredUseCases.length / totalUseCases) * 100).toFixed(1)}%)`);
  logger.info(`Missing use cases: ${missingUseCases.length}`);
  
  if (missingUseCases.length > 0) {
    logger.warn('\nMissing use cases:');
    missingUseCases.forEach(useCase => {
      logger.warn(`  - ${useCase}`);
    });
  }
  
  // Check for extra workflows not in MissionControlV2
  const allMissionControlUseCases = new Set(
    Object.values(missionControlUseCases).flat()
  );
  
  const extraWorkflows = registeredWorkflows.filter(
    w => !allMissionControlUseCases.has(w.useCaseId)
  );
  
  if (extraWorkflows.length > 0) {
    logger.info('\nExtra workflows not in MissionControlV2:');
    extraWorkflows.forEach(w => {
      logger.info(`  + ${w.useCaseId} (${w.industry})`);
    });
  }
  
  // Industry breakdown
  logger.info('\n=== INDUSTRY BREAKDOWN ===');
  const stats = workflowRegistry.getStatistics();
  Object.entries(stats.workflowsByIndustry).forEach(([industry, count]) => {
    logger.info(`${industry}: ${count} workflows`);
  });
  
  return {
    totalUseCases,
    coveredUseCases: coveredUseCases.length,
    missingUseCases,
    coveragePercentage: ((coveredUseCases.length / totalUseCases) * 100).toFixed(1)
  };
}

// Run verification
if (require.main === module) {
  verifyUseCaseCoverage()
    .then(result => {
      logger.info('\nVerification complete!');
      process.exit(result.missingUseCases.length > 0 ? 1 : 0);
    })
    .catch(error => {
      logger.error('Verification failed:', error);
      process.exit(1);
    });
}

export { verifyUseCaseCoverage };