import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { logisticsDataGenerators } from '../../utils/dashboard-data-generators';
import { AlertTriangle, Shield, TrendingDown, Clock, Route, Users, Activity, Zap } from 'lucide-react';

export const SupplyChainDisruptionDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = logisticsDataGenerators.supplyChainDisruption();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'supply-chain-disruption',
    name: 'Supply Chain Disruption Orchestration',
    description: 'AI-powered supply chain disruption management and orchestration',
    vertical: 'logistics',
    siaScores: {
      security: 91,
      integrity: 94,
      accuracy: 89
    }
  };

  const config = {
    title: 'Supply Chain Disruption Orchestration Dashboard',
    description: 'Real-time monitoring and orchestration of supply chain disruptions and mitigation strategies',
    kpis: [
      {
        title: 'Active Disruptions',
        value: data.disruptionMetrics.activeDisruptions.toString(),
        change: -23.5,
        trend: 'down' as const,
        icon: AlertTriangle,
        color: 'red'
      },
      {
        title: 'Risk Score',
        value: data.disruptionMetrics.riskScore.toString(),
        change: -8.2,
        trend: 'down' as const,
        icon: Shield,
        color: 'yellow'
      },
      {
        title: 'Mitigation Success',
        value: `${data.disruptionMetrics.mitigationSuccess}%`,
        change: 5.3,
        trend: 'up' as const,
        icon: Activity,
        color: 'green'
      },
      {
        title: 'Avg Resolution Time',
        value: data.disruptionMetrics.avgResolutionTime,
        change: -12.7,
        trend: 'down' as const,
        icon: Clock,
        color: 'blue'
      }
    ],
    tabs: [
      {
        id: 'disruption-overview',
        label: 'Disruption Overview',
        icon: AlertTriangle,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Active Disruptions by Type</h3>
              <div className="space-y-4">
                {data.disruptionTypes.map((disruption, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{disruption.type}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        disruption.impact === 'high' ? 'bg-red-500 text-white' :
                        disruption.impact === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {disruption.impact.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Count:</span>
                        <div className="font-medium">{disruption.count}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Resolution:</span>
                        <div className="font-medium">{disruption.resolution}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <div className="font-medium text-yellow-500">Active</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Impact Analysis (30 Days)</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.impactAnalysis,
                dataKeys: ['date', 'value'],
                colors: ['#ef4444'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'alternative-routes',
        label: 'Alternative Routes',
        icon: Route,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Alternative Route Analysis</h3>
              <div className="space-y-4">
                {data.alternativeRoutes.map((route, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{route.route}</span>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          route.viability >= 90 ? 'bg-green-500' :
                          route.viability >= 80 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-bold">{route.viability}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Cost Impact:</span>
                        <div className={`font-medium ${
                          route.cost.includes('+') ? 'text-red-500' : 'text-green-500'
                        }`}>{route.cost}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Time Impact:</span>
                        <div className="font-medium text-yellow-500">{route.time}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <div className="font-medium">Available</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Route Viability Matrix</h3>
              {renderChart({
                type: 'radar',
                title: '',
                data: data.alternativeRoutes.map(route => ({
                  route: route.route.split(' ')[1],
                  viability: route.viability,
                  cost: 100 - parseInt(route.cost.replace(/[^0-9]/g, '')),
                  speed: 100 - (parseInt(route.time.replace(/[^0-9]/g, '')) * 10)
                })),
                dataKeys: ['route', 'viability', 'cost', 'speed'],
                colors: ['#3b82f6', '#10b981', '#f59e0b'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'supplier-resilience',
        label: 'Supplier Resilience',
        icon: Users,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Supplier Reliability Analysis</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.supplierResilience,
                dataKeys: ['supplier', 'reliability', 'alternatives'],
                colors: ['#8b5cf6', '#06b6d4'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Supplier Risk Matrix</h3>
              <div className="space-y-3">
                {data.supplierResilience.map((supplier, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{supplier.supplier}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        supplier.reliability >= 95 ? 'bg-green-500 text-white' :
                        supplier.reliability >= 90 ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {supplier.reliability}% Reliable
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Lead Time: {supplier.leadTime}</span>
                      <span className="text-gray-500">Alternatives: {supplier.alternatives}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'orchestration-actions',
        label: 'Orchestration Actions',
        icon: Zap,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Recent Orchestration Actions</h3>
              <div className="space-y-4">
                {data.orchestrationActions.map((action, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{action.action}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        action.status === 'completed' ? 'bg-green-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{action.impact}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Disruption Metrics</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-blue-500">{data.disruptionMetrics.affectedRoutes}</div>
                  <div className="text-sm text-gray-500 mt-1">Affected Routes</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-red-500">{data.disruptionMetrics.impactedOrders.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Impacted Orders</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-green-500">87%</div>
                  <div className="text-sm text-gray-500 mt-1">Mitigation Success</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-purple-500">$1.2M</div>
                  <div className="text-sm text-gray-500 mt-1">Saved in Costs</div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">System Performance</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">Automated Response Rate</span>
                      <span className="text-xs font-bold">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">Prediction Accuracy</span>
                      <span className="text-xs font-bold">89%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
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