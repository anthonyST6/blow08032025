import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';

// Import services
import { apiService } from '../../services/apiService';
import { auditLogger } from '../../services/auditLogger.service';
import { websocketService } from '../../services/websocket.service';
import { vanguardExecutionService } from '../../services/agentExecution.service';
import { fileUploadService } from '../../services/api/fileUpload.service';
import { authValidationService } from '../../services/api/authValidation.service';
import { reportService } from '../../services/report.service';
import { useCaseTemplateService } from '../../services/usecase-template.service';
import { dashboardIntegration } from '../../services/dashboard-integration.service';

// Import hooks
import { useApiService } from '../../hooks/useApiService';
import { useAuditLogger } from '../../hooks/useAuditLogger';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useVanguardExecution } from '../../hooks/useVanguardExecution';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useAuthValidation } from '../../hooks/useAuthValidation';
import { useReportGeneration } from '../../hooks/useReportGeneration';
import { useUseCaseTemplate } from '../../hooks/useUseCaseTemplate';
import { useDashboardIntegration } from '../../hooks/useDashboardIntegration';

// Mock modules
vi.mock('../../services/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user', email: 'test@example.com' }
  }
}));

describe('Integration Test Suite', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Setup localStorage mock
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('1. Frontend → Backend API Integration', () => {
    it('should successfully make API calls with authentication', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      vi.spyOn(apiService.agents, 'list').mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useApiService(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.fetchAgents();
      });

      expect(response).toEqual(mockResponse.data);
      expect(apiService.agents.list).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      vi.spyOn(apiService.agents, 'list').mockRejectedValue(mockError);

      const { result } = renderHook(() => useApiService(), { wrapper });

      await expect(result.current.fetchAgents()).rejects.toThrow('API Error');
    });

    it('should include authentication headers in requests', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' })
      });
      global.fetch = mockFetch;

      await apiService.agents.list();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      );
    });
  });

  describe('2. Audit Logger → Backend Integration', () => {
    it('should log audit events with batch processing', async () => {
      const { result } = renderHook(() => useAuditLogger(), { wrapper });

      const mockLog = vi.spyOn(auditLogger, 'log').mockResolvedValue(undefined);

      await act(async () => {
        await result.current.logAction('test_action', 'test_resource', {
          details: 'test details'
        });
      });

      expect(mockLog).toHaveBeenCalledWith({
        action: 'test_action',
        resourceType: 'test_resource',
        resourceId: expect.any(String),
        metadata: { details: 'test details' }
      });
    });

    it('should handle offline queue when backend is unavailable', async () => {
      const mockLog = vi.spyOn(auditLogger, 'log').mockRejectedValue(new Error('Network error'));
      const mockQueue = vi.spyOn(auditLogger as any, 'addToOfflineQueue');

      const { result } = renderHook(() => useAuditLogger(), { wrapper });

      await act(async () => {
        await result.current.logAction('offline_action', 'resource', {});
      });

      expect(mockQueue).toHaveBeenCalled();
    });
  });

  describe('3. WebSocket → Real-time Updates Integration', () => {
    it('should establish WebSocket connection with authentication', async () => {
      const mockConnect = vi.spyOn(websocketService, 'connect').mockResolvedValue(undefined);

      const { result } = renderHook(() => useWebSocket('test-room'), { wrapper });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false); // Mocked state
      });

      expect(mockConnect).toHaveBeenCalled();
    });

    it('should handle real-time messages', async () => {
      const onMessage = vi.fn();
      const mockOn = vi.spyOn(websocketService, 'on').mockImplementation(() => {});

      renderHook(() => useWebSocket('test-room', { onMessage }), { wrapper });

      expect(mockOn).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should reconnect on connection loss', async () => {
      const mockReconnect = vi.spyOn(websocketService as any, 'handleReconnect');
      
      renderHook(() => useWebSocket('test-room'), { wrapper });

      // Simulate connection loss
      act(() => {
        websocketService.emit('disconnect');
      });

      await waitFor(() => {
        expect(mockReconnect).toHaveBeenCalled();
      });
    });
  });

  describe('4. Vanguard Agents → Backend Integration', () => {
    it('should execute agent with queue processing', async () => {
      const mockExecute = vi.spyOn(vanguardExecutionService, 'executeAgent')
        .mockResolvedValue({ jobId: 'test-job-123' });

      const { result } = renderHook(() => useVanguardExecution(), { wrapper });

      let jobId;
      await act(async () => {
        jobId = await result.current.execute('test-agent', { input: 'test' });
      });

      expect(jobId).toBe('test-job-123');
      expect(mockExecute).toHaveBeenCalledWith('test-agent', { input: 'test' });
    });

    it('should track execution status', async () => {
      const mockStatus = vi.spyOn(vanguardExecutionService, 'getJobStatus')
        .mockResolvedValue({ status: 'completed', result: { output: 'test' } });

      const { result } = renderHook(() => useVanguardExecution(), { wrapper });

      let status;
      await act(async () => {
        status = await result.current.getStatus('test-job-123');
      });

      expect(status).toEqual({ status: 'completed', result: { output: 'test' } });
    });
  });

  describe('5. File Upload → Data Processing Integration', () => {
    it('should upload file with progress tracking', async () => {
      const mockUpload = vi.spyOn(fileUploadService, 'uploadFile')
        .mockResolvedValue({ fileId: 'file-123', url: '/uploads/file-123' });

      const { result } = renderHook(() => useFileUpload(), { wrapper });

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadFile(file, {
          onProgress: (progress) => {
            expect(progress).toBeGreaterThanOrEqual(0);
            expect(progress).toBeLessThanOrEqual(100);
          }
        });
      });

      expect(uploadResult).toEqual({ fileId: 'file-123', url: '/uploads/file-123' });
    });

    it('should validate file before upload', async () => {
      const { result } = renderHook(() => useFileUpload(), { wrapper });

      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt');
      
      await expect(
        result.current.uploadFile(largeFile, { maxSize: 10 * 1024 * 1024 })
      ).rejects.toThrow('File size exceeds maximum allowed size');
    });
  });

  describe('6. Authentication → Route Protection Validation', () => {
    it('should validate user permissions', async () => {
      const mockValidate = vi.spyOn(authValidationService, 'validatePermission')
        .mockResolvedValue(true);

      const { result } = renderHook(() => useAuthValidation(), { wrapper });

      const hasPermission = await result.current.checkPermission('admin:write');

      expect(hasPermission).toBe(true);
      expect(mockValidate).toHaveBeenCalledWith('admin:write');
    });

    it('should validate user roles', async () => {
      const mockValidateRole = vi.spyOn(authValidationService, 'validateRole')
        .mockResolvedValue(true);

      const { result } = renderHook(() => useAuthValidation(), { wrapper });

      const hasRole = await result.current.checkRole('admin');

      expect(hasRole).toBe(true);
      expect(mockValidateRole).toHaveBeenCalledWith('admin');
    });
  });

  describe('7. Report Generation → Backend Integration', () => {
    it('should generate report with multiple formats', async () => {
      const mockGenerate = vi.spyOn(reportService, 'generateReport')
        .mockResolvedValue({ reportId: 'report-123', status: 'completed' });

      const { result } = renderHook(() => useReportGeneration(), { wrapper });

      const report = await result.current.generateReport({
        type: 'compliance',
        format: 'pdf',
        data: { period: 'monthly' }
      });

      expect(report).toEqual({ reportId: 'report-123', status: 'completed' });
    });

    it('should track report generation progress', async () => {
      const onProgress = vi.fn();
      const { result } = renderHook(() => useReportGeneration(), { wrapper });

      vi.spyOn(reportService, 'generateReport').mockImplementation(async (config) => {
        if (config.onProgress) {
          config.onProgress(50);
          config.onProgress(100);
        }
        return { reportId: 'report-123', status: 'completed' };
      });

      await result.current.generateReport({
        type: 'compliance',
        format: 'pdf',
        onProgress
      });

      expect(onProgress).toHaveBeenCalledWith(50);
      expect(onProgress).toHaveBeenCalledWith(100);
    });
  });

  describe('8. Use Case Templates → Dynamic Loading', () => {
    it('should dynamically load use case templates', async () => {
      const mockTemplate = { default: () => <div>Test Template</div> };
      vi.spyOn(useCaseTemplateService, 'loadTemplate')
        .mockResolvedValue(mockTemplate.default);

      const { result } = renderHook(
        () => useUseCaseTemplate('energy-oilfield-land-lease'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.template).toBeDefined();
      });
    });

    it('should handle missing templates with placeholders', async () => {
      vi.spyOn(useCaseTemplateService, 'loadTemplate')
        .mockRejectedValue(new Error('Template not found'));

      const { result } = renderHook(
        () => useUseCaseTemplate('non-existent-template'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeDefined();
        expect(result.current.template).toBeDefined(); // Placeholder
      });
    });
  });

  describe('9. Mission Control → Other Dashboards Integration', () => {
    it('should emit events between dashboards', async () => {
      const mockEmit = vi.spyOn(dashboardIntegration, 'emitDashboardEvent');

      const { result } = renderHook(
        () => useDashboardIntegration({ source: 'MISSION_CONTROL' as any }),
        { wrapper }
      );

      act(() => {
        result.current.emitEvent('RISK_ALERT' as any, { level: 'high' });
      });

      expect(mockEmit).toHaveBeenCalledWith(
        'RISK_ALERT',
        'MISSION_CONTROL',
        { level: 'high' }
      );
    });

    it('should share data between dashboards', async () => {
      const mockShare = vi.spyOn(dashboardIntegration, 'shareData');

      const { result } = renderHook(
        () => useDashboardIntegration({ source: 'ADMIN' as any }),
        { wrapper }
      );

      act(() => {
        result.current.shareData('RISK_OFFICER' as any, 'risk_data', { risk: 'high' });
      });

      expect(mockShare).toHaveBeenCalledWith(
        'ADMIN',
        'RISK_OFFICER',
        'risk_data',
        { risk: 'high' }
      );
    });
  });

  describe('End-to-End Integration Flow', () => {
    it('should complete full workflow from login to report generation', async () => {
      // 1. Authentication
      const authResult = await authValidationService.validateUser();
      expect(authResult).toBeTruthy();

      // 2. Load dashboard data
      const agents = await apiService.agents.list();
      expect(agents).toBeDefined();

      // 3. Execute agent
      const execution = await vanguardExecutionService.executeAgent('test-agent', {});
      expect(execution.jobId).toBeDefined();

      // 4. Log audit event
      await auditLogger.log({
        action: 'agent_executed',
        resourceType: 'agent',
        resourceId: 'test-agent'
      });

      // 5. Generate report
      const report = await reportService.generateReport({
        type: 'execution_summary',
        format: 'pdf'
      });
      expect(report.reportId).toBeDefined();
    });
  });
});