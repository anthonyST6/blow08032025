import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUseCaseContext } from '../contexts/UseCaseContext';
import { useWorkflowState } from '../contexts/WorkflowStateContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  RocketLaunchIcon,
  ChartBarIcon,
  CogIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  BoltIcon,
  HeartIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ShoppingCartIcon,
  TruckIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  BeakerIcon,
  HomeIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  XMarkIcon,
  SparklesIcon,
  SignalIcon,
  ServerIcon,
  CloudArrowUpIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentCheckIcon,
  PlayIcon,
  DocumentArrowDownIcon,
  ChartPieIcon,
  UserGroupIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { SIAMetrics } from '../components/ui/SIAMetric';
import { verticals } from '../config/verticals';
import { agentExecution } from '../services/agentExecution.service';
import { useCaseService } from '../services/usecase.service';
import { toast } from 'react-hot-toast';
import { generateOilfieldTabContent } from '../components/dashboards/OilfieldLandLeaseSharedDashboard';
import { OilfieldDataTransformerService, OilfieldDemoData } from '../services/oilfieldDataTransformer.service';
import { IngestedData } from '../components/DataIngestion';
import { dataFlowService, DataFlowEvent, IngestedDataWithParsed } from '../services/dataFlow.service';
import { Badge } from '../components/Badge';
import DeploymentStatus from '../components/DeploymentStatus';
import AgentActivityFeed from '../components/AgentActivityFeed';
import UnifiedEventStream from '../components/UnifiedEventStream';
import CertificationResults from '../components/CertificationResults';
import WorkflowGenerator from '../components/WorkflowGenerator';
import AgentOrchestrationFlow from '../components/AgentOrchestrationFlow';

// Vertical icon mapping
const verticalIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  energy: BoltIcon,
  healthcare: HeartIcon,
  finance: BanknotesIcon,
  manufacturing: BuildingOfficeIcon,
  retail: ShoppingCartIcon,
  logistics: TruckIcon,
  education: AcademicCapIcon,
  government: BuildingOfficeIcon,
  telecom: GlobeAltIcon,
  pharma: BeakerIcon,
  'real-estate': HomeIcon,
};

interface WorkflowStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  agents: string[];
}

// Lease data interface
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

