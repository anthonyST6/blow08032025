import { vanguardActionsService } from '../services/vanguard-actions.service';
import { logger } from '../utils/logger';

// List of all 63 use cases from Mission Control V2
const ALL_USE_CASES = [
  // Energy & Utilities (14)
  'grid-resilience',
  'methane-detection',
  'phmsa-compliance',
  'oilfield-land-lease',
  'internal-audit',
  'scada-integration',
  'predictive-resilience',
  'cyber-defense',
  'wildfire-prevention',
  'energy-storage-management',
  'demand-response',
  'renewable-energy-integration',
  'energy-trading-optimization',
  'smart-grid-management',
  
  // Healthcare (7)
  'patient-risk',
  'telemedicine-optimization',
  'medical-imaging-analysis',
  'hospital-operations-optimization',
  'medication-management',
  'population-health-management',
  'patient-intake',
  
  // Finance (6)
  'fraud-detection',
  'credit-risk-assessment',
  'portfolio-optimization',
  'aml-compliance-monitoring',
  'algorithmic-trading',
  'regulatory-reporting-automation',
  
  // Manufacturing (5)
  'predictive-maintenance',
  'quality-control',
  'supply-chain-optimization',
  'inventory-optimization',
  'manufacturing-energy-efficiency',
  
  // Retail (4)
  'customer-experience',
  'dynamic-pricing',
  'demand-forecasting',
  'customer-personalization',
  
  // Transportation (3)
  'fleet-optimization',
  'predictive-maintenance-transport',
  'cargo-tracking',
  
  // Education (3)
  'student-performance',
  'curriculum-optimization',
  'resource-allocation',
  
  // Pharmaceuticals (3)
  'drug-discovery',
  'clinical-trial-optimization',
  'pharma-supply-chain',
  
  // Government (3)
  'citizen-services',
  'public-safety-analytics',
  'regulatory-compliance-monitoring',
  
  // Telecommunications (3)
  'network-optimization',
  'customer-churn-prevention',
  'telecom-fraud-detection',
  
  // Real Estate (3)
  'property-valuation',
  'tenant-screening',
  'property-management-optimization',
  
  // Agriculture (3)
  'crop-yield-prediction',
  'irrigation-optimization',
  'pest-disease-detection',
  
  // Logistics (3)
  'route-optimization',
  'warehouse-automation',
  'last-mile-delivery',
  
  // Hospitality (3)
  'guest-experience-personalization',
  'dynamic-revenue-management',
  'hotel-operations-optimization'
];

interface TestResult {
  useCaseId: string;
  hasVanguardActions: boolean;
  vanguardActionsCount: number;
  error?: string;
}

async function testAuditTrailLogic(): Promise<void> {
  console.log('================================================================================');
  console.log('AUDIT TRAIL LOGIC TEST FOR ALL USE CASES');
  console.log('================================================================================');
  console.log(`Testing ${ALL_USE_CASES.length} use cases to ensure vanguard actions are generated`);
  console.log('================================================================================\n');

  const results: TestResult[] = [];
  let passCount = 0;
  let failCount = 0;

  for (const useCaseId of ALL_USE_CASES) {
    console.log(`\nTesting ${useCaseId}...`);
    
    try {
      // Generate vanguard actions for this use case
      const vanguardActions = vanguardActionsService.generateUseCaseActions(useCaseId);
      
      if (vanguardActions && vanguardActions.length > 0) {
        console.log(`  ✓ PASSED - Generated ${vanguardActions.length} vanguard actions`);
        console.log(`    Actions: ${vanguardActions.map(a => a.actionType).join(', ')}`);
        passCount++;
        results.push({
          useCaseId,
          hasVanguardActions: true,
          vanguardActionsCount: vanguardActions.length
        });
      } else {
        console.log(`  ✗ FAILED - No vanguard actions generated`);
        failCount++;
        results.push({
          useCaseId,
          hasVanguardActions: false,
          vanguardActionsCount: 0,
          error: 'No vanguard actions generated'
        });
      }
    } catch (error) {
      console.log(`  ✗ FAILED - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      failCount++;
      results.push({
        useCaseId,
        hasVanguardActions: false,
        vanguardActionsCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Print summary
  console.log('\n================================================================================');
  console.log('TEST SUMMARY');
  console.log('================================================================================');
  console.log(`Total Use Cases: ${ALL_USE_CASES.length}`);
  console.log(`Passed: ${passCount} (${((passCount / ALL_USE_CASES.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failCount} (${((failCount / ALL_USE_CASES.length) * 100).toFixed(1)}%)`);

  if (failCount > 0) {
    console.log('\nFAILED USE CASES:');
    console.log('------------------------------------------------------------');
    results
      .filter(r => !r.hasVanguardActions)
      .forEach(r => {
        console.log(`- ${r.useCaseId}: ${r.error || 'No vanguard actions generated'}`);
      });
  }

  // Group results by vertical
  const verticals = {
    'energy-utilities': ['grid-resilience', 'methane-detection', 'phmsa-compliance', 'oilfield-land-lease',
                        'internal-audit', 'scada-integration', 'predictive-resilience', 'cyber-defense',
                        'wildfire-prevention', 'energy-storage-management', 'demand-response',
                        'renewable-energy-integration', 'energy-trading-optimization', 'smart-grid-management'],
    'healthcare': ['patient-risk', 'telemedicine-optimization', 'medical-imaging-analysis',
                   'hospital-operations-optimization', 'medication-management', 'population-health-management',
                   'patient-intake'],
    'finance': ['fraud-detection', 'credit-risk-assessment', 'portfolio-optimization',
                'aml-compliance-monitoring', 'algorithmic-trading', 'regulatory-reporting-automation'],
    'manufacturing': ['predictive-maintenance', 'quality-control', 'supply-chain-optimization',
                      'inventory-optimization', 'manufacturing-energy-efficiency'],
    'retail': ['customer-experience', 'dynamic-pricing', 'demand-forecasting', 'customer-personalization'],
    'transportation': ['fleet-optimization', 'predictive-maintenance-transport', 'cargo-tracking'],
    'education': ['student-performance', 'curriculum-optimization', 'resource-allocation'],
    'pharmaceuticals': ['drug-discovery', 'clinical-trial-optimization', 'pharma-supply-chain'],
    'government': ['citizen-services', 'public-safety-analytics', 'regulatory-compliance-monitoring'],
    'telecommunications': ['network-optimization', 'customer-churn-prevention', 'telecom-fraud-detection'],
    'real-estate': ['property-valuation', 'tenant-screening', 'property-management-optimization'],
    'agriculture': ['crop-yield-prediction', 'irrigation-optimization', 'pest-disease-detection'],
    'logistics': ['route-optimization', 'warehouse-automation', 'last-mile-delivery'],
    'hospitality': ['guest-experience-personalization', 'dynamic-revenue-management', 'hotel-operations-optimization']
  };

  console.log('\nBY VERTICAL:');
  console.log('------------------------------------------------------------');
  for (const [vertical, useCases] of Object.entries(verticals)) {
    const verticalResults = results.filter(r => useCases.includes(r.useCaseId));
    const verticalPass = verticalResults.filter(r => r.hasVanguardActions).length;
    const verticalTotal = verticalResults.length;
    const passRate = ((verticalPass / verticalTotal) * 100).toFixed(1);
    
    console.log(`${vertical.padEnd(25)} Total: ${verticalTotal.toString().padStart(2)} | ` +
                `Passed: ${verticalPass.toString().padStart(2)} | ` +
                `Failed: ${(verticalTotal - verticalPass).toString().padStart(2)} | ` +
                `Pass Rate: ${passRate.padStart(5)}%`);
  }

  console.log('\n================================================================================');
  console.log('TEST COMPLETE');
  console.log('================================================================================');
  
  if (failCount === 0) {
    console.log('\n✅ ALL TESTS PASSED! Every use case has vanguard actions configured.');
    console.log('This means audit trails will be generated when these use cases are executed.');
  } else {
    console.log(`\n❌ TESTS FAILED: ${failCount} use cases do not have vanguard actions configured.`);
    console.log('These use cases will not generate audit trails when executed.');
    process.exit(1);
  }
}

// Run the test
testAuditTrailLogic().catch(error => {
  logger.error('Test failed:', error);
  process.exit(1);
});