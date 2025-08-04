import React from 'react';
import {
  TrendingUp,
  PieChart,
  Activity,
  BarChart2,
  Target,
  Shield,
  Zap,
  Award,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowUpRight
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

interface PortfolioOptimizationDashboardProps {
  useCase: UseCase;
}

const PortfolioOptimizationDashboard: React.FC<PortfolioOptimizationDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = financeDataGenerators.portfolioOptimization();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
          Portfolio Optimization Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <DollarSign className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">${data.portfolioMetrics.totalAUM}B</p>
            <p className="text-sm text-gray-500">Total AUM</p>
            <p className="text-xs text-blue-500 mt-1">↑ 12% YoY growth</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.portfolioMetrics.avgReturn}%</p>
            <p className="text-sm text-gray-500">Average Return</p>
            <p className="text-xs text-green-500 mt-1">↑ 3.2% vs benchmark</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <Activity className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.portfolioMetrics.sharpeRatio}</p>
            <p className="text-sm text-gray-500">Sharpe Ratio</p>
            <p className="text-xs text-purple-500 mt-1">Risk-adjusted return</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
            <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.portfolioMetrics.alphaGenerated}%</p>
            <p className="text-sm text-gray-500">Alpha Generated</p>
            <p className="text-xs text-orange-500 mt-1">Excess return</p>
          </div>
        </div>
      </motion.div>

      {/* Asset Allocation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Current Asset Allocation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'pie',
              title: 'Portfolio Composition',
              data: data.assetAllocation.map(asset => ({
                name: asset.asset,
                value: asset.allocation
              })),
              dataKeys: ['value'],
              colors: CHART_COLORS,
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Asset Performance</h4>
            <div className="space-y-3">
              {data.assetAllocation.map((asset, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{asset.asset}</span>
                    <span className="text-sm font-medium">{asset.allocation}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Return</span>
                      <p className={`font-medium ${asset.return > 10 ? 'text-green-600' : 'text-gray-900 dark:text-gray-100'}`}>
                        {asset.return}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Risk</span>
                      <p className={`font-medium ${asset.risk > 15 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                        {asset.risk}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Portfolio Performance (1 Year)</h3>
        {renderChart({
          type: 'line',
          title: 'Cumulative Returns',
          data: data.performanceTrends,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[1]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Risk Analysis Tab
  const renderRiskTab = () => (
    <div className="space-y-6">
      {/* Risk Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 text-red-500 mr-2" />
          Risk Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <span className="text-xs text-red-500">95% confidence</span>
            </div>
            <p className="text-2xl font-bold">{data.riskMetrics.var95}%</p>
            <p className="text-sm text-gray-500">Value at Risk (VaR)</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Potential 1-day loss
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-6 w-6 text-orange-500" />
              <span className="text-xs text-orange-500">Historical</span>
            </div>
            <p className="text-2xl font-bold">{data.riskMetrics.maxDrawdown}%</p>
            <p className="text-sm text-gray-500">Max Drawdown</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Largest peak-to-trough
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <BarChart2 className="h-6 w-6 text-yellow-500" />
              <span className="text-xs text-yellow-500">Annualized</span>
            </div>
            <p className="text-2xl font-bold">{data.riskMetrics.volatility}%</p>
            <p className="text-sm text-gray-500">Volatility</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Standard deviation
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-6 w-6 text-blue-500" />
              <span className="text-xs text-blue-500">Market</span>
            </div>
            <p className="text-2xl font-bold">{data.riskMetrics.beta}</p>
            <p className="text-sm text-gray-500">Beta</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Market sensitivity
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <PieChart className="h-6 w-6 text-purple-500" />
              <span className="text-xs text-purple-500">Portfolio</span>
            </div>
            <p className="text-2xl font-bold">{data.riskMetrics.correlation}</p>
            <p className="text-sm text-gray-500">Correlation</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Asset correlation
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-6 w-6 text-green-500" />
              <span className="text-xs text-green-500">Risk-adjusted</span>
            </div>
            <p className="text-2xl font-bold">{data.portfolioMetrics.riskAdjustedReturn}%</p>
            <p className="text-sm text-gray-500">Risk-Adjusted Return</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Return per unit risk
            </p>
          </div>
        </div>
      </motion.div>

      {/* Risk Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Risk Distribution by Asset Class</h3>
        {renderChart({
          type: 'radar',
          title: 'Risk Profile',
          data: data.assetAllocation.map(asset => ({
            subject: asset.asset,
            risk: asset.risk,
            return: asset.return,
            allocation: asset.allocation
          })),
          dataKeys: ['risk', 'return', 'allocation'],
          colors: [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[2]],
          height: 400
        }, isDarkMode)}
      </motion.div>

      {/* Stress Testing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Stress Test Scenarios</h3>
        <div className="space-y-3">
          {[
            { scenario: 'Market Crash (-20%)', impact: -15.2, recovery: '8-12 months', probability: 'Low' },
            { scenario: 'Interest Rate Spike (+2%)', impact: -8.5, recovery: '4-6 months', probability: 'Medium' },
            { scenario: 'Recession', impact: -12.3, recovery: '12-18 months', probability: 'Medium' },
            { scenario: 'Inflation Surge (+5%)', impact: -6.7, recovery: '6-9 months', probability: 'High' },
            { scenario: 'Geopolitical Crisis', impact: -9.8, recovery: '3-6 months', probability: 'Low' }
          ].map((test, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{test.scenario}</p>
                  <p className="text-sm text-gray-500">Recovery: {test.recovery}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  test.probability === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  test.probability === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {test.probability} Probability
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Portfolio Impact</span>
                <span className={`text-lg font-bold ${test.impact < -10 ? 'text-red-600' : 'text-orange-600'}`}>
                  {test.impact}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Optimization Tab
  const renderOptimizationTab = () => (
    <div className="space-y-6">
      {/* AI Optimization Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="h-5 w-5 text-purple-500 mr-2" />
          AI-Powered Optimization Suggestions
        </h3>
        <div className="space-y-4">
          {data.optimizationSuggestions.map((suggestion, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center">
                  <ArrowUpRight className="h-4 w-4 text-purple-500 mr-2" />
                  {suggestion.action}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Confidence:
                  </span>
                  <div className="flex items-center">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          suggestion.confidence >= 85 ? 'bg-green-500' :
                          suggestion.confidence >= 70 ? 'bg-yellow-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${suggestion.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{suggestion.confidence}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Expected Return Impact</span>
                  <span className={`font-medium ${
                    suggestion.impact.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {suggestion.impact}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Risk Impact</span>
                  <span className={`font-medium ${
                    suggestion.risk.startsWith('-') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {suggestion.risk}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Client Segments Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 text-blue-500 mr-2" />
          Client Segment Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'bar',
              title: 'Average Returns by Segment',
              data: data.clientSegments,
              dataKeys: ['segment', 'avgReturn'],
              colors: [CHART_COLORS[0]],
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Segment Details</h4>
            <div className="space-y-3">
              {data.clientSegments.map((segment, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{segment.segment}</span>
                    <span className="text-sm text-gray-500">{segment.count.toLocaleString()} clients</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Avg Return</span>
                      <p className="font-medium text-green-600">{segment.avgReturn}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Satisfaction</span>
                      <p className="font-medium">{segment.satisfaction}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rebalancing Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Rebalancing Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-3">Current vs Optimal Allocation</h4>
            <div className="space-y-2">
              {data.assetAllocation.map((asset, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{asset.asset}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{asset.allocation}%</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium text-blue-600">
                      {asset.allocation + (index % 2 === 0 ? 2 : -2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium mb-3">Expected Impact</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Return Improvement</span>
                <span className="font-medium text-green-600">+0.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Risk Reduction</span>
                <span className="font-medium text-green-600">-1.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</span>
                <span className="font-medium">1.45 → 1.52</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Costs</span>
                <span className="font-medium">0.15%</span>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Net Benefit</span>
                  <span className="font-bold text-green-600">+0.65%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Portfolio Optimization',
    description: 'AI-driven portfolio management and optimization system',
    kpis: [
      {
        title: 'Total AUM',
        value: `$${data.portfolioMetrics.totalAUM}B`,
        change: 12.0,
        icon: DollarSign,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Avg Return',
        value: `${data.portfolioMetrics.avgReturn}%`,
        change: 3.2,
        icon: TrendingUp,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Sharpe Ratio',
        value: data.portfolioMetrics.sharpeRatio.toString(),
        change: 8.5,
        icon: Activity,
        color: 'purple',
        trend: 'up'
      },
      {
        title: 'Alpha',
        value: `${data.portfolioMetrics.alphaGenerated}%`,
        change: 15.0,
        icon: Award,
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
        id: 'risk',
        label: 'Risk Analysis',
        icon: Shield,
        content: renderRiskTab
      },
      {
        id: 'optimization',
        label: 'Optimization',
        icon: Zap,
        content: renderOptimizationTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default PortfolioOptimizationDashboard;