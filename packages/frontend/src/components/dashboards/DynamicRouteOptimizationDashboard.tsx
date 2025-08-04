import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { logisticsDataGenerators } from '../../utils/dashboard-data-generators';
import { Truck, Navigation, Clock, Fuel, TrendingDown, MapPin, Activity, DollarSign } from 'lucide-react';

export const DynamicRouteOptimizationDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = logisticsDataGenerators.routeOptimization();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'route-optimization',
    name: 'Dynamic Route Optimization',
    description: 'AI-powered route optimization for delivery efficiency',
    vertical: 'logistics',
    siaScores: {
      security: 85,
      integrity: 92,
      accuracy: 94
    }
  };

  const config = {
    title: 'Dynamic Route Optimization Dashboard',
    description: 'Real-time route optimization for maximum delivery efficiency and cost savings',
    kpis: [
      {
        title: 'On-Time Rate',
        value: `${data.routeMetrics.onTimeRate}%`,
        change: 2.3,
        trend: 'up' as const,
        icon: Clock,
        color: 'green'
      },
      {
        title: 'Active Vehicles',
        value: data.routeMetrics.activeVehicles.toString(),
        change: 5.2,
        trend: 'up' as const,
        icon: Truck,
        color: 'blue'
      },
      {
        title: 'Fuel Savings',
        value: `${data.routeMetrics.fuelSavings}%`,
        change: 3.8,
        trend: 'up' as const,
        icon: Fuel,
        color: 'purple'
      },
      {
        title: 'Distance Reduction',
        value: `${data.routeMetrics.distanceReduction}%`,
        change: 4.1,
        trend: 'up' as const,
        icon: TrendingDown,
        color: 'yellow'
      }
    ],
    tabs: [
      {
        id: 'fleet-overview',
        label: 'Fleet Overview',
        icon: Truck,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Fleet Status</h3>
              <div className="space-y-4">
                {data.fleetStatus.map((vehicle, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{vehicle.vehicle}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        vehicle.status === 'En Route' ? 'bg-blue-500 text-white' :
                        vehicle.status === 'Loading' ? 'bg-yellow-500 text-white' :
                        vehicle.status === 'Returning' ? 'bg-green-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Deliveries:</span>
                        <div className="font-medium">{vehicle.deliveries}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">ETA:</span>
                        <div className="font-medium">{vehicle.eta}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Efficiency:</span>
                        <div className="font-medium">{vehicle.efficiency}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Delivery Trends (30 Days)</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.deliveryTrends,
                dataKeys: ['date', 'value'],
                colors: ['#3b82f6'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'route-efficiency',
        label: 'Route Efficiency',
        icon: Navigation,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Hourly Route Efficiency</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.routeEfficiency,
                dataKeys: ['date', 'value'],
                colors: ['#10b981'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Traffic Impact by Zone</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.trafficImpact,
                dataKeys: ['zone', 'congestion', 'routes'],
                colors: ['#ef4444', '#3b82f6'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'cost-analysis',
        label: 'Cost Analysis',
        icon: DollarSign,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: [
                  { name: 'Fuel', value: data.costAnalysis.fuelCost },
                  { name: 'Labor', value: data.costAnalysis.laborCost },
                  { name: 'Maintenance', value: data.costAnalysis.maintenanceCost }
                ],
                dataKeys: ['value'],
                colors: ['#8b5cf6', '#f59e0b', '#06b6d4'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Optimization Savings</h3>
              <div className="space-y-6 mt-8">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Fuel Cost Reduction</span>
                    <span className="text-green-500 font-bold">-18.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '81.5%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Time Savings</span>
                    <span className="text-green-500 font-bold">-22.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '77.7%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Total Cost Savings</span>
                    <span className="text-green-500 font-bold">$23,456</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'real-time-tracking',
        label: 'Real-Time Tracking',
        icon: MapPin,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Delivery Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-blue-500">{data.routeMetrics.totalDeliveries.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Total Deliveries</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-green-500">{data.routeMetrics.avgDeliveryTime}</div>
                  <div className="text-sm text-gray-500 mt-1">Avg Delivery Time</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-purple-500">94.5%</div>
                  <div className="text-sm text-gray-500 mt-1">Route Optimization</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-yellow-500">4.8/5</div>
                  <div className="text-sm text-gray-500 mt-1">Customer Rating</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Zone Performance</h3>
              {renderChart({
                type: 'radar',
                title: '',
                data: data.trafficImpact.map(zone => ({
                  zone: zone.zone,
                  efficiency: 100 - zone.congestion,
                  routes: zone.routes
                })),
                dataKeys: ['zone', 'efficiency', 'routes'],
                colors: ['#10b981', '#3b82f6'],
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