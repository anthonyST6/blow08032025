import { reportService, ReportContent } from './report.service';
import { logger } from '../utils/logger';
import { promises as fs } from 'fs';
import path from 'path';

// Data models for finance & banking
interface Transaction {
  transactionId: string;
  accountId: string;
  customerId: string;
  timestamp: Date;
  amount: number;
  currency: string;
  type: 'debit' | 'credit' | 'transfer' | 'withdrawal' | 'deposit';
  merchantCategory: string;
  merchantName: string;
  location: {
    country: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  channel: 'online' | 'atm' | 'pos' | 'mobile' | 'branch';
  fraudScore: number; // 0-100
  fraudIndicators: string[];
  status: 'approved' | 'declined' | 'pending' | 'flagged';
}

interface FraudAlert {
  alertId: string;
  transactionId: string;
  detectedAt: Date;
  alertType: 'velocity' | 'location' | 'amount' | 'pattern' | 'merchant' | 'device';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  description: string;
  investigationStatus: 'new' | 'investigating' | 'confirmed' | 'false-positive' | 'resolved';
  actionTaken: string;
  financialImpact: number;
}

interface LoanApplication {
  applicationId: string;
  customerId: string;
  applicantName: string;
  applicationDate: Date;
  loanType: 'personal' | 'mortgage' | 'auto' | 'business' | 'student';
  requestedAmount: number;
  approvedAmount?: number;
  term: number; // months
  interestRate?: number;
  creditScore: number;
  annualIncome: number;
  debtToIncomeRatio: number;
  employmentStatus: 'employed' | 'self-employed' | 'retired' | 'student' | 'unemployed';
  status: 'submitted' | 'under-review' | 'approved' | 'declined' | 'withdrawn';
  decisionDate?: Date;
  decisionReason?: string;
  riskScore: number;
}

interface RiskAssessment {
  assessmentId: string;
  applicationId: string;
  assessmentDate: Date;
  creditRisk: number; // 0-100
  operationalRisk: number; // 0-100
  marketRisk: number; // 0-100
  overallRisk: number; // 0-100
  riskFactors: {
    factor: string;
    weight: number;
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  recommendation: 'approve' | 'decline' | 'manual-review';
  suggestedTerms?: {
    amount: number;
    rate: number;
    term: number;
  };
}

interface FraudModel {
  modelId: string;
  modelName: string;
  version: string;
  lastTrainingDate: Date;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  truePositiveRate: number;
  threshold: number;
}

class FinanceReportsService {
  private readonly reportsDir = path.join(process.cwd(), 'reports');
  private readonly publicReportsDir = path.join(process.cwd(), 'public', 'reports');

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
      await fs.mkdir(this.publicReportsDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create report directories:', error);
    }
  }

  // Generate sample transactions
  private generateSampleTransactions(count: number = 1000): Transaction[] {
    const merchantCategories = ['Grocery', 'Gas Station', 'Restaurant', 'Online Shopping', 'Entertainment', 'Travel', 'Healthcare', 'Utilities'];
    const channels: Transaction['channel'][] = ['online', 'atm', 'pos', 'mobile', 'branch'];
    const countries = ['USA', 'Canada', 'UK', 'France', 'Germany', 'Japan', 'Australia'];
    
    return Array.from({ length: count }, (_, i) => {
      const timestamp = new Date();
      timestamp.setMinutes(timestamp.getMinutes() - Math.floor(Math.random() * 10080)); // Last week
      
      const amount = Math.random() > 0.9 ? 
        1000 + Math.random() * 9000 : // Large transactions
        10 + Math.random() * 490; // Normal transactions
      
      const isSuspicious = Math.random() > 0.95;
      const fraudScore = isSuspicious ? 60 + Math.random() * 40 : Math.random() * 40;
      
      return {
        transactionId: `TXN-${String(i + 1).padStart(10, '0')}`,
        accountId: `ACC-${String(Math.floor(Math.random() * 10000)).padStart(8, '0')}`,
        customerId: `CUST-${String(Math.floor(Math.random() * 5000)).padStart(6, '0')}`,
        timestamp,
        amount: Math.round(amount * 100) / 100,
        currency: 'USD',
        type: ['debit', 'credit', 'transfer', 'withdrawal', 'deposit'][Math.floor(Math.random() * 5)] as any,
        merchantCategory: merchantCategories[Math.floor(Math.random() * merchantCategories.length)],
        merchantName: `Merchant ${Math.floor(Math.random() * 1000)}`,
        location: {
          country: countries[Math.floor(Math.random() * countries.length)],
          city: `City ${Math.floor(Math.random() * 100)}`,
          coordinates: {
            lat: -90 + Math.random() * 180,
            lng: -180 + Math.random() * 360
          }
        },
        channel: channels[Math.floor(Math.random() * channels.length)],
        fraudScore,
        fraudIndicators: fraudScore > 60 ? this.getFraudIndicators() : [],
        status: fraudScore > 80 ? 'flagged' : fraudScore > 60 ? 'pending' : 'approved'
      };
    });
  }

