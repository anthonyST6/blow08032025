import React from 'react';
import {
  Package,
  TrendingUp,
  Truck,
  DollarSign,
  Activity,
  BarChart2,
  Clock,
  Users,
  AlertTriangle,
  Target,
  ArrowRight,
  Zap
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

interface SupplyOptimizationDashboardProps {
  useCase: UseCase;
}

const SupplyOptimizationDashboard: React.FC<SupplyOptimizationDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = manufacturingDataGenerators.supplyOptimization();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Supply Chain Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="h-5 w-5 text-blue-500 mr-2" />
          Supply Chain Optimization Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.optimizationMetrics.totalSuppliers}</p>
            <p className="text-sm text-gray-500">Active Suppliers</p>
            <p className="text-xs text-blue-500 mt-1">Across all categories</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <Truck className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.optimizationMetrics.onTimeDelivery}%</p>
            <p className="text-sm text-gray-500">On-Time Delivery</p>
            <p className="text-xs text-green-500 mt-1">↑ 3.2% improvement</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <DollarSign className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.optimizationMetrics.costSavings}%</p>
            <p className="text-sm text-gray-500">Cost Savings</p>
            <p className="text-xs text-purple-500 mt-1">Year over year</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
            <Activity className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.optimizationMetrics.inventoryTurnover}x</p>
            <p className="text-sm text-gray-500">Inventory Turnover</p>
            <p className="text-xs text-orange-500 mt-1">Annual rate</p>
          </div>
        </div>
      </motion.div>

      {/* Supply Chain Flow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Supply Chain Flow Analysis</h3>
        <div className="space-y-4">
          {data.supplyChainFlow.map((stage, index) => (
            <div key={index} className="relative">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-blue-100 text-blue-600' :
                      index === data.supplyChainFlow.length - 1 ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{stage.stage}</p>
                      <p className="text-sm text-gray-500">
                        Lead time: {stage.leadTime} days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stage.efficiency}%</p>
                    <p className="text-xs text-gray-500">Efficiency</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Items: {stage.items.toLocaleString()}
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${stage.efficiency}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {index < data.supplyChainFlow.length - 1 && (
                <div className="absolute left-5 top-full h-4 w-0.5 bg-gray-300 dark:bg-gray-600 -translate-x-1/2" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cost Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Supply Chain Cost Trends</h3>
        {renderChart({
          type: 'line',
          title: '90-Day Cost Index',
          data: data.costTrends,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[1]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Suppliers Tab
  const renderSuppliersTab = () => (
    <div className="space-y-6">
      {/* Supplier Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 text-blue-500 mr-2" />
          Supplier Performance Analysis
        </h3>
        <div className="space-y-4">
          {data.supplierPerformance.map((supplier, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{supplier.supplier}</p>
                  <p className="text-sm text-gray-500">
                    {supplier.orders} orders completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{supplier.score}</p>
                  <p className="text-xs text-gray-500">Performance Score</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">On-Time</span>
                  <p className="font-medium">{supplier.onTime}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Quality</span>
                  <p className="font-medium">{supplier.quality}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <p className={`font-medium ${
                    supplier.score >= 90 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {supplier.score >= 90 ? 'Preferred' : 'Standard'}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    supplier.score >= 90 ? 'bg-green-500' :
                    supplier.score >= 80 ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${supplier.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Supplier Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Supplier Performance Comparison</h3>
        {renderChart({
          type: 'radar',
          title: 'Multi-Factor Analysis',
          data: data.supplierPerformance.slice(0, 3).map(s => ({
            subject: s.supplier,
            onTime: s.onTime,
            quality: s.quality,
            cost: 100 - (s.score / 2),
            flexibility: s.score - 5
          })),
          dataKeys: ['onTime', 'quality', 'cost', 'flexibility'],
          colors: [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[2], CHART_COLORS[3]],
          height: 400
        }, isDarkMode)}
      </motion.div>

      {/* Supplier Risk Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Supplier Risk Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-medium mb-3 text-red-700 dark:text-red-300">High Risk Suppliers</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Energy IoT Solutions</span>
                <span className="text-red-600">Score: 65</span>
              </li>
              <li className="flex justify-between">
                <span>Basic Components Ltd</span>
                <span className="text-red-600">Score: 72</span>
              </li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium mb-3 text-green-700 dark:text-green-300">Low Risk Suppliers</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Global Parts Inc</span>
                <span className="text-green-600">Score: 95</span>
              </li>
              <li className="flex justify-between">
                <span>Premium Materials</span>
                <span className="text-green-600">Score: 94</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Optimization Tab
  const renderOptimizationTab = () => (
    <div className="space-y-6">
      {/* Inventory Optimization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="h-5 w-5 text-purple-500 mr-2" />
          Inventory Level Optimization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'area',
              title: '30-Day Inventory Levels',
              data: data.inventoryLevels,
              dataKeys: ['date', 'value'],
              colors: [CHART_COLORS[2]],
              height: 250
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Optimization Metrics</h4>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Stock Level</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Optimal Level</span>
                  <span className="font-medium text-green-600">82%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</span>
                  <span className="font-medium text-purple-600">$234K</span>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium mb-2">Lead Time Reduction</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {data.optimizationMetrics.leadTimeReduction}%
                  </span>
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Through route optimization
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Risk Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
          Supply Chain Risk Analysis
        </h3>
        <div className="space-y-3">
          {data.riskAnalysis.map((risk, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              risk.impact === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              risk.impact === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{risk.risk}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  risk.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  risk.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {risk.impact.toUpperCase()} IMPACT
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Probability</span>
                  <p className="font-medium">{risk.probability}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Mitigation</span>
                  <p className="font-medium">{risk.mitigation}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <p className="font-medium text-green-600">Active</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Optimization Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="h-5 w-5 text-green-500 mr-2" />
          AI-Identified Optimization Opportunities
        </h3>
        <div className="space-y-3">
          {data.optimizationOpportunities.map((opp, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{opp.opportunity}</h4>
                <ArrowRight className="h-5 w-5 text-green-500" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Potential Savings</span>
                  <p className="font-medium text-green-600">${(opp.savings / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Effort</span>
                  <p className="font-medium">{opp.effort}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Timeline</span>
                  <p className="font-medium">{opp.timeline}</p>
                </div>
              </div>
              <button className="mt-3 text-sm font-medium text-green-600 hover:text-green-700">
                View Implementation Plan →
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Demand Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">60-Day Demand Forecast</h3>
        {renderChart({
          type: 'line',
          title: 'Predicted Demand',
          data: data.demandForecast,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[3]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Supply Chain Optimization',
    description: 'AI-driven supply chain management and optimization',
    kpis: [
      {
        title: 'Active Suppliers',
        value: data.optimizationMetrics.totalSuppliers.toString(),
        change: 8.3,
        icon: Users,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'On-Time Delivery',
        value: `${data.optimizationMetrics.onTimeDelivery}%`,
        change: 3.2,
        icon: Truck,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Cost Savings',
        value: `${data.optimizationMetrics.costSavings}%`,
        change: 12.3,
        icon: DollarSign,
        color: 'purple',
        trend: 'up'
      },
      {
        title: 'Inventory Turnover',
        value: `${data.optimizationMetrics.inventoryTurnover}x`,
        change: 15.7,
        icon: Activity,
        color: 'orange',
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
        id: 'suppliers',
        label: 'Suppliers',
        icon: Users,
        content: renderSuppliersTab
      },
      {
        id: 'optimization',
        label: 'Optimization',
        icon: Target,
        content: renderOptimizationTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default SupplyOptimizationDashboard;