import { Router, Request, Response } from 'express';
import { reportService, ReportContent } from '../services/report.service';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';
import { promises as fs } from 'fs';

const router = Router();

// Validation schemas
const generateReportSchema = Joi.object({
  type: Joi.string().valid('pdf', 'json', 'xlsx', 'txt').required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  agent: Joi.string().required(),
  useCaseId: Joi.string().required(),
  workflowId: Joi.string().optional(),
  content: Joi.alternatives().try(
    Joi.string(), // For TXT reports
    Joi.object({  // For PDF reports
      title: Joi.string().required(),
      subtitle: Joi.string().optional(),
      sections: Joi.array().items(
        Joi.object({
          heading: Joi.string().required(),
          content: Joi.any().required(),
          type: Joi.string().valid('text', 'table', 'list', 'json').required()
        })
      ).required(),
      metadata: Joi.object().optional(),
      data: Joi.array().optional()
    }),
    Joi.array(), // For XLSX reports
    Joi.object() // For JSON reports
  ).required()
});

// Generate a report
router.post('/generate',
  authMiddleware,
  validateRequest(generateReportSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { type, name, description, agent, useCaseId, workflowId, content } = req.body;

    const metadata = {
      name,
      description,
      type: type as 'pdf' | 'json' | 'xlsx' | 'txt',
      agent,
      useCaseId,
      workflowId
    };

    let report;
    switch (type) {
      case 'pdf':
        report = await reportService.generatePDFReport(content as ReportContent, metadata);
        break;
      case 'json':
        report = await reportService.generateJSONReport(content, metadata);
        break;
      case 'xlsx':
        report = await reportService.generateXLSXReport(content, metadata);
        break;
      case 'txt':
        report = await reportService.generateTXTReport(content, metadata);
        break;
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    return res.json({
      success: true,
      report
    });
  })
);

// List all reports
router.get('/',
  authMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const reports = await reportService.listReports();
    
    res.json({
      success: true,
      reports,
      total: reports.length
    });
  })
);

// Get a specific report
router.get('/:reportId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { reportId } = req.params;
    
    const report = await reportService.getReport(reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.json({
      success: true,
      report
    });
  })
);

// Download a report
router.get('/:reportId/download',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { reportId } = req.params;
    
    const report = await reportService.getReport(reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Set appropriate headers
    const contentType = {
      pdf: 'application/pdf',
      json: 'application/json',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain'
    }[report.type];

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${report.name}.${report.type}"`);
    res.setHeader('Content-Length', report.size);

    // Stream the file
    const fileStream = await fs.readFile(report.storagePath);
    return res.send(fileStream);
  })
);

// Delete a report
router.delete('/:reportId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { reportId } = req.params;
    
    const deleted = await reportService.deleteReport(reportId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  })
);

