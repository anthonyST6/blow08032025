import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BoltIcon,
  MapIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SIAMetrics } from '../components/ui/SIAMetric';
import { generateLandLeaseData, generateWorkflowData, generateComplianceData, generateFinancialData } from '../services/mockData.service';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface LeaseStatus {
  status: string;
  count: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const EnergyDashboard: React.FC = () => {
  const [landLeases, setLandLeases] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [financial, setFinancial] = useState<any>(null);
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'leases' | 'compliance' | 'financial'>('overview');

  useEffect(() => {
    // Load mock data
    setLandLeases(generateLandLeaseData());
    setWorkflows(generateWorkflowData());
    setCompliance(generateComplianceData());
    setFinancial(generateFinancialData());
  }, []);

  const leaseStatuses: LeaseStatus[] = [
    { status: 'Active', count: landLeases.filter(l => l.status === 'Active').length, color: 'text-green-500', icon: CheckCircleIcon },
    { status: 'Pending', count: landLeases.filter(l => l.status === 'Pending').length, color: 'text-yellow-500', icon: ClockIcon },
    { status: 'Under Review', count: landLeases.filter(l => l.status === 'Under Review').length, color: 'text-blue-500', icon: DocumentTextIcon },
    { status: 'Expiring Soon', count: landLeases.filter(l => l.status === 'Expiring Soon').length, color: 'text-orange-500', icon: ExclamationTriangleIcon },
  ];

  const totalRevenue = financial?.revenue.reduce((sum: number, month: any) => 
    sum + month.leaseRevenue + month.royalties + month.fees, 0) || 0;

  const totalAcres = landLeases.reduce((sum, lease) => sum + lease.location.acres, 0);

  const averageCompliance = compliance.reduce((sum, item) => sum + item.score, 0) / compliance.length || 0;

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <BoltIcon className="w-8 h-8 mr-3 text-yellow-500" />
          Energy Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          AI-powered management of O&G well leases, royalties, and mineral rights with real-time expiration monitoring
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: ChartBarIcon },
          { id: 'leases', label: 'Land Leases', icon: MapIcon },
          { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
          { id: 'financial', label: 'Financial', icon: CurrencyDollarIcon },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center"
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Leases</p>
                    <p className="text-2xl font-bold text-white">{landLeases.length}</p>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <ArrowUpIcon className="w-3 h-3 mr-1" />
                      12% from last month
                    </p>
                  </div>
                  <MapIcon className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Acres</p>
                    <p className="text-2xl font-bold text-white">{totalAcres.toLocaleString()}</p>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <ArrowUpIcon className="w-3 h-3 mr-1" />
                      8% expansion
                    </p>
                  </div>
                  <GlobeAltIcon className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Annual Revenue</p>
                    <p className="text-2xl font-bold text-white">${(totalRevenue / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <ArrowUpIcon className="w-3 h-3 mr-1" />
                      15% YoY growth
                    </p>
                  </div>
                  <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Compliance Score</p>
                    <p className="text-2xl font-bold text-white">{averageCompliance.toFixed(1)}%</p>
                    <p className="text-xs text-yellow-500 flex items-center mt-1">
                      <ArrowDownIcon className="w-3 h-3 mr-1" />
                      2% from last audit
                    </p>
                  </div>
                  <ShieldCheckIcon className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SIA Metrics */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>AI Governance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <SIAMetrics
                security={96}
                integrity={94}
                accuracy={97}
                size="lg"
                variant="card"
                layout="horizontal"
              />
            </CardContent>
          </Card>

          {/* Expiration Alerts & Renewal Recommendations */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Critical Lease Expirations - Next 365 Days</span>
                <span className="text-sm text-red-500">Action Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Permian Basin - Block 42</h4>
                      <p className="text-xs text-gray-400">Wells: PB-42-001 through PB-42-015</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">45 days</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400">Current Rate</p>
                      <p className="text-white font-medium">$125/acre/year</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Market Rate</p>
                      <p className="text-green-400 font-medium">$145/acre/year</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Production Impact</p>
                      <p className="text-yellow-400 font-medium">$1.2M/day</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Renewal Status</p>
                      <p className="text-orange-400 font-medium">Negotiating</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Eagle Ford - Section 18</h4>
                      <p className="text-xs text-gray-400">Wells: EF-18-101 through EF-18-108</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">120 days</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400">Current Rate</p>
                      <p className="text-white font-medium">$95/acre/year</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Market Rate</p>
                      <p className="text-green-400 font-medium">$110/acre/year</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Production Impact</p>
                      <p className="text-yellow-400 font-medium">$850K/day</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Renewal Status</p>
                      <p className="text-blue-400 font-medium">Pending Review</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lease Renewal Timeline */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Lease Renewal Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      { days: '0-30', count: 3, revenue: 1.2 },
                      { days: '31-60', count: 5, revenue: 2.1 },
                      { days: '61-90', count: 8, revenue: 3.5 },
                      { days: '91-120', count: 12, revenue: 4.8 },
                      { days: '121-180', count: 18, revenue: 7.2 },
                      { days: '181-365', count: 24, revenue: 9.6 },
                      { days: '365+', count: 45, revenue: 18.0 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="days" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#D1D5DB' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'Lease Count') return value;
                        return `$${value}M`;
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Lease Count" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Revenue Impact" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Production by Well Type */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Production Revenue by Well Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Horizontal Wells', value: 65, color: '#3B82F6' },
                        { name: 'Vertical Wells', value: 20, color: '#10B981' },
                        { name: 'Directional Wells', value: 10, color: '#F59E0B' },
                        { name: 'Injection Wells', value: 5, color: '#8B5CF6' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Horizontal Wells', value: 65, color: '#3B82F6' },
                        { name: 'Vertical Wells', value: 20, color: '#10B981' },
                        { name: 'Directional Wells', value: 10, color: '#F59E0B' },
                        { name: 'Injection Wells', value: 5, color: '#8B5CF6' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number) => `${value}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {[
                    { name: 'Horizontal Wells', value: 65, color: '#3B82F6' },
                    { name: 'Vertical Wells', value: 20, color: '#10B981' },
                    { name: 'Directional Wells', value: 10, color: '#F59E0B' },
                    { name: 'Injection Wells', value: 5, color: '#8B5CF6' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-400">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lease Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>Lease Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaseStatuses.map((status) => (
                    <motion.div
                      key={status.status}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <status.icon className={`w-5 h-5 ${status.color}`} />
                        <span className="text-sm text-gray-300">{status.status}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-white">{status.count}</span>
                        <div className={`w-24 h-2 bg-gray-700 rounded-full overflow-hidden`}>
                          <div
                            className={`h-full ${status.color.replace('text-', 'bg-')}`}
                            style={{ width: `${(status.count / landLeases.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="glass-dark" effect="float">
              <CardHeader>
                <CardTitle>VANGUARDS Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Lease Renewal Analysis - Permian Basin</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                        Critical
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: '85%' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">85% complete • Market analysis in progress</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Royalty Payment Reconciliation</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                        High
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: '60%' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">60% complete • Processing 2,847 transactions</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Title Chain Verification - Eagle Ford</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                        Medium
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: '40%' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">40% complete • Validating mineral rights</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Sensitivity Analysis - Q2 Renewals</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                        High
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: '30%' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">30% complete • Modeling profitability impact</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Compliance Document Generation</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                        Low
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: '95%' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">95% complete • Final VANGUARDS review</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Land Leases Tab */}
      {activeTab === 'leases' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Land Lease Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Property ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Location</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Annual Payment</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {landLeases.slice(0, 10).map((lease) => (
                        <tr key={lease.id} className="border-b border-gray-800 hover:bg-white/5">
                          <td className="py-3 px-4 text-sm text-white">{lease.propertyId}</td>
                          <td className="py-3 px-4 text-sm text-gray-300">
                            {lease.location.county}, {lease.location.state}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-300">{lease.leaseType}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              lease.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                              lease.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              lease.status === 'Expiring Soon' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {lease.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-300">
                            ${lease.annualPayment.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => setSelectedLease(lease)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lease Details */}
          <div>
            {selectedLease ? (
              <Card variant="gradient" effect="shimmer">
                <CardHeader>
                  <CardTitle>Lease Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-400">Property ID</p>
                      <p className="text-sm font-medium text-white">{selectedLease.propertyId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Leaseholder</p>
                      <p className="text-sm font-medium text-white">{selectedLease.leaseholder}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Location</p>
                      <p className="text-sm font-medium text-white">
                        {selectedLease.location.acres.toLocaleString()} acres in {selectedLease.location.county}, {selectedLease.location.state}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Lease Period</p>
                      <p className="text-sm font-medium text-white">
                        {new Date(selectedLease.startDate).toLocaleDateString()} - {new Date(selectedLease.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Financial Terms</p>
                      <p className="text-sm font-medium text-white">
                        ${selectedLease.annualPayment.toLocaleString()}/year • {(parseFloat(selectedLease.royaltyRate) * 100).toFixed(1)}% royalty
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Compliance Status</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Environmental</span>
                          {selectedLease.compliance.environmental ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Regulatory</span>
                          {selectedLease.compliance.regulatory ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Safety</span>
                          {selectedLease.compliance.safety ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Stakeholders</p>
                      <div className="space-y-2">
                        {selectedLease.stakeholders.map((stakeholder: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <p className="text-white">{stakeholder.name}</p>
                            <p className="text-xs text-gray-400">{stakeholder.role}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card variant="glass" effect="float">
                <CardContent className="p-12 text-center">
                  <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Select a lease to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {compliance.map((category) => (
            <Card key={category.id} variant="glass" effect="glow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category.category}</span>
                  <span className={`text-2xl font-bold ${
                    category.score >= 90 ? 'text-green-500' :
                    category.score >= 80 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {category.score.toFixed(1)}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Audit</span>
                    <span className="text-gray-300">
                      {new Date(category.lastAudit).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Open Issues</span>
                    <span className="text-red-400">{category.issues}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Resolved</span>
                    <span className="text-green-400">{category.resolved}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-400 mb-2">Requirements</p>
                    <div className="space-y-2">
                      {category.requirements.map((req: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{req.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            req.status === 'compliant' ? 'bg-green-500/20 text-green-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && financial && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="gradient" effect="shimmer">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Lease Revenue</span>
                    <span className="text-lg font-semibold text-white">
                      ${(financial.revenue.reduce((sum: number, m: any) => sum + m.leaseRevenue, 0) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Royalties</span>
                    <span className="text-lg font-semibold text-white">
                      ${(financial.revenue.reduce((sum: number, m: any) => sum + m.royalties, 0) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Fees</span>
                    <span className="text-lg font-semibold text-white">
                      ${(financial.revenue.reduce((sum: number, m: any) => sum + m.fees, 0) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" effect="shimmer">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Operations</span>
                    <span className="text-lg font-semibold text-white">
                      ${(financial.expenses.reduce((sum: number, m: any) => sum + m.operations, 0) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Maintenance</span>
                    <span className="text-lg font-semibold text-white">
                      ${(financial.expenses.reduce((sum: number, m: any) => sum + m.maintenance, 0) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Compliance</span>
                    <span className="text-lg font-semibold text-white">
                      ${(financial.expenses.reduce((sum: number, m: any) => sum + m.compliance, 0) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" effect="shimmer">
              <CardHeader>
                <CardTitle>Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Next Quarter</p>
                    <p className="text-lg font-semibold text-white">
                      ${(financial.projections.nextQuarter.netIncome / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-green-500">Net Income</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Year End</p>
                    <p className="text-lg font-semibold text-white">
                      ${(financial.projections.yearEnd.netIncome / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-green-500">Net Income</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue Trend Chart */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={[
                    { month: 'Jan', leaseRevenue: 4.2, royalties: 2.8, production: 1.5, total: 8.5 },
                    { month: 'Feb', leaseRevenue: 4.3, royalties: 2.9, production: 1.6, total: 8.8 },
                    { month: 'Mar', leaseRevenue: 4.5, royalties: 3.1, production: 1.7, total: 9.3 },
                    { month: 'Apr', leaseRevenue: 4.4, royalties: 3.0, production: 1.8, total: 9.2 },
                    { month: 'May', leaseRevenue: 4.6, royalties: 3.2, production: 1.9, total: 9.7 },
                    { month: 'Jun', leaseRevenue: 4.8, royalties: 3.4, production: 2.0, total: 10.2 },
                    { month: 'Jul', leaseRevenue: 5.0, royalties: 3.5, production: 2.1, total: 10.6 },
                    { month: 'Aug', leaseRevenue: 5.1, royalties: 3.6, production: 2.2, total: 10.9 },
                    { month: 'Sep', leaseRevenue: 5.2, royalties: 3.7, production: 2.3, total: 11.2 },
                    { month: 'Oct', leaseRevenue: 5.3, royalties: 3.8, production: 2.4, total: 11.5 },
                    { month: 'Nov', leaseRevenue: 5.4, royalties: 3.9, production: 2.5, total: 11.8 },
                    { month: 'Dec', leaseRevenue: 5.5, royalties: 4.0, production: 2.6, total: 12.1 },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorLease" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorRoyalties" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" label={{ value: 'Revenue ($M)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#D1D5DB' }}
                    formatter={(value: number) => `$${value.toFixed(1)}M`}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Area type="monotone" dataKey="leaseRevenue" stackId="1" stroke="#3B82F6" fillOpacity={1} fill="url(#colorLease)" name="Lease Revenue" />
                  <Area type="monotone" dataKey="royalties" stackId="1" stroke="#10B981" fillOpacity={1} fill="url(#colorRoyalties)" name="Royalties" />
                  <Area type="monotone" dataKey="production" stackId="1" stroke="#F59E0B" fillOpacity={1} fill="url(#colorProduction)" name="Production Fees" />
                  <Line type="monotone" dataKey="total" stroke="#D4AF37" strokeWidth={2} dot={false} name="Total Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Additional Financial Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lease Expiration Impact Chart */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Revenue at Risk - Lease Expirations</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      { month: 'Jan', atRisk: 0.5, secured: 8.0 },
                      { month: 'Feb', atRisk: 1.2, secured: 7.6 },
                      { month: 'Mar', atRisk: 2.1, secured: 7.2 },
                      { month: 'Apr', atRisk: 0.8, secured: 8.4 },
                      { month: 'May', atRisk: 0.3, secured: 9.4 },
                      { month: 'Jun', atRisk: 1.5, secured: 8.7 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" label={{ value: 'Revenue ($M)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#D1D5DB' }}
                      formatter={(value: number) => `$${value.toFixed(1)}M`}
                    />
                    <Legend />
                    <Bar dataKey="secured" stackId="a" fill="#10B981" name="Secured Revenue" />
                    <Bar dataKey="atRisk" stackId="a" fill="#EF4444" name="At Risk (Expiring)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Profitability by Field */}
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Profitability by Field</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Permian Basin', value: 45, profit: 18.5 },
                        { name: 'Eagle Ford', value: 28, profit: 12.3 },
                        { name: 'Bakken', value: 15, profit: 8.7 },
                        { name: 'Marcellus', value: 8, profit: 5.2 },
                        { name: 'Other', value: 4, profit: 2.1 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3B82F6" />
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                      <Cell fill="#EF4444" />
                      <Cell fill="#8B5CF6" />
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number, name: string, props: any) => [`$${props.payload.profit}M profit`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyDashboard;