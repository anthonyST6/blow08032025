import { Router, Request, Response } from 'express';
import { enhancedOrchestrationService } from '../orchestration/orchestration-enhanced.service';
import { workflowRegistry } from '../orchestration/workflow-registry';
import { serviceRegistry } from '../orchestration/service-registry';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Get all workflows
router.get('/workflows', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { industry, criticality, tags } = req.query;
    
    let workflows = workflowRegistry.getAllWorkflows();
    
    // Filter by industry if provided
    if (industry && typeof industry === 'string') {
      workflows = workflows.filter(w => w.industry === industry);
    }
    
    // Filter by criticality if provided
    if (criticality && typeof criticality === 'string') {
      workflows = workflows.filter(w => w.metadata.criticality === criticality);
    }
    
    // Filter by tags if provided
    if (tags && typeof tags === 'string') {
      const tagList = tags.split(',');
      workflows = workflows.filter(w => 
        tagList.some(tag => w.metadata.tags.includes(tag))
      );
    }
    
    return res.json({
      success: true,
      data: workflows,
      count: workflows.length
    });
  } catch (error) {
    logger.error('Failed to get workflows', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve workflows'
    });
  }
});

// Get workflow by use case ID
router.get('/workflows/:useCaseId', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { useCaseId } = req.params;
    const workflow = workflowRegistry.getWorkflow(useCaseId);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
    
    return res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    logger.error('Failed to get workflow', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve workflow'
    });
  }
});

// Execute workflow
router.post('/workflows/:useCaseId/execute', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { useCaseId } = req.params;
    const { input = {}, metadata = {} } = req.body;
    
    // Check if workflow exists
    if (!workflowRegistry.hasWorkflow(useCaseId)) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
    
    // Start execution asynchronously
    const executionPromise = enhancedOrchestrationService.executeUseCaseWorkflow(
      useCaseId,
      input,
      {
        ...metadata,
        triggeredBy: req.user?.uid || 'system',
        triggeredAt: new Date().toISOString()
      }
    );
    
    // Return execution ID immediately
    executionPromise.then(execution => {
      logger.info('Workflow execution completed', {
        executionId: execution.id,
        useCaseId,
        status: execution.status
      });
    }).catch(error => {
      logger.error('Workflow execution failed', {
        useCaseId,
        error
      });
    });
    
    // Get the execution ID from the promise
    const execution = await Promise.race([
      executionPromise,
      new Promise<any>((resolve) => setTimeout(() => resolve({ id: 'pending' }), 100))
    ]);
    
    return res.json({
      success: true,
      message: 'Workflow execution started',
      executionId: execution.id
    });
  } catch (error) {
    logger.error('Failed to execute workflow', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to execute workflow'
    });
  }
});

// Get workflow executions
router.get('/executions', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { useCaseId, status, limit = '100' } = req.query;
    
    let executions;
    if (useCaseId && typeof useCaseId === 'string') {
      executions = await enhancedOrchestrationService.getExecutionsByUseCase(
        useCaseId,
        parseInt(limit as string)
      );
    } else {
      // Get all active executions
      executions = enhancedOrchestrationService.getActiveExecutions();
    }
    
    // Filter by status if provided
    if (status && typeof status === 'string') {
      executions = executions.filter(e => e.status === status);
    }
    
    return res.json({
      success: true,
      data: executions,
      count: executions.length
    });
  } catch (error) {
    logger.error('Failed to get executions', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve executions'
    });
  }
});

// Get execution by ID
router.get('/executions/:executionId', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { executionId } = req.params;
    const execution = await enhancedOrchestrationService.getExecution(executionId);
    
    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }
    
    return res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    logger.error('Failed to get execution', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve execution'
    });
  }
});

// Cancel execution
router.post('/executions/:executionId/cancel', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { executionId } = req.params;
    const cancelled = await enhancedOrchestrationService.cancelExecution(executionId);
    
    if (!cancelled) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found or already completed'
      });
    }
    
    return res.json({
      success: true,
      message: 'Execution cancelled successfully'
    });
  } catch (error) {
    logger.error('Failed to cancel execution', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel execution'
    });
  }
});

// Get workflow statistics
router.get('/statistics', authMiddleware, async (_req: Request, res: Response): Promise<Response> => {
  try {
    const workflowStats = workflowRegistry.getStatistics();
    const serviceStats = serviceRegistry.getStatistics();
    
    return res.json({
      success: true,
      data: {
        workflows: workflowStats,
        services: serviceStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get statistics', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

// Get execution metrics
router.get('/metrics', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { useCaseId, startDate, endDate } = req.query;
    
    const metrics = await enhancedOrchestrationService.getExecutionMetrics(
      useCaseId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    return res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get metrics', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics'
    });
  }
});

// Health check
router.get('/health', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const workflowCount = workflowRegistry.getAllWorkflows().length;
    const serviceCount = serviceRegistry.getAllServices().length;
    const activeExecutions = enhancedOrchestrationService.getActiveExecutions().length;
    
    return res.json({
      success: true,
      data: {
        status: 'healthy',
        workflows: workflowCount,
        services: serviceCount,
        activeExecutions,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    return res.status(503).json({
      success: false,
      error: 'Service unhealthy'
    });
  }
});

export default router;