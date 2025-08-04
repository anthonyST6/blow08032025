import React from 'react';
import DashboardTemplate, { ChartConfig, renderChart, CHART_COLORS } from './DashboardTemplate';
import { logisticsDataGenerators } from '../../utils/dashboard-data-generators';
import { Truck, Wrench, Battery, AlertTriangle, TrendingUp, DollarSign, Users, Activity } from 'lucide-react';

export const PredictiveFleetMaintenanceDashboard: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const data = logisticsDataGenerators.fleetManagement();

  // Mock use case for now - this should come from props or context
  const mockUseCase = {
    id: 'fleet-management',
    name: 'Predictive Fleet Maintenance',
    description: 'AI-powered predictive maintenance for fleet optimization',
    vertical: 'logistics',
    siaScores: {
      security: 87,
      integrity: 91,
      accuracy: 93
    }
  };

  const config = {
    title: 'Predictive Fleet Maintenance Dashboard',
    description: 'AI-driven predictive maintenance to maximize fleet uptime and reduce costs',
    kpis: [
      {
        title: 'Fleet Uptime',
        value: `${data.fleetMetrics.uptime}%`,
        change: 1.8,
        trend: 'up' as const,
        icon: Activity,
        color: 'green'
      },
      {
        title: 'Active Vehicles',
        value: `${data.fleetMetrics.activeVehicles}/${data.fleetMetrics.totalVehicles}`,
        change: 3.2,
        trend: 'up' as const,
        icon: Truck,
        color: 'blue'
      },
      {
        title: 'Maintenance Due',
        value: data.fleetMetrics.maintenanceDue.toString(),
        change: -12.5,
        trend: 'down' as const,
        icon: Wrench,
        color: 'yellow'
      },
      {
        title: 'Avg Fuel Efficiency',
        value: `${data.fleetMetrics.avgFuelEfficiency} MPG`,
        change: 2.1,
        trend: 'up' as const,
        icon: Battery,
        color: 'purple'
      }
    ],
    tabs: [
      {
        id: 'vehicle-health',
        label: 'Vehicle Health',
        icon: Activity,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Fleet Health Status</h3>
              <div className="space-y-4">
                {data.vehicleHealth.map((vehicle, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{vehicle.vehicle}</span>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          vehicle.health >= 90 ? 'bg-green-500' :
                          vehicle.health >= 70 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-bold">{vehicle.health}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Next Service:</span>
                        <div className={`font-medium ${
                          vehicle.nextService === 'Overdue' ? 'text-red-500' : ''
                        }`}>{vehicle.nextService}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Issues:</span>
                        <div className={`font-medium ${
                          vehicle.issues > 0 ? 'text-yellow-500' : 'text-green-500'
                        }`}>{vehicle.issues}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <div className="font-medium">
                          {vehicle.health >= 90 ? 'Excellent' :
                           vehicle.health >= 70 ? 'Good' :
                           'Needs Attention'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Maintenance Predictions (90 Days)</h3>
              {renderChart({
                type: 'area',
                title: '',
                data: data.maintenancePredictions,
                dataKeys: ['date', 'value'],
                colors: ['#f59e0b'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'cost-analysis',
        label: 'Cost Analysis',
        icon: DollarSign,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Operating Cost Breakdown</h3>
              {renderChart({
                type: 'pie',
                title: '',
                data: data.costBreakdown,
                dataKeys: ['cost'],
                colors: CHART_COLORS,
                showLegend: true
              }, isDarkMode)}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Fuel Consumption Trends</h3>
              {renderChart({
                type: 'line',
                title: '',
                data: data.fuelConsumption,
                dataKeys: ['date', 'value'],
                colors: ['#8b5cf6'],
                showLegend: false
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'driver-performance',
        label: 'Driver Performance',
        icon: Users,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Top Drivers</h3>
              <div className="space-y-4">
                {data.driverPerformance.map((driver, index) => (
                  <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{driver.driver}</span>
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-green-500">{driver.score}/100</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Trips:</span>
                        <div className="font-medium">{driver.trips}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Incidents:</span>
                        <div className={`font-medium ${
                          driver.incidents === 0 ? 'text-green-500' : 'text-yellow-500'
                        }`}>{driver.incidents}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Efficiency:</span>
                        <div className="font-medium">{driver.efficiency}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Rating:</span>
                        <div className="font-medium">⭐ 4.{Math.floor(driver.score / 10)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              {renderChart({
                type: 'radar',
                title: '',
                data: data.driverPerformance.map(driver => ({
                  driver: driver.driver.split(' ')[0],
                  score: driver.score,
                  efficiency: driver.efficiency,
                  safety: 100 - (driver.incidents * 10)
                })),
                dataKeys: ['driver', 'score', 'efficiency', 'safety'],
                colors: ['#3b82f6', '#10b981', '#f59e0b'],
                showLegend: true
              }, isDarkMode)}
            </div>
          </div>
        )
      },
      {
        id: 'predictive-insights',
        label: 'Predictive Insights',
        icon: AlertTriangle,
        content: () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Maintenance Alerts</h3>
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-red-900/20' : 'bg-red-100'} border border-red-500 rounded-lg p-4`}>
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-medium text-red-500">Critical</span>
                  </div>
                  <p className="text-sm">Fleet-004: Engine diagnostics showing anomalies. Schedule immediate inspection.</p>
                </div>
                <div className={`${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-100'} border border-yellow-500 rounded-lg p-4`}>
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="font-medium text-yellow-500">Warning</span>
                  </div>
                  <p className="text-sm">Fleet-002: Brake pad wear at 75%. Schedule replacement within 500 miles.</p>
                </div>
                <div className={`${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'} border border-blue-500 rounded-lg p-4`}>
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium text-blue-500">Info</span>
                  </div>
                  <p className="text-sm">3 vehicles due for routine oil change in the next 7 days.</p>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Fleet Statistics</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-blue-500">{data.fleetMetrics.avgMileage.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Avg Mileage</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-green-500">98.5%</div>
                  <div className="text-sm text-gray-500 mt-1">Maintenance Compliance</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-purple-500">$2.3M</div>
                  <div className="text-sm text-gray-500 mt-1">Annual Savings</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <div className="text-3xl font-bold text-yellow-500">15%</div>
                  <div className="text-sm text-gray-500 mt-1">Downtime Reduction</div>
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