import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { collections } from '../config/firebase';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';

// LLM Provider Types
export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  AZURE_OPENAI = 'azure_openai',
}

export interface LLMConfig {
  id: string;
  name: string;
  provider: LLMProvider;
  model: string;
  apiKey: string;
  endpoint?: string; // For Azure OpenAI
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMRequest {
  prompt: string;
  modelId: string;
  userId: string;
  workflowId?: string;
  metadata?: Record<string, any>;
}

export interface LLMResponse {
  id: string;
  promptId: string;
  modelId: string;
  provider: LLMProvider;
  model: string;
  response: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency: number;
  timestamp: Date;
}

export class LLMService {
  private openaiClients: Map<string, OpenAI> = new Map();
  private anthropicClients: Map<string, Anthropic> = new Map();

  // Initialize LLM client based on config
  private getClient(config: LLMConfig): OpenAI | Anthropic {
    switch (config.provider) {
      case LLMProvider.OPENAI:
        if (!this.openaiClients.has(config.id)) {
          this.openaiClients.set(config.id, new OpenAI({
            apiKey: config.apiKey,
          }));
        }
        return this.openaiClients.get(config.id)!;

      case LLMProvider.ANTHROPIC:
        if (!this.anthropicClients.has(config.id)) {
          this.anthropicClients.set(config.id, new Anthropic({
            apiKey: config.apiKey,
          }));
        }
        return this.anthropicClients.get(config.id)!;

      case LLMProvider.AZURE_OPENAI:
        if (!this.openaiClients.has(config.id)) {
          this.openaiClients.set(config.id, new OpenAI({
            apiKey: config.apiKey,
            baseURL: `${config.endpoint}/openai/deployments/${config.model}`,
            defaultQuery: { 'api-version': '2024-02-15-preview' },
            defaultHeaders: { 'api-key': config.apiKey },
          }));
        }
        return this.openaiClients.get(config.id)!;

      default:
        throw new ApiError(400, `Unsupported LLM provider: ${config.provider}`);
    }
  }

  // Get LLM configuration
  async getLLMConfig(modelId: string): Promise<LLMConfig> {
    const doc = await collections.llmConfigs.doc(modelId).get();
    
    if (!doc.exists) {
      throw new ApiError(404, 'LLM configuration not found');
    }

    return { id: doc.id, ...doc.data() } as LLMConfig;
  }

  // List all LLM configurations
  async listLLMConfigs(organizationId?: string): Promise<LLMConfig[]> {
    let query = collections.llmConfigs.where('isActive', '==', true);
    
    if (organizationId) {
      query = query.where('organizationId', '==', organizationId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LLMConfig));
  }

  // Create new LLM configuration
  async createLLMConfig(config: Omit<LLMConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<LLMConfig> {
    const id = uuidv4();
    const now = new Date();
    
    const llmConfig: LLMConfig = {
      ...config,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await collections.llmConfigs.doc(id).set(llmConfig);
    
    logger.info('LLM configuration created', { modelId: id, provider: config.provider });
    
    return llmConfig;
  }

  // Update LLM configuration
  async updateLLMConfig(modelId: string, updates: Partial<LLMConfig>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    await collections.llmConfigs.doc(modelId).update(updateData);
    
    // Clear cached client if exists
    this.openaiClients.delete(modelId);
    this.anthropicClients.delete(modelId);
    
    logger.info('LLM configuration updated', { modelId });
  }

  // Delete LLM configuration (soft delete)
  async deleteLLMConfig(modelId: string): Promise<void> {
    await this.updateLLMConfig(modelId, { isActive: false });
  }

  // Send prompt to LLM
  async sendPrompt(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    
    // Get LLM configuration
    const config = await this.getLLMConfig(request.modelId);
    
    if (!config.isActive) {
      throw new ApiError(400, 'LLM model is not active');
    }

    // Create prompt record
    const promptId = uuidv4();
    const promptData = {
      id: promptId,
      userId: request.userId,
      modelId: request.modelId,
      workflowId: request.workflowId,
      prompt: request.prompt,
      metadata: request.metadata,
      timestamp: new Date(),
    };
    
    await collections.prompts.doc(promptId).set(promptData);

    try {
      // Get appropriate client
      const client = this.getClient(config);
      let response: string;
      let usage: any;

      // Send request based on provider
      if (config.provider === LLMProvider.OPENAI || config.provider === LLMProvider.AZURE_OPENAI) {
        const openaiClient = client as OpenAI;
        const completion = await openaiClient.chat.completions.create({
          model: config.model,
          messages: [
            ...(config.systemPrompt ? [{ role: 'system' as const, content: config.systemPrompt }] : []),
            { role: 'user' as const, content: request.prompt },
          ],
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens ?? 1000,
          top_p: config.topP ?? 1,
          frequency_penalty: config.frequencyPenalty ?? 0,
          presence_penalty: config.presencePenalty ?? 0,
        });

        response = completion.choices[0]?.message?.content || '';
        usage = completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        } : undefined;

      } else if (config.provider === LLMProvider.ANTHROPIC) {
        const anthropicClient = client as Anthropic;
        const completion = await anthropicClient.messages.create({
          model: config.model,
          messages: [{ role: 'user', content: request.prompt }],
          system: config.systemPrompt,
          max_tokens: config.maxTokens ?? 1000,
          temperature: config.temperature ?? 0.7,
          top_p: config.topP ?? 1,
        });

        response = completion.content[0].type === 'text' ? completion.content[0].text : '';
        usage = completion.usage ? {
          promptTokens: completion.usage.input_tokens,
          completionTokens: completion.usage.output_tokens,
          totalTokens: completion.usage.input_tokens + completion.usage.output_tokens,
        } : undefined;

      } else {
        throw new ApiError(400, `Unsupported provider: ${config.provider}`);
      }

      const latency = Date.now() - startTime;

      // Create response record
      const llmResponse: LLMResponse = {
        id: uuidv4(),
        promptId,
        modelId: config.id,
        provider: config.provider,
        model: config.model,
        response,
        usage,
        latency,
        timestamp: new Date(),
      };

      await collections.llmResponses.doc(llmResponse.id).set(llmResponse);

      logger.info('LLM request completed', {
        promptId,
        modelId: config.id,
        latency,
        tokens: usage?.totalTokens,
      });

      return llmResponse;

    } catch (error: any) {
      logger.error('LLM request failed', {
        promptId,
        modelId: config.id,
        error: error.message,
      });

      // Record failed response
      await collections.llmResponses.doc(uuidv4()).set({
        promptId,
        modelId: config.id,
        provider: config.provider,
        model: config.model,
        error: error.message,
        latency: Date.now() - startTime,
        timestamp: new Date(),
      });

      throw new ApiError(500, `LLM request failed: ${error.message}`);
    }
  }

  // Get prompt history
  async getPromptHistory(userId: string, limit = 50): Promise<any[]> {
    const snapshot = await collections.prompts
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const prompts = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const promptData = { id: doc.id, ...doc.data() };
        
        // Get associated response
        const responseSnapshot = await collections.llmResponses
          .where('promptId', '==', doc.id)
          .limit(1)
          .get();

        const response = responseSnapshot.empty 
          ? null 
          : { id: responseSnapshot.docs[0].id, ...responseSnapshot.docs[0].data() };

        return {
          ...promptData,
          response,
        };
      })
    );

