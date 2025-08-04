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

// Dashboard Components
import AgentOrchestrationBranded from './AgentOrchestrationBranded';
import DeploymentOrchestration from './DeploymentOrchestration';
import Operations from './Operations';
import IntegrationLogEnhanced from './IntegrationLogEnhanced';
import AuditConsoleEnhanced from './AuditConsoleEnhanced';
import PromptEngineeringPanel from '../components/prompt-engineering/PromptEngineeringPanel';
import ToolsIntegrationsPanel from '../components/tools/ToolsIntegrationsPanel';
import AuditPanel from '../components/audit/AuditPanel';
import UsersPanel from '../components/users/UsersPanel';

// Import verticals configuration
import { verticals } from '../config/verticals';
import { UseCase } from '../config/verticals';

// Import services
import { useCaseService } from '../services/usecase.service';
import { agentExecution } from '../services/agentExecution.service';
import { toast } from 'react-hot-toast';
import DataIngestion, { IngestedData } from '../components/DataIngestion';
import WorkflowGenerator from '../components/WorkflowGenerator';
import DeploymentStatus from '../components/DeploymentStatus';
import AgentActivityFeed from '../components/AgentActivityFeed';
import UnifiedEventStream from '../components/UnifiedEventStream';
import CertificationResults from '../components/CertificationResults';
import { dataFlowService } from '../services/dataFlow.service';
import { webSocketService } from '../services/websocket.service';
import ExecutiveSummaryModal from '../components/ExecutiveSummaryModal';
import OilfieldAgentConfigService from '../services/oilfieldAgentConfig.service';
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

const MissionControlSinglePane: React.FC = () => {
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
      // Fetch sample data
      const response = await fetch(OilfieldAgentConfigService.getSampleDataUrl());
      const text = await response.text();
      
      // Parse CSV to get preview
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const dataPreview = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
          return obj;
        }, {} as any);
      });
      
      // Create ingested data object
      const sampleData: IngestedData = {
        id: `data-${Date.now()}`,
        useCaseId: 'oilfield-land-lease',
        fileName: 'oilfield_leases_2025.csv',
        fileType: 'csv',
        uploadDate: new Date(),
        status: 'completed',
        recordCount: 156,
        dataPreview,
        fileSize: text.length
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

  // Early return for loading state AFTER all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-seraphim-black">
      {/* PRESERVE EXISTING HEADER EXACTLY AS IS */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-md flex-shrink-0 sticky top-0 z-50">
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
                