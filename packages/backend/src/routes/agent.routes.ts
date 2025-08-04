import { Router } from 'express';
import { verifyToken, requireRole, requirePermission, UserRole } from '../middleware/auth.wrapper';
import { asyncHandler } from '../middleware/errorHandler';
import { agentRegistry } from '../agents/base.agent';
import { collections, firestore } from '../config/firebase';
import { logAuditEvent } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: List all available agents
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       version:
 *                         type: string
 *                       description:
 *                         type: string
 *                       enabled:
 *                         type: boolean
 *                       configuration:
 *                         type: object
 *                 count:
 *                   type: integer
 *                 enabledCount:
 *                   type: integer
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/',
  requirePermission('agents.read'),
  asyncHandler(async (_req, res) => {
    const agents = agentRegistry.getAll().map(agent => ({
      id: agent.id,
      name: agent.name,
      version: agent.version,
      description: agent.description,
      enabled: agent.isEnabled(),
      configuration: agent.getConfiguration(),
    }));
    
    res.json({
      agents,
      count: agents.length,
      enabledCount: agents.filter(a => a.enabled).length,
    });
  })
);

/**
 * @swagger
 * /api/agents/{agentId}:
 *   get:
 *     summary: Get specific agent details
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent ID
 *     responses:
 *       200:
 *         description: Agent details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 version:
 *                   type: string
 *                 description:
 *                   type: string
 *                 enabled:
 *                   type: boolean
 *                 configuration:
 *                   type: object
 *       404:
 *         description: Agent not found
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:agentId',
  requirePermission('agents.read'),
  asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    const agent = agentRegistry.get(agentId);
    
    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    
    res.json({
      id: agent.id,
      name: agent.name,
      version: agent.version,
      description: agent.description,
      enabled: agent.isEnabled(),
      configuration: agent.getConfiguration(),
    });
  })
);

// Update agent configuration
router.put('/:agentId/config',
  requirePermission('agents.configure'),
  asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    const { enabled, thresholds, customSettings } = req.body;
    
    const agent = agentRegistry.get(agentId);
    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    
    // Update agent configuration
    if (typeof enabled === 'boolean') {
      agent.setEnabled(enabled);
    }
    
    if (thresholds) {
      agent.updateThresholds(thresholds);
    }
    
    // Store configuration in database
    await firestore().collection('agentConfigs').doc(agentId).set({
      agentId,
      enabled: agent.isEnabled(),
      thresholds: agent.getConfiguration().thresholds,
      customSettings: customSettings || {},
      updatedBy: req.user!.uid,
      updatedAt: new Date(),
    }, { merge: true });
    
    logAuditEvent({
      action: 'agent_config_updated',
      userId: req.user!.uid,
      resourceType: 'agent',
      resourceId: agentId,
      metadata: { enabled, thresholds },
      result: 'success',
    });
    
    res.json({
      message: 'Agent configuration updated successfully',
      configuration: agent.getConfiguration(),
    });
  })
);

// Analyze text with specific agent
router.post('/:agentId/analyze',
  requirePermission('agents.read'),
  asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    const { text, metadata } = req.body;
    
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }
    
    const agent = agentRegistry.get(agentId);
    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    
    if (!agent.isEnabled()) {
      res.status(400).json({ error: 'Agent is disabled' });
      return;
    }
    
    // Create LLM output object for agent
    const llmOutput = {
      id: `manual-${Date.now()}`,
      promptId: `manual-${Date.now()}`,
      model: 'manual-input',
      modelVersion: '1.0',
      text,
      rawResponse: { text },
      timestamp: new Date(),
      metadata,
    };
    
    const result = await agent.analyze(llmOutput);
    
    // Store analysis result
    await collections.agentAnalyses.doc(result.analysisId).set({
      ...result,
      userId: req.user!.uid,
      manualAnalysis: true,
    });
    
    res.json({ result });
  })
);

/**
 * @swagger
 * /api/agents/analyze:
 *   post:
 *     summary: Analyze text with all enabled agents
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to analyze (required if llmResponseId not provided)
 *               llmResponseId:
 *                 type: string
 *                 description: ID of existing LLM response to analyze
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *     responses:
 *       200:
 *         description: Analysis results from all enabled agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AgentAnalysis'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalAgents:
 *                       type: integer
 *                     totalFlags:
 *                       type: integer
 *                     flagsBySeverity:
 *                       type: object
 *                       properties:
 *                         low:
 *                           type: integer
 *                         medium:
 *                           type: integer
 *                         high:
 *                           type: integer
 *                         critical:
 *                           type: integer
 *                     averageScore:
 *                       type: number
 *                     lowestScore:
 *                       type: number
 *                     highestScore:
 *                       type: number
 *       400:
 *         description: Bad request
 *       404:
 *         description: LLM response not found
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/analyze',
  requirePermission('agents.read'),
  asyncHandler(async (req, res) => {
    const { text, llmResponseId, metadata } = req.body;
    
    if (!text && !llmResponseId) {
      res.status(400).json({ error: 'Either text or llmResponseId is required' });
      return;
    }
    
    let llmOutput;
    
    if (llmResponseId) {
      // Fetch LLM response from database
      const llmResponseDoc = await collections.llmResponses.doc(llmResponseId).get();
      if (!llmResponseDoc.exists) {
        res.status(404).json({ error: 'LLM response not found' });
        return;
      }
      
      const llmResponse = llmResponseDoc.data();
      llmOutput = {
        id: llmResponseId,
        promptId: llmResponse!.promptId,
        model: llmResponse!.model,
        modelVersion: llmResponse!.model,
        text: llmResponse!.response,
        rawResponse: llmResponse,
        timestamp: llmResponse!.timestamp,
        metadata: { ...llmResponse!.metadata, ...metadata },
      };
    } else {
      // Manual text analysis
      llmOutput = {
        id: `manual-${Date.now()}`,
        promptId: `manual-${Date.now()}`,
        model: 'manual-input',
        modelVersion: '1.0',
        text,
        rawResponse: { text },
        timestamp: new Date(),
        metadata,
      };
    }
    
    // Run all enabled agents
    const results = await agentRegistry.analyzeWithAll(llmOutput);
    
    // Store all results
    for (const result of results) {
      await collections.agentAnalyses.doc(result.analysisId).set({
        ...result,
        userId: req.user!.uid,
        llmResponseId: llmResponseId || null,
      });
    }
    
    // Calculate summary statistics
    const summary = {
      totalAgents: results.length,
      totalFlags: results.reduce((sum, r) => sum + r.flags.length, 0),
      flagsBySeverity: {
        low: results.reduce((sum, r) => sum + r.flags.filter(f => f.severity === 'low').length, 0),
        medium: results.reduce((sum, r) => sum + r.flags.filter(f => f.severity === 'medium').length, 0),
        high: results.reduce((sum, r) => sum + r.flags.filter(f => f.severity === 'high').length, 0),
        critical: results.reduce((sum, r) => sum + r.flags.filter(f => f.severity === 'critical').length, 0),
      },
      averageScore: results.length > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length
        : 0,
      lowestScore: results.length > 0
        ? Math.min(...results.map(r => r.score))
        : 0,
      highestScore: results.length > 0
        ? Math.max(...results.map(r => r.score))
        : 0,
    };
    
    res.json({
      results,
      summary,
    });
  })
);

/**
 * @swagger
 * /api/agents/analyses:
 *   get:
 *     summary: Get agent analysis history
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of analyses to return
 *       - in: query
 *         name: agentId
 *         schema:
 *           type: string
 *         description: Filter by specific agent ID
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by flag severity
 *     responses:
 *       200:
 *         description: List of agent analyses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analyses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AgentAnalysis'
 *                 count:
 *                   type: integer
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/analyses',
  requirePermission('agents.read'),
  asyncHandler(async (req, res) => {
    const { limit = 50, agentId, severity } = req.query;
    
    let query = collections.agentAnalyses
      .where('userId', '==', req.user!.uid)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit as string));
    
    if (agentId) {
      query = query.where('agentId', '==', agentId);
    }
    
    const snapshot = await query.get();
    const analyses = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Filter by severity if specified
    let filteredAnalyses = analyses;
    if (severity) {
      filteredAnalyses = analyses.filter((analysis: any) =>
        analysis.flags.some((flag: any) => flag.severity === severity)
      );
    }
    
    res.json({
      analyses: filteredAnalyses,
      count: filteredAnalyses.length,
    });
  })
);

/**
 * @swagger
 * /api/agents/metrics:
 *   get:
 *     summary: Get agent performance metrics
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for metrics period (defaults to 7 days ago)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for metrics period (defaults to now)
 *     responses:
 *       200:
 *         description: Agent performance metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                 metrics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       agentId:
 *                         type: string
 *                       agentName:
 *                         type: string
 *                       totalAnalyses:
 *                         type: integer
 *                       totalFlags:
 *                         type: integer
 *                       flagsBySeverity:
 *                         type: object
 *                       averageScore:
 *                         type: number
 *                       averageProcessingTime:
 *                         type: number
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalAnalyses:
 *                       type: integer
 *                     totalAgents:
 *                       type: integer
 *                     averageScore:
 *                       type: number
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin or AI Risk Officer role required
 */
