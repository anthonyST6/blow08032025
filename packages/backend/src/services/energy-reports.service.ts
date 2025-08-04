import { reportService, ReportContent } from './report.service';
import { logger } from '../utils/logger';
import { promises as fs } from 'fs';
import path from 'path';

// Data models for energy load forecasting
interface EnergyLoadData {
  timestamp: Date;
  region: string;
  actualLoad: number; // MW
  forecastedLoad: number; // MW
  temperature: number; // Celsius
  humidity: number; // Percentage
  dayType: 'weekday' | 'weekend' | 'holiday';
  peakHour: boolean;
}

interface GridSegment {
  segmentId: string;
  segmentName: string;
  region: string;
  capacity: number; // MW
  currentLoad: number; // MW
  utilizationRate: number; // Percentage
  status: 'normal' | 'warning' | 'critical' | 'offline';
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
}

interface ForecastAccuracy {
  date: Date;
  region: string;
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  accuracy: number; // Percentage
  forecastHorizon: string;
}

interface DemandResponse {
  eventId: string;
  eventDate: Date;
  region: string;
  targetReduction: number; // MW
  actualReduction: number; // MW
  participatingCustomers: number;
  incentivePaid: number; // USD
  successRate: number; // Percentage
}

class EnergyReportsService {
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
  private generateSampleLoadData(days: number = 7): EnergyLoadData[] {
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const data: EnergyLoadData[] = [];
    
    for (let d = 0; d < days; d++) {
      for (let h = 0; h < 24; h++) {
        for (const region of regions) {
          const date = new Date();
          date.setDate(date.getDate() - days + d);
          date.setHours(h, 0, 0, 0);
          
          const baseLoad = 1000 + Math.random() * 500;
          const peakMultiplier = (h >= 9 && h <= 21) ? 1.3 : 0.8;
          const actualLoad = baseLoad * peakMultiplier + (Math.random() - 0.5) * 100;
          
          data.push({
            timestamp: date,
            region,
            actualLoad: Math.round(actualLoad),
            forecastedLoad: Math.round(actualLoad + (Math.random() - 0.5) * 50),
            temperature: 20 + Math.random() * 15,
            humidity: 40 + Math.random() * 40,
            dayType: date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : 'weekday',
            peakHour: h >= 9 && h <= 21
          });
        }
      }
    }
    
    return data;
  }

  private generateSampleGridSegments(count: number = 20): GridSegment[] {
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    
    return Array.from({ length: count }, (_, i) => {
      const capacity = 500 + Math.random() * 1500;
      const currentLoad = capacity * (0.3 + Math.random() * 0.6);
      const utilizationRate = (currentLoad / capacity) * 100;
      
      const lastMaintenance = new Date();
      lastMaintenance.setDate(lastMaintenance.getDate() - Math.floor(Math.random() * 180));
      
      const nextMaintenance = new Date();
      nextMaintenance.setDate(nextMaintenance.getDate() + Math.floor(Math.random() * 180));
      
      return {
        segmentId: `SEG-${String(i + 1).padStart(4, '0')}`,
        segmentName: `Grid Segment ${regions[i % regions.length]}-${Math.floor(i / regions.length) + 1}`,
        region: regions[i % regions.length],
        capacity: Math.round(capacity),
        currentLoad: Math.round(currentLoad),
        utilizationRate: Math.round(utilizationRate),
        status: utilizationRate > 90 ? 'critical' : 
                utilizationRate > 80 ? 'warning' : 
                Math.random() > 0.95 ? 'offline' : 'normal',
        lastMaintenanceDate: lastMaintenance,
        nextMaintenanceDate: nextMaintenance
      };
    });
  }

