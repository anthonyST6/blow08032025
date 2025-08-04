import React from 'react';
import {
  Sun,
  Wind,
  Battery,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart2,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Gauge,
  Cloud,
  Droplets
} from 'lucide-react';
import DashboardTemplate, {
  DashboardConfig,
  ChartConfig,
  renderChart,
  CHART_COLORS
} from '../../components/dashboards/DashboardTemplate';
import { UseCase } from '../../config/verticals';
import { energyDataGenerators, generateTimeSeries } from '../../utils/dashboard-data-generators';
import { motion } from 'framer-motion';

interface RenewableOptimizationDashboardProps {
  useCase: UseCase;
}

const RenewableOptimizationDashboard: React.FC<RenewableOptimizationDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = energyDataGenerators.renewableOptimization();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Energy Generation Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="h-5 w-5 text-yellow-500 mr-2" />
          Real-time Energy Generation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.energyMix.map((source, index) => (
            <div key={index} className="p-4 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {source.source === 'Solar' && <Sun className="h-5 w-5 text-yellow-500" />}
                  {source.source === 'Wind' && <Wind className="h-5 w-5 text-blue-500" />}
                  {source.source === 'Battery' && <Battery className="h-5 w-5 text-green-500" />}
                  <h4 className="font-medium">{source.source}</h4>
                </div>
                <span className={`text-sm font-medium ${
                  source.efficiency > 85 ? 'text-green-500' :
                  source.efficiency > 70 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {source.efficiency}% eff
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Output</span>
                  <span className="font-medium">{source.output} MW</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Capacity</span>
                  <span className="font-medium">{source.capacity} MW</span>
                </div>
                <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      source.source === 'Solar' ? 'bg-yellow-500' :
                      source.source === 'Wind' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(source.output / source.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Output Forecast & Price Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">48-Hour Output Forecast</h3>
          {renderChart({
            type: 'area',
            title: 'Predicted Output (MW)',
            data: data.outputForecast,
            dataKeys: ['date', 'value'],
            colors: ['#10B981'],
            height: 300
          }, isDarkMode)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Price Optimization</h3>
          {renderChart({
            type: 'line',
            title: 'Market Price ($/MWh)',
            data: data.priceOptimization,
            dataKeys: ['date', 'value'],
            colors: ['#8B5CF6'],
            height: 300
          }, isDarkMode)}
        </motion.div>
      </div>

      {/* Storage Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Battery Storage System</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-1">
            <div className="relative inline-flex items-center justify-center w-full">
              <svg className="w-48 h-48 mx-auto">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - data.storageStatus.currentCharge / data.storageStatus.maxCapacity)}`}
                  className="text-green-500 transform -rotate-90 origin-center transition-all duration-500"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-bold">{Math.round((data.storageStatus.currentCharge / data.storageStatus.maxCapacity) * 100)}%</p>
                <p className="text-sm text-gray-500">Charged</p>
              </div>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500">Current Charge</p>
              <p className="text-2xl font-bold">{data.storageStatus.currentCharge} MWh</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500">Max Capacity</p>
              <p className="text-2xl font-bold">{data.storageStatus.maxCapacity} MWh</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500">Charge Rate</p>
              <p className="text-2xl font-bold">{data.storageStatus.chargeRate} MW</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500">Discharge Rate</p>
              <p className="text-2xl font-bold">{data.storageStatus.dischargeRate} MW</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500">Cycle Count</p>
              <p className="text-2xl font-bold">{data.storageStatus.cycleCount}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500">Battery Health</p>
              <p className="text-2xl font-bold text-green-500">{data.storageStatus.health}%</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Performance Analytics Tab
  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Curtailment Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Curtailment Reduction Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-500">{data.optimizationMetrics.curtailmentReduced}%</p>
            <p className="text-sm text-gray-500">Curtailment Reduced</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-500">{data.optimizationMetrics.revenueIncrease}%</p>
            <p className="text-sm text-gray-500">Revenue Increase</p>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg">
            <Battery className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-500">{data.optimizationMetrics.storageUtilization}%</p>
            <p className="text-sm text-gray-500">Storage Utilization</p>
          </div>
        </div>
        {renderChart({
          type: 'line',
          title: 'Daily Curtailment %',
          data: data.curtailmentAnalysis,
          dataKeys: ['date', 'value'],
          colors: ['#EF4444'],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Efficiency Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">System Efficiency Breakdown</h3>
          <div className="space-y-4">
            {[
              { component: 'Solar Arrays', efficiency: 94, target: 95 },
              { component: 'Wind Turbines', efficiency: 89, target: 90 },
              { component: 'Battery System', efficiency: 95, target: 95 },
              { component: 'Grid Connection', efficiency: 98, target: 99 },
              { component: 'Overall System', efficiency: data.optimizationMetrics.efficiency, target: 90 }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.component}</span>
                  <span className={`font-medium ${
                    item.efficiency >= item.target ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {item.efficiency}% / {item.target}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      item.efficiency >= item.target ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${item.efficiency}%` }}
                  />
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
          <h3 className="text-lg font-semibold mb-4">Performance Indicators</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Gauge className="h-6 w-6 text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">Capacity Factor</p>
              <p className="text-2xl font-bold">42.3%</p>
              <p className="text-xs text-green-500">+2.1% vs target</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Activity className="h-6 w-6 text-green-500 mb-2" />
              <p className="text-sm text-gray-500">Availability</p>
              <p className="text-2xl font-bold">98.7%</p>
              <p className="text-xs text-green-500">Above target</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Clock className="h-6 w-6 text-purple-500 mb-2" />
              <p className="text-sm text-gray-500">Response Time</p>
              <p className="text-2xl font-bold">1.2s</p>
              <p className="text-xs text-gray-500">Grid commands</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Zap className="h-6 w-6 text-yellow-500 mb-2" />
              <p className="text-sm text-gray-500">Peak Shaving</p>
              <p className="text-2xl font-bold">234 MW</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Energy Mix Optimization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Optimal Energy Mix Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'pie',
              title: 'Current Energy Mix',
              data: data.energyMix.map(source => ({
                name: source.source,
                value: source.output
              })),
              dataKeys: ['name', 'value'],
              colors: ['#F59E0B', '#3B82F6', '#10B981'],
              height: 300
            }, isDarkMode)}
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Optimization Recommendations</h4>
            {[
              { action: 'Increase solar capacity by 15%', impact: '+$2.3M annual revenue' },
              { action: 'Add 50 MWh battery storage', impact: 'Reduce curtailment by 12%' },
              { action: 'Upgrade wind turbine controllers', impact: '+5% efficiency gain' },
              { action: 'Implement predictive maintenance', impact: '-20% downtime' }
            ].map((rec, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-sm">{rec.action}</p>
                <p className="text-xs text-green-500 mt-1">{rec.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Weather & Forecasting Tab
  const renderWeatherTab = () => (
    <div className="space-y-6">
      {/* Weather Impact Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Weather Conditions & Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
            <Sun className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">85%</p>
            <p className="text-sm text-gray-500">Solar Irradiance</p>
            <p className="text-xs mt-1">Partly cloudy</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg text-center">
            <Wind className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">12.5 m/s</p>
            <p className="text-sm text-gray-500">Wind Speed</p>
            <p className="text-xs mt-1">Optimal range</p>
          </div>
          <div className="p-4 bg-gray-500/10 rounded-lg text-center">
            <Cloud className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">45%</p>
            <p className="text-sm text-gray-500">Cloud Cover</p>
            <p className="text-xs mt-1">Increasing</p>
          </div>
          <div className="p-4 bg-cyan-500/10 rounded-lg text-center">
            <Droplets className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">20%</p>
            <p className="text-sm text-gray-500">Rain Probability</p>
            <p className="text-xs mt-1">Next 6 hours</p>
          </div>
        </div>
      </motion.div>

      {/* Production Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">7-Day Production Forecast</h3>
        <div className="space-y-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
            const solarOutput = 600 + Math.random() * 250;
            const windOutput = 800 + Math.random() * 400;
            const totalOutput = solarOutput + windOutput;
            
            return (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{day}</h4>
                  <span className="text-lg font-bold">{Math.round(totalOutput)} MW</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div 
                        className="h-2 bg-yellow-500 rounded-full"
                        style={{ width: `${(solarOutput / 850) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm w-16 text-right">{Math.round(solarOutput)} MW</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Wind className="h-4 w-4 text-blue-500" />
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(windOutput / 1200) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm w-16 text-right">{Math.round(windOutput)} MW</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Weather Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Weather Alerts & Recommendations</h3>
        <div className="space-y-3">
          {[
            {
              severity: 'medium',
              alert: 'Strong winds expected tomorrow',
              impact: 'Wind output may exceed 110% capacity',
              action: 'Prepare for potential curtailment'
            },
            {
              severity: 'low',
              alert: 'Cloud cover increasing this afternoon',
              impact: 'Solar output reduction of 30-40%',
              action: 'Battery discharge scheduled'
            },
            {
              severity: 'info',
              alert: 'Optimal conditions Friday-Sunday',
              impact: 'Expected 95%+ renewable generation',
              action: 'Schedule maintenance for thermal units'
            }
          ].map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              alert.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              alert.severity === 'low' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{alert.alert}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.impact}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    <strong>Action:</strong> {alert.action}
                  </p>
                </div>
                <AlertCircle className={`h-5 w-5 ${
                  alert.severity === 'high' ? 'text-red-500' :
                  alert.severity === 'medium' ? 'text-yellow-500' :
                  alert.severity === 'low' ? 'text-orange-500' :
                  'text-blue-500'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Financial Impact Tab
  const renderFinancialTab = () => (
    <div className="space-y-6">
      {/* Revenue Optimization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Revenue Optimization Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">$4.2M</p>
            <p className="text-sm text-gray-500">Monthly Revenue</p>
            <p className="text-xs text-green-500 mt-1">+23% vs baseline</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">$127</p>
            <p className="text-sm text-gray-500">Avg Price/MWh</p>
            <p className="text-xs text-blue-500 mt-1">Optimized timing</p>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg">
            <Battery className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">$0.8M</p>
            <p className="text-sm text-gray-500">Storage Revenue</p>
            <p className="text-xs text-purple-500 mt-1">Arbitrage gains</p>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
            <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">$0.3M</p>
            <p className="text-sm text-gray-500">Avoided Penalties</p>
            <p className="text-xs text-yellow-500 mt-1">Curtailment reduction</p>
          </div>
        </div>

        {/* Revenue Breakdown Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'bar',
              title: 'Revenue by Source',
              data: [
                { source: 'Energy Sales', revenue: 3.2 },
                { source: 'Capacity Payments', revenue: 0.5 },
                { source: 'Ancillary Services', revenue: 0.4 },
                { source: 'Storage Arbitrage', revenue: 0.8 },
                { source: 'Green Certificates', revenue: 0.3 }
              ],
              dataKeys: ['source', 'revenue'],
              colors: ['#10B981'],
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            {renderChart({
              type: 'line',
              title: 'Monthly Revenue Trend',
              data: generateTimeSeries(12, 4.2, 0.3, 'up'),
              dataKeys: ['date', 'value'],
              colors: ['#8B5CF6'],
              height: 300
            }, isDarkMode)}
          </div>
        </div>
      </motion.div>

      {/* Cost Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Operating Cost Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Cost Breakdown</h4>
            {[
              { category: 'O&M - Solar', cost: 0.12, trend: 'stable' },
              { category: 'O&M - Wind', cost: 0.18, trend: 'down' },
              { category: 'O&M - Battery', cost: 0.08, trend: 'up' },
              { category: 'Grid Connection', cost: 0.05, trend: 'stable' },
              { category: 'Insurance', cost: 0.03, trend: 'stable' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{item.category}</p>
                  <p className="text-xs text-gray-500">
                    Trend: {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                  </p>
                </div>
                <p className="text-lg font-bold">${item.cost}M</p>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between">
                <p className="font-medium">Total Monthly Cost</p>
                <p className="text-xl font-bold">$0.46M</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Cost Optimization Opportunities</h4>
            <div className="space-y-3">
              {[
                {
                  opportunity: 'Predictive maintenance implementation',
                  savings: '$45K/month',
                  effort: 'Medium',
                  timeline: '3 months'
                },
                {
                  opportunity: 'Battery cycling optimization',
                  savings: '$28K/month',
                  effort: 'Low',
                  timeline: '1 month'
                },
                {
                  opportunity: 'Automated trading algorithm',
                  savings: '$67K/month',
                  effort: 'High',
                  timeline: '6 months'
                }
              ].map((opp, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg">
                  <p className="font-medium text-sm">{opp.opportunity}</p>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    <div>
                      <p className="text-gray-500">Savings</p>
                      <p className="font-medium text-green-500">{opp.savings}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Effort</p>
                      <p className="font-medium">{opp.effort}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Timeline</p>
                      <p className="font-medium">{opp.timeline}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ROI Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Return on Investment Analysis</h3>
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
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.87)}`}
                  className="text-green-500 transform -rotate-90 origin-center transition-all duration-500"
                />
              </svg>
              <span className="absolute text-2xl font-bold">87%</span>
            </div>
            <p className="mt-2 font-medium">IRR</p>
            <p className="text-sm text-gray-500">Internal Rate of Return</p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500">Payback Period</p>
              <p className="text-2xl font-bold">4.2 years</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500">NPV (10 years)</p>
              <p className="text-2xl font-bold text-green-500">$127M</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500">Total Investment</p>
              <p className="text-2xl font-bold">$85M</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500">Annual Profit</p>
              <p className="text-2xl font-bold text-green-500">$23.4M</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Renewable Energy Optimization',
    description: 'AI-powered optimization for renewable energy generation and storage',
    kpis: [
      {
        title: 'Total Output',
        value: data.optimizationMetrics.currentOutput,
        change: 12.5,
        icon: Zap,
        color: 'yellow',
        trend: 'up'
      },
      {
        title: 'System Efficiency',
        value: `${data.optimizationMetrics.efficiency}%`,
        change: 3.2,
        icon: Activity,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Revenue Increase',
        value: `${data.optimizationMetrics.revenueIncrease}%`,
        change: 5.8,
        icon: DollarSign,
        color: 'purple',
        trend: 'up'
      },
      {
        title: 'Storage Utilization',
        value: `${data.optimizationMetrics.storageUtilization}%`,
        change: 8.4,
        icon: Battery,
        color: 'blue',
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
        label: 'Performance Analytics',
        icon: Activity,
        content: renderPerformanceTab
      },
      {
        id: 'weather',
        label: 'Weather & Forecasting',
        icon: Cloud,
        content: renderWeatherTab
      },
      {
        id: 'financial',
        label: 'Financial Impact',
        icon: DollarSign,
        content: renderFinancialTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default RenewableOptimizationDashboard;