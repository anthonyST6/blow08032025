import { logger } from './utils/logger';
import { ServiceRegistry } from './orchestration/service-registry';
import { WorkflowRegistry } from './orchestration/workflow-registry';
import { orchestrationService } from './services/orchestration.service';
import { StepExecution } from './orchestration/types/workflow.types';

async function testServiceIntegration() {
  logger.info('Starting service integration test...');
  
  try {
    // Initialize registries
    const serviceRegistry = ServiceRegistry.getInstance();
    const workflowRegistry = WorkflowRegistry.getInstance();
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logger.info('\n=== Testing Service Registration ===');
    
    // Check if our new services are registered
    const dedicatedServices = [
      'grid-anomaly',
      'methane-detection',
      'renewable-optimization',
      'drilling-risk'
    ];
    
    dedicatedServices.forEach(serviceName => {
      const hasService = serviceRegistry.hasService(serviceName);
      if (hasService) {
        const registration = serviceRegistry.getServiceRegistration(serviceName);
        logger.info(`✓ Service registered: ${serviceName}`, {
          version: registration?.version,
          capabilities: registration?.capabilities
        });
      } else {
        logger.warn(`✗ Service not found: ${serviceName}`);
      }
    });
    
    logger.info('\n=== Testing Workflow-Service Mapping ===');
    
    // Test workflows that should use our new services
    const testWorkflows = [
      { id: 'grid-anomaly-detection', expectedService: 'grid-anomaly' },
      { id: 'methane-detection', expectedService: 'methane-detection' },
      { id: 'renewable-optimization', expectedService: 'renewable-optimization' },
      { id: 'drilling-risk', expectedService: 'drilling-risk' }
    ];
    
    for (const { id, expectedService } of testWorkflows) {
      const workflow = workflowRegistry.getWorkflow(id);
      if (workflow) {
        logger.info(`\nWorkflow: ${workflow.name}`);
        logger.info(`  - Industry: ${workflow.industry}`);
        logger.info(`  - Steps: ${workflow.steps.length}`);
        logger.info(`  - Required Services: ${workflow.metadata.requiredServices.join(', ')}`);
        
        // Check if the expected service is in required services
        if (workflow.metadata.requiredServices.includes(expectedService)) {
          logger.info(`  ✓ Correctly mapped to ${expectedService} service`);
        } else {
          logger.warn(`  ✗ Not mapped to ${expectedService} service`);
        }
      } else {
        logger.warn(`Workflow not found: ${id}`);
      }
    }
    
    logger.info('\n=== Testing Service Capabilities ===');
    
    // Test methane detection service
    if (serviceRegistry.hasService('methane-detection')) {
      logger.info('\nTesting Methane Detection Service:');
      const methaneService = serviceRegistry.getService('methane-detection');
      
      // Check if service has the expected methods
      if (typeof methaneService.analyzeReadings === 'function') {
        // Create sample readings
        const sampleReadings = [
          {
            sensorId: 'sensor-001',
            location: {
              latitude: 31.7619,
              longitude: -102.4621,
              facility: 'Permian Basin Site A',
              equipment: 'Compressor Station 1'
            },
            concentration: 125, // High concentration
            timestamp: new Date(),
            windSpeed: 15,
            windDirection: 45,
            temperature: 25,
            pressure: 1013
          },
          {
            sensorId: 'sensor-002',
            location: {
              latitude: 31.7625,
              longitude: -102.4615,
              facility: 'Permian Basin Site A',
              equipment: 'Pipeline Segment 12'
            },
            concentration: 85, // Medium concentration
            timestamp: new Date(),
            windSpeed: 15,
            windDirection: 45,
            temperature: 25,
            pressure: 1013
          }
        ];
        
        try {
          const analysis = await methaneService.analyzeReadings(sampleReadings);
          logger.info('Methane analysis completed:', {
            anomaliesDetected: analysis.anomalies.length,
            riskScore: analysis.riskScore,
            estimatedEmissions: analysis.estimatedEmissions,
            complianceStatus: analysis.complianceStatus.withinLimits ? 'Compliant' : 'Non-compliant',
            recommendations: analysis.recommendations.length
          });
          
          if (analysis.anomalies.length > 0) {
            logger.info('Anomaly details:', {
              severity: analysis.anomalies[0].severity,
              leakRate: analysis.anomalies[0].estimatedLeakRate,
              location: analysis.anomalies[0].plume.center
            });
          }
        } catch (error) {
          logger.error('Error testing methane service:', error);
        }
      } else {
        logger.warn('Methane service does not have analyzeReadings method');
      }
    }
    
    // Test grid anomaly service
    if (serviceRegistry.hasService('grid-anomaly')) {
      logger.info('\nTesting Grid Anomaly Service:');
      const gridService = serviceRegistry.getService('grid-anomaly');
      
      // Check if service has the expected methods
      if (typeof gridService.analyzeGridTelemetry === 'function') {
        // Create sample telemetry
        const sampleTelemetry = {
          sensorId: 'SUB-001',
          location: 'Substation 001',
          timestamp: new Date(),
          metrics: {
            voltage: 118.5, // Slightly low
            current: 450,
            frequency: 59.8, // Slightly low
            powerFactor: 0.92,
            temperature: 75
          },
          thresholds: {
            voltageMin: 120,
            voltageMax: 124,
            currentMax: 500,
            frequencyMin: 59.9,
            frequencyMax: 60.1,
            temperatureMax: 80
          }
        };
        
        try {
          const analysis = await gridService.analyzeGridTelemetry(sampleTelemetry);
          logger.info('Grid analysis completed:', {
            anomalyDetected: analysis.anomalyDetected,
            severity: analysis.severity,
            anomaliesCount: analysis.anomalies.length,
            riskScore: analysis.riskScore,
            recommendationsCount: analysis.recommendations.length
          });
        } catch (error) {
          logger.error('Error testing grid service:', error);
        }
      } else {
        logger.warn('Grid service does not have analyzeGridTelemetry method');
      }
    }
    
    logger.info('\n=== Testing Workflow Execution ===');
    
    // Test executing a workflow with the new service
    const testWorkflowId = 'methane-detection';
    const workflow = workflowRegistry.getWorkflow(testWorkflowId);
    
    if (workflow) {
      logger.info(`\nExecuting workflow: ${workflow.name}`);
      
      try {
        const execution = await orchestrationService.executeWorkflow(
          testWorkflowId,
          {
            readings: [
              {
                sensorId: 'test-001',
                location: {
                  latitude: 31.7619,
                  longitude: -102.4621,
                  facility: 'Test Facility',
                  equipment: 'Test Equipment'
                },
                concentration: 150,
                timestamp: new Date()
              }
            ]
          }
        );
        
        logger.info('Workflow execution started:', {
          executionId: execution.id,
          status: execution.status,
          currentStep: execution.currentStep
        });
        
        // Wait a bit for execution to progress
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check execution status
        const executions = await orchestrationService.getWorkflowExecutions(testWorkflowId);
        if (executions.length > 0) {
          const latestExecution = executions[0];
          logger.info('Execution status:', {
            status: latestExecution.status,
            completedSteps: latestExecution.steps.filter((s: StepExecution) => s.status === 'completed').length,
            totalSteps: latestExecution.steps.length
          });
        }
        
      } catch (error) {
        logger.error('Error executing workflow:', error);
      }
    }
    
    logger.info('\n=== Service Integration Test Complete ===');
    
  } catch (error) {
    logger.error('Test failed:', error);
  }
  
  // Give time for async operations to complete
  setTimeout(() => {
    process.exit(0);
  }, 5000);
}

// Run the test
testServiceIntegration();