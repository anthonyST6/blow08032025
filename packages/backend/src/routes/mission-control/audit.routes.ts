import { Router, Request, Response } from 'express';
import { auditTrailService } from '../../services/audit-trail.service';
import { logger } from '../../utils/logger';
import { authMiddleware } from '../../middleware/auth.middleware';
import { adminOnly } from '../../middleware/rbac.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get audit trail entries
router.get('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const {
      userId,
      action,
      resource,
      startDate,
      endDate,
      result,
      limit,
    } = req.query;

    const filter: any = {};

    if (userId) filter.userId = userId as string;
    if (action) filter.action = action as string;
    if (resource) filter.resource = resource as string;
    if (result) filter.result = result as string;
    if (limit) filter.limit = parseInt(limit as string);
    
    if (startDate) {
      filter.startDate = new Date(startDate as string);
    }
    
    if (endDate) {
      filter.endDate = new Date(endDate as string);
    }

    const entries = await auditTrailService.getAuditTrail(filter);

    res.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (error) {
    logger.error('Failed to get audit trail', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audit trail',
    });
  }
});

// Get audit entry by ID
router.get('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await auditTrailService.getAuditEntryById(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Audit entry not found',
      });
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    logger.error('Failed to get audit entry', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audit entry',
    });
  }
});

// Generate audit report
router.post('/report', adminOnly, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, groupBy } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required',
      });
    }

    const report = await auditTrailService.generateAuditReport(
      new Date(startDate),
      new Date(endDate),
      groupBy || 'action'
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Failed to generate audit report', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate audit report',
    });
  }
});

// Get compliance audit trail
router.get('/compliance/trail', adminOnly, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, checkType } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required',
      });
    }

    const entries = await auditTrailService.getComplianceAuditTrail(
      new Date(startDate as string),
      new Date(endDate as string),
      checkType as string
    );

    res.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (error) {
    logger.error('Failed to get compliance audit trail', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance audit trail',
    });
  }
});

// Log a manual audit entry (for testing)
router.post('/log', adminOnly, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { action, resource, resourceId, details, result, errorMessage } = req.body;

    if (!action || !resource) {
      return res.status(400).json({
        success: false,
        error: 'Action and resource are required',
      });
    }

    await auditTrailService.logAction({
      userId: user.uid,
      userEmail: user.email,
      action,
      resource,
      resourceId,
      details,
      result: result || 'success',
      errorMessage,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Audit entry logged successfully',
    });
  } catch (error) {
    logger.error('Failed to log audit entry', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log audit entry',
    });
  }
});

// Export audit trail
router.get('/export/csv', adminOnly, async (req: Request, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      userId,
      action,
      resource,
    } = req.query;

    const filter: any = {};
    
    if (userId) filter.userId = userId as string;
    if (action) filter.action = action as string;
    if (resource) filter.resource = resource as string;
    if (startDate) filter.startDate = new Date(startDate as string);
    if (endDate) filter.endDate = new Date(endDate as string);
    
    filter.limit = 10000; // Higher limit for exports

    const entries = await auditTrailService.getAuditTrail(filter);

    // Convert to CSV
    const headers = [
      'Timestamp',
      'User ID',
      'User Email',
      'Action',
      'Resource',
      'Resource ID',
      'Result',
      'Error Message',
      'IP Address',
      'User Agent',
    ];

    const rows = entries.map(entry => [
      entry.timestamp,
      entry.userId,
      entry.userEmail,
      entry.action,
      entry.resource,
      entry.resourceId || '',
      entry.result,
      entry.errorMessage || '',
      entry.ipAddress || '',
      entry.userAgent || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-trail-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    logger.error('Failed to export audit trail', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export audit trail',
    });
  }
});

export default router;