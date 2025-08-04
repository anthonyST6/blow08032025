import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUseCaseContext } from '../contexts/UseCaseContext';
import { useWorkflowState } from '../contexts/WorkflowStateContext';
import {
  DashboardStats,
  UserRole,
  Mission,
  AgentPerformancePoint,
  TaskSummary,
  Alert,
  AgentOrchestration,
  PromptTemplate,
  Integration,
  AuditEvent,
  UserManagement,
} from '../types';
import { AgentNode } from '../types/usecase.types';
import {
  generateDashboardStats,
  generateMissions,
  generateAgentPerformance,
  generateTaskSummary,
  generateAlerts,
  generateDiagnosticData,
  generateAgentOrchestrationData,
  generatePromptTemplates,
  generateIntegrations,
  generateAuditEvents,
  generateUserManagementData,
} from '../services/mockData.service';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadingWrapper, { SectionSkeleton } from '../components/LoadingWrapper';
import ErrorBoundary from '../components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle, StatCard, CardGrid } from '../components/ui/Card';
import { Button, IconButton } from '../components/ui/Button';
import { Button as SimpleButton } from '../components/Button';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  ChartBarIcon,
  BeakerIcon,
  CubeTransparentIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  BoltIcon as LightningBoltIcon,
  CircleStackIcon as DatabaseIcon,
  CogIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  BellAlertIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  ServerStackIcon,
  CodeBracketIcon,
  PuzzlePieceIcon,
  DocumentMagnifyingGlassIcon,
  UsersIcon,
  ArrowPathIcon,
  PlayIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  BoltIcon,
  HeartIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ShoppingCartIcon,
  TruckIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  CloudArrowUpIcon,
  ServerIcon,
  SignalIcon,
  BeakerIcon as TestTubeIcon,
  DocumentArrowUpIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  HomeIcon,
  EyeIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SIAMetric, SIAMetrics, SIAIndicator } from '../components/ui/SIAMetric';
import { getSIAClass, SIA_COMPONENT_STYLES } from '../utils/sia';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mission Control Components
import ActiveMissionsPanel from '../components/mission-control/ActiveMissionsPanel';
import AgentsPerformanceGraph from '../components/mission-control/AgentsPerformanceGraph';
import TaskSummaryBox from '../components/mission-control/TaskSummaryBox';
import AlertsPanel from '../components/mission-control/AlertsPanel';
import Modal from '../components/ui/Modal';
import Drawer from '../components/ui/Drawer';

// Import verticals configuration
import { verticals } from '../config/verticals';
import { UseCase } from '../config/verticals';

// Import services
import { useCaseService } from '../services/usecase.service';
import { agentExecution } from '../services/agentExecution.service';
import { toast } from 'react-hot-toast';
import DataIngestion, { IngestedData } from '../components/DataIngestion';
import { dataFlowService } from '../services/dataFlow.service';
import { webSocketService } from '../services/websocket.service';
import ExecutiveSummaryModal from '../components/ExecutiveSummaryModal';
import OilfieldAgentConfigService from '../services/oilfieldAgentConfig.service';
import MissionControlSections from '../components/MissionControlSections';
import { mockApi } from '../services/mockApi';

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
  telecom: SignalIcon,
  'real-estate': HomeIcon,
  pharma: BeakerIcon,
};

// Filter persistence keys
const FILTER_STORAGE_KEY = 'mission-control-filters';

// Helper function to get stored filters
const getStoredFilters = () => {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Helper function to store filters
const storeFilters = (filters: any) => {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // Ignore storage errors
  }
};

