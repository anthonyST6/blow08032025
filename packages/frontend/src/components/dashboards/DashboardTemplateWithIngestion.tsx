import React, { ReactNode } from 'react';
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
import { KPICardComponent, CHART_COLORS } from './DashboardTemplate';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

// Re-export types from DashboardTemplate
export type { KPICard, ChartConfig, TabConfig, DashboardConfig } from './DashboardTemplate';
export { renderChart } from './DashboardTemplate';

interface DashboardTemplateWithIngestionProps {
  useCase: UseCase;
  config: any; // Using any to match DashboardConfig
  isDarkMode?: boolean;
  onDataIngestionClick?: () => void;
}

const DashboardTemplateWithIngestion: React.FC<DashboardTemplateWithIngestionProps> = ({
  useCase,
  config,
  isDarkMode = true,
  onDataIngestionClick
}) => {
  const [activeTab, setActiveTab] = React.useState(config.defaultTab || config.tabs[0]?.id);

  const activeTabConfig = config.tabs.find((tab: any) => tab.id === activeTab);

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
          <div className="flex items-center space-x-4">
            <SIAMetrics
              security={useCase.siaScores.security}
              integrity={useCase.siaScores.integrity}
              accuracy={useCase.siaScores.accuracy}
              size="sm"
              animate={true}
            />
            {onDataIngestionClick && (
              <button
                onClick={onDataIngestionClick}
                className="flex items-center space-x-2 px-6 py-2.5 bg-black border border-seraphim-gold text-seraphim-gold rounded-full hover:bg-seraphim-gold hover:text-black transition-all duration-300 font-medium"
              >
                <CloudArrowUpIcon className="h-4 w-4" />
                <span>Data Ingestion</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {config.kpis.map((kpi: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/20 to-transparent rounded-2xl blur-xl" />
            <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6 hover:border-seraphim-gold/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <kpi.icon className={`h-8 w-8 ${
                  kpi.color === 'blue' ? 'text-vanguard-blue' :
                  kpi.color === 'green' ? 'text-vanguard-green' :
                  kpi.color === 'purple' ? 'text-purple-500' :
                  kpi.color === 'yellow' ? 'text-seraphim-gold' :
                  'text-gray-400'
                }`} />
                <div className={`flex items-center text-sm ${
                  kpi.trend === 'up' ? 'text-vanguard-green' :
                  kpi.trend === 'down' ? 'text-vanguard-red' :
                  'text-seraphim-gold'
                }`}>
                  {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}
                  <span className="ml-1">{Math.abs(kpi.change)}%</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{kpi.title}</p>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {config.tabs.map((tab: any) => {
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

export default DashboardTemplateWithIngestion;