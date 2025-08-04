import { enhancedOrchestrationService } from './orchestration/orchestration-enhanced.service';
import { workflowRegistry } from './orchestration/workflow-registry';
import { logger } from './utils/logger';

/**
 * Test workflow execution with a sample use case
 */
async function testWorkflowExecution() {
  try {
    logger.info('Starting workflow execution test...');

    // First, let's see what workflows are available
    const availableWorkflows = workflowRegistry.getAllWorkflows();
    logger.info(`Found ${availableWorkflows.length} workflows in registry`);
    
    // Wait a bit for workflows to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 1: Grid Resilience Workflow (using existing workflow)
    logger.info('Test 1: Testing grid-resilience workflow');
    
    const gridAnomalyContext = {
      sensorId: 'GRID-001',
      location: 'Substation Alpha',
      metrics: {
        voltage: 225, // Slightly low (normal: 230V)
        current: 450, // High current
        frequency: 49.8, // Slightly low
        powerFactor: 0.85,
        temperature: 75 // High temperature
      },
      thresholds: {
        voltageMin: 220,
        voltageMax: 240,
        currentMax: 400,
        frequencyMin: 49.5,
        frequencyMax: 50.5,
        temperatureMax: 70
      }
    };

    const gridResult = await enhancedOrchestrationService.executeUseCaseWorkflow('grid-resilience', gridAnomalyContext);
    logger.info('Grid resilience workflow result:', gridResult);

    // Test 2: Renewable Energy Integration Workflow (using existing workflow)
    logger.info('\nTest 2: Testing renewable-energy-integration workflow');
    
    const renewableContext = {
      siteId: 'SOLAR-FARM-001',
      location: {
        latitude: 34.0522,
        longitude: -118.2437,
        timezone: 'America/Los_Angeles'
      },
      sources: {
        solar: {
          capacity: 100, // MW
          currentOutput: 75,
          efficiency: 85
        },
        wind: {
          capacity: 50, // MW
          currentOutput: 30,
          windSpeed: 12
        },
        battery: {
          capacity: 200, // MWh
          currentCharge: 120,
          chargeRate: 50,
          dischargeRate: 50
        }
      },
      demand: {
        current: 80, // MW
        predicted: [85, 90, 95, 100, 95, 90, 85, 80]
      },
      gridConnection: {
        maxExport: 100,
        maxImport: 100,
        pricePerMWh: 65
      }
    };

    const renewableResult = await enhancedOrchestrationService.executeUseCaseWorkflow('renewable-energy-integration', renewableContext);
    logger.info('Renewable energy integration workflow result:', renewableResult);

    // Test 3: Methane Detection Workflow (using existing workflow)
    logger.info('\nTest 3: Testing methane-detection workflow');
    
    const methaneContext = {
      siteId: 'SITE-001',
      location: {
        latitude: 31.9686,
        longitude: -102.0779,
        facility: 'Production Well Pad'
      },
      sensors: {
        methaneLevel: 150, // ppm
        windSpeed: 5, // m/s
        windDirection: 180, // degrees
        temperature: 25, // Celsius
        humidity: 60 // percentage
      },
      threshold: 100 // ppm threshold
    };

    const methaneResult = await enhancedOrchestrationService.executeUseCaseWorkflow('methane-detection', methaneContext);
    logger.info('Methane detection workflow result:', methaneResult);

    // Test 4: List all available workflows
    logger.info('\nTest 4: Listing all available workflows');
    const allWorkflows = workflowRegistry.getAllWorkflows();
    logger.info(`Total workflows available: ${allWorkflows.length}`);
    
    // Group by industry
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
    });

    logger.info('\nWorkflow execution tests completed successfully!');

  } catch (error) {
    logger.error('Workflow execution test failed:', error);
    process.exit(1);
  }
}

// Run the test
testWorkflowExecution().then(() => {
  logger.info('All tests completed');
  process.exit(0);
}).catch(error => {
  logger.error('Test execution failed:', error);
  process.exit(1);
});