// Generate sample reports for testing
router.post('/generate-samples',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { useCaseId = 'oilfield-land-lease' } = req.body;

    // Sample PDF report
    const pdfContent: ReportContent = {
      title: 'Oilfield Lease Analysis Report',
      subtitle: 'Comprehensive Risk Assessment and Revenue Forecast',
      sections: [
        {
          heading: 'Executive Summary',
          content: 'This report provides a comprehensive analysis of oilfield land leases, including risk assessments, revenue forecasts, and compliance status. Our analysis covers 1,247 active leases across multiple regions.',
          type: 'text'
        },
        {
          heading: 'Key Findings',
          content: [
            '47 leases require immediate renewal (expiring within 90 days)',
            '123 leases identified as medium risk (expiring within 180 days)',
            'Projected annual revenue: $4.2 million',
            'All leases meet current regulatory compliance requirements',
            '15% increase in lease costs expected in Q3 2024'
          ],
          type: 'list'
        },
        {
          heading: 'Risk Analysis Summary',
          content: [
            { Category: 'High Risk', Count: 47, Percentage: '3.8%', Action: 'Immediate renewal required' },
            { Category: 'Medium Risk', Count: 123, Percentage: '9.9%', Action: 'Schedule renewal discussions' },
            { Category: 'Low Risk', Count: 1077, Percentage: '86.3%', Action: 'Monitor quarterly' }
          ],
          type: 'table'
        },
        {
          heading: 'Recommendations',
          content: 'Based on our analysis, we recommend prioritizing the renewal of high-risk leases immediately. The 47 leases expiring within 90 days represent critical assets that could impact operations if not renewed. Additionally, establishing a proactive renewal schedule for medium-risk leases will help prevent future urgent situations.',
          type: 'text'
        }
      ]
    };

    const pdfReport = await reportService.generatePDFReport(pdfContent, {
      name: 'Lease_Analysis_Report',
      description: 'Comprehensive analysis of oilfield land leases with risk assessment',
      type: 'pdf',
      agent: 'Document Generation Agent',
      useCaseId,
      workflowId: `workflow-${Date.now()}`
    });

    // Sample JSON report
    const jsonData = {
      summary: {
        totalLeases: 1247,
        highRisk: 47,
        mediumRisk: 123,
        lowRisk: 1077,
        projectedRevenue: 4200000,
        currency: 'USD'
      },
      riskBreakdown: [
        { leaseId: 'L-001', expiryDate: '2024-04-15', riskLevel: 'high', revenue: 85000 },
        { leaseId: 'L-002', expiryDate: '2024-05-20', riskLevel: 'high', revenue: 92000 },
        { leaseId: 'L-003', expiryDate: '2024-07-10', riskLevel: 'medium', revenue: 67000 }
      ],
      recommendations: {
        immediate: ['Renew L-001', 'Renew L-002', 'Contact lessors for high-risk leases'],
        shortTerm: ['Schedule meetings for medium-risk leases', 'Review pricing trends'],
        longTerm: ['Implement automated renewal tracking', 'Negotiate multi-year agreements']
      }
    };

    const jsonReport = await reportService.generateJSONReport(jsonData, {
      name: 'Risk_Analysis_Data',
      description: 'Detailed risk analysis data in JSON format',
      type: 'json',
      agent: 'Risk Analysis Agent',
      useCaseId,
      workflowId: `workflow-${Date.now()}`
    });

    // Sample XLSX report
    const xlsxData = [
      { LeaseID: 'L-001', Location: 'Texas', ExpiryDate: '2024-04-15', RiskLevel: 'High', MonthlyRevenue: 85000, Status: 'Active' },
      { LeaseID: 'L-002', Location: 'Oklahoma', ExpiryDate: '2024-05-20', RiskLevel: 'High', MonthlyRevenue: 92000, Status: 'Active' },
      { LeaseID: 'L-003', Location: 'New Mexico', ExpiryDate: '2024-07-10', RiskLevel: 'Medium', MonthlyRevenue: 67000, Status: 'Active' },
      { LeaseID: 'L-004', Location: 'Texas', ExpiryDate: '2025-01-15', RiskLevel: 'Low', MonthlyRevenue: 78000, Status: 'Active' },
      { LeaseID: 'L-005', Location: 'Louisiana', ExpiryDate: '2025-03-22', RiskLevel: 'Low', MonthlyRevenue: 81000, Status: 'Active' }
    ];

    const xlsxReport = await reportService.generateXLSXReport(xlsxData, {
      name: 'Lease_Portfolio_Analysis',
      description: 'Detailed lease portfolio data with risk assessments',
      type: 'xlsx',
      agent: 'Data Analysis Agent',
      useCaseId,
      workflowId: `workflow-${Date.now()}`
    });

    // Sample TXT report
    const txtContent = `
OILFIELD LEASE COMPLIANCE REPORT

Date: ${new Date().toLocaleString()}
Total Leases Analyzed: 1,247

COMPLIANCE SUMMARY:
All 1,247 leases have been reviewed for regulatory compliance. 
100% of leases meet current federal and state requirements.

KEY COMPLIANCE AREAS REVIEWED:
1. Environmental Protection Standards
   - All leases include required environmental protection clauses
   - Remediation bonds are in place for 100% of active drilling sites
   
2. Safety Regulations
   - Safety inspection records are up to date
   - Emergency response plans are documented and current
   
3. Financial Requirements
   - All required insurance policies are active
   - Financial assurance instruments are properly maintained
   
4. Reporting Obligations
   - Monthly production reports are being filed on schedule
   - Royalty payments are current with no outstanding disputes

RECOMMENDATIONS:
- Continue quarterly compliance reviews
- Update emergency response plans for Q3 2024 regulatory changes
- Schedule annual insurance policy reviews before renewal dates

NEXT REVIEW DATE: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
`;

    const txtReport = await reportService.generateTXTReport(txtContent, {
      name: 'Compliance_Status_Report',
      description: 'Regulatory compliance status for all leases',
      type: 'txt',
      agent: 'Compliance Analysis Agent',
      useCaseId,
      workflowId: `workflow-${Date.now()}`
    });

    res.json({
      success: true,
      message: 'Sample reports generated successfully',
      reports: [pdfReport, jsonReport, xlsxReport, txtReport]
    });
  })
);

export default router;