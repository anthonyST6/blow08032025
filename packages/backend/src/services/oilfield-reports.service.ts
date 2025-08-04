import { reportService, ReportContent } from './report.service';
import { logger } from '../utils/logger';
import { promises as fs } from 'fs';
import path from 'path';

// Data models for oilfield lease management
interface OilfieldLease {
  leaseId: string;
  leaseName: string;
  operator: string;
  location: {
    state: string;
    county: string;
    section: string;
    township: string;
    range: string;
  };
  acreage: number;
  royaltyRate: number;
  bonusPayment: number;
  expirationDate: Date;
  effectiveDate: Date;
  status: 'Active' | 'Expiring' | 'Expired' | 'Renewed' | 'Terminated';
  production: {
    oil: number; // barrels per day
    gas: number; // mcf per day
    water: number; // barrels per day
  };
  revenue: {
    monthly: number;
    yearly: number;
    lifetime: number;
  };
  riskScore: number; // 0-100
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Pending Review';
}

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  royaltyPayments: number;
  taxLiability: number;
  operatingCosts: number;
  capitalExpenditure: number;
}

interface ComplianceItem {
  itemId: string;
  leaseId: string;
  requirement: string;
  status: 'Compliant' | 'Non-Compliant' | 'Pending';
  dueDate: Date;
  lastReviewDate: Date;
  notes: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface RiskAnalysis {
  leaseId: string;
  riskScore: number;
  riskFactors: {
    factor: string;
    score: number;
    impact: 'Low' | 'Medium' | 'High';
    mitigation: string;
  }[];
  recommendations: string[];
}

class OilfieldReportsService {
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

