import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { retailDataGenerators } from '../../utils/dashboard-data-generators';
import { DollarSign, TrendingUp, BarChart3, Activity, ShoppingCart, Zap, Target, Award } from 'lucide-react';

export const DynamicPriceOptimizationDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = retailDataGenerators.dynamicPricing();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'dynamic-price-optimization',
    name: 'Dynamic Price Optimization',
    description: 'Real-time pricing optimization based on demand and competition',
    vertical: 'retail',
    siaScores: {
      security: 82,
      integrity: 88,
      accuracy: 94
    }
  };

  const config = {
    title: 'Dynamic Price Optimization Dashboard',
    description: 'Real-time pricing optimization based on demand, competition, and market conditions',
    kpis: [
      {
        title: 'Revenue Increase',
        value: `+${data.pricingMetrics.revenueIncrease}%`,
        change: 3.2,
        trend: 'up' as const,
        icon: DollarSign,
        color: 'green'
      },
      {
        title: 'Margin Improvement',
        value: `+${data.pricingMetrics.marginImprovement}%`,
        change: 2.5,
        trend: 'up' as const,
        icon: TrendingUp,
        color: 'blue'
      },
      {
        title: 'Active Optimizations',
        value: data.pricingMetrics.activeOptimizations.toLocaleString(),
        change: 5.8,
        trend: 'up' as const,
        icon: Zap,
        color: 'purple'
      },
      {
        title: 'Price Elasticity',
        value: data.pricingMetrics.priceElasticity.toFixed(1),
        change: -0.2,
        trend: 'stable' as const,
        icon: Activity,
        color: 'yellow'
      }
    ],
    tabs: [
      {
        id: 'price-optimization',
        label: 'Price Optimization',
        icon: Target,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Category Price Performance</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.priceOptimization,
                dataKeys: ['category', 'revenue', 'margin'],
                colors: ['#3b82f6', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Pricing Trends (24 Hours)</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.pricingTrends.slice(0, 24),
                dataKeys: ['hour', 'avgPrice', 'demand'],
                colors: ['#8b5cf6', '#f59e0b'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'competitor-analysis',
        label: 'Competitor Analysis',
        icon: BarChart3,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Competitor Price Comparison</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.competitorAnalysis,
                dataKeys: ['competitor', 'avgPriceDiff', 'marketShare'],
                colors: ['#ef4444', '#06b6d4'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Market Share Distribution</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: data.competitorAnalysis.map(comp => ({
                  name: comp.competitor,
                  value: comp.marketShare
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
        id: 'elasticity-analysis',
        label: 'Elasticity Analysis',
        icon: Activity,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Price Elasticity by Range</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.elasticityAnalysis,
                dataKeys: ['priceRange', 'elasticity'],
                colors: ['#ec4899'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Optimal Pricing Zones</h3>
              <div className="space-y-4 mt-6">
                {data.elasticityAnalysis.map((zone, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{zone.priceRange}</span>
                      <span className={`text-sm ${zone.optimal ? 'text-green-500' : 'text-gray-500'}`}>
                        {zone.optimal ? 'Optimal' : 'Sub-optimal'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Elasticity: {zone.elasticity}</span>
                      <span className="text-sm text-gray-500">Volume: {zone.volume}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'revenue-impact',
        label: 'Revenue Impact',
        icon: Award,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Revenue Impact Over Time</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.revenueImpact,
                dataKeys: ['date', 'baseline', 'optimized'],
                colors: ['#6b7280', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">A/B Test Results</h3>
              <div className="space-y-4 mt-6">
                {data.abTestResults.map((test, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{test.test}</span>
                      {test.winner && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Winner</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Variant:</span>
                        <div className="font-medium">{test.variant}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Conv:</span>
                        <div className="font-medium">{test.conversion}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Revenue:</span>
                        <div className="font-medium">${test.revenue}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    ]
  };

  return <DashboardTemplate useCase={mockUseCase as any} config={config} isDarkMode={isDarkMode} />;
};