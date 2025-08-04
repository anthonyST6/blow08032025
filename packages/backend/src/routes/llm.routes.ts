import { Router } from 'express';
import { verifyToken, requireRole, requirePermission, UserRole } from '../middleware/auth.wrapper';
import { validateRequest, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { llmSchemas } from '../schemas/llm.schemas';
import { llmService } from '../services/llm.service';
import { agentRegistry } from '../agents/base.agent';
import { logAuditEvent } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /api/llm/models:
 *   get:
 *     summary: List available LLM models
 *     tags: [LLM]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of LLM model configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 models:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       provider:
 *                         type: string
 *                         enum: [openai, anthropic, azure]
 *                       model:
 *                         type: string
 *                       enabled:
 *                         type: boolean
 *                       maxTokens:
 *                         type: integer
 *                       temperature:
 *                         type: number
 *                 count:
 *                   type: integer
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/models',
  requirePermission('llm.read'),
  asyncHandler(async (req, res) => {
    const organizationId = req.user!.organizationId;
    const models = await llmService.listLLMConfigs(organizationId);
    
    res.json({
      models,
      count: models.length,
    });
  })
);

/**
 * @swagger
 * /api/llm/models/{modelId}:
 *   get:
 *     summary: Get specific LLM model configuration
 *     tags: [LLM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The model ID
 *     responses:
 *       200:
 *         description: Model configuration details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 model:
 *                   type: object
 *       404:
 *         description: Model not found
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/models/:modelId',
  requirePermission('llm.read'),
  asyncHandler(async (req, res) => {
    const { modelId } = req.params;
    const model = await llmService.getLLMConfig(modelId);
    
    res.json({ model });
  })
);

// Create new LLM model configuration (admin only)
router.post('/models',
  requireRole([UserRole.ADMIN]),
  validateRequest(llmSchemas.createModel),
  asyncHandler(async (req, res) => {
    const model = await llmService.createLLMConfig(req.body);
    
    logAuditEvent({
      action: 'llm_model_created',
      userId: req.user!.uid,
      resourceType: 'llm_model',
      resourceId: model.id,
      metadata: { provider: model.provider, model: model.model },
      result: 'success',
    });
    
    res.status(201).json({ model });
  })
);

// Update LLM model configuration (admin only)
router.put('/models/:modelId',
  requireRole([UserRole.ADMIN]),
  validateRequest(llmSchemas.updateModel),
  asyncHandler(async (req, res) => {
    const { modelId } = req.params;
    await llmService.updateLLMConfig(modelId, req.body);
    
    logAuditEvent({
      action: 'llm_model_updated',
      userId: req.user!.uid,
      resourceType: 'llm_model',
      resourceId: modelId,
      metadata: { updates: Object.keys(req.body) },
      result: 'success',
    });
    
    res.json({ message: 'Model configuration updated successfully' });
  })
);

// Delete LLM model configuration (admin only)
router.delete('/models/:modelId',
  requireRole([UserRole.ADMIN]),
  asyncHandler(async (req, res) => {
    const { modelId } = req.params;
    await llmService.deleteLLMConfig(modelId);
    
    logAuditEvent({
      action: 'llm_model_deleted',
      userId: req.user!.uid,
      resourceType: 'llm_model',
      resourceId: modelId,
      result: 'success',
    });
    
    res.json({ message: 'Model configuration deleted successfully' });
  })
);

/**
 * @swagger
 * /api/llm/analyze:
 *   post:
 *     summary: Send prompt to LLM and analyze with agents
 *     tags: [LLM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - modelId
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to send to the LLM
 *               modelId:
 *                 type: string
 *                 description: The ID of the LLM model to use
 *               workflowId:
 *                 type: string
 *                 description: Optional workflow ID
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *               runAgents:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to run Vanguard agents on the response
 *     responses:
 *       200:
 *         description: Analysis results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 llmResponse:
 *                   $ref: '#/components/schemas/LLMResponse'
 *                 agentResults:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AgentAnalysis'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalFlags:
 *                       type: integer
 *                     criticalFlags:
 *                       type: integer
 *                     averageScore:
 *                       type: number
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/analyze',
  requirePermission('llm.read'),
  validateRequest(llmSchemas.analyzePrompt),
  asyncHandler(async (req, res) => {
    const { prompt, modelId, workflowId, metadata, runAgents = true } = req.body;
    const userId = req.user!.uid;
    
    // Send prompt to LLM
    const llmResponse = await llmService.sendPrompt({
      prompt,
      modelId,
      userId,
      workflowId,
      metadata,
    });
    
    let agentResults: any[] = [];
    
    // Run Vanguard agents if requested
    if (runAgents) {
      const llmOutput = {
        id: llmResponse.id,
        promptId: llmResponse.promptId,
        model: llmResponse.model,
        modelVersion: llmResponse.model,
        text: llmResponse.response,
        rawResponse: llmResponse,
        timestamp: llmResponse.timestamp,
        metadata,
      };
      
      agentResults = await agentRegistry.analyzeWithAll(llmOutput);
      
      // Store agent results
      for (const result of agentResults) {
        await req.app.locals.firestore
          .collection('agentAnalyses')
          .doc(result.analysisId)
          .set({
            ...result,
            llmResponseId: llmResponse.id,
            userId,
          });
      }
    }
    
    logAuditEvent({
      action: 'llm_prompt_analyzed',
      userId,
      resourceType: 'llm_response',
      resourceId: llmResponse.id,
      metadata: {
        modelId,
        promptLength: prompt.length,
        responseLength: llmResponse.response.length,
        agentsRun: runAgents,
        agentCount: agentResults.length,
      },
      result: 'success',
    });
    
    res.json({
      llmResponse,
      agentResults,
      summary: {
        totalFlags: agentResults.reduce((sum, r) => sum + r.flags.length, 0),
        criticalFlags: agentResults.reduce((sum, r) => 
          sum + r.flags.filter((f: any) => f.severity === 'critical').length, 0
        ),
        averageScore: agentResults.length > 0
          ? agentResults.reduce((sum, r) => sum + r.score, 0) / agentResults.length
          : null,
      },
    });
  })
);

/**
 * @swagger
 * /api/llm/history:
 *   get:
 *     summary: Get prompt history for current user
 *     tags: [LLM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: Prompt history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/history',
  requirePermission('llm.read'),
  validateQuery(llmSchemas.getHistory),
  asyncHandler(async (req, res) => {
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user!.uid;
    
    const history = await llmService.getPromptHistory(
      userId, 
      parseInt(limit as string)
    );
    
    res.json({
      history,
      count: history.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  })
);

// Get model usage statistics (admin or risk officer)
router.get('/models/:modelId/stats',
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateQuery(llmSchemas.getStats),
  asyncHandler(async (req, res) => {
    const { modelId } = req.params;
    const { startDate, endDate } = req.query;
    
    const stats = await llmService.getModelUsageStats(
      modelId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    res.json({ stats });
  })
);

// Test LLM connection (admin only)
router.post('/models/:modelId/test',
  requireRole([UserRole.ADMIN]),
  asyncHandler(async (req, res) => {
    const { modelId } = req.params;
    const testPrompt = 'Hello, this is a test message. Please respond with "Test successful".';
    
    try {
      const response = await llmService.sendPrompt({
        prompt: testPrompt,
        modelId,
        userId: req.user!.uid,
        metadata: { test: true },
      });
      
      res.json({
        success: true,
        response: response.response,
        latency: response.latency,
      });
    } catch (error: any) {
      res.json({
        success: false,
        error: error.message,
      });
    }
  })
);

export default router;