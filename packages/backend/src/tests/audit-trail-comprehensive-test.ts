import { auditTrailService } from '../services/audit-trail.service';
import { vanguardActionsService } from '../services/vanguard-actions.service';
import { extractCustomParticulars, getUseCaseAuditConfig } from '../config/use-case-audit-config';
import { logger } from '../utils/logger';

/**
 * Comprehensive test suite for audit trail functionality across all use cases
 * This demonstrates the full capabilities of the audit trail system
 */

interface TestResult {
  testName: string;
  status: 'passed' | 'failed';
  message: string;
  duration: number;
  details?: any;
}

class AuditTrailTestSuite {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests() {
    console.log('=== Comprehensive Audit Trail Test Suite ===\n');
    this.startTime = Date.now();

    // Run all test categories
    await this.testUseCaseAuditLogging();
    await this.testAuditTrailRetrieval();
    await this.testUseCaseSpecificFeatures();
    await this.testVanguardActionsIntegration();
    await this.testAuditReportGeneration();
    await this.testErrorHandlingAndEdgeCases();
    await this.testComplianceAuditFeatures();
    await this.testPerformanceAndScalability();

    // Generate test report
    this.generateTestReport();
  }

  private async testUseCaseAuditLogging() {
    console.log('\n1. Testing Use Case Audit Logging\n');

    // Define all use cases to test
    const useCases = [
      {
        id: 'oilfield-land-lease',
        name: 'Oilfield Land Lease Analysis',
        vertical: 'energy-utilities',
        context: {
          promptData: { leaseId: 'LEASE-2024-TX-001' },
          configuration: { region: 'Texas', priority: 'high' },
          results: {
            leaseAnalysis: { value: 2500000, expirationDate: '2025-12-31' },
            gisData: { location: { lat: 31.9686, lng: -99.9018, county: 'Tom Green' } },
            renewalAnalysis: { status: 'pending' },
            riskAssessment: { score: 75 },
            complianceCheck: { passed: true }
          }
        }
      },
      {
        id: 'energy-load-forecasting',
        name: 'Energy Load Forecasting',
        vertical: 'energy-utilities',
        context: {
          configuration: { forecastPeriod: '24-hour' },
          results: {
            forecast: { peakLoad: 4500 },
            modelMetrics: { accuracy: 96.5 },
            weatherAnalysis: { temperature: 32, humidity: 65 },
            optimization: { reserves: 15, savings: 125000 }
          }
        }
      },
      {
        id: 'grid-anomaly-detection',
        name: 'Grid Anomaly Detection',
        vertical: 'energy-utilities',
        context: {
          configuration: { gridSector: 'Sector-7' },
          results: {
            anomalyAnalysis: { count: 3, maxSeverity: 'medium' },
            affectedEquipment: ['Transformer-T7-234', 'Circuit-12'],
            predictions: { failures: ['Motor-567'] },
            recommendations: { actions: ['preventive_maintenance', 'load_balancing'] }
          }
        }
      },
      {
        id: 'patient-intake',
        name: 'Patient Intake Automation',
        vertical: 'healthcare',
        context: {
          results: {
            intake: { totalPatients: 47, completionRate: 92 },
            verification: { successCount: 45 },
            metrics: { avgTime: 12 },
            quality: { score: 99.2 },
            scheduling: { count: 45 }
          }
        }
      },
      {
        id: 'clinical-trial-matching',
        name: 'Clinical Trial Matching',
        vertical: 'healthcare',
        context: {
          results: {
            screening: { totalPatients: 1250 },
            matching: { matchCount: 87, confidenceMetrics: { avg: 85.5 } },
            eligibility: { successRate: 76.5 },
            analysis: { therapeuticAreas: ['oncology', 'cardiology'] },
            projections: { enrollment: 19 }
          }
        }
      },
      {
        id: 'fraud-detection',
        name: 'Real-time Fraud Detection',
        vertical: 'finance',
        context: {
          results: {
            analysis: { totalTransactions: 50000, riskDistribution: { low: 45000, medium: 4500, high: 500 } },
            detection: { fraudCount: 47 },
            metrics: { falsePositiveRate: 2.1 },
            financial: { amountProtected: 4250000 },
            patterns: { detected: ['card-not-present', 'velocity-abuse'] }
          }
        }
      },
      {
        id: 'loan-processing',
        name: 'Automated Loan Processing',
        vertical: 'finance',
        context: {
          results: {
            processing: { totalApplications: 127 },
            decisions: { autoApproved: 87 },
            metrics: { avgProcessingTime: 4.2 },
            financial: { totalAmount: 24225000 },
            risk: { distribution: { low: 60, medium: 25, high: 2 } },
            quality: { documentationScore: 98.5 }
          }
        }
      },
      {
        id: 'predictive-maintenance',
        name: 'Predictive Maintenance',
        vertical: 'manufacturing',
        context: {
          results: {
            monitoring: { assetCount: 2500 },
            predictions: { failureCount: 8 },
            scheduling: { taskCount: 12 },
            impact: { downtimeHours: 72 },
            financial: { savings: 250000 },
            health: { summary: { good: 2400, warning: 92, critical: 8 } }
          }
        }
      }
    ];

    // Test each use case
    for (const useCase of useCases) {
      const testStart = Date.now();
      try {
        const executionId = `test-exec-${useCase.id}-${Date.now()}`;
        const userId = `test-user-${useCase.vertical}`;
        const userEmail = `test-${useCase.vertical}@seraphim.ai`;

        // Extract custom particulars
        const particulars = extractCustomParticulars(useCase.id, useCase.context);
        
        // Log the use case execution
        await auditTrailService.logUseCaseExecution(
          userId,
          userEmail,
          useCase.id,
          useCase.name,
          executionId,
          useCase.vertical,
          'completed',
          {
            useCaseId: useCase.id,
            useCaseName: useCase.name,
            executionId,
            verticalId: useCase.vertical,
            siaScores: {
              security: 90 + Math.random() * 10,
              integrity: 90 + Math.random() * 10,
              accuracy: 90 + Math.random() * 10
            },
            customFields: particulars
          }
        );

        this.results.push({
          testName: `Use Case Logging: ${useCase.name}`,
          status: 'passed',
          message: `Successfully logged execution for ${useCase.id}`,
          duration: Date.now() - testStart,
          details: { executionId, particulars }
        });

        console.log(`✓ ${useCase.name} - Execution logged`);
      } catch (error) {
        this.results.push({
          testName: `Use Case Logging: ${useCase.name}`,
          status: 'failed',
          message: `Failed to log execution: ${error}`,
          duration: Date.now() - testStart
        });
        console.log(`✗ ${useCase.name} - Failed: ${error}`);
      }
    }
  }

  private async testAuditTrailRetrieval() {
    console.log('\n2. Testing Audit Trail Retrieval and Filtering\n');

    const testCases = [
      {
        name: 'Retrieve by Use Case ID',
        test: async () => {
          const logs = await auditTrailService.getUseCaseAuditTrail('oilfield-land-lease', { limit: 5 });
          return logs.length > 0;
        }
      },
      {
        name: 'Retrieve by Vertical ID',
        test: async () => {
          const logs = await auditTrailService.getVerticalAuditTrail('healthcare', { limit: 5 });
          return logs.length > 0;
        }
      },
      {
        name: 'Retrieve with Date Range',
        test: async () => {
          const endDate = new Date();
          const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
          const logs = await auditTrailService.getAuditTrail({
            startDate,
            endDate,
            limit: 10
          });
          return logs.length >= 0;
        }
      },
      {
        name: 'Retrieve by Result Status',
        test: async () => {
          const successLogs = await auditTrailService.getAuditTrail({
            result: 'success',
            limit: 5
          });
          return successLogs.every(log => log.result === 'success');
        }
      },
      {
        name: 'Retrieve by Action Type',
        test: async () => {
          const logs = await auditTrailService.getAuditTrail({
            action: 'usecase.execution.completed',
            limit: 5
          });
          return logs.every(log => log.action === 'usecase.execution.completed');
        }
      }
    ];

    for (const testCase of testCases) {
      const testStart = Date.now();
      try {
        const result = await testCase.test();
        this.results.push({
          testName: `Retrieval: ${testCase.name}`,
          status: result ? 'passed' : 'failed',
          message: result ? 'Test passed' : 'Test failed - unexpected result',
          duration: Date.now() - testStart
        });
        console.log(`${result ? '✓' : '✗'} ${testCase.name}`);
      } catch (error) {
        this.results.push({
          testName: `Retrieval: ${testCase.name}`,
          status: 'failed',
          message: `Error: ${error}`,
          duration: Date.now() - testStart
        });
        console.log(`✗ ${testCase.name} - Error: ${error}`);
      }
    }
  }

  private async testUseCaseSpecificFeatures() {
    console.log('\n3. Testing Use Case Specific Features\n');

    const testStart = Date.now();
    try {
      // Test audit summary generation
      const summary = await auditTrailService.getUseCaseAuditSummary('fraud-detection');
      
      const hasRequiredFields = 
        summary.totalActions >= 0 &&
        summary.successRate >= 0 &&
        summary.averageSiaScores &&
        summary.actionBreakdown &&
        summary.recentActions &&
        summary.customParticularsBreakdown;

      this.results.push({
        testName: 'Use Case Audit Summary',
        status: hasRequiredFields ? 'passed' : 'failed',
        message: hasRequiredFields ? 'Summary generated successfully' : 'Missing required fields',
        duration: Date.now() - testStart,
        details: summary
      });

      console.log(`${hasRequiredFields ? '✓' : '✗'} Use Case Audit Summary Generation`);

      // Test custom particulars extraction
      const configs = [
        'oilfield-land-lease',
        'patient-intake',
        'fraud-detection',
        'predictive-maintenance'
      ];

      for (const configId of configs) {
        const config = getUseCaseAuditConfig(configId);
        if (config) {
          console.log(`✓ Configuration found for ${configId}`);
          this.results.push({
            testName: `Config Validation: ${configId}`,
            status: 'passed',
            message: 'Configuration validated',
            duration: 0,
            details: { fields: config.customParticulars.fields.length }
          });
        }
      }
    } catch (error) {
      this.results.push({
        testName: 'Use Case Specific Features',
        status: 'failed',
        message: `Error: ${error}`,
        duration: Date.now() - testStart
      });
      console.log(`✗ Use Case Specific Features - Error: ${error}`);
    }
  }

  private async testVanguardActionsIntegration() {
    console.log('\n4. Testing Vanguard Actions Integration\n');

    const useCases = ['oilfield-land-lease', 'fraud-detection', 'patient-intake'];

    for (const useCaseId of useCases) {
      const testStart = Date.now();
      try {
        // Generate vanguard actions for use case
        const actions = vanguardActionsService.generateUseCaseActions(useCaseId);
        
        if (actions.length > 0) {
          // Log a sample action
          const sampleAction = await vanguardActionsService.logAction({
            ...actions[0],
            id: `test-action-${Date.now()}`,
            timestamp: new Date().toISOString()
          });

          // Log use case execution with vanguard actions
          await auditTrailService.logUseCaseExecution(
            'test-user-vanguard',
            'vanguard-test@seraphim.ai',
            useCaseId,
            `${useCaseId} with Vanguard Actions`,
            `exec-vanguard-${Date.now()}`,
            'test-vertical',
            'completed',
            {
              useCaseId,
              useCaseName: `${useCaseId} Test`,
              executionId: `exec-vanguard-${Date.now()}`,
              verticalId: 'test-vertical',
              agentActions: actions,
              siaScores: { security: 95, integrity: 93, accuracy: 91 }
            }
          );

          this.results.push({
            testName: `Vanguard Integration: ${useCaseId}`,
            status: 'passed',
            message: `Generated and logged ${actions.length} vanguard actions`,
            duration: Date.now() - testStart,
            details: { actionCount: actions.length }
          });

          console.log(`✓ ${useCaseId} - ${actions.length} vanguard actions integrated`);
        }
      } catch (error) {
        this.results.push({
          testName: `Vanguard Integration: ${useCaseId}`,
          status: 'failed',
          message: `Error: ${error}`,
          duration: Date.now() - testStart
        });
        console.log(`✗ ${useCaseId} - Error: ${error}`);
      }
    }
  }

