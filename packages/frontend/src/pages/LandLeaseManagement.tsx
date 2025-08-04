import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ChartBarIcon,
  HomeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { Progress } from '../components/Progress';
import { Input } from '../components/Input';

// Types
interface LeaseAgreement {
  id: string;
  propertyId: string;
  propertyName: string;
  lessee: string;
  lessor: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'pending' | 'expired' | 'terminated';
  monthlyRent: number;
  totalArea: number;
  areaUnit: 'acres' | 'hectares' | 'sqft';
  paymentStatus: 'current' | 'overdue' | 'advance';
  lastPaymentDate?: Date;
  nextPaymentDue?: Date;
  documents: Document[];
  coordinates: {
    lat: number;
    lng: number;
    boundaries: Array<{ lat: number; lng: number }>;
  };
}

interface Document {
  id: string;
  name: string;
  type: 'lease' | 'survey' | 'compliance' | 'payment' | 'correspondence';
  uploadDate: Date;
  size: string;
  status: 'valid' | 'expired' | 'pending_review';
}

interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  method?: 'bank_transfer' | 'check' | 'cash' | 'online';
  reference?: string;
}

interface ComplianceItem {
  id: string;
  leaseId: string;
  requirement: string;
  category: 'environmental' | 'zoning' | 'safety' | 'insurance' | 'tax';
  status: 'compliant' | 'non_compliant' | 'pending_review' | 'expired';
  dueDate?: Date;
  lastReviewDate?: Date;
  documents: string[];
}

interface Notification {
  id: string;
  leaseId: string;
  type: 'payment_due' | 'lease_expiry' | 'compliance_alert' | 'document_expiry';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  date: Date;
  isRead: boolean;
}

const LandLeaseManagement: React.FC = () => {
  const [selectedLease, setSelectedLease] = useState<LeaseAgreement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'expired'>('all');
  const [showAddLease, setShowAddLease] = useState(false);

  // Mock data
  const leases: LeaseAgreement[] = [
    {
      id: 'LL001',
      propertyId: 'PROP-001',
      propertyName: 'Solar Farm Site Alpha',
      lessee: 'Renewable Energy Corp',
      lessor: 'Johnson Family Trust',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2042-01-01'),
      status: 'active',
      monthlyRent: 15000,
      totalArea: 250,
      areaUnit: 'acres',
      paymentStatus: 'current',
      lastPaymentDate: new Date('2024-03-01'),
      nextPaymentDue: new Date('2024-04-01'),
      documents: [
        {
          id: 'DOC001',
          name: 'Master Lease Agreement',
          type: 'lease',
          uploadDate: new Date('2022-01-01'),
          size: '2.4 MB',
          status: 'valid',
        },
        {
          id: 'DOC002',
          name: 'Environmental Impact Assessment',
          type: 'compliance',
          uploadDate: new Date('2023-06-15'),
          size: '5.8 MB',
          status: 'valid',
        },
      ],
      coordinates: {
        lat: 34.0522,
        lng: -118.2437,
        boundaries: [
          { lat: 34.0522, lng: -118.2437 },
          { lat: 34.0532, lng: -118.2437 },
          { lat: 34.0532, lng: -118.2427 },
          { lat: 34.0522, lng: -118.2427 },
        ],
      },
    },
    {
      id: 'LL002',
      propertyId: 'PROP-002',
      propertyName: 'Wind Turbine Corridor B',
      lessee: 'Green Power Solutions',
      lessor: 'State Land Commission',
      startDate: new Date('2020-06-01'),
      endDate: new Date('2025-06-01'),
      status: 'active',
      monthlyRent: 22000,
      totalArea: 500,
      areaUnit: 'acres',
      paymentStatus: 'overdue',
      lastPaymentDate: new Date('2024-02-01'),
      nextPaymentDue: new Date('2024-03-01'),
      documents: [],
      coordinates: {
        lat: 35.0522,
        lng: -117.2437,
        boundaries: [],
      },
    },
    {
      id: 'LL003',
      propertyId: 'PROP-003',
      propertyName: 'Substation Site C',
      lessee: 'Regional Grid Operator',
      lessor: 'Municipal Authority',
      startDate: new Date('2019-03-15'),
      endDate: new Date('2024-03-15'),
      status: 'expired',
      monthlyRent: 8500,
      totalArea: 10,
      areaUnit: 'acres',
      paymentStatus: 'current',
      documents: [],
      coordinates: {
        lat: 33.9522,
        lng: -118.3437,
        boundaries: [],
      },
    },
  ];

  const payments: Payment[] = [
    {
      id: 'PAY001',
      leaseId: 'LL001',
      amount: 15000,
      dueDate: new Date('2024-03-01'),
      paidDate: new Date('2024-03-01'),
      status: 'paid',
      method: 'bank_transfer',
      reference: 'TRX-2024-03-001',
    },
    {
      id: 'PAY002',
      leaseId: 'LL001',
      amount: 15000,
      dueDate: new Date('2024-04-01'),
      status: 'pending',
    },
    {
      id: 'PAY003',
      leaseId: 'LL002',
      amount: 22000,
      dueDate: new Date('2024-03-01'),
      status: 'overdue',
    },
  ];

  const complianceItems: ComplianceItem[] = [
    {
      id: 'COMP001',
      leaseId: 'LL001',
      requirement: 'Annual Environmental Impact Review',
      category: 'environmental',
      status: 'compliant',
      dueDate: new Date('2024-06-01'),
      lastReviewDate: new Date('2023-06-01'),
      documents: ['DOC002'],
    },
    {
      id: 'COMP002',
      leaseId: 'LL001',
      requirement: 'Liability Insurance Coverage',
      category: 'insurance',
      status: 'pending_review',
      dueDate: new Date('2024-04-15'),
      documents: [],
    },
    {
      id: 'COMP003',
      leaseId: 'LL002',
      requirement: 'Zoning Permit Renewal',
      category: 'zoning',
      status: 'expired',
      dueDate: new Date('2024-02-01'),
      documents: [],
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'NOT001',
      leaseId: 'LL002',
      type: 'payment_due',
      priority: 'high',
      message: 'Payment overdue for Wind Turbine Corridor B - $22,000',
      date: new Date('2024-03-01'),
      isRead: false,
    },
    {
      id: 'NOT002',
      leaseId: 'LL003',
      type: 'lease_expiry',
      priority: 'critical',
      message: 'Lease expired for Substation Site C - Renewal required',
      date: new Date('2024-03-15'),
      isRead: false,
    },
    {
      id: 'NOT003',
      leaseId: 'LL001',
      type: 'compliance_alert',
      priority: 'medium',
      message: 'Insurance documentation pending review',
      date: new Date('2024-03-20'),
      isRead: false,
    },
  ];

  // Filter leases
  const filteredLeases = leases.filter(lease => {
    const matchesSearch = lease.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lease.lessee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lease.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lease.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalLeases: leases.length,
    activeLeases: leases.filter(l => l.status === 'active').length,
    totalMonthlyRevenue: leases.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthlyRent, 0),
    totalArea: leases.reduce((sum, l) => sum + l.totalArea, 0),
    overduePayments: payments.filter(p => p.status === 'overdue').length,
    complianceIssues: complianceItems.filter(c => c.status !== 'compliant').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
      case 'compliant':
        return 'text-vanguard-green';
      case 'pending':
      case 'pending_review':
        return 'text-yellow-500';
      case 'expired':
      case 'overdue':
      case 'non_compliant':
        return 'text-vanguard-red';
      case 'terminated':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBadgeVariant = (status: string): any => {
    switch (status) {
      case 'active':
      case 'paid':
      case 'compliant':
        return 'success';
      case 'pending':
      case 'pending_review':
        return 'warning';
      case 'expired':
      case 'overdue':
      case 'non_compliant':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center mb-2">
          <MapIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Land Lease Management System
        </h1>
        <p className="text-gray-400">
          Comprehensive tracking for lease agreements, payments, and compliance
        </p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-r from-vanguard-blue/10 to-transparent border-vanguard-blue/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Leases</p>
              <p className="text-2xl font-bold text-white">{stats.totalLeases}</p>
            </div>
            <HomeIcon className="w-8 h-8 text-vanguard-blue opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-vanguard-green/10 to-transparent border-vanguard-green/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Active Leases</p>
              <p className="text-2xl font-bold text-white">{stats.activeLeases}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-vanguard-green opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-seraphim-gold/10 to-transparent border-seraphim-gold/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-white">${stats.totalMonthlyRevenue.toLocaleString()}</p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-transparent border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Area</p>
              <p className="text-2xl font-bold text-white">{stats.totalArea.toLocaleString()} acres</p>
            </div>
            <MapIcon className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-vanguard-red/10 to-transparent border-vanguard-red/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-white">{stats.overduePayments}</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-vanguard-red opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Compliance Issues</p>
              <p className="text-2xl font-bold text-white">{stats.complianceIssues}</p>
            </div>
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Notifications Bar */}
      {notifications.filter(n => !n.isRead).length > 0 && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BellIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-white">
                You have {notifications.filter(n => !n.isRead).length} unread notifications
              </span>
            </div>
            <Button size="sm" variant="secondary">
              View All
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lease List */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-4">Lease Agreements</h3>
              
              {/* Search and Filter */}
              <div className="space-y-3">
                <Input
                  placeholder="Search leases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                
                <div className="flex space-x-2">
                  {(['all', 'active', 'pending', 'expired'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 rounded-md text-xs capitalize transition-colors ${
                        filterStatus === status
                          ? 'bg-seraphim-gold/20 text-seraphim-gold border border-seraphim-gold/30'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lease List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredLeases.map((lease) => (
                <motion.div
                  key={lease.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedLease(lease)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedLease?.id === lease.id
                      ? 'bg-seraphim-gold/10 border-seraphim-gold/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-white">{lease.propertyName}</h4>
                      <p className="text-xs text-gray-400">{lease.id}</p>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(lease.status)}
                      size="small"
                    >
                      {lease.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lessee:</span>
                      <span className="text-white">{lease.lessee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly:</span>
                      <span className="text-white">${lease.monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment:</span>
                      <span className={getStatusColor(lease.paymentStatus)}>
                        {lease.paymentStatus}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => setShowAddLease(true)}
              >
                Add New Lease
              </Button>
            </div>
          </Card>
        </div>

        {/* Lease Details */}
        <div className="lg:col-span-2">
          {selectedLease ? (
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <HomeIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
                    Lease Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-400">Property Name</label>
                        <p className="text-sm font-medium text-white">{selectedLease.propertyName}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-400">Lessee</label>
                        <p className="text-sm font-medium text-white">{selectedLease.lessee}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-400">Lessor</label>
                        <p className="text-sm font-medium text-white">{selectedLease.lessor}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-400">Lease Period</label>
                        <p className="text-sm font-medium text-white">
                          {selectedLease.startDate.toLocaleDateString()} - {selectedLease.endDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-400">Monthly Rent</label>
                        <p className="text-sm font-medium text-white">
                          ${selectedLease.monthlyRent.toLocaleString()}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-400">Total Area</label>
                        <p className="text-sm font-medium text-white">
                          {selectedLease.totalArea} {selectedLease.areaUnit}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-400">Status</label>
                        <Badge variant={getStatusBadgeVariant(selectedLease.status)}>
                          {selectedLease.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-400">Payment Status</label>
                        <Badge variant={getStatusBadgeVariant(selectedLease.paymentStatus)}>
                          {selectedLease.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Property Map Placeholder */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      Property Location
                    </h4>
                    <div className="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Map View Placeholder</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
                    Payment History
                  </h3>
                  
                  <div className="space-y-3">
                    {payments
                      .filter(p => p.leaseId === selectedLease.id)
                      .map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              ${payment.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              Due: {payment.dueDate.toLocaleDateString()}
                              {payment.paidDate && ` • Paid: ${payment.paidDate.toLocaleDateString()}`}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {payment.method && (
                              <span className="text-xs text-gray-400 capitalize">
                                {payment.method.replace('_', ' ')}
                              </span>
                            )}
                            <Badge variant={getStatusBadgeVariant(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <Button size="sm" variant="primary">
                      Record Payment
                    </Button>
                    <Button size="sm" variant="secondary">
                      Generate Invoice
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
                    Documents
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedLease.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <PaperClipIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-white">{doc.name}</p>
                            <p className="text-xs text-gray-400">
                              {doc.type} • {doc.size} • {doc.uploadDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <Badge variant={getStatusBadgeVariant(doc.status)} size="small">
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Button size="sm" variant="primary">
                      Upload Document
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Compliance Tab */}
              <TabsContent value="compliance">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
                    Compliance Tracking
                  </h3>
                  
                  <div className="space-y-3">
                    {complianceItems
                      .filter(c => c.leaseId === selectedLease.id)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-white">{item.requirement}</p>
                              <p className="text-xs text-gray-400 capitalize">
                                {item.category} • Due: {item.dueDate?.toLocaleDateString() || 'N/A'}
                              </p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(item.status)} size="small">
                              {item.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          {item.lastReviewDate && (
                            <p className="text-xs text-gray-400">
                              Last reviewed: {item.lastReviewDate.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>

                  <div className="mt-4">
                    <Button size="sm" variant="primary">
                      Add Compliance Item
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Communications Tab */}
              <TabsContent value="communications">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
                    Stakeholder Communications
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Communication Thread */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-vanguard-blue rounded-full flex items-center justify-center text-xs text-white">
                          JD
                        </div>
                        <div className="flex-1">
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">John Doe • 2 days ago</p>
                            <p className="text-sm text-white">
                              Please provide updated insurance documentation for the upcoming renewal period.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-seraphim-gold rounded-full flex items-center justify-center text-xs text-black">
                          RE
                        </div>
                        <div className="flex-1">
                          <div className="bg-seraphim-gold/10 rounded-lg p-3 border border-seraphim-gold/30">
                            <p className="text-xs text-gray-400 mb-1">Renewable Energy Corp • 1 day ago</p>
                            <p className="text-sm text-white">
                              Insurance documentation has been submitted for review. Please check the Documents tab.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Message Input */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex space-x-3">
                        <Input
                          placeholder="Type your message..."
                          className="flex-1"
                        />
                        <Button size="sm" variant="primary">
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <MapIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Select a Lease Agreement
                </h3>
                <p className="text-sm text-gray-400">
                  Choose a lease from the list to view details, payments, documents, and more.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add New Lease Modal */}
      <AnimatePresence>
        {showAddLease && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setShowAddLease(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-seraphim-black border border-white/10 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Add New Lease Agreement
              </h3>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Property Name
                    </label>
                    <Input placeholder="Enter property name" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Property ID
                    </label>
                    <Input placeholder="Enter property ID" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Lessee
                    </label>
                    <Input placeholder="Enter lessee name" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Lessor
                    </label>
                    <Input placeholder="Enter lessor name" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Start Date
                    </label>
                    <Input type="date" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      End Date
                    </label>
                    <Input type="date" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Monthly Rent
                    </label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Total Area
                    </label>
                    <div className="flex space-x-2">
                      <Input type="number" placeholder="0" className="flex-1" />
                      <select className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white">
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                        <option value="sqft">Sq Ft</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddLease(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Create Lease
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandLeaseManagement;