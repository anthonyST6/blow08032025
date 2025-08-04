import React from 'react';
import {
  Shield,
  AlertTriangle,
  FileText,
  Globe,
  Activity,
  BarChart2,
  Clock,
  Search,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
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

interface AMLMonitoringDashboardProps {
  useCase: UseCase;
}

const AMLMonitoringDashboard: React.FC<AMLMonitoringDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = financeDataGenerators.amlMonitoring();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* AML Monitoring Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 text-blue-500 mr-2" />
          AML Transaction Monitoring Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <Search className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{(data.monitoringMetrics.transactionsScreened / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-gray-500">Transactions Screened</p>
            <p className="text-xs text-blue-500 mt-1">Today's volume</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.monitoringMetrics.alertsGenerated.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Alerts Generated</p>
            <p className="text-xs text-orange-500 mt-1">Requiring review</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-lg">
            <FileText className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.monitoringMetrics.sarsFiled}</p>
            <p className="text-sm text-gray-500">SARs Filed</p>
            <p className="text-xs text-red-500 mt-1">This month</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.monitoringMetrics.complianceScore}%</p>
            <p className="text-sm text-gray-500">Compliance Score</p>
            <p className="text-xs text-green-500 mt-1">Regulatory adherence</p>
          </div>
        </div>
      </motion.div>

      {/* Alert Types Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Alert Types Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'bar',
              title: 'Alerts by Type',
              data: data.alertsByType,
              dataKeys: ['type', 'count'],
              colors: [CHART_COLORS[0]],
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Alert Details</h4>
            <div className="space-y-3">
              {data.alertsByType.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  alert.risk === 'critical' ? 'bg-red-50 dark:bg-red-900/20' :
                  alert.risk === 'high' ? 'bg-orange-50 dark:bg-orange-900/20' :
                  'bg-yellow-50 dark:bg-yellow-900/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{alert.type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.risk === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      alert.risk === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {alert.risk.toUpperCase()} RISK
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{alert.count} alerts</span>
                    <span>{alert.sars} SARs filed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alert Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">90-Day Alert Trends</h3>
        {renderChart({
          type: 'area',
          title: 'Daily Alert Volume',
          data: data.alertTrends,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[2]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Risk Analysis Tab
  const renderRiskTab = () => (
    <div className="space-y-6">
      {/* Risk Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="h-5 w-5 text-red-500 mr-2" />
          Entity Risk Heatmap
        </h3>
        <div className="space-y-4">
          {data.riskHeatmap.map((entity, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{entity.entity}</p>
                  <p className="text-sm text-gray-500">
                    {entity.transactions.toLocaleString()} transactions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{entity.risk}</p>
                  <p className="text-xs text-gray-500">Risk Score</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Alerts Generated</span>
                  <p className="font-medium">{entity.alerts}</p>
                </div>
                <div>
                  <span className="text-gray-500">Alert Rate</span>
                  <p className="font-medium">{((entity.alerts / entity.transactions) * 100).toFixed(2)}%</p>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    entity.risk >= 80 ? 'bg-red-500' :
                    entity.risk >= 60 ? 'bg-orange-500' :
                    entity.risk >= 40 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${entity.risk}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Investigation Queue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
          Investigation Queue
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b dark:border-gray-700">
                <th className="pb-3">Alert ID</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Age</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {data.investigationQueue.map((item, index) => (
                <tr key={index} className="text-sm">
                  <td className="py-3 font-medium">{item.id}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      item.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3">${(item.amount / 1000000).toFixed(1)}M</td>
                  <td className="py-3">{item.age}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'investigating' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      item.status === 'escalated' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      item.status === 'reviewing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Geographic Risk Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Globe className="h-5 w-5 text-blue-500 mr-2" />
          Geographic Risk Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { region: 'High Risk Countries', transactions: 12345, alerts: 456, risk: 'critical' },
            { region: 'Offshore Centers', transactions: 23456, alerts: 234, risk: 'high' },
            { region: 'Sanctioned Regions', transactions: 3456, alerts: 123, risk: 'critical' },
            { region: 'Tax Havens', transactions: 34567, alerts: 345, risk: 'high' },
            { region: 'Conflict Zones', transactions: 2345, alerts: 89, risk: 'high' },
            { region: 'Domestic', transactions: 456789, alerts: 567, risk: 'low' }
          ].map((region, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              region.risk === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              region.risk === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
              'bg-green-50 dark:bg-green-900/20 border-green-500'
            }`}>
              <h4 className="font-medium mb-2">{region.region}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transactions</span>
                  <span className="font-medium">{region.transactions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Alerts</span>
                  <span className="font-medium">{region.alerts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Alert Rate</span>
                  <span className="font-medium">{((region.alerts / region.transactions) * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Compliance Tab
  const renderComplianceTab = () => (
    <div className="space-y-6">
      {/* Compliance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 text-green-500 mr-2" />
          Regulatory Compliance Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="text-xs text-green-500">Excellent</span>
            </div>
            <p className="text-2xl font-bold">{data.complianceMetrics.regulatoryScore}%</p>
            <p className="text-sm text-gray-500">Regulatory Score</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <span className="text-xs text-yellow-500">Active</span>
            </div>
            <p className="text-2xl font-bold">{data.complianceMetrics.auditFindings}</p>
            <p className="text-sm text-gray-500">Audit Findings</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-6 w-6 text-blue-500" />
              <span className="text-xs text-blue-500">In Progress</span>
            </div>
            <p className="text-2xl font-bold">{data.complianceMetrics.remediationProgress}%</p>
            <p className="text-sm text-gray-500">Remediation Progress</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-6 w-6 text-purple-500" />
              <span className="text-xs text-purple-500">Current</span>
            </div>
            <p className="text-2xl font-bold">{data.complianceMetrics.trainingCompliance}%</p>
            <p className="text-sm text-gray-500">Training Compliance</p>
          </div>
        </div>
      </motion.div>

      {/* SAR Filing Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">SAR Filing Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Filing Trends</h4>
            {renderChart({
              type: 'line',
              title: 'Monthly SAR Filings',
              data: data.alertTrends.slice(0, 30).map((item, index) => ({
                date: item.date,
                sars: Math.floor(Math.random() * 5) + 1
              })),
              dataKeys: ['date', 'sars'],
              colors: [CHART_COLORS[3]],
              height: 250
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Filing Statistics</h4>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Total SARs (YTD)</span>
                  <FileText className="h-5 w-5 text-gray-500" />
                </div>
                <p className="text-2xl font-bold">287</p>
                <p className="text-xs text-gray-500 mt-1">↑ 12% from last year</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Avg Filing Time</span>
                  <Clock className="h-5 w-5 text-gray-500" />
                </div>
                <p className="text-2xl font-bold">18 days</p>
                <p className="text-xs text-gray-500 mt-1">Within 30-day requirement</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Quality Score</span>
                  <Award className="h-5 w-5 text-gray-500" />
                </div>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-gray-500 mt-1">Regulatory feedback</p>
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
        <h3 className="text-lg font-semibold mb-4">System Performance & Efficiency</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">Detection Efficiency</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>True Positive Rate</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>False Positive Rate</span>
                <span className="font-medium">{data.monitoringMetrics.falsePositiveRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Alert Quality</span>
                <span className="font-medium">Good</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">Processing Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avg Investigation Time</span>
                <span className="font-medium">{data.monitoringMetrics.avgInvestigationTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Alert Closure Rate</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Backlog</span>
                <span className="font-medium">47 alerts</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">Model Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Model Version</span>
                <span className="font-medium">v2.8.3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Updated</span>
                <span className="font-medium">1 week ago</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span className="font-medium">91.3%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'AML Transaction Monitoring',
    description: 'AI-powered anti-money laundering detection and compliance system',
    kpis: [
      {
        title: 'Transactions',
        value: `${(data.monitoringMetrics.transactionsScreened / 1000000).toFixed(1)}M`,
        change: 8.5,
        icon: Search,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Alerts',
        value: data.monitoringMetrics.alertsGenerated.toLocaleString(),
        change: -12.3,
        icon: AlertTriangle,
        color: 'orange',
        trend: 'down'
      },
      {
        title: 'SARs Filed',
        value: data.monitoringMetrics.sarsFiled.toString(),
        change: 15.0,
        icon: FileText,
        color: 'red',
        trend: 'up'
      },
      {
        title: 'Compliance',
        value: `${data.monitoringMetrics.complianceScore}%`,
        change: 2.1,
        icon: Shield,
        color: 'green',
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
        icon: Activity,
        content: renderRiskTab
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: Shield,
        content: renderComplianceTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default AMLMonitoringDashboard;