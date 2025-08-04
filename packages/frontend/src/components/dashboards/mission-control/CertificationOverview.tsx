import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { api } from '../../../services/api';

interface CertificationOverviewProps {
  filters: any;
  searchQuery: string;
}

interface CertificationItem {
  id: string;
  type: 'security' | 'integrity' | 'accuracy';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  autoFixAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  affectedResources: string[];
}

const CertificationOverview: React.FC<CertificationOverviewProps> = ({ filters, searchQuery }) => {
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock data
  const mockCertifications: CertificationItem[] = [
    {
      id: '1',
      type: 'security',
      title: 'Unauthorized Access Attempt Detected',
      description: 'Multiple failed login attempts from unknown IP addresses',
      severity: 'critical',
      status: 'open',
      autoFixAvailable: true,
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z',
      affectedResources: ['User Authentication Service', 'API Gateway'],
    },
    {
      id: '2',
      type: 'integrity',
      title: 'Data Consistency Issue in Lease Records',
      description: 'Mismatch between primary and backup database records',
      severity: 'high',
      status: 'in_progress',
      autoFixAvailable: true,
      createdAt: '2024-02-01T09:30:00Z',
      updatedAt: '2024-02-01T11:00:00Z',
      affectedResources: ['Lease Database', 'Backup System'],
    },
    {
      id: '3',
      type: 'accuracy',
      title: 'Production Data Calculation Error',
      description: 'Incorrect aggregation of daily production volumes',
      severity: 'medium',
      status: 'open',
      autoFixAvailable: true,
      createdAt: '2024-02-01T08:00:00Z',
      updatedAt: '2024-02-01T08:00:00Z',
      affectedResources: ['Production Analytics', 'Reporting Engine'],
    },
    {
      id: '4',
      type: 'security',
      title: 'Expired SSL Certificate',
      description: 'SSL certificate for internal API will expire in 7 days',
      severity: 'medium',
      status: 'open',
      autoFixAvailable: true,
      createdAt: '2024-02-01T07:00:00Z',
      updatedAt: '2024-02-01T07:00:00Z',
      affectedResources: ['Internal API', 'Certificate Manager'],
    },
    {
      id: '5',
      type: 'integrity',
      title: 'Missing Audit Trail Entries',
      description: 'Some user actions are not being logged properly',
      severity: 'low',
      status: 'resolved',
      autoFixAvailable: false,
      createdAt: '2024-01-31T15:00:00Z',
      updatedAt: '2024-02-01T06:00:00Z',
      affectedResources: ['Audit Service', 'User Activity Monitor'],
    },
  ];

  useEffect(() => {
    loadCertifications();
  }, [filters, searchQuery]);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      // In production, this would fetch real data
      // const response = await api.get('/v2/certifications/issues', { params: filters });
      // setCertifications(response.data.data);
      
      // Filter mock data based on filters and search
      let filtered = mockCertifications;
      
      if (filters.certification !== 'all') {
        filtered = filtered.filter(c => c.type === filters.certification);
      }
      
      if (filters.severity !== 'all') {
        filtered = filtered.filter(c => c.severity === filters.severity);
      }
      
      if (filters.status !== 'all') {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(c => 
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
        );
      }
      
      setCertifications(filtered);
    } catch (error) {
      console.error('Failed to load certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return ShieldCheckIcon;
      case 'integrity':
        return ShieldExclamationIcon;
      case 'accuracy':
        return CheckCircleIcon;
      default:
        return ShieldExclamationIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'text-blue-600 bg-blue-100';
      case 'integrity':
        return 'text-green-600 bg-green-100';
      case 'accuracy':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return ExclamationCircleIcon;
      case 'high':
        return ExclamationTriangleIcon;
      case 'medium':
        return InformationCircleIcon;
      case 'low':
        return InformationCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-red-600';
      case 'in_progress':
        return 'text-yellow-600';
      case 'resolved':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === certifications.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(certifications.map(c => c.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedItems.length === certifications.length && certifications.length > 0}
            onChange={handleSelectAll}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-600">
            {selectedItems.length} of {certifications.length} selected
          </span>
        </div>
        
        {selectedItems.length > 0 && (
          <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
            Apply Fix to Selected
          </button>
        )}
      </div>

      {/* Certifications List */}
      <div className="space-y-3">
        {certifications.map((cert) => {
          const TypeIcon = getTypeIcon(cert.type);
          const SeverityIcon = getSeverityIcon(cert.severity);
          
          return (
            <div
              key={cert.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(cert.id)}
                  onChange={() => handleSelectItem(cert.id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                
                <div className={`p-2 rounded-lg ${getTypeColor(cert.type)}`}>
                  <TypeIcon className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{cert.title}</h4>
                      <p className="mt-1 text-sm text-gray-600">{cert.description}</p>
                      
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <SeverityIcon className={`h-4 w-4 ${getSeverityColor(cert.severity).split(' ')[0]}`} />
                          <span className="capitalize">{cert.severity}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span className={getStatusColor(cert.status)}>
                            {cert.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {cert.autoFixAvailable && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <WrenchScrewdriverIcon className="h-4 w-4" />
                            <span>Auto-fix available</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Affected: {cert.affectedResources.join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    <button className="text-gray-400 hover:text-gray-500">
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {certifications.length === 0 && (
        <div className="text-center py-12">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No issues found</h3>
          <p className="mt-1 text-sm text-gray-500">
            All certifications are passing. Great job!
          </p>
        </div>
      )}
    </div>
  );
};

export default CertificationOverview;