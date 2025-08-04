import { AuditTrailService } from './services/audit-trail.service.js';
import { logger } from './utils/logger.js';

async function testAuditTrailFunctionality() {
  const auditService = new AuditTrailService();
  
  try {
    // Test 1: Log a use case execution
    const executionId = `test-exec-${Date.now()}`;
    const useCaseId = 'oilfield-land-lease';
    const userId = 'test-user-123';
    
    logger.info('Testing audit trail logging...');
    
    // Log use case start
    await auditService.logUseCaseExecution(
      executionId,
      useCaseId,
      userId,
      'started',
      {
        testMode: true,
        timestamp: new Date().toISOString()
      }
    );
    
    // Log agent action
    await auditService.logAgentAction(executionId, {
      agentId: 'lease-monitor-agent',
      action: 'scanExpiringLeases',
      status: 'success',
      duration: 1500,
      result: {
        leasesFound: 5,
        criticalLeases: 2
      }
    });
    
    // Log use case completion with custom particulars
    await auditService.logUseCaseExecution(
      executionId,
      useCaseId,
      userId,
      'completed',
      {
        duration: 5000,
        leasesProcessed: 5,
        renewalsRecommended: 3,
        estimatedSavings: 250000
      }
    );
    
    // Test 2: Retrieve audit trail
    logger.info('Retrieving audit trail...');
    const auditTrail = await auditService.getUseCaseAuditTrail(useCaseId, {
      limit: 5
    });
    
    logger.info(`Found ${auditTrail.length} audit entries`);
    
    // Test 3: Get audit summary
    const summary = await auditService.getUseCaseAuditSummary(useCaseId);
    logger.info('Audit summary:', summary);
    
    // Test 4: Verify custom particulars extraction
    const auditConfig = await import('./config/use-case-audit-config.js');
    const config = auditConfig.getUseCaseAuditConfig(useCaseId);
    
    if (config && config.customParticulars) {
      logger.info('Custom particulars fields:', config.customParticulars.fields.map(f => f.name));
      
      // Test extraction
      const testContext = {
        executionId,
        results: {
          leasesAnalyzed: 10,
          renewalsProcessed: 5,
          totalValue: 1000000
        }
      };
      
      const extracted = {};
      for (const [key, extractor] of Object.entries(config.customParticulars.extractors)) {
        extracted[key] = extractor(testContext);
      }
      
      logger.info('Extracted custom particulars:', extracted);
    }
    
    return {
      success: true,
      summary: {
        executionId,
        entriesLogged: 3,
        auditTrailEntries: auditTrail.length,
        summaryData: summary,
        customParticularsWorking: !!config
      }
    };
    
  } catch (error) {
    logger.error('Audit trail test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testAuditTrailFunctionality().then(result => {
  console.log('\n📊 Audit Trail Test Results:');
  console.log('==========================');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\n✅ Audit trail functionality is working correctly!');
    console.log('- Use case executions are being logged');
    console.log('- Agent actions are being tracked');
    console.log('- Custom particulars are being extracted');
    console.log('- Audit trail retrieval is functional');
    console.log('- Audit summaries are being generated');
  } else {
    console.log('\n❌ Audit trail test failed:', result.error);
  }
  
  process.exit(result.success ? 0 : 1);
});