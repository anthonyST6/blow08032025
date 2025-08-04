import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  FunnelIcon,
  CalendarIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  UserIcon,
  ServerIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { SIAMetrics } from '../components/ui/SIAMetric';

interface AnalyticsData {
  overview: {
    totalPrompts: number;
    totalAnalyses: number;
    averageResponseTime: number;
    successRate: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
  trends: {
    daily: Array<{
      date: string;
      prompts: number;
      analyses: number;
      avgScore: number;
    }>;
  };
  agentPerformance: Array<{
    agentType: string;
    totalAnalyses: number;
    avgScore: number;
    avgExecutionTime: number;
    errorRate: number;
  }>;
  providerStats: Array<{
    provider: string;
    count: number;
    avgResponseTime: number;
    avgTokensUsed: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}

// Mock data
const mockAnalytics: AnalyticsData = {
  overview: {
    totalPrompts: 12543,
    totalAnalyses: 8921,
    averageResponseTime: 342,
    successRate: 94.7,
    riskDistribution: {
      low: 6234,
      medium: 2145,
      high: 432,
      critical: 110,
    },
  },
  trends: {
    daily: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      prompts: Math.floor(Math.random() * 500) + 300,
      analyses: Math.floor(Math.random() * 400) + 200,
      avgScore: Math.random() * 20 + 80,
    })),
  },
  agentPerformance: [
    { agentType: 'Security Agent', totalAnalyses: 3421, avgScore: 92.3, avgExecutionTime: 234, errorRate: 2.1 },
    { agentType: 'Integrity Agent', totalAnalyses: 2987, avgScore: 88.7, avgExecutionTime: 312, errorRate: 3.4 },
    { agentType: 'Accuracy Agent', totalAnalyses: 2513, avgScore: 94.1, avgExecutionTime: 198, errorRate: 1.8 },
  ],
  providerStats: [
    { provider: 'GPT-4', count: 5432, avgResponseTime: 342, avgTokensUsed: 1234 },
    { provider: 'Claude 2', count: 3211, avgResponseTime: 298, avgTokensUsed: 987 },
    { provider: 'GPT-3.5 Turbo', count: 4278, avgResponseTime: 187, avgTokensUsed: 654 },
  ],
  topTags: [
    { tag: 'financial-analysis', count: 1234 },
    { tag: 'risk-assessment', count: 987 },
    { tag: 'compliance-check', count: 876 },
    { tag: 'data-validation', count: 765 },
    { tag: 'security-audit', count: 654 },
  ],
};

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'prompts' | 'analyses' | 'score'>('prompts');
  const [isLoading, setIsLoading] = useState(false);

  const analytics = mockAnalytics;

  // Calculate SIA scores from analytics
  const siaScores = {
    security: 92.3,
    integrity: 88.7,
    accuracy: 94.1,
  };

  // Simple bar chart component
  const SimpleBarChart: React.FC<{ data: number[]; labels: string[]; maxValue?: number }> = ({ data, labels, maxValue = Math.max(...data) }) => {
    return (
      <div className="space-y-3">
        {data.map((value, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">{labels[index]}</span>
              <span className="text-white font-medium">{value.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(value / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-r from-vanguard-blue via-seraphim-gold to-vanguard-green h-2 rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Simple line chart component
  const SimpleTrendChart: React.FC<{ data: number[]; height?: number }> = ({ data, height = 200 }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <div className="relative" style={{ height }}>
        <svg className="w-full h-full">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="5,5"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            points={data.map((value, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = ((max - value) / range) * 100;
              return `${x}%,${y}%`;
            }).join(' ')}
          />
          
          {/* Area fill */}
          <polygon
            fill="url(#gradient)"
            points={`0,100% ${data.map((value, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = ((max - value) / range) * 100;
              return `${x}%,${y}%`;
            }).join(' ')} 100%,100%`}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <ChartBarIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Analytics Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          System performance metrics and insights
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-400">Time Range:</span>
        </div>
        <div className="flex space-x-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-seraphim-gold/20 text-seraphim-gold border border-seraphim-gold/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* SIA Metrics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <ShieldCheckIcon className="w-5 h-5 text-seraphim-gold mr-2" />
          SIA Performance Metrics
        </h2>
        <SIAMetrics
          security={siaScores.security}
          integrity={siaScores.integrity}
          accuracy={siaScores.accuracy}
          size="lg"
          variant="card"
          layout="grid"
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Prompts</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {analytics.overview.totalPrompts.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-vanguard-green mr-1" />
                <span className="text-sm text-vanguard-green">+12.3%</span>
              </div>
            </div>
            <div className="p-3 bg-vanguard-blue/20 rounded-full">
              <DocumentTextIcon className="w-6 h-6 text-vanguard-blue" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Analyses</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {analytics.overview.totalAnalyses.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-vanguard-green mr-1" />
                <span className="text-sm text-vanguard-green">+8.7%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-full">
              <ChartBarIcon className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Avg Response Time</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {analytics.overview.averageResponseTime}ms
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingDownIcon className="w-4 h-4 text-vanguard-green mr-1" />
                <span className="text-sm text-vanguard-green">-5.2%</span>
              </div>
            </div>
            <div className="p-3 bg-vanguard-green/20 rounded-full">
              <BoltIcon className="w-6 h-6 text-vanguard-green" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Success Rate</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {analytics.overview.successRate.toFixed(1)}%
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-vanguard-green mr-1" />
                <span className="text-sm text-vanguard-green">+2.1%</span>
              </div>
            </div>
            <div className="p-3 bg-seraphim-gold/20 rounded-full">
              <CheckCircleIcon className="w-6 h-6 text-seraphim-gold" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trend Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">
              Activity Trends
            </h2>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="text-sm px-3 py-1 bg-black/50 border border-gray-700 rounded-md text-white focus:border-seraphim-gold focus:outline-none"
            >
              <option value="prompts">Prompts</option>
              <option value="analyses">Analyses</option>
              <option value="score">Average Score</option>
            </select>
          </div>
          <SimpleTrendChart 
            data={analytics.trends.daily.map(d => 
              selectedMetric === 'prompts' ? d.prompts : 
              selectedMetric === 'analyses' ? d.analyses : 
              d.avgScore
            )}
          />
        </Card>

        {/* Risk Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-white mb-4">
            Risk Distribution
          </h2>
          <div className="space-y-4">
            {Object.entries(analytics.overview.riskDistribution).map(([level, count]) => {
              const total = Object.values(analytics.overview.riskDistribution).reduce((a, b) => a + b, 0);
              const percentage = (count / total) * 100;
              const colors = {
                low: 'bg-vanguard-green',
                medium: 'bg-yellow-500',
                high: 'bg-orange-500',
                critical: 'bg-vanguard-red',
              };
              
              return (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400 capitalize">{level} Risk</span>
                    <span className="text-white">{count.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className={`${colors[level as keyof typeof colors]} h-2 rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-medium text-white mb-4">
          Agent Performance
        </h2>
        <SimpleBarChart
          data={analytics.agentPerformance.map(a => a.avgScore)}
          labels={analytics.agentPerformance.map(a => a.agentType)}
          maxValue={100}
        />
      </Card>

      {/* Provider Stats and Top Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Stats */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-white mb-4">
            Provider Statistics
          </h2>
          <div className="space-y-4">
            {analytics.providerStats.map((provider) => (
              <div key={provider.provider} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {provider.provider}
                    </span>
                    <span className="text-sm text-gray-400">
                      {provider.count} requests
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(provider.count / analytics.overview.totalPrompts) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-vanguard-blue to-seraphim-gold h-2 rounded-full"
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>Avg: {provider.avgResponseTime.toFixed(0)}ms</span>
                    <span>{provider.avgTokensUsed.toFixed(0)} tokens</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Tags */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-white mb-4">
            Popular Tags
          </h2>
          <div className="space-y-3">
            {analytics.topTags.slice(0, 10).map((tag, index) => (
              <div key={tag.tag} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-6">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {tag.tag}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {tag.count} uses
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Export Button */}
      <div className="mt-8 flex justify-end">
        <Button variant="primary">
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Export Analytics Report
        </Button>
      </div>
    </div>
  );
};

export default Analytics;