  // 1. Daily Load Forecast Report
  async generateDailyLoadForecastReport() {
    const loadData = this.generateSampleLoadData(1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const regionSummary = loadData.reduce((acc, data) => {
      if (!acc[data.region]) {
        acc[data.region] = {
          peakLoad: 0,
          avgLoad: 0,
          minLoad: Infinity,
          count: 0
        };
      }
      acc[data.region].peakLoad = Math.max(acc[data.region].peakLoad, data.forecastedLoad);
      acc[data.region].avgLoad += data.forecastedLoad;
      acc[data.region].minLoad = Math.min(acc[data.region].minLoad, data.forecastedLoad);
      acc[data.region].count++;
      return acc;
    }, {} as Record<string, any>);

    Object.keys(regionSummary).forEach(region => {
      regionSummary[region].avgLoad = Math.round(regionSummary[region].avgLoad / regionSummary[region].count);
    });

    const content: ReportContent = {
      title: `Daily Load Forecast - ${tomorrow.toLocaleDateString()}`,
      subtitle: 'AI-powered energy demand predictions for optimal grid management',
      sections: [
        {
          heading: 'Executive Summary',
          content: `Total System Peak Load: ${Math.max(...loadData.map(d => d.forecastedLoad)).toLocaleString()} MW\nExpected Peak Time: 2:00 PM - 4:00 PM\nWeather Impact: Moderate (Temperature: 28°C)\nConfidence Level: 94.5%\nRecommended Reserve Margin: 15%`,
          type: 'text'
        },
        {
          heading: 'Regional Forecast Summary',
          content: Object.entries(regionSummary).map(([region, data]: [string, any]) => ({
            'Region': region,
            'Peak Load (MW)': data.peakLoad.toLocaleString(),
            'Average Load (MW)': data.avgLoad.toLocaleString(),
            'Minimum Load (MW)': data.minLoad.toLocaleString(),
            'Peak Time': '2:00 PM',
            'Capacity Margin': `${Math.round(Math.random() * 20 + 10)}%`
          })),
          type: 'table'
        },
        {
          heading: 'Operational Recommendations',
          content: [
            'Activate peaking units in North region by 1:00 PM',
            'Schedule demand response event for industrial customers 2:00-5:00 PM',
            'Increase spinning reserve to 500 MW during peak hours',
            'Monitor West region transmission constraints',
            'Coordinate with neighboring utilities for potential imports'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: `Daily Load Forecast - ${tomorrow.toLocaleDateString()}`,
      description: 'AI-powered energy demand predictions',
      type: 'pdf',
      agent: 'Vanguard Load Forecast Agent',
      useCaseId: 'energy-load-forecasting',
      workflowId: 'daily-forecast'
    });
  }

  // 2. Weekly Load Analysis Report
  async generateWeeklyLoadAnalysisReport() {
    const loadData = this.generateSampleLoadData(7);
    const accuracy = this.generateForecastAccuracy(7);
    
    const weeklyStats = {
      totalEnergy: loadData.reduce((sum, d) => sum + d.actualLoad, 0),
      avgDailyPeak: 0,
      avgAccuracy: accuracy.reduce((sum, a) => sum + a.accuracy, 0) / accuracy.length
    };

    const excelData = {
      'Weekly Summary': [
        { Metric: 'Total Energy Delivered', Value: `${(weeklyStats.totalEnergy / 1000).toFixed(2)} GWh` },
        { Metric: 'Average Daily Peak', Value: `${Math.round(weeklyStats.totalEnergy / 7 / 24 * 1.3)} MW` },
        { Metric: 'Forecast Accuracy', Value: `${weeklyStats.avgAccuracy.toFixed(2)}%` },
        { Metric: 'Peak Day', Value: 'Wednesday' },
        { Metric: 'Lowest Load Day', Value: 'Sunday' }
      ],
      'Daily Peaks': Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        return {
          Date: date.toLocaleDateString(),
          'Peak Load (MW)': Math.round(1500 + Math.random() * 500),
          'Peak Time': `${Math.floor(Math.random() * 4) + 14}:00`,
          'Min Load (MW)': Math.round(800 + Math.random() * 200),
          'Load Factor': `${(65 + Math.random() * 20).toFixed(1)}%`
        };
      }),
      'Hourly Patterns': Array.from({ length: 24 }, (_, hour) => ({
        Hour: `${hour}:00`,
        'Avg Load (MW)': Math.round(1000 + (hour >= 9 && hour <= 21 ? 500 : -200) + Math.random() * 100),
        'Peak Occurrence': hour >= 14 && hour <= 18 ? 'High' : hour >= 9 && hour <= 21 ? 'Medium' : 'Low'
      }))
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Weekly Load Analysis Report',
      description: 'Comprehensive weekly energy consumption patterns and trends',
      type: 'xlsx',
      agent: 'Vanguard Analytics Agent',
      useCaseId: 'energy-load-forecasting',
      workflowId: 'weekly-analysis'
    });
  }