  // Generate sample data for demonstrations
  private generateSampleLeases(count: number = 50): OilfieldLease[] {
    const operators = ['Continental Resources', 'Devon Energy', 'EOG Resources', 'Pioneer Natural', 'Hess Corporation'];
    const states = ['TX', 'ND', 'NM', 'OK', 'CO'];
    const statuses: OilfieldLease['status'][] = ['Active', 'Expiring', 'Expired', 'Renewed', 'Terminated'];
    
    return Array.from({ length: count }, (_, i) => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + Math.floor(Math.random() * 730) - 365);
      
      const effectiveDate = new Date();
      effectiveDate.setFullYear(effectiveDate.getFullYear() - Math.floor(Math.random() * 5));
      
      return {
        leaseId: `LEASE-${String(i + 1).padStart(5, '0')}`,
        leaseName: `${states[Math.floor(Math.random() * states.length)]}-Section-${Math.floor(Math.random() * 36) + 1}`,
        operator: operators[Math.floor(Math.random() * operators.length)],
        location: {
          state: states[Math.floor(Math.random() * states.length)],
          county: `County-${Math.floor(Math.random() * 10) + 1}`,
          section: String(Math.floor(Math.random() * 36) + 1),
          township: `${Math.floor(Math.random() * 10) + 1}N`,
          range: `${Math.floor(Math.random() * 10) + 1}W`
        },
        acreage: Math.floor(Math.random() * 1000) + 100,
        royaltyRate: 0.125 + (Math.random() * 0.125), // 12.5% to 25%
        bonusPayment: Math.floor(Math.random() * 5000) + 1000,
        expirationDate,
        effectiveDate,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        production: {
          oil: Math.floor(Math.random() * 500),
          gas: Math.floor(Math.random() * 1000),
          water: Math.floor(Math.random() * 200)
        },
        revenue: {
          monthly: Math.floor(Math.random() * 100000) + 10000,
          yearly: Math.floor(Math.random() * 1200000) + 120000,
          lifetime: Math.floor(Math.random() * 10000000) + 1000000
        },
        riskScore: Math.floor(Math.random() * 100),
        complianceStatus: Math.random() > 0.8 ? 'Non-Compliant' : 'Compliant'
      };
    });
  }

  // 1. Lease Expiration Dashboard
  async generateLeaseExpirationDashboard() {
    const leases = this.generateSampleLeases(100);
    const expiringLeases = leases
      .filter(l => {
        const daysUntilExpiration = Math.floor((l.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiration > 0 && daysUntilExpiration <= 365;
      })
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());

    const content: ReportContent = {
      title: 'Lease Expiration Dashboard - Q4 2024',
      subtitle: 'Comprehensive view of all leases expiring in next 365 days with risk scores',
      sections: [
        {
          heading: 'Executive Summary',
          content: `Total leases monitored: ${leases.length}\nLeases expiring within 365 days: ${expiringLeases.length}\nHigh-risk expirations: ${expiringLeases.filter(l => l.riskScore > 70).length}\nTotal revenue at risk: $${expiringLeases.reduce((sum, l) => sum + l.revenue.yearly, 0).toLocaleString()}`,
          type: 'text'
        },
        {
          heading: 'Critical Expirations (Next 90 Days)',
          content: expiringLeases.slice(0, 10).map(l => ({
            'Lease ID': l.leaseId,
            'Lease Name': l.leaseName,
            'Operator': l.operator,
            'Expiration Date': l.expirationDate.toLocaleDateString(),
            'Days Until Expiration': Math.floor((l.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            'Risk Score': l.riskScore,
            'Annual Revenue': `$${l.revenue.yearly.toLocaleString()}`
          })),
          type: 'table'
        },
        {
          heading: 'Risk Analysis',
          content: [
            'High-value leases requiring immediate attention',
            'Leases with compliance issues need resolution before renewal',
            'Market conditions favorable for renegotiation',
            'Consider bundling renewals for better terms',
            'Environmental assessments required for 15 leases'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Lease Expiration Dashboard - Q4 2024',
      description: 'Comprehensive view of all leases expiring in next 365 days with risk scores',
      type: 'pdf',
      agent: 'Vanguard Risk Analysis Agent',
      useCaseId: 'oilfield-lease',
      workflowId: 'lease-expiration-analysis'
    });
  }

  // 2. Revenue Analysis Report
  async generateRevenueAnalysisReport() {
    const leases = this.generateSampleLeases(75);
    const totalRevenue = leases.reduce((sum, l) => sum + l.revenue.yearly, 0);

    const revenueByOperator = leases.reduce((acc, l) => {
      if (!acc[l.operator]) acc[l.operator] = 0;
      acc[l.operator] += l.revenue.yearly;
      return acc;
    }, {} as Record<string, number>);

    // Generate Excel report directly without PDF content
    return await reportService.generateXLSXReport(
      {
        'Revenue Summary': Object.entries(revenueByOperator).map(([operator, revenue]) => ({
          operator,
          revenue,
          percentage: (revenue / totalRevenue) * 100
        })),
        'Lease Details': leases.map(l => ({
          leaseId: l.leaseId,
          leaseName: l.leaseName,
          operator: l.operator,
          monthlyRevenue: l.revenue.monthly,
          yearlyRevenue: l.revenue.yearly,
          lifetimeRevenue: l.revenue.lifetime,
          oilProduction: l.production.oil,
          gasProduction: l.production.gas
        }))
      },
      {
        name: 'Revenue Analysis Report - 2024',
        description: 'Detailed breakdown of revenue streams',
        type: 'xlsx',
        agent: 'Vanguard Financial Analysis Agent',
        useCaseId: 'oilfield-lease',
        workflowId: 'revenue-analysis'
      }
    );
  }

  // 3. Compliance Status Report
  async generateComplianceStatusReport() {
    const leases = this.generateSampleLeases(60);
    const complianceItems: ComplianceItem[] = [];
    
    leases.forEach(lease => {
      const itemCount = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < itemCount; i++) {
        complianceItems.push({
          itemId: `COMP-${lease.leaseId}-${i + 1}`,
          leaseId: lease.leaseId,
          requirement: ['Environmental Assessment', 'Royalty Payment Audit', 'Safety Inspection', 'Regulatory Filing', 'Insurance Verification'][i % 5],
          status: Math.random() > 0.8 ? 'Non-Compliant' : 'Compliant',
          dueDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
          lastReviewDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
          notes: 'Regular compliance check',
          severity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)] as any
        });
      }
    });

    const nonCompliantItems = complianceItems.filter(item => item.status === 'Non-Compliant');
    const criticalItems = nonCompliantItems.filter(item => item.severity === 'Critical');

    const content: ReportContent = {
      title: 'Compliance Status Report - November 2024',
      subtitle: 'Regulatory compliance tracking across all active leases',
      sections: [
        {
          heading: 'Compliance Overview',
          content: `Total Compliance Items: ${complianceItems.length}\nCompliant Items: ${complianceItems.filter(i => i.status === 'Compliant').length}\nNon-Compliant Items: ${nonCompliantItems.length}\nCritical Issues: ${criticalItems.length}\nCompliance Rate: ${((complianceItems.filter(i => i.status === 'Compliant').length / complianceItems.length) * 100).toFixed(2)}%`,
          type: 'text'
        },
        {
          heading: 'Critical Non-Compliance Issues',
          content: criticalItems.map(item => ({
            'Lease ID': item.leaseId,
            'Requirement': item.requirement,
            'Severity': item.severity,
            'Due Date': item.dueDate.toLocaleDateString(),
            'Days Overdue': Math.max(0, Math.floor((Date.now() - item.dueDate.getTime()) / (1000 * 60 * 60 * 24))),
            'Notes': item.notes
          })),
          type: 'table'
        },
        {
          heading: 'Recommended Actions',
          content: [
            'Immediate attention required for critical compliance issues',
            'Schedule environmental assessments for Q1 2025',
            'Update insurance policies for 12 leases',
            'Submit regulatory filings for lease renewals',
            'Conduct safety inspections on high-risk properties'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Compliance Status Report - November 2024',
      description: 'Regulatory compliance tracking across all active leases',
      type: 'pdf',
      agent: 'Vanguard Compliance Agent',
      useCaseId: 'oilfield-lease',
      workflowId: 'compliance-monitoring'
    });
  }

  // 4. Risk Assessment Matrix
  async generateRiskAssessmentMatrix() {
    const leases = this.generateSampleLeases(80);
    const riskAnalyses: RiskAnalysis[] = leases.map(lease => ({
      leaseId: lease.leaseId,
      riskScore: lease.riskScore,
      riskFactors: [
        {
          factor: 'Expiration Timeline',
          score: Math.floor(Math.random() * 30) + 10,
          impact: lease.riskScore > 70 ? 'High' : lease.riskScore > 40 ? 'Medium' : 'Low',
          mitigation: 'Initiate renewal negotiations 6 months prior'
        },
        {
          factor: 'Production Decline',
          score: Math.floor(Math.random() * 25) + 5,
          impact: 'Medium',
          mitigation: 'Implement enhanced recovery techniques'
        },
        {
          factor: 'Regulatory Compliance',
          score: Math.floor(Math.random() * 20) + 5,
          impact: lease.complianceStatus === 'Non-Compliant' ? 'High' : 'Low',
          mitigation: 'Regular compliance audits and updates'
        },
        {
          factor: 'Market Conditions',
          score: Math.floor(Math.random() * 25) + 10,
          impact: 'Medium',
          mitigation: 'Hedge against price volatility'
        }
      ],
      recommendations: [
        'Prioritize renewal negotiations',
        'Conduct technical evaluation',
        'Review and update compliance documentation',
        'Consider portfolio optimization'
      ]
    }));

    const highRiskLeases = riskAnalyses.filter(r => r.riskScore > 70);
    const mediumRiskLeases = riskAnalyses.filter(r => r.riskScore > 40 && r.riskScore <= 70);
    const lowRiskLeases = riskAnalyses.filter(r => r.riskScore <= 40);

    const excelData = {
      'Risk Summary': [
        { 'Risk Category': 'High Risk (70-100)', 'Count': highRiskLeases.length, 'Percentage': `${((highRiskLeases.length / leases.length) * 100).toFixed(2)}%` },
        { 'Risk Category': 'Medium Risk (40-70)', 'Count': mediumRiskLeases.length, 'Percentage': `${((mediumRiskLeases.length / leases.length) * 100).toFixed(2)}%` },
        { 'Risk Category': 'Low Risk (0-40)', 'Count': lowRiskLeases.length, 'Percentage': `${((lowRiskLeases.length / leases.length) * 100).toFixed(2)}%` }
      ],
      'High Risk Leases': highRiskLeases.map(r => {
        const lease = leases.find(l => l.leaseId === r.leaseId)!;
        return {
          'Lease ID': r.leaseId,
          'Lease Name': lease.leaseName,
          'Risk Score': r.riskScore,
          'Primary Risk Factor': r.riskFactors[0].factor,
          'Annual Revenue': lease.revenue.yearly,
          'Days to Expiration': Math.floor((lease.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        };
      }),
      'Risk Factors': riskAnalyses.flatMap(r => 
        r.riskFactors.map(f => ({
          'Lease ID': r.leaseId,
          'Risk Factor': f.factor,
          'Score': f.score,
          'Impact': f.impact,
          'Mitigation': f.mitigation
        }))
      )
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Risk Assessment Matrix - Q4 2024',
      description: 'Comprehensive risk analysis for all leases with mitigation strategies',
      type: 'xlsx',
      agent: 'Vanguard Risk Analysis Agent',
      useCaseId: 'oilfield-lease',
      workflowId: 'risk-assessment'
    });
  }

  // 5. Production Performance Report
  async generateProductionPerformanceReport() {
    const leases = this.generateSampleLeases(90);
    const totalProduction = leases.reduce((sum, l) => ({
      oil: sum.oil + l.production.oil,
      gas: sum.gas + l.production.gas,
      water: sum.water + l.production.water
    }), { oil: 0, gas: 0, water: 0 });

    const content: ReportContent = {
      title: 'Production Performance Report - November 2024',
      subtitle: 'Analysis of oil, gas, and water production across all active wells',
      sections: [
        {
          heading: 'Production Summary',
          content: `Total Oil Production: ${totalProduction.oil.toLocaleString()} bbl/day\nTotal Gas Production: ${totalProduction.gas.toLocaleString()} mcf/day\nTotal Water Production: ${totalProduction.water.toLocaleString()} bbl/day\nActive Wells: ${leases.filter(l => l.production.oil > 0 || l.production.gas > 0).length}\nAverage Oil per Well: ${Math.floor(totalProduction.oil / leases.length)} bbl/day`,
          type: 'text'
        },
        {
          heading: 'Top Producing Leases',
          content: leases
            .sort((a, b) => b.production.oil - a.production.oil)
            .slice(0, 15)
            .map(l => ({
              'Lease ID': l.leaseId,
              'Lease Name': l.leaseName,
              'Oil (bbl/day)': l.production.oil,
              'Gas (mcf/day)': l.production.gas,
              'Water (bbl/day)': l.production.water,
              'Water Cut %': ((l.production.water / (l.production.oil + l.production.water)) * 100).toFixed(2)
            })),
          type: 'table'
        },
        {
          heading: 'Production Trends',
          content: [
            'Overall production increased 3.5% month-over-month',
            'Water cut trending higher in mature fields',
            'New completions showing promising initial production',
            'Gas production exceeding forecasts by 12%',
            'Consider workover candidates for production enhancement'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Production Performance Report - November 2024',
      description: 'Analysis of oil, gas, and water production across all active wells',
      type: 'pdf',
      agent: 'Vanguard Operations Agent',
      useCaseId: 'oilfield-lease',
      workflowId: 'production-analysis'
    });
  }

  // 6. Executive Summary Report
  async generateExecutiveSummaryReport() {
    const leases = this.generateSampleLeases(100);
    const metrics: FinancialMetrics = {
      totalRevenue: leases.reduce((sum, l) => sum + l.revenue.yearly, 0),
      totalExpenses: leases.reduce((sum, l) => sum + l.revenue.yearly * 0.7, 0),
      netIncome: 0,
      royaltyPayments: leases.reduce((sum, l) => sum + (l.revenue.yearly * l.royaltyRate), 0),
      taxLiability: leases.reduce((sum, l) => sum + l.revenue.yearly * 0.15, 0),
      operatingCosts: leases.reduce((sum, l) => sum + l.revenue.yearly * 0.4, 0),
      capitalExpenditure: leases.reduce((sum, l) => sum + l.revenue.yearly * 0.1, 0)
    };
    metrics.netIncome = metrics.totalRevenue - metrics.totalExpenses;

    const content: ReportContent = {
      title: 'Executive Summary - Oilfield Lease Portfolio',
      subtitle: 'Strategic overview and key performance indicators',
      sections: [
        {
          heading: 'Portfolio Overview',
          content: `Total Leases: ${leases.length}\nActive Leases: ${leases.filter(l => l.status === 'Active').length}\nTotal Acreage: ${leases.reduce((sum, l) => sum + l.acreage, 0).toLocaleString()}\nAverage Royalty Rate: ${((leases.reduce((sum, l) => sum + l.royaltyRate, 0) / leases.length) * 100).toFixed(2)}%\nPortfolio Value: $${(metrics.totalRevenue * 10).toLocaleString()}`,
          type: 'text'
        },
        {
          heading: 'Financial Performance',
          content: `Annual Revenue: $${metrics.totalRevenue.toLocaleString()}\nOperating Expenses: $${metrics.totalExpenses.toLocaleString()}\nNet Income: $${metrics.netIncome.toLocaleString()}\nROI: ${((metrics.netIncome / metrics.totalExpenses) * 100).toFixed(2)}%\nEBITDA Margin: ${((metrics.netIncome / metrics.totalRevenue) * 100).toFixed(2)}%`,
          type: 'text'
        },
        {
          heading: 'Strategic Recommendations',
          content: [
            'Focus on high-value lease renewals in Q1 2025',
            'Divest underperforming assets in oversupplied markets',
            'Increase investment in enhanced recovery techniques',
            'Negotiate better terms with top-tier operators',
            'Implement automated compliance monitoring system',
            'Consider acquisition opportunities in emerging basins'
          ],
          type: 'list'
        },
        {
          heading: 'Risk Summary',
          content: `High Risk Leases: ${leases.filter(l => l.riskScore > 70).length}\nCompliance Issues: ${leases.filter(l => l.complianceStatus === 'Non-Compliant').length}\nExpiring in 90 days: ${leases.filter(l => {
            const days = (l.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            return days > 0 && days <= 90;
          }).length}\nRevenue at Risk: $${leases.filter(l => l.riskScore > 70).reduce((sum, l) => sum + l.revenue.yearly, 0).toLocaleString()}`,
          type: 'text'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Executive Summary - Oilfield Lease Portfolio',
      description: 'Strategic overview and key performance indicators',
      type: 'pdf',
      agent: 'Vanguard Executive Intelligence Agent',
      useCaseId: 'oilfield-lease',
      workflowId: 'executive-summary'
    });
  }

  // 7. Lease Renewal Recommendations
  async generateLeaseRenewalRecommendations() {
    const leases = this.generateSampleLeases(50);
    const expiringLeases = leases.filter(l => {
      const daysUntilExpiration = (l.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiration > 0 && daysUntilExpiration <= 180;
    });

    const recommendations = expiringLeases.map(lease => ({
      leaseId: lease.leaseId,
      leaseName: lease.leaseName,
      recommendation: lease.revenue.yearly > 500000 ? 'Renew - High Priority' : 
                      lease.revenue.yearly > 200000 ? 'Renew - Standard Terms' : 
                      'Evaluate for Divestment',
      proposedTerms: {
        royaltyRate: lease.revenue.yearly > 500000 ? lease.royaltyRate * 0.9 : lease.royaltyRate,
        bonusPayment: lease.revenue.yearly > 500000 ? lease.bonusPayment * 1.5 : lease.bonusPayment,
        term: lease.production.oil > 200 ? '5 years' : '3 years'
      },
      rationale: lease.revenue.yearly > 500000 ? 'High-value asset with strong production' :
                 lease.revenue.yearly > 200000 ? 'Moderate performer with stable returns' :
                 'Marginal economics, consider alternatives'
    }));

    const jsonData = {
      metadata: {
        reportDate: new Date().toISOString(),
        totalLeases: expiringLeases.length,
        highPriorityRenewals: recommendations.filter(r => r.recommendation.includes('High Priority')).length
      },
      recommendations: recommendations.map(r => {
        const lease = leases.find(l => l.leaseId === r.leaseId)!;
        return {
          ...r,
          currentMetrics: {
            production: lease.production,
            revenue: lease.revenue,
            riskScore: lease.riskScore
          }
        };
      })
    };

    return await reportService.generateJSONReport(jsonData, {
      name: 'Lease Renewal Recommendations - Q4 2024',
      description: 'AI-powered recommendations for upcoming lease renewals',
      type: 'json',
      agent: 'Vanguard Negotiation Agent',
      useCaseId: 'oilfield-lease',
      workflowId: 'renewal-recommendations'
    });
  }

  // 8. Financial Projections Model
  async generateFinancialProjectionsModel() {
    const leases = this.generateSampleLeases(75);
    const projectionYears = 5;
    
    const projections = Array.from({ length: projectionYears }, (_, yearIndex) => {
      const year = new Date().getFullYear() + yearIndex + 1;
      const declineRate = 0.85 + Math.random() * 0.1; // 5-15% annual decline
      
      return {
        year,
        production: {
          oil: Math.floor(leases.reduce((sum, l) => sum + l.production.oil, 0) * Math.pow(declineRate, yearIndex + 1)),
          gas: Math.floor(leases.reduce((sum, l) => sum + l.production.gas, 0) * Math.pow(declineRate, yearIndex + 1))
        },
        revenue: Math.floor(leases.reduce((sum, l) => sum + l.revenue.yearly, 0) * Math.pow(declineRate, yearIndex + 1)),
        expenses: Math.floor(leases.reduce((sum, l) => sum + l.revenue.yearly * 0.7, 0) * Math.pow(declineRate, yearIndex + 1)),
        netIncome: 0
      };
    });

    projections.forEach(p => {
      p.netIncome = p.revenue - p.expenses;
    });

    const excelData = {
      'Projections Summary': projections,
      'Base Year Data': leases.map(l => ({
        leaseId: l.leaseId,
        leaseName: l.leaseName,
        currentProduction: l.production.oil,
        currentRevenue: l.revenue.yearly,
        projectedDecline: '10-15% annually'
      })),
      'Assumptions': [
        { Parameter: 'Oil Price', Value: '$75/bbl', Notes: 'Conservative estimate' },
        { Parameter: 'Gas Price', Value: '$3.50/mcf', Notes: 'Based on futures curve' },
        { Parameter: 'Decline Rate', Value: '10-15%', Notes: 'Type curve analysis' },
        { Parameter: 'Operating Costs', Value: '70% of revenue', Notes: 'Historical average' }
      ]
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Financial Projections Model - 5 Year',
      description: '5-year financial projections with sensitivity analysis',
      type: 'xlsx',
      agent: 'Vanguard Financial Analysis Agent',
      useCaseId: 'oilfield-lease',
      workflowId: 'financial-projections'
    });
  }

  // 9. Regulatory Filing Checklist
  async generateRegulatoryFilingChecklist() {
    const leases = this.generateSampleLeases(40);
    const filingRequirements = [
      'State Oil & Gas Commission Annual Report',
      'Environmental Protection Agency Compliance',
      'Bureau of Land Management Lease Updates',
      'State Tax Commission Severance Returns',
      'Railroad Commission Production Reports',
      'Water Management District Permits',
      'Air Quality Permits',
      'Spill Prevention Control Plans'
    ];

    const checklist = leases.slice(0, 20).map(lease => {
      const requirements = filingRequirements.map(req => ({
        requirement: req,
        status: Math.random() > 0.2 ? 'Complete' : 'Pending',
        dueDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
        lastFiled: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
      }));

      return {
        leaseId: lease.leaseId,
        leaseName: lease.leaseName,
        operator: lease.operator,
        requirements
      };
    });

    const content: ReportContent = {
      title: 'Regulatory Filing Checklist - Q4 2024',
      subtitle: 'Comprehensive tracking of all regulatory requirements',
      sections: [
        {
          heading: 'Filing Status Overview',
          content: `Total Leases Tracked: ${checklist.length}\nTotal Filing Requirements: ${checklist.length * filingRequirements.length}\nCompleted Filings: ${checklist.reduce((sum, l) => sum + l.requirements.filter(r => r.status === 'Complete').length, 0)}\nPending Filings: ${checklist.reduce((sum, l) => sum + l.requirements.filter(r => r.status === 'Pending').length, 0)}`,
          type: 'text'
        },
        {
          heading: 'Urgent Filings (Due within 30 days)',
          content: checklist.flatMap(l =>
            l.requirements
              .filter(r => r.status === 'Pending' && (r.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30)
              .map(r => ({
                'Lease ID': l.leaseId,
                'Lease Name': l.leaseName,
                'Requirement': r.requirement,
                'Due Date': r.dueDate.toLocaleDateString(),
                'Days Until Due': Math.floor((r.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              }))
          ).slice(0, 10),
          type: 'table'
        },
        {
          heading: 'Compliance Action Items',
          content: [
            'Submit Q4 production reports to Railroad Commission',
            'Update SPCC plans for 5 facilities',
            'File annual environmental compliance certifications',
            'Renew air quality permits expiring in Q1 2025',
            'Complete water management district annual reports'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Regulatory Filing Checklist - Q4 2024',
      description: 'Comprehensive tracking of all regulatory requirements',
      type: 'pdf',
      agent: 'Vanguard Compliance Agent',
      useCaseId: 'oilfield-lease',
      workflowId: 'regulatory-compliance'
    });
  }

  // 10. Operator Performance Scorecard
  async generateOperatorPerformanceScorecard() {
    const leases = this.generateSampleLeases(100);
    const operators = ['Continental Resources', 'Devon Energy', 'EOG Resources', 'Pioneer Natural', 'Hess Corporation'];
    
    const operatorMetrics = operators.map(operator => {
      const operatorLeases = leases.filter(l => l.operator === operator);
      const totalRevenue = operatorLeases.reduce((sum, l) => sum + l.revenue.yearly, 0);
      const totalProduction = operatorLeases.reduce((sum, l) => sum + l.production.oil, 0);
      const avgRiskScore = operatorLeases.reduce((sum, l) => sum + l.riskScore, 0) / operatorLeases.length;
      const complianceRate = operatorLeases.filter(l => l.complianceStatus === 'Compliant').length / operatorLeases.length;

      return {
        operator,
        leaseCount: operatorLeases.length,
        totalRevenue,
        totalProduction,
        avgRiskScore,
        complianceRate,
        performanceScore: (complianceRate * 40) + ((100 - avgRiskScore) * 0.3) + (totalRevenue / 1000000) * 0.3
      };
    });

    const sortedOperators = operatorMetrics.sort((a, b) => b.performanceScore - a.performanceScore);

    const excelData = {
      'Operator Rankings': sortedOperators.map((op, index) => ({
        Rank: index + 1,
        Operator: op.operator,
        'Performance Score': op.performanceScore.toFixed(2),
        'Lease Count': op.leaseCount,
        'Annual Revenue': `$${op.totalRevenue.toLocaleString()}`,
        'Oil Production (bbl/day)': op.totalProduction,
        'Compliance Rate': `${(op.complianceRate * 100).toFixed(2)}%`,
        'Avg Risk Score': op.avgRiskScore.toFixed(2)
      })),
      'Detailed Metrics': leases.map(l => ({
        'Lease ID': l.leaseId,
        'Operator': l.operator,
        'Revenue': l.revenue.yearly,
        'Oil Production': l.production.oil,
        'Risk Score': l.riskScore,
        'Compliance': l.complianceStatus
      }))
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Operator Performance Scorecard - 2024',
      description: 'Comprehensive operator performance metrics and rankings',
      type: 'xlsx',
      agent: 'Vanguard Performance Analysis Agent',
      useCaseId: 'oilfield-lease',
      workflowId: 'operator-scorecard'
    });
  }

  // Generate all reports as a package
  async generateAllReports() {
    try {
      logger.info('Generating all oilfield lease reports...');
      
      const reports = await Promise.all([
        this.generateLeaseExpirationDashboard(),
        this.generateRevenueAnalysisReport(),
        this.generateComplianceStatusReport(),
        this.generateRiskAssessmentMatrix(),
        this.generateProductionPerformanceReport(),
        this.generateExecutiveSummaryReport(),
        this.generateLeaseRenewalRecommendations(),
        this.generateFinancialProjectionsModel(),
        this.generateRegulatoryFilingChecklist(),
        this.generateOperatorPerformanceScorecard()
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
      case 'lease-expiration-dashboard':
        return await this.generateLeaseExpirationDashboard();
      case 'revenue-analysis':
        return await this.generateRevenueAnalysisReport();
      case 'compliance-status':
        return await this.generateComplianceStatusReport();
      case 'risk-assessment-matrix':
        return await this.generateRiskAssessmentMatrix();
      case 'production-performance':
        return await this.generateProductionPerformanceReport();
      case 'executive-summary':
        return await this.generateExecutiveSummaryReport();
      case 'lease-renewal-recommendations':
        return await this.generateLeaseRenewalRecommendations();
      case 'financial-projections':
        return await this.generateFinancialProjectionsModel();
      case 'regulatory-filing-checklist':
        return await this.generateRegulatoryFilingChecklist();
      case 'operator-performance-scorecard':
        return await this.generateOperatorPerformanceScorecard();
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}

export const oilfieldReportsService = new OilfieldReportsService();
    