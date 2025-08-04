import React from 'react';
import {
  AlertTriangle,
  Activity,
  Shield,
  TrendingDown,
  Clock,
  Gauge,
  BarChart2,
  AlertCircle,
  CheckCircle,
  Wrench,
  Thermometer,
  Users,
  MapPin,
  Zap
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

interface DrillingRiskDashboardProps {
  useCase: UseCase;
}

const DrillingRiskDashboard: React.FC<DrillingRiskDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = energyDataGenerators.drillingRisk();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Risk Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          Active Drilling Operations Risk Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-red-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">High Risk Wells</span>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-500">{data.riskMetrics.highRiskWells}</p>
            <p className="text-sm mt-2">Immediate attention required</p>
          </div>
          <div className="p-4 bg-yellow-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Medium Risk Wells</span>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-500">{data.riskMetrics.mediumRiskWells}</p>
            <p className="text-sm mt-2">Monitor closely</p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Low Risk Wells</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-500">{data.riskMetrics.lowRiskWells}</p>
            <p className="text-sm mt-2">Operating normally</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Avg Risk Score</span>
              <Gauge className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-500">{data.riskMetrics.avgRiskScore}</p>
            <p className="text-sm mt-2">Out of 100</p>
          </div>
        </div>
      </motion.div>

      {/* Well Risk Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Well Risk Assessment</h3>
        <div className="space-y-3">
          {data.wellRiskDistribution.map((well, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <MapPin className={`h-5 w-5 ${
                    well.risk > 70 ? 'text-red-500' :
                    well.risk > 50 ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                  <div>
                    <h4 className="font-medium">{well.well}</h4>
                    <p className="text-sm text-gray-500">
                      {well.depth.toLocaleString()}ft • {well.status} • Day {well.days}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    well.risk > 70 ? 'text-red-500' :
                    well.risk > 50 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {well.risk}
                  </p>
                  <p className="text-xs text-gray-500">Risk Score</p>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    well.risk > 70 ? 'bg-red-500' :
                    well.risk > 50 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${well.risk}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk Trends and Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Incident Trends (90 Days)</h3>
          {renderChart({
            type: 'line',
            title: 'Incidents per Month',
            data: data.incidentTrends,
            dataKeys: ['date', 'value'],
            colors: ['#EF4444'],
            height: 300
          }, isDarkMode)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Risk Factor Analysis</h3>
          {renderChart({
            type: 'radar',
            title: 'Risk Factors',
            data: data.riskFactors,
            dataKeys: ['factor', 'score'],
            colors: ['#3B82F6'],
            height: 300
          }, isDarkMode)}
        </motion.div>
      </div>
    </div>
  );

  // Geological Hazards Tab
  const renderGeologicalTab = () => (
    <div className="space-y-6">
      {/* Hazard Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Geological Hazard Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'bar',
              title: 'Hazard Frequency',
              data: data.geologicalHazards,
              dataKeys: ['type', 'count'],
              colors: ['#F59E0B'],
              height: 300
            }, isDarkMode)}
          </div>
          <div className="space-y-3">
            {data.geologicalHazards.map((hazard, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                hazard.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                hazard.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
                'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{hazard.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {hazard.count} occurrences in active wells
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    hazard.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    hazard.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {hazard.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Formation Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Formation Pressure Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
            <Thermometer className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">12,500 psi</p>
            <p className="text-sm text-gray-500">Max Formation Pressure</p>
            <p className="text-xs text-red-500 mt-2">↑ 15% above normal</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg">
            <Gauge className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">8,750 psi</p>
            <p className="text-sm text-gray-500">Average Pressure</p>
            <p className="text-xs text-gray-500 mt-2">Within safe range</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg">
            <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">23</p>
            <p className="text-sm text-gray-500">Pressure Anomalies</p>
            <p className="text-xs text-yellow-500 mt-2">This month</p>
          </div>
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
              strategy: 'Enhanced Mud Weight Management',
              status: 'active',
              effectiveness: 92,
              wells: 12
            },
            {
              strategy: 'Real-time Pressure Monitoring',
              status: 'active',
              effectiveness: 98,
              wells: 28
            },
            {
              strategy: 'Automated Kick Detection',
              status: 'testing',
              effectiveness: 87,
              wells: 5
            },
            {
              strategy: 'Predictive Geology Modeling',
              status: 'active',
              effectiveness: 85,
              wells: 18
            }
          ].map((strategy, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Shield className={`h-5 w-5 ${
                    strategy.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium">{strategy.strategy}</p>
                    <p className="text-sm text-gray-500">Applied to {strategy.wells} wells</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  strategy.status === 'active' ? 
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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

  // Equipment & Safety Tab
  const renderEquipmentTab = () => (
    <div className="space-y-6">
      {/* Equipment Health Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Critical Equipment Health</h3>
        <div className="space-y-3">
          {data.equipmentHealth.map((equipment, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Wrench className={`h-5 w-5 ${
                    equipment.health > 90 ? 'text-green-500' :
                    equipment.health > 80 ? 'text-yellow-500' :
                    'text-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">{equipment.equipment}</p>
                    <p className="text-sm text-gray-500">
                      Last inspection: {equipment.lastInspection}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    equipment.health > 90 ? 'text-green-500' :
                    equipment.health > 80 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {equipment.health}%
                  </p>
                  <p className="text-xs text-gray-500">Health Score</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        equipment.health > 90 ? 'bg-green-500' :
                        equipment.health > 80 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${equipment.health}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Next maintenance: {equipment.nextMaintenance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Safety Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Safety Performance</h3>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg">
              <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-4xl font-bold text-green-500">{data.safetyMetrics.daysWithoutIncident}</p>
              <p className="text-sm text-gray-500">Days Without Incident</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <p className="text-2xl font-bold">{data.safetyMetrics.safetyScore}%</p>
                <p className="text-xs text-gray-500">Safety Score</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <p className="text-2xl font-bold">{data.safetyMetrics.trainingCompliance}%</p>
                <p className="text-xs text-gray-500">Training Compliance</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Emergency Preparedness</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Emergency Drills Completed</p>
                  <p className="text-sm text-gray-500">This quarter</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-500">{data.safetyMetrics.emergencyDrills}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Response Team Readiness</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-center">
                  <p className="text-lg font-bold text-green-500">100%</p>
                  <p className="text-xs text-gray-500">Medical Team</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-center">
                  <p className="text-lg font-bold text-green-500">98%</p>
                  <p className="text-xs text-gray-500">Fire Response</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-center">
                  <p className="text-lg font-bold text-green-500">95%</p>
                  <p className="text-xs text-gray-500">Spill Control</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-center">
                  <p className="text-lg font-bold text-green-500">97%</p>
                  <p className="text-xs text-gray-500">Evacuation</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Real-time Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Real-time Safety Alerts</h3>
        <div className="space-y-3">
          {data.realTimeAlerts.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              alert.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-500' :
                    alert.severity === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Cost Impact Tab
  const renderCostTab = () => (
    <div className="space-y-6">
      {/* Cost Savings Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Risk Prevention Cost Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.costImpact.preventedIncidents}</p>
            <p className="text-sm text-gray-500">Incidents Prevented</p>
            <p className="text-xs text-green-500 mt-1">This year</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <TrendingDown className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">${data.costImpact.savedCosts}M</p>
            <p className="text-sm text-gray-500">Costs Avoided</p>
            <p className="text-xs text-blue-500 mt-1">Direct savings</p>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg">
            <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.costImpact.downtimeAvoided}h</p>
            <p className="text-sm text-gray-500">Downtime Avoided</p>
            <p className="text-xs text-purple-500 mt-1">Operational hours</p>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
            <Activity className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">${data.costImpact.insuranceSavings}M</p>
            <p className="text-sm text-gray-500">Insurance Savings</p>
            <p className="text-xs text-yellow-500 mt-1">Premium reduction</p>
          </div>
        </div>
      </motion.div>

      {/* Cost Breakdown Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Incident Cost Analysis</h3>
          {renderChart({
            type: 'bar',
            title: 'Average Cost per Incident Type ($K)',
            data: [
              { type: 'Blowout', cost: 2500 },
              { type: 'Equipment Failure', cost: 850 },
              { type: 'Lost Circulation', cost: 450 },
              { type: 'Stuck Pipe', cost: 650 },
              { type: 'Well Control', cost: 1200 }
            ],
            dataKeys: ['type', 'cost'],
            colors: ['#EF4444'],
            height: 300
          }, isDarkMode)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">ROI of Risk Management</h3>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg">
              <p className="text-4xl font-bold text-green-500">312%</p>
              <p className="text-sm text-gray-500">Return on Investment</p>
              <p className="text-xs text-gray-400 mt-2">Risk management systems</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm">Investment in Risk Systems</span>
                <span className="font-medium">$1.8M</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm">Annual Savings</span>
                <span className="font-medium text-green-500">$5.6M</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm">Payback Period</span>
                <span className="font-medium">3.8 months</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Future Investment Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Risk Reduction Investment Opportunities</h3>
        <div className="space-y-3">
          {[
            {
              opportunity: 'AI-Powered Predictive Analytics',
              potentialSavings: '$2.3M/year',
              investmentRequired: '$450K',
              roi: '511%',
              priority: 'high'
            },
            {
              opportunity: 'Advanced Seismic Monitoring',
              potentialSavings: '$1.8M/year',
              investmentRequired: '$320K',
              roi: '562%',
              priority: 'high'
            },
            {
              opportunity: 'Automated Well Control Systems',
              potentialSavings: '$1.2M/year',
              investmentRequired: '$280K',
              roi: '428%',
              priority: 'medium'
            },
            {
              opportunity: 'Enhanced Training Simulators',
              potentialSavings: '$0.8M/year',
              investmentRequired: '$150K',
              roi: '533%',
              priority: 'medium'
            }
          ].map((opp, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{opp.opportunity}</p>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-gray-500">Potential Savings</p>
                      <p className="font-medium text-green-500">{opp.potentialSavings}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Investment</p>
                      <p className="font-medium">{opp.investmentRequired}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ROI</p>
                      <p className="font-medium text-blue-500">{opp.roi}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  opp.priority === 'high' ?
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {opp.priority.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Drilling Risk Assessment',
    description: 'Real-time monitoring and prediction of drilling operation risks',
    kpis: [
      {
        title: 'Active Operations',
        value: data.riskMetrics.activeOperations,
        change: -12.5,
        icon: Activity,
        color: 'blue',
        trend: 'down'
      },
      {
        title: 'Avg Risk Score',
        value: data.riskMetrics.avgRiskScore.toFixed(1),
        change: -8.3,
        icon: Gauge,
        color: 'yellow',
        trend: 'down'
      },
      {
        title: 'Incidents MTD',
        value: data.riskMetrics.incidentsThisMonth,
        change: -33.3,
        icon: AlertTriangle,
        color: 'red',
        trend: 'down'
      },
      {
        title: 'Days Safe',
        value: data.safetyMetrics.daysWithoutIncident,
        change: 15.2,
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
        id: 'geological',
        label: 'Geological Hazards',
        icon: MapPin,
        content: renderGeologicalTab
      },
      {
        id: 'equipment',
        label: 'Equipment & Safety',
        icon: Wrench,
        content: renderEquipmentTab
      },
      {
        id: 'cost',
        label: 'Cost Impact',
        icon: TrendingDown,
        content: renderCostTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default DrillingRiskDashboard;