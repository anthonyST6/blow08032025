import { Router, Request, Response } from 'express';
import { deploymentService } from '../services/deployment.service';
import { logger } from '../utils/logger';

const router = Router();

// Simple auth check middleware (replace with proper auth when available)
const requireAuth = (req: Request, res: Response, next: Function) => {
  // For now, just check if there's an authorization header
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply auth middleware to all deployment routes
router.use(requireAuth);

// Start deployment
router.post('/start', async (req: Request, res: Response) => {
  try {
    const config = {
      environment: req.body.environment || 'development',
      version: req.body.version || '1.0.0',
      rollbackEnabled: req.body.rollbackEnabled !== false,
      healthCheckInterval: req.body.healthCheckInterval || 5000,
      maxRetries: req.body.maxRetries || 3,
    };
    
    const deploymentId = await deploymentService.startDeployment(config);
    
    res.json({
      success: true,
      deploymentId,
      message: 'Deployment started successfully',
    });
  } catch (error) {
    logger.error('Failed to start deployment', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start deployment',
    });
  }
});

// Get deployment status
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = deploymentService.getDeploymentStatus();
    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    logger.error('Failed to get deployment status', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get deployment status',
    });
  }
});

// Rollback deployment
router.post('/rollback/:deploymentId', async (req: Request, res: Response) => {
  try {
    const { deploymentId } = req.params;
    await deploymentService.rollbackDeployment(deploymentId);
    
    res.json({
      success: true,
      message: 'Deployment rolled back successfully',
    });
  } catch (error) {
    logger.error('Failed to rollback deployment', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to rollback deployment',
    });
  }
});

// Get health checks
router.get('/health', (req: Request, res: Response) => {
  try {
    const healthChecks = deploymentService.getHealthChecks();
    res.json({
      success: true,
      healthChecks,
    });
  } catch (error) {
    logger.error('Failed to get health checks', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get health checks',
    });
  }
});

// Perform health check for specific service
router.post('/health/:service', async (req: Request, res: Response) => {
  try {
    const { service } = req.params;
    const result = await deploymentService.performHealthCheck(service);
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Failed to perform health check', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform health check',
    });
  }
});

// Get dependencies
router.get('/dependencies', (req: Request, res: Response) => {
  try {
    const dependencies = deploymentService.getDependencies();
    res.json({
      success: true,
      dependencies,
    });
  } catch (error) {
    logger.error('Failed to get dependencies', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dependencies',
    });
  }
});

// Validate dependency
router.post('/dependencies/validate', async (req: Request, res: Response) => {
  try {
    const { name, version } = req.body;
    const isValid = await deploymentService.validateDependency(name, version);
    
    res.json({
      success: true,
      isValid,
    });
  } catch (error) {
    logger.error('Failed to validate dependency', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate dependency',
    });
  }
});

// Get security protocols
router.get('/security', (req: Request, res: Response) => {
  try {
    const protocols = deploymentService.getSecurityProtocols();
    res.json({
      success: true,
      protocols,
    });
  } catch (error) {
    logger.error('Failed to get security protocols', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security protocols',
    });
  }
});

// Get performance metrics
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const metrics = deploymentService.getPerformanceMetrics();
    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    logger.error('Failed to get performance metrics', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics',
    });
  }
});

// WebSocket endpoint for real-time updates
router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial connection message
  res.write('data: {"type":"connected"}\n\n');
  
  // Set up event listeners
  const stageUpdateHandler = (stage: any) => {
    res.write(`data: ${JSON.stringify({ type: 'stageUpdate', stage })}\n\n`);
  };
  
  const healthUpdateHandler = (health: any) => {
    res.write(`data: ${JSON.stringify({ type: 'healthUpdate', health })}\n\n`);
  };
  
  const deploymentCompletedHandler = (data: any) => {
    res.write(`data: ${JSON.stringify({ type: 'deploymentCompleted', ...data })}\n\n`);
  };
  
  const deploymentFailedHandler = (data: any) => {
    res.write(`data: ${JSON.stringify({ type: 'deploymentFailed', ...data })}\n\n`);
  };
  
  // Register event listeners
  deploymentService.on('stageUpdate', stageUpdateHandler);
  deploymentService.on('healthUpdate', healthUpdateHandler);
  deploymentService.on('deploymentCompleted', deploymentCompletedHandler);
  deploymentService.on('deploymentFailed', deploymentFailedHandler);
  
  // Clean up on client disconnect
  req.on('close', () => {
    deploymentService.off('stageUpdate', stageUpdateHandler);
    deploymentService.off('healthUpdate', healthUpdateHandler);
    deploymentService.off('deploymentCompleted', deploymentCompletedHandler);
    deploymentService.off('deploymentFailed', deploymentFailedHandler);
  });
});

export default router;