import React, { useState, useEffect } from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { api } from '../../../services/api';

interface TrendData {
  date: string;
  security: number;
  integrity: number;
  accuracy: number;
  overall: number;
}

const CertificationTrends: React.FC = () => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'security' | 'integrity' | 'accuracy'>('all');

  // Mock trend data
  const mockTrends: TrendData[] = [
    { date: '2024-01-03', security: 92, integrity: 88, accuracy: 90, overall: 90 },
    { date: '2024-01-10', security: 93, integrity: 89, accuracy: 91, overall: 91 },
    { date: '2024-01-17', security: 94, integrity: 91, accuracy: 92, overall: 92.3 },
    { date: '2024-01-24', security: 95, integrity: 93, accuracy: 94, overall: 94 },
    { date: '2024-01-31', security: 97, integrity: 94, accuracy: 96, overall: 95.7 },
    { date: '2024-02-01', security: 98, integrity: 95, accuracy: 97, overall: 96.7 },
  ];

  useEffect(() => {
    loadTrends();
  }, [timeRange]);

  const loadTrends = async () => {
    try {
      setLoading(true);
      // In production, this would fetch real data
      // const response = await api.get('/v2/certifications/trends', {
      //   params: { timeRange }
      // });
      // setTrends(response.data.data);
      
      // Use mock data
      setTrends(mockTrends);
    } catch (error) {
      console.error('Failed to load trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };

  const getLatestScores = () => {
    if (trends.length === 0) return { security: 0, integrity: 0, accuracy: 0, overall: 0 };
    return trends[trends.length - 1];
  };

  const getPreviousScores = () => {
    if (trends.length < 2) return { security: 0, integrity: 0, accuracy: 0, overall: 0 };
    return trends[trends.length - 2];
  };

  const latest = getLatestScores();
  const previous = getPreviousScores();

  const changes = {
    security: calculateChange(latest.security, previous.security),
    integrity: calculateChange(latest.integrity, previous.integrity),
    accuracy: calculateChange(latest.accuracy, previous.accuracy),
    overall: calculateChange(latest.overall, previous.overall),
  };

  const getMaxValue = () => {
    let max = 0;
    trends.forEach(trend => {
      if (selectedMetric === 'all') {
        max = Math.max(max, trend.security, trend.integrity, trend.accuracy);
      } else {
        max = Math.max(max, trend[selectedMetric]);
      }
    });
    return Math.max(max, 100);
  };

  const maxValue = getMaxValue();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedMetric === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setSelectedMetric('security')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedMetric === 'security'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setSelectedMetric('integrity')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedMetric === 'integrity'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Integrity
          </button>
          <button
            onClick={() => setSelectedMetric('accuracy')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedMetric === 'accuracy'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Accuracy
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={loadTrends}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Current Scores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Security Score</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">{latest.security}%</p>
            </div>
            <div className={`flex items-center ${changes.security >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {changes.security >= 0 ? (
                <ArrowTrendingUpIcon className="h-5 w-5" />
              ) : (
                <ArrowTrendingDownIcon className="h-5 w-5" />
              )}
              <span className="text-sm font-medium ml-1">
                {Math.abs(changes.security).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Integrity Score</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{latest.integrity}%</p>
            </div>
            <div className={`flex items-center ${changes.integrity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {changes.integrity >= 0 ? (
                <ArrowTrendingUpIcon className="h-5 w-5" />
              ) : (
                <ArrowTrendingDownIcon className="h-5 w-5" />
              )}
              <span className="text-sm font-medium ml-1">
                {Math.abs(changes.integrity).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Accuracy Score</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">{latest.accuracy}%</p>
            </div>
            <div className={`flex items-center ${changes.accuracy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {changes.accuracy >= 0 ? (
                <ArrowTrendingUpIcon className="h-5 w-5" />
              ) : (
                <ArrowTrendingDownIcon className="h-5 w-5" />
              )}
              <span className="text-sm font-medium ml-1">
                {Math.abs(changes.accuracy).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Score</p>
              <p className="mt-1 text-2xl font-bold text-purple-600">{latest.overall.toFixed(1)}%</p>
            </div>
            <div className={`flex items-center ${changes.overall >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {changes.overall >= 0 ? (
                <ArrowTrendingUpIcon className="h-5 w-5" />
              ) : (
                <ArrowTrendingDownIcon className="h-5 w-5" />
              )}
              <span className="text-sm font-medium ml-1">
                {Math.abs(changes.overall).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Score Trends</h3>
        
        <div className="relative h-64">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
          
          {/* Chart area */}
          <div className="ml-8 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-t border-gray-200" />
              ))}
            </div>
            
            {/* Data lines */}
            <svg className="absolute inset-0 w-full h-full">
              {(selectedMetric === 'all' || selectedMetric === 'security') && (
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  points={trends.map((trend, index) => {
                    const x = (index / (trends.length - 1)) * 100;
                    const y = 100 - (trend.security / maxValue) * 100;
                    return `${x}%,${y}%`;
                  }).join(' ')}
                />
              )}
              
              {(selectedMetric === 'all' || selectedMetric === 'integrity') && (
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  points={trends.map((trend, index) => {
                    const x = (index / (trends.length - 1)) * 100;
                    const y = 100 - (trend.integrity / maxValue) * 100;
                    return `${x}%,${y}%`;
                  }).join(' ')}
                />
              )}
              
              {(selectedMetric === 'all' || selectedMetric === 'accuracy') && (
                <polyline
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  points={trends.map((trend, index) => {
                    const x = (index / (trends.length - 1)) * 100;
                    const y = 100 - (trend.accuracy / maxValue) * 100;
                    return `${x}%,${y}%`;
                  }).join(' ')}
                />
              )}
            </svg>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between mt-2 text-xs text-gray-500">
              {trends.map((trend, index) => (
                <span key={index}>
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        {selectedMetric === 'all' && (
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-600">Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">Integrity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-sm text-gray-600">Accuracy</span>
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ChartBarIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Trend Analysis</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Overall compliance has improved by {changes.overall.toFixed(1)}% over the selected period.
                {changes.security > 0 && changes.integrity > 0 && changes.accuracy > 0 ? (
                  <span> All certification categories show positive trends.</span>
                ) : (
                  <span> Some categories may need attention to maintain compliance standards.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationTrends;