import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { telecomDataGenerators } from '../../utils/dashboard-data-generators';
import { Shield, AlertTriangle, Lock, Activity, Globe, TrendingUp, BarChart3, Zap } from 'lucide-react';

export const NetworkSecurityMonitoringDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = telecomDataGenerators.networkSecurity();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'network-security',
    name: 'Network Security Monitoring',
    description: 'AI-powered network security threat detection and response',
    vertical: 'telecom',
    siaScores: {
      security: 98,
      integrity: 96,
      accuracy: 92
    }
  };

  const config = {
    title: 'Network Security Monitoring Dashboard',
    description: 'Real-time AI-driven network security monitoring and threat response system',
    kpis: [
      {
        title: 'Security Score',
        value: `${data.securityMetrics.securityScore}%`,
        change: 2.5,
        trend: 'up' as const,
        icon: Shield,
        color: 'green'
      },
      {
        title: 'Threats Blocked',
        value: data.securityMetrics.threatsBlocked.toLocaleString(),
        change: 15.3,
        trend: 'up' as const,
        icon: Lock,
        color: 'blue'
      },
      {
        title: 'Avg Response Time',
        value: data.securityMetrics.avgResponseTime,
        change: -12.7,
        trend: 'down' as const,
        icon: Activity,
        color: 'purple'
      },
      {
        title: 'Incidents Today',
        value: data.securityMetrics.incidentsToday.toLocaleString(),
        change: -8.5,
        trend: 'down' as const,
        icon: AlertTriangle,
        color: 'orange'
      }
    ],
    tabs: [
      {
        id: 'threat-overview',
        label: 'Threat Overview',
        icon: AlertTriangle,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Threat Types Distribution</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.threatTypes,
                dataKeys: ['type', 'count', 'blocked'],
                colors: ['#ef4444', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Security Trends (30 Days)</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.securityTrends,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'network-zones',
        label: 'Network Zones',
        icon: Globe,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Zone Security Status</h3>
              <div className="space-y-3">
                {data.networkZones.map((zone, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{zone.zone}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        zone.security >= 95 ? 'bg-green-500 text-white' :
                        zone.security >= 90 ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {zone.security}% SECURE
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">Vulnerabilities:</span>
                        <div className={`font-medium ${
                          zone.vulnerabilities === 0 ? 'text-green-500' :
                          zone.vulnerabilities <= 5 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>{zone.vulnerabilities}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Scan:</span>
                        <div className="font-medium">{zone.lastScan}</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          zone.security >= 95 ? 'bg-green-500' :
                          zone.security >= 90 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${zone.security}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Threat Severity Analysis</h3>
              <div className="space-y-3">
                {data.threatTypes.map((threat, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{threat.type}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        threat.severity === 'critical' ? 'bg-red-500 text-white' :
                        threat.severity === 'high' ? 'bg-orange-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {threat.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Block Rate:</span>
                      <span className="font-medium text-green-500">{threat.blocked}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'incident-response',
        label: 'Incident Response',
        icon: Zap,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Response Time Metrics</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Detection Time</span>
                    <span className="text-2xl font-bold text-green-500">{data.incidentResponse.avgDetectionTime}</span>
                  </div>
                  <div className="text-xs text-gray-500">Average time to detect threats</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Containment Time</span>
                    <span className="text-2xl font-bold text-blue-500">{data.incidentResponse.avgContainmentTime}</span>
                  </div>
                  <div className="text-xs text-gray-500">Average time to contain threats</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Resolution Time</span>
                    <span className="text-2xl font-bold text-purple-500">{data.incidentResponse.avgResolutionTime}</span>
                  </div>
                  <div className="text-xs text-gray-500">Average time to fully resolve</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
              <div className="space-y-3">
                {Object.entries(data.complianceStatus).map(([standard, score], index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium uppercase">{standard}</span>
                      <span className="font-bold">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${score}%` }}
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
        id: 'metrics',
        label: 'Key Metrics',
        icon: BarChart3,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Security Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Threats Detected</span>
                  <span className="font-bold">{data.securityMetrics.threatsDetected.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">False Positives</span>
                  <span className="font-bold text-yellow-500">{data.securityMetrics.falsePositives}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Automated Responses</span>
                  <span className="font-bold">{data.incidentResponse.automatedResponses}%</span>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Security Score</span>
                    <span className="text-green-500 font-bold">{data.securityMetrics.securityScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.securityMetrics.securityScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Block Success Rate</span>
                    <span className="text-blue-500 font-bold">
                      {((data.securityMetrics.threatsBlocked / data.securityMetrics.threatsDetected) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(data.securityMetrics.threatsBlocked / data.securityMetrics.threatsDetected) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-orange-500">{data.securityMetrics.incidentsToday}</div>
                  <div className="text-sm text-gray-500 mt-1">Security Incidents</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-500">
                      {data.securityMetrics.threatsBlocked}
                    </div>
                    <div className="text-xs text-gray-500">Blocked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-500">
                      {data.securityMetrics.falsePositives}
                    </div>
                    <div className="text-xs text-gray-500">False Positives</div>
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