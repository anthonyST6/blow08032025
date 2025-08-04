import { logger } from '../../utils/logger';
import { workflowTestRunner } from './workflow-test.runner';
import { workflowRegistry } from '../workflow-registry';

/**
 * Simple script to test workflows
 * Can be run with: npm run test:workflows
 */
async function testWorkflows() {
  logger.info('Starting workflow tests...');

  try {
    // Wait for workflows to be initialized
    await new Promise(resolve => setTimeout(resolve, 1000));

    const totalWorkflows = workflowRegistry.getAllWorkflows().length;
    logger.info(`Found ${totalWorkflows} workflows to test`);

    // Run smoke tests first
    logger.info('Running smoke tests for critical workflows...');
    const smokeResults = await workflowTestRunner.runSmokeTests();
    
    logger.info('Smoke test results:', {
      total: smokeResults.totalTests,
      passed: smokeResults.passed,
      failed: smokeResults.failed,
      errors: smokeResults.errors
    });

    // If smoke tests pass, run more comprehensive tests
    if (smokeResults.failed === 0 && smokeResults.errors === 0) {
      logger.info('Smoke tests passed! Running regression tests...');
      
      const regressionResults = await workflowTestRunner.runRegressionTests();
      
      logger.info('Regression test results:', {
        total: regressionResults.totalTests,
        passed: regressionResults.passed,
        failed: regressionResults.failed,
        errors: regressionResults.errors
      });

      // Generate report
      const report = workflowTestRunner.generateTestReport(regressionResults);
      logger.info('Test report generated');
      console.log('\n' + report);
    } else {
      logger.error('Smoke tests failed! Skipping regression tests.');
      
      // Generate report for smoke tests
      const report = workflowTestRunner.generateTestReport(smokeResults);
      console.log('\n' + report);
    }

  } catch (error) {
    logger.error('Workflow testing failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testWorkflows()
    .then(() => {
      logger.info('Workflow testing completed');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Fatal error during testing:', error);
      process.exit(1);
    });
}

export { testWorkflows };