const MissionOperationsCenter: React.FC = () => {
  const navigate = useNavigate();
  const { activeUseCaseId, activeUseCaseData, resetContext, useCases } = useUseCaseContext();
  const { workflowState, setIngestedData, setActiveWorkflow } = useWorkflowState();
  const [isLoading, setIsLoading] = useState(true);
  const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'workflows' | 'analytics' | 'agents' | 'data'>('overview');
  const [selectedAnalyticsTab, setSelectedAnalyticsTab] = useState<'overview' | 'financial' | 'risk' | 'operations' | 'lease'>('overview');
  const [oilfieldData, setOilfieldData] = useState<OilfieldDemoData | null>(null);
  const [leaseData, setLeaseData] = useState<LeaseData[]>([]);
  const [selectedLease, setSelectedLease] = useState<LeaseData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeWorkflow, setActiveWorkflowLocal] = useState<{ workflowId: string; agents: any[] } | null>(null);
  const [activeDeployment, setActiveDeployment] = useState<{ workflowId: string; agents: any[] } | null>(null);
  const [showCertifications, setShowCertifications] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activeUseCaseId) {
      navigate('/mission-control-enhanced');
      return;
    }

    loadDashboardData();
    
    // Load use case specific data
    if (activeUseCaseId === 'oilfield-land-lease') {
      loadOilfieldData();
      generateLeaseData();
    }
    
    // Subscribe to data flow events for this use case
    const unsubscribe = dataFlowService.subscribeToUseCase(
      activeUseCaseId,
      handleDataFlowEvent
    );
    
    return () => {
      unsubscribe();
    };
  }, [activeUseCaseId]);

  // Check for active workflows from context on mount
  useEffect(() => {
    // Check if there are any active workflows in the persisted state
    if (workflowState.activeWorkflows.size > 0) {
      const firstWorkflow = Array.from(workflowState.activeWorkflows.values())[0];
      if (firstWorkflow) {
        setActiveWorkflowLocal(firstWorkflow);
      }
    }
    
    // Check for active deployments
    if (workflowState.activeDeployments.size > 0) {
      const firstDeployment = Array.from(workflowState.activeDeployments.values())[0];
      if (firstDeployment) {
        setActiveDeployment(firstDeployment);
      }
    }

    // Check for certification results
    if (workflowState.certificationResults.size > 0) {
      setShowCertifications(true);
    }
  }, [workflowState]);

  // Generate lease data for the oilfield use case
  const generateLeaseData = () => {
    const statuses: LeaseData['status'][] = ['Active', 'Pending', 'Expired', 'Terminated'];
    const complianceStatuses: LeaseData['complianceStatus'][] = ['Compliant', 'Non-Compliant', 'Under Review'];
    const riskLevels: LeaseData['riskLevel'][] = ['Low', 'Medium', 'High'];
    const operators = ['Continental Resources', 'EOG Resources', 'Pioneer Natural', 'Devon Energy', 'Diamondback Energy'];
    const locations = ['Permian Basin, TX', 'Eagle Ford, TX', 'Bakken, ND', 'Marcellus, PA', 'Haynesville, LA'];

    const generatedLeases = Array.from({ length: 100 }, (_, i) => ({
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

    setLeaseData(generatedLeases);
  };

  const handleDataFlowEvent = (event: DataFlowEvent) => {
    console.log('Data flow event:', event);
    
    // Refresh dashboard data on relevant events
    if (event.type === 'workflow_started' ||
        event.type === 'workflow_completed' ||
        event.type === 'agent_activity') {
      loadDashboardData();
    }
    
    // Update oilfield data if workflow completed
    if (event.type === 'workflow_completed' && activeUseCaseId === 'oilfield-land-lease') {
      loadOilfieldData();
    }
  };

  const loadOilfieldData = async () => {
    try {
      // First check data flow service for recent workflows
      const workflows = dataFlowService.getWorkflowsByUseCase(activeUseCaseId!);
      const latestWorkflow = workflows
        .filter(w => w.status === 'completed' || w.status === 'running')
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
      
      if (latestWorkflow && latestWorkflow.ingestedData) {
        const ingestedData = latestWorkflow.ingestedData as IngestedDataWithParsed;
        const dataToTransform = ingestedData.parsedData || ingestedData.dataPreview || [];
        
        if (dataToTransform.length > 0) {
          // Transform ingested data to oilfield format
          const transformedData = OilfieldDataTransformerService.transformIngestedDataToOilfieldFormat(
            dataToTransform.map((row: any) => ({
              id: row.id || Math.random().toString(),
              timestamp: row.timestamp || new Date().toISOString(),
              category: row.category || 'lease',
              value: parseFloat(row.value || row.revenue || row.production || '0'),
              status: row.status || 'active',
              anomalyScore: parseFloat(row.anomalyScore || '0'),
              confidenceScore: parseFloat(row.confidenceScore || '95'),
              metrics: {
                performance: parseFloat(row.royaltyRate || row.performance || '18.5'),
                accuracy: parseFloat(row.accuracy || '95'),
                confidence: parseFloat(row.confidence || '90')
              }
            }))
          );
          setOilfieldData(transformedData);
          return;
        }
      }
      
      // If no data found, generate demo data
      const demoData = OilfieldDataTransformerService.generateEmptyData();
      // Populate with some demo values
      demoData.leaseMetrics = {
        totalLeases: 156,
        activeLeases: 142,
        expiringIn30Days: 8,
        expiringIn90Days: 23,
        averageRoyaltyRate: 18.5,
        totalAcreage: 56940,
        monthlyRevenue: 4.2,
        yearlyRevenue: 50.4
      };
      demoData.leasesByStatus = [
        { status: 'Active', count: 142, value: 3.8 },
        { status: 'Pending Renewal', count: 8, value: 0.2 },
        { status: 'In Negotiation', count: 4, value: 0.1 },
        { status: 'Expired', count: 2, value: 0.1 }
      ];
      demoData.geographicDistribution = [
        { region: 'Permian Basin', leases: 45, production: 1.8, risk: 'low' },
        { region: 'Eagle Ford', leases: 38, production: 1.2, risk: 'medium' },
        { region: 'Bakken', leases: 32, production: 0.8, risk: 'low' },
        { region: 'Marcellus', leases: 28, production: 0.3, risk: 'high' },
        { region: 'Haynesville', leases: 13, production: 0.1, risk: 'medium' }
      ];
      demoData.complianceStatus = {
        compliant: 138,
        pendingReview: 12,
        nonCompliant: 4,
        requiresAction: 2
      };
      
      setOilfieldData(demoData);
    } catch (error) {
      console.error('Failed to load oilfield data:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load workflows
      const useCaseWorkflows = await useCaseService.getWorkflows(activeUseCaseId!);
      
      // Transform to workflow status format
      const workflowStatuses: WorkflowStatus[] = useCaseWorkflows.map((w: any) => ({
        id: w.id,
        name: w.name,
        status: w.status || 'pending',
        progress: w.progress || 0,
        startTime: w.startTime || new Date(),
        endTime: w.endTime,
        agents: w.agents || [],
      }));
      
      setWorkflows(workflowStatuses);
      
      // Persist workflows in state
      workflowStatuses.forEach(workflow => {
        setActiveWorkflow(workflow.id, workflow);
      });
      
      // Calculate metrics
      const completedWorkflows = workflowStatuses.filter(w => w.status === 'completed').length;
      const runningWorkflows = workflowStatuses.filter(w => w.status === 'running').length;
      const failedWorkflows = workflowStatuses.filter(w => w.status === 'failed').length;
      
      setMetrics({
        totalWorkflows: workflowStatuses.length,
        completedWorkflows,
        runningWorkflows,
        failedWorkflows,
        successRate: workflowStatuses.length > 0 
          ? Math.round((completedWorkflows / workflowStatuses.length) * 100)
          : 0,
      });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load mission data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    if (activeUseCaseId === 'oilfield-land-lease') {
      await loadOilfieldData();
    }
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleRunWorkflow = async (workflowId: string) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow || !activeUseCaseId) return;

      const agentGraph = await useCaseService.getAgentGraph(activeUseCaseId);
      if (agentGraph) {
        await agentExecution.executeWorkflow(
          agentGraph.agents,
          workflow.name,
          activeUseCaseId,
          workflowId
        );
        toast.success('Workflow started successfully!');
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to run workflow:', error);
      toast.error('Failed to run workflow');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const activeUseCase = useCases.find(uc => uc.id === activeUseCaseId);
  const verticalId = activeUseCase ? Object.entries(verticals).find(([_, v]) => 
    v.useCases.some(uc => uc.id === activeUseCaseId)
  )?.[0] : null;
  const vertical = verticalId ? verticals[verticalId] : null;
  const VerticalIcon = verticalId ? verticalIcons[verticalId] : RocketLaunchIcon;

  // Calculate SIA metrics - use the use case's SIA scores if available
  const useCaseSiaScores = activeUseCase && verticalId && verticals[verticalId]
    ? verticals[verticalId].useCases.find(uc => uc.id === activeUseCaseId)?.siaScores
    : null;
    
  const siaMetrics = useCaseSiaScores || {
    security: 85,
    integrity: 88,
    accuracy: 90,
  };

  return (
    <div className="min-h-screen bg-seraphim-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="small"
                onClick={() => navigate('/mission-control-enhanced')}
                className="flex items-center"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Mission Control
              </Button>
              
              <div className="flex items-center gap-3">
                <VerticalIcon className="h-8 w-8 text-seraphim-gold" />
                <div>
                  <h1 className="text-2xl font-bold text-seraphim-text flex items-center">
                    <SparklesIcon className="h-6 w-6 text-seraphim-gold mr-2 animate-pulse-gold" />
                    Mission Operations Center
                  </h1>
                  <p className="text-sm text-gray-400">
                    {activeUseCase?.name || 'Unknown Mission'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Card variant="glass" padding="sm" className="min-w-[120px]">
                <div className="text-right">
                  <p className="text-xs text-seraphim-text-dim uppercase tracking-wider">System Time</p>
                  <p className="text-lg font-mono text-seraphim-gold animate-pulse-gold">
                    {currentTime.toLocaleTimeString()}
                  </p>
                </div>
              </Card>
              
              <Button
                variant="secondary"
                size="small"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  if (confirm('Are you sure you want to exit this mission?')) {
                    resetContext();
                    navigate('/mission-control-enhanced');
                  }
                }}
                className="flex items-center"
              >
                Exit Mission
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* SIA Metrics Bar */}
        <div className="mb-6">
          <SIAMetrics
            security={siaMetrics.security}
            integrity={siaMetrics.integrity}
            accuracy={siaMetrics.accuracy}
            size="sm"
            variant="inline"
            layout="horizontal"
          />
        </div>

        {/* Main Single Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Navigation and Quick Stats */}
          <div className="lg:col-span-1 space-y-4">
            {/* Navigation Tabs */}
            <Card variant="gradient" effect="shimmer">
              <CardHeader>
                <CardTitle className="text-sm">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(['overview', 'workflows', 'analytics', 'agents', 'data'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTab === tab
                        ? 'bg-seraphim-gold text-black'
                        : 'bg-black/50 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab === 'overview' && <ChartBarIcon className="inline h-4 w-4 mr-2" />}
                    {tab === 'workflows' && <CogIcon className="inline h-4 w-4 mr-2" />}
                    {tab === 'analytics' && <ChartPieIcon className="inline h-4 w-4 mr-2" />}
                    {tab === 'agents' && <UserGroupIcon className="inline h-4 w-4 mr-2" />}
                    {tab === 'data' && <DocumentArrowDownIcon className="inline h-4 w-4 mr-2" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card variant="glass-dark" effect="glow">
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Total Workflows</span>
                  <span className="text-sm font-bold text-white">{metrics?.totalWorkflows || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Completed</span>
                  <span className="text-sm font-bold text-vanguard-green">{metrics?.completedWorkflows || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Running</span>
                  <span className="text-sm font-bold text-vanguard-blue">{metrics?.runningWorkflows || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Success Rate</span>
                  <span className="text-sm font-bold text-seraphim-gold">{metrics?.successRate || 0}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card variant="gradient" effect="shimmer">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate('/analytics')}
                  className="w-full justify-center"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate('/audit')}
                  className="w-full justify-center"
                >
                  <DocumentCheckIcon className="h-4 w-4 mr-2" />
                  Audit Logs
                </Button>
                
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate('/agents')}
                  className="w-full justify-center"
                >
                  <CogIcon className="h-4 w-4 mr-2" />
                  Agent Management
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card variant="glass-dark" effect="glow" className="h-full">
              <CardContent className="p-6">
                {/* Overview Tab */}
                {selectedTab === 'overview' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-4">Mission Overview</h2>
                    
                    {/* Mission Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-black/30 border border-vanguard-blue/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Mission Status</span>
                          <SignalIcon className="h-5 w-5 text-vanguard-blue" />
                        </div>
                        <p className="text-2xl font-bold text-white">Active</p>
                        <p className="text-xs text-gray-400 mt-1">All systems operational</p>
                      </div>
                      
                      <div className="bg-black/30 border border-vanguard-green/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Data Status</span>
                          <CloudArrowUpIcon className="h-5 w-5 text-vanguard-green" />
                        </div>
                        <p className="text-2xl font-bold text-white">Ready</p>
                        <p className="text-xs text-gray-400 mt-1">156 records processed</p>
                      </div>
                      
                      <div className="bg-black/30 border border-seraphim-gold/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Compliance</span>
                          <ShieldCheckIcon className="h-5 w-5 text-seraphim-gold" />
                        </div>
                        <p className="text-2xl font-bold text-white">98%</p>
                        <p className="text-xs text-gray-400 mt-1">2 items need review</p>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-vanguard-green rounded-full animate-pulse" />
                              <span className="text-sm text-white">Workflow completed: Lease Analysis</span>
                            </div>
                            <span className="text-xs text-gray-400">2 mins ago</span>
                          </div>
                        </div>
                        <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-vanguard-blue rounded-full" />
                              <span className="text-sm text-white">Agent deployed: Risk Assessor</span>
                            </div>
                            <span className="text-xs text-gray-400">5 mins ago</span>
                          </div>
                        </div>
                        <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-seraphim-gold rounded-full" />
                              <span className="text-sm text-white">Data ingestion completed</span>
                            </div>
                            <span className="text-xs text-gray-400">10 mins ago</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certification Status */}
                    {showCertifications && activeWorkflow && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Certification Status</h3>
                        <CertificationResults
                          workflowId={activeWorkflow.workflowId}
                          useCaseId={activeUseCaseId || ''}
                          isActive={true}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Workflows Tab */}
                {selectedTab === 'workflows' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">Mission Workflows</h2>
                      {activeUseCaseId && (
                        <WorkflowGenerator
                          useCaseId={activeUseCaseId}
                          useCaseName={activeUseCase?.name || 'Unknown'}
                          onWorkflowGenerated={(workflow) => {
                            loadDashboardData();
                          }}
                        />
                      )}
                    </div>

                    {/* Active Workflows */}
                    <div className="space-y-4">
                      {workflows.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-400">No workflows configured for this mission</p>
                        </div>
                      ) : (
                        workflows.map((workflow) => (
                          <motion.div
                            key={workflow.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-black/30 border border-white/10 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  workflow.status === 'completed' ? 'bg-vanguard-green' :
                                  workflow.status === 'running' ? 'bg-vanguard-blue animate-pulse' :
                                  workflow.status === 'failed' ? 'bg-red-500' :
                                  'bg-gray-500'
                                }`} />
                                <h3 className="text-sm font-semibold text-white">{workflow.name}</h3>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  workflow.status === 'completed' ? 'bg-vanguard-green/20 text-vanguard-green' :
                                  workflow.status === 'running' ? 'bg-vanguard-blue/20 text-vanguard-blue' :
                                  workflow.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                                  'bg-gray-500/20 text-gray-500'
                                }`}>
                                  {workflow.status}
                                </span>
                                
                                {workflow.status === 'pending' && (
                                  <Button
                                    variant="primary"
                                    size="small"
                                    onClick={() => handleRunWorkflow(workflow.id)}
                                  >
                                    <PlayIcon className="h-3 w-3 mr-1" />
                                    Run
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {workflow.status === 'running' && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                  <span>Progress</span>
                                  <span>{workflow.progress}%</span>
                                </div>
                                <div className="w-full bg-black/50 rounded-full h-2">
                                  <div
                                    className="bg-vanguard-blue h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${workflow.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <div className="flex items-center gap-4">
                                <span>Started: {new Date(workflow.startTime).toLocaleTimeString()}</span>
                                {workflow.endTime && (
                                  <span>Ended: {new Date(workflow.endTime).toLocaleTimeString()}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Agents: {workflow.agents.length}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    {/* Deployment Status */}
                    {activeDeployment && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Deployment Status</h3>
                        <DeploymentStatus
                          workflowId={activeDeployment.workflowId}
                          agents={activeDeployment.agents}
                          isDeploying={true}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Analytics Tab */}
                {selectedTab === 'analytics' && activeUseCaseId === 'oilfield-land-lease' && oilfieldData && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">Oilfield Analytics</h2>
                      <div className="flex gap-2">
                        {(['overview', 'financial', 'risk', 'operations', 'lease'] as const).map((tab) => (
                          <Button
                            key={tab}
                            variant={selectedAnalyticsTab === tab ? 'primary' : 'secondary'}
                            size="small"
                            onClick={() => setSelectedAnalyticsTab(tab)}
                            className="capitalize"
                          >
                            {tab === 'lease' ? 'Leases' : tab}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {selectedAnalyticsTab === 'lease' ? (
                      // Custom Lease Tab Content
                      <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-white">All Land Leases</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="info" size="small">
                              {leaseData.filter(l => l.status === 'Active').length} Active
                            </Badge>
                            <Badge variant="warning" size="small">
                              {leaseData.filter(l => l.status === 'Pending').length} Pending
                            </Badge>
                            <Badge variant="error" size="small">
                              {leaseData.filter(l => l.status === 'Expired').length} Expired
                            </Badge>
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
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Monthly Revenue</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Risk</th>
                              </tr>
                            </thead>
                            <tbody>
                              {leaseData.slice(0, 10).map((lease) => (
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
                                    } size="small">
                                      {lease.status}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-white font-medium">${(lease.monthlyRevenue / 1000).toFixed(1)}K</td>
                                  <td className="py-3 px-4">
                                    <Badge variant={
                                      lease.riskLevel === 'Low' ? 'success' :
                                      lease.riskLevel === 'Medium' ? 'warning' :
                                      'error'
                                    } size="small">
                                      {lease.riskLevel}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      generateOilfieldTabContent(
                        oilfieldData,
                        true, // isLiveData
                        true, // hasData
                        undefined // onDataRequest
                      )[selectedAnalyticsTab]
                    )}
                  </div>
                )}

                {/* Agents Tab */}
                {selectedTab === 'agents' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-4">Agent Operations</h2>
                    
                    {/* Agent Orchestration Flow */}
                    {activeWorkflow && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Agent Orchestration Flow</h3>
                        <AgentOrchestrationFlow
                          agents={activeWorkflow.agents}
                          workflowId={activeWorkflow.workflowId}
                          isActive={true}
                        />
                      </div>
                    )}
                    
                    {/* Agent Activity Feed */}
                    {activeWorkflow && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Real-time Agent Activity</h3>
                        <AgentActivityFeed
                          workflowId={activeWorkflow.workflowId}
                          agents={activeWorkflow.agents}
                          isActive={true}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Data Tab */}
                {selectedTab === 'data' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>
                    
                    {/* Event Stream */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Event Stream</h3>
                      <UnifiedEventStream
                        workflowId={activeWorkflow?.workflowId}
                        isActive={true}
                      />
                    </div>

                    {/* Data Summary */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Data Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Records Processed</span>
                            <DocumentArrowDownIcon className="h-5 w-5 text-vanguard-blue" />
                          </div>
                          <p className="text-2xl font-bold text-white">156</p>
                          <p className="text-xs text-gray-400 mt-1">Last updated 10 mins ago</p>
                        </div>
                        
                        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Data Quality</span>
                            <CheckCircleIcon className="h-5 w-5 text-vanguard-green" />
                          </div>
                          <p className="text-2xl font-bold text-white">98.5%</p>
                          <p className="text-xs text-gray-400 mt-1">2 anomalies detected</p>
                        </div>
                        
                        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Storage Used</span>
                            <ServerIcon className="h-5 w-5 text-seraphim-gold" />
                          </div>
                          <p className="text-2xl font-bold text-white">2.4 GB</p>
                          <p className="text-xs text-gray-400 mt-1">Of 10 GB allocated</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Lease Details Modal */}
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
                    <XMarkIcon className="h-5 w-5" />
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
                        } size="small">
                          {selectedLease.status}
                        </Badge>
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-400 mr-2">Compliance:</span>
                        <Badge variant={
                          selectedLease.complianceStatus === 'Compliant' ? 'success' :
                          selectedLease.complianceStatus === 'Under Review' ? 'warning' :
                          'error'
                        } size="small">
                          {selectedLease.complianceStatus}
                        </Badge>
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-400 mr-2">Risk Level:</span>
                        <Badge variant={
                          selectedLease.riskLevel === 'Low' ? 'success' :
                          selectedLease.riskLevel === 'Medium' ? 'warning' :
                          'error'
                        } size="small">
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
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedLease(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MissionOperationsCenter;