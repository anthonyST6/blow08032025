import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

export interface ReportContent {
  title: string;
  subtitle?: string;
  sections: ReportSection[];
  metadata?: Record<string, any>;
  data?: any[];
}

export interface ReportSection {
  heading: string;
  content: string | any[];
  type: 'text' | 'table' | 'list' | 'json';
}

export interface GenerateReportRequest {
  type: 'pdf' | 'json' | 'xlsx' | 'txt';
  name: string;
  description: string;
  agent: string;
  useCaseId: string;
  workflowId?: string;
  content: string | ReportContent | any[] | any;
}

class ReportService {
  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.getIdToken();
  }

  private async getAuthHeaders() {
    const token = await this.getAuthToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generate a new report
   */
  async generateReport(request: GenerateReportRequest): Promise<ReportMetadata> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/reports/generate`,
        request,
        { headers }
      );
      return response.data.report;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  /**
   * List all reports with optional filters
   */
  async listReports(filters?: {
    useCaseId?: string;
    agent?: string;
    type?: string;
  }): Promise<ReportMetadata[]> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      
      if (filters?.useCaseId) params.append('useCaseId', filters.useCaseId);
      if (filters?.agent) params.append('agent', filters.agent);
      if (filters?.type) params.append('type', filters.type);

      const response = await axios.get(
        `${API_BASE_URL}/reports?${params.toString()}`,
        { headers }
      );
      
      return response.data.reports.map((report: any) => ({
        ...report,
        createdAt: new Date(report.createdAt),
      }));
    } catch (error) {
      console.error('Failed to list reports:', error);
      throw error;
    }
  }

  /**
   * Get a specific report by ID
   */
  async getReport(reportId: string): Promise<ReportMetadata> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/reports/${reportId}`,
        { headers }
      );
      
      const report = response.data.report;
      return {
        ...report,
        createdAt: new Date(report.createdAt),
      };
    } catch (error) {
      console.error('Failed to get report:', error);
      throw error;
    }
  }

  /**
   * Download a report
   */
  async downloadReport(reportId: string, reportName: string, reportType: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/reports/${reportId}/download`,
        {
          headers,
          responseType: 'blob',
        }
      );

      // Create a download link
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportName}.${reportType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
      throw error;
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.delete(
        `${API_BASE_URL}/reports/${reportId}`,
        { headers }
      );
    } catch (error) {
      console.error('Failed to delete report:', error);
      throw error;
    }
  }

  /**
   * Generate sample reports for testing
   */
  async generateSampleReports(useCaseId: string = 'oilfield-land-lease'): Promise<ReportMetadata[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/reports/generate-samples`,
        { useCaseId },
        { headers }
      );
      
      return response.data.reports.map((report: any) => ({
        ...report,
        createdAt: new Date(report.createdAt),
      }));
    } catch (error) {
      console.error('Failed to generate sample reports:', error);
      throw error;
    }
  }

  /**
   * Generate a report from workflow output
   */
  async generateReportFromOutput(output: any, type: 'pdf' | 'json' | 'xlsx' | 'txt'): Promise<ReportMetadata> {
    let content: any;
    
    switch (type) {
      case 'pdf':
        // Format content for PDF
        content = {
          title: output.name || 'Workflow Output Report',
          subtitle: output.description,
          sections: this.formatOutputForPDF(output),
        };
        break;
      
      case 'json':
        // Use raw output for JSON
        content = output.content || output;
        break;
      
      case 'xlsx':
        // Format as array for Excel
        if (Array.isArray(output.content)) {
          content = output.content;
        } else if (typeof output.content === 'object') {
          content = [output.content];
        } else {
          // Parse if it's a string
          try {
            const parsed = JSON.parse(output.content);
            content = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            content = [{ data: output.content }];
          }
        }
        break;
      
      case 'txt':
        // Format as text
        if (typeof output.content === 'string') {
          content = output.content;
        } else {
          content = {
            title: output.name || 'Workflow Output',
            sections: [{
              heading: 'Output Data',
              content: JSON.stringify(output.content, null, 2),
              type: 'text' as const,
            }],
          };
        }
        break;
    }

    const request: GenerateReportRequest = {
      type,
      name: output.name || 'workflow_output',
      description: output.description || 'Generated from workflow output',
      agent: output.agent || 'Workflow Agent',
      useCaseId: output.useCaseId || 'default',
      workflowId: output.workflowId,
      content,
    };

    return this.generateReport(request);
  }

  /**
   * Format output data for PDF report
   */
  private formatOutputForPDF(output: any): ReportSection[] {
    const sections: ReportSection[] = [];

    // Add summary section if available
    if (output.summary) {
      sections.push({
        heading: 'Summary',
        content: output.summary,
        type: 'text',
      });
    }

    // Add main content
    if (output.content) {
      if (typeof output.content === 'string') {
        sections.push({
          heading: 'Content',
          content: output.content,
          type: 'text',
        });
      } else if (Array.isArray(output.content)) {
        sections.push({
          heading: 'Data',
          content: output.content,
          type: 'table',
        });
      } else if (typeof output.content === 'object') {
        // Convert object to readable format
        const items = Object.entries(output.content).map(
          ([key, value]) => `${key}: ${JSON.stringify(value)}`
        );
        sections.push({
          heading: 'Details',
          content: items,
          type: 'list',
        });
      }
    }

    // Add metadata if available
    if (output.metadata) {
      sections.push({
        heading: 'Metadata',
        content: output.metadata,
        type: 'json',
      });
    }

    // Add timestamp
    sections.push({
      heading: 'Report Information',
      content: [
        `Generated: ${new Date().toLocaleString()}`,
        `Agent: ${output.agent || 'Unknown'}`,
        `Use Case: ${output.useCaseId || 'Unknown'}`,
      ],
      type: 'list',
    });

    return sections;
  }
}

export const reportService = new ReportService();