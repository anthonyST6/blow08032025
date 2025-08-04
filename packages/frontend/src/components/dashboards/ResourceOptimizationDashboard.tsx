import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { governmentDataGenerators } from '../../utils/dashboard-data-generators';
import { DollarSign, TrendingUp, BarChart3, Target, Briefcase, PieChart, Activity, Settings } from 'lucide-react';

export const ResourceOptimizationDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = governmentDataGenerators.resourceOptimization();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'resource-optimization',
    name: 'Resource Optimization',
    description: 'AI-driven optimization of government resources and budget allocation',
    vertical: 'government',
    siaScores: {
      security: 90,
      integrity: 93,
      accuracy: 91
    }
  };

  const config = {
    title: 'Resource Optimization Dashboard',
    description: 'Intelligent allocation and optimization of government resources for maximum efficiency and impact',
    kpis: [
      {
        title: 'Resource Utilization',
        value: `${data.resourceMetrics.utilization}%`,
        change: 6.8,
        trend: 'up' as const,
        icon: Activity,
        color: 'blue'
      },
      {
        title: 'Efficiency Score',
        value: `${data.resourceMetrics.efficiency}%`,
        change: 4.2,
        trend: 'up' as const,
        icon: TrendingUp,
        color: 'green'
      },
      {
        title: 'Cost Savings',
        value: `$${data.resourceMetrics.costSavings}M`,
        change: 15.3,
        trend: 'up' as const,
        icon: DollarSign,
        color: 'purple'
      },
      {
        title: 'On-Time Delivery',
        value: `${data.resourceMetrics.onTimeDelivery}%`,
        change: 3.5,
        trend: 'up' as const,
        icon: Target,
        color: 'orange'
      }
    ],
    tabs: [
      {
        id: 'budget-overview',
        label: 'Budget Overview',
        icon: DollarSign,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Department Budget Allocation</h3>
              {renderChart({
                type: 'bar',
                title: '',
                data: data.departmentAllocation,
                dataKeys: ['department', 'budget', 'utilization'],
                colors: ['#3b82f6', '#10b981'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Budget Trends (12 Months)</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.budgetTrends,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'project-status',
        label: 'Project Status',
        icon: Briefcase,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Project Status Distribution</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: data.projectStatus,
                dataKeys: ['count'],
                colors: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
              <div className="space-y-3">
                {data.departmentAllocation.map((dept, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{dept.department}</span>
                      <span className="text-sm font-bold">{dept.projects} projects</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">Budget:</span>
                        <div className="font-medium">${dept.budget}M</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Utilization:</span>
                        <div className="font-medium">{dept.utilization}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${dept.utilization}%` }}
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
        id: 'efficiency',
        label: 'Efficiency Analysis',
        icon: Activity,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Efficiency Gains Over Time</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.efficiencyGains,
                dataKeys: ['date', 'value'],
                colors: ['#10b981'],
                showLegend: false
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Optimization Recommendations</h3>
              <div className="space-y-3">
                {data.resourceRecommendations.map((rec, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{rec.action}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.effort === 'low' ? 'bg-green-500 text-white' :
                        rec.effort === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {rec.effort.toUpperCase()} EFFORT
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Impact:</span>
                        <div className="font-medium">+{rec.impact}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Savings:</span>
                        <div className="font-medium text-green-500">${rec.savings}M</div>
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
        id: 'metrics',
        label: 'Key Metrics',
        icon: BarChart3,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Resource Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Budget</span>
                  <span className="font-bold">${data.resourceMetrics.totalBudget}M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Projects</span>
                  <span className="font-bold">{data.resourceMetrics.projectsActive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cost Savings YTD</span>
                  <span className="font-bold text-green-500">${data.resourceMetrics.costSavings}M</span>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Performance Indicators</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Utilization Rate</span>
                    <span className="text-blue-500 font-bold">{data.resourceMetrics.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.resourceMetrics.utilization}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Efficiency Score</span>
                    <span className="text-green-500 font-bold">{data.resourceMetrics.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.resourceMetrics.efficiency}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Project Summary</h3>
              <div className="space-y-3">
                {data.projectStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        status.status === 'On Track' ? 'bg-green-500' :
                        status.status === 'At Risk' ? 'bg-yellow-500' :
                        status.status === 'Delayed' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                      <span className="text-sm">{status.status}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{status.count}</div>
                      <div className="text-xs text-gray-500">{status.percentage}%</div>
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