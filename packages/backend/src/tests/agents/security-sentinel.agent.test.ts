import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { SecuritySentinelAgent } from '../../agents/security-sentinel.agent';
import { LLMOutput } from '../../agents/base.agent';

describe('SecuritySentinelAgent', () => {
  let agent: SecuritySentinelAgent;

  beforeEach(() => {
    agent = new SecuritySentinelAgent();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('security-sentinel');
      expect(agent.name).toBe('Security Sentinel');
      expect(agent.version).toBe('1.0.0');
      expect(agent.isEnabled()).toBe(true);
    });
  });

  describe('analyze', () => {
    it('should detect SQL injection attempts', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: "'; DROP TABLE users; --",
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeLessThan(50);
      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'security_sql_injection',
          severity: 'critical',
        })
      );
    });

    it('should detect XSS attempts', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: '<script>alert("XSS")</script>',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeLessThan(50);
      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'security_script_injection',
          severity: 'critical',
        })
      );
    });

    it('should detect command injection attempts', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'rm -rf / && echo "deleted"',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeLessThan(70);
      expect(result.flags).toContainEqual(
        expect.objectContaining({
          type: 'security_command_injection',
          severity: 'high',
        })
      );
    });

    it('should detect sensitive data exposure', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'SSN: 123-45-6789, Credit Card: 4111111111111111',
        rawResponse: {},
        timestamp: new Date(),
        metadata: {},
      };

      const result = await agent.analyze(llmOutput);

      expect(result.score).toBeLessThan(70);
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.flags).toContainEqual(
        expect.objectContaining({
          severity: 'critical',
        })
      );
    });

    it('should pass safe content', async () => {
      const llmOutput: LLMOutput = {
        id: 'test-id',
        promptId: 'prompt-123',
        model: 'gpt-4',
        modelVersion: '1.0',
        text: 'This is a safe response with no security concerns.',
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

  describe('configuration', () => {
    it('should have custom security settings', () => {
      const config = agent.getConfiguration();

      expect(config.customSettings).toHaveProperty('detectInjection');
      expect(config.customSettings).toHaveProperty('detectDataLeakage');
      expect(config.customSettings).toHaveProperty('detectMaliciousCode');
      expect(config.customSettings).toHaveProperty('strictMode');
    });
  });
});