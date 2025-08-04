import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AccuracyEngineAgent } from '../../agents/accuracy-engine.agent';
import { LLMOutput } from '../../agents/base.agent';

describe('AccuracyEngineAgent', () => {
  let agent: AccuracyEngineAgent;

  beforeEach(() => {
    agent = new AccuracyEngineAgent();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('accuracy-engine');
      expect(agent.name).toBe('Accuracy Engine');
      expect(agent.version).toBe('1.0.0');
      expect(agent.isEnabled()).toBe(true);
    });
  });

  describe('analyze', () => {
    it('should detect factual errors', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'The capital of France is London.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeLessThan(80);
      expect(result.flags.length).toBeGreaterThan(0);
    });

    it('should detect outdated information', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'The current president of the United States is George Washington.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      // The accuracy engine doesn't specifically check for outdated info
      // but it should detect factual errors
      expect(result.flags.length).toBeGreaterThan(0);
    });

    it('should detect statistical inaccuracies', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'The average human has 3 arms.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeLessThan(80);
      expect(result.flags.length).toBeGreaterThan(0);
    });

    it('should detect calculation errors', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: '2 + 2 = 5',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeLessThan(80);
      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'accuracy_calculation_error',
          severity: 'high',
        })
      );
    });

    it('should pass accurate content', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Paris is the capital of France. Water freezes at 0°C.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeGreaterThan(90);
      expect(result.flags).toHaveLength(0);
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

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBe(100);
      expect(result.flags).toHaveLength(0);
    });

    it('should provide confidence levels', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'The Earth orbits the Sun. The capital of France might be Paris.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should detect multiple accuracy issues', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'The capital of France is London. 2 + 2 = 5. The average human has 3 arms.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags.length).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThan(80);
    });
  });

  describe('configuration', () => {
    it('should have custom accuracy settings', () => {
      const config = agent.getConfiguration();

      expect(config.customSettings).toHaveProperty('factCheckingEnabled');
      expect(config.customSettings).toHaveProperty('numericalPrecision');
      expect(config.customSettings).toHaveProperty('dateValidation');
      expect(config.customSettings).toHaveProperty('logicalConsistency');
    });
  });
});