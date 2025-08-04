import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { educationDataGenerators } from '../../utils/dashboard-data-generators';
import { GraduationCap, TrendingUp, Users, Brain, BookOpen, Target, Activity, Award } from 'lucide-react';

export const AdaptiveLearningPathsDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = educationDataGenerators.personalizedLearning();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'personalized-learning',
    name: 'Adaptive Learning Paths',
    description: 'AI-powered personalized learning pathways for students',
    vertical: 'education',
    siaScores: {
      security: 88,
      integrity: 92,
      accuracy: 95
    }
  };

  const config = {
    title: 'Adaptive Learning Paths Dashboard',
    description: 'AI-driven personalized learning experiences tailored to individual student needs',
    kpis: [
      {
        title: 'Avg Engagement',
        value: `${data.learningMetrics.avgEngagement}%`,
        change: 5.2,
        trend: 'up' as const,
        icon: Activity,
        color: 'green'
      },
      {
        title: 'Completion Rate',
        value: `${data.learningMetrics.completionRate}%`,
        change: 3.8,
        trend: 'up' as const,
        icon: Target,
        color: 'blue'
      },
      {
        title: 'Learning Gain',
        value: `+${data.learningMetrics.avgLearningGain}%`,
        change: 8.5,
        trend: 'up' as const,
        icon: TrendingUp,
        color: 'purple'
      },
      {
        title: 'Adaptation Rate',
        value: `${data.learningMetrics.adaptationRate}%`,
        change: 2.1,
        trend: 'up' as const,
        icon: Brain,
        color: 'yellow'
      }
    ],
    tabs: [
      {
        id: 'student-progress',
        label: 'Student Progress',
        icon: GraduationCap,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Progress Distribution</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.studentProgress,
                dataKeys: ['level', 'percentage', 'avgScore'],
                colors: ['#3b82f6', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Learning Pathway Trends</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.learningPathways,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'subject-engagement',
        label: 'Subject Engagement',
        icon: BookOpen,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Engagement by Subject</h3>
              {renderChart({
                type: 'radar',
                title: '',
                data: data.engagementBySubject.map(subj => ({
                  subject: subj.subject,
                  engagement: subj.engagement,
                  improvement: subj.improvement
                })),
                dataKeys: ['subject', 'engagement', 'improvement'],
                colors: ['#06b6d4', '#f59e0b'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Subject Performance Details</h3>
              <div className="space-y-3">
                {data.engagementBySubject.map((subject, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{subject.subject}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        subject.engagement >= 85 ? 'bg-green-500 text-white' :
                        subject.engagement >= 75 ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {subject.engagement}% Engaged
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Students:</span>
                        <div className="font-medium">{subject.students.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Improvement:</span>
                        <div className="font-medium text-green-500">+{subject.improvement}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Trend:</span>
                        <div className="font-medium">↑ Rising</div>
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
        id: 'learning-styles',
        label: 'Learning Styles',
        icon: Brain,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Learning Style Distribution</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: data.learningStyles.map(style => ({
                  name: style.style,
                  value: style.students
                })),
                dataKeys: ['value'],
                colors: CHART_COLORS,
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Style Effectiveness</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.learningStyles,
                dataKeys: ['style', 'effectiveness'],
                colors: ['#10b981'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'adaptive-metrics',
        label: 'Adaptive Metrics',
        icon: Award,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Adaptation Statistics</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-blue-500">{data.adaptiveMetrics.pathsGenerated.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Paths Generated</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-green-500">{data.adaptiveMetrics.avgAdaptations}</div>
                  <div className="text-sm text-gray-500 mt-1">Avg Adaptations</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-purple-500">{data.adaptiveMetrics.successRate}%</div>
                  <div className="text-sm text-gray-500 mt-1">Success Rate</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-yellow-500">{data.adaptiveMetrics.timeToMastery}</div>
                  <div className="text-sm text-gray-500 mt-1">Time to Mastery</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
              <div className="space-y-4 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Student Satisfaction</span>
                    <span className="text-green-500 font-bold">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Content Relevance</span>
                    <span className="text-blue-500 font-bold">88%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Path Optimization</span>
                    <span className="text-purple-500 font-bold">91.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full" style={{ width: '91.5%' }}></div>
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