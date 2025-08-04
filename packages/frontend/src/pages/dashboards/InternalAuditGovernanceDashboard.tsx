import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  Treemap,
  Sankey
} from 'recharts';
import {
  FileCheck,
  AlertTriangle,
  TrendingUp,
  Shield,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  BarChart2,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Zap,
  Database,
  GitBranch,
  Settings,
  Gauge,
  FileWarning,
  ClipboardCheck,
  Target,
  Eye,
  Lock,
  Users,
  BookOpen,
  TrendingDown,
  Search,
  Scale
} from 'lucide-react';
import { SIAMetrics } from '../../components/ui/SIAMetric';
import { UseCase } from '../../config/verticals';

interface InternalAuditGovernanceDashboardProps {
  useCase: UseCase;
}

const InternalAuditGovernanceDashboard: React.FC<InternalAuditGovernanceDashboardProps> = ({ useCase }) => {
  const isDarkMode = true; // You can get this from a theme context if needed
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for audit and governance metrics
  const complianceScores = [
    { area: 'Financial Controls', score: 94, target: 95, findings: 3, critical: 0 },
    { area: 'Operational Procedures', score: 88, target: 90, findings: 7, critical: 1 },
    { area: 'IT Security', score: 92, target: 95, findings: 5, critical: 1 },
    { area: 'Regulatory Compliance', score: 96, target: 98, findings: 2, critical: 0 },
    { area: 'Data Governance', score: 89, target: 92, findings: 6, critical: 2 },
    { area: 'Risk Management', score: 91, target: 90, findings: 4, critical: 0 }
  ];

  const auditProgress = [
    { month: 'Jan', planned: 12, completed: 11, findings: 23, resolved: 20 },
    { month: 'Feb', planned: 15, completed: 15, findings: 31, resolved: 28 },
    { month: 'Mar', planned: 18, completed: 17, findings: 28, resolved: 26 },
    { month: 'Apr', planned: 14, completed: 14, findings: 19, resolved: 18 },
    { month: 'May', planned: 16, completed: 16, findings: 25, resolved: 24 },
    { month: 'Jun', planned: 20, completed: 19, findings: 22, resolved: 22 }
  ];

  const riskHeatmap = [
    { category: 'Financial', high: 2, medium: 5, low: 8, total: 15 },
    { category: 'Operational', high: 3, medium: 7, low: 12, total: 22 },
    { category: 'Compliance', high: 1, medium: 4, low: 6, total: 11 },
    { category: 'Strategic', high: 2, medium: 3, low: 5, total: 10 },
    { category: 'Reputational', high: 1, medium: 2, low: 4, total: 7 }
  ];

  const controlEffectiveness = [
    { control: 'Access Management', design: 95, operating: 92, automated: 78 },
    { control: 'Change Management', design: 88, operating: 85, automated: 65 },
    { control: 'Data Validation', design: 92, operating: 89, automated: 82 },
    { control: 'Segregation of Duties', design: 90, operating: 87, automated: 45 },
    { control: 'Approval Workflows', design: 94, operating: 91, automated: 88 }
  ];

  const departmentCompliance = [
    { dept: 'Finance', audits: 8, compliance: 94, openIssues: 3, overdue: 0 },
    { dept: 'Operations', audits: 12, compliance: 87, openIssues: 8, overdue: 2 },
    { dept: 'IT', audits: 10, compliance: 91, openIssues: 5, overdue: 1 },
    { dept: 'HR', audits: 6, compliance: 93, openIssues: 2, overdue: 0 },
    { dept: 'Sales', audits: 7, compliance: 89, openIssues: 4, overdue: 1 }
  ];

  const automationImpact = [
    { task: 'Control Testing', before: 480, after: 120, reduction: 75 },
    { task: 'Risk Assessment', before: 360, after: 60, reduction: 83 },
    { task: 'Compliance Monitoring', before: 720, after: 30, reduction: 96 },
    { task: 'Report Generation', before: 240, after: 15, reduction: 94 },
    { task: 'Issue Tracking', before: 180, after: 20, reduction: 89 }
  ];

  const upcomingAudits = [
    { id: 'AUD-2024-087', area: 'Q2 Financial Close', startDate: '2024-07-15', status: 'scheduled', risk: 'high' },
    { id: 'AUD-2024-088', area: 'IT Security Controls', startDate: '2024-07-20', status: 'in-planning', risk: 'critical' },
    { id: 'AUD-2024-089', area: 'Vendor Management', startDate: '2024-07-25', status: 'scheduled', risk: 'medium' },
    { id: 'AUD-2024-090', area: 'Regulatory Compliance', startDate: '2024-08-01', status: 'scheduled', risk: 'high' },
    { id: 'AUD-2024-091', area: 'Operational Efficiency', startDate: '2024-08-10', status: 'in-planning', risk: 'low' }
  ];

  const aiInsights = [
    { insight: 'Anomaly in expense approvals detected', severity: 'high', department: 'Finance', confidence: 92 },
    { insight: 'Control gap in user access reviews', severity: 'medium', department: 'IT', confidence: 87 },
    { insight: 'Compliance risk in new regulation', severity: 'high', department: 'Legal', confidence: 95 },
    { insight: 'Process inefficiency in procurement', severity: 'low', department: 'Operations', confidence: 78 }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'compliance', label: 'Compliance Status', icon: Shield },
    { id: 'audits', label: 'Audit Management', icon: ClipboardCheck },
    { id: 'risks', label: 'Risk Assessment', icon: AlertTriangle },
    { id: 'controls', label: 'Control Testing', icon: Lock },
    { id: 'automation', label: 'AI & Automation', icon: Zap }
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const renderKPICard = (title: string, value: string | number, change: number, icon: React.ElementType, color: string, subtitle?: string) => {
    const Icon = icon;
    const isPositive = change >= 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <Icon className={`h-6 w-6 text-${color}-500`} />
          </div>
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />}
            {Math.abs(change)}%
          </div>
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</div>
        {subtitle && <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{subtitle}</div>}
      </motion.div>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderKPICard('Overall Compliance', '91.5%', 3.2, Shield, 'green', 'Across all departments')}
        {renderKPICard('Open Findings', '22', -15.4, AlertTriangle, 'yellow', '4 critical, 18 non-critical')}
        {renderKPICard('Audits Completed', '92/95', 96.8, ClipboardCheck, 'blue', 'YTD completion rate')}
        {renderKPICard('Automation Rate', '78%', 45.2, Zap, 'purple', 'Of control testing')}
      </div>

      {/* Compliance Scores and Audit Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Compliance by Area</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceScores} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis type="number" domain={[0, 100]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis dataKey="area" type="category" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="score" fill="#3B82F6" radius={[0, 8, 8, 0]}>
                {complianceScores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score >= entry.target ? '#10B981' : '#F59E0B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Audit Progress Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={auditProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis yAxisId="left" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="completed" fill="#10B981" name="Audits Completed" />
              <Line yAxisId="right" type="monotone" dataKey="findings" stroke="#EF4444" strokeWidth={3} name="Findings" />
              <Line yAxisId="right" type="monotone" dataKey="resolved" stroke="#3B82F6" strokeWidth={3} name="Resolved" />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Insights Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">AI-Detected Insights</h3>
          <button className="text-blue-500 hover:text-blue-600 flex items-center text-sm">
            <Eye className="h-4 w-4 mr-1" />
            View All
          </button>
        </div>
        <div className="space-y-3">
          {aiInsights.map((insight, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              } border ${
                insight.severity === 'high' ? 'border-red-500' :
                insight.severity === 'medium' ? 'border-yellow-500' :
                'border-blue-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className={`h-5 w-5 ${
                  insight.severity === 'high' ? 'text-red-500' :
                  insight.severity === 'medium' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <div>
                  <p className="font-medium">{insight.insight}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {insight.department} • {insight.confidence}% confidence
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-6">
      {/* Department Compliance Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Department Compliance Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="text-left py-3 px-4">Department</th>
                <th className="text-center py-3 px-4">Audits</th>
                <th className="text-center py-3 px-4">Compliance</th>
                <th className="text-center py-3 px-4">Open Issues</th>
                <th className="text-center py-3 px-4">Overdue</th>
                <th className="text-center py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {departmentCompliance.map((dept, index) => (
                <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="py-3 px-4 font-medium">{dept.dept}</td>
                  <td className="text-center py-3 px-4">{dept.audits}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-semibold ${
                      dept.compliance >= 90 ? 'text-green-500' :
                      dept.compliance >= 80 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {dept.compliance}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">{dept.openIssues}</td>
                  <td className="text-center py-3 px-4">
                    <span className={dept.overdue > 0 ? 'text-red-500 font-semibold' : 'text-green-500'}>
                      {dept.overdue}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dept.compliance >= 90 && dept.overdue === 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      dept.overdue > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {dept.compliance >= 90 && dept.overdue === 0 ? 'Good' :
                       dept.overdue > 0 ? 'At Risk' : 'Needs Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Compliance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Compliance Score Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { month: 'Jan', financial: 92, operational: 85, it: 88, regulatory: 94 },
              { month: 'Feb', financial: 93, operational: 86, it: 89, regulatory: 95 },
              { month: 'Mar', financial: 91, operational: 87, it: 90, regulatory: 95 },
              { month: 'Apr', financial: 93, operational: 88, it: 91, regulatory: 96 },
              { month: 'May', financial: 94, operational: 87, it: 92, regulatory: 96 },
              { month: 'Jun', financial: 94, operational: 88, it: 92, regulatory: 96 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis domain={[80, 100]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="financial" stroke="#3B82F6" strokeWidth={2} name="Financial" />
              <Line type="monotone" dataKey="operational" stroke="#10B981" strokeWidth={2} name="Operational" />
              <Line type="monotone" dataKey="it" stroke="#F59E0B" strokeWidth={2} name="IT" />
              <Line type="monotone" dataKey="regulatory" stroke="#8B5CF6" strokeWidth={2} name="Regulatory" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Key Compliance Metrics</h3>
          <div className="space-y-6">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle
                    className="text-gray-300 dark:text-gray-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-green-500"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                    strokeDasharray={`${2 * Math.PI * 56 * 0.915} ${2 * Math.PI * 56}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                <span className="absolute text-2xl font-bold">91.5%</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Overall Compliance Rate</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-lg font-semibold text-green-600">148</p>
                <p className="text-xs text-gray-500">Controls Tested</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-lg font-semibold text-blue-600">22</p>
                <p className="text-xs text-gray-500">Findings Open</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Critical Findings</span>
                <span className="font-semibold text-red-600">4</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Resolution Rate</span>
                <span className="font-semibold text-green-600">88%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Avg Resolution Time</span>
                <span className="font-semibold">12 days</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderAuditsTab = () => (
    <div className="space-y-6">
      {/* Upcoming Audits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upcoming Audit Schedule</h3>
          <button className="text-blue-500 hover:text-blue-600 flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            Full Calendar
          </button>
        </div>
        <div className="space-y-3">
          {upcomingAudits.map((audit, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                audit.risk === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                audit.risk === 'high' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                audit.risk === 'medium' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                'border-green-500 bg-green-50 dark:bg-green-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm">{audit.id}</span>
                  <h4 className="font-medium">{audit.area}</h4>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  audit.risk === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  audit.risk === 'high' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  audit.risk === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {audit.risk} risk
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Start: {audit.startDate}</span>
                <span className={`font-medium ${
                  audit.status === 'scheduled' ? 'text-green-600' :
                  'text-yellow-600'
                }`}>
                  {audit.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Audit Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Audit Completion Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={auditProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area type="monotone" dataKey="planned" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Planned" />
              <Area type="monotone" dataKey="completed" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Finding Resolution Metrics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { category: 'Critical', open: 4, resolved: 12, avgDays: 8 },
              { category: 'High', open: 8, resolved: 24, avgDays: 12 },
              { category: 'Medium', open: 10, resolved: 35, avgDays: 18 },
              { category: 'Low', open: 0, resolved: 42, avgDays: 25 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="category" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="open" fill="#EF4444" name="Open" />
              <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );

  const renderRisksTab = () => (
    <div className="space-y-6">
      {/* Risk Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Risk Distribution by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riskHeatmap} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis type="number" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis dataKey="category" type="category" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="high" stackId="a" fill="#EF4444" name="High Risk" />
            <Bar dataKey="medium" stackId="a" fill="#F59E0B" name="Medium Risk" />
            <Bar dataKey="low" stackId="a" fill="#10B981" name="Low Risk" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Risk Mitigation Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Risk Mitigation Timeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[
              { month: 'Jan', identified: 15, mitigated: 12, remaining: 3 },
              { month: 'Feb', identified: 18, mitigated: 15, remaining: 6 },
              { month: 'Mar', identified: 22, mitigated: 20, remaining: 8 },
              { month: 'Apr', identified: 19, mitigated: 18, remaining: 9 },
              { month: 'May', identified: 16, mitigated: 16, remaining: 9 },
              { month: 'Jun', identified: 14, mitigated: 14, remaining: 9 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="identified" stroke="#EF4444" strokeWidth={2} name="Identified" />
              <Line type="monotone" dataKey="mitigated" stroke="#10B981" strokeWidth={2} name="Mitigated" />
              <Line type="monotone" dataKey="remaining" stroke="#F59E0B" strokeWidth={2} name="Remaining" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Top Risk Areas</h3>
          <div className="space-y-4">
            {[
              { area: 'Cybersecurity Threats', level: 'critical', score: 9.2, trend: 'up' },
              { area: 'Regulatory Changes', level: 'high', score: 7.8, trend: 'stable' },
              { area: 'Operational Disruption', level: 'high', score: 7.5, trend: 'down' },
              { area: 'Financial Volatility', level: 'medium', score: 6.3, trend: 'up' },
              { area: 'Vendor Dependencies', level: 'medium', score: 5.8, trend: 'stable' }
            ].map((risk, index) => (
              <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{risk.area}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${
                      risk.level === 'critical' ? 'text-red-500' :
                      risk.level === 'high' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`}>
                      {risk.score}
                    </span>
                    {risk.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : risk.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      risk.level === 'critical' ? 'bg-red-500' :
                      risk.level === 'high' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${risk.score * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderControlsTab = () => (
    <div className="space-y-6">
      {/* Control Effectiveness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Control Effectiveness Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={controlEffectiveness}>
            <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <PolarAngleAxis dataKey="control" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Radar name="Design" dataKey="design" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            <Radar name="Operating" dataKey="operating" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
            <Radar name="Automated" dataKey="automated" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Control Testing Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { status: 'Passed', count: 124, percentage: 83.8, color: 'green' },
          { status: 'Failed', count: 18, percentage: 12.2, color: 'red' },
          { status: 'In Progress', count: 6, percentage: 4.0, color: 'yellow' }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
          >
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${item.color}-100 dark:bg-${item.color}-900/20 mb-4`}>
              {item.status === 'Passed' ? (
                <CheckCircle className={`h-8 w-8 text-${item.color}-600`} />
              ) : item.status === 'Failed' ? (
                <XCircle className={`h-8 w-8 text-${item.color}-600`} />
              ) : (
                <Clock className={`h-8 w-8 text-${item.color}-600`} />
              )}
            </div>
            <h4 className="text-2xl font-bold mb-1">{item.count}</h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{item.status}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-${item.color}-500`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <p className="text-xs mt-1">{item.percentage}%</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="space-y-6">
      {/* Automation Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Time Savings from Automation (Hours/Month)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={automationImpact}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="task" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="before" fill="#EF4444" name="Manual Process" />
            <Bar dataKey="after" fill="#10B981" name="Automated Process" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* AI Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">AI Model Accuracy</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[
              { month: 'Jan', accuracy: 87, precision: 85, recall: 89 },
              { month: 'Feb', accuracy: 89, precision: 87, recall: 91 },
              { month: 'Mar', accuracy: 91, precision: 90, recall: 92 },
              { month: 'Apr', accuracy: 92, precision: 91, recall: 93 },
              { month: 'May', accuracy: 93, precision: 92, recall: 94 },
              { month: 'Jun', accuracy: 94, precision: 93, recall: 95 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis domain={[80, 100]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={2} name="Accuracy" />
              <Line type="monotone" dataKey="precision" stroke="#10B981" strokeWidth={2} name="Precision" />
              <Line type="monotone" dataKey="recall" stroke="#F59E0B" strokeWidth={2} name="Recall" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Automation Benefits</h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Cost Reduction</span>
                <span className="text-green-500 font-semibold">$2.4M/year</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Through automated control testing and compliance monitoring
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Time Saved</span>
                <span className="text-blue-500 font-semibold">1,970 hrs/month</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Equivalent to 12 full-time employees
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Error Reduction</span>
                <span className="text-purple-500 font-semibold">94%</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                In manual data entry and control testing
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Audit Coverage</span>
                <span className="text-yellow-500 font-semibold">3.5x increase</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                More comprehensive testing with same resources
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Internal Audit & Governance Dashboard</h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Comprehensive audit management and compliance monitoring
              </p>
            </div>
            <div className="flex items-center space-x-8">
              <SIAMetrics
                security={useCase.siaScores.security}
                integrity={useCase.siaScores.integrity}
                accuracy={useCase.siaScores.accuracy}
                size="sm"
                animate={true}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            }`}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Departments</option>
            <option value="finance">Finance</option>
            <option value="operations">Operations</option>
            <option value="it">IT</option>
            <option value="hr">HR</option>
            <option value="sales">Sales</option>
          </select>
          <button
            onClick={() => setIsLoading(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'compliance' && renderComplianceTab()}
          {activeTab === 'audits' && renderAuditsTab()}
          {activeTab === 'risks' && renderRisksTab()}
          {activeTab === 'controls' && renderControlsTab()}
          {activeTab === 'automation' && renderAutomationTab()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InternalAuditGovernanceDashboard;