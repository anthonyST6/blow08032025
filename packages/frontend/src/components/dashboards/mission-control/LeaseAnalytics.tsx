import React, { useState, useEffect } from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface LeaseAnalyticsProps {
  leases: any[];
}

const LeaseAnalytics: React.FC<LeaseAnalyticsProps> = ({ leases }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('revenue');
  const [loading, setLoading] = useState(false);

  // Mock analytics data
  const analyticsData = {
    revenue: {
      current: 45600000,
      previous: 42300000,
      change: 7.8,
      trend: 'up',
    },
    compliance: {
      current: 98.5,
      previous: 96.2,
      change: 2.3,
      trend: 'up',
    },
    leaseUtilization: {
      current: 87.3,
      previous: 85.1,
      change: 2.2,
      trend: 'up',
    },
    expiringLeases: {
      next30Days: 12,
      next60Days: 23,
      next90Days: 34,
    },
    topPerformers: [
      { name: 'Eagle Ford Shale - Block A', value: 2500000, growth: 12.5 },
      { name: 'Permian Basin - Section 12', value: 3200000, growth: 8.3 },
      { name: 'Bakken Formation - Unit 7', value: 1800000, growth: 5.7 },
    ],
    regionBreakdown: [
      { region: 'Texas', count: 456, value: 23400000 },
      { region: 'North Dakota', count: 234, value: 12300000 },
      { region: 'New Mexico', count: 189, value: 9900000 },
    ],
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="revenue">Revenue Analysis</option>
            <option value="compliance">Compliance Trends</option>
            <option value="utilization">Lease Utilization</option>
            <option value="expiry">Expiry Timeline</option>
          </select>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                ${(analyticsData.revenue.current / 1000000).toFixed(1)}M
              </p>
              <div className="mt-2 flex items-center">
                {analyticsData.revenue.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  analyticsData.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analyticsData.revenue.change}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliance Rate</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {analyticsData.compliance.current}%
              </p>
              <div className="mt-2 flex items-center">
                {analyticsData.compliance.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  analyticsData.compliance.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analyticsData.compliance.change}%
                </span>
                <span className="text-sm text-gray-500 ml-1">improvement</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lease Utilization</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {analyticsData.leaseUtilization.current}%
              </p>
              <div className="mt-2 flex items-center">
                {analyticsData.leaseUtilization.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  analyticsData.leaseUtilization.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analyticsData.leaseUtilization.change}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <ChartPieIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue trend chart would appear here</p>
              <p className="text-sm text-gray-400 mt-1">
                Showing {timeRange} of revenue data
              </p>
            </div>
          </div>
        </div>

        {/* Expiring Leases */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expiring Leases</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Next 30 Days</p>
                  <p className="text-xs text-gray-500">Immediate attention required</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {analyticsData.expiringLeases.next30Days}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Next 60 Days</p>
                  <p className="text-xs text-gray-500">Plan renewal strategy</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {analyticsData.expiringLeases.next60Days}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Next 90 Days</p>
                  <p className="text-xs text-gray-500">Monitor and prepare</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {analyticsData.expiringLeases.next90Days}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Performing Leases</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {analyticsData.topPerformers.map((lease, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{lease.name}</p>
                  <div className="mt-1 flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(lease.value / 3500000) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      ${(lease.value / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    +{lease.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Breakdown */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Regional Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lease Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Portfolio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.regionBreakdown.map((region, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {region.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {region.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(region.value / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((region.value / analyticsData.revenue.current) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaseAnalytics;