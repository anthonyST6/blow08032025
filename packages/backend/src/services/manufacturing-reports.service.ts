import { reportService, ReportContent } from './report.service';
import { logger } from '../utils/logger';
import { promises as fs } from 'fs';
import path from 'path';

// Data models for manufacturing
interface Equipment {
  equipmentId: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installDate: Date;
  lastMaintenance: Date;
  nextMaintenance: Date;
  status: 'operational' | 'maintenance' | 'warning' | 'critical' | 'offline';
  location: string;
  department: string;
  operatingHours: number;
  efficiency: number;
  healthScore: number;
}

// Removed unused interface MaintenanceRecord

interface QualityInspection {
  inspectionId: string;
  productId: string;
  batchNumber: string;
  inspectionDate: Date;
  inspector: string;
  inspectionType: 'incoming' | 'in-process' | 'final' | 'random';
  passed: boolean;
  defectsFound: {
    type: string;
    severity: 'minor' | 'major' | 'critical';
    quantity: number;
    location: string;
  }[];
  measurements: {
    parameter: string;
    value: number;
    unit: string;
    specification: { min: number; max: number };
    inSpec: boolean;
  }[];
  overallScore: number;
}

interface ProductionMetrics {
  date: Date;
  shift: 'day' | 'evening' | 'night';
  productionLine: string;
  plannedQuantity: number;
  actualQuantity: number;
  goodQuantity: number;
  defectQuantity: number;
  oee: number; // Overall Equipment Effectiveness
  availability: number;
  performance: number;
  quality: number;
  downtimeMinutes: number;
  cycleTime: number;
  throughput: number;
}

interface SupplyChainMetrics {
  supplierId: string;
  supplierName: string;
  category: string;
  onTimeDeliveryRate: number;
  qualityScore: number;
  leadTime: number; // days
  orderAccuracy: number;
  costVariance: number;
  riskScore: number;
  certifications: string[];
  lastAuditDate: Date;
  inventoryTurns: number;
}

class ManufacturingReportsService {
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

