import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { DecisionTreeAgent } from '../../agents/decisionTree.agent';
import { LLMOutput } from '../../agents/base.agent';

describe('DecisionTreeAgent', () => {
  let agent: DecisionTreeAgent;

  beforeEach(() => {
    agent = new DecisionTreeAgent();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('decision_tree');
      expect(agent.name).toBe('Decision Tree');
      expect(agent.version).toBe('1.0.0');
      expect(agent.isEnabled()).toBe(true);
    });
  });

  describe('analyze - decision structure', () => {
    it('should detect missing decision criteria', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If condition A, then do X. Otherwise, do Y. But sometimes do Z.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'decision_criteria_missing',
          severity: 'high',
        })
      );
      expect(result.score).toBeLessThan(80);
    });

    it('should detect ambiguous decision paths', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If the value is high, take action A. If the value is somewhat high, maybe take action B.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'decision_path_ambiguous',
          severity: 'high',
        })
      );
    });

    it('should detect overlapping conditions', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If x > 10, do A. If x > 5, do B. If x > 15, do C.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'decision_conditions_overlap',
          severity: 'medium',
        })
      );
    });

    it('should detect incomplete decision coverage', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If status is "active", proceed. If status is "inactive", stop.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'decision_coverage_incomplete',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - logical flow', () => {
    it('should detect circular logic', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If A is true, check B. If B is true, check C. If C is true, check A.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'logic_circular',
          severity: 'high',
        })
      );
    });

    it('should detect contradictory paths', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If temperature > 100, cool down. Later: If temperature > 100, heat up.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'logic_contradiction',
          severity: 'high',
        })
      );
    });

    it('should detect unreachable branches', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If x < 0, return. If x >= 0, return. If x == 5, do something special.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'branch_unreachable',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - complexity', () => {
    it('should detect excessive nesting', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If A then if B then if C then if D then if E then do X.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'complexity_excessive_nesting',
          severity: 'medium',
        })
      );
    });

    it('should detect too many branches', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If case 1, do A. If case 2, do B. If case 3, do C. If case 4, do D. If case 5, do E. If case 6, do F. If case 7, do G. If case 8, do H. If case 9, do I. If case 10, do J.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'complexity_too_many_branches',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - outcome clarity', () => {
    it('should detect unclear outcomes', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If condition met, maybe proceed with the thing. Otherwise, possibly consider alternatives.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'outcome_unclear',
          severity: 'high',
        })
      );
    });

    it('should detect missing outcomes', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If error occurs, log it. If success, [no action specified].',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'outcome_missing',
          severity: 'high',
        })
      );
    });
  });

  describe('analyze - edge cases', () => {
    it('should detect missing edge case handling', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If input > 0, process normally. If input < 0, handle error.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'edge_case_missing',
          severity: 'medium',
        })
      );
    });

    it('should detect missing null/undefined handling', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Process the user data and extract the name field for display.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'null_handling_missing',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - well-structured decisions', () => {
    it('should pass clear decision trees', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If temperature < 0, status = "frozen". If temperature >= 0 AND temperature <= 100, status = "liquid". If temperature > 100, status = "gas".',
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
    it('should calculate decision tree metrics', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'If A then X. If B then Y. If C then Z.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.metadata).toHaveProperty('decisionMetrics');
      expect(result.metadata.decisionMetrics).toHaveProperty('branchCount');
      expect(result.metadata.decisionMetrics).toHaveProperty('maxDepth');
      expect(result.metadata.decisionMetrics).toHaveProperty('conditionCount');
      expect(result.metadata.decisionMetrics).toHaveProperty('outcomeCount');
    });

    it('should have custom decision tree settings', () => {
      const config = agent.getConfiguration();

      expect(config.customSettings).toHaveProperty('maxNestingDepth');
      expect(config.customSettings).toHaveProperty('maxBranches');
      expect(config.customSettings).toHaveProperty('requireExplicitOutcomes');
      expect(config.customSettings).toHaveProperty('requireEdgeCaseHandling');
    });
  });
});