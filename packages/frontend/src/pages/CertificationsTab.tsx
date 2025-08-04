import React, { useState, useEffect } from 'react';
import { useUseCaseContext } from '../contexts/UseCaseContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import CertificationResults from '../components/CertificationResults';
import {
  DocumentCheckIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface CertificationRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  useCaseId: string;
  useCaseName: string;
  timestamp: Date;
  status: 'certified' | 'pending' | 'failed';
  dataQuality: number;
  complianceScore: number;
}

const CertificationsTab: React.FC = () => {
  const { activeUseCaseId, useCases } = useUseCaseContext();
  const [certifications, setCertifications] = useState<CertificationRecord[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'certified' | 'pending' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load mock certification records
    loadCertifications();
  }, []);

  const loadCertifications = () => {
    const mockCertifications: CertificationRecord[] = [
      {
        id: 'cert-1',
        workflowId: 'workflow-oilfield-1',
        workflowName: 'Oilfield Land Lease Analysis',
        useCaseId: 'oilfield-land-lease',
        useCaseName: 'Oilfield Land Lease',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'certified',
        dataQuality: 97.9,
        complianceScore: 100,
      },
      {
        id: 'cert-2',
        workflowId: 'workflow-energy-1',
        workflowName: 'Energy Load Forecast',
        useCaseId: 'energy-load-forecasting',
        useCaseName: 'Energy Load Forecasting',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'certified',
        dataQuality: 95.3,
        complianceScore: 98,
      },
      {
        id: 'cert-3',
        workflowId: 'workflow-insurance-1',
        workflowName: 'Claims Processing',
        useCaseId: 'insurance-claims',
        useCaseName: 'Insurance Claims',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        status: 'pending',
        dataQuality: 0,
        complianceScore: 0,
      },
    ];

    // Add active workflow certification if exists
    if (activeUseCaseId) {
      const activeUseCase = useCases.find(uc => uc.id === activeUseCaseId);
      if (activeUseCase) {
        mockCertifications.unshift({
          id: 'cert-active',
          workflowId: `workflow-${activeUseCaseId}-active`,
          workflowName: `${activeUseCase.name} Mission`,
          useCaseId: activeUseCaseId,
          useCaseName: activeUseCase.name,
          timestamp: new Date(),
          status: 'certified',
          dataQuality: 98.5,
          complianceScore: 100,
        });
      }
    }

    setCertifications(mockCertifications);
  };

  const getStatusColor = (status: CertificationRecord['status']) => {
    switch (status) {
      case 'certified':
        return 'text-vanguard-green bg-vanguard-green/20';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'failed':
        return 'text-red-500 bg-red-500/20';
    }
  };

  const filteredCertifications = certifications
    .filter(cert => filter === 'all' || cert.status === filter)
    .filter(cert => 
      searchTerm === '' || 
      cert.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.useCaseName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <ClipboardDocumentCheckIcon className="h-8 w-8 text-seraphim-gold mr-3" />
          Data Certifications
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          View and manage data quality certifications for all workflows
        </p>
      </div>

      {/* Active Certification */}
      {activeUseCaseId && selectedCertification === 'cert-active' && (
        <div className="mb-6">
          <CertificationResults
            workflowId={`workflow-${activeUseCaseId}-active`}
            useCaseId={activeUseCaseId}
            isActive={true}
          />
        </div>
      )}

      {/* Certifications List */}
      <Card variant="gradient" effect="shimmer">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <DocumentCheckIcon className="h-5 w-5 text-seraphim-gold mr-2" />
              Certification History
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-seraphim-gold/50"
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-seraphim-gold/50"
                >
                  <option value="all">All Status</option>
                  <option value="certified">Certified</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCertifications.map((cert) => (
              <motion.div
                key={cert.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedCertification(
                  selectedCertification === cert.id ? null : cert.id
                )}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedCertification === cert.id
                    ? 'border-seraphim-gold/50 bg-seraphim-gold/5'
                    : 'border-white/10 bg-black/30 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-semibold text-white">{cert.workflowName}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(cert.status)}`}>
                        {cert.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>{cert.useCaseName}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {cert.timestamp.toLocaleDateString()}
                      </span>
                      {cert.status === 'certified' && (
                        <>
                          <span>•</span>
                          <span>Quality: {cert.dataQuality}%</span>
                          <span>•</span>
                          <span>Compliance: {cert.complianceScore}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {cert.status === 'certified' && (
                    <div className="ml-4">
                      <DocumentCheckIcon className="h-6 w-6 text-vanguard-green" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {filteredCertifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <DocumentCheckIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No certifications found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Certification Details */}
      {selectedCertification && selectedCertification !== 'cert-active' && (
        <div className="mt-6">
          <CertificationResults
            workflowId={certifications.find(c => c.id === selectedCertification)?.workflowId}
            useCaseId={certifications.find(c => c.id === selectedCertification)?.useCaseId}
            isActive={certifications.find(c => c.id === selectedCertification)?.status === 'certified'}
          />
        </div>
      )}
    </div>
  );
};

export default CertificationsTab;