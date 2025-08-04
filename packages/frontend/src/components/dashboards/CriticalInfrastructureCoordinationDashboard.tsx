import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { governmentDataGenerators } from '../../utils/dashboard-data-generators';
import { Shield, AlertTriangle, Network, Activity, Lock, Globe, BarChart3, Zap } from 'lucide-react';

export const CriticalInfrastructureCoordinationDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = governmentDataGenerators.infrastructureCoordination();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'critical-infrastructure-coordination',
    name: 'National Critical Infrastructure Coordination',
    description: 'AI-powered coordination of critical national infrastructure',
    vertical: 'government',
    siaScores: {
      security: 99,
      integrity: 98,
      accuracy: 95
    }
  };

  const config = {
    title: 'Critical Infrastructure Coordination Dashboard',
    description: 'National-level coordination and protection of critical infrastructure sectors',
    kpis: [
      {
        title: 'System Resilience',
        value: `${data.infrastructureMetrics.resilience}%`,
        change: 3.2,
        trend: 'up' as const,
        icon: Shield,
        color: 'green'
      },
      {
        title: 'Threat Level',
        value: data.infrastructureMetrics.threatLevel.toUpperCase(),
        change: 0,
        trend: 'stable' as const,
        icon: AlertTriangle,
        color: 'orange'
      },
      {
        title: 'System Uptime',
        value: `${data.infrastructureMetrics.uptime}%`,
        change: 0.02,
        trend: 'up' as const,
        icon: Activity,
        color: 'blue'
      },
      {
        title: 'Critical Assets',
        value: data.infrastructureMetrics.criticalAssets.toLocaleString(),
        change: 2.5,
        trend: 'up' as const,
        icon: Lock,
        color: 'purple'
      }
    ],
    tabs: [
      {
        id: 'sector-overview',
        label: 'Sector Overview',
        icon: Globe,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Critical Infrastructure Sectors</h3>
              <div className="space-y-3">
                {data.sectorStatus.map((sector, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{sector.sector}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        sector.criticality === 'critical' ? 'bg-red-500 text-white' :
                        'bg-orange-500 text-white'
                      }`}>
                        {sector.criticality.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">Assets:</span>
                        <div className="font-medium">{sector.assets}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Health:</span>
                        <div className="font-medium">{sector.health}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Threats:</span>
                        <div className="font-medium text-red-500">{sector.threats}</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          sector.health >= 90 ? 'bg-green-500' :
                          sector.health >= 80 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${sector.health}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Threat Analysis Trends</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.threatAnalysis,
                dataKeys: ['date', 'value'],
                colors: ['#ef4444'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'interdependencies',
        label: 'Interdependencies',
        icon: Network,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Sector Interdependencies</h3>
              <div className="space-y-3">
                {data.interdependencies.map((dep, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{dep.from}</span>
                        <span className="text-gray-500">→</span>
                        <span className="font-medium">{dep.to}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        dep.status === 'stable' ? 'bg-green-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {dep.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Dependency Strength:</span>
                      <span className="font-medium">{dep.strength}%</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${dep.strength}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Resilience Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-green-500">{data.resilienceMetrics.redundancy}%</div>
                  <div className="text-sm text-gray-500 mt-1">Redundancy</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-blue-500">{data.resilienceMetrics.recovery}%</div>
                  <div className="text-sm text-gray-500 mt-1">Recovery</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-purple-500">{data.resilienceMetrics.resistance}%</div>
                  <div className="text-sm text-gray-500 mt-1">Resistance</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-orange-500">{data.resilienceMetrics.response}%</div>
                  <div className="text-sm text-gray-500 mt-1">Response</div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'coordination',
        label: 'Coordination Status',
        icon: Zap,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Coordination Activities</h3>
              <div className="space-y-3">
                {data.coordinationStatus.map((activity, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{activity.action}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        activity.status === 'active' ? 'bg-green-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {activity.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Effectiveness:</span>
                      <span className="font-medium">{activity.effectiveness}%</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${activity.effectiveness}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Sector Health Overview</h3>
              {renderChart({
                type: 'radar',
                title: '',
                data: data.sectorStatus.map(sector => ({
                  sector: sector.sector,
                  health: sector.health,
                  assets: sector.assets / 10, // Scale down for visualization
                  resilience: 85 + Math.random() * 10 // Mock resilience data
                })),
                dataKeys: ['sector', 'health', 'assets', 'resilience'],
                colors: ['#3b82f6', '#10b981', '#8b5cf6'],
                showLegend: true
              }, isDarkMode)}
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
              <h3 className="text-lg font-semibold mb-4">Infrastructure Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Systems Monitored</span>
                  <span className="font-bold">{data.infrastructureMetrics.systemsMonitored}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical Assets</span>
                  <span className="font-bold">{data.infrastructureMetrics.criticalAssets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Incidents Prevented</span>
                  <span className="font-bold text-green-500">{data.infrastructureMetrics.incidentsPreventable}</span>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">System Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">System Uptime</span>
                    <span className="text-blue-500 font-bold">{data.infrastructureMetrics.uptime}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.infrastructureMetrics.uptime}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Overall Resilience</span>
                    <span className="text-green-500 font-bold">{data.infrastructureMetrics.resilience}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.infrastructureMetrics.resilience}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Threat Summary</h3>
              <div className="space-y-3">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                  <div className={`text-2xl font-bold ${
                    data.infrastructureMetrics.threatLevel === 'elevated' ? 'text-orange-500' :
                    data.infrastructureMetrics.threatLevel === 'high' ? 'text-red-500' :
                    'text-yellow-500'
                  }`}>
                    {data.infrastructureMetrics.threatLevel.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Current Threat Level</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {data.sectorStatus.reduce((sum, sector) => sum + sector.threats, 0)}
                    </div>
                    <div className="text-xs text-gray-500">Active Threats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{data.sectorStatus.length}</div>
                    <div className="text-xs text-gray-500">Sectors Monitored</div>
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