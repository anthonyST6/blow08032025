import { Router, Request, Response } from 'express';
import { oilfieldReportsService } from '../services/oilfield-reports.service';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyToken } from '../middleware/auth';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const router = Router();

// Generate specific oilfield report by type
router.post('/generate/:reportType',
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { reportType } = req.params;
    
    try {
      const report = await oilfieldReportsService.generateReportByType(reportType);
      
      res.json({
        success: true,
        report,
        message: `${reportType} generated successfully`
      });
    } catch (error: any) {
      logger.error(`Failed to generate ${reportType}:`, error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to generate report'
      });
    }
  })
);

// Generate all oilfield reports
router.post('/generate-all',
  verifyToken,
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      const reports = await oilfieldReportsService.generateAllReports();
      
      res.json({
        success: true,
        reports,
        total: reports.length,
        message: 'All oilfield reports generated successfully'
      });
    } catch (error: any) {
      logger.error('Failed to generate all reports:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate reports'
      });
    }
  })
);

// Download specific report by filename
router.get('/download/:filename',
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { filename } = req.params;
    const publicReportsDir = path.join(process.cwd(), 'public', 'reports');
    const filePath = path.join(publicReportsDir, filename);
    
    try {
      // Check if file exists
      await fs.access(filePath);
      
      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      const contentType = {
        '.pdf': 'application/pdf',
        '.json': 'application/json',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.txt': 'text/plain',
        '.zip': 'application/zip'
      }[ext] || 'application/octet-stream';
      
      // Get file stats for size
      const stats = await fs.stat(filePath);
      
      // Set headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', stats.size);
      
      // Stream the file
      const fileContent = await fs.readFile(filePath);
      res.send(fileContent);
    } catch (error) {
      logger.error(`Failed to download file ${filename}:`, error);
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
  })
);

// Get available report types
router.get('/types',
  verifyToken,
  asyncHandler(async (_req: Request, res: Response) => {
    const reportTypes = [
      {
        id: 'lease-expiration-dashboard',
        name: 'Lease Expiration Dashboard',
        description: 'Comprehensive view of all leases expiring in next 365 days with risk scores',
        format: 'pdf',
        category: 'Lease Management'
      },
      {
        id: 'revenue-analysis',
        name: 'Revenue Analysis Report',
        description: 'Detailed breakdown of revenue streams by operator, location, and production',
        format: 'xlsx',
        category: 'Financial Analysis'
      },
      {
        id: 'compliance-status',
        name: 'Compliance Status Report',
        description: 'Regulatory compliance tracking across all active leases',
        format: 'pdf',
        category: 'Compliance & Regulatory'
      },
      {
        id: 'risk-assessment-matrix',
        name: 'Risk Assessment Matrix',
        description: 'Comprehensive risk analysis for all leases with mitigation strategies',
        format: 'xlsx',
        category: 'Risk Management'
      },
      {
        id: 'production-performance',
        name: 'Production Performance Report',
        description: 'Analysis of oil, gas, and water production across all active wells',
        format: 'pdf',
        category: 'Operations'
      },
      {
        id: 'executive-summary',
        name: 'Executive Summary',
        description: 'Strategic overview and key performance indicators',
        format: 'pdf',
        category: 'Executive Reports'
      },
      {
        id: 'lease-renewal-recommendations',
        name: 'Lease Renewal Recommendations',
        description: 'AI-powered recommendations for upcoming lease renewals',
        format: 'json',
        category: 'Strategic Planning'
      },
      {
        id: 'financial-projections',
        name: 'Financial Projections Model',
        description: '5-year financial projections with sensitivity analysis',
        format: 'xlsx',
        category: 'Financial Analysis'
      },
      {
        id: 'regulatory-filing-checklist',
        name: 'Regulatory Filing Checklist',
        description: 'Comprehensive tracking of all regulatory requirements',
        format: 'pdf',
        category: 'Compliance & Regulatory'
      },
      {
        id: 'operator-performance-scorecard',
        name: 'Operator Performance Scorecard',
        description: 'Comprehensive operator performance metrics and rankings',
        format: 'xlsx',
        category: 'Operations'
      }
    ];
    
    res.json({
      success: true,
      reportTypes,
      total: reportTypes.length
    });
  })
);

// Generate executive briefing (combines multiple reports)
router.post('/generate-executive-briefing',
  verifyToken,
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      // Generate key reports for executive briefing
      const [
        executiveSummary,
        revenueAnalysis,
        riskAssessment,
        complianceStatus
      ] = await Promise.all([
        oilfieldReportsService.generateExecutiveSummaryReport(),
        oilfieldReportsService.generateRevenueAnalysisReport(),
        oilfieldReportsService.generateRiskAssessmentMatrix(),
        oilfieldReportsService.generateComplianceStatusReport()
      ]);
      
      res.json({
        success: true,
        briefing: {
          executiveSummary,
          revenueAnalysis,
          riskAssessment,
          complianceStatus
        },
        message: 'Executive briefing generated successfully'
      });
    } catch (error: any) {
      logger.error('Failed to generate executive briefing:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate executive briefing'
      });
    }
  })
);

export default router;