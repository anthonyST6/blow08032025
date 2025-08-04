import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUseCaseContext } from '../contexts/UseCaseContext';
import { useLocation } from 'react-router-dom';
import {
  RocketLaunchIcon,
  CpuChipIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BoltIcon,
  CubeTransparentIcon,
  BeakerIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ServerIcon,
  GlobeAltIcon,
  LockClosedIcon,
  DocumentCheckIcon,
  SparklesIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Progress } from '../components/Progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { deploymentService } from '../services/deployment.service';
import { useCaseService } from '../services/usecase.service';
import { UseCase, AgentGraph } from '../types/usecase.types';
import { toast } from 'react-hot-toast';
import { integrationLogger } from '../services/integrationLogger.service';

interface DeploymentStage {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'warning';
  progress: number;
  duration?: string;
  message?: string;
  icon: React.ComponentType<{ className?: string }>;
  substeps?: {
    name: string;
    status: 'pending' | 'completed' | 'failed';
  }[];
}

interface Dependency {
  id: string;
  name: string;
  version: string;
  status: 'resolved' | 'missing' | 'conflict';
  required: boolean;
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  uptime: string;
  lastCheck: Date;
}

interface SecurityProtocol {
  name: string;
  status: 'active' | 'inactive' | 'configuring';
  level: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

const DeploymentOrchestration: React.FC = () => {
  const { useCases, selectedUseCase, setSelectedUseCase } = useUseCaseContext();
  const [activeDeployment, setActiveDeployment] = useState<boolean>(false);
  const [agentGraph, setAgentGraph] = useState<AgentGraph | null>(null);
  const [showUseCaseDropdown, setShowUseCaseDropdown] = useState(false);
  const location = useLocation();
  const hasAutoStarted = useRef(false);
  
  const [deploymentStages, setDeploymentStages] = useState<DeploymentStage[]>(
    deploymentService.getMockDeploymentStatus().stages.map(stage => ({
      ...stage,
      icon: {
        'pre-flight': BeakerIcon,
        'dependency': CubeTransparentIcon,
        'provisioning': ServerIcon,
        'deployment': CloudArrowUpIcon,
        'validation': ChartBarIcon,
        'security': ShieldCheckIcon,
      }[stage.id] || BeakerIcon,
    }))
  );
  
  const [originalStages] = useState<DeploymentStage[]>([
    {
      id: 'pre-flight',
      name: 'Pre-flight Checks',
      status: 'pending',
      progress: 0,
      icon: BeakerIcon,
      substeps: [
        { name: 'Environment validation', status: 'pending' },
        { name: 'Resource availability', status: 'pending' },
        { name: 'Security compliance', status: 'pending' },
      ],
    },
    {
      id: 'dependency',
      name: 'Dependency Resolution',
      status: 'pending',
      progress: 0,
      icon: CubeTransparentIcon,
      substeps: [
        { name: 'Package scanning', status: 'pending' },
        { name: 'Version compatibility', status: 'pending' },
        { name: 'License verification', status: 'pending' },
      ],
    },
    {
      id: 'provisioning',
      name: 'Resource Provisioning',
      status: 'pending',
      progress: 0,
      icon: ServerIcon,
      substeps: [
        { name: 'Infrastructure setup', status: 'pending' },
        { name: 'Network configuration', status: 'pending' },
        { name: 'Storage allocation', status: 'pending' },
      ],
    },
    {
      id: 'deployment',
      name: 'Application Deployment',
      status: 'pending',
      progress: 0,
      icon: CloudArrowUpIcon,
      substeps: [
        { name: 'Container orchestration', status: 'pending' },
        { name: 'Service mesh setup', status: 'pending' },
        { name: 'Load balancer configuration', status: 'pending' },
      ],
    },
    {
      id: 'validation',
      name: 'Performance Validation',
      status: 'pending',
      progress: 0,
      icon: ChartBarIcon,
      substeps: [
        { name: 'Health checks', status: 'pending' },
        { name: 'Performance benchmarks', status: 'pending' },
        { name: 'Integration tests', status: 'pending' },
      ],
    },
    {
      id: 'security',
      name: 'Security Protocols',
      status: 'pending',
      progress: 0,
      icon: ShieldCheckIcon,
      substeps: [
        { name: 'SSL/TLS configuration', status: 'pending' },
        { name: 'Firewall rules', status: 'pending' },
        { name: 'Access control setup', status: 'pending' },
      ],
    },
  ]);

  const [dependencies] = useState<Dependency[]>(
    deploymentService.getMockDependencies().map((dep, index) => ({
      ...dep,
      id: String(index + 1),
    }))
  );

  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>(
    deploymentService.getMockHealthChecks()
  );

  const [securityProtocols] = useState<SecurityProtocol[]>(
    deploymentService.getMockSecurityProtocols()
  );

  const [performanceMetrics, setPerformanceMetrics] = useState(
    deploymentService.getMockPerformanceMetrics()
  );

  // Load agent graph when use case changes
  useEffect(() => {
    if (selectedUseCase && selectedUseCase !== 'all') {
      loadAgentGraph(selectedUseCase);
    }
  }, [selectedUseCase]);

  // Auto-start deployment if navigated from Agent Orchestration
  useEffect(() => {
    // Check if we came from agent orchestration and haven't auto-started yet
    if (location.state?.fromAgentOrchestration && selectedUseCase && selectedUseCase !== 'all' && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      // Small delay to ensure UI is ready
      setTimeout(() => {
        startDeployment();
      }, 500);
    }
  }, [location.state, selectedUseCase]);

  const loadAgentGraph = async (useCaseId: string) => {
    try {
      const graph = await useCaseService.getAgentGraph(useCaseId);
      setAgentGraph(graph);
      
      // Update deployment stages to include agent deployment
      const agentStages = graph ? graph.agents.map((agent, index) => ({
        id: `agent-${agent.id}`,
        name: `Deploy ${agent.name}`,
        status: 'pending' as const,
        progress: 0,
        icon: CubeTransparentIcon,
        substeps: [
          { name: 'Agent initialization', status: 'pending' as const },
          { name: 'Connection setup', status: 'pending' as const },
          { name: 'Capability verification', status: 'pending' as const },
        ],
      })) : [];

      // Insert agent stages after provisioning
      const updatedStages = [...originalStages];
      const provisioningIndex = updatedStages.findIndex(s => s.id === 'provisioning');
      updatedStages.splice(provisioningIndex + 1, 0, ...agentStages);
      
      setDeploymentStages(updatedStages);
    } catch (error) {
      console.error('Failed to load agent graph:', error);
      toast.error('Failed to load agent configuration');
    }
  };

  const handleUseCaseChange = (useCaseId: string) => {
    setSelectedUseCase(useCaseId);
    setShowUseCaseDropdown(false);
  };

  // Simulate deployment progress
  useEffect(() => {
    if (!activeDeployment) return;

    const interval = setInterval(() => {
      setDeploymentStages(prev => {
        const updated = [...prev];
        let allCompleted = true;

        for (let i = 0; i < updated.length; i++) {
          const stage = updated[i];
          
          if (stage.status === 'completed') continue;
          
          if (stage.status === 'pending' && (i === 0 || updated[i - 1].status === 'completed')) {
            stage.status = 'in-progress';
            stage.progress = 0;
            allCompleted = false;
            break;
          }
          
          if (stage.status === 'in-progress') {
            stage.progress = Math.min(stage.progress + Math.random() * 15, 100);
            
            // Update substeps
            if (stage.substeps) {
              const substepProgress = stage.progress / 100 * stage.substeps.length;
              stage.substeps.forEach((substep, idx) => {
                if (idx < substepProgress) {
                  substep.status = 'completed';
                }
              });
            }
            
            if (stage.progress >= 100) {
              stage.status = 'completed';
              stage.duration = `${Math.floor(Math.random() * 30 + 10)}s`;
              
              // Log stage completion
              integrationLogger.logDeploymentEvent(
                `deploy-${selectedUseCase}`,
                `Deployment stage completed: ${stage.name}`,
                'success',
                {
                  useCaseId: selectedUseCase,
                  stageName: stage.name,
                  duration: stage.duration
                }
              );
            }
            allCompleted = false;
            break;
          }
          
          allCompleted = false;
        }

        if (allCompleted) {
          setActiveDeployment(false);
          toast.success('Deployment completed successfully!');
          
          // Log deployment completion
          integrationLogger.logDeploymentEvent(
            `deploy-${selectedUseCase}`,
            `Deployment completed successfully for use case: ${selectedUseCaseData?.name || selectedUseCase}`,
            'success',
            {
              useCaseId: selectedUseCase,
              totalStages: deploymentStages.length
            }
          );
        }

        return updated;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [activeDeployment]);

  const startDeployment = () => {
    if (!selectedUseCase || selectedUseCase === 'all') {
      toast.error('Please select a specific use case to deploy');
      return;
    }
    
    const deploymentId = `deploy-${Date.now()}`;
    integrationLogger.logDeploymentEvent(
      deploymentId,
      `Deployment started for use case: ${selectedUseCaseData?.name || selectedUseCase}`,
      'info',
      { useCaseId: selectedUseCase }
    );
    
    setActiveDeployment(true);
    loadAgentGraph(selectedUseCase).then(() => {
      setDeploymentStages(prev => prev.map(stage => ({
        ...stage,
        status: 'pending',
        progress: 0,
        duration: undefined,
        substeps: stage.substeps?.map(substep => ({ ...substep, status: 'pending' })),
      })));
    });
  };

  // Update health checks periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthChecks(deploymentService.getMockHealthChecks());
      setPerformanceMetrics(deploymentService.getMockPerformanceMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStageStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-vanguard-green" />;
      case 'in-progress':
        return <ArrowPathIcon className="w-5 h-5 text-vanguard-blue animate-spin" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-vanguard-red" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-vanguard-green';
      case 'degraded':
        return 'text-yellow-500';
      case 'unhealthy':
        return 'text-vanguard-red';
      default:
        return 'text-gray-400';
    }
  };

  const selectedUseCaseData = useCases.find(uc => uc.id === selectedUseCase);

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center mb-2">
          <RocketLaunchIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Deployment Orchestration System
        </h1>
        <p className="text-gray-400">
          Automated provisioning, intelligent dependency resolution, and real-time performance validation
        </p>
      </div>

      {/* Main Control Panel */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-seraphim-gold/10 to-transparent border-seraphim-gold/30">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-2">Deployment Control Center</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowUseCaseDropdown(!showUseCaseDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <CubeTransparentIcon className="w-5 h-5 text-seraphim-gold" />
                  <span className="text-white">
                    {selectedUseCaseData ? selectedUseCaseData.name : 'Select Use Case'}
                  </span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </button>
                
                {showUseCaseDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10">
                    {useCases.map(useCase => (
                      <button
                        key={useCase.id}
                        onClick={() => handleUseCaseChange(useCase.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="font-medium text-white">{useCase.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{useCase.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="text-gray-400">
                {activeDeployment ? 'Deployment in progress...' : 
                 selectedUseCase ? 'Ready to deploy' : 'Select a use case to deploy'}
              </p>
            </div>
          </div>
          <Button
            variant={activeDeployment ? 'secondary' : 'primary'}
            size="lg"
            onClick={startDeployment}
            disabled={activeDeployment || !selectedUseCase || selectedUseCase === 'all'}
            className="min-w-[200px]"
          >
            {activeDeployment ? (
              <>
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <RocketLaunchIcon className="w-5 h-5 mr-2" />
                Start Deployment
              </>
            )}
          </Button>
        </div>
        
        {selectedUseCaseData && agentGraph && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Agents:</span>
                <span className="text-white font-medium">{agentGraph.agents.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Connections:</span>
                <span className="text-white font-medium">{agentGraph.connections.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Domain:</span>
                <span className="text-white font-medium">General</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Deployment Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Cog6ToothIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
            Deployment Pipeline
          </h3>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {deploymentStages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStageStatusIcon(stage.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-white flex items-center">
                        <stage.icon className="w-4 h-4 mr-2 text-gray-400" />
                        {stage.name}
                      </h4>
                      {stage.duration && (
                        <span className="text-xs text-gray-400">{stage.duration}</span>
                      )}
                    </div>
                    
                    {stage.status === 'in-progress' && (
                      <Progress value={stage.progress} className="mb-2" />
                    )}
                    
                    {stage.message && (
                      <p className="text-xs text-gray-400 mb-2">{stage.message}</p>
                    )}
                    
                    {stage.substeps && stage.status !== 'pending' && (
                      <div className="space-y-1 mt-2">
                        {stage.substeps.map((substep, idx) => (
                          <div key={idx} className="flex items-center text-xs">
                            {substep.status === 'completed' ? (
                              <CheckCircleIcon className="w-3 h-3 text-vanguard-green mr-1" />
                            ) : substep.status === 'failed' ? (
                              <XCircleIcon className="w-3 h-3 text-vanguard-red mr-1" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-gray-600 mr-1" />
                            )}
                            <span className={substep.status === 'completed' ? 'text-gray-400' : 'text-gray-500'}>
                              {substep.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {index < deploymentStages.length - 1 && (
                  <div className="absolute left-2.5 top-8 bottom-0 w-px bg-gray-700" />
                )}
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Dependency Resolution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CubeTransparentIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
            Dependency Resolution
          </h3>
          
          <div className="space-y-3">
            {dependencies.map((dep) => (
              <div key={dep.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CircleStackIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{dep.name}</p>
                    <p className="text-xs text-gray-400">v{dep.version}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {dep.required && (
                    <Badge variant="secondary" size="small">Required</Badge>
                  )}
                  <Badge
                    variant={dep.status === 'resolved' ? 'success' : dep.status === 'conflict' ? 'error' : 'warning'}
                    size="small"
                  >
                    {dep.status}
                  </Badge>
                </div>
              </div>
            ))}
            
            {agentGraph && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3">Agent Dependencies</h4>
                {agentGraph.agents.slice(0, 3).map(agent => (
                  <div key={agent.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                      <CubeTransparentIcon className="w-4 h-4 text-seraphim-gold" />
                      <div>
                        <p className="text-sm font-medium text-white">{agent.name}</p>
                        <p className="text-xs text-gray-400">{agent.type}</p>
                      </div>
                    </div>
                    <Badge variant="success" size="small">Ready</Badge>
                  </div>
                ))}
                {agentGraph.agents.length > 3 && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    +{agentGraph.agents.length - 3} more agents
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Monitoring Tabs */}
      <Tabs defaultValue="health" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BoltIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
              Real-time Health Monitoring
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthChecks.map((check) => (
                <motion.div
                  key={check.service}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{check.service}</h4>
                    <div className={`flex items-center ${getHealthStatusColor(check.status)}`}>
                      <div className="w-2 h-2 rounded-full bg-current mr-1 animate-pulse" />
                      <span className="text-xs capitalize">{check.status}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Latency:</span>
                      <span>{check.latency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span>{check.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Check:</span>
                      <span>{check.lastCheck.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
              Security Protocols
            </h3>
            
            <div className="space-y-4">
              {securityProtocols.map((protocol) => (
                <div key={protocol.name} className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    protocol.status === 'active' ? 'bg-vanguard-green/20' : 'bg-gray-700'
                  }`}>
                    <LockClosedIcon className={`w-5 h-5 ${
                      protocol.status === 'active' ? 'text-vanguard-green' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-white">{protocol.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={protocol.level === 'critical' ? 'error' : protocol.level === 'high' ? 'warning' : 'secondary'}
                          size="small"
                        >
                          {protocol.level}
                        </Badge>
                        <Badge
                          variant={protocol.status === 'active' ? 'success' : 'secondary'}
                          size="small"
                        >
                          {protocol.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{protocol.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
              Performance Metrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">CPU Utilization</span>
                    <span className="text-sm font-medium text-white">42%</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Memory Usage</span>
                    <span className="text-sm font-medium text-white">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Network I/O</span>
                    <span className="text-sm font-medium text-white">156 MB/s</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Request Metrics</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Requests/sec:</span>
                      <span className="text-white">12,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Response Time:</span>
                      <span className="text-white">45ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Error Rate:</span>
                      <span className="text-vanguard-green">0.02%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Resource Efficiency</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost/Request:</span>
                      <span className="text-white">$0.0012</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Efficiency Score:</span>
                      <span className="text-vanguard-green">94.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Carbon Footprint:</span>
                      <span className="text-white">0.2g CO₂/req</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeploymentOrchestration;