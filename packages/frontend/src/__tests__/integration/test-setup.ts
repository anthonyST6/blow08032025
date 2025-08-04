/**
 * Test Setup Script
 * Exposes all services to window object for integration testing
 */

// Import all services
import { apiService } from '../../services/apiService';
import { auditLogger } from '../../services/auditLogger.service';
import { websocketService } from '../../services/websocket.service';
import { agentExecution as vanguardExecutionService } from '../../services/agentExecution.service';
import { reportService } from '../../services/report.service';
import { useCaseTemplateService } from '../../services/usecase-template.service';
import { dashboardIntegration } from '../../services/dashboard-integration.service';
import { persistenceService } from '../../services/persistence.service';
import { auth } from '../../services/firebase';

// Import file upload service if it exists
let fileUploadService: any;
try {
  const module = require('../../services/api/fileUpload.service');
  fileUploadService = module.fileUploadService;
} catch (e) {
  // Create a mock file upload service
  fileUploadService = {
    uploadFile: async (file: File, options?: any) => {
      console.log('Mock file upload:', file.name);
      if (options?.onProgress) {
        options.onProgress(50);
        await new Promise(resolve => setTimeout(resolve, 100));
        options.onProgress(100);
      }
      if (options?.maxSize && file.size > options.maxSize) {
        throw new Error('File size exceeds maximum allowed size');
      }
      return { fileId: 'mock-file-' + Date.now(), url: '/uploads/mock' };
    }
  };
}

// Import auth validation service if it exists
let authValidationService: any;
try {
  const module = require('../../services/api/authValidation.service');
  authValidationService = module.authValidationService;
} catch (e) {
  // Create a mock auth validation service
  authValidationService = {
    validatePermission: async (permission: string) => {
      console.log('Mock permission check:', permission);
      return true; // Allow all permissions in test
    },
    validateRole: async (role: string) => {
      console.log('Mock role check:', role);
      return role === 'admin' || role === 'user';
    },
    validateUser: async () => {
      return { email: 'test@example.com', role: 'admin' };
    }
  };
}

// Expose services to window for testing
declare global {
  interface Window {
    // Services
    apiService: typeof apiService;
    auditLogger: typeof auditLogger;
    websocketService: typeof websocketService;
    vanguardExecutionService: typeof vanguardExecutionService;
    fileUploadService: typeof fileUploadService;
    authValidationService: typeof authValidationService;
    reportService: typeof reportService;
    useCaseTemplateService: typeof useCaseTemplateService;
    dashboardIntegration: typeof dashboardIntegration;
    persistenceService: typeof persistenceService;
    auth: typeof auth;
    
    // Test runner
    runIntegrationTests: () => Promise<any>;
  }
}

// Attach services to window
if (typeof window !== 'undefined') {
  window.apiService = apiService;
  window.auditLogger = auditLogger;
  window.websocketService = websocketService;
  window.vanguardExecutionService = vanguardExecutionService;
  window.fileUploadService = fileUploadService;
  window.authValidationService = authValidationService;
  window.reportService = reportService;
  window.useCaseTemplateService = useCaseTemplateService;
  window.dashboardIntegration = dashboardIntegration;
  window.persistenceService = persistenceService;
  window.auth = auth;
  
  console.log('✅ Test services exposed to window object');
  console.log('Available services:', {
    apiService: !!window.apiService,
    auditLogger: !!window.auditLogger,
    websocketService: !!window.websocketService,
    vanguardExecutionService: !!window.vanguardExecutionService,
    fileUploadService: !!window.fileUploadService,
    authValidationService: !!window.authValidationService,
    reportService: !!window.reportService,
    useCaseTemplateService: !!window.useCaseTemplateService,
    dashboardIntegration: !!window.dashboardIntegration,
    persistenceService: !!window.persistenceService,
    auth: !!window.auth
  });
}

// Load the test runner script
export function loadTestRunner() {
  const script = document.createElement('script');
  script.src = '/src/__tests__/integration/integration-test-runner.js';
  script.onload = () => {
    console.log('✅ Integration test runner loaded');
    console.log('Run tests with: runIntegrationTests()');
  };
  script.onerror = () => {
    console.error('❌ Failed to load integration test runner');
  };
  document.head.appendChild(script);
}

// Auto-load in development
if (import.meta.env.DEV) {
  console.log('🧪 Development mode - Loading test setup...');
  
  // Wait for services to initialize
  setTimeout(() => {
    loadTestRunner();
  }, 1000);
}

export {
  apiService,
  auditLogger,
  websocketService,
  vanguardExecutionService,
  fileUploadService,
  authValidationService,
  reportService,
  useCaseTemplateService,
  dashboardIntegration,
  persistenceService
};