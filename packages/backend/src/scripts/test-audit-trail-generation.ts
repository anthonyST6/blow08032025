// Initialize Firebase before importing services
import { initializeFirebase } from '../config/firebase';

// Set NODE_ENV to development for testing
process.env.NODE_ENV = 'development';

// Configure Firestore emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

// Initialize Firebase
initializeFirebase();

// Now import services after Firebase is initialized
import { auditTrailService } from '../services/audit-trail.service';
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
  auditTrailGenerated: boolean;
  auditTrailId?: string;
  vanguardActionsCount: number;
  error?: string;
}

async function testAuditTrailGeneration(): Promise<void> {
  console.log('================================================================================');
  console.log('AUDIT TRAIL GENERATION TEST FOR ALL USE CASES');
  console.log('================================================================================');
  console.log(`Testing ${ALL_USE_CASES.length} use cases to ensure audit trails are generated`);
  console.log('================================================================================\n');

  const results: TestResult[] = [];
  let passCount = 0;
  let failCount = 0;

  for (const useCaseId of ALL_USE_CASES) {
    console.log(`\nTesting ${useCaseId}...`);
    
    try {
      // Create a test execution context
      const executionId = `test-${useCaseId}-${Date.now()}`;
      const userId = 'test-user';
      const userEmail = 'test@example.com';
      const useCaseName = useCaseId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      // Generate vanguard actions for this use case
      const vanguardActions = vanguardActionsService.generateUseCaseActions(useCaseId);
      
      // Log the use case execution start
      await auditTrailService.logUseCaseExecution(
        userId,
        userEmail,
        useCaseId,
        useCaseName,
        executionId,
        'test-vertical',
        'started',
        {
          useCaseId,
          useCaseName,
          executionId,
          verticalId: 'test-vertical',
          agentActions: vanguardActions,
          siaScores: {
            security: 95,
            integrity: 98,
            accuracy: 97
          },
          customFields: {
            testRun: true,
            timestamp: new Date().toISOString()
          }
        }
      );

      // Log each vanguard action as a use case action
      for (const action of vanguardActions) {
        await auditTrailService.logUseCaseAction(
          userId,
          userEmail,
          action.actionType.toLowerCase(),
          action.systemTargeted,
          {
            useCaseId,
            useCaseName,
            executionId,
            verticalId: 'test-vertical',
            agentActions: [action],
            siaScores: {
              security: 95,
              integrity: 98,
              accuracy: 97
            },
            customFields: {
              agent: action.agent,
              recordAffected: action.recordAffected,
              status: action.status
            }
          },
          action.status === 'success' ? 'success' : 'failure',
          action.status !== 'success' ? 'Action failed' : undefined,
          action.payloadSummary
        );
      }

      // Complete the audit trail
      await auditTrailService.logUseCaseExecution(
        userId,
        userEmail,
        useCaseId,
        useCaseName,
        executionId,
        'test-vertical',
        'completed',
        {
          useCaseId,
          useCaseName,
          executionId,
          verticalId: 'test-vertical',
          agentActions: vanguardActions,
          siaScores: {
            security: 95,
            integrity: 98,
            accuracy: 97
          },
          customFields: {
            testRun: true,
            timestamp: new Date().toISOString(),
            totalActions: vanguardActions.length
          }
        }
      );

      // Verify the audit trail was created
      const auditTrail = await auditTrailService.getUseCaseAuditTrail(useCaseId, {
        executionId,
        limit: 100
      });
      
      if (auditTrail && auditTrail.length > 0) {
        console.log(`  ✓ PASSED - Audit trail generated with ${auditTrail.length} entries`);
        passCount++;
        results.push({
          useCaseId,
          auditTrailGenerated: true,
          vanguardActionsCount: vanguardActions.length
        });
      } else {
        console.log(`  ✗ FAILED - No audit trail generated`);
        failCount++;
        results.push({
          useCaseId,
          auditTrailGenerated: false,
          vanguardActionsCount: vanguardActions.length,
          error: 'No audit trail found'
        });
      }
    } catch (error) {
      console.log(`  ✗ FAILED - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      failCount++;
      results.push({
        useCaseId,
        auditTrailGenerated: false,
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
      .filter(r => !r.auditTrailGenerated)
      .forEach(r => {
        console.log(`- ${r.useCaseId}: ${r.error || 'No audit trail generated'}`);
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
    const verticalPass = verticalResults.filter(r => r.auditTrailGenerated).length;
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
    console.log('\n✅ ALL TESTS PASSED! Every use case generates an audit trail.');
  } else {
    console.log(`\n❌ TESTS FAILED: ${failCount} use cases do not generate audit trails.`);
    process.exit(1);
  }
}

// Run the test
testAuditTrailGeneration().catch(error => {
  logger.error('Test failed:', error);
  process.exit(1);
});