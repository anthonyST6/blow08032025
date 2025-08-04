import { useState, useCallback, useEffect } from 'react';
import { reportService, ReportMetadata, ReportContent, GenerateReportRequest } from '../services/api/report.service';
import { useAuditLogger, ActionType } from './useAuditLogger';
import { useWebSocket } from './useWebSocket';
import { toast } from 'react-hot-toast';

interface ReportGenerationState {
  generating: boolean;
  loading: boolean;
  reports: ReportMetadata[];
  currentReport: ReportMetadata | null;
  error: Error | null;
}

interface UseReportGenerationOptions {
  useCaseId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useReportGeneration = (options: UseReportGenerationOptions = {}) => {
  const { useCaseId, autoRefresh = false, refreshInterval = 30000 } = options;
  const { logAction } = useAuditLogger();
  const { subscribe, isConnected } = useWebSocket();
  
  const [state, setState] = useState<ReportGenerationState>({
    generating: false,
    loading: false,
    reports: [],
    currentReport: null,
    error: null
  });

  // Load reports
  const loadReports = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const reports = await reportService.listReports();
      
      // Filter by use case if specified
      const filteredReports = useCaseId
        ? reports.filter(r => r.useCaseId === useCaseId)
        : reports;
      
      setState(prev => ({
        ...prev,
        loading: false,
        reports: filteredReports
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: new Error(error.message || 'Failed to load reports')
      }));
      toast.error('Failed to load reports');
    }
  }, [useCaseId]);

  // Generate report
  const generateReport = useCallback(async (
    request: GenerateReportRequest
  ): Promise<ReportMetadata | null> => {
    setState(prev => ({ ...prev, generating: true, error: null }));
    
    try {
      const report = await reportService.generateReport(request);
      
      setState(prev => ({
        ...prev,
        generating: false,
        currentReport: report,
        reports: [report, ...prev.reports]
      }));

      // Log audit action
      await logAction({
        actionType: ActionType.DATA_EXPORT,
        actionDetails: {
          component: 'ReportGeneration',
          description: `Generated ${request.type.toUpperCase()} report: ${request.name}`,
          parameters: {
            reportId: report.id,
            reportType: request.type,
            useCaseId: request.useCaseId,
            agent: request.agent
          },
          result: report
        }
      });

      toast.success(`Report generated: ${request.name}`);
      return report;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        generating: false,
        error: new Error(error.message || 'Failed to generate report')
      }));
      toast.error(`Failed to generate report: ${error.message}`);
      return null;
    }
  }, [logAction]);

  // Generate PDF report
  const generatePDFReport = useCallback(async (
    content: ReportContent,
    metadata: Omit<GenerateReportRequest, 'type' | 'content'>
  ): Promise<ReportMetadata | null> => {
    return generateReport({
      ...metadata,
      type: 'pdf',
      content
    });
  }, [generateReport]);

  // Generate JSON report
  const generateJSONReport = useCallback(async (
    data: any,
    metadata: Omit<GenerateReportRequest, 'type' | 'content'>
  ): Promise<ReportMetadata | null> => {
    return generateReport({
      ...metadata,
      type: 'json',
      content: data
    });
  }, [generateReport]);

  // Generate Excel report
  const generateExcelReport = useCallback(async (
    data: any[],
    metadata: Omit<GenerateReportRequest, 'type' | 'content'>
  ): Promise<ReportMetadata | null> => {
    return generateReport({
      ...metadata,
      type: 'xlsx',
      content: data
    });
  }, [generateReport]);

  // Generate text report
  const generateTextReport = useCallback(async (
    content: string,
    metadata: Omit<GenerateReportRequest, 'type' | 'content'>
  ): Promise<ReportMetadata | null> => {
    return generateReport({
      ...metadata,
      type: 'txt',
      content
    });
  }, [generateReport]);

  // Download report
  const downloadReport = useCallback(async (
    reportId: string,
    filename?: string
  ): Promise<void> => {
    try {
      await reportService.downloadReport(reportId, filename);
      
      // Log audit action
      await logAction({
        actionType: ActionType.DATA_EXPORT,
        actionDetails: {
          component: 'ReportGeneration',
          description: `Downloaded report: ${reportId}`,
          parameters: { reportId }
        }
      });
      
      toast.success('Report downloaded');
    } catch (error: any) {
      toast.error(`Failed to download report: ${error.message}`);
    }
  }, [logAction]);

  // Delete report
  const deleteReport = useCallback(async (reportId: string): Promise<boolean> => {
    try {
      await reportService.deleteReport(reportId);
      
      setState(prev => ({
        ...prev,
        reports: prev.reports.filter(r => r.id !== reportId),
        currentReport: prev.currentReport?.id === reportId ? null : prev.currentReport
      }));

      toast.success('Report deleted');
      return true;
    } catch (error: any) {
      toast.error(`Failed to delete report: ${error.message}`);
      return false;
    }
  }, []);

  // Generate sample reports
  const generateSampleReports = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, generating: true }));
    
    try {
      const reports = await reportService.generateSampleReports(useCaseId);
      
      setState(prev => ({
        ...prev,
        generating: false,
        reports: [...reports, ...prev.reports]
      }));

      toast.success(`Generated ${reports.length} sample reports`);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        generating: false,
        error: new Error(error.message || 'Failed to generate sample reports')
      }));
      toast.error('Failed to generate sample reports');
    }
  }, [useCaseId]);

  // Subscribe to WebSocket events for real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribers = [
      // Listen for report generation completion
      subscribe('report:generated', (data: any) => {
        if (!useCaseId || data.useCaseId === useCaseId) {
          loadReports();
        }
      }),
      
      // Listen for report deletion
      subscribe('report:deleted', (data: any) => {
        setState(prev => ({
          ...prev,
          reports: prev.reports.filter(r => r.id !== data.reportId)
        }));
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [isConnected, subscribe, useCaseId, loadReports]);

  // Auto-refresh reports
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadReports();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadReports]);

  // Initial load
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Get report by ID
  const getReportById = useCallback((reportId: string): ReportMetadata | undefined => {
    return state.reports.find(r => r.id === reportId);
  }, [state.reports]);

  // Get reports by type
  const getReportsByType = useCallback((type: string): ReportMetadata[] => {
    return state.reports.filter(r => r.type === type);
  }, [state.reports]);

  // Get recent reports
  const getRecentReports = useCallback((limit: number = 5): ReportMetadata[] => {
    return state.reports
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [state.reports]);

  return {
    // State
    ...state,
    
    // Methods
    loadReports,
    generateReport,
    generatePDFReport,
    generateJSONReport,
    generateExcelReport,
    generateTextReport,
    downloadReport,
    deleteReport,
    generateSampleReports,
    
    // Getters
    getReportById,
    getReportsByType,
    getRecentReports,
    
    // Utilities
    buildReportContent: reportService.buildReportContent,
    formatTableData: reportService.formatTableData,
    getReportTypeIcon: reportService.getReportTypeIcon,
    getReportTypeColor: reportService.getReportTypeColor,
    formatFileSize: reportService.formatFileSize
  };
};

// Hook for generating use case specific reports
export const useUseCaseReports = (useCaseId: string) => {
  const reportGeneration = useReportGeneration({ useCaseId, autoRefresh: true });

  // Generate lease analysis report
  const generateLeaseAnalysisReport = useCallback(async (
    leases: any[],
    options?: {
      includeRiskAnalysis?: boolean;
      includeFinancials?: boolean;
      includeCompliance?: boolean;
    }
  ): Promise<ReportMetadata | null> => {
    const sections = [];

    // Executive Summary
    sections.push({
      heading: 'Executive Summary',
      content: `Analysis of ${leases.length} leases with comprehensive risk assessment and financial projections.`,
      type: 'text' as const
    });

    // Risk Analysis
    if (options?.includeRiskAnalysis) {
      const riskData = leases.reduce((acc, lease) => {
        const risk = lease.riskLevel || 'low';
        acc[risk] = (acc[risk] || 0) + 1;
        return acc;
      }, {});

      sections.push({
        heading: 'Risk Analysis',
        content: Object.entries(riskData).map(([level, count]) => ({
          'Risk Level': level.toUpperCase(),
          'Count': count,
          'Percentage': `${((count as number / leases.length) * 100).toFixed(1)}%`
        })),
        type: 'table' as const
      });
    }

    // Financial Summary
    if (options?.includeFinancials) {
      const totalRevenue = leases.reduce((sum, lease) => sum + (lease.monthlyRevenue || 0), 0);
      
      sections.push({
        heading: 'Financial Summary',
        content: [
          `Total Monthly Revenue: $${totalRevenue.toLocaleString()}`,
          `Average Revenue per Lease: $${(totalRevenue / leases.length).toLocaleString()}`,
          `Projected Annual Revenue: $${(totalRevenue * 12).toLocaleString()}`
        ],
        type: 'list' as const
      });
    }

    // Compliance Status
    if (options?.includeCompliance) {
      sections.push({
        heading: 'Compliance Status',
        content: 'All leases have been reviewed and meet current regulatory requirements.',
        type: 'text' as const
      });
    }

    const content = reportGeneration.buildReportContent(
      'Lease Portfolio Analysis',
      sections,
      `Generated on ${new Date().toLocaleDateString()}`
    );

    return reportGeneration.generatePDFReport(content, {
      name: `Lease_Analysis_${Date.now()}`,
      description: 'Comprehensive lease portfolio analysis',
      agent: 'Lease Analysis Agent',
      useCaseId
    });
  }, [useCaseId, reportGeneration]);

  return {
    ...reportGeneration,
    generateLeaseAnalysisReport
  };
};