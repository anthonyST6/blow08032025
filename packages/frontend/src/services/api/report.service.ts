import { api } from '../api';

export interface ReportMetadata {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'json' | 'xlsx' | 'txt';
  agent: string;
  useCaseId: string;
  workflowId?: string;
  createdAt: Date;
  size: number;
  storagePath: string;
}

export interface ReportContent {
  title: string;
  subtitle?: string;
  sections: ReportSection[];
  metadata?: Record<string, any>;
  data?: any[];
}

export interface ReportSection {
  heading: string;
  content: any;
  type: 'text' | 'table' | 'list' | 'json';
}

export interface GenerateReportRequest {
  type: 'pdf' | 'json' | 'xlsx' | 'txt';
  name: string;
  description: string;
  agent: string;
  useCaseId: string;
  workflowId?: string;
  content: ReportContent | string | any[] | any;
}

class ReportService {
  /**
   * Generate a new report
   */
  async generateReport(request: GenerateReportRequest): Promise<ReportMetadata> {
    const response = await api.post('/reports/generate', request);
    return response.data.report;
  }

  /**
   * List all reports
   */
  async listReports(): Promise<ReportMetadata[]> {
    const response = await api.get('/reports');
    return response.data.reports;
  }

  /**
   * Get a specific report
   */
  async getReport(reportId: string): Promise<ReportMetadata> {
    const response = await api.get(`/reports/${reportId}`);
    return response.data.report;
  }

  /**
   * Download a report
   */
  async downloadReport(reportId: string, filename?: string): Promise<void> {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });

    // Get filename from response headers or use provided one
    const contentDisposition = response.headers['content-disposition'];
    let finalFilename = filename;
    
    if (!finalFilename && contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        finalFilename = filenameMatch[1];
      }
    }
    
    if (!finalFilename) {
      const report = await this.getReport(reportId);
      finalFilename = `${report.name}.${report.type}`;
    }

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', finalFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<void> {
    await api.delete(`/reports/${reportId}`);
  }

  /**
   * Generate sample reports for testing
   */
  async generateSampleReports(useCaseId: string = 'oilfield-land-lease'): Promise<ReportMetadata[]> {
    const response = await api.post('/reports/generate-samples', { useCaseId });
    return response.data.reports;
  }

  /**
   * Generate a PDF report
   */
  async generatePDFReport(
    content: ReportContent,
    metadata: Omit<GenerateReportRequest, 'type' | 'content'>
  ): Promise<ReportMetadata> {
    return this.generateReport({
      ...metadata,
      type: 'pdf',
      content
    });
  }

  /**
   * Generate a JSON report
   */
  async generateJSONReport(
    data: any,
    metadata: Omit<GenerateReportRequest, 'type' | 'content'>
  ): Promise<ReportMetadata> {
    return this.generateReport({
      ...metadata,
      type: 'json',
      content: data
    });
  }

  /**
   * Generate an Excel report
   */
  async generateExcelReport(
    data: any[],
    metadata: Omit<GenerateReportRequest, 'type' | 'content'>
  ): Promise<ReportMetadata> {
    return this.generateReport({
      ...metadata,
      type: 'xlsx',
      content: data
    });
  }

  /**
   * Generate a text report
   */
  async generateTextReport(
    content: string,
    metadata: Omit<GenerateReportRequest, 'type' | 'content'>
  ): Promise<ReportMetadata> {
    return this.generateReport({
      ...metadata,
      type: 'txt',
      content
    });
  }

  /**
   * Build report content for common report types
   */
  buildReportContent(
    title: string,
    sections: Array<{
      heading: string;
      content: any;
      type?: 'text' | 'table' | 'list' | 'json';
    }>,
    subtitle?: string,
    metadata?: Record<string, any>
  ): ReportContent {
    return {
      title,
      subtitle,
      sections: sections.map(section => ({
        heading: section.heading,
        content: section.content,
        type: section.type || 'text'
      })),
      metadata
    };
  }

  /**
   * Format data for table display
   */
  formatTableData(data: any[], columns?: string[]): any[] {
    if (!data || data.length === 0) return [];
    
    const keys = columns || Object.keys(data[0]);
    return data.map(row => {
      const formattedRow: any = {};
      keys.forEach(key => {
        formattedRow[key] = row[key];
      });
      return formattedRow;
    });
  }

  /**
   * Get report type icon
   */
  getReportTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      pdf: '📄',
      json: '{ }',
      xlsx: '📊',
      txt: '📝'
    };
    return icons[type] || '📄';
  }

  /**
   * Get report type color
   */
  getReportTypeColor(type: string): string {
    const colors: Record<string, string> = {
      pdf: 'text-red-500',
      json: 'text-green-500',
      xlsx: 'text-blue-500',
      txt: 'text-gray-500'
    };
    return colors[type] || 'text-gray-500';
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const reportService = new ReportService();