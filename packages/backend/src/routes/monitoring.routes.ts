import { Router, Request, Response } from 'express';
import { enhancedOrchestrationService } from '../orchestration/orchestration-enhanced.service';
import { workflowMonitor, workflowLogger } from '../orchestration/monitoring';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Get system-wide monitoring metrics
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const metrics = workflowMonitor.getSystemMetrics();
    res.json({
      success: true,
      data: {
        activeExecutions: metrics.totalActiveExecutions,
        workflowMetrics: Array.from(metrics.workflowMetrics.entries()).map(([id, metrics]) => ({
          workflowId: id,
          ...metrics,
          stepMetrics: Array.from(metrics.stepMetrics.entries()).map(([stepId, stepMetrics]) => ({
            stepId,
            ...stepMetrics
          })),
          errorFrequency: Array.from(metrics.errorFrequency.entries()).map(([error, count]) => ({
            error,
            count
          }))
        })),
        topErrors: metrics.topErrors
      }
    });
  } catch (error) {
    logger.error('Failed to get monitoring metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitoring metrics'
    });
  }
});

/**
 * Get metrics for a specific workflow
 */
router.get('/metrics/:workflowId', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const metrics = workflowMonitor.getWorkflowMetrics(workflowId);
    
    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: 'Workflow metrics not found'
      });
    }

    return res.json({
      success: true,
      data: {
        ...metrics,
        stepMetrics: Array.from(metrics.stepMetrics.entries()).map(([stepId, stepMetrics]) => ({
          stepId,
          ...stepMetrics
        })),
        errorFrequency: Array.from(metrics.errorFrequency.entries()).map(([error, count]) => ({
          error,
          count
        }))
      }
    });
  } catch (error) {
    logger.error('Failed to get workflow metrics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve workflow metrics'
    });
  }
});

/**
 * Get active workflow executions
 */
router.get('/active-executions', async (_req: Request, res: Response) => {
  try {
    const activeExecutions = workflowMonitor.getActiveExecutions();
    res.json({
      success: true,
      data: activeExecutions
    });
  } catch (error) {
    logger.error('Failed to get active executions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve active executions'
    });
  }
});

/**
 * Query workflow logs
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const {
      workflowId,
      executionId,
      useCaseId,
      level,
      startTime,
      endTime,
      limit = '100'
    } = req.query;

    const filters: any = {};
    
    if (workflowId) filters.workflowId = workflowId as string;
    if (executionId) filters.executionId = executionId as string;
    if (useCaseId) filters.useCaseId = useCaseId as string;
    if (level) filters.level = level as string;
    if (startTime) filters.startTime = new Date(startTime as string);
    if (endTime) filters.endTime = new Date(endTime as string);
    filters.limit = parseInt(limit as string, 10);

    const logs = await workflowLogger.queryLogs(filters);
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('Failed to query workflow logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve workflow logs'
    });
  }
});

/**
 * Get execution summary for a specific execution
 */
router.get('/logs/execution/:executionId/summary', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;
    const summary = await workflowLogger.getExecutionSummary(executionId);
    
    res.json({
      success: true,
      data: {
        ...summary,
        stepSummaries: Array.from(summary.stepSummaries.entries()).map(([stepId, summary]) => ({
          stepId,
          ...summary
        }))
      }
    });
  } catch (error) {
    logger.error('Failed to get execution summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve execution summary'
    });
  }
});

/**
 * Get aggregated execution metrics
 */
router.get('/execution-metrics', async (req: Request, res: Response) => {
  try {
    const { useCaseId, startDate, endDate } = req.query;
    
    const metrics = await enhancedOrchestrationService.getExecutionMetrics(
      useCaseId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get execution metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve execution metrics'
    });
  }
});

/**
 * Subscribe to real-time monitoring events
 */
router.get('/events', (req: Request, res: Response) => {
  // Set up SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Send initial connection message
  res.write('data: {"type":"connected","message":"Connected to monitoring events"}\n\n');

  // Subscribe to monitoring events
  const eventHandler = (event: any) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  workflowMonitor.on('monitoring_event', eventHandler);

  // Handle client disconnect
  req.on('close', () => {
    workflowMonitor.off('monitoring_event', eventHandler);
  });
});

/**
 * Health check for monitoring services
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const systemMetrics = workflowMonitor.getSystemMetrics();
    const activeExecutions = workflowMonitor.getActiveExecutions();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        services: {
          monitor: 'active',
          logger: 'active'
        },
        stats: {
          activeExecutions: activeExecutions.length,
          totalWorkflows: systemMetrics.workflowMetrics.size
        }
      }
    });
  } catch (error) {
    logger.error('Monitoring health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'Monitoring services unhealthy'
    });
  }
});

export default router;