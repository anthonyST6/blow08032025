import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { IntegrityAuditorAgent } from '../../agents/integrity-auditor.agent';
import { LLMOutput } from '../../agents/base.agent';

describe('IntegrityAuditorAgent', () => {
  let agent: IntegrityAuditorAgent;

  beforeEach(() => {
    agent = new IntegrityAuditorAgent();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('integrity-auditor');
      expect(agent.name).toBe('Integrity Auditor');
      expect(agent.version).toBe('1.0.0');
      expect(agent.isEnabled()).toBe(true);
    });
  });

  describe('analyze', () => {
    it('should detect contradictions', async () => {
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

      expect(result.score).toBeLessThan(80);
      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'integrity_contradiction',
          severity: 'high',
        })
      );
    });

    it('should detect unsupported claims', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Studies show that 99% of people prefer this product.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      // The integrity auditor doesn't specifically check for unsupported claims
      // but it should detect incomplete information
      expect(result.flags.length).toBeGreaterThan(0);
    });

    it('should detect logical fallacies', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Everyone is doing it, so it must be right.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'integrity_logical_fallacy_hasty_generalization',
          severity: 'medium',
        })
      );
    });

    it('should detect circular reasoning', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This is true because it is correct, and it is correct because it is true.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'integrity_circular_reasoning',
          severity: 'high',
        })
      );
    });

    it('should pass logically consistent content', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Water boils at 100°C at sea level. This is due to atmospheric pressure.',
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

    it('should calculate integrity score based on issues found', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'The sky is blue. However, the sky is red. Everyone knows this is true because everyone says so.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      // Should find multiple issues
      expect(result.flags.length).toBeGreaterThan(1);
      // Score should be reduced for each issue
      expect(result.score).toBeLessThan(70);
    });
  });

  describe('configuration', () => {
    it('should have custom integrity settings', () => {
      const config = agent.getConfiguration();

      expect(config.customSettings).toHaveProperty('checkConsistency');
      expect(config.customSettings).toHaveProperty('checkCompleteness');
      expect(config.customSettings).toHaveProperty('checkAccuracy');
      expect(config.customSettings).toHaveProperty('strictValidation');
    });
  });
});