import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface UseCaseMetricsProps {
  useCaseId?: string;
  verticalId?: string;
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

interface MetricData {
  executions: {
    total: number;
    successful: number;
    failed: number;
    avgDuration: number;
  };
  siaScores: {
    security: number;
    integrity: number;
    accuracy: number;
    trend: 'up' | 'down' | 'stable';
  };
  performance: Array<{
    date: string;
    executions: number;
    successRate: number;
    avgDuration: number;
  }>;
  byVertical: Array<{
    vertical: string;
    count: number;
    avgScore: number;
  }>;
}

export const UseCaseMetrics: React.FC<UseCaseMetricsProps> = ({
  useCaseId,
  verticalId,
  timeRange = 'week'
}) => {
  const [metrics, setMetrics] = useState<MetricData>({
    executions: {
      total: 156,
      successful: 142,
      failed: 14,
      avgDuration: 4523
    },
    siaScores: {
      security: 89,
      integrity: 92,
      accuracy: 87,
      trend: 'up'
    },
    performance: [
      { date: 'Mon', executions: 23, successRate: 91, avgDuration: 4200 },
      { date: 'Tue', executions: 28, successRate: 93, avgDuration: 4100 },
      { date: 'Wed', executions: 19, successRate: 89, avgDuration: 4500 },
      { date: 'Thu', executions: 31, successRate: 94, avgDuration: 4300 },
      { date: 'Fri', executions: 25, successRate: 92, avgDuration: 4600 },
      { date: 'Sat', executions: 15, successRate: 87, avgDuration: 4800 },
      { date: 'Sun', executions: 15, successRate: 90, avgDuration: 4700 }
    ],
    byVertical: [
      { vertical: 'Energy', count: 45, avgScore: 91 },
      { vertical: 'Healthcare', count: 38, avgScore: 88 },
      { vertical: 'Finance', count: 32, avgScore: 93 },
      { vertical: 'Manufacturing', count: 28, avgScore: 86 },
      { vertical: 'Other', count: 13, avgScore: 85 }
    ]
  });

  const successRate = (metrics.executions.successful / metrics.executions.total) * 100;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold">{metrics.executions.total}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last {timeRange}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.3% improvement
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold">{formatDuration(metrics.executions.avgDuration)}</p>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                -8% faster
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg SIA Score</p>
              <p className="text-2xl font-bold">
                {((metrics.siaScores.security + metrics.siaScores.integrity + metrics.siaScores.accuracy) / 3).toFixed(0)}%
              </p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending {metrics.siaScores.trend}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="executions" 
                stroke="#3B82F6" 
                name="Executions"
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="successRate" 
                stroke="#10B981" 
                name="Success Rate %"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SIA Scores */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">SIA Score Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm font-medium">Security</span>
                  </div>
                  <span className="text-sm font-bold">{metrics.siaScores.security}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${metrics.siaScores.security}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm font-medium">Integrity</span>
                  </div>
                  <span className="text-sm font-bold">{metrics.siaScores.integrity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${metrics.siaScores.integrity}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                    <span className="text-sm font-medium">Accuracy</span>
                  </div>
                  <span className="text-sm font-bold">{metrics.siaScores.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${metrics.siaScores.accuracy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Executions by Vertical */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Executions by Vertical</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={metrics.byVertical}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ vertical, count }) => `${vertical}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.byVertical.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Duration Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Execution Duration Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics.performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatDuration(value)} />
              <Bar dataKey="avgDuration" fill="#8B5CF6" name="Avg Duration (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};