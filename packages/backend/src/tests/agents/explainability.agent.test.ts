import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ExplainabilityAgent } from '../../agents/explainability.agent';
import { LLMOutput } from '../../agents/base.agent';

describe('ExplainabilityAgent', () => {
  let agent: ExplainabilityAgent;

  beforeEach(() => {
    agent = new ExplainabilityAgent();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('explainability_parser');
      expect(agent.name).toBe('Explainability Parser');
      expect(agent.version).toBe('1.0.0');
      expect(agent.isEnabled()).toBe(true);
    });
  });

  describe('analyze - structure', () => {
    it('should detect missing introduction', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Here are the steps: Step 1: Do this. Step 2: Do that. Step 3: Complete.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'structure_missing_introduction',
          severity: 'medium',
        })
      );
    });

    it('should detect poor organization', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This is a long explanation without any clear steps or organization. Everything is jumbled together in one big paragraph without any structure.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'structure_poor_organization',
          severity: 'medium',
        })
      );
    });

    it('should detect missing examples', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This is a theoretical explanation of a complex concept without any concrete examples to illustrate the points being made.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'structure_no_examples',
          severity: 'low',
        })
      );
    });
  });

  describe('analyze - logical flow', () => {
    it('should detect weak logical connections', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Statement one. Statement two. Statement three. Statement four. Statement five. Statement six.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'logical_flow_weak_connections',
          severity: 'medium',
        })
      );
    });

    it('should detect contradictions', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Always use this approach. However, never use this approach. But sometimes you should use it.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'logical_flow_contradiction',
          severity: 'high',
        })
      );
    });

    it('should detect circular reasoning', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'A is true because B is true. B is true because C is true. C is true because D is true. D is true because E is true. E is true because A is true.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'logical_flow_circular',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - technical complexity', () => {
    it('should detect high jargon levels', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'The algorithm uses stochastic optimization with polynomial time complexity and asymptotic analysis for the heuristic neural network parameters.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'complexity_high_jargon',
          severity: 'medium',
        })
      );
    });

    it('should detect unexplained acronyms', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Use the API with REST and JSON. The HTTP protocol supports CRUD operations via SQL.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'complexity_unexplained_acronyms',
          severity: 'low',
        })
      );
    });

    it('should detect overly complex sentences', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This extraordinarily long sentence contains numerous subordinate clauses and parenthetical expressions that make it difficult to follow the main point being conveyed, especially when combined with technical terminology and complex grammatical structures that require careful parsing to understand the intended meaning.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'complexity_long_sentences',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - reasoning transparency', () => {
    it('should detect unsupported claims', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This is definitely the best approach. It is certainly superior to all alternatives. Obviously, everyone should use this method.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'transparency_unsupported_claims',
          severity: 'high',
        })
      );
    });

    it('should detect hidden assumptions', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'To solve this problem, simply apply the formula and get the result. The solution will work in all cases.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'transparency_hidden_assumptions',
          severity: 'medium',
        })
      );
    });

    it('should detect lack of uncertainty acknowledgment', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This will always work. The results are guaranteed. There will never be any issues with this approach.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'transparency_no_uncertainty',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - completeness', () => {
    it('should detect incomplete thoughts', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'There are several factors to consider: performance, scalability, security, etc.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'completeness_incomplete_list',
          severity: 'low',
        })
      );
    });

    it('should detect unanswered questions', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'What is the best approach? How should we implement it? When should we start? These are important questions to consider.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'completeness_unanswered_questions',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - well-explained content', () => {
    it('should pass well-structured explanations', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Let me explain this concept. First, we need to understand the basics. For example, consider a simple case. Next, we can build on this foundation. Therefore, the conclusion follows logically. In summary, this approach provides clear benefits.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeGreaterThan(80);
      expect(result.flags.length).toBeLessThan(2);
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
  });

  describe('metrics and configuration', () => {
    it('should calculate explainability metrics', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This is a test explanation.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.metadata).toHaveProperty('metrics');
      expect(result.metadata.metrics).toHaveProperty('wordCount');
      expect(result.metadata.metrics).toHaveProperty('sentenceCount');
      expect(result.metadata.metrics).toHaveProperty('readabilityScore');
      expect(result.metadata.metrics).toHaveProperty('structureScore');
      expect(result.metadata.metrics).toHaveProperty('clarityScore');
    });

    it('should have custom explainability settings', () => {
      const config = agent.getConfiguration();

      expect(config.customSettings).toHaveProperty('minExplanationDepth');
      expect(config.customSettings).toHaveProperty('technicalJargonThreshold');
      expect(config.customSettings).toHaveProperty('logicalFlowThreshold');
      expect(config.customSettings).toHaveProperty('clarityScoreThreshold');
    });
  });
});