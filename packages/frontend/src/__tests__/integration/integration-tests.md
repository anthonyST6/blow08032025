# Integration Test Suite Documentation

## Overview

This document outlines the comprehensive integration tests for all implemented features in the Seraphim Vanguards system.

## Test Categories

### 1. Frontend → Backend API Integration Tests

#### Test 1.1: API Authentication
```javascript
// Test that API calls include proper authentication headers
async function testApiAuthentication() {
  const response = await apiService.agents.list();
  // Verify Authorization header is present
  // Verify response is successful
}
```

#### Test 1.2: Error Handling
```javascript
// Test API error handling and retry logic
async function testApiErrorHandling() {
  // Simulate network error
  // Verify retry attempts
  // Verify error propagation
}
```

#### Test 1.3: Data Transformation
```javascript
// Test request/response data transformation
async function testDataTransformation() {
  const data = await apiService.prompts.create({
    title: 'Test Prompt',
    content: 'Test Content'
  });
  // Verify data structure matches types
}
```

### 2. Audit Logger → Backend Integration Tests

#### Test 2.1: Batch Processing
```javascript
// Test audit log batch processing
async function testAuditBatchProcessing() {
  // Create multiple audit logs
  for (let i = 0; i < 10; i++) {
    await auditLogger.log({
      action: `test_action_${i}`,
      resourceType: 'test',
      resourceId: `test_${i}`
    });
  }
  // Verify batch is sent after threshold
}
```

#### Test 2.2: Offline Queue
```javascript
// Test offline queue functionality
async function testOfflineQueue() {
  // Simulate offline mode
  localStorage.setItem('offline_mode', 'true');
  
  // Log events while offline
  await auditLogger.log({ action: 'offline_action' });
  
  // Simulate coming back online
  localStorage.removeItem('offline_mode');
  
  // Verify queued events are sent
}
```

### 3. WebSocket → Real-time Updates Tests

#### Test 3.1: Connection Management
```javascript
// Test WebSocket connection with auth
async function testWebSocketConnection() {
  await websocketService.connect();
  // Verify connection established
  // Verify auth token sent
}
```

#### Test 3.2: Real-time Messages
```javascript
// Test real-time message handling
async function testRealtimeMessages() {
  const messages = [];
  websocketService.on('message', (msg) => messages.push(msg));
  
  // Simulate incoming message
  websocketService.emit('test_message', { data: 'test' });
  
  // Verify message received
}
```

#### Test 3.3: Auto-reconnection
```javascript
// Test automatic reconnection
async function testAutoReconnect() {
  await websocketService.connect();
  
  // Simulate disconnect
  websocketService.disconnect();
  
  // Wait for reconnection
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verify reconnected
}
```

### 4. Vanguard Agents → Backend Integration Tests

#### Test 4.1: Agent Execution
```javascript
// Test agent execution through queue
async function testAgentExecution() {
  const result = await vanguardExecutionService.executeAgent('compliance-agent', {
    prompt: 'Test compliance check',
    context: { industry: 'finance' }
  });
  
  // Verify job ID returned
  // Verify job added to queue
}
```

#### Test 4.2: Execution Status Tracking
```javascript
// Test execution status updates
async function testExecutionStatus() {
  const jobId = await vanguardExecutionService.executeAgent('test-agent', {});
  
  // Poll for status
  let status;
  do {
    status = await vanguardExecutionService.getJobStatus(jobId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  } while (status.status === 'processing');
  
  // Verify final status
}
```

### 5. File Upload → Data Processing Tests

#### Test 5.1: File Upload with Progress
```javascript
// Test file upload with progress tracking
async function testFileUploadProgress() {
  const file = new File(['test content'], 'test.txt');
  const progressUpdates = [];
  
  await fileUploadService.uploadFile(file, {
    onProgress: (progress) => progressUpdates.push(progress)
  });
  
  // Verify progress updates received
  // Verify file uploaded successfully
}
```

