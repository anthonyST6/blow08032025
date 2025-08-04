import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { telecomDataGenerators } from '../../utils/dashboard-data-generators';
import { Wifi, Activity, Globe, Gauge, Server, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

export const NetworkPerformanceOptimizationDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = telecomDataGenerators.networkOptimization();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'network-optimization',
    name: 'Network Performance Optimization',
    description: 'AI-driven optimization of network performance and capacity',
    vertical: 'telecom',
    siaScores: {
      security: 93,
      integrity: 95,
      accuracy: 91
    }
  };

  const config = {
    title: 'Network Performance Optimization Dashboard',
    description: 'Real-time network optimization using AI for enhanced performance and user experience',
    kpis: [
      {
        title: 'Network Uptime',
        value: `${data.networkMetrics.uptime}%`,
        change: 0.02,
        trend: 'up' as const,
        icon: Server,
        color: 'green'
      },
      {
        title: 'Avg Latency',
        value: `${data.networkMetrics.avgLatency}ms`,
        change: -8.5,
        trend: 'down' as const,
        icon: Activity,
        color: 'blue'
      },
      {
        title: 'Bandwidth Utilization',
        value: `${data.networkMetrics.bandwidth}%`,
        change: 5.2,
        trend: 'up' as const,
        icon: Gauge,
        color: 'purple'
      },
      {
        title: 'Active Connections',
        value: `${data.networkMetrics.activeConnections}M`,
        change: 12.3,
        trend: 'up' as const,
        icon: Wifi,
        color: 'orange'
      }
    ],
    tabs: [
      {
        id: 'network-overview',
        label: 'Network Overview',
        icon: Globe,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Regional Performance</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.networkPerformance,
                dataKeys: ['region', 'throughput', 'utilization'],
                colors: ['#3b82f6', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Traffic Patterns (24h)</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.trafficPatterns,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'congestion',
        label: 'Congestion Analysis',
        icon: AlertCircle,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Congestion Hotspots</h3>
              <div className="space-y-3">
                {data.congestionHotspots.map((hotspot, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{hotspot.location}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        hotspot.priority === 'high' ? 'bg-red-500 text-white' :
                        hotspot.priority === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {hotspot.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">Congestion:</span>
                        <div className="font-medium">{hotspot.congestion}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Users:</span>
                        <div className="font-medium">{(hotspot.users / 1000).toFixed(0)}K</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          hotspot.congestion >= 80 ? 'bg-red-500' :
                          hotspot.congestion >= 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${hotspot.congestion}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Capacity Forecast</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.capacityForecast,
                dataKeys: ['date', 'value'],
                colors: ['#ef4444'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'qos',
        label: 'Quality of Service',
        icon: TrendingUp,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">QoS Metrics</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Voice Quality</span>
                    <span className="text-2xl font-bold text-green-500">{data.qosMetrics.voiceQuality}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.qosMetrics.voiceQuality}%` }}></div>
                  </div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Video Quality</span>
                    <span className="text-2xl font-bold text-blue-500">{data.qosMetrics.videoQuality}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.qosMetrics.videoQuality}%` }}></div>
                  </div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Data Reliability</span>
                    <span className="text-2xl font-bold text-purple-500">{data.qosMetrics.dataReliability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${data.qosMetrics.dataReliability}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Regional Latency</h3>
              <div className="space-y-3">
                {data.networkPerformance.map((region, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{region.region}</span>
                      <span className={`font-bold ${
                        region.latency <= 10 ? 'text-green-500' :
                        region.latency <= 15 ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {region.latency}ms
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Throughput: {region.throughput} Mbps | Utilization: {region.utilization}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'metrics',
        label: 'Key Metrics',
        icon: BarChart3,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Network Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Nodes</span>
                  <span className="font-bold">{data.networkMetrics.totalNodes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Packet Loss</span>
                  <span className="font-bold text-green-500">{data.networkMetrics.packetLoss}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Streaming Buffer</span>
                  <span className="font-bold">{data.qosMetrics.streamingBuffer}s</span>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Network Uptime</span>
                    <span className="text-green-500 font-bold">{data.networkMetrics.uptime}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.networkMetrics.uptime}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Bandwidth Usage</span>
                    <span className="text-blue-500 font-bold">{data.networkMetrics.bandwidth}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.networkMetrics.bandwidth}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Connection Summary</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-orange-500">{data.networkMetrics.activeConnections}M</div>
                  <div className="text-sm text-gray-500 mt-1">Active Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{data.networkMetrics.avgLatency}ms</div>
                  <div className="text-xs text-gray-500">Average Latency</div>
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