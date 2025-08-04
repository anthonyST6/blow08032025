import { Router, Request, Response } from 'express';
import { vanguardService } from '../services/vanguard.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

const router = Router();

// Execute Vanguard agents for a use case
router.post('/execute',
  authMiddleware,
  requireRole(['admin', 'risk_officer', 'compliance_reviewer']),
  asyncHandler(async (req: Request, res: Response) => {
    const { useCaseId, agentIds, input, priority, metadata } = req.body;
    const user = (req as any).user;

    if (!useCaseId || !input) {
      return res.status(400).json({
        success: false,
        error: 'Use case ID and input are required'
      });
    }

    try {
      const executionId = await vanguardService.executeAgents({
        id: uuidv4(),
        useCaseId,
        userId: user.uid,
        userEmail: user.email,
        agentIds,
        input,
        priority,
        metadata
      });

      res.json({
        success: true,
        executionId,
        message: 'Vanguard execution queued successfully'
      });
    } catch (error: any) {
      logger.error('Failed to execute Vanguard agents:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to execute Vanguard agents'
      });
    }
  })
);

// Get execution status
router.get('/execution/:executionId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { executionId } = req.params;

    const status = await vanguardService.getExecutionStatus(executionId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }

    res.json({
      success: true,
      execution: status
    });
  })
);

// Cancel execution
router.delete('/execution/:executionId',
  authMiddleware,
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { executionId } = req.params;

    const cancelled = await vanguardService.cancelExecution(executionId);
    
    if (!cancelled) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found or already completed'
      });
    }

    res.json({
      success: true,
      message: 'Execution cancelled successfully'
    });
  })
);

// Get all registered agents
router.get('/agents',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const agents = vanguardService.getRegisteredAgents();
    
    res.json({
      success: true,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        version: agent.version,
        description: agent.description,
        enabled: agent.isEnabled(),
        configuration: agent.getConfiguration()
      })),
      total: agents.length
    });
  })
);

// Get enabled agents only
router.get('/agents/enabled',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const agents = vanguardService.getEnabledAgents();
    
    res.json({
      success: true,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        version: agent.version,
        description: agent.description
      })),
      total: agents.length
    });
  })
);

// Update agent configuration
router.patch('/agents/:agentId',
  authMiddleware,
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { agentId } = req.params;
    const { enabled, thresholds } = req.body;

    const agents = vanguardService.getRegisteredAgents();
    const agent = agents.find(a => a.id === agentId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    if (typeof enabled === 'boolean') {
      agent.setEnabled(enabled);
    }

    if (thresholds) {
      agent.updateThresholds(thresholds);
    }

    res.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        enabled: agent.isEnabled(),
        configuration: agent.getConfiguration()
      }
    });
  })
);

// Test agent execution (for development/testing)
router.post('/agents/:agentId/test',
  authMiddleware,
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { agentId } = req.params;
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Test input is required'
      });
    }

    const agents = vanguardService.getRegisteredAgents();
    const agent = agents.find(a => a.id === agentId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    if (!agent.isEnabled()) {
      return res.status(400).json({
        success: false,
        error: 'Agent is disabled'
      });
    }

    try {
      const result = await agent.analyze(input);
      
      res.json({
        success: true,
        result
      });
    } catch (error: any) {
      logger.error(`Test execution failed for agent ${agentId}:`, error);
      res.status(500).json({
        success: false,
        error: error.message || 'Test execution failed'
      });
    }
  })
);

export default router;