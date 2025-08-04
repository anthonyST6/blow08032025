import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { telecomDataGenerators } from '../../utils/dashboard-data-generators';
import { Users, TrendingDown, DollarSign, Target, AlertTriangle, Award, BarChart3, Activity } from 'lucide-react';

export const CustomerChurnPreventionDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = telecomDataGenerators.churnPrevention();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'churn-prevention',
    name: 'Customer Churn Prevention',
    description: 'AI-powered prediction and prevention of customer churn',
    vertical: 'telecom',
    siaScores: {
      security: 91,
      integrity: 94,
      accuracy: 88
    }
  };

  const config = {
    title: 'Customer Churn Prevention Dashboard',
    description: 'Predictive analytics for identifying and preventing customer churn with targeted interventions',
    kpis: [
      {
        title: 'Churn Rate',
        value: `${data.churnMetrics.churnRate}%`,
        change: -12.5,
        trend: 'down' as const,
        icon: TrendingDown,
        color: 'green'
      },
      {
        title: 'Retention Rate',
        value: `${data.churnMetrics.retentionRate}%`,
        change: 2.3,
        trend: 'up' as const,
        icon: Users,
        color: 'blue'
      },
      {
        title: 'At-Risk Customers',
        value: (data.churnMetrics.atRiskCustomers / 1000).toFixed(1) + 'K',
        change: -8.7,
        trend: 'down' as const,
        icon: AlertTriangle,
        color: 'orange'
      },
      {
        title: 'Saved This Month',
        value: data.churnMetrics.savedThisMonth.toLocaleString(),
        change: 15.2,
        trend: 'up' as const,
        icon: Award,
        color: 'purple'
      }
    ],
    tabs: [
      {
        id: 'risk-analysis',
        label: 'Risk Analysis',
        icon: AlertTriangle,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Customer Risk Segments</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.riskSegments,
                dataKeys: ['segment', 'customers', 'churnProb'],
                colors: ['#3b82f6', '#ef4444'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Churn Rate Trends</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.churnTrends,
                dataKeys: ['date', 'value'],
                colors: ['#10b981'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'churn-reasons',
        label: 'Churn Reasons',
        icon: BarChart3,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Primary Churn Reasons</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: data.churnReasons.map(reason => ({
                  name: reason.reason,
                  value: reason.percentage
                })),
                dataKeys: ['value'],
                colors: CHART_COLORS,
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Reason Analysis</h3>
              <div className="space-y-3">
                {data.churnReasons.map((reason, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{reason.reason}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        reason.preventable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {reason.preventable ? 'PREVENTABLE' : 'NOT PREVENTABLE'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Impact:</span>
                      <span className="font-medium">{reason.percentage}%</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${reason.percentage}%` }}
                        ></div>
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
        id: 'interventions',
        label: 'Interventions',
        icon: Target,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Intervention Success Rates</h3>
              <div className="space-y-4">
                {Object.entries(data.interventionSuccess).map(([intervention, success], index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">
                        {intervention.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-2xl font-bold text-green-500">{success}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${success}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Customer Lifetime Value</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.customerLifetimeValue,
                dataKeys: ['segment', 'clv', 'retention'],
                colors: ['#8b5cf6', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'metrics',
        label: 'Key Metrics',
        icon: Activity,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Customer Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Customers</span>
                  <span className="font-bold">{(data.churnMetrics.totalCustomers / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">At Risk</span>
                  <span className="font-bold text-orange-500">{data.churnMetrics.atRiskCustomers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Customer Value</span>
                  <span className="font-bold">${data.churnMetrics.avgCustomerValue}</span>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Performance Indicators</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Churn Rate</span>
                    <span className="text-green-500 font-bold">{data.churnMetrics.churnRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${100 - data.churnMetrics.churnRate * 10}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Retention Rate</span>
                    <span className="text-blue-500 font-bold">{data.churnMetrics.retentionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.churnMetrics.retentionRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Intervention Impact</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-purple-500">{data.churnMetrics.savedThisMonth.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Customers Saved</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      ${((data.churnMetrics.savedThisMonth * data.churnMetrics.avgCustomerValue) / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-gray-500">Revenue Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">82%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
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