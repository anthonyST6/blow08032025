import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { governmentDataGenerators } from '../../utils/dashboard-data-generators';
import { Shield, Clock, TrendingDown, MapPin, AlertTriangle, Users, Activity, BarChart3 } from 'lucide-react';

export const PublicSafetyAnalyticsDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = governmentDataGenerators.publicSafety();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'public-safety',
    name: 'Public Safety Analytics',
    description: 'AI-powered crime prediction and resource optimization',
    vertical: 'government',
    siaScores: {
      security: 96,
      integrity: 94,
      accuracy: 89
    }
  };

  const config = {
    title: 'Public Safety Analytics Dashboard',
    description: 'Predictive analytics and VANGUARD for enhanced public safety and resource deployment',
    kpis: [
      {
        title: 'Response Time',
        value: data.safetyMetrics.responseTime,
        change: -12.5,
        trend: 'down' as const,
        icon: Clock,
        color: 'green'
      },
      {
        title: 'Crime Reduction',
        value: `${data.safetyMetrics.crimeReduction}%`,
        change: 8.3,
        trend: 'up' as const,
        icon: TrendingDown,
        color: 'blue'
      },
      {
        title: 'Clearance Rate',
        value: `${data.safetyMetrics.clearanceRate}%`,
        change: 5.7,
        trend: 'up' as const,
        icon: Shield,
        color: 'purple'
      },
      {
        title: 'Predictive Accuracy',
        value: `${data.safetyMetrics.predictiveAccuracy}%`,
        change: 3.2,
        trend: 'up' as const,
        icon: Activity,
        color: 'orange'
      }
    ],
    tabs: [
      {
        id: 'incident-overview',
        label: 'Incident Overview',
        icon: AlertTriangle,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Incident Types Distribution</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.incidentTypes,
                dataKeys: ['type', 'count'],
                colors: ['#ef4444'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Crime Trends (365 Days)</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.crimeTrends.slice(-90), // Show last 90 days for clarity
                dataKeys: ['date', 'value'],
                colors: ['#3b82f6'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'hotspot-analysis',
        label: 'Hotspot Analysis',
        icon: MapPin,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Risk Zones</h3>
              <div className="space-y-3">
                {data.hotspotAnalysis.map((zone, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{zone.zone}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        zone.risk >= 70 ? 'bg-red-500 text-white' :
                        zone.risk >= 50 ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        Risk: {zone.risk}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Incidents:</span>
                        <div className="font-medium">{zone.incidents}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Patrols:</span>
                        <div className="font-medium">{zone.patrols}</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            zone.risk >= 70 ? 'bg-red-500' :
                            zone.risk >= 50 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${zone.risk}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Predictive Alerts</h3>
              <div className="space-y-3">
                {data.predictiveAlerts.map((alert, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{alert.location}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        alert.risk === 'high' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {alert.risk.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Time Window:</span>
                        <div className="font-medium">{alert.time}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <div className="font-medium">{alert.confidence}%</div>
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
        id: 'resource-deployment',
        label: 'Resource Deployment',
        icon: Users,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Resource Allocation</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: Object.entries(data.resourceAllocation).map(([key, value]) => ({
                  name: key.charAt(0).toUpperCase() + key.slice(1),
                  value
                })),
                dataKeys: ['value'],
                colors: CHART_COLORS,
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Response Time by Incident Type</h3>
              <div className="space-y-3">
                {data.incidentTypes.map((incident, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{incident.type}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          incident.priority === 'critical' ? 'bg-red-500 text-white' :
                          incident.priority === 'high' ? 'bg-orange-500 text-white' :
                          incident.priority === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-green-500 text-white'
                        }`}>
                          {incident.priority.toUpperCase()}
                        </span>
                        <span className="font-bold text-sm">{incident.response}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {incident.count} incidents
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
              <h3 className="text-lg font-semibold mb-4">Safety Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Incidents</span>
                  <span className="font-bold">{data.safetyMetrics.totalIncidents.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Officers Deployed</span>
                  <span className="font-bold">{data.safetyMetrics.officersDeployed.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Response</span>
                  <span className="font-bold text-green-500">{data.safetyMetrics.responseTime}</span>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Performance Indicators</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Clearance Rate</span>
                    <span className="text-blue-500 font-bold">{data.safetyMetrics.clearanceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.safetyMetrics.clearanceRate}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Predictive Accuracy</span>
                    <span className="text-purple-500 font-bold">{data.safetyMetrics.predictiveAccuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${data.safetyMetrics.predictiveAccuracy}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Impact Summary</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-green-500">-{data.safetyMetrics.crimeReduction}%</div>
                  <div className="text-sm text-gray-500 mt-1">Crime Reduction</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                    <div className="text-xl font-bold">{data.hotspotAnalysis.length}</div>
                    <div className="text-xs text-gray-500">Zones Monitored</div>
                  </div>
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                    <div className="text-xl font-bold">{data.predictiveAlerts.length}</div>
                    <div className="text-xs text-gray-500">Active Alerts</div>
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