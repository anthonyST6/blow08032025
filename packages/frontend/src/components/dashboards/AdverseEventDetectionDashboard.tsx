import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { pharmaDataGenerators } from '../../utils/dashboard-data-generators';
import { AlertTriangle, Shield, TrendingUp, Clock, Database, Activity, FileSearch, Bell } from 'lucide-react';

export const AdverseEventDetectionDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = pharmaDataGenerators.adverseDetection();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'adverse-event-detection',
    name: 'Adverse Event Detection',
    description: 'Real-time monitoring and detection of adverse drug reactions',
    vertical: 'pharmaceutical',
    siaScores: {
      security: 98,
      integrity: 96,
      accuracy: 93
    }
  };

  const config = {
    title: 'Adverse Event Detection Dashboard',
    description: 'AI-powered real-time monitoring and early detection of adverse drug reactions and safety signals',
    kpis: [
      {
        title: 'Signals Detected',
        value: data.detectionMetrics.signalsDetected.toLocaleString(),
        change: 12.5,
        trend: 'up' as const,
        icon: AlertTriangle,
        color: 'red'
      },
      {
        title: 'Confirmed ADRs',
        value: data.detectionMetrics.confirmedADRs.toLocaleString(),
        change: -8.3,
        trend: 'down' as const,
        icon: Shield,
        color: 'green'
      },
      {
        title: 'Detection Time',
        value: data.detectionMetrics.avgDetectionTime,
        change: -22.5,
        trend: 'down' as const,
        icon: Clock,
        color: 'blue'
      },
      {
        title: 'Prevented Harms',
        value: data.detectionMetrics.preventedHarms.toLocaleString(),
        change: 15.7,
        trend: 'up' as const,
        icon: Activity,
        color: 'purple'
      }
    ],
    tabs: [
      {
        id: 'signal-overview',
        label: 'Signal Overview',
        icon: AlertTriangle,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Signal Types Distribution</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.signalTypes,
                dataKeys: ['type', 'signals', 'confirmed'],
                colors: ['#ef4444', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Detection Trends</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.detectionTrends,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'drug-safety',
        label: 'Drug Safety Profile',
        icon: Shield,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Drug Risk Assessment</h3>
              <div className="space-y-3">
                {data.drugSafetyProfile.map((drug, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{drug.drug}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        drug.status === 'warning' ? 'bg-red-500 text-white' :
                        drug.status === 'investigation' ? 'bg-yellow-500 text-white' :
                        drug.status === 'monitoring' ? 'bg-blue-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {drug.status.charAt(0).toUpperCase() + drug.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Reports:</span>
                        <div className="font-medium">{drug.reports.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Risk Score:</span>
                        <div className={`font-medium ${
                          drug.riskScore >= 60 ? 'text-red-500' :
                          drug.riskScore >= 40 ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>{drug.riskScore}/100</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Signal Severity Analysis</h3>
              <div className="space-y-4">
                {data.signalTypes.map((signal, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{signal.type}</span>
                      <span className={`text-sm font-bold ${
                        signal.severity === 'critical' ? 'text-red-500' :
                        signal.severity === 'high' ? 'text-orange-500' :
                        'text-yellow-500'
                      }`}>{signal.severity.toUpperCase()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          signal.severity === 'critical' ? 'bg-red-500' :
                          signal.severity === 'high' ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`} 
                        style={{ width: `${(signal.confirmed / signal.signals) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {signal.confirmed} confirmed / {signal.signals} signals
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'reporting-sources',
        label: 'Reporting Sources',
        icon: Database,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Report Sources</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: data.reportingSources.map(source => ({
                  name: source.source,
                  value: source.reports
                })),
                dataKeys: ['value'],
                colors: CHART_COLORS,
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Source Quality Metrics</h3>
              <div className="space-y-3">
                {data.reportingSources.map((source, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{source.source}</span>
                      <span className="text-sm font-bold">{source.quality}% Quality</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${source.quality}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {source.reports.toLocaleString()} reports
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'compliance',
        label: 'Regulatory Compliance',
        icon: FileSearch,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-green-500">{data.regulatoryCompliance.fdaReporting}%</div>
                  <div className="text-sm text-gray-500 mt-1">FDA Reporting</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-blue-500">{data.regulatoryCompliance.emaCompliance}%</div>
                  <div className="text-sm text-gray-500 mt-1">EMA Compliance</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-purple-500">{data.regulatoryCompliance.whoReporting}%</div>
                  <div className="text-sm text-gray-500 mt-1">WHO Reporting</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Detection Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Events Monitored</span>
                  <span className="font-bold">{data.detectionMetrics.eventsMonitored.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">False Positive Rate</span>
                  <span className="font-bold text-yellow-500">{data.detectionMetrics.falsePositiveRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Report Time</span>
                  <span className="font-bold">{data.regulatoryCompliance.avgReportTime}</span>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Detection Accuracy</span>
                    <span className="text-green-500 font-bold">
                      {(100 - data.detectionMetrics.falsePositiveRate).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${100 - data.detectionMetrics.falsePositiveRate}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Response Time</span>
                    <span className="text-blue-500 font-bold">Excellent</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
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