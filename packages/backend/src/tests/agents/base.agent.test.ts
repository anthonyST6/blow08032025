import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { VanguardAgent, AgentResult, LLMOutput, AgentFlag } from '../../agents/base.agent';

jest.mock('../../config/firebase');

// Create a concrete implementation for testing
class TestAgent extends VanguardAgent {
  constructor() {
    super('test-agent', 'Test Agent', '1.0.0', 'Test agent for unit testing');
  }

  async analyze(_output: LLMOutput): Promise<AgentResult> {
    const startTime = Date.now();
    const flags: AgentFlag[] = [];
    
    return this.createResult(
      95,
      flags,
      { details: 'Test analysis completed' },
      0.95,
      startTime
    );
  }
}

describe('VanguardAgent', () => {
  let testAgent: TestAgent;

  beforeEach(() => {
    testAgent = new TestAgent();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize agent with correct properties', () => {
      expect(testAgent.id).toBe('test-agent');
      expect(testAgent.name).toBe('Test Agent');
      expect(testAgent.version).toBe('1.0.0');
      expect(testAgent.description).toBe('Test agent for unit testing');
    });
  });

  describe('analyze', () => {
    it('should analyze LLM output and return results', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Test response text',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await testAgent.analyze(llmOutput);

      expect(result.agentId).toBe('test-agent');
      expect(result.agentName).toBe('Test Agent');
      expect(result.score).toBe(95);
      expect(result.flags).toHaveLength(0);
      expect(result.confidence).toBe(0.95);
      expect(result.metadata).toHaveProperty('details', 'Test analysis completed');
    });

    it('should handle empty text', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: '',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await testAgent.analyze(llmOutput);

      expect(result.score).toBe(95);
      expect(result.flags).toHaveLength(0);
    });
  });

  describe('configuration', () => {
    it('should get and update configuration', () => {
      const config = testAgent.getConfiguration();
      
      expect(config.enabled).toBe(true);
      expect(config.thresholds).toHaveProperty('low', 25);
      expect(config.thresholds).toHaveProperty('medium', 50);
      expect(config.thresholds).toHaveProperty('high', 75);
      expect(config.thresholds).toHaveProperty('critical', 90);

      // Update thresholds
      testAgent.updateThresholds({ low: 30, high: 80 });
      const updatedConfig = testAgent.getConfiguration();
      
      expect(updatedConfig.thresholds.low).toBe(30);
      expect(updatedConfig.thresholds.high).toBe(80);
      expect(updatedConfig.thresholds.medium).toBe(50); // unchanged
    });

    it('should enable and disable agent', () => {
      expect(testAgent.isEnabled()).toBe(true);
      
      testAgent.setEnabled(false);
      expect(testAgent.isEnabled()).toBe(false);
      
      testAgent.setEnabled(true);
      expect(testAgent.isEnabled()).toBe(true);
    });
  });
});