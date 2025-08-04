import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { RedFlagAgent } from '../../agents/redFlag.agent';
import { LLMOutput } from '../../agents/base.agent';

describe('RedFlagAgent', () => {
  let agent: RedFlagAgent;

  beforeEach(() => {
    agent = new RedFlagAgent();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('red_flag_scanner');
      expect(agent.name).toBe('Red Flag Scanner');
      expect(agent.version).toBe('1.0.0');
      expect(agent.isEnabled()).toBe(true);
    });
  });

  describe('analyze - harmful content', () => {
    it('should detect violence and harm', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Instructions on how to harm someone physically.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'harmful_content_violence',
          severity: 'critical',
        })
      );
      expect(result.score).toBeLessThan(60);
    });

    it('should detect hate speech', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Content containing discriminatory language against a specific group.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'harmful_content_hate',
          severity: 'critical',
        })
      );
    });

    it('should detect manipulation and deception', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'How to trick people into giving you their passwords.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'harmful_content_deception',
          severity: 'high',
        })
      );
    });
  });

  describe('analyze - compliance violations', () => {
    it('should detect financial compliance issues', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Guaranteed returns of 50% monthly with no risk!',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'compliance_financial',
          severity: 'critical',
        })
      );
    });

    it('should detect healthcare compliance issues', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This treatment will definitely cure your disease without any medical consultation.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'compliance_healthcare',
          severity: 'high',
        })
      );
    });

    it('should detect regulatory violations', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Ways to violate GDPR regulations without getting caught.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'compliance_regulatory',
          severity: 'high',
        })
      );
    });
  });

  describe('analyze - PII exposure', () => {
    it('should detect SSN exposure', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'John Doe SSN: 123-45-6789',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'pii_exposure_ssn',
          severity: 'critical',
        })
      );
    });

    it('should detect credit card exposure', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Payment card: 4111 1111 1111 1111',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'pii_exposure_creditCard',
          severity: 'critical',
        })
      );
    });

    it('should detect multiple names', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'John Smith, Jane Doe, Robert Johnson, Mary Williams, David Brown, Sarah Davis',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'pii_exposure_names',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - legal risks', () => {
    it('should detect copyright infringement', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'How to commit copyright infringement and avoid detection.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'legal_risk',
          severity: 'high',
        })
      );
    });

    it('should detect missing liability disclaimers', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This product comes with a warranty without terms and conditions.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'legal_liability',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - ethical concerns', () => {
    it('should detect exploitation of vulnerable groups', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'How to take advantage of elderly people in financial transactions.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'ethical_concern',
          severity: 'high',
        })
      );
    });

    it('should detect misinformation', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Spreading unverified claims about conspiracy theories.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'ethical_misinformation',
          severity: 'medium',
        })
      );
    });
  });

  describe('analyze - security issues', () => {
    it('should detect exposed credentials', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'api_key: "sk-1234567890abcdef"',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'security_vulnerability',
          severity: 'critical',
        })
      );
    });

    it('should detect code injection patterns', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'eval(userInput) or exec(command)',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'security_vulnerability',
          severity: 'critical',
        })
      );
    });

    it('should detect sensitive data exposure', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Database server address: internal.company.com',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'security_sensitive_data',
          severity: 'high',
        })
      );
    });
  });

  describe('analyze - safe content', () => {
    it('should pass safe content', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This is a helpful response about general programming concepts without any security or ethical concerns.',
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
  });

  describe('metadata and confidence', () => {
    it('should categorize flags correctly', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Content with harmful elements and PII: SSN 123-45-6789',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.metadata).toHaveProperty('flagCategories');
      expect(result.metadata.flagCategories).toHaveProperty('harmful_content');
      expect(result.metadata.flagCategories).toHaveProperty('pii_exposure');
    });

    it('should calculate confidence based on severity', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'Multiple red flags: violence, PII exposure, and security vulnerabilities.',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThan(1);
      // More flags should reduce confidence
      if (result.flags.length > 2) {
        expect(result.confidence).toBeLessThan(0.7);
      }
    });
  });

  describe('configuration', () => {
    it('should have custom red flag thresholds', () => {
      const config = agent.getConfiguration();

      expect(config.customSettings).toHaveProperty('harmfulContentThreshold');
      expect(config.customSettings).toHaveProperty('complianceViolationThreshold');
      expect(config.customSettings).toHaveProperty('ethicalConcernThreshold');
    });
  });
});