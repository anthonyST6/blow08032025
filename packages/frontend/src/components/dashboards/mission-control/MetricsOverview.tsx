import React, { useState, useEffect } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';
import { api } from '../../../services/api';

interface Metric {
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

const MetricsOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await api.get('/v2/metrics/overview');
      setMetrics(response.data.data || []);
    } catch (error) {
      // Use mock data for now
      setMetrics([
        {
          label: 'Active Leases',
          value: 1234,
          unit: 'leases',
          change: 5.2,
          trend: 'up'
        },
        {
          label: 'Total Value',
          value: 45.6,
          unit: 'M USD',
          change: -2.1,
          trend: 'down'
        },
        {
          label: 'Compliance Rate',
          value: 98.5,
          unit: '%',
          change: 0.8,
          trend: 'up'
        },
        {
          label: 'Auto-fixes Applied',
          value: 89,
          unit: 'today',
          change: 0,
          trend: 'neutral'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'neutral') return 'text-gray-500';
    if (trend === 'up') return change > 0 ? 'text-green-600' : 'text-red-600';
    if (trend === 'down') return change < 0 ? 'text-green-600' : 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </span>
                <span className="text-sm text-gray-500">{metric.unit}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm font-medium ${getTrendColor(metric.trend, metric.change)}`}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Last updated</span>
          <span className="text-gray-900 font-medium">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;