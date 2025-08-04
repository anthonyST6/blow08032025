import React, { useState, useCallback } from 'react';
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
  CheckCircle,
  Database,
  Download,
  Upload,
  X,
  ChevronRight,
  Building2,
  Users,
  Briefcase
} from 'lucide-react';
import DashboardTemplateWithIngestion, {
  DashboardConfig,
  ChartConfig,
  renderChart
} from './DashboardTemplateWithIngestion';
import { CHART_COLORS } from './DashboardTemplate';
import { UseCase } from '../../config/verticals';
import { energyDataGenerators } from '../../utils/dashboard-data-generators';
import { motion, AnimatePresence } from 'framer-motion';

interface OilfieldLandLeaseRunDashboardProps {
  useCase: UseCase;
}

interface LeaseData {
  leaseId: string;
  propertyName: string;
  location: string;
  status: 'Active' | 'Pending' | 'Expired' | 'Terminated';
  expirationDate: string;
  acreage: number;
  royaltyRate: number;
  monthlyRevenue: number;
  operator: string;
  workingInterest: number;
  netRevenueInterest: number;
  lastPaymentDate: string;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Under Review';
  riskLevel: 'Low' | 'Medium' | 'High';
  notes?: string;
}

// Simple Badge component with Seraphim styling
const Badge: React.FC<{ variant: 'success' | 'warning' | 'error' | 'info'; children: React.ReactNode }> = ({ variant, children }) => {
  const variantClasses = {
    success: 'bg-vanguard-accuracy/10 text-vanguard-accuracy border border-vanguard-accuracy/30',
    warning: 'bg-seraphim-gold/10 text-seraphim-gold border border-seraphim-gold/30',
    error: 'bg-vanguard-integrity/10 text-vanguard-integrity border border-vanguard-integrity/30',
    info: 'bg-vanguard-security/10 text-vanguard-security border border-vanguard-security/30'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

const OilfieldLandLeaseRunDashboard: React.FC<OilfieldLandLeaseRunDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const [data, setData] = useState(energyDataGenerators.oilfieldLandLease());
  const [showDataIngestionModal, setShowDataIngestionModal] = useState(false);
  const [selectedLease, setSelectedLease] = useState<LeaseData | null>(null);
  const [leaseData, setLeaseData] = useState<LeaseData[]>(generateInitialLeaseData());

  // Generate initial 100 lease data points
  function generateInitialLeaseData(): LeaseData[] {
    const statuses: LeaseData['status'][] = ['Active', 'Pending', 'Expired', 'Terminated'];
    const complianceStatuses: LeaseData['complianceStatus'][] = ['Compliant', 'Non-Compliant', 'Under Review'];
    const riskLevels: LeaseData['riskLevel'][] = ['Low', 'Medium', 'High'];
    const operators = ['Continental Resources', 'EOG Resources', 'Pioneer Natural', 'Devon Energy', 'Diamondback Energy'];
    const locations = ['Permian Basin, TX', 'Eagle Ford, TX', 'Bakken, ND', 'Marcellus, PA', 'Haynesville, LA'];

    return Array.from({ length: 100 }, (_, i) => ({
      leaseId: `L-${1000 + i}`,
      propertyName: `Property ${i + 1}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      expirationDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      acreage: Math.floor(Math.random() * 5000) + 100,
      royaltyRate: 12.5 + Math.random() * 12.5,
      monthlyRevenue: Math.floor(Math.random() * 500000) + 10000,
      operator: operators[Math.floor(Math.random() * operators.length)],
      workingInterest: 50 + Math.random() * 50,
      netRevenueInterest: 40 + Math.random() * 40,
      lastPaymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      complianceStatus: complianceStatuses[Math.floor(Math.random() * complianceStatuses.length)],
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      notes: i % 5 === 0 ? 'Renewal negotiation in progress' : undefined
    }));
  }

  // Handle data ingestion
  const handleDataIngestion = useCallback(() => {
    setShowDataIngestionModal(true);
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let parsedData: LeaseData[];
          
          if (file.name.endsWith('.json')) {
            parsedData = JSON.parse(content);
          } else if (file.name.endsWith('.csv')) {
            // Simple CSV parsing (in production, use a proper CSV parser)
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            parsedData = lines.slice(1).map(line => {
              const values = line.split(',');
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header.trim()] = values[index]?.trim();
              });
              return obj as LeaseData;
            });
          } else {
            throw new Error('Unsupported file format');
          }
          
          setLeaseData(parsedData);
          setShowDataIngestionModal(false);
          // Update dashboard data based on new lease data
          updateDashboardData(parsedData);
        } catch (error) {
          console.error('Error parsing file:', error);
          alert('Error parsing file. Please ensure it\'s in the correct format.');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  // Update dashboard data based on lease data
  const updateDashboardData = useCallback((leases: LeaseData[]) => {
    const activeLeases = leases.filter(l => l.status === 'Active').length;
    const totalRevenue = leases.reduce((sum, l) => sum + l.monthlyRevenue, 0);
    const avgRoyaltyRate = leases.reduce((sum, l) => sum + l.royaltyRate, 0) / leases.length;
    const totalAcreage = leases.reduce((sum, l) => sum + l.acreage, 0);
    
    const expiringIn30Days = leases.filter(l => {
      const days = Math.floor((new Date(l.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 30;
    }).length;
    
    const expiringIn90Days = leases.filter(l => {
      const days = Math.floor((new Date(l.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days > 30 && days <= 90;
    }).length;

    setData(prevData => ({
      ...prevData,
      leaseMetrics: {
        ...prevData.leaseMetrics,
        totalLeases: leases.length,
        activeLeases,
        monthlyRevenue: totalRevenue / 1000000,
        yearlyRevenue: (totalRevenue * 12) / 1000000,
        averageRoyaltyRate: avgRoyaltyRate,
        totalAcreage,
        expiringIn30Days,
        expiringIn90Days
      }
    }));
  }, []);

  // Download data
  const handleDownloadData = useCallback(() => {
    const dataStr = JSON.stringify(leaseData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `lease-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [leaseData]);

  // Overview Tab Content with Seraphim styling
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Lease Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Lease Status Distribution</h3>
            {renderChart({
              type: 'pie',
              title: 'Lease Status',
              data: data.leasesByStatus,
              dataKeys: ['count'],
              colors: ['#3BD16F', '#FFD700', '#DC3E40', '#3A88F5'],
              height: 300,
              showLegend: true
            }, isDarkMode)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Geographic Distribution</h3>
            {renderChart({
              type: 'bar',
              title: 'Leases by Region',
              data: data.geographicDistribution,
              dataKeys: ['region', 'leases', 'production'],
              colors: ['#3A88F5', '#3BD16F'],
              height: 300,
              showLegend: true
            }, isDarkMode)}
          </div>
        </motion.div>
      </div>

      {/* Expiration Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Lease Expiration Timeline</h3>
          {renderChart({
            type: 'area',
            title: 'Upcoming Expirations',
            data: data.expirationTimeline,
            dataKeys: ['date', 'value'],
            colors: ['#FFD700'],
            height: 300
          }, isDarkMode)}
        </div>
      </motion.div>

      {/* Compliance Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Compliance Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-vanguard-accuracy/10 border border-vanguard-accuracy/30 rounded-xl backdrop-blur-sm">
              <CheckCircle className="h-8 w-8 text-vanguard-accuracy mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{data.complianceStatus.compliant}</p>
              <p className="text-sm text-gray-400">Compliant</p>
            </div>
            <div className="text-center p-4 bg-seraphim-gold/10 border border-seraphim-gold/30 rounded-xl backdrop-blur-sm">
              <Clock className="h-8 w-8 text-seraphim-gold mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{data.complianceStatus.pendingReview}</p>
              <p className="text-sm text-gray-400">Pending Review</p>
            </div>
            <div className="text-center p-4 bg-vanguard-integrity/10 border border-vanguard-integrity/30 rounded-xl backdrop-blur-sm">
              <AlertTriangle className="h-8 w-8 text-vanguard-integrity mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{data.complianceStatus.nonCompliant}</p>
              <p className="text-sm text-gray-400">Non-Compliant</p>
            </div>
            <div className="text-center p-4 bg-vanguard-security/10 border border-vanguard-security/30 rounded-xl backdrop-blur-sm">
              <Shield className="h-8 w-8 text-vanguard-security mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{data.complianceStatus.requiresAction}</p>
              <p className="text-sm text-gray-400">Action Required</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Land Leases Tab with Seraphim styling
  const renderLandLeasesTab = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">All Land Leases</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleDownloadData}
                className="flex items-center space-x-2 px-6 py-2.5 bg-black border border-seraphim-gold text-seraphim-gold rounded-full hover:bg-seraphim-gold hover:text-black transition-all duration-300 font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Lease Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-seraphim-gold/20">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Lease ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Property</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Location</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Expiration</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Monthly Revenue</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Risk</th>
                  <th className="text-left py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {leaseData.slice(0, 20).map((lease) => (
                  <tr
                    key={lease.leaseId}
                    className="border-b border-seraphim-gold/10 hover:bg-seraphim-gold/5 cursor-pointer transition-all duration-200"
                    onClick={() => setSelectedLease(lease)}
                  >
                    <td className="py-3 px-4 font-medium text-white">{lease.leaseId}</td>
                    <td className="py-3 px-4 text-gray-300">{lease.propertyName}</td>
                    <td className="py-3 px-4 text-gray-300">{lease.location}</td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      lease.status === 'Active' ? 'success' :
                      lease.status === 'Pending' ? 'warning' :
                      'error'
                    }>
                      {lease.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(lease.expirationDate).toLocaleDateString()}
                  </td>
                    <td className="py-3 px-4 text-white font-medium">${(lease.monthlyRevenue / 1000).toFixed(1)}K</td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      lease.riskLevel === 'Low' ? 'success' :
                      lease.riskLevel === 'Medium' ? 'warning' :
                      'error'
                    }>
                      {lease.riskLevel}
                    </Badge>
                  </td>
                    <td className="py-3 px-4">
                      <ChevronRight className="h-4 w-4 text-seraphim-gold/50" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing 20 of {leaseData.length} leases
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Compliance Tab with Seraphim styling
  const renderComplianceTab = () => (
    <div className="space-y-6">
      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-vanguard-accuracy/20 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-vanguard-accuracy/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Compliance Rate</h4>
              <CheckCircle className="h-5 w-5 text-vanguard-accuracy" />
            </div>
            <p className="text-3xl font-bold text-vanguard-accuracy">
              {((data.complianceStatus.compliant / data.leaseMetrics.totalLeases) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400 mt-2">Overall compliance</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/20 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Pending Reviews</h4>
              <Clock className="h-5 w-5 text-seraphim-gold" />
            </div>
            <p className="text-3xl font-bold text-seraphim-gold">{data.complianceStatus.pendingReview}</p>
            <p className="text-sm text-gray-400 mt-2">Awaiting review</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-vanguard-integrity/20 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-vanguard-integrity/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Action Required</h4>
              <AlertTriangle className="h-5 w-5 text-vanguard-integrity" />
            </div>
            <p className="text-3xl font-bold text-vanguard-integrity">{data.complianceStatus.requiresAction}</p>
            <p className="text-sm text-gray-400 mt-2">Immediate attention</p>
          </div>
        </motion.div>
      </div>

      {/* Compliance by Region */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Compliance by Region</h3>
        {renderChart({
          type: 'bar',
          title: 'Regional Compliance Status',
          data: data.geographicDistribution.map(region => ({
            region: region.region,
            compliant: Math.floor(region.leases * 0.8),
            nonCompliant: Math.floor(region.leases * 0.2)
          })),
          dataKeys: ['region', 'compliant', 'nonCompliant'],
          colors: ['#3BD16F', '#DC3E40'],
          height: 300,
          showLegend: true
        }, isDarkMode)}
        </div>
      </motion.div>

      {/* Recent Compliance Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Compliance Activities</h3>
          <div className="space-y-3">
            {[
              { action: 'Compliance audit completed', lease: 'PERM-2341', time: '2 hours ago', status: 'success' },
              { action: 'Document submission required', lease: 'EAGLE-8765', time: '5 hours ago', status: 'warning' },
              { action: 'Non-compliance detected', lease: 'BAKK-3421', time: '1 day ago', status: 'error' },
              { action: 'Review scheduled', lease: 'MARC-9876', time: '2 days ago', status: 'info' },
              { action: 'Compliance restored', lease: 'HAYN-5432', time: '3 days ago', status: 'success' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-black/20 border border-seraphim-gold/10 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-vanguard-accuracy' :
                    activity.status === 'warning' ? 'bg-seraphim-gold' :
                    activity.status === 'error' ? 'bg-vanguard-integrity' :
                    'bg-vanguard-security'
                  }`} />
                  <div>
                    <p className="font-medium text-white">{activity.action}</p>
                    <p className="text-sm text-gray-400">{activity.lease}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Financial Analysis Tab with Seraphim styling
  const renderFinancialTab = () => (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-vanguard-accuracy/20 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-vanguard-accuracy/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Monthly Revenue</h4>
              <DollarSign className="h-5 w-5 text-vanguard-accuracy" />
            </div>
            <p className="text-3xl font-bold text-vanguard-accuracy">${data.leaseMetrics.monthlyRevenue}M</p>
            <p className="text-sm text-gray-400 mt-2">+12.3% from last month</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-vanguard-security/20 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-vanguard-security/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Yearly Revenue</h4>
              <TrendingUp className="h-5 w-5 text-vanguard-security" />
            </div>
            <p className="text-3xl font-bold text-vanguard-security">${data.leaseMetrics.yearlyRevenue}M</p>
            <p className="text-sm text-gray-400 mt-2">Projected: $58.2M</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/20 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Avg Royalty Rate</h4>
              <Activity className="h-5 w-5 text-seraphim-gold" />
            </div>
            <p className="text-3xl font-bold text-seraphim-gold">{data.leaseMetrics.averageRoyaltyRate}%</p>
            <p className="text-sm text-gray-400 mt-2">Industry avg: 16.2%</p>
          </div>
        </motion.div>
      </div>

      {/* Royalty Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Royalty Rate Trends</h3>
        {renderChart({
          type: 'line',
          title: 'Average Royalty Rate Over Time',
          data: data.royaltyTrends,
          dataKeys: ['date', 'value'],
          colors: ['#FFD700'],
          height: 300
        }, isDarkMode)}
        </div>
      </motion.div>

      {/* Production Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Production by Lease</h3>
          {renderChart({
            type: 'area',
            title: 'Daily Production (BOE)',
            data: data.productionByLease,
            dataKeys: ['date', 'value'],
            colors: ['#3BD16F'],
            height: 300
          }, isDarkMode)}
        </div>
      </motion.div>
    </div>
  );

  // Analytics Tab with Seraphim styling
  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-vanguard-accuracy/20 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-vanguard-accuracy/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">ROI</h4>
              <TrendingUp className="h-5 w-5 text-vanguard-accuracy" />
            </div>
            <p className="text-3xl font-bold text-vanguard-accuracy">23.5%</p>
            <p className="text-sm text-gray-400 mt-2">Return on Investment</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-vanguard-security/20 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-vanguard-security/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Efficiency</h4>
              <Activity className="h-5 w-5 text-vanguard-security" />
            </div>
            <p className="text-3xl font-bold text-vanguard-security">87.3%</p>
            <p className="text-sm text-gray-400 mt-2">Operational efficiency</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/20 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Utilization</h4>
              <BarChart2 className="h-5 w-5 text-seraphim-gold" />
            </div>
            <p className="text-3xl font-bold text-seraphim-gold">92.1%</p>
            <p className="text-sm text-gray-400 mt-2">Resource utilization</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/20 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Cost/Acre</h4>
              <DollarSign className="h-5 w-5 text-seraphim-gold" />
            </div>
            <p className="text-3xl font-bold text-seraphim-gold">$42.50</p>
            <p className="text-sm text-gray-400 mt-2">Average cost per acre</p>
          </div>
        </motion.div>
      </div>

      {/* Performance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Performance Trends</h3>
        {renderChart({
          type: 'line',
          title: 'Key Performance Indicators',
          data: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            roi: 20 + Math.random() * 10,
            efficiency: 80 + Math.random() * 15,
            utilization: 85 + Math.random() * 10
          })),
          dataKeys: ['date', 'roi', 'efficiency', 'utilization'],
          colors: ['#3BD16F', '#3A88F5', '#FFD700'],
          height: 300,
          showLegend: true
        }, isDarkMode)}
        </div>
      </motion.div>

      {/* Predictive Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Predictive Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-vanguard-security/10 border border-vanguard-security/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-400">Next Month Revenue</p>
              <p className="text-2xl font-bold text-white">$4.8M</p>
              <p className="text-sm mt-2 text-vanguard-accuracy">+14.3% projected</p>
            </div>
            <div className="p-4 bg-vanguard-accuracy/10 border border-vanguard-accuracy/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-400">Renewal Success Rate</p>
              <p className="text-2xl font-bold text-white">89%</p>
              <p className="text-sm mt-2 text-gray-400">Based on historical data</p>
            </div>
            <div className="p-4 bg-seraphim-gold/10 border border-seraphim-gold/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-400">Risk Score</p>
              <p className="text-2xl font-bold text-white">Low</p>
              <p className="text-sm mt-2 text-gray-400">2.3/10 overall risk</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Operations Tab with Seraphim styling
  const renderOperationsTab = () => (
    <div className="space-y-6">
      {/* Lease Management Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 bg-vanguard-security/10 border border-vanguard-security/30 hover:bg-vanguard-security/20 rounded-xl transition-all duration-300 backdrop-blur-sm">
              <FileText className="h-8 w-8 text-vanguard-security mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Generate Reports</p>
            </button>
            <button className="p-4 bg-vanguard-accuracy/10 border border-vanguard-accuracy/30 hover:bg-vanguard-accuracy/20 rounded-xl transition-all duration-300 backdrop-blur-sm">
              <Calendar className="h-8 w-8 text-vanguard-accuracy mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Schedule Reviews</p>
            </button>
            <button className="p-4 bg-seraphim-gold/10 border border-seraphim-gold/30 hover:bg-seraphim-gold/20 rounded-xl transition-all duration-300 backdrop-blur-sm">
              <AlertTriangle className="h-8 w-8 text-seraphim-gold mx-auto mb-2" />
              <p className="text-sm font-medium text-white">View Alerts</p>
            </button>
            <button className="p-4 bg-vanguard-integrity/10 border border-vanguard-integrity/30 hover:bg-vanguard-integrity/20 rounded-xl transition-all duration-300 backdrop-blur-sm">
              <BarChart2 className="h-8 w-8 text-vanguard-integrity mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Analytics</p>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Lease Activities</h3>
          <div className="space-y-3">
            {[
              { action: 'Lease renewed', lease: 'PERM-2341', time: '2 hours ago', status: 'success' },
              { action: 'Payment received', lease: 'EAGLE-8765', time: '5 hours ago', status: 'success' },
              { action: 'Expiration notice sent', lease: 'BAKK-3421', time: '1 day ago', status: 'warning' },
              { action: 'Compliance review completed', lease: 'MARC-9876', time: '2 days ago', status: 'info' },
              { action: 'Rate negotiation started', lease: 'HAYN-5432', time: '3 days ago', status: 'info' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-black/20 border border-seraphim-gold/10 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-vanguard-accuracy' :
                    activity.status === 'warning' ? 'bg-seraphim-gold' :
                    'bg-vanguard-security'
                  }`} />
                  <div>
                    <p className="font-medium text-white">{activity.action}</p>
                    <p className="text-sm text-gray-400">{activity.lease}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Risk Management Tab with Seraphim styling
  const renderRiskTab = () => (
    <div className="space-y-6">
      {/* Expiring Leases Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/20 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6 border-l-4 border-l-seraphim-gold">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <AlertTriangle className="h-5 w-5 text-seraphim-gold mr-2" />
              Lease Expiration Alerts
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-vanguard-integrity/10 border border-vanguard-integrity/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-400">Expiring in 30 days</p>
              <p className="text-2xl font-bold text-vanguard-integrity">{data.leaseMetrics.expiringIn30Days} leases</p>
              <p className="text-sm mt-2 text-gray-400">Potential revenue impact: $1.2M/month</p>
            </div>
            <div className="p-4 bg-seraphim-gold/10 border border-seraphim-gold/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-400">Expiring in 90 days</p>
              <p className="text-2xl font-bold text-seraphim-gold">{data.leaseMetrics.expiringIn90Days} leases</p>
              <p className="text-sm mt-2 text-gray-400">Potential revenue impact: $3.8M/month</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Regional Risk Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Regional Risk Assessment</h3>
          <div className="space-y-4">
            {data.geographicDistribution.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/20 border border-seraphim-gold/10 rounded-xl">
                <div className="flex items-center space-x-4">
                  <MapPin className={`h-5 w-5 ${
                    region.risk === 'high' ? 'text-vanguard-integrity' :
                    region.risk === 'medium' ? 'text-seraphim-gold' :
                    'text-vanguard-accuracy'
                  }`} />
                  <div>
                    <p className="font-medium text-white">{region.region}</p>
                    <p className="text-sm text-gray-400">{region.leases} active leases</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-300">Production: {region.production}K BOE/day</p>
                  <p className={`text-sm font-bold ${
                    region.risk === 'high' ? 'text-vanguard-integrity' :
                    region.risk === 'medium' ? 'text-seraphim-gold' :
                    'text-vanguard-accuracy'
                  }`}>
                    {region.risk.toUpperCase()} RISK
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Market Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-black/40 backdrop-blur-sm border border-seraphim-gold/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Market-Based Renewal Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-vanguard-security/10 border border-vanguard-security/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-400">Market Average</p>
              <p className="text-2xl font-bold text-white">16.2%</p>
              <p className="text-sm mt-2 text-gray-400">Regional royalty rate</p>
            </div>
            <div className="p-4 bg-vanguard-accuracy/10 border border-vanguard-accuracy/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-400">Your Average</p>
              <p className="text-2xl font-bold text-vanguard-accuracy">18.5%</p>
              <p className="text-sm mt-2 text-gray-400">+2.3% above market</p>
            </div>
            <div className="p-4 bg-seraphim-gold/10 border border-seraphim-gold/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-400">Recommended</p>
              <p className="text-2xl font-bold text-seraphim-gold">17.8%</p>
              <p className="text-sm mt-2 text-gray-400">Optimal for renewal</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Data Ingestion Modal with Seraphim styling
  const renderDataIngestionModal = () => (
    <AnimatePresence>
      {showDataIngestionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDataIngestionModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-black/90 backdrop-blur-md border border-seraphim-gold/30 rounded-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Data Ingestion</h3>
                <button
                  onClick={() => setShowDataIngestionModal(false)}
                  className="text-gray-400 hover:text-seraphim-gold transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-seraphim-gold/30 rounded-xl p-8 text-center bg-black/20">
                  <Upload className="h-12 w-12 text-seraphim-gold mx-auto mb-4" />
                  <p className="text-sm text-gray-300 mb-2">
                    Upload lease data file
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Supports JSON and CSV formats
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center px-6 py-2.5 bg-black border border-seraphim-gold text-seraphim-gold rounded-full hover:bg-seraphim-gold hover:text-black transition-all duration-300 font-medium">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </span>
                  </label>
                </div>

                <div className="flex justify-between items-center">
                  <a
                    href="/sample-lease-data.json"
                    download
                    className="text-sm text-seraphim-gold hover:text-seraphim-gold/80 transition-colors"
                  >
                    Download sample template
                  </a>
                  <button
                    onClick={() => setShowDataIngestionModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Lease Details Modal with Seraphim styling
  const renderLeaseDetailsModal = () => (
    <AnimatePresence>
      {selectedLease && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedLease(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-black/90 backdrop-blur-md border border-seraphim-gold/30 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-seraphim-gold/10 to-transparent rounded-2xl blur-xl" />
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Lease Details - {selectedLease.leaseId}</h3>
                <button
                  onClick={() => setSelectedLease(null)}
                  className="text-gray-400 hover:text-seraphim-gold transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-seraphim-gold">Property Information</h4>
                  <div className="space-y-2">
                    <p className="text-gray-300"><span className="text-gray-400">Property Name:</span> {selectedLease.propertyName}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Location:</span> {selectedLease.location}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Acreage:</span> {selectedLease.acreage.toLocaleString()} acres</p>
                    <p className="text-gray-300"><span className="text-gray-400">Operator:</span> {selectedLease.operator}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-seraphim-gold">Financial Details</h4>
                  <div className="space-y-2">
                    <p className="text-gray-300"><span className="text-gray-400">Monthly Revenue:</span> ${selectedLease.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Royalty Rate:</span> {selectedLease.royaltyRate.toFixed(2)}%</p>
                    <p className="text-gray-300"><span className="text-gray-400">Working Interest:</span> {selectedLease.workingInterest.toFixed(2)}%</p>
                    <p className="text-gray-300"><span className="text-gray-400">Net Revenue Interest:</span> {selectedLease.netRevenueInterest.toFixed(2)}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-seraphim-gold">Status & Compliance</h4>
                  <div className="space-y-2">
                    <p className="flex items-center">
                      <span className="text-gray-400 mr-2">Status:</span>
                      <Badge variant={
                        selectedLease.status === 'Active' ? 'success' :
                        selectedLease.status === 'Pending' ? 'warning' :
                        'error'
                      }>
                        {selectedLease.status}
                      </Badge>
                    </p>
                    <p className="flex items-center">
                      <span className="text-gray-400 mr-2">Compliance:</span>
                      <Badge variant={
                        selectedLease.complianceStatus === 'Compliant' ? 'success' :
                        selectedLease.complianceStatus === 'Under Review' ? 'warning' :
                        'error'
                      }>
                        {selectedLease.complianceStatus}
                      </Badge>
                    </p>
                    <p className="flex items-center">
                      <span className="text-gray-400 mr-2">Risk Level:</span>
                      <Badge variant={
                        selectedLease.riskLevel === 'Low' ? 'success' :
                        selectedLease.riskLevel === 'Medium' ? 'warning' :
                        'error'
                      }>
                        {selectedLease.riskLevel}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-seraphim-gold">Important Dates</h4>
                  <div className="space-y-2">
                    <p className="text-gray-300"><span className="text-gray-400">Expiration Date:</span> {new Date(selectedLease.expirationDate).toLocaleDateString()}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Last Payment:</span> {new Date(selectedLease.lastPaymentDate).toLocaleDateString()}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Days Until Expiration:</span> {Math.floor((new Date(selectedLease.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}</p>
                  </div>
                </div>
              </div>

              {selectedLease.notes && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-seraphim-gold">Notes</h4>
                  <p className="text-gray-300">{selectedLease.notes}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-6 py-2.5 bg-black border border-vanguard-security text-vanguard-security rounded-full hover:bg-vanguard-security hover:text-black transition-all duration-300 font-medium">
                  Edit Lease
                </button>
                <button className="px-6 py-2.5 bg-black border border-vanguard-accuracy text-vanguard-accuracy rounded-full hover:bg-vanguard-accuracy hover:text-black transition-all duration-300 font-medium">
                  Generate Report
                </button>
                <button
                  onClick={() => setSelectedLease(null)}
                  className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
        id: 'land-leases',
        label: 'Land Leases',
        icon: FileText,
        content: renderLandLeasesTab
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: Shield,
        content: renderComplianceTab
      },
      {
        id: 'financial',
        label: 'Financial',
        icon: DollarSign,
        content: renderFinancialTab
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: PieChart,
        content: renderAnalyticsTab
      },
      {
        id: 'operations',
        label: 'Operations',
        icon: Activity,
        content: renderOperationsTab
      },
      {
        id: 'risk',
        label: 'Risk Management',
        icon: AlertTriangle,
        content: renderRiskTab
      }
    ],
    defaultTab: 'overview'
  };

  return (
    <>
      <DashboardTemplateWithIngestion
        useCase={useCase}
        config={config}
        isDarkMode={isDarkMode}
        onDataIngestionClick={handleDataIngestion}
      />
      {renderDataIngestionModal()}
      {renderLeaseDetailsModal()}
    </>
  );
};

export default OilfieldLandLeaseRunDashboard;