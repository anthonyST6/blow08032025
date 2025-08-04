import { logger } from '../../utils/logger';
import { workflowTestFramework, WorkflowTestCase, TestResult } from './workflow-test.framework';
import { workflowRegistry } from '../workflow-registry';

export interface TestRunOptions {
  workflowIds?: string[];
  testTypes?: ('happy-path' | 'error' | 'conditional' | 'performance')[];
  parallel?: boolean;
  verbose?: boolean;
}

export interface TestRunSummary {
  totalTests: number;
  passed: number;
  failed: number;
  errors: number;
  duration: number;
  workflowsCovered: number;
  results: TestResult[];
  timestamp: string;
}

export class WorkflowTestRunner {
  private static instance: WorkflowTestRunner;

  private constructor() {}

  static getInstance(): WorkflowTestRunner {
    if (!WorkflowTestRunner.instance) {
      WorkflowTestRunner.instance = new WorkflowTestRunner();
    }
    return WorkflowTestRunner.instance;
  }

  /**
   * Run tests for specified workflows
   */
  async runTests(options: TestRunOptions = {}): Promise<TestRunSummary> {
    const startTime = Date.now();
    const results: TestResult[] = [];

    try {
      // Get workflows to test
      const workflowIds = options.workflowIds || workflowRegistry.getAllWorkflows().map(w => w.useCaseId);
      
      logger.info(`Starting workflow tests for ${workflowIds.length} workflows`);

      // Generate test cases for each workflow
      const allTestCases: WorkflowTestCase[] = [];
      
      for (const workflowId of workflowIds) {
        const testCases = workflowTestFramework.generateTestCases(workflowId);
        
        // Filter by test types if specified
        const filteredCases = options.testTypes 
          ? testCases.filter(tc => {
              if (options.testTypes!.includes('happy-path') && tc.name.includes('Happy Path')) return true;
              if (options.testTypes!.includes('error') && tc.name.includes('Failure')) return true;
              if (options.testTypes!.includes('conditional') && tc.name.includes('Condition')) return true;
              if (options.testTypes!.includes('performance') && tc.name.includes('Performance')) return true;
              return false;
            })
          : testCases;
          
        allTestCases.push(...filteredCases);
      }

      logger.info(`Generated ${allTestCases.length} test cases`);

      // Run tests
      if (options.parallel) {
        // Run tests in parallel
        const testPromises = allTestCases.map(testCase => 
          this.runSingleTest(testCase, options.verbose)
        );
        const parallelResults = await Promise.all(testPromises);
        results.push(...parallelResults);
      } else {
        // Run tests sequentially
        for (const testCase of allTestCases) {
          const result = await this.runSingleTest(testCase, options.verbose);
          results.push(result);
        }
      }

      // Generate summary
      const summary: TestRunSummary = {
        totalTests: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: results.filter(r => r.status === 'failed').length,
        errors: results.filter(r => r.status === 'error').length,
        duration: Date.now() - startTime,
        workflowsCovered: new Set(results.map(r => r.workflowId)).size,
        results,
        timestamp: new Date().toISOString()
      };

      // Log summary
      logger.info('Test run completed', {
        total: summary.totalTests,
        passed: summary.passed,
        failed: summary.failed,
        errors: summary.errors,
        duration: `${summary.duration}ms`
      });

      return summary;

    } catch (error) {
      logger.error('Test run failed', { error });
      throw error;
    }
  }

  /**
   * Run a single test case
   */
  private async runSingleTest(testCase: WorkflowTestCase, verbose?: boolean): Promise<TestResult> {
    if (verbose) {
      logger.info(`Running test: ${testCase.name}`);
    }

    try {
      const result = await workflowTestFramework.runTest(testCase);
      
      if (verbose) {
        if (result.status === 'passed') {
          logger.info(`✓ ${testCase.name} - PASSED (${result.duration}ms)`);
        } else if (result.status === 'failed') {
          logger.warn(`✗ ${testCase.name} - FAILED (${result.duration}ms)`, {
            errors: result.errors
          });
        } else {
          logger.error(`✗ ${testCase.name} - ERROR (${result.duration}ms)`, {
            errors: result.errors
          });
        }
      }

      return result;

    } catch (error) {
      logger.error(`Test execution error: ${testCase.name}`, { error });
      
      return {
        testId: testCase.id,
        workflowId: testCase.workflowId,
        status: 'error',
        duration: 0,
        steps: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        coverage: {
          stepsExecuted: 0,
          totalSteps: 0,
          pathsCovered: [],
          conditionsTested: 0,
          totalConditions: 0
        }
      };
    }
  }

