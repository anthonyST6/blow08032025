import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ReportRequest {
  useCaseId: string;
  reportType: string;
  parameters?: Record<string, any>;
}

interface ReportResponse {
  success: boolean;
  reportId?: string;
  reportUrl?: string;
  error?: string;
  metadata?: any;
}

interface UseCase {
  useCaseId: string;
  useCaseName: string;
  reportCount: number;
  reports: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

interface ReportConfig {
  parameters: any[];
  outputFormats: string[];
  scheduling?: {
    enabled: boolean;
    frequencies: string[];
  };
}

class ReportApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getAllUseCases(): Promise<UseCase[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/use-cases`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch use cases:', error);
      throw error;
    }
  }

  async getAvailableReports(useCaseId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/use-cases/${useCaseId}/reports`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch available reports:', error);
      throw error;
    }
  }

  async getReportConfig(useCaseId: string, reportType: string): Promise<ReportConfig | null> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reports/use-cases/${useCaseId}/reports/${reportType}/config`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch report config:', error);
      return null;
    }
  }

  async generateReport(request: ReportRequest): Promise<ReportResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reports/generate`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  async scheduleReport(
    useCaseId: string,
    reportType: string,
    schedule: {
      frequency: string;
      time?: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
    }
  ): Promise<{ success: boolean; scheduleId?: string; error?: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reports/schedule`,
        { useCaseId, reportType, schedule },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to schedule report:', error);
      throw error;
    }
  }

  async getReportHistory(useCaseId?: string, limit: number = 50) {
    try {
      const params = new URLSearchParams();
      if (useCaseId) params.append('useCaseId', useCaseId);
      params.append('limit', limit.toString());

      const response = await axios.get(
        `${API_BASE_URL}/reports/history?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch report history:', error);
      throw error;
    }
  }

  async downloadReport(reportId: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reports/download/${reportId}`,
        {
          headers: this.getAuthHeaders(),
          responseType: 'blob'
        }
      );
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
      throw error;
    }
  }
}

export const reportApi = new ReportApi();