  // Generate sample equipment data
  private generateSampleEquipment(count: number = 50): Equipment[] {
    const types = ['CNC Machine', 'Injection Molder', 'Assembly Robot', 'Conveyor', 'Press', 'Welder', 'Packaging Machine'];
    const manufacturers = ['Siemens', 'ABB', 'Fanuc', 'Kuka', 'Mitsubishi', 'Rockwell'];
    const departments = ['Machining', 'Assembly', 'Packaging', 'Quality Control', 'Warehouse'];
    
    return Array.from({ length: count }, (_, i) => {
      const installDate = new Date();
      installDate.setFullYear(installDate.getFullYear() - Math.floor(Math.random() * 10));
      
      const lastMaintenance = new Date();
      lastMaintenance.setDate(lastMaintenance.getDate() - Math.floor(Math.random() * 90));
      
      const nextMaintenance = new Date(lastMaintenance);
      nextMaintenance.setDate(nextMaintenance.getDate() + 90);
      
      const operatingHours = Math.floor(Math.random() * 50000);
      const efficiency = 70 + Math.random() * 25;
      const healthScore = 60 + Math.random() * 40;
      
      return {
        equipmentId: `EQ-${String(i + 1).padStart(5, '0')}`,
        name: `${types[Math.floor(Math.random() * types.length)]} ${i + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
        model: `Model-${Math.floor(Math.random() * 1000)}`,
        serialNumber: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        installDate,
        lastMaintenance,
        nextMaintenance,
        status: healthScore < 70 ? 'warning' : healthScore < 50 ? 'critical' : 'operational',
        location: `Building ${Math.floor(Math.random() * 3) + 1}, Floor ${Math.floor(Math.random() * 3) + 1}`,
        department: departments[Math.floor(Math.random() * departments.length)],
        operatingHours,
        efficiency,
        healthScore
      };
    });
  }

  // 1. Predictive Maintenance Dashboard
  async generatePredictiveMaintenanceDashboard() {
    const equipment = this.generateSampleEquipment(50);
    const criticalEquipment = equipment.filter(e => e.status === 'critical' || e.status === 'warning');
    const maintenanceDue = equipment.filter(e => {
      const daysUntilMaintenance = Math.floor((e.nextMaintenance.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilMaintenance <= 7;
    });

    const content: ReportContent = {
      title: 'Predictive Maintenance Dashboard',
      subtitle: 'AI-powered equipment health monitoring and failure prediction',
      sections: [
        {
          heading: 'Executive Summary',
          content: `Total Equipment: ${equipment.length}\nOperational: ${equipment.filter(e => e.status === 'operational').length}\nRequiring Attention: ${criticalEquipment.length}\nMaintenance Due (7 days): ${maintenanceDue.length}\nAverage Health Score: ${(equipment.reduce((sum, e) => sum + e.healthScore, 0) / equipment.length).toFixed(1)}%\nAverage Efficiency: ${(equipment.reduce((sum, e) => sum + e.efficiency, 0) / equipment.length).toFixed(1)}%`,
          type: 'text'
        },
        {
          heading: 'Critical Equipment Alerts',
          content: criticalEquipment.slice(0, 10).map(e => ({
            'Equipment ID': e.equipmentId,
            'Name': e.name,
            'Status': e.status.toUpperCase(),
            'Health Score': `${e.healthScore.toFixed(1)}%`,
            'Location': e.location,
            'Department': e.department,
            'Days Until Maintenance': Math.floor((e.nextMaintenance.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            'Action': e.status === 'critical' ? 'Immediate Inspection' : 'Schedule Maintenance'
          })),
          type: 'table'
        },
        {
          heading: 'Predictive Insights',
          content: [
            'ML model predicts 3 potential failures in the next 14 days',
            'Vibration analysis indicates bearing wear on CNC Machine 12',
            'Temperature anomaly detected in Injection Molder 5',
            'Recommended spare parts inventory increase for critical components',
            'Maintenance schedule optimization can reduce downtime by 23%',
            'Energy consumption patterns suggest efficiency improvements possible'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Predictive Maintenance Dashboard',
      description: 'Equipment health monitoring and failure predictions',
      type: 'pdf',
      agent: 'Vanguard Maintenance Predictor',
      useCaseId: 'predictive-maintenance',
      workflowId: 'maintenance-dashboard'
    });
  }

  // 2. Quality Inspection Analytics
  async generateQualityInspectionReport() {
    const inspections = this.generateQualityInspections(200);
    const defectsByType = this.analyzeDefectTypes(inspections);
    
    const excelData = {
      'Inspection Summary': inspections.slice(0, 50).map(i => ({
        'Inspection ID': i.inspectionId,
        'Product ID': i.productId,
        'Batch': i.batchNumber,
        'Date': i.inspectionDate.toLocaleDateString(),
        'Type': i.inspectionType.toUpperCase(),
        'Result': i.passed ? 'PASS' : 'FAIL',
        'Defects Found': i.defectsFound.length,
        'Overall Score': `${i.overallScore.toFixed(1)}%`
      })),
      'Defect Analysis': defectsByType,
      'Quality Trends': this.generateQualityTrends(30),
      'Process Capability': [
        { Parameter: 'Dimension A', Cpk: 1.33, 'In Spec %': 99.73, Status: 'Capable' },
        { Parameter: 'Dimension B', Cpk: 1.12, 'In Spec %': 98.92, Status: 'Marginal' },
        { Parameter: 'Surface Finish', Cpk: 1.45, 'In Spec %': 99.86, Status: 'Capable' },
        { Parameter: 'Weight', Cpk: 1.67, 'In Spec %': 99.97, Status: 'Excellent' }
      ]
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Quality Inspection Analytics',
      description: 'Comprehensive quality control analysis and defect tracking',
      type: 'xlsx',
      agent: 'Vanguard Quality Inspector',
      useCaseId: 'quality-inspection',
      workflowId: 'quality-analytics'
    });
  }

  // 3. Supply Chain Optimization Report
  async generateSupplyChainOptimizationReport() {
    const suppliers = this.generateSupplierMetrics(30);
    const inventoryMetrics = this.generateInventoryMetrics();
    
    const content: ReportContent = {
      title: 'Supply Chain Optimization Report',
      subtitle: 'AI-driven supply chain performance and optimization insights',
      sections: [
        {
          heading: 'Supply Chain Overview',
          content: `Active Suppliers: ${suppliers.length}\nAverage On-Time Delivery: ${(suppliers.reduce((sum, s) => sum + s.onTimeDeliveryRate, 0) / suppliers.length).toFixed(1)}%\nAverage Quality Score: ${(suppliers.reduce((sum, s) => sum + s.qualityScore, 0) / suppliers.length).toFixed(1)}%\nInventory Turnover: ${inventoryMetrics.turnoverRate}x\nDays of Inventory: ${inventoryMetrics.daysOnHand}\nStockout Risk Items: ${inventoryMetrics.stockoutRisk}`,
          type: 'text'
        },
        {
          heading: 'Top Performing Suppliers',
          content: suppliers
            .sort((a, b) => (b.onTimeDeliveryRate + b.qualityScore) - (a.onTimeDeliveryRate + a.qualityScore))
            .slice(0, 10)
            .map(s => ({
              'Supplier': s.supplierName,
              'Category': s.category,
              'On-Time Delivery': `${s.onTimeDeliveryRate.toFixed(1)}%`,
              'Quality Score': `${s.qualityScore.toFixed(1)}%`,
              'Lead Time': `${s.leadTime} days`,
              'Risk Score': s.riskScore.toFixed(1),
              'Status': s.riskScore < 30 ? 'Low Risk' : s.riskScore < 60 ? 'Medium Risk' : 'High Risk'
            })),
          type: 'table'
        },
        {
          heading: 'Optimization Recommendations',
          content: [
            'Consolidate orders with top 3 suppliers to achieve 15% cost reduction',
            'Implement VMI (Vendor Managed Inventory) for high-volume items',
            'Diversify supply base for critical components (single-source risk)',
            'Negotiate blanket POs for predictable demand items',
            'Establish safety stock levels based on ML demand forecasting',
            'Consider nearshoring for 20% of offshore suppliers to reduce lead time'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Supply Chain Optimization Report',
      description: 'Supply chain performance analysis and optimization',
      type: 'pdf',
      agent: 'Vanguard Supply Chain Optimizer',
      useCaseId: 'supply-optimization',
      workflowId: 'supply-chain-analysis'
    });
  }

  // 4. Production Performance Report
  async generateProductionPerformanceReport() {
    const productionData = this.generateProductionMetrics(30);
    const oeeAnalysis = this.analyzeOEE(productionData);
    
    const excelData = {
      'Daily Production': productionData.map(p => ({
        'Date': p.date.toLocaleDateString(),
        'Shift': p.shift.toUpperCase(),
        'Line': p.productionLine,
        'Planned': p.plannedQuantity,
        'Actual': p.actualQuantity,
        'Good Units': p.goodQuantity,
        'Defects': p.defectQuantity,
        'OEE %': p.oee.toFixed(1),
        'Availability %': p.availability.toFixed(1),
        'Performance %': p.performance.toFixed(1),
        'Quality %': p.quality.toFixed(1)
      })),
      'OEE Analysis': oeeAnalysis,
      'Downtime Reasons': [
        { Reason: 'Equipment Failure', 'Minutes': 245, 'Frequency': 12, 'Impact %': 28.5 },
        { Reason: 'Material Shortage', 'Minutes': 180, 'Frequency': 8, 'Impact %': 20.9 },
        { Reason: 'Changeover', 'Minutes': 150, 'Frequency': 15, 'Impact %': 17.4 },
        { Reason: 'Quality Issues', 'Minutes': 120, 'Frequency': 6, 'Impact %': 14.0 },
        { Reason: 'Planned Maintenance', 'Minutes': 165, 'Frequency': 3, 'Impact %': 19.2 }
      ],
      'Shift Performance': [
        { Shift: 'Day', 'Avg OEE': 82.5, 'Avg Output': 950, 'Quality Rate': 98.2 },
        { Shift: 'Evening', 'Avg OEE': 78.3, 'Avg Output': 890, 'Quality Rate': 97.5 },
        { Shift: 'Night', 'Avg OEE': 75.1, 'Avg Output': 820, 'Quality Rate': 96.8 }
      ]
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Production Performance Report',
      description: 'Comprehensive production metrics and OEE analysis',
      type: 'xlsx',
      agent: 'Vanguard Production Analyzer',
      useCaseId: 'predictive-maintenance',
      workflowId: 'production-performance'
    });
  }

  // 5. Manufacturing Compliance Report
  async generateComplianceReport() {
    const jsonData = {
      reportDate: new Date().toISOString(),
      complianceAreas: [
        {
          area: 'ISO 9001:2015',
          status: 'Compliant',
          lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          nextAudit: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          findings: 3,
          corrected: 3,
          score: 94.5
        },
        {
          area: 'ISO 14001:2015',
          status: 'Compliant',
          lastAudit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          nextAudit: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          findings: 2,
          corrected: 1,
          score: 91.2
        },
        {
          area: 'OSHA Safety',
          status: 'Compliant',
          lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextAudit: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          findings: 5,
          corrected: 5,
          score: 96.8
        }
      ],
      certifications: [
        { name: 'ISO 9001:2015', validUntil: '2026-03-15', status: 'Active' },
        { name: 'ISO 14001:2015', validUntil: '2025-11-30', status: 'Active' },
        { name: 'ISO 45001:2018', validUntil: '2025-08-20', status: 'Renewal Required' }
      ],
      trainingCompliance: {
        totalEmployees: 450,
        compliant: 428,
        overdue: 22,
        complianceRate: 95.1
      },
      recommendations: [
        'Schedule ISO 45001:2018 renewal audit before August 2025',
        'Complete safety training for 22 employees with overdue certifications',
        'Implement automated compliance tracking system',
        'Review and update environmental management procedures'
      ]
    };

    return await reportService.generateJSONReport(jsonData, {
      name: 'Manufacturing Compliance Status',
      description: 'Regulatory compliance tracking and certification status',
      type: 'json',
      agent: 'Vanguard Compliance Monitor',
      useCaseId: 'predictive-maintenance',
      workflowId: 'compliance-tracking'
    });
  }

  // Helper methods
  private generateQualityInspections(count: number): QualityInspection[] {
    const defectTypes = ['Surface Scratch', 'Dimension Out of Spec', 'Color Variation', 'Assembly Error', 'Missing Component'];
    
    return Array.from({ length: count }, (_, i) => {
      const passed = Math.random() > 0.05; // 95% pass rate
      const defectsFound = passed ? [] : Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
        type: defectTypes[Math.floor(Math.random() * defectTypes.length)],
        severity: ['minor', 'major', 'critical'][Math.floor(Math.random() * 3)] as any,
        quantity: Math.floor(Math.random() * 5) + 1,
        location: `Zone ${Math.floor(Math.random() * 4) + 1}`
      }));
      
      return {
        inspectionId: `INSP-${String(i + 1).padStart(6, '0')}`,
        productId: `PROD-${String(Math.floor(Math.random() * 100)).padStart(4, '0')}`,
        batchNumber: `BATCH-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}`,
        inspectionDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        inspector: `Inspector ${Math.floor(Math.random() * 10) + 1}`,
        inspectionType: ['incoming', 'in-process', 'final', 'random'][Math.floor(Math.random() * 4)] as any,
        passed,
        defectsFound,
        measurements: this.generateMeasurements(),
        overallScore: passed ? 85 + Math.random() * 15 : 40 + Math.random() * 40
      };
    });
  }

  private generateMeasurements() {
    return [
      {
        parameter: 'Length',
        value: 100 + (Math.random() - 0.5) * 2,
        unit: 'mm',
        specification: { min: 99, max: 101 },
        inSpec: true
      },
      {
        parameter: 'Width',
        value: 50 + (Math.random() - 0.5) * 1,
        unit: 'mm',
        specification: { min: 49.5, max: 50.5 },
        inSpec: true
      },
      {
        parameter: 'Weight',
        value: 250 + (Math.random() - 0.5) * 10,
        unit: 'g',
        specification: { min: 245, max: 255 },
        inSpec: true
      }
    ];
  }

  private analyzeDefectTypes(inspections: QualityInspection[]) {
    const defectCounts: Record<string, number> = {};
    
    inspections.forEach(i => {
      i.defectsFound.forEach(d => {
        defectCounts[d.type] = (defectCounts[d.type] || 0) + d.quantity;
      });
    });
    
    return Object.entries(defectCounts).map(([type, count]) => ({
      'Defect Type': type,
      'Total Count': count,
      'Percentage': ((count / Object.values(defectCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(1) + '%',
      'Trend': Math.random() > 0.5 ? 'Increasing' : 'Decreasing'
    }));
  }

  private generateQualityTrends(days: number) {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - days + i + 1);
      
      return {
        Date: date.toLocaleDateString(),
        'Pass Rate %': 93 + Math.random() * 5,
        'Defect PPM': Math.floor(50 + Math.random() * 100),
        'First Pass Yield %': 88 + Math.random() * 8,
        'Rework %': 2 + Math.random() * 3
      };
    });
  }

  private generateSupplierMetrics(count: number): SupplyChainMetrics[] {
    const categories = ['Raw Materials', 'Components', 'Packaging', 'MRO', 'Electronics'];
    const certifications = ['ISO 9001', 'ISO 14001', 'IATF 16949', 'AS9100'];
    
    return Array.from({ length: count }, (_, i) => ({
      supplierId: `SUPP-${String(i + 1).padStart(4, '0')}`,
      supplierName: `Supplier ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26)}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      onTimeDeliveryRate: 85 + Math.random() * 15,
      qualityScore: 80 + Math.random() * 20,
      leadTime: 7 + Math.floor(Math.random() * 21),
      orderAccuracy: 90 + Math.random() * 10,
      costVariance: -5 + Math.random() * 10,
      riskScore: Math.random() * 100,
      certifications: certifications.filter(() => Math.random() > 0.5),
      lastAuditDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
      inventoryTurns: 4 + Math.random() * 8
    }));
  }

  private generateInventoryMetrics() {
    return {
      turnoverRate: 6.5,
      daysOnHand: 56,
      stockoutRisk: 12,
      excessInventory: 8,
      totalValue: 2450000,
      abcAnalysis: {
        A: { items: 150, value: 1470000, percentage: 60 },
        B: { items: 300, value: 735000, percentage: 30 },
        C: { items: 550, value: 245000, percentage: 10 }
      }
    };
  }

  private generateProductionMetrics(days: number): ProductionMetrics[] {
    const shifts: ProductionMetrics['shift'][] = ['day', 'evening', 'night'];
    const lines = ['Line A', 'Line B', 'Line C', 'Line D'];
    
    const metrics: ProductionMetrics[] = [];
    
    for (let d = 0; d < days; d++) {
      const date = new Date();
      date.setDate(date.getDate() - days + d + 1);
      
      shifts.forEach(shift => {
        lines.forEach(line => {
          const plannedQuantity = 1000;
          const availability = 0.8 + Math.random() * 0.15;
          const performance = 0.75 + Math.random() * 0.2;
          const quality = 0.95 + Math.random() * 0.04;
          const oee = availability * performance * quality * 100;
          
          const actualQuantity = Math.floor(plannedQuantity * performance * availability);
          const goodQuantity = Math.floor(actualQuantity * quality);
          
          metrics.push({
            date,
            shift,
            productionLine: line,
            plannedQuantity,
            actualQuantity,
            goodQuantity,
            defectQuantity: actualQuantity - goodQuantity,
            oee,
            availability: availability * 100,
            performance: performance * 100,
            quality: quality * 100,
            downtimeMinutes: Math.floor((1 - availability) * 480),
            cycleTime: 0.5 + Math.random() * 0.2,
            throughput: actualQuantity / 8
          });
        });
      });
    }
    
    return metrics;
  }

  private analyzeOEE(productionData: ProductionMetrics[]) {
    const byLine = productionData.reduce((acc, p) => {
      if (!acc[p.productionLine]) {
        acc[p.productionLine] = { total: 0, count: 0 };
      }
      acc[p.productionLine].total += p.oee;
      acc[p.productionLine].count++;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);
    
    return Object.entries(byLine).map(([line, data]) => ({
      'Production Line': line,
      'Average OEE %': (data.total / data.count).toFixed(1),
      'Target OEE %': 85,
      'Gap %': (85 - data.total / data.count).toFixed(1),
      'Status': data.total / data.count >= 85 ? 'On Target' : 'Below Target',
      'Action': data.total / data.count >= 85 ? 'Maintain' : 'Improvement Required'
    }));
  }

  // Generate all reports
  async generateAllReports() {
    try {
      logger.info('Generating all manufacturing reports...');
      
      const reports = await Promise.all([
        this.generatePredictiveMaintenanceDashboard(),
        this.generateQualityInspectionReport(),
        this.generateSupplyChainOptimizationReport(),
        this.generateProductionPerformanceReport(),
        this.generateComplianceReport()
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
      case 'predictive-maintenance-dashboard':
        return await this.generatePredictiveMaintenanceDashboard();
      case 'quality-inspection-analytics':
        return await this.generateQualityInspectionReport();
      case 'supply-chain-optimization':
        return await this.generateSupplyChainOptimizationReport();
      case 'production-performance':
        return await this.generateProductionPerformanceReport();
      case 'manufacturing-compliance':
        return await this.generateComplianceReport();
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}

export const manufacturingReportsService = new ManufacturingReportsService();