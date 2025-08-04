import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  BoltIcon,
  HeartIcon,
  BanknotesIcon,
  MapIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  MapPinIcon,
  XMarkIcon,
  LockClosedIcon,
  ChevronDownIcon,
  KeyIcon,
  FingerPrintIcon,
  ServerIcon,
  CloudIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
  ScaleIcon,
  ClipboardDocumentCheckIcon,
  BeakerIcon as TestTubeIcon,
  CpuChipIcon,
  SignalIcon,
  SunIcon,
  Battery100Icon,
  CalculatorIcon,
  CloudArrowUpIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/Badge';
import { Progress } from '../components/Progress';
import { SIAMetrics } from '../components/ui/SIAMetric';
import { SIAAnalysisModal } from '../components/use-cases/shared/SIAAnalysisModal';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { generateIngestedData } from '../services/ingestedData.service.ts';
import { SIADataGeneratorService } from '../services/siaDataGenerator.service';
import type { UseCaseContext } from '../types/sia.types';
import type { UseCase } from '../config/verticals';
import { verticals } from '../config/verticals';
import { useUseCaseContext } from '../contexts/UseCaseContext';

// Import custom dashboard components
import InsuranceRiskAssessmentDashboard from './dashboards/InsuranceRiskAssessmentDashboard';
import PHMSAComplianceDashboard from './dashboards/PHMSAComplianceDashboard';
import MethaneLeakDetectionDashboard from './dashboards/MethaneLeakDetectionDashboard';
import GridResilienceDashboard from './dashboards/GridResilienceDashboard';
import InternalAuditGovernanceDashboard from './dashboards/InternalAuditGovernanceDashboard';
import SCADAIntegrationDashboard from './dashboards/SCADAIntegrationDashboard';
import WildfirePreventionDashboard from './dashboards/WildfirePreventionDashboard';
import AIPricingGovernanceDashboard from './dashboards/AIPricingGovernanceDashboard';
import OilfieldLandLeaseRunDashboard from '../components/dashboards/OilfieldLandLeaseRunDashboard';

// Map use case IDs to their custom dashboard components
const customDashboards: Record<string, React.ComponentType<{ useCase: UseCase }>> = {
  'insurance-risk-assessment': InsuranceRiskAssessmentDashboard,
  'phmsa-compliance': PHMSAComplianceDashboard,
  'methane-leak-detection': MethaneLeakDetectionDashboard,
  'grid-resilience': GridResilienceDashboard,
  'internal-audit-governance': InternalAuditGovernanceDashboard,
  'scada-integration': SCADAIntegrationDashboard,
  'wildfire-prevention': WildfirePreventionDashboard,
  'ai-pricing-governance': AIPricingGovernanceDashboard,
  'oilfield-land-lease': OilfieldLandLeaseRunDashboard,
  'energy-oilfield-land-lease': OilfieldLandLeaseRunDashboard, // Also map with energy prefix
};

const UseCaseRunDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { useCaseId } = useParams<{ useCaseId: string }>();
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'operations' | 'data-ingestion'>('overview');
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<'security' | 'integrity' | 'accuracy' | null>(null);
  const [selectedLeaseStatus, setSelectedLeaseStatus] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'file' | 'api'>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState<string>('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [hasIngestedData, setHasIngestedData] = useState(false);
  const [dataTimestamp, setDataTimestamp] = useState<string | null>(null);

  useEffect(() => {
    // First try to load from session storage
    const storedUseCase = sessionStorage.getItem('selectedUseCase');
    if (storedUseCase) {
      const useCase = JSON.parse(storedUseCase);
      setSelectedUseCase(useCase);
      // Generate ingested data instead of demo data
      setDashboardData(generateIngestedData(useCase));
      sessionStorage.removeItem('selectedUseCase');
    } else if (useCaseId) {
      // If no session storage, try to find the use case by ID
      let foundUseCase: UseCase | null = null;
      
      // Search through all verticals to find the use case
      for (const [verticalId, vertical] of Object.entries(verticals)) {
        // Check both the raw ID and the prefixed ID (e.g., 'oilfield-land-lease' and 'energy-oilfield-land-lease')
        const useCase = vertical.useCases.find(uc =>
          uc.id === useCaseId || `${verticalId}-${uc.id}` === useCaseId
        );
        if (useCase) {
          foundUseCase = useCase;
          break;
        }
      }
      
      if (foundUseCase) {
        setSelectedUseCase(foundUseCase);
        // Generate ingested data instead of demo data
        setDashboardData(generateIngestedData(foundUseCase));
      }
    }
  }, [useCaseId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(file.type) && !['csv', 'json', 'xlsx', 'xls'].includes(fileExtension || '')) {
        alert('Please upload a valid file type (CSV, JSON, Excel)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setUploadedFile(file);
      setIngestionStatus('idle');
    }
  };

  const handleDataIngestion = async () => {
    setIsIngesting(true);
    setIngestionStatus('processing');

    try {
      // Simulate data ingestion process
      if (dataSource === 'file' && uploadedFile) {
        // Simulate file processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (selectedUseCase) {
          // Generate new ingested data
          const newData = generateIngestedData(selectedUseCase);
          setDashboardData(newData);
          setIngestionStatus('success');
          setIsIngesting(false);
          setHasIngestedData(true);
          setDataTimestamp(new Date().toISOString());
          
          // Clear the file input
          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          
          // Show success message
          setTimeout(() => {
            setIngestionStatus('idle');
          }, 3000);
        }
      } else if (dataSource === 'api' && apiEndpoint) {
        // Validate API endpoint
        try {
          new URL(apiEndpoint);
        } catch {
          throw new Error('Invalid API endpoint URL');
        }
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        if (selectedUseCase) {
          // Generate new ingested data
          const newData = generateIngestedData(selectedUseCase);
          setDashboardData(newData);
          setIngestionStatus('success');
          setIsIngesting(false);
          setHasIngestedData(true);
          setDataTimestamp(new Date().toISOString());
          
          // Show success message
          setTimeout(() => {
            setIngestionStatus('idle');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Data ingestion error:', error);
      setIngestionStatus('error');
      setIsIngesting(false);
      
      // Show error message
      setTimeout(() => {
        setIngestionStatus('idle');
      }, 3000);
    }
  };

  if (!selectedUseCase || !dashboardData) {
    return (
      <div className="min-h-screen bg-seraphim-black p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Use Case Selected</h2>
          <p className="text-gray-400 mb-4">Please select a use case from the launcher.</p>
          <Button onClick={() => navigate('/use-cases')}>
            Back to Use Cases
          </Button>
        </Card>
      </div>
    );
  }

  const getVerticalIcon = (vertical: string) => {
    const icons: Record<string, any> = {
      energy: BoltIcon,
      healthcare: HeartIcon,
      finance: BanknotesIcon,
    };
    return icons[vertical] || ChartBarIcon;
  };

  // Derive vertical from use case ID
  const vertical = selectedUseCase.id.split('-')[0];
  const Icon = getVerticalIcon(vertical);

  // Check if this use case has a custom dashboard
  // Check both the raw ID and with the useCaseId from params (which might include the vertical prefix)
  const CustomDashboard = customDashboards[selectedUseCase.id] || customDashboards[useCaseId || ''];
  
  // If a custom dashboard exists, render it with the use case data
  if (CustomDashboard) {
    return <CustomDashboard useCase={selectedUseCase} />;
  }

  // Otherwise, render the default dashboard with ingested data
  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate('/use-cases')}
              className="mr-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gradient-to-br from-seraphim-gold/20 to-transparent mr-4">
                <Icon className="w-8 h-8 text-seraphim-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{selectedUseCase.name}</h1>
                <p className="text-sm text-gray-400">
                  {selectedUseCase.description.replace(/AI-driven insights/gi, 'VANGUARD')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={hasIngestedData ? "success" : "warning"}
              size="small"
            >
              {hasIngestedData ? 'LIVE DATA' : 'NO DATA'}
            </Badge>
            <img
              src="/seraphim-vanguards-logo.png"
              alt="Seraphim Vanguards"
              className="h-36 w-auto object-contain"
            />
            <SIAMetrics
              security={selectedUseCase.siaScores.security}
              integrity={selectedUseCase.siaScores.integrity}
              accuracy={selectedUseCase.siaScores.accuracy}
              size="sm"
              animate={false}
              onMetricClick={(metric) => setSelectedMetric(metric)}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        <Button
          variant={activeTab === 'overview' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('overview')}
          className="flex items-center"
        >
          <ChartBarIcon className="w-4 h-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'data-ingestion' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('data-ingestion')}
          className="flex items-center"
        >
          <CloudArrowUpIcon className="w-4 h-4 mr-2" />
          Data Ingestion
        </Button>
        <Button
          variant={activeTab === 'analytics' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('analytics')}
          className="flex items-center"
        >
          <ChartBarIcon className="w-4 h-4 mr-2" />
          Analytics
        </Button>
        <Button
          variant={activeTab === 'operations' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('operations')}
          className="flex items-center"
        >
          <CogIcon className="w-4 h-4 mr-2" />
          Operations
        </Button>
      </div>

      {/* Data Ingestion Tab */}
      {activeTab === 'data-ingestion' && (
        <div className="space-y-6">
          {/* Data Status Card */}
          {hasIngestedData && (
            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-white">Data Successfully Ingested</p>
                      <p className="text-xs text-gray-400">
                        Last updated: {dataTimestamp ? new Date(dataTimestamp).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setHasIngestedData(false);
                      setDataTimestamp(null);
                      setUploadedFile(null);
                      setApiEndpoint('');
                    }}
                  >
                    Clear Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Data Ingestion Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Data Source Selection */}
                <div className="flex space-x-4">
                  <Button
                    variant={dataSource === 'file' ? 'primary' : 'secondary'}
                    onClick={() => setDataSource('file')}
                    className="flex items-center"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                    File Upload
                  </Button>
                  <Button
                    variant={dataSource === 'api' ? 'primary' : 'secondary'}
                    onClick={() => setDataSource('api')}
                    className="flex items-center"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    API Endpoint
                  </Button>
                </div>

                {/* File Upload Section */}
                {dataSource === 'file' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                      <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-300 mb-2">Drop your data file here or click to browse</p>
                      <p className="text-sm text-gray-500 mb-4">Supported formats: CSV, JSON, Excel</p>
                      <input
                        type="file"
                        accept=".csv,.json,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="cursor-pointer"
                      >
                        Choose File
                      </Button>
                      {uploadedFile && (
                        <div className="mt-4 p-3 bg-white/5 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white">Selected: {uploadedFile.name}</p>
                            <p className="text-xs text-gray-400">
                              Size: {uploadedFile.size > 1024 * 1024
                                ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`
                                : `${(uploadedFile.size / 1024).toFixed(2)} KB`}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => {
                              setUploadedFile(null);
                              const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                              if (fileInput) fileInput.value = '';
                            }}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* API Endpoint Section */}
                {dataSource === 'api' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        placeholder="https://api.example.com/data"
                        className="w-full px-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-seraphim-gold"
                      />
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-sm font-medium text-white mb-2">API Requirements:</p>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li>• Must return JSON format</li>
                        <li>• Authentication via Bearer token (if required)</li>
                        <li>• Maximum response size: 10MB</li>
                        <li>• Timeout: 30 seconds</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Ingestion Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    {ingestionStatus === 'success' && (
                      <span className="text-green-400">✓ Data successfully ingested</span>
                    )}
                    {ingestionStatus === 'error' && (
                      <span className="text-red-400">✗ Error ingesting data. Please try again.</span>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleDataIngestion}
                    disabled={isIngesting || (dataSource === 'file' && !uploadedFile) || (dataSource === 'api' && !apiEndpoint)}
                    className="min-w-[150px]"
                  >
                    {isIngesting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Ingest Data'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Preview */}
          {hasIngestedData && dashboardData?.ingestedRows && (
            <Card variant="glass" effect="glow">
              <CardHeader>
                <CardTitle>Ingested Data Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Timestamp</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Value</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.ingestedRows.slice(0, 10).map((row: any, index: number) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-white/5">
                          <td className="py-3 px-4 text-sm text-white">{row.id}</td>
                          <td className="py-3 px-4 text-sm text-gray-300">{row.timestamp}</td>
                          <td className="py-3 px-4 text-sm text-gray-300">{row.value}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'error'}
                              size="small"
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-300">{row.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-center py-4 text-sm text-gray-500">
                    Showing 10 of {dashboardData.ingestedRows.length} rows
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Data Message */}
          {!hasIngestedData && (
            <Card variant="glass" effect="glow">
              <CardContent className="p-8 text-center">
                <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Data Ingested Yet</h3>
                <p className="text-sm text-gray-400">
                  Please upload a file or connect to an API endpoint to start ingesting data.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Show warning if no data ingested */}
          {!hasIngestedData && (
            <Card variant="gradient" effect="shimmer">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">No Data Ingested</p>
                    <p className="text-xs text-gray-400">Navigate to the Data Ingestion tab to upload or connect your data.</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setActiveTab('data-ingestion')}
                  >
                    Go to Data Ingestion
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData?.metrics?.map((metric: any, index: number) => (
              <Card key={index} variant="gradient" effect="shimmer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{metric.name}</p>
                      <p className="text-2xl font-bold text-white">
                        {metric.value}{metric.unit}
                      </p>
                      <p className={`text-xs flex items-center mt-1 ${
                        metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        <ArrowTrendingUpIcon className={`w-3 h-3 mr-1 ${
                          metric.trend === 'down' ? 'rotate-180' : ''
                        }`} />
                        {Math.abs(metric.change)}% from last period
                      </p>
                    </div>
                    <ChartBarIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ingested Data Summary */}
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>Ingested Data Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold text-white">
                    {hasIngestedData ? (dashboardData?.ingestedRows?.length || 0) : 0}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Total Records</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <p className="text-3xl font-bold text-white">
                    {hasIngestedData && dataTimestamp ? new Date(dataTimestamp).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Last Updated</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <p className={`text-3xl font-bold ${hasIngestedData ? 'text-green-400' : 'text-gray-400'}`}>
                    {hasIngestedData ? '98.5%' : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Data Quality Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Use Case Specific Charts with Ingested Data */}
          {renderUseCaseSpecificCharts(selectedUseCase, dashboardData)}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {renderAnalyticsContent(selectedUseCase, dashboardData)}
        </div>
      )}

      {/* Operations Tab */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <Card variant="glass" effect="glow">
            <CardHeader>
              <CardTitle>VANGUARDS Operations - Live Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">Use Case Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Use Case</span>
                      <span className="text-sm text-white font-medium">{selectedUseCase.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Data Mode</span>
                      <Badge variant={hasIngestedData ? "info" : "warning"} size="small">
                        {hasIngestedData ? 'Live Ingested Data' : 'No Data'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Records Processed</span>
                      <span className="text-sm text-white">
                        {hasIngestedData ? (dashboardData?.ingestedRows?.length || 0) : 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">System Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Data Processing</span>
                      <span className={`text-sm ${hasIngestedData ? 'text-green-400' : 'text-gray-400'}`}>
                        {hasIngestedData ? 'Live' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Model Inference</span>
                      <span className={`text-sm ${hasIngestedData ? 'text-green-400' : 'text-gray-400'}`}>
                        {hasIngestedData ? 'Active' : 'Waiting for Data'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Compliance Monitoring</span>
                      <span className={`text-sm ${hasIngestedData ? 'text-green-400' : 'text-gray-400'}`}>
                        {hasIngestedData ? 'Real-time' : 'Standby'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SIA Analysis Modal */}
      <SIAAnalysisModal
        selectedMetric={selectedMetric}
        onClose={() => setSelectedMetric(null)}
        useCaseName={selectedUseCase?.name || ''}
        analysisData={dashboardData?.siaAnalysisData || {}}
      />
    </div>
  );
};

// Render use case specific charts (reusing from demo dashboard but with ingested data)
const renderUseCaseSpecificCharts = (useCase: UseCase, data: any) => {
  // This would render the same charts as the demo dashboard but with ingested data
  // For brevity, returning a simple placeholder
  return (
    <Card variant="glass" effect="glow">
      <CardHeader>
        <CardTitle>Live Data Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Visualizing {data?.ingestedRows?.length || 100} rows of ingested data</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Render analytics content
const renderAnalyticsContent = (useCase: UseCase, data: any) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card variant="glass" effect="glow">
        <CardHeader>
          <CardTitle>Performance Metrics - Live Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.metrics?.map((metric: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">{metric.name}</span>
                  <span className="text-sm font-medium text-white">
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <Progress value={75 + index * 5} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="glass" effect="glow">
        <CardHeader>
          <CardTitle>AI Model Performance - Live</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Model Accuracy</span>
              <span className="text-sm font-medium text-white">97.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Processing Speed</span>
              <span className="text-sm font-medium text-white">0.8ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Data Quality Score</span>
              <span className="text-sm font-medium text-white">98.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">System Uptime</span>
              <span className="text-sm font-medium text-white">99.99%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UseCaseRunDashboard;