import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  BoltIcon,
  HeartIcon,
  BanknotesIcon,
  MapIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  MapPinIcon,
  XMarkIcon,
  LockClosedIcon,
  ChevronDownIcon,
  KeyIcon,
  FingerPrintIcon,
  ServerIcon,
  CloudIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
  ScaleIcon,
  ClipboardDocumentCheckIcon,
  BeakerIcon as TestTubeIcon,
  CpuChipIcon,
  SignalIcon,
  SunIcon,
  Battery100Icon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/Badge';
import { Progress } from '../components/Progress';
import { SIAMetrics } from '../components/ui/SIAMetric';
import { SIAAnalysisModal } from '../components/use-cases/shared/SIAAnalysisModal';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { generateLandLeaseData } from '../services/mockData.service';
import { SIADataGeneratorService } from '../services/siaDataGenerator.service';
import type { UseCaseContext } from '../types/sia.types';
import type { UseCase } from '../config/verticals';
import { verticals } from '../config/verticals';
import { useUseCaseContext } from '../contexts/UseCaseContext';

// Import custom dashboard components
import InsuranceRiskAssessmentDashboard from './dashboards/InsuranceRiskAssessmentDashboard';
import PHMSAComplianceDashboard from './dashboards/PHMSAComplianceDashboard';
import MethaneLeakDetectionDashboard from './dashboards/MethaneLeakDetectionDashboard';
import GridResilienceDashboard from './dashboards/GridResilienceDashboard';
import InternalAuditGovernanceDashboard from './dashboards/InternalAuditGovernanceDashboard';
import SCADAIntegrationDashboard from './dashboards/SCADAIntegrationDashboard';
import WildfirePreventionDashboard from './dashboards/WildfirePreventionDashboard';
import AIPricingGovernanceDashboard from './dashboards/AIPricingGovernanceDashboard';

// Map use case IDs to their custom dashboard components
const customDashboards: Record<string, React.ComponentType<{ useCase: UseCase }>> = {
  'insurance-risk-assessment': InsuranceRiskAssessmentDashboard,
  'phmsa-compliance': PHMSAComplianceDashboard,
  'methane-leak-detection': MethaneLeakDetectionDashboard,
  'grid-resilience': GridResilienceDashboard,
  'internal-audit-governance': InternalAuditGovernanceDashboard,
  'scada-integration': SCADAIntegrationDashboard,
  'wildfire-prevention': WildfirePreventionDashboard,
  'ai-pricing-governance': AIPricingGovernanceDashboard,
};

