import { unifiedReportsService } from '../services/unified-reports.service';
import { logger } from '../utils/logger';

async function testUnifiedReports() {
  try {
    logger.info('Testing Unified Reports Service...');
    
    // Test 1: Get all use case reports
    logger.info('\n=== Test 1: Getting all use case reports ===');
    const allUseCases = await unifiedReportsService.getAllUseCaseReports();
    logger.info(`Found ${allUseCases.length} use cases with reports`);
    allUseCases.forEach(useCase => {
      logger.info(`- ${useCase.useCaseId}: ${useCase.useCaseName} (${useCase.reports.length} reports)`);
    });
    
    // Test 2: Generate a report for each use case
    logger.info('\n=== Test 2: Generating sample reports ===');
    const testReports = [
      { useCaseId: 'oilfield-land-lease', reportType: 'lease-expiration-dashboard' },
      { useCaseId: 'energy-load-forecasting', reportType: 'daily-load-forecast' },
      { useCaseId: 'grid-anomaly-detection', reportType: 'realtime-anomaly' },
      { useCaseId: 'patient-intake', reportType: 'patient-intake-dashboard' },
      { useCaseId: 'clinical-trial-matching', reportType: 'clinical-trial-matching' },
      { useCaseId: 'fraud-detection', reportType: 'fraud-detection-dashboard' },
      { useCaseId: 'loan-processing', reportType: 'loan-processing-dashboard' }
    ];
    
    for (const test of testReports) {
      logger.info(`\nGenerating ${test.reportType} for ${test.useCaseId}...`);
      try {
        const result = await unifiedReportsService.generateReport({
          useCaseId: test.useCaseId,
          reportType: test.reportType
        });
        
        if (result.success) {
          logger.info(`✓ Success: ${result.reportUrl}`);
          logger.info(`  Report ID: ${result.reportId}`);
          logger.info(`  Format: ${result.metadata?.format || 'unknown'}`);
        } else {
          logger.error(`✗ Failed: ${result.error}`);
        }
      } catch (error) {
        logger.error(`✗ Error generating report: ${error}`);
      }
    }
    
    // Test 3: Get report history
    logger.info('\n=== Test 3: Getting report history ===');
    const history = await unifiedReportsService.getReportHistory(undefined, 10);
    logger.info(`Found ${history.length} recent reports`);
    history.slice(0, 5).forEach(report => {
      logger.info(`- ${report.reportType} (${report.useCaseId}) - ${new Date(report.generatedAt).toLocaleString()}`);
    });
    
    logger.info('\n=== All tests completed ===');
    
  } catch (error) {
    logger.error('Test failed:', error);
  }
}

// Run the test
testUnifiedReports().then(() => {
  logger.info('Test script completed');
  process.exit(0);
}).catch(error => {
  logger.error('Test script failed:', error);
  process.exit(1);
});