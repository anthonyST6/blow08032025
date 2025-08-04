import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { retailDataGenerators } from '../../utils/dashboard-data-generators';
import { Users, ShoppingBag, TrendingUp, Target, Mail, Smartphone, Globe, Heart } from 'lucide-react';

export const CustomerPersonalizationDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = retailDataGenerators.customerPersonalization();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'customer-personalization',
    name: 'Customer Personalization',
    description: 'AI-driven personalized shopping experiences',
    vertical: 'retail',
    siaScores: {
      security: 88,
      integrity: 85,
      accuracy: 91
    }
  };

  const config = {
    title: 'Customer Personalization Dashboard',
    description: 'AI-driven personalized shopping experiences and recommendation engine performance',
    kpis: [
      {
        title: 'Conversion Rate',
        value: `${data.personalizationMetrics.conversionRate}%`,
        change: 4.2,
        trend: 'up' as const,
        icon: Target,
        color: 'green'
      },
      {
        title: 'Avg Order Value',
        value: `$${data.personalizationMetrics.avgOrderValue}`,
        change: 8.5,
        trend: 'up' as const,
        icon: ShoppingBag,
        color: 'blue'
      },
      {
        title: 'Engagement Score',
        value: `${data.personalizationMetrics.engagementScore}`,
        change: 5.3,
        trend: 'up' as const,
        icon: Heart,
        color: 'purple'
      },
      {
        title: 'Return Rate',
        value: `${data.personalizationMetrics.returnRate}%`,
        change: 12.1,
        trend: 'up' as const,
        icon: Users,
        color: 'yellow'
      }
    ],
    tabs: [
      {
        id: 'segment-performance',
        label: 'Segment Performance',
        icon: Users,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Customer Segment Analysis</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.segmentPerformance,
                dataKeys: ['segment', 'conversion', 'aov'],
                colors: ['#3b82f6', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Segment Distribution</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: data.segmentPerformance.map(seg => ({
                  name: seg.segment,
                  value: seg.users
                })),
                dataKeys: ['value'],
                colors: CHART_COLORS,
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'recommendation-engine',
        label: 'Recommendation Engine',
        icon: TrendingUp,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Recommendation Performance Trends</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.recommendationPerformance,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Click-Through Rate by Segment</h3>
              {renderChart({
                type: 'radar',
                title: '',
                data: data.segmentPerformance.map(seg => ({
                  segment: seg.segment,
                  ctr: data.personalizationMetrics.clickThroughRate + (Math.random() - 0.5) * 10,
                  engagement: 50 + Math.random() * 30
                })),
                dataKeys: ['segment', 'ctr', 'engagement'],
                colors: ['#06b6d4', '#f59e0b'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'channel-engagement',
        label: 'Channel Engagement',
        icon: Globe,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Engagement by Channel</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.channelEngagement,
                dataKeys: ['channel', 'engagement', 'conversion'],
                colors: ['#ec4899', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Channel Performance Matrix</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {data.channelEngagement.map((channel, index) => {
                  const Icon = channel.channel === 'Email' ? Mail : 
                              channel.channel === 'Mobile' ? Smartphone : 
                              channel.channel === 'Web' ? Globe : Heart;
                  return (
                    <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">{channel.channel}</span>
                      </div>
                      <div className="text-2xl font-bold">{channel.engagement}%</div>
                      <div className="text-sm text-gray-500">Conv: {channel.conversion}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'personalization-impact',
        label: 'Personalization Impact',
        icon: Target,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Revenue Impact Analysis</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: Array.from({ length: 12 }, (_, i) => ({
                  month: `Month ${i + 1}`,
                  baseline: 100 + i * 2,
                  personalized: 100 + i * 2 + 15 + Math.random() * 10
                })),
                dataKeys: ['month', 'baseline', 'personalized'],
                colors: ['#6b7280', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Key Metrics Improvement</h3>
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cart Abandonment Rate</span>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">-23%</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '77%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Customer Lifetime Value</span>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">+45%</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Repeat Purchase Rate</span>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">+38%</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Open Rate</span>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">+52%</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
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