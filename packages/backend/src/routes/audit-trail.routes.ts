import { Router, Request, Response } from 'express';
import { auditTrailService } from '../services/audit-trail.service';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { getUseCaseAuditConfig } from '../config/use-case-audit-config';

const router = Router();

// Get general audit trail
router.get('/logs',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      userId: req.query.userId as string,
      action: req.query.action as string,
      resource: req.query.resource as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      result: req.query.result as 'success' | 'failure',
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      useCaseId: req.query.useCaseId as string,
      verticalId: req.query.verticalId as string,
      executionId: req.query.executionId as string
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const logs = await auditTrailService.getAuditTrail(filters);
    
    res.json({
      success: true,
      logs,
      total: logs.length,
      filters
    });
  })
);

// Get use case specific audit trail
router.get('/use-case/:useCaseId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { useCaseId } = req.params;
    const filters = {
      executionId: req.query.executionId as string,
      userId: req.query.userId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      result: req.query.result as 'success' | 'failure',
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const logs = await auditTrailService.getUseCaseAuditTrail(useCaseId, filters);
    
    res.json({
      success: true,
      useCaseId,
      logs,
      total: logs.length,
      filters
    });
  })
);

// Get use case audit summary
router.get('/use-case/:useCaseId/summary',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { useCaseId } = req.params;
    const dateRange = req.query.startDate && req.query.endDate ? {
      start: new Date(req.query.startDate as string),
      end: new Date(req.query.endDate as string)
    } : undefined;

    const summary = await auditTrailService.getUseCaseAuditSummary(useCaseId, dateRange);
    
    res.json({
      success: true,
      useCaseId,
      summary,
      dateRange
    });
  })
);

// Get vertical specific audit trail
router.get('/vertical/:verticalId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { verticalId } = req.params;
    const filters = {
      userId: req.query.userId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const logs = await auditTrailService.getVerticalAuditTrail(verticalId, filters);
    
    res.json({
      success: true,
      verticalId,
      logs,
      total: logs.length,
      filters
    });
  })
);

// Get audit entry by ID
router.get('/entry/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const entry = await auditTrailService.getAuditEntryById(id);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Audit entry not found'
      });
    }
    
    res.json({
      success: true,
      entry
    });
  })
);

// Generate audit report
router.post('/report',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, groupBy } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }
    
    const report = await auditTrailService.generateAuditReport(
      new Date(startDate),
      new Date(endDate),
      groupBy || 'action'
    );
    
    res.json({
      success: true,
      report
    });
  })
);

// Get compliance audit trail
router.get('/compliance',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, checkType } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }
    
    const logs = await auditTrailService.getComplianceAuditTrail(
      new Date(startDate as string),
      new Date(endDate as string),
      checkType as string
    );
    
    res.json({
      success: true,
      logs,
      total: logs.length,
      filters: { startDate, endDate, checkType }
    });
  })
);

// Get use case audit configuration
router.get('/use-case/:useCaseId/config',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { useCaseId } = req.params;
    
    const config = getUseCaseAuditConfig(useCaseId);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Use case audit configuration not found'
      });
    }
    
    res.json({
      success: true,
      useCaseId,
      config: {
        fields: config.customParticulars.fields,
        // Don't expose the extractors functions
        fieldNames: Object.keys(config.customParticulars.extractors)
      }
    });
  })
);

// Log a manual audit entry
router.post('/log',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { action, resource, result, details, metadata } = req.body;
    const userId = req.user?.uid || 'system';
    const userEmail = req.user?.email || 'system@seraphim.ai';
    
    if (!action || !resource || !result) {
      return res.status(400).json({
        success: false,
        error: 'Action, resource, and result are required'
      });
    }
    
    await auditTrailService.logAction({
      userId,
      userEmail,
      action,
      resource,
      result,
      details,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({
      success: true,
      message: 'Audit entry logged successfully'
    });
  })
);

// Log a use case audit entry
router.post('/use-case/log',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { 
      action, 
      resource, 
      result, 
      particulars,
      details,
      errorMessage 
    } = req.body;
    
    const userId = req.user?.uid || 'system';
    const userEmail = req.user?.email || 'system@seraphim.ai';
    
    if (!action || !resource || !result || !particulars || !particulars.useCaseId) {
      return res.status(400).json({
        success: false,
        error: 'Action, resource, result, and particulars with useCaseId are required'
      });
    }
    
    await auditTrailService.logUseCaseAction(
      userId,
      userEmail,
      action,
      resource,
      particulars,
      result,
      errorMessage,
      details
    );
    
    res.json({
      success: true,
      message: 'Use case audit entry logged successfully'
    });
  })
);

export default router;