  /**
   * Run smoke tests for critical workflows
   */
  async runSmokeTests(): Promise<TestRunSummary> {
    const criticalWorkflows = [
      'grid-anomaly-detection',
      'methane-detection',
      'patient-risk',
      'fraud-detection',
      'cyber-defense'
    ];

    return this.runTests({
      workflowIds: criticalWorkflows,
      testTypes: ['happy-path'],
      parallel: true,
      verbose: true
    });
  }

  /**
   * Run regression tests
   */
  async runRegressionTests(): Promise<TestRunSummary> {
    return this.runTests({
      testTypes: ['happy-path', 'error'],
      parallel: false,
      verbose: false
    });
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests(): Promise<TestRunSummary> {
    return this.runTests({
      testTypes: ['performance'],
      parallel: false,
      verbose: true
    });
  }

  /**
   * Generate test report
   */
  generateTestReport(summary: TestRunSummary): string {
    const report = [
      '# Workflow Test Report',
      `Generated: ${summary.timestamp}`,
      '',
      '## Summary',
      `- Total Tests: ${summary.totalTests}`,
      `- Passed: ${summary.passed} (${((summary.passed / summary.totalTests) * 100).toFixed(1)}%)`,
      `- Failed: ${summary.failed} (${((summary.failed / summary.totalTests) * 100).toFixed(1)}%)`,
      `- Errors: ${summary.errors} (${((summary.errors / summary.totalTests) * 100).toFixed(1)}%)`,
      `- Duration: ${summary.duration}ms`,
      `- Workflows Covered: ${summary.workflowsCovered}`,
      '',
      '## Failed Tests',
      ...summary.results
        .filter(r => r.status === 'failed')
        .map(r => {
          const testCase = summary.results.find(res => res.testId === r.testId);
          return [
            `### ${r.workflowId} - Test ${r.testId}`,
            `Status: ${r.status}`,
            `Duration: ${r.duration}ms`,
            'Errors:',
            ...r.errors.map(e => `- ${e}`),
            ''
          ].join('\n');
        }),
      '',
      '## Error Tests',
      ...summary.results
        .filter(r => r.status === 'error')
        .map(r => {
          return [
            `### ${r.workflowId} - Test ${r.testId}`,
            `Status: ${r.status}`,
            'Errors:',
            ...r.errors.map(e => `- ${e}`),
            ''
          ].join('\n');
        }),
      '',
      '## Coverage Report',
      ...this.generateCoverageReport(summary),
      ''
    ];

    return report.join('\n');
  }

  /**
   * Generate coverage report section
   */
  private generateCoverageReport(summary: TestRunSummary): string[] {
    const workflowCoverage = new Map<string, {
      stepsExecuted: number;
      totalSteps: number;
      conditionsTested: number;
      totalConditions: number;
    }>();

    // Aggregate coverage by workflow
    summary.results.forEach(result => {
      const existing = workflowCoverage.get(result.workflowId) || {
        stepsExecuted: 0,
        totalSteps: 0,
        conditionsTested: 0,
        totalConditions: 0
      };

      existing.stepsExecuted = Math.max(existing.stepsExecuted, result.coverage.stepsExecuted);
      existing.totalSteps = Math.max(existing.totalSteps, result.coverage.totalSteps);
      existing.conditionsTested = Math.max(existing.conditionsTested, result.coverage.conditionsTested);
      existing.totalConditions = Math.max(existing.totalConditions, result.coverage.totalConditions);

      workflowCoverage.set(result.workflowId, existing);
    });

    const coverageLines: string[] = [];
    
    workflowCoverage.forEach((coverage, workflowId) => {
      const stepCoverage = coverage.totalSteps > 0 
        ? ((coverage.stepsExecuted / coverage.totalSteps) * 100).toFixed(1)
        : '0.0';
      
      const conditionCoverage = coverage.totalConditions > 0
        ? ((coverage.conditionsTested / coverage.totalConditions) * 100).toFixed(1)
        : 'N/A';

      coverageLines.push(
        `- **${workflowId}**: Steps ${stepCoverage}% (${coverage.stepsExecuted}/${coverage.totalSteps}), ` +
        `Conditions ${conditionCoverage} (${coverage.conditionsTested}/${coverage.totalConditions})`
      );
    });

    return coverageLines;
  }
}

// Export singleton instance
export const workflowTestRunner = WorkflowTestRunner.getInstance();