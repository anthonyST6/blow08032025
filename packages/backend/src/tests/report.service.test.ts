import { reportService, ReportContent } from '../services/report.service';
import { promises as fs } from 'fs';
import path from 'path';

describe('Report Service Tests', () => {
  const testReportsDir = path.join(process.cwd(), 'test-reports');

  beforeAll(async () => {
    // Create test directory
    await fs.mkdir(testReportsDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test directory
    try {
      const files = await fs.readdir(testReportsDir);
      for (const file of files) {
        await fs.unlink(path.join(testReportsDir, file));
      }
      await fs.rmdir(testReportsDir);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('PDF Report Generation', () => {
    it('should generate a PDF report with all content types', async () => {
      const content: ReportContent = {
        title: 'Test PDF Report',
        subtitle: 'Comprehensive test of PDF generation',
        sections: [
          {
            heading: 'Text Section',
            content: 'This is a test paragraph to verify text rendering in PDF reports. It should wrap properly and maintain formatting.',
            type: 'text',
          },
          {
            heading: 'List Section',
            content: [
              'First list item',
              'Second list item with longer text',
              'Third item',
              'Fourth item to test multiple items',
            ],
            type: 'list',
          },
          {
            heading: 'Table Section',
            content: [
              { Name: 'John Doe', Age: 30, Department: 'Engineering' },
              { Name: 'Jane Smith', Age: 28, Department: 'Marketing' },
              { Name: 'Bob Johnson', Age: 35, Department: 'Sales' },
            ],
            type: 'table',
          },
          {
            heading: 'JSON Section',
            content: {
              status: 'success',
              data: {
                count: 100,
                average: 85.5,
              },
            },
            type: 'json',
          },
        ],
      };

      const metadata = {
        name: 'test_pdf_report',
        description: 'Test PDF report generation',
        type: 'pdf' as const,
        agent: 'Test Agent',
        useCaseId: 'test-case',
        workflowId: 'test-workflow-123',
      };

      const report = await reportService.generatePDFReport(content, metadata);

      expect(report).toBeDefined();
      expect(report.id).toBeTruthy();
      expect(report.type).toBe('pdf');
      expect(report.size).toBeGreaterThan(0);
      expect(report.downloadUrl).toContain('.pdf');

      // Verify file exists
      const fileExists = await fs.access(report.storagePath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });
  });

  describe('JSON Report Generation', () => {
    it('should generate a JSON report with complex data', async () => {
      const data = {
        summary: {
          totalRecords: 1000,
          processedRecords: 950,
          failedRecords: 50,
          successRate: 95,
        },
        details: [
          { id: 1, status: 'success', processingTime: 123 },
          { id: 2, status: 'failed', error: 'Validation error' },
          { id: 3, status: 'success', processingTime: 89 },
        ],
        metadata: {
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          version: '1.0.0',
        },
      };

      const metadata = {
        name: 'test_json_report',
        description: 'Test JSON report generation',
        type: 'json' as const,
        agent: 'Test Agent',
        useCaseId: 'test-case',
      };

      const report = await reportService.generateJSONReport(data, metadata);

      expect(report).toBeDefined();
      expect(report.type).toBe('json');
      expect(report.size).toBeGreaterThan(0);

      // Verify content
      const content = await fs.readFile(report.storagePath, 'utf8');
      const parsed = JSON.parse(content);
      expect(parsed.data.summary.totalRecords).toBe(1000);
    });
  });

  describe('Excel Report Generation', () => {
    it('should generate an Excel report with multiple sheets', async () => {
      const data = {
        'Sales Data': [
          { Month: 'January', Revenue: 50000, Units: 100 },
          { Month: 'February', Revenue: 55000, Units: 110 },
          { Month: 'March', Revenue: 60000, Units: 120 },
        ],
        'Customer Data': [
          { Name: 'Customer A', Region: 'North', TotalPurchases: 25000 },
          { Name: 'Customer B', Region: 'South', TotalPurchases: 30000 },
          { Name: 'Customer C', Region: 'East', TotalPurchases: 28000 },
        ],
      };

      const metadata = {
        name: 'test_excel_report',
        description: 'Test Excel report generation',
        type: 'xlsx' as const,
        agent: 'Test Agent',
        useCaseId: 'test-case',
      };

      const report = await reportService.generateXLSXReport(data, metadata);

      expect(report).toBeDefined();
      expect(report.type).toBe('xlsx');
      expect(report.size).toBeGreaterThan(0);
      expect(report.downloadUrl).toContain('.xlsx');
    });
  });

  describe('Text Report Generation', () => {
    it('should generate a text report from string content', async () => {
      const content = `
This is a test text report.
It contains multiple lines of text.
And should be properly formatted.

Section 1: Overview
-------------------
This section provides an overview of the report.

Section 2: Details
------------------
This section contains detailed information.
`;

      const metadata = {
        name: 'test_text_report',
        description: 'Test text report generation',
        type: 'txt' as const,
        agent: 'Test Agent',
        useCaseId: 'test-case',
      };

      const report = await reportService.generateTXTReport(content, metadata);

      expect(report).toBeDefined();
      expect(report.type).toBe('txt');
      expect(report.size).toBeGreaterThan(0);

      // Verify content
      const fileContent = await fs.readFile(report.storagePath, 'utf8');
      expect(fileContent).toContain('This is a test text report');
      expect(fileContent).toContain('Generated by: Test Agent');
    });

    it('should generate a text report from ReportContent', async () => {
      const content: ReportContent = {
        title: 'Structured Text Report',
        subtitle: 'Generated from ReportContent',
        sections: [
          {
            heading: 'Summary',
            content: 'This report was generated from structured content.',
            type: 'text',
          },
          {
            heading: 'Key Points',
            content: ['Point 1', 'Point 2', 'Point 3'],
            type: 'list',
          },
        ],
      };

      const metadata = {
        name: 'test_structured_text',
        description: 'Test structured text report',
        type: 'txt' as const,
        agent: 'Test Agent',
        useCaseId: 'test-case',
      };

      const report = await reportService.generateTXTReport(content, metadata);

      expect(report).toBeDefined();
      const fileContent = await fs.readFile(report.storagePath, 'utf8');
      expect(fileContent).toContain('STRUCTURED TEXT REPORT');
      expect(fileContent).toContain('• Point 1');
    });
  });

  describe('Report Management', () => {
    it('should list all generated reports', async () => {
      // Generate a few test reports
      await reportService.generateJSONReport(
        { test: 'data1' },
        {
          name: 'list_test_1',
          description: 'Test 1',
          type: 'json',
          agent: 'Test Agent',
          useCaseId: 'test-case',
        }
      );

      await reportService.generateTXTReport(
        'Test content',
        {
          name: 'list_test_2',
          description: 'Test 2',
          type: 'txt',
          agent: 'Test Agent',
          useCaseId: 'test-case',
        }
      );

      const reports = await reportService.listReports();
      expect(reports.length).toBeGreaterThanOrEqual(2);
      expect(reports[0].createdAt).toBeInstanceOf(Date);
    });

    it('should filter reports by type', async () => {
      const jsonReports = await reportService.listReports({ type: 'json' });
      expect(jsonReports.every(r => r.type === 'json')).toBe(true);
    });

    it('should delete a report', async () => {
      const report = await reportService.generateJSONReport(
        { test: 'delete me' },
        {
          name: 'delete_test',
          description: 'Test deletion',
          type: 'json',
          agent: 'Test Agent',
          useCaseId: 'test-case',
        }
      );

      const deleted = await reportService.deleteReport(report.id);
      expect(deleted).toBe(true);

      const foundReport = await reportService.getReport(report.id);
      expect(foundReport).toBeNull();
    });
  });
});