import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentCheckIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  FingerPrintIcon,
  ClockIcon,
  ChartBarIcon,
  LockClosedIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface CertificationResult {
  id: string;
  workflowId: string;
  timestamp: Date;
  dataQuality: {
    completeness: number;
    accuracy: number;
    consistency: number;
  };
  complianceStatus: {
    passed: string[];
    failed: string[];
    warnings: string[];
  };
  signature: string;
  certificate: {
    url: string;
    hash: string;
  };
  metadata: {
    recordsProcessed: number;
    processingTime: string;
    agentsExecuted: number;
  };
}

interface CertificationResultsProps {
  workflowId?: string;
  useCaseId?: string;
  isActive: boolean;
}

const CertificationResults: React.FC<CertificationResultsProps> = ({
  workflowId,
  useCaseId,
  isActive,
}) => {
  const [certification, setCertification] = useState<CertificationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isActive && workflowId) {
      generateCertification();
    }
  }, [isActive, workflowId]);

  const generateCertification = async () => {
    setIsGenerating(true);
    
    // Simulate certification generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const certResult: CertificationResult = {
      id: `cert-${Date.now()}`,
      workflowId: workflowId || '',
      timestamp: new Date(),
      dataQuality: {
        completeness: 98.5,
        accuracy: 96.2,
        consistency: 99.1,
      },
      complianceStatus: {
        passed: [
          'EPA Environmental Standards',
          'BLM Land Use Regulations',
          'Texas Railroad Commission Requirements',
          'Data Privacy Compliance',
          'Financial Reporting Standards',
        ],
        failed: [],
        warnings: [
          'Two leases approaching expiration within 30 days',
          'Minor data formatting inconsistencies in 3 records',
        ],
      },
      signature: generateDigitalSignature(),
      certificate: {
        url: `/certificates/${workflowId}-cert.pdf`,
        hash: generateHash(),
      },
      metadata: {
        recordsProcessed: 847,
        processingTime: '3m 42s',
        agentsExecuted: 6,
      },
    };
    
    setCertification(certResult);
    setIsGenerating(false);
  };

  const generateDigitalSignature = (): string => {
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const generateHash = (): string => {
    return 'SHA256:' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const getQualityColor = (value: number): string => {
    if (value >= 95) return 'text-vanguard-green';
    if (value >= 85) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getQualityBgColor = (value: number): string => {
    if (value >= 95) return 'bg-vanguard-green';
    if (value >= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isGenerating) {
    return (
      <Card variant="glass-dark" effect="glow">
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <DocumentCheckIcon className="h-16 w-16 text-seraphim-gold" />
              <ArrowPathIcon className="absolute inset-0 h-16 w-16 text-seraphim-gold/50 animate-spin" />
            </div>
            <p className="text-sm text-white mt-4">Generating certification...</p>
            <p className="text-xs text-gray-400 mt-2">Validating data quality and compliance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!certification) {
    return (
      <Card variant="glass-dark" effect="glow">
        <CardContent>
          <div className="text-center py-12">
            <DocumentCheckIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-sm text-gray-400">No certification available</p>
            <p className="text-xs text-gray-500 mt-2">Complete a workflow to generate certification</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Certification Overview */}
      <Card variant="gradient" effect="shimmer">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-seraphim-gold mr-2" />
              Data Certification
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-vanguard-green" />
              <span className="text-sm text-vanguard-green">Certified</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Data Quality Metrics */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-2 text-seraphim-gold" />
                Data Quality
              </h4>
              {Object.entries(certification.dataQuality).map(([metric, value]) => (
                <div key={metric} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 capitalize">{metric}</span>
                    <span className={`text-sm font-semibold ${getQualityColor(value)}`}>
                      {value.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${getQualityBgColor(value)}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance Status */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center">
                <ShieldCheckIcon className="h-4 w-4 mr-2 text-seraphim-gold" />
                Compliance Status
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-vanguard-green/10 rounded-lg">
                  <span className="text-xs text-gray-300">Passed</span>
                  <span className="text-sm font-semibold text-vanguard-green">
                    {certification.complianceStatus.passed.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg">
                  <span className="text-xs text-gray-300">Warnings</span>
                  <span className="text-sm font-semibold text-yellow-500">
                    {certification.complianceStatus.warnings.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg">
                  <span className="text-xs text-gray-300">Failed</span>
                  <span className="text-sm font-semibold text-red-500">
                    {certification.complianceStatus.failed.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Processing Metadata */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center">
                <ClockIcon className="h-4 w-4 mr-2 text-seraphim-gold" />
                Processing Details
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Records Processed</span>
                  <span className="text-gray-300">{certification.metadata.recordsProcessed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Processing Time</span>
                  <span className="text-gray-300">{certification.metadata.processingTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Agents Executed</span>
                  <span className="text-gray-300">{certification.metadata.agentsExecuted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Certified At</span>
                  <span className="text-gray-300">{certification.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            <Button
              variant="primary"
              size="small"
              className="flex items-center"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Download Certificate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Compliance Details */}
            <Card variant="glass-dark" effect="glow">
              <CardHeader>
                <CardTitle className="text-sm">Compliance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certification.complianceStatus.passed.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-vanguard-green mb-2">
                        Passed Requirements ({certification.complianceStatus.passed.length})
                      </h5>
                      <div className="space-y-1">
                        {certification.complianceStatus.passed.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs">
                            <CheckCircleIcon className="h-3 w-3 text-vanguard-green" />
                            <span className="text-gray-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {certification.complianceStatus.warnings.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-yellow-500 mb-2">
                        Warnings ({certification.complianceStatus.warnings.length})
                      </h5>
                      <div className="space-y-1">
                        {certification.complianceStatus.warnings.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs">
                            <ExclamationTriangleIcon className="h-3 w-3 text-yellow-500" />
                            <span className="text-gray-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Digital Signature */}
            <Card variant="glass-dark" effect="glow">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <FingerPrintIcon className="h-4 w-4 mr-2 text-seraphim-gold" />
                  Digital Signature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Signature</p>
                    <p className="text-xs font-mono text-gray-300 break-all bg-black/50 p-2 rounded">
                      {certification.signature}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Certificate Hash</p>
                    <p className="text-xs font-mono text-gray-300 break-all bg-black/50 p-2 rounded">
                      {certification.certificate.hash}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <LockClosedIcon className="h-3 w-3" />
                    <span>Cryptographically signed and tamper-proof</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificationResults;