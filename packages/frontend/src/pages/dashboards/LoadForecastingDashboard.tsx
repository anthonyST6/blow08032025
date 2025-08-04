import React from 'react';
import {
  Zap,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  BarChart2,
  Gauge,
  Sun,
  Cloud,
  Thermometer,
  Calendar,
  AlertCircle,
  Battery,
  Target
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

interface LoadForecastingDashboardProps {
  useCase: UseCase;
}

const LoadForecastingDashboard: React.FC<LoadForecastingDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = energyDataGenerators.loadForecasting();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Current Load Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="h-5 w-5 text-yellow-500 mr-2" />
          Real-time Load Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-500">{data.forecastMetrics.currentLoad.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Current Load (MW)</p>
            <p className="text-xs text-gray-400 mt-1">Updated 30s ago</p>
          </div>
          <div className="text-center p-4 bg-red-500/10 rounded-lg">
            <TrendingUp className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-500">{data.forecastMetrics.peakLoad.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Today's Peak (MW)</p>
            <p className="text-xs text-gray-400 mt-1">Expected at 18:00</p>
          </div>
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <Gauge className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-500">{data.forecastMetrics.capacityUtilization}%</p>
            <p className="text-sm text-gray-500">Capacity Utilization</p>
            <p className="text-xs text-gray-400 mt-1">System capacity</p>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg">
            <Battery className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-500">{data.forecastMetrics.reserveMargin}%</p>
            <p className="text-sm text-gray-500">Reserve Margin</p>
            <p className="text-xs text-green-500 mt-1">Adequate reserves</p>
          </div>
        </div>
      </motion.div>

      {/* 24-Hour Load Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">24-Hour Load Forecast</h3>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm">Forecast</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm">Actual</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-gray-400" />
              <span className="text-sm">Confidence Band</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Accuracy: <span className="font-medium text-green-500">{data.forecastMetrics.forecastAccuracy}%</span>
          </div>
        </div>
        {renderChart({
          type: 'line',
          title: 'Load (MW)',
          data: data.loadForecast.hourly,
          dataKeys: ['hour', 'forecast', 'actual'],
          colors: ['#3B82F6', '#10B981'],
          height: 350,
          showLegend: false
        }, isDarkMode)}
      </motion.div>

      {/* Active Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Active Alerts & Notifications</h3>
        <div className="space-y-3">
          {data.alerts.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              alert.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-500' :
                    alert.severity === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium">{alert.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Forecast Analysis Tab
  const renderForecastTab = () => (
    <div className="space-y-6">
      {/* Forecast Accuracy Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Forecast Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg">
            <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-4xl font-bold text-green-500">{data.forecastMetrics.forecastAccuracy}%</p>
            <p className="text-sm text-gray-500">Forecast Accuracy</p>
            <p className="text-xs text-green-500 mt-2">↑ 1.2% from last month</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
            <BarChart2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-4xl font-bold text-blue-500">{data.forecastMetrics.mape}%</p>
            <p className="text-sm text-gray-500">MAPE</p>
            <p className="text-xs text-gray-400 mt-2">Mean Absolute % Error</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <Activity className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-4xl font-bold text-purple-500">±2.5%</p>
            <p className="text-sm text-gray-500">Confidence Interval</p>
            <p className="text-xs text-gray-400 mt-2">95% confidence</p>
          </div>
        </div>
      </motion.div>

      {/* Accuracy Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Forecast Accuracy Trends (30 Days)</h3>
        {renderChart({
          type: 'line',
          title: 'Daily Accuracy %',
          data: data.accuracyTrends,
          dataKeys: ['date', 'value'],
          colors: ['#10B981'],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Weekly & Monthly Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">7-Day Forecast</h3>
          {renderChart({
            type: 'bar',
            title: 'Daily Peak Load (MW)',
            data: data.loadForecast.daily,
            dataKeys: ['date', 'forecast', 'actual'],
            colors: ['#3B82F6', '#10B981'],
            height: 300,
            showLegend: true
          }, isDarkMode)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">4-Week Forecast</h3>
          {renderChart({
            type: 'line',
            title: 'Weekly Total Load (GWh)',
            data: data.loadForecast.weekly,
            dataKeys: ['date', 'forecast', 'actual'],
            colors: ['#8B5CF6', '#F59E0B'],
            height: 300,
            showLegend: true
          }, isDarkMode)}
        </motion.div>
      </div>
    </div>
  );

  // Demand Factors Tab
  const renderDemandTab = () => (
    <div className="space-y-6">
      {/* Demand Factor Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Demand Influencing Factors</h3>
        <div className="space-y-4">
          {data.demandFactors.map((factor, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {factor.factor === 'Temperature' && <Thermometer className="h-5 w-5 text-red-500" />}
                  {factor.factor === 'Time of Day' && <Clock className="h-5 w-5 text-blue-500" />}
                  {factor.factor === 'Day of Week' && <Calendar className="h-5 w-5 text-purple-500" />}
                  {factor.factor === 'Economic Activity' && <TrendingUp className="h-5 w-5 text-green-500" />}
                  {factor.factor === 'Special Events' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                  <div>
                    <p className="font-medium">{factor.factor}</p>
                    <p className="text-sm text-gray-500">Correlation: {factor.correlation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{factor.impact}%</p>
                  <p className="text-xs text-gray-500">Impact Weight</p>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div
                  className="h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${factor.impact}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weather Impact Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Weather Impact on Load</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Sun className="h-6 w-6 text-red-500" />
              <span className="text-2xl font-bold">32°C</span>
            </div>
            <p className="text-sm text-gray-500">Current Temperature</p>
            <p className="text-xs text-red-500 mt-1">+8% load impact</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Cloud className="h-6 w-6 text-blue-500" />
              <span className="text-2xl font-bold">65%</span>
            </div>
            <p className="text-sm text-gray-500">Humidity</p>
            <p className="text-xs text-blue-500 mt-1">+3% load impact</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold">THI: 78</span>
            </div>
            <p className="text-sm text-gray-500">Heat Index</p>
            <p className="text-xs text-yellow-500 mt-1">High cooling demand</p>
          </div>
        </div>

        {/* Temperature vs Load Correlation */}
        <div>
          {renderChart({
            type: 'scatter',
            title: 'Temperature vs Load Correlation',
            data: Array.from({ length: 30 }, (_, i) => ({
              temp: 15 + Math.random() * 25,
              load: 2500 + Math.random() * 2000
            })),
            dataKeys: ['temp', 'load'],
            colors: ['#EF4444'],
            height: 300
          }, isDarkMode)}
        </div>
      </motion.div>

      {/* Economic Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Economic Activity Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
              <span className="text-sm">Industrial Production Index</span>
              <div className="text-right">
                <span className="font-medium">108.5</span>
                <span className="text-xs text-green-500 ml-2">+2.3%</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
              <span className="text-sm">Commercial Activity</span>
              <div className="text-right">
                <span className="font-medium">Normal</span>
                <span className="text-xs text-gray-500 ml-2">Weekday</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
              <span className="text-sm">Holiday Impact</span>
              <div className="text-right">
                <span className="font-medium">None</span>
                <span className="text-xs text-gray-500 ml-2">0% adjustment</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg">
            <h4 className="font-medium mb-3">Economic Load Adjustment</h4>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">+4.2%</p>
              <p className="text-sm text-gray-500 mt-2">
                Based on current economic indicators
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Generation Planning Tab
  const renderGenerationTab = () => (
    <div className="space-y-6">
      {/* Generation Mix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Current Generation Mix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'pie',
              title: 'Generation by Source',
              data: data.generationMix.map(source => ({
                name: source.source,
                value: source.current
              })),
              dataKeys: ['name', 'value'],
              colors: CHART_COLORS,
              height: 300
            }, isDarkMode)}
          </div>
          <div className="space-y-3">
            {data.generationMix.map((source, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{source.source}</p>
                  <span className="text-sm text-gray-500">{source.percentage}%</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Capacity</span>
                  <span>{source.capacity.toLocaleString()} MW</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Current Output</span>
                  <span className="font-medium">{source.current.toLocaleString()} MW</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-gray-500' :
                      index === 2 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(source.current / source.capacity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Generation Dispatch Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">24-Hour Generation Dispatch Plan</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <p className="font-medium">Base Load Units</p>
              <p className="text-sm text-gray-500">Nuclear & Coal - Constant output</p>
            </div>
            <p className="text-lg font-bold">1,760 MW</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <p className="font-medium">Intermediate Load</p>
              <p className="text-sm text-gray-500">Natural Gas - Variable output</p>
            </div>
            <p className="text-lg font-bold">800-1,450 MW</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div>
              <p className="font-medium">Peak Load Units</p>
              <p className="text-sm text-gray-500">Gas Turbines - Quick start</p>
            </div>
            <p className="text-lg font-bold">0-350 MW</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div>
              <p className="font-medium">Renewable Sources</p>
              <p className="text-sm text-gray-500">Wind & Solar - Variable</p>
            </div>
            <p className="text-lg font-bold">50-240 MW</p>
          </div>
        </div>
      </motion.div>

      {/* Reserve Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Reserve Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-lg">
            <Battery className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">630 MW</p>
            <p className="text-sm text-gray-500">Spinning Reserve</p>
            <p className="text-xs text-green-500 mt-1">15% of peak load</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-yellow-500/10 rounded-lg">
            <Gauge className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-2xl font-bold">420 MW</p>
            <p className="text-sm text-gray-500">Operating Reserve</p>
            <p className="text-xs text-green-500 mt-1">10% of peak load</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-red-500/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">210 MW</p>
            <p className="text-sm text-gray-500">Emergency Reserve</p>
            <p className="text-xs text-yellow-500 mt-1">5% of peak load</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Load Forecasting & Demand Management',
    description: 'AI-powered load forecasting and generation planning system',
    kpis: [
      {
        title: 'Current Load',
        value: `${data.forecastMetrics.currentLoad.toLocaleString()} MW`,
        change: 5.2,
        icon: Zap,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Forecast Accuracy',
        value: `${data.forecastMetrics.forecastAccuracy}%`,
        change: 1.2,
        icon: Target,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Peak Load Today',
        value: `${data.forecastMetrics.peakLoad.toLocaleString()} MW`,
        change: 3.8,
        icon: TrendingUp,
        color: 'red',
        trend: 'up'
      },
      {
        title: 'Reserve Margin',
        value: `${data.forecastMetrics.reserveMargin}%`,
        change: -2.1,
        icon: Battery,
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
        id: 'forecast',
        label: 'Forecast Analysis',
        icon: TrendingUp,
        content: renderForecastTab
      },
      {
        id: 'demand',
        label: 'Demand Factors',
        icon: Activity,
        content: renderDemandTab
      },
      {
        id: 'generation',
        label: 'Generation Planning',
        icon: Zap,
        content: renderGenerationTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default LoadForecastingDashboard;