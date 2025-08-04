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
  Server,
  Activity,
  TrendingUp,
  Shield,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart2,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Zap,
  GitBranch,
  Settings,
  Gauge,
  Cpu,
  HardDrive,
  Network,
  Cloud,
  Link,
  Layers,
  Terminal,
  Code,
  FileText,
  TrendingDown,
  Search,
  Wifi,
  WifiOff
} from 'lucide-react';
import { SIAMetrics } from '../../components/ui/SIAMetric';
import { UseCase } from '../../config/verticals';

interface SCADAIntegrationDashboardProps {
  useCase: UseCase;
}

const SCADAIntegrationDashboard: React.FC<SCADAIntegrationDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedSystem, setSelectedSystem] = useState('all');
  const [selectedProtocol, setSelectedProtocol] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for SCADA integration metrics
  const systemConnectivity = [
    { system: 'Primary SCADA', status: 'online', latency: 12, dataPoints: 45000, protocol: 'OPC UA' },
    { system: 'Backup SCADA', status: 'online', latency: 15, dataPoints: 42000, protocol: 'OPC UA' },
    { system: 'Legacy RTU Network', status: 'online', latency: 45, dataPoints: 8500, protocol: 'Modbus' },
    { system: 'Field Controllers', status: 'partial', latency: 28, dataPoints: 12000, protocol: 'DNP3' },
    { system: 'HMI Systems', status: 'online', latency: 8, dataPoints: 25000, protocol: 'OPC Classic' },
    { system: 'Historian Database', status: 'online', latency: 5, dataPoints: 98000, protocol: 'SQL' }
  ];

  const dataFlowMetrics = [
    { hour: '00:00', inbound: 1250, outbound: 980, processed: 1180, errors: 12 },
    { hour: '04:00', inbound: 1100, outbound: 890, processed: 1050, errors: 8 },
    { hour: '08:00', inbound: 2450, outbound: 2100, processed: 2380, errors: 25 },
    { hour: '12:00', inbound: 3200, outbound: 2900, processed: 3150, errors: 18 },
    { hour: '16:00', inbound: 2800, outbound: 2500, processed: 2750, errors: 15 },
    { hour: '20:00', inbound: 1800, outbound: 1600, processed: 1750, errors: 10 }
  ];

  const protocolDistribution = [
    { name: 'OPC UA', value: 35, color: '#3B82F6' },
    { name: 'Modbus TCP', value: 25, color: '#10B981' },
    { name: 'DNP3', value: 20, color: '#F59E0B' },
    { name: 'IEC 61850', value: 12, color: '#8B5CF6' },
    { name: 'OPC Classic', value: 8, color: '#EC4899' }
  ];

  const integrationHealth = [
    { component: 'Data Collection', health: 95, availability: 99.5, performance: 92 },
    { component: 'Protocol Translation', health: 88, availability: 98.2, performance: 85 },
    { component: 'Data Validation', health: 92, availability: 99.8, performance: 90 },
    { component: 'Event Processing', health: 90, availability: 99.1, performance: 88 },
    { component: 'API Gateway', health: 94, availability: 99.9, performance: 91 }
  ];

  const modernizationProgress = [
    { phase: 'Legacy Assessment', planned: 100, completed: 100, status: 'completed' },
    { phase: 'Architecture Design', planned: 100, completed: 100, status: 'completed' },
    { phase: 'Protocol Mapping', planned: 100, completed: 85, status: 'in-progress' },
    { phase: 'Data Migration', planned: 100, completed: 60, status: 'in-progress' },
    { phase: 'System Integration', planned: 100, completed: 40, status: 'in-progress' },
    { phase: 'Testing & Validation', planned: 100, completed: 25, status: 'pending' }
  ];

  const recentAlerts = [
    { id: 1, type: 'connection', message: 'RTU-045 connection timeout', severity: 'warning', time: '5 min ago' },
    { id: 2, type: 'data', message: 'Data validation failed for Station-12', severity: 'error', time: '12 min ago' },
    { id: 3, type: 'performance', message: 'High latency detected on Modbus network', severity: 'warning', time: '25 min ago' },
    { id: 4, type: 'security', message: 'Unauthorized access attempt blocked', severity: 'critical', time: '1 hour ago' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'connectivity', label: 'System Connectivity', icon: Network },
    { id: 'dataflow', label: 'Data Flow', icon: Activity },
    { id: 'protocols', label: 'Protocol Analysis', icon: GitBranch },
    { id: 'modernization', label: 'Modernization', icon: Layers },
    { id: 'performance', label: 'Performance', icon: Gauge }
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
        {renderKPICard('System Uptime', '99.8%', 0.5, Server, 'green', 'Last 30 days')}
        {renderKPICard('Data Points/Hour', '225K', 12.3, Database, 'blue', 'Average throughput')}
        {renderKPICard('Active Connections', '156', -2.1, Link, 'purple', '6 systems integrated')}
        {renderKPICard('Integration Health', '92%', 3.8, Activity, 'yellow', 'Overall score')}
      </div>

      {/* System Status and Data Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">System Connectivity Status</h3>
          <div className="space-y-3">
            {systemConnectivity.map((system, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    system.status === 'online' ? 'bg-green-500' :
                    system.status === 'partial' ? 'bg-yellow-500' :
                    'bg-red-500'
                  } animate-pulse`} />
                  <div>
                    <p className="font-medium">{system.system}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {system.protocol} • {system.latency}ms
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{(system.dataPoints / 1000).toFixed(1)}K</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>points/hr</p>
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
          <h3 className="text-lg font-semibold mb-4">Real-time Data Flow</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dataFlowMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="hour" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area type="monotone" dataKey="inbound" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="processed" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="errors" stroke="#EF4444" fill="#EF4444" fillOpacity={0.8} />
            </AreaChart>
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
          <h3 className="text-lg font-semibold">Integration Alerts</h3>
          <button className="text-blue-500 hover:text-blue-600 flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              } border ${
                alert.severity === 'critical' ? 'border-red-500' :
                alert.severity === 'error' ? 'border-orange-500' :
                'border-yellow-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                {alert.type === 'connection' ? <WifiOff className="h-5 w-5 text-yellow-500" /> :
                 alert.type === 'data' ? <Database className="h-5 w-5 text-orange-500" /> :
                 alert.type === 'performance' ? <Gauge className="h-5 w-5 text-yellow-500" /> :
                 <Shield className="h-5 w-5 text-red-500" />}
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{alert.time}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderConnectivityTab = () => (
    <div className="space-y-6">
      {/* Network Topology Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">SCADA Network Topology</h3>
        <div className="relative h-96 flex items-center justify-center">
          {/* Central Hub */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Server className="h-12 w-12 text-white" />
            </div>
            <p className="text-center mt-2 font-semibold">Integration Hub</p>
          </div>
          
          {/* Connected Systems */}
          {[
            { name: 'Primary SCADA', angle: 0, status: 'online', icon: Cpu },
            { name: 'Backup SCADA', angle: 60, status: 'online', icon: Cpu },
            { name: 'RTU Network', angle: 120, status: 'online', icon: Network },
            { name: 'Field Controllers', angle: 180, status: 'partial', icon: Terminal },
            { name: 'HMI Systems', angle: 240, status: 'online', icon: Layers },
            { name: 'Historian DB', angle: 300, status: 'online', icon: Database }
          ].map((system, index) => {
            const Icon = system.icon;
            const radius = 150;
            const x = Math.cos((system.angle * Math.PI) / 180) * radius;
            const y = Math.sin((system.angle * Math.PI) / 180) * radius;
            
            return (
              <div
                key={index}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(${x - 32}px, ${y - 32}px)`
                }}
              >
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center shadow-md ${
                  system.status === 'online' ? 'bg-green-500' :
                  system.status === 'partial' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-xs text-center mt-1 w-20 -ml-2">{system.name}</p>
                {/* Connection Line */}
                <svg
                  className="absolute top-8 left-8"
                  style={{
                    width: Math.abs(x),
                    height: Math.abs(y),
                    transform: `translate(${x < 0 ? x : 0}px, ${y < 0 ? y : 0}px)`
                  }}
                >
                  <line
                    x1={x < 0 ? Math.abs(x) : 0}
                    y1={y < 0 ? Math.abs(y) : 0}
                    x2={x < 0 ? 0 : Math.abs(x)}
                    y2={y < 0 ? 0 : Math.abs(y)}
                    stroke={system.status === 'online' ? '#10B981' : system.status === 'partial' ? '#F59E0B' : '#EF4444'}
                    strokeWidth="2"
                    strokeDasharray={system.status === 'partial' ? '5,5' : '0'}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Connection Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Connection Health Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={integrationHealth}>
              <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <PolarAngleAxis dataKey="component" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Radar name="Health Score" dataKey="health" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Radar name="Availability" dataKey="availability" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Radar name="Performance" dataKey="performance" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
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
          <h3 className="text-lg font-semibold mb-4">Protocol Performance</h3>
          <div className="space-y-4">
            {['OPC UA', 'Modbus TCP', 'DNP3', 'IEC 61850'].map((protocol, index) => {
              const performance = 85 + Math.random() * 15;
              const latency = 5 + Math.random() * 40;
              
              return (
                <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{protocol}</span>
                    <span className={`text-sm ${performance > 90 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {performance.toFixed(1)}% efficiency
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{latency.toFixed(0)}ms</span>
                    </div>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{(Math.random() * 1000).toFixed(0)} msg/s</span>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${performance > 90 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${performance}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderDataFlowTab = () => (
    <div className="space-y-6">
      {/* Data Flow Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">24-Hour Data Flow Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={dataFlowMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="hour" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
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
            <Bar yAxisId="left" dataKey="inbound" fill="#3B82F6" name="Inbound Data" />
            <Bar yAxisId="left" dataKey="outbound" fill="#10B981" name="Outbound Data" />
            <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={3} name="Errors" />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Data Processing Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
        >
          <Database className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold mb-2">5.4M</h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Records Today</p>
          <div className="mt-4 flex items-center justify-center text-green-500">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm">+12.3% from yesterday</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
        >
          <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold mb-2">225K/hr</h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Processing Rate</p>
          <div className="mt-4 flex items-center justify-center text-green-500">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm">+8.5% efficiency gain</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
        >
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold mb-2">0.08%</h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Error Rate</p>
          <div className="mt-4 flex items-center justify-center text-green-500">
            <TrendingDown className="h-4 w-4 mr-1" />
            <span className="text-sm">-15.2% from last week</span>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderProtocolsTab = () => (
    <div className="space-y-6">
      {/* Protocol Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Protocol Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={protocolDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {protocolDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
          <h3 className="text-lg font-semibold mb-4">Protocol Compatibility Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="text-left py-2 px-4">Protocol</th>
                  <th className="text-center py-2 px-4">Legacy Support</th>
                  <th className="text-center py-2 px-4">Modern Support</th>
                  <th className="text-center py-2 px-4">Translation</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { protocol: 'OPC UA', legacy: true, modern: true, translation: 'Native' },
                  { protocol: 'Modbus TCP', legacy: true, modern: true, translation: 'Direct' },
                  { protocol: 'DNP3', legacy: true, modern: false, translation: 'Gateway' },
                  { protocol: 'IEC 61850', legacy: false, modern: true, translation: 'Native' },
                  { protocol: 'OPC Classic', legacy: true, modern: false, translation: 'Bridge' }
                ].map((item, index) => (
                  <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-2 px-4 font-medium">{item.protocol}</td>
                    <td className="text-center py-2 px-4">
                      {item.legacy ? (
                        <CheckCircle className="h-5 w-5 text-green-500 inline" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 inline" />
                      )}
                    </td>
                    <td className="text-center py-2 px-4">
                      {item.modern ? (
                        <CheckCircle className="h-5 w-5 text-green-500 inline" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 inline" />
                      )}
                    </td>
                    <td className="text-center py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.translation === 'Native' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        item.translation === 'Direct' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {item.translation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderModernizationTab = () => (
    <div className="space-y-6">
      {/* Modernization Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">SCADA Modernization Roadmap</h3>
        <div className="space-y-4">
          {modernizationProgress.map((phase, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    phase.status === 'completed' ? 'bg-green-500' :
                    phase.status === 'in-progress' ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}>
                    {phase.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : phase.status === 'in-progress' ? (
                      <Clock className="h-5 w-5 text-white" />
                    ) : (
                      <span className="text-white text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span className="font-medium">{phase.phase}</span>
                </div>
                <span className={`text-sm ${
                  phase.status === 'completed' ? 'text-green-500' :
                  phase.status === 'in-progress' ? 'text-blue-500' :
                  'text-gray-500'
                }`}>
                  {phase.completed}%
                </span>
              </div>
              <div className="ml-11">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      phase.status === 'completed' ? 'bg-green-500' :
                      phase.status === 'in-progress' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${phase.completed}%` }}
                  />
                </div>
              </div>
              {index < modernizationProgress.length - 1 && (
                <div className="absolute left-4 top-10 w-0.5 h-8 bg-gray-300 dark:bg-gray-600" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Migration Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Legacy System Migration Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { system: 'RTUs', migrated: 75, remaining: 25 },
              { system: 'PLCs', migrated: 60, remaining: 40 },
              { system: 'HMIs', migrated: 85, remaining: 15 },
              { system: 'Historians', migrated: 50, remaining: 50 },
              { system: 'Protocols', migrated: 70, remaining: 30 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="system" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
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
              <Bar dataKey="migrated" stackId="a" fill="#10B981" name="Migrated" />
              <Bar dataKey="remaining" stackId="a" fill="#F59E0B" name="Remaining" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Modernization Benefits</h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Response Time</span>
                <span className="text-green-500 font-semibold">-65%</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                From 45ms to 15ms average latency
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Data Throughput</span>
                <span className="text-green-500 font-semibold">+280%</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Increased from 60K to 225K points/hour
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Maintenance Cost</span>
                <span className="text-green-500 font-semibold">-40%</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Annual savings of $1.2M
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">System Reliability</span>
                <span className="text-green-500 font-semibold">99.8%</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Up from 97.2% with legacy systems
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">CPU Usage</h4>
            <Cpu className="h-5 w-5 text-blue-500" />
          </div>
          <div className="relative h-32 flex items-center justify-center">
            <div className="text-3xl font-bold">42%</div>
            <div className="absolute inset-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#3B82F6"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56 * 0.42} ${2 * Math.PI * 56}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <p className={`text-center text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Integration Server Load
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">Memory Usage</h4>
            <HardDrive className="h-5 w-5 text-green-500" />
          </div>
          <div className="relative h-32 flex items-center justify-center">
            <div className="text-3xl font-bold">8.2GB</div>
            <div className="absolute inset-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#10B981"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56 * 0.68} ${2 * Math.PI * 56}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <p className={`text-center text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            68% of 12GB allocated
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">Network I/O</h4>
            <Network className="h-5 w-5 text-purple-500" />
          </div>
          <div className="relative h-32 flex items-center justify-center">
            <div className="text-3xl font-bold">156Mbps</div>
            <div className="absolute inset-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#8B5CF6"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56 * 0.78} ${2 * Math.PI * 56}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <p className={`text-center text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            78% of bandwidth utilized
          </p>
        </motion.div>
      </div>

      {/* Performance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">System Performance Trends (24 Hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[
            { time: '00:00', cpu: 35, memory: 62, network: 45, latency: 12 },
            { time: '04:00', cpu: 30, memory: 60, network: 40, latency: 10 },
            { time: '08:00', cpu: 55, memory: 75, network: 85, latency: 18 },
            { time: '12:00', cpu: 65, memory: 80, network: 92, latency: 22 },
            { time: '16:00', cpu: 58, memory: 78, network: 88, latency: 20 },
            { time: '20:00', cpu: 42, memory: 68, network: 78, latency: 15 },
            { time: '24:00', cpu: 38, memory: 65, network: 50, latency: 12 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="time" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
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
            <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} name="CPU %" />
            <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} name="Memory %" />
            <Line type="monotone" dataKey="network" stroke="#8B5CF6" strokeWidth={2} name="Network %" />
            <Line type="monotone" dataKey="latency" stroke="#F59E0B" strokeWidth={2} name="Latency ms" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">SCADA-Legacy Integration Dashboard</h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Monitor and manage SCADA system integration and modernization
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
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Systems</option>
            <option value="primary">Primary SCADA</option>
            <option value="backup">Backup SCADA</option>
            <option value="rtu">RTU Network</option>
            <option value="plc">Field Controllers</option>
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
          {activeTab === 'connectivity' && renderConnectivityTab()}
          {activeTab === 'dataflow' && renderDataFlowTab()}
          {activeTab === 'protocols' && renderProtocolsTab()}
          {activeTab === 'modernization' && renderModernizationTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SCADAIntegrationDashboard;
