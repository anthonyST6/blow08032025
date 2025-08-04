import { Router, Response } from 'express';
import { sessionPersistenceService } from '../services/session-persistence.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Save or update a session
 * POST /api/sessions
 */
router.post(
  '/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const metadata = {
        userAgent: req.headers['user-agent'] as string,
        ipAddress: req.ip,
        deviceId: req.headers['x-device-id'] as string
      };

      const session = await sessionPersistenceService.saveSession(
        userId,
        req.body,
        metadata
      );

      res.json({
        success: true,
        session: {
          sessionId: session.sessionId,
          selectedVertical: session.selectedVertical,
          selectedUseCase: session.selectedUseCase,
          currentStep: session.currentStep,
          expiresAt: session.expiresAt
        }
      });
    } catch (error) {
      logger.error('Failed to save session', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to save session' });
    }
  }
);

/**
 * Get a specific session
 * GET /api/sessions/:sessionId
 */
router.get(
  '/:sessionId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const session = await sessionPersistenceService.getSession(
        userId,
        req.params.sessionId
      );

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({ success: true, session });
    } catch (error) {
      logger.error('Failed to get session', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to get session' });
    }
  }
);

/**
 * Get all sessions for the current user
 * GET /api/sessions
 */
router.get(
  '/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const sessions = await sessionPersistenceService.getUserSessions(userId, {
        includeExpired: req.query.includeExpired === 'true',
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      });

      res.json({ success: true, sessions });
    } catch (error) {
      logger.error('Failed to get user sessions', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to get user sessions' });
    }
  }
);

/**
 * Clear a specific session
 * DELETE /api/sessions/:sessionId
 */
router.delete(
  '/:sessionId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const cleared = await sessionPersistenceService.clearSession(
        userId,
        req.params.sessionId
      );

      if (!cleared) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({ success: true, message: 'Session cleared' });
    } catch (error) {
      logger.error('Failed to clear session', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to clear session' });
    }
  }
);

/**
 * Clear all sessions for the current user
 * DELETE /api/sessions
 */
router.delete(
  '/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const clearedCount = await sessionPersistenceService.clearUserSessions(userId);

      res.json({ 
        success: true, 
        message: `Cleared ${clearedCount} sessions` 
      });
    } catch (error) {
      logger.error('Failed to clear user sessions', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to clear user sessions' });
    }
  }
);

/**
 * Extend session expiration
 * PUT /api/sessions/:sessionId/extend
 */
router.put(
  '/:sessionId/extend',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const extended = await sessionPersistenceService.extendSession(
        userId,
        req.params.sessionId,
        req.body.hours
      );

      if (!extended) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({ success: true, message: 'Session extended' });
    } catch (error) {
      logger.error('Failed to extend session', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to extend session' });
    }
  }
);

/**
 * Add execution record to session
 * POST /api/sessions/:sessionId/executions
 */
router.post(
  '/:sessionId/executions',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Basic validation
      const { id, useCaseId, timestamp, status } = req.body;
      if (!id || !useCaseId || !timestamp || !status) {
        return res.status(400).json({ 
          error: 'Missing required fields: id, useCaseId, timestamp, status' 
        });
      }

      const validStatuses = ['pending', 'running', 'completed', 'failed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }

      const added = await sessionPersistenceService.addExecutionRecord(
        userId,
        req.params.sessionId,
        req.body
      );

      if (!added) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({ success: true, message: 'Execution record added' });
    } catch (error) {
      logger.error('Failed to add execution record', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to add execution record' });
    }
  }
);

/**
 * Get session statistics
 * GET /api/sessions/stats/overview
 */
router.get(
  '/stats/overview',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const stats = await sessionPersistenceService.getSessionStats(userId);

      res.json({ success: true, stats });
    } catch (error) {
      logger.error('Failed to get session stats', { error, userId: req.user?.uid });
      res.status(500).json({ error: 'Failed to get session stats' });
    }
  }
);

/**
 * Health check endpoint
 * GET /api/sessions/health/check
 */
router.get(
  '/health/check',
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const health = await sessionPersistenceService.healthCheck();
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 206 : 503;
      
      res.status(statusCode).json(health);
    } catch (error) {
      logger.error('Health check failed', { error });
      res.status(503).json({ 
        status: 'unhealthy', 
        error: 'Health check failed' 
      });
    }
  }
);

export default router;