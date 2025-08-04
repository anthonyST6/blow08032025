import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { educationDataGenerators } from '../../utils/dashboard-data-generators';
import { TrendingUp, AlertTriangle, Users, Target, BarChart3, Shield, Activity, Clock } from 'lucide-react';

export const StudentPerformancePredictionDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = educationDataGenerators.performancePrediction();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'performance-prediction',
    name: 'Student Performance Prediction',
    description: 'AI-powered early warning system for student performance',
    vertical: 'education',
    siaScores: {
      security: 90,
      integrity: 94,
      accuracy: 89
    }
  };

  const config = {
    title: 'Student Performance Prediction Dashboard',
    description: 'Predictive analytics for early intervention and student success optimization',
    kpis: [
      {
        title: 'At-Risk Students',
        value: data.predictionMetrics.atRiskIdentified.toLocaleString(),
        change: -15.3,
        trend: 'down' as const,
        icon: AlertTriangle,
        color: 'red'
      },
      {
        title: 'Accuracy Rate',
        value: `${data.predictionMetrics.accuracyRate}%`,
        change: 2.8,
        trend: 'up' as const,
        icon: Target,
        color: 'green'
      },
      {
        title: 'Successful Interventions',
        value: data.predictionMetrics.successfulInterventions.toLocaleString(),
        change: 18.5,
        trend: 'up' as const,
        icon: Shield,
        color: 'blue'
      },
      {
        title: 'Early Interventions',
        value: data.predictionMetrics.earlyInterventions.toLocaleString(),
        change: 12.3,
        trend: 'up' as const,
        icon: Clock,
        color: 'purple'
      }
    ],
    tabs: [
      {
        id: 'risk-analysis',
        label: 'Risk Analysis',
        icon: AlertTriangle,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.riskDistribution,
                dataKeys: ['risk', 'percentage', 'interventions'],
                colors: ['#ef4444', '#f59e0b'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Risk Categories</h3>
              <div className="space-y-3">
                {data.riskDistribution.map((risk, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{risk.risk} Risk</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        risk.risk === 'Critical' ? 'bg-red-500 text-white' :
                        risk.risk === 'High' ? 'bg-orange-500 text-white' :
                        risk.risk === 'Medium' ? 'bg-yellow-500 text-white' :
                        risk.risk === 'Low' ? 'bg-green-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {risk.count.toLocaleString()} Students
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Percentage:</span>
                        <div className="font-medium">{risk.percentage}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Interventions:</span>
                        <div className="font-medium">{risk.interventions}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Success Rate:</span>
                        <div className="font-medium">{Math.round(82 + Math.random() * 10)}%</div>
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
        id: 'performance-trends',
        label: 'Performance Trends',
        icon: TrendingUp,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Performance Trends (180 Days)</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.performanceTrends,
                dataKeys: ['date', 'value'],
                colors: ['#3b82f6'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Intervention Success Rate</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.interventionSuccess,
                dataKeys: ['date', 'value'],
                colors: ['#10b981'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'predictive-factors',
        label: 'Predictive Factors',
        icon: BarChart3,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Factor Analysis</h3>
              {renderChart({
                type: 'radar',
                title: '',
                data: data.predictiveFactors.map(factor => ({
                  factor: factor.factor,
                  weight: factor.weight,
                  correlation: factor.correlation * 100
                })),
                dataKeys: ['factor', 'weight', 'correlation'],
                colors: ['#8b5cf6', '#06b6d4'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Factor Importance</h3>
              <div className="space-y-4 mt-6">
                {data.predictiveFactors.map((factor, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{factor.factor}</span>
                      <span className="text-sm text-gray-500">
                        Weight: {factor.weight}% | Correlation: {factor.correlation}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                        style={{ width: `${factor.weight * 4}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'outcome-analysis',
        label: 'Outcome Analysis',
        icon: Activity,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Prediction Accuracy by Outcome</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.outcomeAnalysis,
                dataKeys: ['outcome', 'accuracy'],
                colors: ['#10b981'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Outcome Statistics</h3>
              <div className="space-y-4">
                {data.outcomeAnalysis.map((outcome, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{outcome.outcome}</span>
                      <span className={`text-sm font-bold ${
                        outcome.accuracy >= 95 ? 'text-green-500' :
                        outcome.accuracy >= 90 ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {outcome.accuracy}% Accurate
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Predicted:</span>
                        <div className="font-medium">{outcome.predicted.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Actual:</span>
                        <div className="font-medium">{outcome.actual.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
                <h4 className="text-sm font-medium mb-2">System Performance</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total Analyzed:</span>
                    <div className="font-bold">{data.predictionMetrics.studentsAnalyzed.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg Prediction Time:</span>
                    <div className="font-bold">{data.predictionMetrics.avgPredictionTime}</div>
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