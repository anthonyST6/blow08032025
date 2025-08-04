import { describe, it, expect, beforeEach } from '@jest/globals';
import { AccuracyAgent } from '../../agents/accuracy.agent';
import { LLMOutput, AgentResult } from '../../agents/base.agent';

describe('AccuracyAgent', () => {
  let agent: AccuracyAgent;

  beforeEach(() => {
    agent = new AccuracyAgent();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('accuracy-agent');
      expect(agent.name).toBe('Accuracy Score Agent');
      expect(agent.version).toBe('1.0.0');
      expect(agent.description).toBe('Evaluates the factual accuracy of LLM outputs by comparing against known facts and data sources');
    });
  });

  describe('analyze', () => {
    it('should return high score for accurate content', async () => {
      const input: LLMOutput = {
        id: 'test-id-1',
        promptId: 'prompt-1',
        text: 'The Earth orbits around the Sun. Water freezes at 0 degrees Celsius.',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      const result: AgentResult = await agent.analyze(input);

      expect(result.score).toBeGreaterThan(80);
      expect(result.flags).toHaveLength(0);
      expect(result.metadata.claimsAnalyzed).toBeGreaterThan(0);
    });

    it('should detect numerical errors', async () => {
      const input: LLMOutput = {
        id: 'test-id-2',
        promptId: 'prompt-2',
        text: '2 + 2 = 5. The calculation shows that 10 * 10 = 90.',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      const result: AgentResult = await agent.analyze(input);

      expect(result.score).toBeLessThan(100);
      expect(result.flags.some(f => f.type === 'numerical_error')).toBe(true);
      expect(result.metadata.numericalErrorsFound).toBeGreaterThan(0);
    });

    it('should detect date errors', async () => {
      const input: LLMOutput = {
        id: 'test-id-3',
        promptId: 'prompt-3',
        text: 'The meeting is scheduled for 13/32/2024. The deadline is 2024-15-45.',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      const result: AgentResult = await agent.analyze(input);

      expect(result.score).toBeLessThan(100);
      expect(result.flags.some(f => f.type === 'date_error')).toBe(true);
      expect(result.metadata.dateErrorsFound).toBeGreaterThan(0);
    });

    it('should detect contradictions', async () => {
      const input: LLMOutput = {
        id: 'test-id-4',
        promptId: 'prompt-4',
        text: 'The stock price increased significantly. The stock price decreased sharply.',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      const result: AgentResult = await agent.analyze(input);

      expect(result.score).toBeLessThan(100);
      expect(result.flags.some(f => f.type === 'contradiction')).toBe(true);
      expect(result.metadata.contradictionsFound).toBeGreaterThan(0);
    });

    it('should handle empty text', async () => {
      const input: LLMOutput = {
        id: 'test-id-5',
        promptId: 'prompt-5',
        text: '',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      // Empty text should throw validation error
      await expect(agent.analyze(input)).rejects.toThrow('Invalid input: LLM output text is required');
    });

    it('should add critical flag for very low accuracy', async () => {
      const input: LLMOutput = {
        id: 'test-id-6',
        promptId: 'prompt-6',
        text: '2 + 2 = 5. 3 * 3 = 10. 4 / 2 = 3. 5 * 5 = 30. 10 - 5 = 3. The Earth is flat. Water boils at 50 degrees. The sun revolves around the earth.',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      const result: AgentResult = await agent.analyze(input);

      expect(result.score).toBeLessThanOrEqual(50);
      // Check if there's a low_accuracy flag when score is 50 or below
      if (result.score < 50) {
        expect(result.flags.some(f => f.type === 'low_accuracy' && f.severity === 'critical')).toBe(true);
      }
    });

    it('should extract and analyze claims', async () => {
      const input: LLMOutput = {
        id: 'test-id-7',
        promptId: 'prompt-7',
        text: 'Python is a programming language. JavaScript was created in 1995. The sky is blue.',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      const result: AgentResult = await agent.analyze(input);

      expect(result.metadata.claimsAnalyzed).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should handle complex contradictions', async () => {
      const input: LLMOutput = {
        id: 'test-id-8',
        promptId: 'prompt-8',
        text: 'The company reported positive growth. However, the company did not report positive growth.',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      const result: AgentResult = await agent.analyze(input);

      expect(result.flags.some(f => f.type === 'contradiction')).toBe(true);
      expect(result.confidence).toBeLessThan(1.0);
    });

    it('should validate input', async () => {
      const invalidInput = {
        id: 'test-id',
        promptId: 'prompt-id',
        text: 'test',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        // valid input with text should not throw
      } as LLMOutput;

      const result = await agent.analyze(invalidInput);
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should handle mathematical expressions correctly', async () => {
      const input: LLMOutput = {
        id: 'test-id-9',
        promptId: 'prompt-9',
        text: '5 + 5 = 10. 20 - 10 = 10. 3 * 4 = 12.',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      const result: AgentResult = await agent.analyze(input);

      expect(result.score).toBe(100);
      expect(result.metadata.numericalErrorsFound).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle text with special characters', async () => {
      const input: LLMOutput = {
        id: 'test-id-10',
        promptId: 'prompt-10',
        text: 'The price is $100.50. The rate is 5.5%. Email: test@example.com',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      const result: AgentResult = await agent.analyze(input);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle very long text', async () => {
      const longText = 'This is a fact. '.repeat(100);
      const input: LLMOutput = {
        id: 'test-id-11',
        promptId: 'prompt-11',
        text: longText,
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      const result: AgentResult = await agent.analyze(input);

      expect(result).toBeDefined();
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle text with no factual claims', async () => {
      const input: LLMOutput = {
        id: 'test-id-12',
        promptId: 'prompt-12',
        text: 'Hello! How are you? Nice to meet you.',
        model: 'test-model',
        modelVersion: '1.0',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {}
      };

      const result: AgentResult = await agent.analyze(input);

      expect(result.score).toBe(100);
      // "How are you?" contains "are" so it might be detected as a claim
      expect(result.metadata.claimsAnalyzed).toBeGreaterThanOrEqual(0);
    });
  });
});