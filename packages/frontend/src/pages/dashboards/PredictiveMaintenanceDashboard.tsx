import React from 'react';
import {
  Wrench,
  AlertTriangle,
  TrendingDown,
  Clock,
  Activity,
  BarChart2,
  Shield,
  DollarSign,
  CheckCircle,
  Settings,
  Zap,
  Calendar
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

interface PredictiveMaintenanceDashboardProps {
  useCase: UseCase;
}

const PredictiveMaintenanceDashboard: React.FC<PredictiveMaintenanceDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = manufacturingDataGenerators.predictiveMaintenance();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Maintenance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Wrench className="h-5 w-5 text-blue-500 mr-2" />
          Predictive Maintenance Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <Settings className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.maintenanceMetrics.equipmentMonitored}</p>
            <p className="text-sm text-gray-500">Equipment Monitored</p>
            <p className="text-xs text-blue-500 mt-1">Across all facilities</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.maintenanceMetrics.predictedFailures}</p>
            <p className="text-sm text-gray-500">Predicted Failures</p>
            <p className="text-xs text-orange-500 mt-1">Next 30 days</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.maintenanceMetrics.preventedDowntime}</p>
            <p className="text-sm text-gray-500">Prevented Downtime</p>
            <p className="text-xs text-green-500 mt-1">This month</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <DollarSign className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">${data.maintenanceMetrics.costSavings}M</p>
            <p className="text-sm text-gray-500">Cost Savings</p>
            <p className="text-xs text-purple-500 mt-1">Year to date</p>
          </div>
        </div>
      </motion.div>

      {/* Equipment Health Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Equipment Health Status</h3>
        <div className="space-y-4">
          {data.equipmentHealth.map((equipment, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{equipment.equipment}</p>
                  <p className="text-sm text-gray-500">
                    Next maintenance: {equipment.nextMaintenance}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{equipment.health}%</p>
                  <p className="text-xs text-gray-500">Health Score</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  equipment.risk === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  equipment.risk === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {equipment.risk.toUpperCase()} RISK
                </span>
                <Activity className={`h-4 w-4 ${
                  equipment.health >= 90 ? 'text-green-500' :
                  equipment.health >= 70 ? 'text-yellow-500' :
                  'text-red-500'
                }`} />
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    equipment.health >= 90 ? 'bg-green-500' :
                    equipment.health >= 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${equipment.health}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Failure Predictions Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">30-Day Failure Prediction Trend</h3>
        {renderChart({
          type: 'area',
          title: 'Predicted Failures',
          data: data.failurePredictions,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[0]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Performance Tab
  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="h-5 w-5 text-green-500 mr-2" />
          Maintenance Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{data.maintenanceMetrics.accuracy}%</p>
            <p className="text-sm text-gray-500">Prediction Accuracy</p>
            <p className="text-xs text-green-500 mt-1">↑ 3.2% improvement</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Zap className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{data.maintenanceMetrics.mtbf}</p>
            <p className="text-sm text-gray-500">MTBF (hours)</p>
            <p className="text-xs text-blue-500 mt-1">Mean time between failures</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <TrendingDown className="h-6 w-6 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{data.downtimeAnalysis.unplanned}</p>
            <p className="text-sm text-gray-500">Unplanned Downtime (hrs)</p>
            <p className="text-xs text-purple-500 mt-1">↓ 65% reduction</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Shield className="h-6 w-6 text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{data.downtimeAnalysis.prevented}</p>
            <p className="text-sm text-gray-500">Prevented Failures</p>
            <p className="text-xs text-orange-500 mt-1">This quarter</p>
          </div>
        </div>
      </motion.div>

      {/* Maintenance Cost Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Maintenance Cost Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'line',
              title: '6-Month Cost Trend',
              data: data.maintenanceCosts,
              dataKeys: ['date', 'value'],
              colors: [CHART_COLORS[1]],
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Cost Breakdown</h4>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Prevented Costs</span>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">$4.8M</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  From avoided failures
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Maintenance Spend</span>
                  <Wrench className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">$2.5M</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Predictive maintenance costs
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Net Savings</span>
                  <TrendingDown className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">$2.3M</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Total cost reduction
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Downtime Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Downtime Analysis</h3>
        {renderChart({
          type: 'bar',
          title: 'Downtime Hours by Type',
          data: [
            { type: 'Planned', hours: data.downtimeAnalysis.planned },
            { type: 'Unplanned', hours: data.downtimeAnalysis.unplanned },
            { type: 'Prevented', hours: data.downtimeAnalysis.prevented }
          ],
          dataKeys: ['type', 'hours'],
          colors: [CHART_COLORS[2]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Alerts Tab
  const renderAlertsTab = () => (
    <div className="space-y-6">
      {/* Critical Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          Critical Maintenance Alerts
        </h3>
        <div className="space-y-3">
          {data.equipmentHealth
            .filter(eq => eq.risk === 'high' || eq.health < 70)
            .map((equipment, index) => (
              <div key={index} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{equipment.equipment}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Health: {equipment.health}% • Maintenance: {equipment.nextMaintenance}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      URGENT
                    </span>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </motion.div>

      {/* Upcoming Maintenance Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          Upcoming Maintenance Schedule
        </h3>
        <div className="space-y-3">
          {data.equipmentHealth
            .sort((a, b) => {
              const getDays = (str: string) => {
                if (str === 'Today') return 0;
                const match = str.match(/(\d+) days?/);
                return match ? parseInt(match[1]) : 999;
              };
              return getDays(a.nextMaintenance) - getDays(b.nextMaintenance);
            })
            .map((equipment, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                equipment.nextMaintenance === 'Today' ? 'bg-red-50 dark:bg-red-900/20' :
                equipment.nextMaintenance.includes('2 days') ? 'bg-orange-50 dark:bg-orange-900/20' :
                'bg-gray-50 dark:bg-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{equipment.equipment}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current Health: {equipment.health}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{equipment.nextMaintenance}</p>
                    <p className="text-xs text-gray-500">Scheduled</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </motion.div>

      {/* Maintenance Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">AI-Powered Recommendations</h3>
        <div className="space-y-3">
          {[
            { action: 'Replace bearings on CNC Machine 1', impact: 'Prevent 48hr downtime', confidence: 92 },
            { action: 'Adjust calibration on Quality Scanner', impact: 'Improve accuracy by 3%', confidence: 87 },
            { action: 'Schedule oil change for Assembly Line A', impact: 'Extend life by 6 months', confidence: 95 },
            { action: 'Inspect conveyor belt tension', impact: 'Reduce wear by 25%', confidence: 78 }
          ].map((rec, index) => (
            <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{rec.action}</p>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {rec.confidence}% confidence
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expected impact: {rec.impact}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Predictive Maintenance',
    description: 'AI-powered equipment maintenance prediction and optimization',
    kpis: [
      {
        title: 'Equipment Monitored',
        value: data.maintenanceMetrics.equipmentMonitored.toString(),
        change: 5.2,
        icon: Settings,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Predicted Failures',
        value: data.maintenanceMetrics.predictedFailures.toString(),
        change: -15.3,
        icon: AlertTriangle,
        color: 'orange',
        trend: 'down'
      },
      {
        title: 'Prevented Downtime',
        value: data.maintenanceMetrics.preventedDowntime,
        change: 23.5,
        icon: Clock,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Cost Savings',
        value: `$${data.maintenanceMetrics.costSavings}M`,
        change: 18.7,
        icon: DollarSign,
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
        id: 'alerts',
        label: 'Alerts & Schedule',
        icon: AlertTriangle,
        content: renderAlertsTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default PredictiveMaintenanceDashboard;
