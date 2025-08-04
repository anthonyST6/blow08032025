import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { educationDataGenerators } from '../../utils/dashboard-data-generators';
import { BookOpen, MousePointer, CheckCircle, Star, TrendingUp, Video, FileText, MessageSquare } from 'lucide-react';

export const SmartContentRecommendationDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = educationDataGenerators.contentRecommendation();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'content-recommendation',
    name: 'Smart Content Recommendation',
    description: 'AI-powered educational content recommendation system',
    vertical: 'education',
    siaScores: {
      security: 86,
      integrity: 90,
      accuracy: 93
    }
  };

  const config = {
    title: 'Smart Content Recommendation Dashboard',
    description: 'Intelligent content curation and recommendation engine for personalized learning',
    kpis: [
      {
        title: 'Click-Through Rate',
        value: `${data.recommendationMetrics.clickThroughRate}%`,
        change: 4.5,
        trend: 'up' as const,
        icon: MousePointer,
        color: 'blue'
      },
      {
        title: 'Completion Rate',
        value: `${data.recommendationMetrics.completionRate}%`,
        change: 6.2,
        trend: 'up' as const,
        icon: CheckCircle,
        color: 'green'
      },
      {
        title: 'Satisfaction Score',
        value: `${data.recommendationMetrics.satisfactionScore}/5`,
        change: 3.8,
        trend: 'up' as const,
        icon: Star,
        color: 'yellow'
      },
      {
        title: 'Personalization Score',
        value: `${data.recommendationMetrics.personalizationScore}%`,
        change: 2.1,
        trend: 'up' as const,
        icon: TrendingUp,
        color: 'purple'
      }
    ],
    tabs: [
      {
        id: 'content-performance',
        label: 'Content Performance',
        icon: BookOpen,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Content Type Performance</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.contentTypes,
                dataKeys: ['type', 'engagement', 'completion'],
                colors: ['#3b82f6', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Content Distribution</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: data.contentTypes.map(type => ({
                  name: type.type,
                  value: type.count
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
        id: 'engagement-trends',
        label: 'Engagement Trends',
        icon: TrendingUp,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Engagement Trends (30 Days)</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.engagementTrends,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Topic Performance</h3>
              <div className="space-y-3">
                {data.topicPerformance.map((topic, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{topic.topic}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        topic.difficulty === 'high' ? 'bg-red-500 text-white' :
                        topic.difficulty === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Views:</span>
                        <div className="font-medium">{topic.views.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Engagement:</span>
                        <div className="font-medium">{topic.engagement}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Trend:</span>
                        <div className="font-medium text-green-500">↑ Rising</div>
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
        id: 'learner-preferences',
        label: 'Learner Preferences',
        icon: Star,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Content Preferences</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Video Length Preference</h4>
                  <div className="space-y-2">
                    {Object.entries(data.learnerPreferences.videoLength).map(([length, percentage]) => (
                      <div key={length} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{length}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-3">Difficulty Preference</h4>
                  <div className="space-y-2">
                    {Object.entries(data.learnerPreferences.difficulty).map(([level, percentage]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{level}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Format Preferences</h3>
              {renderChart({
                type: 'radar',
                title: '',
                data: [
                  { format: 'Visual', value: data.learnerPreferences.format.visual },
                  { format: 'Text', value: data.learnerPreferences.format.text },
                  { format: 'Mixed', value: data.learnerPreferences.format.mixed },
                  { format: 'Interactive', value: data.learnerPreferences.interactivity.high },
                  { format: 'Passive', value: data.learnerPreferences.interactivity.low }
                ],
                dataKeys: ['format', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'recommendation-accuracy',
        label: 'Recommendation Accuracy',
        icon: CheckCircle,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Recommendation Accuracy Trends</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.recommendationAccuracy,
                dataKeys: ['date', 'value'],
                colors: ['#10b981'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">System Performance</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-blue-500">{data.recommendationMetrics.totalContent.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Total Content</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-green-500">{data.recommendationMetrics.activeRecommendations.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Active Recommendations</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-purple-500">92.3%</div>
                  <div className="text-sm text-gray-500 mt-1">Personalization Score</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-yellow-500">4.5/5</div>
                  <div className="text-sm text-gray-500 mt-1">User Rating</div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm">Video Content</span>
                  </div>
                  <span className="text-sm font-bold">85% Engagement</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Reading Materials</span>
                  </div>
                  <span className="text-sm font-bold">68% Engagement</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-sm">Discussions</span>
                  </div>
                  <span className="text-sm font-bold">75% Engagement</span>
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