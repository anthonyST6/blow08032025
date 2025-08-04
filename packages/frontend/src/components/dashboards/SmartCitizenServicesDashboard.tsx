import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { governmentDataGenerators } from '../../utils/dashboard-data-generators';
import { Users, Clock, TrendingUp, Smartphone, BarChart3, Award, MessageSquare, Globe } from 'lucide-react';

export const SmartCitizenServicesDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = governmentDataGenerators.citizenServices();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'citizen-services',
    name: 'Smart Citizen Services',
    description: 'AI-powered citizen service delivery and engagement',
    vertical: 'government',
    siaScores: {
      security: 92,
      integrity: 95,
      accuracy: 88
    }
  };

  const config = {
    title: 'Smart Citizen Services Dashboard',
    description: 'AI-powered digital transformation of government services for enhanced citizen experience',
    kpis: [
      {
        title: 'Digital Adoption',
        value: `${data.serviceMetrics.digitalAdoption}%`,
        change: 12.5,
        trend: 'up' as const,
        icon: Smartphone,
        color: 'blue'
      },
      {
        title: 'Avg Processing Time',
        value: data.serviceMetrics.avgProcessingTime,
        change: -18.3,
        trend: 'down' as const,
        icon: Clock,
        color: 'green'
      },
      {
        title: 'Satisfaction Score',
        value: `${data.serviceMetrics.satisfactionScore}/5`,
        change: 8.7,
        trend: 'up' as const,
        icon: Award,
        color: 'purple'
      },
      {
        title: 'First Contact Resolution',
        value: `${data.serviceMetrics.firstContactResolution}%`,
        change: 5.2,
        trend: 'up' as const,
        icon: MessageSquare,
        color: 'orange'
      }
    ],
    tabs: [
      {
        id: 'service-overview',
        label: 'Service Overview',
        icon: BarChart3,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Service Categories Performance</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.serviceCategories,
                dataKeys: ['category', 'requests', 'completion'],
                colors: ['#3b82f6', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Request Volume Trends</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.requestTrends,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'channel-analysis',
        label: 'Channel Analysis',
        icon: Globe,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Service Channel Distribution</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: data.channelDistribution.map(channel => ({
                  name: channel.channel,
                  value: channel.percentage
                })),
                dataKeys: ['value'],
                colors: CHART_COLORS,
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Channel Growth Trends</h3>
              <div className="space-y-3">
                {data.channelDistribution.map((channel, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{channel.channel}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        channel.growth > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {channel.growth > 0 ? '+' : ''}{channel.growth}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${channel.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {channel.percentage}% of total requests
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'efficiency',
        label: 'Processing Efficiency',
        icon: TrendingUp,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Processing Efficiency Trends</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.processingEfficiency,
                dataKeys: ['date', 'value'],
                colors: ['#10b981'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Service Category Details</h3>
              <div className="space-y-3">
                {data.serviceCategories.map((category, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{category.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Satisfaction:</span>
                        <span className="font-bold">{category.satisfaction}/5</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Requests:</span>
                        <div className="font-medium">{category.requests.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Completion:</span>
                        <div className="font-medium">{category.completion}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'engagement',
        label: 'Citizen Engagement',
        icon: Users,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-blue-500">
                    {(data.citizenEngagement.activeUsers / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Active Users</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-green-500">
                    +{data.citizenEngagement.monthlyGrowth}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Monthly Growth</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-purple-500">
                    {data.citizenEngagement.returnRate}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Return Rate</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Service Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Requests</span>
                  <span className="font-bold">{data.serviceMetrics.totalRequests.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed Today</span>
                  <span className="font-bold text-green-500">{data.serviceMetrics.completedToday.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Session Time</span>
                  <span className="font-bold">{data.citizenEngagement.avgSessionTime}</span>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Performance Indicators</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Digital Adoption</span>
                    <span className="text-blue-500 font-bold">{data.serviceMetrics.digitalAdoption}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.serviceMetrics.digitalAdoption}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">First Contact Resolution</span>
                    <span className="text-green-500 font-bold">{data.serviceMetrics.firstContactResolution}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.serviceMetrics.firstContactResolution}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    ]
  };

  return <DashboardTemplate useCase={mockUseCase as any} config={config} isDarkMode={isDarkMode} />;
};