  private getFraudIndicators(): string[] {
    const indicators = [
      'Unusual location',
      'High velocity',
      'Large amount',
      'New merchant',
      'Device mismatch',
      'Time anomaly',
      'Pattern deviation'
    ];
    
    const count = 1 + Math.floor(Math.random() * 3);
    return indicators.sort(() => Math.random() - 0.5).slice(0, count);
  }

  // 1. Real-time Fraud Detection Dashboard
  async generateFraudDetectionDashboard() {
    const transactions = this.generateSampleTransactions(500);
    const recentTransactions = transactions.filter(t => 
      t.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    
    const flaggedTransactions = recentTransactions.filter(t => t.status === 'flagged' || t.status === 'pending');
    const totalAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const flaggedAmount = flaggedTransactions.reduce((sum, t) => sum + t.amount, 0);

    const content: ReportContent = {
      title: 'Real-time Fraud Detection Dashboard',
      subtitle: 'AI-powered transaction monitoring and fraud prevention',
      sections: [
        {
          heading: 'Executive Summary',
          content: `Transactions Monitored (24h): ${recentTransactions.length}\nTransactions Flagged: ${flaggedTransactions.length}\nFraud Detection Rate: ${((flaggedTransactions.length / recentTransactions.length) * 100).toFixed(2)}%\nTotal Transaction Volume: $${totalAmount.toLocaleString()}\nAmount at Risk: $${flaggedAmount.toLocaleString()}\nFalse Positive Rate: 2.3%`,
          type: 'text'
        },
        {
          heading: 'High-Risk Transactions',
          content: flaggedTransactions
            .sort((a, b) => b.fraudScore - a.fraudScore)
            .slice(0, 10)
            .map(t => ({
              'Transaction ID': t.transactionId,
              'Time': t.timestamp.toLocaleString(),
              'Amount': `$${t.amount.toLocaleString()}`,
              'Type': t.type.toUpperCase(),
              'Channel': t.channel.toUpperCase(),
              'Fraud Score': `${t.fraudScore.toFixed(1)}%`,
              'Indicators': t.fraudIndicators.join(', '),
              'Status': t.status.toUpperCase()
            })),
          type: 'table'
        },
        {
          heading: 'Immediate Actions Required',
          content: [
            'Block 3 high-risk accounts showing coordinated fraud patterns',
            'Contact customers for 5 transactions exceeding $10,000',
            'Review all international wire transfers from new accounts',
            'Update fraud rules for emerging cryptocurrency scams',
            'Escalate merchant category code 5999 transactions for manual review'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Real-time Fraud Detection Dashboard',
      description: 'AI-powered fraud monitoring and alerts',
      type: 'pdf',
      agent: 'Vanguard Fraud Detection Agent',
      useCaseId: 'fraud-detection',
      workflowId: 'realtime-monitoring'
    });
  }

  // 2. Fraud Pattern Analysis Report
  async generateFraudPatternAnalysis() {
    const transactions = this.generateSampleTransactions(5000);
    const fraudAlerts = this.generateFraudAlerts(transactions);
    
    const patternAnalysis = this.analyzeFraudPatterns(fraudAlerts);
    
    const excelData = {
      'Pattern Summary': patternAnalysis.patterns.map(p => ({
        'Pattern Type': p.type,
        'Occurrences': p.count,
        'Avg Fraud Score': p.avgScore.toFixed(1),
        'Financial Impact': `$${p.totalAmount.toLocaleString()}`,
        'Detection Rate': `${p.detectionRate.toFixed(1)}%`,
        'Trend': p.trend
      })),
      'Geographic Analysis': patternAnalysis.geographic,
      'Temporal Patterns': patternAnalysis.temporal,
      'Merchant Risk Scores': patternAnalysis.merchantRisk,
      'Customer Risk Profiles': this.generateCustomerRiskProfiles(transactions)
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Fraud Pattern Analysis Report',
      description: 'Comprehensive fraud pattern identification and analysis',
      type: 'xlsx',
      agent: 'Vanguard Pattern Analysis Agent',
      useCaseId: 'fraud-detection',
      workflowId: 'pattern-analysis'
    });
  }

  // 3. Loan Processing Dashboard
  async generateLoanProcessingDashboard() {
    const applications = this.generateSampleLoanApplications(200);
    const recentApplications = applications.filter(a =>
      a.applicationDate.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    const content: ReportContent = {
      title: 'Loan Processing Dashboard - Weekly Report',
      subtitle: 'Automated loan application processing and decision analytics',
      sections: [
        {
          heading: 'Processing Summary',
          content: `Total Applications (Week): ${recentApplications.length}\nApproved: ${recentApplications.filter(a => a.status === 'approved').length}\nDeclined: ${recentApplications.filter(a => a.status === 'declined').length}\nPending Review: ${recentApplications.filter(a => a.status === 'under-review').length}\nAverage Processing Time: 4.2 hours\nApproval Rate: ${((recentApplications.filter(a => a.status === 'approved').length / recentApplications.length) * 100).toFixed(1)}%`,
          type: 'text'
        },
        {
          heading: 'Recent Applications',
          content: recentApplications.slice(0, 10).map(a => ({
            'Application ID': a.applicationId,
            'Customer': a.applicantName,
            'Loan Type': a.loanType.toUpperCase(),
            'Amount': `$${a.requestedAmount.toLocaleString()}`,
            'Credit Score': a.creditScore,
            'Risk Score': a.riskScore,
            'Status': a.status.toUpperCase(),
            'Decision': a.decisionDate ? a.decisionDate.toLocaleDateString() : 'Pending'
          })),
          type: 'table'
        },
        {
          heading: 'Process Optimization Recommendations',
          content: [
            'Implement instant approval for low-risk personal loans under $10,000',
            'Add income verification API for faster employment checks',
            'Enhance credit scoring model with alternative data sources',
            'Automate document collection through customer portal',
            'Reduce manual review queue by 40% with improved ML models'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Loan Processing Dashboard - Weekly Report',
      description: 'Automated loan processing metrics and analytics',
      type: 'pdf',
      agent: 'Vanguard Loan Processing Agent',
      useCaseId: 'loan-processing',
      workflowId: 'weekly-dashboard'
    });
  }

  // 4. Credit Risk Assessment Report
  async generateCreditRiskAssessment() {
    const applications = this.generateSampleLoanApplications(300);
    const riskAssessments = this.generateRiskAssessments(applications);
    
    const riskDistribution = this.analyzeRiskDistribution(riskAssessments);
    
    const excelData = {
      'Risk Distribution': riskDistribution.summary,
      'Detailed Assessments': riskAssessments.slice(0, 50).map(r => {
        const app = applications.find(a => a.applicationId === r.applicationId)!;
        return {
          'Application ID': r.applicationId,
          'Loan Type': app.loanType.toUpperCase(),
          'Amount': `$${app.requestedAmount.toLocaleString()}`,
          'Credit Risk': r.creditRisk.toFixed(1),
          'Operational Risk': r.operationalRisk.toFixed(1),
          'Market Risk': r.marketRisk.toFixed(1),
          'Overall Risk': r.overallRisk.toFixed(1),
          'Recommendation': r.recommendation.toUpperCase()
        };
      }),
      'Risk Factors': riskDistribution.topRiskFactors,
      'Portfolio Analysis': riskDistribution.portfolioMetrics
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Credit Risk Assessment Report',
      description: 'Comprehensive credit risk analysis for loan portfolio',
      type: 'xlsx',
      agent: 'Vanguard Risk Assessment Agent',
      useCaseId: 'loan-processing',
      workflowId: 'risk-assessment'
    });
  }

  // 5. Fraud Model Performance Report
  async generateFraudModelPerformance() {
    const models = this.generateFraudModels();
    
    const content: ReportContent = {
      title: 'Fraud Detection Model Performance Report',
      subtitle: 'ML model accuracy and effectiveness analysis',
      sections: [
        {
          heading: 'Model Performance Overview',
          content: `Active Models: ${models.length}\nAverage Accuracy: ${(models.reduce((sum: number, m: FraudModel) => sum + m.accuracy, 0) / models.length).toFixed(2)}%\nAverage F1 Score: ${(models.reduce((sum: number, m: FraudModel) => sum + m.f1Score, 0) / models.length).toFixed(3)}\nFrauds Prevented (Month): $${(2500000 + Math.random() * 1000000).toLocaleString()}\nFalse Positives Reduced: 23%`,
          type: 'text'
        },
        {
          heading: 'Model Comparison',
          content: models.map((m: FraudModel) => ({
            'Model': m.modelName,
            'Version': m.version,
            'Accuracy': `${m.accuracy.toFixed(2)}%`,
            'Precision': m.precision.toFixed(3),
            'Recall': m.recall.toFixed(3),
            'F1 Score': m.f1Score.toFixed(3),
            'FPR': `${(m.falsePositiveRate * 100).toFixed(2)}%`
          })),
          type: 'table'
        },
        {
          heading: 'Model Improvement Recommendations',
          content: [
            'Retrain models with latest fraud patterns from Q4 2024',
            'Implement ensemble approach for high-value transactions',
            'Add behavioral biometrics features to reduce false positives',
            'Optimize threshold settings for different transaction types',
            'Deploy real-time model monitoring and drift detection'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Fraud Detection Model Performance Report',
      description: 'ML model effectiveness and optimization analysis',
      type: 'pdf',
      agent: 'Vanguard ML Performance Agent',
      useCaseId: 'fraud-detection',
      workflowId: 'model-performance'
    });
  }

  // 6. Regulatory Compliance Report
  async generateRegulatoryComplianceReport() {
    const jsonData = {
      reportDate: new Date().toISOString(),
      complianceStatus: {
        overall: 'Compliant',
        score: 96.8,
        lastAuditDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      regulations: [
        {
          regulation: 'BSA/AML',
          status: 'Compliant',
          score: 97.5,
          findings: 2,
          remediated: 2,
          nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          regulation: 'KYC',
          status: 'Compliant',
          score: 98.2,
          findings: 1,
          remediated: 1,
          nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          regulation: 'GDPR',
          status: 'Compliant',
          score: 95.8,
          findings: 3,
          remediated: 2,
          nextReview: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          regulation: 'PCI DSS',
          status: 'Compliant',
          score: 96.3,
          findings: 2,
          remediated: 2,
          nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      suspiciousActivityReports: {
        filed: 23,
        pending: 5,
        averageFilingTime: '48 hours'
      },
      trainingCompliance: {
        completed: 892,
        pending: 108,
        overdue: 12,
        completionRate: 88.1
      },
      recommendations: [
        'Update AML transaction monitoring rules for cryptocurrency',
        'Enhance customer due diligence for high-risk jurisdictions',
        'Implement automated SAR filing workflow',
        'Strengthen third-party vendor compliance monitoring',
        'Deploy continuous compliance monitoring dashboard'
      ]
    };

    return await reportService.generateJSONReport(jsonData, {
      name: 'Regulatory Compliance Status Report',
      description: 'Comprehensive regulatory compliance tracking',
      type: 'json',
      agent: 'Vanguard Compliance Agent',
      useCaseId: 'fraud-detection',
      workflowId: 'regulatory-compliance'
    });
  }

  // Helper methods
  private generateFraudAlerts(transactions: Transaction[]): FraudAlert[] {
    const suspiciousTransactions = transactions.filter(t => t.fraudScore > 60);
    const alertTypes: FraudAlert['alertType'][] = ['velocity', 'location', 'amount', 'pattern', 'merchant', 'device'];
    
    return suspiciousTransactions.map((t, i) => ({
      alertId: `ALERT-${String(i + 1).padStart(8, '0')}`,
      transactionId: t.transactionId,
      detectedAt: new Date(t.timestamp.getTime() + Math.random() * 300000), // Within 5 minutes
      alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: t.fraudScore > 90 ? 'critical' : t.fraudScore > 80 ? 'high' : t.fraudScore > 70 ? 'medium' : 'low',
      confidence: t.fraudScore,
      description: `${t.fraudIndicators.join(', ')} detected for ${t.type} transaction`,
      investigationStatus: t.fraudScore > 80 ? 'investigating' : 'new',
      actionTaken: t.fraudScore > 90 ? 'Transaction blocked' : 'Under review',
      financialImpact: t.amount
    }));
  }

  private analyzeFraudPatterns(_alerts: FraudAlert[]) {
    const patterns = [
      { type: 'Velocity Attack', count: 45, avgScore: 82.5, totalAmount: 125000, detectionRate: 94.2, trend: 'Increasing' },
      { type: 'Account Takeover', count: 23, avgScore: 88.3, totalAmount: 450000, detectionRate: 91.7, trend: 'Stable' },
      { type: 'Card Testing', count: 67, avgScore: 75.2, totalAmount: 15000, detectionRate: 96.8, trend: 'Decreasing' },
      { type: 'Merchant Fraud', count: 12, avgScore: 91.5, totalAmount: 280000, detectionRate: 88.5, trend: 'Increasing' }
    ];

    const geographic = [
      { Country: 'USA', 'Fraud Count': 89, 'Avg Score': 78.5, 'Total Loss': '$340,000' },
      { Country: 'UK', 'Fraud Count': 34, 'Avg Score': 82.1, 'Total Loss': '$125,000' },
      { Country: 'Canada', 'Fraud Count': 28, 'Avg Score': 76.3, 'Total Loss': '$95,000' }
    ];

    const temporal = [
      { 'Time Period': '00:00-06:00', 'Fraud Rate': '12.3%', 'Avg Amount': '$2,450' },
      { 'Time Period': '06:00-12:00', 'Fraud Rate': '8.7%', 'Avg Amount': '$1,230' },
      { 'Time Period': '12:00-18:00', 'Fraud Rate': '6.5%', 'Avg Amount': '$890' },
      { 'Time Period': '18:00-00:00', 'Fraud Rate': '10.2%', 'Avg Amount': '$1,670' }
    ];

    const merchantRisk = [
      { 'Merchant Category': 'Online Gaming', 'Risk Score': 85, 'Fraud Rate': '4.2%' },
      { 'Merchant Category': 'Cryptocurrency', 'Risk Score': 92, 'Fraud Rate': '6.8%' },
      { 'Merchant Category': 'International Wire', 'Risk Score': 78, 'Fraud Rate': '3.5%' }
    ];

    return { patterns, geographic, temporal, merchantRisk };
  }

  private generateSampleLoanApplications(count: number): LoanApplication[] {
    const loanTypes: LoanApplication['loanType'][] = ['personal', 'mortgage', 'auto', 'business', 'student'];
    const statuses: LoanApplication['status'][] = ['submitted', 'under-review', 'approved', 'declined', 'withdrawn'];
    const employmentStatuses: LoanApplication['employmentStatus'][] = ['employed', 'self-employed', 'retired', 'student', 'unemployed'];
    
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    
    return Array.from({ length: count }, (_, i) => {
      const applicationDate = new Date();
      applicationDate.setDate(applicationDate.getDate() - Math.floor(Math.random() * 30));
      
      const loanType = loanTypes[Math.floor(Math.random() * loanTypes.length)];
      const requestedAmount = loanType === 'mortgage' ? 100000 + Math.random() * 400000 :
                            loanType === 'auto' ? 15000 + Math.random() * 35000 :
                            loanType === 'business' ? 50000 + Math.random() * 450000 :
                            loanType === 'student' ? 10000 + Math.random() * 40000 :
                            5000 + Math.random() * 45000;
      
      const creditScore = 550 + Math.floor(Math.random() * 300);
      const status = creditScore > 700 && Math.random() > 0.2 ? 'approved' : 
                    creditScore < 600 && Math.random() > 0.3 ? 'declined' :
                    statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        applicationId: `APP-${String(i + 1).padStart(8, '0')}`,
        customerId: `CUST-${String(Math.floor(Math.random() * 5000)).padStart(6, '0')}`,
        applicantName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        applicationDate,
        loanType,
        requestedAmount: Math.round(requestedAmount),
        approvedAmount: status === 'approved' ? Math.round(requestedAmount * (0.8 + Math.random() * 0.2)) : undefined,
        term: loanType === 'mortgage' ? 360 : loanType === 'auto' ? 60 : 36,
        interestRate: status === 'approved' ? 3 + Math.random() * 15 : undefined,
        creditScore,
        annualIncome: 30000 + Math.floor(Math.random() * 170000),
        debtToIncomeRatio: 0.1 + Math.random() * 0.5,
        employmentStatus: employmentStatuses[Math.floor(Math.random() * employmentStatuses.length)],
        status,
        decisionDate: status === 'approved' || status === 'declined' ? new Date(applicationDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        decisionReason: status === 'declined' ? 'Credit score below threshold' : undefined,
        riskScore: Math.floor(Math.random() * 100)
      };
    });
  }

  private generateRiskAssessments(applications: LoanApplication[]): RiskAssessment[] {
    return applications.map(app => ({
      assessmentId: `RISK-${app.applicationId}`,
      applicationId: app.applicationId,
      assessmentDate: app.applicationDate,
      creditRisk: Math.max(0, Math.min(100, 100 - (app.creditScore - 550) / 3)),
      operationalRisk: Math.random() * 50,
      marketRisk: Math.random() * 40,
      overallRisk: 0, // Will be calculated
      riskFactors: [
        { factor: 'Credit History', weight: 0.4, score: app.creditScore / 8.5, impact: (app.creditScore > 700 ? 'positive' : app.creditScore < 600 ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral' },
        { factor: 'Income Stability', weight: 0.3, score: app.employmentStatus === 'employed' ? 80 : 50, impact: (app.employmentStatus === 'employed' ? 'positive' : 'neutral') as 'positive' | 'negative' | 'neutral' },
        { factor: 'Debt-to-Income', weight: 0.2, score: (1 - app.debtToIncomeRatio) * 100, impact: (app.debtToIncomeRatio < 0.3 ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral' },
        { factor: 'Loan Purpose', weight: 0.1, score: 70, impact: 'neutral' as 'positive' | 'negative' | 'neutral' }
      ],
      recommendation: (app.creditScore > 700 && app.debtToIncomeRatio < 0.4 ? 'approve' :
                     app.creditScore < 600 || app.debtToIncomeRatio > 0.5 ? 'decline' : 'manual-review') as 'approve' | 'decline' | 'manual-review',
      suggestedTerms: app.creditScore > 650 ? {
        amount: app.requestedAmount * 0.9,
        rate: 5 + (850 - app.creditScore) / 50,
        term: app.term
      } : undefined
    })).map(assessment => {
      assessment.overallRisk = (assessment.creditRisk * 0.5 + assessment.operationalRisk * 0.3 + assessment.marketRisk * 0.2);
      return assessment;
    });
  }

  private analyzeRiskDistribution(assessments: RiskAssessment[]) {
    const riskBands = [
      { band: 'Low Risk (0-30)', count: assessments.filter(a => a.overallRisk <= 30).length },
      { band: 'Medium Risk (30-60)', count: assessments.filter(a => a.overallRisk > 30 && a.overallRisk <= 60).length },
      { band: 'High Risk (60-80)', count: assessments.filter(a => a.overallRisk > 60 && a.overallRisk <= 80).length },
      { band: 'Very High Risk (80-100)', count: assessments.filter(a => a.overallRisk > 80).length }
    ];

    const topRiskFactors = [
      { Factor: 'Low Credit Score', Count: assessments.filter(a => a.creditRisk > 70).length, 'Avg Impact': '35%' },
      { Factor: 'High Debt-to-Income', Count: assessments.filter(a => a.riskFactors.find(f => f.factor === 'Debt-to-Income')?.impact === 'negative').length, 'Avg Impact': '25%' },
      { Factor: 'Employment Instability', Count: assessments.filter(a => a.riskFactors.find(f => f.factor === 'Income Stability')?.impact !== 'positive').length, 'Avg Impact': '20%' }
    ];

    const portfolioMetrics = [
      { Metric: 'Average Risk Score', Value: (assessments.reduce((sum, a) => sum + a.overallRisk, 0) / assessments.length).toFixed(1) },
      { Metric: 'Approval Rate', Value: `${((assessments.filter(a => a.recommendation === 'approve').length / assessments.length) * 100).toFixed(1)}%` },
      { Metric: 'Manual Review Rate', Value: `${((assessments.filter(a => a.recommendation === 'manual-review').length / assessments.length) * 100).toFixed(1)}%` },
      { Metric: 'Average Suggested Rate', Value: `${(assessments.filter(a => a.suggestedTerms).reduce((sum, a) => sum + (a.suggestedTerms?.rate || 0), 0) / assessments.filter(a => a.suggestedTerms).length).toFixed(2)}%` }
    ];

    return {
      summary: riskBands,
      topRiskFactors,
      portfolioMetrics
    };
  }

  private generateCustomerRiskProfiles(transactions: Transaction[]) {
    const customerProfiles = new Map<string, any>();
    
    transactions.forEach(t => {
      if (!customerProfiles.has(t.customerId)) {
        customerProfiles.set(t.customerId, {
          customerId: t.customerId,
          transactionCount: 0,
          totalAmount: 0,
          avgFraudScore: 0,
          riskLevel: 'Low'
        });
      }
      
      const profile = customerProfiles.get(t.customerId);
      profile.transactionCount++;
      profile.totalAmount += t.amount;
      profile.avgFraudScore = (profile.avgFraudScore * (profile.transactionCount - 1) + t.fraudScore) / profile.transactionCount;
    });

    return Array.from(customerProfiles.values())
      .map(profile => ({
        'Customer ID': profile.customerId,
        'Transactions': profile.transactionCount,
        'Total Amount': `$${profile.totalAmount.toLocaleString()}`,
        'Avg Fraud Score': profile.avgFraudScore.toFixed(1),
        'Risk Level': profile.avgFraudScore > 60 ? 'High' : profile.avgFraudScore > 30 ? 'Medium' : 'Low'
      }))
      .sort((a, b) => parseFloat(b['Avg Fraud Score']) - parseFloat(a['Avg Fraud Score']))
      .slice(0, 20);
  }

  private generateFraudModels(): FraudModel[] {
    return [
      {
        modelId: 'MODEL-001',
        modelName: 'Deep Neural Network v3.2',
        version: '3.2.1',
        lastTrainingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        accuracy: 94.7,
        precision: 0.923,
        recall: 0.891,
        f1Score: 0.907,
        falsePositiveRate: 0.023,
        truePositiveRate: 0.891,
        threshold: 0.75
      },
      {
        modelId: 'MODEL-002',
        modelName: 'Random Forest Ensemble',
        version: '2.8.4',
        lastTrainingDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        accuracy: 92.3,
        precision: 0.905,
        recall: 0.872,
        f1Score: 0.888,
        falsePositiveRate: 0.031,
        truePositiveRate: 0.872,
        threshold: 0.70
      },
      {
        modelId: 'MODEL-003',
        modelName: 'Gradient Boosting Classifier',
        version: '4.1.0',
        lastTrainingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        accuracy: 93.5,
        precision: 0.918,
        recall: 0.883,
        f1Score: 0.900,
        falsePositiveRate: 0.027,
        truePositiveRate: 0.883,
        threshold: 0.72
      }
    ];
  }

  // Generate all reports
  async generateAllReports() {
    try {
      logger.info('Generating all finance & banking reports...');
      
      const reports = await Promise.all([
        this.generateFraudDetectionDashboard(),
        this.generateFraudPatternAnalysis(),
        this.generateLoanProcessingDashboard(),
        this.generateCreditRiskAssessment(),
        this.generateFraudModelPerformance(),
        this.generateRegulatoryComplianceReport()
      ]);

      logger.info(`Successfully generated ${reports.length} reports`);
      return reports;
    } catch (error) {
      logger.error('Failed to generate all reports:', error);
      throw error;
    }
  }

  // Generate specific report by type
  async generateReportByType(reportType: string) {
    switch (reportType) {
      case 'fraud-detection-dashboard':
        return await this.generateFraudDetectionDashboard();
      case 'fraud-pattern-analysis':
        return await this.generateFraudPatternAnalysis();
      case 'loan-processing-dashboard':
        return await this.generateLoanProcessingDashboard();
      case 'credit-risk-assessment':
        return await this.generateCreditRiskAssessment();
      case 'fraud-model-performance':
        return await this.generateFraudModelPerformance();
      case 'regulatory-compliance':
        return await this.generateRegulatoryComplianceReport();
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}

export const financeReportsService = new FinanceReportsService();