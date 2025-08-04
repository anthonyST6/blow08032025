import React, { useState, useEffect, Fragment } from 'react';
import { api } from '../../../services/api';
import { Dialog, Transition } from '@headlessui/react';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  DocumentMagnifyingGlassIcon,
  ClockIcon,
  SparklesIcon,
  ChartBarIcon,
  InformationCircleIcon,
  PlayIcon,
  CheckIcon,
  BellAlertIcon,
  DocumentTextIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckIconSolid } from '@heroicons/react/24/solid';

// Custom Security Icon - Shield with Plus (matching original design)
const SecurityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 3v6c0 5.5-3.5 10.5-8 11.8-4.5-1.3-8-6.3-8-11.8V5l8-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
  </svg>
);

// Custom Integrity Icon - Sword pointing down (matching original design)
const IntegrityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {/* Pommel */}
    <circle cx="12" cy="3" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Handle */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5h3v3h-3z" />
    {/* Cross guard */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10" />
    {/* Blade */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v10" />
    {/* Blade edges */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 8v9.5L12 20l1.5-2.5V8" />
  </svg>
);

// Certification status types
type CertStatus = 'passed' | 'failed' | 'fixing' | 'pending';

interface Certification {
  id: string;
  type: 'security' | 'integrity' | 'accuracy';
  status: CertStatus;
  score: number;
  failureReason?: string;
  autoFixAvailable: boolean;
  lastChecked: string;
  fixHistory: FixAttempt[];
  details: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    sourcesSynced: number;
    recordsProcessed: number;
    anomaliesDetected: number;
  };
}

interface FixAttempt {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  result: 'success' | 'failed' | 'pending';
  details: string;
  systemsUpdated: string[];
}

const CertificationsDashboard: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [showDetailReport, setShowDetailReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'lineage' | 'audit' | 'actions'>('overview');
  const [loading, setLoading] = useState(true);
  const [autoFixInProgress, setAutoFixInProgress] = useState<string[]>([]);

  useEffect(() => {
    loadCertificationData();
    
    // Simulate real-time updates for auto-fix progress
    const interval = setInterval(() => {
      checkAutoFixProgress();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const loadCertificationData = async () => {
    try {
      setLoading(true);
      // Simulate API call with realistic data
      setTimeout(() => {
        const mockCerts: Certification[] = [
          {
            id: 'CERT-SEC-001',
            type: 'security',
            status: 'passed',
            score: 98,
            autoFixAvailable: false,
            lastChecked: new Date().toISOString(),
            fixHistory: [],
            details: {
              totalChecks: 150,
              passedChecks: 147,
              failedChecks: 3,
              sourcesSynced: 12,
              recordsProcessed: 1247,
              anomaliesDetected: 0,
            },
          },
          {
            id: 'CERT-INT-001',
            type: 'integrity',
            status: 'failed',
            score: 85,
            failureReason: 'Data inconsistency detected: 23 lease records in ERP do not match CLM values',
            autoFixAvailable: true,
            lastChecked: new Date(Date.now() - 300000).toISOString(),
            fixHistory: [
              {
                id: 'FIX-001',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                agent: 'Integrity Vanguard',
                action: 'Synchronized lease metadata between ERP and CLM',
                result: 'failed',
                details: 'Partial sync completed, 3 records require manual review due to conflicting data',
                systemsUpdated: ['SAP', 'Quorum CLM'],
              },
            ],
            details: {
              totalChecks: 200,
              passedChecks: 170,
              failedChecks: 30,
              sourcesSynced: 8,
              recordsProcessed: 1247,
              anomaliesDetected: 23,
            },
          },
          {
            id: 'CERT-ACC-001',
            type: 'accuracy',
            status: 'fixing',
            score: 92,
            failureReason: 'Missing critical data: 5 leases lack expiration dates, 3 missing royalty terms',
            autoFixAvailable: true,
            lastChecked: new Date(Date.now() - 600000).toISOString(),
            fixHistory: [
              {
                id: 'FIX-002',
                timestamp: new Date(Date.now() - 120000).toISOString(),
                agent: 'Accuracy Vanguard',
                action: 'Retrieving missing lease data from document repository',
                result: 'pending',
                details: 'Processing 8 lease documents with NLP extraction...',
                systemsUpdated: ['SharePoint', 'Oracle ERP'],
              },
            ],
            details: {
              totalChecks: 175,
              passedChecks: 161,
              failedChecks: 14,
              sourcesSynced: 10,
              recordsProcessed: 1247,
              anomaliesDetected: 8,
            },
          },
        ];
        setCertifications(mockCerts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load certification data:', error);
      setLoading(false);
    }
  };

  const checkAutoFixProgress = async () => {
    // Check status of ongoing fixes
    const fixingCerts = certifications.filter(c => c.status === 'fixing');
    fixingCerts.forEach(cert => {
      // Simulate fix completion
      if (Math.random() > 0.7) {
        updateCertificationStatus(cert.id, 'passed');
        addSystemNotification(cert, 'success');
      }
    });
  };

  const updateCertificationStatus = (certId: string, newStatus: CertStatus) => {
    setCertifications(prev => prev.map(cert => 
      cert.id === certId 
        ? { 
            ...cert, 
            status: newStatus, 
            score: newStatus === 'passed' ? 100 : cert.score,
            details: newStatus === 'passed' 
              ? { ...cert.details, failedChecks: 0, anomaliesDetected: 0 }
              : cert.details
          }
        : cert
    ));
  };

  const triggerAutoFix = async (cert: Certification) => {
    if (!cert.autoFixAvailable || cert.status === 'fixing') return;
    
    setAutoFixInProgress(prev => [...prev, cert.id]);
    updateCertificationStatus(cert.id, 'fixing');
    
    // Add new fix attempt
    const newFixAttempt: FixAttempt = {
      id: `FIX-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agent: getAgentForCertType(cert.type),
      action: getFixActionForCertType(cert.type),
      result: 'pending',
      details: 'Initiating automated remediation sequence...',
      systemsUpdated: getSystemsForCertType(cert.type),
    };
    
    setCertifications(prev => prev.map(c => 
      c.id === cert.id 
        ? { ...c, fixHistory: [...c.fixHistory, newFixAttempt] }
        : c
    ));
    
    // Simulate fix process with realistic timing
    setTimeout(() => {
      setAutoFixInProgress(prev => prev.filter(id => id !== cert.id));
      // 80% success rate
      if (Math.random() > 0.2) {
        updateCertificationStatus(cert.id, 'passed');
        addSystemNotification(cert, 'success');
      } else {
        updateCertificationStatus(cert.id, 'failed');
        addSystemNotification(cert, 'failed');
      }
    }, 5000);
  };

  const getAgentForCertType = (type: string) => {
    const agents = {
      security: 'Security Vanguard',
      integrity: 'Integrity Vanguard',
      accuracy: 'Accuracy Vanguard',
    };
    return agents[type as keyof typeof agents];
  };

  const getFixActionForCertType = (type: string) => {
    const actions = {
      security: 'Updating access controls and synchronizing permissions across systems',
      integrity: 'Cross-referencing and synchronizing data between ERP, CLM, and GIS',
      accuracy: 'Extracting missing data from contracts and updating metadata',
    };
    return actions[type as keyof typeof actions];
  };

  const getSystemsForCertType = (type: string) => {
    const systems = {
      security: ['Active Directory', 'SAP Security', 'SharePoint Permissions'],
      integrity: ['SAP ERP', 'Quorum CLM', 'ArcGIS'],
      accuracy: ['Oracle ERP', 'SharePoint DMS', 'Enverus'],
    };
    return systems[type as keyof typeof systems];
  };

  const addSystemNotification = (cert: Certification, result: 'success' | 'failed') => {
    // In real implementation, this would send to notification service
    console.log(`${result === 'success' ? '✅' : '❌'} ${cert.type} certification ${result === 'success' ? 'fixed' : 'fix failed'}`);
  };

  const getCertIcon = (type: string) => {
    switch (type) {
      case 'security':
        return SecurityIcon;
      case 'integrity':
        return IntegrityIcon;
      case 'accuracy':
        return ScaleIcon;
      default:
        return ShieldCheckIcon;
    }
  };

  const getStatusIcon = (status: CertStatus) => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case 'fixing':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Fixed colors for each metric matching the original design
  const metricColors = {
    security: '#3B82F6', // Blue
    integrity: '#EF4444', // Red
    accuracy: '#10B981', // Green
  };

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Header with Seraphim Branding */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <ShieldCheckIconSolid className="h-8 w-8 text-white" />
          </div>
          SIA Certifications Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Trust verification with autonomous remediation powered by Vanguard agents
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Compliance</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {Math.round(certifications.reduce((acc, cert) => acc + cert.score, 0) / certifications.length || 0)}%
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-400" />
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Across all certifications
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Auto-Fixes Today</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">247</p>
            </div>
            <WrenchScrewdriverIcon className="h-8 w-8 text-blue-400" />
          </div>
          <p className="mt-2 text-xs text-green-600">
            94% success rate
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Active Issues</p>
              <p className="mt-1 text-2xl font-bold text-red-600">
                {certifications.filter(c => c.status === 'failed').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
          </div>
          <p className="mt-2 text-xs text-gray-600">
            {certifications.filter(c => c.autoFixAvailable).length} auto-fixable
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Systems Updated</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">12</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="mt-2 text-xs text-gray-600">
            ERP, CLM, GIS synced
          </p>
        </div>
      </div>

      {/* SIA Certification Status - Mission Control Style */}
      <div className="mb-8">
        <div className="bg-gray-900 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-amber-400" />
              SIA Governance Metrics
            </h2>
            <p className="text-sm text-gray-400">Click any metric for detailed report</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certifications.map((cert) => {
              const Icon = getCertIcon(cert.type);
              const color = metricColors[cert.type];
              
              return (
                <div key={cert.id} className="relative">
                  {/* Dark card background */}
                  <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
                    {/* Clickable Metric Area */}
                    <div
                      onClick={() => {
                        setSelectedCert(cert);
                        setShowDetailReport(true);
                      }}
                      className="relative cursor-pointer group"
                    >
                      {/* Glowing circle effect */}
                      <div className="relative mx-auto w-40 h-40">
                        {/* Outer glow */}
                        <div 
                          className="absolute inset-0 rounded-full opacity-20 blur-xl"
                          style={{ backgroundColor: color }}
                        />
                        
                        {/* Progress ring */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          {/* Background circle */}
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                            fill="none"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke={color}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - cert.score / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 filter drop-shadow-lg"
                            style={{
                              filter: `drop-shadow(0 0 6px ${color})`
                            }}
                          />
                        </svg>
                        
                        {/* Center content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <Icon className="h-10 w-10 mb-2" style={{ color }} />
                          <p className="text-3xl font-bold text-white">{cert.score}%</p>
                        </div>
                      </div>
                      
                      {/* Label */}
                      <p className="text-center mt-4 text-sm font-medium text-gray-300 capitalize">
                        {cert.type}
                      </p>
                      
                      {/* Status indicator */}
                      <div className="absolute bottom-6 right-6">
                        {getStatusIcon(cert.status)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons below card */}
                  <div className="mt-3">
                    {cert.status === 'failed' && cert.autoFixAvailable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerAutoFix(cert);
                        }}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
                        Auto-Fix Available
                      </button>
                    )}
                    
                    {cert.status === 'fixing' && (
                      <div className="w-full inline-flex items-center justify-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50">
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Vanguard Agent Working...
                      </div>
                    )}
                    
                    {cert.status === 'passed' && (
                      <div className="w-full inline-flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Fully Compliant
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Information Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('lineage')}
              className={`${
                activeTab === 'lineage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Data Lineage
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Audit Log
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`${
                activeTab === 'actions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <SparklesIcon className="h-4 w-4" />
              Agent Actions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {certifications.map((cert) => (
                  <div key={cert.id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 capitalize">{cert.type} Certification</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Checks</span>
                        <span className="font-medium">{cert.details.totalChecks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Passed</span>
                        <span className="font-medium text-green-600">{cert.details.passedChecks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Failed</span>
                        <span className="font-medium text-red-600">{cert.details.failedChecks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Anomalies</span>
                        <span className="font-medium">{cert.details.anomaliesDetected}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'lineage' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Flow & Verification Path</h3>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                      <DocumentMagnifyingGlassIcon className="h-10 w-10 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium">Sources</p>
                    <p className="text-xs text-gray-500">ERP/CLM/GIS</p>
                  </div>
                  <div className="flex-1 px-4">
                    <div className="h-0.5 bg-gray-300 relative">
                      <div className="absolute inset-0 bg-blue-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                      <SparklesIcon className="h-10 w-10 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium">Vanguards</p>
                    <p className="text-xs text-gray-500">Process</p>
                  </div>
                  <div className="flex-1 px-4">
                    <div className="h-0.5 bg-gray-300 relative">
                      <div className="absolute inset-0 bg-purple-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                      <CheckCircleIcon className="h-10 w-10 text-green-600" />
                    </div>
                    <p className="text-sm font-medium">Certified</p>
                    <p className="text-xs text-gray-500">Verified</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto">
                {certifications.flatMap(cert => 
                  cert.fixHistory.map(fix => ({
                    ...fix,
                    certType: cert.type,
                    certId: cert.id,
                  }))
                ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((fix, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      fix.result === 'success' ? 'bg-green-500' :
                      fix.result === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{fix.agent}</p>
                        <p className="text-xs text-gray-500">{new Date(fix.timestamp).toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{fix.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{fix.details}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {fix.systemsUpdated.map((system, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {system}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Autonomous Agent Actions</h3>
                    <p className="mt-1 text-sm text-blue-700">
                      Vanguard agents automatically detect and fix certification failures. When manual intervention is required,
                      action packages are sent to the appropriate teams via Teams, Slack, or Email.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent Agent Actions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span>Security: Updated 47 user permissions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowPathIcon className="h-4 w-4 text-yellow-500 animate-spin" />
                      <span>Integrity: Syncing 23 lease records...</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span>Accuracy: Extracted 8 missing dates</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Human-in-the-Loop Actions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pending Approvals</span>
                      <span className="font-medium text-orange-600">3</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Escalated Today</span>
                      <span className="font-medium">7</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Avg Response Time</span>
                      <span className="font-medium text-green-600">12 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
)}
        </div>
      </div>

      {/* Detail Report Modal */}
      <Transition appear show={showDetailReport} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowDetailReport(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      {selectedCert && React.createElement(getCertIcon(selectedCert.type), {
                        className: "h-6 w-6",
                        style: { color: metricColors[selectedCert.type] }
                      })}
                      {selectedCert?.type.charAt(0).toUpperCase() + selectedCert?.type.slice(1)} Certification Report
                    </span>
                    <button
                      onClick={() => setShowDetailReport(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>
                  
                  {selectedCert && (
                    <div className="mt-4">
                      <div className="bg-gray-800 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">Status</p>
                            <p className="text-sm font-medium text-white flex items-center gap-1 mt-1">
                              {getStatusIcon(selectedCert.status)}
                              {selectedCert.status.charAt(0).toUpperCase() + selectedCert.status.slice(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Score</p>
                            <p className="text-2xl font-bold text-white">{selectedCert.score}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Last Checked</p>
                            <p className="text-sm text-white">{new Date(selectedCert.lastChecked).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Auto-Fix</p>
                            <p className="text-sm text-white">{selectedCert.autoFixAvailable ? 'Available' : 'Not Available'}</p>
                          </div>
                        </div>
                      </div>

                      {selectedCert.failureReason && (
                        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-semibold text-red-400 mb-2">Failure Reason</h4>
                          <p className="text-sm text-gray-300">{selectedCert.failureReason}</p>
                        </div>
                      )}

                      <div className="bg-gray-800 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold text-white mb-3">Certification Details</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">Total Checks</p>
                            <p className="text-lg font-medium text-white">{selectedCert.details.totalChecks}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Passed</p>
                            <p className="text-lg font-medium text-green-400">{selectedCert.details.passedChecks}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Failed</p>
                            <p className="text-lg font-medium text-red-400">{selectedCert.details.failedChecks}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Sources Synced</p>
                            <p className="text-lg font-medium text-white">{selectedCert.details.sourcesSynced}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Records Processed</p>
                            <p className="text-lg font-medium text-white">{selectedCert.details.recordsProcessed}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Anomalies</p>
                            <p className="text-lg font-medium text-yellow-400">{selectedCert.details.anomaliesDetected}</p>
                          </div>
                        </div>
                      </div>

                      {selectedCert.fixHistory.length > 0 && (
                        <div className="bg-gray-800 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-white mb-3">Fix History</h4>
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {selectedCert.fixHistory.map((fix) => (
                              <div key={fix.id} className="bg-gray-700 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-medium text-white">{fix.agent}</p>
                                  <p className="text-xs text-gray-400">{new Date(fix.timestamp).toLocaleString()}</p>
                                </div>
                                <p className="text-sm text-gray-300 mb-2">{fix.action}</p>
                                <p className="text-xs text-gray-400 mb-2">{fix.details}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-wrap gap-1">
                                    {fix.systemsUpdated.map((system, idx) => (
                                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-300">
                                        {system}
                                      </span>
                                    ))}
                                  </div>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    fix.result === 'success' ? 'bg-green-900 text-green-300' :
                                    fix.result === 'failed' ? 'bg-red-900 text-red-300' :
                                    'bg-yellow-900 text-yellow-300'
                                  }`}>
                                    {fix.result}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex justify-end gap-3">
                        {selectedCert.status === 'failed' && selectedCert.autoFixAvailable && (
                          <button
                            onClick={() => {
                              triggerAutoFix(selectedCert);
                              setShowDetailReport(false);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
                            Trigger Auto-Fix
                          </button>
                        )}
                        <button
                          onClick={() => setShowDetailReport(false)}
                          className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CertificationsDashboard;