// Mock data generators for different use cases
const generateUseCaseData = (useCase: UseCase) => {
  // Get dynamic SIA data for this use case
  // Derive vertical from use case ID (e.g., "energy-oilfield-land-lease" -> "energy")
  const vertical = useCase.id.split('-')[0];
  
  const useCaseContext: UseCaseContext = {
    id: useCase.id,
    vertical: vertical,
    name: useCase.name,
    siaScores: useCase.siaScores
  };
  
  const siaData = SIADataGeneratorService.generateSIAData(useCaseContext);
  
  // Log to verify dynamic SIA data generation
  console.log(`Generated SIA data for use case: ${useCase.id} (vertical: ${vertical})`, siaData);

  const verticalData: Record<string, any> = {
    energy: {
      'oilfield-land-lease': (() => {
        // Get all 50 land leases from the mock data service
        const landLeases = generateLandLeaseData();
        
        // Calculate metrics based on actual lease data
        const totalLeases = landLeases.length;
        const activeLeases = landLeases.filter(l => l.status === 'Active').length;
        const totalAcres = landLeases.reduce((sum, lease) => sum + lease.location.acres, 0);
        const totalRevenue = landLeases.reduce((sum, lease) => sum + lease.annualPayment, 0);
        const avgCompliance = landLeases.reduce((sum, lease) => {
          const complianceScore = (
            (lease.compliance.environmental ? 33.33 : 0) +
            (lease.compliance.regulatory ? 33.33 : 0) +
            (lease.compliance.safety ? 33.33 : 0)
          );
          return sum + complianceScore;
        }, 0) / totalLeases;

        // Calculate lease status distribution
        const statusCounts = landLeases.reduce((acc, lease) => {
          acc[lease.status] = (acc[lease.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          landLeases,
          metrics: [
            { name: 'Total Leases', value: totalLeases, unit: '', trend: 'up', change: 12 },
            { name: 'Total Acres', value: totalAcres, unit: '', trend: 'up', change: 8 },
            { name: 'Annual Revenue', value: (totalRevenue / 1000000).toFixed(1), unit: 'M', trend: 'up', change: 15 },
            { name: 'Compliance Score', value: avgCompliance.toFixed(0), unit: '%', trend: 'down', change: -2 },
          ],
          revenueData: [
            { month: 'Jan', lease: 10.2, royalty: 5.8, production: 3.2, total: 19.2 },
            { month: 'Feb', lease: 10.5, royalty: 6.1, production: 3.4, total: 20.0 },
            { month: 'Mar', lease: 11.2, royalty: 6.3, production: 3.6, total: 21.1 },
            { month: 'Apr', lease: 10.8, royalty: 6.5, production: 3.5, total: 20.8 },
            { month: 'May', lease: 11.5, royalty: 6.8, production: 3.8, total: 22.1 },
            { month: 'Jun', lease: 12.1, royalty: 7.2, production: 4.1, total: 23.4 },
          ],
          riskData: [
            { field: 'Permian Basin', leases: 847, atRisk: 12, revenue: 45.2 },
            { field: 'Eagle Ford', leases: 623, atRisk: 8, revenue: 32.1 },
            { field: 'Bakken', leases: 512, atRisk: 15, revenue: 28.7 },
            { field: 'Marcellus', leases: 865, atRisk: 10, revenue: 21.5 },
          ],
          leaseRenewalTimeline: [
            { days: '0-30', count: 3, revenue: 1.2 },
            { days: '31-60', count: 5, revenue: 2.1 },
            { days: '61-90', count: 8, revenue: 3.5 },
            { days: '91-120', count: 12, revenue: 4.8 },
            { days: '121-180', count: 18, revenue: 7.2 },
            { days: '181-365', count: 24, revenue: 9.6 },
            { days: '365+', count: 45, revenue: 18.0 },
          ],
          productionByWellType: [
            { name: 'Horizontal Wells', value: 65, color: '#3B82F6' },
            { name: 'Vertical Wells', value: 20, color: '#10B981' },
            { name: 'Directional Wells', value: 10, color: '#F59E0B' },
            { name: 'Injection Wells', value: 5, color: '#8B5CF6' },
          ],
          leaseStatuses: [
            { status: 'Active', count: statusCounts['Active'] || 0, color: 'text-green-500' },
            { status: 'Pending', count: statusCounts['Pending'] || 0, color: 'text-yellow-500' },
            { status: 'Under Review', count: statusCounts['Under Review'] || 0, color: 'text-blue-500' },
            { status: 'Expiring Soon', count: statusCounts['Expiring Soon'] || 0, color: 'text-orange-500' },
          ],
          activeWorkflows: [
            { name: 'Lease Renewal Analysis - Permian Basin', progress: 85, priority: 'Critical', status: 'Market analysis in progress' },
            { name: 'Royalty Payment Reconciliation', progress: 60, priority: 'High', status: 'Processing 2,847 transactions' },
            { name: 'Title Chain Verification - Eagle Ford', progress: 40, priority: 'Medium', status: 'Validating mineral rights' },
            { name: 'Sensitivity Analysis - Q2 Renewals', progress: 30, priority: 'High', status: 'Modeling profitability impact' },
            { name: 'Compliance Document Generation', progress: 95, priority: 'Low', status: 'Final VANGUARDS review' },
          ],
          criticalExpirations: [
            {
              name: 'Permian Basin - Block 42',
              wells: 'PB-42-001 through PB-42-015',
              daysUntilExpiry: 45,
              currentRate: 125,
              marketRate: 145,
              productionImpact: 1.2,
              renewalStatus: 'Negotiating'
            },
            {
              name: 'Eagle Ford - Section 18',
              wells: 'EF-18-101 through EF-18-108',
              daysUntilExpiry: 120,
              currentRate: 95,
              marketRate: 110,
              productionImpact: 0.85,
              renewalStatus: 'Pending Review'
            },
          ],
          revenueAtRisk: [
            { month: 'Jan', atRisk: 0.5, secured: 8.0 },
            { month: 'Feb', atRisk: 1.2, secured: 7.6 },
            { month: 'Mar', atRisk: 2.1, secured: 7.2 },
            { month: 'Apr', atRisk: 0.8, secured: 8.4 },
            { month: 'May', atRisk: 0.3, secured: 9.4 },
            { month: 'Jun', atRisk: 1.5, secured: 8.7 },
          ],
          profitabilityByField: [
            { name: 'Permian Basin', value: 45, profit: 18.5 },
            { name: 'Eagle Ford', value: 28, profit: 12.3 },
            { name: 'Bakken', value: 15, profit: 8.7 },
            { name: 'Marcellus', value: 8, profit: 5.2 },
            { name: 'Other', value: 4, profit: 2.1 },
          ],
        };
      })(),
      'drilling-risk-assessment': (() => {
        // Generate realistic drilling operations data
        const activeWells = [
          { id: 'DW-001', name: 'Permian Deep Well 1', depth: 12500, risk: 'low', status: 'drilling', progress: 78 },
          { id: 'DW-002', name: 'Eagle Ford Horizontal 3', depth: 8900, risk: 'medium', status: 'drilling', progress: 45 },
          { id: 'DW-003', name: 'Bakken Shale 7', depth: 10200, risk: 'high', status: 'monitoring', progress: 92 },
          { id: 'DW-004', name: 'Marcellus Gas 2', depth: 7600, risk: 'low', status: 'drilling', progress: 23 },
          { id: 'DW-005', name: 'Permian Basin 9', depth: 11800, risk: 'medium', status: 'completion', progress: 95 },
        ];

        const riskFactors = [
          { factor: 'Formation Pressure', score: 85, trend: 'increasing', impact: 'high' },
          { factor: 'Wellbore Stability', score: 72, trend: 'stable', impact: 'critical' },
          { factor: 'Equipment Condition', score: 91, trend: 'improving', impact: 'medium' },
          { factor: 'Weather Conditions', score: 88, trend: 'stable', impact: 'low' },
          { factor: 'Crew Experience', score: 94, trend: 'improving', impact: 'high' },
        ];

        return {
          metrics: [
            { name: 'Active Wells', value: 342, unit: '', trend: 'up', change: 8 },
            { name: 'Risk Score Avg', value: 82, unit: '%', trend: 'down', change: -5 },
            { name: 'NPT Prevented', value: 18.5, unit: 'M', trend: 'up', change: 22 },
            { name: 'Prediction Accuracy', value: 92, unit: '%', trend: 'up', change: 3 },
          ],
          activeWells,
          riskFactors,
          riskTrendData: [
            { week: 'W1', highRisk: 5, mediumRisk: 12, lowRisk: 25, incidents: 2 },
            { week: 'W2', highRisk: 3, mediumRisk: 15, lowRisk: 28, incidents: 1 },
            { week: 'W3', highRisk: 2, mediumRisk: 10, lowRisk: 32, incidents: 0 },
            { week: 'W4', highRisk: 4, mediumRisk: 11, lowRisk: 30, incidents: 1 },
            { week: 'W5', highRisk: 3, mediumRisk: 13, lowRisk: 31, incidents: 0 },
            { week: 'W6', highRisk: 2, mediumRisk: 9, lowRisk: 35, incidents: 0 },
          ],
          costSavingsData: [
            { category: 'Equipment Damage', prevented: 8.2, actual: 1.5, incidents: 3 },
            { category: 'Delays', prevented: 5.8, actual: 0.8, incidents: 7 },
            { category: 'Environmental', prevented: 3.2, actual: 0.2, incidents: 1 },
            { category: 'Safety Incidents', prevented: 1.3, actual: 0, incidents: 0 },
          ],
          realTimeAlerts: [
            {
              id: 1,
              well: 'Eagle Ford Horizontal 3',
              type: 'Pressure Anomaly',
              severity: 'high',
              time: '2 hours ago',
              description: 'Unexpected pressure spike detected at 8,900ft',
              action: 'Reduce drilling speed, monitor closely'
            },
            {
              id: 2,
              well: 'Bakken Shale 7',
              type: 'Vibration Alert',
              severity: 'medium',
              time: '5 hours ago',
              description: 'Drill string vibration exceeding threshold',
              action: 'Adjust WOB and RPM parameters'
            },
            {
              id: 3,
              well: 'Permian Deep Well 1',
              type: 'Mud Loss',
              severity: 'low',
              time: '8 hours ago',
              description: 'Minor mud losses detected in fractured zone',
              action: 'Add LCM to drilling fluid'
            },
          ],
          drillingParameters: [
            { param: 'Weight on Bit', optimal: 35000, current: 34500, unit: 'lbs', status: 'good' },
            { param: 'Rotary Speed', optimal: 120, current: 118, unit: 'RPM', status: 'good' },
            { param: 'Flow Rate', optimal: 850, current: 820, unit: 'GPM', status: 'warning' },
            { param: 'Torque', optimal: 25000, current: 28000, unit: 'ft-lbs', status: 'critical' },
          ],
          wellPerformance: [
            { month: 'Jan', planned: 8500, actual: 8200, npt: 300 },
            { month: 'Feb', planned: 9200, actual: 9000, npt: 200 },
            { month: 'Mar', planned: 8800, actual: 8600, npt: 200 },
            { month: 'Apr', planned: 9500, actual: 9400, npt: 100 },
            { month: 'May', planned: 9000, actual: 8950, npt: 50 },
            { month: 'Jun', planned: 9300, actual: 9280, npt: 20 },
          ],
          riskMatrix: [
            { probability: 'Very High', veryLow: 0, low: 1, medium: 2, high: 3, veryHigh: 5 },
            { probability: 'High', veryLow: 0, low: 1, medium: 2, high: 3, veryHigh: 4 },
            { probability: 'Medium', veryLow: 0, low: 0, medium: 1, high: 2, veryHigh: 3 },
            { probability: 'Low', veryLow: 0, low: 0, medium: 0, high: 1, veryHigh: 2 },
            { probability: 'Very Low', veryLow: 0, low: 0, medium: 0, high: 0, veryHigh: 1 },
          ],
        };
      })(),
      'environmental-compliance': (() => {
        // Generate comprehensive environmental compliance data
        const monitoringPoints = [
          { id: 'MP-001', name: 'Wellhead Alpha-1', type: 'Air Quality', status: 'active', lastReading: '2 hours ago', compliance: 98.5 },
          { id: 'MP-002', name: 'Storage Tank B-3', type: 'VOC Emissions', status: 'active', lastReading: '1 hour ago', compliance: 96.2 },
          { id: 'MP-003', name: 'Flare Stack C-2', type: 'Combustion Efficiency', status: 'warning', lastReading: '30 mins ago', compliance: 89.8 },
          { id: 'MP-004', name: 'Water Discharge Point D-1', type: 'Water Quality', status: 'active', lastReading: '4 hours ago', compliance: 99.1 },
          { id: 'MP-005', name: 'Drilling Site E-5', type: 'Noise Monitoring', status: 'active', lastReading: '15 mins ago', compliance: 100 },
        ];

        const regulatoryAlerts = [
          {
            id: 1,
            regulation: 'EPA Clean Air Act - Section 111',
            status: 'upcoming',
            deadline: '45 days',
            impact: 'high',
            description: 'New methane emission standards for oil and gas operations',
            action: 'Review and update monitoring protocols',
            affectedAssets: 125
          },
          {
            id: 2,
            regulation: 'State Water Quality Standards',
            status: 'active',
            deadline: 'Ongoing',
            impact: 'medium',
            description: 'Enhanced monitoring requirements for produced water',
            action: 'Implement additional testing procedures',
            affectedAssets: 48
          },
          {
            id: 3,
            regulation: 'Local Noise Ordinance Update',
            status: 'pending',
            deadline: '90 days',
            impact: 'low',
            description: 'Reduced noise limits during nighttime operations',
            action: 'Schedule equipment upgrades',
            affectedAssets: 12
          },
        ];

        const permitStatus = [
          { permit: 'Air Quality Permit', number: 'AQ-2024-1234', status: 'Active', expiry: '2025-12-31', compliance: 98.5 },
          { permit: 'Water Discharge Permit', number: 'WD-2024-5678', status: 'Active', expiry: '2025-06-30', compliance: 99.2 },
          { permit: 'Waste Management License', number: 'WM-2024-9012', status: 'Renewal Due', expiry: '2024-09-30', compliance: 97.8 },
          { permit: 'Operating License', number: 'OP-2024-3456', status: 'Active', expiry: '2026-03-31', compliance: 100 },
        ];

        return {
          metrics: [
            { name: 'Monitoring Points', value: 1247, unit: '', trend: 'up', change: 15 },
            { name: 'Violations Prevented', value: 47, unit: '', trend: 'up', change: 35 },
            { name: 'Compliance Rate', value: 98.5, unit: '%', trend: 'up', change: 2.5 },
            { name: 'Fines Avoided', value: 3.2, unit: 'M', trend: 'up', change: 45 },
          ],
          monitoringPoints,
          regulatoryAlerts,
          permitStatus,
          emissionsData: [
            { month: 'Jan', methane: 120, co2: 450, nox: 85, target: 100 },
            { month: 'Feb', methane: 115, co2: 440, nox: 82, target: 100 },
            { month: 'Mar', methane: 108, co2: 425, nox: 78, target: 100 },
            { month: 'Apr', methane: 102, co2: 415, nox: 75, target: 100 },
            { month: 'May', methane: 98, co2: 405, nox: 72, target: 100 },
            { month: 'Jun', methane: 95, co2: 395, nox: 70, target: 100 },
          ],
          complianceByCategory: [
            { category: 'Air Quality', score: 97, violations: 2, trend: 'improving' },
            { category: 'Water Management', score: 99, violations: 0, trend: 'stable' },
            { category: 'Waste Disposal', score: 98, violations: 1, trend: 'improving' },
            { category: 'Noise Levels', score: 100, violations: 0, trend: 'stable' },
            { category: 'Soil Protection', score: 96, violations: 3, trend: 'declining' },
            { category: 'Wildlife Impact', score: 94, violations: 2, trend: 'improving' },
          ],
          emissionsBySource: [
            { source: 'Flaring', percentage: 35, reduction: 12 },
            { source: 'Venting', percentage: 25, reduction: 18 },
            { source: 'Equipment Leaks', percentage: 20, reduction: 22 },
            { source: 'Storage Tanks', percentage: 15, reduction: 8 },
            { source: 'Other', percentage: 5, reduction: 5 },
          ],
          complianceTrend: [
            { week: 'W1', airQuality: 96.5, water: 98.8, waste: 97.2, noise: 99.5, overall: 98.0 },
            { week: 'W2', airQuality: 96.8, water: 99.0, waste: 97.5, noise: 99.8, overall: 98.3 },
            { week: 'W3', airQuality: 97.0, water: 99.1, waste: 97.8, noise: 100, overall: 98.5 },
            { week: 'W4', airQuality: 97.2, water: 99.2, waste: 98.0, noise: 100, overall: 98.6 },
            { week: 'W5', airQuality: 97.0, water: 99.2, waste: 98.2, noise: 100, overall: 98.6 },
            { week: 'W6', airQuality: 97.0, water: 99.2, waste: 98.0, noise: 100, overall: 98.5 },
          ],
          environmentalIncidents: [
            { date: '2024-02-15', type: 'Minor Spill', location: 'Tank Farm B', volume: '50 gallons', cleaned: true, reported: true },
            { date: '2024-01-28', type: 'Emission Exceedance', location: 'Compressor Station 3', duration: '2 hours', resolved: true, reported: true },
            { date: '2024-01-10', type: 'Noise Complaint', location: 'Drilling Site 7', action: 'Equipment adjusted', resolved: true, reported: false },
          ],
        };
      })(),
      'load-forecasting': (() => {
        // Generate comprehensive load forecasting data
        const forecastModels = [
          { id: 'LF-001', name: 'Short-Term Load Forecast', horizon: '24 hours', accuracy: 98.5, status: 'active' },
          { id: 'LF-002', name: 'Medium-Term Forecast', horizon: '7 days', accuracy: 96.8, status: 'active' },
          { id: 'LF-003', name: 'Long-Term Planning', horizon: '30 days', accuracy: 94.2, status: 'active' },
          { id: 'LF-004', name: 'Peak Demand Predictor', horizon: 'Daily peaks', accuracy: 97.9, status: 'active' },
          { id: 'LF-005', name: 'Weather-Adjusted Model', horizon: '48 hours', accuracy: 97.2, status: 'testing' },
        ];

        const gridZones = [
          { zone: 'North District', currentLoad: 1250, forecastPeak: 1380, capacity: 1500, utilization: 83.3 },
          { zone: 'South District', currentLoad: 980, forecastPeak: 1150, capacity: 1300, utilization: 75.4 },
          { zone: 'East Industrial', currentLoad: 1820, forecastPeak: 2100, capacity: 2200, utilization: 82.7 },
          { zone: 'West Residential', currentLoad: 750, forecastPeak: 920, capacity: 1000, utilization: 75.0 },
          { zone: 'Central Business', currentLoad: 1450, forecastPeak: 1680, capacity: 1800, utilization: 80.6 },
        ];

        const demandResponse = [
          { program: 'Industrial Curtailment', enrolled: 125, potential: '250 MW', activated: 3, savings: '$2.5M' },
          { program: 'Residential Smart AC', enrolled: 45000, potential: '180 MW', activated: 12, savings: '$1.8M' },
          { program: 'Commercial HVAC', enrolled: 850, potential: '320 MW', activated: 8, savings: '$3.2M' },
          { program: 'Emergency Response', enrolled: 50, potential: '500 MW', activated: 1, savings: '$5.0M' },
        ];

        return {
          metrics: [
            { name: 'Forecast Accuracy', value: 98.2, unit: '%', trend: 'up', change: 1.5 },
            { name: 'Peak Load Saved', value: 450, unit: 'MW', trend: 'up', change: 12 },
            { name: 'Cost Savings', value: 18.7, unit: 'M', trend: 'up', change: 25 },
            { name: 'Blackouts Prevented', value: 8, unit: '', trend: 'down', change: -60 },
          ],
          forecastModels,
          gridZones,
          demandResponse,
          forecastData: [
            { hour: '00:00', actual: 3200, forecast: 3180, baseline: 3250, temperature: 68 },
            { hour: '04:00', actual: 2800, forecast: 2790, baseline: 2850, temperature: 65 },
            { hour: '08:00', actual: 4500, forecast: 4480, baseline: 4400, temperature: 72 },
            { hour: '12:00', actual: 5200, forecast: 5150, baseline: 5000, temperature: 85 },
            { hour: '16:00', actual: 5800, forecast: 5750, baseline: 5500, temperature: 88 },
            { hour: '20:00', actual: 4800, forecast: 4820, baseline: 4700, temperature: 78 },
          ],
          accuracyByType: [
            { type: 'Residential', accuracy: 97.8, volume: 2100, trend: 'stable' },
            { type: 'Commercial', accuracy: 98.5, volume: 1800, trend: 'improving' },
            { type: 'Industrial', accuracy: 99.1, volume: 1500, trend: 'stable' },
            { type: 'Renewable', accuracy: 96.2, volume: 600, trend: 'improving' },
          ],
          weeklyForecast: [
            { day: 'Mon', peak: 5800, average: 4200, minimum: 2800 },
            { day: 'Tue', peak: 5900, average: 4300, minimum: 2900 },
            { day: 'Wed', peak: 6100, average: 4400, minimum: 3000 },
            { day: 'Thu', peak: 6000, average: 4350, minimum: 2950 },
            { day: 'Fri', peak: 5700, average: 4100, minimum: 2700 },
            { day: 'Sat', peak: 5200, average: 3800, minimum: 2500 },
            { day: 'Sun', peak: 5000, average: 3600, minimum: 2400 },
          ],
          loadFactors: [
            { factor: 'Temperature', impact: 35, correlation: 0.89 },
            { factor: 'Time of Day', impact: 28, correlation: 0.92 },
            { factor: 'Day of Week', impact: 20, correlation: 0.85 },
            { factor: 'Economic Activity', impact: 12, correlation: 0.78 },
            { factor: 'Special Events', impact: 5, correlation: 0.65 },
          ],
          forecastAlerts: [
            {
              id: 1,
              type: 'Peak Warning',
              time: 'Tomorrow 3:00 PM',
              expectedLoad: 6200,
              capacity: 6500,
              severity: 'high',
              recommendation: 'Activate demand response programs'
            },
            {
              id: 2,
              type: 'Weather Impact',
              time: 'Next 48 hours',
              expectedLoad: 5800,
              capacity: 6500,
              severity: 'medium',
              recommendation: 'Prepare cooling load management'
            },
          ],
        };
      })(),
      'grid-anomaly': (() => {
        // Generate comprehensive grid anomaly detection data
        const activeAnomalies = [
          {
            id: 'GA-001',
            type: 'Voltage Fluctuation',
            location: 'Substation 42',
            severity: 'critical',
            time: '15 mins ago',
            description: 'Voltage spike detected beyond normal parameters',
            impact: 'Affecting 2,500 customers',
            status: 'investigating'
          },
          {
            id: 'GA-002',
            type: 'Frequency Deviation',
            location: 'Grid Section B-7',
            severity: 'warning',
            time: '1 hour ago',
            description: 'Minor frequency deviation from 60Hz standard',
            impact: 'No customer impact',
            status: 'monitoring'
          },
          {
            id: 'GA-003',
            type: 'Overload Warning',
            location: 'Transformer T-18',
            severity: 'warning',
            time: '2 hours ago',
            description: 'Load approaching maximum capacity',
            impact: 'Potential impact to 500 customers',
            status: 'mitigating'
          },
          {
            id: 'GA-004',
            type: 'Phase Imbalance',
            location: 'Distribution Line D-3',
            severity: 'info',
            time: '3 hours ago',
            description: 'Minor phase imbalance detected',
            impact: 'No immediate impact',
            status: 'resolved'
          },
        ];

        const gridComponents = [
          { id: 'GC-001', name: 'Primary Substation A', type: 'Substation', health: 94, anomalies: 2, lastCheck: '5 mins ago' },
          { id: 'GC-002', name: 'Transmission Line 1', type: 'Transmission', health: 97, anomalies: 0, lastCheck: '10 mins ago' },
          { id: 'GC-003', name: 'Distribution Network C', type: 'Distribution', health: 92, anomalies: 3, lastCheck: '2 mins ago' },
          { id: 'GC-004', name: 'Transformer Bank 5', type: 'Transformer', health: 89, anomalies: 1, lastCheck: '15 mins ago' },
          { id: 'GC-005', name: 'Smart Grid Controller', type: 'Control', health: 98, anomalies: 0, lastCheck: '1 min ago' },
        ];

        const anomalyPatterns = [
          { pattern: 'Seasonal Peak Load', frequency: 'Daily', accuracy: 96, lastDetected: '2 hours ago' },
          { pattern: 'Equipment Degradation', frequency: 'Weekly', accuracy: 92, lastDetected: '3 days ago' },
          { pattern: 'Weather-Related Stress', frequency: 'Variable', accuracy: 89, lastDetected: '1 day ago' },
          { pattern: 'Cyber Attack Signature', frequency: 'Rare', accuracy: 98, lastDetected: 'Never' },
        ];

        return {
          metrics: [
            { name: 'Anomalies Detected', value: 342, unit: '', trend: 'up', change: 15 },
            { name: 'Outages Prevented', value: 89, unit: '', trend: 'up', change: 22 },
            { name: 'Response Time', value: 2.3, unit: 'min', trend: 'down', change: -45 },
            { name: 'Grid Stability', value: 99.2, unit: '%', trend: 'up', change: 1.8 },
          ],
          activeAnomalies,
          gridComponents,
          anomalyPatterns,
          anomalyTrendData: [
            { day: 'Mon', critical: 5, warning: 12, info: 45, resolved: 58 },
            { day: 'Tue', critical: 3, warning: 15, info: 52, resolved: 65 },
            { day: 'Wed', critical: 2, warning: 8, info: 38, resolved: 45 },
            { day: 'Thu', critical: 4, warning: 11, info: 42, resolved: 52 },
            { day: 'Fri', critical: 6, warning: 14, info: 48, resolved: 60 },
            { day: 'Sat', critical: 2, warning: 7, info: 35, resolved: 42 },
            { day: 'Sun', critical: 1, warning: 5, info: 28, resolved: 32 },
          ],
          gridHealthData: [
            { component: 'Transformers', health: 94, issues: 3, trend: 'stable' },
            { component: 'Transmission Lines', health: 97, issues: 1, trend: 'improving' },
            { component: 'Substations', health: 92, issues: 5, trend: 'declining' },
            { component: 'Distribution', health: 96, issues: 2, trend: 'stable' },
            { component: 'Control Systems', health: 98, issues: 0, trend: 'improving' },
          ],
          anomalyHeatmap: [
            { hour: 0, monday: 2, tuesday: 1, wednesday: 0, thursday: 1, friday: 2, saturday: 1, sunday: 0 },
            { hour: 6, monday: 5, tuesday: 4, wednesday: 3, thursday: 4, friday: 5, saturday: 2, sunday: 1 },
            { hour: 12, monday: 8, tuesday: 7, wednesday: 6, thursday: 7, friday: 9, saturday: 4, sunday: 3 },
            { hour: 18, monday: 10, tuesday: 9, wednesday: 8, thursday: 9, friday: 11, saturday: 6, sunday: 5 },
          ],
          responseMetrics: [
            { type: 'Auto-resolved', count: 245, avgTime: '0.5 min' },
            { type: 'Manual Intervention', count: 78, avgTime: '5.2 min' },
            { type: 'Field Response', count: 19, avgTime: '45 min' },
          ],
        };
      })(),
      'renewable-optimization': (() => {
        // Generate comprehensive renewable optimization data
        const generationSources = [
          { id: 'GS-001', name: 'Solar Farm Alpha', type: 'Solar', capacity: 500, currentOutput: 385, efficiency: 77, status: 'optimal' },
          { id: 'GS-002', name: 'Wind Park Beta', type: 'Wind', capacity: 800, currentOutput: 520, efficiency: 65, status: 'good' },
          { id: 'GS-003', name: 'Hydro Station Gamma', type: 'Hydro', capacity: 300, currentOutput: 285, efficiency: 95, status: 'optimal' },
          { id: 'GS-004', name: 'Solar Farm Delta', type: 'Solar', capacity: 350, currentOutput: 210, efficiency: 60, status: 'maintenance' },
          { id: 'GS-005', name: 'Wind Park Epsilon', type: 'Wind', capacity: 600, currentOutput: 480, efficiency: 80, status: 'good' },
        ];

        const storageSystems = [
          { id: 'SS-001', name: 'Battery Bank A', type: 'Li-ion', capacity: 250, currentCharge: 180, efficiency: 92, cycles: 2850, health: 94 },
          { id: 'SS-002', name: 'Battery Bank B', type: 'Li-ion', capacity: 300, currentCharge: 250, efficiency: 91, cycles: 1920, health: 96 },
          { id: 'SS-003', name: 'Pumped Hydro', type: 'Hydro', capacity: 500, currentCharge: 350, efficiency: 85, cycles: 15000, health: 98 },
          { id: 'SS-004', name: 'Battery Bank C', type: 'LFP', capacity: 200, currentCharge: 120, efficiency: 89, cycles: 3500, health: 92 },
        ];

        const optimizationActions = [
          { id: 1, action: 'Solar Curtailment', reason: 'Grid Congestion', power: 120, duration: '2 hours', savings: '$18K', status: 'active' },
          { id: 2, action: 'Battery Discharge', reason: 'Peak Demand', power: 250, duration: '1.5 hours', savings: '$42K', status: 'scheduled' },
          { id: 3, action: 'Wind Ramp Down', reason: 'Low Demand', power: 180, duration: '3 hours', savings: '$15K', status: 'pending' },
          { id: 4, action: 'Hydro Reserve', reason: 'Backup Power', power: 100, duration: '4 hours', savings: '$8K', status: 'standby' },
        ];

        const marketPricing = [
          { time: '00:00', spotPrice: 45, forecast: 42, renewable: 38, conventional: 52 },
          { time: '04:00', spotPrice: 38, forecast: 40, renewable: 35, conventional: 48 },
          { time: '08:00', spotPrice: 65, forecast: 68, renewable: 45, conventional: 75 },
          { time: '12:00', spotPrice: 85, forecast: 82, renewable: 55, conventional: 95 },
          { time: '16:00', spotPrice: 92, forecast: 90, renewable: 60, conventional: 105 },
          { time: '20:00', spotPrice: 78, forecast: 75, renewable: 50, conventional: 88 },
        ];

        const forecastData = [
          { day: 'Mon', solar: 2850, wind: 3200, hydro: 1800, demand: 7200, accuracy: 96.5 },
          { day: 'Tue', solar: 3100, wind: 2800, hydro: 1800, demand: 7500, accuracy: 97.2 },
          { day: 'Wed', solar: 2600, wind: 3500, hydro: 1800, demand: 7800, accuracy: 95.8 },
          { day: 'Thu', solar: 3200, wind: 2900, hydro: 1800, demand: 7600, accuracy: 96.9 },
          { day: 'Fri', solar: 2900, wind: 3100, hydro: 1800, demand: 7400, accuracy: 97.5 },
          { day: 'Sat', solar: 3300, wind: 2600, hydro: 1800, demand: 6800, accuracy: 98.1 },
          { day: 'Sun', solar: 3400, wind: 2400, hydro: 1800, demand: 6500, accuracy: 98.3 },
        ];

        const gridIntegration = [
          { component: 'Transmission Lines', status: 'optimal', load: 78, capacity: 100, health: 96 },
          { component: 'Substations', status: 'good', load: 82, capacity: 100, health: 94 },
          { component: 'Inverters', status: 'optimal', load: 75, capacity: 100, health: 97 },
          { component: 'Grid Tie Points', status: 'warning', load: 88, capacity: 100, health: 91 },
          { component: 'Protection Systems', status: 'optimal', load: 45, capacity: 100, health: 99 },
        ];

        return {
          metrics: [
            { name: 'Renewable Mix', value: 68, unit: '%', trend: 'up', change: 12 },
            { name: 'Energy Storage', value: 1250, unit: 'MWh', trend: 'up', change: 18 },
            { name: 'Carbon Reduced', value: 185, unit: 'kT', trend: 'up', change: 15 },
            { name: 'Cost Efficiency', value: 96, unit: '%', trend: 'up', change: 5 },
          ],
          generationSources,
          storageSystems,
          optimizationActions,
          marketPricing,
          forecastData,
          gridIntegration,
          renewableSourceData: [
            { hour: '00:00', solar: 0, wind: 520, hydro: 285, battery: 180, total: 985 },
            { hour: '04:00', solar: 0, wind: 480, hydro: 285, battery: 150, total: 915 },
            { hour: '08:00', solar: 150, wind: 420, hydro: 285, battery: -50, total: 805 },
            { hour: '12:00', solar: 595, wind: 380, hydro: 285, battery: -120, total: 1140 },
            { hour: '16:00', solar: 420, wind: 450, hydro: 285, battery: -80, total: 1075 },
            { hour: '20:00', solar: 50, wind: 500, hydro: 285, battery: 100, total: 935 },
          ],
          optimizationMetrics: [
            { metric: 'Solar Utilization', value: 92, target: 95, trend: 'improving' },
            { metric: 'Wind Utilization', value: 88, target: 90, trend: 'stable' },
            { metric: 'Storage Efficiency', value: 94, target: 92, trend: 'improving' },
            { metric: 'Grid Balance', value: 97, target: 95, trend: 'optimal' },
            { metric: 'Carbon Intensity', value: 85, target: 100, trend: 'improving' },
            { metric: 'Cost per MWh', value: 78, target: 85, trend: 'optimal' },
          ],
          performanceHistory: [
            { month: 'Jan', renewable: 62, storage: 88, efficiency: 91, carbon: 145 },
            { month: 'Feb', renewable: 64, storage: 90, efficiency: 92, carbon: 155 },
            { month: 'Mar', renewable: 65, storage: 91, efficiency: 93, carbon: 165 },
            { month: 'Apr', renewable: 66, storage: 93, efficiency: 94, carbon: 170 },
            { month: 'May', renewable: 67, storage: 94, efficiency: 95, carbon: 180 },
            { month: 'Jun', renewable: 68, storage: 95, efficiency: 96, carbon: 185 },
          ],
          weatherImpact: [
            { factor: 'Cloud Cover', impact: -15, forecast: 'Partly Cloudy', duration: '4 hours' },
            { factor: 'Wind Speed', impact: +8, forecast: '18-22 mph', duration: '6 hours' },
            { factor: 'Temperature', impact: -3, forecast: '85°F', duration: 'All day' },
            { factor: 'Precipitation', impact: 0, forecast: 'Clear', duration: 'N/A' },
          ],
        };
      })(),
    },
    healthcare: {
      'patient-risk-stratification': (() => {
        // Generate comprehensive patient risk stratification data
        const patientCohorts = [
          { id: 'PC-001', name: 'Diabetes Type 2', size: 3450, avgRisk: 68, trend: 'increasing' },
          { id: 'PC-002', name: 'Cardiovascular Disease', size: 2890, avgRisk: 72, trend: 'stable' },
          { id: 'PC-003', name: 'COPD', size: 1567, avgRisk: 65, trend: 'decreasing' },
          { id: 'PC-004', name: 'Heart Failure', size: 1234, avgRisk: 78, trend: 'increasing' },
          { id: 'PC-005', name: 'Chronic Kidney Disease', size: 987, avgRisk: 71, trend: 'stable' },
          { id: 'PC-006', name: 'Multiple Comorbidities', size: 2322, avgRisk: 85, trend: 'increasing' },
        ];

        const riskFactors = [
          { factor: 'Age > 65', weight: 25, prevalence: 42, impact: 'high' },
          { factor: 'Multiple Medications', weight: 20, prevalence: 38, impact: 'high' },
          { factor: 'Previous Hospitalizations', weight: 30, prevalence: 28, impact: 'critical' },
          { factor: 'Social Determinants', weight: 15, prevalence: 35, impact: 'medium' },
          { factor: 'Medication Non-Adherence', weight: 10, prevalence: 22, impact: 'medium' },
        ];

        const interventions = [
          {
            id: 1,
            type: 'Care Coordination',
            targetGroup: 'High Risk',
            enrolled: 423,
            successRate: 78,
            avgCostSavings: 8500,
            status: 'active'
          },
          {
            id: 2,
            type: 'Remote Monitoring',
            targetGroup: 'Medium-High Risk',
            enrolled: 856,
            successRate: 82,
            avgCostSavings: 5200,
            status: 'active'
          },
          {
            id: 3,
            type: 'Medication Management',
            targetGroup: 'All Risk Levels',
            enrolled: 1234,
            successRate: 75,
            avgCostSavings: 3800,
            status: 'active'
          },
          {
            id: 4,
            type: 'Home Health Visits',
            targetGroup: 'High Risk',
            enrolled: 289,
            successRate: 85,
            avgCostSavings: 12000,
            status: 'expanding'
          },
        ];

        const outcomeMetrics = [
          { metric: 'Readmission Rate', baseline: 18.5, current: 12.3, target: 10, unit: '%' },
          { metric: 'ER Utilization', baseline: 42, current: 31, target: 25, unit: 'visits/1000' },
          { metric: 'Patient Satisfaction', baseline: 72, current: 86, target: 90, unit: '%' },
          { metric: 'Cost per Patient', baseline: 15000, current: 11500, target: 10000, unit: '$' },
          { metric: 'Medication Adherence', baseline: 68, current: 81, target: 85, unit: '%' },
          { metric: 'Care Gap Closure', baseline: 45, current: 72, target: 80, unit: '%' },
        ];

        const predictiveModels = [
          { model: 'Readmission Risk', accuracy: 89.5, auc: 0.92, lastUpdated: '2 hours ago', predictions: 15420 },
          { model: 'ER Visit Likelihood', accuracy: 86.3, auc: 0.88, lastUpdated: '1 hour ago', predictions: 18750 },
          { model: 'Deterioration Risk', accuracy: 91.2, auc: 0.94, lastUpdated: '30 mins ago', predictions: 12300 },
          { model: 'Cost Prediction', accuracy: 84.7, auc: 0.86, lastUpdated: '3 hours ago', predictions: 22100 },
        ];

        return {
          metrics: [
            { name: 'Patients Monitored', value: 12450, unit: '', trend: 'up', change: 18 },
            { name: 'High Risk Identified', value: 623, unit: '', trend: 'up', change: 12 },
            { name: 'Readmissions Prevented', value: 187, unit: '', trend: 'up', change: 28 },
            { name: 'Cost Savings', value: 4.2, unit: 'M', trend: 'up', change: 35 },
          ],
          patientCohorts,
          riskFactors,
          interventions,
          outcomeMetrics,
          predictiveModels,
          riskDistribution: [
            { risk: 'Low', patients: 8500, readmitRate: 5, avgCost: 2500, color: '#10B981' },
            { risk: 'Medium', patients: 3327, readmitRate: 15, avgCost: 8500, color: '#F59E0B' },
            { risk: 'High', patients: 623, readmitRate: 35, avgCost: 25000, color: '#EF4444' },
          ],
          interventionSuccess: [
            { month: 'Jan', prevented: 28, occurred: 12, cost: 1.2 },
            { month: 'Feb', prevented: 32, occurred: 10, cost: 1.0 },
            { month: 'Mar', prevented: 35, occurred: 8, cost: 0.8 },
            { month: 'Apr', prevented: 38, occurred: 7, cost: 0.7 },
            { month: 'May', prevented: 42, occurred: 5, cost: 0.5 },
            { month: 'Jun', prevented: 45, occurred: 4, cost: 0.4 },
          ],
          riskScoreTrend: [
            { week: 'W1', lowRisk: 65, mediumRisk: 28, highRisk: 7 },
            { week: 'W2', lowRisk: 66, mediumRisk: 27, highRisk: 7 },
            { week: 'W3', lowRisk: 68, mediumRisk: 26, highRisk: 6 },
            { week: 'W4', lowRisk: 69, mediumRisk: 25, highRisk: 6 },
            { week: 'W5', lowRisk: 70, mediumRisk: 25, highRisk: 5 },
            { week: 'W6', lowRisk: 71, mediumRisk: 24, highRisk: 5 },
          ],
          careGaps: [
            { gap: 'Annual Wellness Visit', identified: 2345, closed: 1876, closure: 80 },
            { gap: 'HbA1c Testing', identified: 1567, closed: 1234, closure: 79 },
            { gap: 'Mammogram Screening', identified: 987, closed: 789, closure: 80 },
            { gap: 'Colonoscopy Screening', identified: 654, closed: 456, closure: 70 },
            { gap: 'Flu Vaccination', identified: 3210, closed: 2890, closure: 90 },
          ],
          patientEngagement: [
            { channel: 'Mobile App', users: 8234, engagement: 72, satisfaction: 4.5 },
            { channel: 'Text Messages', users: 10567, engagement: 85, satisfaction: 4.2 },
            { channel: 'Phone Calls', users: 4321, engagement: 92, satisfaction: 4.7 },
            { channel: 'Email', users: 6789, engagement: 45, satisfaction: 3.8 },
            { channel: 'Patient Portal', users: 9876, engagement: 68, satisfaction: 4.1 },
          ],
          highRiskPatients: [
            {
              id: 'P-12345',
              name: 'John D.',
              age: 72,
              riskScore: 92,
              conditions: ['Diabetes', 'CHF', 'CKD'],
              lastAdmission: '15 days ago',
              interventions: ['Care Coordination', 'Remote Monitoring'],
              nextAppointment: 'Tomorrow 2:00 PM',
              status: 'stable'
            },
            {
              id: 'P-23456',
              name: 'Mary S.',
              age: 68,
              riskScore: 88,
              conditions: ['COPD', 'Hypertension'],
              lastAdmission: '30 days ago',
              interventions: ['Medication Management'],
              nextAppointment: 'Next Week',
              status: 'improving'
            },
            {
              id: 'P-34567',
              name: 'Robert J.',
              age: 75,
              riskScore: 95,
              conditions: ['Multiple Comorbidities'],
              lastAdmission: '7 days ago',
              interventions: ['Home Health', 'Care Coordination'],
              nextAppointment: 'Today 4:00 PM',
              status: 'critical'
            },
          ],
        };
      })(),
      'clinical-trial-matching': (() => {
        // Generate comprehensive clinical trial matching data
        const activeTrials = [
          {
            id: 'CT-001',
            name: 'Advanced Diabetes Management Study',
            sponsor: 'MedTech Innovations',
            phase: 'Phase III',
            status: 'Recruiting',
            enrollmentTarget: 500,
            currentEnrollment: 342,
            conditions: ['Type 2 Diabetes', 'Obesity'],
            locations: 12,
            matchingCriteria: {
              ageRange: '18-75',
              conditions: ['Type 2 Diabetes'],
              exclusions: ['Pregnancy', 'Kidney Disease'],
            },
            successRate: 78,
            compensationRange: '$500-$2000',
          },
          {
            id: 'CT-002',
            name: 'Cardiovascular Risk Reduction Trial',
            sponsor: 'CardioHealth Research',
            phase: 'Phase II',
            status: 'Recruiting',
            enrollmentTarget: 200,
            currentEnrollment: 156,
            conditions: ['Heart Disease', 'Hypertension'],
            locations: 8,
            matchingCriteria: {
              ageRange: '40-80',
              conditions: ['Cardiovascular Disease'],
              exclusions: ['Recent Surgery', 'Cancer'],
            },
            successRate: 82,
            compensationRange: '$1000-$3000',
          },
          {
            id: 'CT-003',
            name: 'Novel Cancer Immunotherapy',
            sponsor: 'OncoGen Therapeutics',
            phase: 'Phase I',
            status: 'Active',
            enrollmentTarget: 50,
            currentEnrollment: 38,
            conditions: ['Lung Cancer', 'Melanoma'],
            locations: 5,
            matchingCriteria: {
              ageRange: '21-70',
              conditions: ['Advanced Cancer'],
              exclusions: ['Autoimmune Disorders'],
            },
            successRate: 65,
            compensationRange: '$2000-$5000',
          },
          {
            id: 'CT-004',
            name: 'Alzheimer\'s Prevention Study',
            sponsor: 'NeuroScience Institute',
            phase: 'Phase III',
            status: 'Recruiting',
            enrollmentTarget: 1000,
            currentEnrollment: 623,
            conditions: ['Mild Cognitive Impairment', 'Family History'],
            locations: 20,
            matchingCriteria: {
              ageRange: '55-85',
              conditions: ['Cognitive Decline Risk'],
              exclusions: ['Severe Dementia'],
            },
            successRate: 71,
            compensationRange: '$800-$2500',
          },
        ];

        const matchingMetrics = [
          { criteria: 'Age Eligibility', matches: 6234, percentage: 71.2 },
          { criteria: 'Medical History', matches: 5123, percentage: 58.5 },
          { criteria: 'Lab Values', matches: 4567, percentage: 52.2 },
          { criteria: 'Geographic Location', matches: 7890, percentage: 90.2 },
          { criteria: 'Insurance Coverage', matches: 6789, percentage: 77.6 },
        ];

        const patientPipeline = [
          { stage: 'Initial Screening', count: 8750, conversion: 100 },
          { stage: 'Eligibility Check', count: 6234, conversion: 71.2 },
          { stage: 'Matched to Trials', count: 3421, conversion: 39.1 },
          { stage: 'Contacted', count: 2567, conversion: 29.3 },
          { stage: 'Consented', count: 1234, conversion: 14.1 },
          { stage: 'Enrolled', count: 892, conversion: 10.2 },
        ];

        const trialCategories = [
          { category: 'Oncology', trials: 125, patients: 2340, avgMatchRate: 15.2 },
          { category: 'Cardiovascular', trials: 98, patients: 1890, avgMatchRate: 22.5 },
          { category: 'Neurology', trials: 67, patients: 1234, avgMatchRate: 18.7 },
          { category: 'Diabetes/Metabolic', trials: 89, patients: 1567, avgMatchRate: 28.3 },
          { category: 'Rare Diseases', trials: 45, patients: 567, avgMatchRate: 8.9 },
          { category: 'Infectious Disease', trials: 56, patients: 890, avgMatchRate: 19.4 },
        ];

        const recentMatches = [
          {
            patientId: 'P-98765',
            age: 62,
            condition: 'Type 2 Diabetes',
            matchedTrial: 'Advanced Diabetes Management Study',
            matchScore: 94,
            status: 'Contacted',
            matchDate: '2 hours ago',
          },
          {
            patientId: 'P-87654',
            age: 58,
            condition: 'Heart Disease',
            matchedTrial: 'Cardiovascular Risk Reduction Trial',
            matchScore: 87,
            status: 'Enrolled',
            matchDate: '5 hours ago',
          },
          {
            patientId: 'P-76543',
            age: 45,
            condition: 'Lung Cancer',
            matchedTrial: 'Novel Cancer Immunotherapy',
            matchScore: 91,
            status: 'Screening',
            matchDate: '1 day ago',
          },
        ];

        return {
          metrics: [
            { name: 'Patients Screened', value: 8750, unit: '', trend: 'up', change: 22 },
            { name: 'Trials Matched', value: 342, unit: '', trend: 'up', change: 45 },
            { name: 'Enrollment Rate', value: 68, unit: '%', trend: 'up', change: 15 },
            { name: 'Time to Match', value: 12, unit: 'min', trend: 'down', change: -75 },
          ],
          activeTrials,
          matchingMetrics,
          patientPipeline,
          trialCategories,
          recentMatches,
          enrollmentData: [
            { month: 'Jan', screened: 1200, matched: 45, enrolled: 28 },
            { month: 'Feb', screened: 1350, matched: 52, enrolled: 35 },
            { month: 'Mar', screened: 1500, matched: 58, enrolled: 42 },
            { month: 'Apr', screened: 1450, matched: 62, enrolled: 48 },
            { month: 'May', screened: 1600, matched: 68, enrolled: 52 },
            { month: 'Jun', screened: 1650, matched: 72, enrolled: 58 },
          ],
          trialsByPhase: [
            { phase: 'Phase I', trials: 45, patients: 180, color: '#EF4444' },
            { phase: 'Phase II', trials: 82, patients: 820, color: '#F59E0B' },
            { phase: 'Phase III', trials: 125, patients: 3750, color: '#3B82F6' },
            { phase: 'Phase IV', trials: 90, patients: 4000, color: '#10B981' },
          ],
          matchingAlgorithmPerformance: {
            accuracy: 89.5,
            precision: 92.3,
            recall: 86.7,
            f1Score: 89.4,
            avgProcessingTime: 12.3,
          },
          geographicDistribution: [
            { region: 'Northeast', trials: 89, sites: 234, patients: 2345 },
            { region: 'Southeast', trials: 76, sites: 198, patients: 1987 },
            { region: 'Midwest', trials: 65, sites: 167, patients: 1654 },
            { region: 'Southwest', trials: 58, sites: 145, patients: 1432 },
            { region: 'West', trials: 92, sites: 256, patients: 2567 },
          ],
        };
      })(),
      'treatment-recommendation': (() => {
        // Generate comprehensive treatment recommendation data
        const treatmentPlans = [
          {
            id: 'TP-001',
            patientId: 'P-45678',
            condition: 'Type 2 Diabetes with Hypertension',
            currentTreatment: 'Metformin 1000mg + Lisinopril 10mg',
            recommendedTreatment: 'Add SGLT2 inhibitor (Empagliflozin 10mg)',
            reasoning: 'Based on recent cardiovascular outcomes data and patient\'s elevated HbA1c',
            confidenceScore: 92,
            expectedOutcome: '15% reduction in cardiovascular risk, 0.8% HbA1c reduction',
            status: 'pending-review',
            createdAt: '2 hours ago',
          },
          {
            id: 'TP-002',
            patientId: 'P-56789',
            condition: 'Treatment-Resistant Depression',
            currentTreatment: 'Sertraline 150mg',
            recommendedTreatment: 'Switch to Venlafaxine XR 75mg + Augment with Aripiprazole 2mg',
            reasoning: 'SSRI non-response after 8 weeks, patient profile matches successful augmentation cases',
            confidenceScore: 87,
            expectedOutcome: '60% chance of remission based on similar patient profiles',
            status: 'approved',
            createdAt: '5 hours ago',
          },
          {
            id: 'TP-003',
            patientId: 'P-67890',
            condition: 'Rheumatoid Arthritis',
            currentTreatment: 'Methotrexate 15mg weekly',
            recommendedTreatment: 'Add Adalimumab 40mg biweekly',
            reasoning: 'Inadequate response to MTX monotherapy, elevated inflammatory markers',
            confidenceScore: 94,
            expectedOutcome: 'ACR50 response expected in 70% probability',
            status: 'implemented',
            createdAt: '1 day ago',
          },
        ];

        const treatmentCategories = [
          { category: 'Medication Optimization', count: 5420, successRate: 88, avgTimeToEffect: '14 days' },
          { category: 'Dosage Adjustment', count: 3890, successRate: 92, avgTimeToEffect: '7 days' },
          { category: 'Drug Switching', count: 2340, successRate: 78, avgTimeToEffect: '21 days' },
          { category: 'Combination Therapy', count: 1987, successRate: 85, avgTimeToEffect: '28 days' },
          { category: 'De-escalation', count: 1783, successRate: 91, avgTimeToEffect: '10 days' },
        ];

        const aiModelMetrics = [
          { model: 'Treatment Efficacy Predictor', accuracy: 91.5, predictions: 125000, lastUpdated: '2 hours ago' },
          { model: 'Adverse Event Predictor', accuracy: 94.2, predictions: 98000, lastUpdated: '1 hour ago' },
          { model: 'Drug Interaction Analyzer', accuracy: 98.7, predictions: 156000, lastUpdated: '30 mins ago' },
          { model: 'Personalized Medicine Engine', accuracy: 89.3, predictions: 87000, lastUpdated: '3 hours ago' },
        ];

        const outcomeComparison = [
          { metric: 'Treatment Success Rate', standard: 68, aiAssisted: 88, improvement: 29.4 },
          { metric: 'Time to Optimal Dose', standard: 45, aiAssisted: 21, improvement: 53.3 },
          { metric: 'Adverse Events', standard: 18, aiAssisted: 7, improvement: 61.1 },
          { metric: 'Patient Adherence', standard: 72, aiAssisted: 91, improvement: 26.4 },
          { metric: 'Cost Effectiveness', standard: 100, aiAssisted: 78, improvement: 22.0 },
        ];

        const drugInteractions = [
          {
            drug1: 'Warfarin',
            drug2: 'Aspirin',
            severity: 'high',
            interaction: 'Increased bleeding risk',
            recommendation: 'Monitor INR closely, consider dose adjustment',
            frequency: 234,
          },
          {
            drug1: 'Metformin',
            drug2: 'Contrast Media',
            severity: 'medium',
            interaction: 'Risk of lactic acidosis',
            recommendation: 'Hold metformin 48h before and after procedure',
            frequency: 189,
          },
          {
            drug1: 'SSRIs',
            drug2: 'NSAIDs',
            severity: 'medium',
            interaction: 'Increased GI bleeding risk',
            recommendation: 'Consider PPI prophylaxis',
            frequency: 156,
          },
        ];

        const treatmentPathways = [
          {
            condition: 'Type 2 Diabetes',
            stages: [
              { stage: 1, treatment: 'Lifestyle + Metformin', patients: 4500, avgHbA1c: 7.2 },
              { stage: 2, treatment: '+ SGLT2/GLP-1', patients: 2800, avgHbA1c: 6.8 },
              { stage: 3, treatment: '+ Basal Insulin', patients: 1200, avgHbA1c: 7.0 },
              { stage: 4, treatment: 'Intensive Insulin', patients: 450, avgHbA1c: 7.5 },
            ],
          },
        ];

        return {
          metrics: [
            { name: 'Recommendations', value: 15420, unit: '', trend: 'up', change: 32 },
            { name: 'Efficacy Improvement', value: 35, unit: '%', trend: 'up', change: 8 },
            { name: 'Adverse Events Reduced', value: 42, unit: '%', trend: 'up', change: 12 },
            { name: 'Physician Time Saved', value: 2.5, unit: 'hrs/day', trend: 'up', change: 25 },
          ],
          treatmentPlans,
          treatmentCategories,
          aiModelMetrics,
          outcomeComparison,
          drugInteractions,
          treatmentPathways,
          outcomeData: [
            { month: 'Jan', standard: 65, aiRecommended: 82 },
            { month: 'Feb', standard: 68, aiRecommended: 85 },
            { month: 'Mar', standard: 67, aiRecommended: 88 },
            { month: 'Apr', standard: 70, aiRecommended: 90 },
            { month: 'May', standard: 69, aiRecommended: 92 },
            { month: 'Jun', standard: 71, aiRecommended: 94 },
          ],
          treatmentByCondition: [
            { condition: 'Diabetes', recommendations: 4250, successRate: 88 },
            { condition: 'Hypertension', recommendations: 3820, successRate: 92 },
            { condition: 'Cancer', recommendations: 2150, successRate: 78 },
            { condition: 'Heart Disease', recommendations: 3200, successRate: 85 },
            { condition: 'Other', recommendations: 2000, successRate: 82 },
          ],
          evidenceBase: [
            { source: 'Clinical Trials', count: 12500, quality: 'High', lastUpdated: '1 week ago' },
            { source: 'Real-World Evidence', count: 85000, quality: 'Medium', lastUpdated: '2 days ago' },
            { source: 'Guidelines', count: 450, quality: 'High', lastUpdated: '1 month ago' },
            { source: 'Case Studies', count: 3200, quality: 'Medium', lastUpdated: '3 days ago' },
          ],
          physicianAdoption: [
            { specialty: 'Primary Care', adoptionRate: 78, avgRecommendations: 45 },
            { specialty: 'Cardiology', adoptionRate: 85, avgRecommendations: 62 },
            { specialty: 'Endocrinology', adoptionRate: 92, avgRecommendations: 78 },
            { specialty: 'Psychiatry', adoptionRate: 71, avgRecommendations: 38 },
            { specialty: 'Oncology', adoptionRate: 68, avgRecommendations: 52 },
          ],
        };
      })(),
    },
    finance: {
      'fraud-detection': {
        metrics: [
          { name: 'Transactions Monitored', value: 2.8, unit: 'B', trend: 'up', change: 18 },
          { name: 'Fraud Detected', value: 12450, unit: '', trend: 'down', change: -22 },
          { name: 'False Positives', value: 8.2, unit: '%', trend: 'down', change: -35 },
          { name: 'Losses Prevented', value: 45.8, unit: 'M', trend: 'up', change: 28 },
        ],
        fraudTrendData: [
          { day: 'Mon', detected: 1850, prevented: 42.5, falsePositive: 152 },
          { day: 'Tue', detected: 1920, prevented: 44.2, falsePositive: 145 },
          { day: 'Wed', detected: 2100, prevented: 48.5, falsePositive: 168 },
          { day: 'Thu', detected: 1980, prevented: 45.8, falsePositive: 158 },
          { day: 'Fri', detected: 2250, prevented: 52.1, falsePositive: 180 },
          { day: 'Sat', detected: 1650, prevented: 38.2, falsePositive: 132 },
          { day: 'Sun', detected: 1450, prevented: 33.5, falsePositive: 116 },
        ],
        fraudByType: [
          { type: 'Card Not Present', amount: 18.5, percentage: 40 },
          { type: 'Account Takeover', amount: 12.3, percentage: 27 },
          { type: 'Identity Theft', amount: 8.7, percentage: 19 },
          { type: 'Merchant Fraud', amount: 4.2, percentage: 9 },
          { type: 'Other', amount: 2.1, percentage: 5 },
        ],
      },
      'credit-risk-assessment': {
        metrics: [
          { name: 'Applications Processed', value: 45280, unit: '', trend: 'up', change: 25 },
          { name: 'Approval Rate', value: 68, unit: '%', trend: 'up', change: 12 },
          { name: 'Default Rate', value: 2.8, unit: '%', trend: 'down', change: -30 },
          { name: 'Portfolio Value', value: 1.2, unit: 'B', trend: 'up', change: 18 },
        ],
        riskScoreDistribution: [
          { score: '300-500', applications: 5200, approvalRate: 15, defaultRate: 12 },
          { score: '501-600', applications: 8500, approvalRate: 35, defaultRate: 8 },
          { score: '601-700', applications: 15800, approvalRate: 65, defaultRate: 4 },
          { score: '701-800', applications: 12500, approvalRate: 88, defaultRate: 2 },
          { score: '801-850', applications: 3280, approvalRate: 95, defaultRate: 0.5 },
        ],
        portfolioPerformance: [
          { month: 'Jan', traditional: 3.2, aiEnhanced: 2.1 },
          { month: 'Feb', traditional: 3.5, aiEnhanced: 2.0 },
          { month: 'Mar', traditional: 3.3, aiEnhanced: 1.8 },
          { month: 'Apr', traditional: 3.4, aiEnhanced: 1.7 },
          { month: 'May', traditional: 3.2, aiEnhanced: 1.5 },
          { month: 'Jun', traditional: 3.1, aiEnhanced: 1.4 },
        ],
      },
      'portfolio-optimization': {
        metrics: [
          { name: 'AUM', value: 8.5, unit: 'B', trend: 'up', change: 22 },
          { name: 'Risk-Adjusted Return', value: 18.5, unit: '%', trend: 'up', change: 15 },
          { name: 'Sharpe Ratio', value: 1.85, unit: '', trend: 'up', change: 12 },
          { name: 'Rebalances/Day', value: 1250, unit: '', trend: 'up', change: 45 },
        ],
        performanceData: [
          { month: 'Jan', portfolio: 5.2, benchmark: 3.8, riskAdjusted: 4.8 },
          { month: 'Feb', portfolio: 4.8, benchmark: 3.2, riskAdjusted: 4.5 },
          { month: 'Mar', portfolio: 6.2, benchmark: 4.5, riskAdjusted: 5.8 },
          { month: 'Apr', portfolio: 5.8, benchmark: 4.2, riskAdjusted: 5.5 },
          { month: 'May', portfolio: 7.1, benchmark: 5.1, riskAdjusted: 6.8 },
          { month: 'Jun', portfolio: 6.5, benchmark: 4.8, riskAdjusted: 6.2 },
        ],
        assetAllocation: [
          { asset: 'Equities', allocation: 45, return: 12.5 },
          { asset: 'Fixed Income', allocation: 25, return: 4.2 },
          { asset: 'Alternatives', allocation: 15, return: 8.5 },
          { asset: 'Commodities', allocation: 10, return: 6.8 },
          { asset: 'Cash', allocation: 5, return: 2.1 },
        ],
      },
    },
  };

  // Derive vertical from use case ID (already done above)
  const derivedVertical = useCase.id.split('-')[0];
  const useCaseId = useCase.id.replace(`${derivedVertical}-`, '');
  
  return {
    ...(verticalData[vertical]?.[useCaseId] || {
      metrics: [
        { name: 'Active Items', value: 1000, unit: '', trend: 'up', change: 10 },
        { name: 'Success Rate', value: 85, unit: '%', trend: 'up', change: 5 },
        { name: 'Cost Savings', value: 2.5, unit: 'M', trend: 'up', change: 20 },
        { name: 'Efficiency Gain', value: 35, unit: '%', trend: 'up', change: 15 },
      ],
      defaultData: true,
    }),
    siaAnalysisData: siaData
  };
};

const UseCaseDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { useCaseId } = useParams<{ useCaseId: string }>();
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'operations' | 'leases' | 'compliance' | 'financial' | 'wells' | 'risks' | 'parameters' | 'incidents' | 'monitoring' | 'emissions' | 'permits' | 'regulations' | 'forecasts' | 'zones' | 'demand' | 'models' | 'alerts' | 'anomalies' | 'components' | 'patterns' | 'response' | 'heatmap' | 'generation' | 'storage' | 'optimization' | 'market' | 'forecast' | 'grid' | 'patients' | 'risk-analysis' | 'interventions' | 'outcomes' | 'predictions' | 'engagement' | 'trials' | 'matching' | 'pipeline' | 'enrollment' | 'geographic' | 'algorithm'>('overview');
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<'security' | 'integrity' | 'accuracy' | null>(null);
  const [selectedLeaseStatus, setSelectedLeaseStatus] = useState<string | null>(null);

  useEffect(() => {
    // First try to load from session storage
    const storedUseCase = sessionStorage.getItem('selectedUseCase');
    if (storedUseCase) {
      const useCase = JSON.parse(storedUseCase);
      setSelectedUseCase(useCase);
      setDashboardData(generateUseCaseData(useCase));
      sessionStorage.removeItem('selectedUseCase');
    } else if (useCaseId) {
      // If no session storage, try to find the use case by ID
      let foundUseCase: UseCase | null = null;
      
      // Search through all verticals to find the use case
      for (const vertical of Object.values(verticals)) {
        const useCase = vertical.useCases.find(uc => uc.id === useCaseId);
        if (useCase) {
          foundUseCase = useCase;
          break;
        }
      }
      
      if (foundUseCase) {
        setSelectedUseCase(foundUseCase);
        setDashboardData(generateUseCaseData(foundUseCase));
      }
    }
  }, [useCaseId]);

  if (!selectedUseCase || !dashboardData) {
    return (
      <div className="min-h-screen bg-seraphim-black p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Use Case Selected</h2>
          <p className="text-gray-400 mb-4">Please select a use case from the launcher.</p>
          <Button onClick={() => navigate('/use-cases')}>
            Back to Use Cases
          </Button>
        </Card>
      </div>
    );
  }

  const getVerticalIcon = (vertical: string) => {
    const icons: Record<string, any> = {
      energy: BoltIcon,
      healthcare: HeartIcon,
      finance: BanknotesIcon,
    };
    return icons[vertical] || ChartBarIcon;
  };

  // Derive vertical from use case ID
  const vertical = selectedUseCase.id.split('-')[0];
  const Icon = getVerticalIcon(vertical);

  // Check if this use case has a custom dashboard
  const CustomDashboard = customDashboards[selectedUseCase.id];
  
  // If a custom dashboard exists, render it with the use case data
  if (CustomDashboard) {
    return <CustomDashboard useCase={selectedUseCase} />;
  }

  // Otherwise, render the default dashboard
  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate('/use-cases')}
              className="mr-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gradient-to-br from-seraphim-gold/20 to-transparent mr-4">
                <Icon className="w-8 h-8 text-seraphim-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{selectedUseCase.name} (Demo)</h1>
                <p className="text-sm text-gray-400">
                  {selectedUseCase.description.replace(/AI-driven insights/gi, 'VANGUARD')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <img
              src="/seraphim-vanguards-logo.png"
              alt="Seraphim Vanguards"
              className="h-36 w-auto object-contain"
            />
            <SIAMetrics
              security={selectedUseCase.siaScores.security}
              integrity={selectedUseCase.siaScores.integrity}
              accuracy={selectedUseCase.siaScores.accuracy}
              size="sm"
              animate={false}
              onMetricClick={(metric) => setSelectedMetric(metric)}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        {selectedUseCase?.id.includes('oilfield-land-lease') ? (
          // Special tabs for oilfield land lease
          [
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'leases', label: 'Land Leases', icon: MapIcon },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
            { id: 'financial', label: 'Financial', icon: CurrencyDollarIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
            { id: 'operations', label: 'Operations', icon: CogIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))
        ) : selectedUseCase?.id.includes('drilling-risk-assessment') ? (
          // Special tabs for drilling risk assessment
          [
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'wells', label: 'Active Wells', icon: MapIcon },
            { id: 'risks', label: 'Risk Analysis', icon: ExclamationTriangleIcon },
            { id: 'parameters', label: 'Parameters', icon: CogIcon },
            { id: 'incidents', label: 'Incidents', icon: ShieldCheckIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
            { id: 'operations', label: 'Operations', icon: CogIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))
        ) : selectedUseCase?.id.includes('environmental-compliance') ? (
          // Special tabs for environmental compliance
          [
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'monitoring', label: 'Monitoring', icon: SignalIcon },
            { id: 'emissions', label: 'Emissions', icon: CloudIcon },
            { id: 'permits', label: 'Permits', icon: DocumentTextIcon },
            { id: 'regulations', label: 'Regulations', icon: ScaleIcon },
            { id: 'incidents', label: 'Incidents', icon: ExclamationTriangleIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))
        ) : selectedUseCase?.id.includes('load-forecasting') ? (
          // Special tabs for load forecasting
          [
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'forecasts', label: 'Forecasts', icon: ArrowTrendingUpIcon },
            { id: 'zones', label: 'Grid Zones', icon: MapIcon },
            { id: 'demand', label: 'Demand Response', icon: BoltIcon },
            { id: 'models', label: 'AI Models', icon: CpuChipIcon },
            { id: 'alerts', label: 'Alerts', icon: ExclamationTriangleIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))
        ) : selectedUseCase?.id.includes('grid-anomaly') ? (
          // Special tabs for grid anomaly detection
          [
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'anomalies', label: 'Active Anomalies', icon: ExclamationTriangleIcon },
            { id: 'components', label: 'Grid Components', icon: ServerIcon },
            { id: 'patterns', label: 'Patterns', icon: CpuChipIcon },
            { id: 'response', label: 'Response', icon: ShieldCheckIcon },
            { id: 'heatmap', label: 'Heatmap', icon: MapIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))
        ) : selectedUseCase?.id.includes('renewable-optimization') ? (
          // Special tabs for renewable optimization
          [
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'generation', label: 'Generation', icon: BoltIcon },
            { id: 'storage', label: 'Storage', icon: Battery100Icon },
            { id: 'grid', label: 'Grid Integration', icon: ServerIcon },
            { id: 'forecast', label: 'Forecasting', icon: CloudIcon },
            { id: 'optimization', label: 'Optimization', icon: CpuChipIcon },
            { id: 'market', label: 'Market', icon: CurrencyDollarIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))
        ) : selectedUseCase?.id.includes('patient-risk-stratification') ? (
          // Special tabs for patient risk stratification
          [
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'patients', label: 'Patients', icon: UserGroupIcon },
            { id: 'risk-analysis', label: 'Risk Analysis', icon: ExclamationTriangleIcon },
            { id: 'interventions', label: 'Interventions', icon: HeartIcon },
            { id: 'outcomes', label: 'Outcomes', icon: ChartPieIcon },
            { id: 'predictions', label: 'Predictions', icon: CpuChipIcon },
            { id: 'engagement', label: 'Engagement', icon: UserGroupIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))
        ) : selectedUseCase?.id.includes('clinical-trial-matching') ? (
          // Special tabs for clinical trial matching
          [
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'trials', label: 'Active Trials', icon: BeakerIcon },
            { id: 'matching', label: 'Matching', icon: CpuChipIcon },
            { id: 'pipeline', label: 'Pipeline', icon: UserGroupIcon },
            { id: 'enrollment', label: 'Enrollment', icon: ChartBarIcon },
            { id: 'geographic', label: 'Geographic', icon: MapIcon },
            { id: 'algorithm', label: 'Algorithm', icon: CpuChipIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))
        ) : (
          // Default tabs for other use cases
          [
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
            { id: 'operations', label: 'Operations', icon: CogIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData?.summary?.metrics ? (
              // Use metrics from unified data if available
              dashboardData.summary.metrics.map((metric: any, index: number) => (
                <Card key={index} variant="gradient" effect="shimmer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">{metric.name}</p>
                        <p className="text-2xl font-bold text-white">
                          {metric.value}{metric.unit}
                        </p>
                        <p className={`text-xs flex items-center mt-1 ${
                          metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          <ArrowTrendingUpIcon className={`w-3 h-3 mr-1 ${
                            metric.trend === 'down' ? 'rotate-180' : ''
                          }`} />
                          {Math.abs(metric.change)}% from last period
                        </p>
                      </div>
                      <ChartBarIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : dashboardData?.metrics ? (
              // Fallback to old metrics structure
              dashboardData.metrics.map((metric: any, index: number) => (
                <Card key={index} variant="gradient" effect="shimmer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">{metric.name}</p>
                        <p className="text-2xl font-bold text-white">
                          {metric.value}{metric.unit}
                        </p>
                        <p className={`text-xs flex items-center mt-1 ${
                          metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          <ArrowTrendingUpIcon className={`w-3 h-3 mr-1 ${
                            metric.trend === 'down' ? 'rotate-180' : ''
                          }`} />
                          {Math.abs(metric.change)}% from last period
                        </p>
                      </div>
                      <ChartBarIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Default metrics if no data available
              [
                { name: 'Active Items', value: dashboardData?.summary?.activeItems || 0, unit: '', trend: 'up', change: 10 },
                { name: 'Success Rate', value: dashboardData?.summary?.successRate || 0, unit: '%', trend: 'up', change: 5 },
                { name: 'Cost Savings', value: dashboardData?.summary?.costSavings || 0, unit: 'M', trend: 'up', change: 20 },
                { name: 'Efficiency Gain', value: dashboardData?.summary?.efficiencyGain || 0, unit: '%', trend: 'up', change: 15 },
              ].map((metric, index) => (
                <Card key={index} variant="gradient" effect="shimmer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">{metric.name}</p>
                        <p className="text-2xl font-bold text-white">
                          {metric.value}{metric.unit}
                        </p>
                        <p className={`text-xs flex items-center mt-1 ${
                          metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          <ArrowTrendingUpIcon className={`w-3 h-3 mr-1 ${
                            metric.trend === 'down' ? 'rotate-180' : ''
                          }`} />
                          {Math.abs(metric.change)}% from last period
                        </p>
                      </div>
                      <ChartBarIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Use Case Specific Charts */}
          {renderUseCaseSpecificCharts(selectedUseCase, dashboardData, selectedLeaseStatus, setSelectedLeaseStatus, setSelectedLease)}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {renderAnalyticsContent(selectedUseCase, dashboardData)}
        </div>
      )}

      {/* Operations Tab */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>VANGUARDS Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">Use Case Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Use Case</span>
                      <span className="text-sm text-white font-medium">{selectedUseCase.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Complexity</span>
                      <Badge variant={selectedUseCase.complexity === 'high' ? 'error' : selectedUseCase.complexity === 'medium' ? 'warning' : 'success'} size="small">
                        {selectedUseCase.complexity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Estimated Time</span>
                      <span className="text-sm text-white">{selectedUseCase.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">System Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Data Processing</span>
                      <span className="text-sm text-green-400">Operational</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Model Inference</span>
                      <span className="text-sm text-green-400">Operational</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Compliance Monitoring</span>
                      <span className="text-sm text-green-400">Operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wells Tab - Only for drilling risk assessment */}
      {activeTab === 'wells' && selectedUseCase?.id.includes('drilling-risk-assessment') && (
        <div className="space-y-6">
          {/* Active Wells Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.activeWells?.map((well: any) => (
              <Card key={well.id} variant="glass" effect="glow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{well.name}</span>
                    <Badge
                      variant={well.risk === 'high' ? 'error' : well.risk === 'medium' ? 'warning' : 'success'}
                      size="small"
                    >
                      {well.risk} risk
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Current Depth</span>
                      <span className="text-lg font-semibold text-white">
                        {well.depth.toLocaleString()} ft
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Status</span>
                      <span className="text-sm font-medium text-white capitalize">
                        {well.status}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span className="text-sm font-medium text-white">{well.progress}%</span>
                      </div>
                      <Progress value={well.progress} className="h-3" />
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-400">Est. Completion</p>
                          <p className="text-white font-medium">
                            {Math.ceil((100 - well.progress) / 5)} days
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Daily Cost</p>
                          <p className="text-white font-medium">$125K</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="secondary" size="small" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Drilling Parameters Overview */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Real-Time Drilling Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData.drillingParameters?.map((param: any) => (
                  <div key={param.param} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{param.param}</span>
                      <Badge
                        variant={param.status === 'good' ? 'success' : param.status === 'warning' ? 'warning' : 'error'}
                        size="small"
                      >
                        {param.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {param.current.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      Optimal: {param.optimal.toLocaleString()} {param.unit}
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            param.status === 'good' ? 'bg-green-500' :
                            param.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, (param.current / param.optimal) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risks Tab - Only for drilling risk assessment */}
      {activeTab === 'risks' && selectedUseCase?.id.includes('drilling-risk-assessment') && (
        <div className="space-y-6">
          {/* Risk Matrix */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Risk Assessment Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Probability</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">Very Low</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">Low</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">Medium</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">High</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">Very High</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.riskMatrix?.map((row: any) => (
                      <tr key={row.probability}>
                        <td className="py-2 px-4 text-sm font-medium text-white">{row.probability}</td>
                        <td className="text-center py-2 px-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded ${
                            row.veryLow > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-600'
                          }`}>
                            {row.veryLow}
                          </div>
                        </td>
                        <td className="text-center py-2 px-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded ${
                            row.low > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-600'
                          }`}>
                            {row.low}
                          </div>
                        </td>
                        <td className="text-center py-2 px-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded ${
                            row.medium > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-600'
                          }`}>
                            {row.medium}
                          </div>
                        </td>
                        <td className="text-center py-2 px-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded ${
                            row.high > 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-600'
                          }`}>
                            {row.high}
                          </div>
                        </td>
                        <td className="text-center py-2 px-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded ${
                            row.veryHigh > 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-600'
                          }`}>
                            {row.veryHigh}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Risk Factor Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.riskFactors?.map((factor: any) => (
                  <div key={factor.factor} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{factor.factor}</h4>
                        <p className="text-sm text-gray-400">
                          Impact: <span className={`font-medium ${
                            factor.impact === 'critical' ? 'text-red-400' :
                            factor.impact === 'high' ? 'text-orange-400' :
                            factor.impact === 'medium' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>{factor.impact.toUpperCase()}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{factor.score}%</div>
                        <div className="flex items-center text-sm">
                          {factor.trend === 'increasing' ? (
                            <>
                              <ArrowUpIcon className="w-4 h-4 text-red-400 mr-1" />
                              <span className="text-red-400">Increasing</span>
                            </>
                          ) : factor.trend === 'improving' ? (
                            <>
                              <ArrowDownIcon className="w-4 h-4 text-green-400 mr-1" />
                              <span className="text-green-400">Improving</span>
                            </>
                          ) : (
                            <>
                              <MinusIcon className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-gray-400">Stable</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Progress value={factor.score} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Parameters Tab - Only for drilling risk assessment */}
      {activeTab === 'parameters' && selectedUseCase?.id.includes('drilling-risk-assessment') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Drilling Parameters Control Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dashboardData.drillingParameters?.map((param: any) => (
                  <div key={param.param} className="p-6 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">{param.param}</h4>
                      <Badge
                        variant={param.status === 'good' ? 'success' : param.status === 'warning' ? 'warning' : 'error'}
                      >
                        {param.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Current Value</span>
                        <span className="text-2xl font-bold text-white">
                          {param.current.toLocaleString()} {param.unit}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Optimal Range</span>
                        <span className="text-sm text-gray-300">
                          {(param.optimal * 0.9).toLocaleString()} - {(param.optimal * 1.1).toLocaleString()} {param.unit}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Performance</span>
                          <span className="text-xs text-gray-400">
                            {((param.current / param.optimal) * 100).toFixed(1)}% of optimal
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              param.status === 'good' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                              param.status === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                              'bg-gradient-to-r from-red-500 to-red-400'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(0, (param.current / param.optimal) * 100))}%`
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Recommendations</p>
                        <p className="text-sm text-gray-300">
                          {param.status === 'good' ? 'Parameters within optimal range. Continue monitoring.' :
                           param.status === 'warning' ? 'Consider adjusting parameters to improve efficiency.' :
                           'Immediate adjustment required to prevent equipment damage.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Incidents Tab - Only for drilling risk assessment */}
      {activeTab === 'incidents' && selectedUseCase?.id.includes('drilling-risk-assessment') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Recent Incidents & Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.realTimeAlerts?.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-lg border-2 ${
                      alert.severity === 'high' ? 'bg-red-500/10 border-red-500/50' :
                      alert.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/50' :
                      'bg-blue-500/10 border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          alert.severity === 'high' ? 'bg-red-500/20' :
                          alert.severity === 'medium' ? 'bg-yellow-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <ExclamationTriangleIcon className={`w-6 h-6 ${
                            alert.severity === 'high' ? 'text-red-500' :
                            alert.severity === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{alert.type}</h4>
                          <p className="text-sm text-gray-400">{alert.well} • {alert.time}</p>
                        </div>
                      </div>
                      <Badge
                        variant={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{alert.description}</p>
                    
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-sm font-medium text-white mb-1">Recommended Action</p>
                      <p className="text-sm text-gray-300">{alert.action}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Incident ID: #{alert.id}</span>
                        <span>Auto-detected by AI</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="small" variant="secondary">Acknowledge</Button>
                        <Button size="small" variant="primary">Take Action</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Incident Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Incidents (30d)</p>
                    <p className="text-3xl font-bold text-white">24</p>
                    <p className="text-xs text-green-400 mt-1">↓ 15% from last month</p>
                  </div>
                  <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Response Time</p>
                    <p className="text-3xl font-bold text-white">2.3 min</p>
                    <p className="text-xs text-green-400 mt-1">↓ 45% improvement</p>
                  </div>
                  <ClockIcon className="w-12 h-12 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Cost Prevented</p>
                    <p className="text-3xl font-bold text-white">$18.5M</p>
                    <p className="text-xs text-green-400 mt-1">↑ 22% from last month</p>
                  </div>
                  <CurrencyDollarIcon className="w-12 h-12 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Land Leases Tab - Only for oilfield use case */}
      {activeTab === 'leases' && selectedUseCase?.id.includes('oilfield-land-lease') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Land Lease Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Property ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Location</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Annual Payment</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboardData?.leases || dashboardData?.landLeases)?.slice(0, 20).map((lease: any) => (
                        <tr key={lease.id} className="border-b border-gray-800 hover:bg-white/5">
                          <td className="py-3 px-4 text-sm text-white">{lease.propertyId}</td>
                          <td className="py-3 px-4 text-sm text-gray-300">
                            {lease.location.county}, {lease.location.state}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-300">{lease.leaseType}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              lease.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                              lease.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              lease.status === 'Expiring Soon' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {lease.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-300">
                            ${lease.annualPayment.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => setSelectedLease(lease)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lease Details */}
          <div>
            {selectedLease ? (
              <Card variant="gradient" effect="shimmer">
                <CardHeader>
                  <CardTitle>Lease Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-400">Property ID</p>
                      <p className="text-sm font-medium text-white">{selectedLease.propertyId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Leaseholder</p>
                      <p className="text-sm font-medium text-white">{selectedLease.leaseholder}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Location</p>
                      <p className="text-sm font-medium text-white">
                        {selectedLease.location.acres.toLocaleString()} acres in {selectedLease.location.county}, {selectedLease.location.state}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Lease Period</p>
                      <p className="text-sm font-medium text-white">
                        {new Date(selectedLease.startDate).toLocaleDateString()} - {new Date(selectedLease.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Financial Terms</p>
                      <p className="text-sm font-medium text-white">
                        ${selectedLease.annualPayment.toLocaleString()}/year • {(parseFloat(selectedLease.royaltyRate) * 100).toFixed(1)}% royalty
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Compliance Status</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Environmental</span>
                          {selectedLease.compliance.environmental ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Regulatory</span>
                          {selectedLease.compliance.regulatory ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Safety</span>
                          {selectedLease.compliance.safety ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Stakeholders</p>
                      <div className="space-y-2">
                        {selectedLease.stakeholders && selectedLease.stakeholders.map((stakeholder: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <p className="text-white">{stakeholder.name}</p>
                            <p className="text-xs text-gray-400">{stakeholder.role}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card variant="glass" effect="float">
                <CardContent className="p-12 text-center">
                  <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Select a lease to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Compliance Tab - Only for oilfield use case */}
      {activeTab === 'compliance' && selectedUseCase?.id.includes('oilfield-land-lease') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(dashboardData?.compliance?.categories || [
            {
              id: 1,
              category: 'Environmental Compliance',
              score: 96.5,
              lastAudit: new Date('2024-01-15'),
              issues: 2,
              resolved: 18,
              requirements: [
                { name: 'Air Quality Standards', status: 'compliant' },
                { name: 'Water Management', status: 'compliant' },
                { name: 'Waste Disposal', status: 'pending' },
                { name: 'Spill Prevention', status: 'compliant' },
              ],
            },
            {
              id: 2,
              category: 'Regulatory Compliance',
              score: 94.2,
              lastAudit: new Date('2024-01-20'),
              issues: 3,
              resolved: 25,
              requirements: [
                { name: 'BLM Regulations', status: 'compliant' },
                { name: 'State Oil & Gas Rules', status: 'compliant' },
                { name: 'Federal Reporting', status: 'compliant' },
                { name: 'Local Ordinances', status: 'pending' },
              ],
            },
            {
              id: 3,
              category: 'Safety Compliance',
              score: 98.1,
              lastAudit: new Date('2024-01-10'),
              issues: 1,
              resolved: 32,
              requirements: [
                { name: 'OSHA Standards', status: 'compliant' },
                { name: 'Emergency Response', status: 'compliant' },
                { name: 'Equipment Safety', status: 'compliant' },
                { name: 'Personnel Training', status: 'compliant' },
              ],
            },
            {
              id: 4,
              category: 'Financial Compliance',
              score: 92.8,
              lastAudit: new Date('2024-01-25'),
              issues: 4,
              resolved: 20,
              requirements: [
                { name: 'Royalty Payments', status: 'compliant' },
                { name: 'Tax Obligations', status: 'pending' },
                { name: 'Audit Requirements', status: 'compliant' },
                { name: 'Financial Reporting', status: 'compliant' },
              ],
            },
          ]).map((category) => (
            <Card key={category.id} variant="glass" effect="glow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category.category}</span>
                  <span className={`text-2xl font-bold ${
                    category.score >= 90 ? 'text-green-500' :
                    category.score >= 80 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {category.score.toFixed(1)}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Audit</span>
                    <span className="text-gray-300">
                      {category.lastAudit.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Open Issues</span>
                    <span className="text-red-400">{category.issues}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Resolved</span>
                    <span className="text-green-400">{category.resolved}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-400 mb-2">Requirements</p>
                    <div className="space-y-2">
                      {category.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{req.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            req.status === 'compliant' ? 'bg-green-500/20 text-green-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Monitoring Tab - Only for environmental compliance */}
      {activeTab === 'monitoring' && selectedUseCase?.id.includes('environmental-compliance') && (
        <div className="space-y-6">
          {/* Active Monitoring Points */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Monitoring Points</span>
                <Badge variant="success" size="small">{dashboardData.monitoringPoints?.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.monitoringPoints?.map((point: any) => (
                  <div key={point.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{point.name}</h4>
                        <p className="text-xs text-gray-400">{point.type}</p>
                      </div>
                      <Badge
                        variant={point.status === 'active' ? 'success' : 'warning'}
                        size="small"
                      >
                        {point.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Compliance</span>
                        <span className={`font-medium ${
                          point.compliance >= 95 ? 'text-green-400' :
                          point.compliance >= 90 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {point.compliance}%
                        </span>
                      </div>
                      <Progress value={point.compliance} className="h-2" />
                      <p className="text-xs text-gray-500">Last reading: {point.lastReading}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Compliance Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Compliance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.complianceByCategory?.map((item: any) => (
                    <div key={item.category} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{item.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs ${
                            item.violations === 0 ? 'text-green-400' :
                            item.violations <= 2 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {item.violations} violations
                          </span>
                          {item.trend === 'improving' ? (
                            <ArrowUpIcon className="w-3 h-3 text-green-400" />
                          ) : item.trend === 'declining' ? (
                            <ArrowDownIcon className="w-3 h-3 text-red-400" />
                          ) : (
                            <MinusIcon className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={item.score} className="flex-1" />
                        <span className="text-sm font-medium text-white">{item.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Compliance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dashboardData.complianceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" domain={[90, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="overall" stroke="#10B981" strokeWidth={3} name="Overall" />
                    <Line type="monotone" dataKey="airQuality" stroke="#3B82F6" name="Air Quality" />
                    <Line type="monotone" dataKey="water" stroke="#06B6D4" name="Water" />
                    <Line type="monotone" dataKey="waste" stroke="#F59E0B" name="Waste" />
                    <Line type="monotone" dataKey="noise" stroke="#8B5CF6" name="Noise" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Emissions Tab - Only for environmental compliance */}
      {activeTab === 'emissions' && selectedUseCase?.id.includes('environmental-compliance') && (
        <div className="space-y-6">
          {/* Emissions Tracking Chart */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Emissions Tracking vs Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.emissionsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="methane" stroke="#F59E0B" strokeWidth={2} name="Methane" />
                  <Line type="monotone" dataKey="co2" stroke="#3B82F6" strokeWidth={2} name="CO2" />
                  <Line type="monotone" dataKey="nox" stroke="#10B981" strokeWidth={2} name="NOx" />
                  <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" strokeWidth={2} name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emissions by Source */}
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Emissions by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.emissionsBySource?.map((source: any) => (
                    <div key={source.source} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{source.source}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-400">{source.percentage}%</span>
                          <Badge variant="success" size="small">
                            ↓ {source.reduction}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emission Reduction Initiatives */}
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Active Reduction Initiatives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Flare Gas Recovery', status: 'Active', reduction: '15%', investment: '$2.5M' },
                    { name: 'Leak Detection & Repair', status: 'Active', reduction: '22%', investment: '$1.8M' },
                    { name: 'Equipment Modernization', status: 'Planning', reduction: '30%', investment: '$5.2M' },
                    { name: 'Carbon Capture Pilot', status: 'Testing', reduction: '45%', investment: '$8.5M' },
                  ].map((initiative) => (
                    <div key={initiative.name} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{initiative.name}</span>
                        <Badge
                          variant={initiative.status === 'Active' ? 'success' :
                                  initiative.status === 'Testing' ? 'warning' : 'info'}
                          size="small"
                        >
                          {initiative.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Expected Reduction:</span>
                          <span className="text-green-400 ml-1">{initiative.reduction}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Investment:</span>
                          <span className="text-white ml-1">{initiative.investment}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Permits Tab - Only for environmental compliance */}
      {activeTab === 'permits' && selectedUseCase?.id.includes('environmental-compliance') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Permit Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Permit Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Permit Number</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Expiry Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Compliance</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.permitStatus?.map((permit: any) => (
                      <tr key={permit.number} className="border-b border-gray-800 hover:bg-white/5">
                        <td className="py-3 px-4 text-sm text-white">{permit.permit}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{permit.number}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={permit.status === 'Active' ? 'success' : 'warning'}
                            size="small"
                          >
                            {permit.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">{permit.expiry}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Progress value={permit.compliance} className="w-20 h-2" />
                            <span className="text-sm text-white">{permit.compliance}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button size="small" variant="secondary">
                            {permit.status === 'Renewal Due' ? 'Renew' : 'View'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Permit Timeline */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Permit Renewal Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { permit: 'Waste Management License', days: 45, status: 'critical' },
                  { permit: 'Water Discharge Permit', days: 120, status: 'warning' },
                  { permit: 'Air Quality Permit', days: 365, status: 'good' },
                  { permit: 'Operating License', days: 730, status: 'good' },
                ].map((item) => (
                  <div key={item.permit} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{item.permit}</span>
                      <span className={`text-sm font-medium ${
                        item.status === 'critical' ? 'text-red-400' :
                        item.status === 'warning' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {item.days} days until renewal
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === 'critical' ? 'bg-red-500' :
                          item.status === 'warning' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.max(5, Math.min(100, (730 - item.days) / 730 * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Regulations Tab - Only for environmental compliance */}
      {activeTab === 'regulations' && selectedUseCase?.id.includes('environmental-compliance') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Regulatory Alerts & Updates</span>
                <Badge variant="warning" size="small">{dashboardData.regulatoryAlerts?.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.regulatoryAlerts?.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-lg border-2 ${
                      alert.impact === 'high' ? 'bg-red-500/10 border-red-500/50' :
                      alert.impact === 'medium' ? 'bg-yellow-500/10 border-yellow-500/50' :
                      'bg-blue-500/10 border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{alert.regulation}</h4>
                        <p className="text-sm text-gray-400 mt-1">{alert.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={alert.impact === 'high' ? 'error' : alert.impact === 'medium' ? 'warning' : 'info'}
                        >
                          {alert.impact.toUpperCase()} IMPACT
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">Deadline: {alert.deadline}</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-white mb-1">Required Action</p>
                      <p className="text-sm text-gray-300">{alert.action}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Status: {alert.status}</span>
                        <span>Affects {alert.affectedAssets} assets</span>
                      </div>
                      <Button size="small" variant="primary">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Calendar */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Upcoming Compliance Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { date: '2024-03-15', event: 'Q1 Emissions Report Due', type: 'report' },
                  { date: '2024-03-30', event: 'EPA Inspection - Site 3', type: 'inspection' },
                  { date: '2024-04-01', event: 'New Methane Standards Effective', type: 'regulation' },
                  { date: '2024-04-15', event: 'Water Quality Testing', type: 'testing' },
                  { date: '2024-04-30', event: 'Annual Compliance Audit', type: 'audit' },
                  { date: '2024-05-15', event: 'Permit Renewal - Waste Mgmt', type: 'permit' },
                ].map((item) => (
                  <div key={item.event} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <CalendarIcon className={`w-5 h-5 ${
                        item.type === 'report' ? 'text-blue-400' :
                        item.type === 'inspection' ? 'text-yellow-400' :
                        item.type === 'regulation' ? 'text-red-400' :
                        item.type === 'testing' ? 'text-green-400' :
                        item.type === 'audit' ? 'text-purple-400' :
                        'text-orange-400'
                      }`} />
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{item.event}</p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">{item.type}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forecasts Tab - Only for load forecasting */}
      {activeTab === 'forecasts' && selectedUseCase?.id.includes('load-forecasting') && (
        <div className="space-y-6">
          {/* 24-Hour Forecast */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>24-Hour Load Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" label={{ value: 'Load (MW)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => `${value.toLocaleString()} MW`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} name="Actual Load" />
                  <Line type="monotone" dataKey="forecast" stroke="#10B981" strokeWidth={2} name="AI Forecast" />
                  <Line type="monotone" dataKey="baseline" stroke="#6B7280" strokeDasharray="5 5" name="Baseline" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Forecast */}
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>7-Day Peak Load Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dashboardData.weeklyForecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="peak" fill="#EF4444" name="Peak Load" />
                    <Bar dataKey="average" fill="#3B82F6" name="Average" />
                    <Bar dataKey="minimum" fill="#10B981" name="Minimum" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Load Factors */}
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Load Influencing Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.loadFactors?.map((factor: any) => (
                    <div key={factor.factor} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{factor.factor}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">Impact: {factor.impact}%</span>
                          <Badge variant="info" size="small">
                            r={factor.correlation}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${factor.impact}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Zones Tab - Only for load forecasting */}
      {activeTab === 'zones' && selectedUseCase?.id.includes('load-forecasting') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Grid Zone Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.gridZones?.map((zone: any) => (
                  <div key={zone.zone} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{zone.zone}</h4>
                        <p className="text-xs text-gray-400">Capacity: {zone.capacity.toLocaleString()} MW</p>
                      </div>
                      <Badge
                        variant={zone.utilization > 90 ? 'error' : zone.utilization > 80 ? 'warning' : 'success'}
                        size="small"
                      >
                        {zone.utilization.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Current Load</span>
                        <span className="font-medium text-white">{zone.currentLoad.toLocaleString()} MW</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Forecast Peak</span>
                        <span className="font-medium text-yellow-400">{zone.forecastPeak.toLocaleString()} MW</span>
                      </div>
                      <Progress value={zone.utilization} className="h-3 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Zone Load Distribution */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Real-time Zone Load Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.gridZones}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ zone, currentLoad }) => `${zone}: ${currentLoad} MW`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="currentLoad"
                  >
                    {dashboardData.gridZones?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Demand Tab - Only for load forecasting */}
      {activeTab === 'demand' && selectedUseCase?.id.includes('load-forecasting') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Demand Response Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Program</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Enrolled</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Potential</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Activations</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Savings</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.demandResponse?.map((program: any) => (
                      <tr key={program.program} className="border-b border-gray-800 hover:bg-white/5">
                        <td className="py-3 px-4 text-sm text-white">{program.program}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{program.enrolled.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{program.potential}</td>
                        <td className="py-3 px-4">
                          <Badge variant="info" size="small">{program.activated} this month</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-green-400">{program.savings}</td>
                        <td className="py-3 px-4">
                          <Button size="small" variant="secondary">Activate</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Demand Response Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total DR Capacity</p>
                    <p className="text-3xl font-bold text-white">1,250 MW</p>
                    <p className="text-xs text-green-400 mt-1">↑ 15% from last year</p>
                  </div>
                  <BoltIcon className="w-12 h-12 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Participants</p>
                    <p className="text-3xl font-bold text-white">46,025</p>
                    <p className="text-xs text-green-400 mt-1">↑ 22% enrollment</p>
                  </div>
                  <UserGroupIcon className="w-12 h-12 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Savings</p>
                    <p className="text-3xl font-bold text-white">$12.5M</p>
                    <p className="text-xs text-green-400 mt-1">This quarter</p>
                  </div>
                  <CurrencyDollarIcon className="w-12 h-12 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Models Tab - Only for load forecasting */}
      {activeTab === 'models' && selectedUseCase?.id.includes('load-forecasting') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>AI Forecasting Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.forecastModels?.map((model: any) => (
                  <div key={model.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{model.name}</h4>
                        <p className="text-xs text-gray-400">Horizon: {model.horizon}</p>
                      </div>
                      <Badge
                        variant={model.status === 'active' ? 'success' : 'warning'}
                        size="small"
                      >
                        {model.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Accuracy</span>
                        <span className="text-lg font-bold text-white">{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                      <div className="pt-2 border-t border-gray-700">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-400">Last Updated</p>
                            <p className="text-white">2 hours ago</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Predictions</p>
                            <p className="text-white">1.2M/day</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Model Performance Comparison */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Model Accuracy by Customer Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardData.accuracyByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="type" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" domain={[90, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy %">
                    {dashboardData.accuracyByType?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.trend === 'improving' ? '#10B981' :
                        entry.trend === 'stable' ? '#3B82F6' :
                        '#EF4444'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Tab - Only for load forecasting */}
      {activeTab === 'alerts' && selectedUseCase?.id.includes('load-forecasting') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Forecast Alerts</span>
                <Badge variant="warning" size="small">{dashboardData.forecastAlerts?.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.forecastAlerts?.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-lg border-2 ${
                      alert.severity === 'high' ? 'bg-red-500/10 border-red-500/50' :
                      alert.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/50' :
                      'bg-blue-500/10 border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          alert.severity === 'high' ? 'bg-red-500/20' :
                          alert.severity === 'medium' ? 'bg-yellow-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <ExclamationTriangleIcon className={`w-6 h-6 ${
                            alert.severity === 'high' ? 'text-red-500' :
                            alert.severity === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{alert.type}</h4>
                          <p className="text-sm text-gray-400">{alert.time}</p>
                        </div>
                      </div>
                      <Badge
                        variant={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Expected Load</p>
                        <p className="text-lg font-semibold text-white">{alert.expectedLoad.toLocaleString()} MW</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Available Capacity</p>
                        <p className="text-lg font-semibold text-white">{alert.capacity.toLocaleString()} MW</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-sm font-medium text-white mb-1">Recommended Action</p>
                      <p className="text-sm text-gray-300">{alert.recommendation}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Alert ID: #{alert.id}</span>
                        <span>AI Confidence: 94%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="small" variant="secondary">Dismiss</Button>
                        <Button size="small" variant="primary">Take Action</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alert Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Alerts This Month</p>
                    <p className="text-3xl font-bold text-white">47</p>
                    <p className="text-xs text-green-400 mt-1">↓ 23% from last month</p>
                  </div>
                  <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Actions Taken</p>
                    <p className="text-3xl font-bold text-white">92%</p>
                    <p className="text-xs text-green-400 mt-1">Response rate</p>
                  </div>
                  <CheckCircleIcon className="w-12 h-12 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Outages Prevented</p>
                    <p className="text-3xl font-bold text-white">8</p>
                    <p className="text-xs text-green-400 mt-1">This quarter</p>
                  </div>
                  <ShieldCheckIcon className="w-12 h-12 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Anomalies Tab - Only for grid anomaly detection */}
      {activeTab === 'anomalies' && selectedUseCase?.id.includes('grid-anomaly') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Grid Anomalies</span>
                <Badge variant="warning" size="small">{dashboardData.activeAnomalies?.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.activeAnomalies?.map((anomaly: any) => (
                  <div
                    key={anomaly.id}
                    className={`p-6 rounded-lg border-2 ${
                      anomaly.severity === 'critical' ? 'bg-red-500/10 border-red-500/50' :
                      anomaly.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/50' :
                      'bg-blue-500/10 border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          anomaly.severity === 'critical' ? 'bg-red-500/20' :
                          anomaly.severity === 'warning' ? 'bg-yellow-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <ExclamationTriangleIcon className={`w-6 h-6 ${
                            anomaly.severity === 'critical' ? 'text-red-500' :
                            anomaly.severity === 'warning' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{anomaly.type}</h4>
                          <p className="text-sm text-gray-400">{anomaly.location} • {anomaly.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={anomaly.severity === 'critical' ? 'error' : anomaly.severity === 'warning' ? 'warning' : 'info'}
                        >
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">Status: {anomaly.status}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-3">{anomaly.description}</p>
                    
                    <div className="bg-black/30 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-white mb-1">Impact Assessment</p>
                      <p className="text-sm text-gray-300">{anomaly.impact}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>ID: {anomaly.id}</span>
                        <span>AI Confidence: 92%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="small" variant="secondary">View Details</Button>
                        <Button size="small" variant="primary">Take Action</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Components Tab - Only for grid anomaly detection */}
      {activeTab === 'components' && selectedUseCase?.id.includes('grid-anomaly') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Grid Component Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.gridComponents?.map((component: any) => (
                  <div key={component.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{component.name}</h4>
                        <p className="text-xs text-gray-400">{component.type}</p>
                      </div>
                      <Badge
                        variant={component.health >= 95 ? 'success' : component.health >= 90 ? 'warning' : 'error'}
                        size="small"
                      >
                        {component.health}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress value={component.health} className="h-2" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Anomalies: {component.anomalies}</span>
                        <span className="text-gray-400">Checked: {component.lastCheck}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${component.anomalies === 0 ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                          <span className="text-xs text-gray-400">
                            {component.anomalies === 0 ? 'Operating Normally' : 'Monitoring Active'}
                          </span>
                        </div>
                        <Button size="small" variant="secondary" className="text-xs">
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Component Health Overview */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Component Health by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.gridHealthData?.map((item: any) => (
                  <div key={item.component} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{item.component}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${
                          item.issues === 0 ? 'text-green-400' :
                          item.issues <= 2 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {item.issues} issues
                        </span>
                        {item.trend === 'improving' ? (
                          <ArrowUpIcon className="w-3 h-3 text-green-400" />
                        ) : item.trend === 'declining' ? (
                          <ArrowDownIcon className="w-3 h-3 text-red-400" />
                        ) : (
                          <MinusIcon className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={item.health} className="flex-1" />
                      <span className="text-sm font-medium text-white">{item.health}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Patterns Tab - Only for grid anomaly detection */}
      {activeTab === 'patterns' && selectedUseCase?.id.includes('grid-anomaly') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>AI-Detected Anomaly Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.anomalyPatterns?.map((pattern: any) => (
                  <div key={pattern.pattern} className="p-6 bg-white/5 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{pattern.pattern}</h4>
                        <p className="text-sm text-gray-400">Frequency: {pattern.frequency}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{pattern.accuracy}%</div>
                        <p className="text-xs text-gray-400">Accuracy</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Last Detected</span>
                        <span className="text-white">{pattern.lastDetected}</span>
                      </div>
                      <Progress value={pattern.accuracy} className="h-2" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <Button size="small" variant="secondary" className="w-full">
                        View Pattern Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pattern Recognition Performance */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Pattern Recognition Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dashboardData.anomalyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#EF4444" fill="#EF4444" name="Critical" />
                  <Area type="monotone" dataKey="warning" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Warning" />
                  <Area type="monotone" dataKey="info" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Info" />
                  <Area type="monotone" dataKey="resolved" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Response Tab - Only for grid anomaly detection */}
      {activeTab === 'response' && selectedUseCase?.id.includes('grid-anomaly') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData.responseMetrics?.map((metric: any) => (
              <Card key={metric.type} variant="gradient" effect="shimmer">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">{metric.type}</h4>
                    <p className="text-3xl font-bold text-white mb-1">{metric.count}</p>
                    <p className="text-sm text-gray-400">Avg Time: {metric.avgTime}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Response Actions */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Automated Response Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: 'Voltage Regulation',
                    triggers: 125,
                    success: 98,
                    avgTime: '0.3s',
                    status: 'active'
                  },
                  {
                    action: 'Load Balancing',
                    triggers: 89,
                    success: 95,
                    avgTime: '1.2s',
                    status: 'active'
                  },
                  {
                    action: 'Circuit Isolation',
                    triggers: 12,
                    success: 100,
                    avgTime: '0.8s',
                    status: 'active'
                  },
                  {
                    action: 'Backup Power Activation',
                    triggers: 3,
                    success: 100,
                    avgTime: '2.5s',
                    status: 'standby'
                  },
                ].map((action) => (
                  <div key={action.action} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{action.action}</h4>
                        <p className="text-xs text-gray-400">Avg Response: {action.avgTime}</p>
                      </div>
                      <Badge
                        variant={action.status === 'active' ? 'success' : 'warning'}
                        size="small"
                      >
                        {action.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-gray-400">Triggers</p>
                        <p className="text-white font-medium">{action.triggers}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Success Rate</p>
                        <p className="text-green-400 font-medium">{action.success}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status</p>
                        <p className="text-white font-medium capitalize">{action.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Heatmap Tab - Only for grid anomaly detection */}
      {activeTab === 'heatmap' && selectedUseCase?.id.includes('grid-anomaly') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Anomaly Heatmap - Weekly Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Hour</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">Mon</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">Tue</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">Wed</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">Thu</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">Fri</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">Sat</th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-400">Sun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.anomalyHeatmap?.map((row: any) => (
                      <tr key={row.hour}>
                        <td className="py-2 px-4 text-sm font-medium text-white">{row.hour}:00</td>
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                          const value = row[day];
                          const intensity = value / 11; // Max value is 11 in the data
                          return (
                            <td key={day} className="text-center py-2 px-4">
                              <div
                                className={`inline-flex items-center justify-center w-12 h-12 rounded ${
                                  value === 0 ? 'bg-gray-800' :
                                  value <= 3 ? 'bg-green-500/20' :
                                  value <= 6 ? 'bg-yellow-500/20' :
                                  value <= 9 ? 'bg-orange-500/20' :
                                  'bg-red-500/20'
                                }`}
                                style={{
                                  backgroundColor: value > 0 ? `rgba(239, 68, 68, ${intensity * 0.3})` : undefined
                                }}
                              >
                                <span className={`text-sm font-medium ${
                                  value === 0 ? 'text-gray-600' :
                                  value <= 3 ? 'text-green-400' :
                                  value <= 6 ? 'text-yellow-400' :
                                  value <= 9 ? 'text-orange-400' :
                                  'text-red-400'
                                }`}>
                                  {value}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-800 rounded mr-2" />
                  <span className="text-gray-400">No Anomalies</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500/20 rounded mr-2" />
                  <span className="text-gray-400">Low (1-3)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500/20 rounded mr-2" />
                  <span className="text-gray-400">Medium (4-6)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500/20 rounded mr-2" />
                  <span className="text-gray-400">High (7-9)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500/20 rounded mr-2" />
                  <span className="text-gray-400">Critical (10+)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Geographic Anomaly Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-white/5 rounded-lg">
                <div className="text-center">
                  <MapIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Interactive grid map visualization</p>
                  <p className="text-sm text-gray-500 mt-2">Shows real-time anomaly locations across the grid</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Tab - Only for oilfield use case */}
      {activeTab === 'financial' && selectedUseCase?.id.includes('oilfield-land-lease') && dashboardData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="gradient" effect="shimmer">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Lease Revenue</span>
                    <span className="text-lg font-semibold text-white">
                      ${((dashboardData?.revenueData || dashboardData?.financial?.revenueData || []).reduce((sum: number, m: any) => sum + m.lease, 0)).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Royalties</span>
                    <span className="text-lg font-semibold text-white">
                      ${((dashboardData?.revenueData || dashboardData?.financial?.revenueData || []).reduce((sum: number, m: any) => sum + m.royalty, 0)).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Production Fees</span>
                    <span className="text-lg font-semibold text-white">
                      ${((dashboardData?.revenueData || dashboardData?.financial?.revenueData || []).reduce((sum: number, m: any) => sum + m.production, 0)).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" effect="shimmer">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Operations</span>
                    <span className="text-lg font-semibold text-white">$28.5M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Maintenance</span>
                    <span className="text-lg font-semibold text-white">$15.2M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Compliance</span>
                    <span className="text-lg font-semibold text-white">$8.7M</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" effect="shimmer">
              <CardHeader>
                <CardTitle>Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Next Quarter</p>
                    <p className="text-lg font-semibold text-white">$42.8M</p>
                    <p className="text-xs text-green-500">Net Income</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Year End</p>
                    <p className="text-lg font-semibold text-white">$185.2M</p>
                    <p className="text-xs text-green-500">Net Income</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue Trend Chart - Already included in overview */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Quarterly Financial Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { quarter: 'Q1 2023', revenue: 85.2, expenses: 52.4, profit: 32.8 },
                    { quarter: 'Q2 2023', revenue: 92.5, expenses: 54.1, profit: 38.4 },
                    { quarter: 'Q3 2023', revenue: 98.7, expenses: 55.8, profit: 42.9 },
                    { quarter: 'Q4 2023', revenue: 105.3, expenses: 58.2, profit: 47.1 },
                    { quarter: 'Q1 2024', revenue: 112.8, expenses: 60.5, profit: 52.3 },
                    { quarter: 'Q2 2024', revenue: 118.5, expenses: 62.1, profit: 56.4 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="quarter" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" label={{ value: 'Amount ($M)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#D1D5DB' }}
                    formatter={(value: number) => `$${value.toFixed(1)}M`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Patients Tab - Only for patient risk stratification */}
      {activeTab === 'patients' && selectedUseCase?.id.includes('patient-risk-stratification') && (
        <div className="space-y-6">
          {/* Patient Cohorts Overview */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Patient Cohorts</span>
                <Badge variant="info" size="small">{dashboardData.patientCohorts?.length} Active Cohorts</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.patientCohorts?.map((cohort: any) => (
                  <div key={cohort.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{cohort.name}</h4>
                        <p className="text-xs text-gray-400">{cohort.size.toLocaleString()} patients</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{cohort.avgRisk}%</div>
                        <p className="text-xs text-gray-400">Avg Risk</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={cohort.avgRisk} className="h-2" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Trend</span>
                        <div className="flex items-center">
                          {cohort.trend === 'increasing' ? (
                            <>
                              <ArrowUpIcon className="w-3 h-3 text-red-400 mr-1" />
                              <span className="text-red-400">Increasing</span>
                            </>
                          ) : cohort.trend === 'decreasing' ? (
                            <>
                              <ArrowDownIcon className="w-3 h-3 text-green-400 mr-1" />
                              <span className="text-green-400">Decreasing</span>
                            </>
                          ) : (
                            <>
                              <MinusIcon className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-gray-400">Stable</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* High Risk Patients */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>High Risk Patients - Immediate Attention Required</span>
                <span className="text-sm text-red-500">Critical</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.highRiskPatients?.map((patient: any) => (
                  <div
                    key={patient.id}
                    className={`p-4 rounded-lg border ${
                      patient.status === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                      patient.status === 'stable' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-green-500/10 border-green-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-white">{patient.name}</span>
                          <span className="text-xs text-gray-500">• Age {patient.age}</span>
                          <span className="text-xs text-gray-500">• ID: {patient.id}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {patient.conditions.map((condition: string, idx: number) => (
                            <Badge key={idx} variant="secondary" size="small">{condition}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{patient.riskScore}%</div>
                        <p className="text-xs text-gray-400">Risk Score</p>
                        <Badge
                          variant={patient.status === 'critical' ? 'error' : patient.status === 'stable' ? 'warning' : 'success'}
                          size="small"
                          className="mt-1"
                        >
                          {patient.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-gray-400">Last Admission</p>
                        <p className="text-white font-medium">{patient.lastAdmission}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Next Appointment</p>
                        <p className="text-white font-medium">{patient.nextAppointment}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Interventions</p>
                        <p className="text-white font-medium">{patient.interventions.length} active</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Care Team</p>
                        <p className="text-white font-medium">Dr. Smith</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-400 mb-2">Active Interventions</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.interventions.map((intervention: string, idx: number) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                            {intervention}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Analysis Tab - Only for patient risk stratification */}
      {activeTab === 'risk-analysis' && selectedUseCase?.id.includes('patient-risk-stratification') && (
        <div className="space-y-6">
          {/* Risk Score Distribution */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Patient Risk Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="patients"
                  >
                    {dashboardData.riskDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => `${value.toLocaleString()} patients`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {dashboardData.riskDistribution?.map((item: any) => (
                  <div key={item.risk} className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-white">{item.risk} Risk</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{item.patients.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Readmit Rate: {item.readmitRate}%</p>
                    <p className="text-xs text-gray-400">Avg Cost: ${item.avgCost.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Factors */}
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Key Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.riskFactors?.map((factor: any) => (
                    <div key={factor.factor} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{factor.factor}</span>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={factor.impact === 'critical' ? 'error' : factor.impact === 'high' ? 'warning' : 'info'}
                            size="small"
                          >
                            {factor.impact}
                          </Badge>
                          <span className="text-xs text-gray-400">Weight: {factor.weight}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={factor.prevalence} className="flex-1" />
                        <span className="text-sm text-white">{factor.prevalence}%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Prevalence in population</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Score Trend */}
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Risk Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dashboardData.riskScoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="lowRisk" stackId="1" stroke="#10B981" fill="#10B981" name="Low Risk" />
                    <Area type="monotone" dataKey="mediumRisk" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Medium Risk" />
                    <Area type="monotone" dataKey="highRisk" stackId="1" stroke="#EF4444" fill="#EF4444" name="High Risk" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI Model Performance */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Risk Prediction Model Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData.predictiveModels?.map((model: any) => (
                  <div key={model.model} className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-semibold text-white mb-3">{model.model}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Accuracy</span>
                        <span className="text-sm font-medium text-white">{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">AUC: {model.auc}</span>
                        <span className="text-gray-400">{model.lastUpdated}</span>
                      </div>
                      <p className="text-xs text-gray-500">{model.predictions.toLocaleString()} predictions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interventions Tab - Only for patient risk stratification */}
      {activeTab === 'interventions' && selectedUseCase?.id.includes('patient-risk-stratification') && (
        <div className="space-y-6">
          {/* Active Interventions */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Active Intervention Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.interventions?.map((intervention: any) => (
                  <div key={intervention.id} className="p-6 bg-white/5 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{intervention.type}</h4>
                        <p className="text-sm text-gray-400">Target: {intervention.targetGroup}</p>
                      </div>
                      <Badge
                        variant={intervention.status === 'active' ? 'success' : 'warning'}
                        size="small"
                      >
                        {intervention.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-black/30 rounded-lg">
                        <p className="text-2xl font-bold text-white">{intervention.enrolled}</p>
                        <p className="text-xs text-gray-400">Enrolled Patients</p>
                      </div>
                      <div className="text-center p-3 bg-black/30 rounded-lg">
                        <p className="text-2xl font-bold text-green-400">{intervention.successRate}%</p>
                        <p className="text-xs text-gray-400">Success Rate</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Avg Cost Savings</span>
                        <span className="text-green-400 font-medium">${intervention.avgCostSavings.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Total Savings</span>
                        <span className="text-green-400 font-medium">
                          ${((intervention.enrolled * intervention.avgCostSavings * intervention.successRate) / 100).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <Button size="small" variant="secondary" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Intervention Success Chart */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Intervention Impact - Readmissions Prevented</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.interventionSuccess}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'cost') return `$${value}M`;
                      return value;
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="prevented" fill="#10B981" stroke="#10B981" name="Prevented" />
                  <Area type="monotone" dataKey="occurred" fill="#EF4444" stroke="#EF4444" name="Occurred" />
                  <Line type="monotone" dataKey="cost" stroke="#F59E0B" strokeWidth={2} name="Cost Saved (M)" yAxisId="right" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Outcomes Tab - Only for patient risk stratification */}
      {activeTab === 'outcomes' && selectedUseCase?.id.includes('patient-risk-stratification') && (
        <div className="space-y-6">
          {/* Outcome Metrics */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Key Outcome Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.outcomeMetrics?.map((metric: any) => (
                  <div key={metric.metric} className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-3">{metric.metric}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Baseline</span>
                        <span className="text-sm text-gray-300">{metric.baseline}{metric.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Current</span>
                        <span className="text-lg font-bold text-white">{metric.current}{metric.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Target</span>
                        <span className="text-sm text-blue-400">{metric.target}{metric.unit}</span>
                      </div>
                      <Progress
                        value={((metric.current - metric.baseline) / (metric.target - metric.baseline)) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-center text-gray-400">
                        {(((metric.current - metric.baseline) / (metric.target - metric.baseline)) * 100).toFixed(0)}% to target
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Care Gap Analysis */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Care Gap Closure Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.careGaps?.map((gap: any) => (
                  <div key={gap.gap} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{gap.gap}</span>
                      <Badge
                        variant={gap.closure >= 80 ? 'success' : gap.closure >= 60 ? 'warning' : 'error'}
                        size="small"
                      >
                        {gap.closure}% closed
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-gray-400">Identified:</span>
                        <span className="text-white ml-1">{gap.identified.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Closed:</span>
                        <span className="text-green-400 ml-1">{gap.closed.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Remaining:</span>
                        <span className="text-yellow-400 ml-1">{(gap.identified - gap.closed).toLocaleString()}</span>
                      </div>
                    </div>
                    <Progress value={gap.closure} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Predictions Tab - Only for patient risk stratification */}
      {activeTab === 'predictions' && selectedUseCase?.id.includes('patient-risk-stratification') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>AI Prediction Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboardData.predictiveModels?.map((model: any) => (
                  <div key={model.model} className="p-6 bg-white/5 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{model.model}</h4>
                        <p className="text-sm text-gray-400">Last updated: {model.lastUpdated}</p>
                      </div>
                      <CpuChipIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Model Accuracy</span>
                          <span className="text-lg font-bold text-white">{model.accuracy}%</span>
                        </div>
                        <Progress value={model.accuracy} className="h-3" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-black/30 rounded-lg">
                          <p className="text-sm font-medium text-white">{model.auc}</p>
                          <p className="text-xs text-gray-400">AUC Score</p>
                        </div>
                        <div className="text-center p-3 bg-black/30 rounded-lg">
                          <p className="text-sm font-medium text-white">{model.predictions.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">Predictions Made</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Model Features</p>
                        <div className="flex flex-wrap gap-2">
                          {['Demographics', 'Clinical History', 'Lab Results', 'Medications', 'Social Factors'].map((feature) => (
                            <span key={feature} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Engagement Tab - Only for patient risk stratification */}
      {activeTab === 'engagement' && selectedUseCase?.id.includes('patient-risk-stratification') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Patient Engagement Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.patientEngagement?.map((channel: any) => (
                  <div key={channel.channel} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white">{channel.channel}</h4>
                      <Badge variant="success" size="small">{channel.engagement}%</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Active Users</span>
                        <span className="text-white">{channel.users.toLocaleString()}</span>
                      </div>
                      <Progress value={channel.engagement} className="h-2" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Satisfaction</span>
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span className="text-white">{channel.satisfaction}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trials Tab - Only for clinical trial matching */}
      {activeTab === 'trials' && selectedUseCase?.id.includes('clinical-trial-matching') && (
        <div className="space-y-6">
          {/* Active Trials Grid */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Clinical Trials</span>
                <Badge variant="info" size="small">{dashboardData.activeTrials?.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboardData.activeTrials?.map((trial: any) => (
                  <div key={trial.id} className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{trial.name}</h4>
                        <p className="text-sm text-gray-400">{trial.sponsor}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={trial.status === 'Recruiting' ? 'success' : 'warning'}
                          size="small"
                        >
                          {trial.status}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">{trial.phase}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Enrollment Progress</span>
                        <span className="text-sm font-medium text-white">
                          {trial.currentEnrollment} / {trial.enrollmentTarget}
                        </span>
                      </div>
                      <Progress value={(trial.currentEnrollment / trial.enrollmentTarget) * 100} className="h-3" />
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400">Conditions</p>
                          <p className="text-white text-xs">{trial.conditions.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Locations</p>
                          <p className="text-white">{trial.locations} sites</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Success Rate</p>
                          <p className="text-green-400">{trial.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Compensation</p>
                          <p className="text-white">{trial.compensationRange}</p>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Key Criteria</p>
                        <div className="space-y-1 text-xs">
                          <p className="text-gray-300">Age: {trial.matchingCriteria.ageRange}</p>
                          <p className="text-gray-300">Conditions: {trial.matchingCriteria.conditions.join(', ')}</p>
                          <p className="text-gray-300">Exclusions: {trial.matchingCriteria.exclusions.join(', ')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3">
                        <Button size="small" variant="secondary">View Details</Button>
                        <Button size="small" variant="primary">Match Patients</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trial Categories Overview */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Trials by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {dashboardData.trialCategories?.map((category: any) => (
                  <div key={category.category} className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-white">{category.trials}</p>
                    <p className="text-xs text-gray-400">{category.category}</p>
                    <p className="text-xs text-green-400 mt-1">{category.avgMatchRate}% match</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Matching Tab - Only for clinical trial matching */}
      {activeTab === 'matching' && selectedUseCase?.id.includes('clinical-trial-matching') && (
        <div className="space-y-6">
          {/* Matching Metrics */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Matching Algorithm Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold text-white">{dashboardData.matchingAlgorithmPerformance?.accuracy}%</p>
                  <p className="text-sm text-gray-400">Accuracy</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold text-white">{dashboardData.matchingAlgorithmPerformance?.precision}%</p>
                  <p className="text-sm text-gray-400">Precision</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold text-white">{dashboardData.matchingAlgorithmPerformance?.recall}%</p>
                  <p className="text-sm text-gray-400">Recall</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold text-white">{dashboardData.matchingAlgorithmPerformance?.avgProcessingTime}s</p>
                  <p className="text-sm text-gray-400">Avg Time</p>
                </div>
              </div>

              <div className="space-y-3">
                {dashboardData.matchingMetrics?.map((metric: any) => (
                  <div key={metric.criteria} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{metric.criteria}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{metric.matches.toLocaleString()} matches</span>
                        <Badge variant="info" size="small">{metric.percentage}%</Badge>
                      </div>
                    </div>
                    <Progress value={metric.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Matches */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Recent Patient Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentMatches?.map((match: any) => (
                  <div key={match.patientId} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-white">Patient {match.patientId}</span>
                          <span className="text-xs text-gray-500">• Age {match.age}</span>
                          <span className="text-xs text-gray-500">• {match.condition}</span>
                        </div>
                        <p className="text-sm text-gray-400">Matched to: {match.matchedTrial}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{match.matchScore}%</div>
                        <p className="text-xs text-gray-400">Match Score</p>
                        <Badge
                          variant={match.status === 'Enrolled' ? 'success' : match.status === 'Contacted' ? 'warning' : 'info'}
                          size="small"
                          className="mt-1"
                        >
                          {match.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Matched {match.matchDate}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pipeline Tab - Only for clinical trial matching */}
      {activeTab === 'pipeline' && selectedUseCase?.id.includes('clinical-trial-matching') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Patient Conversion Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.patientPipeline?.map((stage: any, index: number) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-blue-500/20 text-blue-400' :
                          index === dashboardData.patientPipeline.length - 1 ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{stage.stage}</h4>
                          <p className="text-xs text-gray-400">{stage.count.toLocaleString()} patients</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{stage.conversion}%</p>
                        <p className="text-xs text-gray-400">Conversion Rate</p>
                      </div>
                    </div>
                    {index < dashboardData.patientPipeline.length - 1 && (
                      <div className="ml-6 h-8 w-0.5 bg-gray-700" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Overall Conversion</p>
                    <p className="text-3xl font-bold text-white">10.2%</p>
                    <p className="text-xs text-green-400 mt-1">↑ 2.5% from last month</p>
                  </div>
                  <UserGroupIcon className="w-12 h-12 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Time to Enrollment</p>
                    <p className="text-3xl font-bold text-white">14 days</p>
                    <p className="text-xs text-green-400 mt-1">↓ 3 days improvement</p>
                  </div>
                  <ClockIcon className="w-12 h-12 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Drop-off Rate</p>
                    <p className="text-3xl font-bold text-white">28%</p>
                    <p className="text-xs text-red-400 mt-1">↑ 5% increase</p>
                  </div>
                  <ExclamationTriangleIcon className="w-12 h-12 text-red-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Enrollment Tab - Only for clinical trial matching */}
      {activeTab === 'enrollment' && selectedUseCase?.id.includes('clinical-trial-matching') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Enrollment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="screened" stroke="#3B82F6" strokeWidth={2} name="Screened" />
                  <Line type="monotone" dataKey="matched" stroke="#F59E0B" strokeWidth={2} name="Matched" />
                  <Line type="monotone" dataKey="enrolled" stroke="#10B981" strokeWidth={2} name="Enrolled" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trials by Phase */}
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Enrollment by Trial Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dashboardData.trialsByPhase}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="patients"
                    >
                      {dashboardData.trialsByPhase?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {dashboardData.trialsByPhase?.map((item: any) => (
                    <div key={item.phase} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-400">{item.phase}</span>
                      </div>
                      <span className="text-white font-medium">{item.patients.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Success Factors */}
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Key Success Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { factor: 'Patient Education', impact: 85, trend: 'up' },
                    { factor: 'Site Accessibility', impact: 78, trend: 'stable' },
                    { factor: 'Compensation Level', impact: 72, trend: 'up' },
                    { factor: 'Trial Complexity', impact: 65, trend: 'down' },
                    { factor: 'Follow-up Support', impact: 88, trend: 'up' },
                  ].map((factor) => (
                    <div key={factor.factor} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{factor.factor}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">{factor.impact}% impact</span>
                          {factor.trend === 'up' ? (
                            <ArrowUpIcon className="w-3 h-3 text-green-400" />
                          ) : factor.trend === 'down' ? (
                            <ArrowDownIcon className="w-3 h-3 text-red-400" />
                          ) : (
                            <MinusIcon className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <Progress value={factor.impact} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Geographic Tab - Only for clinical trial matching */}
      {activeTab === 'geographic' && selectedUseCase?.id.includes('clinical-trial-matching') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Geographic Distribution of Trials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {dashboardData.geographicDistribution?.map((region: any) => (
                  <div key={region.region} className="p-4 bg-white/5 rounded-lg text-center">
                    <MapPinIcon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <h4 className="text-sm font-semibold text-white">{region.region}</h4>
                    <div className="mt-2 space-y-1 text-xs">
                      <p className="text-gray-400">Trials: <span className="text-white font-medium">{region.trials}</span></p>
                      <p className="text-gray-400">Sites: <span className="text-white font-medium">{region.sites}</span></p>
                      <p className="text-gray-400">Patients: <span className="text-white font-medium">{region.patients.toLocaleString()}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Regional Performance */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Regional Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.geographicDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="region" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="trials" fill="#3B82F6" name="Active Trials" />
                  <Bar dataKey="sites" fill="#10B981" name="Trial Sites" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Algorithm Tab - Only for clinical trial matching */}
      {activeTab === 'algorithm' && selectedUseCase?.id.includes('clinical-trial-matching') && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>AI Matching Algorithm Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">Model Performance</h4>
                    <CpuChipIcon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">F1 Score</span>
                      <span className="text-lg font-bold text-white">{dashboardData.matchingAlgorithmPerformance?.f1Score}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Processing Speed</span>
                      <span className="text-lg font-bold text-white">{dashboardData.matchingAlgorithmPerformance?.avgProcessingTime}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Daily Predictions</span>
                      <span className="text-lg font-bold text-white">125K</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Model Version</span>
                      <span className="text-lg font-bold text-white">v3.2.1</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-4">Feature Importance</h4>
                  <div className="space-y-2">
                    {[
                      { feature: 'Medical History', importance: 95 },
                      { feature: 'Lab Results', importance: 88 },
                      { feature: 'Demographics', importance: 72 },
                      { feature: 'Geographic Location', importance: 65 },
                      { feature: 'Insurance Type', importance: 45 },
                    ].map((item) => (
                      <div key={item.feature}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">{item.feature}</span>
                          <span className="text-xs text-white">{item.importance}%</span>
                        </div>
                        <Progress value={item.importance} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Algorithm Updates */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Recent Algorithm Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    version: 'v3.2.1',
                    date: '2024-02-15',
                    changes: 'Improved matching accuracy for rare diseases',
                    impact: '+3.2% accuracy',
                    status: 'deployed'
                  },
                  {
                    version: 'v3.2.0',
                    date: '2024-01-28',
                    changes: 'Added social determinants of health factors',
                    impact: '+5.8% recall',
                    status: 'deployed'
                  },
                  {
                    version: 'v3.3.0',
                    date: '2024-03-01',
                    changes: 'Multi-language support for patient data',
                    impact: 'Testing',
                    status: 'testing'
                  },
                ].map((update) => (
                  <div key={update.version} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-white">{update.version}</span>
                          <Badge
                            variant={update.status === 'deployed' ? 'success' : 'warning'}
                            size="small"
                          >
                            {update.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{update.changes}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-400">{update.impact}</p>
                        <p className="text-xs text-gray-500">{update.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SIA Analysis Modal */}
      <SIAAnalysisModal
        selectedMetric={selectedMetric}
        onClose={() => setSelectedMetric(null)}
        useCaseName={selectedUseCase?.name || ''}
        analysisData={dashboardData?.siaAnalysisData || {}}
      />
    </div>
  );
};

// Render use case specific charts based on the vertical and use case
const renderUseCaseSpecificCharts = (
  useCase: UseCase,
  data: any,
  selectedLeaseStatus?: string | null,
  setSelectedLeaseStatus?: (status: string | null) => void,
  setSelectedLease?: (lease: any) => void
) => {
  if (data?.defaultData) {
    return (
      <Card variant="glass" effect="glow">
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">Custom visualizations for this use case coming soon</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Energy vertical charts
  const vertical = useCase.id.split('-')[0];
  if (vertical === 'energy') {
    if (useCase.id.includes('oilfield-land-lease')) {
      return (
        <>
          {/* Critical Lease Expirations - Enhanced */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Critical Lease Expirations - Next 365 Days</span>
                <span className="text-sm text-red-500">Action Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data?.criticalExpirations || data?.orchestration?.criticalExpirations)?.map((expiration: any, index: number) => (
                  <div key={index} className={`p-4 ${index === 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'} rounded-lg`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{expiration.name}</h4>
                        <p className="text-xs text-gray-400">Wells: {expiration.wells}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 ${index === 0 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'} rounded-full`}>
                        {expiration.daysUntilExpiry} days
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-400">Current Rate</p>
                        <p className="text-white font-medium">${expiration.currentRate}/acre/year</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Market Rate</p>
                        <p className="text-green-400 font-medium">${expiration.marketRate}/acre/year</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Production Impact</p>
                        <p className="text-yellow-400 font-medium">${expiration.productionImpact}M/day</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Renewal Status</p>
                        <p className="text-orange-400 font-medium">{expiration.renewalStatus}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lease Renewal Timeline */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Lease Renewal Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data?.leaseRenewalTimeline || data?.orchestration?.leaseRenewalTimeline} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="days" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#D1D5DB' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'Lease Count') return value;
                        return `$${value}M`;
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Lease Count" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Revenue Impact" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Production by Well Type */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Production Revenue by Well Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data?.productionByWellType || data?.orchestration?.productionByWellType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(data?.productionByWellType || data?.orchestration?.productionByWellType)?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number) => `${value}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {(data?.productionByWellType || data?.orchestration?.productionByWellType)?.map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-400">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lease Status and Workflows Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lease Status Distribution */}
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Lease Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data?.leaseStatuses || data?.orchestration?.leaseStatuses)?.map((status: any, index: number) => (
                    <div key={status.status}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => setSelectedLeaseStatus?.(selectedLeaseStatus === status.status ? null : status.status)}
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircleIcon className={`w-5 h-5 ${status.color}`} />
                          <span className="text-sm text-gray-300">{status.status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-white">{status.count}</span>
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${status.color.replace('text-', 'bg-')}`}
                              style={{ width: `${(status.count / 50) * 100}%` }}
                            />
                          </div>
                          <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${
                            selectedLeaseStatus === status.status ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </motion.div>
                      
                      {/* Expandable Lease List */}
                      <AnimatePresence>
                        {selectedLeaseStatus === status.status && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 ml-8 space-y-2 max-h-96 overflow-y-auto">
                              {(data?.leases || data?.landLeases)
                                ?.filter((lease: any) => lease.status === status.status)
                                .slice(0, 10)
                                .map((lease: any) => (
                                  <div
                                    key={lease.id}
                                    className="p-3 bg-black/30 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="text-sm font-medium text-white">{lease.propertyId}</span>
                                          <span className="text-xs text-gray-500">•</span>
                                          <span className="text-sm text-gray-400">{lease.leaseholder}</span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                          <div className="flex items-center">
                                            <MapPinIcon className="w-3 h-3 mr-1" />
                                            {lease.location.county}, {lease.location.state}
                                          </div>
                                          <span>{lease.location.acres.toLocaleString()} acres</span>
                                          <span>${(lease.annualPayment / 1000).toFixed(0)}K/yr</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <div className="flex space-x-1">
                                          <div
                                            className={`w-2 h-2 rounded-full ${
                                              lease.compliance.environmental ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                            title="Environmental"
                                          />
                                          <div
                                            className={`w-2 h-2 rounded-full ${
                                              lease.compliance.regulatory ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                            title="Regulatory"
                                          />
                                          <div
                                            className={`w-2 h-2 rounded-full ${
                                              lease.compliance.safety ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                            title="Safety"
                                          />
                                        </div>
                                        <Button
                                          size="small"
                                          variant="secondary"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedLease?.(lease);
                                          }}
                                          className="text-xs px-2 py-1"
                                        >
                                          View
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              {(data?.leases || data?.landLeases)?.filter((lease: any) => lease.status === status.status).length > 10 && (
                                <div className="text-center py-2">
                                  <span className="text-xs text-gray-500">
                                    Showing 10 of {(data?.leases || data?.landLeases)?.filter((lease: any) => lease.status === status.status).length} leases
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* VANGUARDS Active Workflows */}
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>VANGUARDS Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data?.activeWorkflows || data?.workflows || data?.orchestration?.activeWorkflows)?.map((workflow: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{workflow.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          workflow.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          workflow.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                          workflow.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {workflow.priority}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                          style={{ width: `${workflow.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{workflow.progress}% complete • {workflow.status}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Charts */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data?.revenueData || data?.financial?.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLease" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorRoyalties" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" label={{ value: 'Revenue ($M)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#D1D5DB' }}
                    formatter={(value: number) => `$${value.toFixed(1)}M`}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />
                  <Area type="monotone" dataKey="lease" stackId="1" stroke="#3B82F6" fillOpacity={1} fill="url(#colorLease)" name="Lease Revenue" />
                  <Area type="monotone" dataKey="royalty" stackId="1" stroke="#10B981" fillOpacity={1} fill="url(#colorRoyalties)" name="Royalties" />
                  <Area type="monotone" dataKey="production" stackId="1" stroke="#F59E0B" fillOpacity={1} fill="url(#colorProduction)" name="Production Fees" />
                  <Line type="monotone" dataKey="total" stroke="#D4AF37" strokeWidth={2} dot={false} name="Total Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Additional Financial Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue at Risk */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Revenue at Risk - Lease Expirations</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data?.revenueAtRisk || data?.financial?.revenueAtRisk} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" label={{ value: 'Revenue ($M)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#D1D5DB' }}
                      formatter={(value: number) => `$${value.toFixed(1)}M`}
                    />
                    <Legend />
                    <Bar dataKey="secured" stackId="a" fill="#10B981" name="Secured Revenue" />
                    <Bar dataKey="atRisk" stackId="a" fill="#EF4444" name="At Risk (Expiring)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Profitability by Field */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Profitability by Field</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data?.profitabilityByField || data?.financial?.profitabilityByField}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3B82F6" />
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                      <Cell fill="#EF4444" />
                      <Cell fill="#8B5CF6" />
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number, name: string, props: any) => [`$${props.payload.profit}M profit`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Original Lease Risk by Field Chart */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Lease Risk by Field</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.riskData || data?.orchestration?.riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="field" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Bar dataKey="atRisk" fill="#EF4444" name="At Risk" />
                  <Bar dataKey="leases" fill="#3B82F6" name="Total Leases" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      );
    }

    if (useCase.id.includes('drilling-risk-assessment')) {
      return (
        <>
          {/* Real-Time Alerts */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Real-Time Risk Alerts</span>
                <span className="text-sm text-red-500">Live Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.realTimeAlerts?.map((alert: any) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border ${
                      alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      alert.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <ExclamationTriangleIcon className={`w-5 h-5 ${
                            alert.severity === 'high' ? 'text-red-500' :
                            alert.severity === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <span className="font-semibold text-white">{alert.type}</span>
                          <span className="text-xs text-gray-500">• {alert.time}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-1">{alert.well}</p>
                        <p className="text-sm text-gray-300">{alert.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          <span className="font-medium">Action:</span> {alert.action}
                        </p>
                      </div>
                      <Badge
                        variant={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
                        size="small"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Wells Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Active Wells Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.activeWells?.map((well: any, index: number) => (
                    <div key={well.id}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => setSelectedLeaseStatus?.(selectedLeaseStatus === well.id ? null : well.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-white">{well.name}</span>
                              <Badge
                                variant={well.risk === 'high' ? 'error' : well.risk === 'medium' ? 'warning' : 'success'}
                                size="small"
                              >
                                {well.risk} risk
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Depth: {well.depth.toLocaleString()}ft • Status: {well.status}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-white">{well.progress}%</div>
                            <Progress value={well.progress} className="w-20 h-2" />
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Expandable Well Details */}
                      <AnimatePresence>
                        {selectedLeaseStatus === well.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 ml-4 p-3 bg-black/30 rounded-lg border border-white/5">
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <p className="text-gray-400">Current Operation</p>
                                  <p className="text-white font-medium capitalize">{well.status}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Risk Assessment</p>
                                  <p className={`font-medium ${
                                    well.risk === 'high' ? 'text-red-400' :
                                    well.risk === 'medium' ? 'text-yellow-400' :
                                    'text-green-400'
                                  }`}>{well.risk.toUpperCase()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Depth Progress</p>
                                  <p className="text-white font-medium">{well.depth.toLocaleString()} / 15,000 ft</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Est. Completion</p>
                                  <p className="text-white font-medium">
                                    {Math.ceil((100 - well.progress) / 5)} days
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors Analysis */}
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Risk Factor Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.riskFactors?.map((factor: any) => (
                    <div key={factor.factor} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{factor.factor}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            factor.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                            factor.impact === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            factor.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {factor.impact} impact
                          </span>
                          {factor.trend === 'increasing' ? (
                            <ArrowUpIcon className="w-4 h-4 text-red-400" />
                          ) : factor.trend === 'improving' ? (
                            <ArrowDownIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <MinusIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={factor.score} className="flex-1" />
                        <span className="text-sm font-medium text-white">{factor.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NPT Risk Trend */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>NPT Risk Trend & Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="highRisk" stackId="1" stroke="#EF4444" fill="#EF4444" name="High Risk" />
                    <Area yAxisId="left" type="monotone" dataKey="mediumRisk" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Medium Risk" />
                    <Area yAxisId="left" type="monotone" dataKey="lowRisk" stackId="1" stroke="#10B981" fill="#10B981" name="Low Risk" />
                    <Line yAxisId="right" type="monotone" dataKey="incidents" stroke="#8B5CF6" strokeWidth={2} name="Incidents" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Savings Analysis */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Cost Savings Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.costSavingsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="category" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number) => `$${value}M`}
                    />
                    <Legend />
                    <Bar dataKey="prevented" fill="#10B981" name="Prevented Costs" />
                    <Bar dataKey="actual" fill="#EF4444" name="Actual Costs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Drilling Parameters */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Real-Time Drilling Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.drillingParameters?.map((param: any) => (
                  <div key={param.param} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{param.param}</span>
                      <Badge
                        variant={param.status === 'good' ? 'success' : param.status === 'warning' ? 'warning' : 'error'}
                        size="small"
                      >
                        {param.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {param.current.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      Optimal: {param.optimal.toLocaleString()} {param.unit}
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            param.status === 'good' ? 'bg-green-500' :
                            param.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, (param.current / param.optimal) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Well Performance Chart */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Drilling Performance vs Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.wellPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" label={{ value: 'Depth (ft)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => `${value.toLocaleString()} ft`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="planned" stroke="#3B82F6" strokeWidth={2} name="Planned" />
                  <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" />
                  <Line type="monotone" dataKey="npt" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="NPT" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      );
    }

    if (useCase.id.includes('environmental-compliance')) {
      return (
        <>
          {/* Regulatory Alerts */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Critical Regulatory Updates</span>
                <Badge variant="warning" size="small">{data.regulatoryAlerts?.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.regulatoryAlerts?.slice(0, 2).map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.impact === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      alert.impact === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{alert.regulation}</h4>
                        <p className="text-xs text-gray-400 mt-1">{alert.description}</p>
                      </div>
                      <Badge
                        variant={alert.impact === 'high' ? 'error' : alert.impact === 'medium' ? 'warning' : 'info'}
                        size="small"
                      >
                        {alert.deadline}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emissions Tracking */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Emissions Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.emissionsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Line type="monotone" dataKey="methane" stroke="#F59E0B" name="Methane" />
                    <Line type="monotone" dataKey="co2" stroke="#3B82F6" name="CO2" />
                    <Line type="monotone" dataKey="nox" stroke="#10B981" name="NOx" />
                    <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compliance Score */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Compliance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.complianceByCategory?.map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{item.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs ${
                            item.violations === 0 ? 'text-green-400' :
                            item.violations <= 2 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {item.violations} violations
                          </span>
                          {item.trend === 'improving' ? (
                            <ArrowUpIcon className="w-3 h-3 text-green-400" />
                          ) : item.trend === 'declining' ? (
                            <ArrowDownIcon className="w-3 h-3 text-red-400" />
                          ) : (
                            <MinusIcon className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={item.score} className="flex-1" />
                        <span className="text-sm font-medium text-white">{item.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monitoring Points Status */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Monitoring Points Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {data.monitoringPoints?.map((point: any) => (
                  <div key={point.id} className="text-center p-3 bg-white/5 rounded-lg">
                    <SignalIcon className={`w-8 h-8 mx-auto mb-2 ${
                      point.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                    }`} />
                    <p className="text-xs font-medium text-white">{point.name}</p>
                    <p className="text-xs text-gray-400">{point.type}</p>
                    <p className="text-lg font-bold text-white mt-1">{point.compliance}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Environmental Incidents */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Recent Environmental Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.environmentalIncidents?.map((incident: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{incident.type}</p>
                      <p className="text-xs text-gray-400">{incident.location} • {incident.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {incident.cleaned && (
                        <Badge variant="success" size="small">Cleaned</Badge>
                      )}
                      {incident.reported && (
                        <Badge variant="info" size="small">Reported</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      );
    }

    if (useCase.id.includes('load-forecasting')) {
      return (
        <>
          {/* Forecast Alerts */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Critical Load Forecast Alerts</span>
                <Badge variant="warning" size="small">{data.forecastAlerts?.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.forecastAlerts?.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      alert.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{alert.type}</h4>
                        <p className="text-xs text-gray-400 mt-1">{alert.time} • Expected: {alert.expectedLoad} MW</p>
                      </div>
                      <Badge
                        variant={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
                        size="small"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Load Forecast Chart */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>24-Hour Load Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} name="Actual Load" />
                    <Line type="monotone" dataKey="forecast" stroke="#10B981" strokeWidth={2} name="AI Forecast" />
                    <Line type="monotone" dataKey="baseline" stroke="#6B7280" strokeDasharray="5 5" name="Baseline" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Grid Zones */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Grid Zone Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.gridZones?.slice(0, 4).map((zone: any) => (
                    <div key={zone.zone} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{zone.zone}</span>
                        <Badge
                          variant={zone.utilization > 90 ? 'error' : zone.utilization > 80 ? 'warning' : 'success'}
                          size="small"
                        >
                          {zone.utilization.toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={zone.utilization} className="h-2" />
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                        <span>{zone.currentLoad} MW</span>
                        <span>Cap: {zone.capacity} MW</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demand Response Programs */}
          <Card variant="glass-dark" effect="float">
            <CardHeader>
              <CardTitle>Active Demand Response Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.demandResponse?.map((program: any) => (
                  <div key={program.program} className="text-center p-3 bg-white/5 rounded-lg">
                    <BoltIcon className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <p className="text-xs font-medium text-white">{program.program}</p>
                    <p className="text-lg font-bold text-white mt-1">{program.potential}</p>
                    <p className="text-xs text-gray-400">{program.enrolled.toLocaleString()} enrolled</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Model Performance */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>AI Model Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.forecastModels?.slice(0, 3).map((model: any) => (
                  <div key={model.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{model.name}</span>
                      <Badge variant="success" size="small">{model.status}</Badge>
                    </div>
                    <div className="text-center py-3">
                      <div className="text-3xl font-bold text-white">{model.accuracy}%</div>
                      <p className="text-xs text-gray-400 mt-1">Accuracy</p>
                    </div>
                    <p className="text-xs text-gray-400 text-center">{model.horizon}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      );
    }

    if (useCase.id.includes('grid-anomaly')) {
      return (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Anomaly Detection Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.anomalyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke="#EF4444" fill="#EF4444" name="Critical" />
                    <Area type="monotone" dataKey="warning" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Warning" />
                    <Area type="monotone" dataKey="info" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Info" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Grid Component Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.gridHealthData?.map((item: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{item.component}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">{item.issues} issues</span>
                          <span className="text-sm font-medium text-white">{item.health}%</span>
                        </div>
                      </div>
                      <Progress value={item.health} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Recent Critical Anomalies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { location: 'Substation 42', type: 'Voltage Spike', severity: 'Critical', time: '2 hours ago', action: 'Investigate' },
                  { location: 'Transformer T-18', type: 'Temperature Warning', severity: 'Warning', time: '5 hours ago', action: 'Schedule Check' },
                  { location: 'Line Segment L-7', type: 'Load Imbalance', severity: 'Warning', time: '8 hours ago', action: 'Monitor' },
                ].map((anomaly, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{anomaly.location}</span>
                      <Badge variant={anomaly.severity === 'Critical' ? 'error' : 'warning'} size="small">
                        {anomaly.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{anomaly.type} • {anomaly.time}</span>
                      <Button size="small" variant="secondary">{anomaly.action}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      );
    }

    if (useCase.id.includes('renewable-optimization')) {
      return (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Renewable Energy Mix</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.renewableSourceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Area type="monotone" dataKey="solar" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Solar" />
                    <Area type="monotone" dataKey="wind" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Wind" />
                    <Area type="monotone" dataKey="hydro" stackId="1" stroke="#10B981" fill="#10B981" name="Hydro" />
                    <Area type="monotone" dataKey="battery" stroke="#8B5CF6" fill="#8B5CF6" name="Battery" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Optimization Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.optimizationMetrics?.map((item: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{item.metric}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">Target: {item.target}%</span>
                          <span className={`text-sm font-medium ${item.value >= item.target ? 'text-green-400' : 'text-yellow-400'}`}>
                            {item.value}%
                          </span>
                        </div>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Real-time Optimization Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'Battery Charging', status: 'Active', power: '250 MW', duration: '2.5 hours', savings: '$45K/hr' },
                  { action: 'Solar Curtailment', status: 'Scheduled', power: '80 MW', duration: '1 hour', savings: '$12K/hr' },
                  { action: 'Wind Farm Ramp', status: 'Pending', power: '150 MW', duration: '3 hours', savings: '$28K/hr' },
                ].map((action, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{action.action}</span>
                      <Badge
                        variant={action.status === 'Active' ? 'success' : action.status === 'Scheduled' ? 'warning' : 'info'}
                        size="small"
                      >
                        {action.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Power:</span>
                        <span className="text-white ml-1">{action.power}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white ml-1">{action.duration}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Savings:</span>
                        <span className="text-green-400 ml-1">{action.savings}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      );
    }
  }

  // Healthcare vertical charts
  if (vertical === 'healthcare') {
    if (useCase.id.includes('patient-risk')) {
      return (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="patients"
                    >
                      {data.riskDistribution?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#EF4444'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Intervention Success</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.interventionSuccess}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Area type="monotone" dataKey="prevented" fill="#10B981" stroke="#10B981" name="Prevented" />
                    <Area type="monotone" dataKey="occurred" fill="#EF4444" stroke="#EF4444" name="Occurred" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }
  }

  // Finance vertical charts
  if (vertical === 'finance') {
    if (useCase.id.includes('fraud-detection')) {
      return (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Fraud Detection Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.fraudTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Line type="monotone" dataKey="detected" stroke="#EF4444" name="Detected" />
                    <Line type="monotone" dataKey="prevented" stroke="#10B981" name="Prevented ($M)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Fraud by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.fraudByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {data.fraudByType?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }
  }

  // Default charts for other use cases
  return (
    <Card variant="glass" effect="glow">
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Custom visualizations for this use case coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Render analytics content based on the use case
const renderAnalyticsContent = (useCase: UseCase, data: any) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card variant="glass" effect="glow">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.metrics?.map((metric: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">{metric.name}</span>
                  <span className="text-sm font-medium text-white">
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <Progress value={75 + index * 5} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="glass" effect="glow">
        <CardHeader>
          <CardTitle>AI Model Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Model Accuracy</span>
              <span className="text-sm font-medium text-white">96.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Processing Speed</span>
              <span className="text-sm font-medium text-white">1.2ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Data Quality Score</span>
              <span className="text-sm font-medium text-white">98.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">System Uptime</span>
              <span className="text-sm font-medium text-white">99.99%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UseCaseDashboard;
                