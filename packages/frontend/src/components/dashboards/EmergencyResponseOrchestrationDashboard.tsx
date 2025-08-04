import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { governmentDataGenerators } from '../../utils/dashboard-data-generators';
import { AlertTriangle, Clock, Users, Radio, Shield, Activity, MapPin, Bell } from 'lucide-react';

export const EmergencyResponseOrchestrationDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = governmentDataGenerators.emergencyResponse();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'emergency-response-orchestration',
    name: 'Coordinated Emergency Response Orchestration',
    description: 'AI-powered multi-agency emergency response coordination',
    vertical: 'government',
    siaScores: {
      security: 98,
      integrity: 97,
      accuracy: 94
    }
  };

  const config = {
    title: 'Emergency Response Orchestration Dashboard',
    description: 'Real-time coordination and orchestration of multi-agency emergency response operations',
    kpis: [
      {
        title: 'Active Incidents',
        value: data.responseMetrics.activeIncidents.toLocaleString(),
        change: -15.2,
        trend: 'down' as const,
        icon: AlertTriangle,
        color: 'red'
      },
      {
        title: 'Avg Response Time',
        value: data.responseMetrics.avgResponseTime,
        change: -18.5,
        trend: 'down' as const,
        icon: Clock,
        color: 'green'
      },
      {
        title: 'Coordination Score',
        value: `${data.responseMetrics.coordinationScore}%`,
        change: 6.3,
        trend: 'up' as const,
        icon: Radio,
        color: 'blue'
      },
      {
        title: 'Resolution Rate',
        value: `${data.responseMetrics.resolutionRate}%`,
        change: 4.8,
        trend: 'up' as const,
        icon: Shield,
        color: 'purple'
      }
    ],
    tabs: [
      {
        id: 'incident-status',
        label: 'Incident Status',
        icon: AlertTriangle,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Active Incidents by Type</h3>
              <div className="space-y-3">
                {data.incidentStatus.map((incident, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{incident.type}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          incident.active > 10 ? 'bg-red-500 text-white' :
                          incident.active > 5 ? 'bg-yellow-500 text-white' :
                          'bg-green-500 text-white'
                        }`}>
                          {incident.active} ACTIVE
                        </span>
                        <span className="text-sm font-bold">ETA: {incident.eta}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {incident.responding} units responding
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(incident.responding / (incident.responding + incident.active)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Resource Deployment Trends</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.resourceDeployment,
                dataKeys: ['date', 'value'],
                colors: ['#ef4444'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'coordination',
        label: 'Agency Coordination',
        icon: Radio,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Multi-Agency Coordination Status</h3>
              <div className="space-y-3">
                {data.coordinationMatrix.map((agency, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{agency.agency}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        agency.status === 'active' ? 'bg-green-500 text-white' :
                        agency.status === 'standby' ? 'bg-yellow-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {agency.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Units:</span>
                        <div className="font-medium">{agency.units}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Readiness:</span>
                        <div className="font-medium">{agency.readiness}%</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            agency.readiness >= 90 ? 'bg-green-500' :
                            agency.readiness >= 70 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${agency.readiness}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Impact Assessment</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-500">
                        {(data.impactAssessment.peopleAffected / 1000).toFixed(1)}K
                      </div>
                      <div className="text-sm text-gray-500 mt-1">People Affected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-500">{data.impactAssessment.areasImpacted}</div>
                      <div className="text-sm text-gray-500 mt-1">Areas Impacted</div>
                    </div>
                  </div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Estimated Duration</span>
                    <span className="font-bold">{data.impactAssessment.estimatedDuration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Severity Level</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      data.impactAssessment.severityLevel === 'critical' ? 'bg-red-500 text-white' :
                      data.impactAssessment.severityLevel === 'high' ? 'bg-orange-500 text-white' :
                      data.impactAssessment.severityLevel === 'moderate' ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {data.impactAssessment.severityLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'communication',
        label: 'Public Communication',
        icon: Bell,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Alert Distribution Channels</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: data.publicCommunication.channels.map((channel, index) => ({
                  name: channel,
                  value: [25, 30, 20, 15, 10][index] // Mock distribution
                })),
                dataKeys: ['value'],
                colors: CHART_COLORS,
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Communication Metrics</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Alerts Sent</span>
                    <span className="text-2xl font-bold">{data.publicCommunication.alertsSent.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500">Across all channels</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                    <div className="text-xl font-bold text-green-500">{data.publicCommunication.reachRate}%</div>
                    <div className="text-xs text-gray-500">Reach Rate</div>
                  </div>
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                    <div className="text-xl font-bold text-blue-500">{data.publicCommunication.acknowledgment}%</div>
                    <div className="text-xs text-gray-500">Acknowledgment</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Public Alerted</span>
                    <span className="font-bold">{data.responseMetrics.publicAlerted.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resources Deployed</span>
                    <span className="font-bold">{data.responseMetrics.resourcesDeployed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'metrics',
        label: 'Response Metrics',
        icon: Activity,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Response Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Incidents</span>
                  <span className="font-bold text-red-500">{data.responseMetrics.activeIncidents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Resources Deployed</span>
                  <span className="font-bold">{data.responseMetrics.resourcesDeployed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Response Time</span>
                  <span className="font-bold text-green-500">{data.responseMetrics.avgResponseTime}</span>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Coordination Effectiveness</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Coordination Score</span>
                    <span className="text-blue-500 font-bold">{data.responseMetrics.coordinationScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.responseMetrics.coordinationScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Resolution Rate</span>
                    <span className="text-purple-500 font-bold">{data.responseMetrics.resolutionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${data.responseMetrics.resolutionRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Agency Summary</h3>
              <div className="space-y-2">
                {data.coordinationMatrix.slice(0, 3).map((agency, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{agency.agency}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{agency.units} units</span>
                      <div className={`w-2 h-2 rounded-full ${
                        agency.status === 'active' ? 'bg-green-500' :
                        agency.status === 'standby' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
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