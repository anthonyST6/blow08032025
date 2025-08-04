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
  Home,
  TrendingUp,
  Shield,
  AlertTriangle,
  DollarSign,
  BarChart2,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Brain,
  Scale,
  Eye,
  FileText,
  Users,
  MapPin,
  Gauge,
  Settings,
  TrendingDown,
  Search,
  Calendar,
  Target,
  Zap,
  Database,
  Lock,
  Info
} from 'lucide-react';
import { SIAMetrics } from '../../components/ui/SIAMetric';
import { UseCase } from '../../config/verticals';

interface AIPricingGovernanceDashboardProps {
  useCase: UseCase;
}

const AIPricingGovernanceDashboard: React.FC<AIPricingGovernanceDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedModelVersion, setSelectedModelVersion] = useState('v3.2');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for AI pricing governance
  const modelPerformance = [
    { date: 'Jan', accuracy: 92.5, precision: 89.3, recall: 91.2, f1Score: 90.2 },
    { date: 'Feb', accuracy: 93.1, precision: 90.5, recall: 92.0, f1Score: 91.2 },
    { date: 'Mar', accuracy: 94.2, precision: 91.8, recall: 93.1, f1Score: 92.4 },
    { date: 'Apr', accuracy: 93.8, precision: 91.2, recall: 92.5, f1Score: 91.8 },
    { date: 'May', accuracy: 94.5, precision: 92.3, recall: 93.4, f1Score: 92.8 },
    { date: 'Jun', accuracy: 95.1, precision: 93.0, recall: 94.0, f1Score: 93.5 }
  ];

  const pricingAccuracy = [
    { range: '0-5%', count: 4520, percentage: 68 },
    { range: '5-10%', count: 1580, percentage: 24 },
    { range: '10-15%', count: 330, percentage: 5 },
    { range: '15-20%', count: 130, percentage: 2 },
    { range: '>20%', count: 65, percentage: 1 }
  ];

  const biasMetrics = [
    { category: 'Neighborhood Type', biasScore: 0.12, status: 'low', threshold: 0.15 },
    { category: 'Property Size', biasScore: 0.08, status: 'low', threshold: 0.15 },
    { category: 'School District', biasScore: 0.18, status: 'medium', threshold: 0.15 },
    { category: 'Demographics', biasScore: 0.22, status: 'high', threshold: 0.15 },
    { category: 'Income Level', biasScore: 0.14, status: 'low', threshold: 0.15 }
  ];

  const marketSegments = [
    { segment: 'Single Family', listings: 12450, avgPrice: 425000, modelAccuracy: 94.2 },
    { segment: 'Condos', listings: 8320, avgPrice: 285000, modelAccuracy: 92.8 },
    { segment: 'Townhomes', listings: 5680, avgPrice: 355000, modelAccuracy: 93.5 },
    { segment: 'Multi-Family', listings: 2340, avgPrice: 875000, modelAccuracy: 89.7 },
    { segment: 'Luxury', listings: 1210, avgPrice: 1850000, modelAccuracy: 87.3 }
  ];

  const complianceChecks = [
    { regulation: 'Fair Housing Act', status: 'compliant', lastAudit: '2 days ago', score: 98 },
    { regulation: 'ECOA Compliance', status: 'compliant', lastAudit: '1 week ago', score: 96 },
    { regulation: 'State RE Laws', status: 'review', lastAudit: '3 days ago', score: 88 },
    { regulation: 'Data Privacy (CCPA)', status: 'compliant', lastAudit: '5 days ago', score: 94 },
    { regulation: 'MLS Guidelines', status: 'compliant', lastAudit: '1 day ago', score: 99 }
  ];

  const modelVersions = [
    { version: 'v3.2', deployDate: '2024-06-01', accuracy: 95.1, status: 'active' },
    { version: 'v3.1', deployDate: '2024-04-15', accuracy: 93.8, status: 'archived' },
    { version: 'v3.0', deployDate: '2024-02-01', accuracy: 92.5, status: 'archived' },
    { version: 'v2.9', deployDate: '2023-12-01', accuracy: 91.2, status: 'deprecated' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'model-performance', label: 'Model Performance', icon: Brain },
    { id: 'bias-detection', label: 'Bias Detection', icon: Scale },
    { id: 'market-analysis', label: 'Market Analysis', icon: Home },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'governance', label: 'Governance', icon: Lock }
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
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
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
        {renderKPICard('Model Accuracy', '95.1%', 1.3, Brain, 'blue', 'Current version')}
        {renderKPICard('Properties Valued', '30,000', 12.5, Home, 'green', 'This month')}
        {renderKPICard('Avg Pricing Error', '4.2%', -0.8, Target, 'purple', 'Within target')}
        {renderKPICard('Compliance Score', '96/100', 2.1, Shield, 'indigo', 'All regulations')}
      </div>

      {/* Model Performance and Pricing Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Model Performance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={modelPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="date" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} domain={[85, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={3} name="Accuracy" />
              <Line type="monotone" dataKey="f1Score" stroke="#10B981" strokeWidth={3} name="F1 Score" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Pricing Accuracy Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pricingAccuracy}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="range" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="percentage" name="% of Properties">
                {pricingAccuracy.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    index === 0 ? '#10B981' :
                    index === 1 ? '#3B82F6' :
                    index === 2 ? '#F59E0B' :
                    index === 3 ? '#F97316' :
                    '#EF4444'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Governance Alerts</h3>
          <button className="text-blue-500 hover:text-blue-600 flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            View All
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Bias Detection Alert</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Demographics category exceeds threshold in Downtown district
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-500">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Model Update Available</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Version 3.3 ready for testing with improved accuracy
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderModelPerformanceTab = () => (
    <div className="space-y-6">
      {/* Model Metrics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
        >
          <Gauge className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold mb-2">95.1%</h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Accuracy</p>
          <div className="mt-2 text-xs text-green-500">+1.3% from last month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
        >
          <Target className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold mb-2">93.0%</h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Precision</p>
          <div className="mt-2 text-xs text-green-500">+0.7% from last month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
        >
          <Eye className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold mb-2">94.0%</h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recall</p>
          <div className="mt-2 text-xs text-green-500">+0.6% from last month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
        >
          <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold mb-2">1.2s</h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Response Time</p>
          <div className="mt-2 text-xs text-green-500">-0.3s improvement</div>
        </motion.div>
      </div>

      {/* Performance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Model Performance Metrics Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={modelPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="date" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} domain={[85, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={3} name="Accuracy" />
            <Line type="monotone" dataKey="precision" stroke="#10B981" strokeWidth={3} name="Precision" />
            <Line type="monotone" dataKey="recall" stroke="#8B5CF6" strokeWidth={3} name="Recall" />
            <Line type="monotone" dataKey="f1Score" stroke="#F59E0B" strokeWidth={3} name="F1 Score" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Model Version Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Model Version History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="text-left py-3 px-4">Version</th>
                <th className="text-center py-3 px-4">Deploy Date</th>
                <th className="text-center py-3 px-4">Accuracy</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {modelVersions.map((version, index) => (
                <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="py-3 px-4 font-medium">{version.version}</td>
                  <td className="py-3 px-4 text-center">{version.deployDate}</td>
                  <td className="py-3 px-4 text-center">{version.accuracy}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      version.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      version.status === 'archived' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {version.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-blue-500 hover:text-blue-600 text-sm">
                      {version.status === 'active' ? 'Monitor' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );

  const renderBiasDetectionTab = () => (
    <div className="space-y-6">
      {/* Bias Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Bias Detection Metrics</h3>
        <div className="space-y-4">
          {biasMetrics.map((metric, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Scale className={`h-5 w-5 ${
                    metric.status === 'high' ? 'text-red-500' :
                    metric.status === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                  <span className="font-medium">{metric.category}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    metric.status === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    metric.status === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {metric.status} bias
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  metric.biasScore > metric.threshold ? 'text-red-600' : 'text-green-600'
                }`}>
                  {metric.biasScore.toFixed(2)} / {metric.threshold}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    metric.status === 'high' ? 'bg-red-500' :
                    metric.status === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(metric.biasScore / 0.3) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bias Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Bias Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={biasMetrics}>
              <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <PolarAngleAxis dataKey="category" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <PolarRadiusAxis angle={90} domain={[0, 0.3]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Radar name="Bias Score" dataKey="biasScore" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              <Radar name="Threshold" dataKey="threshold" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Fairness Metrics Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { month: 'Jan', disparateImpact: 0.85, equalOdds: 0.88, demographicParity: 0.82 },
              { month: 'Feb', disparateImpact: 0.87, equalOdds: 0.89, demographicParity: 0.84 },
              { month: 'Mar', disparateImpact: 0.89, equalOdds: 0.91, demographicParity: 0.86 },
              { month: 'Apr', disparateImpact: 0.88, equalOdds: 0.90, demographicParity: 0.85 },
              { month: 'May', disparateImpact: 0.90, equalOdds: 0.92, demographicParity: 0.87 },
              { month: 'Jun', disparateImpact: 0.91, equalOdds: 0.93, demographicParity: 0.88 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} domain={[0.7, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="disparateImpact" stroke="#3B82F6" strokeWidth={3} name="Disparate Impact" />
              <Line type="monotone" dataKey="equalOdds" stroke="#10B981" strokeWidth={3} name="Equal Odds" />
              <Line type="monotone" dataKey="demographicParity" stroke="#8B5CF6" strokeWidth={3} name="Demographic Parity" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bias Mitigation Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Bias Mitigation Actions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Demographics Bias Alert</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Implement additional fairness constraints for demographic features
                </p>
              </div>
            </div>
            <button className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">
              Take Action
            </button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-500">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">School District Bias Review</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Review pricing model weights for school district features
                </p>
              </div>
            </div>
            <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
              Review
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderMarketAnalysisTab = () => (
    <div className="space-y-6">
      {/* Market Segments Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Market Segment Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="text-left py-3 px-4">Segment</th>
                <th className="text-center py-3 px-4">Listings</th>
                <th className="text-center py-3 px-4">Avg Price</th>
                <th className="text-center py-3 px-4">Model Accuracy</th>
                <th className="text-center py-3 px-4">Trend</th>
              </tr>
            </thead>
            <tbody>
              {marketSegments.map((segment, index) => (
                <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="py-3 px-4 font-medium">{segment.segment}</td>
                  <td className="py-3 px-4 text-center">{segment.listings.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">${segment.avgPrice.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            segment.modelAccuracy >= 93 ? 'bg-green-500' :
                            segment.modelAccuracy >= 90 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${segment.modelAccuracy}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm">{segment.modelAccuracy}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {segment.modelAccuracy >= 93 ?
                      <TrendingUp className="h-5 w-5 text-green-500 mx-auto" /> :
                      <TrendingDown className="h-5 w-5 text-red-500 mx-auto" />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Market Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Market Share by Segment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={marketSegments}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ segment, listings }) => `${segment}: ${((listings / marketSegments.reduce((sum, s) => sum + s.listings, 0)) * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="listings"
              >
                {marketSegments.map((entry, index) => (
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
          <h3 className="text-lg font-semibold mb-4">Price Prediction vs Actual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis type="number" dataKey="actual" name="Actual Price" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis type="number" dataKey="predicted" name="Predicted Price" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Scatter
                name="Properties"
                data={[
                  { actual: 250000, predicted: 245000 },
                  { actual: 350000, predicted: 362000 },
                  { actual: 450000, predicted: 448000 },
                  { actual: 550000, predicted: 542000 },
                  { actual: 650000, predicted: 668000 },
                  { actual: 750000, predicted: 745000 },
                  { actual: 850000, predicted: 832000 },
                  { actual: 950000, predicted: 978000 }
                ]}
                fill="#3B82F6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-6">
      {/* Compliance Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Regulatory Compliance Status</h3>
        <div className="space-y-4">
          {complianceChecks.map((check, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              check.status === 'compliant' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
              check.status === 'review' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
              'border-red-500 bg-red-50 dark:bg-red-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className={`h-6 w-6 ${
                    check.status === 'compliant' ? 'text-green-500' :
                    check.status === 'review' ? 'text-yellow-500' :
                    'text-red-500'
                  }`} />
                  <div>
                    <h4 className="font-semibold">{check.regulation}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last audit: {check.lastAudit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{check.score}%</div>
                  <span className={`text-sm font-semibold ${
                    check.status === 'compliant' ? 'text-green-600' :
                    check.status === 'review' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {check.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Compliance Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { month: 'Jan', score: 92, audits: 12 },
              { month: 'Feb', score: 93, audits: 15 },
              { month: 'Mar', score: 94, audits: 14 },
              { month: 'Apr', score: 93, audits: 16 },
              { month: 'May', score: 95, audits: 18 },
              { month: 'Jun', score: 96, audits: 20 }
            ]}>
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
              <Line yAxisId="left" type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} name="Compliance Score" />
              <Line yAxisId="right" type="monotone" dataKey="audits" stroke="#3B82F6" strokeWidth={3} name="Audits Completed" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Upcoming Compliance Tasks</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-500">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Fair Housing Act Review</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Due in 5 days</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Quarterly Bias Report</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Due in 12 days</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-500">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Annual Compliance Audit</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Due in 45 days</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderGovernanceTab = () => (
    <div className="space-y-6">
      {/* Governance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <Lock className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">12</span>
          </div>
          <h4 className="font-semibold mb-1">Access Controls</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active user permissions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <Database className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold">98.5%</span>
          </div>
          <h4 className="font-semibold mb-1">Data Quality</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Training data integrity</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-purple-500" />
            <span className="text-2xl font-bold">24</span>
          </div>
          <h4 className="font-semibold mb-1">Audit Logs</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Model decisions tracked</p>
        </motion.div>
      </div>

      {/* Model Governance Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Model Governance Framework</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Model Development</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700">
                <span className="text-sm">Data Collection Standards</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700">
                <span className="text-sm">Feature Engineering Review</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700">
                <span className="text-sm">Model Validation Process</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700">
                <span className="text-sm">Bias Testing Protocol</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Operational Controls</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700">
                <span className="text-sm">Real-time Monitoring</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700">
                <span className="text-sm">Drift Detection</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700">
                <span className="text-sm">Explainability Tools</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700">
                <span className="text-sm">Human-in-the-loop Review</span>
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Governance Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Recent Governance Activities</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Model v3.2 Deployment Approved</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">By Sarah Johnson • 2 hours ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Quarterly Compliance Review Completed</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">By Michael Chen • 1 day ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center space-x-3">
              <Scale className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Bias Mitigation Strategy Updated</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">By Emily Davis • 3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Pricing Governance Dashboard</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Monitor and govern AI-powered real estate pricing models
          </p>
        </div>
        <div className="flex items-center space-x-6">
          <SIAMetrics
            security={useCase.siaScores.security}
            integrity={useCase.siaScores.integrity}
            accuracy={useCase.siaScores.accuracy}
            size="sm"
            animate={true}
          />
          <select
            value={selectedModelVersion}
            onChange={(e) => setSelectedModelVersion(e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            } border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
          >
            <option value="v3.2">Model v3.2</option>
            <option value="v3.1">Model v3.1</option>
            <option value="v3.0">Model v3.0</option>
          </select>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            } border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={() => setIsLoading(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 font-medium text-sm transition-colors ${
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
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'model-performance' && renderModelPerformanceTab()}
          {activeTab === 'bias-detection' && renderBiasDetectionTab()}
          {activeTab === 'market-analysis' && renderMarketAnalysisTab()}
          {activeTab === 'compliance' && renderComplianceTab()}
          {activeTab === 'governance' && renderGovernanceTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AIPricingGovernanceDashboard;