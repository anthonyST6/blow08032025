import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { logisticsDataGenerators } from '../../utils/dashboard-data-generators';
import { Package, Bot, Activity, Clock, BarChart3, Zap, CheckCircle, TrendingUp } from 'lucide-react';

export const WarehouseAutomationDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = logisticsDataGenerators.warehouseAutomation();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'warehouse-automation',
    name: 'Warehouse Automation',
    description: 'AI-powered warehouse automation and robotics management',
    vertical: 'logistics',
    siaScores: {
      security: 89,
      integrity: 93,
      accuracy: 96
    }
  };

  const config = {
    title: 'Warehouse Automation Dashboard',
    description: 'Real-time monitoring and optimization of automated warehouse operations',
    kpis: [
      {
        title: 'Order Accuracy',
        value: `${data.warehouseMetrics.accuracy}%`,
        change: 0.3,
        trend: 'up' as const,
        icon: CheckCircle,
        color: 'green'
      },
      {
        title: 'Avg Process Time',
        value: data.warehouseMetrics.avgProcessTime,
        change: -8.2,
        trend: 'down' as const,
        icon: Clock,
        color: 'blue'
      },
      {
        title: 'Robots Active',
        value: data.warehouseMetrics.robotsActive.toString(),
        change: 5.7,
        trend: 'up' as const,
        icon: Bot,
        color: 'purple'
      },
      {
        title: 'Efficiency Rate',
        value: `${data.warehouseMetrics.efficiency}%`,
        change: 3.2,
        trend: 'up' as const,
        icon: Activity,
        color: 'yellow'
      }
    ],
    tabs: [
      {
        id: 'automation-overview',
        label: 'Automation Overview',
        icon: Bot,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Zone Automation Status</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.automationStatus,
                dataKeys: ['zone', 'automation', 'throughput'],
                colors: ['#3b82f6', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Robot Fleet Performance</h3>
              <div className="space-y-3">
                {data.robotPerformance.map((robot, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{robot.robot}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        robot.status === 'Active' ? 'bg-green-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {robot.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Tasks:</span>
                        <div className="font-medium">{robot.tasks}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Efficiency:</span>
                        <div className="font-medium">{robot.efficiency}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Battery:</span>
                        <div className={`font-medium ${
                          robot.battery < 50 ? 'text-yellow-500' : 'text-green-500'
                        }`}>{robot.battery}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <div className="font-medium">{robot.robot.split('-')[0]}</div>
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
        id: 'throughput-analysis',
        label: 'Throughput Analysis',
        icon: TrendingUp,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Hourly Throughput Trends</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.throughputTrends,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Order Fulfillment Speed</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: [
                  { name: 'Same Day', value: data.orderFulfillment.sameDay },
                  { name: 'Next Day', value: data.orderFulfillment.nextDay },
                  { name: 'Two Day', value: data.orderFulfillment.twoDay },
                  { name: 'Standard', value: data.orderFulfillment.standard }
                ],
                dataKeys: ['value'],
                colors: ['#10b981', '#3b82f6', '#f59e0b', '#6b7280'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'inventory-accuracy',
        label: 'Inventory Accuracy',
        icon: Package,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Inventory Accuracy Trends</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.inventoryAccuracy,
                dataKeys: ['date', 'value'],
                colors: ['#10b981'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Zone Error Rates</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.automationStatus,
                dataKeys: ['zone', 'errors'],
                colors: ['#ef4444'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'performance-metrics',
        label: 'Performance Metrics',
        icon: BarChart3,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
              <div className="space-y-4 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Order Processing Speed</span>
                    <span className="text-green-500 font-bold">94.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '94.5%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Picking Accuracy</span>
                    <span className="text-green-500 font-bold">99.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '99.7%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Space Utilization</span>
                    <span className="text-blue-500 font-bold">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Robot Utilization</span>
                    <span className="text-purple-500 font-bold">91%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full" style={{ width: '91%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Warehouse Statistics</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-blue-500">{data.warehouseMetrics.totalOrders.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Total Orders</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-green-500">{data.warehouseMetrics.ordersProcessed.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Processed</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-purple-500">1.8K/hr</div>
                  <div className="text-sm text-gray-500 mt-1">Throughput</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-yellow-500">0.03%</div>
                  <div className="text-sm text-gray-500 mt-1">Error Rate</div>
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