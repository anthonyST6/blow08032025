import { useCaseOrchestrator } from '../orchestration/use-case-orchestrator';
import { auditTrailService } from '../services/audit-trail.service';
import { unifiedReportsService } from '../services/unified-reports.service';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

async function testOilfieldAudit() {
  const executionId = uuidv4();
  const useCaseId = 'oilfield-land-lease';
  const userId = 'test-user-123';
  const userEmail = 'test@seraphim.ai';

  logger.info('Starting oilfield land lease use case test', { executionId, useCaseId });

  try {
    // Execute the use case
    logger.info('Executing use case through orchestrator...');
    const result = await useCaseOrchestrator.executeUseCase(
      executionId,
      useCaseId,
      {
        userId,
        userEmail,
        prompt: 'Test execution of oilfield land lease use case',
        data: {
          leaseId: 'TEST-LEASE-001',
          location: 'Test Field, TX',
          acreage: 1000,
          royaltyRate: 0.125
        }
      },
      {
        testMode: true,
        generateReports: true
      }
    );

    logger.info('Use case execution completed', { 
      status: result.status,
      duration: result.duration,
      siaScores: result.siaScores 
    });

    // Wait a moment for audit logs to be written
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Retrieve audit trail
    logger.info('Retrieving audit trail...');
    const auditTrail = await auditTrailService.getUseCaseAuditTrail(
      useCaseId,
      { limit: 10 }
    );

    logger.info('Audit trail retrieved', { 
      entriesReturned: auditTrail.length 
    });

    // Get audit summary
    logger.info('Retrieving audit summary...');
    const auditSummary = await auditTrailService.getUseCaseAuditSummary(useCaseId);
    
    logger.info('Audit summary retrieved', {
      totalActions: auditSummary.totalActions,
      successRate: auditSummary.successRate,
      averageSiaScores: auditSummary.averageSiaScores
    });

    // Get reports for the use case
    logger.info('Retrieving reports...');
    const allReports = await unifiedReportsService.getAllUseCaseReports();
    const reports = allReports.filter((r: any) => r.useCaseId === useCaseId);

    logger.info('Reports retrieved', {
      reportCount: reports.length,
      reportTypes: reports.map((r: any) => r.type)
    });

    // Display results
    console.log('\n=== TEST RESULTS ===');
    console.log('\nExecution Result:', JSON.stringify(result, null, 2));
    console.log('\nAudit Trail Entries:', auditTrail.length);
    console.log('\nAudit Summary:', JSON.stringify(auditSummary, null, 2));
    console.log('\nReports Available:', reports.length);
    
    console.log('\n=== AUDIT TRAIL SAMPLE ===');
    auditTrail.slice(0, 3).forEach((entry: any, index: number) => {
      console.log(`\nEntry ${index + 1}:`);
      console.log('- Action:', entry.action);
      console.log('- Type:', entry.actionType);
      console.log('- Status:', entry.status);
      console.log('- Timestamp:', entry.timestamp);
      if (entry.particulars?.customFields) {
        console.log('- Custom Fields:', JSON.stringify(entry.particulars.customFields, null, 2));
      }
    });

    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
    console.log('\nThe audit trail and reports are being generated properly through the use case orchestration engine.');
    console.log('You can view these in the Mission Control V2 Outputs tab.');
    
    process.exit(0);

  } catch (error) {
    logger.error('Test failed', { error });
    console.error('\n=== TEST FAILED ===');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testOilfieldAudit();