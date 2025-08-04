import React from 'react';
import {
  Zap,
  AlertTriangle,
  Activity,
  Shield,
  Clock,
  TrendingUp,
  BarChart2,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Cpu,
  Gauge,
  Bell
} from 'lucide-react';
import DashboardTemplate, {
  DashboardConfig,
  ChartConfig,
  renderChart,
  CHART_COLORS
} from '../../components/dashboards/DashboardTemplate';
import { UseCase } from '../../config/verticals';
import { energyDataGenerators } from '../../utils/dashboard-data-generators';
import { motion } from 'framer-motion';

interface GridAnomalyDashboardProps {
  useCase: UseCase;
}

const GridAnomalyDashboard: React.FC<GridAnomalyDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = energyDataGenerators.gridAnomaly();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Real-time Anomaly Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
          Real-time Anomaly Detection Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Active Anomalies</span>
              <Bell className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-500">{data.anomalyMetrics.detectedToday}</p>
            <p className="text-sm mt-2">Requiring attention</p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Prevented Failures</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-500">{data.anomalyMetrics.preventedFailures}</p>
            <p className="text-sm mt-2">In last 24 hours</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">System Coverage</span>
              <Cpu className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-500">{data.anomalyMetrics.systemsCovered}</p>
            <p className="text-sm mt-2">Grid components monitored</p>
          </div>
        </div>
      </motion.div>

      {/* Anomaly Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Anomaly Types Distribution</h3>
          {renderChart({
            type: 'bar',
            title: 'Anomaly Types',
            data: data.anomalyTypes,
            dataKeys: ['type', 'count'],
            colors: ['#EF4444'],
            height: 300
          }, isDarkMode)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Detection Trends (30 Days)</h3>
          {renderChart({
            type: 'line',
            title: 'Daily Anomalies',
            data: data.detectionTrends,
            dataKeys: ['date', 'value'],
            colors: ['#F59E0B'],
            height: 300
          }, isDarkMode)}
        </motion.div>
      </div>

      {/* Grid Health Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Grid Health Status (24 Hours)</h3>
        {renderChart({
          type: 'area',
          title: 'Grid Health %',
          data: data.gridHealth,
          dataKeys: ['date', 'value'],
          colors: ['#10B981'],
          height: 250
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Detection Analysis Tab
  const renderDetectionTab = () => (
    <div className="space-y-6">
      {/* Anomaly Severity Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Anomaly Severity Analysis</h3>
        <div className="space-y-4">
          {data.anomalyTypes.map((anomaly, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  anomaly.severity === 'critical' ? 'bg-red-500/20' :
                  anomaly.severity === 'high' ? 'bg-orange-500/20' :
                  anomaly.severity === 'medium' ? 'bg-yellow-500/20' :
                  'bg-blue-500/20'
                }`}>
                  <Zap className={`h-5 w-5 ${
                    anomaly.severity === 'critical' ? 'text-red-500' :
                    anomaly.severity === 'high' ? 'text-orange-500' :
                    anomaly.severity === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                </div>
                <div>
                  <p className="font-medium">{anomaly.type}</p>
                  <p className="text-sm text-gray-500">Detected: {anomaly.count} times</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  anomaly.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  anomaly.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {anomaly.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Detection Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Detection Accuracy</h4>
            <Gauge className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-500">{data.anomalyMetrics.accuracyRate}%</p>
            <p className="text-sm text-gray-500 mt-2">Industry leading accuracy</p>
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${data.anomalyMetrics.accuracyRate}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Avg Detection Time</h4>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-500">{data.anomalyMetrics.avgDetectionTime}</p>
            <p className="text-sm text-gray-500 mt-2">Before failure occurs</p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">False Positive Rate</h4>
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-red-500">{data.anomalyMetrics.falsePositives}</p>
            <p className="text-sm text-gray-500 mt-2">In last 24 hours</p>
            <p className="text-xs text-green-500 mt-4">↓ 15% from last week</p>
          </div>
        </motion.div>
      </div>

      {/* Prevented Outages Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Prevented Outages (90 Days)</h3>
        {renderChart({
          type: 'area',
          title: 'Outages Prevented',
          data: data.preventedOutages,
          dataKeys: ['date', 'value'],
          colors: ['#10B981'],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Regional Analysis Tab
  const renderRegionalTab = () => (
    <div className="space-y-6">
      {/* Regional Anomaly Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Regional Anomaly Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.regionalAnomalies.map((region, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MapPin className={`h-5 w-5 ${
                    region.risk > 60 ? 'text-red-500' :
                    region.risk > 40 ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                  <h4 className="font-medium">{region.region}</h4>
                </div>
                <span className={`text-sm font-medium ${
                  region.risk > 60 ? 'text-red-500' :
                  region.risk > 40 ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  Risk: {region.risk}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Anomalies</span>
                  <span className="font-medium">{region.anomalies}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Avg Response</span>
                  <span className="font-medium">{region.response}</span>
                </div>
                <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      region.risk > 60 ? 'bg-red-500' :
                      region.risk > 40 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${region.risk}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Regional Performance Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Regional Performance Comparison</h3>
        {renderChart({
          type: 'radar',
          title: 'Regional Metrics',
          data: data.regionalAnomalies.map(r => ({
            region: r.region,
            anomalies: r.anomalies,
            risk: r.risk,
            responseTime: parseFloat(r.response)
          })),
          dataKeys: ['region', 'anomalies', 'risk'],
          colors: ['#3B82F6', '#EF4444'],
          height: 400,
          showLegend: true
        }, isDarkMode)}
      </motion.div>

      {/* Critical Infrastructure Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Critical Infrastructure Status</h3>
        <div className="space-y-3">
          {[
            { name: 'Transmission Lines', status: 'operational', health: 94, alerts: 2 },
            { name: 'Substations', status: 'warning', health: 87, alerts: 5 },
            { name: 'Generation Units', status: 'operational', health: 91, alerts: 1 },
            { name: 'Distribution Networks', status: 'operational', health: 96, alerts: 0 },
            { name: 'Control Systems', status: 'critical', health: 78, alerts: 8 }
          ].map((infra, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  infra.status === 'operational' ? 'bg-green-500' :
                  infra.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                <div>
                  <p className="font-medium">{infra.name}</p>
                  <p className="text-sm text-gray-500">Health: {infra.health}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  infra.status === 'operational' ? 'text-green-500' :
                  infra.status === 'warning' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {infra.status.toUpperCase()}
                </p>
                {infra.alerts > 0 && (
                  <p className="text-xs text-gray-500">{infra.alerts} active alerts</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Response & Mitigation Tab
  const renderResponseTab = () => (
    <div className="space-y-6">
      {/* Active Response Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Active Response Actions</h3>
        <div className="space-y-3">
          {[
            { 
              action: 'Voltage Regulation Adjustment', 
              status: 'in-progress', 
              impact: 'High',
              eta: '15 min',
              description: 'Adjusting transformer taps to stabilize voltage levels'
            },
            { 
              action: 'Load Redistribution', 
              status: 'completed', 
              impact: 'Medium',
              eta: 'Completed',
              description: 'Successfully redistributed 45MW to adjacent feeders'
            },
            { 
              action: 'Capacitor Bank Switching', 
              status: 'pending', 
              impact: 'Low',
              eta: '30 min',
              description: 'Scheduled reactive power compensation'
            },
            { 
              action: 'Emergency Generator Dispatch', 
              status: 'in-progress', 
              impact: 'Critical',
              eta: '5 min',
              description: 'Bringing online 100MW of emergency generation'
            }
          ].map((action, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium">{action.action}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      action.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      action.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {action.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      action.impact === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      action.impact === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      action.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {action.impact} Impact
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium">{action.eta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mitigation Effectiveness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Mitigation Success Rate</h3>
          <div className="space-y-4">
            {[
              { method: 'Automated Response', success: 94, count: 156 },
              { method: 'Manual Intervention', success: 87, count: 43 },
              { method: 'Predictive Prevention', success: 91, count: 89 },
              { method: 'Emergency Protocol', success: 98, count: 12 }
            ].map((method, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{method.method}</span>
                  <span className="text-gray-500">{method.count} actions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${method.success}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12">{method.success}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Response Time Analysis</h3>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Average Response Time</p>
              <p className="text-4xl font-bold text-blue-500">3.2 min</p>
              <p className="text-sm text-green-500 mt-2">↓ 42% improvement</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-green-500">&lt; 1 min</p>
                <p className="text-xs text-gray-500">Critical responses</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-yellow-500">&lt; 5 min</p>
                <p className="text-xs text-gray-500">Standard responses</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">AI-Generated Recommendations</h3>
        <div className="space-y-3">
          {[
            {
              priority: 'high',
              recommendation: 'Increase monitoring frequency for Substation 23A',
              reason: 'Detected pattern indicates potential transformer failure within 72 hours',
              confidence: 89
            },
            {
              priority: 'medium',
              recommendation: 'Schedule maintenance for Distribution Feeder 7',
              reason: 'Harmonic distortion levels approaching threshold limits',
              confidence: 76
            },
            {
              priority: 'low',
              recommendation: 'Update protection relay settings in Zone 4',
              reason: 'Optimize for recent load pattern changes',
              confidence: 82
            }
          ].map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              rec.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              rec.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium mb-1">{rec.recommendation}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rec.reason}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium">Confidence</p>
                  <p className="text-lg font-bold">{rec.confidence}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Grid Anomaly Detection System',
    description: 'Real-time monitoring and prevention of grid failures using AI-powered anomaly detection',
    kpis: [
      {
        title: 'Anomalies Detected',
        value: data.anomalyMetrics.detectedToday,
        change: -15.2,
        icon: AlertTriangle,
        color: 'yellow',
        trend: 'down'
      },
      {
        title: 'Failures Prevented',
        value: data.anomalyMetrics.preventedFailures,
        change: 23.5,
        icon: Shield,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Detection Accuracy',
        value: `${data.anomalyMetrics.accuracyRate}%`,
        change: 2.1,
        icon: Activity,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Avg Detection Time',
        value: data.anomalyMetrics.avgDetectionTime,
        change: -18.7,
        icon: Clock,
        color: 'purple',
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
        id: 'detection',
        label: 'Detection Analysis',
        icon: Activity,
        content: renderDetectionTab
      },
      {
        id: 'regional',
        label: 'Regional Analysis',
        icon: MapPin,
        content: renderRegionalTab
      },
      {
        id: 'response',
        label: 'Response & Mitigation',
        icon: Shield,
        content: renderResponseTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default GridAnomalyDashboard;