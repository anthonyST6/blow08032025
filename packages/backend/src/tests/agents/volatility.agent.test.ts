import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { VolatilityAgent } from '../../agents/volatility.agent';
import { LLMOutput } from '../../agents/base.agent';

describe('VolatilityAgent', () => {
  let agent: VolatilityAgent;

  beforeEach(() => {
    agent = new VolatilityAgent();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('volatility');
      expect(agent.name).toBe('Volatility Agent');
      expect(agent.version).toBe('1.0.0');
      expect(agent.isEnabled()).toBe(true);
    });
  });

  describe('analyze', () => {
    it('should detect short response volatility', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Yes.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'length_volatility',
          severity: 'high',
          message: 'Response is unusually short',
        })
      );
      expect(result.score).toBeLessThan(80);
    });

    it('should detect long response volatility', async () => {
      const longText = 'This is a very long response. '.repeat(100);
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: longText,
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'length_volatility',
          severity: 'medium',
          message: 'Response is unusually long',
        })
      );
    });

    it('should detect semantic contradictions', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'The sky is blue. However, the sky is actually red.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'semantic_inconsistency',
          severity: 'medium',
        })
      );
    });

    it('should detect inconsistent list formatting', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: '- Item 1\n* Item 2\n1. Item 3\n+ Item 4',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'structure_volatility',
          severity: 'low',
          message: 'Inconsistent list formatting detected',
        })
      );
    });

    it('should detect mixed confidence signals', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'I am definitely certain that this might possibly be correct.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'confidence_volatility',
          severity: 'medium',
          message: 'Mixed confidence signals detected',
        })
      );
    });

    it('should detect excessive hedging', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'It seems that perhaps this might possibly be somewhat correct, though it appears to potentially have some merit.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'confidence_volatility',
          severity: 'low',
          message: 'Excessive hedging language detected',
        })
      );
    });

    it('should detect temporal inconsistencies', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Yesterday we will implement this. Tomorrow we had already done it. Currently, it was completed last week.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'temporal_inconsistency',
          severity: 'low',
          message: 'Multiple conflicting timeframes detected',
        })
      );
    });

    it('should pass consistent content', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This is a clear and consistent response. It maintains a steady tone throughout. The structure is logical and well-organized.',
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

    it('should detect topic drift', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Let me explain quantum physics.\n\nQuantum mechanics deals with subatomic particles.\n\nBy the way, I love pizza.\n\nAlso, the weather is nice today.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(90);
    });

    it('should detect structure changes', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Regular text here.\n\n# Suddenly a header\n\n- Now a list\n\nBack to text.\n\n```code block```\n\nMore text.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'structure_volatility',
          severity: 'medium',
          message: 'Frequent structure changes detected',
        })
      );
    });

    it('should calculate confidence based on analysis', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This response has some volatility indicators.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('configuration', () => {
    it('should have custom volatility thresholds', () => {
      const config = agent.getConfiguration();

      expect(config.customSettings).toHaveProperty('highVolatility');
      expect(config.customSettings).toHaveProperty('mediumVolatility');
      expect(config.customSettings).toHaveProperty('semanticSimilarity');
      expect(config.customSettings).toHaveProperty('responseVariance');
    });
  });
});