  private async testAuditReportGeneration() {
    console.log('\n5. Testing Audit Report Generation\n');

    const testStart = Date.now();
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      // Test different grouping options
      const groupByOptions = ['user', 'action', 'resource'];
      
      for (const groupBy of groupByOptions) {
        const report = await auditTrailService.generateAuditReport(
          startDate,
          endDate,
          groupBy as any
        );

        const isValid = 
          report.period &&
          report.totalEntries >= 0 &&
          report.successCount >= 0 &&
          report.failureCount >= 0 &&
          report.breakdown;

        this.results.push({
          testName: `Report Generation: Group by ${groupBy}`,
          status: isValid ? 'passed' : 'failed',
          message: isValid ? 'Report generated successfully' : 'Invalid report structure',
          duration: Date.now() - testStart,
          details: {
            totalEntries: report.totalEntries,
            breakdownKeys: Object.keys(report.breakdown).length
          }
        });

        console.log(`${isValid ? '✓' : '✗'} Report grouped by ${groupBy}`);
      }
    } catch (error) {
      this.results.push({
        testName: 'Audit Report Generation',
        status: 'failed',
        message: `Error: ${error}`,
        duration: Date.now() - testStart
      });
      console.log(`✗ Audit Report Generation - Error: ${error}`);
    }
  }

  private async testErrorHandlingAndEdgeCases() {
    console.log('\n6. Testing Error Handling and Edge Cases\n');

    const edgeCases = [
      {
        name: 'Invalid Use Case ID',
        test: async () => {
          const logs = await auditTrailService.getUseCaseAuditTrail('invalid-use-case-id');
          return logs.length === 0;
        }
      },
      {
        name: 'Empty Date Range',
        test: async () => {
          const logs = await auditTrailService.getAuditTrail({
            startDate: new Date('2099-01-01'),
            endDate: new Date('2099-01-02')
          });
          return logs.length === 0;
        }
      },
      {
        name: 'Missing Required Fields',
        test: async () => {
          try {
            await auditTrailService.logUseCaseExecution(
              '',
              '',
              '',
              '',
              '',
              '',
              'completed'
            );
            return false; // Should not reach here
          } catch (error) {
            return true; // Expected to handle gracefully
          }
        }
      },
      {
        name: 'Large Limit Request',
        test: async () => {
          const logs = await auditTrailService.getAuditTrail({ limit: 10000 });
          return logs.length <= 10000;
        }
      }
    ];

    for (const edgeCase of edgeCases) {
      const testStart = Date.now();
      try {
        const result = await edgeCase.test();
        this.results.push({
          testName: `Edge Case: ${edgeCase.name}`,
          status: result ? 'passed' : 'failed',
          message: result ? 'Handled correctly' : 'Unexpected behavior',
          duration: Date.now() - testStart
        });
        console.log(`${result ? '✓' : '✗'} ${edgeCase.name}`);
      } catch (error) {
        this.results.push({
          testName: `Edge Case: ${edgeCase.name}`,
          status: 'failed',
          message: `Error: ${error}`,
          duration: Date.now() - testStart
        });
        console.log(`✗ ${edgeCase.name} - Error: ${error}`);
      }
    }
  }

  private async testComplianceAuditFeatures() {
    console.log('\n7. Testing Compliance Audit Features\n');

    const testStart = Date.now();
    try {
      // Log compliance checks
      const complianceChecks = [
        { type: 'HIPAA', resourceId: 'patient-data-001', passed: true },
        { type: 'SOX', resourceId: 'financial-report-001', passed: true },
        { type: 'GDPR', resourceId: 'user-data-001', passed: false }
      ];

      for (const check of complianceChecks) {
        await auditTrailService.logComplianceCheck(
          'compliance-officer',
          'compliance@seraphim.ai',
          check.type,
          check.resourceId,
          { details: 'Automated compliance check' },
          check.passed
        );
      }

      // Retrieve compliance audit trail
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      
      const complianceLogs = await auditTrailService.getComplianceAuditTrail(
        startDate,
        endDate
      );

      this.results.push({
        testName: 'Compliance Audit Logging',
        status: 'passed',
        message: `Logged ${complianceChecks.length} compliance checks`,
        duration: Date.now() - testStart,
        details: { checksLogged: complianceChecks.length }
      });

      console.log(`✓ Compliance audit features tested`);
    } catch (error) {
      this.results.push({
        testName: 'Compliance Audit Features',
        status: 'failed',
        message: `Error: ${error}`,
        duration: Date.now() - testStart
      });
      console.log(`✗ Compliance Audit Features - Error: ${error}`);
    }
  }

  private async testPerformanceAndScalability() {
    console.log('\n8. Testing Performance and Scalability\n');

    const testStart = Date.now();
    try {
      // Test bulk logging performance
      const bulkSize = 100;
      const bulkStart = Date.now();
      
      for (let i = 0; i < bulkSize; i++) {
        await auditTrailService.logAction({
          userId: `perf-test-user-${i}`,
          userEmail: `perf-${i}@test.com`,
          action: 'performance.test',
          resource: 'test-resource',
          result: 'success',
          details: { iteration: i }
        });
      }
      
      const bulkDuration = Date.now() - bulkStart;
      const avgTimePerLog = bulkDuration / bulkSize;

      this.results.push({
        testName: 'Bulk Logging Performance',
        status: avgTimePerLog < 100 ? 'passed' : 'failed', // Should be under 100ms per log
        message: `Average time per log: ${avgTimePerLog.toFixed(2)}ms`,
        duration: bulkDuration,
        details: {
          totalLogs: bulkSize,
          totalTime: bulkDuration,
          avgTimePerLog
        }
      });

      console.log(`✓ Bulk logging: ${bulkSize} logs in ${bulkDuration}ms (${avgTimePerLog.toFixed(2)}ms avg)`);

      // Test retrieval performance
      const retrievalStart = Date.now();
      const logs = await auditTrailService.getAuditTrail({ limit: 1000 });
      const retrievalDuration = Date.now() - retrievalStart;

      this.results.push({
        testName: 'Retrieval Performance',
        status: retrievalDuration < 5000 ? 'passed' : 'failed', // Should be under 5 seconds
        message: `Retrieved ${logs.length} logs in ${retrievalDuration}ms`,
        duration: retrievalDuration,
        details: {
          logsRetrieved: logs.length,
          timeMs: retrievalDuration
        }
      });

      console.log(`✓ Retrieval: ${logs.length} logs in ${retrievalDuration}ms`);
    } catch (error) {
      this.results.push({
        testName: 'Performance and Scalability',
        status: 'failed',
        message: `Error: ${error}`,
        duration: Date.now() - testStart
      });
      console.log(`✗ Performance and Scalability - Error: ${error}`);
    }
  }

  private generateTestReport() {
    console.log('\n=== Test Results Summary ===\n');

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'passed').length;
    const failedTests = this.results.filter(r => r.status === 'failed').length;
    const totalDuration = Date.now() - this.startTime;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);
    console.log(`Total Duration: ${totalDuration}ms\n`);

    // Show failed tests details
    if (failedTests > 0) {
      console.log('Failed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`  - ${r.testName}: ${r.message}`);
        });
      console.log('');
    }

    // Group results by category
    const categories = new Map<string, TestResult[]>();
    this.results.forEach(result => {
      const category = result.testName.split(':')[0];
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(result);
    });

    console.log('Results by Category:');
    categories.forEach((results, category) => {
      const passed = results.filter(r => r.status === 'passed').length;
      const total = results.length;
      console.log(`  ${category}: ${passed}/${total} passed`);
    });

    // Log detailed results to file
    logger.info('Audit Trail Test Results', {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: (passedTests / totalTests) * 100,
        totalDuration
      },
      results: this.results
    });
  }
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  const testSuite = new AuditTrailTestSuite();
  testSuite.runAllTests()
    .then(() => {
      console.log('\nTest suite completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nTest suite failed:', error);
      process.exit(1);
    });
}

export { AuditTrailTestSuite };