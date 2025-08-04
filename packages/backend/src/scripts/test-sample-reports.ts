import { unifiedReportsService } from '../services/unified-reports.service';
import { logger } from '../utils/logger';

// Sample test cases covering different verticals
const sampleTestCases = [
  { useCaseId: 'oilfield-land-lease', reportType: 'lease-expiration-dashboard' },
  { useCaseId: 'energy-load-forecasting', reportType: 'daily-load-forecast' },
  { useCaseId: 'patient-intake', reportType: 'patient-intake-dashboard' },
  { useCaseId: 'fraud-detection', reportType: 'fraud-detection-dashboard' },
  { useCaseId: 'predictive-maintenance', reportType: 'predictive-maintenance-dashboard' },
  { useCaseId: 'demand-forecasting', reportType: 'demand-forecast-dashboard' },
  { useCaseId: 'route-optimization', reportType: 'route-optimization-dashboard' },
  { useCaseId: 'student-performance', reportType: 'student-performance-dashboard' },
  { useCaseId: 'drug-discovery', reportType: 'drug-discovery-dashboard' },
  { useCaseId: 'citizen-services', reportType: 'citizen-services-dashboard' },
  { useCaseId: 'network-optimization', reportType: 'network-performance' },
  { useCaseId: 'property-management', reportType: 'property-portfolio' }
];

async function testSampleReports() {
  logger.info('Testing sample reports from each vertical...\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const testCase of sampleTestCases) {
    try {
      logger.info(`Testing ${testCase.useCaseId}/${testCase.reportType}...`);
      
      // Get report configuration
      const config = await unifiedReportsService.getReportConfiguration(
        testCase.useCaseId,
        testCase.reportType
      );
      
      if (!config) {
        logger.warn(`No configuration found for ${testCase.useCaseId}/${testCase.reportType}`);
        continue;
      }
      
      // Build test parameters
      const parameters: Record<string, any> = {};
      
      if (config.parameters) {
        for (const param of config.parameters) {
          if (param.defaultValue !== undefined) {
            parameters[param.name] = param.defaultValue;
          } else if (param.required) {
            // Generate minimal test values for required parameters
            switch (param.type) {
              case 'dateRange':
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                parameters[param.name] = [startDate.toISOString(), endDate.toISOString()];
                break;
              case 'date':
                parameters[param.name] = new Date().toISOString();
                break;
              case 'select':
                if (param.options && param.options.length > 0) {
                  parameters[param.name] = param.options[0].value;
                }
                break;
              case 'multiSelect':
                if (param.options && param.options.length > 0) {
                  parameters[param.name] = [param.options[0].value];
                }
                break;
              default:
                // Skip other types for now
                break;
            }
          }
        }
      }
      
      // Test report generation
      const result = await unifiedReportsService.generateReport({
        useCaseId: testCase.useCaseId,
        reportType: testCase.reportType,
        parameters
      });
      
      if (result.success) {
        logger.info(`✓ Success: ${testCase.useCaseId}/${testCase.reportType}`);
        successCount++;
      } else {
        logger.error(`✗ Failed: ${testCase.useCaseId}/${testCase.reportType} - ${result.error}`);
        failureCount++;
      }
      
    } catch (error) {
      logger.error(`✗ Error testing ${testCase.useCaseId}/${testCase.reportType}:`, error);
      failureCount++;
    }
  }
  
  // Summary
  logger.info('\n' + '='.repeat(60));
  logger.info('TEST SUMMARY');
  logger.info('='.repeat(60));
  logger.info(`Total Tests: ${sampleTestCases.length}`);
  logger.info(`Successful: ${successCount}`);
  logger.info(`Failed: ${failureCount}`);
  logger.info(`Success Rate: ${((successCount / sampleTestCases.length) * 100).toFixed(1)}%`);
  
  // List available use cases
  try {
    const allUseCases = await unifiedReportsService.getAllUseCaseReports();
    logger.info(`\nTotal Use Cases Available: ${allUseCases.length}`);
    logger.info(`Total Reports Available: ${allUseCases.reduce((sum, uc) => sum + uc.reportCount, 0)}`);
  } catch (error) {
    logger.error('Failed to get use case count:', error);
  }
}

// Run the test
testSampleReports().catch(error => {
  logger.error('Test failed:', error);
  process.exit(1);
});