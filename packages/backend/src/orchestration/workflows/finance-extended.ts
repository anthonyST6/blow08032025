import { UseCaseWorkflow } from '../types/workflow.types';

const financeExtendedWorkflows: UseCaseWorkflow[] = [
  {
    id: 'credit-risk-workflow',
    useCaseId: 'credit-risk-assessment',
    name: 'Credit Risk Assessment Workflow',
    description: 'Comprehensive credit risk evaluation and scoring',
    industry: 'finance',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'loan.application.submitted'
      },
      {
        type: 'event',
        event: 'credit.review.requested'
      }
    ],
    steps: [
      {
        id: 'collect-credit-data',
        name: 'Collect Credit Information',
        type: 'detect',
        agent: 'monitoring',
        service: 'credit-risk-assessment',
        action: 'collectCreditData',
        parameters: {
          dataSources: ['credit_bureaus', 'bank_statements', 'employment', 'public_records'],
          comprehensiveCheck: true
        },
        outputs: ['creditData', 'dataCompleteness'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-creditworthiness',
        name: 'Analyze Creditworthiness',
        type: 'analyze',
        agent: 'analysis',
        service: 'credit-risk-assessment',
        action: 'analyzeCreditworthiness',
        parameters: {
          factors: ['payment_history', 'debt_ratio', 'credit_utilization', 'income_stability'],
          industryBenchmarks: true
        },
        outputs: ['creditAnalysis', 'riskFactors'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'calculate-risk-score',
        name: 'Calculate Risk Score',
        type: 'analyze',
        agent: 'prediction',
        service: 'credit-risk-assessment',
        action: 'calculateRiskScore',
        parameters: {
          scoringModels: ['fico', 'vantage', 'proprietary'],
          stressTestScenarios: true
        },
        outputs: ['riskScore', 'probabilityOfDefault'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'determine-credit-decision',
        name: 'Determine Credit Decision',
        type: 'decide',
        agent: 'optimization',
        service: 'credit-risk-assessment',
        action: 'determineCreditDecision',
        parameters: {
          decisionCriteria: ['risk_appetite', 'portfolio_balance', 'regulatory_limits'],
          pricingOptimization: true
        },
        outputs: ['creditDecision', 'terms'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'execute-decision',
        name: 'Execute Credit Decision',
        type: 'execute',
        agent: 'response',
        service: 'credit-risk-assessment',
        action: 'executeDecision',
        humanApprovalRequired: true,
        parameters: {
          documentGeneration: true,
          complianceChecks: true,
          notifyApplicant: true
        },
        conditions: [
          {
            field: 'context.riskScore',
            operator: '<',
            value: 700
          }
        ],
        outputs: ['executionStatus', 'documentation'],
        errorHandling: {
          notification: {
            recipients: ['credit-committee@bank.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'monitor-portfolio',
        name: 'Monitor Credit Portfolio',
        type: 'report',
        agent: 'monitoring',
        service: 'credit-risk-assessment',
        action: 'monitorPortfolio',
        parameters: {
          metrics: ['default_rate', 'exposure', 'concentration_risk'],
          earlyWarningSystem: true
        },
        outputs: ['portfolioReport', 'alerts'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['credit-risk-assessment', 'notification', 'credit-bureau-integration'],
      requiredAgents: ['monitoring', 'analysis', 'prediction', 'optimization', 'response'],
      estimatedDuration: 420000,
      criticality: 'high',
      compliance: ['Basel III', 'FCRA', 'Fair Lending'],
      tags: ['finance', 'credit-risk', 'lending', 'risk-assessment']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'portfolio-optimization-workflow',
    useCaseId: 'portfolio-optimization',
    name: 'Investment Portfolio Optimization Workflow',
    description: 'Optimize investment portfolios for risk-adjusted returns',
    industry: 'finance',
    version: '1.0.0',
    triggers: [
      {
        type: 'scheduled',
        schedule: '0 9 * * 1-5' // Weekdays at 9 AM
      },
      {
        type: 'event',
        event: 'market.volatility.spike'
      }
    ],
    steps: [
      {
        id: 'analyze-market-conditions',
        name: 'Analyze Market Conditions',
        type: 'detect',
        agent: 'monitoring',
        service: 'portfolio-optimization',
        action: 'analyzeMarketConditions',
        parameters: {
          markets: ['equities', 'bonds', 'commodities', 'currencies'],
          indicators: ['volatility', 'correlation', 'momentum', 'sentiment']
        },
        outputs: ['marketAnalysis', 'riskMetrics'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'assess-portfolio-performance',
        name: 'Assess Current Portfolio Performance',
        type: 'analyze',
        agent: 'analysis',
        service: 'portfolio-optimization',
        action: 'assessPerformance',
        parameters: {
          metrics: ['returns', 'sharpe_ratio', 'alpha', 'beta'],
          benchmarkComparison: true
        },
        outputs: ['performanceAnalysis', 'deviations'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'optimize-allocation',
        name: 'Optimize Asset Allocation',
        type: 'decide',
        agent: 'optimization',
        service: 'portfolio-optimization',
        action: 'optimizeAllocation',
        parameters: {
          optimizationMethod: 'mean_variance',
          constraints: ['risk_budget', 'sector_limits', 'liquidity'],
          rebalancingThreshold: 0.05
        },
        outputs: ['optimalAllocation', 'expectedReturns'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'generate-trades',
        name: 'Generate Rebalancing Trades',
        type: 'execute',
        agent: 'response',
        service: 'portfolio-optimization',
        action: 'generateTrades',
        humanApprovalRequired: true,
        parameters: {
          executionStrategy: 'vwap',
          taxOptimization: true,
          transactionCostAnalysis: true
        },
        conditions: [
          {
            field: 'context.expectedReturns.improvement',
            operator: '>',
            value: 0.02
          }
        ],
        outputs: ['tradeList', 'executionPlan'],
        errorHandling: {
          notification: {
            recipients: ['portfolio-manager@investment.com'],
            channels: ['email', 'slack']
          }
        }
      },
      {
        id: 'monitor-rebalancing',
        name: 'Monitor Rebalancing Impact',
        type: 'verify',
        agent: 'monitoring',
        service: 'portfolio-optimization',
        action: 'monitorRebalancing',
        parameters: {
          trackingMetrics: ['tracking_error', 'slippage', 'performance_attribution'],
          realTimeMonitoring: true
        },
        outputs: ['rebalancingReport', 'adjustments'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['portfolio-optimization', 'notification', 'market-data'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 360000,
      criticality: 'high',
      compliance: ['MiFID II', 'SEC', 'Fiduciary Rules'],
      tags: ['finance', 'portfolio', 'investment', 'optimization']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'aml-compliance-workflow',
    useCaseId: 'aml-compliance-monitoring',
    name: 'Anti-Money Laundering Compliance Workflow',
    description: 'Monitor and detect potential money laundering activities',
    industry: 'finance',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'transaction.flagged'
      },
      {
        type: 'threshold',
        threshold: {
          metric: 'transaction.amount',
          operator: '>',
          value: 10000
        }
      }
    ],
    steps: [
      {
        id: 'monitor-transactions',
        name: 'Monitor Financial Transactions',
        type: 'detect',
        agent: 'security',
        service: 'aml-compliance-monitoring',
        action: 'monitorTransactions',
        parameters: {
          transactionTypes: ['wire', 'cash', 'crypto', 'international'],
          patternDetection: true
        },
        outputs: ['suspiciousTransactions', 'riskIndicators'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'analyze-behavior',
        name: 'Analyze Customer Behavior',
        type: 'analyze',
        agent: 'analysis',
        service: 'aml-compliance-monitoring',
        action: 'analyzeBehavior',
        parameters: {
          behaviorModels: ['transaction_velocity', 'network_analysis', 'peer_comparison'],
          historicalBaseline: true
        },
        outputs: ['behaviorAnalysis', 'anomalies'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'assess-risk',
        name: 'Assess Money Laundering Risk',
        type: 'analyze',
        agent: 'compliance',
        service: 'aml-compliance-monitoring',
        action: 'assessRisk',
        parameters: {
          riskFactors: ['customer_profile', 'geography', 'transaction_pattern', 'pep_status'],
          regulatoryRules: true
        },
        outputs: ['riskAssessment', 'complianceScore'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'determine-action',
        name: 'Determine Compliance Action',
        type: 'decide',
        agent: 'compliance',
        service: 'aml-compliance-monitoring',
        action: 'determineAction',
        parameters: {
          actionTypes: ['monitor', 'investigate', 'report', 'freeze'],
          regulatoryRequirements: true
        },
        outputs: ['complianceAction', 'documentation'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'file-sar',
        name: 'File Suspicious Activity Report',
        type: 'execute',
        agent: 'response',
        service: 'aml-compliance-monitoring',
        action: 'fileSAR',
        humanApprovalRequired: true,
        parameters: {
          reportingAgency: 'fincen',
          includeEvidence: true,
          timelyFiling: true
        },
        conditions: [
          {
            field: 'context.complianceScore',
            operator: '>',
            value: 0.8
          }
        ],
        outputs: ['sarFiled', 'caseNumber'],
        errorHandling: {
          notification: {
            recipients: ['compliance-officer@bank.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'update-records',
        name: 'Update Compliance Records',
        type: 'report',
        agent: 'compliance',
        service: 'aml-compliance-monitoring',
        action: 'updateRecords',
        parameters: {
          recordTypes: ['customer_risk', 'transaction_history', 'compliance_actions'],
          auditTrail: true
        },
        outputs: ['recordsUpdated', 'auditLog'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['aml-compliance-monitoring', 'notification', 'regulatory-reporting'],
      requiredAgents: ['security', 'analysis', 'compliance', 'response'],
      estimatedDuration: 480000,
      criticality: 'critical',
      compliance: ['BSA', 'USA PATRIOT Act', 'FinCEN'],
      tags: ['finance', 'aml', 'compliance', 'regulatory']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'algorithmic-trading-workflow',
    useCaseId: 'algorithmic-trading',
    name: 'Algorithmic Trading Strategy Workflow',
    description: 'Execute automated trading strategies based on market signals',
    industry: 'finance',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'market.signal.detected'
      },
      {
        type: 'scheduled',
        schedule: '*/5 * * * * *' // Every 5 seconds during market hours
      }
    ],
    steps: [
      {
        id: 'collect-market-data',
        name: 'Collect Real-time Market Data',
        type: 'detect',
        agent: 'monitoring',
        service: 'algorithmic-trading',
        action: 'collectMarketData',
        parameters: {
          dataFeeds: ['level2', 'options_chain', 'news_sentiment', 'order_flow'],
          latencyTarget: '1ms'
        },
        outputs: ['marketData', 'signals'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 100
          }
        }
      },
      {
        id: 'generate-signals',
        name: 'Generate Trading Signals',
        type: 'analyze',
        agent: 'prediction',
        service: 'algorithmic-trading',
        action: 'generateSignals',
        parameters: {
          strategies: ['momentum', 'mean_reversion', 'arbitrage', 'ml_based'],
          signalStrength: true
        },
        outputs: ['tradingSignals', 'confidence'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 50
          }
        }
      },
      {
        id: 'assess-risk',
        name: 'Assess Trading Risk',
        type: 'analyze',
        agent: 'analysis',
        service: 'algorithmic-trading',
        action: 'assessRisk',
        parameters: {
          riskMetrics: ['var', 'position_size', 'correlation', 'liquidity'],
          portfolioImpact: true
        },
        outputs: ['riskAssessment', 'positionLimits'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 50
          }
        }
      },
      {
        id: 'optimize-execution',
        name: 'Optimize Trade Execution',
        type: 'decide',
        agent: 'optimization',
        service: 'algorithmic-trading',
        action: 'optimizeExecution',
        parameters: {
          executionAlgos: ['twap', 'vwap', 'implementation_shortfall', 'adaptive'],
          slippageMinimization: true
        },
        outputs: ['executionPlan', 'orderSequence'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 100
          }
        }
      },
      {
        id: 'execute-trades',
        name: 'Execute Trading Orders',
        type: 'execute',
        agent: 'response',
        service: 'algorithmic-trading',
        action: 'executeTrades',
        humanApprovalRequired: false,
        parameters: {
          venues: ['primary_exchange', 'dark_pools', 'ecns'],
          smartRouting: true,
          fillTracking: true
        },
        conditions: [
          {
            field: 'context.confidence',
            operator: '>',
            value: 0.7
          }
        ],
        outputs: ['executionReport', 'fills'],
        errorHandling: {
          notification: {
            recipients: ['trading-desk@hedge.fund'],
            channels: ['slack', 'webhook']
          }
        }
      },
      {
        id: 'analyze-performance',
        name: 'Analyze Trading Performance',
        type: 'report',
        agent: 'monitoring',
        service: 'algorithmic-trading',
        action: 'analyzePerformance',
        parameters: {
          metrics: ['pnl', 'sharpe', 'slippage', 'fill_rate'],
          attribution: true
        },
        outputs: ['performanceReport', 'improvements'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 1000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['algorithmic-trading', 'notification', 'market-data', 'execution'],
      requiredAgents: ['monitoring', 'prediction', 'analysis', 'optimization', 'response'],
      estimatedDuration: 5000, // 5 seconds for high-frequency trading
      criticality: 'critical',
      compliance: ['MiFID II', 'Reg NMS', 'MAR'],
      tags: ['finance', 'trading', 'algorithmic', 'high-frequency']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'insurance-underwriting-workflow',
    useCaseId: 'insurance-underwriting',
    name: 'Automated Insurance Underwriting Workflow',
    description: 'Automate insurance underwriting and risk pricing',
    industry: 'finance',
    version: '1.0.0',
    triggers: [
      {
        type: 'event',
        event: 'insurance.application.received'
      }
    ],
    steps: [
      {
        id: 'collect-applicant-data',
        name: 'Collect Applicant Information',
        type: 'detect',
        agent: 'monitoring',
        service: 'insurance-underwriting',
        action: 'collectApplicantData',
        parameters: {
          dataTypes: ['personal', 'medical', 'financial', 'property'],
          externalSources: true
        },
        outputs: ['applicantData', 'dataQuality'],
        errorHandling: {
          retry: {
            attempts: 3,
            delay: 5000
          }
        }
      },
      {
        id: 'assess-risk-factors',
        name: 'Assess Risk Factors',
        type: 'analyze',
        agent: 'analysis',
        service: 'insurance-underwriting',
        action: 'assessRiskFactors',
        parameters: {
          riskCategories: ['health', 'lifestyle', 'occupation', 'location'],
          predictiveModeling: true
        },
        outputs: ['riskAssessment', 'riskScore'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 3000
          }
        }
      },
      {
        id: 'calculate-premium',
        name: 'Calculate Insurance Premium',
        type: 'decide',
        agent: 'optimization',
        service: 'insurance-underwriting',
        action: 'calculatePremium',
        parameters: {
          pricingModels: ['actuarial', 'competitive', 'profitability'],
          discountEligibility: true
        },
        outputs: ['premiumQuote', 'coverageOptions'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 5000
          }
        }
      },
      {
        id: 'generate-policy',
        name: 'Generate Insurance Policy',
        type: 'execute',
        agent: 'response',
        service: 'insurance-underwriting',
        action: 'generatePolicy',
        humanApprovalRequired: true,
        parameters: {
          policyTerms: true,
          exclusions: true,
          regulatoryCompliance: true
        },
        conditions: [
          {
            field: 'context.riskScore',
            operator: '<',
            value: 0.8
          }
        ],
        outputs: ['policyDocument', 'terms'],
        errorHandling: {
          notification: {
            recipients: ['underwriting@insurance.com'],
            channels: ['email', 'teams']
          }
        }
      },
      {
        id: 'monitor-portfolio',
        name: 'Monitor Insurance Portfolio',
        type: 'report',
        agent: 'monitoring',
        service: 'insurance-underwriting',
        action: 'monitorPortfolio',
        parameters: {
          metrics: ['loss_ratio', 'combined_ratio', 'retention_rate'],
          portfolioOptimization: true
        },
        outputs: ['portfolioReport', 'adjustments'],
        errorHandling: {
          retry: {
            attempts: 2,
            delay: 2000
          }
        }
      }
    ],
    metadata: {
      requiredServices: ['insurance-underwriting', 'notification', 'actuarial-models'],
      requiredAgents: ['monitoring', 'analysis', 'optimization', 'response'],
      estimatedDuration: 300000,
      criticality: 'high',
      compliance: ['State Insurance Regulations', 'NAIC', 'Solvency II'],
      tags: ['finance', 'insurance', 'underwriting', 'risk-pricing']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default financeExtendedWorkflows;