import { auditTrailService } from '../services/audit-trail.service';
import { vanguardActionsService } from '../services/vanguard-actions.service';
import { extractCustomParticulars } from '../config/use-case-audit-config';

/**
 * Test file to demonstrate audit trail functionality across use cases
 * This shows how the audit trail captures use case executions with custom particulars
 */

async function testAuditTrail() {
  console.log('=== Testing Audit Trail Functionality ===\n');

  // Test 1: Log a use case execution for oilfield-land-lease
  console.log('1. Testing Oilfield Land Lease Use Case Audit Trail');
  
  const oilfieldUseCaseId = 'oilfield-land-lease';
  const oilfieldExecutionId = 'exec-oil-001';
  
  // Simulate execution context
  const oilfieldContext = {
    promptData: { leaseId: 'LEASE-2024-TX-001' },
    configuration: { region: 'Texas', priority: 'high' },
    results: {
      leaseAnalysis: { 
        value: 2500000, 
        expirationDate: '2025-12-31' 
      },
      gisData: { 
        location: { lat: 31.9686, lng: -99.9018, county: 'Tom Green' } 
      },
      renewalAnalysis: { status: 'pending' },
      riskAssessment: { score: 75 },
      complianceCheck: { passed: true }
    }
  };

  // Extract custom particulars
  const oilfieldParticulars = extractCustomParticulars(oilfieldUseCaseId, oilfieldContext);
  console.log('Extracted custom particulars:', oilfieldParticulars);

  // Log the use case execution
  await auditTrailService.logUseCaseExecution(
    'test-user-001',
    'test@seraphim.ai',
    oilfieldUseCaseId,
    'Oilfield Land Lease Analysis',
    oilfieldExecutionId,
    'energy-utilities',
    'completed',
    {
      useCaseId: oilfieldUseCaseId,
      useCaseName: 'Oilfield Land Lease Analysis',
      executionId: oilfieldExecutionId,
      verticalId: 'energy-utilities',
      siaScores: { security: 95, integrity: 92, accuracy: 88 },
      customFields: oilfieldParticulars
    }
  );
  console.log('✓ Oilfield use case execution logged\n');

  // Test 2: Log a use case execution for fraud-detection
  console.log('2. Testing Fraud Detection Use Case Audit Trail');
  
  const fraudUseCaseId = 'fraud-detection';
  const fraudExecutionId = 'exec-fraud-001';
  
  const fraudContext = {
    promptData: { batchId: 'BATCH-2024-11-02' },
    configuration: { sensitivity: 'high', realtime: true },
    results: {
      analysis: { 
        totalTransactions: 50000,
        riskDistribution: { low: 45000, medium: 4500, high: 500 }
      },
      detection: { fraudCount: 47 },
      metrics: { falsePositiveRate: 2.1 },
      financial: { amountProtected: 4250000 },
      patterns: { 
        detected: ['card-not-present', 'velocity-abuse', 'geo-anomaly'] 
      }
    }
  };

  const fraudParticulars = extractCustomParticulars(fraudUseCaseId, fraudContext);
  console.log('Extracted custom particulars:', fraudParticulars);

  await auditTrailService.logUseCaseExecution(
    'test-user-002',
    'fraud-analyst@seraphim.ai',
    fraudUseCaseId,
    'Real-time Fraud Detection',
    fraudExecutionId,
    'finance',
    'completed',
    {
      useCaseId: fraudUseCaseId,
      useCaseName: 'Real-time Fraud Detection',
      executionId: fraudExecutionId,
      verticalId: 'finance',
      siaScores: { security: 98, integrity: 96, accuracy: 94 },
      customFields: fraudParticulars
    }
  );
  console.log('✓ Fraud detection use case execution logged\n');

  // Test 3: Log a use case execution for patient-intake
  console.log('3. Testing Patient Intake Use Case Audit Trail');
  
  const patientUseCaseId = 'patient-intake';
  const patientExecutionId = 'exec-patient-001';
  
  const patientContext = {
    promptData: { clinicId: 'CLINIC-001' },
    configuration: { mode: 'batch', autoSchedule: true },
    results: {
      intake: { 
        totalPatients: 47,
        completionRate: 92
      },
      verification: { successCount: 45 },
      metrics: { avgTime: 12 },
      quality: { score: 99.2 },
      scheduling: { count: 45 }
    }
  };

  const patientParticulars = extractCustomParticulars(patientUseCaseId, patientContext);
  console.log('Extracted custom particulars:', patientParticulars);

  await auditTrailService.logUseCaseExecution(
    'test-user-003',
    'clinic-admin@seraphim.ai',
    patientUseCaseId,
    'Automated Patient Intake',
    patientExecutionId,
    'healthcare',
    'completed',
    {
      useCaseId: patientUseCaseId,
      useCaseName: 'Automated Patient Intake',
      executionId: patientExecutionId,
      verticalId: 'healthcare',
      siaScores: { security: 99, integrity: 97, accuracy: 95 },
      customFields: patientParticulars
    }
  );
  console.log('✓ Patient intake use case execution logged\n');

  // Test 4: Generate and log vanguard actions
  console.log('4. Testing Vanguard Actions Integration');
  
  const vanguardActions = vanguardActionsService.generateUseCaseActions(oilfieldUseCaseId);
  console.log(`Generated ${vanguardActions.length} vanguard actions for ${oilfieldUseCaseId}`);
  
  // Log a sample vanguard action
  if (vanguardActions.length > 0) {
    await vanguardActionsService.logAction({
      ...vanguardActions[0],
      id: 'test-action-001',
      timestamp: new Date().toISOString()
    });
    console.log('✓ Sample vanguard action logged\n');
  }

  // Test 5: Retrieve audit logs
  console.log('5. Testing Audit Trail Retrieval');
  
  // Get use case specific audit logs
  const oilfieldLogs = await auditTrailService.getUseCaseAuditTrail(oilfieldUseCaseId);
  console.log(`Retrieved ${oilfieldLogs.length} audit logs for ${oilfieldUseCaseId}`);
  
  // Get audit summary
  const summary = await auditTrailService.getUseCaseAuditSummary(oilfieldUseCaseId);
  console.log('Audit summary:', {
    totalActions: summary.totalActions,
    successRate: summary.successRate,
    averageSiaScores: summary.averageSiaScores
  });
  
  console.log('\n=== Audit Trail Test Complete ===');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAuditTrail()
    .then(() => {
      console.log('\nAll tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nTest failed:', error);
      process.exit(1);
    });
}

export { testAuditTrail };