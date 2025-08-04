import { reportService, ReportContent } from './report.service';
import { logger } from '../utils/logger';
import * as ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';

// Government domain data models
interface CitizenService {
  serviceId: string;
  serviceName: string;
  category: 'healthcare' | 'education' | 'social' | 'infrastructure' | 'licensing' | 'tax';
  requestDate: Date;
  completionDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  citizenId: string;
  processingTime: number; // hours
  satisfactionScore?: number;
  department: string;
  cost: number;
  documentsRequired: string[];
  documentsSubmitted: string[];
}

interface PolicyCompliance {
  policyId: string;
  policyName: string;
  category: string;
  implementationDate: Date;
  complianceLevel: number; // percentage
  affectedDepartments: string[];
  budget: number;
  actualSpend: number;
  kpis: {
    metric: string;
    target: number;
    actual: number;
    status: 'met' | 'not-met' | 'in-progress';
  }[];
  risks: string[];
  recommendations: string[];
}

interface PublicSafety {
  incidentId: string;
  incidentType: 'crime' | 'accident' | 'emergency' | 'disaster' | 'health';
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
    district: string;
    zone: string;
  };
  reportedDate: Date;
  responseTime: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'responding' | 'resolved' | 'under-investigation';
  resourcesDeployed: {
    type: string;
    count: number;
    arrivalTime: Date;
  }[];
  casualties: number;
  propertyDamage: number;
  resolution: string;
}

interface SmartCityMetrics {
  metricId: string;
  category: 'traffic' | 'energy' | 'water' | 'waste' | 'air-quality' | 'connectivity';
  location: string;
  timestamp: Date;
  value: number;
  unit: string;
  threshold: { min: number; max: number };
  status: 'normal' | 'warning' | 'alert';
  trend: 'improving' | 'stable' | 'declining';
  predictions: {
    timeframe: string;
    predictedValue: number;
    confidence: number;
  }[];
  recommendations: string[];
}

interface TaxRevenue {
  taxType: 'income' | 'property' | 'sales' | 'corporate' | 'customs' | 'other';
  period: string;
  targetRevenue: number;
  actualRevenue: number;
  collectionRate: number;
  outstandingAmount: number;
  taxpayerCount: number;
  complianceRate: number;
  topDelinquents: {
    taxpayerId: string;
    amount: number;
    daysOverdue: number;
  }[];
  forecastNextPeriod: number;
}

class GovernmentReportsService {
  // Generate mock data methods
  private generateCitizenServices(count: number): CitizenService[] {
    const services = [
      'Passport Application', 'Driver License Renewal', 'Birth Certificate',
      'Building Permit', 'Business License', 'Tax Filing',
      'Healthcare Registration', 'School Enrollment', 'Social Benefits'
    ];
    const categories: CitizenService['category'][] = ['healthcare', 'education', 'social', 'infrastructure', 'licensing', 'tax'];
    const departments = ['DMV', 'Health Services', 'Education', 'Revenue', 'Public Works', 'Social Services'];
    const statuses: CitizenService['status'][] = ['pending', 'in-progress', 'completed', 'rejected'];

    return Array.from({ length: count }, (_, i) => {
      const requestDate = new Date();
      requestDate.setDate(requestDate.getDate() - Math.floor(Math.random() * 90));
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const completionDate = status === 'completed' || status === 'rejected' ? 
        new Date(requestDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined;
      
      const processingTime = completionDate ? 
        (completionDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60) : 
        (Date.now() - requestDate.getTime()) / (1000 * 60 * 60);

      return {
        serviceId: `SVC-${String(i + 1).padStart(6, '0')}`,
        serviceName: services[Math.floor(Math.random() * services.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        requestDate,
        completionDate,
        status,
        citizenId: `CIT-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
        processingTime,
        satisfactionScore: status === 'completed' ? 3 + Math.random() * 2 : undefined,
        department: departments[Math.floor(Math.random() * departments.length)],
        cost: Math.floor(Math.random() * 500),
        documentsRequired: ['ID Proof', 'Address Proof', 'Application Form'],
        documentsSubmitted: status !== 'pending' ? ['ID Proof', 'Address Proof', 'Application Form'] : ['ID Proof']
      };
    });
  }

  private generatePolicyCompliance(count: number): PolicyCompliance[] {
    const policies = [
      'Digital Transformation Initiative', 'Green Energy Policy', 'Education Reform Act',
      'Healthcare Accessibility Program', 'Infrastructure Modernization', 'Tax Reform Policy',
      'Public Safety Enhancement', 'E-Governance Implementation', 'Social Welfare Expansion'
    ];
    const categories = ['Technology', 'Environment', 'Education', 'Healthcare', 'Infrastructure', 'Finance', 'Safety', 'Social'];
    const departments = ['DMV', 'Health Services', 'Education', 'Revenue', 'Public Works', 'Social Services'];

    return Array.from({ length: count }, (_, i) => {
      const budget = 1000000 + Math.random() * 9000000;
      const actualSpend = budget * (0.7 + Math.random() * 0.4);
      const complianceLevel = 60 + Math.random() * 40;

      return {
        policyId: `POL-${String(i + 1).padStart(4, '0')}`,
        policyName: policies[i % policies.length],
        category: categories[Math.floor(Math.random() * categories.length)],
        implementationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        complianceLevel,
        affectedDepartments: departments.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 2),
        budget,
        actualSpend,
        kpis: [
          {
            metric: 'Implementation Progress',
            target: 100,
            actual: complianceLevel,
            status: complianceLevel >= 90 ? 'met' : complianceLevel >= 70 ? 'in-progress' : 'not-met'
          },
          {
            metric: 'Budget Utilization',
            target: 95,
            actual: (actualSpend / budget) * 100,
            status: actualSpend / budget >= 0.9 ? 'met' : 'in-progress'
          },
          {
            metric: 'Citizen Satisfaction',
            target: 80,
            actual: 70 + Math.random() * 25,
            status: Math.random() > 0.5 ? 'met' : 'in-progress'
          }
        ],
        risks: ['Budget overrun', 'Implementation delays', 'Stakeholder resistance'].slice(0, Math.floor(Math.random() * 2) + 1),
        recommendations: ['Increase stakeholder engagement', 'Allocate additional resources', 'Review implementation timeline']
      };
    });
  }

  private generatePublicSafetyIncidents(count: number): PublicSafety[] {
    const incidentTypes: PublicSafety['incidentType'][] = ['crime', 'accident', 'emergency', 'disaster', 'health'];
    const districts = ['Downtown', 'North District', 'South District', 'East District', 'West District'];
    const severities: PublicSafety['severity'][] = ['low', 'medium', 'high', 'critical'];
    const statuses: PublicSafety['status'][] = ['reported', 'responding', 'resolved', 'under-investigation'];

    return Array.from({ length: count }, (_, i) => {
      const reportedDate = new Date();
      reportedDate.setHours(reportedDate.getHours() - Math.floor(Math.random() * 168)); // Last week
      
      const responseTime = 5 + Math.floor(Math.random() * 55); // 5-60 minutes
      const severity = severities[Math.floor(Math.random() * severities.length)];
      
      return {
        incidentId: `INC-${String(i + 1).padStart(6, '0')}`,
        incidentType: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
        location: {
          address: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
          coordinates: {
            lat: 40 + Math.random() * 2,
            lng: -74 + Math.random() * 2
          },
          district: districts[Math.floor(Math.random() * districts.length)],
          zone: `Zone ${Math.floor(Math.random() * 10) + 1}`
        },
        reportedDate,
        responseTime,
        severity,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        resourcesDeployed: [
          {
            type: 'Police Units',
            count: severity === 'critical' ? 3 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2),
            arrivalTime: new Date(reportedDate.getTime() + responseTime * 60 * 1000)
          },
          {
            type: 'Ambulance',
            count: ['accident', 'health'].includes(incidentTypes[i % incidentTypes.length]) ? 1 : 0,
            arrivalTime: new Date(reportedDate.getTime() + (responseTime + 5) * 60 * 1000)
          }
        ].filter(r => r.count > 0),
        casualties: severity === 'critical' ? Math.floor(Math.random() * 5) : 0,
        propertyDamage: severity === 'high' || severity === 'critical' ? Math.floor(Math.random() * 100000) : 0,
        resolution: statuses[i % statuses.length] === 'resolved' ? 'Incident resolved successfully' : 'Under investigation'
      };
    });
  }

  private generateSmartCityMetrics(count: number): SmartCityMetrics[] {
    const categories: SmartCityMetrics['category'][] = ['traffic', 'energy', 'water', 'waste', 'air-quality', 'connectivity'];
    const locations = ['City Center', 'Industrial Zone', 'Residential Area', 'Commercial District', 'Tech Park'];
    const units = {
      traffic: 'vehicles/hour',
      energy: 'kWh',
      water: 'gallons/day',
      waste: 'tons/day',
      'air-quality': 'AQI',
      connectivity: 'Mbps'
    };

    return Array.from({ length: count }, (_, i) => {
      const category = categories[i % categories.length];
      const baseValue = category === 'traffic' ? 1000 : 
                      category === 'energy' ? 5000 :
                      category === 'water' ? 10000 :
                      category === 'waste' ? 50 :
                      category === 'air-quality' ? 100 : 500;
      
      const value = baseValue * (0.5 + Math.random());
      const threshold = {
        min: baseValue * 0.3,
        max: baseValue * 1.5
      };

      return {
        metricId: `MET-${String(i + 1).padStart(5, '0')}`,
        category,
        location: locations[Math.floor(Math.random() * locations.length)],
        timestamp: new Date(),
        value,
        unit: units[category],
        threshold,
        status: value < threshold.min || value > threshold.max ? 'alert' : 
                value < threshold.min * 1.2 || value > threshold.max * 0.8 ? 'warning' : 'normal',
        trend: Math.random() > 0.5 ? 'improving' : Math.random() > 0.5 ? 'stable' : 'declining',
        predictions: [
          {
            timeframe: '1 hour',
            predictedValue: value * (0.95 + Math.random() * 0.1),
            confidence: 85 + Math.random() * 10
          },
          {
            timeframe: '24 hours',
            predictedValue: value * (0.9 + Math.random() * 0.2),
            confidence: 70 + Math.random() * 15
          }
        ],
        recommendations: category === 'traffic' ? ['Adjust signal timing', 'Deploy traffic officers'] :
                        category === 'air-quality' ? ['Issue health advisory', 'Restrict industrial activity'] :
                        ['Monitor closely', 'Prepare contingency plans']
      };
    });
  }

  private generateTaxRevenue(): TaxRevenue[] {
    const taxTypes: TaxRevenue['taxType'][] = ['income', 'property', 'sales', 'corporate', 'customs', 'other'];
    
    return taxTypes.map(type => {
      const targetRevenue = type === 'income' ? 50000000 :
                          type === 'corporate' ? 30000000 :
                          type === 'sales' ? 20000000 :
                          type === 'property' ? 15000000 :
                          type === 'customs' ? 10000000 : 5000000;
      
      const collectionRate = 0.7 + Math.random() * 0.25;
      const actualRevenue = targetRevenue * collectionRate;
      const outstandingAmount = targetRevenue - actualRevenue;

      return {
        taxType: type,
        period: 'Q4 2024',
        targetRevenue,
        actualRevenue,
        collectionRate: collectionRate * 100,
        outstandingAmount,
        taxpayerCount: Math.floor(10000 + Math.random() * 90000),
        complianceRate: 60 + Math.random() * 35,
        topDelinquents: Array.from({ length: 5 }, () => ({
          taxpayerId: `TAX-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
          amount: outstandingAmount * (0.1 + Math.random() * 0.05),
          daysOverdue: 30 + Math.floor(Math.random() * 90)
        })),
        forecastNextPeriod: actualRevenue * (0.95 + Math.random() * 0.15)
      };
    });
  }

  // Report generation methods
  async generateCitizenServicesDashboard() {
    const services = this.generateCitizenServices(100);
    
    const content: ReportContent = {
      title: 'Citizen Services Dashboard',
      subtitle: 'E-governance service delivery analytics',
      sections: [
        {
          heading: 'Service Delivery Overview',
          content: `Total Requests: ${services.length}\nCompleted: ${services.filter(s => s.status === 'completed').length}\nPending: ${services.filter(s => s.status === 'pending').length}\nAverage Processing Time: ${(services.reduce((sum, s) => sum + s.processingTime, 0) / services.length / 24).toFixed(1)} days\nSatisfaction Score: ${(services.filter(s => s.satisfactionScore).reduce((sum, s) => sum + (s.satisfactionScore || 0), 0) / services.filter(s => s.satisfactionScore).length).toFixed(1)}/5\nDigital Adoption Rate: 78.5%`,
          type: 'text'
        },
        {
          heading: 'Service Performance by Department',
          content: ['DMV', 'Health Services', 'Education', 'Revenue', 'Public Works'].map(dept => {
            const deptServices = services.filter(s => s.department === dept);
            return {
              'Department': dept,
              'Total Requests': deptServices.length,
              'Completed': deptServices.filter(s => s.status === 'completed').length,
              'Avg Time (days)': (deptServices.reduce((sum, s) => sum + s.processingTime, 0) / deptServices.length / 24).toFixed(1),
              'Satisfaction': deptServices.filter(s => s.satisfactionScore).length > 0 ? 
                `${(deptServices.filter(s => s.satisfactionScore).reduce((sum, s) => sum + (s.satisfactionScore || 0), 0) / deptServices.filter(s => s.satisfactionScore).length).toFixed(1)}/5` : 'N/A',
              'Efficiency': `${(deptServices.filter(s => s.status === 'completed').length / deptServices.length * 100).toFixed(1)}%`
            };
          }),
          type: 'table'
        },
        {
          heading: 'Digital Transformation Impact',
          content: [
            'Online service adoption increased by 45% year-over-year',
            'Average processing time reduced by 60% through automation',
            'Citizen satisfaction improved from 3.2 to 4.1 out of 5',
            'Cost per transaction reduced by $12.50 (35% reduction)',
            'Mobile app usage accounts for 62% of all service requests',
            'AI chatbot resolved 78% of queries without human intervention'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Citizen Services Dashboard',
      description: 'Comprehensive e-governance service analytics',
      type: 'pdf',
      agent: 'government-services-agent',
      useCaseId: 'citizen-services',
      workflowId: 'services-dashboard'
    });
  }

  async generatePolicyComplianceReport() {
    const policies = this.generatePolicyCompliance(20);
    const timestamp = new Date().toISOString();
    
    const workbook = new ExcelJS.Workbook();
    
    // Policy Overview
    const overviewSheet = workbook.addWorksheet('Policy Overview');
    overviewSheet.columns = [
      { header: 'Policy ID', key: 'policyId', width: 12 },
      { header: 'Policy Name', key: 'policyName', width: 35 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Compliance %', key: 'compliance', width: 15 },
      { header: 'Budget', key: 'budget', width: 15 },
      { header: 'Spent', key: 'spent', width: 15 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    policies.forEach(policy => {
      overviewSheet.addRow({
        policyId: policy.policyId,
        policyName: policy.policyName,
        category: policy.category,
        compliance: `${policy.complianceLevel.toFixed(1)}%`,
        budget: `$${(policy.budget / 1000000).toFixed(2)}M`,
        spent: `$${(policy.actualSpend / 1000000).toFixed(2)}M`,
        status: policy.complianceLevel >= 80 ? 'ON TRACK' : policy.complianceLevel >= 60 ? 'AT RISK' : 'DELAYED'
      });
    });

    // KPI Analysis
    const kpiSheet = workbook.addWorksheet('KPI Analysis');
    kpiSheet.columns = [
      { header: 'Policy', key: 'policy', width: 35 },
      { header: 'KPI', key: 'kpi', width: 25 },
      { header: 'Target', key: 'target', width: 12 },
      { header: 'Actual', key: 'actual', width: 12 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    policies.forEach(policy => {
      policy.kpis.forEach(kpi => {
        kpiSheet.addRow({
          policy: policy.policyName,
          kpi: kpi.metric,
          target: kpi.target,
          actual: kpi.actual.toFixed(1),
          status: kpi.status.toUpperCase()
        });
      });
    });

    // Risk Assessment
    const riskSheet = workbook.addWorksheet('Risk Assessment');
    riskSheet.columns = [
      { header: 'Policy', key: 'policy', width: 35 },
      { header: 'Risk', key: 'risk', width: 40 },
      { header: 'Impact', key: 'impact', width: 12 },
      { header: 'Mitigation', key: 'mitigation', width: 50 }
    ];

    policies.forEach(policy => {
      policy.risks.forEach(risk => {
        riskSheet.addRow({
          policy: policy.policyName,
          risk: risk,
          impact: 'HIGH',
          mitigation: policy.recommendations[0] || 'Review and adjust implementation strategy'
        });
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const reportId = uuidv4();
    
    logger.info(`Generated policy compliance report: ${reportId}`);
    
    return {
      id: reportId,
      name: 'Policy Compliance Report',
      description: 'Government policy implementation and compliance tracking',
      type: 'policy-compliance',
      format: 'xlsx',
      size: buffer.byteLength,
      createdAt: timestamp,
      downloadUrl: `/api/reports/download/${reportId}`,
      data: buffer,
      agent: 'government-compliance-agent'
    };
  }

  async generatePublicSafetyReport() {
    const incidents = this.generatePublicSafetyIncidents(150);
    const timestamp = new Date().toISOString();
    
    const jsonData = {
      reportDate: timestamp,
      summary: {
        totalIncidents: incidents.length,
        byType: {
          crime: incidents.filter(i => i.incidentType === 'crime').length,
          accident: incidents.filter(i => i.incidentType === 'accident').length,
          emergency: incidents.filter(i => i.incidentType === 'emergency').length,
          disaster: incidents.filter(i => i.incidentType === 'disaster').length,
          health: incidents.filter(i => i.incidentType === 'health').length
        },
        bySeverity: {
          critical: incidents.filter(i => i.severity === 'critical').length,
          high: incidents.filter(i => i.severity === 'high').length,
          medium: incidents.filter(i => i.severity === 'medium').length,
          low: incidents.filter(i => i.severity === 'low').length
        },
        averageResponseTime: (incidents.reduce((sum, i) => sum + i.responseTime, 0) / incidents.length).toFixed(1),
        totalCasualties: incidents.reduce((sum, i) => sum + i.casualties, 0),
        totalPropertyDamage: incidents.reduce((sum, i) => sum + i.propertyDamage, 0)
      },
      hotspots: ['Downtown', 'North District', 'South District', 'East District', 'West District'].map(district => ({
        district,
        incidents: incidents.filter(i => i.location.district === district).length,
        avgResponseTime: (incidents.filter(i => i.location.district === district).reduce((sum, i) => sum + i.responseTime, 0) / incidents.filter(i => i.location.district === district).length || 0).toFixed(1),
        criticalIncidents: incidents.filter(i => i.location.district === district && i.severity === 'critical').length
      })),
      recentIncidents: incidents
        .sort((a, b) => b.reportedDate.getTime() - a.reportedDate.getTime())
        .slice(0, 20)
        .map(i => ({
          id: i.incidentId,
          type: i.incidentType,
          location: i.location.address,
          severity: i.severity,
          status: i.status,
          responseTime: i.responseTime,
          reportedAt: i.reportedDate.toISOString()
        })),
      resourceUtilization: {
        policeUnits: {
          total: 150,
          deployed: incidents.reduce((sum, i) => sum + (i.resourcesDeployed.find(r => r.type === 'Police Units')?.count || 0), 0),
          utilizationRate: 68.5
        },
        ambulances: {
          total: 50,
          deployed: incidents.reduce((sum, i) => sum + (i.resourcesDeployed.find(r => r.type === 'Ambulance')?.count || 0), 0),
          utilizationRate: 45.2
        }
      },
      recommendations: [
        'Increase patrol presence in high-incident districts',
        'Implement predictive policing in crime hotspots',
        'Upgrade emergency response communication systems',
        'Conduct public safety awareness campaigns',
        'Deploy smart surveillance in critical areas'
      ]
    };

    return await reportService.generateJSONReport(jsonData, {
      name: 'Public Safety Analytics Report',
      description: 'Real-time public safety monitoring and incident analysis',
      type: 'json',
      agent: 'government-safety-agent',
      useCaseId: 'public-safety',
      workflowId: 'safety-analytics'
    });
  }

  async generateSmartCityDashboard() {
    const metrics = this.generateSmartCityMetrics(50);
    
    const content: ReportContent = {
      title: 'Smart City Dashboard',
      subtitle: 'IoT-powered urban infrastructure monitoring',
      sections: [
        {
          heading: 'City Infrastructure Status',
          content: `Active Sensors: 2,847\nData Points Collected: ${(metrics.length * 1000).toLocaleString()}/hour\nSystem Uptime: 99.7%\nAlerts Active: ${metrics.filter(m => m.status === 'alert').length}\nWarnings: ${metrics.filter(m => m.status === 'warning').length}\nAI Predictions Accuracy: 91.3%`,
          type: 'text'
        },
        {
          heading: 'Real-time Metrics by Category',
          content: ['traffic', 'energy', 'water', 'waste', 'air-quality', 'connectivity'].map(category => {
            const catMetrics = metrics.filter(m => m.category === category);
            const avgValue = catMetrics.reduce((sum, m) => sum + m.value, 0) / catMetrics.length;
            return {
              'Category': category.toUpperCase(),
              'Locations Monitored': catMetrics.length,
              'Average Value': `${avgValue.toFixed(1)} ${catMetrics[0]?.unit || ''}`,
              'Alerts': catMetrics.filter(m => m.status === 'alert').length,
              'Trend': catMetrics.filter(m => m.trend === 'improving').length > catMetrics.length / 2 ? 'Improving' : 'Needs Attention',
              'Status': catMetrics.some(m => m.status === 'alert') ? 'CRITICAL' : 'NORMAL'
            };
          }),
          type: 'table'
        },
        {
          heading: 'AI-Powered Insights',
          content: [
            'Traffic congestion predicted to increase 23% during evening rush hour',
            'Energy consumption optimization can save $125,000/month',
            'Water leak detected in Industrial Zone - immediate action required',
            'Air quality expected to deteriorate due to weather patterns',
            'Waste collection routes can be optimized to reduce fuel by 18%',
            '5G connectivity expansion needed in Residential Area'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Smart City Dashboard',
      description: 'Comprehensive IoT infrastructure monitoring',
      type: 'pdf',
      agent: 'government-smartcity-agent',
      useCaseId: 'smart-city',
      workflowId: 'city-dashboard'
    });
  }

  async generateTaxRevenueReport() {
    const taxData = this.generateTaxRevenue();
    const timestamp = new Date().toISOString();
    
    const workbook = new ExcelJS.Workbook();
    
    // Revenue Summary
    const summarySheet = workbook.addWorksheet('Revenue Summary');
    summarySheet.columns = [
      { header: 'Tax Type', key: 'taxType', width: 15 },
      { header: 'Target Revenue', key: 'target', width: 18 },
      { header: 'Actual Revenue', key: 'actual', width: 18 },
      { header: 'Collection Rate', key: 'rate', width: 15 },
      { header: 'Outstanding', key: 'outstanding', width: 18 },
      { header: 'Taxpayers', key: 'taxpayers', width: 12 },
      { header: 'Compliance %', key: 'compliance', width: 15 }
    ];

    taxData.forEach(tax => {
      summarySheet.addRow({
        taxType: tax.taxType.toUpperCase(),
        target: `$${(tax.targetRevenue / 1000000).toFixed(2)}M`,
        actual: `$${(tax.actualRevenue / 1000000).toFixed(2)}M`,
        rate: `${tax.collectionRate.toFixed(1)}%`,
        outstanding: `$${(tax.outstandingAmount / 1000000).toFixed(2)}M`,
        taxpayers: tax.taxpayerCount.toLocaleString(),
        compliance: `${tax.complianceRate.toFixed(1)}%`
      });
    });

    // Delinquent Analysis
    const delinquentSheet = workbook.addWorksheet('Top Delinquents');
    delinquentSheet.columns = [
      { header: 'Tax Type', key: 'taxType', width: 15 },
      { header: 'Taxpayer ID', key: 'taxpayerId', width: 15 },
      { header: 'Amount Owed', key: 'amount', width: 18 },
      { header: 'Days Overdue', key: 'overdue', width: 15 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    taxData.forEach(tax => {
      tax.topDelinquents.forEach(delinquent => {
        delinquentSheet.addRow({
          taxType: tax.taxType.toUpperCase(),
          taxpayerId: delinquent.taxpayerId,
          amount: `$${(delinquent.amount / 1000).toFixed(1)}K`,
          overdue: delinquent.daysOverdue,
          status: delinquent.daysOverdue > 90 ? 'CRITICAL' : 'WARNING'
        });
      });
    });

    // Revenue Forecast
    const forecastSheet = workbook.addWorksheet('Revenue Forecast');
    forecastSheet.columns = [
      { header: 'Tax Type', key: 'taxType', width: 15 },
      { header: 'Current Quarter', key: 'current', width: 18 },
      { header: 'Next Quarter Forecast', key: 'forecast', width: 20 },
      { header: 'Growth %', key: 'growth', width: 12 },
      { header: 'Confidence', key: 'confidence', width: 12 }
    ];

    taxData.forEach(tax => {
      const growth = ((tax.forecastNextPeriod - tax.actualRevenue) / tax.actualRevenue) * 100;
      forecastSheet.addRow({
        taxType: tax.taxType.toUpperCase(),
        current: `$${(tax.actualRevenue / 1000000).toFixed(2)}M`,
        forecast: `$${(tax.forecastNextPeriod / 1000000).toFixed(2)}M`,
        growth: `${growth.toFixed(1)}%`,
        confidence: '85%'
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const reportId = uuidv4();
    
    logger.info(`Generated tax revenue report: ${reportId}`);
    
    return {
      id: reportId,
      name: 'Tax Revenue Analytics Report',
      description: 'Comprehensive tax collection and revenue analysis',
      type: 'tax-revenue',
      format: 'xlsx',
      size: buffer.byteLength,
      createdAt: timestamp,
      downloadUrl: `/api/reports/download/${reportId}`,
      data: buffer,
      agent: 'government-revenue-agent'
    };
  }

  // Generate all reports
  async generateAllReports() {
    try {
      logger.info('Generating all government reports...');
      
      const reports = await Promise.all([
        this.generateCitizenServicesDashboard(),
        this.generatePolicyComplianceReport(),
        this.generatePublicSafetyReport(),
        this.generateSmartCityDashboard(),
        this.generateTaxRevenueReport()
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
      case 'citizen-services-dashboard':
        return await this.generateCitizenServicesDashboard();
      case 'policy-compliance':
        return await this.generatePolicyComplianceReport();
      case 'public-safety':
        return await this.generatePublicSafetyReport();
      case 'smart-city-dashboard':
        return await this.generateSmartCityDashboard();
      case 'tax-revenue':
        return await this.generateTaxRevenueReport();
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}

export const governmentReportsService = new GovernmentReportsService();