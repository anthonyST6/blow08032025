import React from 'react';
import {
  Pill,
  Activity,
  Target,
  TrendingUp,
  FileText,
  CheckCircle,
  BarChart2,
  Award,
  Heart,
  Users,
  BookOpen,
  ThumbsUp
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

interface TreatmentRecommendationDashboardProps {
  useCase: UseCase;
}

const TreatmentRecommendationDashboard: React.FC<TreatmentRecommendationDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = healthcareDataGenerators.treatmentRecommend();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Recommendation Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Pill className="h-5 w-5 text-blue-500 mr-2" />
          Treatment Recommendation Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.recommendationMetrics.totalRecommendations.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Recommendations</p>
            <p className="text-xs text-green-500 mt-1">↑ 22% this month</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <ThumbsUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.recommendationMetrics.acceptanceRate}%</p>
            <p className="text-sm text-gray-500">Acceptance Rate</p>
            <p className="text-xs text-green-500 mt-1">↑ 3.2% improvement</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.recommendationMetrics.outcomeImprovement}%</p>
            <p className="text-sm text-gray-500">Outcome Improvement</p>
            <p className="text-xs text-purple-500 mt-1">vs standard care</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
            <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.recommendationMetrics.guidelineCompliance}%</p>
            <p className="text-sm text-gray-500">Guideline Compliance</p>
            <p className="text-xs text-orange-500 mt-1">Clinical standards</p>
          </div>
        </div>
      </motion.div>

      {/* Treatment Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Recommendations by Category</h3>
          {renderChart({
            type: 'bar',
            title: 'Treatment Types',
            data: data.treatmentCategories,
            dataKeys: ['category', 'count'],
            colors: [CHART_COLORS[0]],
            height: 300
          }, isDarkMode)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Acceptance Rate by Category</h3>
          <div className="space-y-3">
            {data.treatmentCategories.map((category, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm">{category.acceptance}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      category.acceptance >= 85 ? 'bg-green-500' :
                      category.acceptance >= 75 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${category.acceptance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Outcome Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Patient Outcome Trends</h3>
        {renderChart({
          type: 'area',
          title: '90-Day Outcome Improvement',
          data: data.outcomeAnalysis,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[2]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Evidence Tab
  const renderEvidenceTab = () => (
    <div className="space-y-6">
      {/* Evidence Levels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
          Evidence-Based Recommendations
        </h3>
        <div className="space-y-4">
          {data.evidenceLevels.map((level, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{level.level}</p>
                  <p className="text-sm text-gray-500">{level.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{level.count.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">recommendations</p>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    index === 0 ? 'bg-green-500' :
                    index === 1 ? 'bg-blue-500' :
                    index === 2 ? 'bg-purple-500' :
                    index === 3 ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${(level.count / data.evidenceLevels[0].count) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Evidence Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Evidence Quality Score</h3>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg className="w-48 h-48">
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
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - data.recommendationMetrics.evidenceBasedScore / 100)}`}
                className="text-blue-500 transform -rotate-90 origin-center transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{data.recommendationMetrics.evidenceBasedScore}%</span>
              <span className="text-sm text-gray-500">Evidence Score</span>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-2xl font-bold">87%</p>
            <p className="text-sm text-gray-500">From RCTs</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-2xl font-bold">13%</p>
            <p className="text-sm text-gray-500">From Meta-analyses</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Studies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Recently Integrated Studies</h3>
        <div className="space-y-3">
          {[
            { study: 'NEJM 2024: Novel Diabetes Management', impact: 'High', recommendations: 234 },
            { study: 'Lancet 2024: Cardiovascular Prevention', impact: 'High', recommendations: 189 },
            { study: 'JAMA 2024: Cancer Immunotherapy', impact: 'Medium', recommendations: 156 },
            { study: 'BMJ 2024: Mental Health Interventions', impact: 'Medium', recommendations: 123 }
          ].map((study, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium">{study.study}</p>
                <p className="text-sm text-gray-500">{study.recommendations} recommendations updated</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                study.impact === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {study.impact} Impact
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Specialty Performance Tab
  const renderSpecialtyTab = () => (
    <div className="space-y-6">
      {/* Specialty Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Performance by Medical Specialty</h3>
        <div className="space-y-4">
          {data.specialtyPerformance.map((specialty, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{specialty.specialty}</p>
                  <p className="text-sm text-gray-500">{specialty.recommendations.toLocaleString()} recommendations</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{specialty.successRate}%</p>
                  <p className="text-xs text-gray-500">Success Rate</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                  <p className="font-medium">{Math.round(specialty.recommendations * 0.82)}</p>
                  <p className="text-xs text-gray-500">Accepted</p>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                  <p className="font-medium">{Math.round(specialty.recommendations * 0.15)}</p>
                  <p className="text-xs text-gray-500">Modified</p>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                  <p className="font-medium">{Math.round(specialty.recommendations * 0.03)}</p>
                  <p className="text-xs text-gray-500">Rejected</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Specialty Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Specialty Performance Comparison</h3>
        {renderChart({
          type: 'radar',
          title: 'Multi-dimensional Analysis',
          data: data.specialtyPerformance.map(s => ({
            subject: s.specialty,
            recommendations: s.recommendations / 50,
            successRate: s.successRate,
            adoption: Math.random() * 100
          })),
          dataKeys: ['recommendations', 'successRate', 'adoption'],
          colors: [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[2]],
          height: 400
        }, isDarkMode)}
      </motion.div>

      {/* Top Performing Areas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Top Performing Treatment Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Highest Success Rates
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Hypertension Management</span>
                <span className="font-medium">92%</span>
              </li>
              <li className="flex justify-between">
                <span>Diabetes Care</span>
                <span className="font-medium">89%</span>
              </li>
              <li className="flex justify-between">
                <span>Preventive Care</span>
                <span className="font-medium">87%</span>
              </li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
              Most Improved
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Mental Health</span>
                <span className="text-green-500">↑ 15%</span>
              </li>
              <li className="flex justify-between">
                <span>Pediatric Care</span>
                <span className="text-green-500">↑ 12%</span>
              </li>
              <li className="flex justify-between">
                <span>Geriatric Medicine</span>
                <span className="text-green-500">↑ 10%</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Analytics Tab
  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.recommendationMetrics.avgResponseTime}</p>
            <p className="text-sm text-gray-500">Avg Response Time</p>
            <p className="text-xs text-green-500">↓ 1.2s</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">8,934</p>
            <p className="text-sm text-gray-500">Active Physicians</p>
            <p className="text-xs text-green-500">↑ 234</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">45,678</p>
            <p className="text-sm text-gray-500">Patients Impacted</p>
            <p className="text-xs text-green-500">↑ 5,432</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <Award className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">4.7/5</p>
            <p className="text-sm text-gray-500">Physician Rating</p>
            <p className="text-xs text-green-500">↑ 0.2</p>
          </div>
        </div>
      </motion.div>

      {/* Treatment Effectiveness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Treatment Effectiveness Analysis</h3>
        {renderChart({
          type: 'bar',
          title: 'Outcome Improvement by Treatment Type',
          data: [
            { treatment: 'Combination Therapy', improvement: 32 },
            { treatment: 'Monotherapy', improvement: 24 },
            { treatment: 'Lifestyle + Medication', improvement: 38 },
            { treatment: 'Lifestyle Only', improvement: 18 },
            { treatment: 'Procedural', improvement: 45 }
          ],
          dataKeys: ['treatment', 'improvement'],
          colors: [CHART_COLORS[2]],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Cost-Effectiveness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Cost-Effectiveness Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Cost Savings by Category</h4>
            {renderChart({
              type: 'pie',
              title: 'Annual Savings Distribution',
              data: [
                { name: 'Reduced Hospitalizations', value: 45 },
                { name: 'Optimized Medications', value: 30 },
                { name: 'Prevented Complications', value: 20 },
                { name: 'Efficient Care Paths', value: 5 }
              ],
              dataKeys: ['value'],
              colors: CHART_COLORS,
              height: 250
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Financial Impact</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Average Cost Reduction</span>
                  <span className="font-medium">$2,340</span>
                </div>
                <p className="text-xs text-gray-500">Per patient per year</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Total Savings</span>
                  <span className="font-medium">$106.8M</span>
                </div>
                <p className="text-xs text-gray-500">Across all patients</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">ROI</span>
                  <span className="font-medium">487%</span>
                </div>
                <p className="text-xs text-gray-500">Return on investment</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Quality Score</span>
                  <span className="font-medium">94/100</span>
                </div>
                <p className="text-xs text-gray-500">Care quality index</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Treatment Recommendation Engine',
    description: 'AI-powered treatment recommendations and clinical decision support',
    kpis: [
      {
        title: 'Recommendations',
        value: data.recommendationMetrics.totalRecommendations.toLocaleString(),
        change: 22.0,
        icon: FileText,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Acceptance Rate',
        value: `${data.recommendationMetrics.acceptanceRate}%`,
        change: 3.2,
        icon: ThumbsUp,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Outcome Improvement',
        value: `${data.recommendationMetrics.outcomeImprovement}%`,
        change: 5.8,
        icon: TrendingUp,
        color: 'purple',
        trend: 'up'
      },
      {
        title: 'Compliance',
        value: `${data.recommendationMetrics.guidelineCompliance}%`,
        change: 1.5,
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
        id: 'evidence',
        label: 'Evidence Base',
        icon: BookOpen,
        content: renderEvidenceTab
      },
      {
        id: 'specialty',
        label: 'Specialty Performance',
        icon: Activity,
        content: renderSpecialtyTab
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: Target,
        content: renderAnalyticsTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default TreatmentRecommendationDashboard;