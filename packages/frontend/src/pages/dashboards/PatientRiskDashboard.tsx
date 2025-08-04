import React from 'react';
import {
  Heart,
  AlertTriangle,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  Target,
  BarChart2,
  Shield,
  Clock,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import DashboardTemplate, {
  DashboardConfig,
  ChartConfig,
  renderChart,
  CHART_COLORS
} from '../../components/dashboards/DashboardTemplate';
import { UseCase } from '../../config/verticals';
import { healthcareDataGenerators } from '../../utils/dashboard-data-generators';
import { motion } from 'framer-motion';

interface PatientRiskDashboardProps {
  useCase: UseCase;
}

const PatientRiskDashboard: React.FC<PatientRiskDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = healthcareDataGenerators.patientRisk();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Risk Distribution Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Heart className="h-5 w-5 text-red-500 mr-2" />
          Patient Risk Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.riskMetrics.totalPatients.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Patients</p>
            <p className="text-xs text-green-500 mt-1">↑ 5.2% this month</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.riskMetrics.highRisk.toLocaleString()}</p>
            <p className="text-sm text-gray-500">High Risk</p>
            <p className="text-xs text-red-500 mt-1">15% of population</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-lg">
            <Activity className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.riskMetrics.mediumRisk.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Medium Risk</p>
            <p className="text-xs text-yellow-500 mt-1">27.5% of population</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.riskMetrics.lowRisk.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Low Risk</p>
            <p className="text-xs text-green-500 mt-1">57.5% of population</p>
          </div>
        </div>
      </motion.div>

      {/* Risk Score Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Risk Score Distribution</h3>
        {renderChart({
          type: 'bar',
          title: 'Patients by Risk Score Range',
          data: data.riskDistribution,
          dataKeys: ['score', 'count'],
          colors: [CHART_COLORS[0]],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Readmission Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 text-green-500 mr-2" />
            Readmission Rate Trend
          </h3>
          <div className="mb-4">
            <p className="text-3xl font-bold">{data.riskMetrics.readmissionRate}%</p>
            <p className="text-sm text-gray-500">Current 30-day readmission rate</p>
            <p className="text-xs text-green-500">↓ 2.3% from last quarter</p>
          </div>
          {renderChart({
            type: 'line',
            title: '6-Month Readmission Trend',
            data: data.readmissionTrends.slice(-30),
            dataKeys: ['date', 'value'],
            colors: [CHART_COLORS[2]],
            height: 200
          }, isDarkMode)}
        </motion.div>

        {/* Average Risk Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="h-5 w-5 text-blue-500 mr-2" />
            Risk Score Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-sm">Average Risk Score</span>
              <span className="text-xl font-bold">{data.riskMetrics.avgRiskScore}</span>
            </div>
            <div className="space-y-2">
              {data.riskDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          item.label === 'Critical' ? 'bg-red-500' :
                          item.label === 'High' ? 'bg-orange-500' :
                          item.label === 'Medium' ? 'bg-yellow-500' :
                          item.label === 'Low' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(item.count / data.riskMetrics.totalPatients) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs w-12 text-right">{((item.count / data.riskMetrics.totalPatients) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Interventions Tab
  const renderInterventionsTab = () => (
    <div className="space-y-6">
      {/* Intervention Success Rates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Intervention Effectiveness</h3>
        <div className="space-y-4">
          {data.interventionSuccess.map((intervention, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{intervention.intervention}</p>
                  <p className="text-sm text-gray-500">{intervention.patients} patients enrolled</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{intervention.success}%</p>
                  <p className="text-xs text-gray-500">Success Rate</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      intervention.success >= 80 ? 'bg-green-500' :
                      intervention.success >= 70 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${intervention.success}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Intervention Impact Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Intervention Impact Analysis</h3>
        {renderChart({
          type: 'radar',
          title: 'Success Rate by Intervention Type',
          data: data.interventionSuccess.map(item => ({
            subject: item.intervention,
            success: item.success,
            patients: item.patients / 10
          })),
          dataKeys: ['success', 'patients'],
          colors: [CHART_COLORS[0], CHART_COLORS[1]],
          height: 400
        }, isDarkMode)}
      </motion.div>

      {/* Recommended Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Recommended Actions</h3>
        <div className="space-y-3">
          {[
            { action: 'Expand Telehealth Monitoring', impact: 'High', patients: 450, priority: 1 },
            { action: 'Increase Care Coordination Staff', impact: 'Medium', patients: 320, priority: 2 },
            { action: 'Enhance Medication Management', impact: 'High', patients: 280, priority: 3 },
            { action: 'Deploy Home Health Services', impact: 'Medium', patients: 210, priority: 4 }
          ].map((action, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  action.priority === 1 ? 'bg-red-500' :
                  action.priority === 2 ? 'bg-orange-500' :
                  action.priority === 3 ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}>
                  {action.priority}
                </div>
                <div>
                  <p className="font-medium">{action.action}</p>
                  <p className="text-sm text-gray-500">Affects {action.patients} patients</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                action.impact === 'High' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {action.impact} Impact
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Cost Impact Tab
  const renderCostImpactTab = () => (
    <div className="space-y-6">
      {/* Financial Impact Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="h-5 w-5 text-green-500 mr-2" />
          Financial Impact Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">${data.costImpact.saved}M</p>
            <p className="text-sm text-gray-500">Total Savings</p>
            <p className="text-xs text-green-500 mt-1">Last 12 months</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <TrendingDown className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">${data.costImpact.prevented}M</p>
            <p className="text-sm text-gray-500">Prevented Costs</p>
            <p className="text-xs text-blue-500 mt-1">Avoided readmissions</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.costImpact.roiPercentage}%</p>
            <p className="text-sm text-gray-500">ROI</p>
            <p className="text-xs text-purple-500 mt-1">Program effectiveness</p>
          </div>
        </div>
      </motion.div>

      {/* Cost Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Cost Savings by Category</h3>
        {renderChart({
          type: 'pie',
          title: 'Savings Distribution',
          data: [
            { name: 'Prevented Readmissions', value: 45 },
            { name: 'Early Interventions', value: 30 },
            { name: 'Medication Adherence', value: 15 },
            { name: 'Emergency Visit Reduction', value: 10 }
          ],
          dataKeys: ['value'],
          colors: CHART_COLORS,
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* ROI Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Return on Investment Analysis</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">Program Investment vs. Savings</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Program Cost</span>
                <span className="font-medium">$3.9M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Savings</span>
                <span className="font-medium text-green-500">$12.3M</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t dark:border-gray-600">
                <span className="text-sm font-medium">Net Benefit</span>
                <span className="text-xl font-bold text-green-500">$8.4M</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Cost per Patient</h4>
              <p className="text-2xl font-bold">$313</p>
              <p className="text-xs text-gray-500">Average intervention cost</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Savings per Patient</h4>
              <p className="text-2xl font-bold">$988</p>
              <p className="text-xs text-gray-500">Average savings achieved</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Analytics Tab
  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Risk Factors Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Top Risk Factors</h3>
        <div className="space-y-3">
          {[
            { factor: 'Chronic Conditions', weight: 35, patients: 4567 },
            { factor: 'Medication Non-Adherence', weight: 25, patients: 3234 },
            { factor: 'Social Determinants', weight: 20, patients: 2876 },
            { factor: 'Previous Hospitalizations', weight: 15, patients: 2134 },
            { factor: 'Age > 65', weight: 5, patients: 1567 }
          ].map((factor, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{factor.factor}</p>
                  <p className="text-sm text-gray-500">{factor.patients.toLocaleString()} patients affected</p>
                </div>
                <span className="text-lg font-bold">{factor.weight}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${factor.weight}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Predictive Model Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Predictive Model Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Model Accuracy Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">Precision</span>
                <span className="font-medium">92.3%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">Recall</span>
                <span className="font-medium">88.7%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">F1 Score</span>
                <span className="font-medium">90.4%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">AUC-ROC</span>
                <span className="font-medium">0.94</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Confusion Matrix</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded text-center">
                <p className="text-2xl font-bold">1,523</p>
                <p className="text-xs text-gray-500">True Positives</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded text-center">
                <p className="text-2xl font-bold">134</p>
                <p className="text-xs text-gray-500">False Positives</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded text-center">
                <p className="text-2xl font-bold">187</p>
                <p className="text-xs text-gray-500">False Negatives</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded text-center">
                <p className="text-2xl font-bold">8,606</p>
                <p className="text-xs text-gray-500">True Negatives</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Population Health Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Population Health Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <UserCheck className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xl font-bold">78%</p>
            <p className="text-sm text-gray-500">Engagement Rate</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold">4.2 days</p>
            <p className="text-sm text-gray-500">Avg Response Time</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <CheckCircle className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xl font-bold">91%</p>
            <p className="text-sm text-gray-500">Care Plan Adherence</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Patient Risk Stratification',
    description: 'AI-powered patient risk assessment and intervention management',
    kpis: [
      {
        title: 'Total Patients',
        value: data.riskMetrics.totalPatients.toLocaleString(),
        change: 5.2,
        icon: Users,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'High Risk',
        value: data.riskMetrics.highRisk.toLocaleString(),
        change: -8.3,
        icon: AlertTriangle,
        color: 'red',
        trend: 'down'
      },
      {
        title: 'Readmission Rate',
        value: `${data.riskMetrics.readmissionRate}%`,
        change: -15.7,
        icon: TrendingDown,
        color: 'green',
        trend: 'down'
      },
      {
        title: 'Cost Savings',
        value: `$${data.costImpact.saved}M`,
        change: 23.4,
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
        id: 'interventions',
        label: 'Interventions',
        icon: Target,
        content: renderInterventionsTab
      },
      {
        id: 'cost-impact',
        label: 'Cost Impact',
        icon: DollarSign,
        content: renderCostImpactTab
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: Activity,
        content: renderAnalyticsTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default PatientRiskDashboard;