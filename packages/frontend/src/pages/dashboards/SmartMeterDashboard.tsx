import React from 'react';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  DollarSign,
  BarChart2,
  Users,
  AlertCircle,
  Battery,
  Gauge,
  Home,
  Building,
  Factory,
  Wifi,
  WifiOff
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

interface SmartMeterDashboardProps {
  useCase: UseCase;
}

const SmartMeterDashboard: React.FC<SmartMeterDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = energyDataGenerators.smartMeter();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Real-time Meter Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Gauge className="h-5 w-5 text-blue-500 mr-2" />
          Smart Meter Network Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Active Meters</span>
              <Wifi className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-500">{data.meterMetrics.activeMeters.toLocaleString()}</p>
            <p className="text-sm mt-2">Online & reporting</p>
          </div>
          <div className="p-4 bg-yellow-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Offline Meters</span>
              <WifiOff className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-500">{data.meterMetrics.offlineMeters}</p>
            <p className="text-sm mt-2">Require attention</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Data Collection Rate</span>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-500">{data.meterMetrics.dataCollectionRate}%</p>
            <p className="text-sm mt-2">Success rate</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Avg Read Time</span>
              <Clock className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-500">{data.meterMetrics.avgReadTime}</p>
            <p className="text-sm mt-2">Per meter</p>
          </div>
        </div>
      </motion.div>

      {/* Consumption Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Daily Consumption Pattern</h3>
          {renderChart({
            type: 'area',
            title: 'Hourly Usage (MWh)',
            data: data.consumptionPatterns,
            dataKeys: ['hour', 'consumption'],
            colors: ['#3B82F6'],
            height: 300
          }, isDarkMode)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Customer Segment Distribution</h3>
          {renderChart({
            type: 'pie',
            title: 'Usage by Segment',
            data: data.customerSegments,
            dataKeys: ['segment', 'value'],
            colors: CHART_COLORS,
            height: 300
          }, isDarkMode)}
        </motion.div>
      </div>

      {/* Key Metrics Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Monthly Performance Trends</h3>
        {renderChart({
          type: 'line',
          title: 'Key Metrics',
          data: data.monthlyTrends,
          dataKeys: ['month', 'revenue', 'consumption', 'efficiency'],
          colors: ['#10B981', '#3B82F6', '#F59E0B'],
          height: 300,
          showLegend: true
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Consumption Analytics Tab
  const renderConsumptionTab = () => (
    <div className="space-y-6">
      {/* Detailed Consumption Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Consumption Analysis by Customer Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { type: 'Residential', icon: Home, usage: '45,230 MWh', change: 3.2, color: 'blue' },
            { type: 'Commercial', icon: Building, usage: '78,450 MWh', change: -1.5, color: 'green' },
            { type: 'Industrial', icon: Factory, usage: '125,670 MWh', change: 5.8, color: 'purple' }
          ].map((segment, index) => (
            <div key={index} className={`p-4 bg-${segment.color}-500/10 rounded-lg`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <segment.icon className={`h-5 w-5 text-${segment.color}-500`} />
                  <h4 className="font-medium">{segment.type}</h4>
                </div>
                <span className={`text-sm font-medium ${
                  segment.change > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {segment.change > 0 ? '+' : ''}{segment.change}%
                </span>
              </div>
              <p className="text-2xl font-bold">{segment.usage}</p>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>
          ))}
        </div>

        {/* Peak vs Off-Peak Analysis */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Peak vs Off-Peak Consumption</h4>
          {renderChart({
            type: 'bar',
            title: 'Hourly Distribution',
            data: data.peakAnalysis,
            dataKeys: ['hour', 'peak', 'offPeak'],
            colors: ['#EF4444', '#10B981'],
            height: 250,
            showLegend: true
          }, isDarkMode)}
        </div>
      </motion.div>

      {/* Load Profile Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Load Factor Analysis</h3>
          <div className="space-y-4">
            {data.loadFactors.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{factor.segment}</span>
                  <span className="font-medium">{factor.factor}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      factor.factor > 70 ? 'bg-green-500' :
                      factor.factor > 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${factor.factor}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Higher load factors indicate more efficient energy usage
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Demand Response Participation</h3>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-blue-500">{data.demandResponse.participation}%</p>
            <p className="text-sm text-gray-500">of eligible customers</p>
          </div>
          <div className="space-y-3">
            {[
              { event: 'Peak Shaving Event', date: 'Today 2-5 PM', reduction: '12.5 MW' },
              { event: 'Emergency Response', date: 'Yesterday 6-8 PM', reduction: '18.2 MW' },
              { event: 'Scheduled Curtailment', date: 'Tomorrow 3-6 PM', reduction: 'Est. 15 MW' }
            ].map((event, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{event.event}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                  </div>
                  <span className="text-sm font-medium text-green-500">{event.reduction}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Anomaly Detection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Consumption Anomalies Detected</h3>
        <div className="space-y-3">
          {data.anomalies.map((anomaly, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              anomaly.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              anomaly.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{anomaly.type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{anomaly.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Meter ID: {anomaly.meterId}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    anomaly.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {anomaly.severity.toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">{anomaly.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Billing & Revenue Tab
  const renderBillingTab = () => (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Revenue Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">${data.revenue.monthly}M</p>
            <p className="text-sm text-gray-500">Monthly Revenue</p>
            <p className="text-xs text-green-500 mt-1">+5.2% vs last month</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">${data.revenue.arpu}</p>
            <p className="text-sm text-gray-500">ARPU</p>
            <p className="text-xs text-blue-500 mt-1">+2.1% growth</p>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
            <Users className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.revenue.collectionRate}%</p>
            <p className="text-sm text-gray-500">Collection Rate</p>
            <p className="text-xs text-gray-500 mt-1">30-day average</p>
          </div>
          <div className="text-center p-4 bg-red-500/10 rounded-lg">
            <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">${data.revenue.outstanding}M</p>
            <p className="text-sm text-gray-500">Outstanding</p>
            <p className="text-xs text-red-500 mt-1">Overdue accounts</p>
          </div>
        </div>

        {/* Revenue Trends */}
        {renderChart({
          type: 'line',
          title: 'Monthly Revenue Trends',
          data: data.revenueTrends,
          dataKeys: ['month', 'revenue', 'target'],
          colors: ['#10B981', '#6B7280'],
          height: 300,
          showLegend: true
        }, isDarkMode)}
      </motion.div>

      {/* Billing Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Billing Accuracy Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm">Accurate Bills</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div className="w-[98%] h-2 bg-green-500 rounded-full" />
                </div>
                <span className="text-sm font-medium">98.5%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm">Estimated Reads</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div className="w-[2%] h-2 bg-yellow-500 rounded-full" />
                </div>
                <span className="text-sm font-medium">2.1%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm">Billing Disputes</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div className="w-[0.5%] h-2 bg-red-500 rounded-full" />
                </div>
                <span className="text-sm font-medium">0.5%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Smart meters have reduced billing errors by 87% compared to manual readings
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Time-of-Use Billing Impact</h3>
          {renderChart({
            type: 'bar',
            title: 'TOU Rate Adoption',
            data: data.touBilling,
            dataKeys: ['segment', 'adoption'],
            colors: ['#8B5CF6'],
            height: 250
          }, isDarkMode)}
          <p className="text-sm text-gray-500 mt-3">
            Customers on TOU rates show 15% reduction in peak consumption
          </p>
        </motion.div>
      </div>

      {/* Payment Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Payment Method Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'pie',
              title: 'Payment Methods',
              data: data.paymentMethods,
              dataKeys: ['method', 'percentage'],
              colors: CHART_COLORS,
              height: 300
            }, isDarkMode)}
          </div>
          <div className="space-y-3">
            <h4 className="font-medium mb-3">Payment Trends</h4>
            {data.paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium">{method.method}</p>
                  <p className="text-sm text-gray-500">{method.transactions} transactions/month</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{method.percentage}%</p>
                  <p className={`text-xs ${method.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {method.trend > 0 ? '+' : ''}{method.trend}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Network Performance Tab
  const renderNetworkTab = () => (
    <div className="space-y-6">
      {/* Network Health Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Smart Meter Network Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.networkHealth.overall / 100)}`}
                  className="text-green-500 transform -rotate-90 origin-center transition-all duration-500"
                />
              </svg>
              <span className="absolute text-2xl font-bold">{data.networkHealth.overall}%</span>
            </div>
            <p className="mt-2 font-medium">Overall Health</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Communication Metrics</h4>
            {[
              { metric: 'Signal Strength', value: data.networkHealth.signalStrength, unit: 'dBm' },
              { metric: 'Packet Loss', value: data.networkHealth.packetLoss, unit: '%' },
              { metric: 'Latency', value: data.networkHealth.latency, unit: 'ms' }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">{item.metric}</span>
                <span className="font-medium">{item.value}{item.unit}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Network Status</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">Primary Network: Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">Backup Network: Standby</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-sm">Maintenance Mode: 2 nodes</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Communication Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Daily Communication Success Rate</h3>
          {renderChart({
            type: 'line',
            title: 'Success Rate %',
            data: data.communicationTrends,
            dataKeys: ['time', 'successRate'],
            colors: ['#10B981'],
            height: 300
          }, isDarkMode)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Data Transmission Volume</h3>
          {renderChart({
            type: 'area',
            title: 'GB per Hour',
            data: data.dataVolume,
            dataKeys: ['hour', 'volume'],
            colors: ['#3B82F6'],
            height: 300
          }, isDarkMode)}
        </motion.div>
      </div>

      {/* Meter Firmware Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Meter Firmware Distribution</h3>
        <div className="space-y-4">
          {data.firmwareVersions.map((version, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{version.version}</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    version.status === 'latest' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    version.status === 'supported' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {version.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{version.meters.toLocaleString()} meters</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    version.status === 'latest' ? 'bg-green-500' :
                    version.status === 'supported' ? 'bg-blue-500' :
                    version.status === 'outdated' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${version.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Upgrade Campaign:</strong> 95% of meters will be on latest firmware by end of quarter
          </p>
        </div>
      </motion.div>

      {/* Network Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Active Network Alerts</h3>
        <div className="space-y-3">
          {[
            {
              severity: 'high',
              alert: 'Communication failure in Zone 4',
              affected: '234 meters',
              time: '15 min ago',
              status: 'investigating'
            },
            {
              severity: 'medium',
              alert: 'Degraded signal strength in Northeast sector',
              affected: '567 meters',
              time: '1 hour ago',
              status: 'monitoring'
            },
            {
              severity: 'low',
              alert: 'Scheduled maintenance window approaching',
              affected: '1,234 meters',
              time: 'In 2 hours',
              status: 'planned'
            }
          ].map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              alert.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{alert.alert}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Affecting {alert.affected} • {alert.time}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  alert.status === 'investigating' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  alert.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
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

  const config: DashboardConfig = {
    title: 'Smart Meter Analytics',
    description: 'Real-time monitoring and analytics for smart meter infrastructure',
    kpis: [
      {
        title: 'Active Meters',
        value: data.meterMetrics.activeMeters.toLocaleString(),
        change: 2.3,
        icon: Gauge,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Collection Rate',
        value: `${data.meterMetrics.dataCollectionRate}%`,
        change: 0.5,
        icon: Activity,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Monthly Revenue',
        value: `$${data.revenue.monthly}M`,
        change: 5.2,
        icon: DollarSign,
        color: 'purple',
        trend: 'up'
      },
      {
        title: 'Network Health',
        value: `${data.networkHealth.overall}%`,
        change: 1.2,
        icon: Wifi,
        color: 'yellow',
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
        id: 'consumption',
        label: 'Consumption Analytics',
        icon: TrendingUp,
        content: renderConsumptionTab
      },
      {
        id: 'billing',
        label: 'Billing & Revenue',
        icon: DollarSign,
        content: renderBillingTab
      },
      {
        id: 'network',
        label: 'Network Performance',
        icon: Activity,
        content: renderNetworkTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default SmartMeterDashboard;