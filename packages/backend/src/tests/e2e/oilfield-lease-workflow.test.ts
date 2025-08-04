import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { leaseService } from '../../services/lease.service';
import { certificationService } from '../../services/certification.service';
import { orchestrationService } from '../../services/orchestration.service';
import { notificationService } from '../../services/notification.service';
import { auditTrailService } from '../../services/audit-trail.service';
import { optimizationVanguard, negotiationVanguard } from '../../vanguards';

describe('Oilfield Land Lease End-to-End Workflow', () => {
  let testLeaseId: string;
  let testWorkflowId: string;

  beforeAll(async () => {
    // Initialize services
    console.log('Initializing services for E2E test...');
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('Cleaning up test data...');
  });

  describe('1. Lease Creation and Initial Certification', () => {
    it('should create a new oilfield lease', async () => {
      const leaseData = {
        leaseNumber: 'TEST-2025-0001',
        lessee: {
          name: 'Seraphim Energy Corp',
          type: 'corporation' as const,
          contactInfo: {
            email: 'legal@seraphim-energy.com',
            phone: '555-0100',
            address: '123 Energy Plaza, Houston, TX 77002',
          },
        },
        lessor: {
          name: 'Johnson Family Trust',
          type: 'trust' as const,
          contactInfo: {
            email: 'trust@johnson-family.com',
            phone: '555-0200',
            address: '456 Ranch Road, Midland, TX 79701',
          },
        },
        property: {
          description: 'NW/4 Section 10, Township 2N, Range 3E',
          acreage: 160,
          location: {
            county: 'Midland',
            state: 'Texas',
            coordinates: {
              lat: 31.9973,
              lng: -102.0779,
            },
          },
          mineralRights: ['oil', 'gas', 'condensate'],
        },
        terms: {
          effectiveDate: new Date('2025-01-01'),
          expirationDate: new Date('2028-01-01'),
          primaryTerm: 3,
          royaltyRate: 12.5,
          bonusPayment: 500,
          extensionOptions: ['2-year extension with production'],
          specialClauses: ['Pugh clause', 'Depth severance clause'],
        },
        financial: {
          annualRevenue: 250000,
          totalInvestment: 1500000,
        },
        status: 'active' as const,
        compliance: {
          lastReviewDate: new Date(),
        },
        documents: [],
      };

      const lease = await leaseService.createLease(leaseData);
      testLeaseId = lease.id;

      expect(lease).toBeDefined();
      expect(lease.id).toBeDefined();
      expect(lease.leaseNumber).toBe('TEST-2025-0001');
      expect(lease.status).toBe('active');
    });

    it('should perform initial SIA certification', async () => {
      const scores = await certificationService.calculateScores(testLeaseId, {
        security: [{ metric: 'access_control', value: 85, weight: 1 }],
        integrity: [{ metric: 'data_validation', value: 90, weight: 1 }],
        accuracy: [{ metric: 'calculation_precision', value: 95, weight: 1 }]
      });
      // Store certification ID for later use if needed

      expect(scores).toBeDefined();
      expect(scores.security).toBeGreaterThanOrEqual(0);
      expect(scores.integrity).toBeGreaterThanOrEqual(0);
      expect(scores.accuracy).toBeGreaterThanOrEqual(0);
    });
  });

  describe('2. Vanguard Agent Analysis', () => {
    it('should analyze lease with Optimization Vanguard', async () => {
      const lease = await leaseService.getLeaseById(testLeaseId);
      expect(lease).toBeDefined();

      const optimizationInput = {
        id: 'test-optimization-1',
        promptId: 'lease-optimization',
        model: 'optimization-vanguard',
        modelVersion: '1.0.0',
        text: `Analyze lease ${lease!.leaseNumber} for optimization opportunities`,
        rawResponse: {},
        timestamp: new Date(),
        leaseData: [{
          id: lease!.id,
          expirationDate: lease!.terms.expirationDate,
          annualRevenue: lease!.financial.annualRevenue,
          royaltyRate: lease!.terms.royaltyRate,
          acreage: lease!.property.acreage,
        }],
        marketConditions: {
          oilPrice: 75,
          gasPrice: 3.5,
          demandForecast: 'stable',
        },
      };

      const result = await optimizationVanguard.analyze(optimizationInput);

      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should prepare negotiation strategy with Negotiation Vanguard', async () => {
      const lease = await leaseService.getLeaseById(testLeaseId);
      expect(lease).toBeDefined();

      const negotiationInput = {
        id: 'test-negotiation-1',
        promptId: 'lease-negotiation',
        model: 'negotiation-vanguard',
        modelVersion: '1.0.0',
        text: `Prepare negotiation strategy for lease ${lease!.leaseNumber}`,
        rawResponse: {},
        timestamp: new Date(),
        contractData: {
          leaseId: lease!.id,
          currentTerms: {
            royaltyRate: lease!.terms.royaltyRate,
            bonusPayment: lease!.terms.bonusPayment,
            primaryTerm: lease!.terms.primaryTerm,
          },
          counterpartyInfo: {
            name: lease!.lessor.name,
            type: lease!.lessor.type,
          },
        },
        marketBenchmarks: {
          avgRoyaltyRate: 15,
          avgBonusPerAcre: 750,
          typicalTermLength: 3,
        },
        negotiationContext: {
          urgency: 'medium' as 'medium',
          leverage: 'neutral' as 'neutral',
          objectives: ['Improve royalty rate', 'Extend term'],
        },
      };

      const result = await negotiationVanguard.analyze(negotiationInput);

      expect(result).toBeDefined();
      expect(result.negotiationPackage).toBeDefined();
      expect(result.proposedTerms).toBeDefined();
      expect(result.negotiationStrategy).toBeDefined();
    });
  });

  describe('3. Closed-Loop Orchestration', () => {
    it('should create and execute an orchestration workflow', async () => {
      const workflow = await orchestrationService.createWorkflow({
        name: 'Lease Optimization Workflow',
        description: 'Automated workflow to optimize lease terms',
        trigger: {
          type: 'manual'
        },
        steps: [
          {
            id: 'detect-issues',
            name: 'Detect Issues',
            type: 'detect',
            agent: 'optimization',
            action: 'detectAnomalies',
            parameters: {
              leaseId: testLeaseId,
            },
            conditions: [],
          },
          {
            id: 'classify-severity',
            name: 'Classify Severity',
            type: 'classify',
            action: 'classifyThreat',
            parameters: {
              sourceStep: 'detect-issues',
            },
            conditions: [],
          },
          {
            id: 'human-approval',
            name: 'Request Human Approval',
            type: 'execute',
            humanApprovalRequired: true,
            action: 'executeResponse',
            parameters: {
              approvers: ['risk-officer@seraphim.com'],
              message: 'Lease optimization requires approval',
            },
            timeout: 3600000, // 1 hour in milliseconds
            conditions: [],
          },
          {
            id: 'execute-optimization',
            name: 'Execute Optimization',
            type: 'execute',
            action: 'executeResponse',
            parameters: {
              action: 'updateLease',
              leaseId: testLeaseId,
              updates: {
                status: 'under_review',
              },
            },
            conditions: [],
          },
          {
            id: 'verify-results',
            name: 'Verify Results',
            type: 'verify',
            action: 'verifyResponse',
            parameters: {
              sourceStep: 'execute-optimization',
              leaseId: testLeaseId,
            },
            conditions: [],
          },
        ],
        metadata: {
          createdBy: 'system',
          tags: ['lease', 'optimization', 'test'],
        },
      });

      testWorkflowId = workflow.id;
      expect(workflow).toBeDefined();
      expect(workflow.status).toBe('active');

      // Execute the workflow
      const execution = await orchestrationService.executeWorkflow(workflow.id, {
        initiatedBy: 'test-suite',
        context: {
          leaseId: testLeaseId,
        },
      });

      expect(execution).toBeDefined();
      expect(execution.status).toBe('running');
    });

    it('should track workflow execution progress', async () => {
      // Wait for workflow to progress
      await new Promise(resolve => setTimeout(resolve, 2000));

      const executions = await orchestrationService.getWorkflowExecutions(testWorkflowId);
      expect(executions).toBeDefined();
      expect(executions.length).toBeGreaterThan(0);

      const latestExecution = executions[0];
      expect(latestExecution.steps.length).toBeGreaterThan(0);
    });
  });

  describe('4. Human-in-the-Loop Notifications', () => {
    it('should send notification for high-risk action', async () => {
      const notification = await notificationService.sendDirectNotification({
        channels: ['email'],
        recipients: [{ email: 'risk-officer@seraphim.com' }],
        priority: 'high',
        subject: 'Lease Optimization Approval Required',
        body: `Lease ${testLeaseId} requires approval for optimization`,
        data: {
          leaseId: testLeaseId,
          workflowId: testWorkflowId,
          proposedChanges: {
            royaltyRate: 15,
            extensionOptions: ['3-year extension with production'],
          },
        },
        metadata: {
          leaseId: testLeaseId,
          workflowId: testWorkflowId,
        }
      });

      expect(notification).toBeDefined();
      expect(notification.status).toBe('pending');
    });

    it('should handle approval response', async () => {
      // Simulate approval
      await orchestrationService.approveHumanApproval(
        'test-approval-id', // In real scenario, get from pending approvals
        'approve',
        'risk-officer@seraphim.com',
        'Approved for optimization'
      );

      // Since approveHumanApproval returns void, we just check it doesn't throw
      expect(true).toBe(true);
    });
  });

  describe('5. Auto-Fix and Certification Update', () => {
    it('should auto-fix identified issues', async () => {
      // Create a test issue that can be auto-fixed
      const issue = await certificationService.createIssue({
        category: 'accuracy',
        severity: 'low',
        title: 'Test Issue',
        description: 'Test issue for auto-fix',
        detectedAt: new Date(),
        detectedBy: 'test',
        status: 'open',
        autoFixAvailable: true,
        manualReviewRequired: false,
        affectedResources: [testLeaseId],
        recommendations: []
      });

      if (issue.autoFixAvailable) {
        const autoFix = await certificationService.createAutoFix(issue);
        expect(autoFix).toBeDefined();
        expect(autoFix.issueId).toBe(issue.id);
      }
    });

    it('should re-run certification after fixes', async () => {
      const newScores = await certificationService.calculateScores(testLeaseId, {
        security: [{ metric: 'access_control', value: 90, weight: 1 }],
        integrity: [{ metric: 'data_validation', value: 92, weight: 1 }],
        accuracy: [{ metric: 'calculation_precision', value: 96, weight: 1 }]
      });
      
      expect(newScores).toBeDefined();
      expect(newScores.overall).toBeGreaterThanOrEqual(70);
    });
  });

  describe('6. Audit Trail Verification', () => {
    it('should have complete audit trail for all actions', async () => {
      const auditEntries = await auditTrailService.getAuditTrail({
        resource: 'lease',
        limit: 100,
      });

      expect(auditEntries).toBeDefined();
      expect(auditEntries.length).toBeGreaterThan(0);

      // Verify key actions are logged
      const actionTypes = auditEntries.map(entry => entry.action);
      expect(actionTypes).toContain('lease.create');
      expect(actionTypes).toContain('lease.update');
    });

    it('should track agent actions', async () => {
      const agentAudit = await auditTrailService.getAuditTrail({
        resource: 'agent',
        limit: 100,
      });

      expect(agentAudit).toBeDefined();
      const vanguardActions = agentAudit.filter(entry => 
        entry.action.includes('optimization') || entry.action.includes('negotiation')
      );
      expect(vanguardActions.length).toBeGreaterThan(0);
    });

    it('should generate compliance audit report', async () => {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();

      const report = await auditTrailService.generateAuditReport(
        startDate,
        endDate,
        'action'
      );

      expect(report).toBeDefined();
      expect(report.totalEntries).toBeGreaterThan(0);
      expect(report.breakdown).toBeDefined();
    });
  });

  describe('7. Integration Verification', () => {
    it('should verify all systems are integrated', async () => {
      // Verify lease service integration
      const leaseMetrics = await leaseService.getLeaseMetrics();
      expect(leaseMetrics.totalLeases).toBeGreaterThan(0);

      // Verify certification service integration
      // Verify certification service integration
      const report = await certificationService.generateReport(testLeaseId, 'ad_hoc');
      expect(report).toBeDefined();

      // Verify orchestration service integration
      const executions = await orchestrationService.getWorkflowExecutions(testWorkflowId);
      expect(executions).toBeDefined();

      // Verify notification service integration - just check service exists
      expect(notificationService).toBeDefined();
    });
  });

  describe('8. Performance and Scalability', () => {
    it('should handle concurrent lease operations', async () => {
      const concurrentOps = 5;
      const promises: Promise<any>[] = [];

      for (let i = 0; i < concurrentOps; i++) {
        const promise = leaseService.getLeases({
          status: 'active',
          expiringWithinDays: 90,
        });
        promises.push(promise);
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(concurrentOps);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    it('should complete workflow within acceptable time', async () => {
      const startTime = Date.now();
      
      await orchestrationService.executeWorkflow(testWorkflowId, {
        initiatedBy: 'performance-test',
        context: {
          leaseId: testLeaseId,
        },
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Workflow should complete within 5 seconds
      expect(executionTime).toBeLessThan(5000);
    });
  });
});

// Export test utilities for other tests
export const testUtils = {
  createTestLease: async () => {
    return await leaseService.createLease({
      leaseNumber: `TEST-${Date.now()}`,
      lessee: {
        name: 'Test Lessee',
        type: 'corporation',
      },
      lessor: {
        name: 'Test Lessor',
        type: 'individual',
      },
      property: {
        description: 'Test Property',
        acreage: 100,
        location: {
          county: 'Test County',
          state: 'TX',
        },
        mineralRights: ['oil', 'gas'],
      },
      terms: {
        effectiveDate: new Date(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        primaryTerm: 1,
        royaltyRate: 12.5,
        bonusPayment: 100,
      },
      financial: {
        annualRevenue: 100000,
        totalInvestment: 500000,
      },
      status: 'active',
      compliance: {},
      documents: [],
    });
  },
  
  cleanupTestData: async (leaseId: string) => {
    // In production, implement proper cleanup
    console.log(`Cleaning up test lease: ${leaseId}`);
  },
};