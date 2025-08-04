import { api } from './api';

export interface OilfieldReport {
  id: string;
  name: string;
  size: string;
  timestamp: string;
  category: string;
  description: string;
  reportType?: string;
  format?: string;
}

export interface ReportMetadata {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'json' | 'xlsx' | 'txt';
  size: number;
  agent: string;
  useCaseId: string;
  workflowId?: string;
  createdAt: Date;
  storagePath: string;
  downloadUrl: string;
}

class OilfieldReportsService {
  private baseUrl = '/api/oilfield-reports';

  /**
   * Generate a specific report by type
   */
  async generateReport(reportType: string): Promise<ReportMetadata> {
    try {
      const response = await api.post(`${this.baseUrl}/generate/${reportType}`);
      return response.data.report;
    } catch (error) {
      console.error(`Failed to generate ${reportType}:`, error);
      throw error;
    }
  }

  /**
   * Generate all oilfield reports
   */
  async generateAllReports(): Promise<ReportMetadata[]> {
    try {
      const response = await api.post(`${this.baseUrl}/generate-all`);
      return response.data.reports;
    } catch (error) {
      console.error('Failed to generate all reports:', error);
      throw error;
    }
  }

  /**
   * Download a specific report
   */
  async downloadReport(filename: string): Promise<void> {
    try {
      const response = await api.get(`${this.baseUrl}/download/${filename}`, {
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to download ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Get available report types
   */
  async getReportTypes(): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/types`);
      return response.data.reportTypes;
    } catch (error) {
      console.error('Failed to get report types:', error);
      throw error;
    }
  }

  /**
   * Generate executive briefing
   */
  async generateExecutiveBriefing(): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/generate-executive-briefing`);
      return response.data.briefing;
    } catch (error) {
      console.error('Failed to generate executive briefing:', error);
      throw error;
    }
  }

  /**
   * Map report type to API endpoint type
   */
  getReportTypeMapping(reportId: string): string {
    const mappings: { [key: string]: string } = {
      'lease-expiration-dashboard': 'lease-expiration-dashboard',
      'revenue-analysis-2024': 'revenue-analysis',
      'compliance-status-nov': 'compliance-status',
      'risk-assessment-matrix': 'risk-assessment-matrix',
      'production-performance': 'production-performance',
      'executive-summary-portfolio': 'executive-summary',
      'lease-renewal-recommendations': 'lease-renewal-recommendations',
      'financial-projections-5yr': 'financial-projections',
      'regulatory-filing-checklist': 'regulatory-filing-checklist',
      'operator-performance-scorecard': 'operator-performance-scorecard',
      'monthly-production-summary': 'production-performance',
      'well-performance-analysis': 'production-performance',
      'decline-curve-analysis': 'production-performance',
      'reserve-estimates-2024': 'financial-projections',
      'cash-flow-projections': 'financial-projections',
      'tax-liability-summary': 'revenue-analysis',
      'royalty-payment-schedule': 'revenue-analysis',
      'environmental-compliance-audit': 'compliance-status',
      'safety-inspection-records': 'compliance-status',
      'insurance-coverage-summary': 'compliance-status'
    };

    return mappings[reportId] || reportId;
  }

  /**
   * Generate and download a report
   */
  async generateAndDownloadReport(reportId: string, reportName: string): Promise<void> {
    try {
      // Get the correct report type for the API
      const reportType = this.getReportTypeMapping(reportId);
      
      // Generate the report
      const report = await this.generateReport(reportType);
      
      // Extract filename from download URL
      const filename = report.downloadUrl.split('/').pop() || `${reportName}.pdf`;
      
      // Download the report
      await this.downloadReport(filename);
    } catch (error) {
      console.error(`Failed to generate and download report ${reportId}:`, error);
      throw error;
    }
  }
}

export const oilfieldReportsService = new OilfieldReportsService();