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
  AlertTriangle,
  TrendingUp,
  Shield,
  FileText,
  DollarSign,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  BarChart2,
  PieChart as PieChartIcon,
  Target,
  Zap,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  Briefcase,
  Home,
  Car,
  Heart,
  Umbrella
} from 'lucide-react';
import { SIAMetrics } from '../../components/ui/SIAMetric';
import { UseCase } from '../../config/verticals';

interface InsuranceRiskAssessmentDashboardProps {
  useCase: UseCase;
}

const InsuranceRiskAssessmentDashboard: React.FC<InsuranceRiskAssessmentDashboardProps> = ({ useCase }) => {
  const isDarkMode = true; // You can get this from a theme context if needed
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedRiskCategory, setSelectedRiskCategory] = useState('all');
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for risk assessment metrics
  const riskScoreDistribution = [
    { score: '0-20', count: 145, risk: 'Very Low' },
    { score: '21-40', count: 312, risk: 'Low' },
    { score: '41-60', count: 489, risk: 'Medium' },
    { score: '61-80', count: 234, risk: 'High' },
    { score: '81-100', count: 87, risk: 'Very High' }
  ];

  const policyTypeBreakdown = [
    { type: 'Auto', count: 4532, premium: 2.3, claims: 1.8 },
    { type: 'Home', count: 3421, premium: 3.1, claims: 2.4 },
    { type: 'Life', count: 2156, premium: 1.9, claims: 0.8 },
    { type: 'Health', count: 5678, premium: 4.2, claims: 3.9 },
    { type: 'Commercial', count: 1234, premium: 5.6, claims: 4.1 }
  ];

  const fraudDetectionMetrics = [
    { month: 'Jan', detected: 23, prevented: 19, falsePositives: 4 },
    { month: 'Feb', detected: 31, prevented: 28, falsePositives: 3 },
    { month: 'Mar', detected: 27, prevented: 25, falsePositives: 2 },
    { month: 'Apr', detected: 35, prevented: 32, falsePositives: 3 },
    { month: 'May', detected: 29, prevented: 27, falsePositives: 2 },
    { month: 'Jun', detected: 38, prevented: 35, falsePositives: 3 }
  ];

  const claimsPrediction = [
    { category: 'Weather Events', current: 85, predicted: 92, confidence: 87 },
    { category: 'Auto Accidents', current: 72, predicted: 68, confidence: 91 },
    { category: 'Property Damage', current: 64, predicted: 71, confidence: 84 },
    { category: 'Health Claims', current: 91, predicted: 95, confidence: 89 },
    { category: 'Liability', current: 45, predicted: 48, confidence: 82 }
  ];

  const underwritingEfficiency = [
    { stage: 'Application', before: 120, after: 45, improvement: 62.5 },
    { stage: 'Risk Assessment', before: 180, after: 30, improvement: 83.3 },
    { stage: 'Verification', before: 240, after: 60, improvement: 75.0 },
    { stage: 'Approval', before: 60, after: 15, improvement: 75.0 },
    { stage: 'Policy Issuance', before: 30, after: 10, improvement: 66.7 }
  ];

  const geographicRiskMap = [
    { region: 'Northeast', riskScore: 45, policies: 3421, claims: 234 },
    { region: 'Southeast', riskScore: 72, policies: 4532, claims: 456 },
    { region: 'Midwest', riskScore: 38, policies: 2987, claims: 187 },
    { region: 'Southwest', riskScore: 61, policies: 3876, claims: 342 },
    { region: 'West', riskScore: 68, policies: 5123, claims: 489 }
  ];

  const customerSegmentation = [
    { segment: 'Low Risk', value: 35, growth: 12 },
    { segment: 'Medium Risk', value: 45, growth: 8 },
    { segment: 'High Risk', value: 15, growth: -5 },
    { segment: 'New Customers', value: 5, growth: 25 }
  ];

  const aiModelPerformance = [
    { model: 'Fraud Detection', accuracy: 94.2, precision: 91.8, recall: 89.5, f1Score: 90.6 },
    { model: 'Risk Scoring', accuracy: 89.7, precision: 87.3, recall: 92.1, f1Score: 89.6 },
    { model: 'Claims Prediction', accuracy: 86.4, precision: 84.2, recall: 88.9, f1Score: 86.5 },
    { model: 'Customer Churn', accuracy: 91.3, precision: 89.7, recall: 90.2, f1Score: 89.9 }
  ];

  const realTimeAlerts = [
    { id: 1, type: 'fraud', severity: 'high', message: 'Suspicious claim pattern detected for Policy #A2341', time: '2 min ago' },
    { id: 2, type: 'risk', severity: 'medium', message: 'Weather event increasing risk in Southeast region', time: '15 min ago' },
    { id: 3, type: 'compliance', severity: 'low', message: 'New regulatory update requires policy adjustment', time: '1 hour ago' },
    { id: 4, type: 'operational', severity: 'high', message: 'Underwriting backlog exceeding threshold', time: '2 hours ago' }
  ];

  const claimsAnalytics = [
    { month: 'Jan', submitted: 342, approved: 298, denied: 44, avgProcessTime: 3.2 },
    { month: 'Feb', submitted: 387, approved: 341, denied: 46, avgProcessTime: 2.9 },
    { month: 'Mar', submitted: 412, approved: 367, denied: 45, avgProcessTime: 2.7 },
    { month: 'Apr', submitted: 398, approved: 352, denied: 46, avgProcessTime: 2.5 },
    { month: 'May', submitted: 425, approved: 378, denied: 47, avgProcessTime: 2.3 },
    { month: 'Jun', submitted: 441, approved: 394, denied: 47, avgProcessTime: 2.1 }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'risk-assessment', label: 'Risk Assessment', icon: Shield },
    { id: 'fraud-detection', label: 'Fraud Detection', icon: AlertTriangle },
    { id: 'underwriting', label: 'Underwriting', icon: FileText },
    { id: 'claims', label: 'Claims Analytics', icon: DollarSign },
    { id: 'ai-models', label: 'AI Performance', icon: Zap }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const renderKPICard = (title: string, value: string | number, change: number, icon: React.ElementType, color: string) => {
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
      </motion.div>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderKPICard('Total Policies', '17,021', 8.3, Briefcase, 'blue')}
        {renderKPICard('Risk Score Avg', '48.2', -5.7, Shield, 'green')}
        {renderKPICard('Fraud Detected', '$2.3M', 12.4, AlertTriangle, 'red')}
        {renderKPICard('Processing Time', '2.5 hrs', -35.2, Clock, 'purple')}
      </div>

      {/* Risk Score Distribution and Policy Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskScoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="score" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                {riskScoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          <h3 className="text-lg font-semibold mb-4">Policy Type Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={policyTypeBreakdown}>
              <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <PolarAngleAxis dataKey="type" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <PolarRadiusAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Radar name="Premium (M)" dataKey="premium" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Radar name="Claims (M)" dataKey="claims" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Real-time Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Real-time Alerts</h3>
          <button className="text-blue-500 hover:text-blue-600 flex items-center text-sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>
        <div className="space-y-3">
          {realTimeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              } border ${
                alert.severity === 'high' ? 'border-red-500' :
                alert.severity === 'medium' ? 'border-yellow-500' :
                'border-green-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className={`h-5 w-5 ${
                  alert.severity === 'high' ? 'text-red-500' :
                  alert.severity === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`} />
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{alert.time}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderRiskAssessmentTab = () => (
    <div className="space-y-6">
      {/* Geographic Risk Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Geographic Risk Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={geographicRiskMap} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis type="number" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis dataKey="region" type="category" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="riskScore" fill="#EF4444" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Customer Segmentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Customer Risk Segmentation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerSegmentation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ segment, value }) => `${segment}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {customerSegmentation.map((entry, index) => (
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Claims Prediction Accuracy</h3>
          <div className="space-y-4">
            {claimsPrediction.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm text-gray-500">{item.confidence}% confidence</span>
                </div>
                <div className="relative">
                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${item.current}%` }}
                    />
                  </div>
                  <div
                    className="absolute top-0 h-2 rounded-full bg-green-500 opacity-50"
                    style={{ width: `${item.predicted}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Current: {item.current}</span>
                  <span>Predicted: {item.predicted}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderFraudDetectionTab = () => (
    <div className="space-y-6">
      {/* Fraud Detection Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Fraud Detection Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={fraudDetectionMetrics}>
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
            <Line type="monotone" dataKey="detected" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="prevented" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="falsePositives" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Fraud Pattern Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Fraud by Type</h4>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {[
              { type: 'Identity Theft', count: 45, trend: 'up' },
              { type: 'Staged Accidents', count: 32, trend: 'down' },
              { type: 'Inflated Claims', count: 28, trend: 'up' },
              { type: 'False Documentation', count: 19, trend: 'stable' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{item.type}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{item.count}</span>
                  {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                  {item.trend === 'down' && <TrendingUp className="h-4 w-4 text-green-500 transform rotate-180" />}
                </div>
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
            <h4 className="font-semibold">Detection Methods</h4>
            <Zap className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {[
              { method: 'AI Pattern Recognition', effectiveness: 94 },
              { method: 'Rule-based Checks', effectiveness: 76 },
              { method: 'Manual Review', effectiveness: 82 },
              { method: 'Third-party Data', effectiveness: 88 }
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.method}</span>
                  <span>{item.effectiveness}%</span>
                </div>
                <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                    style={{ width: `${item.effectiveness}%` }}
                  />
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
            <h4 className="font-semibold">Financial Impact</h4>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Prevented</p>
              <p className="text-2xl font-bold text-green-500">$2.3M</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average per Case</p>
              <p className="text-xl font-semibold">$18,750</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ROI on Detection</p>
              <p className="text-xl font-semibold text-blue-500">412%</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderUnderwritingTab = () => (
    <div className="space-y-6">
      {/* Process Efficiency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Underwriting Process Efficiency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={underwritingEfficiency}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="stage" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
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
            <Bar dataKey="before" fill="#EF4444" name="Before AI (min)" />
            <Bar dataKey="after" fill="#10B981" name="After AI (min)" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Improvement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Process Improvement</h3>
          <div className="space-y-4">
            {underwritingEfficiency.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-green-500 font-semibold">-{stage.improvement}%</span>
                </div>
                <div className="relative">
                  <div className={`h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                      style={{ width: `${stage.improvement}%` }}
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
          <h3 className="text-lg font-semibold mb-4">Automation Impact</h3>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500">73%</p>
              <p className="text-sm text-gray-500 mt-2">Average Time Reduction</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold">630 min</p>
                <p className="text-xs text-gray-500">Total Before</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-green-500">160 min</p>
                <p className="text-xs text-gray-500">Total After</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Policies per Day</span>
                <span className="font-semibold">+285%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Satisfaction</span>
                <span className="font-semibold text-green-500">+42%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderClaimsTab = () => (
    <div className="space-y-6">
      {/* Claims Analytics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Claims Processing Analytics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={claimsAnalytics}>
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
            <Area type="monotone" dataKey="submitted" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="approved" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            <Area type="monotone" dataKey="denied" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Claims Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h4 className="font-semibold mb-4">Approval Rates</h4>
          <div className="space-y-3">
            {claimsAnalytics.map((month, index) => {
              const approvalRate = ((month.approved / month.submitted) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{month.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${approvalRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{approvalRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h4 className="font-semibold mb-4">Processing Time Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={claimsAnalytics}>
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
              <Line type="monotone" dataKey="avgProcessTime" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Average Processing Time</p>
            <p className="text-2xl font-bold text-purple-500">2.1 days</p>
            <p className="text-xs text-green-500">-34% from January</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h4 className="font-semibold mb-4">Claims by Category</h4>
          <div className="space-y-4">
            {[
              { category: 'Auto', percentage: 35, color: 'blue' },
              { category: 'Property', percentage: 28, color: 'green' },
              { category: 'Health', percentage: 22, color: 'purple' },
              { category: 'Life', percentage: 10, color: 'yellow' },
              { category: 'Other', percentage: 5, color: 'red' }
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.category}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded-full bg-${item.color}-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderAIModelsTab = () => (
    <div className="space-y-6">
      {/* Model Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">AI Model Performance Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={aiModelPerformance}>
            <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <PolarAngleAxis dataKey="model" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Radar name="Accuracy" dataKey="accuracy" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            <Radar name="Precision" dataKey="precision" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            <Radar name="Recall" dataKey="recall" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Model Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {aiModelPerformance.map((model, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">{model.model}</h4>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                model.accuracy >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                model.accuracy >= 85 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {model.accuracy >= 90 ? 'Excellent' : model.accuracy >= 85 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Accuracy</p>
                <p className="text-xl font-semibold">{model.accuracy}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Precision</p>
                <p className="text-xl font-semibold">{model.precision}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Recall</p>
                <p className="text-xl font-semibold">{model.recall}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">F1 Score</p>
                <p className="text-xl font-semibold">{model.f1Score}%</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Last Updated</span>
                <span>2 hours ago</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Training Data</span>
                <span>1.2M records</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Insurance Risk Assessment Dashboard</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              AI-powered risk assessment and fraud detection for insurance operations
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
          {activeTab === 'risk-assessment' && renderRiskAssessmentTab()}
          {activeTab === 'fraud-detection' && renderFraudDetectionTab()}
          {activeTab === 'underwriting' && renderUnderwritingTab()}
          {activeTab === 'claims' && renderClaimsTab()}
          {activeTab === 'ai-models' && renderAIModelsTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InsuranceRiskAssessmentDashboard;