const MissionControlEnhanced: React.FC = () => {
  const { user } = useAuthStore();
  const { activeUseCaseId, activeUseCaseData, resetContext, useCases, launchUseCase } = useUseCaseContext();
  const {
    workflowState,
    setActiveWorkflow: setActiveWorkflowState,
    setActiveDeployment: setActiveDeploymentState,
    setIngestedData: setIngestedDataState,
    setCertificationResults
  } = useWorkflowState();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Mission Control State
  const [missions, setMissions] = useState<Mission[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformancePoint[]>([]);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Modal States
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  
  // New Panel States
  const [agentOrchestration, setAgentOrchestration] = useState<AgentOrchestration[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [userManagement, setUserManagement] = useState<UserManagement[]>([]);

  // Enhanced States for new sections
  // Load stored filters
  const storedFilters = getStoredFilters();
  
  // Enhanced state with filter persistence
  const [selectedVertical, setSelectedVertical] = useState<string>(storedFilters.vertical || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(storedFilters.search || '');
  const [complexityFilter, setComplexityFilter] = useState<string>(storedFilters.complexity || 'all');
  const [timeFilter, setTimeFilter] = useState<string>(storedFilters.time || 'all');
  const [expandedUseCases, setExpandedUseCases] = useState<Set<string>>(new Set());
  const [showAllExpanded, setShowAllExpanded] = useState(false);
  
  // Existing state
  const [showExecutiveSummary, setShowExecutiveSummary] = useState<string | null>(null);
  const [selectedUseCaseForSummary, setSelectedUseCaseForSummary] = useState<any>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedUseCaseForIngestion, setSelectedUseCaseForIngestion] = useState<string | null>(null);
  const [ingestedData, setIngestedData] = useState<Record<string, IngestedData>>(workflowState.ingestedData);
  const [activeDeployment, setActiveDeployment] = useState<{ workflowId: string; agents: AgentNode[] } | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<{ workflowId: string; agents: AgentNode[] } | null>(null);
  const [showCertifications, setShowCertifications] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState<Record<string, number>>({});
  const [showSampleDataPrompt, setShowSampleDataPrompt] = useState(false);
  
  // Component loading states
  const [componentLoadingStates, setComponentLoadingStates] = useState<Record<string, boolean>>({
    agentOrchestration: true,
    deployment: true,
    operations: true,
    integrationLog: true,
    auditConsole: true,
  });

  // Simulate component loading
  useEffect(() => {
    const timers = [
      setTimeout(() => setComponentLoadingStates(prev => ({ ...prev, agentOrchestration: false })), 1000),
      setTimeout(() => setComponentLoadingStates(prev => ({ ...prev, deployment: false })), 1200),
      setTimeout(() => setComponentLoadingStates(prev => ({ ...prev, operations: false })), 1400),
      setTimeout(() => setComponentLoadingStates(prev => ({ ...prev, integrationLog: false })), 1600),
      setTimeout(() => setComponentLoadingStates(prev => ({ ...prev, auditConsole: false })), 1800),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Use mock data for dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setStats(generateDashboardStats());
      setMissions(generateMissions());
      setAgentPerformance(generateAgentPerformance());
      setTaskSummary(generateTaskSummary());
      setAlerts(generateAlerts());
      setAgentOrchestration(generateAgentOrchestrationData());
      setPromptTemplates(generatePromptTemplates());
      setIntegrations(generateIntegrations());
      setAuditEvents(generateAuditEvents());
      setUserManagement(generateUserManagementData());
      setIsLoading(false);
    }, 500);

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      setStats(generateDashboardStats());
      setMissions(generateMissions());
      setAgentPerformance(generateAgentPerformance());
      setTaskSummary(generateTaskSummary());
      setAlerts(generateAlerts());
      setAgentOrchestration(generateAgentOrchestrationData());
      setPromptTemplates(generatePromptTemplates());
      setIntegrations(generateIntegrations());
      setAuditEvents(generateAuditEvents());
      setUserManagement(generateUserManagementData());
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Load workflows when active use case changes
  useEffect(() => {
    if (activeUseCaseId) {
      loadWorkflows(activeUseCaseId);
    }
  }, [activeUseCaseId]);

  // Check for active workflows from context on mount
  useEffect(() => {
    // Check if there are any active workflows in the persisted state
    if (workflowState.activeWorkflows.size > 0) {
      const firstWorkflow = Array.from(workflowState.activeWorkflows.values())[0];
      if (firstWorkflow) {
        setActiveWorkflow(firstWorkflow);
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

  const loadWorkflows = async (useCaseId: string) => {
    try {
      const useCaseWorkflows = await useCaseService.getWorkflows(useCaseId);
      setWorkflows(useCaseWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  // Use context data or baseline stats
  const displayStats = activeUseCaseData?.summary ? {
    totalPrompts: activeUseCaseData.summary.activeItems || stats?.totalPrompts || 0,
    totalAnalyses: Math.floor((activeUseCaseData.summary.activeItems || 0) * 2.5) || stats?.totalAnalyses || 0,
    averageScore: activeUseCaseData.summary.successRate || stats?.averageScore || 0,
    flaggedResponses: Math.floor((activeUseCaseData.summary.activeItems || 0) * 0.03) || stats?.flaggedResponses || 0,
    activeWorkflows: activeUseCaseData.operations?.workflows?.length || stats?.activeWorkflows || 0,
    recentActivity: stats?.recentActivity || []
  } : stats;

  // Calculate SIA metrics from stats
  const siaMetrics = {
    security: {
      value: displayStats ? (100 - (displayStats.flaggedResponses / Math.max(displayStats.totalAnalyses, 1)) * 100) : 0,
      trend: 2.3,
      status: 'optimal' as const,
    },
    integrity: {
      value: displayStats ? displayStats.averageScore : 0,
      trend: -0.8,
      status: displayStats && displayStats.averageScore > 90 ? 'optimal' as const : 'warning' as const,
    },
    accuracy: {
      value: displayStats ? Math.min(95 + Math.random() * 5, 100) : 0,
      trend: 1.2,
      status: 'optimal' as const,
    },
  };

  const handleMetricClick = (metric: 'security' | 'integrity' | 'accuracy') => {
    navigate(`/analytics/${metric}`);
  };

  // Persist filter changes
  useEffect(() => {
    const filters = {
      vertical: selectedVertical,
      search: searchQuery,
      complexity: complexityFilter,
      time: timeFilter,
    };
    storeFilters(filters);
  }, [selectedVertical, searchQuery, complexityFilter, timeFilter]);

  // Get filtered use cases with advanced filtering
  const filteredUseCases = useMemo(() => {
    let useCases = selectedVertical === 'all'
      ? Object.entries(verticals).flatMap(([verticalId, vertical]) =>
          vertical.useCases.map(uc => ({ ...uc, verticalId, verticalName: vertical.name }))
        )
      : verticals[selectedVertical]?.useCases.map(uc => ({
          ...uc,
          verticalId: selectedVertical,
          verticalName: verticals[selectedVertical].name
        })) || [];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      useCases = useCases.filter(uc =>
        uc.name.toLowerCase().includes(query) ||
        uc.description.toLowerCase().includes(query) ||
        uc.verticalName.toLowerCase().includes(query)
      );
    }

    // Apply complexity filter
    if (complexityFilter !== 'all') {
      useCases = useCases.filter(uc => uc.complexity === complexityFilter);
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      useCases = useCases.filter(uc => {
        const weeks = parseInt(uc.estimatedTime.match(/\d+/)?.[0] || '0');
        switch (timeFilter) {
          case 'short':
            return weeks <= 4;
          case 'medium':
            return weeks > 4 && weeks <= 8;
          case 'long':
            return weeks > 8;
          default:
            return true;
        }
      });
    }

    return useCases;
  }, [selectedVertical, searchQuery, complexityFilter, timeFilter]);

  // Toggle use case expansion
  const toggleUseCase = (useCaseId: string) => {
    setExpandedUseCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(useCaseId)) {
        newSet.delete(useCaseId);
      } else {
        newSet.add(useCaseId);
      }
      return newSet;
    });
  };

  // Toggle all use cases
  const toggleAllUseCases = () => {
    if (showAllExpanded) {
      setExpandedUseCases(new Set());
      setShowAllExpanded(false);
    } else {
      setExpandedUseCases(new Set(filteredUseCases.map(uc => uc.id)));
      setShowAllExpanded(true);
    }
  };

  // Handle data ingestion
  const handleDataIngested = (data: IngestedData) => {
    setIngestedData(prev => ({
      ...prev,
      [data.useCaseId]: data
    }));
    // Also persist to context
    setIngestedDataState(data.useCaseId, data);
  };

  // Handle use case launch
  const handleLaunchUseCase = async (useCase: any) => {
    try {
      // Check if data has been ingested for this use case
      if (!ingestedData[useCase.id]) {
        // For oilfield demo, offer to use sample data
        if (useCase.id === 'oilfield-land-lease') {
          setShowSampleDataPrompt(true);
          setSelectedUseCaseForIngestion(useCase.id);
          return;
        }
        toast.error('Please upload data before launching the mission');
        setSelectedUseCaseForIngestion(useCase.id);
        return;
      }

      setIsExecuting(true);
      await launchUseCase(useCase.id);
      
      // Auto-create and start workflow
      let agentGraph;
      
      // Use oilfield-specific configuration if applicable
      if (useCase.id === 'oilfield-land-lease') {
        const oilfieldConfig = OilfieldAgentConfigService.getOilfieldAgentConfiguration();
        agentGraph = {
          agents: oilfieldConfig.agents,
          connections: [] // Connections are defined within agents
        };
        
        // Show estimated duration
        const duration = OilfieldAgentConfigService.getEstimatedTotalDuration();
        toast.success(`Oilfield workflow configured! Estimated duration: ${duration} seconds`, {
          duration: 5000
        });
      } else {
        agentGraph = await useCaseService.getAgentGraph(useCase.id);
      }
      
      if (agentGraph) {
        // Store ingested data in context for agents to access
        const workflowId = `mission-${Date.now()}`;
        
        // Initialize data flow for this workflow
        if (ingestedData[useCase.id]) {
          dataFlowService.initializeWorkflow(
            workflowId,
            useCase.id,
            ingestedData[useCase.id],
            agentGraph.agents
          );
          
          // Store the ingested data for the workflow (legacy support)
          window.localStorage.setItem(
            `workflow-data-${workflowId}`,
            JSON.stringify(ingestedData[useCase.id])
          );
        }
        
        // Set active deployment and workflow for status tracking
        const deploymentData = { workflowId, agents: agentGraph.agents };
        const workflowData = { workflowId, agents: agentGraph.agents };
        
        setActiveDeployment(deploymentData);
        setActiveWorkflow(workflowData);
        
        // Persist to context
        setActiveDeploymentState(workflowId, deploymentData);
        setActiveWorkflowState(workflowId, workflowData);
        
        // Update workflow status
        dataFlowService.updateWorkflowStatus(workflowId, 'deploying', 10);
        
        // Show certifications after a delay
        setTimeout(() => {
          setShowCertifications(true);
          dataFlowService.updateWorkflowStatus(workflowId, 'completed', 100);
          dataFlowService.completeWorkflow(workflowId, { success: true }, 'certified');
          
          // Persist certification results
          setCertificationResults(workflowId, {
            certified: true,
            timestamp: new Date().toISOString(),
            useCaseId: useCase.id
          });
        }, 10000); // Show after 10 seconds to simulate processing
        
        await agentExecution.executeWorkflow(
          agentGraph.agents,
          `${useCase.name} Mission`,
          useCase.id,
          workflowId
        );
        
        // Update workflow status to running
        dataFlowService.updateWorkflowStatus(workflowId, 'running', 50);
        
        // For oilfield, simulate workflow progress
        if (useCase.id === 'oilfield-land-lease') {
          // Simulate workflow progress
          const steps = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'];
          let currentStep = 0;
          
          const interval = setInterval(() => {
            if (currentStep < steps.length) {
              const progress = ((currentStep + 1) / steps.length) * 100;
              setWorkflowProgress(prev => ({ ...prev, [workflowId]: progress }));
              
              // Update data flow service
              dataFlowService.updateWorkflowStatus(workflowId, 'running', progress);
              
              // Show step completion toast
              const stepNames = ['Data Ingestion', 'Data Transformation', 'Analytics Processing', 'Compliance Check', 'Report Generation'];
              toast.success(`✓ ${stepNames[currentStep]} completed`, { duration: 3000 });
              
              currentStep++;
            } else {
              clearInterval(interval);
              setWorkflowProgress(prev => ({ ...prev, [workflowId]: 100 }));
              dataFlowService.updateWorkflowStatus(workflowId, 'completed', 100);
            }
          }, 3000); // 3 seconds per step for demo
        }
        
        // Use WebSocket for real-time updates if available, otherwise simulate
        if (webSocketService.getConnectionStatus()) {
          // Real WebSocket connection available
          console.log('Using real WebSocket connection for workflow updates');
        } else {
          // Simulate WebSocket updates for demo
          console.log('Simulating WebSocket updates for demo');
          webSocketService.simulateWorkflowExecution(workflowId, agentGraph.agents.map(a => a.name));
        }
      }
      
      toast.success(`${useCase.name} mission launched successfully!`);
    } catch (error) {
      console.error('Failed to launch use case:', error);
      toast.error('Failed to launch mission');
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle sample data usage
  const handleUseSampleData = async () => {
    try {
      // Use mock API to load sample data
      const result = await mockApi.loadSampleData('oilfield-land-lease');
      
      if (result.success && result.data.leases.length > 0) {
        // Create ingested data object
        const sampleData: IngestedData = {
          id: `data-${Date.now()}`,
          useCaseId: 'oilfield-land-lease',
          fileName: 'oilfield_leases_2025.csv',
          fileType: 'csv',
          uploadDate: new Date(),
          status: 'completed',
          recordCount: result.data.leases.length,
          dataPreview: result.data.leases.slice(0, 5),
          fileSize: JSON.stringify(result.data.leases).length
        };
        
        handleDataIngested(sampleData);
        setShowSampleDataPrompt(false);
        toast.success('Sample oilfield data loaded successfully!');
        
        // Auto-launch after a short delay
        setTimeout(() => {
          const oilfieldUseCase = filteredUseCases.find(uc => uc.id === 'oilfield-land-lease');
          if (oilfieldUseCase) {
            handleLaunchUseCase(oilfieldUseCase);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to load sample data:', error);
      toast.error('Failed to load sample data');
    }
  };

  // Handle workflow execution
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
        loadWorkflows(activeUseCaseId);
      }
    } catch (error) {
      console.error('Failed to run workflow:', error);
      toast.error('Failed to run workflow');
    }
  };

  // Handle workflow generation
  const handleWorkflowGenerated = (workflow: any) => {
    setWorkflows(prev => [...prev, workflow]);
    toast.success('Workflow generated successfully!');
  };

  // Early return for loading state AFTER all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-seraphim-black flex flex-col">
      {/* PRESERVE EXISTING HEADER EXACTLY AS IS */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-md flex-shrink-0 z-50">
        <div className="py-4 px-6">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="flex items-center">
              <img
                src="/seraphim-vanguards-logo.png"
                alt="Seraphim Vanguards"
                className="h-44 w-auto object-contain"
              />
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-seraphim-text flex items-center whitespace-nowrap">
                <SparklesIcon className="h-6 w-6 text-seraphim-gold mr-2 animate-pulse-gold" />
                Mission Control
              </h1>
              {activeUseCaseId && (
                <p className="text-sm text-gray-400 mt-1">
                  Active: {useCases.find(uc => uc.id === activeUseCaseId)?.name || 'Unknown'}
                </p>
              )}
            </div>
            
            <div className="flex justify-end items-center gap-4">
              <Button
                variant="primary"
                size="small"
                onClick={() => navigate('/mission-operations')}
                className="flex items-center bg-seraphim-gold hover:bg-seraphim-gold/80"
              >
                <RocketLaunchIcon className="w-4 h-4 mr-1" />
                Mission Operations Center
              </Button>
              
              {activeUseCaseId && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset? All data will return to the default baseline.')) {
                      resetContext();
                    }
                  }}
                  className="flex items-center"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-1" />
                  Reset Use Case
                </Button>
              )}
              
              <Card variant="glass" padding="sm" className="min-w-[120px]">
                <div className="text-right">
                  <p className="text-xs text-seraphim-text-dim uppercase tracking-wider">System Time</p>
                  <p className="text-lg font-mono text-seraphim-gold animate-pulse-gold">
                    {currentTime.toLocaleTimeString()}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* SIA Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SIAMetric
              metric="security"
              label="Security"
              value={siaMetrics.security.value}
              onClick={() => handleMetricClick('security')}
            />
            <SIAMetric
              metric="integrity"
              label="Integrity"
              value={siaMetrics.integrity.value}
              onClick={() => handleMetricClick('integrity')}
            />
            <SIAMetric
              metric="accuracy"
              label="Accuracy"
              value={siaMetrics.accuracy.value}
              onClick={() => handleMetricClick('accuracy')}
            />
          </div>

          {/* Executive Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              variant="gradient"
              effect="shimmer"
              className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
              onClick={() => {
                setShowExecutiveSummary('platform');
                setSelectedUseCaseForSummary(null);
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-seraphim-gold" />
                    Executive Summary
                  </span>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowExecutiveSummary('platform');
                      setSelectedUseCaseForSummary(null);
                    }}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Platform Summary
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">
                  Get comprehensive insights into the Seraphim Vanguards platform capabilities and performance metrics.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-lg p-3 hover:bg-black/40 transition-colors">
                    <p className="text-xs text-gray-500 mb-1">Total Use Cases</p>
                    <p className="text-xl font-bold text-seraphim-gold">{Object.values(verticals).reduce((acc, v) => acc + v.useCases.length, 0)}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 hover:bg-black/40 transition-colors">
                    <p className="text-xs text-gray-500 mb-1">Active Verticals</p>
                    <p className="text-xl font-bold text-vanguard-blue">{Object.keys(verticals).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Ingestion Card */}
            <Card variant="glass-dark" effect="glow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CloudArrowUpIcon className="h-5 w-5 mr-2 text-vanguard-green" />
                  Data Ingestion
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedUseCaseForIngestion ? (
                  <DataIngestion
                    useCaseId={selectedUseCaseForIngestion}
                    onDataIngested={handleDataIngested}
                  />
                ) : (
                  <div className="text-center py-8">
                    <CloudArrowUpIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">
                      Select a use case and click "Upload Data" to begin data ingestion
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Use Cases Section */}
          <Card variant="gradient" effect="shimmer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <RocketLaunchIcon className="h-5 w-5 mr-2 text-seraphim-gold" />
                  Available Use Cases
                </span>
                <div className="flex items-center gap-4">
                  {/* Filters */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedVertical}
                      onChange={(e) => setSelectedVertical(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded px-3 py-1 text-sm"
                    >
                      <option value="all">All Verticals</option>
                      {Object.entries(verticals).map(([key, vertical]) => (
                        <option key={key} value={key}>{vertical.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Search use cases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded px-3 py-1 text-sm w-48"
                    />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUseCases.map((useCase) => {
                  const Icon = verticalIcons[useCase.verticalId] || CubeTransparentIcon;
                  const isExpanded = expandedUseCases.has(useCase.id);
                  const hasData = !!ingestedData[useCase.id];
                  
                  return (
                    <div key={useCase.id} className="border border-white/10 rounded-lg overflow-hidden">
                      <div className="bg-black/30 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Icon className="h-6 w-6 text-seraphim-gold mt-1" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-white">{useCase.name}</h3>
                              <p className="text-sm text-gray-400 mt-1">{useCase.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500">Vertical: {useCase.verticalName}</span>
                                <span className="text-xs text-gray-500">Complexity: {useCase.complexity}</span>
                                <span className="text-xs text-gray-500">Time: {useCase.estimatedTime}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasData && (
                              <span className="text-xs bg-vanguard-green/20 text-vanguard-green px-2 py-1 rounded">
                                Data Ready
                              </span>
                            )}
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => toggleUseCase(useCase.id)}
                            >
                              {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="bg-black/20 p-4 border-t border-white/10">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => {
                                setShowExecutiveSummary('usecase');
                                setSelectedUseCaseForSummary(useCase);
                              }}
                            >
                              <DocumentTextIcon className="h-4 w-4 mr-1" />
                              Executive Summary
                            </Button>
                            
                            {!hasData && (
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => setSelectedUseCaseForIngestion(useCase.id)}
                              >
                                <CloudArrowUpIcon className="h-4 w-4 mr-1" />
                                Upload Data
                              </Button>
                            )}
                            
                            {useCase.id === 'oilfield-land-lease' && !hasData && (
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => {
                                  setShowSampleDataPrompt(true);
                                  setSelectedUseCaseForIngestion(useCase.id);
                                }}
                              >
                                <DatabaseIcon className="h-4 w-4 mr-1" />
                                Use Sample Data
                              </Button>
                            )}
                            
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleLaunchUseCase(useCase)}
                              disabled={isExecuting}
                              className="bg-seraphim-gold hover:bg-seraphim-gold/80"
                            >
                              <RocketLaunchIcon className="h-4 w-4 mr-1" />
                              Launch Mission
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Mission Control Sections */}
          <MissionControlSections
            activeUseCaseId={activeUseCaseId}
            activeWorkflow={activeWorkflow}
            activeDeployment={activeDeployment}
            showCertifications={showCertifications}
            workflows={workflows}
            onWorkflowGenerated={handleWorkflowGenerated}
            onRunWorkflow={handleRunWorkflow}
          />
        </div>
      </div>

      {/* Modals */}
      {showExecutiveSummary && (
        <ExecutiveSummaryModal
          isOpen={!!showExecutiveSummary}
          useCase={selectedUseCaseForSummary || {
            id: 'platform',
            name: 'Seraphim Vanguards Platform',
            description: 'AI-powered enterprise automation platform'
          }}
          vertical={selectedUseCaseForSummary ? verticals[selectedUseCaseForSummary.verticalId] : undefined}
          onClose={() => {
            setShowExecutiveSummary(null);
            setSelectedUseCaseForSummary(null);
          }}
        />
      )}

      {/* Sample Data Prompt Modal */}
      {showSampleDataPrompt && (
        <Modal
          isOpen={showSampleDataPrompt}
          onClose={() => setShowSampleDataPrompt(false)}
          title="Use Sample Data?"
        >
          <div className="p-6">
            <p className="text-gray-300 mb-6">
              Would you like to use pre-configured sample data for the Oilfield Land Lease use case?
              This includes 156 lease records with production metrics, compliance data, and risk assessments.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowSampleDataPrompt(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUseSampleData}
                className="bg-seraphim-gold hover:bg-seraphim-gold/80"
              >
                <DatabaseIcon className="h-4 w-4 mr-1" />
                Use Sample Data
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MissionControlEnhanced;