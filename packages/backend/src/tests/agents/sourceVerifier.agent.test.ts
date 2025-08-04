import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { SourceVerifierAgent } from '../../agents/sourceVerifier.agent';
import { LLMOutput } from '../../agents/base.agent';

describe('SourceVerifierAgent', () => {
  let agent: SourceVerifierAgent;

  beforeEach(() => {
    agent = new SourceVerifierAgent();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('source_verifier');
      expect(agent.name).toBe('Source Verifier');
      expect(agent.version).toBe('1.0.0');
      expect(agent.isEnabled()).toBe(true);
    });
  });

  describe('analyze - citations', () => {
    it('should detect missing citations for factual claims', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Studies show that 90% of people prefer this product. Research indicates significant improvements. Experts say this is the best approach.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'citation_missing',
          severity: 'high',
        })
      );
      expect(result.score).toBeLessThan(80);
    });

    it('should detect insufficient citations', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Multiple studies confirm this. Research shows that. Data indicates. Evidence suggests. Statistics prove. (Smith, 2023)',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'citation_insufficient',
          severity: 'medium',
        })
      );
    });

    it('should detect inconsistent citation formats', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'First claim (Smith, 2023). Second claim [1]. Third claim: https://example.com',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'citation_format_inconsistent',
          severity: 'low',
        })
      );
    });

    it('should detect broken citation patterns', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This is a fact (Smith, 2023. Another fact [1',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'citation_format_broken',
          severity: 'low',
        })
      );
    });
  });

  describe('analyze - factual claims', () => {
    it('should detect unsourced factual claims', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'The population of Earth is 8 billion. Water boils at 100 degrees Celsius. The speed of light is 299,792,458 meters per second.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'factual_claims_unsourced',
          severity: 'high',
        })
      );
    });

    it('should detect questionable claims', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Everyone knows this is true. It is common knowledge that this works. All experts agree on this point.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'factual_claims_questionable',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - source quality', () => {
    it('should detect low-quality sources', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'According to this blog post: https://random-blog.medium.com and this Reddit thread: https://reddit.com/r/random',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'source_quality_low',
          severity: 'high',
        })
      );
    });

    it('should detect mixed source quality', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Source 1: https://scholar.google.com, Source 2: https://facebook.com/post/123',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'source_quality_mixed',
          severity: 'medium',
        })
      );
    });

    it('should detect Wikipedia over-reliance', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'See: https://en.wikipedia.org/wiki/Topic1, https://en.wikipedia.org/wiki/Topic2, https://en.wikipedia.org/wiki/Topic3',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'source_quality_wikipedia_reliance',
          severity: 'low',
        })
      );
    });
  });

  describe('analyze - URLs', () => {
    it('should detect malformed URLs', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Check this link: https:// or this one: https://example',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'url_malformed',
          severity: 'low',
        })
      );
    });

    it('should detect shortened URLs', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Click here: https://bit.ly/abc123 or here: https://tinyurl.com/xyz789',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'url_shortened',
          severity: 'medium',
        })
      );
    });

    it('should detect tracking parameters', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Visit: https://example.com?utm_source=email&utm_campaign=test',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'url_tracking_params',
          severity: 'low',
        })
      );
    });
  });

  describe('analyze - unsupported claims', () => {
    it('should detect strong unsupported claims', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This has been proven beyond doubt. It is an established fact that this is true. Scientific consensus confirms this.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'claims_unsupported_strong',
          severity: 'high',
        })
      );
    });

    it('should detect weasel words', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Some people say this is true. Many experts believe this. It is widely accepted that this works.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'claims_weasel_words',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - properly sourced content', () => {
    it('should pass well-sourced content', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'According to Smith et al. (2023), the results show improvement. This is supported by data from the NIH (https://nih.gov/study/123).',
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
    it('should calculate source metrics', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Fact 1 (Source, 2023). Fact 2: https://example.com',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.metadata).toHaveProperty('sourceMetrics');
      expect(result.metadata.sourceMetrics).toHaveProperty('citationCount');
      expect(result.metadata.sourceMetrics).toHaveProperty('urlCount');
      expect(result.metadata.sourceMetrics).toHaveProperty('factualClaimCount');
      expect(result.metadata.sourceMetrics).toHaveProperty('citationDensity');
    });

    it('should have custom source verification settings', () => {
      const config = agent.getConfiguration();

      expect(config.customSettings).toHaveProperty('requireCitations');
      expect(config.customSettings).toHaveProperty('minSourceQuality');
      expect(config.customSettings).toHaveProperty('factCheckingThreshold');
      expect(config.customSettings).toHaveProperty('urlValidation');
    });
  });
});