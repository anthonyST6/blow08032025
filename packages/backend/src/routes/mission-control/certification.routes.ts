import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { certificationService } from '../../services/certification.service';

const router = Router();

// Get certification scores for a resource
router.get('/scores/:resourceId', asyncHandler(async (req: Request, res: Response) => {
  const { resourceId } = req.params;
  
  // For now, return mock scores since we need to implement score retrieval
  const scores = {
    security: 92,
    integrity: 88,
    accuracy: 95,
    overall: 91,
    trend: 'stable',
    lastUpdated: new Date(),
  };

  res.json(scores);
}));

// Calculate certification scores
router.post('/scores/:resourceId/calculate', asyncHandler(async (req: Request, res: Response) => {
  const { resourceId } = req.params;
  const { metrics } = req.body;

  if (!metrics) {
    return res.status(400).json({ error: 'Metrics are required' });
  }

  const scores = await certificationService.calculateScores(resourceId, metrics);
  res.json(scores);
}));

// Get certification issues
router.get('/issues', asyncHandler(async (req: Request, res: Response) => {
  const { 
    resourceId, 
    category, 
    severity, 
    status = 'open',
    page = '1',
    limit = '20'
  } = req.query;

  // Mock response for now
  const issues = {
    data: [
      {
        id: '1',
        category: 'security',
        severity: 'high',
        title: 'Unauthorized access detected',
        description: 'Multiple failed login attempts from unknown IP',
        detectedAt: new Date(),
        detectedBy: 'security-vanguard',
        status: 'open',
        autoFixAvailable: true,
        affectedResources: [resourceId as string],
      }
    ],
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total: 1,
    }
  };

  res.json(issues);
}));

// Create certification issue
router.post('/issues', asyncHandler(async (req: Request, res: Response) => {
  const issueData = req.body;

  if (!issueData.category || !issueData.severity || !issueData.title) {
    return res.status(400).json({ 
      error: 'Category, severity, and title are required' 
    });
  }

  const issue = await certificationService.createIssue({
    ...issueData,
    detectedAt: new Date(),
    detectedBy: (req as any).user?.id || 'manual',
    status: 'open',
    manualReviewRequired: issueData.severity === 'critical',
    affectedResources: issueData.affectedResources || [],
    recommendations: issueData.recommendations || [],
  });

  res.status(201).json(issue);
}));

// Get auto-fixes
router.get('/autofixes', asyncHandler(async (req: Request, res: Response) => {
  const { issueId, status } = req.query;

  // Mock response
  const autoFixes = {
    data: [
      {
        id: '1',
        issueId: issueId as string,
        category: 'security',
        fixType: 'permission',
        description: 'Update access permissions',
        riskLevel: 'medium',
        requiresApproval: true,
        status: status || 'pending',
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
    }
  };

  res.json(autoFixes);
}));

// Approve auto-fix
router.post('/autofixes/:id/approve', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id || 'system';

  await certificationService.approveAutoFix(id, userId);
  
  res.json({ 
    success: true, 
    message: 'Auto-fix approved and execution started' 
  });
}));

// Reject auto-fix
router.post('/autofixes/:id/reject', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = (req as any).user?.id || 'system';

  if (!reason) {
    return res.status(400).json({ error: 'Rejection reason is required' });
  }

  await certificationService.rejectAutoFix(id, userId, reason);
  
  res.json({ 
    success: true, 
    message: 'Auto-fix rejected' 
  });
}));

// Generate certification report
router.post('/reports/generate', asyncHandler(async (req: Request, res: Response) => {
  const { leaseId, reportType = 'ad_hoc' } = req.body;

  if (!leaseId) {
    return res.status(400).json({ error: 'Lease ID is required' });
  }

  const report = await certificationService.generateReport(leaseId, reportType);
  res.json(report);
}));

// Get certification reports
router.get('/reports', asyncHandler(async (req: Request, res: Response) => {
  const { leaseId, reportType, startDate, endDate } = req.query;

  // Mock response
  const reports = {
    data: [
      {
        id: '1',
        leaseId: leaseId as string,
        reportDate: new Date(),
        reportType: reportType || 'weekly',
        scores: {
          security: 92,
          integrity: 88,
          accuracy: 95,
          overall: 91,
          trend: 'improving',
          lastUpdated: new Date(),
        },
        issuesSummary: {
          total: 5,
          bySeverity: { critical: 0, high: 1, medium: 2, low: 2 },
          byCategory: { security: 2, integrity: 1, accuracy: 2 },
          resolved: 3,
          autoFixed: 2,
        },
        complianceStatus: {
          compliant: true,
          violations: [],
        },
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
    }
  };

  res.json(reports);
}));

// Get certification thresholds
router.get('/thresholds', asyncHandler(async (req: Request, res: Response) => {
  // Mock response
  const thresholds = [
    {
      category: 'security',
      minScore: 85,
      action: 'alert',
      notificationChannels: ['email', 'teams'],
      recipients: ['security-team@company.com'],
    },
    {
      category: 'integrity',
      minScore: 85,
      action: 'auto_fix',
      notificationChannels: ['email'],
      recipients: ['data-team@company.com'],
    },
    {
      category: 'accuracy',
      minScore: 90,
      action: 'escalate',
      notificationChannels: ['email', 'teams', 'sms'],
      recipients: ['compliance-team@company.com'],
    },
  ];

  res.json(thresholds);
}));

// Update certification threshold
router.put('/thresholds/:category', asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const threshold = req.body;

  if (!threshold.minScore || !threshold.action) {
    return res.status(400).json({ 
      error: 'Minimum score and action are required' 
    });
  }

  // Mock response
  res.json({
    ...threshold,
    category,
    updatedAt: new Date(),
  });
}));

// Real-time certification status
router.get('/status/:resourceId', asyncHandler(async (req: Request, res: Response) => {
  const { resourceId } = req.params;

  // Mock real-time status
  const status = {
    resourceId,
    scores: {
      security: 92,
      integrity: 88,
      accuracy: 95,
      overall: 91,
    },
    activeIssues: 2,
    pendingAutoFixes: 1,
    lastChecked: new Date(),
    nextScheduledCheck: new Date(Date.now() + 3600000), // 1 hour from now
    alerts: [
      {
        type: 'threshold',
        category: 'integrity',
        message: 'Integrity score approaching threshold',
        severity: 'warning',
        timestamp: new Date(),
      }
    ],
  };

  res.json(status);
}));

export const certificationRoutes = router;