    return prompts;
  }

  // Get model usage statistics
  async getModelUsageStats(modelId: string, startDate: Date, endDate: Date): Promise<any> {
    const snapshot = await collections.llmResponses
      .where('modelId', '==', modelId)
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .get();

    let totalRequests = 0;
    let totalTokens = 0;
    let totalLatency = 0;
    let errors = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      totalRequests++;
      
      if (data.error) {
        errors++;
      } else {
        totalTokens += data.usage?.totalTokens || 0;
        totalLatency += data.latency || 0;
      }
    });

    return {
      modelId,
      period: { startDate, endDate },
      totalRequests,
      successfulRequests: totalRequests - errors,
      errors,
      totalTokens,
      averageLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
      successRate: totalRequests > 0 ? ((totalRequests - errors) / totalRequests) * 100 : 0,
    };
  }

  // Generate response (simplified method for testing compatibility)
  async generateResponse(
    prompt: string,
    provider: LLMProvider,
    model: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<{
    response: string;
    provider: LLMProvider;
    model: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    // For testing, use environment variables directly
    const apiKey = provider === LLMProvider.OPENAI
      ? process.env.OPENAI_API_KEY
      : process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new ApiError(400, `API key not configured for ${provider}`);
    }

    // const startTime = Date.now();

    if (provider === LLMProvider.OPENAI) {
      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
      });

      return {
        response: completion.choices[0]?.message?.content || '',
        provider,
        model,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        } : undefined,
      };
    } else if (provider === LLMProvider.ANTHROPIC) {
      const client = new Anthropic({ apiKey });
      const completion = await client.messages.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens ?? 1000,
      });

      const text = completion.content[0]?.text || '';
      return {
        response: text,
        provider,
        model,
        usage: completion.usage ? {
          promptTokens: completion.usage.input_tokens,
          completionTokens: completion.usage.output_tokens,
          totalTokens: completion.usage.input_tokens + completion.usage.output_tokens,
        } : undefined,
      };
    }

    throw new ApiError(400, `Unsupported provider: ${provider}`);
  }

  // Validate response format
  validateResponse(response: any): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const requiredFields = ['response', 'provider', 'model'];
    for (const field of requiredFields) {
      if (!(field in response)) {
        return false;
      }
    }

    if (response.usage) {
      const usageFields = ['promptTokens', 'completionTokens', 'totalTokens'];
      for (const field of usageFields) {
        if (!(field in response.usage)) {
          return false;
        }
      }
    }

    return true;
  }

  // Calculate cost based on token usage
  calculateCost(
    usage: { promptTokens: number; completionTokens: number; totalTokens: number },
    provider: LLMProvider,
    model: string
  ): number {
    // Pricing per 1K tokens (simplified for testing)
    const pricing: Record<string, { prompt: number; completion: number }> = {
      'openai:gpt-4': { prompt: 0.03, completion: 0.06 },
      'openai:gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
      'anthropic:claude-3-opus-20240229': { prompt: 0.015, completion: 0.075 },
      'anthropic:claude-3-sonnet-20240229': { prompt: 0.003, completion: 0.015 },
    };

    const key = `${provider}:${model}`;
    const rates = pricing[key] || { prompt: 0.01, completion: 0.02 };

    const promptCost = (usage.promptTokens / 1000) * rates.prompt;
    const completionCost = (usage.completionTokens / 1000) * rates.completion;

    // Use more precise rounding to avoid floating point issues
    return Math.round((promptCost + completionCost) * 1000) / 1000;
  }
}

export const llmService = new LLMService();