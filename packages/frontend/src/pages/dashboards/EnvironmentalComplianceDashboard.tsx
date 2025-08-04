import React from 'react';
import {
  Leaf,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  BarChart2,
  FileText,
  Droplets,
  Wind,
  Trash2,
  AlertCircle,
  Calendar,
  Award
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

interface EnvironmentalComplianceDashboardProps {
  useCase: UseCase;
}

const EnvironmentalComplianceDashboard: React.FC<EnvironmentalComplianceDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = energyDataGenerators.environmentalCompliance();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Compliance Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 text-green-500 mr-2" />
          Environmental Compliance Status
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
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.complianceMetrics.overallScore / 100)}`}
                  className="text-green-500 transform -rotate-90 origin-center transition-all duration-500"
                />
              </svg>
              <span className="absolute text-2xl font-bold">{data.complianceMetrics.overallScore}%</span>
            </div>
            <p className="mt-2 font-medium">Overall Compliance</p>
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Compliant Items</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">{data.complianceMetrics.compliantItems}</p>
              <p className="text-xs text-gray-500">Out of {data.complianceMetrics.totalRegulations}</p>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Pending Items</span>
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-500">{data.complianceMetrics.pendingItems}</p>
              <p className="text-xs text-gray-500">Require attention</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-red-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Violations</span>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500">{data.complianceMetrics.violations}</p>
              <p className="text-xs text-gray-500">Active violations</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Upcoming Deadlines</span>
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-500">{data.complianceMetrics.upcomingDeadlines}</p>
              <p className="text-xs text-gray-500">Next 30 days</p>
            </div>
          </div>

          <div className="p-4 bg-purple-500/10 rounded-lg">
            <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Last Audit Score</p>
            <p className="text-2xl font-bold text-purple-500">{data.complianceMetrics.lastAuditScore}%</p>
            <p className="text-xs text-gray-500 mt-2">Next audit in {data.complianceMetrics.nextAuditDate}</p>
          </div>
        </div>
      </motion.div>

      {/* Regulatory Areas Compliance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Compliance by Regulatory Area</h3>
        <div className="space-y-3">
          {data.regulatoryAreas.map((area, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {area.area === 'Air Quality' && <Wind className="h-5 w-5 text-blue-500" />}
                  {area.area === 'Water Management' && <Droplets className="h-5 w-5 text-cyan-500" />}
                  {area.area === 'Waste Disposal' && <Trash2 className="h-5 w-5 text-orange-500" />}
                  {area.area === 'Chemical Storage' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                  {area.area === 'Wildlife Protection' && <Leaf className="h-5 w-5 text-green-500" />}
                  {area.area === 'Noise Control' && <BarChart2 className="h-5 w-5 text-purple-500" />}
                  <div>
                    <p className="font-medium">{area.area}</p>
                    <p className="text-sm text-gray-500">
                      {area.regulations} regulations • {area.violations} violations
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    area.compliance >= 95 ? 'text-green-500' :
                    area.compliance >= 90 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {area.compliance}%
                  </p>
                  <p className="text-xs text-gray-500">Compliance</p>
                </div>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    area.compliance >= 95 ? 'bg-green-500' :
                    area.compliance >= 90 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${area.compliance}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Upcoming Compliance Requirements</h3>
        <div className="space-y-3">
          {data.upcomingRequirements.map((req, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              parseInt(req.deadline) <= 7 ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              parseInt(req.deadline) <= 15 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{req.requirement}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Due in {req.deadline}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  req.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  req.status === 'scheduled' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {req.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Emissions Monitoring Tab
  const renderEmissionsTab = () => (
    <div className="space-y-6">
      {/* Emissions Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Emissions Monitoring (30 Days)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">CO₂ Emissions</h4>
            {renderChart({
              type: 'line',
              title: 'Tons per Day',
              data: data.emissionsData.co2,
              dataKeys: ['date', 'value'],
              colors: ['#6B7280'],
              height: 250
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Methane Emissions</h4>
            {renderChart({
              type: 'line',
              title: 'Kg per Day',
              data: data.emissionsData.methane,
              dataKeys: ['date', 'value'],
              colors: ['#F59E0B'],
              height: 250
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">NOx Emissions</h4>
            {renderChart({
              type: 'line',
              title: 'Kg per Day',
              data: data.emissionsData.nox,
              dataKeys: ['date', 'value'],
              colors: ['#EF4444'],
              height: 250
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">SOx Emissions</h4>
            {renderChart({
              type: 'line',
              title: 'Kg per Day',
              data: data.emissionsData.sox,
              dataKeys: ['date', 'value'],
              colors: ['#8B5CF6'],
              height: 250
            }, isDarkMode)}
          </div>
        </div>
      </motion.div>

      {/* Emissions Reduction Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Emissions Reduction Targets</h3>
        <div className="space-y-4">
          {[
            { emission: 'CO₂', target: 25, achieved: 18, unit: '% reduction by 2025' },
            { emission: 'Methane', target: 50, achieved: 42, unit: '% reduction by 2025' },
            { emission: 'NOx', target: 30, achieved: 22, unit: '% reduction by 2025' },
            { emission: 'SOx', target: 40, achieved: 35, unit: '% reduction by 2025' }
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.emission}</p>
                  <p className="text-sm text-gray-500">{item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.achieved}% / {item.target}%</p>
                  <p className={`text-xs ${
                    item.achieved >= item.target * 0.8 ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {item.achieved >= item.target ? 'On track' : 'Behind target'}
                  </p>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    item.achieved >= item.target * 0.8 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${(item.achieved / item.target) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sustainability Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Sustainability Initiatives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <Leaf className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-500">{data.sustainabilityMetrics.renewableEnergy}%</p>
            <p className="text-sm text-gray-500">Renewable Energy</p>
            <p className="text-xs text-green-500 mt-1">↑ 12% YoY</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-500">{data.sustainabilityMetrics.waterRecycling}%</p>
            <p className="text-sm text-gray-500">Water Recycling</p>
            <p className="text-xs text-blue-500 mt-1">↑ 8% YoY</p>
          </div>
          <div className="text-center p-4 bg-orange-500/10 rounded-lg">
            <Trash2 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-500">{data.sustainabilityMetrics.wasteReduction}%</p>
            <p className="text-sm text-gray-500">Waste Reduction</p>
            <p className="text-xs text-orange-500 mt-1">↑ 15% YoY</p>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg">
            <Wind className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-500">{data.sustainabilityMetrics.carbonOffset}%</p>
            <p className="text-sm text-gray-500">Carbon Offset</p>
            <p className="text-xs text-purple-500 mt-1">↑ 20% YoY</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Permits & Documentation Tab
  const renderPermitsTab = () => (
    <div className="space-y-6">
      {/* Permit Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Environmental Permits Status</h3>
        <div className="space-y-3">
          {data.permitStatus.map((permit, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileText className={`h-5 w-5 ${
                    permit.status === 'active' ? 'text-green-500' :
                    permit.status === 'renewal' ? 'text-yellow-500' :
                    'text-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">{permit.permit}</p>
                    <p className="text-sm text-gray-500">
                      Expires in {permit.expiry} • {permit.compliance}% compliant
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  permit.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  permit.status === 'renewal' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {permit.status.toUpperCase()}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    permit.compliance >= 95 ? 'bg-green-500' :
                    permit.compliance >= 90 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${permit.compliance}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Document Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Document Management Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <FileText className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">847</p>
            <p className="text-sm text-gray-500">Total Documents</p>
            <p className="text-xs text-blue-500 mt-1">All compliance docs</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-2xl font-bold">812</p>
            <p className="text-sm text-gray-500">Up to Date</p>
            <p className="text-xs text-green-500 mt-1">95.9% current</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">35</p>
            <p className="text-sm text-gray-500">Need Update</p>
            <p className="text-xs text-yellow-500 mt-1">Within 30 days</p>
          </div>
        </div>
      </motion.div>

      {/* Audit Preparation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Audit Readiness</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Award className="h-6 w-6 text-purple-500" />
              <div>
                <p className="font-medium">Next Environmental Audit</p>
                <p className="text-sm text-gray-500">Annual compliance review</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">45 days</p>
              <p className="text-xs text-gray-500">Scheduled date</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Preparation Progress</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">78%</span>
                <span className="text-sm text-green-500">On track</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Document Review</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">92%</span>
                <span className="text-sm text-green-500">Complete</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Incidents & Violations Tab
  const renderIncidentsTab = () => (
    <div className="space-y-6">
      {/* Active Violations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Active Violations & Corrective Actions</h3>
        <div className="space-y-3">
          {[
            {
              violation: 'Emission Limit Exceedance - Unit 3',
              date: '5 days ago',
              severity: 'high',
              status: 'remediation',
              deadline: '10 days'
            },
            {
              violation: 'Waste Storage Non-compliance',
              date: '12 days ago',
              severity: 'medium',
              status: 'in-progress',
              deadline: '5 days'
            },
            {
              violation: 'Reporting Delay - Q3 Water Quality',
              date: '20 days ago',
              severity: 'low',
              status: 'resolved',
              deadline: 'Completed'
            }
          ].map((violation, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              violation.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              violation.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-green-50 dark:bg-green-900/20 border-green-500'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{violation.violation}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Occurred {violation.date} • Resolution deadline: {violation.deadline}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  violation.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  violation.status === 'remediation' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {violation.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Incident History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Incident History & Fines</h3>
        <div className="space-y-3">
          {data.incidentHistory.map((incident, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className={`h-5 w-5 ${
                    incident.severity === 'high' ? 'text-red-500' :
                    incident.severity === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium">{incident.type}</p>
                    <p className="text-sm text-gray-500">{incident.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  {incident.fine > 0 ? (
                    <>
                      <p className="font-medium text-red-500">${incident.fine.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Fine paid</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-green-500">No Fine</p>
                      <p className="text-xs text-gray-500">Warning only</p>
                    </>
                  )}
                  <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    incident.resolved ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {incident.resolved ? 'RESOLVED' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Compliance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Compliance Performance Trends</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {renderChart({
              type: 'line',
              title: 'Monthly Compliance Score',
              data: [
                { month: 'Jan', score: 92 },
                { month: 'Feb', score: 93 },
                { month: 'Mar', score: 91 },
                { month: 'Apr', score: 94 },
                { month: 'May', score: 94.5 },
                { month: 'Jun', score: 95 }
              ],
              dataKeys: ['month', 'score'],
              colors: ['#10B981'],
              height: 300
            }, isDarkMode)}
          </div>
          <div>
            {renderChart({
              type: 'bar',
              title: 'Violations by Type',
              data: [
                { type: 'Emissions', count: 3 },
                { type: 'Waste', count: 2 },
                { type: 'Reporting', count: 2 },
                { type: 'Storage', count: 1 }
              ],
              dataKeys: ['type', 'count'],
              colors: ['#EF4444'],
              height: 300
            }, isDarkMode)}
          </div>
        </div>
      </motion.div>

      {/* Corrective Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Corrective Action Plans</h3>
        <div className="space-y-3">
          {[
            {
              action: 'Install advanced emission monitoring system',
              violation: 'Emission Limit Exceedance',
              status: 'in-progress',
              completion: 65,
              deadline: '15 days'
            },
            {
              action: 'Upgrade waste storage facilities',
              violation: 'Waste Storage Non-compliance',
              status: 'planning',
              completion: 25,
              deadline: '30 days'
            },
            {
              action: 'Implement automated reporting system',
              violation: 'Reporting Delays',
              status: 'completed',
              completion: 100,
              deadline: 'Completed'
            }
          ].map((action, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{action.action}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    action.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    action.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {action.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  For: {action.violation} • Deadline: {action.deadline}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{action.completion}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      action.completion === 100 ? 'bg-green-500' :
                      action.completion >= 50 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${action.completion}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Environmental Compliance Management',
    description: 'Monitor and manage environmental regulations, permits, and sustainability initiatives',
    kpis: [
      {
        title: 'Compliance Score',
        value: `${data.complianceMetrics.overallScore}%`,
        change: 2.3,
        icon: Shield,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Active Violations',
        value: data.complianceMetrics.violations,
        change: -25.0,
        icon: AlertTriangle,
        color: 'red',
        trend: 'down'
      },
      {
        title: 'Pending Items',
        value: data.complianceMetrics.pendingItems,
        change: -12.5,
        icon: Clock,
        color: 'yellow',
        trend: 'down'
      },
      {
        title: 'Audit Score',
        value: `${data.complianceMetrics.lastAuditScore}%`,
        change: 3.5,
        icon: Award,
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
        id: 'emissions',
        label: 'Emissions Monitoring',
        icon: Wind,
        content: renderEmissionsTab
      },
      {
        id: 'permits',
        label: 'Permits & Documentation',
        icon: FileText,
        content: renderPermitsTab
      },
      {
        id: 'incidents',
        label: 'Incidents & Violations',
        icon: AlertCircle,
        content: renderIncidentsTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default EnvironmentalComplianceDashboard;