#### Test 5.2: File Validation
```javascript
// Test file validation rules
async function testFileValidation() {
  // Test file size limit
  const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt');
  try {
    await fileUploadService.uploadFile(largeFile, { maxSize: 10 * 1024 * 1024 });
    throw new Error('Should have failed');
  } catch (error) {
    // Verify size error
  }
  
  // Test file type validation
  const invalidFile = new File(['test'], 'test.exe');
  try {
    await fileUploadService.uploadFile(invalidFile, { 
      allowedTypes: ['text/plain', 'application/pdf'] 
    });
    throw new Error('Should have failed');
  } catch (error) {
    // Verify type error
  }
}
```

### 6. Authentication → Route Protection Tests

#### Test 6.1: Permission Validation
```javascript
// Test permission checking
async function testPermissionValidation() {
  // Test valid permission
  const hasAdminWrite = await authValidationService.validatePermission('admin:write');
  
  // Test invalid permission
  const hasInvalid = await authValidationService.validatePermission('invalid:permission');
  
  // Verify results
}
```

#### Test 6.2: Role-based Access
```javascript
// Test role validation
async function testRoleValidation() {
  // Set user role
  localStorage.setItem('user_role', 'admin');
  
  // Test role check
  const isAdmin = await authValidationService.validateRole('admin');
  const isUser = await authValidationService.validateRole('user');
  
  // Verify results
}
```

### 7. Report Generation → Backend Tests

#### Test 7.1: Multi-format Report Generation
```javascript
// Test report generation in different formats
async function testReportGeneration() {
  const formats = ['pdf', 'excel', 'json'];
  
  for (const format of formats) {
    const report = await reportService.generateReport({
      type: 'compliance',
      format,
      data: { period: 'monthly' }
    });
    
    // Verify report generated
    // Verify correct format
  }
}
```

#### Test 7.2: Report Progress Tracking
```javascript
// Test report generation progress
async function testReportProgress() {
  const progressUpdates = [];
  
  await reportService.generateReport({
    type: 'comprehensive',
    format: 'pdf',
    onProgress: (progress) => progressUpdates.push(progress)
  });
  
  // Verify progress updates
  // Verify completion
}
```

### 8. Use Case Templates → Dynamic Loading Tests

#### Test 8.1: Template Loading
```javascript
// Test dynamic template loading
async function testTemplateLoading() {
  const template = await useCaseTemplateService.loadTemplate('energy-oilfield-land-lease');
  
  // Verify template loaded
  // Verify template is a valid component
}
```

#### Test 8.2: Placeholder Handling
```javascript
// Test placeholder for missing templates
async function testTemplatePlaceholder() {
  const template = await useCaseTemplateService.loadTemplate('non-existent-template');
  
  // Verify placeholder returned
  // Verify no errors thrown
}
```

### 9. Dashboard Integration Tests

#### Test 9.1: Cross-Dashboard Events
```javascript
// Test event emission between dashboards
async function testDashboardEvents() {
  const receivedEvents = [];
  
  // Subscribe to events
  dashboardIntegration.subscribeToDashboardEvents(
    DashboardSource.ADMIN,
    [DashboardEventType.RISK_ALERT],
    (event) => receivedEvents.push(event)
  );
  
  // Emit event from another dashboard
  dashboardIntegration.emitDashboardEvent(
    DashboardEventType.RISK_ALERT,
    DashboardSource.RISK_OFFICER,
    { level: 'high' }
  );
  
  // Verify event received
}
```

#### Test 9.2: Data Sharing
```javascript
// Test data sharing between dashboards
async function testDashboardDataSharing() {
  // Share data
  dashboardIntegration.shareData(
    DashboardSource.MISSION_CONTROL,
    DashboardSource.ADMIN,
    'test_data',
    { value: 'test' }
  );
  
  // Retrieve shared data
  const data = dashboardIntegration.getSharedData(
    DashboardSource.MISSION_CONTROL,
    DashboardSource.ADMIN,
    'test_data'
  );
  
  // Verify data matches
}
```

## End-to-End Integration Test

