import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUseCaseContext } from '../contexts/UseCaseContext';
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
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SIAMetric, SIAMetrics, SIAIndicator } from '../components/ui/SIAMetric';
import { getSIAClass, SIA_COMPONENT_STYLES } from '../utils/sia';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mission Control Components
import ActiveMissionsPanel from '../components/mission-control-old/ActiveMissionsPanel';
import AgentsPerformanceGraph from '../components/mission-control-old/AgentsPerformanceGraph';
import TaskSummaryBox from '../components/mission-control-old/TaskSummaryBox';
import AlertsPanel from '../components/mission-control-old/AlertsPanel';
import Modal from '../components/ui/Modal';
import Drawer from '../components/ui/Drawer';

// New Dashboard Components
import AgentOrchestrationPanel from '../components/orchestration/AgentOrchestrationPanelBranded';
import PromptEngineeringPanel from '../components/prompt-engineering/PromptEngineeringPanel';
import ToolsIntegrationsPanel from '../components/tools/ToolsIntegrationsPanel';
import AuditPanel from '../components/audit/AuditPanel';
import UsersPanel from '../components/users/UsersPanel';

// Activity Feed Item with SIA indicators
const ActivityFeedItem: React.FC<{
  activity: any;
  index: number;
}> = ({ activity, index }) => {
  const severityColors = {
    critical: 'bg-red-500 text-red-500',
    error: 'bg-red-400 text-red-400',
    warning: 'bg-yellow-400 text-yellow-400',
    info: 'bg-gray-400 text-gray-400',
  };

  const typeIcons = {
    alert: ExclamationTriangleIcon,
    analysis: ShieldCheckIcon,
    workflow: CogIcon,
    prompt: BeakerIcon,
  };

  // Map activity types to SIA metrics
  const activityToSIA = {
    alert: 'security',
    analysis: 'accuracy',
    workflow: 'integrity',
    prompt: 'accuracy',
  };

  const Icon = typeIcons[activity.type as keyof typeof typeIcons] || ChartBarIcon;
  const colors = severityColors[activity.severity as keyof typeof severityColors] || severityColors.info;
  const siaMetric = activityToSIA[activity.type as keyof typeof activityToSIA] || 'accuracy';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="relative flex items-start space-x-3 py-4 hover:bg-white/5 rounded-lg px-2 transition-all duration-200 group"
    >
      <div className={`relative flex h-10 w-10 items-center justify-center rounded-full ${getSIAClass(siaMetric as any, 'bg')}/20 ring-2 ring-${getSIAClass(siaMetric as any, 'border')}/50 group-hover:shadow-glow-${siaMetric === 'security' ? 'blue' : siaMetric === 'integrity' ? 'red' : 'green'} transition-all duration-300`}>
        <Icon className={`h-5 w-5 ${getSIAClass(siaMetric as any, 'text')}`} />
        <div className={`absolute -inset-1 rounded-full ${getSIAClass(siaMetric as any, 'bg')} opacity-10 blur-md ${activity.severity === 'critical' ? 'animate-pulse' : ''}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white">{activity.title}</p>
            {activity.siaScore && (
              <SIAIndicator
                metric={siaMetric as any}
                value={activity.siaScore}
                pulse={activity.severity === 'critical'}
              />
            )}
          </div>
          <time className="text-xs text-gray-500">
            {new Date(activity.timestamp).toLocaleTimeString()}
          </time>
        </div>
        <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { activeUseCaseId, activeUseCaseData, resetContext, useCases } = useUseCaseContext();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSystemTab, setSelectedSystemTab] = useState<string | null>(null);
  
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

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
      value: displayStats ? Math.min(95 + Math.random() * 5, 100) : 0, // Simulated for now
      trend: 1.2,
      status: 'optimal' as const,
    },
  };

  const handleMetricClick = (metric: 'security' | 'integrity' | 'accuracy') => {
    navigate(`/analytics/${metric}`);
  };

  const quickActions = [
    {
      title: 'Agent Orchestration',
      description: 'Configure and deploy AI agents',
      icon: CubeTransparentIcon,
      href: '/agents',
      color: 'text-vanguard-blue',
      bgColor: 'bg-vanguard-blue/10',
      borderColor: 'border-vanguard-blue/30',
    },
    {
      title: 'Prompt Engineering',
      description: 'Design and test prompts',
      icon: BeakerIcon,
      href: '/prompts',
      color: 'text-vanguard-green',
      bgColor: 'bg-vanguard-green/10',
      borderColor: 'border-vanguard-green/30',
    },
    {
      title: 'Compliance Review',
      description: 'Monitor compliance status',
      icon: ShieldCheckIcon,
      href: '/analytics/compliance',
      color: 'text-vanguard-red',
      bgColor: 'bg-vanguard-red/10',
      borderColor: 'border-vanguard-red/30',
    },
    {
      title: 'Audit Console',
      description: 'View system audit trails',
      icon: ClockIcon,
      href: '/audit',
      color: 'text-seraphim-gold',
      bgColor: 'bg-seraphim-gold/10',
      borderColor: 'border-seraphim-gold/30',
    },
  ];

  return (
    <div className="min-h-screen bg-seraphim-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="px-6 py-4">
          {/* Three column layout */}
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Left - Logo */}
            <div className="flex items-center">
              <img
                src="/seraphim-vanguards-logo.png"
                alt="Seraphim Vanguards"
                className="h-44 w-auto object-contain"
              />
            </div>
            
            {/* Center - Mission Control */}
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
            
            {/* Right - System Time, Operator, and Reset Button */}
            <div className="flex justify-end items-center gap-4">
              {/* Reset Button - Only show when use case is active */}
              {activeUseCaseId && (
                <Button
                  variant="secondary"
                  size="sm"
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
              
              <Card variant="glass" padding="sm" className="min-w-[150px]">
                <div className="text-right">
                  <p className="text-xs text-seraphim-text-dim uppercase tracking-wider">Operator</p>
                  <p className="text-sm font-medium text-seraphim-text truncate max-w-[150px]">
                    {user?.displayName || user?.email?.split('@')[0]}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* SIA Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-seraphim-text mb-4 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-float" />
            SIA Governance Metrics
          </h2>
          <SIAMetrics
            security={siaMetrics.security.value}
            integrity={siaMetrics.integrity.value}
            accuracy={siaMetrics.accuracy.value}
            size="lg"
            variant="card"
            layout="grid"
            onMetricClick={handleMetricClick}
          />
        </motion.div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card variant="gradient" effect="shimmer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LightningBoltIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-pulse-gold" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
            
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      to={action.href}
                      className={`group relative block rounded-lg border ${action.borderColor} ${action.bgColor} p-4 hover:shadow-glow-gold transition-all duration-300 overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity duration-300" />
                      <div className="relative flex items-start space-x-3">
                        <action.icon className={`h-6 w-6 ${action.color} group-hover:text-seraphim-gold transition-colors`} />
                        <div>
                          <p className="text-sm font-medium text-seraphim-text group-hover:text-seraphim-gold transition-colors">
                            {action.title}
                          </p>
                          <p className="text-xs text-seraphim-text-dim mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card variant="glass-dark" effect="glow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DatabaseIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-float" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
            
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-vanguard-security/30 hover:border-vanguard-security/50 hover:shadow-glow-blue transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedSystemTab(selectedSystemTab === 'prompts' ? null : 'prompts');
                  }}
                >
                  <span className="text-sm text-seraphim-text-dim">Total Prompts Processed</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-seraphim-text">
                      {displayStats?.totalPrompts.toLocaleString() || '0'}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-vanguard-security animate-pulse-blue" />
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-vanguard-accuracy/30 hover:border-vanguard-accuracy/50 hover:shadow-glow-green transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedSystemTab(selectedSystemTab === 'analyses' ? null : 'analyses');
                  }}
                >
                  <span className="text-sm text-seraphim-text-dim">Total Analyses</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-seraphim-text">
                      {displayStats?.totalAnalyses.toLocaleString() || '0'}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-vanguard-accuracy animate-pulse-green" />
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-vanguard-accuracy/10 border border-vanguard-accuracy/30 hover:shadow-glow-green-lg transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedSystemTab(selectedSystemTab === 'workflows' ? null : 'workflows');
                  }}
                >
                  <span className="text-sm text-seraphim-text-dim">Active Workflows</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-vanguard-accuracy">
                      {displayStats?.activeWorkflows || '0'}
                    </span>
                    <CheckCircleIcon className="h-4 w-4 text-vanguard-accuracy animate-float" />
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-vanguard-integrity/10 border border-vanguard-integrity/30 hover:shadow-glow-red-lg transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedSystemTab(selectedSystemTab === 'flagged' ? null : 'flagged');
                  }}
                >
                  <span className="text-sm text-seraphim-text-dim">Flagged Responses</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-vanguard-integrity">
                      {displayStats?.flaggedResponses.toLocaleString() || '0'}
                    </span>
                    <ExclamationTriangleIcon className="h-4 w-4 text-vanguard-integrity animate-pulse-red" />
                  </div>
                </motion.div>

                {/* Expandable Details */}
                {selectedSystemTab && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-black/30 rounded-lg border border-white/10"
                  >
                    {selectedSystemTab === 'prompts' && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white mb-2">Recent Prompts</h4>
                        <div className="space-y-1 text-xs text-gray-400">
                          <div className="flex justify-between">
                            <span>Energy Load Forecasting</span>
                            <span className="text-vanguard-green">Completed</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Land Lease Analysis</span>
                            <span className="text-vanguard-green">Completed</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Insurance Risk Assessment</span>
                            <span className="text-yellow-500">Processing</span>
                          </div>
                        </div>
                        <SimpleButton
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate('/prompts')}
                          className="mt-2"
                        >
                          View All Prompts
                        </SimpleButton>
                      </div>
                    )}
                    
                    {selectedSystemTab === 'analyses' && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white mb-2">Analysis Components</h4>
                        <div className="space-y-1 text-xs text-gray-400">
                          <div className="flex justify-between">
                            <span>Security Analysis Engine</span>
                            <span className="text-vanguard-green">Active</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Integrity Validator</span>
                            <span className="text-vanguard-green">Active</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Accuracy Predictor</span>
                            <span className="text-vanguard-green">Active</span>
                          </div>
                        </div>
                        <SimpleButton
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate('/analysis')}
                          className="mt-2"
                        >
                          Open Analysis Console
                        </SimpleButton>
                      </div>
                    )}
                    
                    {selectedSystemTab === 'workflows' && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white mb-2">Active Workflows</h4>
                        <div className="space-y-1 text-xs text-gray-400">
                          <div className="flex justify-between">
                            <span>Land Lease Management</span>
                            <span className="text-vanguard-green">Running</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Energy Load Forecasting</span>
                            <span className="text-vanguard-green">Running</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Insurance Claims Processing</span>
                            <span className="text-yellow-500">Scheduled</span>
                          </div>
                        </div>
                        <SimpleButton
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate('/workflows')}
                          className="mt-2"
                        >
                          Manage Workflows
                        </SimpleButton>
                      </div>
                    )}
                    
                    {selectedSystemTab === 'flagged' && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white mb-2">Recent Flags</h4>
                        <div className="space-y-1 text-xs text-gray-400">
                          <div className="flex justify-between">
                            <span>High Risk: Unauthorized Access Attempt</span>
                            <span className="text-vanguard-red">Critical</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Data Quality: Missing Required Fields</span>
                            <span className="text-yellow-500">Warning</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Compliance: Policy Violation Detected</span>
                            <span className="text-vanguard-red">High</span>
                          </div>
                        </div>
                        <SimpleButton
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate('/audit')}
                          className="mt-2"
                        >
                          View Audit Console
                        </SimpleButton>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission Control Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-lg font-semibold text-seraphim-text mb-4 flex items-center">
            <RocketLaunchIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-float" />
            Mission Control Operations
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Active Missions */}
            <Card variant="glass-dark" effect="glow" className="lg:col-span-1">
              <ActiveMissionsPanel
                missions={missions}
                onMissionClick={(mission) => {
                  setSelectedMission(mission);
                  setShowMissionModal(true);
                }}
                onViewAllClick={() => navigate('/missions')}
              />
            </Card>
            
            {/* Middle Column - Performance & Tasks */}
            <div className="space-y-6 lg:col-span-1">
              <Card variant="glass" effect="float">
                <AgentsPerformanceGraph
                  data={agentPerformance}
                  onDataPointClick={(point) => {
                    navigate(`/agents/${point.agentId}`);
                  }}
                />
              </Card>
              {taskSummary && (
                <Card variant="gradient" effect="shimmer">
                  <TaskSummaryBox
                    summary={taskSummary}
                    onTaskTypeClick={(type) => {
                      navigate(`/tasks?filter=${type}`);
                    }}
                  />
                </Card>
              )}
            </div>
            
            {/* Right Column - Alerts */}
            <Card variant="glass-dark" effect="glow" className="lg:col-span-1">
              <AlertsPanel
                alerts={alerts}
                onAlertClick={(alert) => {
                  setSelectedAlert(alert);
                  setShowAlertModal(true);
                }}
                onViewAllClick={() => navigate('/alerts')}
              />
            </Card>
          </div>
        </motion.div>

        {/* Agent Orchestration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-lg font-semibold text-seraphim-text mb-4 flex items-center">
            <ServerStackIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-float" />
            Agent Orchestration
          </h2>
          
          <Card variant="glass-dark" effect="glow">
            <AgentOrchestrationPanel />
          </Card>
        </motion.div>

        {/* Prompt Engineering Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          <h2 className="text-lg font-semibold text-seraphim-text mb-4 flex items-center">
            <CodeBracketIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-float" />
            Prompt Engineering
          </h2>
          
          <Card variant="glass" effect="float">
            <PromptEngineeringPanel
              templates={promptTemplates}
              onTemplateClick={(template) => navigate(`/prompts/${template.id}`)}
            />
          </Card>
        </motion.div>

        {/* Tools & Integrations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-lg font-semibold text-seraphim-text mb-4 flex items-center">
            <PuzzlePieceIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-float" />
            Tools & Integrations
          </h2>
          
          <Card variant="gradient" effect="shimmer">
            <ToolsIntegrationsPanel
              integrations={integrations}
              onIntegrationClick={(integration) => navigate(`/integrations/${integration.id}`)}
            />
          </Card>
        </motion.div>

        {/* Audit Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-lg font-semibold text-seraphim-text mb-4 flex items-center">
            <DocumentMagnifyingGlassIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-float" />
            Audit Trail
          </h2>
          
          <Card variant="glass-dark" effect="glow">
            <AuditPanel
              events={auditEvents}
              onEventClick={(event) => navigate(`/audit/${event.id}`)}
            />
          </Card>
        </motion.div>

        {/* Users Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="space-y-6"
        >
          <h2 className="text-lg font-semibold text-seraphim-text mb-4 flex items-center">
            <UsersIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-float" />
            User Management
          </h2>
          
          <Card variant="glass" effect="float">
            <UsersPanel
              users={userManagement}
              onUserClick={(user) => navigate(`/users/${user.id}`)}
            />
          </Card>
        </motion.div>

        {/* Activity Feed */}
        {displayStats?.recentActivity && displayStats.recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card variant="glass" effect="float">
              <CardHeader border>
                <CardTitle className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-pulse-gold" />
                  Real-Time Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar p-6">
                  {displayStats.recentActivity.map((activity, idx) => (
                    <ActivityFeedItem
                      key={activity.id}
                      activity={activity}
                      index={idx}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Alert Diagnostic Modal */}
      <Modal
        isOpen={showAlertModal}
        onClose={() => {
          setShowAlertModal(false);
          setSelectedAlert(null);
        }}
        title="Alert Diagnostics"
        size="lg"
      >
        {selectedAlert && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-seraphim-text-dim">Type</p>
                <p className="text-seraphim-text capitalize">{selectedAlert.type.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-seraphim-text-dim">Severity</p>
                <p className={`capitalize ${
                  selectedAlert.severity === 'critical' ? 'text-red-500' :
                  selectedAlert.severity === 'high' ? 'text-orange-500' :
                  selectedAlert.severity === 'medium' ? 'text-yellow-500' :
                  'text-blue-500'
                }`}>
                  {selectedAlert.severity}
                </p>
              </div>
              <div>
                <p className="text-sm text-seraphim-text-dim">Source</p>
                <p className="text-seraphim-text">{selectedAlert.source}</p>
              </div>
              <div>
                <p className="text-sm text-seraphim-text-dim">Time</p>
                <p className="text-seraphim-text">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-seraphim-text-dim mb-2">Description</p>
              <p className="text-seraphim-text">{selectedAlert.description}</p>
            </div>
            
            <div>
              <p className="text-sm text-seraphim-text-dim mb-2">Diagnostic Information</p>
              <pre className="bg-black/50 p-4 rounded text-xs text-green-400 overflow-x-auto">
                {JSON.stringify(generateDiagnosticData(selectedAlert), null, 2)}
              </pre>
            </div>
            
            <div className="flex justify-end space-x-3">
              <SimpleButton
                variant="secondary"
                onClick={() => {
                  // Handle acknowledge
                  setShowAlertModal(false);
                  setSelectedAlert(null);
                }}
              >
                Acknowledge
              </SimpleButton>
              <SimpleButton
                variant="primary"
                onClick={() => {
                  // Navigate to source
                  navigate(`/alerts/${selectedAlert.id}`);
                }}
              >
                View Source
              </SimpleButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Mission Details Drawer */}
      <Drawer
        isOpen={showMissionModal}
        onClose={() => {
          setShowMissionModal(false);
          setSelectedMission(null);
        }}
        title="Mission Details"
        position="right"
        size="md"
      >
        {selectedMission && (
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-sm text-seraphim-text-dim mb-2">Mission Name</h4>
              <p className="text-lg font-medium text-seraphim-text">{selectedMission.name}</p>
            </div>
            
            <div>
              <h4 className="text-sm text-seraphim-text-dim mb-2">Category</h4>
              <p className="text-seraphim-text capitalize">{selectedMission.category.replace('-', ' ')}</p>
            </div>
            
            <div>
              <h4 className="text-sm text-seraphim-text-dim mb-2">Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-seraphim-text">{selectedMission.progress}%</span>
                  <span className={`text-sm ${
                    selectedMission.status === 'completed' ? 'text-green-400' :
                    selectedMission.status === 'active' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {selectedMission.status.charAt(0).toUpperCase() + selectedMission.status.slice(1)}
                  </span>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-seraphim-gold to-yellow-400"
                    style={{ width: `${selectedMission.progress}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm text-seraphim-text-dim mb-2">Assigned Agents</h4>
              <div className="space-y-2">
                {selectedMission.assignedAgents.map((agentId) => (
                  <div
                    key={agentId}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => navigate(`/agents/${agentId}`)}
                  >
                    <span className="text-seraphim-text">{agentId}</span>
                    <ChevronRightIcon className="h-4 w-4 text-seraphim-text-dim" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm text-seraphim-text-dim mb-2">Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-seraphim-text-dim">Started</span>
                  <span className="text-seraphim-text">
                    {new Date(selectedMission.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-seraphim-text-dim">Est. Completion</span>
                  <span className="text-seraphim-text">
                    {new Date(selectedMission.estimatedCompletion).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <SimpleButton
                variant="primary"
                onClick={() => navigate(`/missions/${selectedMission.id}`)}
                className="w-full"
              >
                View Full Details
              </SimpleButton>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Dashboard;