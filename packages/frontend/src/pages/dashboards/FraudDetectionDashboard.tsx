import React from 'react';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Globe,
  Activity,
  BarChart2,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  CreditCard,
  Users
} from 'lucide-react';
import DashboardTemplate, {
  DashboardConfig,
  ChartConfig,
  renderChart,
  CHART_COLORS
} from '../../components/dashboards/DashboardTemplate';
import { UseCase } from '../../config/verticals';
import { financeDataGenerators } from '../../utils/dashboard-data-generators';
import { motion } from 'framer-motion';

interface FraudDetectionDashboardProps {
  useCase: UseCase;
}

const FraudDetectionDashboard: React.FC<FraudDetectionDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = financeDataGenerators.fraudDetection();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Fraud Detection Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 text-blue-500 mr-2" />
          Real-time Fraud Detection Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.fraudMetrics.detectedToday}</p>
            <p className="text-sm text-gray-500">Frauds Detected Today</p>
            <p className="text-xs text-red-500 mt-1">↑ 12% from yesterday</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">${data.fraudMetrics.preventedAmount}M</p>
            <p className="text-sm text-gray-500">Amount Prevented</p>
            <p className="text-xs text-green-500 mt-1">Saved today</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.fraudMetrics.accuracy}%</p>
            <p className="text-sm text-gray-500">Detection Accuracy</p>
            <p className="text-xs text-blue-500 mt-1">↑ 2.3% improvement</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.fraudMetrics.avgDetectionTime}</p>
            <p className="text-sm text-gray-500">Avg Detection Time</p>
            <p className="text-xs text-purple-500 mt-1">Real-time analysis</p>
          </div>
        </div>
      </motion.div>

      {/* Fraud Types Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Fraud Types Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'bar',
              title: 'Fraud by Type',
              data: data.fraudTypes,
              dataKeys: ['type', 'count'],
              colors: [CHART_COLORS[0]],
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Type Details</h4>
            <div className="space-y-3">
              {data.fraudTypes.map((type, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{type.type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      type.trend === 'up' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      type.trend === 'down' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {type.trend === 'up' ? '↑' : type.trend === 'down' ? '↓' : '→'} Trend
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{type.count} incidents</span>
                    <span>${type.amount}M loss prevented</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detection Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">30-Day Detection Trends</h3>
        {renderChart({
          type: 'area',
          title: 'Daily Fraud Detections',
          data: data.detectionTrends,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[0]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Risk Analysis Tab
  const renderRiskTab = () => (
    <div className="space-y-6">
      {/* Risk Score Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Risk Score Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'bar',
              title: 'Transaction Risk Scores',
              data: data.riskScoreDistribution,
              dataKeys: ['score', 'count'],
              colors: [CHART_COLORS[2]],
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Risk Categories</h4>
            <div className="space-y-3">
              {data.riskScoreDistribution.map((category, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  category.label === 'Critical' ? 'bg-red-50 dark:bg-red-900/20' :
                  category.label === 'High' ? 'bg-orange-50 dark:bg-orange-900/20' :
                  category.label === 'Medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  category.label === 'Low' ? 'bg-blue-50 dark:bg-blue-900/20' :
                  'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{category.label} Risk</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Score: {category.score}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{category.count.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">transactions</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Geographic Risk Hotspots */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="h-5 w-5 text-red-500 mr-2" />
          Geographic Risk Hotspots
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.geographicHotspots.map((location, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              location.risk === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              location.risk === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-green-50 dark:bg-green-900/20 border-green-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{location.location}</h4>
                <MapPin className={`h-4 w-4 ${
                  location.risk === 'high' ? 'text-red-500' :
                  location.risk === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`} />
              </div>
              <p className="text-2xl font-bold mb-1">{location.incidents}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                fraud incidents
              </p>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className={`text-xs font-medium ${
                  location.risk === 'high' ? 'text-red-600 dark:text-red-400' :
                  location.risk === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {location.risk.toUpperCase()} RISK ZONE
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Real-time Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Real-time Fraud Alerts</h3>
        <div className="space-y-3">
          {[
            { severity: 'critical', type: 'Account Takeover', amount: '$45,000', time: '2 min ago', status: 'blocked' },
            { severity: 'high', type: 'Card Not Present', amount: '$8,500', time: '5 min ago', status: 'investigating' },
            { severity: 'medium', type: 'Unusual Pattern', amount: '$3,200', time: '12 min ago', status: 'flagged' },
            { severity: 'high', type: 'Synthetic Identity', amount: '$12,000', time: '18 min ago', status: 'blocked' },
            { severity: 'low', type: 'First Party', amount: '$1,500', time: '25 min ago', status: 'monitoring' }
          ].map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              alert.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
              alert.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`h-5 w-5 ${
                    alert.severity === 'critical' ? 'text-red-500' :
                    alert.severity === 'high' ? 'text-orange-500' :
                    alert.severity === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium">{alert.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.amount} • {alert.time}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  alert.status === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  alert.status === 'investigating' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  alert.status === 'flagged' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {alert.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Performance Tab
  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Model Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Model Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="text-xs text-green-500">↑ 2.3%</span>
            </div>
            <p className="text-2xl font-bold">{data.fraudMetrics.accuracy}%</p>
            <p className="text-sm text-gray-500">Accuracy Rate</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-6 w-6 text-yellow-500" />
              <span className="text-xs text-yellow-500">↓ 5.1%</span>
            </div>
            <p className="text-2xl font-bold">{data.fraudMetrics.falsePositiveRate}%</p>
            <p className="text-sm text-gray-500">False Positive Rate</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-6 w-6 text-blue-500" />
              <span className="text-xs text-blue-500">Stable</span>
            </div>
            <p className="text-2xl font-bold">{data.fraudMetrics.coverage}%</p>
            <p className="text-sm text-gray-500">Transaction Coverage</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-6 w-6 text-purple-500" />
              <span className="text-xs text-purple-500">↓ 12ms</span>
            </div>
            <p className="text-2xl font-bold">{data.fraudMetrics.avgDetectionTime}</p>
            <p className="text-sm text-gray-500">Response Time</p>
          </div>
        </div>
      </motion.div>

      {/* Fraud Prevention Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Fraud Prevention Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Monthly Prevention Trend</h4>
            {renderChart({
              type: 'line',
              title: 'Amount Prevented ($M)',
              data: data.detectionTrends.map(item => ({
                ...item,
                prevented: (item.value * 0.018).toFixed(1)
              })),
              dataKeys: ['date', 'prevented'],
              colors: [CHART_COLORS[1]],
              height: 250
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Impact Summary</h4>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total Prevented (YTD)</span>
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">$28.4M</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Across 1,523 prevented incidents
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Customer Trust Score</span>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">94.2%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  ↑ 8.5% since implementation
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">ROI</span>
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">412%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Return on investment
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">System Health & Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">API Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uptime</span>
                <span className="font-medium">99.98%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Latency</span>
                <span className="font-medium">87ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Requests/sec</span>
                <span className="font-medium">12,450</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">Model Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Version</span>
                <span className="font-medium">v3.2.1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Updated</span>
                <span className="font-medium">2 days ago</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Next Training</span>
                <span className="font-medium">In 5 days</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">Data Pipeline</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing Rate</span>
                <span className="font-medium">45K/min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Queue Depth</span>
                <span className="font-medium">234</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Error Rate</span>
                <span className="font-medium">0.02%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Real-time Fraud Detection',
    description: 'AI-powered fraud detection and prevention system',
    kpis: [
      {
        title: 'Frauds Detected',
        value: data.fraudMetrics.detectedToday.toString(),
        change: 12.0,
        icon: AlertTriangle,
        color: 'red',
        trend: 'up'
      },
      {
        title: 'Amount Prevented',
        value: `$${data.fraudMetrics.preventedAmount}M`,
        change: 23.5,
        icon: Shield,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Detection Accuracy',
        value: `${data.fraudMetrics.accuracy}%`,
        change: 2.3,
        icon: Activity,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'False Positive Rate',
        value: `${data.fraudMetrics.falsePositiveRate}%`,
        change: -5.1,
        icon: XCircle,
        color: 'yellow',
        trend: 'down'
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
        id: 'risk',
        label: 'Risk Analysis',
        icon: AlertTriangle,
        content: renderRiskTab
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: Activity,
        content: renderPerformanceTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default FraudDetectionDashboard;