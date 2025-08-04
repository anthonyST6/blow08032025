import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { initializeApp, cert, getApps, deleteApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { orchestrationService } from '../../services/orchestration.service';

// Mock Firebase Admin
jest.mock('firebase-admin/app');
jest.mock('firebase-admin/firestore');
jest.mock('firebase-admin/auth');

describe('Insurance Risk Assessment Workflow', () => {
  let app: App;

  beforeAll(() => {
    // Setup Firebase Admin mocks
    const mockApp = {} as App;
    (getApps as jest.Mock).mockReturnValue([]);
    (initializeApp as jest.Mock).mockReturnValue(mockApp);
    (cert as jest.Mock).mockReturnValue({});

    // Mock Firestore
    const mockDb = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      set: jest.fn().mockResolvedValue(undefined as never),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          id: 'test-doc-id',
          status: 'active',
          createdAt: new Date()
        })
      } as never),
      update: jest.fn().mockResolvedValue(undefined as never),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      onSnapshot: jest.fn((callback: any) => {
        // Simulate real-time updates
        callback({
          docs: [{
            id: 'test-doc-id',
            data: () => ({
              status: 'active',
              createdAt: new Date()
            })
          }]
        });
        return () => {}; // Unsubscribe function
      })
    } as any;
    (getFirestore as jest.Mock).mockReturnValue(mockDb);

    // Mock Auth
    const mockAuth = {
      createUser: jest.fn().mockResolvedValue({ uid: 'test-uid' } as never),
      setCustomUserClaims: jest.fn().mockResolvedValue(undefined as never),
      getUser: jest.fn().mockResolvedValue({
        uid: 'test-uid',
        email: 'test@example.com',
        customClaims: { role: 'admin' }
      } as never)
    } as any;
    (getAuth as jest.Mock).mockReturnValue(mockAuth);

    app = mockApp;
  });

  afterAll(async () => {
    // Cleanup
    if (app) {
      await deleteApp(app);
    }
  });

  describe('Insurance Risk Assessment Analysis', () => {
    it('should create insurance risk assessment workflow', async () => {
      const workflow = await orchestrationService.createWorkflow({
        name: 'Insurance Risk Assessment',
        description: 'Analyze insurance application risk and determine approval',
        trigger: {
          type: 'manual'
        },
        steps: [
          {
            id: 'analyze-risk',
            name: 'Analyze Application Risk',
            type: 'detect',
            action: 'analyzeInsuranceRisk',
            parameters: {
              riskFactors: ['age', 'health', 'occupation', 'lifestyle']
            }
          },
          {
            id: 'classify-risk',
            name: 'Classify Risk Level',
            type: 'classify',
            action: 'classifyRisk',
            parameters: {
              sourceStep: 'analyze-risk'
            }
          },
          {
            id: 'determine-premium',
            name: 'Determine Premium',
            type: 'decide',
            action: 'calculatePremium',
            parameters: {
              sourceStep: 'classify-risk'
            }
          },
          {
            id: 'approve-application',
            name: 'Approve or Decline Application',
            type: 'execute',
            action: 'processApplication',
            humanApprovalRequired: true,
            timeout: 86400000 // 24 hours
          },
          {
            id: 'verify-compliance',
            name: 'Verify Regulatory Compliance',
            type: 'verify',
            action: 'verifyCompliance',
            parameters: {
              regulations: ['ACA', 'HIPAA', 'State Requirements']
            }
          },
          {
            id: 'update-records',
            name: 'Update Insurance Records',
            type: 'update',
            action: 'updateRecords'
          }
        ]
      });

      expect(workflow).toBeDefined();
      expect(workflow.id).toBeDefined();
      expect(workflow.name).toBe('Insurance Risk Assessment');
      expect(workflow.steps).toHaveLength(6);
      expect(workflow.status).toBe('active');
    });

    it('should execute insurance risk assessment workflow', async () => {
      const applicationData = {
        applicantInfo: {
          name: 'John Doe',
          age: 35,
          occupation: 'Software Engineer',
          income: 120000,
          healthHistory: ['None'],
          smokingStatus: 'Non-smoker',
          drivingRecord: 'Clean'
        },
        policyDetails: {
          type: 'Life Insurance',
          coverageAmount: 500000,
          term: 20,
          riders: ['Critical Illness', 'Disability']
        },
        riskFactors: {
          medicalConditions: [],
          familyHistory: ['Diabetes'],
          lifestyle: 'Active',
          travelFrequency: 'Moderate'
        }
      };

      // Mock the workflow execution
      const mockExecution = {
        id: 'exec-123',
        workflowId: 'workflow-123',
        status: 'completed' as const,
        startedAt: new Date(),
        completedAt: new Date(),
        steps: [
          { stepId: 'analyze-risk', status: 'completed' as const },
          { stepId: 'classify-risk', status: 'completed' as const },
          { stepId: 'determine-premium', status: 'completed' as const },
          { stepId: 'approve-application', status: 'completed' as const },
          { stepId: 'verify-compliance', status: 'completed' as const },
          { stepId: 'update-records', status: 'completed' as const }
        ],
        context: {
          ...applicationData,
          riskScore: 25,
          riskLevel: 'low',
          monthlyPremium: 150,
          approved: true
        },
        flags: []
      };

      jest.spyOn(orchestrationService, 'executeWorkflow').mockResolvedValue(mockExecution);

      const execution = await orchestrationService.executeWorkflow('workflow-123', applicationData);

      expect(execution).toBeDefined();
      expect(execution.status).toBe('completed');
      expect(execution.context.riskScore).toBe(25);
      expect(execution.context.riskLevel).toBe('low');
      expect(execution.context.approved).toBe(true);
    });

    it('should handle high-risk insurance applications', async () => {
      const highRiskApplication = {
        applicantInfo: {
          name: 'Jane Smith',
          age: 65,
          occupation: 'Retired',
          income: 50000,
          healthHistory: ['Heart Disease', 'Diabetes'],
          smokingStatus: 'Former smoker',
          drivingRecord: 'Multiple violations'
        },
        policyDetails: {
          type: 'Health Insurance',
          coverageAmount: 1000000,
          deductible: 1000,
          copayPercentage: 20
        },
        riskFactors: {
          medicalConditions: ['Hypertension', 'High Cholesterol'],
          familyHistory: ['Cancer', 'Heart Disease'],
          lifestyle: 'Sedentary',
          travelFrequency: 'Rare'
        }
      };

      const mockExecution = {
        id: 'exec-456',
        workflowId: 'workflow-123',
        status: 'completed' as const,
        startedAt: new Date(),
        completedAt: new Date(),
        steps: [
          { stepId: 'analyze-risk', status: 'completed' as const },
          { stepId: 'classify-risk', status: 'completed' as const },
          { stepId: 'determine-premium', status: 'completed' as const },
          { stepId: 'approve-application', status: 'completed' as const },
          { stepId: 'verify-compliance', status: 'completed' as const },
          { stepId: 'update-records', status: 'completed' as const }
        ],
        context: {
          ...highRiskApplication,
          riskScore: 85,
          riskLevel: 'high',
          monthlyPremium: 800,
          approved: false,
          requiresManualReview: true,
          additionalRequirements: ['Medical examination required', 'Additional documentation needed']
        },
        flags: []
      };

      jest.spyOn(orchestrationService, 'executeWorkflow').mockResolvedValue(mockExecution);

      const execution = await orchestrationService.executeWorkflow('workflow-123', highRiskApplication);

      expect(execution.context.riskScore).toBeGreaterThan(70);
      expect(execution.context.riskLevel).toBe('high');
      expect(execution.context.approved).toBe(false);
      expect(execution.context.requiresManualReview).toBe(true);
      expect(execution.context.additionalRequirements).toContain('Medical examination required');
    });
  });

  describe('Insurance Fraud Detection', () => {
    it('should detect potential insurance fraud', async () => {
      const fraudCheckData = {
        applicationId: 'APP-2024-002',
        applicantSSN: '123-45-6789',
        claimsHistory: [
          { date: '2023-01-15', amount: 5000, type: 'Auto' },
          { date: '2023-06-20', amount: 3000, type: 'Home' },
          { date: '2023-11-10', amount: 8000, type: 'Health' }
        ],
        previousApplications: 3,
        addressChanges: 5
      };

      const mockFraudDetection = {
        fraudScore: 75,
        fraudIndicators: [
          'Multiple claims in short period',
          'Frequent address changes',
          'Pattern matches known fraud cases'
        ],
        recommendation: 'manual-review',
        riskLevel: 'high'
      };

      // Mock fraud detection workflow
      const mockExecution = {
        id: 'exec-789',
        workflowId: 'fraud-detection',
        status: 'completed' as const,
        startedAt: new Date(),
        completedAt: new Date(),
        steps: [
          { stepId: 'detect-fraud', status: 'completed' as const }
        ],
        context: {
          ...fraudCheckData,
          ...mockFraudDetection
        },
        flags: [{
          id: 'flag-fraud-001',
          type: 'fraud_risk',
          severity: 'high' as const,
          message: 'High fraud risk detected',
          metadata: mockFraudDetection
        }]
      };

      jest.spyOn(orchestrationService, 'executeWorkflow').mockResolvedValue(mockExecution);

      const execution = await orchestrationService.executeWorkflow('fraud-detection', fraudCheckData);

      expect(execution.context.fraudScore).toBeDefined();
      expect(execution.context.fraudIndicators).toBeInstanceOf(Array);
      expect(execution.context.recommendation).toBe('manual-review');
      expect(execution.flags).toHaveLength(1);
      expect(execution.flags[0].type).toBe('fraud_risk');
    });
  });

  describe('Insurance Premium Calculation', () => {
    it('should calculate accurate premiums based on risk', async () => {
      const premiumData = {
        baseRate: 1000,
        riskScore: 45,
        coverageAmount: 500000,
        term: 20,
        applicantAge: 40,
        healthFactors: {
          bmi: 24,
          bloodPressure: 'Normal',
          cholesterol: 'Normal'
        }
      };

      const mockPremiumCalculation = {
        monthlyPremium: 175,
        annualPremium: 2100,
        breakdown: {
          baseRate: 1000,
          riskAdjustment: 1.45,
          ageAdjustment: 1.2,
          healthAdjustment: 0.95,
          finalRate: 1653
        }
      };

      const mockExecution = {
        id: 'exec-premium',
        workflowId: 'premium-calc',
        status: 'completed' as const,
        startedAt: new Date(),
        completedAt: new Date(),
        steps: [
          { stepId: 'calculate-premium', status: 'completed' as const }
        ],
        context: {
          ...premiumData,
          ...mockPremiumCalculation
        },
        flags: []
      };

      jest.spyOn(orchestrationService, 'executeWorkflow').mockResolvedValue(mockExecution);

      const execution = await orchestrationService.executeWorkflow('premium-calc', premiumData);

      expect(execution.context.monthlyPremium).toBeGreaterThan(0);
      expect(execution.context.annualPremium).toBe(execution.context.monthlyPremium * 12);
      expect(execution.context.breakdown).toBeDefined();
      expect(execution.context.breakdown.baseRate).toBe(1000);
      expect(execution.context.breakdown.riskAdjustment).toBeDefined();
    });
  });

  describe('Insurance Compliance Verification', () => {
    it('should verify regulatory compliance for insurance policies', async () => {
      const policyData = {
        policyId: 'POL-2024-001',
        type: 'Health Insurance',
        state: 'California',
        coverageDetails: {
          preventiveCare: true,
          emergencyServices: true,
          prescriptionDrugs: true,
          mentalHealth: true
        },
        exclusions: ['Cosmetic procedures', 'Experimental treatments']
      };

      const mockComplianceResult = {
        isCompliant: true,
        regulations: ['ACA', 'HIPAA', 'California State Requirements'],
        stateRequirements: {
          minimumCoverage: 'Met',
          essentialBenefits: 'Included',
          consumerProtections: 'Compliant'
        },
        missingCoverage: [],
        warnings: []
      };

      const mockExecution = {
        id: 'exec-compliance',
        workflowId: 'compliance-check',
        status: 'completed' as const,
        startedAt: new Date(),
        completedAt: new Date(),
        steps: [
          { stepId: 'verify-compliance', status: 'completed' as const }
        ],
        context: {
          ...policyData,
          ...mockComplianceResult
        },
        flags: []
      };

      jest.spyOn(orchestrationService, 'executeWorkflow').mockResolvedValue(mockExecution);

      const execution = await orchestrationService.executeWorkflow('compliance-check', policyData);

      expect(execution.context.isCompliant).toBe(true);
      expect(execution.context.regulations).toContain('ACA');
      expect(execution.context.stateRequirements).toBeDefined();
      expect(execution.context.missingCoverage).toEqual([]);
    });
  });
});