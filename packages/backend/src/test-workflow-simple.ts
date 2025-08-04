import { workflowRegistry } from './orchestration/workflow-registry';
import { logger } from './utils/logger';

/**
 * Simple test to verify workflow registration and service creation
 */
async function testWorkflowSimple() {
  try {
    logger.info('Starting simple workflow test...');

    // Wait for workflows to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 1: Check workflow registration
    logger.info('\nTest 1: Checking workflow registration');
    const allWorkflows = workflowRegistry.getAllWorkflows();
    logger.info(`Total workflows registered: ${allWorkflows.length}`);

    // Test 2: Group workflows by industry
    logger.info('\nTest 2: Grouping workflows by industry');
    const workflowsByIndustry: Record<string, string[]> = {};
    
    for (const workflow of allWorkflows) {
      const industry = workflow.industry;
      if (!workflowsByIndustry[industry]) {
        workflowsByIndustry[industry] = [];
      }
      workflowsByIndustry[industry].push(workflow.useCaseId);
    }

    Object.entries(workflowsByIndustry).forEach(([industry, workflows]) => {
      logger.info(`${industry}: ${workflows.length} workflows`);
      workflows.slice(0, 3).forEach(w => logger.info(`  - ${w}`));
      if (workflows.length > 3) {
        logger.info(`  ... and ${workflows.length - 3} more`);
      }
    });

    // Test 3: Check Energy workflows specifically
    logger.info('\nTest 3: Energy workflows check');
    const energyUtilitiesWorkflows = workflowRegistry.getWorkflowsByIndustry('energy-utilities');
    const energyWorkflows = workflowRegistry.getWorkflowsByIndustry('energy');
    const allEnergyWorkflows = [...energyUtilitiesWorkflows, ...energyWorkflows];
    
    logger.info(`Energy workflows found: ${allEnergyWorkflows.length}`);
    logger.info(`  - energy-utilities: ${energyUtilitiesWorkflows.length} workflows`);
    logger.info(`  - energy: ${energyWorkflows.length} workflows`);
    
    allEnergyWorkflows.forEach(w => {
      logger.info(`  - ${w.useCaseId}: ${w.name}`);
    });

    // Test 4: Verify our new services are registered
    logger.info('\nTest 4: Checking new services');
    const { serviceRegistry } = await import('./orchestration/service-registry');
    
    const newServices = [
      'grid-anomaly',
      'renewable-optimization',
      'drilling-risk'
    ];

    for (const serviceName of newServices) {
      const service = serviceRegistry.getService(serviceName);
      if (service) {
        logger.info(`✓ Service registered: ${serviceName}`);
      } else {
        logger.warn(`✗ Service not found: ${serviceName}`);
      }
    }

    // Test 5: Check workflow metadata
    logger.info('\nTest 5: Checking workflow metadata');
    const sampleWorkflow = allWorkflows[0];
    if (sampleWorkflow) {
      logger.info(`Sample workflow: ${sampleWorkflow.useCaseId}`);
      logger.info(`  - Name: ${sampleWorkflow.name}`);
      logger.info(`  - Industry: ${sampleWorkflow.industry}`);
      logger.info(`  - Version: ${sampleWorkflow.version}`);
      logger.info(`  - Steps: ${sampleWorkflow.steps.length}`);
      logger.info(`  - Required Services: ${sampleWorkflow.metadata.requiredServices.join(', ')}`);
      logger.info(`  - Required Agents: ${sampleWorkflow.metadata.requiredAgents.join(', ')}`);
    }

    // Summary
    logger.info('\n=== Test Summary ===');
    logger.info(`✓ Workflows registered: ${allWorkflows.length}`);
    logger.info(`✓ Industries covered: ${Object.keys(workflowsByIndustry).length}`);
    logger.info(`✓ Energy workflows: ${allEnergyWorkflows.length} (Expected: 14)`);
    
    if (allEnergyWorkflows.length === 14) {
      logger.info('✓ All 14 Energy workflows are properly registered!');
    } else {
      logger.warn(`⚠ Expected 14 Energy workflows but found ${allEnergyWorkflows.length}`);
    }

    logger.info('\nSimple workflow test completed successfully!');

  } catch (error) {
    logger.error('Simple workflow test failed:', error);
    process.exit(1);
  }
}

// Run the test
testWorkflowSimple().then(() => {
  logger.info('All tests completed');
  process.exit(0);
}).catch(error => {
  logger.error('Test execution failed:', error);
  process.exit(1);
});