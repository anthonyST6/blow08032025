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
  Flame,
  AlertTriangle,
  TrendingUp,
  Shield,
  Trees,
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
  Cloud,
  Settings,
  Gauge,
  Wind,
  Droplets,
  Sun,
  Map,
  Navigation,
  Thermometer,
  Eye,
  Camera,
  Satellite,
  Radio,
  TrendingDown,
  Search,
  MapPin,
  CloudRain
} from 'lucide-react';
import { SIAMetrics } from '../../components/ui/SIAMetric';
import { UseCase } from '../../config/verticals';

interface WildfirePreventionDashboardProps {
  useCase: UseCase;
}

const WildfirePreventionDashboard: React.FC<WildfirePreventionDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for wildfire prevention metrics
  const riskZones = [
    { zone: 'North Valley', riskLevel: 'extreme', fireIndex: 92, vegetation: 'dry', lastInspection: '2 days ago' },
    { zone: 'East Hills', riskLevel: 'high', fireIndex: 78, vegetation: 'moderate', lastInspection: '5 days ago' },
    { zone: 'South Ridge', riskLevel: 'extreme', fireIndex: 88, vegetation: 'very dry', lastInspection: '1 day ago' },
    { zone: 'West Canyon', riskLevel: 'moderate', fireIndex: 45, vegetation: 'normal', lastInspection: '1 week ago' },
    { zone: 'Central Plains', riskLevel: 'low', fireIndex: 25, vegetation: 'healthy', lastInspection: '3 days ago' },
    { zone: 'Coastal Area', riskLevel: 'moderate', fireIndex: 52, vegetation: 'normal', lastInspection: '4 days ago' }
  ];

  const weatherConditions = [
    { hour: '00:00', temp: 68, humidity: 45, windSpeed: 8, fireRisk: 35 },
    { hour: '04:00', temp: 65, humidity: 52, windSpeed: 6, fireRisk: 28 },
    { hour: '08:00', temp: 72, humidity: 38, windSpeed: 12, fireRisk: 48 },
    { hour: '12:00', temp: 85, humidity: 22, windSpeed: 18, fireRisk: 78 },
    { hour: '16:00', temp: 88, humidity: 18, windSpeed: 22, fireRisk: 85 },
    { hour: '20:00', temp: 78, humidity: 28, windSpeed: 15, fireRisk: 62 }
  ];

  const vegetationManagement = [
    { area: 'Power Line Corridors', cleared: 85, target: 100, priority: 'critical' },
    { area: 'Substation Perimeters', cleared: 92, target: 100, priority: 'high' },
    { area: 'Distribution Lines', cleared: 78, target: 100, priority: 'high' },
    { area: 'Access Roads', cleared: 88, target: 100, priority: 'medium' },
    { area: 'Equipment Sites', cleared: 95, target: 100, priority: 'medium' }
  ];

  const infrastructureVulnerability = [
    { asset: 'Transmission Lines', vulnerability: 82, age: 35, lastMaintenance: '2 months' },
    { asset: 'Distribution Poles', vulnerability: 68, age: 28, lastMaintenance: '3 months' },
    { asset: 'Transformers', vulnerability: 45, age: 15, lastMaintenance: '1 month' },
    { asset: 'Substations', vulnerability: 38, age: 20, lastMaintenance: '2 weeks' },
    { asset: 'Circuit Breakers', vulnerability: 52, age: 18, lastMaintenance: '1 month' }
  ];

  const preventionMeasures = [
    { measure: 'PSPS Events', implemented: 12, prevented: 8, effectiveness: 67 },
    { measure: 'Line Inspections', implemented: 450, prevented: 15, effectiveness: 89 },
    { measure: 'Equipment Upgrades', implemented: 85, prevented: 6, effectiveness: 78 },
    { measure: 'Vegetation Clearing', implemented: 320, prevented: 22, effectiveness: 92 },
    { measure: 'Weather Monitoring', implemented: 48, prevented: 10, effectiveness: 85 }
  ];

  const recentIncidents = [
    { id: 1, type: 'vegetation', location: 'North Valley Sector 3', severity: 'high', time: '2 hours ago' },
    { id: 2, type: 'equipment', location: 'East Hills Substation', severity: 'medium', time: '5 hours ago' },
    { id: 3, type: 'weather', location: 'South Ridge Line 42', severity: 'critical', time: '8 hours ago' },
    { id: 4, type: 'inspection', location: 'West Canyon Grid', severity: 'low', time: '1 day ago' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'risk-assessment', label: 'Risk Assessment', icon: Flame },
    { id: 'weather', label: 'Weather Monitoring', icon: Cloud },
    { id: 'vegetation', label: 'Vegetation Management', icon: Trees },
    { id: 'infrastructure', label: 'Infrastructure', icon: Zap },
    { id: 'prevention', label: 'Prevention Measures', icon: Shield }
  ];

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

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
        {renderKPICard('Fire Risk Index', '72', 15.3, Flame, 'red', 'High risk conditions')}
        {renderKPICard('Areas Monitored', '1,245', 8.2, Map, 'blue', 'Square miles covered')}
        {renderKPICard('Vegetation Cleared', '85%', -2.5, Trees, 'green', 'Of target areas')}
        {renderKPICard('PSPS Readiness', '94%', 5.1, Shield, 'purple', 'System prepared')}
      </div>

      {/* Risk Zones and Weather Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">High-Risk Zones</h3>
          <div className="space-y-3">
            {riskZones.filter(zone => zone.riskLevel === 'extreme' || zone.riskLevel === 'high').map((zone, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                zone.riskLevel === 'extreme' ? 'bg-red-50 dark:bg-red-900/20 border border-red-500' :
                'bg-orange-50 dark:bg-orange-900/20 border border-orange-500'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    zone.riskLevel === 'extreme' ? 'bg-red-500' : 'bg-orange-500'
                  } animate-pulse`} />
                  <div>
                    <p className="font-medium">{zone.zone}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Fire Index: {zone.fireIndex} • {zone.vegetation}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    zone.riskLevel === 'extreme' ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {zone.riskLevel.toUpperCase()}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {zone.lastInspection}
                  </p>
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
          <h3 className="text-lg font-semibold mb-4">24-Hour Fire Risk Forecast</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weatherConditions}>
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
              <Area 
                type="monotone" 
                dataKey="fireRisk" 
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.6}
                name="Fire Risk Index"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Incidents Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Fire Risk Incidents</h3>
          <button className="text-blue-500 hover:text-blue-600 flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentIncidents.map((incident) => (
            <div
              key={incident.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              } border ${
                incident.severity === 'critical' ? 'border-red-500' :
                incident.severity === 'high' ? 'border-orange-500' :
                incident.severity === 'medium' ? 'border-yellow-500' :
                'border-blue-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                {incident.type === 'vegetation' ? <Trees className="h-5 w-5 text-green-500" /> :
                 incident.type === 'equipment' ? <Zap className="h-5 w-5 text-yellow-500" /> :
                 incident.type === 'weather' ? <Cloud className="h-5 w-5 text-blue-500" /> :
                 <Eye className="h-5 w-5 text-purple-500" />}
                <div>
                  <p className="font-medium">{incident.location}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} alert • {incident.time}
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

  const renderRiskAssessmentTab = () => (
    <div className="space-y-6">
      {/* Risk Zone Map Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Fire Risk Assessment by Zone</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {riskZones.map((zone, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                zone.riskLevel === 'extreme' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                zone.riskLevel === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                zone.riskLevel === 'moderate' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-green-500 bg-green-50 dark:bg-green-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{zone.zone}</h4>
                <MapPin className={`h-5 w-5 ${
                  zone.riskLevel === 'extreme' ? 'text-red-500' :
                  zone.riskLevel === 'high' ? 'text-orange-500' :
                  zone.riskLevel === 'moderate' ? 'text-yellow-500' :
                  'text-green-500'
                }`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fire Index:</span>
                  <span className="font-semibold">{zone.fireIndex}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Vegetation:</span>
                  <span className={`font-semibold ${
                    zone.vegetation === 'very dry' || zone.vegetation === 'dry' ? 'text-red-600' :
                    zone.vegetation === 'moderate' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>{zone.vegetation}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      zone.riskLevel === 'extreme' ? 'bg-red-500' :
                      zone.riskLevel === 'high' ? 'bg-orange-500' :
                      zone.riskLevel === 'moderate' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${zone.fireIndex}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk Factors Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Risk Factor Contribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { factor: 'Temperature', value: 85 },
              { factor: 'Humidity', value: 22 },
              { factor: 'Wind Speed', value: 78 },
              { factor: 'Vegetation Dryness', value: 88 },
              { factor: 'Infrastructure Age', value: 65 },
              { factor: 'Human Activity', value: 45 }
            ]}>
              <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <PolarAngleAxis dataKey="factor" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Radar name="Risk Level" dataKey="value" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
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
          <h3 className="text-lg font-semibold mb-4">Historical Fire Incidents</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { month: 'Jan', incidents: 2, prevented: 8 },
              { month: 'Feb', incidents: 1, prevented: 12 },
              { month: 'Mar', incidents: 0, prevented: 15 },
              { month: 'Apr', incidents: 3, prevented: 10 },
              { month: 'May', incidents: 5, prevented: 18 },
              { month: 'Jun', incidents: 8, prevented: 22 }
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
              <Line type="monotone" dataKey="incidents" stroke="#EF4444" strokeWidth={3} name="Fire Incidents" />
              <Line type="monotone" dataKey="prevented" stroke="#10B981" strokeWidth={3} name="Prevented Incidents" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );

  const renderWeatherTab = () => (
    <div className="space-y-6">
      {/* Current Weather Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
        >
          <Thermometer className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold mb-2">88°F</h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Temperature</p>
          <div className="mt-2 text-xs text-red-500">+5°F above average</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
        >
          <Droplets className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold mb-2">18%</h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Humidity</p>
          <div className="mt-2 text-xs text-red-500">Critical low</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
        >
          <Wind className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold mb-2">22 mph</h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Wind Speed</p>
          <div className="mt-2 text-xs text-yellow-500">Gusts to 35 mph</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
        >
          <CloudRain className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold mb-2">0%</h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rain Chance</p>
          <div className="mt-2 text-xs text-gray-500">No rain in 14 days</div>
        </motion.div>
      </div>

      {/* Weather Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Weather Conditions & Fire Risk Correlation</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={weatherConditions}>
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
            <Bar yAxisId="left" dataKey="temp" fill="#EF4444" name="Temperature (°F)" />
            <Bar yAxisId="left" dataKey="humidity" fill="#3B82F6" name="Humidity (%)" />
            <Line yAxisId="right" type="monotone" dataKey="windSpeed" stroke="#F59E0B" strokeWidth={3} name="Wind Speed (mph)" />
            <Line yAxisId="right" type="monotone" dataKey="fireRisk" stroke="#DC2626" strokeWidth={3} name="Fire Risk Index" />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );

  const renderVegetationTab = () => (
    <div className="space-y-6">
      {/* Vegetation Management Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Vegetation Clearance Progress</h3>
        <div className="space-y-4">
          {vegetationManagement.map((area, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Trees className={`h-5 w-5 ${
                    area.priority === 'critical' ? 'text-red-500' :
                    area.priority === 'high' ? 'text-orange-500' :
                    'text-yellow-500'
                  }`} />
                  <span className="font-medium">{area.area}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    area.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    area.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {area.priority} priority
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  area.cleared >= area.target ? 'text-green-600' :
                  area.cleared >= 80 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {area.cleared}% / {area.target}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    area.cleared >= area.target ? 'bg-green-500' :
                    area.cleared >= 80 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${area.cleared}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Vegetation Risk Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Vegetation Density by Zone</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { zone: 'North Valley', density: 85, risk: 'high' },
              { zone: 'East Hills', density: 72, risk: 'medium' },
              { zone: 'South Ridge', density: 90, risk: 'extreme' },
              { zone: 'West Canyon', density: 45, risk: 'low' },
              { zone: 'Central Plains', density: 30, risk: 'low' },
              { zone: 'Coastal Area', density: 55, risk: 'medium' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="zone" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} angle={-45} textAnchor="end" />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="density" name="Vegetation Density %">
                {[
                  { zone: 'North Valley', density: 85, risk: 'high' },
                  { zone: 'East Hills', density: 72, risk: 'medium' },
                  { zone: 'South Ridge', density: 90, risk: 'extreme' },
                  { zone: 'West Canyon', density: 45, risk: 'low' },
                  { zone: 'Central Plains', density: 30, risk: 'low' },
                  { zone: 'Coastal Area', density: 55, risk: 'medium' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.risk === 'extreme' ? '#DC2626' :
                    entry.risk === 'high' ? '#F59E0B' :
                    entry.risk === 'medium' ? '#FCD34D' :
                    '#10B981'
                  } />
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
          <h3 className="text-lg font-semibold mb-4">Clearance Schedule</h3>
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} border border-red-500`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overdue</span>
                <span className="text-red-600 font-semibold">3 areas</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                North Valley Sector 2, East Hills Grid 5, South Ridge Line 8
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border border-yellow-500`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">This Week</span>
                <span className="text-yellow-600 font-semibold">8 areas</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Multiple zones scheduled for vegetation management
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-500`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Next Month</span>
                <span className="text-blue-600 font-semibold">15 areas</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Routine maintenance scheduled
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderInfrastructureTab = () => (
    <div className="space-y-6">
      {/* Infrastructure Vulnerability Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Infrastructure Vulnerability Assessment</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="text-left py-3 px-4">Asset Type</th>
                <th className="text-center py-3 px-4">Vulnerability Score</th>
                <th className="text-center py-3 px-4">Age (Years)</th>
                <th className="text-center py-3 px-4">Last Maintenance</th>
                <th className="text-center py-3 px-4">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {infrastructureVulnerability.map((asset, index) => (
                <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="py-3 px-4 font-medium">{asset.asset}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            asset.vulnerability >= 70 ? 'bg-red-500' :
                            asset.vulnerability >= 50 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${asset.vulnerability}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm">{asset.vulnerability}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">{asset.age}</td>
                  <td className="py-3 px-4 text-center">{asset.lastMaintenance}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      asset.vulnerability >= 70 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      asset.vulnerability >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {asset.vulnerability >= 70 ? 'HIGH' :
                       asset.vulnerability >= 50 ? 'MEDIUM' :
                       'LOW'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Equipment Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Equipment Fire Safety Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Fire-Hardened', value: 45, color: '#10B981' },
                  { name: 'Partially Upgraded', value: 30, color: '#F59E0B' },
                  { name: 'Standard Equipment', value: 25, color: '#EF4444' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Fire-Hardened', value: 45, color: '#10B981' },
                  { name: 'Partially Upgraded', value: 30, color: '#F59E0B' },
                  { name: 'Standard Equipment', value: 25, color: '#EF4444' }
                ].map((entry, index) => (
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
          <h3 className="text-lg font-semibold mb-4">Critical Infrastructure Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-500">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Transmission Line 42-A</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Vegetation encroachment detected</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500">
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Substation Delta-7</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Equipment upgrade needed</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-500">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Circuit Breaker CB-15</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Maintenance overdue</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderPreventionTab = () => (
    <div className="space-y-6">
      {/* Prevention Measures Effectiveness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Prevention Measures Effectiveness</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={preventionMeasures}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="measure" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} angle={-45} textAnchor="end" />
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
            <Bar dataKey="implemented" fill="#3B82F6" name="Measures Implemented" />
            <Bar dataKey="prevented" fill="#10B981" name="Incidents Prevented" />
            <Bar dataKey="effectiveness" fill="#F59E0B" name="Effectiveness %" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* PSPS Events Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">PSPS Event Impact</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total PSPS Events (YTD)</span>
              <span className="font-semibold text-lg">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Customers Affected</span>
              <span className="font-semibold text-lg">45,230</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average Duration</span>
              <span className="font-semibold text-lg">18.5 hrs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Fires Prevented</span>
              <span className="font-semibold text-lg text-green-600">8</span>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-500">
              <p className="text-sm font-medium mb-2">Next PSPS Readiness</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="h-3 rounded-full bg-blue-500" style={{ width: '94%' }} />
              </div>
              <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">94% of systems ready</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">AI Model Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={[
              { metric: 'Fire Prediction', value: 92 },
              { metric: 'Risk Assessment', value: 88 },
              { metric: 'Weather Analysis', value: 95 },
              { metric: 'Equipment Monitoring', value: 85 },
              { metric: 'Vegetation Detection', value: 90 },
              { metric: 'Response Time', value: 87 }
            ]}>
              <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <PolarAngleAxis dataKey="metric" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Radar name="Performance" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
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
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wildfire Prevention Dashboard</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Real-time wildfire risk monitoring and prevention measures
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
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            } border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
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
          {activeTab === 'risk-assessment' && renderRiskAssessmentTab()}
          {activeTab === 'weather' && renderWeatherTab()}
          {activeTab === 'vegetation' && renderVegetationTab()}
          {activeTab === 'infrastructure' && renderInfrastructureTab()}
          {activeTab === 'prevention' && renderPreventionTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WildfirePreventionDashboard;