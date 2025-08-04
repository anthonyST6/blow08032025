import axios from 'axios';
import { logger } from '../utils/logger';

const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'dev-token'; // Development token

// Configure axios with auth header
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

interface TestResult {
  useCaseId: string;
  reportType: string;
  success: boolean;
  error?: string;
  duration: number;
}

const testResults: TestResult[] = [];

/**
 * Test report generation for a specific use case and report type
 */
async function testReportGeneration(useCaseId: string, reportType: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    // First, get the report configuration
    const configResponse = await api.get(`/reports/use-cases/${useCaseId}/reports/${reportType}/config`);
    const config = configResponse.data.data;
    
    // Build test parameters based on configuration
    const testParameters: Record<string, any> = {};
    
    if (config && config.parameters) {
      for (const param of config.parameters) {
        // Use default values or generate test values
        if (param.defaultValue !== undefined) {
          testParameters[param.name] = param.defaultValue;
        } else {
          // Generate appropriate test values based on type
          switch (param.type) {
            case 'string':
              testParameters[param.name] = 'test-value';
              break;
            case 'number':
              testParameters[param.name] = param.validation?.min || 1;
              break;
            case 'boolean':
              testParameters[param.name] = true;
              break;
            case 'date':
              testParameters[param.name] = new Date().toISOString();
              break;
            case 'dateRange':
              const endDate = new Date();
              const startDate = new Date();
              startDate.setDate(startDate.getDate() - 30);
              testParameters[param.name] = [startDate.toISOString(), endDate.toISOString()];
              break;
            case 'select':
              if (param.options && param.options.length > 0) {
                testParameters[param.name] = param.options[0].value;
              }
              break;
            case 'multiSelect':
              if (param.options && param.options.length > 0) {
                testParameters[param.name] = [param.options[0].value];
              }
              break;
          }
        }
      }
    }
    
    // Test report generation
    const response = await api.post('/reports/generate', {
      useCaseId,
      reportType,
      parameters: testParameters
    });
    
    const duration = Date.now() - startTime;
    
    if (response.data.success) {
      logger.info(`✓ ${useCaseId}/${reportType} - Generated in ${duration}ms`);
      return {
        useCaseId,
        reportType,
        success: true,
        duration
      };
    } else {
      logger.error(`✗ ${useCaseId}/${reportType} - Failed: ${response.data.error}`);
      return {
        useCaseId,
        reportType,
        success: false,
        error: response.data.error,
        duration
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`✗ ${useCaseId}/${reportType} - Error: ${errorMessage}`);
    return {
      useCaseId,
      reportType,
      success: false,
      error: errorMessage,
      duration
    };
  }
}

/**
 * Test all reports for all use cases
 */
async function testAllReports() {
  logger.info('Starting comprehensive report generation test...\n');
  
  try {
    // Get all use cases and their reports
    const response = await api.get('/reports/use-cases');
    const useCases = response.data.data;
    
    let totalReports = 0;
    let successfulReports = 0;
    let failedReports = 0;
    
    // Test each use case
    for (const useCase of useCases) {
      logger.info(`\nTesting ${useCase.useCaseName} (${useCase.useCaseId})...`);
      
      // Test each report type
      for (const report of useCase.reports) {
        totalReports++;
        const result = await testReportGeneration(useCase.useCaseId, report.id);
        testResults.push(result);
        
        if (result.success) {
          successfulReports++;
        } else {
          failedReports++;
        }
        
        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Print summary
    logger.info('\n' + '='.repeat(80));
    logger.info('TEST SUMMARY');
    logger.info('='.repeat(80));
    logger.info(`Total Reports Tested: ${totalReports}`);
    logger.info(`Successful: ${successfulReports} (${((successfulReports/totalReports)*100).toFixed(1)}%)`);
    logger.info(`Failed: ${failedReports} (${((failedReports/totalReports)*100).toFixed(1)}%)`);
    logger.info(`Average Duration: ${(testResults.reduce((sum, r) => sum + r.duration, 0) / totalReports).toFixed(0)}ms`);
    
    // List failed reports
    if (failedReports > 0) {
      logger.info('\nFailed Reports:');
      testResults
        .filter(r => !r.success)
        .forEach(r => {
          logger.error(`  - ${r.useCaseId}/${r.reportType}: ${r.error}`);
        });
    }
    
    // Performance analysis
    logger.info('\nPerformance Analysis:');
    const slowReports = testResults.filter(r => r.duration > 5000);
    if (slowReports.length > 0) {
      logger.warn(`Slow Reports (>5s): ${slowReports.length}`);
      slowReports.forEach(r => {
        logger.warn(`  - ${r.useCaseId}/${r.reportType}: ${r.duration}ms`);
      });
    }
    
    // Export results to file
    const fs = require('fs');
    const resultsPath = './test-results.json';
    fs.writeFileSync(resultsPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: totalReports,
        successful: successfulReports,
        failed: failedReports,
        successRate: ((successfulReports/totalReports)*100).toFixed(1) + '%'
      },
      results: testResults
    }, null, 2));
    
    logger.info(`\nDetailed results saved to: ${resultsPath}`);
    
  } catch (error) {
    logger.error('Failed to run tests:', error);
  }
}

/**
 * Test a specific use case
 */
async function testSpecificUseCase(useCaseId: string) {
  logger.info(`Testing reports for use case: ${useCaseId}\n`);
  
  try {
    const response = await api.get(`/reports/use-cases/${useCaseId}/reports`);
    const reports = response.data.data.reports;
    
    for (const report of reports) {
      await testReportGeneration(useCaseId, report.id);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
  } catch (error) {
    logger.error('Failed to test use case:', error);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length > 0 && args[0] !== 'all') {
  // Test specific use case
  testSpecificUseCase(args[0]);
} else {
  // Test all reports
  testAllReports();
}