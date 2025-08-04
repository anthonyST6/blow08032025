import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BiasDetectorAgent } from '../../agents/bias.agent';
import { LLMOutput } from '../../agents/base.agent';

describe('BiasDetectorAgent', () => {
  let agent: BiasDetectorAgent;

  beforeEach(() => {
    agent = new BiasDetectorAgent();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('bias-detector-agent');
      expect(agent.name).toBe('Bias Detector Agent');
      expect(agent.version).toBe('1.0.0');
      expect(agent.isEnabled()).toBe(true);
    });
  });

  describe('analyze', () => {
    it('should detect gender bias', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'All nurses are women and all engineers are men.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeLessThan(70);
      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'gender_bias',
          severity: expect.stringMatching(/medium|high/),
        })
      );
      expect(result.flags.length).toBeGreaterThan(0);
    });

    it('should detect racial bias', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Asian students are naturally better at math than others.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeLessThan(80);
      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'racial_bias',
          severity: expect.stringMatching(/medium|high/),
        })
      );
    });

    it('should detect age bias', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Older employees are always resistant to new technology.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'age_bias',
          severity: expect.any(String),
        })
      );
    });

    it('should detect socioeconomic bias', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Poor people are lazy and uneducated.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeLessThan(50);
      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'socioeconomic_bias',
          severity: 'high',
        })
      );
    });

    it('should detect stereotypes', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'All lawyers are greedy and all teachers are underpaid.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'stereotype',
          severity: 'high',
        })
      );
    });

    it('should detect exclusionary language', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Hey guys, let\'s discuss mankind\'s achievements.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'exclusionary_language',
          severity: 'medium',
        })
      );
    });

    it('should detect loaded language', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Obviously, everyone knows this is the only correct way.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'loaded_language',
          severity: 'medium',
        })
      );
    });

    it('should pass unbiased content', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'People of all backgrounds can succeed in any profession with proper training and opportunity.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeGreaterThan(80);
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

    it('should detect multiple bias types', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Young women are too emotional to be engineers, while old men are too stubborn to learn.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      const flagTypes = result.flags.map(f => f.type);
      expect(flagTypes).toContain('gender_bias');
      expect(flagTypes).toContain('age_bias');
      expect(result.score).toBeLessThan(50);
      expect(result.flags.length).toBeGreaterThan(1);
    });

    it('should provide metadata with bias categories', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Women belong in the kitchen.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.metadata).toHaveProperty('biasCategories');
      expect(result.metadata.biasCategories).toHaveProperty('gender');
      expect(result.metadata.biasCategories.gender).toBeGreaterThan(0);
    });

    it('should handle academic discussion context', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'In studying historical gender bias, we examine statements like "women cannot be leaders" to understand past discrimination.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      // Should have a better score when discussing bias academically
      expect(result.score).toBeGreaterThan(60);
    });

    it('should calculate confidence based on analysis', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This text contains subtle biases that may be hard to detect.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should track processing time', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Test text for timing.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('configuration', () => {
    it('should return configuration', () => {
      const config = agent.getConfiguration();

      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('thresholds');
      expect(config.enabled).toBe(true);
    });

    it('should update thresholds', () => {
      agent.updateThresholds({ low: 30, medium: 60 });
      const config = agent.getConfiguration();

      expect(config.thresholds.low).toBe(30);
      expect(config.thresholds.medium).toBe(60);
    });

    it('should enable/disable agent', () => {
      agent.setEnabled(false);
      expect(agent.isEnabled()).toBe(false);

      agent.setEnabled(true);
      expect(agent.isEnabled()).toBe(true);
    });
  });
});
