import React from 'react';
import {
  MapPin,
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  PieChart,
  Activity,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';
import DashboardTemplate, {
  DashboardConfig,
  ChartConfig,
  renderChart,
  CHART_COLORS
} from '../../components/dashboards/DashboardTemplate';
import { UseCase } from '../../config/verticals';
import { energyDataGenerators } from '../../utils/dashboard-data-generators';
import { motion } from 'framer-motion';

interface OilfieldLandLeaseDashboardProps {
  useCase: UseCase;
}

const OilfieldLandLeaseDashboard: React.FC<OilfieldLandLeaseDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = energyDataGenerators.oilfieldLandLease();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Lease Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Lease Status Distribution</h3>
          {renderChart({
            type: 'pie',
            title: 'Lease Status',
            data: data.leasesByStatus,
            dataKeys: ['count'],
            colors: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'],
            height: 300,
            showLegend: true
          }, isDarkMode)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
          {renderChart({
            type: 'bar',
            title: 'Leases by Region',
            data: data.geographicDistribution,
            dataKeys: ['region', 'leases', 'production'],
            colors: ['#3B82F6', '#10B981'],
            height: 300,
            showLegend: true
          }, isDarkMode)}
        </motion.div>
      </div>

      {/* Expiration Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Lease Expiration Timeline</h3>
        {renderChart({
          type: 'area',
          title: 'Upcoming Expirations',
          data: data.expirationTimeline,
          dataKeys: ['date', 'value'],
          colors: ['#F59E0B'],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Compliance Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Compliance Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.complianceStatus.compliant}</p>
            <p className="text-sm text-gray-500">Compliant</p>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.complianceStatus.pendingReview}</p>
            <p className="text-sm text-gray-500">Pending Review</p>
          </div>
          <div className="text-center p-4 bg-red-500/10 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.complianceStatus.nonCompliant}</p>
            <p className="text-sm text-gray-500">Non-Compliant</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.complianceStatus.requiresAction}</p>
            <p className="text-sm text-gray-500">Action Required</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Financial Analysis Tab
  const renderFinancialTab = () => (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Monthly Revenue</h4>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-500">${data.leaseMetrics.monthlyRevenue}M</p>
          <p className="text-sm text-gray-500 mt-2">+12.3% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Yearly Revenue</h4>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-500">${data.leaseMetrics.yearlyRevenue}M</p>
          <p className="text-sm text-gray-500 mt-2">Projected: $58.2M</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Avg Royalty Rate</h4>
            <Activity className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-500">{data.leaseMetrics.averageRoyaltyRate}%</p>
          <p className="text-sm text-gray-500 mt-2">Industry avg: 16.2%</p>
        </motion.div>
      </div>

      {/* Royalty Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Royalty Rate Trends</h3>
        {renderChart({
          type: 'line',
          title: 'Average Royalty Rate Over Time',
          data: data.royaltyTrends,
          dataKeys: ['date', 'value'],
          colors: ['#8B5CF6'],
          height: 300
        }, isDarkMode)}
      </motion.div>

      {/* Production Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Production by Lease</h3>
        {renderChart({
          type: 'area',
          title: 'Daily Production (BOE)',
          data: data.productionByLease,
          dataKeys: ['date', 'value'],
          colors: ['#10B981'],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Risk Management Tab
  const renderRiskTab = () => (
    <div className="space-y-6">
      {/* Expiring Leases Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg border-l-4 border-yellow-500`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Lease Expiration Alerts
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-500/10 rounded-lg">
            <p className="text-sm text-gray-500">Expiring in 30 days</p>
            <p className="text-2xl font-bold text-red-500">{data.leaseMetrics.expiringIn30Days} leases</p>
            <p className="text-sm mt-2">Potential revenue impact: $1.2M/month</p>
          </div>
          <div className="p-4 bg-yellow-500/10 rounded-lg">
            <p className="text-sm text-gray-500">Expiring in 90 days</p>
            <p className="text-2xl font-bold text-yellow-500">{data.leaseMetrics.expiringIn90Days} leases</p>
            <p className="text-sm mt-2">Potential revenue impact: $3.8M/month</p>
          </div>
        </div>
      </motion.div>

      {/* Regional Risk Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Regional Risk Assessment</h3>
        <div className="space-y-4">
          {data.geographicDistribution.map((region, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <MapPin className={`h-5 w-5 ${
                  region.risk === 'high' ? 'text-red-500' :
                  region.risk === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`} />
                <div>
                  <p className="font-medium">{region.region}</p>
                  <p className="text-sm text-gray-500">{region.leases} active leases</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Production: {region.production}K BOE/day</p>
                <p className={`text-sm ${
                  region.risk === 'high' ? 'text-red-500' :
                  region.risk === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {region.risk.toUpperCase()} RISK
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Market Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Market-Based Renewal Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <p className="text-sm text-gray-500">Market Average</p>
            <p className="text-2xl font-bold">16.2%</p>
            <p className="text-sm mt-2">Regional royalty rate</p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <p className="text-sm text-gray-500">Your Average</p>
            <p className="text-2xl font-bold text-green-500">18.5%</p>
            <p className="text-sm mt-2">+2.3% above market</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-lg">
            <p className="text-sm text-gray-500">Recommended</p>
            <p className="text-2xl font-bold text-purple-500">17.8%</p>
            <p className="text-sm mt-2">Optimal for renewal</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Operations Tab
  const renderOperationsTab = () => (
    <div className="space-y-6">
      {/* Lease Management Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors">
            <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Generate Reports</p>
          </button>
          <button className="p-4 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors">
            <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Schedule Reviews</p>
          </button>
          <button className="p-4 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-medium">View Alerts</p>
          </button>
          <button className="p-4 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors">
            <BarChart2 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Analytics</p>
          </button>
        </div>
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Recent Lease Activities</h3>
        <div className="space-y-3">
          {[
            { action: 'Lease renewed', lease: 'PERM-2341', time: '2 hours ago', status: 'success' },
            { action: 'Payment received', lease: 'EAGLE-8765', time: '5 hours ago', status: 'success' },
            { action: 'Expiration notice sent', lease: 'BAKK-3421', time: '1 day ago', status: 'warning' },
            { action: 'Compliance review completed', lease: 'MARC-9876', time: '2 days ago', status: 'info' },
            { action: 'Rate negotiation started', lease: 'HAYN-5432', time: '3 days ago', status: 'info' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.lease}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">{activity.time}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Oilfield Land Lease Management',
    description: 'VANGUARDS for O&G well leases, royalties, and mineral rights management',
    kpis: [
      {
        title: 'Total Leases',
        value: data.leaseMetrics.totalLeases,
        change: 8.3,
        icon: FileText,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Active Leases',
        value: data.leaseMetrics.activeLeases,
        change: 5.7,
        icon: CheckCircle,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Monthly Revenue',
        value: `$${data.leaseMetrics.monthlyRevenue}M`,
        change: 12.3,
        icon: DollarSign,
        color: 'purple',
        trend: 'up'
      },
      {
        title: 'Total Acreage',
        value: `${(data.leaseMetrics.totalAcreage / 1000).toFixed(0)}K`,
        change: 3.2,
        icon: MapPin,
        color: 'yellow',
        trend: 'stable'
      }
    ],
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        icon: BarChart2,
        content: renderOverviewTab
      },
      {
        id: 'financial',
        label: 'Financial Analysis',
        icon: DollarSign,
        content: renderFinancialTab
      },
      {
        id: 'risk',
        label: 'Risk Management',
        icon: Shield,
        content: renderRiskTab
      },
      {
        id: 'operations',
        label: 'Operations',
        icon: Activity,
        content: renderOperationsTab
      }
    ],
    defaultTab: 'overview'
  };

  return <DashboardTemplate useCase={useCase} config={config} isDarkMode={isDarkMode} />;
};

export default OilfieldLandLeaseDashboard;