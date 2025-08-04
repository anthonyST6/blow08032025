import Joi from 'joi';
import { commonValidations } from '../middleware/validation';

export const llmSchemas = {
  createModel: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    provider: Joi.string().valid('openai', 'anthropic', 'azure_openai').required(),
    model: Joi.string().required(),
    apiKey: Joi.string().required(),
    endpoint: Joi.string().uri().when('provider', {
      is: 'azure_openai',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    temperature: Joi.number().min(0).max(2).optional(),
    maxTokens: Joi.number().integer().min(1).max(32000).optional(),
    topP: Joi.number().min(0).max(1).optional(),
    frequencyPenalty: Joi.number().min(-2).max(2).optional(),
    presencePenalty: Joi.number().min(-2).max(2).optional(),
    systemPrompt: Joi.string().max(4000).optional(),
    organizationId: Joi.string().uuid().optional(),
    isActive: Joi.boolean().default(true),
  }),

  updateModel: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    apiKey: Joi.string().optional(),
    endpoint: Joi.string().uri().optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    maxTokens: Joi.number().integer().min(1).max(32000).optional(),
    topP: Joi.number().min(0).max(1).optional(),
    frequencyPenalty: Joi.number().min(-2).max(2).optional(),
    presencePenalty: Joi.number().min(-2).max(2).optional(),
    systemPrompt: Joi.string().max(4000).optional(),
    isActive: Joi.boolean().optional(),
  }).min(1), // At least one field must be provided

  analyzePrompt: Joi.object({
    prompt: Joi.string().min(1).max(32000).required(),
    modelId: commonValidations.uuid.required(),
    workflowId: commonValidations.uuid.optional(),
    metadata: Joi.object().optional(),
    runAgents: Joi.boolean().default(true),
  }),

  getHistory: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    startDate: commonValidations.date.optional(),
    endDate: commonValidations.date.optional(),
    modelId: commonValidations.uuid.optional(),
    workflowId: commonValidations.uuid.optional(),
  }),

  getStats: Joi.object({
    startDate: commonValidations.date.required(),
    endDate: commonValidations.date.required(),
  }),
};