router.get('/metrics',
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    // Fetch all analyses in date range
    const snapshot = await collections.agentAnalyses
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .get();
    
    // Calculate metrics per agent
    const agentMetrics: Record<string, any> = {};
    
    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      const agentId = data.agentId;
      
      if (!agentMetrics[agentId]) {
        agentMetrics[agentId] = {
          agentId,
          agentName: data.agentName,
          totalAnalyses: 0,
          totalFlags: 0,
          flagsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
          averageScore: 0,
          averageProcessingTime: 0,
          scores: [],
          processingTimes: [],
        };
      }
      
      const metrics = agentMetrics[agentId];
      metrics.totalAnalyses++;
      metrics.totalFlags += data.flags.length;
      metrics.scores.push(data.score);
      metrics.processingTimes.push(data.processingTime);
      
      data.flags.forEach((flag: any) => {
        metrics.flagsBySeverity[flag.severity]++;
      });
    });
    
    // Calculate averages
    Object.values(agentMetrics).forEach((metrics: any) => {
      metrics.averageScore = metrics.scores.length > 0
        ? metrics.scores.reduce((a: number, b: number) => a + b, 0) / metrics.scores.length
        : 0;
      metrics.averageProcessingTime = metrics.processingTimes.length > 0
        ? metrics.processingTimes.reduce((a: number, b: number) => a + b, 0) / metrics.processingTimes.length
        : 0;
      
      // Remove raw arrays
      delete metrics.scores;
      delete metrics.processingTimes;
    });
    
    res.json({
      period: { startDate: start, endDate: end },
      metrics: Object.values(agentMetrics),
      summary: {
        totalAnalyses: snapshot.size,
        totalAgents: Object.keys(agentMetrics).length,
        averageScore: Object.values(agentMetrics).reduce((sum: number, m: any) => sum + m.averageScore, 0) / Object.keys(agentMetrics).length || 0,
      },
    });
  })
);

export default router;