import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { pharmaDataGenerators } from '../../utils/dashboard-data-generators';
import { FlaskConical, Brain, TrendingUp, Target, DollarSign, Activity, Microscope, Clock } from 'lucide-react';

export const AIDrugDiscoveryDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = pharmaDataGenerators.drugDiscovery();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'ai-drug-discovery',
    name: 'AI-Assisted Drug Discovery',
    description: 'Accelerating pharmaceutical innovation with AI',
    vertical: 'pharmaceutical',
    siaScores: {
      security: 95,
      integrity: 98,
      accuracy: 94
    }
  };

  const config = {
    title: 'AI-Assisted Drug Discovery Dashboard',
    description: 'Accelerating pharmaceutical innovation through AI-powered compound screening and optimization',
    kpis: [
      {
        title: 'Active Compounds',
        value: data.discoveryMetrics.activeCompounds.toLocaleString(),
        change: 15.2,
        trend: 'up' as const,
        icon: FlaskConical,
        color: 'purple'
      },
      {
        title: 'Success Rate',
        value: `${data.discoveryMetrics.successRate}%`,
        change: 2.3,
        trend: 'up' as const,
        icon: Target,
        color: 'blue'
      },
      {
        title: 'Time to Candidate',
        value: data.discoveryMetrics.avgTimeToCandidate,
        change: -18.5,
        trend: 'down' as const,
        icon: Clock,
        color: 'green'
      },
      {
        title: 'Cost per Candidate',
        value: `$${data.discoveryMetrics.costPerCandidate}M`,
        change: -12.7,
        trend: 'down' as const,
        icon: DollarSign,
        color: 'orange'
      }
    ],
    tabs: [
      {
        id: 'pipeline',
        label: 'Discovery Pipeline',
        icon: Brain,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Pipeline Stages</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.pipelineStages.map(stage => ({
                  stage: stage.stage,
                  compounds: stage.compounds,
                  successRate: stage.success
                })),
                dataKeys: ['stage', 'compounds', 'successRate'],
                colors: ['#8b5cf6', '#06b6d4'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Discovery Metrics</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">In Screening</span>
                    <span className="text-2xl font-bold text-purple-500">{data.discoveryMetrics.inScreening.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">In Preclinical</span>
                    <span className="text-2xl font-bold text-blue-500">{data.discoveryMetrics.inPreclinical.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'research',
        label: 'Research Areas',
        icon: Microscope,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Therapeutic Areas</h3>
              {renderChart({
                type: 'radar',
                title: '',
                data: data.therapeuticAreas.map(area => ({
                  area: area.area,
                  compounds: area.compounds / 10,
                  investment: area.investment,
                  potential: area.potential === 'high' ? 90 : area.potential === 'medium' ? 60 : 30
                })),
                dataKeys: ['area', 'compounds', 'investment', 'potential'],
                colors: ['#8b5cf6', '#06b6d4', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Investment Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-green-500">${data.costAnalysis.totalInvestment}M</div>
                  <div className="text-sm text-gray-500 mt-1">Total Investment</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-blue-500">{data.costAnalysis.projectedROI}%</div>
                  <div className="text-sm text-gray-500 mt-1">Projected ROI</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-2xl font-bold text-purple-500">{data.costAnalysis.timeToMarket}</div>
                  <div className="text-sm text-gray-500 mt-1">Time to Market</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-orange-500">{data.costAnalysis.probabilityOfSuccess}%</div>
                  <div className="text-sm text-gray-500 mt-1">Success Probability</div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'ai-performance',
        label: 'AI Performance',
        icon: Activity,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">AI Model Accuracy Trends</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.aiPredictions,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Molecular Properties</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.molecularProperties,
                dataKeys: ['property', 'score', 'threshold'],
                colors: ['#8b5cf6', '#ef4444'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      }
    ]
  };

  return <DashboardTemplate useCase={mockUseCase as any} config={config} isDarkMode={isDarkMode} />;
};