import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { retailDataGenerators } from '../../utils/dashboard-data-generators';
import { TrendingUp, Package, BarChart3, Target, Calendar, Activity, ShoppingCart, AlertTriangle } from 'lucide-react';

export const DemandForecastingDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = retailDataGenerators.demandForecasting();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'demand-forecasting',
    name: 'Demand Forecasting',
    description: 'AI-powered demand prediction and inventory optimization',
    vertical: 'retail',
    siaScores: {
      security: 85,
      integrity: 90,
      accuracy: 92
    }
  };

  const config = {
    title: 'Demand Forecasting Dashboard',
    description: 'AI-powered demand prediction and inventory optimization for retail operations',
    kpis: [
      {
        title: 'Forecast Accuracy',
        value: `${data.forecastMetrics.accuracy}%`,
        change: 2.3,
        trend: 'up' as const,
        icon: Target,
        color: 'blue'
      },
      {
        title: 'SKUs Covered',
        value: data.forecastMetrics.skusCovered.toLocaleString(),
        change: 3.5,
        trend: 'up' as const,
        icon: Package,
        color: 'green'
      },
      {
        title: 'MAPE',
        value: `${data.forecastMetrics.mape}%`,
        change: -1.2,
        trend: 'down' as const,
        icon: BarChart3,
        color: 'yellow'
      },
      {
        title: 'Confidence Level',
        value: `${data.forecastMetrics.confidenceLevel}%`,
        change: 3.5,
        trend: 'up' as const,
        icon: Activity,
        color: 'purple'
      }
    ],
    tabs: [
      {
        id: 'forecast-accuracy',
        label: 'Forecast Accuracy',
        icon: TrendingUp,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Forecast vs Actual Sales</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.forecastVsActual.map(item => ({
                  ...item,
                  forecast: item.value,
                  actual: item.value + (Math.random() - 0.5) * 20
                })),
                dataKeys: ['date', 'forecast', 'actual'],
                colors: ['#3b82f6', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Category Forecast Performance</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.categoryPerformance,
                dataKeys: ['category', 'accuracy', 'volume'],
                colors: ['#8b5cf6', '#f59e0b'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'seasonal-analysis',
        label: 'Seasonal Analysis',
        icon: Calendar,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Seasonal Index by Month</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.seasonalPatterns,
                dataKeys: ['month', 'index'],
                colors: ['#06b6d4'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Category Trend Analysis</h3>
              {renderChart({
                type: 'radar',
                title: '',
                data: data.categoryPerformance.map(cat => ({
                  category: cat.category,
                  accuracy: cat.accuracy,
                  volume: cat.volume / 100
                })),
                dataKeys: ['category', 'accuracy', 'volume'],
                colors: ['#8b5cf6', '#ec4899'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'inventory-optimization',
        label: 'Inventory Optimization',
        icon: Package,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Current vs Optimal Stock Levels</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: [
                  { metric: 'Current Stock', value: data.inventoryOptimization.currentStock },
                  { metric: 'Optimal Stock', value: data.inventoryOptimization.optimalStock },
                  { metric: 'Excess Inventory', value: data.inventoryOptimization.excessInventory }
                ],
                dataKeys: ['metric', 'value'],
                colors: ['#3b82f6'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Inventory Performance Metrics</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: [
                  { name: 'Stockout Risk', value: data.inventoryOptimization.stockoutRisk },
                  { name: 'Optimal Level', value: 100 - data.inventoryOptimization.stockoutRisk - 15 },
                  { name: 'Overstock', value: 15 }
                ],
                dataKeys: ['value'],
                colors: ['#ef4444', '#10b981', '#f59e0b'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'forecast-horizon',
        label: 'Forecast Horizon',
        icon: AlertTriangle,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Forecast Confidence by Horizon</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: Array.from({ length: 8 }, (_, i) => ({
                  week: `Week ${i + 1}`,
                  confidence: 95 - i * 3,
                  accuracy: 92 - i * 2.5
                })),
                dataKeys: ['week', 'confidence', 'accuracy'],
                colors: ['#3b82f6', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Forecast Bias Analysis</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: Array.from({ length: 12 }, (_, i) => ({
                  month: `M${i + 1}`,
                  bias: -2.3 + Math.sin(i / 12 * Math.PI * 2) * 3,
                  target: 0
                })),
                dataKeys: ['month', 'bias', 'target'],
                colors: ['#ef4444', '#6b7280'],
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