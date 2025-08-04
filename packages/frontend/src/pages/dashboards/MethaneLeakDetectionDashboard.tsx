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
  Wind,
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
  Zap,
  Gauge,
  Thermometer,
  Cloud,
  Navigation,
  Radio,
  Satellite,
  Target,
  Eye
} from 'lucide-react';
import { SIAMetrics } from '../../components/ui/SIAMetric';
import { UseCase } from '../../config/verticals';

interface MethaneLeakDetectionDashboardProps {
  useCase: UseCase;
}

const MethaneLeakDetectionDashboard: React.FC<MethaneLeakDetectionDashboardProps> = ({ useCase }) => {
  const isDarkMode = true; // You can get this from a theme context if needed
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedSensorType, setSelectedSensorType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for methane detection metrics
  const leakDetectionSummary = [
    { severity: 'Critical', count: 2, avgPPM: 15000, responseTime: 8 },
    { severity: 'High', count: 5, avgPPM: 8500, responseTime: 15 },
    { severity: 'Medium', count: 12, avgPPM: 3200, responseTime: 45 },
    { severity: 'Low', count: 28, avgPPM: 850, responseTime: 120 },
    { severity: 'Trace', count: 67, avgPPM: 125, responseTime: 480 }
  ];

  const sensorNetworkStatus = [
    { type: 'Fixed Sensors', total: 450, active: 442, alerts: 8, accuracy: 98.2 },
    { type: 'Mobile Units', total: 24, active: 23, alerts: 3, accuracy: 96.8 },
    { type: 'Satellite', total: 3, active: 3, alerts: 2, accuracy: 94.5 },
    { type: 'Drone Fleet', total: 12, active: 11, alerts: 1, accuracy: 97.1 },
    { type: 'LIDAR Systems', total: 8, active: 8, alerts: 0, accuracy: 99.1 }
  ];

  const leakTrendData = [
    { time: '00:00', detected: 3, confirmed: 2, falsePositive: 1, avgPPM: 2100 },
    { time: '04:00', detected: 2, confirmed: 2, falsePositive: 0, avgPPM: 1850 },
    { time: '08:00', detected: 5, confirmed: 4, falsePositive: 1, avgPPM: 3200 },
    { time: '12:00', detected: 7, confirmed: 6, falsePositive: 1, avgPPM: 4100 },
    { time: '16:00', detected: 4, confirmed: 3, falsePositive: 1, avgPPM: 2800 },
    { time: '20:00', detected: 3, confirmed: 3, falsePositive: 0, avgPPM: 2300 }
  ];

  const geographicDistribution = [
    { region: 'North Field', leaks: 8, sensors: 125, riskScore: 72, area: 450 },
    { region: 'South Field', leaks: 5, sensors: 98, riskScore: 45, area: 380 },
    { region: 'East Pipeline', leaks: 12, sensors: 156, riskScore: 85, area: 620 },
    { region: 'West Pipeline', leaks: 3, sensors: 87, riskScore: 32, area: 290 },
    { region: 'Central Hub', leaks: 2, sensors: 76, riskScore: 28, area: 180 }
  ];

  const emissionReduction = [
    { month: 'Jan', baseline: 4500, actual: 3200, reduction: 28.9 },
    { month: 'Feb', baseline: 4300, actual: 2900, reduction: 32.6 },
    { month: 'Mar', baseline: 4600, actual: 2700, reduction: 41.3 },
    { month: 'Apr', baseline: 4400, actual: 2400, reduction: 45.5 },
    { month: 'May', baseline: 4700, actual: 2200, reduction: 53.2 },
    { month: 'Jun', baseline: 4500, actual: 1900, reduction: 57.8 }
  ];

  const repairMetrics = [
    { priority: 'Emergency', avgTime: 2.5, completed: 45, pending: 2, success: 98 },
    { priority: 'Urgent', avgTime: 8.2, completed: 89, pending: 5, success: 96 },
    { priority: 'Scheduled', avgTime: 24.5, completed: 156, pending: 12, success: 94 },
    { priority: 'Preventive', avgTime: 72.0, completed: 234, pending: 28, success: 99 }
  ];

  const weatherImpact = [
    { condition: 'Clear', detectionRate: 98, falsePositives: 2 },
    { condition: 'Windy', detectionRate: 92, falsePositives: 5 },
    { condition: 'Rainy', detectionRate: 85, falsePositives: 8 },
    { condition: 'Foggy', detectionRate: 78, falsePositives: 12 },
    { condition: 'Stormy', detectionRate: 65, falsePositives: 18 }
  ];

  const aiModelMetrics = [
    { model: 'Leak Detection CNN', accuracy: 97.8, latency: 0.3, dataPoints: '2.4M/day' },
    { model: 'Plume Dispersion', accuracy: 94.2, latency: 1.2, dataPoints: '850K/day' },
    { model: 'Source Attribution', accuracy: 91.5, latency: 2.1, dataPoints: '450K/day' },
    { model: 'Risk Prediction', accuracy: 89.3, latency: 0.8, dataPoints: '1.2M/day' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'detection', label: 'Detection Status', icon: Radio },
    { id: 'geographic', label: 'Geographic View', icon: MapPin },
    { id: 'emissions', label: 'Emissions Tracking', icon: Wind },
    { id: 'repairs', label: 'Repair Management', icon: Shield },
    { id: 'analytics', label: 'AI Analytics', icon: Zap }
  ];

  const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

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
        {renderKPICard('Active Leaks', '7', -45.2, AlertTriangle, 'red', '2 critical, 5 high priority')}
        {renderKPICard('Methane Reduced', '2.6K tons', 57.8, Wind, 'green', 'YTD emissions reduction')}
        {renderKPICard('Detection Rate', '97.8%', 3.2, Target, 'blue', 'AI model accuracy')}
        {renderKPICard('Avg Response', '12 min', -28.5, Clock, 'purple', 'Critical leak response')}
      </div>

      {/* Leak Detection Summary and Sensor Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Leak Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leakDetectionSummary}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ severity, count }) => `${severity}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {leakDetectionSummary.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.severity === 'Critical' ? '#EF4444' :
                    entry.severity === 'High' ? '#F59E0B' :
                    entry.severity === 'Medium' ? '#3B82F6' :
                    entry.severity === 'Low' ? '#10B981' :
                    '#8B5CF6'
                  } />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string, props: any) => [
                  `${value} leaks`,
                  `Avg: ${props.payload.avgPPM} PPM`
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Sensor Network Health</h3>
          <div className="space-y-3">
            {sensorNetworkStatus.map((sensor, index) => (
              <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{sensor.type}</span>
                  <span className={`text-sm ${sensor.alerts > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {sensor.alerts > 0 ? `${sensor.alerts} alerts` : 'All operational'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Active</span>
                    <p className="font-semibold">{sensor.active}/{sensor.total}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Uptime</span>
                    <p className="font-semibold">{((sensor.active / sensor.total) * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Accuracy</span>
                    <p className="font-semibold">{sensor.accuracy}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Real-time Detection Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">24-Hour Detection Trend</h3>
          <div className="flex items-center space-x-2">
            <button className="text-blue-500 hover:text-blue-600 flex items-center text-sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Auto-refresh
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={leakTrendData}>
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
            <Bar yAxisId="left" dataKey="detected" fill="#3B82F6" name="Detected" />
            <Bar yAxisId="left" dataKey="confirmed" fill="#10B981" name="Confirmed" />
            <Line yAxisId="right" type="monotone" dataKey="avgPPM" stroke="#F59E0B" strokeWidth={3} name="Avg PPM" />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );

  const renderDetectionTab = () => (
    <div className="space-y-6">
      {/* Active Leak Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Active Leak Monitoring</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { id: 'L-2024-0145', location: 'Pipeline Segment 23A', severity: 'Critical', ppm: 18500, duration: '2h 15m', status: 'Crew Dispatched' },
            { id: 'L-2024-0144', location: 'Compressor Station 7', severity: 'Critical', ppm: 15200, duration: '45m', status: 'Under Repair' },
            { id: 'L-2024-0143', location: 'Valve Assembly NE-12', severity: 'High', ppm: 8900, duration: '3h 30m', status: 'Monitoring' },
            { id: 'L-2024-0142', location: 'Distribution Hub 4', severity: 'High', ppm: 7200, duration: '5h 10m', status: 'Scheduled' },
            { id: 'L-2024-0141', location: 'Storage Field B', severity: 'Medium', ppm: 3500, duration: '12h 45m', status: 'Assessment' }
          ].map((leak, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                leak.severity === 'Critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                leak.severity === 'High' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm">{leak.id}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  leak.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  leak.severity === 'High' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {leak.severity}
                </span>
              </div>
              <p className="text-sm font-medium mb-2">{leak.location}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Concentration</span>
                  <p className="font-semibold">{leak.ppm.toLocaleString()} PPM</p>
                </div>
                <div>
                  <span className="text-gray-500">Duration</span>
                  <p className="font-semibold">{leak.duration}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className={`text-xs font-medium ${
                  leak.status === 'Under Repair' ? 'text-green-600' :
                  leak.status === 'Crew Dispatched' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  Status: {leak.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weather Impact Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Weather Impact on Detection</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={weatherImpact}>
              <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <PolarAngleAxis dataKey="condition" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Radar name="Detection Rate %" dataKey="detectionRate" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Radar name="False Positives %" dataKey="falsePositives" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
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
          <h3 className="text-lg font-semibold mb-4">Current Conditions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center space-x-3">
                <Cloud className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-semibold">Partly Cloudy</p>
                  <p className="text-sm text-gray-500">Good detection conditions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">72°F</p>
                <p className="text-sm text-gray-500">Humidity: 45%</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center space-x-2 mb-1">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Wind Speed</span>
                </div>
                <p className="text-xl font-semibold">8.5 mph</p>
                <p className="text-xs text-gray-500">Direction: NE</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center space-x-2 mb-1">
                  <Gauge className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Pressure</span>
                </div>
                <p className="text-xl font-semibold">30.12 in</p>
                <p className="text-xs text-gray-500">Stable</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderGeographicTab = () => (
    <div className="space-y-6">
      {/* Geographic Risk Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Geographic Leak Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis 
              dataKey="area" 
              name="Area (sq km)" 
              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
              label={{ value: 'Coverage Area (sq km)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              dataKey="leaks" 
              name="Active Leaks" 
              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
              label={{ value: 'Active Leaks', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'area') return [`${value} sq km`, 'Coverage Area'];
                if (name === 'leaks') return [`${value} leaks`, 'Active Leaks'];
                return [value, name];
              }}
            />
            <Scatter 
              name="Regions" 
              data={geographicDistribution} 
              fill="#3B82F6"
            >
              {geographicDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={
                  entry.riskScore > 70 ? '#EF4444' :
                  entry.riskScore > 50 ? '#F59E0B' :
                  '#10B981'
                } />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Regional Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Regional Risk Assessment</h3>
          <div className="space-y-3">
            {geographicDistribution.map((region, index) => (
              <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className={`h-5 w-5 ${
                      region.riskScore > 70 ? 'text-red-500' :
                      region.riskScore > 50 ? 'text-yellow-500' :
                      'text-green-500'
                    }`} />
                    <span className="font-medium">{region.region}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    region.riskScore > 70 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    region.riskScore > 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    Risk: {region.riskScore}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Active Leaks</span>
                    <p className="font-semibold">{region.leaks}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Sensors</span>
                    <p className="font-semibold">{region.sensors}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Coverage</span>
                    <p className="font-semibold">{region.area} km²</p>
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
          <h3 className="text-lg font-semibold mb-4">Sensor Coverage Map</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Network Statistics</h4>
                <Satellite className="h-5 w-5 text-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Coverage</p>
                  <p className="text-xl font-bold">1,920 km²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sensor Density</p>
                  <p className="text-xl font-bold">0.26/km²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blind Spots</p>
                  <p className="text-xl font-bold text-yellow-600">3</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Redundancy</p>
                  <p className="text-xl font-bold text-green-600">87%</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Coverage by Type</h4>
              {[
                { type: 'Pipeline Corridors', coverage: 98, color: 'green' },
                { type: 'Storage Facilities', coverage: 100, color: 'green' },
                { type: 'Compressor Stations', coverage: 95, color: 'blue' },
                { type: 'Distribution Hubs', coverage: 92, color: 'yellow' }
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.type}</span>
                    <span className="font-medium">{item.coverage}%</span>
                  </div>
                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-2 rounded-full bg-${item.color}-500`}
                      style={{ width: `${item.coverage}%` }}
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

  const renderEmissionsTab = () => (
    <div className="space-y-6">
      {/* Emission Reduction Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Methane Emission Reduction Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={emissionReduction}>
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
              formatter={(value: any, name: string) => [`${value} tons`, name]}
            />
            <Legend />
            <Area type="monotone" dataKey="baseline" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Baseline Emissions" />
            <Area type="monotone" dataKey="actual" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Actual Emissions" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Emission Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">YTD Performance</h4>
            <Wind className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-green-500">57.8%</p>
            <p className="text-sm text-gray-500 mt-2">Reduction vs Baseline</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Prevented</span>
              <span className="font-semibold">2,600 tons</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">CO₂ Equivalent</span>
              <span className="font-semibold">65,000 tons</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cost Savings</span>
              <span className="font-semibold text-green-600">$3.9M</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Leak Sources</h4>
            <Target className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {[
              { source: 'Fugitive Emissions', percentage: 35, reduction: 62 },
              { source: 'Venting', percentage: 28, reduction: 71 },
              { source: 'Flaring', percentage: 22, reduction: 45 },
              { source: 'Equipment Leaks', percentage: 15, reduction: 58 }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.source}</span>
                  <span className="text-xs text-gray-500">{item.percentage}% of total</span>
                </div>
                <div className="relative">
                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Reduction achieved</span>
                  <span className="font-medium text-green-600">{item.reduction}%</span>
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
            <h4 className="font-semibold">Environmental Impact</h4>
            <Activity className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-4">
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <p className="text-sm text-gray-500 mb-1">Equivalent to removing</p>
              <p className="text-2xl font-bold text-purple-600">14,130</p>
              <p className="text-sm text-gray-500">cars from the road</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p className="text-lg font-semibold">520K</p>
                <p className="text-xs text-gray-500">Trees planted</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p className="text-lg font-semibold">8.2M</p>
                <p className="text-xs text-gray-500">kWh saved</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderRepairsTab = () => (
    <div className="space-y-6">
      {/* Repair Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Repair Response Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={repairMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="priority" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
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
            <Bar dataKey="completed" fill="#10B981" name="Completed" />
            <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Repair Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Response Time Analysis</h3>
          <div className="space-y-4">
            {repairMetrics.map((metric, index) => (
              <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{metric.priority} Priority</h4>
                    <p className="text-sm text-gray-500">Avg response: {metric.avgTime} hours</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    metric.priority === 'Emergency' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    metric.priority === 'Urgent' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {metric.success}% Success
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Completed</span>
                    <p className="font-semibold text-green-600">{metric.completed}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">In Progress</span>
                    <p className="font-semibold text-yellow-600">{metric.pending}</p>
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
          <h3 className="text-lg font-semibold mb-4">Repair Cost Analysis</h3>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500">$1.8M</p>
              <p className="text-sm text-gray-500 mt-2">Total Repair Costs YTD</p>
            </div>
            <div className="space-y-3">
              {[
                { category: 'Labor', amount: 720000, percentage: 40 },
                { category: 'Equipment', amount: 540000, percentage: 30 },
                { category: 'Materials', amount: 360000, percentage: 20 },
                { category: 'Contractors', amount: 180000, percentage: 10 }
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.category}</span>
                    <span className="font-medium">${(item.amount / 1000).toFixed(0)}K</span>
                  </div>
                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm">Cost per Repair</span>
                <span className="font-semibold">$3,421 avg</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm">vs Last Year</span>
                <span className="font-semibold text-green-600">-18.5%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* AI Model Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">AI Model Performance Metrics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {aiModelMetrics.map((model, index) => (
            <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{model.model}</h4>
                <Zap className={`h-5 w-5 ${model.accuracy >= 95 ? 'text-green-500' : 'text-blue-500'}`} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded bg-white dark:bg-gray-800">
                  <p className="text-2xl font-bold text-blue-500">{model.accuracy}%</p>
                  <p className="text-xs text-gray-500">Accuracy</p>
                </div>
                <div className="text-center p-3 rounded bg-white dark:bg-gray-800">
                  <p className="text-2xl font-bold text-green-500">{model.latency}s</p>
                  <p className="text-xs text-gray-500">Latency</p>
                </div>
                <div className="text-center p-3 rounded bg-white dark:bg-gray-800">
                  <p className="text-lg font-bold text-purple-500">{model.dataPoints}</p>
                  <p className="text-xs text-gray-500">Data Points</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last Updated</span>
                  <span>15 min ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Detection Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Detection Patterns</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-medium mb-2">Peak Detection Times</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Morning</span>
                  <p className="font-semibold">6:00 - 9:00 AM</p>
                </div>
                <div>
                  <span className="text-gray-500">Evening</span>
                  <p className="font-semibold">4:00 - 7:00 PM</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Common Leak Indicators</h4>
              {[
                { indicator: 'Pressure Drop', frequency: 78 },
                { indicator: 'Temperature Anomaly', frequency: 65 },
                { indicator: 'Acoustic Signature', frequency: 82 },
                { indicator: 'Visual Detection', frequency: 91 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.indicator}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-600"
                        style={{ width: `${item.frequency}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{item.frequency}%</span>
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
          <h3 className="text-lg font-semibold mb-4">System ROI</h3>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">$8.7M</p>
              <p className="text-sm text-gray-500 mt-2">Annual Savings</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <span className="text-sm">Prevented Emissions Value</span>
                <span className="font-semibold">$3.9M</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <span className="text-sm">Regulatory Compliance</span>
                <span className="font-semibold">$2.1M</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <span className="text-sm">Operational Efficiency</span>
                <span className="font-semibold">$1.8M</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <span className="text-sm">Safety Improvements</span>
                <span className="font-semibold">$0.9M</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ROI Period</span>
                <span className="font-bold text-green-600">14 months</span>
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
            <h1 className="text-3xl font-bold mb-2">Methane Leak Detection Dashboard</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              AI-powered methane detection and emission reduction monitoring system
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
          {activeTab === 'detection' && renderDetectionTab()}
          {activeTab === 'geographic' && renderGeographicTab()}
          {activeTab === 'emissions' && renderEmissionsTab()}
          {activeTab === 'repairs' && renderRepairsTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MethaneLeakDetectionDashboard;