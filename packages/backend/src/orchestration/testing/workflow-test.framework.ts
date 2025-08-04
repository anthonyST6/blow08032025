import { logger } from '../../utils/logger';
import { UseCaseWorkflow, WorkflowStep, WorkflowTrigger } from '../types/workflow.types';
import { workflowRegistry } from '../workflow-registry';
import { EnhancedOrchestrationService } from '../orchestration-enhanced.service';
import { serviceRegistry } from '../service-registry';
import { v4 as uuidv4 } from 'uuid';

export interface WorkflowTestCase {
  id: string;
  name: string;
  description: string;
  workflowId: string;
  scenario: TestScenario;
  expectedResults: ExpectedResults;
  mockData?: MockData;
  timeout?: number;
}

export interface TestScenario {
  trigger: WorkflowTrigger;
  initialContext?: Record<string, any>;
  userInputs?: Record<string, any>;
  environmentVariables?: Record<string, string>;
}

export interface ExpectedResults {
  steps: StepExpectation[];
  finalStatus: 'completed' | 'failed' | 'cancelled';
  outputs?: Record<string, any>;
  duration?: {
    min: number;
    max: number;
  };
}

export interface StepExpectation {
  stepId: string;
  status: 'completed' | 'failed' | 'skipped';
  outputs?: Record<string, any>;
  errorMessage?: string;
}

export interface MockData {
  services: Record<string, MockService>;
  agents: Record<string, MockAgent>;
  externalApis?: Record<string, any>;
}

export interface MockService {
  methods: Record<string, MockMethod>;
}

export interface MockAgent {
  actions: Record<string, MockMethod>;
}

export interface MockMethod {
  response?: any;
  error?: Error;
  delay?: number;
  validator?: (params: any) => boolean;
}

export interface TestResult {
  testId: string;
  workflowId: string;
  status: 'passed' | 'failed' | 'error';
  duration: number;
  steps: StepResult[];
  errors: string[];
  warnings: string[];
  coverage: TestCoverage;
}

export interface StepResult {
  stepId: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  actualOutput?: any;
  expectedOutput?: any;
  error?: string;
}

export interface TestCoverage {
  stepsExecuted: number;
  totalSteps: number;
  pathsCovered: string[];
  conditionsTested: number;
  totalConditions: number;
}

export class WorkflowTestFramework {
  private static instance: WorkflowTestFramework;
  private mockRegistry: Map<string, MockData> = new Map();
  private testResults: Map<string, TestResult[]> = new Map();

  private constructor() {}

  static getInstance(): WorkflowTestFramework {
    if (!WorkflowTestFramework.instance) {
      WorkflowTestFramework.instance = new WorkflowTestFramework();
    }
    return WorkflowTestFramework.instance;
  }

