import React from 'react';
import {
  Brain,
  Activity,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BarChart2,
  Zap,
  FileSearch,
  Award,
  Stethoscope,
  PieChart
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

interface DiagnosisAssistantDashboardProps {
  useCase: UseCase;
}

const DiagnosisAssistantDashboard: React.FC<DiagnosisAssistantDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = healthcareDataGenerators.diagnosisAssist();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Diagnostic Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Brain className="h-5 w-5 text-purple-500 mr-2" />
          AI Diagnosis Assistant Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <FileSearch className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.diagnosticMetrics.casesAnalyzed.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Cases Analyzed</p>
            <p className="text-xs text-green-500 mt-1">↑ 18% this month</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.diagnosticMetrics.avgAccuracy}%</p>
            <p className="text-sm text-gray-500">Average Accuracy</p>
            <p className="text-xs text-green-500 mt-1">↑ 2.3% improvement</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.diagnosticMetrics.avgTimeToSuggestion}</p>
            <p className="text-sm text-gray-500">Avg Response Time</p>
            <p className="text-xs text-blue-500 mt-1">↓ 0.8s faster</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
            <Stethoscope className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.diagnosticMetrics.specialtiesCovered}</p>
            <p className="text-sm text-gray-500">Specialties Covered</p>
            <p className="text-xs text-orange-500 mt-1">+3 new this quarter</p>
          </div>
        </div>
      </motion.div>

      {/* Accuracy by Specialty */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Accuracy by Medical Specialty</h3>
        <div className="space-y-4">
          {data.accuracyBySpecialty.map((specialty, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{specialty.specialty}</p>
                  <p className="text-sm text-gray-500">{specialty.cases.toLocaleString()} cases analyzed</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{specialty.accuracy}%</p>
                  <p className="text-xs text-gray-500">Accuracy</p>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    specialty.accuracy >= 96 ? 'bg-green-500' :
                    specialty.accuracy >= 94 ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${specialty.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Diagnosis Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Daily Diagnosis Volume</h3>
        {renderChart({
          type: 'area',
          title: '30-Day Trend',
          data: data.diagnosisTrends,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[0]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Confidence Analysis Tab
  const renderConfidenceTab = () => (
    <div className="space-y-6">
      {/* Confidence Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Confidence Level Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'bar',
              title: 'Cases by Confidence Range',
              data: data.confidenceDistribution,
              dataKeys: ['range', 'count'],
              colors: [CHART_COLORS[0]],
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            {renderChart({
              type: 'pie',
              title: 'Confidence Distribution',
              data: data.confidenceDistribution.map(item => ({
                name: item.label,
                value: item.count
              })),
              dataKeys: ['value'],
              colors: CHART_COLORS,
              height: 300
            }, isDarkMode)}
          </div>
        </div>
      </motion.div>

      {/* Confidence Threshold Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Confidence Threshold Settings</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium">Current Threshold</p>
                <p className="text-sm text-gray-500">Minimum confidence for auto-suggestion</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{data.diagnosticMetrics.confidenceThreshold}%</p>
              </div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full relative">
              <div 
                className="h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                style={{ width: '100%' }}
              />
              <div 
                className="absolute top-0 h-4 w-1 bg-gray-800 dark:bg-white"
                style={{ left: `${data.diagnosticMetrics.confidenceThreshold}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Below Threshold</h4>
              <p className="text-2xl font-bold">183</p>
              <p className="text-sm text-gray-500">Cases for review</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Near Threshold</h4>
              <p className="text-2xl font-bold">543</p>
              <p className="text-sm text-gray-500">85-90% confidence</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium mb-2">High Confidence</h4>
              <p className="text-2xl font-bold">8,208</p>
              <p className="text-sm text-gray-500">Above 90%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Review Required Cases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Cases Requiring Review</h3>
        <div className="space-y-3">
          {[
            { id: 'CASE-8934', specialty: 'Neurology', confidence: 78, reason: 'Rare condition' },
            { id: 'CASE-8921', specialty: 'Oncology', confidence: 82, reason: 'Complex presentation' },
            { id: 'CASE-8907', specialty: 'Cardiology', confidence: 79, reason: 'Conflicting symptoms' },
            { id: 'CASE-8895', specialty: 'Rheumatology', confidence: 81, reason: 'Insufficient data' }
          ].map((case_, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium">{case_.id}</p>
                <p className="text-sm text-gray-500">{case_.specialty} • {case_.reason}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">{case_.confidence}% confidence</span>
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Conditions Tab
  const renderConditionsTab = () => (
    <div className="space-y-6">
      {/* Top Detected Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Most Frequently Detected Conditions</h3>
        <div className="space-y-4">
          {data.topConditions.map((condition, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{condition.condition}</p>
                  <p className="text-sm text-gray-500">{condition.detections} detections this month</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{condition.accuracy}%</p>
                  <p className="text-xs text-gray-500">Accuracy</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    style={{ width: `${(condition.detections / data.topConditions[0].detections) * 100}%` }}
                  />
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Condition Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Conditions by Category</h3>
        {renderChart({
          type: 'radar',
          title: 'Detection Distribution',
          data: [
            { subject: 'Infectious', A: 85, B: 92 },
            { subject: 'Chronic', A: 78, B: 88 },
            { subject: 'Acute', A: 92, B: 95 },
            { subject: 'Mental Health', A: 72, B: 82 },
            { subject: 'Genetic', A: 68, B: 78 },
            { subject: 'Autoimmune', A: 75, B: 85 }
          ],
          dataKeys: ['A', 'B'],
          colors: [CHART_COLORS[0], CHART_COLORS[1]],
          height: 400
        }, isDarkMode)}
      </motion.div>

      {/* Rare Conditions Detection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Rare Conditions Detection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center">
              <Award className="h-4 w-4 text-purple-500 mr-2" />
              Successfully Identified
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Fabry Disease</span>
                <span className="font-medium">3 cases</span>
              </li>
              <li className="flex justify-between">
                <span>Gaucher Disease</span>
                <span className="font-medium">2 cases</span>
              </li>
              <li className="flex justify-between">
                <span>Pompe Disease</span>
                <span className="font-medium">1 case</span>
              </li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-3">Detection Statistics</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Rare Disease Accuracy</span>
                <span className="font-medium">89.3%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Time to Detection</span>
                <span className="font-medium">4.8 sec</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Rare Cases</span>
                <span className="font-medium">47</span>
              </div>
            </div>
          </div>
        </div>
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
        <h3 className="text-lg font-semibold mb-4">AI Model Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <Activity className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.performanceMetrics.sensitivity}%</p>
            <p className="text-sm text-gray-500">Sensitivity</p>
            <p className="text-xs text-green-500">↑ 1.2%</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.performanceMetrics.specificity}%</p>
            <p className="text-sm text-gray-500">Specificity</p>
            <p className="text-xs text-blue-500">↑ 0.8%</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <CheckCircle className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.performanceMetrics.ppv}%</p>
            <p className="text-sm text-gray-500">PPV</p>
            <p className="text-xs text-purple-500">↑ 2.1%</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <Award className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.performanceMetrics.npv}%</p>
            <p className="text-sm text-gray-500">NPV</p>
            <p className="text-xs text-orange-500">↑ 0.5%</p>
          </div>
        </div>
      </motion.div>

      {/* Model Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Model Version Comparison</h3>
        {renderChart({
          type: 'line',
          title: 'Accuracy Over Time',
          data: [
            { month: 'Jan', v1: 88, v2: 91, v3: 94.5 },
            { month: 'Feb', v1: 88.5, v2: 91.8, v3: 94.7 },
            { month: 'Mar', v1: 89, v2: 92.3, v3: 94.8 },
            { month: 'Apr', v1: 89.2, v2: 92.8, v3: 95.1 },
            { month: 'May', v1: 89.5, v2: 93.2, v3: 95.3 },
            { month: 'Jun', v1: 89.8, v2: 93.5, v3: 95.5 }
          ],
          dataKeys: ['month', 'v1', 'v2', 'v3'],
          colors: [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[2]],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Processing Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Processing Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Response Time Distribution</h4>
            {renderChart({
              type: 'bar',
              title: 'Cases by Response Time',
              data: [
                { range: '0-1s', count: 2345 },
                { range: '1-2s', count: 3456 },
                { range: '2-3s', count: 2134 },
                { range: '3-4s', count: 876 },
                { range: '4-5s', count: 123 }
              ],
              dataKeys: ['range', 'count'],
              colors: [CHART_COLORS[0]],
              height: 250
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">System Performance</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">CPU Usage</span>
                  <span className="text-sm font-medium">42%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Memory Usage</span>
                  <span className="text-sm font-medium">68%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">GPU Usage</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div className="h-2 bg-purple-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Queue Length</span>
                  <span className="text-sm font-medium">23 cases</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div className="h-2 bg-orange-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'AI Diagnosis Assistant',
    description: 'AI-powered diagnostic support and clinical decision assistance',
    kpis: [
      {
        title: 'Cases Analyzed',
        value: data.diagnosticMetrics.casesAnalyzed.toLocaleString(),
        change: 18.0,
        icon: FileSearch,
        color: 'purple',
        trend: 'up'
      },
      {
        title: 'Accuracy',
        value: `${data.diagnosticMetrics.avgAccuracy}%`,
        change: 2.3,
        icon: Target,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Response Time',
        value: data.diagnosticMetrics.avgTimeToSuggestion,
        change: -20.0,
        icon: Zap,
        color: 'blue',
        trend: 'down'
      },
      {
        title: 'Conditions',
        value: data.diagnosticMetrics.conditionsDetected.toLocaleString(),
        change: 12.5,
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
        id: 'confidence',
        label: 'Confidence Analysis',
        icon: AlertCircle,
        content: renderConfidenceTab
      },
      {
        id: 'conditions',
        label: 'Conditions',
        icon: Stethoscope,
        content: renderConditionsTab
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

export default DiagnosisAssistantDashboard;