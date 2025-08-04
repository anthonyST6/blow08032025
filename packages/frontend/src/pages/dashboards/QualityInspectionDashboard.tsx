import React from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  BarChart2,
  Activity,
  Camera,
  Zap,
  TrendingUp,
  AlertTriangle,
  Settings,
  Target,
  Award
} from 'lucide-react';
import DashboardTemplate, {
  DashboardConfig,
  ChartConfig,
  renderChart,
  CHART_COLORS
} from '../../components/dashboards/DashboardTemplate';
import { UseCase } from '../../config/verticals';
import { manufacturingDataGenerators } from '../../utils/dashboard-data-generators';
import { motion } from 'framer-motion';

interface QualityInspectionDashboardProps {
  useCase: UseCase;
}

const QualityInspectionDashboard: React.FC<QualityInspectionDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = manufacturingDataGenerators.qualityInspection();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Quality Inspection Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Camera className="h-5 w-5 text-blue-500 mr-2" />
          Automated Quality Inspection Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <Search className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.qualityMetrics.itemsInspected.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Items Inspected</p>
            <p className="text-xs text-blue-500 mt-1">Today's throughput</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.qualityMetrics.defectsDetected.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Defects Detected</p>
            <p className="text-xs text-red-500 mt-1">0.53% defect rate</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.qualityMetrics.accuracy}%</p>
            <p className="text-sm text-gray-500">Detection Accuracy</p>
            <p className="text-xs text-green-500 mt-1">↑ 0.2% improvement</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.qualityMetrics.avgInspectionTime}</p>
            <p className="text-sm text-gray-500">Avg Inspection Time</p>
            <p className="text-xs text-purple-500 mt-1">Per item</p>
          </div>
        </div>
      </motion.div>

      {/* Defect Types Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Defect Types Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'bar',
              title: 'Defects by Type',
              data: data.defectTypes,
              dataKeys: ['type', 'count'],
              colors: [CHART_COLORS[0]],
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Defect Details</h4>
            <div className="space-y-3">
              {data.defectTypes.map((defect, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  defect.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20' :
                  defect.severity === 'major' ? 'bg-orange-50 dark:bg-orange-900/20' :
                  'bg-yellow-50 dark:bg-yellow-900/20'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{defect.type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      defect.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      defect.severity === 'major' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {defect.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{defect.count} occurrences</span>
                    <span>{((defect.count / data.qualityMetrics.defectsDetected) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quality Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">90-Day Quality Trends</h3>
        {renderChart({
          type: 'line',
          title: 'Quality Rate Over Time',
          data: data.qualityTrends,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[1]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Performance Tab
  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Line Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="h-5 w-5 text-green-500 mr-2" />
          Production Line Performance
        </h3>
        <div className="space-y-4">
          {data.linePerformance.map((line, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{line.line}</p>
                  <p className="text-sm text-gray-500">
                    Throughput: {line.throughput} items/min
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{line.quality}%</p>
                  <p className="text-xs text-gray-500">Quality Rate</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Efficiency</span>
                  <p className="font-medium">{line.efficiency}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Throughput</span>
                  <p className="font-medium">{line.throughput}/min</p>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <p className="font-medium text-green-600">Active</p>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${line.quality}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Inspection Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Inspection Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Target className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{data.qualityMetrics.throughput}</p>
            <p className="text-sm text-gray-500">Items/minute</p>
            <p className="text-xs text-blue-500 mt-1">Peak throughput</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{data.qualityMetrics.falsePositives}</p>
            <p className="text-sm text-gray-500">False Positives</p>
            <p className="text-xs text-yellow-500 mt-1">↓ 35% reduction</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Award className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-2xl font-bold">99.47%</p>
            <p className="text-sm text-gray-500">First Pass Yield</p>
            <p className="text-xs text-green-500 mt-1">Industry leading</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Settings className="h-6 w-6 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-sm text-gray-500">Operation Time</p>
            <p className="text-xs text-purple-500 mt-1">Continuous inspection</p>
          </div>
        </div>
      </motion.div>

      {/* Performance Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">AI vs Manual Inspection Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'radar',
              title: 'Performance Metrics',
              data: [
                { subject: 'Speed', AI: 95, Manual: 25 },
                { subject: 'Accuracy', AI: 99.7, Manual: 85 },
                { subject: 'Consistency', AI: 100, Manual: 70 },
                { subject: 'Cost Efficiency', AI: 85, Manual: 40 },
                { subject: 'Coverage', AI: 100, Manual: 60 }
              ],
              dataKeys: ['AI', 'Manual'],
              colors: [CHART_COLORS[0], CHART_COLORS[1]],
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Key Benefits</h4>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Inspection Speed</span>
                  <Zap className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">15x Faster</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Than manual inspection
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Defect Detection</span>
                  <Search className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">99.7%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Detection accuracy
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Cost Reduction</span>
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">68%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Lower inspection costs
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Analytics Tab
  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Defect Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart2 className="h-5 w-5 text-red-500 mr-2" />
          Defect Pattern Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Defect Distribution by Hour</h4>
            {renderChart({
              type: 'area',
              title: 'Hourly Defect Rate',
              data: Array.from({ length: 24 }, (_, i) => ({
                hour: `${i}:00`,
                defects: Math.floor(Math.random() * 20) + 30 + (i >= 14 && i <= 16 ? 20 : 0)
              })),
              dataKeys: ['hour', 'defects'],
              colors: [CHART_COLORS[3]],
              height: 250
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Root Cause Analysis</h4>
            <div className="space-y-3">
              {[
                { cause: 'Material Variation', percentage: 35, trend: 'up' },
                { cause: 'Machine Calibration', percentage: 28, trend: 'stable' },
                { cause: 'Environmental Factors', percentage: 20, trend: 'down' },
                { cause: 'Human Error', percentage: 12, trend: 'down' },
                { cause: 'Unknown', percentage: 5, trend: 'stable' }
              ].map((cause, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{cause.cause}</span>
                    <span className={`text-sm ${
                      cause.trend === 'up' ? 'text-red-500' :
                      cause.trend === 'down' ? 'text-green-500' :
                      'text-gray-500'
                    }`}>
                      {cause.trend === 'up' ? '↑' : cause.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-3">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${cause.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{cause.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quality Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Quality Predictions & Insights</h3>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Predicted Quality Degradation</h4>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Line 2 showing signs of calibration drift. Quality may drop below 99.5% in next 48 hours.
            </p>
            <button className="text-sm font-medium text-yellow-600 hover:text-yellow-700">
              Schedule Calibration →
            </button>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Material Quality Alert</h4>
              <Camera className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Batch #A2847 showing 15% higher defect rate. Recommend supplier quality check.
            </p>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View Batch Analysis →
            </button>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Process Optimization Opportunity</h4>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Adjusting inspection parameters could reduce false positives by 40% without impacting accuracy.
            </p>
            <button className="text-sm font-medium text-green-600 hover:text-green-700">
              Apply Optimization →
            </button>
          </div>
        </div>
      </motion.div>

      {/* ROI Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Return on Investment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">$1.8M</p>
            <p className="text-sm text-gray-500">Annual Savings</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">8 months</p>
            <p className="text-sm text-gray-500">Payback Period</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">312%</p>
            <p className="text-sm text-gray-500">3-Year ROI</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Automated Quality Inspection',
    description: 'AI-powered visual inspection and quality control system',
    kpis: [
      {
        title: 'Items Inspected',
        value: data.qualityMetrics.itemsInspected.toLocaleString(),
        change: 12.5,
        icon: Search,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Defects Detected',
        value: data.qualityMetrics.defectsDetected.toLocaleString(),
        change: -8.3,
        icon: XCircle,
        color: 'red',
        trend: 'down'
      },
      {
        title: 'Accuracy',
        value: `${data.qualityMetrics.accuracy}%`,
        change: 0.2,
        icon: CheckCircle,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Throughput',
        value: `${data.qualityMetrics.throughput}/min`,
        change: 5.7,
        icon: Zap,
        color: 'purple',
        trend: 'up'
      }
    ],
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        icon: BarChart2,
        content: renderOverviewTab
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: Activity,
        content: renderPerformanceTab
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: TrendingUp,
        content: renderAnalyticsTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default QualityInspectionDashboard;