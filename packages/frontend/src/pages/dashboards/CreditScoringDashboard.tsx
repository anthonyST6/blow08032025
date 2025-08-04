import React from 'react';
import {
  CreditCard,
  TrendingUp,
  Users,
  BarChart2,
  Activity,
  Shield,
  Clock,
  CheckCircle,
  PieChart,
  Target,
  Zap,
  Award
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

interface CreditScoringDashboardProps {
  useCase: UseCase;
}

const CreditScoringDashboard: React.FC<CreditScoringDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = financeDataGenerators.creditScoring();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Credit Scoring Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
          AI Credit Scoring Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.scoringMetrics.applicationsToday.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Applications Today</p>
            <p className="text-xs text-blue-500 mt-1">↑ 15% from yesterday</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.scoringMetrics.approvalRate}%</p>
            <p className="text-sm text-gray-500">Approval Rate</p>
            <p className="text-xs text-green-500 mt-1">↑ 3.2% improvement</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.scoringMetrics.avgScore}</p>
            <p className="text-sm text-gray-500">Average Score</p>
            <p className="text-xs text-purple-500 mt-1">FICO equivalent</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
            <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.scoringMetrics.avgProcessTime}</p>
            <p className="text-sm text-gray-500">Avg Process Time</p>
            <p className="text-xs text-orange-500 mt-1">Real-time decision</p>
          </div>
        </div>
      </motion.div>

      {/* Score Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Credit Score Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'bar',
              title: 'Score Ranges',
              data: data.scoreDistribution,
              dataKeys: ['range', 'count'],
              colors: [CHART_COLORS[0]],
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Score Categories</h4>
            <div className="space-y-3">
              {data.scoreDistribution.map((category, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  category.label === 'Excellent' ? 'bg-green-50 dark:bg-green-900/20' :
                  category.label === 'Very Good' ? 'bg-blue-50 dark:bg-blue-900/20' :
                  category.label === 'Good' ? 'bg-indigo-50 dark:bg-indigo-900/20' :
                  category.label === 'Fair' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{category.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Score: {category.range}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{category.approvalRate}%</p>
                      <p className="text-xs text-gray-500">approval rate</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Approval Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">90-Day Approval Trends</h3>
        {renderChart({
          type: 'line',
          title: 'Approval Rate Over Time',
          data: data.approvalTrends,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[1]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Inclusion & Fairness Tab
  const renderInclusionTab = () => (
    <div className="space-y-6">
      {/* Financial Inclusion Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 text-purple-500 mr-2" />
          Financial Inclusion Impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Thin Files Approved</h4>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {data.inclusionMetrics.thinFiles}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Limited credit history
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-2">No Files Approved</h4>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {data.inclusionMetrics.noFiles}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No credit history
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Total Included</h4>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {data.inclusionMetrics.approved}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Previously excluded
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Alternative Data</h4>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {data.inclusionMetrics.alternativeData}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Using alt. sources
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bias Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 text-green-500 mr-2" />
          Fairness & Bias Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Disparity Analysis</h4>
            <div className="space-y-3">
              {data.biasAnalysis.map((group, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{group.group}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      group.status === 'compliant' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {group.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Disparity Index
                    </span>
                    <span className="font-medium">{group.disparity}%</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${
                        group.disparity <= 1 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${100 - (group.disparity * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Inclusion Metrics</h4>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <div className="text-center mb-4">
                <Award className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{data.scoringMetrics.inclusionRate}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Financial Inclusion Rate
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Traditional Methods</span>
                  <span className="font-medium">12%</span>
                </div>
                <div className="flex justify-between">
                  <span>AI-Enhanced</span>
                  <span className="font-medium text-green-600">{data.scoringMetrics.inclusionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Improvement</span>
                  <span className="font-medium text-purple-600">+{data.scoringMetrics.inclusionRate - 12}%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h5 className="font-medium mb-2">Fairness Score</h5>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {data.scoringMetrics.fairnessScore}%
                </span>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Exceeds regulatory requirements
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alternative Data Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Alternative Data Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { source: 'Utility Payments', weight: 15, accuracy: 87, icon: Zap },
            { source: 'Rent History', weight: 20, accuracy: 92, icon: Users },
            { source: 'Banking Behavior', weight: 25, accuracy: 94, icon: CreditCard },
            { source: 'Employment Data', weight: 20, accuracy: 89, icon: BarChart2 },
            { source: 'Education', weight: 10, accuracy: 78, icon: Award },
            { source: 'Social Indicators', weight: 10, accuracy: 72, icon: Activity }
          ].map((source, index) => {
            const Icon = source.icon;
            return (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-medium text-gray-500">
                    {source.weight}% weight
                  </span>
                </div>
                <h4 className="font-medium mb-2">{source.source}</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Accuracy</span>
                  <span className="font-medium">{source.accuracy}%</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${source.accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );

  // Performance Tab
  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Model Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Model Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Activity className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-2xl font-bold">94.2%</p>
            <p className="text-sm text-gray-500">Prediction Accuracy</p>
            <p className="text-xs text-green-500 mt-1">↑ 2.1% this month</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Target className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">0.89</p>
            <p className="text-sm text-gray-500">AUC Score</p>
            <p className="text-xs text-blue-500 mt-1">Excellent performance</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <BarChart2 className="h-6 w-6 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">3.2%</p>
            <p className="text-sm text-gray-500">Default Rate</p>
            <p className="text-xs text-purple-500 mt-1">↓ 0.8% reduction</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Clock className="h-6 w-6 text-orange-500 mb-2" />
            <p className="text-2xl font-bold">18 sec</p>
            <p className="text-sm text-gray-500">Avg Decision Time</p>
            <p className="text-xs text-orange-500 mt-1">↓ 5 sec faster</p>
          </div>
        </div>
      </motion.div>

      {/* Portfolio Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Portfolio Performance Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Default Rate by Score Range</h4>
            {renderChart({
              type: 'bar',
              title: 'Default Rate (%)',
              data: data.scoreDistribution.map(s => ({
                range: s.label,
                defaultRate: s.label === 'Poor' ? 12.5 : 
                            s.label === 'Fair' ? 7.2 :
                            s.label === 'Good' ? 3.8 :
                            s.label === 'Very Good' ? 1.5 : 0.4
              })),
              dataKeys: ['range', 'defaultRate'],
              colors: [CHART_COLORS[3]],
              height: 250
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Revenue Impact</h4>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Additional Revenue</span>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">$4.2M</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  From expanded approvals (monthly)
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Loss Reduction</span>
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">$1.8M</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  From improved risk assessment
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Net Impact</span>
                  <Award className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">$6.0M</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Total monthly benefit
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* System Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">System Performance & Reliability</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">API Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uptime</span>
                <span className="font-medium">99.99%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Response</span>
                <span className="font-medium">245ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Requests/day</span>
                <span className="font-medium">125K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Error Rate</span>
                <span className="font-medium">0.01%</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">Model Updates</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Version</span>
                <span className="font-medium">v4.2.1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Retrained</span>
                <span className="font-medium">3 days ago</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Data Points</span>
                <span className="font-medium">12.5M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Features</span>
                <span className="font-medium">847</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">Compliance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>FCRA</span>
                <span className="font-medium text-green-600">Compliant</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ECOA</span>
                <span className="font-medium text-green-600">Compliant</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GDPR</span>
                <span className="font-medium text-green-600">Compliant</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Audit Status</span>
                <span className="font-medium text-green-600">Passed</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'AI Credit Scoring',
    description: 'Inclusive and fair credit scoring powered by artificial intelligence',
    kpis: [
      {
        title: 'Applications',
        value: data.scoringMetrics.applicationsToday.toLocaleString(),
        change: 15.0,
        icon: Users,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Approval Rate',
        value: `${data.scoringMetrics.approvalRate}%`,
        change: 3.2,
        icon: CheckCircle,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Inclusion Rate',
        value: `${data.scoringMetrics.inclusionRate}%`,
        change: 22.0,
        icon: Award,
        color: 'purple',
        trend: 'up'
      },
      {
        title: 'Process Time',
        value: data.scoringMetrics.avgProcessTime,
        change: -21.7,
        icon: Clock,
        color: 'orange',
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
        id: 'inclusion',
        label: 'Inclusion & Fairness',
        icon: Users,
        content: renderInclusionTab
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

export default CreditScoringDashboard;