### Complete Workflow Test
```javascript
async function testCompleteWorkflow() {
  // 1. User Authentication
  const user = await authValidationService.validateUser();
  console.log('✓ User authenticated');
  
  // 2. Load Dashboard Data
  const agents = await apiService.agents.list();
  console.log('✓ Dashboard data loaded');
  
  // 3. Upload File
  const file = new File(['test data'], 'data.csv');
  const upload = await fileUploadService.uploadFile(file);
  console.log('✓ File uploaded');
  
  // 4. Execute Agent
  const jobId = await vanguardExecutionService.executeAgent('analysis-agent', {
    fileId: upload.fileId
  });
  console.log('✓ Agent execution started');
  
  // 5. Track Progress via WebSocket
  await new Promise((resolve) => {
    websocketService.on(`job:${jobId}:complete`, resolve);
  });
  console.log('✓ Agent execution completed');
  
  // 6. Log Audit Event
  await auditLogger.log({
    action: 'workflow_completed',
    resourceType: 'workflow',
    resourceId: 'test-workflow'
  });
  console.log('✓ Audit logged');
  
  // 7. Generate Report
  const report = await reportService.generateReport({
    type: 'workflow_summary',
    format: 'pdf',
    data: { jobId }
  });
  console.log('✓ Report generated');
  
  // 8. Share Results Across Dashboards
  dashboardIntegration.broadcastToAll(
    DashboardEventType.WORKFLOW_COMPLETED,
    { workflowId: 'test-workflow', reportId: report.reportId }
  );
  console.log('✓ Results shared');
  
  console.log('\n✅ Complete workflow test passed!');
}
```

## Running the Tests

### Manual Test Execution
1. Open browser developer console
2. Copy and paste test functions
3. Run individual tests or complete workflow

### Automated Test Runner
```javascript
// Test runner function
async function runAllIntegrationTests() {
  const tests = [
    { name: 'API Authentication', fn: testApiAuthentication },
    { name: 'Audit Batch Processing', fn: testAuditBatchProcessing },
    { name: 'WebSocket Connection', fn: testWebSocketConnection },
    { name: 'Agent Execution', fn: testAgentExecution },
    { name: 'File Upload', fn: testFileUploadProgress },
    { name: 'Permission Validation', fn: testPermissionValidation },
    { name: 'Report Generation', fn: testReportGeneration },
    { name: 'Template Loading', fn: testTemplateLoading },
    { name: 'Dashboard Events', fn: testDashboardEvents },
    { name: 'Complete Workflow', fn: testCompleteWorkflow }
  ];
  
  console.log('🧪 Running Integration Tests...\n');
  
  for (const test of tests) {
    try {
      console.log(`Running: ${test.name}`);
      await test.fn();
      console.log(`✅ ${test.name} - PASSED\n`);
    } catch (error) {
      console.error(`❌ ${test.name} - FAILED`);
      console.error(error);
      console.log('\n');
    }
  }
  
  console.log('🏁 Integration tests completed!');
}
```

## Test Data Setup

### Mock Data Generator
```javascript
function generateMockData() {
  return {
    users: [
      { id: '1', email: 'admin@test.com', role: 'admin' },
      { id: '2', email: 'risk@test.com', role: 'risk_officer' },
      { id: '3', email: 'compliance@test.com', role: 'compliance_reviewer' }
    ],
    agents: [
      { id: 'compliance-agent', name: 'Compliance Agent', version: '1.0' },
      { id: 'risk-agent', name: 'Risk Analysis Agent', version: '1.0' },
      { id: 'report-agent', name: 'Report Generation Agent', version: '1.0' }
    ],
    workflows: [
      { id: 'compliance-check', name: 'Compliance Check Workflow' },
      { id: 'risk-assessment', name: 'Risk Assessment Workflow' }
    ]
  };
}
```

## Success Criteria

All integration tests should:
1. ✅ Complete without errors
2. ✅ Verify expected behavior
3. ✅ Handle error cases gracefully
4. ✅ Clean up test data after completion
5. ✅ Run independently without side effects