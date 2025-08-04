import { WorkflowDefinition } from '../types/workflow.types';
import { v4 as uuidv4 } from 'uuid';

export const workflows: WorkflowDefinition[] = [
  // Fraud Detection
  {
    useCaseId: 'fraud-detection',
    workflow: {
      id: uuidv4(),
      useCaseId: 'fraud-detection',
      name: 'Transaction Fraud Detection',
      description: 'Real-time fraud detection and prevention for financial transactions',
      industry: 'finance',
      version: '1.0.0',
      steps: [
        {
          id: 'monitor-transactions',
          name: 'Monitor Transactions',
          type: 'detect',
          agent: 'Monitoring Vanguard',
          service: 'fraud-detection',
          action: 'monitorTransactions',
          parameters: {
            realTime: true,
            riskThreshold: 0.7
          },
          outputs: ['transactions', 'riskScores'],
          errorHandling: {
            retry: { attempts: 3, delay: 1000 }
          }
        },
        {
          id: 'analyze-patterns',
          name: 'Analyze Transaction Patterns',
          type: 'analyze',
          agent: 'Analysis Vanguard',
          service: 'fraud-detection',
          action: 'analyzePatterns',
          parameters: {
            mlModels: ['anomaly', 'behavioral', 'network']
          },
          outputs: ['fraudIndicators', 'confidence'],
          errorHandling: {
            retry: { attempts: 2, delay: 2000 }
          }
        },
        {
          id: 'decide-action',
          name: 'Decide Response Action',
          type: 'decide',
          agent: 'Decision Vanguard',
          service: 'fraud-detection',
          action: 'decideAction',
          parameters: {
            autoBlock: true,
            thresholds: { high: 0.9, medium: 0.7, low: 0.5 }
          },
          outputs: ['decision', 'reason'],
          errorHandling: {
            escalate: true
          }
        },
        {
          id: 'execute-response',
          name: 'Execute Fraud Response',
          type: 'execute',
          agent: 'Response Vanguard',
          service: 'fraud-detection',
          action: 'executeResponse',
          parameters: {
            notifyCustomer: true,
            freezeAccount: false
          },
          outputs: ['responseStatus', 'customerNotified'],
          humanApprovalRequired: false,
          errorHandling: {
            notification: {
              channels: ['email', 'teams'],
              recipients: ['fraud-team@bank.com']
            }
          }
        },
        {
          id: 'verify-resolution',
          name: 'Verify Resolution',
          type: 'verify',
          agent: 'Verification Vanguard',
          service: 'fraud-detection',
          action: 'verifyResolution',
          parameters: {
            checkCustomerResponse: true
          },
          outputs: ['resolutionStatus', 'followUpRequired'],
          errorHandling: {
            retry: { attempts: 2, delay: 5000 }
          }
        },
        {
          id: 'compliance-report',
          name: 'Generate Compliance Report',
          type: 'report',
          agent: 'Compliance Vanguard',
          service: 'unified-reports',
          action: 'generateReport',
          parameters: {
            reportType: 'fraud-incident',
            regulatory: ['FinCEN', 'OCC']
          },
          outputs: ['reportId', 'filingStatus'],
          errorHandling: {
            retry: { attempts: 3, delay: 10000 }
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'transaction.suspicious'
        },
        {
          type: 'threshold',
          threshold: {
            metric: 'fraud.risk.score',
            operator: '>',
            value: 0.7
          }
        }
      ],
      metadata: {
        requiredServices: ['fraud-detection', 'unified-reports', 'notification'],
        requiredAgents: [
          'Monitoring Vanguard',
          'Analysis Vanguard',
          'Decision Vanguard',
          'Response Vanguard',
          'Verification Vanguard',
          'Compliance Vanguard'
        ],
        estimatedDuration: 300000, // 5 minutes
        criticality: 'critical',
        tags: ['fraud', 'security', 'compliance', 'real-time'],
        compliance: ['PCI-DSS', 'SOX', 'BSA/AML']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];