  // 3. Grid Capacity Planning Report
  async generateGridCapacityPlanningReport() {
    const gridSegments = this.generateSampleGridSegments(25);
    const criticalSegments = gridSegments.filter(s => s.status === 'critical' || s.status === 'warning');
    
    const content: ReportContent = {
      title: 'Grid Capacity Planning Report - Q4 2024',
      subtitle: 'Strategic assessment of grid infrastructure and capacity requirements',
      sections: [
        {
          heading: 'Capacity Overview',
          content: `Total Grid Capacity: ${gridSegments.reduce((sum, s) => sum + s.capacity, 0).toLocaleString()} MW\nCurrent System Load: ${gridSegments.reduce((sum, s) => sum + s.currentLoad, 0).toLocaleString()} MW\nSystem Utilization: ${((gridSegments.reduce((sum, s) => sum + s.currentLoad, 0) / gridSegments.reduce((sum, s) => sum + s.capacity, 0)) * 100).toFixed(2)}%\nCritical Segments: ${criticalSegments.length}\nPlanned Capacity Additions: 2,500 MW`,
          type: 'text'
        },
        {
          heading: 'Critical Infrastructure',
          content: criticalSegments.slice(0, 10).map(s => ({
            'Segment ID': s.segmentId,
            'Segment Name': s.segmentName,
            'Utilization': `${s.utilizationRate}%`,
            'Status': s.status.toUpperCase(),
            'Capacity (MW)': s.capacity,
            'Current Load (MW)': s.currentLoad,
            'Action Required': s.utilizationRate > 90 ? 'Immediate' : 'Scheduled'
          })),
          type: 'table'
        },
        {
          heading: 'Capacity Expansion Recommendations',
          content: [
            'Priority 1: Add 500 MW transmission capacity in North region',
            'Priority 2: Install 300 MW battery storage at Central hub',
            'Priority 3: Upgrade West region substations (200 MW)',
            'Consider distributed generation incentives in high-load areas',
            'Implement dynamic line rating technology on critical corridors',
            'Plan for 20% capacity growth over next 5 years'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Grid Capacity Planning Report - Q4 2024',
      description: 'Strategic grid infrastructure assessment',
      type: 'pdf',
      agent: 'Vanguard Planning Agent',
      useCaseId: 'energy-load-forecasting',
      workflowId: 'capacity-planning'
    });
  }

  // 4. Demand Response Performance Report
  async generateDemandResponseReport() {
    const drEvents = this.generateDemandResponseEvents(15);
    const totalSavings = drEvents.reduce((sum, e) => sum + e.incentivePaid, 0);
    const avgSuccess = drEvents.reduce((sum, e) => sum + e.successRate, 0) / drEvents.length;

    const content: ReportContent = {
      title: 'Demand Response Performance Report - November 2024',
      subtitle: 'Analysis of demand response program effectiveness and customer participation',
      sections: [
        {
          heading: 'Program Summary',
          content: `Total DR Events: ${drEvents.length}\nTotal Load Reduction: ${drEvents.reduce((sum, e) => sum + e.actualReduction, 0).toLocaleString()} MW\nAverage Success Rate: ${avgSuccess.toFixed(2)}%\nTotal Incentives Paid: $${totalSavings.toLocaleString()}\nParticipating Customers: ${drEvents.reduce((sum, e) => sum + e.participatingCustomers, 0).toLocaleString()}`,
          type: 'text'
        },
        {
          heading: 'Recent DR Events',
          content: drEvents.slice(0, 10).map(e => ({
            'Event Date': e.eventDate.toLocaleDateString(),
            'Region': e.region,
            'Target (MW)': e.targetReduction,
            'Actual (MW)': e.actualReduction,
            'Success Rate': `${e.successRate.toFixed(1)}%`,
            'Participants': e.participatingCustomers,
            'Incentives': `$${e.incentivePaid.toLocaleString()}`
          })),
          type: 'table'
        },
        {
          heading: 'Performance Insights',
          content: [
            'Industrial customers show highest compliance rates (95%+)',
            'Residential participation increased 23% month-over-month',
            'Average response time improved to 12 minutes',
            'Cost per MW reduced by 15% through automation',
            'Weather-based events show highest effectiveness'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Demand Response Performance Report - November 2024',
      description: 'DR program effectiveness analysis',
      type: 'pdf',
      agent: 'Vanguard DR Management Agent',
      useCaseId: 'energy-load-forecasting',
      workflowId: 'demand-response'
    });
  }

  // 5. Forecast Accuracy Report
  async generateForecastAccuracyReport() {
    const accuracyData = this.generateForecastAccuracy(30);
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    
    const excelData = {
      'Monthly Summary': regions.map(region => {
        const regionData = accuracyData.filter(a => a.region === region);
        return {
          Region: region,
          'Avg MAPE (%)': (regionData.reduce((sum, a) => sum + a.mape, 0) / regionData.length).toFixed(2),
          'Avg RMSE': (regionData.reduce((sum, a) => sum + a.rmse, 0) / regionData.length).toFixed(2),
          'Avg Accuracy (%)': (regionData.reduce((sum, a) => sum + a.accuracy, 0) / regionData.length).toFixed(2),
          'Best Day': `${Math.max(...regionData.map(a => a.accuracy)).toFixed(2)}%`,
          'Worst Day': `${Math.min(...regionData.map(a => a.accuracy)).toFixed(2)}%`
        };
      }),
      'Daily Accuracy': accuracyData.map(a => ({
        Date: a.date.toLocaleDateString(),
        Region: a.region,
        'MAPE (%)': a.mape.toFixed(2),
        'RMSE': a.rmse.toFixed(2),
        'Accuracy (%)': a.accuracy.toFixed(2),
        'Forecast Horizon': a.forecastHorizon
      })),
      'Model Performance': [
        { Model: 'LSTM Neural Network', 'Day-Ahead Accuracy': '94.5%', 'Week-Ahead Accuracy': '89.2%' },
        { Model: 'Random Forest', 'Day-Ahead Accuracy': '92.8%', 'Week-Ahead Accuracy': '87.5%' },
        { Model: 'ARIMA', 'Day-Ahead Accuracy': '88.3%', 'Week-Ahead Accuracy': '82.1%' },
        { Model: 'Ensemble', 'Day-Ahead Accuracy': '95.7%', 'Week-Ahead Accuracy': '91.3%' }
      ]
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Forecast Accuracy Report - November 2024',
      description: 'Detailed analysis of load forecasting model performance',
      type: 'xlsx',
      agent: 'Vanguard ML Performance Agent',
      useCaseId: 'energy-load-forecasting',
      workflowId: 'accuracy-analysis'
    });
  }

  // 6. Real-time Operations Dashboard Data
  async generateOperationsDashboardData() {
    const currentLoad = this.generateSampleLoadData(0.04); // Last hour
    const gridStatus = this.generateSampleGridSegments(15);
    
    const dashboardData = {
      timestamp: new Date().toISOString(),
      systemStatus: {
        totalLoad: currentLoad.reduce((sum, d) => sum + d.actualLoad, 0),
        totalCapacity: gridStatus.reduce((sum, s) => sum + s.capacity, 0),
        systemFrequency: 59.98 + Math.random() * 0.04,
        spinningReserve: Math.round(300 + Math.random() * 200),
        alerts: gridStatus.filter(s => s.status !== 'normal').length
      },
      regionalLoads: currentLoad.reduce((acc, d) => {
        if (!acc[d.region]) acc[d.region] = 0;
        acc[d.region] = d.actualLoad;
        return acc;
      }, {} as Record<string, number>),
      criticalAlerts: gridStatus
        .filter(s => s.status === 'critical')
        .map(s => ({
          segment: s.segmentName,
          issue: 'High utilization',
          action: 'Load redistribution required'
        })),
      forecastAccuracy: {
        lastHour: 96.5 + Math.random() * 2,
        lastDay: 94.2 + Math.random() * 2,
        trend: 'improving'
      }
    };

    return await reportService.generateJSONReport(dashboardData, {
      name: 'Real-time Operations Dashboard',
      description: 'Live system status and operational metrics',
      type: 'json',
      agent: 'Vanguard Operations Monitor',
      useCaseId: 'energy-load-forecasting',
      workflowId: 'realtime-dashboard'
    });
  }

  // Helper methods
  private generateForecastAccuracy(days: number): ForecastAccuracy[] {
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const data: ForecastAccuracy[] = [];
    
    for (let d = 0; d < days; d++) {
      for (const region of regions) {
        const date = new Date();
        date.setDate(date.getDate() - days + d);
        
        const mape = 2 + Math.random() * 6;
        const rmse = 20 + Math.random() * 30;
        const accuracy = 100 - mape;
        
        data.push({
          date,
          region,
          mape,
          rmse,
          accuracy,
          forecastHorizon: 'Day-ahead'
        });
      }
    }
    
    return data;
  }

  private generateDemandResponseEvents(count: number): DemandResponse[] {
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    
    return Array.from({ length: count }, (_, i) => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 30));
      
      const targetReduction = 50 + Math.random() * 200;
      const successRate = 70 + Math.random() * 30;
      const actualReduction = targetReduction * (successRate / 100);
      
      return {
        eventId: `DR-${String(i + 1).padStart(5, '0')}`,
        eventDate,
        region: regions[Math.floor(Math.random() * regions.length)],
        targetReduction: Math.round(targetReduction),
        actualReduction: Math.round(actualReduction),
        participatingCustomers: Math.floor(100 + Math.random() * 900),
        incentivePaid: Math.round(actualReduction * (50 + Math.random() * 50)),
        successRate
      };
    });
  }

  // Generate all reports
  async generateAllReports() {
    try {
      logger.info('Generating all energy load forecasting reports...');
      
      const reports = await Promise.all([
        this.generateDailyLoadForecastReport(),
        this.generateWeeklyLoadAnalysisReport(),
        this.generateGridCapacityPlanningReport(),
        this.generateDemandResponseReport(),
        this.generateForecastAccuracyReport(),
        this.generateOperationsDashboardData()
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
      case 'daily-load-forecast':
        return await this.generateDailyLoadForecastReport();
      case 'weekly-load-analysis':
        return await this.generateWeeklyLoadAnalysisReport();
      case 'grid-capacity-planning':
        return await this.generateGridCapacityPlanningReport();
      case 'demand-response-performance':
        return await this.generateDemandResponseReport();
      case 'forecast-accuracy':
        return await this.generateForecastAccuracyReport();
      case 'operations-dashboard':
        return await this.generateOperationsDashboardData();
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}

export const energyReportsService = new EnergyReportsService();