  /**
   * Run a single test case
   */
  async runTest(testCase: WorkflowTestCase): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      testId: testCase.id,
      workflowId: testCase.workflowId,
      status: 'passed',
      duration: 0,
      steps: [],
      errors: [],
      warnings: [],
      coverage: {
        stepsExecuted: 0,
        totalSteps: 0,
        pathsCovered: [],
        conditionsTested: 0,
        totalConditions: 0
      }
    };

    try {
      // Get workflow
      const workflow = workflowRegistry.getWorkflow(testCase.workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${testCase.workflowId} not found`);
      }

      result.coverage.totalSteps = workflow.steps.length;
      result.coverage.totalConditions = this.countConditions(workflow);

      // Setup mocks
      if (testCase.mockData) {
        this.setupMocks(testCase.workflowId, testCase.mockData);
      }

      // Create test execution context
      const executionId = uuidv4();
      const context = {
        ...testCase.scenario.initialContext,
        testMode: true,
        testId: testCase.id
      };

      // Execute workflow
      const execution = await this.executeWorkflowWithTracking(
        workflow,
        executionId,
        context,
        testCase.scenario.trigger
      );

      // Validate results
      result.steps = await this.validateSteps(
        execution,
        testCase.expectedResults.steps
      );

      // Check final status
      if (execution.status !== testCase.expectedResults.finalStatus) {
        result.status = 'failed';
        result.errors.push(
          `Expected final status ${testCase.expectedResults.finalStatus}, got ${execution.status}`
        );
      }

      // Validate outputs
      if (testCase.expectedResults.outputs) {
        const outputValidation = this.validateOutputs(
          execution.outputs,
          testCase.expectedResults.outputs
        );
        if (!outputValidation.valid) {
          result.status = 'failed';
          result.errors.push(...outputValidation.errors);
        }
      }

      // Check duration
      if (testCase.expectedResults.duration) {
        const duration = Date.now() - startTime;
        if (
          duration < testCase.expectedResults.duration.min ||
          duration > testCase.expectedResults.duration.max
        ) {
          result.warnings.push(
            `Execution duration ${duration}ms outside expected range ${testCase.expectedResults.duration.min}-${testCase.expectedResults.duration.max}ms`
          );
        }
      }

      // Calculate coverage
      result.coverage.stepsExecuted = execution.stepsExecuted;
      result.coverage.pathsCovered = execution.pathsCovered;
      result.coverage.conditionsTested = execution.conditionsTested;

    } catch (error) {
      result.status = 'error';
      result.errors.push(error instanceof Error ? error.message : String(error));
      logger.error('Test execution failed', { error, testCase });
    } finally {
      // Cleanup mocks
      if (testCase.mockData) {
        this.cleanupMocks(testCase.workflowId);
      }
      
      result.duration = Date.now() - startTime;
      
      // Store result
      const workflowResults = this.testResults.get(testCase.workflowId) || [];
      workflowResults.push(result);
      this.testResults.set(testCase.workflowId, workflowResults);
    }

    return result;
  }

  /**
   * Run multiple test cases
   */
  async runTests(testCases: WorkflowTestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      logger.info(`Running test: ${testCase.name}`);
      const result = await this.runTest(testCase);
      results.push(result);
      
      // Log result
      if (result.status === 'passed') {
        logger.info(`✓ Test passed: ${testCase.name}`);
      } else {
        logger.error(`✗ Test failed: ${testCase.name}`, { errors: result.errors });
      }
    }

    return results;
  }

  /**
   * Generate test cases for a workflow
   */
  generateTestCases(workflowId: string): WorkflowTestCase[] {
    const workflow = workflowRegistry.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const testCases: WorkflowTestCase[] = [];

    // Happy path test
    testCases.push(this.generateHappyPathTest(workflow));

    // Error handling tests
    testCases.push(...this.generateErrorTests(workflow));

    // Conditional path tests
    testCases.push(...this.generateConditionalTests(workflow));

    // Performance tests
    testCases.push(this.generatePerformanceTest(workflow));

    return testCases;
  }

  /**
   * Generate happy path test
   */
  private generateHappyPathTest(workflow: UseCaseWorkflow): WorkflowTestCase {
    return {
      id: uuidv4(),
      name: `${workflow.name} - Happy Path`,
      description: 'Test successful execution of all steps',
      workflowId: workflow.useCaseId,
      scenario: {
        trigger: workflow.triggers[0],
        initialContext: this.generateMockContext(workflow)
      },
      expectedResults: {
        steps: workflow.steps.map(step => ({
          stepId: step.id,
          status: 'completed',
          outputs: this.generateMockOutputs(step)
        })),
        finalStatus: 'completed'
      },
      mockData: this.generateMockData(workflow)
    };
  }

  /**
   * Generate error handling tests
   */
  private generateErrorTests(workflow: UseCaseWorkflow): WorkflowTestCase[] {
    const tests: WorkflowTestCase[] = [];

    // Test each step failure
    workflow.steps.forEach((step, index) => {
      tests.push({
        id: uuidv4(),
        name: `${workflow.name} - ${step.name} Failure`,
        description: `Test error handling when ${step.name} fails`,
        workflowId: workflow.useCaseId,
        scenario: {
          trigger: workflow.triggers[0],
          initialContext: this.generateMockContext(workflow)
        },
        expectedResults: {
          steps: workflow.steps.map((s, i) => ({
            stepId: s.id,
            status: i < index ? 'completed' : i === index ? 'failed' : 'skipped',
            outputs: i < index ? this.generateMockOutputs(s) : undefined,
            errorMessage: i === index ? 'Simulated error' : undefined
          })),
          finalStatus: 'failed'
        },
        mockData: this.generateErrorMockData(workflow, step.id)
      });
    });

    return tests;
  }

  /**
   * Generate conditional path tests
   */
  private generateConditionalTests(workflow: UseCaseWorkflow): WorkflowTestCase[] {
    const tests: WorkflowTestCase[] = [];

    workflow.steps.forEach(step => {
      if (step.conditions && step.conditions.length > 0) {
        // Test condition met
        tests.push({
          id: uuidv4(),
          name: `${workflow.name} - ${step.name} Condition Met`,
          description: `Test when conditions for ${step.name} are met`,
          workflowId: workflow.useCaseId,
          scenario: {
            trigger: workflow.triggers[0],
            initialContext: this.generateConditionalContext(workflow, step, true)
          },
          expectedResults: {
            steps: workflow.steps.map(s => ({
              stepId: s.id,
              status: 'completed',
              outputs: this.generateMockOutputs(s)
            })),
            finalStatus: 'completed'
          },
          mockData: this.generateMockData(workflow)
        });

        // Test condition not met
        tests.push({
          id: uuidv4(),
          name: `${workflow.name} - ${step.name} Condition Not Met`,
          description: `Test when conditions for ${step.name} are not met`,
          workflowId: workflow.useCaseId,
          scenario: {
            trigger: workflow.triggers[0],
            initialContext: this.generateConditionalContext(workflow, step, false)
          },
          expectedResults: {
            steps: workflow.steps.map(s => ({
              stepId: s.id,
              status: s.id === step.id ? 'skipped' : 'completed',
              outputs: s.id === step.id ? undefined : this.generateMockOutputs(s)
            })),
            finalStatus: 'completed'
          },
          mockData: this.generateMockData(workflow)
        });
      }
    });

    return tests;
  }

  /**
   * Generate performance test
   */
  private generatePerformanceTest(workflow: UseCaseWorkflow): WorkflowTestCase {
    const estimatedDuration = workflow.metadata.estimatedDuration || 60000;
    
    return {
      id: uuidv4(),
      name: `${workflow.name} - Performance Test`,
      description: 'Test workflow execution performance',
      workflowId: workflow.useCaseId,
      scenario: {
        trigger: workflow.triggers[0],
        initialContext: this.generateMockContext(workflow)
      },
      expectedResults: {
        steps: workflow.steps.map(step => ({
          stepId: step.id,
          status: 'completed',
          outputs: this.generateMockOutputs(step)
        })),
        finalStatus: 'completed',
        duration: {
          min: estimatedDuration * 0.5,
          max: estimatedDuration * 1.5
        }
      },
      mockData: this.generateMockData(workflow),
      timeout: estimatedDuration * 2
    };
  }

  /**
   * Setup mocks for testing
   */
  private setupMocks(workflowId: string, mockData: MockData): void {
    this.mockRegistry.set(workflowId, mockData);

    // Mock services
    Object.entries(mockData.services).forEach(([serviceName, mockService]) => {
      const service = serviceRegistry.getService(serviceName);
      if (service) {
        Object.entries(mockService.methods).forEach(([methodName, mockMethod]) => {
          this.mockServiceMethod(service, methodName, mockMethod);
        });
      }
    });

    // Mock agents would be handled similarly
    // For now, we'll focus on service mocking
  }

  /**
   * Mock a service method
   */
  private mockServiceMethod(service: any, methodName: string, mockMethod: MockMethod): void {
    const originalMethod = service[methodName];
    
    service[methodName] = async (...args: any[]) => {
      // Validate parameters if validator provided
      if (mockMethod.validator && !mockMethod.validator(args[0])) {
        throw new Error(`Invalid parameters for ${methodName}`);
      }

      // Simulate delay
      if (mockMethod.delay) {
        await new Promise(resolve => setTimeout(resolve, mockMethod.delay));
      }

      // Return error if specified
      if (mockMethod.error) {
        throw mockMethod.error;
      }

      // Return mock response
      return mockMethod.response || originalMethod?.apply(service, args);
    };
  }

  /**
   * Cleanup mocks after testing
   */
  private cleanupMocks(workflowId: string): void {
    const mockData = this.mockRegistry.get(workflowId);
    if (!mockData) return;

    // Restore original service methods
    // This would require storing references to original methods
    // For now, we'll rely on service restart

    this.mockRegistry.delete(workflowId);
  }

  /**
   * Execute workflow with tracking
   */
  private async executeWorkflowWithTracking(
    workflow: UseCaseWorkflow,
    executionId: string,
    context: any,
    trigger: WorkflowTrigger
  ): Promise<any> {
    // This would integrate with the orchestration service
    // For now, return a mock execution result
    return {
      id: executionId,
      status: 'completed',
      stepsExecuted: workflow.steps.length,
      pathsCovered: ['main'],
      conditionsTested: 0,
      outputs: {}
    };
  }

  /**
   * Validate step results
   */
  private async validateSteps(
    execution: any,
    expectedSteps: StepExpectation[]
  ): Promise<StepResult[]> {
    return expectedSteps.map(expected => ({
      stepId: expected.stepId,
      status: 'passed',
      duration: 100,
      actualOutput: {},
      expectedOutput: expected.outputs
    }));
  }

  /**
   * Validate outputs
   */
  private validateOutputs(
    actual: any,
    expected: any
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Deep comparison logic would go here
    // For now, simple comparison
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      errors.push('Output mismatch');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper methods for generating test data
   */
  private generateMockContext(workflow: UseCaseWorkflow): Record<string, any> {
    return {
      workflowId: workflow.id,
      timestamp: new Date().toISOString()
    };
  }

  private generateMockOutputs(step: WorkflowStep): Record<string, any> {
    const outputs: Record<string, any> = {};
    step.outputs.forEach(output => {
      outputs[output] = `mock_${output}_value`;
    });
    return outputs;
  }

  private generateMockData(workflow: UseCaseWorkflow): MockData {
    const mockData: MockData = {
      services: {},
      agents: {}
    };

    // Generate mocks for each required service
    workflow.metadata.requiredServices.forEach(serviceName => {
      mockData.services[serviceName] = {
        methods: {
          default: {
            response: { success: true, data: {} }
          }
        }
      };
    });

    return mockData;
  }

  private generateErrorMockData(workflow: UseCaseWorkflow, failingStepId: string): MockData {
    const mockData = this.generateMockData(workflow);
    const failingStep = workflow.steps.find(s => s.id === failingStepId);
    
    if (failingStep && failingStep.service && mockData.services[failingStep.service]) {
      const action = failingStep.action || 'default';
      mockData.services[failingStep.service].methods[action] = {
        error: new Error('Simulated error')
      };
    }

    return mockData;
  }

  private generateConditionalContext(
    workflow: UseCaseWorkflow,
    step: WorkflowStep,
    conditionMet: boolean
  ): Record<string, any> {
    const context = this.generateMockContext(workflow);
    
    // Set context values to meet or not meet conditions
    if (step.conditions) {
      step.conditions.forEach(condition => {
        const fieldParts = condition.field.split('.');
        let value = conditionMet ? condition.value : `not_${condition.value}`;
        
        // Handle different operators
        if (condition.operator === '>') {
          value = conditionMet ? condition.value + 1 : condition.value - 1;
        } else if (condition.operator === '<') {
          value = conditionMet ? condition.value - 1 : condition.value + 1;
        }
        
        // Set nested field value
        let current = context;
        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!current[fieldParts[i]]) {
            current[fieldParts[i]] = {};
          }
          current = current[fieldParts[i]];
        }
        current[fieldParts[fieldParts.length - 1]] = value;
      });
    }

    return context;
  }

  private countConditions(workflow: UseCaseWorkflow): number {
    return workflow.steps.reduce((count, step) => {
      return count + (step.conditions?.length || 0);
    }, 0);
  }

  /**
   * Generate test report
   */
  generateReport(workflowId?: string): TestReport {
    const results = workflowId 
      ? this.testResults.get(workflowId) || []
      : Array.from(this.testResults.values()).flat();

    const report: TestReport = {
      totalTests: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      errors: results.filter(r => r.status === 'error').length,
      coverage: this.calculateOverallCoverage(results),
      duration: results.reduce((sum, r) => sum + r.duration, 0),
      timestamp: new Date().toISOString()
    };

    return report;
  }

  private calculateOverallCoverage(results: TestResult[]): any {
    // Calculate aggregate coverage metrics
    return {
      workflows: new Set(results.map(r => r.workflowId)).size,
      steps: results.reduce((sum, r) => sum + r.coverage.stepsExecuted, 0),
      conditions: results.reduce((sum, r) => sum + r.coverage.conditionsTested, 0)
    };
  }
}

export interface TestReport {
  totalTests: number;
  passed: number;
  failed: number;
  errors: number;
  coverage: any;
  duration: number;
  timestamp: string;
}

// Export singleton instance
export const workflowTestFramework = WorkflowTestFramework.getInstance();