import { Router, Request, Response } from 'express';
import { vanguardActionsService } from '../services/vanguard-actions.service';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Get all vanguard actions
router.get('/actions',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const useCase = req.query.useCase as string;
    
    // If use case is provided, generate use-case specific actions
    if (useCase) {
      const actions = vanguardActionsService.generateUseCaseActions(useCase);
      logger.info(`Returning ${actions.length} actions for use case: ${useCase}`);
      res.json({
        success: true,
        actions,
        total: actions.length,
        useCase
      });
    } else {
      // Otherwise return all current actions
      const actions = vanguardActionsService.getAllActions();
      res.json({
        success: true,
        actions,
        total: actions.length
      });
    }
  })
);

// Get recent actions
router.get('/actions/recent',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const actions = vanguardActionsService.getRecentActions(limit);
    
    res.json({
      success: true,
      actions,
      total: actions.length
    });
  })
);

// Get actions by agent
router.get('/actions/by-agent/:agentName',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { agentName } = req.params;
    const actions = vanguardActionsService.getActionsByAgent(agentName);
    
    res.json({
      success: true,
      agent: agentName,
      actions,
      total: actions.length
    });
  })
);

// Get actions by system
router.get('/actions/by-system/:systemName',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { systemName } = req.params;
    const actions = vanguardActionsService.getActionsBySystem(systemName);
    
    res.json({
      success: true,
      system: systemName,
      actions,
      total: actions.length
    });
  })
);

// Log a new action
router.post('/actions/log',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const actionData = req.body;
      
      // Validate required fields
      if (!actionData || typeof actionData !== 'object') {
        res.status(400).json({
          success: false,
          error: 'Invalid action data'
        });
        return;
      }
      
      const action = await vanguardActionsService.logAction(actionData);
      
      res.json({
        success: true,
        action,
        message: 'Action logged successfully'
      });
    } catch (error: any) {
      logger.error('Failed to log action:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to log action'
      });
    }
  })
);

// Generate action receipt
router.post('/actions/:actionId/receipt',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { actionId } = req.params;
    
    try {
      const receipt = await vanguardActionsService.generateActionReceipt(actionId);
      
      res.json({
        success: true,
        receipt,
        message: 'Receipt generated successfully'
      });
    } catch (error: any) {
      logger.error(`Failed to generate receipt for action ${actionId}:`, error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to generate receipt'
      });
    }
  })
);

// Generate daily ledger
router.post('/ledger/daily',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.body;
    const ledgerDate = date ? new Date(date) : new Date();
    
    try {
      const ledger = await vanguardActionsService.generateDailyLedger(ledgerDate);
      
      res.json({
        success: true,
        ledger,
        message: 'Daily ledger generated successfully'
      });
    } catch (error: any) {
      logger.error('Failed to generate daily ledger:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate ledger'
      });
    }
  })
);

// Get proof of actions summary
router.get('/summary',
  authMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      const summary = await vanguardActionsService.generateProofOfActionsSummary();
      
      res.json({
        success: true,
        summary
      });
    } catch (error: any) {
      logger.error('Failed to generate summary:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate summary'
      });
    }
  })
);

export default router;