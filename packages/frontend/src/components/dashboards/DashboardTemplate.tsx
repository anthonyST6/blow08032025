import React, { useState } from 'react';
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
  Treemap,
  ComposedChart
} from 'recharts';
import { LucideIcon } from 'lucide-react';
import { SIAMetrics } from '../ui/SIAMetric';
import { UseCase } from '../../config/verticals';

// Types for dashboard configuration
export interface KPICard {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'radar' | 'area' | 'scatter' | 'treemap' | 'composed';
  title: string;
  data: any[];
  dataKeys?: string[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  customRenderer?: (data: any) => React.ReactNode;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  content: () => React.ReactNode;
}

export interface DashboardConfig {
  title: string;
  description: string;
  kpis: KPICard[];
  tabs: TabConfig[];
  defaultTab?: string;
  refreshInterval?: number;
}

interface DashboardTemplateProps {
  useCase: UseCase;
  config: DashboardConfig;
  isDarkMode?: boolean;
}

// Seraphim Vanguards brand colors
export const CHART_COLORS = [
  '#FFD700', // Gold
  '#00D4FF', // Vanguard Blue
  '#00FF88', // Vanguard Green
  '#FF4444', // Vanguard Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

// Reusable KPI Card Component with Seraphim styling
export const KPICardComponent: React.FC<{
  kpi: KPICard;
  isDarkMode: boolean;
}> = ({ kpi, isDarkMode }) => {
  const Icon = kpi.icon;
  const isPositive = kpi.change >= 0;
  const TrendIcon = kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/20 to-transparent rounded-2xl blur-xl" />
      <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6 hover:border-seraphim-gold/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-black/60 border border-seraphim-gold/20`}>
            <Icon className={`h-6 w-6 ${
              kpi.color === 'blue' ? 'text-vanguard-blue' :
              kpi.color === 'green' ? 'text-vanguard-green' :
              kpi.color === 'purple' ? 'text-purple-500' :
              kpi.color === 'yellow' ? 'text-seraphim-gold' :
              kpi.color === 'red' ? 'text-vanguard-red' :
              'text-gray-400'
            }`} />
          </div>
          <div className={`flex items-center text-sm ${
            kpi.trend === 'up' ? 'text-vanguard-green' :
            kpi.trend === 'down' ? 'text-vanguard-red' :
            'text-seraphim-gold'
          }`}>
            <span className="mr-1">{TrendIcon}</span>
            {Math.abs(kpi.change)}%
          </div>
        </div>
        <div className="text-2xl font-bold mb-1 text-white">{kpi.value}</div>
        <div className="text-sm text-gray-400">
          {kpi.title}
        </div>
      </div>
    </motion.div>
  );
};

// Chart rendering function with Seraphim styling
export const renderChart = (config: ChartConfig, isDarkMode: boolean) => {
  const tooltipStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  };

  const axisStyle = {
    stroke: '#9CA3AF'
  };

  const gridStyle = {
    stroke: 'rgba(255, 215, 0, 0.1)'
  };

  // Wrapper for charts with Seraphim styling
  const ChartWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
      <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{config.title}</h3>
        {children}
      </div>
    </div>
  );

  switch (config.type) {
    case 'bar':
      return (
        <ChartWrapper>
          <ResponsiveContainer width="100%" height={config.height || 300}>
            <BarChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
              <XAxis dataKey={config.dataKeys?.[0] || 'name'} {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              {config.showLegend && <Legend />}
              {config.dataKeys?.slice(1).map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={config.colors?.[index] || CHART_COLORS[index]}
                  radius={[8, 8, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      );

    case 'line':
      return (
        <ChartWrapper>
          <ResponsiveContainer width="100%" height={config.height || 300}>
            <LineChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
              <XAxis dataKey={config.dataKeys?.[0] || 'name'} {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              {config.showLegend && <Legend />}
              {config.dataKeys?.slice(1).map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config.colors?.[index] || CHART_COLORS[index]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      );

    case 'pie':
      return (
        <ChartWrapper>
          <ResponsiveContainer width="100%" height={config.height || 300}>
            <PieChart>
              <Pie
                data={config.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey={config.dataKeys?.[0] || 'value'}
              >
                {config.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              {config.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      );

    case 'radar':
      return (
        <ChartWrapper>
          <ResponsiveContainer width="100%" height={config.height || 300}>
            <RadarChart data={config.data}>
              <PolarGrid {...gridStyle} />
              <PolarAngleAxis dataKey={config.dataKeys?.[0] || 'name'} {...axisStyle} />
              <PolarRadiusAxis {...axisStyle} />
              {config.dataKeys?.slice(1).map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={config.colors?.[index] || CHART_COLORS[index]}
                  fill={config.colors?.[index] || CHART_COLORS[index]}
                  fillOpacity={0.6}
                />
              ))}
              <Tooltip contentStyle={tooltipStyle} />
              {config.showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      );

    case 'area':
      return (
        <ChartWrapper>
          <ResponsiveContainer width="100%" height={config.height || 300}>
            <AreaChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
              <XAxis dataKey={config.dataKeys?.[0] || 'name'} {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              {config.showLegend && <Legend />}
              {config.dataKeys?.slice(1).map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config.colors?.[index] || CHART_COLORS[index]}
                  fill={config.colors?.[index] || CHART_COLORS[index]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      );

    default:
      return config.customRenderer ? (
        <ChartWrapper>
          {config.customRenderer(config.data)}
        </ChartWrapper>
      ) : null;
  }
};

// Main Dashboard Template Component with Seraphim styling
const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  useCase,
  config,
  isDarkMode = true
}) => {
  const [activeTab, setActiveTab] = useState(config.defaultTab || config.tabs[0]?.id);

  const activeTabConfig = config.tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E0E0E] to-[#1A1A1A] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{config.title}</h1>
            <p className="text-gray-400">
              {config.description}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {config.kpis.map((kpi, index) => (
          <KPICardComponent key={index} kpi={kpi} isDarkMode={isDarkMode} />
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {config.tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all duration-300 font-medium ${
                activeTab === tab.id
                  ? 'bg-seraphim-gold text-black'
                  : 'bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 text-gray-300 hover:border-seraphim-gold/50 hover:text-white'
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
          {activeTabConfig?.content()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DashboardTemplate;