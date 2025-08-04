import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { pharmaDataGenerators } from '../../utils/dashboard-data-generators';
import { Users, Activity, TrendingUp, Calendar, MapPin, AlertCircle, BarChart3, Clock } from 'lucide-react';

export const ClinicalTrialOptimizationDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = pharmaDataGenerators.clinicalOptimization();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'clinical-trial-optimization',
    name: 'Clinical Trial Optimization',
    description: 'Optimizing clinical trials with VANGUARD',
    vertical: 'pharmaceutical',
    siaScores: {
      security: 96,
      integrity: 94,
      accuracy: 92
    }
  };

  const config = {
    title: 'Clinical Trial Optimization Dashboard',
    description: 'AI-powered optimization of clinical trial design, patient recruitment, and protocol management',
    kpis: [
      {
        title: 'Enrollment Rate',
        value: `${data.trialMetrics.enrollmentRate}%`,
        change: 8.5,
        trend: 'up' as const,
        icon: Users,
        color: 'blue'
      },
      {
        title: 'Retention Rate',
        value: `${data.trialMetrics.retentionRate}%`,
        change: 5.2,
        trend: 'up' as const,
        icon: Activity,
        color: 'green'
      },
      {
        title: 'Active Trials',
        value: data.trialMetrics.activeTrials.toLocaleString(),
        change: 12.3,
        trend: 'up' as const,
        icon: BarChart3,
        color: 'purple'
      },
      {
        title: 'Avg Recruitment Time',
        value: data.trialMetrics.avgRecruitmentTime,
        change: -15.7,
        trend: 'down' as const,
        icon: Clock,
        color: 'orange'
      }
    ],
    tabs: [
      {
        id: 'trial-overview',
        label: 'Trial Overview',
        icon: BarChart3,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Trial Phases Distribution</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.trialPhases,
                dataKeys: ['phase', 'trials', 'patients', 'completion'],
                colors: ['#3b82f6', '#10b981', '#f59e0b'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Enrollment Trends</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.enrollmentTrends,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'site-performance',
        label: 'Site Performance',
        icon: MapPin,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Top Performing Sites</h3>
              <div className="space-y-3">
                {data.sitePerformance.map((site, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{site.site}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        site.quality >= 90 ? 'bg-green-500 text-white' :
                        site.quality >= 85 ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {site.quality}% Quality
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Patients:</span>
                        <div className="font-medium">{site.patients.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Enrollment:</span>
                        <div className="font-medium">{site.enrollment}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <div className="font-medium text-green-500">Active</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Patient Retention</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.patientRetention,
                dataKeys: ['date', 'value'],
                colors: ['#10b981'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'protocol-optimization',
        label: 'Protocol Optimization',
        icon: Activity,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Protocol Optimization Impact</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Visit Reduction</span>
                    <span className="text-green-500 font-bold">
                      {data.protocolOptimization.originalVisits} → {data.protocolOptimization.optimizedVisits}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round((data.protocolOptimization.originalVisits - data.protocolOptimization.optimizedVisits) / data.protocolOptimization.originalVisits * 100)}% reduction
                  </div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Patient Burden</span>
                    <span className="text-green-500 font-bold">-{data.protocolOptimization.patientBurdenReduction}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${100 - data.protocolOptimization.patientBurdenReduction}%` }}></div>
                  </div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cost Savings</span>
                    <span className="text-green-500 font-bold">${data.protocolOptimization.costSavings}M</span>
                  </div>
                  <div className="text-xs text-gray-500">Per trial average</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Time Reduction</span>
                    <span className="text-green-500 font-bold">{data.protocolOptimization.timeReduction}</span>
                  </div>
                  <div className="text-xs text-gray-500">Faster completion</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Adverse Events Distribution</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: data.adverseEvents.map(event => ({
                  name: event.severity,
                  value: event.count
                })),
                dataKeys: ['value'],
                colors: ['#10b981', '#f59e0b', '#ef4444', '#dc2626'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'metrics',
        label: 'Key Metrics',
        icon: TrendingUp,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Trial Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Patients</span>
                  <span className="font-bold">{data.trialMetrics.totalPatients.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Protocol Deviations</span>
                  <span className="font-bold text-yellow-500">{data.trialMetrics.protocolDeviations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Recruitment</span>
                  <span className="font-bold">{data.trialMetrics.avgRecruitmentTime}</span>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Success Indicators</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Enrollment Rate</span>
                    <span className="text-green-500 font-bold">{data.trialMetrics.enrollmentRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.trialMetrics.enrollmentRate}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Retention Rate</span>
                    <span className="text-blue-500 font-bold">{data.trialMetrics.retentionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.trialMetrics.retentionRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Risk Monitoring</h3>
              <div className="space-y-3">
                {data.adverseEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{event.severity}</span>
                    <div className="flex items-center">
                      <span className="font-bold mr-2">{event.count}</span>
                      <span className="text-xs text-gray-500">({event.percentage}%)</span>
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