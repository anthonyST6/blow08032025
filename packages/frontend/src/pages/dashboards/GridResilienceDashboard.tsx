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
  Treemap
} from 'recharts';
import {
  Zap,
  AlertTriangle,
  TrendingUp,
  Shield,
  MapPin,
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
  Power,
  Gauge,
  Thermometer,
  Cloud,
  Navigation,
  Radio,
  Satellite,
  Target,
  Eye,
  Battery,
  Cpu,
  Network,
  Wifi,
  Wind
} from 'lucide-react';
import { SIAMetrics } from '../../components/ui/SIAMetric';
import { UseCase } from '../../config/verticals';

interface GridResilienceDashboardProps {
  useCase: UseCase;
}

const GridResilienceDashboard: React.FC<GridResilienceDashboardProps> = ({ useCase }) => {
  const isDarkMode = true; // You can get this from a theme context if needed
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedOutageType, setSelectedOutageType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for grid resilience metrics
  const gridHealthMetrics = [
    { metric: 'System Reliability', value: 99.87, target: 99.9, unit: '%' },
    { metric: 'Load Balance', value: 82.5, target: 85, unit: '%' },
    { metric: 'Voltage Stability', value: 98.2, target: 98, unit: '%' },
    { metric: 'Frequency Deviation', value: 0.02, target: 0.05, unit: 'Hz' },
    { metric: 'Power Factor', value: 0.95, target: 0.93, unit: '' }
  ];

  const outageAnalysis = [
    { type: 'Weather-Related', count: 12, avgDuration: 2.5, customers: 15420, prevented: 8 },
    { type: 'Equipment Failure', count: 8, avgDuration: 1.8, customers: 8930, prevented: 15 },
    { type: 'Vegetation', count: 5, avgDuration: 1.2, customers: 3250, prevented: 12 },
    { type: 'Animal Contact', count: 3, avgDuration: 0.8, customers: 1820, prevented: 7 },
    { type: 'Human Error', count: 2, avgDuration: 3.1, customers: 5640, prevented: 4 }
  ];

  const realTimeGridStatus = [
    { time: '00:00', demand: 3200, supply: 3350, renewable: 820, storage: 150 },
    { time: '04:00', demand: 2800, supply: 2950, renewable: 650, storage: 200 },
    { time: '08:00', demand: 4500, supply: 4600, renewable: 1200, storage: 100 },
    { time: '12:00', demand: 5200, supply: 5300, renewable: 1800, storage: 50 },
    { time: '16:00', demand: 5800, supply: 5900, renewable: 1500, storage: 80 },
    { time: '20:00', demand: 4200, supply: 4350, renewable: 400, storage: 120 }
  ];

  const regionalResilience = [
    { region: 'North District', score: 92, outages: 3, responseTime: 18, backup: 95 },
    { region: 'South District', score: 88, outages: 5, responseTime: 22, backup: 87 },
    { region: 'East District', score: 95, outages: 2, responseTime: 15, backup: 98 },
    { region: 'West District', score: 85, outages: 7, responseTime: 25, backup: 82 },
    { region: 'Central District', score: 94, outages: 1, responseTime: 12, backup: 96 }
  ];

  const predictiveAnalytics = [
    { event: 'Heat Wave Risk', probability: 78, impact: 'High', timeframe: '48h' },
    { event: 'Equipment Stress', probability: 65, impact: 'Medium', timeframe: '72h' },
    { event: 'Storm System', probability: 45, impact: 'High', timeframe: '5d' },
    { event: 'Peak Demand Surge', probability: 82, impact: 'Medium', timeframe: '24h' },
    { event: 'Transmission Overload', probability: 38, impact: 'Low', timeframe: '7d' }
  ];

  const responseMetrics = [
    { phase: 'Detection', target: 30, actual: 25, unit: 'seconds' },
    { phase: 'Assessment', target: 300, actual: 240, unit: 'seconds' },
    { phase: 'Isolation', target: 180, actual: 150, unit: 'seconds' },
    { phase: 'Rerouting', target: 120, actual: 95, unit: 'seconds' },
    { phase: 'Restoration', target: 1800, actual: 1320, unit: 'seconds' }
  ];

  const distributedResources = [
    { type: 'Solar Farms', capacity: 850, available: 780, utilization: 91.8 },
    { type: 'Wind Turbines', capacity: 620, available: 540, utilization: 87.1 },
    { type: 'Battery Storage', capacity: 400, available: 360, utilization: 90.0 },
    { type: 'Microgrids', capacity: 280, available: 265, utilization: 94.6 },
    { type: 'Demand Response', capacity: 350, available: 310, utilization: 88.6 }
  ];

  const aiModelPerformance = [
    { model: 'Outage Prediction', accuracy: 94.7, precision: 92.3, recall: 91.8, latency: 0.8 },
    { model: 'Load Forecasting', accuracy: 96.2, precision: 95.1, recall: 94.7, latency: 0.5 },
    { model: 'Fault Detection', accuracy: 98.1, precision: 97.5, recall: 96.9, latency: 0.3 },
    { model: 'Grid Optimization', accuracy: 91.5, precision: 89.8, recall: 88.2, latency: 1.2 }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'grid-health', label: 'Grid Health', icon: Activity },
    { id: 'outage-management', label: 'Outage Management', icon: Power },
    { id: 'predictive', label: 'Predictive Analytics', icon: Eye },
    { id: 'response', label: 'Response System', icon: Shield },
    { id: 'resources', label: 'Distributed Resources', icon: Network }
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
        {renderKPICard('Grid Reliability', '99.87%', 0.12, Zap, 'green', 'SAIDI: 42 min/year')}
        {renderKPICard('Active Outages', '3', -62.5, AlertTriangle, 'red', 'Affecting 2,840 customers')}
        {renderKPICard('Response Time', '4.2 min', -28.8, Clock, 'blue', 'Avg restoration time')}
        {renderKPICard('Resilience Score', '91/100', 5.8, Shield, 'purple', 'System-wide assessment')}
      </div>

      {/* Real-time Grid Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">24-Hour Grid Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={realTimeGridStatus}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="time" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
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
            <Area yAxisId="left" type="monotone" dataKey="supply" fill="#3B82F6" stroke="#3B82F6" fillOpacity={0.3} name="Total Supply (MW)" />
            <Line yAxisId="left" type="monotone" dataKey="demand" stroke="#EF4444" strokeWidth={3} dot={false} name="Demand (MW)" />
            <Bar yAxisId="right" dataKey="renewable" fill="#10B981" name="Renewable (MW)" />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Regional Status and Predictive Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Regional Resilience Status</h3>
          <div className="space-y-3">
            {regionalResilience.map((region, index) => (
              <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className={`h-4 w-4 ${
                      region.score >= 90 ? 'text-green-500' :
                      region.score >= 80 ? 'text-yellow-500' :
                      'text-red-500'
                    }`} />
                    <span className="font-medium">{region.region}</span>
                  </div>
                  <span className={`text-lg font-bold ${
                    region.score >= 90 ? 'text-green-500' :
                    region.score >= 80 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {region.score}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Outages</span>
                    <p className="font-semibold">{region.outages}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Response</span>
                    <p className="font-semibold">{region.responseTime}m</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Backup</span>
                    <p className="font-semibold">{region.backup}%</p>
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
          <h3 className="text-lg font-semibold mb-4">Predictive Risk Alerts</h3>
          <div className="space-y-3">
            {predictiveAnalytics.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.impact === 'High' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  alert.impact === 'Medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{alert.event}</h4>
                  <span className={`text-sm font-medium ${
                    alert.impact === 'High' ? 'text-red-600' :
                    alert.impact === 'Medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {alert.probability}% probability
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Impact: {alert.impact}</span>
                  <span className="text-gray-500">In {alert.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderGridHealthTab = () => (
    <div className="space-y-6">
      {/* Grid Health Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">System Health Indicators</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {gridHealthMetrics.map((metric, index) => (
            <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{metric.metric}</h4>
                <Gauge className={`h-5 w-5 ${
                  metric.metric === 'Frequency Deviation' ? 
                    (metric.value <= metric.target ? 'text-green-500' : 'text-red-500') :
                    (metric.value >= metric.target ? 'text-green-500' : 'text-yellow-500')
                }`} />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">{metric.value}{metric.unit}</p>
                  <p className="text-sm text-gray-500">Target: {metric.target}{metric.unit}</p>
                </div>
                <div className={`text-sm font-medium ${
                  metric.metric === 'Frequency Deviation' ? 
                    (metric.value <= metric.target ? 'text-green-500' : 'text-red-500') :
                    (metric.value >= metric.target ? 'text-green-500' : 'text-yellow-500')
                }`}>
                  {metric.metric === 'Frequency Deviation' ? 
                    (metric.value <= metric.target ? '✓ Normal' : '⚠ Alert') :
                    (metric.value >= metric.target ? '✓ Normal' : '⚠ Below Target')
                  }
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.metric === 'Frequency Deviation' ? 
                        (metric.value <= metric.target ? 'bg-green-500' : 'bg-red-500') :
                        (metric.value >= metric.target ? 'bg-green-500' : 'bg-yellow-500')
                    }`}
                    style={{ 
                      width: metric.metric === 'Frequency Deviation' ? 
                        `${Math.min((metric.target / metric.value) * 100, 100)}%` :
                        `${Math.min((metric.value / metric.target) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Power Quality Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Power Quality Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { subject: 'Voltage', A: 98.2, B: 98, fullMark: 100 },
              { subject: 'Frequency', A: 99.8, B: 99.5, fullMark: 100 },
              { subject: 'Harmonics', A: 95.5, B: 95, fullMark: 100 },
              { subject: 'Flicker', A: 97.1, B: 96, fullMark: 100 },
              { subject: 'Imbalance', A: 96.8, B: 95, fullMark: 100 }
            ]}>
              <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <PolarAngleAxis dataKey="subject" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <PolarRadiusAxis angle={90} domain={[90, 100]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Radar name="Current" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Radar name="Standard" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Network Stability Index</h3>
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-40 h-40">
                  <circle
                    className="text-gray-300 dark:text-gray-700"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                  />
                  <circle
                    className="text-green-500"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                    strokeDasharray={`${2 * Math.PI * 70 * 0.91} ${2 * Math.PI * 70}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 80 80)"
                  />
                </svg>
                <span className="absolute text-3xl font-bold">91%</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Overall Network Stability</p>
            </div>
            <div className="space-y-2">
              {[
                { component: 'Transmission Lines', health: 94 },
                { component: 'Substations', health: 89 },
                { component: 'Distribution Network', health: 92 },
                { component: 'Control Systems', health: 88 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.component}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className={`h-2 rounded-full ${
                          item.health >= 90 ? 'bg-green-500' :
                          item.health >= 80 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${item.health}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{item.health}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderOutageManagementTab = () => (
    <div className="space-y-6">
      {/* Outage Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Outage Analysis by Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={outageAnalysis}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="type" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} angle={-45} textAnchor="end" height={80} />
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
            <Bar dataKey="count" fill="#EF4444" name="Occurred" />
            <Bar dataKey="prevented" fill="#10B981" name="Prevented" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Active Outages and Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Active Outage Management</h3>
          <div className="space-y-3">
            {[
              { id: 'OUT-2024-0892', location: 'Substation 14B', customers: 1250, duration: '0:45', crew: 'Team Alpha', eta: '15 min' },
              { id: 'OUT-2024-0891', location: 'Feeder Line 23', customers: 890, duration: '1:20', crew: 'Team Beta', eta: '30 min' },
              { id: 'OUT-2024-0890', location: 'Transformer T-45', customers: 700, duration: '2:15', crew: 'Team Gamma', eta: '45 min' }
            ].map((outage, index) => (
              <div key={index} className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{outage.id}</span>
                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                    Active
                  </span>
                </div>
                <p className="text-sm font-medium mb-2">{outage.location}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Affected</span>
                    <p className="font-semibold">{outage.customers.toLocaleString()} customers</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration</span>
                    <p className="font-semibold">{outage.duration}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Crew</span>
                    <p className="font-semibold">{outage.crew}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">ETA</span>
                    <p className="font-semibold text-green-600">{outage.eta}</p>
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
          <h3 className="text-lg font-semibold mb-4">Outage Impact Summary</h3>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-red-500">2,840</p>
              <p className="text-sm text-gray-500 mt-2">Customers Currently Affected</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-2xl font-semibold text-yellow-600">3</p>
                <p className="text-xs text-gray-500">Active Outages</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-2xl font-semibold text-blue-600">5</p>
                <p className="text-xs text-gray-500">Crews Deployed</p>
              </div>
            </div>
            <div className="space-y-3">
              {outageAnalysis.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <p className="text-sm font-medium">{type.type}</p>
                    <p className="text-xs text-gray-500">{type.customers.toLocaleString()} customers affected</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{type.avgDuration}h avg</p>
                    <p className="text-xs text-green-600">{type.prevented} prevented</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderPredictiveTab = () => (
    <div className="space-y-6">
      {/* AI Model Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Predictive Model Performance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {aiModelPerformance.map((model, index) => (
            <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{model.model}</h4>
                <Eye className={`h-5 w-5 ${model.accuracy >= 95 ? 'text-green-500' : 'text-blue-500'}`} />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-500">{model.accuracy}%</p>
                  <p className="text-xs text-gray-500">Accuracy</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-500">{model.precision}%</p>
                  <p className="text-xs text-gray-500">Precision</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-500">{model.recall}%</p>
                  <p className="text-xs text-gray-500">Recall</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-500">{model.latency}s</p>
                  <p className="text-xs text-gray-500">Latency</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Predictive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">7-Day Risk Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { day: 'Mon', equipment: 15, weather: 25, demand: 40 },
              { day: 'Tue', equipment: 18, weather: 30, demand: 45 },
              { day: 'Wed', equipment: 20, weather: 45, demand: 65 },
              { day: 'Thu', equipment: 22, weather: 60, demand: 78 },
              { day: 'Fri', equipment: 25, weather: 55, demand: 82 },
              { day: 'Sat', equipment: 20, weather: 40, demand: 60 },
              { day: 'Sun', equipment: 18, weather: 35, demand: 55 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="day" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
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
              <Line type="monotone" dataKey="equipment" stroke="#3B82F6" strokeWidth={2} name="Equipment Risk %" />
              <Line type="monotone" dataKey="weather" stroke="#EF4444" strokeWidth={2} name="Weather Risk %" />
              <Line type="monotone" dataKey="demand" stroke="#F59E0B" strokeWidth={2} name="Demand Risk %" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Preventive Actions Recommended</h3>
          <div className="space-y-3">
            {[
              { action: 'Schedule maintenance for Transformer Bank 7', priority: 'High', deadline: '24h', impact: 'Prevent 2,500 customer outage' },
              { action: 'Increase spinning reserve capacity', priority: 'Medium', deadline: '48h', impact: 'Handle 15% demand surge' },
              { action: 'Deploy mobile substations to Zone 4', priority: 'High', deadline: '12h', impact: 'Backup for critical infrastructure' },
              { action: 'Update vegetation management schedule', priority: 'Low', deadline: '7d', impact: 'Reduce tree-related outages by 30%' }
            ].map((action, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                action.priority === 'High' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                action.priority === 'Medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{action.action}</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    action.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    action.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {action.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Complete within: {action.deadline}</span>
                  <span>{action.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderResponseTab = () => (
    <div className="space-y-6">
      {/* Response Time Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Automated Response Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={responseMetrics} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis type="number" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis dataKey="phase" type="category" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any) => [`${value}s`, 'Time']}
            />
            <Legend />
            <Bar dataKey="target" fill="#F59E0B" name="Target Time" />
            <Bar dataKey="actual" fill="#10B981" name="Actual Time" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Response System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Self-Healing Grid Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-semibold">Auto-Recovery Active</p>
                  <p className="text-sm text-gray-500">All systems operational</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">98.5%</p>
                <p className="text-xs text-gray-500">Success Rate</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { system: 'Fault Detection', status: 'Active', latency: '0.3s' },
                { system: 'Auto-Isolation', status: 'Active', latency: '0.8s' },
                { system: 'Load Transfer', status: 'Active', latency: '1.2s' },
                { system: 'Service Restoration', status: 'Active', latency: '2.1s' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">{item.system}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{item.latency}</span>
                    <span className="text-xs text-gray-500 ml-2">latency</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Response Metrics</h3>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500">4.2 min</p>
              <p className="text-sm text-gray-500 mt-2">Average Restoration Time</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p className="text-xl font-semibold">87%</p>
                <p className="text-xs text-gray-500">Auto-Resolved</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p className="text-xl font-semibold">13%</p>
                <p className="text-xs text-gray-500">Manual Intervention</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Outages Prevented</span>
                <span className="font-semibold text-green-600">46 this month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customers Saved</span>
                <span className="font-semibold">125,840</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cost Avoidance</span>
                <span className="font-semibold text-green-600">$3.2M</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderResourcesTab = () => (
    <div className="space-y-6">
      {/* Distributed Resources Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Distributed Energy Resources</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distributedResources}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="type" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} angle={-45} textAnchor="end" height={80} />
            <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any) => [`${value} MW`, 'Capacity']}
            />
            <Legend />
            <Bar dataKey="capacity" fill="#3B82F6" name="Total Capacity" />
            <Bar dataKey="available" fill="#10B981" name="Available Now" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Resource Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Resource Utilization</h3>
          <div className="space-y-4">
            {distributedResources.map((resource, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {resource.type === 'Solar Farms' && <Zap className="h-4 w-4 text-yellow-500" />}
                    {resource.type === 'Wind Turbines' && <Wind className="h-4 w-4 text-blue-500" />}
                    {resource.type === 'Battery Storage' && <Battery className="h-4 w-4 text-green-500" />}
                    {resource.type === 'Microgrids' && <Network className="h-4 w-4 text-purple-500" />}
                    {resource.type === 'Demand Response' && <Activity className="h-4 w-4 text-orange-500" />}
                    <span className="text-sm font-medium">{resource.type}</span>
                  </div>
                  <span className="text-sm font-semibold">{resource.utilization}%</span>
                </div>
                <div className="relative">
                  <div className={`h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-3 rounded-full ${
                        resource.utilization >= 90 ? 'bg-green-500' :
                        resource.utilization >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${resource.utilization}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{resource.available} MW available</span>
                  <span>{resource.capacity} MW total</span>
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
          <h3 className="text-lg font-semibold mb-4">Virtual Power Plant Status</h3>
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
                    strokeDasharray={`${2 * Math.PI * 56 * 0.89} ${2 * Math.PI * 56}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                <span className="absolute text-2xl font-bold">2,410 MW</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Total VPP Capacity</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-lg font-semibold text-green-600">2,145 MW</p>
                <p className="text-xs text-gray-500">Currently Available</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-lg font-semibold text-blue-600">89%</p>
                <p className="text-xs text-gray-500">Availability Rate</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Connected Assets</span>
                <span className="font-semibold">1,247</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Response Time</span>
                <span className="font-semibold">&lt; 5 seconds</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Revenue Generated</span>
                <span className="font-semibold text-green-600">$4.8M MTD</span>
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
            <h1 className="text-3xl font-bold mb-2">Grid Resilience & Outage Response</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              AI-powered grid management and automated outage response system
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
          {activeTab === 'grid-health' && renderGridHealthTab()}
          {activeTab === 'outage-management' && renderOutageManagementTab()}
          {activeTab === 'predictive' && renderPredictiveTab()}
          {activeTab === 'response' && renderResponseTab()}
          {activeTab === 'resources' && renderResourcesTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GridResilienceDashboard;