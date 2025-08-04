import React from 'react';
import {
  Search,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart2,
  Globe,
  Activity,
  FileText,
  Zap,
  MapPin
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

interface ClinicalTrialMatchingDashboardProps {
  useCase: UseCase;
}

const ClinicalTrialMatchingDashboard: React.FC<ClinicalTrialMatchingDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = healthcareDataGenerators.clinicalTrialMatching();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Matching Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Search className="h-5 w-5 text-blue-500 mr-2" />
          Clinical Trial Matching Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.matchingMetrics.activeTrials}</p>
            <p className="text-sm text-gray-500">Active Trials</p>
            <p className="text-xs text-green-500 mt-1">↑ 12% this quarter</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.matchingMetrics.eligiblePatients.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Eligible Patients</p>
            <p className="text-xs text-blue-500 mt-1">In database</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.matchingMetrics.matchedToday}</p>
            <p className="text-sm text-gray-500">Matched Today</p>
            <p className="text-xs text-purple-500 mt-1">↑ 23% vs yesterday</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
            <CheckCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.matchingMetrics.enrollmentRate}%</p>
            <p className="text-sm text-gray-500">Enrollment Rate</p>
            <p className="text-xs text-orange-500 mt-1">Of matched patients</p>
          </div>
        </div>
      </motion.div>

      {/* Trials by Phase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Trials by Phase</h3>
          {renderChart({
            type: 'bar',
            title: 'Active Trials Distribution',
            data: data.trialsByPhase,
            dataKeys: ['phase', 'count'],
            colors: [CHART_COLORS[0]],
            height: 250
          }, isDarkMode)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Enrollment by Phase</h3>
          {renderChart({
            type: 'pie',
            title: 'Patient Distribution',
            data: data.trialsByPhase.map(item => ({
              name: item.phase,
              value: item.enrolled
            })),
            dataKeys: ['value'],
            colors: CHART_COLORS,
            height: 250
          }, isDarkMode)}
        </motion.div>
      </div>

      {/* Key Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Average Match Time</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{data.matchingMetrics.avgMatchTime}</p>
            <p className="text-xs text-green-500">↓ 2 min from last month</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Matching Accuracy</span>
              <Target className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{data.matchingMetrics.accuracy}%</p>
            <p className="text-xs text-green-500">↑ 1.2% improvement</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Daily Throughput</span>
              <Zap className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">1,247</p>
            <p className="text-xs text-purple-500">Patients screened</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Therapeutic Areas Tab
  const renderTherapeuticTab = () => (
    <div className="space-y-6">
      {/* Therapeutic Areas Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Trials by Therapeutic Area</h3>
        <div className="space-y-4">
          {data.therapeuticAreas.map((area, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{area.area}</p>
                  <p className="text-sm text-gray-500">{area.trials} active trials • {area.patients.toLocaleString()} patients</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{((area.trials / data.matchingMetrics.activeTrials) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">of total trials</p>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    index === 3 ? 'bg-orange-500' :
                    'bg-pink-500'
                  }`}
                  style={{ width: `${(area.trials / data.matchingMetrics.activeTrials) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Therapeutic Area Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Enrollment Performance by Area</h3>
        {renderChart({
          type: 'radar',
          title: 'Relative Performance',
          data: data.therapeuticAreas.map(area => ({
            subject: area.area,
            trials: (area.trials / 50),
            patients: (area.patients / 1000),
            enrollment: Math.random() * 100
          })),
          dataKeys: ['trials', 'patients', 'enrollment'],
          colors: [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[2]],
          height: 400
        }, isDarkMode)}
      </motion.div>

      {/* Trending Therapeutic Areas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Trending Research Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
              Growing Areas
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Immunotherapy</span>
                <span className="text-green-500">↑ 34%</span>
              </li>
              <li className="flex justify-between">
                <span>Gene Therapy</span>
                <span className="text-green-500">↑ 28%</span>
              </li>
              <li className="flex justify-between">
                <span>Digital Therapeutics</span>
                <span className="text-green-500">↑ 22%</span>
              </li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <Activity className="h-4 w-4 text-purple-500 mr-2" />
              High Demand Areas
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Rare Diseases</span>
                <span className="font-medium">2.3:1 ratio</span>
              </li>
              <li className="flex justify-between">
                <span>Pediatric Oncology</span>
                <span className="font-medium">1.8:1 ratio</span>
              </li>
              <li className="flex justify-between">
                <span>Alzheimer's</span>
                <span className="font-medium">1.6:1 ratio</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Geographic Coverage Tab
  const renderGeographicTab = () => (
    <div className="space-y-6">
      {/* Regional Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Globe className="h-5 w-5 text-blue-500 mr-2" />
          Geographic Coverage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {data.geographicCoverage.map((region, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MapPin className={`h-6 w-6 mx-auto mb-2 ${
                index === 0 ? 'text-blue-500' :
                index === 1 ? 'text-green-500' :
                index === 2 ? 'text-purple-500' :
                index === 3 ? 'text-orange-500' :
                'text-pink-500'
              }`} />
              <p className="font-medium">{region.region}</p>
              <p className="text-2xl font-bold mt-2">{region.sites}</p>
              <p className="text-xs text-gray-500">Trial Sites</p>
              <p className="text-sm font-medium mt-2">{region.patients.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Patients</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Site Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Regional Performance Comparison</h3>
        {renderChart({
          type: 'bar',
          title: 'Sites vs Patients by Region',
          data: data.geographicCoverage.map(region => ({
            name: region.region,
            sites: region.sites,
            patients: region.patients / 20
          })),
          dataKeys: ['sites', 'patients'],
          colors: [CHART_COLORS[0], CHART_COLORS[1]],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Access Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Access & Diversity Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">Rural Access</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rural Sites</span>
                <span className="font-medium">23%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rural Patients</span>
                <span className="font-medium">18%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Telemedicine Enabled</span>
                <span className="font-medium">67%</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">Urban Coverage</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Major Cities</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Academic Centers</span>
                <span className="font-medium">127</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Community Hospitals</span>
                <span className="font-medium">234</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-3">Diversity Goals</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Diversity Target</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Current Achievement</span>
                <span className="font-medium text-green-500">78%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Improvement Rate</span>
                <span className="font-medium text-blue-500">+3.2%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Analytics Tab
  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Enrollment Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Enrollment Trends</h3>
        {renderChart({
          type: 'area',
          title: '90-Day Enrollment Trend',
          data: data.enrollmentTrends,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[0]],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Matching Algorithm Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">AI Matching Algorithm Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Algorithm Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">Precision</span>
                <span className="font-medium">94.7%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">Recall</span>
                <span className="font-medium">91.3%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">F1 Score</span>
                <span className="font-medium">92.9%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">Processing Speed</span>
                <span className="font-medium">247 pts/min</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Match Quality Distribution</h4>
            {renderChart({
              type: 'pie',
              title: 'Match Confidence Levels',
              data: [
                { name: 'High Confidence', value: 67 },
                { name: 'Medium Confidence', value: 25 },
                { name: 'Low Confidence', value: 8 }
              ],
              dataKeys: ['value'],
              colors: [CHART_COLORS[2], CHART_COLORS[1], CHART_COLORS[3]],
              height: 200
            }, isDarkMode)}
          </div>
        </div>
      </motion.div>

      {/* Success Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Success Metrics & Outcomes</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">87%</p>
            <p className="text-sm text-gray-500">Screen Success Rate</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">15,234</p>
            <p className="text-sm text-gray-500">Patients Enrolled</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
            <Clock className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">32 days</p>
            <p className="text-sm text-gray-500">Avg Time to Enrollment</p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
            <Target className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">92%</p>
            <p className="text-sm text-gray-500">Retention Rate</p>
          </div>
        </div>
      </motion.div>

      {/* Improvement Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Improvement Opportunities</h3>
        <div className="space-y-3">
          {[
            { area: 'Expand rare disease matching criteria', impact: 'High', patients: 2340 },
            { area: 'Implement multi-language support', impact: 'Medium', patients: 1876 },
            { area: 'Enhance pediatric trial matching', impact: 'High', patients: 1543 },
            { area: 'Improve rural patient outreach', impact: 'Medium', patients: 987 }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium">{item.area}</p>
                <p className="text-sm text-gray-500">Potential impact: {item.patients.toLocaleString()} patients</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.impact === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {item.impact} Priority
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Clinical Trial Matching',
    description: 'AI-powered patient-trial matching and enrollment optimization',
    kpis: [
      {
        title: 'Active Trials',
        value: data.matchingMetrics.activeTrials,
        change: 12.3,
        icon: FileText,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Matched Today',
        value: data.matchingMetrics.matchedToday,
        change: 23.0,
        icon: Target,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Enrollment Rate',
        value: `${data.matchingMetrics.enrollmentRate}%`,
        change: 5.7,
        icon: CheckCircle,
        color: 'purple',
        trend: 'up'
      },
      {
        title: 'Match Time',
        value: data.matchingMetrics.avgMatchTime,
        change: -18.2,
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
        id: 'therapeutic',
        label: 'Therapeutic Areas',
        icon: Activity,
        content: renderTherapeuticTab
      },
      {
        id: 'geographic',
        label: 'Geographic Coverage',
        icon: Globe,
        content: renderGeographicTab
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: TrendingUp,
        content: renderAnalyticsTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default ClinicalTrialMatchingDashboard;