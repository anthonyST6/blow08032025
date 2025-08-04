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
  Treemap
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
  Target
} from 'lucide-react';
import { SIAMetrics } from '../../components/ui/SIAMetric';
import { UseCase } from '../../config/verticals';

interface PHMSAComplianceDashboardProps {
  useCase: UseCase;
}

const PHMSAComplianceDashboard: React.FC<PHMSAComplianceDashboardProps> = ({ useCase }) => {
  const isDarkMode = true; // You can get this from a theme context if needed
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedPipelineSegment, setSelectedPipelineSegment] = useState('all');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for PHMSA compliance metrics
  const complianceScoreByCategory = [
    { category: 'Pipeline Integrity', score: 94, required: 90, violations: 2 },
    { category: 'Operator Qualification', score: 98, required: 95, violations: 0 },
    { category: 'Drug & Alcohol', score: 100, required: 100, violations: 0 },
    { category: 'Control Room Management', score: 92, required: 90, violations: 1 },
    { category: 'Public Awareness', score: 96, required: 95, violations: 1 },
    { category: 'Emergency Response', score: 89, required: 90, violations: 3 }
  ];

  const reportSubmissionStatus = [
    { month: 'Jan', onTime: 45, late: 2, pending: 1, automated: 42 },
    { month: 'Feb', onTime: 48, late: 1, pending: 0, automated: 46 },
    { month: 'Mar', onTime: 52, late: 0, pending: 0, automated: 51 },
    { month: 'Apr', onTime: 50, late: 1, pending: 1, automated: 48 },
    { month: 'May', onTime: 54, late: 0, pending: 0, automated: 53 },
    { month: 'Jun', onTime: 56, late: 0, pending: 0, automated: 56 }
  ];

  const pipelineSegmentCompliance = [
    { segment: 'Transmission', miles: 2340, compliant: 2298, nonCompliant: 42, riskScore: 8 },
    { segment: 'Distribution', miles: 5670, compliant: 5612, nonCompliant: 58, riskScore: 12 },
    { segment: 'Gathering', miles: 890, compliant: 878, nonCompliant: 12, riskScore: 5 },
    { segment: 'Storage', miles: 450, compliant: 448, nonCompliant: 2, riskScore: 3 }
  ];

  const inspectionMetrics = [
    { type: 'Inline Inspection', scheduled: 24, completed: 22, overdue: 2, avgDays: 3.2 },
    { type: 'Direct Assessment', scheduled: 18, completed: 18, overdue: 0, avgDays: 2.8 },
    { type: 'Pressure Testing', scheduled: 12, completed: 11, overdue: 1, avgDays: 4.1 },
    { type: 'Cathodic Protection', scheduled: 36, completed: 36, overdue: 0, avgDays: 1.5 }
  ];

  const violationTrends = [
    { quarter: 'Q1 2023', critical: 3, major: 8, minor: 15, resolved: 22 },
    { quarter: 'Q2 2023', critical: 2, major: 6, minor: 12, resolved: 18 },
    { quarter: 'Q3 2023', critical: 1, major: 5, minor: 10, resolved: 14 },
    { quarter: 'Q4 2023', critical: 1, major: 4, minor: 8, resolved: 12 },
    { quarter: 'Q1 2024', critical: 0, major: 3, minor: 6, resolved: 8 },
    { quarter: 'Q2 2024', critical: 0, major: 2, minor: 5, resolved: 7 }
  ];

  const automationImpact = [
    { task: 'Report Generation', before: 480, after: 45, reduction: 90.6 },
    { task: 'Data Validation', before: 360, after: 15, reduction: 95.8 },
    { task: 'Compliance Checking', before: 240, after: 30, reduction: 87.5 },
    { task: 'Document Filing', before: 180, after: 10, reduction: 94.4 },
    { task: 'Audit Preparation', before: 720, after: 120, reduction: 83.3 }
  ];

  const upcomingDeadlines = [
    { id: 1, report: 'Annual Pipeline Summary', dueDate: '2024-07-15', status: 'in-progress', completion: 75 },
    { id: 2, report: 'Operator Qualification Review', dueDate: '2024-07-30', status: 'pending', completion: 45 },
    { id: 3, report: 'Emergency Response Plan Update', dueDate: '2024-08-01', status: 'in-progress', completion: 60 },
    { id: 4, report: 'Integrity Management Assessment', dueDate: '2024-08-15', status: 'not-started', completion: 0 },
    { id: 5, report: 'Public Awareness Program', dueDate: '2024-08-30', status: 'in-progress', completion: 30 }
  ];

  const aiModelPerformance = [
    { model: 'Anomaly Detection', accuracy: 96.8, falsePositives: 2.1, processing: '1.2s' },
    { model: 'Report Classification', accuracy: 98.5, falsePositives: 0.8, processing: '0.8s' },
    { model: 'Compliance Prediction', accuracy: 94.2, falsePositives: 3.5, processing: '2.1s' },
    { model: 'Risk Assessment', accuracy: 92.7, falsePositives: 4.2, processing: '1.5s' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'compliance-status', label: 'Compliance Status', icon: Shield },
    { id: 'reporting', label: 'Reporting', icon: FileText },
    { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'automation', label: 'Automation Impact', icon: Zap }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

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
        {renderKPICard('Overall Compliance', '95.2%', 3.8, Shield, 'green', 'Above PHMSA requirement')}
        {renderKPICard('Active Violations', '7', -45.2, AlertTriangle, 'red', '3 critical, 4 minor')}
        {renderKPICard('Reports Automated', '92%', 15.3, FileCheck, 'blue', 'Saving 435 hrs/month')}
        {renderKPICard('Next Audit', '45 days', 0, Calendar, 'purple', 'Preparation 75% complete')}
      </div>

      {/* Compliance Score by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Compliance by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceScoreByCategory} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis type="number" domain={[0, 100]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis dataKey="category" type="category" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="score" fill="#3B82F6" radius={[0, 8, 8, 0]}>
                {complianceScoreByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score >= entry.required ? '#10B981' : '#EF4444'} />
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
          <h3 className="text-lg font-semibold mb-4">Pipeline Segment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pipelineSegmentCompliance}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ segment, miles }) => `${segment}: ${miles} mi`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="miles"
              >
                {pipelineSegmentCompliance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Upcoming Deadlines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upcoming PHMSA Deadlines</h3>
          <button className="text-blue-500 hover:text-blue-600 flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            View Calendar
          </button>
        </div>
        <div className="space-y-3">
          {upcomingDeadlines.map((deadline) => (
            <div
              key={deadline.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              } border ${
                deadline.completion === 0 ? 'border-red-500' :
                deadline.completion < 50 ? 'border-yellow-500' :
                'border-green-500'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{deadline.report}</p>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Due: {deadline.dueDate}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      deadline.completion === 0 ? 'bg-red-500' :
                      deadline.completion < 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${deadline.completion}%` }}
                  />
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderComplianceStatusTab = () => (
    <div className="space-y-6">
      {/* Detailed Compliance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Detailed Compliance Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {complianceScoreByCategory.map((category, index) => (
            <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{category.category}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  category.score >= category.required
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {category.score >= category.required ? 'Compliant' : 'Non-Compliant'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Score</span>
                  <span className="font-semibold">{category.score}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Required Score</span>
                  <span>{category.required}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Violations</span>
                  <span className={category.violations > 0 ? 'text-red-500' : 'text-green-500'}>
                    {category.violations}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                <div className="relative">
                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <div
                      className={`h-2 rounded-full ${
                        category.score >= category.required ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                  <div
                    className="absolute top-0 h-2 w-0.5 bg-yellow-500"
                    style={{ left: `${category.required}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pipeline Risk Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Pipeline Risk Assessment</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis 
              dataKey="miles" 
              name="Pipeline Miles" 
              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
              label={{ value: 'Pipeline Miles', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              dataKey="riskScore" 
              name="Risk Score" 
              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
              label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'miles') return [`${value} miles`, 'Pipeline Length'];
                if (name === 'riskScore') return [`${value}/100`, 'Risk Score'];
                return [value, name];
              }}
            />
            <Scatter 
              name="Pipeline Segments" 
              data={pipelineSegmentCompliance} 
              fill="#3B82F6"
            >
              {pipelineSegmentCompliance.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={
                  entry.riskScore > 10 ? '#EF4444' :
                  entry.riskScore > 5 ? '#F59E0B' :
                  '#10B981'
                } />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );

  const renderReportingTab = () => (
    <div className="space-y-6">
      {/* Report Submission Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Report Submission Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={reportSubmissionStatus}>
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
            <Area type="monotone" dataKey="onTime" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="On Time" />
            <Area type="monotone" dataKey="late" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Late" />
            <Area type="monotone" dataKey="pending" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Pending" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Automation Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Report Automation Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={reportSubmissionStatus}>
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
                formatter={(value: any) => [`${((value as number) / 56 * 100).toFixed(1)}%`, 'Automation Rate']}
              />
              <Line 
                type="monotone" 
                dataKey="automated" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ r: 6 }}
                name="Automated Reports"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-blue-500">100%</p>
            <p className="text-sm text-gray-500">Automation achieved in June</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Report Types Distribution</h3>
          <div className="space-y-4">
            {[
              { type: 'Safety Related Conditions', count: 156, automated: 152 },
              { type: 'Incident Reports', count: 89, automated: 87 },
              { type: 'Annual Reports', count: 12, automated: 12 },
              { type: 'Operator Qualification', count: 234, automated: 230 },
              { type: 'Integrity Management', count: 78, automated: 75 }
            ].map((report, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{report.type}</span>
                  <span className="text-xs text-gray-500">{report.count} total</span>
                </div>
                <div className="relative">
                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${(report.automated / report.count) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{report.automated} automated</span>
                  <span>{((report.automated / report.count) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderInspectionsTab = () => (
    <div className="space-y-6">
      {/* Inspection Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Inspection Program Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inspectionMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="type" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
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
            <Bar dataKey="scheduled" fill="#3B82F6" name="Scheduled" />
            <Bar dataKey="completed" fill="#10B981" name="Completed" />
            <Bar dataKey="overdue" fill="#EF4444" name="Overdue" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Inspection Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Completion Rate</h4>
            <Target className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle
                  className="text-gray-300 dark:text-gray-700"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="58"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-green-500"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="58"
                  cx="64"
                  cy="64"
                  strokeDasharray={`${2 * Math.PI * 58 * 0.945} ${2 * Math.PI * 58}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <span className="absolute text-2xl font-bold">94.5%</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Overall Completion</p>
          </div>
          <div className="mt-4 space-y-2">
            {inspectionMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{metric.type}</span>
                <span className="font-medium">
                  {((metric.completed / metric.scheduled) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Average Turnaround</h4>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            {inspectionMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{metric.type}</span>
                  <span className="text-sm font-medium">{metric.avgDays} days</span>
                </div>
                <div className="relative">
                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-2 rounded-full ${
                        metric.avgDays <= 3 ? 'bg-green-500' :
                        metric.avgDays <= 4 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((5 - metric.avgDays) / 5 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Critical Findings</h4>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {[
              { finding: 'Corrosion Level 3', count: 3, trend: 'down' },
              { finding: 'Coating Damage', count: 7, trend: 'stable' },
              { finding: 'Dent with Stress', count: 1, trend: 'down' },
              { finding: 'Crack-like Anomaly', count: 0, trend: 'stable' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <span className="text-sm font-medium">{item.finding}</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${item.count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {item.count}
                  </span>
                  {item.trend === 'down' && <TrendingUp className="h-4 w-4 text-green-500 transform rotate-180" />}
                  {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderViolationsTab = () => (
    <div className="space-y-6">
      {/* Violation Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Violation Trends Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={violationTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="quarter" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
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
            <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={3} dot={{ r: 6 }} name="Critical" />
            <Line type="monotone" dataKey="major" stroke="#F59E0B" strokeWidth={3} dot={{ r: 6 }} name="Major" />
            <Line type="monotone" dataKey="minor" stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} name="Minor" />
            <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} dot={{ r: 6 }} name="Resolved" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Violation Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Active Violations by Severity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">Critical Violations</p>
                  <p className="text-sm text-red-700 dark:text-red-300">Immediate action required</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">0</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">Major Violations</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Action within 30 days</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">2</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <FileWarning className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">Minor Violations</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Scheduled resolution</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">5</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Resolution Progress</h3>
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-green-500">89%</p>
              <p className="text-sm text-gray-500">Violations Resolved YTD</p>
            </div>
            <div className="space-y-3">
              {[
                { status: 'Resolved This Quarter', count: 7, percentage: 35 },
                { status: 'In Progress', count: 4, percentage: 20 },
                { status: 'Pending Review', count: 2, percentage: 10 },
                { status: 'New This Quarter', count: 7, percentage: 35 }
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.status}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-2 rounded-full ${
                        item.status.includes('Resolved') ? 'bg-green-500' :
                        item.status.includes('Progress') ? 'bg-blue-500' :
                        item.status.includes('Pending') ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="space-y-6">
      {/* Time Savings Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Automation Time Savings</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={automationImpact}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="task" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} angle={-45} textAnchor="end" height={80} />
            <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: string) => [`${value} min`, name]}
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
          <h3 className="text-lg font-semibold mb-4">AI Model Performance</h3>
          <div className="space-y-4">
            {aiModelPerformance.map((model, index) => (
              <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{model.model}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    model.accuracy >= 95 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {model.accuracy}% Accurate
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">False Positives</p>
                    <p className="font-semibold">{model.falsePositives}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Processing</p>
                    <p className="font-semibold">{model.processing}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold text-green-500">Active</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">ROI Metrics</h3>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">$2.4M</p>
              <p className="text-sm text-gray-500 mt-2">Annual Cost Savings</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-2xl font-semibold text-blue-600">435</p>
                <p className="text-xs text-gray-500">Hours Saved/Month</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-semibold text-green-600">92%</p>
                <p className="text-xs text-gray-500">Error Reduction</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Compliance Accuracy</span>
                <span className="font-semibold">+18%</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Audit Preparation Time</span>
                <span className="font-semibold text-green-500">-83%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Penalty Avoidance</span>
                <span className="font-semibold">$850K</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">PHMSA Compliance Dashboard</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              AI-powered pipeline safety compliance and regulatory reporting automation
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

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : `${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'compliance-status' && renderComplianceStatusTab()}
          {activeTab === 'reporting' && renderReportingTab()}
          {activeTab === 'inspections' && renderInspectionsTab()}
          {activeTab === 'violations' && renderViolationsTab()}
          {activeTab === 'automation' && renderAutomationTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PHMSAComplianceDashboard;