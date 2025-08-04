import React from 'react';
import {
  Shield,
  AlertTriangle,
  Lock,
  Activity,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Server,
  Zap,
  BarChart2,
  FileCheck,
  AlertCircle,
  Clock
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

interface EnergySupplyChainCyberDashboardProps {
  useCase: UseCase;
}

const EnergySupplyChainCyberDashboard: React.FC<EnergySupplyChainCyberDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = energyDataGenerators.energySupplyChainCyber();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 text-green-500 mr-2" />
          Cyber Security Overview
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
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.cyberMetrics.overallSecurityScore / 100)}`}
                  className="text-green-500 transform -rotate-90 origin-center transition-all duration-500"
                />
              </svg>
              <span className="absolute text-2xl font-bold">{data.cyberMetrics.overallSecurityScore}%</span>
            </div>
            <p className="mt-2 font-medium">Security Score</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-red-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Active Threats</span>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500">{data.cyberMetrics.activeThreats}</p>
              <p className="text-xs text-gray-500">Being monitored</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Blocked Attempts</span>
                <Shield className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">{data.cyberMetrics.blockedAttempts.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Last 24 hours</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-yellow-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Vulnerabilities</span>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-500">{data.cyberMetrics.vulnerabilities}</p>
              <p className="text-xs text-gray-500">Need patching</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Patch Compliance</span>
                <FileCheck className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-500">{data.cyberMetrics.patchCompliance}%</p>
              <p className="text-xs text-gray-500">Systems updated</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Response Time</span>
                <Clock className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-500">{data.cyberMetrics.incidentResponseTime}min</p>
              <p className="text-xs text-gray-500">Avg response</p>
            </div>
            <div className="p-4 bg-cyan-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Data Integrity</span>
                <Lock className="h-4 w-4 text-cyan-500" />
              </div>
              <p className="text-2xl font-bold text-cyan-500">{data.cyberMetrics.dataIntegrity}%</p>
              <p className="text-xs text-gray-500">Verified secure</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Threat Landscape Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Threat Activity (30 Days)</h3>
        {renderChart({
          type: 'area',
          title: 'Daily Threat Attempts',
          data: data.threatLandscape,
          dataKeys: ['date', 'value'],
          colors: ['#EF4444'],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Recent Incidents Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          {data.incidentTimeline.map((incident, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              incident.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              incident.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
              incident.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              incident.severity === 'low' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
              'bg-gray-50 dark:bg-gray-700 border-gray-400'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{incident.event}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{incident.time}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    incident.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    incident.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    incident.severity === 'low' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {incident.severity.toUpperCase()}
                  </span>
                  {incident.resolved ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Supply Chain Tab
  const renderSupplyChainTab = () => (
    <div className="space-y-6">
      {/* Supply Chain Node Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Supply Chain Security Status</h3>
        <div className="space-y-4">
          {data.supplyChainNodes.map((node, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Server className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{node.node}</p>
                    <p className="text-sm text-gray-500">Last audit: {node.lastAudit}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {node.secured ? (
                    <span className="flex items-center text-green-500">
                      <Lock className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">SECURED</span>
                    </span>
                  ) : (
                    <span className="flex items-center text-red-500">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">AT RISK</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Risk Score</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          node.riskScore > 60 ? 'bg-red-500' :
                          node.riskScore > 40 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${node.riskScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12">{node.riskScore}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Threats</p>
                  <p className={`text-lg font-bold ${
                    node.threats > 5 ? 'text-red-500' :
                    node.threats > 3 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {node.threats}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Vendor Risk Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Vendor Risk Assessment</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-4">Vendor</th>
                <th className="text-left py-3 px-4">Risk Level</th>
                <th className="text-left py-3 px-4">Score</th>
                <th className="text-left py-3 px-4">Compliance</th>
              </tr>
            </thead>
            <tbody>
              {data.vendorRiskAssessment.map((vendor, index) => (
                <tr key={index} className="border-b dark:border-gray-700">
                  <td className="py-3 px-4 font-medium">{vendor.vendor}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vendor.riskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      vendor.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {vendor.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            vendor.score >= 90 ? 'bg-green-500' :
                            vendor.score >= 70 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${vendor.score}%` }}
                        />
                      </div>
                      <span className="text-sm">{vendor.score}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center ${
                      vendor.compliance === 'certified' ? 'text-green-500' :
                      vendor.compliance === 'pending' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {vendor.compliance === 'certified' && <CheckCircle className="h-4 w-4 mr-1" />}
                      {vendor.compliance === 'pending' && <Clock className="h-4 w-4 mr-1" />}
                      {vendor.compliance === 'review' && <AlertCircle className="h-4 w-4 mr-1" />}
                      {vendor.compliance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Supply Chain Risk Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Supply Chain Risk Distribution</h3>
        {renderChart({
          type: 'radar',
          title: 'Risk by Supply Chain Node',
          data: data.supplyChainNodes.map(node => ({
            subject: node.node,
            risk: node.riskScore,
            threats: node.threats * 10
          })),
          dataKeys: ['risk', 'threats'],
          colors: [CHART_COLORS[0], CHART_COLORS[3]],
          height: 400
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Threat Analysis Tab
  const renderThreatTab = () => (
    <div className="space-y-6">
      {/* Attack Vector Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Attack Vector Analysis</h3>
        <div className="space-y-4">
          {data.attackVectors.map((vector, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{vector.vector}</p>
                  <p className="text-sm text-gray-500">
                    {vector.frequency} attempts • {vector.blocked}% blocked
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  vector.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  vector.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {vector.severity.toUpperCase()}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Block Rate</span>
                  <span className="font-medium">{vector.blocked}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${vector.blocked}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Attack Frequency Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Attack Vector Distribution</h3>
        {renderChart({
          type: 'bar',
          title: 'Attacks by Type',
          data: data.attackVectors.map(v => ({
            name: v.vector,
            attempts: v.frequency,
            blocked: Math.round(v.frequency * v.blocked / 100)
          })),
          dataKeys: ['attempts', 'blocked'],
          colors: [CHART_COLORS[3], CHART_COLORS[2]],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Threat Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Threat Intelligence Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              Critical Threats
            </h4>
            <ul className="space-y-2 text-sm">
              <li>• Advanced persistent threat detected in supply chain</li>
              <li>• Zero-day vulnerability in SCADA systems</li>
              <li>• Ransomware campaign targeting energy sector</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <Eye className="h-4 w-4 text-yellow-500 mr-2" />
              Emerging Threats
            </h4>
            <ul className="space-y-2 text-sm">
              <li>• New phishing campaign mimicking vendor emails</li>
              <li>• IoT device vulnerabilities in smart meters</li>
              <li>• Social engineering targeting executives</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Compliance Tab
  const renderComplianceTab = () => (
    <div className="space-y-6">
      {/* Compliance Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Regulatory Compliance Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data.complianceStatus).map(([standard, score]) => (
            <div key={standard} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">{standard.toUpperCase()}</p>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-gray-200 dark:text-gray-600"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                    className={`${
                      score >= 95 ? 'text-green-500' :
                      score >= 90 ? 'text-blue-500' :
                      'text-yellow-500'
                    } transform -rotate-90 origin-center transition-all duration-500`}
                  />
                </svg>
                <span className="absolute text-xl font-bold">{score}%</span>
              </div>
              <p className={`mt-2 text-xs font-medium ${
                score >= 95 ? 'text-green-500' :
                score >= 90 ? 'text-blue-500' :
                'text-yellow-500'
              }`}>
                {score >= 95 ? 'COMPLIANT' : score >= 90 ? 'MINOR GAPS' : 'ACTION NEEDED'}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Compliance Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Key Compliance Requirements</h3>
        <div className="space-y-3">
          {[
            { requirement: 'Annual Security Assessment', status: 'completed', dueDate: 'Completed 30 days ago' },
            { requirement: 'Quarterly Vulnerability Scan', status: 'in-progress', dueDate: 'Due in 15 days' },
            { requirement: 'Incident Response Plan Update', status: 'pending', dueDate: 'Due in 45 days' },
            { requirement: 'Employee Security Training', status: 'completed', dueDate: 'Completed 10 days ago' },
            { requirement: 'Third-Party Risk Assessment', status: 'in-progress', dueDate: 'Due in 30 days' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium">{item.requirement}</p>
                <p className="text-sm text-gray-500">{item.dueDate}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                item.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {item.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Audit History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Recent Audit Results</h3>
        <div className="space-y-3">
          {[
            { audit: 'NERC CIP Compliance Audit', date: '2 months ago', score: 98, findings: 2, status: 'passed' },
            { audit: 'ISO 27001 Surveillance', date: '4 months ago', score: 95, findings: 5, status: 'passed' },
            { audit: 'Internal Security Review', date: '1 month ago', score: 93, findings: 8, status: 'passed' },
            { audit: 'Third-Party Penetration Test', date: '3 months ago', score: 88, findings: 12, status: 'remediated' }
          ].map((audit, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{audit.audit}</p>
                  <p className="text-sm text-gray-500">{audit.date} • {audit.findings} findings</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{audit.score}%</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                    audit.status === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {audit.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Energy Supply Chain Cyber Defense',
    description: 'Comprehensive cyber security monitoring and threat defense for energy supply chain',
    kpis: [
      {
        title: 'Security Score',
        value: `${data.cyberMetrics.overallSecurityScore}%`,
        change: 2.5,
        icon: Shield,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Active Threats',
        value: data.cyberMetrics.activeThreats,
        change: -28.6,
        icon: AlertTriangle,
        color: 'red',
        trend: 'down'
      },
      {
        title: 'Blocked Attempts',
        value: data.cyberMetrics.blockedAttempts.toLocaleString(),
        change: 15.3,
        icon: Lock,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Response Time',
        value: `${data.cyberMetrics.incidentResponseTime}min`,
        change: -12.5,
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
        id: 'supply-chain',
        label: 'Supply Chain',
        icon: Server,
        content: renderSupplyChainTab
      },
      {
        id: 'threats',
        label: 'Threat Analysis',
        icon: AlertTriangle,
        content: renderThreatTab
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: FileCheck,
        content: renderComplianceTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default EnergySupplyChainCyberDashboard;