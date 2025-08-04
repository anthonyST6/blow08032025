import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { LLMService } from '../../services/llm.service';
import { LLMProvider } from '../../types';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('openai');
jest.mock('@anthropic-ai/sdk');

describe('LLMService', () => {
  let llmService: LLMService;

  beforeEach(() => {
    llmService = new LLMService();
    jest.clearAllMocks();
  });

  describe('generateResponse', () => {
    it('should generate response using OpenAI', async () => {
      const prompt = 'Test prompt';
      const mockResponse = 'Test response from OpenAI';

      const mockCompletion = {
        choices: [
          {
            message: {
              content: mockResponse,
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      };

      const mockCreate = jest.fn(() => Promise.resolve(mockCompletion));
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      } as any));

      const result = await llmService.generateResponse(
        prompt,
        LLMProvider.OPENAI,
        'gpt-4'
      );

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      expect(result).toEqual({
        response: mockResponse,
        provider: LLMProvider.OPENAI,
        model: 'gpt-4',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      });
    });

    it('should generate response using Anthropic', async () => {
      const prompt = 'Test prompt';
      const mockResponse = 'Test response from Anthropic';

      const mockCompletion = {
        content: [
          {
            text: mockResponse,
          },
        ],
        usage: {
          input_tokens: 15,
          output_tokens: 25,
        },
      };

      const mockCreate = jest.fn(() => Promise.resolve(mockCompletion));
      (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(() => ({
        messages: {
          create: mockCreate,
        },
      } as any));

      const result = await llmService.generateResponse(
        prompt,
        LLMProvider.ANTHROPIC,
        'claude-3-opus-20240229'
      );

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      });

      expect(result).toEqual({
        response: mockResponse,
        provider: LLMProvider.ANTHROPIC,
        model: 'claude-3-opus-20240229',
        usage: {
          promptTokens: 15,
          completionTokens: 25,
          totalTokens: 40,
        },
      });
    });

    it('should handle errors gracefully', async () => {
      const prompt = 'Test prompt';
      const error = new Error('API Error');

      const mockCreate = jest.fn(() => Promise.reject(error));
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      } as any));

      await expect(
        llmService.generateResponse(prompt, LLMProvider.OPENAI, 'gpt-4')
      ).rejects.toThrow('API Error');
    });
  });

  describe('validateResponse', () => {
    it('should validate response format', () => {
      const validResponse = {
        response: 'Test response',
        provider: LLMProvider.OPENAI,
        model: 'gpt-4',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      };

      expect(llmService.validateResponse(validResponse)).toBe(true);
    });

    it('should reject invalid response format', () => {
      const invalidResponse = {
        response: 'Test response',
        // Missing required fields
      };

      expect(llmService.validateResponse(invalidResponse)).toBe(false);
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost for OpenAI GPT-4', () => {
      const usage = {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      };

      const cost = llmService.calculateCost(
        usage,
        LLMProvider.OPENAI,
        'gpt-4'
      );

      // GPT-4 pricing: $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens
      expect(cost).toBeCloseTo(0.06, 2); // (1000/1000 * 0.03) + (500/1000 * 0.06)
    });

    it('should calculate cost for Anthropic Claude', () => {
      const usage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      };

      const cost = llmService.calculateCost(
        usage,
        LLMProvider.ANTHROPIC,
        'claude-3-opus-20240229'
      );

      // Claude Opus pricing: $0.015 per 1K prompt tokens, $0.075 per 1K completion tokens
      expect(cost).toBeCloseTo(0.105, 2); // (2000/1000 * 0.015) + (1000/1000 * 0.075)
    });
  });
});