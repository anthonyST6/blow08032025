import React from 'react';
import {
  Shield,
  AlertTriangle,
  Activity,
  Zap,
  Cloud,
  Lock,
  Wrench,
  TrendingUp,
  BarChart2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Cpu
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

interface PredictiveGridResilienceDashboardProps {
  useCase: UseCase;
}

const PredictiveGridResilienceDashboard: React.FC<PredictiveGridResilienceDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = energyDataGenerators.predictiveGridResilience();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Resilience Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 text-green-500 mr-2" />
          Grid Resilience Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg">
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
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.resilienceMetrics.overallResilience / 100)}`}
                  className="text-green-500 transform -rotate-90 origin-center transition-all duration-500"
                />
              </svg>
              <span className="absolute text-2xl font-bold">{data.resilienceMetrics.overallResilience}%</span>
            </div>
            <p className="mt-2 font-medium">Overall Resilience</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Critical Assets</span>
                <Zap className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-500">{data.resilienceMetrics.criticalAssets.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Monitored 24/7</p>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Vulnerable Assets</span>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-500">{data.resilienceMetrics.vulnerableAssets}</p>
              <p className="text-xs text-gray-500">Need attention</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Mitigated Risks</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">{data.resilienceMetrics.mitigatedRisks}</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Active Threats</span>
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500">{data.resilienceMetrics.activeThreats}</p>
              <p className="text-xs text-gray-500">Being monitored</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Availability</span>
                <Activity className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-500">{data.resilienceMetrics.availability}%</p>
              <p className="text-xs text-gray-500">System uptime</p>
            </div>
            <div className="p-4 bg-cyan-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">MTTR</span>
                <Clock className="h-4 w-4 text-cyan-500" />
              </div>
              <p className="text-2xl font-bold text-cyan-500">{data.resilienceMetrics.mttr}h</p>
              <p className="text-xs text-gray-500">Mean recovery time</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Asset Health Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Asset Health Trends (30 Days)</h3>
        {renderChart({
          type: 'area',
          title: 'Overall Health Score',
          data: data.assetHealth,
          dataKeys: ['date', 'value'],
          colors: ['#10B981'],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Incident Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Predicted Incidents</h3>
        <div className="space-y-3">
          {data.incidentPredictions.map((prediction, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              prediction.risk > 75 ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              prediction.risk > 60 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{prediction.asset}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {prediction.type} • Expected in {prediction.timeframe}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    prediction.risk > 75 ? 'text-red-500' :
                    prediction.risk > 60 ? 'text-yellow-500' :
                    'text-blue-500'
                  }`}>
                    {prediction.risk}%
                  </p>
                  <p className="text-xs text-gray-500">Risk Score</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Threat Analysis Tab
  const renderThreatTab = () => (
    <div className="space-y-6">
      {/* Threat Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Threat Analysis Matrix</h3>
        <div className="space-y-4">
          {data.threatAnalysis.map((threat, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {threat.threat === 'Extreme Weather' && <Cloud className="h-5 w-5 text-blue-500" />}
                  {threat.threat === 'Cyber Attack' && <Lock className="h-5 w-5 text-red-500" />}
                  {threat.threat === 'Equipment Failure' && <Wrench className="h-5 w-5 text-yellow-500" />}
                  {threat.threat === 'Supply Chain Disruption' && <TrendingUp className="h-5 w-5 text-orange-500" />}
                  {threat.threat === 'Natural Disaster' && <AlertTriangle className="h-5 w-5 text-purple-500" />}
                  <div>
                    <p className="font-medium">{threat.threat}</p>
                    <p className="text-sm text-gray-500">
                      Mitigation: {threat.mitigation} • Status: {threat.status}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  threat.status === 'secured' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  threat.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  threat.status === 'prepared' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {threat.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Probability</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          threat.probability > 70 ? 'bg-red-500' :
                          threat.probability > 50 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${threat.probability}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12">{threat.probability}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Impact</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          threat.impact > 80 ? 'bg-red-500' :
                          threat.impact > 60 ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${threat.impact}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12">{threat.impact}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk Heat Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Risk Heat Map</h3>
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-1" />
          <div className="text-center text-sm font-medium">Low Impact</div>
          <div className="text-center text-sm font-medium">Medium Impact</div>
          <div className="text-center text-sm font-medium">High Impact</div>
          <div className="text-center text-sm font-medium">Critical Impact</div>
          
          {['Low', 'Medium', 'High', 'Very High'].map((probability, pIndex) => (
            <React.Fragment key={pIndex}>
              <div className="text-sm font-medium text-right pr-2">{probability} Probability</div>
              {[1, 2, 3, 4].map((impact) => {
                const riskLevel = (pIndex + 1) * impact;
                return (
                  <div
                    key={impact}
                    className={`h-20 rounded flex items-center justify-center text-xs font-medium ${
                      riskLevel <= 4 ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                      riskLevel <= 8 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                      riskLevel <= 12 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200' :
                      'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {riskLevel <= 4 ? 'Low' :
                     riskLevel <= 8 ? 'Medium' :
                     riskLevel <= 12 ? 'High' :
                     'Critical'}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Mitigation Strategies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Active Mitigation Strategies</h3>
        <div className="space-y-3">
          {[
            {
              strategy: 'Predictive Maintenance Program',
              effectiveness: 92,
              coverage: '87% of critical assets',
              status: 'active'
            },
            {
              strategy: 'Cyber Defense Shield',
              effectiveness: 98,
              coverage: '100% of control systems',
              status: 'active'
            },
            {
              strategy: 'Weather Resilience Protocol',
              effectiveness: 85,
              coverage: '76% of vulnerable areas',
              status: 'expanding'
            },
            {
              strategy: 'Emergency Response System',
              effectiveness: 94,
              coverage: 'All grid sectors',
              status: 'active'
            }
          ].map((strategy, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{strategy.strategy}</p>
                  <p className="text-sm text-gray-500">{strategy.coverage}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  strategy.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {strategy.status.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Effectiveness</span>
                  <span className="font-medium">{strategy.effectiveness}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${strategy.effectiveness}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Orchestration Tab
  const renderOrchestrationTab = () => (
    <div className="space-y-6">
      {/* Orchestration Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Automated Orchestration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <Cpu className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-500">{data.orchestrationStatus.activeScenarios}</p>
            <p className="text-sm text-gray-500">Active Scenarios</p>
          </div>
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-500">{data.orchestrationStatus.automatedResponses}</p>
            <p className="text-sm text-gray-500">Automated Responses</p>
            <p className="text-xs text-gray-400 mt-1">Last 24 hours</p>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
            <Users className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-500">{data.orchestrationStatus.humanInterventions}</p>
            <p className="text-sm text-gray-500">Human Interventions</p>
            <p className="text-xs text-gray-400 mt-1">Required today</p>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg">
            <CheckCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-500">{data.orchestrationStatus.successRate}%</p>
            <p className="text-sm text-gray-500">Success Rate</p>
            <p className="text-xs text-green-500 mt-1">↑ 2.3% this week</p>
          </div>
        </div>
      </motion.div>

      {/* Active Response Scenarios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Active Response Scenarios</h3>
        <div className="space-y-3">
          {[
            {
              scenario: 'Storm Response Protocol',
              trigger: 'Weather forecast - severe storm',
              actions: 12,
              status: 'executing',
              completion: 65
            },
            {
              scenario: 'Peak Load Management',
              trigger: 'Demand forecast > 95% capacity',
              actions: 8,
              status: 'monitoring',
              completion: 30
            },
            {
              scenario: 'Cyber Threat Mitigation',
              trigger: 'Anomaly detected in SCADA',
              actions: 15,
              status: 'completed',
              completion: 100
            }
          ].map((scenario, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{scenario.scenario}</p>
                  <p className="text-sm text-gray-500">Trigger: {scenario.trigger}</p>
                  <p className="text-sm text-gray-500 mt-1">{scenario.actions} automated actions</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  scenario.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  scenario.status === 'executing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {scenario.status.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{scenario.completion}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      scenario.completion === 100 ? 'bg-green-500' :
                      scenario.completion >= 50 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${scenario.completion}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Decision Tree Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Automated Decision Framework</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Level 1: Monitoring & Detection</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Continuous monitoring of 1,247 critical assets with ML-based anomaly detection
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Level 2: Threat Assessment</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time risk scoring and impact analysis with 94.5% accuracy
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Level 3: Response Selection</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-driven response selection from 127 pre-configured scenarios
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Level 4: Execution & Monitoring</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automated execution with real-time feedback and human oversight capability
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Redundancy & Recovery Tab
  const renderRedundancyTab = () => (
    <div className="space-y-6">
      {/* System Redundancy Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">System Redundancy Analysis</h3>
        <div className="space-y-4">
          {data.redundancyMap.map((system, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{system.system}</p>
                  <p className="text-sm text-gray-500">{system.backups} backup systems available</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  system.status === 'optimal' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  system.status === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  system.status === 'adequate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }`}>
                  {system.status.toUpperCase()}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Redundancy Level</span>
                  <span className="font-medium">{system.redundancy}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      system.redundancy >= 90 ? 'bg-green-500' :
                      system.redundancy >= 80 ? 'bg-blue-500' :
                      system.redundancy >= 70 ? 'bg-yellow-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${system.redundancy}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Response Team Readiness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Emergency Response Readiness</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.responseReadiness.teams}</p>
            <p className="text-sm text-gray-500">Response Teams</p>
            <p className="text-xs text-green-500">24/7 coverage</p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.responseReadiness.avgResponseTime} min</p>
            <p className="text-sm text-gray-500">Avg Response Time</p>
            <p className="text-xs text-blue-500">↓ 15% improved</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Activity className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.responseReadiness.drillsCompleted}</p>
            <p className="text-sm text-gray-500">Drills Completed</p>
            <p className="text-xs text-purple-500">This quarter</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <CheckCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.responseReadiness.certificationRate}%</p>
            <p className="text-sm text-gray-500">Certified Staff</p>
            <p className="text-xs text-yellow-500">Above target</p>
          </div>
        </div>
      </motion.div>

      {/* Recovery Procedures */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Recovery Time Objectives (RTO)</h3>
        <div className="space-y-3">
          {[
            { system: 'Critical Control Systems', rto: '< 5 min', actual: '3.2 min', status: 'exceeds' },
            { system: 'Primary Grid Operations', rto: '< 15 min', actual: '12.5 min', status: 'meets' },
            { system: 'Secondary Systems', rto: '< 30 min', actual: '28 min', status: 'meets' },
            { system: 'Non-Critical Services', rto: '< 2 hours', actual: '1.5 hours', status: 'meets' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium">{item.system}</p>
                <p className="text-sm text-gray-500">Target RTO: {item.rto}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{item.actual}</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                  item.status === 'exceeds' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {item.status === 'exceeds' ? 'EXCEEDS TARGET' : 'MEETS TARGET'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
  title: 'Predictive Grid Resilience & Orchestration',
  description: 'AI-powered grid resilience monitoring and automated response orchestration',
  kpis: [
    {
      title: 'Overall Resilience',
      value: `${data.resilienceMetrics.overallResilience}%`,
      change: 3.2,
      icon: Shield,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Active Threats',
      value: data.resilienceMetrics.activeThreats,
      change: -25.0,
      icon: AlertTriangle,
      color: 'red',
      trend: 'down'
    },
    {
      title: 'System Availability',
      value: `${data.resilienceMetrics.availability}%`,
      change: 0.5,
      icon: Activity,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'MTTR',
      value: `${data.resilienceMetrics.mttr}h`,
      change: -15.8,
      icon: Clock,
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
      id: 'threats',
      label: 'Threat Analysis',
      icon: AlertTriangle,
      content: renderThreatTab
    },
    {
      id: 'orchestration',
      label: 'Orchestration',
      icon: Cpu,
      content: renderOrchestrationTab
    },
    {
      id: 'redundancy',
      label: 'Redundancy & Recovery',
      icon: Shield,
      content: renderRedundancyTab
    }
  ]
};

return <DashboardTemplate config={config} useCase={useCase} />;
};

export default PredictiveGridResilienceDashboard;