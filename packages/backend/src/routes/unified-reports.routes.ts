import { Router, Request, Response } from 'express';
import { unifiedReportsService } from '../services/unified-reports.service';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * Get all available use cases and their reports
 */
router.get('/use-cases', async (_req: Request, res: Response) => {
  try {
    const useCaseReports = await unifiedReportsService.getAllUseCaseReports();
    res.json({
      success: true,
      data: useCaseReports
    });
  } catch (error) {
    logger.error('Failed to get use case reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve use case reports'
    });
  }
});

/**
 * Get available reports for a specific use case
 */
router.get('/use-cases/:useCaseId/reports', async (req: Request, res: Response) => {
  try {
    const { useCaseId } = req.params;
    const reports = await unifiedReportsService.getAvailableReports(useCaseId);
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    logger.error('Failed to get reports for use case:', error);
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve reports'
    });
  }
});

/**
 * Get configuration for a specific report
 */
router.get('/use-cases/:useCaseId/reports/:reportType/config', async (req: Request, res: Response) => {
  try {
    const { useCaseId, reportType } = req.params;
    const config = await unifiedReportsService.getReportConfiguration(useCaseId, reportType);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Report configuration not found'
      });
    }
    
    return res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Failed to get report configuration:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve report configuration'
    });
  }
});

/**
 * Validate report parameters
 */
router.post('/use-cases/:useCaseId/reports/:reportType/validate', async (req: Request, res: Response) => {
  try {
    const { useCaseId, reportType } = req.params;
    const { parameters } = req.body;
    
    if (!parameters) {
      return res.status(400).json({
        success: false,
        error: 'Missing parameters to validate'
      });
    }
    
    const validation = await unifiedReportsService.validateReportParameters(
      useCaseId,
      reportType,
      parameters
    );
    
    return res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('Failed to validate parameters:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to validate parameters'
    });
  }
});

/**
 * Generate a specific report
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { useCaseId, reportType, parameters } = req.body;

    if (!useCaseId || !reportType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: useCaseId and reportType'
      });
    }

    const result = await unifiedReportsService.generateReport({
      useCaseId,
      reportType,
      parameters
    });

    if (result.success) {
      return res.json({
        success: true,
        data: {
          reportId: result.reportId,
          reportUrl: result.reportUrl,
          metadata: result.metadata
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Failed to generate report:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

/**
 * Generate all reports for a use case
 */
router.post('/generate-all/:useCaseId', async (req: Request, res: Response) => {
  try {
    const { useCaseId } = req.params;
    const result = await unifiedReportsService.generateAllReportsForUseCase(useCaseId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to generate all reports:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate reports'
    });
  }
});

/**
 * Schedule a report
 */
router.post('/schedule', async (req: Request, res: Response) => {
  try {
    const { useCaseId, reportType, schedule } = req.body;

    if (!useCaseId || !reportType || !schedule) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: useCaseId, reportType, and schedule'
      });
    }

    const result = await unifiedReportsService.scheduleReport(
      useCaseId,
      reportType,
      schedule
    );

    if (result.success) {
      return res.json({
        success: true,
        data: {
          scheduleId: result.scheduleId
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Failed to schedule report:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to schedule report'
    });
  }
});

/**
 * Get report generation history
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { useCaseId, limit } = req.query;
    const history = await unifiedReportsService.getReportHistory(
      useCaseId as string,
      limit ? parseInt(limit as string) : 50
    );
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error('Failed to get report history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve report history'
    });
  }
});

/**
 * Legacy route for oilfield reports (backward compatibility)
 */
router.post('/oilfield/:reportType', async (req: Request, res: Response) => {
  try {
    const { reportType } = req.params;
    
    // Map legacy report types to new format
    const reportTypeMap: Record<string, string> = {
      'lease-expiration': 'lease-expiration-dashboard',
      'revenue-analysis': 'revenue-analysis',
      'compliance': 'compliance-status',
      'risk-assessment': 'risk-assessment-matrix',
      'production': 'production-performance',
      'executive-summary': 'executive-summary',
      'renewal-recommendations': 'lease-renewal-recommendations',
      'financial-projections': 'financial-projections',
      'regulatory-checklist': 'regulatory-filing-checklist',
      'operator-scorecard': 'operator-performance-scorecard'
    };

    const mappedReportType = reportTypeMap[reportType] || reportType;

    const result = await unifiedReportsService.generateReport({
      useCaseId: 'oilfield-land-lease',
      reportType: mappedReportType
    });

    if (result.success) {
      res.json({
        success: true,
        message: `${reportType} report generated successfully`,
        reportId: result.reportId,
        downloadUrl: result.reportUrl
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Failed to generate oilfield report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

export default router;